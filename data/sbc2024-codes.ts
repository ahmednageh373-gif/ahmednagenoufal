/**
 * Saudi Building Code 2024 - Complete Requirements
 * كود البناء السعودي 2024 - المتطلبات الكاملة
 */

export interface SBCRequirement {
  id: string;
  code: string;
  title: string;
  titleEn: string;
  category: string;
  description: string;
  requirements: string[];
  checkpoints: {
    id: string;
    description: string;
    mandatory: boolean;
    reference?: string;
  }[];
  penalties?: string;
}

export const SBC_CATEGORIES = [
  { id: 'structural', nameAr: 'الأنظمة الإنشائية', nameEn: 'Structural Systems', code: 'SBC 301' },
  { id: 'fire', nameAr: 'الوقاية من الحريق', nameEn: 'Fire Protection', code: 'SBC 801' },
  { id: 'energy', nameAr: 'كفاءة الطاقة', nameEn: 'Energy Efficiency', code: 'SBC 602' },
  { id: 'plumbing', nameAr: 'السباكة', nameEn: 'Plumbing', code: 'SBC 501' },
  { id: 'electrical', nameAr: 'الكهرباء', nameEn: 'Electrical', code: 'SBC 401' },
  { id: 'mechanical', nameAr: 'الميكانيكا', nameEn: 'Mechanical', code: 'SBC 502' },
  { id: 'accessibility', nameAr: 'إمكانية الوصول', nameEn: 'Accessibility', code: 'SBC 1001' },
  { id: 'envelope', nameAr: 'الغلاف الخارجي', nameEn: 'Building Envelope', code: 'SBC 603' }
];

export const SBC_2024_REQUIREMENTS: SBCRequirement[] = [
  // ===== Structural Requirements (SBC 301) =====
  {
    id: 'struct-001',
    code: 'SBC 301.1',
    title: 'متطلبات الأحمال الحية',
    titleEn: 'Live Load Requirements',
    category: 'structural',
    description: 'الأحمال الحية الدنيا للمباني السكنية والتجارية',
    requirements: [
      'الأحمال الحية للشقق السكنية: 2.0 كيلو نيوتن/م²',
      'الأحمال الحية للممرات والسلالم: 4.8 كيلو نيوتن/م²',
      'الأحمال الحية للمكاتب: 2.4 كيلو نيوتن/م²',
      'الأحمال الحية للمتاجر: 4.8 كيلو نيوتن/م²'
    ],
    checkpoints: [
      { id: 'c1', description: 'التحقق من قيم الأحمال الحية في المخططات', mandatory: true, reference: 'Table 301.5' },
      { id: 'c2', description: 'التأكد من تطبيق معاملات الأمان', mandatory: true },
      { id: 'c3', description: 'فحص حسابات الأحمال', mandatory: true }
    ],
    penalties: 'غرامة 50,000 ريال + إيقاف العمل'
  },
  {
    id: 'struct-002',
    code: 'SBC 301.2',
    title: 'متطلبات الزلازل',
    titleEn: 'Seismic Requirements',
    category: 'structural',
    description: 'تصميم المباني لمقاومة الزلازل حسب المنطقة',
    requirements: [
      'تصنيف المنطقة الزلزالية (A, B, C, D)',
      'معامل الاستجابة الزلزالية R',
      'تفاصيل التسليح الخاصة بالزلازل',
      'متطلبات الوصلات والربط'
    ],
    checkpoints: [
      { id: 'c1', description: 'تحديد فئة الموقع الزلزالي', mandatory: true },
      { id: 'c2', description: 'حساب قوى الزلازل التصميمية', mandatory: true },
      { id: 'c3', description: 'تفاصيل تسليح خاصة في المناطق عالية الزلزالية', mandatory: true }
    ]
  },
  {
    id: 'struct-003',
    code: 'SBC 301.3',
    title: 'متطلبات الخرسانة المسلحة',
    titleEn: 'Reinforced Concrete Requirements',
    category: 'structural',
    description: 'المواصفات الفنية للخرسانة والحديد',
    requirements: [
      'مقاومة الخرسانة الدنيا: 25 ميجا باسكال',
      'الغطاء الخرساني: 40 مم للأساسات، 25 مم للأعمدة',
      'قطر حديد التسليح الأدنى: 10 مم',
      'التباعد الأقصى للحديد: 3 أضعاف سماكة البلاطة'
    ],
    checkpoints: [
      { id: 'c1', description: 'فحص نتائج اختبار الخرسانة', mandatory: true },
      { id: 'c2', description: 'التأكد من الغطاء الخرساني', mandatory: true },
      { id: 'c3', description: 'فحص تفاصيل التسليح', mandatory: true }
    ]
  },

  // ===== Fire Protection (SBC 801) =====
  {
    id: 'fire-001',
    code: 'SBC 801.1',
    title: 'أنظمة الإنذار والإطفاء',
    titleEn: 'Fire Alarm & Suppression Systems',
    category: 'fire',
    description: 'متطلبات أنظمة الكشف والإطفاء',
    requirements: [
      'نظام إنذار حريق تلقائي لكل المباني > 3 أدوار',
      'رشاشات الحريق (Sprinklers) للمباني التجارية',
      'طفايات حريق كل 25 متر',
      'مخارج طوارئ كل 45 متر'
    ],
    checkpoints: [
      { id: 'c1', description: 'فحص شهادة نظام الإنذار', mandatory: true },
      { id: 'c2', description: 'اختبار الرشاشات', mandatory: true },
      { id: 'c3', description: 'التأكد من وضوح مخارج الطوارئ', mandatory: true },
      { id: 'c4', description: 'فحص الطفايات وصلاحيتها', mandatory: true }
    ],
    penalties: 'غرامة 100,000 ريال + إيقاف التشغيل'
  },
  {
    id: 'fire-002',
    code: 'SBC 801.2',
    title: 'مقاومة الحريق للمواد',
    titleEn: 'Fire Resistance Ratings',
    category: 'fire',
    description: 'معدلات مقاومة الحريق للعناصر الإنشائية',
    requirements: [
      'الأعمدة: 2 ساعة للمباني > 4 أدوار',
      'الجدران الحاملة: 2 ساعة',
      'البلاطات: 1.5 ساعة',
      'الجدران الفاصلة: 1 ساعة'
    ],
    checkpoints: [
      { id: 'c1', description: 'شهادات مقاومة الحريق للمواد', mandatory: true },
      { id: 'c2', description: 'سماكات العزل الحراري', mandatory: true }
    ]
  },

  // ===== Energy Efficiency (SBC 602) =====
  {
    id: 'energy-001',
    code: 'SBC 602.1',
    title: 'عزل الجدران الخارجية',
    titleEn: 'External Wall Insulation',
    category: 'energy',
    description: 'متطلبات العزل الحراري للجدران',
    requirements: [
      'معامل الانتقال الحراري U-Value ≤ 0.57 W/m²K',
      'سماكة العزل الدنيا: 50 مم (فوم أو صوف صخري)',
      'تغطية 100% من الجدران الخارجية'
    ],
    checkpoints: [
      { id: 'c1', description: 'قياس U-Value للجدران', mandatory: true },
      { id: 'c2', description: 'فحص سماكة العزل', mandatory: true },
      { id: 'c3', description: 'التأكد من عدم وجود جسور حرارية', mandatory: true }
    ]
  },
  {
    id: 'energy-002',
    code: 'SBC 602.2',
    title: 'عزل الأسقف',
    titleEn: 'Roof Insulation',
    category: 'energy',
    description: 'متطلبات العزل الحراري للأسقف',
    requirements: [
      'U-Value ≤ 0.25 W/m²K',
      'سماكة العزل الدنيا: 100 مم',
      'مواد عاكسة للحرارة (Reflective)'
    ],
    checkpoints: [
      { id: 'c1', description: 'قياس U-Value للسقف', mandatory: true },
      { id: 'c2', description: 'فحص نوع وسماكة العزل', mandatory: true }
    ]
  },
  {
    id: 'energy-003',
    code: 'SBC 602.3',
    title: 'النوافذ والزجاج',
    titleEn: 'Windows & Glazing',
    category: 'energy',
    description: 'مواصفات الزجاج الموفر للطاقة',
    requirements: [
      'زجاج مزدوج (Double Glazing) إلزامي',
      'معامل التظليل SHGC ≤ 0.25',
      'U-Value للنوافذ ≤ 2.5 W/m²K',
      'الحد الأقصى لنسبة النوافذ: 40% من مساحة الواجهة'
    ],
    checkpoints: [
      { id: 'c1', description: 'شهادة الزجاج الموفر', mandatory: true },
      { id: 'c2', description: 'قياس SHGC', mandatory: true },
      { id: 'c3', description: 'حساب نسبة النوافذ', mandatory: true }
    ]
  },

  // ===== Plumbing (SBC 501) =====
  {
    id: 'plumb-001',
    code: 'SBC 501.1',
    title: 'كفاءة استخدام المياه',
    titleEn: 'Water Efficiency',
    category: 'plumbing',
    description: 'أدوات صحية موفرة للمياه',
    requirements: [
      'مراحيض موفرة: 6 لتر/دفقة كحد أقصى',
      'خلاطات موفرة: 6 لتر/دقيقة',
      'رؤوس دش موفرة: 9 لتر/دقيقة',
      'مستشعرات تلقائية للحنفيات العامة'
    ],
    checkpoints: [
      { id: 'c1', description: 'شهادات كفاءة الأدوات الصحية', mandatory: true },
      { id: 'c2', description: 'اختبار معدل التدفق', mandatory: true }
    ]
  },

  // ===== Electrical (SBC 401) =====
  {
    id: 'elec-001',
    code: 'SBC 401.1',
    title: 'التأريض والحماية',
    titleEn: 'Grounding & Protection',
    category: 'electrical',
    description: 'أنظمة التأريض وقواطع الأمان',
    requirements: [
      'نظام تأريض شامل لكل المبنى',
      'قواطع GFCI للحمامات والمطابخ',
      'قواطع AFCI لغرف النوم',
      'مانع صواعق للمباني > 15 متر'
    ],
    checkpoints: [
      { id: 'c1', description: 'اختبار مقاومة التأريض', mandatory: true },
      { id: 'c2', description: 'فحص عمل القواطع', mandatory: true },
      { id: 'c3', description: 'فحص مانع الصواعق', mandatory: false }
    ]
  },

  // ===== Accessibility (SBC 1001) =====
  {
    id: 'access-001',
    code: 'SBC 1001.1',
    title: 'إمكانية الوصول لذوي الاحتياجات',
    titleEn: 'Accessibility for People with Disabilities',
    category: 'accessibility',
    description: 'تسهيلات ذوي الاحتياجات الخاصة',
    requirements: [
      'منحدرات بميل 1:12 كحد أقصى',
      'عرض الممرات: 1.2 متر كحد أدنى',
      'مصعد واحد على الأقل للمباني > 3 أدوار',
      'مواقف مخصصة: 5% من إجمالي المواقف',
      'حمامات مخصصة في الأماكن العامة'
    ],
    checkpoints: [
      { id: 'c1', description: 'قياس ميل المنحدرات', mandatory: true },
      { id: 'c2', description: 'قياس عرض الممرات', mandatory: true },
      { id: 'c3', description: 'عدد المواقف المخصصة', mandatory: true },
      { id: 'c4', description: 'أبعاد الحمامات المخصصة', mandatory: true }
    ]
  }
];

/**
 * تصنيف مستوى الخطورة للمخالفات
 */
export enum ViolationSeverity {
  CRITICAL = 'critical',      // توقف فوري
  HIGH = 'high',              // غرامة كبيرة
  MEDIUM = 'medium',          // غرامة متوسطة
  LOW = 'low'                 // تنبيه
}

export interface ComplianceViolation {
  requirementId: string;
  checkpointId: string;
  severity: ViolationSeverity;
  description: string;
  recommendation: string;
  reference: string;
}

/**
 * دوال مساعدة للتحقق من الامتثال
 */
export function getRequirementsByCategory(category: string): SBCRequirement[] {
  return SBC_2024_REQUIREMENTS.filter(req => req.category === category);
}

export function getRequirementByCode(code: string): SBCRequirement | undefined {
  return SBC_2024_REQUIREMENTS.find(req => req.code === code);
}

export function getAllMandatoryCheckpoints(): { requirement: SBCRequirement; checkpoint: any }[] {
  const mandatory: { requirement: SBCRequirement; checkpoint: any }[] = [];
  
  SBC_2024_REQUIREMENTS.forEach(req => {
    req.checkpoints.forEach(cp => {
      if (cp.mandatory) {
        mandatory.push({ requirement: req, checkpoint: cp });
      }
    });
  });
  
  return mandatory;
}
