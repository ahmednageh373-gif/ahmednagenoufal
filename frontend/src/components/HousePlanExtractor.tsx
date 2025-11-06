/**
 * House Plan Extractor Component - مستخرج المخططات المنزلية
 * 
 * Extracts house plan data from URLs and generates automatic cost estimates.
 * Integrates with Quick Estimator and BOQ generation.
 * 
 * @author NOUFAL Engineering Management System
 * @date 2025-11-04
 */

import React, { useState } from 'react';
import { Home, Download, Search, TrendingUp, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface HousePlanData {
  plan_id: string;
  title: string;
  url: string;
  image_url?: string;
  bhk?: number;
  square_feet?: number;
  orientation?: string;
  land: {
    total_area: { value: number; unit: string };
    width: { value: number; unit: string };
    length: { value: number; unit: string };
  };
  building: {
    width: { value: number; unit: string };
    length: { value: number; unit: string };
    building_type: string;
    design_style: string;
  };
  rooms: Array<{
    name: string;
    type: string;
    dimensions: { length: number; width: number; unit: string };
    area: { value: number; unit: string };
  }>;
  confidence: number;
  extracted_at: string;
}

interface IntegratedEstimate {
  plan_id: string;
  plan_title: string;
  plan_url: string;
  land_area_sqm: number;
  building_area_sqm: number;
  room_count: number;
  bhk?: number;
  quick_estimate: {
    costs: {
      total_estimated_cost: number;
      cost_per_sqm: number;
      structure_cost: number;
      finishing_cost: number;
      mep_cost: number;
    };
    materials: {
      steel_kg: number;
      concrete_m3: number;
      blocks_nos: number;
      cement_bags_50kg: number;
    };
    currency: string;
    confidence_level: string;
  };
  room_breakdown: Array<{
    name: string;
    type: string;
    area_sqm: number;
  }>;
  confidence: number;
  notes: string[];
}

export const HousePlanExtractor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extract' | 'estimate' | 'compare'>('extract');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Home className="w-10 h-10 text-blue-600" />
            مستخرج المخططات المنزلية - House Plan Extractor
          </h1>
          <p className="text-gray-600">
            استخراج بيانات المخططات تلقائياً + تقدير التكلفة + إنشاء BOQ
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'extract'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('extract')}
            >
              <div className="flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                <span>استخراج مخطط</span>
              </div>
            </button>
            <button
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'estimate'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('estimate')}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>تقدير تلقائي</span>
              </div>
            </button>
            <button
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'compare'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('compare')}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span>مقارنة مخططات</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'extract' && <ExtractTab />}
          {activeTab === 'estimate' && <EstimateTab />}
          {activeTab === 'compare' && <CompareTab />}
        </div>
      </div>
    </div>
  );
};

/**
 * Extract Tab - استخراج مخطط من رابط
 */
const ExtractTab: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<HousePlanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!url) {
      setError('الرجاء إدخال رابط المخطط');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/house-plan/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (data.success) {
        setPlan(data.plan);
      } else {
        setError(data.error || 'فشل استخراج البيانات');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          رابط المخطط - Plan URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.civilconcept.com/3bhk-house-plan-..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleExtract}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            {loading ? 'جاري الاستخراج...' : 'استخرج'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          مثال: https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {plan && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">تم الاستخراج بنجاح!</span>
            </div>
            <p className="text-sm text-green-700">
              Confidence: {(plan.confidence * 100).toFixed(0)}%
            </p>
          </div>

          {/* Plan Info */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.title}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {plan.bhk && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{plan.bhk}</div>
                  <div className="text-sm text-gray-600">BHK</div>
                </div>
              )}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">{plan.rooms.length}</div>
                <div className="text-sm text-gray-600">Rooms</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {plan.land.total_area.value.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">{plan.land.total_area.unit}</div>
              </div>
              {plan.orientation && (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">{plan.orientation}</div>
                  <div className="text-sm text-gray-600">Facing</div>
                </div>
              )}
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🏞️ Land Dimensions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Width:</span>
                    <span className="font-semibold">
                      {plan.land.width.value} {plan.land.width.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Length:</span>
                    <span className="font-semibold">
                      {plan.land.length.value} {plan.land.length.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🏠 Building Dimensions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Width:</span>
                    <span className="font-semibold">
                      {plan.building.width.value} {plan.building.width.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Length:</span>
                    <span className="font-semibold">
                      {plan.building.length.value} {plan.building.length.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🚪 Rooms ({plan.rooms.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.rooms.map((room, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-semibold text-gray-900">{room.name}</div>
                    <div className="text-sm text-gray-600">
                      {room.dimensions.length} × {room.dimensions.width} {room.dimensions.unit}
                      {' = '}
                      {room.area.value} {room.area.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Estimate Tab - تقدير تلقائي من مخطط
 */
const EstimateTab: React.FC = () => {
  const [url, setUrl] = useState('');
  const [region, setRegion] = useState('saudi_arabia');
  const [finishLevel, setFinishLevel] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<IntegratedEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    if (!url) {
      setError('الرجاء إدخال رابط المخطط');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/house-plan/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, region, finish_level: finishLevel })
      });

      const data = await response.json();

      if (data.success) {
        setEstimate(data.estimate);
      } else {
        setError(data.error || 'فشل إنشاء التقدير');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return `${value.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ${currency}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رابط المخطط - Plan URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.civilconcept.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المنطقة - Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="saudi_arabia">السعودية - Saudi Arabia</option>
            <option value="uae">الإمارات - UAE</option>
            <option value="egypt">مصر - Egypt</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مستوى التشطيب - Finish Level
          </label>
          <select
            value={finishLevel}
            onChange={(e) => setFinishLevel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="basic">أساسي - Basic</option>
            <option value="standard">قياسي - Standard</option>
            <option value="luxury">فاخر - Luxury</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleEstimate}
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'جاري التقدير...' : 'احسب التقدير'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {estimate && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{estimate.plan_title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>🏠 {estimate.room_count} Rooms</span>
              <span>📐 {estimate.building_area_sqm.toFixed(0)} m²</span>
              <span>⭐ {(estimate.confidence * 100).toFixed(0)}% Confidence</span>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-blue-900 mb-3">💰 التكلفة الإجمالية</h4>
            <div className="text-4xl font-bold text-blue-900 mb-2">
              {formatCurrency(estimate.quick_estimate.costs.total_estimated_cost, estimate.quick_estimate.currency)}
            </div>
            <div className="text-sm text-blue-700">
              {formatCurrency(estimate.quick_estimate.costs.cost_per_sqm, estimate.quick_estimate.currency)} / م²
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">الإنشاء - Structure</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(estimate.quick_estimate.costs.structure_cost, estimate.quick_estimate.currency)}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">التشطيبات - Finishing</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(estimate.quick_estimate.costs.finishing_cost, estimate.quick_estimate.currency)}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">الكهروميكانيك - MEP</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(estimate.quick_estimate.costs.mep_cost, estimate.quick_estimate.currency)}
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-bold text-gray-900 mb-4">📦 الكميات المتوقعة</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">حديد - Steel:</span>
                <div className="font-semibold text-lg">{estimate.quick_estimate.materials.steel_kg.toLocaleString()} kg</div>
              </div>
              <div>
                <span className="text-gray-600">خرسانة - Concrete:</span>
                <div className="font-semibold text-lg">{estimate.quick_estimate.materials.concrete_m3.toFixed(1)} m³</div>
              </div>
              <div>
                <span className="text-gray-600">بلوك - Blocks:</span>
                <div className="font-semibold text-lg">{estimate.quick_estimate.materials.blocks_nos.toLocaleString()} nos</div>
              </div>
              <div>
                <span className="text-gray-600">أسمنت - Cement:</span>
                <div className="font-semibold text-lg">{estimate.quick_estimate.materials.cement_bags_50kg} bags</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-900 mb-2">📝 ملاحظات</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {estimate.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Compare Tab - مقارنة مخططين
 */
const CompareTab: React.FC = () => {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center text-gray-500 py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">قريباً - Coming Soon</h3>
        <p>ميزة مقارنة المخططات قيد التطوير</p>
      </div>
    </div>
  );
};

export default HousePlanExtractor;
