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
    activity: 'concrete' | 'steel' | 'formwork' | 'blockwork',
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
      default:
        productivity = PRODUCTIVITY_CONCRETE;
    }
    
    const rate = productivity[conditions];
    return Math.ceil(quantity / rate);
  }

  /**
   * حساب الموارد المطلوبة (العمالة والمعدات)
   * Calculate required resources (labor and equipment)
   */
  static calculateResources(
    quantity: number,
    activity: 'concrete' | 'steel' | 'formwork' | 'blockwork'
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
      }
    };

    // معدات قياسية
    // Standard equipment
    const equipmentRates: Record<string, string[]> = {
      concrete: ['Concrete mixer', 'Vibrator', 'Wheelbarrows'],
      steel: ['Bar bender', 'Bar cutter', 'Tying tools'],
      formwork: ['Saws', 'Drills', 'Scaffolding'],
      blockwork: ['Mixer', 'Scaffolding', 'Hand tools']
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
    material: 'concrete' | 'steel' | 'formwork' | 'blockwork',
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
    material: 'concrete' | 'steel' | 'formwork' | 'blockwork',
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
        blockwork: PRODUCTIVITY_BLOCKWORK
      },
      waste: {
        concrete: WASTE_CONCRETE,
        steel: WASTE_STEEL,
        formwork: WASTE_FORMWORK,
        blockwork: WASTE_BLOCKWORK
      }
    };
  }
}

/**
 * تصدير افتراضي
 */
export default EngineeringStandardsDatabase;
