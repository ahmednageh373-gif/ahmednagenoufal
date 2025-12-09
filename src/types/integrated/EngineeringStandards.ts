/**
 * قاعدة بيانات المعايير الهندسية
 * Engineering Standards Database
 * 
 * يحتوي على:
 * - معايير الكود السعودي (SBC)
 * - معايير ISO
 * - الكود المصري (ECP)
 * - معدلات الإنتاجية
 * - معاملات الهدر
 */

/**
 * معايير الكود السعودي للخرسانة
 * Saudi Building Code for Concrete (SBC 304-2018)
 */
export const SBC_CONCRETE_STANDARDS = {
  code: 'SBC 304-2018',
  requirements: [
    'C25 minimum for structural elements',
    'Slump 75-100mm for normal placement',
    'Maximum water-cement ratio 0.50',
    'Minimum cement content 350 kg/m³'
  ],
  safetyFactor: 1.15,
  allowance: 5, // 5% wastage
  qualityControl: [
    'Cube test every 50m³',
    'Slump test every batch',
    'Temperature monitoring'
  ]
};

/**
 * معايير الكود السعودي للحديد
 * Saudi Building Code for Steel (SBC 304-2018)
 */
export const SBC_STEEL_STANDARDS = {
  code: 'SBC 304-2018',
  requirements: [
    'Grade 60 (420 MPa) minimum',
    'Minimum cover 25mm for beams',
    'Minimum cover 40mm for columns',
    'Lap length 40× bar diameter'
  ],
  safetyFactor: 1.15,
  allowance: 3, // 3% wastage
  qualityControl: [
    'Tensile test per batch',
    'Chemical analysis',
    'Visual inspection'
  ]
};

/**
 * معدلات الإنتاجية للخرسانة
 * Productivity Rates for Concrete
 */
export const PRODUCTIVITY_CONCRETE = {
  optimal: 30,    // m³/day (ideal conditions)
  standard: 25,   // m³/day (normal conditions)
  minimum: 20,    // m³/day (difficult conditions)
  unit: 'm³/day',
  factors: {
    weather: 0.8,  // reduction in bad weather
    height: 0.9,   // reduction for high elevation
    congestion: 0.85 // reduction for congested rebar
  }
};

/**
 * معدلات الإنتاجية لحديد التسليح
 * Productivity Rates for Steel Reinforcement
 */
export const PRODUCTIVITY_STEEL = {
  optimal: 1.5,   // ton/day (ideal conditions)
  standard: 1.2,  // ton/day (normal conditions)
  minimum: 0.8,   // ton/day (difficult conditions)
  unit: 'ton/day',
  factors: {
    diameter: 0.9,     // reduction for large bars
    congestion: 0.8,   // reduction for congested areas
    complexity: 0.85   // reduction for complex shapes
  }
};

/**
 * معدلات الإنتاجية للشدات الخشبية
 * Productivity Rates for Formwork
 */
export const PRODUCTIVITY_FORMWORK = {
  optimal: 20,    // m²/day (ideal conditions)
  standard: 15,   // m²/day (normal conditions)
  minimum: 10,    // m²/day (difficult conditions)
  unit: 'm²/day',
  factors: {
    height: 0.8,      // reduction for high elevation
    complexity: 0.7,  // reduction for complex shapes
    reuse: 1.3        // increase for reusable formwork
  }
};

/**
 * معدلات الإنتاجية للبلوك
 * Productivity Rates for Blockwork
 */
export const PRODUCTIVITY_BLOCKWORK = {
  optimal: 15,    // m²/day (ideal conditions)
  standard: 12,   // m²/day (normal conditions)
  minimum: 8,     // m²/day (difficult conditions)
  unit: 'm²/day',
  factors: {
    height: 0.9,      // reduction for high walls
    openings: 0.85,   // reduction for many openings
    thickness: 0.9    // reduction for thick walls
  }
};

/**
 * معدلات الإنتاجية للياسة (تفصيلي حسب المراحل)
 * Productivity Rates for Plastering (Detailed by stages)
 * 
 * مصدر البيانات: خبرة عملية من الموقع
 * Data source: Actual site experience
 */
export const PRODUCTIVITY_PLASTERING = {
  // المراحل التفصيلية
  stages: {
    // المرحلة 1: تجهيز الطرطشة (رش ماء + أسمنت مقذوف)
    spatterdash: {
      name: 'تجهيز الطرطشة',
      nameEn: 'Spatterdash preparation',
      description: 'رش ماء + أسمنت مقذوف يضمن الترابط',
      productivity: 400,  // m²/day
      unit: 'm²/day',
      crew: {
        skilled: 0,       // لا يحتاج عامل ماهر
        unskilled: 1,     // عامل واحد
        supervisor: 0,
        total: 1,
        description: '1 عامل'
      },
      materials: {
        cement: 0.5,      // kg/m² (تقريبي)
        water: 2,         // liters/m²
        sand: 0           // لا يحتاج رمل
      },
      notes: 'يضمن الترابط بين السطح واللياسة',
      importance: 'critical'  // حرجة لضمان عدم التقشر
    },
    
    // المرحلة 2: البؤج والأوتار
    beacons: {
      name: 'البؤج والأوتار',
      nameEn: 'Beacons and guides',
      description: 'تعليق بؤج أفقية ورأسية كل 1.2 م',
      productivity: 200,  // m²/day
      unit: 'm²/day',
      crew: {
        skilled: 1,       // بيّاض واحد (خبير)
        unskilled: 1,     // مساعد
        supervisor: 0,
        total: 2,
        description: '1 بياض + 1 مساعد'
      },
      materials: {
        cement: 1,        // kg/m² للبؤج
        sand: 2,          // kg/m²
        water: 1          // liters/m²
      },
      spacing: 1.2,       // متر بين البؤج
      notes: 'كل 1.2 م أفقياً ورأسياً لضمان الاستواء',
      importance: 'critical'  // حرجة لدقة السمك والاستواء
    },
    
    // المرحلة 3: اللياسة الرئيسية
    mainPlaster: {
      name: 'اللياسة الرئيسية',
      nameEn: 'Main plastering',
      description: 'مونة 1:4 (أسمنت:رمل) سمك 2 سم',
      productivity: 140,  // m²/day
      unit: 'm²/day',
      crew: {
        skilled: 2,       // بيّاضين
        unskilled: 1,     // عامل مونة
        supervisor: 0,
        total: 3,
        description: '2 بياض + 1 مونة'
      },
      materials: {
        cement: 8,        // kg/m² (لسمك 2 سم)
        sand: 32,         // kg/m² (نسبة 1:4)
        water: 6          // liters/m²
      },
      thickness: 2,       // سم
      mix_ratio: '1:4',   // أسمنت:رمل
      notes: 'سمك 2 سم معياري',
      importance: 'high'
    },
    
    // المرحلة 4: التنعيم والاستواء
    smoothing: {
      name: 'التنعيم والاستواء',
      nameEn: 'Smoothing and leveling',
      description: 'كشط + مستوى مياه قبل التصلب',
      productivity: 200,  // m²/day
      unit: 'm²/day',
      crew: {
        skilled: 1,       // بيّاض واحد
        unskilled: 0,
        supervisor: 0,
        total: 1,
        description: '1 بياض'
      },
      materials: {
        cement: 0.5,      // kg/m² (طبقة رقيقة)
        water: 1          // liters/m²
      },
      timing: 'قبل التصلب',  // مهم جداً!
      notes: 'يجب التنفيذ قبل التصلب الكامل',
      importance: 'high'
    },
    
    // المرحلة 5: التسليم الاستشاري
    consultantInspection: {
      name: 'التسليم الاستشاري',
      nameEn: 'Consultant inspection',
      description: 'فحص الميل – السمك – النعومة',
      productivity: null,  // لا ينطبق (فحص فقط)
      unit: 'inspection',
      crew: {
        skilled: 0,
        unskilled: 0,
        supervisor: 0,
        consultant: 1,    // مهندس استشاري
        total: 1,
        description: 'مهندس الاستشاري'
      },
      checks: [
        'فحص الميل (verticality)',
        'فحص السمك (thickness)',
        'فحص النعومة (smoothness)',
        'فحص الزوايا (corners)',
        'فحص التشققات (cracks)'
      ],
      deliverable: 'Snag list',
      notes: 'يُسجل snag list بالملاحظات',
      importance: 'critical'  // حرجة للقبول النهائي
    }
  },
  
  // الإنتاجية الإجمالية (متوسط لكل المراحل)
  overall: {
    optimal: 180,     // m²/day (ظروف ممتازة)
    standard: 140,    // m²/day (ظروف عادية) - من المرحلة الرئيسية
    minimum: 100,     // m²/day (ظروف صعبة)
    unit: 'm²/day'
  },
  
  // العوامل المؤثرة
  factors: {
    height: 0.85,       // تقليل للارتفاعات العالية
    surface: 0.9,       // تقليل للأسطح غير المستوية
    weather: 0.95,      // تقليل للطقس الحار جداً
    corners: 0.85,      // تقليل للزوايا والتفاصيل
    openings: 0.9       // تقليل للفتحات الكثيرة
  },
  
  // طاقم العمل الإجمالي
  totalCrew: {
    skilled: 2,         // بيّاضين
    unskilled: 1,       // عامل مونة
    supervisor: 0.2,    // مشرف (جزئي)
    total: 3.2
  },
  
  // المواد الإجمالية (لسمك 2 سم)
  totalMaterials: {
    cement: 10,         // kg/m² (جميع المراحل)
    sand: 34,           // kg/m²
    water: 10           // liters/m²
  }
};

/**
 * معاملات الهدر للخرسانة
 * Waste Factors for Concrete
 */
export const WASTE_CONCRETE = {
  minimum: 3,   // % (excellent management)
  standard: 5,  // % (normal practice)
  maximum: 8,   // % (poor management)
  unit: '%'
};

/**
 * معاملات الهدر للحديد
 * Waste Factors for Steel
 */
export const WASTE_STEEL = {
  minimum: 2,   // % (excellent cutting plan)
  standard: 3,  // % (normal practice)
  maximum: 5,   // % (poor management)
  unit: '%'
};

/**
 * معاملات الهدر للشدات
 * Waste Factors for Formwork
 */
export const WASTE_FORMWORK = {
  minimum: 5,    // % (excellent management)
  standard: 10,  // % (normal practice)
  maximum: 15,   // % (poor management)
  unit: '%'
};

/**
 * معاملات الهدر للبلوك
 * Waste Factors for Blockwork
 */
export const WASTE_BLOCKWORK = {
  minimum: 3,   // % (excellent management)
  standard: 5,  // % (normal practice)
  maximum: 8,   // % (poor management)
  unit: '%'
};

/**
 * معاملات الهدر للياسة
 * Waste Factors for Plastering
 */
export const WASTE_PLASTERING = {
  minimum: 5,    // % (إدارة ممتازة، سطح مستوٍ)
  standard: 8,   // % (ممارسة عادية)
  maximum: 12,   // % (سطح غير مستوٍ، إدارة ضعيفة)
  unit: '%',
  factors: {
    surface_condition: {
      excellent: 5,    // سطح مستوٍ تماماً
      good: 7,         // سطح جيد
      poor: 10,        // سطح غير مستوٍ
      very_poor: 15    // سطح سيء جداً
    },
    thickness_variation: {
      uniform: 5,      // سمك موحد 2 سم
      moderate: 8,     // سمك متغير 2-3 سم
      high: 12         // سمك متغير 2-5 سم
    }
  }
};

/**
 * قاعدة بيانات المعايير الهندسية
 * Engineering Standards Database Class
 */
export class EngineeringStandardsDatabase {
  /**
   * الحصول على معيار SBC للخرسانة
   */
  static getSBCConcrete() {
    return SBC_CONCRETE_STANDARDS;
  }

  /**
   * الحصول على معيار SBC للحديد
   */
  static getSBCSteel() {
    return SBC_STEEL_STANDARDS;
  }

  /**
   * حساب المدة المطلوبة لنشاط بناءً على الكمية ومعدل الإنتاجية
   * Calculate duration for an activity based on quantity and productivity
   */
  static calculateDuration(
    quantity: number,
    activity: 'concrete' | 'steel' | 'formwork' | 'blockwork' | 'plastering',
    conditions: 'optimal' | 'standard' | 'minimum' = 'standard'
  ): number {
    let productivity: any;
    
    switch (activity) {
      case 'concrete':
        productivity = PRODUCTIVITY_CONCRETE;
        break;
      case 'steel':
        productivity = PRODUCTIVITY_STEEL;
        break;
      case 'formwork':
        productivity = PRODUCTIVITY_FORMWORK;
        break;
      case 'blockwork':
        productivity = PRODUCTIVITY_BLOCKWORK;
        break;
      case 'plastering':
        productivity = PRODUCTIVITY_PLASTERING.overall;
        break;
      default:
        productivity = PRODUCTIVITY_CONCRETE;
    }
    
    const rate = productivity[conditions];
    return Math.ceil(quantity / rate);
  }
  
  /**
   * حساب مدة اللياسة حسب المراحل (تفصيلي)
   * Calculate plastering duration by stages (detailed)
   */
  static calculatePlasteringDurationByStages(
    quantity: number
  ): {
    stage: string;
    name: string;
    duration: number;
    crew: any;
    productivity: number;
  }[] {
    const stages = PRODUCTIVITY_PLASTERING.stages;
    
    return [
      {
        stage: 'spatterdash',
        name: stages.spatterdash.name,
        duration: Math.ceil(quantity / stages.spatterdash.productivity),
        crew: stages.spatterdash.crew,
        productivity: stages.spatterdash.productivity
      },
      {
        stage: 'beacons',
        name: stages.beacons.name,
        duration: Math.ceil(quantity / stages.beacons.productivity),
        crew: stages.beacons.crew,
        productivity: stages.beacons.productivity
      },
      {
        stage: 'mainPlaster',
        name: stages.mainPlaster.name,
        duration: Math.ceil(quantity / stages.mainPlaster.productivity),
        crew: stages.mainPlaster.crew,
        productivity: stages.mainPlaster.productivity
      },
      {
        stage: 'smoothing',
        name: stages.smoothing.name,
        duration: Math.ceil(quantity / stages.smoothing.productivity),
        crew: stages.smoothing.crew,
        productivity: stages.smoothing.productivity
      },
      {
        stage: 'inspection',
        name: stages.consultantInspection.name,
        duration: 1, // يوم واحد للفحص
        crew: stages.consultantInspection.crew,
        productivity: 0 // فحص فقط
      }
    ];
  }

  /**
   * حساب الموارد المطلوبة (العمالة والمعدات)
   * Calculate required resources (labor and equipment)
   */
  static calculateResources(
    quantity: number,
    activity: 'concrete' | 'steel' | 'formwork' | 'blockwork' | 'plastering'
  ) {
    const duration = this.calculateDuration(quantity, activity);
    
    // معدلات العمالة القياسية
    // Standard labor rates per day
    const laborRates: Record<string, any> = {
      concrete: {
        skilled: 2,      // 2 skilled workers (mason)
        unskilled: 4,    // 4 laborers
        supervisor: 0.5  // 0.5 supervisor (part-time)
      },
      steel: {
        skilled: 3,      // 3 steel fixers
        unskilled: 2,    // 2 helpers
        supervisor: 0.3  // 0.3 supervisor
      },
      formwork: {
        skilled: 3,      // 3 carpenters
        unskilled: 2,    // 2 helpers
        supervisor: 0.3  // 0.3 supervisor
      },
      blockwork: {
        skilled: 2,      // 2 masons
        unskilled: 2,    // 2 laborers
        supervisor: 0.2  // 0.2 supervisor
      },
      plastering: {
        skilled: 2,      // 2 بيّاضين (plasters)
        unskilled: 1,    // 1 عامل مونة (mortar worker)
        supervisor: 0.2, // 0.2 مشرف
        description: '2 بياض + 1 مونة'
      }
    };

    // معدات قياسية
    // Standard equipment
    const equipmentRates: Record<string, string[]> = {
      concrete: ['Concrete mixer', 'Vibrator', 'Wheelbarrows'],
      steel: ['Bar bender', 'Bar cutter', 'Tying tools'],
      formwork: ['Saws', 'Drills', 'Scaffolding'],
      blockwork: ['Mixer', 'Scaffolding', 'Hand tools'],
      plastering: ['Mixer', 'Scaffolding', 'Trowels', 'Leveling tools', 'Water level']
    };

    return {
      labor: laborRates[activity] || laborRates.concrete,
      equipment: equipmentRates[activity] || equipmentRates.concrete,
      duration
    };
  }

  /**
   * الحصول على معامل الهدر لمادة معينة
   * Get waste factor for a material
   */
  static getWasteFactor(
    material: 'concrete' | 'steel' | 'formwork' | 'blockwork' | 'plastering',
    level: 'minimum' | 'standard' | 'maximum' = 'standard'
  ): number {
    let wasteFactor: any;
    
    switch (material) {
      case 'concrete':
        wasteFactor = WASTE_CONCRETE;
        break;
      case 'steel':
        wasteFactor = WASTE_STEEL;
        break;
      case 'formwork':
        wasteFactor = WASTE_FORMWORK;
        break;
      case 'blockwork':
        wasteFactor = WASTE_BLOCKWORK;
        break;
      case 'plastering':
        wasteFactor = WASTE_PLASTERING;
        break;
      default:
        wasteFactor = WASTE_CONCRETE;
    }
    
    return wasteFactor[level];
  }

  /**
   * حساب الكمية مع الهدر
   * Calculate quantity including wastage
   */
  static calculateQuantityWithWaste(
    baseQuantity: number,
    material: 'concrete' | 'steel' | 'formwork' | 'blockwork' | 'plastering',
    wasteLevel: 'minimum' | 'standard' | 'maximum' = 'standard'
  ): number {
    const wasteFactor = this.getWasteFactor(material, wasteLevel);
    return baseQuantity * (1 + wasteFactor / 100);
  }

  /**
   * التحقق من الامتثال للكود السعودي
   * Check SBC compliance
   */
  static checkSBCCompliance(
    material: 'concrete' | 'steel',
    parameters: Record<string, any>
  ): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    if (material === 'concrete') {
      const standards = SBC_CONCRETE_STANDARDS;
      
      if (parameters.strength < 25) {
        violations.push('Concrete strength below minimum (C25)');
        recommendations.push('Increase concrete grade to C25 or higher');
      }
      
      if (parameters.wcRatio > 0.50) {
        violations.push('Water-cement ratio exceeds maximum (0.50)');
        recommendations.push('Reduce water content or increase cement');
      }
      
      if (parameters.slump < 75 || parameters.slump > 100) {
        recommendations.push('Slump outside typical range (75-100mm)');
      }
    } else if (material === 'steel') {
      const standards = SBC_STEEL_STANDARDS;
      
      if (parameters.grade < 60) {
        violations.push('Steel grade below minimum (Grade 60)');
        recommendations.push('Use Grade 60 (420 MPa) or higher');
      }
      
      if (parameters.cover < 25 && parameters.element === 'beam') {
        violations.push('Concrete cover insufficient for beams (min 25mm)');
        recommendations.push('Increase concrete cover to 25mm minimum');
      }
      
      if (parameters.cover < 40 && parameters.element === 'column') {
        violations.push('Concrete cover insufficient for columns (min 40mm)');
        recommendations.push('Increase concrete cover to 40mm minimum');
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  /**
   * الحصول على جميع المعايير كملخص
   * Get all standards as summary
   */
  static getAllStandards() {
    return {
      concrete: SBC_CONCRETE_STANDARDS,
      steel: SBC_STEEL_STANDARDS,
      productivity: {
        concrete: PRODUCTIVITY_CONCRETE,
        steel: PRODUCTIVITY_STEEL,
        formwork: PRODUCTIVITY_FORMWORK,
        blockwork: PRODUCTIVITY_BLOCKWORK,
        plastering: PRODUCTIVITY_PLASTERING
      },
      waste: {
        concrete: WASTE_CONCRETE,
        steel: WASTE_STEEL,
        formwork: WASTE_FORMWORK,
        blockwork: WASTE_BLOCKWORK,
        plastering: WASTE_PLASTERING
      }
    };
  }
  
  /**
   * الحصول على تفاصيل مراحل اللياسة
   * Get plastering stages details
   */
  static getPlasteringStages() {
    return PRODUCTIVITY_PLASTERING.stages;
  }
  
  /**
   * حساب تكلفة اللياسة الكاملة
   * Calculate complete plastering cost
   */
  static calculatePlasteringCost(
    area: number, // m²
    laborRates: {
      skilled: number,    // ريال/يوم للبيّاض
      unskilled: number,  // ريال/يوم للعامل
      consultant: number  // ريال/يوم للمهندس
    },
    materialPrices: {
      cement: number,     // ريال/kg
      sand: number,       // ريال/kg
      water: number       // ريال/liter
    }
  ): {
    stages: any[];
    totalDuration: number;
    totalLaborCost: number;
    totalMaterialCost: number;
    totalCost: number;
  } {
    const stages = this.calculatePlasteringDurationByStages(area);
    const plasteringData = PRODUCTIVITY_PLASTERING;
    
    let totalDuration = 0;
    let totalLaborCost = 0;
    let totalMaterialCost = 0;
    
    const stageDetails = stages.map((stage, index) => {
      const stageKey = stage.stage as keyof typeof plasteringData.stages;
      const stageData = plasteringData.stages[stageKey];
      
      // حساب تكلفة العمالة
      let laborCost = 0;
      if (stage.crew.skilled) {
        laborCost += stage.crew.skilled * laborRates.skilled * stage.duration;
      }
      if (stage.crew.unskilled) {
        laborCost += stage.crew.unskilled * laborRates.unskilled * stage.duration;
      }
      if (stage.crew.consultant) {
        laborCost += stage.crew.consultant * laborRates.consultant * stage.duration;
      }
      
      // حساب تكلفة المواد
      let materialCost = 0;
      if ('materials' in stageData && stageData.materials) {
        const materials = stageData.materials as any;
        materialCost = (
          (materials.cement || 0) * area * materialPrices.cement +
          (materials.sand || 0) * area * materialPrices.sand +
          (materials.water || 0) * area * materialPrices.water
        );
      }
      
      totalDuration += stage.duration;
      totalLaborCost += laborCost;
      totalMaterialCost += materialCost;
      
      return {
        ...stage,
        laborCost,
        materialCost,
        totalCost: laborCost + materialCost
      };
    });
    
    return {
      stages: stageDetails,
      totalDuration,
      totalLaborCost,
      totalMaterialCost,
      totalCost: totalLaborCost + totalMaterialCost
    };
  }
}

/**
 * تصدير افتراضي
 */
export default EngineeringStandardsDatabase;
