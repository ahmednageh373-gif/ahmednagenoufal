/**
 * AI-Powered Item Analyzer
 * يحلل بنود المقايسة ذكياً ويقسمها لأنشطة
 */

import type { FinancialItem } from '../types';
import { constructionActivitiesDB, findMatchingActivity, type ActivityTemplate, type SubActivity } from '../data/construction-activities-db';

export interface AnalyzedItem extends FinancialItem {
  // التحليل الذكي
  analysis: {
    detectedActivity: ActivityTemplate | null;
    breakdown: ItemBreakdown;
    labor: LaborAnalysis;
    materials: MaterialAnalysis[];
    sbcCompliance: SBCCheck;
    confidence: number; // 0-100%
  };
}

export interface ItemBreakdown {
  activities: BreakdownActivity[];
  totalDuration: number; // أيام
  criticalPath: string[]; // IDs للأنشطة على المسار الحرج
}

export interface BreakdownActivity {
  id: string;
  name: string;
  description: string;
  sequence: number;
  duration: number; // أيام
  startOffset: number; // بداية النشاط من بداية البند (أيام)
  workers: WorkerRequirement[];
  productivity: {
    rate: number;
    unit: string;
    perDay: number;
  };
  dependencies: string[];
  isCritical: boolean;
}

export interface WorkerRequirement {
  role: string;
  count: number;
  productivity: number;
  dailyCost: number;
  totalCost: number;
  workingDays: number;
}

export interface LaborAnalysis {
  totalWorkers: number;
  totalManDays: number; // عدد أيام العمل الإجمالية
  totalCost: number; // التكلفة الإجمالية
  breakdown: {
    [role: string]: {
      count: number;
      days: number;
      cost: number;
    };
  };
}

export interface MaterialAnalysis {
  name: string;
  quantity: number;
  unit: string;
  wastage: number; // الهدر
  totalRequired: number; // الكمية + الهدر
}

export interface SBCCheck {
  applicableCodes: string[];
  requirements: string[];
  compliant: boolean;
  notes: string[];
}

/**
 * المحلل الرئيسي للبند
 */
export async function analyzeItem(item: FinancialItem): Promise<AnalyzedItem> {
  console.log(`🔍 Analyzing item: ${item.description}`);
  
  // 1. محاولة العثور على نشاط مطابق من قاعدة البيانات
  const matchedActivity = findMatchingActivity(item.description);
  
  if (matchedActivity) {
    console.log(`✅ Found matching activity: ${matchedActivity.nameAr}`);
    return analyzeWithTemplate(item, matchedActivity);
  } else {
    console.log(`⚠️ No exact match found, using AI analysis...`);
    return analyzeWithAI(item);
  }
}

/**
 * التحليل باستخدام Template من قاعدة البيانات
 */
function analyzeWithTemplate(item: FinancialItem, template: ActivityTemplate): AnalyzedItem {
  const breakdown: ItemBreakdown = {
    activities: [],
    totalDuration: 0,
    criticalPath: []
  };
  
  let currentOffset = 0;
  const criticalActivities: string[] = [];
  
  // تحويل SubActivities إلى BreakdownActivities
  for (const subActivity of template.subActivities) {
    const activityDuration = calculateActivityDuration(item.quantity, subActivity.productivity);
    const workers = calculateWorkerRequirements(subActivity.workers, activityDuration);
    
    const breakdownActivity: BreakdownActivity = {
      id: subActivity.id,
      name: subActivity.name,
      description: `${subActivity.name} - ${item.description}`,
      sequence: subActivity.sequence,
      duration: activityDuration,
      startOffset: currentOffset,
      workers: workers,
      productivity: {
        rate: subActivity.productivity,
        unit: subActivity.unit,
        perDay: subActivity.productivity
      },
      dependencies: subActivity.dependencies,
      isCritical: subActivity.dependencies.length === 0 // مبسط: الأنشطة بدون اعتماديات هي حرجة
    };
    
    breakdown.activities.push(breakdownActivity);
    
    if (breakdownActivity.isCritical) {
      criticalActivities.push(breakdownActivity.id);
    }
    
    // تحديث الـ offset للنشاط التالي
    if (subActivity.dependencies.length === 0) {
      currentOffset += activityDuration;
    }
  }
  
  breakdown.totalDuration = currentOffset;
  breakdown.criticalPath = criticalActivities;
  
  // تحليل العمالة
  const labor = analyzeLaborRequirements(breakdown.activities);
  
  // تحليل المواد
  const materials = analyzeMaterialRequirements(item, template);
  
  // فحص SBC
  const sbcCompliance: SBCCheck = {
    applicableCodes: template.sbcReferences,
    requirements: [template.executionMethod],
    compliant: true,
    notes: []
  };
  
  return {
    ...item,
    analysis: {
      detectedActivity: template,
      breakdown,
      labor,
      materials,
      sbcCompliance,
      confidence: 95 // ثقة عالية لأنه من قاعدة البيانات
    }
  };
}

/**
 * التحليل باستخدام AI (Gemini) للبنود غير المتطابقة
 */
async function analyzeWithAI(item: FinancialItem): Promise<AnalyzedItem> {
  // TODO: دمج مع Gemini AI في المستقبل
  // حالياً نستخدم تحليل بسيط
  
  const simpleBreakdown: ItemBreakdown = {
    activities: [
      {
        id: `${item.id}-activity-1`,
        name: 'تنفيذ البند',
        description: item.description,
        sequence: 1,
        duration: estimateDuration(item.quantity, item.unit),
        startOffset: 0,
        workers: [
          {
            role: 'عامل',
            count: 4,
            productivity: 10,
            dailyCost: 150,
            totalCost: estimateDuration(item.quantity, item.unit) * 4 * 150,
            workingDays: estimateDuration(item.quantity, item.unit)
          }
        ],
        productivity: {
          rate: 10,
          unit: item.unit,
          perDay: 10
        },
        dependencies: [],
        isCritical: true
      }
    ],
    totalDuration: estimateDuration(item.quantity, item.unit),
    criticalPath: [`${item.id}-activity-1`]
  };
  
  const labor: LaborAnalysis = {
    totalWorkers: 4,
    totalManDays: estimateDuration(item.quantity, item.unit) * 4,
    totalCost: estimateDuration(item.quantity, item.unit) * 4 * 150,
    breakdown: {
      'عامل': {
        count: 4,
        days: estimateDuration(item.quantity, item.unit),
        cost: estimateDuration(item.quantity, item.unit) * 4 * 150
      }
    }
  };
  
  return {
    ...item,
    analysis: {
      detectedActivity: null,
      breakdown: simpleBreakdown,
      labor,
      materials: [],
      sbcCompliance: {
        applicableCodes: [],
        requirements: [],
        compliant: true,
        notes: ['يجب مراجعة الكود السعودي يدوياً']
      },
      confidence: 50 // ثقة متوسطة
    }
  };
}

/**
 * حساب مدة النشاط بناءً على الكمية والإنتاجية
 */
function calculateActivityDuration(quantity: number, productivity: number): number {
  if (productivity <= 0) return 1;
  const days = Math.ceil(quantity / productivity);
  return Math.max(1, days); // على الأقل يوم واحد
}

/**
 * حساب احتياجات العمالة
 */
function calculateWorkerRequirements(
  laborRequirements: any[],
  duration: number
): WorkerRequirement[] {
  return laborRequirements.map(labor => ({
    role: labor.role,
    count: labor.count,
    productivity: labor.productivity,
    dailyCost: labor.dailyCost,
    totalCost: labor.count * labor.dailyCost * duration,
    workingDays: duration
  }));
}

/**
 * تحليل إجمالي العمالة
 */
function analyzeLaborRequirements(activities: BreakdownActivity[]): LaborAnalysis {
  const breakdown: { [role: string]: { count: number; days: number; cost: number } } = {};
  let totalWorkers = 0;
  let totalManDays = 0;
  let totalCost = 0;
  
  for (const activity of activities) {
    for (const worker of activity.workers) {
      if (!breakdown[worker.role]) {
        breakdown[worker.role] = { count: 0, days: 0, cost: 0 };
      }
      
      breakdown[worker.role].count = Math.max(breakdown[worker.role].count, worker.count);
      breakdown[worker.role].days += worker.workingDays;
      breakdown[worker.role].cost += worker.totalCost;
      
      totalWorkers += worker.count;
      totalManDays += worker.count * worker.workingDays;
      totalCost += worker.totalCost;
    }
  }
  
  return {
    totalWorkers,
    totalManDays,
    totalCost,
    breakdown
  };
}

/**
 * تحليل المواد المطلوبة
 */
function analyzeMaterialRequirements(
  item: FinancialItem,
  template: ActivityTemplate
): MaterialAnalysis[] {
  return template.materials.map(material => {
    const baseQuantity = material.quantityPer * item.quantity;
    const wastage = baseQuantity * (material.wastePercentage / 100);
    const totalRequired = baseQuantity + wastage;
    
    return {
      name: material.name,
      quantity: baseQuantity,
      unit: material.unit,
      wastage,
      totalRequired
    };
  });
}

/**
 * تقدير المدة البسيط (عندما لا يوجد Template)
 */
function estimateDuration(quantity: number, unit: string): number {
  // تقديرات بسيطة حسب الوحدة
  const estimations: { [key: string]: number } = {
    'م3': quantity / 20,  // 20 م3 في اليوم
    'م2': quantity / 30,  // 30 م2 في اليوم
    'مط': quantity / 15,  // 15 متر طولي في اليوم
    'طن': quantity / 5,   // 5 طن في اليوم
    'عدد': quantity / 10  // 10 قطع في اليوم
  };
  
  const estimatedDays = estimations[unit] || quantity / 10;
  return Math.max(1, Math.ceil(estimatedDays));
}

/**
 * تحليل مجموعة من البنود
 */
export async function analyzeBOQ(items: FinancialItem[]): Promise<AnalyzedItem[]> {
  console.log(`📊 Analyzing ${items.length} items...`);
  
  const analyzedItems: AnalyzedItem[] = [];
  
  for (const item of items) {
    try {
      const analyzed = await analyzeItem(item);
      analyzedItems.push(analyzed);
    } catch (error) {
      console.error(`❌ Error analyzing item ${item.id}:`, error);
      // إضافة البند بدون تحليل
      analyzedItems.push({
        ...item,
        analysis: {
          detectedActivity: null,
          breakdown: { activities: [], totalDuration: 0, criticalPath: [] },
          labor: { totalWorkers: 0, totalManDays: 0, totalCost: 0, breakdown: {} },
          materials: [],
          sbcCompliance: { applicableCodes: [], requirements: [], compliant: false, notes: ['فشل التحليل'] },
          confidence: 0
        }
      });
    }
  }
  
  console.log(`✅ Analysis complete: ${analyzedItems.length} items analyzed`);
  return analyzedItems;
}
