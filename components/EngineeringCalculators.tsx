import React, { useState } from 'react';
import { Calculator, Ruler, Building2, Columns, Mountain, Brain, Zap, Shield, TrendingUp, Box, Activity, DollarSign, Clock, Layers } from 'lucide-react';

// ==================== TYPES ====================
interface CalculatorInput {
  id: string;
  label: string;
  labelEn?: string;
  unit?: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string;
  placeholder?: string;
  tooltip?: string;
  options?: { value: any; label: string }[];
}

interface CalculatorResult {
  label: string;
  value: string | number;
  unit: string;
  highlight?: boolean;
}

interface ComplianceCheck {
  isOk: boolean;
  message: string;
}

interface CalculatorDefinition {
  id: string;
  name: string;
  nameEn: string;
  icon: JSX.Element;
  description: string;
  category: 'structural' | 'site' | 'cost';
  inputs: CalculatorInput[];
  calculate: (inputs: Record<string, number>) => {
    results: CalculatorResult[];
    compliance: ComplianceCheck[];
    recommendations: string[];
  };
}

// ==================== FORMULAS ====================
const StructuralFormulas = {
  // الأعمدة - Columns
  shortColumnCapacity: (Ag: number, fc: number, Ast: number, fy: number) => {
    return 0.8 * (0.85 * fc * (Ag - Ast) + fy * Ast) / 1000;
  },

  slendernessRatio: (L: number, r: number) => {
    return L / r;
  },

  // الكمرات - Beams
  beamMomentCapacity: (b: number, d: number, As: number, fc: number, fy: number) => {
    const a = (As * fy) / (0.85 * fc * b);
    return 0.9 * As * fy * (d - a / 2) / 1e6; // kN.m
  },

  beamShearCapacity: (b: number, d: number, fc: number) => {
    return 0.17 * Math.sqrt(fc) * b * d / 1000; // kN
  },

  beamDeflection: (M: number, L: number, E: number, I: number) => {
    // Simple beam with center load: δ = (M * L²) / (8 * E * I)
    return (M * Math.pow(L * 1000, 2)) / (8 * E * I * 1e9); // mm
  },

  // البلاطات - Slabs
  slabMinThickness: (Lx: number, Ly: number, support: string) => {
    const ratio = Ly / Lx;
    if (support === 'two-way') {
      // Two-way slab
      return Math.max(Lx * 1000 / 35, 120); // mm
    } else {
      // One-way slab
      return Math.max(Lx * 1000 / 28, 100); // mm
    }
  },

  slabLoadCapacity: (t: number, fc: number, fy: number, Lx: number) => {
    // Simplified uniform load capacity
    const d = t - 20; // effective depth
    const As_min = 0.0018 * 1000 * t; // minimum steel
    const Mu = StructuralFormulas.beamMomentCapacity(1000, d, As_min, fc, fy);
    return (8 * Mu) / Math.pow(Lx, 2); // kN/m²
  },

  // التسليح - Reinforcement
  steelWeight: (diameter: number, length: number) => {
    return (Math.pow(diameter, 2) / 162) * length; // kg
  },

  steelArea: (diameter: number, count: number) => {
    return count * Math.PI * Math.pow(diameter / 2, 2); // mm²
  },

  requiredSteelArea: (M: number, fc: number, fy: number, b: number, d: number) => {
    // Simplified: As = M / (0.9 * fy * 0.9 * d)
    return (M * 1e6) / (0.9 * fy * 0.9 * d); // mm²
  }
};

const SiteFormulas = {
  // حساب الخرسانة
  concreteVolume: (width: number, length: number, depth: number) => {
    return (width * length * depth) / 1000000; // m³
  },

  concreteCost: (volume: number, pricePerM3: number, wastage: number = 5) => {
    return volume * pricePerM3 * (1 + wastage / 100); // SAR
  },

  // حساب الحديد
  totalSteelWeight: (items: Array<{ diameter: number; length: number; quantity: number }>) => {
    return items.reduce((total, item) => {
      return total + StructuralFormulas.steelWeight(item.diameter, item.length) * item.quantity;
    }, 0);
  },

  // معدل الإنتاجية
  productivityRate: (work: number, time: number, workers: number) => {
    return work / (time * workers); // unit per worker per day
  }
};

const SBCCompliance = {
  checkColumnDimensions: (width: number, depth: number): ComplianceCheck => {
    const minDimension = 200;
    const isOk = width >= minDimension && depth >= minDimension;
    return {
      isOk,
      message: isOk 
        ? `✓ الأبعاد مطابقة لـ SBC 304 (>= ${minDimension} mm)`
        : `✗ الأبعاد يجب ألا تقل عن ${minDimension} mm حسب SBC 304`
    };
  },

  checkSteelRatio: (ratio: number): ComplianceCheck => {
    const isOk = ratio >= 1 && ratio <= 4;
    return {
      isOk,
      message: isOk
        ? `✓ نسبة التسليح مطابقة (1% - 4%)`
        : `✗ نسبة التسليح يجب أن تكون بين 1% و 4%`
    };
  },

  checkBeamDimensions: (width: number, depth: number): ComplianceCheck => {
    const minWidth = 200;
    const minDepth = 300;
    const isOk = width >= minWidth && depth >= minDepth;
    return {
      isOk,
      message: isOk
        ? `✓ أبعاد الكمرة مطابقة لـ SBC 304`
        : `✗ الأبعاد: عرض >= ${minWidth}mm، عمق >= ${minDepth}mm`
    };
  },

  checkSlabThickness: (thickness: number, span: number): ComplianceCheck => {
    const minThickness = Math.max(span * 1000 / 35, 120);
    const isOk = thickness >= minThickness;
    return {
      isOk,
      message: isOk
        ? `✓ سماكة البلاطة مطابقة لـ SBC 304`
        : `✗ السماكة يجب ألا تقل عن ${minThickness.toFixed(0)}mm`
    };
  }
};

// ==================== CALCULATORS DATA ====================
const calculators: CalculatorDefinition[] = [
  // 1. حاسبة الأعمدة القصيرة
  {
    id: 'short-column',
    name: '🏛️ حاسبة الأعمدة القصيرة',
    nameEn: 'Short Column Calculator',
    icon: <Columns className="w-6 h-6" />,
    description: 'تصميم الأعمدة القصيرة حسب SBC 304 مع حساب السعة المحورية',
    category: 'structural',
    inputs: [
      {
        id: 'width',
        label: 'عرض العمود (b)',
        labelEn: 'Column Width',
        unit: 'mm',
        type: 'number',
        min: 200,
        max: 1000,
        step: 50,
        defaultValue: 300,
        tooltip: 'الحد الأدنى 200 مم حسب SBC 304'
      },
      {
        id: 'depth',
        label: 'عمق العمود (h)',
        labelEn: 'Column Depth',
        unit: 'mm',
        type: 'number',
        min: 200,
        max: 1000,
        step: 50,
        defaultValue: 300
      },
      {
        id: 'axialLoad',
        label: 'الحمل المحوري (P)',
        labelEn: 'Axial Load',
        unit: 'kN',
        type: 'number',
        min: 0,
        max: 10000,
        step: 10,
        defaultValue: 1000
      },
      {
        id: 'concreteStrength',
        label: 'مقاومة الخرسانة (f\'c)',
        labelEn: 'Concrete Strength',
        unit: 'MPa',
        type: 'number',
        min: 20,
        max: 50,
        step: 5,
        defaultValue: 30
      },
      {
        id: 'steelYield',
        label: 'إجهاد الحديد (fy)',
        labelEn: 'Steel Yield',
        unit: 'MPa',
        type: 'number',
        min: 280,
        max: 500,
        step: 20,
        defaultValue: 420
      },
      {
        id: 'steelRatio',
        label: 'نسبة التسليح (ρ)',
        labelEn: 'Steel Ratio',
        unit: '%',
        type: 'number',
        min: 1,
        max: 4,
        step: 0.1,
        defaultValue: 2,
        tooltip: 'SBC: 1% ≤ ρ ≤ 4%'
      },
      {
        id: 'columnHeight',
        label: 'ارتفاع العمود (L)',
        labelEn: 'Column Height',
        unit: 'm',
        type: 'number',
        min: 2,
        max: 20,
        step: 0.5,
        defaultValue: 3.5
      }
    ],
    calculate: (inputs: Record<string, number>) => {
      const { width, depth, axialLoad, concreteStrength, steelYield, steelRatio, columnHeight } = inputs;
      
      const b = width / 1000;
      const h = depth / 1000;
      const P = axialLoad;
      const fc = concreteStrength;
      const fy = steelYield;
      const rho = steelRatio / 100;
      const L = columnHeight;

      const area = b * h;
      const Ag = area * 1e6;
      const steelArea = Ag * rho;
      
      const capacity = StructuralFormulas.shortColumnCapacity(Ag, fc, steelArea, fy);
      
      const r = Math.min(width, depth) / Math.sqrt(12);
      const slenderness = StructuralFormulas.slendernessRatio(L * 1000, r);
      
      const minimumMoment = P * Math.max(0.015 + 0.03 * h, 0.03);
      const numberOfBars = Math.ceil(steelArea / (Math.PI * Math.pow(20, 2) / 4));
      const stirrupSpacing = Math.min(16 * 20, 48 * 10, Math.min(width, depth), 300);
      
      const concreteVolume = area * L;
      const steelWeight = (steelArea * L * 7850 / 1e6);
      const totalCost = (concreteVolume * 350) + (steelWeight * 3500);

      const dimensionCheck = SBCCompliance.checkColumnDimensions(width, depth);
      const steelRatioCheck = SBCCompliance.checkSteelRatio(steelRatio);
      const slendernessCheck = {
        isOk: slenderness < 22,
        message: slenderness < 22 ? '✓ عمود قصير (Short Column)' : '✗ عمود نحيف - يحتاج تحليل خاص'
      };
      const capacityCheck = {
        isOk: capacity >= P,
        message: capacity >= P 
          ? `✓ القطاع آمن - الاستخدام ${(P / capacity * 100).toFixed(1)}%`
          : '✗ القطاع غير كافٍ'
      };

      const recommendations: string[] = [];
      if (!dimensionCheck.isOk) recommendations.push('⚠ زد أبعاد القطاع إلى 200 مم على الأقل');
      if (!slendernessCheck.isOk) recommendations.push('⚠ العمود نحيف - يحتاج تحليل درجة ثانية');
      if (!steelRatioCheck.isOk) recommendations.push('⚠ نسبة التسليح خارج الحدود');
      if (!capacityCheck.isOk) recommendations.push('✗ القطاع غير كافٍ - زد الأبعاد');
      if (recommendations.length === 0) {
        recommendations.push('✓ التصميم يحقق جميع متطلبات SBC 304');
      }

      return {
        results: [
          { label: 'مساحة القطاع (Ag)', value: Ag.toFixed(0), unit: 'mm²' },
          { label: 'السعة المحورية (Pn)', value: capacity.toFixed(0), unit: 'kN', highlight: true },
          { label: 'نسبة النحافة (λ)', value: slenderness.toFixed(1), unit: '' },
          { label: 'نسبة الاستخدام', value: (P / capacity * 100).toFixed(1), unit: '%', highlight: true },
          { label: 'مساحة الحديد', value: steelArea.toFixed(0), unit: 'mm²' },
          { label: 'عدد الأسياخ (⌀20)', value: numberOfBars.toString(), unit: 'سيخ' },
          { label: 'تباعد الكانات', value: stirrupSpacing.toFixed(0), unit: 'mm' },
          { label: 'العزم الإضافي', value: minimumMoment.toFixed(2), unit: 'kN.m' },
          { label: 'حجم الخرسانة', value: concreteVolume.toFixed(3), unit: 'm³' },
          { label: 'وزن الحديد', value: steelWeight.toFixed(3), unit: 'طن' },
          { label: 'التكلفة التقديرية', value: totalCost.toFixed(0), unit: 'ريال', highlight: true }
        ],
        compliance: [dimensionCheck, slendernessCheck, steelRatioCheck, capacityCheck],
        recommendations
      };
    }
  },

  // 2. حاسبة الكمرات
  {
    id: 'beam-design',
    name: '📏 حاسبة تصميم الكمرات',
    nameEn: 'Beam Design Calculator',
    icon: <Ruler className="w-6 h-6" />,
    description: 'تصميم الكمرات الخرسانية - حساب العزم والقص والترخيم',
    category: 'structural',
    inputs: [
      {
        id: 'beamWidth',
        label: 'عرض الكمرة (b)',
        unit: 'mm',
        type: 'number',
        min: 200,
        max: 800,
        step: 50,
        defaultValue: 300,
        tooltip: 'الحد الأدنى 200 مم'
      },
      {
        id: 'beamDepth',
        label: 'عمق الكمرة (h)',
        unit: 'mm',
        type: 'number',
        min: 300,
        max: 1500,
        step: 50,
        defaultValue: 600
      },
      {
        id: 'beamSpan',
        label: 'البحر (L)',
        unit: 'm',
        type: 'number',
        min: 2,
        max: 15,
        step: 0.5,
        defaultValue: 6
      },
      {
        id: 'appliedMoment',
        label: 'العزم المطلوب (Mu)',
        unit: 'kN.m',
        type: 'number',
        min: 0,
        max: 1000,
        step: 10,
        defaultValue: 200
      },
      {
        id: 'appliedShear',
        label: 'قوة القص (Vu)',
        unit: 'kN',
        type: 'number',
        min: 0,
        max: 500,
        step: 10,
        defaultValue: 100
      },
      {
        id: 'fc',
        label: 'مقاومة الخرسانة (f\'c)',
        unit: 'MPa',
        type: 'number',
        min: 20,
        max: 50,
        step: 5,
        defaultValue: 30
      },
      {
        id: 'fy',
        label: 'إجهاد الحديد (fy)',
        unit: 'MPa',
        type: 'number',
        min: 280,
        max: 500,
        step: 20,
        defaultValue: 420
      }
    ],
    calculate: (inputs) => {
      const { beamWidth, beamDepth, beamSpan, appliedMoment, appliedShear, fc, fy } = inputs;
      
      const b = beamWidth;
      const h = beamDepth;
      const d = h - 50; // effective depth
      const L = beamSpan;
      const Mu = appliedMoment;
      const Vu = appliedShear;

      // حساب مساحة الحديد المطلوبة
      const As_req = StructuralFormulas.requiredSteelArea(Mu, fc, fy, b, d);
      const As_min = Math.max(0.25 * Math.sqrt(fc) / fy * b * d, 1.4 * b * d / fy);
      const As_provided = Math.max(As_req, As_min);

      // عدد الأسياخ
      const barDiameter = 25; // mm
      const barArea = Math.PI * Math.pow(barDiameter / 2, 2);
      const numberOfBars = Math.ceil(As_provided / barArea);
      const actualAs = numberOfBars * barArea;

      // حساب سعة العزم
      const Mn = StructuralFormulas.beamMomentCapacity(b, d, actualAs, fc, fy);
      
      // حساب سعة القص
      const Vc = StructuralFormulas.beamShearCapacity(b, d, fc);
      
      // حساب الكانات
      const stirrupSpacing = Vu > Vc ? Math.min(d / 2, 300) : Math.min(d / 2, 600);
      
      // حساب الترخيم (تبسيط)
      const E = 4700 * Math.sqrt(fc); // MPa
      const I = b * Math.pow(h, 3) / 12; // mm⁴
      const deflection = StructuralFormulas.beamDeflection(Mu, L, E, I);
      const allowableDeflection = (L * 1000) / 250; // L/250

      // الكميات والتكاليف
      const volume = (b * h * L * 1000) / 1e9; // m³
      const steelWeight = StructuralFormulas.steelWeight(barDiameter, L * 1000) * numberOfBars / 1000; // ton
      const stirrupWeight = 0.222 * (2 * (b + h) / 1000) * (L * 1000 / stirrupSpacing); // kg
      const totalSteelWeight = steelWeight + stirrupWeight / 1000;
      const cost = volume * 350 + totalSteelWeight * 3500;

      // الامتثال
      const dimensionCheck = SBCCompliance.checkBeamDimensions(b, h);
      const momentCheck = {
        isOk: Mn >= Mu,
        message: Mn >= Mu
          ? `✓ سعة العزم كافية - الاستخدام ${(Mu / Mn * 100).toFixed(1)}%`
          : `✗ سعة العزم غير كافية`
      };
      const shearCheck = {
        isOk: Vc >= Vu / 0.75,
        message: Vc >= Vu / 0.75
          ? `✓ الخرسانة تحمل القص`
          : `⚠ تحتاج كانات إضافية`
      };
      const deflectionCheck = {
        isOk: deflection <= allowableDeflection,
        message: deflection <= allowableDeflection
          ? `✓ الترخيم ضمن الحدود المسموحة`
          : `✗ الترخيم كبير - زد عمق الكمرة`
      };

      const recommendations: string[] = [];
      if (!dimensionCheck.isOk) recommendations.push('⚠ راجع أبعاد الكمرة حسب SBC 304');
      if (!momentCheck.isOk) recommendations.push('✗ زد مساحة الحديد أو أبعاد القطاع');
      if (!shearCheck.isOk) recommendations.push('⚠ قلل تباعد الكانات');
      if (!deflectionCheck.isOk) recommendations.push('⚠ زد عمق الكمرة أو قلل البحر');
      if (recommendations.length === 0) {
        recommendations.push('✓ التصميم آمن ومطابق للمواصفات');
      }

      return {
        results: [
          { label: 'مساحة الحديد المطلوبة', value: As_req.toFixed(0), unit: 'mm²' },
          { label: 'مساحة الحديد المعتمدة', value: actualAs.toFixed(0), unit: 'mm²', highlight: true },
          { label: `عدد الأسياخ (⌀${barDiameter})`, value: numberOfBars.toString(), unit: 'سيخ' },
          { label: 'سعة العزم (φMn)', value: Mn.toFixed(1), unit: 'kN.m', highlight: true },
          { label: 'نسبة استخدام العزم', value: (Mu / Mn * 100).toFixed(1), unit: '%' },
          { label: 'سعة القص للخرسانة', value: Vc.toFixed(1), unit: 'kN' },
          { label: 'تباعد الكانات', value: stirrupSpacing.toFixed(0), unit: 'mm' },
          { label: 'الترخيم المحسوب', value: deflection.toFixed(2), unit: 'mm' },
          { label: 'الترخيم المسموح', value: allowableDeflection.toFixed(2), unit: 'mm' },
          { label: 'حجم الخرسانة', value: volume.toFixed(3), unit: 'm³' },
          { label: 'وزن الحديد الكلي', value: totalSteelWeight.toFixed(3), unit: 'طن' },
          { label: 'التكلفة التقديرية', value: cost.toFixed(0), unit: 'ريال', highlight: true }
        ],
        compliance: [dimensionCheck, momentCheck, shearCheck, deflectionCheck],
        recommendations
      };
    }
  },

  // 3. حاسبة البلاطات
  {
    id: 'slab-design',
    name: '⬜ حاسبة تصميم البلاطات',
    nameEn: 'Slab Design Calculator',
    icon: <Layers className="w-6 h-6" />,
    description: 'تصميم البلاطات الخرسانية - حساب السماكة والتسليح',
    category: 'structural',
    inputs: [
      {
        id: 'slabLx',
        label: 'البحر القصير (Lx)',
        unit: 'm',
        type: 'number',
        min: 2,
        max: 12,
        step: 0.5,
        defaultValue: 4
      },
      {
        id: 'slabLy',
        label: 'البحر الطويل (Ly)',
        unit: 'm',
        type: 'number',
        min: 2,
        max: 12,
        step: 0.5,
        defaultValue: 6
      },
      {
        id: 'supportType',
        label: 'نوع الإسناد',
        type: 'select',
        defaultValue: 'two-way',
        options: [
          { value: 'one-way', label: 'بلاطة باتجاه واحد' },
          { value: 'two-way', label: 'بلاطة باتجاهين' }
        ]
      },
      {
        id: 'liveLoad',
        label: 'الحمل الحي',
        unit: 'kN/m²',
        type: 'number',
        min: 0,
        max: 10,
        step: 0.5,
        defaultValue: 2
      },
      {
        id: 'slabThickness',
        label: 'سماكة البلاطة المقترحة',
        unit: 'mm',
        type: 'number',
        min: 100,
        max: 400,
        step: 10,
        defaultValue: 150
      },
      {
        id: 'fc',
        label: 'مقاومة الخرسانة (f\'c)',
        unit: 'MPa',
        type: 'number',
        min: 20,
        max: 50,
        step: 5,
        defaultValue: 30
      },
      {
        id: 'fy',
        label: 'إجهاد الحديد (fy)',
        unit: 'MPa',
        type: 'number',
        min: 280,
        max: 500,
        step: 20,
        defaultValue: 420
      }
    ],
    calculate: (inputs) => {
      const { slabLx, slabLy, supportType, liveLoad, slabThickness, fc, fy } = inputs;
      
      const Lx = slabLx;
      const Ly = slabLy;
      const t = slabThickness;
      const support = supportType as string;
      const LL = liveLoad;

      // حساب السماكة الدنيا
      const minThickness = StructuralFormulas.slabMinThickness(Lx, Ly, support);

      // الأحمال
      const deadLoad = (t / 1000) * 25; // kN/m² (self weight)
      const finishes = 1.5; // kN/m²
      const totalDL = deadLoad + finishes;
      const totalLoad = 1.2 * totalDL + 1.6 * LL; // factored load

      // سعة البلاطة
      const capacity = StructuralFormulas.slabLoadCapacity(t, fc, fy, Lx);

      // التسليح الأدنى
      const d = t - 20; // effective depth
      const As_min = 0.0018 * 1000 * t; // mm²/m
      const barSpacing_max = Math.min(2 * t, 450); // mm

      // التسليح المقترح
      const barDiameter = 12; // mm
      const barArea = Math.PI * Math.pow(barDiameter / 2, 2);
      const barSpacing = Math.floor((barArea / As_min) * 1000);
      const actualSpacing = Math.min(barSpacing, barSpacing_max);
      const actualAs = (barArea / actualSpacing) * 1000; // mm²/m

      // الكميات
      const area = Lx * Ly;
      const volume = area * (t / 1000); // m³
      const steelWeightPerM2 = (actualAs / 1000000) * (Lx + Ly) * 7850 / area; // kg/m²
      const totalSteelWeight = steelWeightPerM2 * area / 1000; // ton
      const cost = volume * 350 + totalSteelWeight * 3500;

      // الامتثال
      const thicknessCheck = SBCCompliance.checkSlabThickness(t, Lx);
      const capacityCheck = {
        isOk: capacity >= totalLoad,
        message: capacity >= totalLoad
          ? `✓ البلاطة تحمل الأحمال - الاستخدام ${(totalLoad / capacity * 100).toFixed(1)}%`
          : `✗ البلاطة لا تحمل - زد السماكة`
      };
      const spacingCheck = {
        isOk: actualSpacing <= barSpacing_max,
        message: actualSpacing <= barSpacing_max
          ? `✓ تباعد الحديد مناسب`
          : `⚠ قلل التباعد`
      };
      const deflectionCheck = {
        isOk: t >= minThickness,
        message: t >= minThickness
          ? `✓ السماكة كافية لمنع الترخيم`
          : `✗ زد السماكة إلى ${minThickness.toFixed(0)}mm على الأقل`
      };

      const recommendations: string[] = [];
      if (!thicknessCheck.isOk) recommendations.push(`⚠ السماكة الدنيا: ${minThickness.toFixed(0)}mm`);
      if (!capacityCheck.isOk) recommendations.push('✗ زد سماكة البلاطة أو قلل الأحمال');
      if (!deflectionCheck.isOk) recommendations.push(`⚠ زد السماكة إلى ${minThickness.toFixed(0)}mm`);
      if (recommendations.length === 0) {
        recommendations.push('✓ تصميم البلاطة مطابق للمواصفات');
      }

      return {
        results: [
          { label: 'السماكة الدنيا المطلوبة', value: minThickness.toFixed(0), unit: 'mm' },
          { label: 'الحمل الميت', value: totalDL.toFixed(2), unit: 'kN/m²' },
          { label: 'الحمل الكلي المعامل', value: totalLoad.toFixed(2), unit: 'kN/m²', highlight: true },
          { label: 'سعة البلاطة', value: capacity.toFixed(2), unit: 'kN/m²', highlight: true },
          { label: 'نسبة الاستخدام', value: (totalLoad / capacity * 100).toFixed(1), unit: '%' },
          { label: 'التسليح الأدنى', value: As_min.toFixed(0), unit: 'mm²/m' },
          { label: 'التسليح المعتمد', value: actualAs.toFixed(0), unit: 'mm²/m' },
          { label: `تباعد الأسياخ (⌀${barDiameter})`, value: actualSpacing.toFixed(0), unit: 'mm' },
          { label: 'مساحة البلاطة', value: area.toFixed(2), unit: 'm²' },
          { label: 'حجم الخرسانة', value: volume.toFixed(3), unit: 'm³' },
          { label: 'وزن الحديد', value: totalSteelWeight.toFixed(3), unit: 'طن' },
          { label: 'التكلفة التقديرية', value: cost.toFixed(0), unit: 'ريال', highlight: true }
        ],
        compliance: [thicknessCheck, capacityCheck, spacingCheck, deflectionCheck],
        recommendations
      };
    }
  },

  // 4. حاسبة قطاعات التسليح
  {
    id: 'reinforcement',
    name: '🔩 حاسبة قطاعات التسليح',
    nameEn: 'Reinforcement Calculator',
    icon: <Activity className="w-6 h-6" />,
    description: 'حساب أوزان وأعداد الأسياخ لقطاعات التسليح المختلفة',
    category: 'structural',
    inputs: [
      {
        id: 'barDiameter',
        label: 'قطر السيخ',
        unit: 'mm',
        type: 'number',
        min: 8,
        max: 32,
        step: 2,
        defaultValue: 16,
        tooltip: 'الأقطار الشائعة: 10، 12، 16، 20، 25، 32'
      },
      {
        id: 'barLength',
        label: 'طول السيخ',
        unit: 'm',
        type: 'number',
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 6
      },
      {
        id: 'numberOfBars',
        label: 'عدد الأسياخ',
        type: 'number',
        min: 1,
        max: 10000,
        step: 1,
        defaultValue: 100
      },
      {
        id: 'pricePerTon',
        label: 'سعر الطن',
        unit: 'ريال',
        type: 'number',
        min: 2000,
        max: 5000,
        step: 100,
        defaultValue: 3500
      }
    ],
    calculate: (inputs) => {
      const { barDiameter, barLength, numberOfBars, pricePerTon } = inputs;
      
      const d = barDiameter;
      const L = barLength;
      const n = numberOfBars;

      // حساب الوزن
      const weightPerBar = StructuralFormulas.steelWeight(d, L * 1000);
      const totalWeight = weightPerBar * n;
      const totalWeightTon = totalWeight / 1000;

      // حساب المساحة
      const barArea = StructuralFormulas.steelArea(d, 1);
      const totalArea = barArea * n;

      // التكلفة
      const cost = totalWeightTon * pricePerTon;
      const costPerBar = cost / n;

      // الطول الكلي
      const totalLength = L * n;

      // معلومات إضافية
      const weightPer12m = StructuralFormulas.steelWeight(d, 12000);
      const barsFrom12m = Math.ceil(L / 12);
      const waste = ((barsFrom12m * 12 - L) / (barsFrom12m * 12)) * 100;

      return {
        results: [
          { label: 'وزن السيخ الواحد', value: weightPerBar.toFixed(3), unit: 'كجم', highlight: true },
          { label: 'الوزن الكلي', value: totalWeight.toFixed(2), unit: 'كجم' },
          { label: 'الوزن بالطن', value: totalWeightTon.toFixed(3), unit: 'طن', highlight: true },
          { label: 'مساحة السيخ', value: barArea.toFixed(2), unit: 'mm²' },
          { label: 'المساحة الكلية', value: totalArea.toFixed(0), unit: 'mm²' },
          { label: 'الطول الكلي', value: totalLength.toFixed(1), unit: 'متر' },
          { label: 'التكلفة الإجمالية', value: cost.toFixed(2), unit: 'ريال', highlight: true },
          { label: 'التكلفة للسيخ الواحد', value: costPerBar.toFixed(2), unit: 'ريال' },
          { label: 'وزن السيخ 12م', value: weightPer12m.toFixed(3), unit: 'كجم' },
          { label: 'أسياخ 12م مطلوبة', value: (n * barsFrom12m).toString(), unit: 'سيخ' },
          { label: 'نسبة الهدر', value: waste.toFixed(1), unit: '%' }
        ],
        compliance: [
          {
            isOk: true,
            message: `✓ القطر ${d}mm متاح في السوق`
          },
          {
            isOk: waste < 15,
            message: waste < 15
              ? `✓ نسبة الهدر مقبولة (${waste.toFixed(1)}%)`
              : `⚠ نسبة الهدر مرتفعة - راجع الأطوال`
          }
        ],
        recommendations: [
          `💡 يمكنك استخدام ${(n * barsFrom12m).toString()} سيخ 12م لإنتاج ${n} سيخ ${L}م`,
          totalWeightTon > 1
            ? `📦 الطلبية تحتاج ${Math.ceil(totalWeightTon)} طن من حديد ⌀${d}mm`
            : `📦 الطلبية: ${totalWeight.toFixed(0)} كجم من حديد ⌀${d}mm`,
          `💰 متوسط السعر: ${costPerBar.toFixed(2)} ريال للسيخ`
        ]
      };
    }
  },

  // 5. حاسبة الخرسانة للموقع
  {
    id: 'concrete-site',
    name: '🏗️ حاسبة الخرسانة للموقع',
    nameEn: 'Site Concrete Calculator',
    icon: <Building2 className="w-6 h-6" />,
    description: 'حساب كميات الخرسانة والتكاليف لعناصر المشروع',
    category: 'site',
    inputs: [
      {
        id: 'elementType',
        label: 'نوع العنصر',
        type: 'select',
        defaultValue: 'slab',
        options: [
          { value: 'slab', label: 'بلاطة' },
          { value: 'beam', label: 'كمرة' },
          { value: 'column', label: 'عمود' },
          { value: 'wall', label: 'جدار' },
          { value: 'footing', label: 'قاعدة' }
        ]
      },
      {
        id: 'length',
        label: 'الطول',
        unit: 'm',
        type: 'number',
        min: 0.1,
        max: 100,
        step: 0.1,
        defaultValue: 10
      },
      {
        id: 'width',
        label: 'العرض',
        unit: 'm',
        type: 'number',
        min: 0.1,
        max: 50,
        step: 0.1,
        defaultValue: 8
      },
      {
        id: 'height',
        label: 'الارتفاع/السماكة',
        unit: 'm',
        type: 'number',
        min: 0.1,
        max: 10,
        step: 0.05,
        defaultValue: 0.15
      },
      {
        id: 'quantity',
        label: 'العدد',
        type: 'number',
        min: 1,
        max: 1000,
        step: 1,
        defaultValue: 1
      },
      {
        id: 'concretePrice',
        label: 'سعر الخرسانة',
        unit: 'ريال/م³',
        type: 'number',
        min: 200,
        max: 600,
        step: 10,
        defaultValue: 350
      },
      {
        id: 'wastagePercent',
        label: 'نسبة الهدر',
        unit: '%',
        type: 'number',
        min: 0,
        max: 20,
        step: 1,
        defaultValue: 5
      }
    ],
    calculate: (inputs) => {
      const { length, width, height, quantity, concretePrice, wastagePercent } = inputs;
      
      const L = length;
      const W = width;
      const H = height;
      const Q = quantity;

      // حساب الحجم
      const volumePerUnit = SiteFormulas.concreteVolume(W * 1000, L * 1000, H * 1000);
      const totalVolume = volumePerUnit * Q;
      const volumeWithWastage = totalVolume * (1 + wastagePercent / 100);

      // التكلفة
      const cost = volumeWithWastage * concretePrice;
      const costPerUnit = cost / Q;

      // عدد الخلطات (mixer loads)
      const mixerCapacity = 6; // m³
      const numberOfMixers = Math.ceil(volumeWithWastage / mixerCapacity);

      // الوزن
      const density = 2400; // kg/m³
      const weight = volumeWithWastage * density;
      const weightTon = weight / 1000;

      // معلومات الصب
      const pumpTime = volumeWithWastage * 15; // minutes (15 min per m³)
      const workers = Math.ceil(volumeWithWastage / 5); // 1 worker per 5 m³
      const curingDays = 7;

      return {
        results: [
          { label: 'حجم الوحدة', value: volumePerUnit.toFixed(3), unit: 'm³' },
          { label: 'الحجم الكلي', value: totalVolume.toFixed(3), unit: 'm³', highlight: true },
          { label: `الحجم مع هدر ${wastagePercent}%`, value: volumeWithWastage.toFixed(3), unit: 'm³', highlight: true },
          { label: 'عدد الخلطات (6م³)', value: numberOfMixers.toString(), unit: 'خلطة' },
          { label: 'الوزن الكلي', value: weightTon.toFixed(2), unit: 'طن' },
          { label: 'التكلفة الإجمالية', value: cost.toFixed(0), unit: 'ريال', highlight: true },
          { label: 'التكلفة للوحدة', value: costPerUnit.toFixed(0), unit: 'ريال' },
          { label: 'وقت الصب المقدر', value: Math.ceil(pumpTime / 60), unit: 'ساعة' },
          { label: 'العمالة المطلوبة', value: workers.toString(), unit: 'عامل' },
          { label: 'فترة المعالجة', value: curingDays.toString(), unit: 'أيام' }
        ],
        compliance: [
          {
            isOk: volumeWithWastage > 0,
            message: `✓ الكمية: ${volumeWithWastage.toFixed(2)}م³`
          },
          {
            isOk: wastagePercent <= 10,
            message: wastagePercent <= 10
              ? `✓ نسبة الهدر مقبولة`
              : `⚠ نسبة الهدر مرتفعة`
          }
        ],
        recommendations: [
          `🚚 احجز ${numberOfMixers} خلطة (خلاطة 6م³)`,
          `👷 جهز ${workers} عامل للصب`,
          `⏰ الصب سيستغرق حوالي ${Math.ceil(pumpTime / 60)} ساعة`,
          `💧 المعالجة لمدة ${curingDays} أيام متواصلة`,
          totalVolume > 50
            ? `📞 يُفضل التنسيق مع مصنع الخرسانة مسبقاً للكميات الكبيرة`
            : `✅ كمية مناسبة للتنفيذ العادي`
        ]
      };
    }
  },

  // 6. حاسبة التكاليف السريعة
  {
    id: 'quick-cost',
    name: '💰 حاسبة التكاليف السريعة',
    nameEn: 'Quick Cost Calculator',
    icon: <DollarSign className="w-6 h-6" />,
    description: 'تقدير سريع للتكاليف بناءً على المساحة',
    category: 'cost',
    inputs: [
      {
        id: 'buildingType',
        label: 'نوع المبنى',
        type: 'select',
        defaultValue: 'villa',
        options: [
          { value: 'villa', label: 'فيلا سكنية' },
          { value: 'apartment', label: 'عمارة سكنية' },
          { value: 'commercial', label: 'مبنى تجاري' },
          { value: 'warehouse', label: 'مستودع' }
        ]
      },
      {
        id: 'totalArea',
        label: 'المساحة الإجمالية',
        unit: 'm²',
        type: 'number',
        min: 50,
        max: 10000,
        step: 10,
        defaultValue: 300
      },
      {
        id: 'finishLevel',
        label: 'مستوى التشطيب',
        type: 'select',
        defaultValue: 'standard',
        options: [
          { value: 'basic', label: 'أساسي' },
          { value: 'standard', label: 'متوسط' },
          { value: 'luxury', label: 'فاخر' }
        ]
      },
      {
        id: 'numberOfFloors',
        label: 'عدد الأدوار',
        type: 'number',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 2
      }
    ],
    calculate: (inputs) => {
      const { buildingType, totalArea, finishLevel, numberOfFloors } = inputs;
      
      const area = totalArea;
      const floors = numberOfFloors;

      // أسعار تقريبية بالريال للمتر المربع
      const basePrices: Record<string, number> = {
        villa: 1800,
        apartment: 1500,
        commercial: 2000,
        warehouse: 1200
      };

      const finishMultipliers: Record<string, number> = {
        basic: 1.0,
        standard: 1.3,
        luxury: 1.8
      };

      const basePrice = basePrices[buildingType as string] || 1500;
      const finishMultiplier = finishMultipliers[finishLevel as string] || 1.3;
      const pricePerM2 = basePrice * finishMultiplier;

      // التكاليف
      const structuralCost = area * pricePerM2 * 0.35;
      const architecturalCost = area * pricePerM2 * 0.40;
      const mepCost = area * pricePerM2 * 0.15;
      const finishingCost = area * pricePerM2 * 0.10;
      const totalCost = structuralCost + architecturalCost + mepCost + finishingCost;

      // الكميات التقريبية
      const concreteVolume = area * 0.35; // m³
      const steelWeight = area * 50; // kg
      const blockArea = area * 2.5; // m²

      // الزمن التقريبي
      const durationMonths = Math.ceil((area / 100) * 2 + floors * 0.5);

      // العمالة
      const workers = Math.ceil(area / 50);
      const engineers = Math.max(1, Math.floor(area / 500));

      return {
        results: [
          { label: 'سعر المتر الأساسي', value: basePrice.toFixed(0), unit: 'ريال/م²' },
          { label: 'سعر المتر النهائي', value: pricePerM2.toFixed(0), unit: 'ريال/م²', highlight: true },
          { label: 'التكلفة الإنشائية', value: structuralCost.toFixed(0), unit: 'ريال' },
          { label: 'التكلفة المعمارية', value: architecturalCost.toFixed(0), unit: 'ريال' },
          { label: 'أعمال الكهرباء والسباكة', value: mepCost.toFixed(0), unit: 'ريال' },
          { label: 'التشطيبات', value: finishingCost.toFixed(0), unit: 'ريال' },
          { label: 'التكلفة الإجمالية', value: totalCost.toFixed(0), unit: 'ريال', highlight: true },
          { label: 'الخرسانة التقريبية', value: concreteVolume.toFixed(1), unit: 'm³' },
          { label: 'الحديد التقريبي', value: (steelWeight / 1000).toFixed(2), unit: 'طن' },
          { label: 'البلوك التقريبي', value: blockArea.toFixed(0), unit: 'm²' },
          { label: 'المدة الزمنية', value: durationMonths.toString(), unit: 'شهر' },
          { label: 'العمالة المطلوبة', value: workers.toString(), unit: 'عامل' },
          { label: 'المهندسون', value: engineers.toString(), unit: 'مهندس' }
        ],
        compliance: [
          {
            isOk: true,
            message: `✓ التقدير لمساحة ${area}م²`
          },
          {
            isOk: durationMonths <= 24,
            message: durationMonths <= 24
              ? `✓ المدة الزمنية مناسبة`
              : `⚠ مشروع كبير يحتاج تخطيط دقيق`
          }
        ],
        recommendations: [
          `📊 التكلفة التقريبية: ${(totalCost / 1000000).toFixed(2)} مليون ريال`,
          `⏱️ مدة التنفيذ المتوقعة: ${durationMonths} شهر`,
          `💡 يُنصح بإضافة 10-15% احتياطي للطوارئ`,
          area > 500
            ? `⚠ مشروع كبير - يحتاج دراسة تفصيلية`
            : `✅ مشروع متوسط - التقدير دقيق نسبياً`,
          `📞 للحصول على تقدير دقيق، استشر مكتب هندسي متخصص`
        ]
      };
    }
  }
];

// ==================== COMPONENT ====================
export const EngineeringCalculators: React.FC = () => {
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [results, setResults] = useState<any>(null);
  const [noufalMode, setNoufalMode] = useState(false);

  const currentCalculator = calculators.find(c => c.id === selectedCalculator);

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const handleCalculate = () => {
    if (currentCalculator) {
      const result = currentCalculator.calculate(inputs);
      setResults(result);
    }
  };

  const handleReset = () => {
    if (currentCalculator) {
      const defaultInputs: Record<string, number> = {};
      currentCalculator.inputs.forEach(input => {
        if (input.defaultValue && typeof input.defaultValue === 'number') {
          defaultInputs[input.id] = input.defaultValue;
        }
      });
      setInputs(defaultInputs);
    }
    setResults(null);
  };

  const categoryIcons = {
    structural: <Building2 className="w-5 h-5" />,
    site: <Mountain className="w-5 h-5" />,
    cost: <DollarSign className="w-5 h-5" />
  };

  const categoryNames = {
    structural: 'التصميم الإنشائي',
    site: 'حاسبات الموقع',
    cost: 'التكاليف'
  };

  const categorizedCalculators = calculators.reduce((acc, calc) => {
    if (!acc[calc.category]) {
      acc[calc.category] = [];
    }
    acc[calc.category].push(calc);
    return acc;
  }, {} as Record<string, CalculatorDefinition[]>);

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className={`p-8 rounded-lg shadow-lg mb-6 ${
        noufalMode 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
          : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Calculator className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                🧮 الحاسبات الهندسية المتقدمة
              </h1>
              <p className={noufalMode ? 'text-yellow-100' : 'text-blue-100'}>
                Engineering Calculators - متوافقة مع SBC 304
              </p>
            </div>
          </div>

          {/* NOUFAL Toggle */}
          <button
            onClick={() => setNoufalMode(!noufalMode)}
            className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
              noufalMode 
                ? 'bg-white text-orange-600 shadow-lg' 
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
            title="تفعيل وكيل نوفل للحسابات المتقدمة"
          >
            <Brain className="w-5 h-5" />
            {noufalMode ? 'نوفل نشط 🧠' : 'تفعيل نوفل'}
          </button>
        </div>

        {/* NOUFAL Status Badges */}
        {noufalMode && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
              <Zap className="w-3 h-3" />
              <span>متصل</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              <Shield className="w-3 h-3" />
              <span>AI متقدم</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>حسابات دقيقة</span>
            </div>
          </div>
        )}
      </div>

      {!selectedCalculator ? (
        /* Calculator Selection */
        <div className="space-y-8">
          {Object.entries(categorizedCalculators).map(([category, calcs]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h2>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {calcs.map(calc => (
                  <button
                    key={calc.id}
                    onClick={() => {
                      setSelectedCalculator(calc.id);
                      const defaultInputs: Record<string, number> = {};
                      calc.inputs.forEach(input => {
                        if (input.defaultValue && typeof input.defaultValue === 'number') {
                          defaultInputs[input.id] = input.defaultValue;
                        }
                      });
                      setInputs(defaultInputs);
                    }}
                    className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-right ${
                      noufalMode ? 'border-2 border-orange-300' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${
                        noufalMode ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {calc.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{calc.name}</h3>
                        <p className="text-sm text-gray-500">{calc.nameEn}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">{calc.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calculator Interface */
        <>
          <button
            onClick={() => {
              setSelectedCalculator(null);
              setResults(null);
              setInputs({});
            }}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            ← العودة إلى القائمة
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Inputs */}
            <div className={`bg-white rounded-lg shadow-lg p-6 ${
              noufalMode ? 'border-2 border-orange-300' : ''
            }`}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📥 المدخلات
                {noufalMode && <span className="text-orange-600 text-sm">(نوفل نشط)</span>}
              </h2>
              
              <div className="space-y-4">
                {currentCalculator?.inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {input.label}
                      {input.unit && <span className="text-gray-500 mr-2">({input.unit})</span>}
                    </label>
                    {input.type === 'select' ? (
                      <select
                        className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                          noufalMode 
                            ? 'border-orange-300 focus:border-orange-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        value={inputs[input.id] || input.defaultValue}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                      >
                        {input.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        step={input.step || 'any'}
                        min={input.min}
                        max={input.max}
                        className={`w-full p-3 border-2 rounded-lg focus:outline-none ${
                          noufalMode 
                            ? 'border-orange-300 focus:border-orange-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        value={inputs[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                      />
                    )}
                    {input.tooltip && (
                      <p className="text-xs text-gray-500 mt-1">💡 {input.tooltip}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCalculate}
                  className={`w-full font-bold py-3 rounded-lg ${
                    noufalMode
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {noufalMode ? '🧠 احسب بذكاء نوفل' : 'احسب الآن'}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className={`bg-white rounded-lg shadow-lg p-6 ${
                noufalMode ? 'border-2 border-orange-300' : ''
              }`}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 النتائج</h2>
                
                <div className="space-y-3">
                  {results.results.map((result: CalculatorResult, idx: number) => (
                    <div key={idx} className={`p-4 rounded-lg ${
                      result.highlight 
                        ? noufalMode
                          ? 'bg-orange-50 border-r-4 border-orange-500'
                          : 'bg-blue-50 border-r-4 border-blue-500'
                        : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">{result.label}:</span>
                        <span className={`text-xl font-bold ${
                          result.highlight 
                            ? noufalMode ? 'text-orange-600' : 'text-blue-600'
                            : 'text-gray-800'
                        }`}>
                          {result.value} {result.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compliance */}
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">✅ التحقق من SBC</h3>
                  <div className="space-y-2">
                    {results.compliance.map((check: ComplianceCheck, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg border-r-4 ${
                        check.isOk ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                      }`}>
                        <p className={`text-sm font-semibold ${
                          check.isOk ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {check.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {noufalMode ? '🧠 توصيات نوفل الذكية' : '💡 التوصيات'}
                  </h3>
                  <div className="space-y-2">
                    {results.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg border-r-4 ${
                        rec.startsWith('✓') ? 'bg-green-50 border-green-500' :
                        rec.startsWith('✗') ? 'bg-red-50 border-red-500' :
                        rec.startsWith('💡') || rec.startsWith('🚚') || rec.startsWith('👷') 
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-yellow-50 border-yellow-500'
                      }`}>
                        <p className={`text-sm ${
                          rec.startsWith('✓') ? 'text-green-800' :
                          rec.startsWith('✗') ? 'text-red-800' :
                          rec.startsWith('💡') || rec.startsWith('🚚') || rec.startsWith('👷')
                            ? 'text-blue-800'
                            : 'text-yellow-800'
                        }`}>
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EngineeringCalculators;
