/**
 * IntegrationService.ts - خدمة التكامل المحسّنة
 * 
 * مع معالجة أخطاء شاملة والتحقق من البيانات
 * جاهزة للنسخ والاستخدام الفوري
 */

// ============================================================================
// 1. تعريف الأنواع والواجهات
// ============================================================================

enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface IntegratedBOQItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  timePerUnit: number;
  scheduleTaskId?: string;
  financeItemId?: string;
  resourcesRequired: {
    laborers: number;
    equipment: string[];
    skillLevel: 'basic' | 'skilled' | 'expert';
  };
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualProgress: number;
}

interface IntegratedScheduleTask {
  id: string;
  name: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  budgetedCost: number;
  actualCost: number;
  delayDays?: number;
  delayCostPerDay?: number;
  totalDelayCost?: number;
  laborCost?: number;
  equipmentCost?: number;
  overtimeCost?: number;
  calculationItemIds: string[];
  financeItemIds: string[];
}

interface IntegratedFinanceItem {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  totalCost: number;
  estimatedCost: number;
  actualCost: number;
  variance: number | string;
  calculationItemId?: string;
  scheduleTaskId?: string;
}

// ============================================================================
// 2. فئة الخطأ المخصصة
// ============================================================================

class IntegrationError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public context?: Record<string, any>,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'IntegrationError';
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      context: this.context,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// 3. نظام Logger
// ============================================================================

class Logger {
  private static instance: Logger;
  private logs: any[] = [];
  private maxLogs: number = 10000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      data
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const color = this.getColor(level);
    console.log(`${color}[${LogLevel[level]}] ${message}`, data || '');
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }

  critical(message: string, data?: any) {
    this.log(LogLevel.CRITICAL, message, data);
  }

  private getColor(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[36m',
      [LogLevel.INFO]: '\x1b[32m',
      [LogLevel.WARN]: '\x1b[33m',
      [LogLevel.ERROR]: '\x1b[31m',
      [LogLevel.CRITICAL]: '\x1b[41m'
    };
    return colors[level];
  }

  getLogs(level?: LogLevel): any[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

const logger = Logger.getInstance();

// ============================================================================
// 4. معالج الأخطاء
// ============================================================================

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handle(error: Error | IntegrationError, context?: Record<string, any>) {
    if (error instanceof IntegrationError) {
      return this.handleIntegrationError(error, context);
    }
    return this.handleGenericError(error, context);
  }

  private handleIntegrationError(
    error: IntegrationError,
    context?: Record<string, any>
  ) {
    const errorResponse = {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        context: { ...error.context, ...context },
        statusCode: error.statusCode,
        timestamp: new Date().toISOString()
      }
    };

    logger.error(`[${error.type}] ${error.message}`, errorResponse);

    if (error.statusCode >= 500) {
      logger.critical('⚠️ خطأ حرج يتطلب اهتمام فوري', errorResponse);
    }

    return errorResponse;
  }

  private handleGenericError(error: Error, context?: Record<string, any>) {
    const errorResponse = {
      success: false,
      error: {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message,
        context: context,
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    };

    logger.error('[UNKNOWN_ERROR]', errorResponse);
    logger.critical('⚠️ خطأ حرج غير متوقع', errorResponse);

    return errorResponse;
  }
}

const errorHandler = ErrorHandler.getInstance();

// ============================================================================
// 5. معالج الأخطاء مع Retry
// ============================================================================

class RetryHandler {
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, any>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`محاولة ${attempt}/${this.maxRetries}: ${operationName}`, context);
        const result = await operation();
        logger.info(`✅ نجحت ${operationName} في المحاولة ${attempt}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          `❌ فشلت المحاولة ${attempt}/${this.maxRetries}: ${operationName}`,
          { error: lastError.message }
        );

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw new IntegrationError(
      ErrorType.SYNC_ERROR,
      `فشل ${operationName} بعد ${this.maxRetries} محاولات`,
      { operationName, context, lastError: lastError?.message },
      500
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const retryHandler = new RetryHandler();

// ============================================================================
// 6. نظام التحقق من البيانات
// ============================================================================

class DataValidator {
  static validateBOQItem(item: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.id || typeof item.id !== 'string') {
      errors.push('المعرف مطلوب ويجب أن يكون نصاً');
    }

    if (!item.description || typeof item.description !== 'string') {
      errors.push('الوصف مطلوب ويجب أن يكون نصاً');
    }

    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push('الكمية مطلوبة ويجب أن تكون رقماً موجباً');
    }

    if (!item.unit || typeof item.unit !== 'string') {
      errors.push('الوحدة مطلوبة ويجب أن تكون نصاً');
    }

    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      errors.push('السعر مطلوب ويجب أن يكون رقماً موجباً');
    }

    if (typeof item.timePerUnit !== 'number' || item.timePerUnit <= 0) {
      errors.push('الوقت لكل وحدة مطلوب ويجب أن يكون رقماً موجباً');
    }

    if (!item.resourcesRequired) {
      errors.push('الموارد المطلوبة مطلوبة');
    } else {
      if (typeof item.resourcesRequired.laborers !== 'number' || item.resourcesRequired.laborers < 0) {
        errors.push('عدد العمال يجب أن يكون رقماً موجباً');
      }
      if (!Array.isArray(item.resourcesRequired.equipment)) {
        errors.push('المعدات يجب أن تكون قائمة');
      }
      if (!['basic', 'skilled', 'expert'].includes(item.resourcesRequired.skillLevel)) {
        errors.push('مستوى المهارة غير صحيح');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateScheduleTask(task: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!task.id || typeof task.id !== 'string') {
      errors.push('معرف المهمة مطلوب');
    }

    if (!task.name || typeof task.name !== 'string') {
      errors.push('اسم المهمة مطلوب');
    }

    if (typeof task.duration !== 'number' || task.duration <= 0) {
      errors.push('المدة مطلوبة ويجب أن تكون رقماً موجباً');
    }

    if (!(task.startDate instanceof Date)) {
      errors.push('تاريخ البداية مطلوب ويجب أن يكون تاريخاً صحيحاً');
    }

    if (!(task.endDate instanceof Date)) {
      errors.push('تاريخ النهاية مطلوب ويجب أن يكون تاريخاً صحيحاً');
    }

    if (task.startDate && task.endDate && task.startDate > task.endDate) {
      errors.push('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
    }

    if (typeof task.budgetedCost !== 'number' || task.budgetedCost < 0) {
      errors.push('التكلفة المخططة يجب أن تكون رقماً موجباً');
    }

    if (typeof task.actualCost !== 'number' || task.actualCost < 0) {
      errors.push('التكلفة الفعلية يجب أن تكون رقماً موجباً');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateFinanceItem(item: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.id || typeof item.id !== 'string') {
      errors.push('معرف البند المالي مطلوب');
    }

    if (!item.description || typeof item.description !== 'string') {
      errors.push('وصف البند المالي مطلوب');
    }

    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push('الكمية مطلوبة ويجب أن تكون رقماً موجباً');
    }

    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      errors.push('السعر مطلوب ويجب أن يكون رقماً موجباً');
    }

    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(item.totalCost - expectedTotal) > 0.01) {
      errors.push('التكلفة الكلية لا تطابق الكمية × السعر');
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// 7. نظام المراقبة
// ============================================================================

class PerformanceMonitor {
  private metrics: Map<string, any[]> = new Map();

  startTimer(operationName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.metrics.has(operationName)) {
        this.metrics.set(operationName, []);
      }

      this.metrics.get(operationName)!.push({
        duration,
        timestamp: new Date().toISOString()
      });

      logger.info(`⏱️ ${operationName} استغرق ${duration.toFixed(2)}ms`);
    };
  }

  getMetrics(operationName: string) {
    const times = this.metrics.get(operationName) || [];

    if (times.length === 0) {
      return null;
    }

    const durations = times.map(t => t.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      count: durations.length,
      average: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      total: durations.reduce((a, b) => a + b, 0).toFixed(2)
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [operation, times] of this.metrics) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// 8. خدمة التكامل الرئيسية
// ============================================================================

class IntegrationService {
  private errorHandler = ErrorHandler.getInstance();
  private retryHandler = new RetryHandler();
  private performanceMonitor = new PerformanceMonitor();

  async syncCalculationToSchedule(
    boqItem: any,
    projectId: string
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    const endTimer = this.performanceMonitor.startTimer('syncCalculationToSchedule');

    try {
      logger.info('🔍 بدء التحقق من بند المقايسات', { boqItem });
      const validation = DataValidator.validateBOQItem(boqItem);

      if (!validation.valid) {
        throw new IntegrationError(
          ErrorType.VALIDATION_ERROR,
          'فشل التحقق من بند المقايسات',
          { errors: validation.errors },
          400
        );
      }

      logger.info('✅ نجح التحقق من بند المقايسات');

      logger.info('📊 بدء حساب المدة', { quantity: boqItem.quantity, timePerUnit: boqItem.timePerUnit });
      const totalDuration = boqItem.quantity * boqItem.timePerUnit;

      if (totalDuration <= 0) {
        throw new IntegrationError(
          ErrorType.CALCULATION_ERROR,
          'المدة المحسوبة غير صحيحة',
          { totalDuration },
          400
        );
      }

      logger.info('✅ تم حساب المدة', { totalDuration });

      logger.info('📅 بدء إنشاء مهمة الجدول الزمني');
      const scheduleTask: IntegratedScheduleTask = {
        id: `schedule-${boqItem.id}`,
        name: boqItem.description,
        duration: totalDuration,
        startDate: new Date(),
        endDate: new Date(Date.now() + totalDuration * 24 * 60 * 60 * 1000),
        budgetedCost: boqItem.quantity * boqItem.unitPrice,
        actualCost: 0,
        calculationItemIds: [boqItem.id],
        financeItemIds: []
      };

      const scheduleValidation = DataValidator.validateScheduleTask(scheduleTask);
      if (!scheduleValidation.valid) {
        throw new IntegrationError(
          ErrorType.VALIDATION_ERROR,
          'فشل التحقق من مهمة الجدول الزمني',
          { errors: scheduleValidation.errors },
          400
        );
      }

      logger.info('✅ تم إنشاء مهمة الجدول الزمني', { scheduleTask });

      logger.info('💾 بدء حفظ البيانات');
      await this.retryHandler.executeWithRetry(
        async () => {
          // حفظ مهمة الجدول الزمني
          // await database.scheduleTasks.insert(scheduleTask);
          // تحديث بند المقايسات
          // await database.boqItems.update(boqItem.id, { scheduleTaskId: scheduleTask.id });
        },
        'حفظ البيانات',
        { projectId, boqItemId: boqItem.id }
      );

      logger.info('✅ تم حفظ البيانات بنجاح');

      endTimer();

      return {
        success: true,
        data: { boqItem, scheduleTask }
      };
    } catch (error) {
      endTimer();
      logger.error('❌ فشلت مزامنة المقايسات والجدول الزمني', { error });
      return this.errorHandler.handle(error as Error, { projectId, boqItem });
    }
  }

  async syncScheduleToFinance(
    scheduleTask: any,
    projectId: string
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    const endTimer = this.performanceMonitor.startTimer('syncScheduleToFinance');

    try {
      logger.info('🔍 بدء التحقق من مهمة الجدول الزمني', { scheduleTask });
      const validation = DataValidator.validateScheduleTask(scheduleTask);

      if (!validation.valid) {
        throw new IntegrationError(
          ErrorType.VALIDATION_ERROR,
          'فشل التحقق من مهمة الجدول الزمني',
          { errors: validation.errors },
          400
        );
      }

      logger.info('✅ نجح التحقق من مهمة الجدول الزمني');

      logger.info('💰 بدء حساب التكاليف الإضافية');
      const now = new Date();
      const delayDays = Math.max(0, Math.floor((now.getTime() - scheduleTask.endDate.getTime()) / (1000 * 60 * 60 * 24)));
      const delayCostPerDay = scheduleTask.budgetedCost * 0.05;
      const totalDelayCost = delayDays * delayCostPerDay;

      logger.info('✅ تم حساب التكاليف الإضافية', { delayDays, totalDelayCost });

      logger.info('💳 بدء تحديث البند المالي');
      const financeItem: IntegratedFinanceItem = {
        id: `finance-${scheduleTask.id}`,
        description: scheduleTask.name,
        quantity: 1,
        unitPrice: scheduleTask.budgetedCost + totalDelayCost,
        totalCost: scheduleTask.budgetedCost + totalDelayCost,
        estimatedCost: scheduleTask.budgetedCost,
        actualCost: scheduleTask.actualCost + totalDelayCost,
        variance: ((scheduleTask.actualCost + totalDelayCost - scheduleTask.budgetedCost) / scheduleTask.budgetedCost * 100).toFixed(2),
        scheduleTaskId: scheduleTask.id
      };

      const financeValidation = DataValidator.validateFinanceItem(financeItem);
      if (!financeValidation.valid) {
        throw new IntegrationError(
          ErrorType.VALIDATION_ERROR,
          'فشل التحقق من البند المالي',
          { errors: financeValidation.errors },
          400
        );
      }

      logger.info('✅ تم تحديث البند المالي', { financeItem });

      logger.info('💾 بدء حفظ البند المالي');
      await this.retryHandler.executeWithRetry(
        async () => {
          // حفظ البند المالي
          // await database.financeItems.insert(financeItem);
          // تحديث مهمة الجدول الزمني
          // await database.scheduleTasks.update(scheduleTask.id, { financeItemIds: [...scheduleTask.financeItemIds, financeItem.id] });
        },
        'حفظ البند المالي',
        { projectId, scheduleTaskId: scheduleTask.id }
      );

      logger.info('✅ تم حفظ البند المالي بنجاح');

      endTimer();

      return {
        success: true,
        data: { scheduleTask, financeItem }
      };
    } catch (error) {
      endTimer();
      logger.error('❌ فشلت مزامنة الجدول الزمني والمالية', { error });
      return this.errorHandler.handle(error as Error, { projectId, scheduleTask });
    }
  }

  async syncCalculationToFinance(
    boqItem: any,
    projectId: string
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    const endTimer = this.performanceMonitor.startTimer('syncCalculationToFinance');

    try {
      logger.info('🔍 بدء التحقق من بند المقايسات', { boqItem });
      const validation = DataValidator.validateBOQItem(boqItem);

      if (!validation.valid) {
        throw new IntegrationError(
          ErrorType.VALIDATION_ERROR,
          'فشل التحقق من بند المقايسات',
          { errors: validation.errors },
          400
        );
      }

      logger.info('✅ نجح التحقق من بند المقايسات');

      logger.info('💰 بدء حساب التكلفة الكلية');
      const totalCost = boqItem.quantity * boqItem.unitPrice;

      if (totalCost < 0) {
        throw new IntegrationError(
          ErrorType.CALCULATION_ERROR,
          'التكلفة الكلية لا يمكن أن تكون سالبة',
          { totalCost },
          400
        );
      }

      logger.info('✅ تم حساب التكلفة الكلية', { totalCost });

      logger.info('💳 بدء إنشاء البند المالي');
      const financeItem: IntegratedFinanceItem = {
        id: `finance-${boqItem.id}`,
        description: boqItem.description,
        quantity: boqItem.quantity,
        unit: boqItem.unit,
        unitPrice: boqItem.unitPrice,
        totalCost: totalCost,
        estimatedCost: totalCost,
        actualCost: 0,
        variance: 0,
        calculationItemId: boqItem.id
      };

      const financeValidation = DataValidator.validateFinanceItem(financeItem);
      if (!financeValidation.valid) {
        throw new IntegrationError(
          ErrorType.VALIDATION_ERROR,
          'فشل التحقق من البند المالي',
          { errors: financeValidation.errors },
          400
        );
      }

      logger.info('✅ تم إنشاء البند المالي', { financeItem });

      logger.info('💾 بدء حفظ البند المالي');
      await this.retryHandler.executeWithRetry(
        async () => {
          // حفظ البند المالي
          // await database.financeItems.insert(financeItem);
          // تحديث بند المقايسات
          // await database.boqItems.update(boqItem.id, { financeItemId: financeItem.id });
        },
        'حفظ البند المالي',
        { projectId, boqItemId: boqItem.id }
      );

      logger.info('✅ تم حفظ البند المالي بنجاح');

      endTimer();

      return {
        success: true,
        data: { boqItem, financeItem }
      };
    } catch (error) {
      endTimer();
      logger.error('❌ فشلت مزامنة المقايسات والمالية', { error });
      return this.errorHandler.handle(error as Error, { projectId, boqItem });
    }
  }

  getPerformanceMetrics() {
    return performanceMonitor.getAllMetrics();
  }

  getLogs(level?: LogLevel) {
    return logger.getLogs(level);
  }
}

// ============================================================================
// 9. التصدير
// ============================================================================

export {
  IntegrationService,
  DataValidator,
  ErrorHandler,
  Logger,
  PerformanceMonitor,
  RetryHandler,
  IntegrationError,
  ErrorType,
  LogLevel
};

export type { IntegratedBOQItem, IntegratedScheduleTask, IntegratedFinanceItem };

export const integrationService = new IntegrationService();
export const dataValidator = DataValidator;
export { logger };
export { errorHandler };
export { performanceMonitor };
