/**
 * خدمة التكامل الشامل
 * Integration Service
 * 
 * مسؤولة عن: المزامنة التلقائية بين المقايسات ↔ الجدول الزمني ↔ المالية
 */

import { IntegratedBOQItem } from '../../types/integrated/IntegratedBOQ';
import { IntegratedScheduleTask } from '../../types/integrated/IntegratedSchedule';
import { EngineeringStandardsDatabase } from '../../types/integrated/EngineeringStandards';

export class IntegrationService {
  /**
   * تحويل فئة BOQ إلى نوع النشاط
   */
  private static mapCategoryToActivity(category: string): 'concrete' | 'steel' | 'formwork' | 'blockwork' {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('concrete') || lowerCategory.includes('خرسانة')) return 'concrete';
    if (lowerCategory.includes('steel') || lowerCategory.includes('حديد')) return 'steel';
    if (lowerCategory.includes('formwork') || lowerCategory.includes('شدة') || lowerCategory.includes('قوالب')) return 'formwork';
    if (lowerCategory.includes('block') || lowerCategory.includes('بلوك')) return 'blockwork';
    return 'concrete'; // default
  }

  /**
   * مزامنة بند مقايسات مع الجدول الزمني والمالية
   */
  static async syncBOQItem(boqItem: IntegratedBOQItem): Promise<{
    scheduleUpdated: boolean;
    financeUpdated: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let scheduleUpdated = false;
    let financeUpdated = false;
    
    try {
      // 1. حساب المدة من الكمية
      const activity = this.mapCategoryToActivity(boqItem.category);
      const duration = EngineeringStandardsDatabase.calculateDuration(
        boqItem.quantity,
        activity,
        'standard'
      );
      
      // 2. حساب الموارد المطلوبة
      const resources = EngineeringStandardsDatabase.calculateResources(
        boqItem.quantity,
        activity
      );
      
      // 3. تحديث بيانات التكامل
      boqItem.scheduleIntegration.calculatedDuration = duration;
      if (resources) {
        // تحويل materials إلى مصفوفة إذا كان object
        const materialsArray = resources.materials 
          ? Array.isArray(resources.materials)
            ? resources.materials
            : Object.entries(resources.materials).map(([name, data]: [string, any]) => ({
                id: `MAT-${name}`,
                name,
                quantity: data.quantity || data,
                unit: data.unit || 'unit',
                unitCost: data.unitCost || 100,
                totalCost: (data.quantity || data) * (data.unitCost || 100)
              }))
          : [];

        boqItem.scheduleIntegration.resources = {
          labor: {
            skilled: resources.labor.skilled,
            unskilled: resources.labor.unskilled,
            supervisor: resources.labor.supervisor,
            totalCost: this.calculateLaborCost(resources.labor, duration),
            dailyCost: this.calculateLaborCost(resources.labor, 1)
          },
          equipment: Object.entries(resources.equipment || {}).map(([type, qty]) => ({
            id: `EQ-${type}`,
            type,
            quantity: typeof qty === 'number' ? qty : 1,
            dailyRate: 500, // default
            totalCost: (typeof qty === 'number' ? qty : 1) * 500 * duration
          })),
          materials: materialsArray
        };
      }
      
      // 4. تحديث التكاليف المالية
      const totalCost = this.calculateTotalCost(boqItem);
      boqItem.financialIntegration.comparison.estimated.totalCost = totalCost;
      
      boqItem.scheduleIntegration.syncStatus = 'synced';
      boqItem.scheduleIntegration.lastSyncDate = new Date();
      
      scheduleUpdated = true;
      financeUpdated = true;
      
    } catch (error) {
      errors.push(`خطأ في المزامنة: ${error}`);
      boqItem.scheduleIntegration.syncStatus = 'error';
    }
    
    return { scheduleUpdated, financeUpdated, errors };
  }
  
  /**
   * مزامنة مهمة من الجدول الزمني مع المقايسات والمالية
   */
  static async syncScheduleTask(task: IntegratedScheduleTask): Promise<{
    boqUpdated: boolean;
    financeUpdated: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let boqUpdated = false;
    let financeUpdated = false;
    
    try {
      // 1. حساب التكاليف من المدة
      const totalCost = this.calculateTaskCost(task);
      task.financialIntegration.plannedCosts.total = totalCost;
      
      // 2. إذا كان هناك تأخير، احسب التكاليف الإضافية
      if (task.actualEndDate && task.endDate) {
        const delayDays = this.calculateDelayDays(task.endDate, task.actualEndDate);
        
        if (delayDays > 0) {
          const delayCosts = this.calculateDelayCosts(task, delayDays);
          // تحديث فقط الحقول المطلوبة
          task.financialIntegration.delayCalculation = {
            directCosts: delayCosts.directCosts.total,
            indirectCosts: delayCosts.indirectCosts.total,
            totalDelayCost: delayCosts.totalDelayCost
          };
        }
      }
      
      // 3. تحديث التدفق النقدي
      this.updateCashFlow(task);
      
      boqUpdated = true;
      financeUpdated = true;
      
    } catch (error) {
      errors.push(`خطأ في المزامنة: ${error}`);
    }
    
    return { boqUpdated, financeUpdated, errors };
  }
  
  /**
   * مقارنة مقدر مع فعلي
   */
  static compareEstimatedVsActual(
    estimated: { quantity: number; unitPrice: number; totalCost: number },
    actual: { quantity: number; unitPrice: number; totalCost: number }
  ) {
    return {
      quantityVariance: actual.quantity - estimated.quantity,
      priceVariance: actual.unitPrice - estimated.unitPrice,
      totalVariance: actual.totalCost - estimated.totalCost,
      percentageVariance: ((actual.totalCost - estimated.totalCost) / estimated.totalCost) * 100,
      status: actual.totalCost < estimated.totalCost ? 'under' : 
              actual.totalCost > estimated.totalCost ? 'over' : 'on'
    };
  }
  
  /**
   * حساب تكلفة العمالة
   */
  private static calculateLaborCost(labor: any, days: number): number {
    const skilledCost = (labor.skilled || 0) * 300 * days;
    const unskilledCost = (labor.unskilled || 0) * 200 * days;
    const supervisorCost = (labor.supervisor || 0) * 400 * days;
    return skilledCost + unskilledCost + supervisorCost;
  }
  
  /**
   * حساب التكلفة الكلية لبند مقايسات
   */
  private static calculateTotalCost(boqItem: IntegratedBOQItem): number {
    const integration = boqItem.scheduleIntegration;
    const resources = integration.resources;
    
    const laborCost = resources.labor.totalCost;
    const equipmentCost = resources.equipment.reduce((sum, eq) => sum + eq.totalCost, 0);
    const materialsCost = resources.materials.reduce((sum, mat) => sum + mat.totalCost, 0);
    
    return laborCost + equipmentCost + materialsCost;
  }
  
  /**
   * حساب تكلفة المهمة
   */
  private static calculateTaskCost(task: IntegratedScheduleTask): number {
    const costs = task.financialIntegration.plannedCosts;
    return costs.labor + costs.equipment + costs.materials + costs.overhead + costs.contingency;
  }
  
  /**
   * حساب أيام التأخير
   */
  private static calculateDelayDays(plannedEnd: Date, actualEnd: Date): number {
    const diffTime = actualEnd.getTime() - plannedEnd.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  
  /**
   * حساب تكاليف التأخير
   */
  private static calculateDelayCosts(task: IntegratedScheduleTask, delayDays: number) {
    const plannedCosts = task.financialIntegration.plannedCosts;
    const dailyLaborCost = plannedCosts.labor / task.duration;
    const dailyEquipmentCost = plannedCosts.equipment / task.duration;
    
    // تكاليف مباشرة
    const laborOvertime = dailyLaborCost * 0.5 * delayDays; // 50% زيادة للعمل الإضافي
    const equipmentExtension = dailyEquipmentCost * delayDays;
    const penalties = 0; // يحدد حسب العقد
    
    const directCosts = {
      laborOvertime,
      equipmentExtension,
      penalties,
      total: laborOvertime + equipmentExtension + penalties
    };
    
    // تكاليف غير مباشرة
    const siteOverheads = plannedCosts.overhead / task.duration * delayDays;
    const managementCosts = siteOverheads * 0.3;
    const lostOpportunity = plannedCosts.total * 0.05 * (delayDays / task.duration);
    
    const indirectCosts = {
      siteOverheads,
      managementCosts,
      lostOpportunity,
      total: siteOverheads + managementCosts + lostOpportunity
    };
    
    return {
      delayDays,
      directCosts,
      indirectCosts,
      totalDelayCost: directCosts.total + indirectCosts.total,
      delayReason: '',
      forceMajeure: false
    };
  }
  
  /**
   * تحديث التدفق النقدي
   */
  private static updateCashFlow(task: IntegratedScheduleTask): void {
    // منطق تحديث التدفق النقدي
    // يمكن تطويره لاحقاً
  }
}

/**
 * خدمة الإنذار المبكر
 */
export class EarlyWarningService {
  /**
   * تحليل التقدم وإنشاء إنذار مبكر
   */
  static analyzeProgress(
    task: IntegratedScheduleTask,
    actualProgress: number,
    currentDate: Date
  ) {
    const daysPassed = this.calculateDaysPassed(task.startDate, currentDate);
    const expectedProgress = (daysPassed / task.duration) * 100;
    const progressDelta = actualProgress - expectedProgress;
    
    // توقع التأخير
    let predictedDelay = 0;
    if (actualProgress < expectedProgress) {
      const remainingWork = 100 - actualProgress;
      const currentRate = actualProgress / daysPassed;
      const daysNeeded = Math.ceil(remainingWork / currentRate);
      const remainingPlanned = task.duration - daysPassed;
      predictedDelay = Math.max(0, daysNeeded - remainingPlanned);
    }
    
    // مستوى الخطر
    let riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    if (predictedDelay === 0) riskLevel = 'none';
    else if (predictedDelay <= 1) riskLevel = 'low';
    else if (predictedDelay <= 3) riskLevel = 'medium';
    else if (predictedDelay <= 7) riskLevel = 'high';
    else riskLevel = 'critical';
    
    return {
      active: predictedDelay > 0,
      riskLevel,
      predictions: {
        delayDays: predictedDelay,
        costOverrun: this.estimateCostOverrun(task, predictedDelay),
        impactOnProject: this.assessImpact(task, predictedDelay)
      },
      recommendations: this.generateRecommendations(task, predictedDelay, progressDelta),
      notifications: []
    };
  }
  
  private static calculateDaysPassed(start: Date, current: Date): number {
    const diffTime = current.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  private static estimateCostOverrun(task: IntegratedScheduleTask, delayDays: number): number {
    const dailyCost = task.financialIntegration.plannedCosts.total / task.duration;
    return dailyCost * delayDays * 1.5; // 50% زيادة للعمل الإضافي
  }
  
  private static assessImpact(task: IntegratedScheduleTask, delayDays: number): string {
    if (delayDays === 0) return 'لا يوجد تأثير';
    if (delayDays <= 2) return 'تأثير بسيط على الجدول الزمني';
    if (delayDays <= 5) return 'تأثير متوسط - قد يؤثر على المهام التالية';
    return 'تأثير كبير - سيؤثر على موعد تسليم المشروع';
  }
  
  private static generateRecommendations(
    task: IntegratedScheduleTask,
    predictedDelay: number,
    progressDelta: number
  ) {
    const recommendations = [];
    
    if (predictedDelay > 0) {
      recommendations.push({
        action: `زيادة العمالة بنسبة ${Math.ceil(predictedDelay / task.duration * 100)}%`,
        priority: predictedDelay > 3 ? 'immediate' : 'high' as const,
        estimatedCost: this.estimateCostOverrun(task, predictedDelay) * 0.6,
        expectedBenefit: 'تقليل التأخير المتوقع'
      });
      
      recommendations.push({
        action: 'زيادة ساعات العمل (وردية إضافية)',
        priority: 'high' as const,
        estimatedCost: this.estimateCostOverrun(task, predictedDelay) * 0.4,
        expectedBenefit: 'تسريع الإنجاز'
      });
    }
    
    return recommendations;
  }
}

/**
 * خدمة إعادة التخطيط التلقائي
 */
export class AutoReSchedulingService {
  /**
   * اقتراح خطة معدلة تلقائياً
   */
  static proposeReSchedule(
    task: IntegratedScheduleTask,
    predictedDelay: number
  ) {
    const revisedEndDate = new Date(task.endDate);
    revisedEndDate.setDate(revisedEndDate.getDate() + predictedDelay);
    
    return {
      required: predictedDelay > 0,
      originalPlan: {
        startDate: task.startDate,
        endDate: task.endDate,
        duration: task.duration
      },
      revisedPlan: {
        startDate: task.startDate,
        endDate: revisedEndDate,
        duration: task.duration + predictedDelay,
        changes: [
          `تمديد المدة ${predictedDelay} يوم`,
          'زيادة العمالة',
          'إضافة وردية مسائية'
        ],
        additionalCost: this.calculateAdditionalCost(task, predictedDelay)
      },
      affectedTasks: [],
      approval: {
        status: 'pending' as const,
        autoApply: predictedDelay <= 1,
        comments: undefined,
        approvedBy: undefined,
        approvalDate: undefined
      }
    };
  }
  
  private static calculateAdditionalCost(task: IntegratedScheduleTask, delayDays: number): number {
    const dailyCost = task.financialIntegration.plannedCosts.total / task.duration;
    return dailyCost * delayDays * 1.3;
  }
}
