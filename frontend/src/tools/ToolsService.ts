/**
 * 🛠️ أكواد جاهزة: أول 10 أدوات أساسية
 * Ready Code: First 10 Essential Tools
 * 
 * التاريخ: 4 نوفمبر 2025
 * الحالة: أكواد جاهزة للاستخدام الفوري
 */

// ============================================================================
// 1. أنواع البيانات
// ============================================================================

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  inputs: ToolInput[];
}

export interface ToolInput {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  executionTime: number;
}

// ============================================================================
// 2. الأداة 1: Converter (تحويل الوحدات)
// ============================================================================

export class ConverterTool {
  static readonly toolId = 'converter';
  static readonly toolName = 'محول الوحدات';
  static readonly toolDescription = 'تحويل الوحدات الهندسية المختلفة';

  private static readonly conversions: Record<string, Record<string, number>> = {
    // الطول
    'm_ft': 3.28084,
    'ft_m': 0.3048,
    'm_cm': 100,
    'cm_m': 0.01,
    'm_in': 39.3701,
    'in_m': 0.0254,
    'ft_in': 12,
    'in_ft': 1 / 12,
    
    // المساحة
    'm2_ft2': 10.7639,
    'ft2_m2': 0.092903,
    'm2_ha': 0.0001,
    'ha_m2': 10000,
    
    // الحجم
    'm3_ft3': 35.3147,
    'ft3_m3': 0.0283168,
    'm3_l': 1000,
    'l_m3': 0.001,
    
    // الوزن
    'kg_lb': 2.20462,
    'lb_kg': 0.453592,
    'ton_kg': 1000,
    'kg_ton': 0.001,
    'ton_lb': 2204.62,
    'lb_ton': 0.000453592,
    
    // الضغط
    'pa_bar': 0.00001,
    'bar_pa': 100000,
    'pa_psi': 0.000145038,
    'psi_pa': 6894.76
  };

  static convert(value: number, fromUnit: string, toUnit: string): number {
    if (value < 0) {
      throw new Error('القيمة يجب أن تكون موجبة');
    }

    if (!fromUnit || !toUnit) {
      throw new Error('يجب تحديد الوحدات');
    }

    const key = `${fromUnit}_${toUnit}`;
    const factor = this.conversions[key];

    if (!factor) {
      throw new Error(`تحويل غير مدعوم: ${fromUnit} إلى ${toUnit}`);
    }

    const result = value * factor;

    if (!isFinite(result)) {
      throw new Error('خطأ في حساب التحويل');
    }

    return Math.round(result * 10000) / 10000;
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'value',
        label: 'القيمة',
        type: 'number',
        required: true,
        placeholder: 'أدخل القيمة'
      },
      {
        name: 'fromUnit',
        label: 'من',
        type: 'select',
        required: true,
        options: ['m', 'ft', 'cm', 'in', 'm2', 'ft2', 'ha', 'm3', 'ft3', 'l', 'kg', 'lb', 'ton', 'pa', 'bar', 'psi']
      },
      {
        name: 'toUnit',
        label: 'إلى',
        type: 'select',
        required: true,
        options: ['m', 'ft', 'cm', 'in', 'm2', 'ft2', 'ha', 'm3', 'ft3', 'l', 'kg', 'lb', 'ton', 'pa', 'bar', 'psi']
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = this.convert(inputs.value, inputs.fromUnit, inputs.toUnit);

      return {
        success: true,
        data: {
          value: inputs.value,
          fromUnit: inputs.fromUnit,
          toUnit: inputs.toUnit,
          result,
          formula: `${inputs.value} ${inputs.fromUnit} = ${result} ${inputs.toUnit}`
        },
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

// ============================================================================
// 3. الأداة 2: Load Calculator (حاسبة الأحمال)
// ============================================================================

export interface LoadInput {
  area: number;
  height: number;
  floorCount: number;
  buildingType: 'residential' | 'commercial' | 'industrial';
  location: 'coastal' | 'inland' | 'mountainous';
  windSpeed?: number;
  seismicZone?: number;
}

export interface LoadOutput {
  deadLoad: number;
  liveLoad: number;
  windLoad: number;
  seismicLoad: number;
  totalLoad: number;
  loadPerSquareMeter: number;
  safetyFactor: number;
}

export class LoadCalculatorTool {
  static readonly toolId = 'load_calculator';
  static readonly toolName = 'حاسبة الأحمال';
  static readonly toolDescription = 'حساب الأحمال على العناصر الإنشائية';

  private static readonly liveLoadFactors: Record<string, number> = {
    residential: 2.0,
    commercial: 2.5,
    industrial: 5.0
  };

  private static readonly deadLoadFactors: Record<string, number> = {
    residential: 5.0,
    commercial: 6.0,
    industrial: 7.0
  };

  private static readonly windLoadFactors: Record<string, number> = {
    coastal: 1.5,
    inland: 1.0,
    mountainous: 1.2
  };

  private static readonly seismicLoadFactors: Record<number, number> = {
    1: 0.05,
    2: 0.1,
    3: 0.15,
    4: 0.2
  };

  static calculate(input: LoadInput): LoadOutput {
    if (input.area <= 0 || input.height <= 0 || input.floorCount <= 0) {
      throw new Error('جميع القيم يجب أن تكون موجبة');
    }

    // حساب الأحمال
    const deadLoad = input.area * this.deadLoadFactors[input.buildingType];
    const liveLoad = input.area * this.liveLoadFactors[input.buildingType];
    
    // حمل الرياح
    const windSpeed = input.windSpeed || 100;
    const windPressure = 0.613 * Math.pow(windSpeed / 3.6, 2);
    const windLoad = (windPressure / 1000) * input.area * this.windLoadFactors[input.location];
    
    // حمل الزلازل
    const totalWeight = (deadLoad + liveLoad) * input.floorCount;
    const seismicFactor = this.seismicLoadFactors[input.seismicZone || 1];
    const seismicLoad = totalWeight * seismicFactor;
    
    // الحمل الإجمالي
    const totalLoad = deadLoad + liveLoad + windLoad + seismicLoad;
    const loadPerSquareMeter = totalLoad / input.area;

    return {
      deadLoad: Math.round(deadLoad * 100) / 100,
      liveLoad: Math.round(liveLoad * 100) / 100,
      windLoad: Math.round(windLoad * 100) / 100,
      seismicLoad: Math.round(seismicLoad * 100) / 100,
      totalLoad: Math.round(totalLoad * 100) / 100,
      loadPerSquareMeter: Math.round(loadPerSquareMeter * 100) / 100,
      safetyFactor: 1.5
    };
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'area',
        label: 'المساحة (متر²)',
        type: 'number',
        required: true,
        placeholder: '1000'
      },
      {
        name: 'height',
        label: 'الارتفاع (متر)',
        type: 'number',
        required: true,
        placeholder: '12'
      },
      {
        name: 'floorCount',
        label: 'عدد الطوابق',
        type: 'number',
        required: true,
        placeholder: '4'
      },
      {
        name: 'buildingType',
        label: 'نوع المبنى',
        type: 'select',
        required: true,
        options: ['residential', 'commercial', 'industrial']
      },
      {
        name: 'location',
        label: 'الموقع',
        type: 'select',
        required: true,
        options: ['coastal', 'inland', 'mountainous']
      },
      {
        name: 'windSpeed',
        label: 'سرعة الرياح (كم/س)',
        type: 'number',
        required: false,
        placeholder: '100'
      },
      {
        name: 'seismicZone',
        label: 'منطقة زلزالية',
        type: 'select',
        required: false,
        options: ['1', '2', '3', '4']
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = this.calculate({
        area: inputs.area,
        height: inputs.height,
        floorCount: inputs.floorCount,
        buildingType: inputs.buildingType,
        location: inputs.location,
        windSpeed: inputs.windSpeed,
        seismicZone: inputs.seismicZone
      });

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

// ============================================================================
// 4. الأدوات الأخرى (3-10)
// ============================================================================

export class VolumeAreaTool {
  static readonly toolId = 'volume_area';
  static readonly toolName = 'حساب الحجم والمساحة';
  static readonly toolDescription = 'حساب مساحة وحجم الأشكال الهندسية';

  static calculateArea(shape: string, dimensions: Record<string, number>): number {
    switch (shape.toLowerCase()) {
      case 'rectangle':
        return dimensions.length * dimensions.width;
      case 'circle':
        return Math.PI * Math.pow(dimensions.radius, 2);
      case 'triangle':
        return (dimensions.base * dimensions.height) / 2;
      case 'trapezoid':
        return ((dimensions.base1 + dimensions.base2) * dimensions.height) / 2;
      default:
        throw new Error(`شكل غير معروف: ${shape}`);
    }
  }

  static calculateVolume(shape: string, dimensions: Record<string, number>): number {
    switch (shape.toLowerCase()) {
      case 'rectangular':
        return dimensions.length * dimensions.width * dimensions.height;
      case 'cylinder':
        return Math.PI * Math.pow(dimensions.radius, 2) * dimensions.height;
      case 'sphere':
        return (4 / 3) * Math.PI * Math.pow(dimensions.radius, 3);
      case 'cone':
        return (1 / 3) * Math.PI * Math.pow(dimensions.radius, 2) * dimensions.height;
      default:
        throw new Error(`شكل غير معروف: ${shape}`);
    }
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'calculationType',
        label: 'نوع الحساب',
        type: 'select',
        required: true,
        options: ['area', 'volume']
      },
      {
        name: 'shape',
        label: 'الشكل',
        type: 'select',
        required: true,
        options: ['rectangle', 'circle', 'triangle', 'trapezoid', 'rectangular', 'cylinder', 'sphere', 'cone']
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = inputs.calculationType === 'area'
        ? this.calculateArea(inputs.shape, inputs.dimensions)
        : this.calculateVolume(inputs.shape, inputs.dimensions);

      return {
        success: true,
        data: {
          calculationType: inputs.calculationType,
          shape: inputs.shape,
          dimensions: inputs.dimensions,
          result
        },
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

export class BuildingEstimatorTool {
  static readonly toolId = 'building_estimator';
  static readonly toolName = 'مقدر المباني';
  static readonly toolDescription = 'تقدير تكلفة المباني';

  static estimate(area: number, height: number, quality: 'basic' | 'standard' | 'premium' = 'standard'): Record<string, any> {
    const qualityFactors: Record<string, number> = {
      basic: 0.8,
      standard: 1.0,
      premium: 1.3
    };

    const factor = qualityFactors[quality];

    const materials = {
      concrete: area * height * 0.3 * factor,
      steel: area * height * 0.01 * factor,
      bricks: area * 400 * factor,
      sand: area * height * 0.2 * factor,
      cement: area * height * 0.05 * factor
    };

    const unitPrices = {
      concrete: 300,
      steel: 15000,
      bricks: 1,
      sand: 100,
      cement: 500
    };

    const costs = {
      concreteCost: materials.concrete * unitPrices.concrete,
      steelCost: materials.steel * unitPrices.steel,
      bricksCost: materials.bricks * unitPrices.bricks,
      sandCost: materials.sand * unitPrices.sand,
      cementCost: materials.cement * unitPrices.cement
    };

    const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

    return {
      materials,
      costs,
      totalCost,
      costPerSquareMeter: totalCost / area,
      laborCost: totalCost * 0.2,
      totalProjectCost: totalCost + (totalCost * 0.2)
    };
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'area',
        label: 'المساحة (متر²)',
        type: 'number',
        required: true,
        placeholder: '500'
      },
      {
        name: 'height',
        label: 'الارتفاع (متر)',
        type: 'number',
        required: true,
        placeholder: '12'
      },
      {
        name: 'quality',
        label: 'جودة البناء',
        type: 'select',
        required: true,
        options: ['basic', 'standard', 'premium']
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = this.estimate(inputs.area, inputs.height, inputs.quality);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

export class SteelWeightTool {
  static readonly toolId = 'steel_weight';
  static readonly toolName = 'وزن الحديد';
  static readonly toolDescription = 'حساب وزن حديد التسليح';

  static calculate(diameter: number, length: number): number {
    return (Math.pow(diameter, 2) / 162) * length;
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'diameter',
        label: 'القطر (مم)',
        type: 'number',
        required: true,
        placeholder: '16'
      },
      {
        name: 'length',
        label: 'الطول (متر)',
        type: 'number',
        required: true,
        placeholder: '12'
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = this.calculate(inputs.diameter, inputs.length);

      return {
        success: true,
        data: {
          diameter: inputs.diameter,
          length: inputs.length,
          weight: Math.round(result * 100) / 100,
          unit: 'كجم'
        },
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

export class CuttingLengthTool {
  static readonly toolId = 'cutting_length';
  static readonly toolName = 'طول القطع';
  static readonly toolDescription = 'حساب طول القطع للحديد';

  static calculate(spanLength: number, cover: number, diameter: number): number {
    const bendLength = diameter * 10;
    return spanLength + (2 * cover) + (2 * bendLength);
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'spanLength',
        label: 'طول البحر (متر)',
        type: 'number',
        required: true,
        placeholder: '6'
      },
      {
        name: 'cover',
        label: 'الغطاء (سم)',
        type: 'number',
        required: true,
        placeholder: '5'
      },
      {
        name: 'diameter',
        label: 'القطر (مم)',
        type: 'number',
        required: true,
        placeholder: '16'
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = this.calculate(inputs.spanLength, inputs.cover, inputs.diameter);

      return {
        success: true,
        data: {
          spanLength: inputs.spanLength,
          cover: inputs.cover,
          diameter: inputs.diameter,
          cuttingLength: Math.round(result * 100) / 100,
          unit: 'متر'
        },
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

export class RateAnalysisTool {
  static readonly toolId = 'rate_analysis';
  static readonly toolName = 'تحليل الأسعار';
  static readonly toolDescription = 'تحليل أسعار بنود الأعمال';

  static analyze(quantity: number, unitPrice: number, laborPct: number = 0.15): Record<string, number> {
    const totalAmount = quantity * unitPrice;
    const equipmentPct = 0.15;
    const materialPct = 1 - laborPct - equipmentPct;

    return {
      quantity,
      unitPrice,
      totalAmount,
      materialCost: totalAmount * materialPct,
      laborCost: totalAmount * laborPct,
      equipmentCost: totalAmount * equipmentPct
    };
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'quantity',
        label: 'الكمية',
        type: 'number',
        required: true,
        placeholder: '100'
      },
      {
        name: 'unitPrice',
        label: 'سعر الوحدة',
        type: 'number',
        required: true,
        placeholder: '150'
      },
      {
        name: 'laborPct',
        label: 'نسبة العمالة (%)',
        type: 'number',
        required: false,
        placeholder: '15'
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const laborPct = inputs.laborPct ? inputs.laborPct / 100 : 0.15;
      const result = this.analyze(inputs.quantity, inputs.unitPrice, laborPct);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

export class BOQMakerTool {
  static readonly toolId = 'boq_maker';
  static readonly toolName = 'مولد BOQ';
  static readonly toolDescription = 'إنشاء جدول الكميات';

  static generate(items: Array<{ description: string; unit: string; quantity: number; rate: number }>): Record<string, any> {
    const boqItems = items.map((item, index) => ({
      itemNo: index + 1,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate
    }));

    const subtotal = boqItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    const contingency = subtotal * 0.05;

    return {
      items: boqItems,
      subtotal,
      tax,
      total,
      contingency,
      finalTotal: total + contingency
    };
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'items',
        label: 'بنود الأعمال',
        type: 'text',
        required: true,
        placeholder: 'JSON array of items'
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const items = JSON.parse(inputs.items);
      const result = this.generate(items);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

export class StructuralAnalysisTool {
  static readonly toolId = 'structural_analysis';
  static readonly toolName = 'التحليل الإنشائي';
  static readonly toolDescription = 'تحليل الإجهادات والانحرافات';

  static analyze(totalLoad: number): Record<string, any> {
    return {
      totalLoad,
      stresses: {
        bending: totalLoad * 0.6,
        shear: totalLoad * 0.3,
        torsion: totalLoad * 0.1
      },
      deflection: totalLoad * 0.001,
      safetyFactor: 1.5
    };
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'totalLoad',
        label: 'الحمل الإجمالي (كيلونيوتن)',
        type: 'number',
        required: true,
        placeholder: '1000'
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = this.analyze(inputs.totalLoad);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

export class SoilMechanicsTool {
  static readonly toolId = 'soil_mechanics';
  static readonly toolName = 'ميكانيكا التربة';
  static readonly toolDescription = 'حساب قدرة تحمل التربة';

  static analyze(unitWeight: number, depth: number, frictionAngle: number, cohesion: number): Record<string, number> {
    const effectiveStress = unitWeight * depth;
    const frictionRad = (frictionAngle * Math.PI) / 180;
    const shearStrength = cohesion + (effectiveStress * Math.tan(frictionRad));

    return {
      unitWeight,
      depth,
      frictionAngle,
      cohesion,
      effectiveStress: Math.round(effectiveStress * 100) / 100,
      shearStrength: Math.round(shearStrength * 100) / 100,
      bearingCapacity: Math.round(shearStrength * 3 * 100) / 100
    };
  }

  static getInputs(): ToolInput[] {
    return [
      {
        name: 'unitWeight',
        label: 'الوزن النوعي (كن/م³)',
        type: 'number',
        required: true,
        placeholder: '18'
      },
      {
        name: 'depth',
        label: 'العمق (متر)',
        type: 'number',
        required: true,
        placeholder: '2'
      },
      {
        name: 'frictionAngle',
        label: 'زاوية الاحتكاك (درجة)',
        type: 'number',
        required: true,
        placeholder: '30'
      },
      {
        name: 'cohesion',
        label: 'التماسك (كن/م²)',
        type: 'number',
        required: true,
        placeholder: '10'
      }
    ];
  }

  static execute(inputs: Record<string, any>): ToolResult {
    const startTime = Date.now();

    try {
      const result = this.analyze(inputs.unitWeight, inputs.depth, inputs.frictionAngle, inputs.cohesion);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };
    }
  }
}

// ============================================================================
// 5. خدمة إدارة الأدوات
// ============================================================================

export class ToolsService {
  private static readonly tools = [
    ConverterTool,
    LoadCalculatorTool,
    VolumeAreaTool,
    BuildingEstimatorTool,
    SteelWeightTool,
    CuttingLengthTool,
    RateAnalysisTool,
    BOQMakerTool,
    StructuralAnalysisTool,
    SoilMechanicsTool
  ];

  static getTools(): Array<{ id: string; name: string; description: string }> {
    return this.tools.map(tool => ({
      id: (tool as any).toolId,
      name: (tool as any).toolName,
      description: (tool as any).toolDescription || ''
    }));
  }

  static getTool(toolId: string): any {
    return this.tools.find(tool => (tool as any).toolId === toolId);
  }

  static executeTool(toolId: string, inputs: Record<string, any>): ToolResult {
    const tool = this.getTool(toolId);

    if (!tool) {
      return {
        success: false,
        error: `أداة غير معروفة: ${toolId}`,
        timestamp: new Date(),
        executionTime: 0
      };
    }

    return (tool as any).execute(inputs);
  }

  static getToolInputs(toolId: string): ToolInput[] {
    const tool = this.getTool(toolId);

    if (!tool) {
      return [];
    }

    return (tool as any).getInputs ? (tool as any).getInputs() : [];
  }
}

export default ToolsService;
