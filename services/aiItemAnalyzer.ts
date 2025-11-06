/**
 * AI-Powered Item Analyzer
 * يحلل بنود المقايسة ذكياً ويقسمها لأنشطة
 */

import type { FinancialItem } from '../types';
import { constructionActivitiesDB, findMatchingActivity, type ActivityTemplate, type SubActivity } from '../data/construction-activities-db';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  try {
    // محاولة استخدام Gemini AI
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.warn('⚠️ Gemini API key not found, using fallback analysis');
      return fallbackAnalysis(item);
    }
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
أنت خبير في إدارة مشاريع الإنشاءات السعودية. حلل البند التالي من المقايسة:

**البند**: ${item.description}
**الكمية**: ${item.quantity} ${item.unit}
**الفئة**: ${item.category || 'غير محدد'}

المطلوب:
1. تحديد نوع النشاط الإنشائي (حفر، خرسانة عادية، خرسانة مسلحة، مباني، تشطيبات، إلخ)
2. تقسيم البند إلى أنشطة فرعية بالتسلسل (مثال: خرسانة مسلحة → نجارة، حدادة، صب، معالجة)
3. تقدير عدد العمال المطلوبين لكل نشاط والتخصص (نجار، حداد، عامل عادي، إلخ)
4. تقدير إنتاجية كل عامل باليوم
5. تقدير مدة كل نشاط بالأيام
6. تحديد المواد المطلوبة مع نسبة الهدر
7. تحديد أكواد SBC السعودية المطبقة
8. طريقة التنفيذ حسب الكود السعودي

أعطني الإجابة بصيغة JSON مع المفاتيح التالية:
{
  "activityType": "نوع النشاط",
  "activities": [
    {
      "name": "اسم النشاط الفرعي",
      "sequence": 1,
      "duration": عدد_الأيام,
      "workers": [
        {
          "role": "التخصص",
          "count": العدد,
          "productivity": الإنتاجية_باليوم,
          "dailyCost": التكلفة_اليومية
        }
      ]
    }
  ],
  "materials": [
    {
      "name": "اسم المادة",
      "quantityPer": الكمية_للوحدة,
      "unit": "الوحدة",
      "wastePercentage": نسبة_الهدر
    }
  ],
  "sbcCodes": ["SBC-301", "SBC-302"],
  "executionMethod": "طريقة التنفيذ باختصار",
  "confidence": نسبة_الثقة_من_100
}
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // محاولة استخراج JSON من الاستجابة
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ Could not extract JSON from Gemini response, using fallback');
      return fallbackAnalysis(item);
    }
    
    const aiAnalysis = JSON.parse(jsonMatch[0]);
    
    // تحويل استجابة Gemini إلى التنسيق المطلوب
    const breakdown: ItemBreakdown = {
      activities: [],
      totalDuration: 0,
      criticalPath: []
    };
    
    let currentOffset = 0;
    for (const activity of aiAnalysis.activities || []) {
      const activityId = `${item.id}-activity-${activity.sequence}`;
      const workers = activity.workers.map((w: any) => ({
        role: w.role,
        count: w.count,
        productivity: w.productivity,
        dailyCost: w.dailyCost || 150,
        totalCost: w.count * (w.dailyCost || 150) * activity.duration,
        workingDays: activity.duration
      }));
      
      breakdown.activities.push({
        id: activityId,
        name: activity.name,
        description: `${activity.name} - ${item.description}`,
        sequence: activity.sequence,
        duration: activity.duration,
        startOffset: currentOffset,
        workers,
        productivity: {
          rate: activity.workers[0]?.productivity || 10,
          unit: item.unit,
          perDay: activity.workers[0]?.productivity || 10
        },
        dependencies: activity.sequence > 1 ? [`${item.id}-activity-${activity.sequence - 1}`] : [],
        isCritical: activity.sequence === 1
      });
      
      if (breakdown.activities[breakdown.activities.length - 1].isCritical) {
        breakdown.criticalPath.push(activityId);
      }
      
      currentOffset += activity.duration;
    }
    
    breakdown.totalDuration = currentOffset;
    
    // تحليل العمالة
    const labor = analyzeLaborRequirements(breakdown.activities);
    
    // تحليل المواد
    const materials: MaterialAnalysis[] = (aiAnalysis.materials || []).map((material: any) => {
      const baseQuantity = material.quantityPer * item.quantity;
      const wastage = baseQuantity * (material.wastePercentage / 100);
      return {
        name: material.name,
        quantity: baseQuantity,
        unit: material.unit,
        wastage,
        totalRequired: baseQuantity + wastage
      };
    });
    
    // SBC Compliance
    const sbcCompliance: SBCCheck = {
      applicableCodes: aiAnalysis.sbcCodes || [],
      requirements: [aiAnalysis.executionMethod || 'يجب مراجعة الكود السعودي'],
      compliant: true,
      notes: ['تم التحليل باستخدام Gemini AI']
    };
    
    return {
      ...item,
      analysis: {
        detectedActivity: null,
        breakdown,
        labor,
        materials,
        sbcCompliance,
        confidence: aiAnalysis.confidence || 75
      }
    };
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    return fallbackAnalysis(item);
  }
}

/**
 * تحليل احتياطي عند فشل Gemini
 */
function fallbackAnalysis(item: FinancialItem): AnalyzedItem {
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
        notes: ['يجب مراجعة الكود السعودي يدوياً - تحليل بسيط']
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
