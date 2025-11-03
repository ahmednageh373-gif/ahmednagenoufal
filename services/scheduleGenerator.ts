/**
 * Schedule Generator Service
 * توليد جدول زمني تلقائي من المقايسة باستخدام CPM
 */

import type { FinancialItem, ScheduleTask } from '../types';

export interface BOQItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface ScheduleGenerationOptions {
  projectStartDate: Date;
  workingDaysPerWeek?: number;
  workingHoursPerDay?: number;
  projectDurationMonths?: number;
  includeBuffers?: boolean;
  bufferPercentage?: number;
}

export interface ActivityDependency {
  activityId: string;
  predecessors: string[];
  type: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-Start, Start-Start, Finish-Finish, Start-Finish
  lag?: number; // in days
}

/**
 * قاعدة بيانات معدلات الإنتاجية القياسية
 * productivity rates per unit per day
 */
const PRODUCTIVITY_RATES: Record<string, { rate: number; unit: string }> = {
  // أعمال الحفر والأساسات
  'حفر': { rate: 50, unit: 'م3/يوم' },
  'ردم': { rate: 100, unit: 'م3/يوم' },
  'خرسانة عادية': { rate: 30, unit: 'م3/يوم' },
  'خرسانة مسلحة': { rate: 20, unit: 'م3/يوم' },
  'حديد تسليح': { rate: 2, unit: 'طن/يوم' },
  
  // أعمال المباني
  'مباني طوب': { rate: 15, unit: 'م2/يوم' },
  'مباني بلوك': { rate: 20, unit: 'م2/يوم' },
  'لياسة': { rate: 40, unit: 'م2/يوم' },
  'بلاط أرضيات': { rate: 30, unit: 'م2/يوم' },
  'بلاط جدران': { rate: 25, unit: 'م2/يوم' },
  
  // أعمال التشطيبات
  'دهانات': { rate: 50, unit: 'م2/يوم' },
  'جبس': { rate: 35, unit: 'م2/يوم' },
  'أسقف معلقة': { rate: 25, unit: 'م2/يوم' },
  'أبواب خشبية': { rate: 2, unit: 'باب/يوم' },
  'نوافذ ألمنيوم': { rate: 3, unit: 'نافذة/يوم' },
  
  // أعمال كهربائية وميكانيكية
  'نقاط كهرباء': { rate: 20, unit: 'نقطة/يوم' },
  'نقاط صحية': { rate: 10, unit: 'نقطة/يوم' },
  'تكييف': { rate: 2, unit: 'وحدة/يوم' },
  
  // Default
  'default': { rate: 10, unit: 'وحدة/يوم' }
};

/**
 * تصنيف البنود حسب مراحل البناء
 */
const CONSTRUCTION_PHASES: Record<string, string[]> = {
  'phase1_excavation': [
    'حفر', 'ردم', 'تسوية', 'دك', 'نقل تراب'
  ],
  'phase2_foundation': [
    'خرسانة عادية', 'خرسانة نظافة', 'قواعد', 'أساسات', 'ميدات'
  ],
  'phase3_structure': [
    'خرسانة مسلحة', 'حديد تسليح', 'أعمدة', 'كمرات', 'بلاطات', 'سقف'
  ],
  'phase4_walls': [
    'مباني', 'طوب', 'بلوك', 'جدران'
  ],
  'phase5_mep_rough': [
    'كهرباء خشن', 'صحي خشن', 'تكييف خشن', 'مواسير', 'تمديدات'
  ],
  'phase6_plastering': [
    'لياسة', 'محارة', 'بياض'
  ],
  'phase7_flooring': [
    'بلاط', 'رخام', 'سيراميك', 'أرضيات', 'بورسلين'
  ],
  'phase8_finishes': [
    'دهانات', 'جبس', 'أسقف معلقة', 'ديكور'
  ],
  'phase9_doors_windows': [
    'أبواب', 'نوافذ', 'شبابيك', 'زجاج'
  ],
  'phase10_mep_final': [
    'كهرباء نهائي', 'صحي نهائي', 'تكييف نهائي', 'إضاءة', 'مفاتيح'
  ],
  'phase11_exterior': [
    'واجهات', 'دهان خارجي', 'حجر', 'كلادينج'
  ],
  'phase12_site_works': [
    'أعمال خارجية', 'مواقف', 'حدائق', 'رصف', 'سور'
  ]
};

/**
 * العلاقات النموذجية بين المراحل
 */
const PHASE_DEPENDENCIES: Record<string, string[]> = {
  'phase2_foundation': ['phase1_excavation'],
  'phase3_structure': ['phase2_foundation'],
  'phase4_walls': ['phase3_structure'],
  'phase5_mep_rough': ['phase4_walls'],
  'phase6_plastering': ['phase5_mep_rough'],
  'phase7_flooring': ['phase6_plastering'],
  'phase8_finishes': ['phase7_flooring'],
  'phase9_doors_windows': ['phase6_plastering'],
  'phase10_mep_final': ['phase8_finishes', 'phase9_doors_windows'],
  'phase11_exterior': ['phase3_structure'],
  'phase12_site_works': ['phase11_exterior']
};

/**
 * تصنيف بند من المقايسة
 */
function classifyBOQItem(description: string): string {
  const desc = description.toLowerCase();
  
  for (const [phase, keywords] of Object.entries(CONSTRUCTION_PHASES)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return phase;
    }
  }
  
  return 'phase8_finishes'; // default phase
}

/**
 * حساب مدة النشاط بناءً على الكمية ومعدل الإنتاجية
 */
function calculateDuration(
  quantity: number,
  description: string,
  workingHoursPerDay: number = 8
): number {
  const desc = description.toLowerCase();
  
  // البحث عن معدل إنتاجية مناسب
  let productivityRate = PRODUCTIVITY_RATES['default'].rate;
  
  for (const [keyword, rateInfo] of Object.entries(PRODUCTIVITY_RATES)) {
    if (desc.includes(keyword)) {
      productivityRate = rateInfo.rate;
      break;
    }
  }
  
  // حساب المدة بالأيام
  const durationDays = Math.ceil(quantity / productivityRate);
  
  // الحد الأدنى يوم واحد، الحد الأقصى 60 يوم لنشاط واحد
  return Math.min(Math.max(durationDays, 1), 60);
}

/**
 * حساب تواريخ البدء والانتهاء
 */
function calculateDates(
  startDate: Date,
  duration: number,
  workingDaysPerWeek: number = 6
): { start: Date; end: Date } {
  const start = new Date(startDate);
  let daysAdded = 0;
  let currentDate = new Date(start);
  
  while (daysAdded < duration) {
    currentDate.setDate(currentDate.getDate() + 1);
    const dayOfWeek = currentDate.getDay();
    
    // Skip Fridays if working 6 days, or Friday+Saturday if working 5 days
    if (workingDaysPerWeek === 6 && dayOfWeek !== 5) {
      daysAdded++;
    } else if (workingDaysPerWeek === 5 && dayOfWeek !== 5 && dayOfWeek !== 6) {
      daysAdded++;
    } else if (workingDaysPerWeek === 7) {
      daysAdded++;
    }
  }
  
  return { start, end: currentDate };
}

/**
 * تجميع البنود حسب المراحل
 */
function groupItemsByPhase(items: BOQItem[]): Map<string, BOQItem[]> {
  const phaseGroups = new Map<string, BOQItem[]>();
  
  items.forEach(item => {
    const phase = classifyBOQItem(item.description);
    if (!phaseGroups.has(phase)) {
      phaseGroups.set(phase, []);
    }
    phaseGroups.get(phase)!.push(item);
  });
  
  return phaseGroups;
}

/**
 * إنشاء نشاط من بند مقايسة
 */
function createTaskFromItem(
  item: BOQItem,
  phase: string,
  startDate: Date,
  options: ScheduleGenerationOptions
): ScheduleTask {
  const duration = calculateDuration(
    item.quantity,
    item.description,
    options.workingHoursPerDay
  );
  
  const dates = calculateDates(
    startDate,
    duration,
    options.workingDaysPerWeek
  );
  
  return {
    id: `task-${item.id}`,
    name: item.description,
    startDate: dates.start.toISOString().split('T')[0],
    endDate: dates.end.toISOString().split('T')[0],
    duration,
    progress: 0,
    status: 'planned',
    assignee: '',
    priority: 'medium',
    dependencies: [],
    phase: phase,
    quantity: item.quantity,
    unit: item.unit,
    cost: item.totalPrice
  };
}

/**
 * حساب المسار الحرج (Critical Path Method)
 */
function calculateCriticalPath(tasks: ScheduleTask[]): string[] {
  // Build dependency graph
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const criticalPath: string[] = [];
  
  // Calculate earliest start/finish
  const earliestStart = new Map<string, number>();
  const earliestFinish = new Map<string, number>();
  
  tasks.forEach(task => {
    const deps = task.dependencies || [];
    if (deps.length === 0) {
      earliestStart.set(task.id, 0);
      earliestFinish.set(task.id, task.duration);
    } else {
      const maxFinish = Math.max(
        ...deps.map(depId => earliestFinish.get(depId) || 0)
      );
      earliestStart.set(task.id, maxFinish);
      earliestFinish.set(task.id, maxFinish + task.duration);
    }
  });
  
  // Find project finish time
  const projectFinish = Math.max(...Array.from(earliestFinish.values()));
  
  // Calculate latest start/finish (backward pass)
  const latestFinish = new Map<string, number>();
  const latestStart = new Map<string, number>();
  
  // Start from end tasks
  tasks.forEach(task => {
    // Find tasks that depend on this task
    const dependents = tasks.filter(t => 
      (t.dependencies || []).includes(task.id)
    );
    
    if (dependents.length === 0) {
      latestFinish.set(task.id, projectFinish);
      latestStart.set(task.id, projectFinish - task.duration);
    }
  });
  
  // Backward pass for other tasks
  tasks.reverse().forEach(task => {
    if (!latestFinish.has(task.id)) {
      const dependents = tasks.filter(t => 
        (t.dependencies || []).includes(task.id)
      );
      const minStart = Math.min(
        ...dependents.map(t => latestStart.get(t.id) || projectFinish)
      );
      latestFinish.set(task.id, minStart);
      latestStart.set(task.id, minStart - task.duration);
    }
  });
  
  // Tasks with zero slack are on critical path
  tasks.forEach(task => {
    const slack = (latestStart.get(task.id) || 0) - (earliestStart.get(task.id) || 0);
    if (slack === 0) {
      criticalPath.push(task.id);
    }
  });
  
  return criticalPath;
}

/**
 * الدالة الرئيسية: توليد جدول زمني من المقايسة
 */
export async function generateScheduleFromBOQ(
  boqItems: FinancialItem[],
  options: ScheduleGenerationOptions
): Promise<ScheduleTask[]> {
  try {
    console.log('🚀 بدء توليد الجدول الزمني من المقايسة...');
    console.log(`📊 عدد البنود: ${boqItems.length}`);
    
    // تحويل FinancialItem إلى BOQItem
    const items: BOQItem[] = boqItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity || 0,
      unit: item.unit || 'وحدة',
      unitPrice: item.unitPrice || 0,
      totalPrice: item.total || 0,
      category: item.category
    }));
    
    // تجميع البنود حسب المراحل
    const phaseGroups = groupItemsByPhase(items);
    console.log(`📦 عدد المراحل: ${phaseGroups.size}`);
    
    const allTasks: ScheduleTask[] = [];
    const phaseTaskIds = new Map<string, string[]>();
    
    let currentStartDate = new Date(options.projectStartDate);
    
    // ترتيب المراحل
    const sortedPhases = Array.from(phaseGroups.keys()).sort();
    
    // إنشاء المهام لكل مرحلة
    for (const phase of sortedPhases) {
      const phaseItems = phaseGroups.get(phase)!;
      const phaseTasks: ScheduleTask[] = [];
      
      // إنشاء مهمة لكل بند
      for (const item of phaseItems) {
        const task = createTaskFromItem(item, phase, currentStartDate, options);
        phaseTasks.push(task);
      }
      
      // حساب تاريخ انتهاء المرحلة
      if (phaseTasks.length > 0) {
        const phaseEndDate = new Date(
          Math.max(...phaseTasks.map(t => new Date(t.endDate).getTime()))
        );
        currentStartDate = new Date(phaseEndDate);
        currentStartDate.setDate(currentStartDate.getDate() + 1);
      }
      
      phaseTaskIds.set(phase, phaseTasks.map(t => t.id));
      allTasks.push(...phaseTasks);
    }
    
    // إضافة العلاقات بين المراحل
    allTasks.forEach(task => {
      const taskPhase = task.phase!;
      const predecessorPhases = PHASE_DEPENDENCIES[taskPhase] || [];
      
      predecessorPhases.forEach(predPhase => {
        const predTaskIds = phaseTaskIds.get(predPhase) || [];
        if (predTaskIds.length > 0) {
          // الاعتماد على آخر مهمة في المرحلة السابقة
          const lastPredTaskId = predTaskIds[predTaskIds.length - 1];
          if (!task.dependencies) {
            task.dependencies = [];
          }
          if (!task.dependencies.includes(lastPredTaskId)) {
            task.dependencies.push(lastPredTaskId);
          }
        }
      });
    });
    
    // حساب المسار الحرج
    const criticalPathIds = calculateCriticalPath(allTasks);
    allTasks.forEach(task => {
      if (criticalPathIds.includes(task.id)) {
        task.isCritical = true;
        task.priority = 'high';
      }
    });
    
    console.log(`✅ تم توليد ${allTasks.length} نشاط`);
    console.log(`🔴 المسار الحرج يحتوي على ${criticalPathIds.length} نشاط`);
    
    return allTasks;
    
  } catch (error) {
    console.error('❌ خطأ في توليد الجدول الزمني:', error);
    throw error;
  }
}

/**
 * توليد ملخص الجدول الزمني
 */
export function generateScheduleSummary(tasks: ScheduleTask[]): {
  totalDuration: number;
  criticalPathDuration: number;
  numberOfActivities: number;
  numberOfCriticalActivities: number;
  estimatedCompletionDate: string;
  phases: { name: string; duration: number; tasks: number }[];
} {
  const criticalTasks = tasks.filter(t => t.isCritical);
  
  const projectStart = new Date(
    Math.min(...tasks.map(t => new Date(t.startDate).getTime()))
  );
  const projectEnd = new Date(
    Math.max(...tasks.map(t => new Date(t.endDate).getTime()))
  );
  
  const totalDuration = Math.ceil(
    (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Group by phase
  const phaseMap = new Map<string, ScheduleTask[]>();
  tasks.forEach(task => {
    const phase = task.phase || 'other';
    if (!phaseMap.has(phase)) {
      phaseMap.set(phase, []);
    }
    phaseMap.get(phase)!.push(task);
  });
  
  const phases = Array.from(phaseMap.entries()).map(([name, phaseTasks]) => {
    const phaseStart = new Date(
      Math.min(...phaseTasks.map(t => new Date(t.startDate).getTime()))
    );
    const phaseEnd = new Date(
      Math.max(...phaseTasks.map(t => new Date(t.endDate).getTime()))
    );
    const duration = Math.ceil(
      (phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return {
      name: name.replace('phase', 'المرحلة ').replace('_', ' '),
      duration,
      tasks: phaseTasks.length
    };
  });
  
  return {
    totalDuration,
    criticalPathDuration: totalDuration,
    numberOfActivities: tasks.length,
    numberOfCriticalActivities: criticalTasks.length,
    estimatedCompletionDate: projectEnd.toISOString().split('T')[0],
    phases
  };
}
