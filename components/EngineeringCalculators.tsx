import React, { useState } from 'react';
import { Calculator, Ruler, Building2, Columns, Mountain } from 'lucide-react';

// ==================== TYPES ====================
interface CalculatorInput {
  id: string;
  label: string;
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

// ==================== FORMULAS ====================
const StructuralFormulas = {
  shortColumnCapacity: (Ag: number, fc: number, Ast: number, fy: number) => {
    return 0.8 * (0.85 * fc * (Ag - Ast) + fy * Ast) / 1000;
  },

  slendernessRatio: (L: number, r: number) => {
    return L / r;
  },

  steelWeight: (diameter: number, length: number) => {
    return (Math.pow(diameter, 2) / 162) * length;
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
  }
};

// ==================== CALCULATORS DATA ====================
const calculators = [
  {
    id: 'short-column',
    name: 'حاسبة الأعمدة القصيرة',
    nameEn: 'Short Column Calculator',
    icon: <Columns className="w-6 h-6" />,
    description: 'تصميم الأعمدة القصيرة حسب SBC 304',
    category: 'structural',
    inputs: [
      {
        id: 'width',
        label: 'عرض العمود (b)',
        unit: 'mm',
        type: 'number' as const,
        min: 200,
        max: 1000,
        step: 50,
        defaultValue: 300,
        tooltip: 'الحد الأدنى 200 مم حسب SBC 304'
      },
      {
        id: 'depth',
        label: 'عمق العمود (h)',
        unit: 'mm',
        type: 'number' as const,
        min: 200,
        max: 1000,
        step: 50,
        defaultValue: 300
      },
      {
        id: 'axialLoad',
        label: 'الحمل المحوري (P)',
        unit: 'kN',
        type: 'number' as const,
        min: 0,
        max: 10000,
        step: 10,
        defaultValue: 1000
      },
      {
        id: 'concreteStrength',
        label: 'مقاومة الخرسانة (f\'c)',
        unit: 'MPa',
        type: 'number' as const,
        min: 20,
        max: 50,
        step: 5,
        defaultValue: 30
      },
      {
        id: 'steelYield',
        label: 'إجهاد الحديد (fy)',
        unit: 'MPa',
        type: 'number' as const,
        min: 280,
        max: 500,
        step: 20,
        defaultValue: 420
      },
      {
        id: 'steelRatio',
        label: 'نسبة التسليح (ρ)',
        unit: '%',
        type: 'number' as const,
        min: 1,
        max: 4,
        step: 0.1,
        defaultValue: 2,
        tooltip: 'SBC: 1% ≤ ρ ≤ 4%'
      },
      {
        id: 'columnHeight',
        label: 'ارتفاع العمود (L)',
        unit: 'm',
        type: 'number' as const,
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
  }
];

// ==================== COMPONENT ====================
export const EngineeringCalculators: React.FC = () => {
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [results, setResults] = useState<any>(null);

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
    setInputs({});
    setResults(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg mb-6">
        <div className="flex items-center gap-4">
          <Calculator className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold mb-2">🧮 الحاسبات الهندسية</h1>
            <p className="text-blue-100">Engineering Calculators - متوافقة مع SBC 304</p>
          </div>
        </div>
      </div>

      {!selectedCalculator ? (
        /* Calculator Selection */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map(calc => (
            <button
              key={calc.id}
              onClick={() => {
                setSelectedCalculator(calc.id);
                const defaultInputs: Record<string, number> = {};
                calc.inputs.forEach(input => {
                  if (input.defaultValue) {
                    defaultInputs[input.id] = input.defaultValue as number;
                  }
                });
                setInputs(defaultInputs);
              }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-right"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📥 المدخلات</h2>
              
              <div className="space-y-4">
                {currentCalculator?.inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {input.label}
                      {input.unit && <span className="text-gray-500 mr-2">({input.unit})</span>}
                    </label>
                    <input
                      type="number"
                      step={input.step || 'any'}
                      min={input.min}
                      max={input.max}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      value={inputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                    />
                    {input.tooltip && (
                      <p className="text-xs text-gray-500 mt-1">💡 {input.tooltip}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCalculate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                >
                  احسب الآن
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
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 النتائج</h2>
                
                <div className="space-y-3">
                  {results.results.map((result: CalculatorResult, idx: number) => (
                    <div key={idx} className={`p-4 rounded-lg ${
                      result.highlight ? 'bg-blue-50 border-r-4 border-blue-500' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">{result.label}:</span>
                        <span className={`text-xl font-bold ${
                          result.highlight ? 'text-blue-600' : 'text-gray-800'
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
                  <h3 className="text-xl font-bold text-gray-800 mb-3">💡 التوصيات</h3>
                  <div className="space-y-2">
                    {results.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg border-r-4 ${
                        rec.startsWith('✓') ? 'bg-green-50 border-green-500' :
                        rec.startsWith('✗') ? 'bg-red-50 border-red-500' :
                        'bg-yellow-50 border-yellow-500'
                      }`}>
                        <p className={`text-sm ${
                          rec.startsWith('✓') ? 'text-green-800' :
                          rec.startsWith('✗') ? 'text-red-800' :
                          'text-yellow-800'
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
