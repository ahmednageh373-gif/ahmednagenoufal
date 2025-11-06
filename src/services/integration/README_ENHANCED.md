# 🚀 دليل خدمة التكامل المحسّنة
# Enhanced Integration Service Guide

**التاريخ:** 6 نوفمبر 2025  
**الإصدار:** 2.0  
**الحالة:** ✅ جاهز للإنتاج

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الميزات الرئيسية](#الميزات-الرئيسية)
3. [البدء السريع](#البدء-السريع)
4. [نظام معالجة الأخطاء](#نظام-معالجة-الأخطاء)
5. [نظام التحقق من البيانات](#نظام-التحقق-من-البيانات)
6. [نظام التسجيل والمراقبة](#نظام-التسجيل-والمراقبة)
7. [الأمثلة العملية](#الأمثلة-العملية)
8. [الاختبارات](#الاختبارات)
9. [الأداء والتحسين](#الأداء-والتحسين)
10. [الأسئلة الشائعة](#الأسئلة-الشائعة)

---

## 🎯 نظرة عامة

خدمة التكامل المحسّنة هي نظام متكامل يوفر:

- ✅ **معالجة أخطاء شاملة** مع أنواع أخطاء مخصصة
- ✅ **تحقق تلقائي من البيانات** مع رسائل خطأ واضحة
- ✅ **نظام تسجيل متقدم** مع مستويات مختلفة
- ✅ **مراقبة الأداء** مع إحصائيات تفصيلية
- ✅ **إعادة محاولة ذكية** للعمليات الفاشلة
- ✅ **كود نظيف وموثق** جاهز للإنتاج

---

## ✨ الميزات الرئيسية

### 1. معالجة الأخطاء الذكية

```typescript
// أنواع الأخطاء المدعومة
enum ErrorType {
  VALIDATION_ERROR,      // أخطاء التحقق من البيانات
  SYNC_ERROR,           // أخطاء المزامنة
  DATA_INTEGRITY_ERROR, // أخطاء تكامل البيانات
  CALCULATION_ERROR,    // أخطاء الحسابات
  DATABASE_ERROR,       // أخطاء قاعدة البيانات
  PERMISSION_ERROR,     // أخطاء الصلاحيات
  NOT_FOUND_ERROR,      // أخطاء عدم العثور
  UNKNOWN_ERROR         // أخطاء غير معروفة
}
```

### 2. التحقق التلقائي من البيانات

```typescript
// التحقق من بند مقايسات
const validation = DataValidator.validateBOQItem(item);
if (!validation.valid) {
  console.log('أخطاء:', validation.errors);
}
```

### 3. نظام التسجيل المتقدم

```typescript
// مستويات التسجيل
logger.debug('رسالة تصحيح');     // للمطورين
logger.info('معلومات عامة');      // معلومات عادية
logger.warn('تحذير');             // تحذيرات
logger.error('خطأ');              // أخطاء
logger.critical('خطأ حرج');       // أخطاء حرجة
```

### 4. مراقبة الأداء

```typescript
// بدء قياس الأداء
const endTimer = performanceMonitor.startTimer('operationName');
// ... تنفيذ العملية ...
endTimer(); // إيقاف القياس

// عرض الإحصائيات
const metrics = performanceMonitor.getMetrics('operationName');
console.log('متوسط الوقت:', metrics.average, 'ms');
```

---

## 🚀 البدء السريع

### التثبيت

```bash
# نسخ الملفات المطلوبة
cp IntegratedServiceEnhanced.ts src/services/integration/
```

### الاستخدام الأساسي

```typescript
import { 
  integrationService,
  logger,
  performanceMonitor 
} from './services/integration/IntegratedServiceEnhanced';

// 1. مزامنة مقايسات مع جدول زمني
const result = await integrationService.syncCalculationToSchedule(
  boqItem,
  'project-001'
);

if (result.success) {
  console.log('✅ نجحت المزامنة:', result.data);
} else {
  console.error('❌ فشلت المزامنة:', result.error);
}

// 2. عرض السجلات
const logs = logger.getLogs();
console.log('السجلات:', logs);

// 3. عرض إحصائيات الأداء
const metrics = performanceMonitor.getAllMetrics();
console.log('الإحصائيات:', metrics);
```

---

## 🛡️ نظام معالجة الأخطاء

### 1. فئة الخطأ المخصصة

```typescript
// إنشاء خطأ مخصص
throw new IntegrationError(
  ErrorType.VALIDATION_ERROR,
  'فشل التحقق من البيانات',
  { field: 'quantity', value: -100 },
  400 // status code
);
```

### 2. معالج الأخطاء المركزي

```typescript
try {
  // عملية قد تفشل
  await riskyOperation();
} catch (error) {
  // معالجة تلقائية للخطأ
  const response = errorHandler.handle(error, {
    operation: 'riskyOperation',
    timestamp: new Date()
  });
  
  console.log(response);
  // {
  //   success: false,
  //   error: {
  //     type: 'VALIDATION_ERROR',
  //     message: 'فشل التحقق من البيانات',
  //     context: {...},
  //     statusCode: 400,
  //     timestamp: '2025-11-06T...'
  //   }
  // }
}
```

### 3. إعادة المحاولة التلقائية

```typescript
// تنفيذ عملية مع إعادة محاولة
await retryHandler.executeWithRetry(
  async () => {
    // العملية التي قد تفشل
    await database.save(data);
  },
  'حفظ البيانات',
  { projectId: 'proj-001' }
);

// سيعيد المحاولة 3 مرات مع تأخير متزايد
// المحاولة 1: فوراً
// المحاولة 2: بعد 1 ثانية
// المحاولة 3: بعد 2 ثانية
```

---

## ✅ نظام التحقق من البيانات

### 1. التحقق من بند المقايسات

```typescript
const boqItem = {
  id: 'boq-001',
  description: 'خرسانة الأساسات',
  quantity: 100,
  unit: 'm³',
  unitPrice: 500,
  timePerUnit: 2,
  resourcesRequired: {
    laborers: 5,
    equipment: ['mixer', 'pump'],
    skillLevel: 'skilled'
  }
};

// التحقق
const validation = DataValidator.validateBOQItem(boqItem);

if (validation.valid) {
  console.log('✅ البيانات صحيحة');
} else {
  console.log('❌ أخطاء:', validation.errors);
  // [
  //   'الكمية مطلوبة ويجب أن تكون رقماً موجباً',
  //   'الوحدة مطلوبة ويجب أن تكون نصاً'
  // ]
}
```

### 2. التحقق من مهمة الجدول

```typescript
const scheduleTask = {
  id: 'task-001',
  name: 'صب الخرسانة',
  duration: 10,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-11'),
  budgetedCost: 50000,
  actualCost: 52000
};

const validation = DataValidator.validateScheduleTask(scheduleTask);
```

### 3. التحقق من البند المالي

```typescript
const financeItem = {
  id: 'fin-001',
  description: 'خرسانة',
  quantity: 100,
  unit: 'm³',
  unitPrice: 500,
  totalCost: 50000, // يجب أن يساوي quantity × unitPrice
  estimatedCost: 50000,
  actualCost: 52000,
  variance: 4 // النسبة المئوية
};

const validation = DataValidator.validateFinanceItem(financeItem);
```

### 4. التحقق من تكامل البيانات

```typescript
// التحقق من أن البيانات متسقة بين الأنظمة الثلاثة
const validation = DataValidator.validateDataIntegrity(
  boqItem,
  scheduleTask,
  financeItem
);

if (!validation.valid) {
  console.log('❌ عدم تطابق في البيانات:', validation.errors);
  // [
  //   'الكمية في المقايسات لا تطابق الكمية في المالية',
  //   'المدة في الجدول الزمني لا تطابق المدة المحسوبة'
  // ]
}
```

---

## 📝 نظام التسجيل والمراقبة

### 1. استخدام Logger

```typescript
// تسجيل رسائل مختلفة المستويات
logger.debug('تفاصيل تصحيح الأخطاء', { variable: value });
logger.info('بدء العملية', { operation: 'sync' });
logger.warn('تحذير: البيانات قديمة', { age: 30 });
logger.error('فشل الاتصال بقاعدة البيانات', error);
logger.critical('خطأ حرج: النظام غير مستقر', { details });

// الحصول على جميع السجلات
const allLogs = logger.getLogs();

// الحصول على سجلات معينة فقط
const errorLogs = logger.getLogs(LogLevel.ERROR);
const criticalLogs = logger.getLogs(LogLevel.CRITICAL);

// مسح السجلات
logger.clearLogs();
```

### 2. مراقبة الأداء

```typescript
// طريقة 1: استخدام Timer
const endTimer = performanceMonitor.startTimer('operationName');
try {
  // تنفيذ العملية
  await longRunningOperation();
} finally {
  endTimer(); // سيسجل الوقت تلقائياً
}

// طريقة 2: استخدام Wrapper
async function monitoredOperation() {
  const endTimer = performanceMonitor.startTimer('monitoredOperation');
  
  try {
    const result = await someOperation();
    return result;
  } finally {
    endTimer();
  }
}

// عرض إحصائيات عملية محددة
const metrics = performanceMonitor.getMetrics('operationName');
console.log({
  count: metrics.count,        // عدد المرات
  average: metrics.average,    // متوسط الوقت
  min: metrics.min,            // أقل وقت
  max: metrics.max,            // أكبر وقت
  total: metrics.total         // الوقت الكلي
});

// عرض جميع الإحصائيات
const allMetrics = performanceMonitor.getAllMetrics();
console.log(allMetrics);
// {
//   syncCalculationToSchedule: { count: 5, average: '245.32', ... },
//   syncScheduleToFinance: { count: 3, average: '156.78', ... }
// }

// مسح الإحصائيات
performanceMonitor.clearMetrics();
```

---

## 💻 الأمثلة العملية

### مثال 1: سير عمل كامل لإضافة بند مقايسات

```typescript
async function addBOQItemWorkflow() {
  // 1. تعريف البند
  const boqItem = {
    id: 'boq-001',
    description: 'خرسانة الأساسات C30',
    quantity: 150,
    unit: 'm³',
    unitPrice: 550,
    timePerUnit: 2.5,
    resourcesRequired: {
      laborers: 8,
      equipment: ['concrete-mixer', 'pump', 'vibrator'],
      skillLevel: 'skilled' as const
    },
    plannedStartDate: new Date('2025-01-15'),
    plannedEndDate: new Date('2025-02-15'),
    actualProgress: 0
  };

  try {
    // 2. المزامنة مع الجدول الزمني
    logger.info('🚀 بدء إضافة بند مقايسات جديد', { boqItem });
    
    const scheduleResult = await integrationService.syncCalculationToSchedule(
      boqItem,
      'project-001'
    );

    if (!scheduleResult.success) {
      throw new Error('فشلت مزامنة الجدول الزمني');
    }

    logger.info('✅ تمت مزامنة الجدول الزمني', { scheduleTask: scheduleResult.data.scheduleTask });

    // 3. المزامنة مع المالية
    const financeResult = await integrationService.syncCalculationToFinance(
      boqItem,
      'project-001'
    );

    if (!financeResult.success) {
      throw new Error('فشلت مزامنة المالية');
    }

    logger.info('✅ تمت مزامنة المالية', { financeItem: financeResult.data.financeItem });

    // 4. التحقق من تكامل البيانات
    const integrityCheck = DataValidator.validateDataIntegrity(
      boqItem,
      scheduleResult.data.scheduleTask,
      financeResult.data.financeItem
    );

    if (!integrityCheck.valid) {
      logger.warn('⚠️ مشاكل في تكامل البيانات', { errors: integrityCheck.errors });
    }

    // 5. النتيجة النهائية
    return {
      success: true,
      boqItem,
      scheduleTask: scheduleResult.data.scheduleTask,
      financeItem: financeResult.data.financeItem,
      metrics: performanceMonitor.getAllMetrics()
    };

  } catch (error) {
    logger.error('❌ فشل سير العمل', { error });
    return errorHandler.handle(error as Error, { boqItem });
  }
}
```

### مثال 2: تحديث التقدم من الموقع

```typescript
async function updateSiteProgress() {
  const progressUpdate = {
    taskId: 'task-001',
    completedQuantity: 50, // تم إنجاز 50 م³
    date: new Date(),
    notes: 'تقدم جيد، الطقس ممتاز',
    photos: ['photo1.jpg', 'photo2.jpg'],
    quality: 'excellent' as const
  };

  try {
    // 1. التحقق من المهمة
    const task = await getScheduleTask(progressUpdate.taskId);
    
    // 2. حساب النسبة المئوية
    const linkedBOQ = await getBOQItem(task.calculationItemIds[0]);
    const percentComplete = (progressUpdate.completedQuantity / linkedBOQ.quantity) * 100;

    logger.info('📊 تحديث التقدم', { 
      completed: progressUpdate.completedQuantity,
      total: linkedBOQ.quantity,
      percent: percentComplete 
    });

    // 3. التحقق من التأخير
    if (percentComplete < task.expectedProgress) {
      const delay = task.expectedProgress - percentComplete;
      logger.warn('⚠️ تأخير محتمل', { delay });
      
      // إرسال إشعار للمدير
      await notifyManager({
        type: 'delay-warning',
        task: task.name,
        delay: delay
      });
    }

    // 4. تحديث جميع الأنظمة
    await Promise.all([
      updateBOQProgress(linkedBOQ.id, progressUpdate.completedQuantity),
      updateScheduleProgress(task.id, percentComplete),
      updateFinancialProgress(task.financeItemIds[0], percentComplete)
    ]);

    logger.info('✅ تم تحديث التقدم في جميع الأنظمة');

    return { success: true, percentComplete };

  } catch (error) {
    logger.error('❌ فشل تحديث التقدم', { error });
    return errorHandler.handle(error as Error, { progressUpdate });
  }
}
```

### مثال 3: تقرير يومي شامل

```typescript
async function generateDailyReport(projectId: string) {
  try {
    logger.info('📋 بدء إنشاء التقرير اليومي', { projectId });

    // 1. جمع البيانات
    const boqItems = await getAllBOQItems(projectId);
    const scheduleTasks = await getAllScheduleTasks(projectId);
    const financeItems = await getAllFinanceItems(projectId);

    // 2. حساب الإحصائيات
    const stats = {
      boq: {
        total: boqItems.length,
        completed: boqItems.filter(i => i.actualProgress === 100).length,
        inProgress: boqItems.filter(i => i.actualProgress > 0 && i.actualProgress < 100).length
      },
      schedule: {
        total: scheduleTasks.length,
        onTime: scheduleTasks.filter(t => t.delayDays === 0).length,
        delayed: scheduleTasks.filter(t => t.delayDays > 0).length
      },
      finance: {
        totalBudget: financeItems.reduce((sum, i) => sum + i.estimatedCost, 0),
        totalActual: financeItems.reduce((sum, i) => sum + i.actualCost, 0),
        variance: 0
      }
    };

    stats.finance.variance = 
      ((stats.finance.totalActual - stats.finance.totalBudget) / stats.finance.totalBudget) * 100;

    // 3. الحصول على السجلات
    const todayLogs = logger.getLogs().filter(log => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    });

    const errors = todayLogs.filter(log => log.level === 'ERROR' || log.level === 'CRITICAL');

    // 4. الحصول على إحصائيات الأداء
    const performance = performanceMonitor.getAllMetrics();

    // 5. إنشاء التقرير
    const report = {
      date: new Date().toISOString(),
      projectId,
      statistics: stats,
      errors: errors.length,
      performance,
      summary: {
        boqProgress: ((stats.boq.completed / stats.boq.total) * 100).toFixed(2) + '%',
        scheduleStatus: stats.schedule.delayed === 0 ? 'في الموعد' : `متأخر (${stats.schedule.delayed} مهمة)`,
        budgetStatus: stats.finance.variance > 0 ? `زيادة ${stats.finance.variance.toFixed(2)}%` : `في الميزانية`,
        errorCount: errors.length
      }
    };

    logger.info('✅ تم إنشاء التقرير اليومي', { report });

    // 6. حفظ التقرير
    await saveReport(report);

    // 7. إرسال التقرير عبر البريد
    await emailReport(report, ['manager@example.com']);

    return report;

  } catch (error) {
    logger.error('❌ فشل إنشاء التقرير اليومي', { error });
    return errorHandler.handle(error as Error, { projectId });
  }
}
```

---

## 🧪 الاختبارات

### إعداد بيئة الاختبار

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  integrationService,
  DataValidator,
  logger,
  performanceMonitor
} from './IntegratedServiceEnhanced';

beforeEach(() => {
  // تنظيف قبل كل اختبار
  logger.clearLogs();
  performanceMonitor.clearMetrics();
});
```

### اختبارات التحقق من البيانات

```typescript
describe('DataValidator', () => {
  describe('validateBOQItem', () => {
    it('يجب أن يقبل بند صحيح', () => {
      const validItem = {
        id: 'boq-001',
        description: 'خرسانة',
        quantity: 100,
        unit: 'm³',
        unitPrice: 500,
        timePerUnit: 2,
        resourcesRequired: {
          laborers: 5,
          equipment: ['mixer'],
          skillLevel: 'skilled'
        }
      };

      const result = DataValidator.validateBOQItem(validItem);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('يجب أن يرفض كمية سالبة', () => {
      const invalidItem = {
        id: 'boq-001',
        description: 'خرسانة',
        quantity: -100, // ❌ سالب
        unit: 'm³',
        unitPrice: 500,
        timePerUnit: 2,
        resourcesRequired: {
          laborers: 5,
          equipment: ['mixer'],
          skillLevel: 'skilled'
        }
      };

      const result = DataValidator.validateBOQItem(invalidItem);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('الكمية مطلوبة ويجب أن تكون رقماً موجباً');
    });

    it('يجب أن يرفض معرف فارغ', () => {
      const invalidItem = {
        id: '', // ❌ فارغ
        description: 'خرسانة',
        quantity: 100,
        unit: 'm³',
        unitPrice: 500,
        timePerUnit: 2,
        resourcesRequired: {
          laborers: 5,
          equipment: ['mixer'],
          skillLevel: 'skilled'
        }
      };

      const result = DataValidator.validateBOQItem(invalidItem);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('المعرف مطلوب ويجب أن يكون نصاً');
    });
  });
});
```

### اختبارات خدمة التكامل

```typescript
describe('IntegrationService', () => {
  describe('syncCalculationToSchedule', () => {
    it('يجب أن ينشئ مهمة جدول من بند مقايسات', async () => {
      const boqItem = {
        id: 'boq-001',
        description: 'خرسانة الأساسات',
        quantity: 100,
        unit: 'm³',
        unitPrice: 500,
        timePerUnit: 2,
        resourcesRequired: {
          laborers: 5,
          equipment: ['mixer'],
          skillLevel: 'skilled'
        }
      };

      const result = await integrationService.syncCalculationToSchedule(
        boqItem,
        'project-001'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.scheduleTask).toBeDefined();
      expect(result.data.scheduleTask.duration).toBe(200); // 100 × 2
      expect(result.data.scheduleTask.budgetedCost).toBe(50000); // 100 × 500
    });

    it('يجب أن يرفض بيانات غير صحيحة', async () => {
      const invalidItem = {
        id: 'boq-001',
        description: 'خرسانة',
        quantity: -100, // ❌ سالب
        unit: 'm³',
        unitPrice: 500,
        timePerUnit: 2,
        resourcesRequired: {
          laborers: 5,
          equipment: ['mixer'],
          skillLevel: 'skilled'
        }
      };

      const result = await integrationService.syncCalculationToSchedule(
        invalidItem,
        'project-001'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('VALIDATION_ERROR');
    });

    it('يجب أن يسجل العملية في Logger', async () => {
      const boqItem = {
        id: 'boq-001',
        description: 'خرسانة',
        quantity: 100,
        unit: 'm³',
        unitPrice: 500,
        timePerUnit: 2,
        resourcesRequired: {
          laborers: 5,
          equipment: ['mixer'],
          skillLevel: 'skilled'
        }
      };

      await integrationService.syncCalculationToSchedule(boqItem, 'project-001');

      const logs = logger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      
      const infoLogs = logs.filter(log => log.level === 'INFO');
      expect(infoLogs.length).toBeGreaterThan(0);
    });

    it('يجب أن يسجل الأداء في PerformanceMonitor', async () => {
      const boqItem = {
        id: 'boq-001',
        description: 'خرسانة',
        quantity: 100,
        unit: 'm³',
        unitPrice: 500,
        timePerUnit: 2,
        resourcesRequired: {
          laborers: 5,
          equipment: ['mixer'],
          skillLevel: 'skilled'
        }
      };

      await integrationService.syncCalculationToSchedule(boqItem, 'project-001');

      const metrics = performanceMonitor.getMetrics('syncCalculationToSchedule');
      expect(metrics).toBeDefined();
      expect(metrics.count).toBe(1);
      expect(parseFloat(metrics.average)).toBeGreaterThan(0);
    });
  });
});
```

### اختبارات التكامل

```typescript
describe('Integration Tests', () => {
  it('يجب أن يتزامن بند مقايسات مع جميع الأنظمة', async () => {
    const boqItem = {
      id: 'boq-001',
      description: 'خرسانة الأساسات',
      quantity: 100,
      unit: 'm³',
      unitPrice: 500,
      timePerUnit: 2,
      resourcesRequired: {
        laborers: 5,
        equipment: ['mixer'],
        skillLevel: 'skilled'
      }
    };

    // 1. مزامنة مع الجدول
    const scheduleResult = await integrationService.syncCalculationToSchedule(
      boqItem,
      'project-001'
    );

    expect(scheduleResult.success).toBe(true);

    // 2. مزامنة مع المالية
    const financeResult = await integrationService.syncCalculationToFinance(
      boqItem,
      'project-001'
    );

    expect(financeResult.success).toBe(true);

    // 3. التحقق من تكامل البيانات
    const integrityCheck = DataValidator.validateDataIntegrity(
      boqItem,
      scheduleResult.data.scheduleTask,
      financeResult.data.financeItem
    );

    expect(integrityCheck.valid).toBe(true);
    expect(integrityCheck.errors).toHaveLength(0);
  });

  it('يجب أن يتعامل مع الأخطاء بشكل صحيح', async () => {
    const invalidItem = {
      id: '',
      description: '',
      quantity: -100,
      unit: '',
      unitPrice: -500,
      timePerUnit: 0,
      resourcesRequired: {
        laborers: -5,
        equipment: 'not-an-array',
        skillLevel: 'invalid'
      }
    };

    const result = await integrationService.syncCalculationToSchedule(
      invalidItem,
      'project-001'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.type).toBe('VALIDATION_ERROR');
    expect(result.error.context.errors.length).toBeGreaterThan(0);
  });
});
```

---

## ⚡ الأداء والتحسين

### نصائح لتحسين الأداء

1. **استخدام Batch Operations**
```typescript
// ❌ سيء: مزامنة عنصر واحد في كل مرة
for (const item of items) {
  await integrationService.syncCalculationToSchedule(item, projectId);
}

// ✅ جيد: مزامنة جماعية
await Promise.all(
  items.map(item => 
    integrationService.syncCalculationToSchedule(item, projectId)
  )
);
```

2. **التخزين المؤقت (Caching)**
```typescript
const cache = new Map();

async function getCachedBOQItem(id: string) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const item = await getBOQItem(id);
  cache.set(id, item);
  return item;
}
```

3. **مراقبة الأداء**
```typescript
// تتبع العمليات البطيئة
const metrics = performanceMonitor.getAllMetrics();
for (const [operation, stats] of Object.entries(metrics)) {
  if (parseFloat(stats.average) > 1000) { // أكثر من ثانية
    logger.warn(`⚠️ عملية بطيئة: ${operation}`, stats);
  }
}
```

---

## ❓ الأسئلة الشائعة

### س1: كيف أتعامل مع الأخطاء المخصصة؟

```typescript
try {
  await integrationService.syncCalculationToSchedule(item, projectId);
} catch (error) {
  if (error instanceof IntegrationError) {
    // خطأ معروف
    console.log('نوع الخطأ:', error.type);
    console.log('الرسالة:', error.message);
    console.log('السياق:', error.context);
  } else {
    // خطأ غير متوقع
    console.error('خطأ غير معروف:', error);
  }
}
```

### س2: كيف أحصل على سجلات فترة معينة؟

```typescript
const allLogs = logger.getLogs();
const todayLogs = allLogs.filter(log => {
  const logDate = new Date(log.timestamp);
  const today = new Date();
  return logDate.toDateString() === today.toDateString();
});
```

### س3: كيف أقيس أداء عملية محددة؟

```typescript
const endTimer = performanceMonitor.startTimer('myOperation');
try {
  await myOperation();
} finally {
  endTimer();
}

const metrics = performanceMonitor.getMetrics('myOperation');
console.log('متوسط الوقت:', metrics.average, 'ms');
```

### س4: كيف أتحقق من تكامل البيانات؟

```typescript
const integrity = DataValidator.validateDataIntegrity(
  boqItem,
  scheduleTask,
  financeItem
);

if (!integrity.valid) {
  console.log('مشاكل في التكامل:', integrity.errors);
  // معالجة المشاكل...
}
```

---

## 📚 موارد إضافية

- [دليل أنواع البيانات](./types/integrated/)
- [أمثلة التطبيق](./examples/)
- [اختبارات الوحدة](./tests/)
- [دليل الأداء](./PERFORMANCE.md)

---

## 🤝 المساهمة

لديك اقتراحات للتحسين؟ يرجى:

1. إنشاء Issue مع الوصف
2. إرسال Pull Request مع التغييرات
3. التأكد من مرور جميع الاختبارات

---

## 📄 الترخيص

MIT License - استخدم بحرية في مشاريعك! ✨

---

**تم التحديث:** 6 نوفمبر 2025  
**الإصدار:** 2.0  
**الحالة:** ✅ جاهز للإنتاج
