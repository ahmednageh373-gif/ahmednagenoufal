/**
 * قاعدة بيانات الأنشطة الإنشائية والإنتاجيات
 * Construction Activities Database with Labor Productivity Rates
 */

export interface ActivityTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  keywords: string[]; // للتعرف على البند
  subActivities: SubActivity[];
  materials: MaterialRequirement[];
  sbcReferences: string[];
  executionMethod: string;
}

export interface SubActivity {
  id: string;
  name: string;
  sequence: number; // ترتيب التنفيذ
  duration: number; // أيام لكل وحدة
  workers: LaborRequirement[];
  productivity: number; // الإنتاجية (وحدة/يوم)
  unit: string;
  dependencies: string[]; // أنشطة يجب إتمامها قبل هذا النشاط
}

export interface LaborRequirement {
  role: string; // مهندس، مشرف، نجار، حداد، عامل
  count: number;
  productivity: number; // إنتاجية الفرد (وحدة/يوم)
  dailyCost: number; // التكلفة اليومية (ريال)
}

export interface MaterialRequirement {
  name: string;
  quantityPer: number; // كمية لكل وحدة من البند الرئيسي
  unit: string;
  wastePercentage: number; // نسبة الهدر
}

// =====================================================
// 1. أعمال الحفر
// =====================================================
export const excavationActivities: ActivityTemplate[] = [
  {
    id: 'exc-001',
    nameAr: 'حفر وتسوية',
    nameEn: 'Excavation and Leveling',
    category: 'excavation',
    keywords: ['حفر', 'excavation', 'dig', 'تسوية', 'leveling', 'حفريات'],
    subActivities: [
      {
        id: 'exc-001-01',
        name: 'نقل معدات وتجهيز الموقع',
        sequence: 1,
        duration: 0.5,
        workers: [
          { role: 'مشرف', count: 1, productivity: 1000, dailyCost: 300 },
          { role: 'عامل', count: 4, productivity: 250, dailyCost: 150 }
        ],
        productivity: 1000,
        unit: 'م3',
        dependencies: []
      },
      {
        id: 'exc-001-02',
        name: 'حفر ميكانيكي',
        sequence: 2,
        duration: 1,
        workers: [
          { role: 'مشغل حفارة', count: 1, productivity: 200, dailyCost: 400 },
          { role: 'مساعد', count: 2, productivity: 100, dailyCost: 150 }
        ],
        productivity: 200,
        unit: 'م3',
        dependencies: ['exc-001-01']
      },
      {
        id: 'exc-001-03',
        name: 'تسوية وضغط',
        sequence: 3,
        duration: 0.5,
        workers: [
          { role: 'مشغل كمبريسور', count: 1, productivity: 300, dailyCost: 350 },
          { role: 'عامل', count: 3, productivity: 100, dailyCost: 150 }
        ],
        productivity: 300,
        unit: 'م3',
        dependencies: ['exc-001-02']
      }
    ],
    materials: [
      { name: 'وقود معدات', quantityPer: 5, unit: 'لتر', wastePercentage: 0 },
      { name: 'رمل للردم', quantityPer: 0.3, unit: 'م3', wastePercentage: 10 }
    ],
    sbcReferences: ['SBC 301.1', 'SBC 301.2'],
    executionMethod: 'يتم الحفر ميكانيكياً بواسطة حفارة مع مراعاة منسوب الحفر حسب المخططات'
  }
];

// =====================================================
// 2. أعمال الخرسانة العادية
// =====================================================
export const plainConcreteActivities: ActivityTemplate[] = [
  {
    id: 'con-plain-001',
    nameAr: 'خرسانة عادية للأساسات',
    nameEn: 'Plain Concrete for Foundations',
    category: 'concrete',
    keywords: ['خرسانة عادية', 'plain concrete', 'نظافة', 'blinding', 'أساسات'],
    subActivities: [
      {
        id: 'con-plain-001-01',
        name: 'تجهيز وتنظيف الموقع',
        sequence: 1,
        duration: 0.2,
        workers: [
          { role: 'عامل', count: 4, productivity: 100, dailyCost: 150 }
        ],
        productivity: 100,
        unit: 'م3',
        dependencies: []
      },
      {
        id: 'con-plain-001-02',
        name: 'صب الخرسانة',
        sequence: 2,
        duration: 0.5,
        workers: [
          { role: 'مشرف صب', count: 1, productivity: 40, dailyCost: 300 },
          { role: 'عامل', count: 6, productivity: 8, dailyCost: 150 }
        ],
        productivity: 40,
        unit: 'م3',
        dependencies: ['con-plain-001-01']
      },
      {
        id: 'con-plain-001-03',
        name: 'تسوية وتشطيب',
        sequence: 3,
        duration: 0.3,
        workers: [
          { role: 'عامل تشطيب', count: 3, productivity: 50, dailyCost: 180 }
        ],
        productivity: 50,
        unit: 'م3',
        dependencies: ['con-plain-001-02']
      }
    ],
    materials: [
      { name: 'خرسانة جاهزة', quantityPer: 1.05, unit: 'م3', wastePercentage: 5 }
    ],
    sbcReferences: ['SBC 304', 'SBC 304.1'],
    executionMethod: 'صب خرسانة عادية بدرجة 150 كجم/سم2 بسمك حسب المخططات'
  }
];

// =====================================================
// 3. أعمال الخرسانة المسلحة
// =====================================================
export const reinforcedConcreteActivities: ActivityTemplate[] = [
  {
    id: 'con-rc-001',
    nameAr: 'خرسانة مسلحة للأعمدة',
    nameEn: 'Reinforced Concrete Columns',
    category: 'concrete',
    keywords: ['أعمدة', 'columns', 'خرسانة مسلحة', 'reinforced'],
    subActivities: [
      {
        id: 'con-rc-001-01',
        name: 'نجارة (تخشيب)',
        sequence: 1,
        duration: 2,
        workers: [
          { role: 'نجار', count: 4, productivity: 3, dailyCost: 250 },
          { role: 'مساعد نجار', count: 4, productivity: 3, dailyCost: 150 }
        ],
        productivity: 3,
        unit: 'م3',
        dependencies: []
      },
      {
        id: 'con-rc-001-02',
        name: 'حدادة (تسليح)',
        sequence: 2,
        duration: 2,
        workers: [
          { role: 'حداد', count: 3, productivity: 150, dailyCost: 250 },
          { role: 'مساعد حداد', count: 3, productivity: 150, dailyCost: 150 }
        ],
        productivity: 150,
        unit: 'كجم',
        dependencies: ['con-rc-001-01']
      },
      {
        id: 'con-rc-001-03',
        name: 'صب الخرسانة',
        sequence: 3,
        duration: 1,
        workers: [
          { role: 'مشرف صب', count: 1, productivity: 20, dailyCost: 300 },
          { role: 'عامل', count: 6, productivity: 4, dailyCost: 150 }
        ],
        productivity: 20,
        unit: 'م3',
        dependencies: ['con-rc-001-02']
      },
      {
        id: 'con-rc-001-04',
        name: 'معالجة',
        sequence: 4,
        duration: 7,
        workers: [
          { role: 'عامل', count: 1, productivity: 100, dailyCost: 150 }
        ],
        productivity: 100,
        unit: 'م2',
        dependencies: ['con-rc-001-03']
      }
    ],
    materials: [
      { name: 'خرسانة جاهزة', quantityPer: 1.05, unit: 'م3', wastePercentage: 5 },
      { name: 'حديد تسليح', quantityPer: 120, unit: 'كجم', wastePercentage: 8 },
      { name: 'خشب بليود', quantityPer: 6, unit: 'لوح', wastePercentage: 15 },
      { name: 'مواد معالجة', quantityPer: 2, unit: 'كجم', wastePercentage: 5 }
    ],
    sbcReferences: ['SBC 304', 'SBC 304.2', 'SBC 304.3'],
    executionMethod: 'خرسانة مسلحة بدرجة 30 نيوتن/مم2 مع حديد تسليح حسب المخططات'
  },
  {
    id: 'con-rc-002',
    nameAr: 'خرسانة مسلحة للبلاطات',
    nameEn: 'Reinforced Concrete Slabs',
    category: 'concrete',
    keywords: ['بلاطة', 'slab', 'سقف', 'بلاطات', 'خرسانة مسلحة'],
    subActivities: [
      {
        id: 'con-rc-002-01',
        name: 'نجارة (فرم)',
        sequence: 1,
        duration: 3,
        workers: [
          { role: 'نجار', count: 6, productivity: 15, dailyCost: 250 },
          { role: 'مساعد نجار', count: 6, productivity: 15, dailyCost: 150 }
        ],
        productivity: 15,
        unit: 'م2',
        dependencies: []
      },
      {
        id: 'con-rc-002-02',
        name: 'حدادة (تسليح)',
        sequence: 2,
        duration: 2,
        workers: [
          { role: 'حداد', count: 4, productivity: 200, dailyCost: 250 },
          { role: 'مساعد حداد', count: 4, productivity: 200, dailyCost: 150 }
        ],
        productivity: 200,
        unit: 'كجم',
        dependencies: ['con-rc-002-01']
      },
      {
        id: 'con-rc-002-03',
        name: 'صب الخرسانة',
        sequence: 3,
        duration: 1,
        workers: [
          { role: 'مشرف صب', count: 1, productivity: 50, dailyCost: 300 },
          { role: 'عامل', count: 10, productivity: 5, dailyCost: 150 }
        ],
        productivity: 50,
        unit: 'م3',
        dependencies: ['con-rc-002-02']
      },
      {
        id: 'con-rc-002-04',
        name: 'معالجة',
        sequence: 4,
        duration: 14,
        workers: [
          { role: 'عامل', count: 2, productivity: 200, dailyCost: 150 }
        ],
        productivity: 200,
        unit: 'م2',
        dependencies: ['con-rc-002-03']
      }
    ],
    materials: [
      { name: 'خرسانة جاهزة', quantityPer: 1.05, unit: 'م3', wastePercentage: 5 },
      { name: 'حديد تسليح', quantityPer: 100, unit: 'كجم', wastePercentage: 8 },
      { name: 'خشب بليود', quantityPer: 1.2, unit: 'لوح', wastePercentage: 15 },
      { name: 'مواد معالجة', quantityPer: 3, unit: 'كجم', wastePercentage: 5 }
    ],
    sbcReferences: ['SBC 304', 'SBC 304.4'],
    executionMethod: 'بلاطة خرسانة مسلحة بسمك حسب المخططات الإنشائية'
  }
];

// =====================================================
// 4. أعمال المباني
// =====================================================
export const masonryActivities: ActivityTemplate[] = [
  {
    id: 'mas-001',
    nameAr: 'مباني طوب أحمر',
    nameEn: 'Red Brick Masonry',
    category: 'masonry',
    keywords: ['مباني', 'طوب', 'brick', 'masonry', 'أحمر', 'جدار', 'جدران'],
    subActivities: [
      {
        id: 'mas-001-01',
        name: 'بناء بالطوب',
        sequence: 1,
        duration: 1,
        workers: [
          { role: 'بناء', count: 4, productivity: 8, dailyCost: 250 },
          { role: 'مساعد', count: 4, productivity: 8, dailyCost: 150 }
        ],
        productivity: 8,
        unit: 'م2',
        dependencies: []
      },
      {
        id: 'mas-001-02',
        name: 'لياسة (مونة)',
        sequence: 2,
        duration: 1,
        workers: [
          { role: 'ملياس', count: 3, productivity: 12, dailyCost: 230 },
          { role: 'مساعد', count: 3, productivity: 12, dailyCost: 150 }
        ],
        productivity: 12,
        unit: 'م2',
        dependencies: ['mas-001-01']
      }
    ],
    materials: [
      { name: 'طوب أحمر', quantityPer: 70, unit: 'طوبة', wastePercentage: 5 },
      { name: 'أسمنت', quantityPer: 20, unit: 'كجم', wastePercentage: 3 },
      { name: 'رمل', quantityPer: 0.03, unit: 'م3', wastePercentage: 5 }
    ],
    sbcReferences: ['SBC 306'],
    executionMethod: 'بناء بالطوب الأحمر مع مونة أسمنتية حسب المواصفات'
  }
];

// =====================================================
// 5. أعمال التشطيبات
// =====================================================
export const finishingActivities: ActivityTemplate[] = [
  {
    id: 'fin-001',
    nameAr: 'بلاط أرضيات',
    nameEn: 'Floor Tiles',
    category: 'finishing',
    keywords: ['بلاط', 'tiles', 'أرضيات', 'flooring', 'سيراميك', 'رخام'],
    subActivities: [
      {
        id: 'fin-001-01',
        name: 'تجهيز الأرضية',
        sequence: 1,
        duration: 0.5,
        workers: [
          { role: 'عامل', count: 4, productivity: 40, dailyCost: 150 }
        ],
        productivity: 40,
        unit: 'م2',
        dependencies: []
      },
      {
        id: 'fin-001-02',
        name: 'تركيب البلاط',
        sequence: 2,
        duration: 1.5,
        workers: [
          { role: 'بلاط', count: 3, productivity: 15, dailyCost: 280 },
          { role: 'مساعد', count: 3, productivity: 15, dailyCost: 150 }
        ],
        productivity: 15,
        unit: 'م2',
        dependencies: ['fin-001-01']
      },
      {
        id: 'fin-001-03',
        name: 'سقية وتنظيف',
        sequence: 3,
        duration: 0.5,
        workers: [
          { role: 'عامل', count: 2, productivity: 50, dailyCost: 150 }
        ],
        productivity: 50,
        unit: 'م2',
        dependencies: ['fin-001-02']
      }
    ],
    materials: [
      { name: 'بلاط', quantityPer: 1.1, unit: 'م2', wastePercentage: 10 },
      { name: 'أسمنت أبيض', quantityPer: 5, unit: 'كجم', wastePercentage: 5 },
      { name: 'مادة لاصقة', quantityPer: 3, unit: 'كجم', wastePercentage: 5 }
    ],
    sbcReferences: ['SBC 306.5'],
    executionMethod: 'تركيب بلاط بمواد لاصقة حسب المواصفات'
  }
];

// =====================================================
// Database الرئيسية
// =====================================================
export const constructionActivitiesDB: ActivityTemplate[] = [
  ...excavationActivities,
  ...plainConcreteActivities,
  ...reinforcedConcreteActivities,
  ...masonryActivities,
  ...finishingActivities
];

// دالة للبحث عن النشاط المناسب للبند
export function findMatchingActivity(itemDescription: string): ActivityTemplate | null {
  const desc = itemDescription.toLowerCase();
  
  for (const activity of constructionActivitiesDB) {
    for (const keyword of activity.keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        return activity;
      }
    }
  }
  
  return null;
}
