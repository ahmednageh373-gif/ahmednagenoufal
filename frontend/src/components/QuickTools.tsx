/**
 * Quick Tools Component - أدوات سريعة
 * 
 * Integrates CivilConcept-inspired features into NOUFAL EMS:
 * - Quick Estimator (تقدير سريع)
 * - Unit Converter (محول الوحدات)
 * - Land Area Calculator (حاسبة مساحة الأراضي)
 * 
 * @author NOUFAL Engineering Management System
 * @date 2025-11-04
 */

import React, { useState } from 'react';
import { Calculator, Ruler, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface QuickEstimateResult {
  region: string;
  building_type: string;
  finish_level: string;
  total_area_sqm: number;
  number_of_storeys: number;
  currency: string;
  materials: {
    steel_kg: number;
    concrete_m3: number;
    blocks_nos: number;
    cement_bags_50kg: number;
    sand_m3: number;
    aggregate_m3: number;
  };
  costs: {
    structure_cost: number;
    finishing_cost: number;
    mep_cost: number;
    total_estimated_cost: number;
    cost_per_sqm: number;
  };
  factors: {
    storey_multiplier: number;
    building_type_multiplier: number;
    finish_multiplier: number;
  };
  warnings: string[];
  confidence_level: string;
}

interface LandAreaResult {
  area_sqm: number;
  area_sqft: number;
  area_hectare: number;
  area_acre: number;
}

export const QuickTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'estimator' | 'converter' | 'land'>('estimator');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            أدوات سريعة - Quick Tools
          </h1>
          <p className="text-gray-600">
            أدوات تقدير وتحويل سريعة مستوحاة من CivilConcept
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'estimator'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('estimator')}
            >
              <div className="flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" />
                <span>تقدير سريع</span>
              </div>
            </button>
            <button
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'converter'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('converter')}
            >
              <div className="flex items-center justify-center gap-2">
                <Ruler className="w-5 h-5" />
                <span>محول الوحدات</span>
              </div>
            </button>
            <button
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'land'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('land')}
            >
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>حاسبة الأراضي</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'estimator' && <QuickEstimator />}
          {activeTab === 'converter' && <UnitConverter />}
          {activeTab === 'land' && <LandCalculator />}
        </div>
      </div>
    </div>
  );
};

/**
 * Quick Estimator Component
 */
const QuickEstimator: React.FC = () => {
  const [formData, setFormData] = useState({
    total_area_sqm: 400,
    number_of_storeys: 2,
    region: 'saudi_arabia',
    building_type: 'residential',
    finish_level: 'standard',
    custom_contractor_rate: ''
  });
  const [result, setResult] = useState<QuickEstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/quick-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          custom_contractor_rate: formData.custom_contractor_rate 
            ? parseFloat(formData.custom_contractor_rate) 
            : null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.estimate);
      } else {
        setError(data.error || 'حدث خطأ في التقدير');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return `${value.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            معلومات المشروع - Project Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المساحة الإجمالية (م²) - Total Area (m²)
            </label>
            <input
              type="number"
              value={formData.total_area_sqm}
              onChange={(e) => setFormData({...formData, total_area_sqm: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد الطوابق - Number of Storeys
            </label>
            <input
              type="number"
              value={formData.number_of_storeys}
              onChange={(e) => setFormData({...formData, number_of_storeys: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنطقة - Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({...formData, region: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="saudi_arabia">السعودية - Saudi Arabia</option>
              <option value="uae">الإمارات - UAE</option>
              <option value="egypt">مصر - Egypt</option>
              <option value="qatar">قطر - Qatar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع المبنى - Building Type
            </label>
            <select
              value={formData.building_type}
              onChange={(e) => setFormData({...formData, building_type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="residential">سكني - Residential</option>
              <option value="villa">فيلا - Villa</option>
              <option value="apartment">شقة - Apartment</option>
              <option value="commercial">تجاري - Commercial</option>
              <option value="office">مكتب - Office</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مستوى التشطيب - Finish Level
            </label>
            <select
              value={formData.finish_level}
              onChange={(e) => setFormData({...formData, finish_level: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="basic">أساسي - Basic</option>
              <option value="standard">قياسي - Standard</option>
              <option value="luxury">فاخر - Luxury</option>
              <option value="super_luxury">فاخر جداً - Super Luxury</option>
            </select>
          </div>

          <button
            onClick={handleEstimate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'جاري الحساب...' : 'احسب التقدير - Calculate Estimate'}
          </button>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                نتائج التقدير - Estimate Results
              </h3>

              {/* Confidence Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                result.confidence_level === 'high' ? 'bg-green-100 text-green-800' :
                result.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">
                  Confidence: {result.confidence_level.toUpperCase()}
                </span>
              </div>

              {/* Cost Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3">💰 التكلفة الإجمالية</h4>
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  {formatCurrency(result.costs.total_estimated_cost, result.currency)}
                </div>
                <div className="text-sm text-blue-700">
                  {formatCurrency(result.costs.cost_per_sqm, result.currency)} / م²
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">📊 تفصيل التكاليف</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الإنشاء - Structure:</span>
                    <span className="font-semibold">{formatCurrency(result.costs.structure_cost, result.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التشطيبات - Finishing:</span>
                    <span className="font-semibold">{formatCurrency(result.costs.finishing_cost, result.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الكهروميكانيك - MEP:</span>
                    <span className="font-semibold">{formatCurrency(result.costs.mep_cost, result.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">📦 الكميات المتوقعة</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">حديد - Steel:</span>
                    <div className="font-semibold">{result.materials.steel_kg.toLocaleString()} kg</div>
                  </div>
                  <div>
                    <span className="text-gray-600">خرسانة - Concrete:</span>
                    <div className="font-semibold">{result.materials.concrete_m3.toFixed(2)} m³</div>
                  </div>
                  <div>
                    <span className="text-gray-600">بلوك - Blocks:</span>
                    <div className="font-semibold">{result.materials.blocks_nos.toLocaleString()} nos</div>
                  </div>
                  <div>
                    <span className="text-gray-600">أسمنت - Cement:</span>
                    <div className="font-semibold">{result.materials.cement_bags_50kg} bags</div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    تحذيرات - Warnings
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Unit Converter Component
 */
const UnitConverter: React.FC = () => {
  const [unitType, setUnitType] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [value, setValue] = useState('10');
  const [result, setResult] = useState<number | null>(null);

  const unitOptions: Record<string, string[]> = {
    length: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    area: ['mm²', 'cm²', 'm²', 'km²', 'ha', 'in²', 'ft²', 'yd²', 'acre', 'mi²'],
    volume: ['mm³', 'cm³', 'm³', 'L', 'mL', 'in³', 'ft³', 'yd³', 'gal(US)', 'gal(UK)'],
    pressure: ['Pa', 'kPa', 'MPa', 'GPa', 'bar', 'psi', 'ksi', 'kg/cm²']
  };

  const handleConvert = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/unit-convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseFloat(value),
          from_unit: fromUnit,
          to_unit: toUnit,
          unit_type: unitType
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.converted.value);
      }
    } catch (err) {
      console.error('Conversion error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-center">محول الوحدات - Unit Converter</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الوحدة - Unit Type
          </label>
          <select
            value={unitType}
            onChange={(e) => {
              setUnitType(e.target.value);
              setFromUnit(unitOptions[e.target.value][0]);
              setToUnit(unitOptions[e.target.value][1]);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="length">الطول - Length</option>
            <option value="area">المساحة - Area</option>
            <option value="volume">الحجم - Volume</option>
            <option value="pressure">الضغط - Pressure</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            القيمة - Value
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            من - From
          </label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {unitOptions[unitType].map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            إلى - To
          </label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {unitOptions[unitType].map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        تحويل - Convert
      </button>

      {result !== null && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-gray-600 mb-2">{value} {fromUnit} =</div>
          <div className="text-3xl font-bold text-green-800">
            {result.toLocaleString('en-US', { maximumFractionDigits: 6 })} {toUnit}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Land Calculator Component
 */
const LandCalculator: React.FC = () => {
  const [method, setMethod] = useState<'diagonal' | 'coordinates'>('diagonal');
  const [formData, setFormData] = useState({
    side_a: '25',
    side_b: '30',
    side_c: '28',
    side_d: '32',
    diagonal_ac: '40',
    unit: 'm'
  });
  const [result, setResult] = useState<LandAreaResult | null>(null);

  const handleCalculate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/land-area/irregular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          side_a: parseFloat(formData.side_a),
          side_b: parseFloat(formData.side_b),
          side_c: parseFloat(formData.side_c),
          side_d: parseFloat(formData.side_d),
          diagonal_ac: parseFloat(formData.diagonal_ac),
          unit: formData.unit
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.area);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-center">
        حاسبة مساحة الأراضي - Land Area Calculator
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الضلع الأول - Side A
          </label>
          <input
            type="number"
            value={formData.side_a}
            onChange={(e) => setFormData({...formData, side_a: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الضلع الثاني - Side B
          </label>
          <input
            type="number"
            value={formData.side_b}
            onChange={(e) => setFormData({...formData, side_b: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الضلع الثالث - Side C
          </label>
          <input
            type="number"
            value={formData.side_c}
            onChange={(e) => setFormData({...formData, side_c: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الضلع الرابع - Side D
          </label>
          <input
            type="number"
            value={formData.side_d}
            onChange={(e) => setFormData({...formData, side_d: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            القطر - Diagonal
          </label>
          <input
            type="number"
            value={formData.diagonal_ac}
            onChange={(e) => setFormData({...formData, diagonal_ac: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الوحدة - Unit
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="m">متر - Meter (m)</option>
            <option value="ft">قدم - Foot (ft)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        احسب المساحة - Calculate Area
      </button>

      {result && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">متر مربع</div>
            <div className="text-2xl font-bold text-blue-900">{result.area_sqm} m²</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">قدم مربع</div>
            <div className="text-2xl font-bold text-green-900">{result.area_sqft} ft²</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">هكتار</div>
            <div className="text-2xl font-bold text-purple-900">{result.area_hectare} ha</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">أكر</div>
            <div className="text-2xl font-bold text-orange-900">{result.area_acre} acre</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickTools;
