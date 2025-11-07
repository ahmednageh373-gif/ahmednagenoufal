import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface EVMData {
  planned_value: number;
  earned_value: number;
  actual_cost: number;
  cost_variance: number;
  schedule_variance: number;
  cost_performance_index: number;
  schedule_performance_index: number;
  estimate_at_completion: number;
  estimate_to_complete: number;
  variance_at_completion: number;
  to_complete_performance_index: number;
}

interface AnalyticsData {
  evm?: EVMData;
  financial?: any;
  schedule?: any;
  kpis?: any;
}

export const AdvancedAnalytics: React.FC = () => {
  const [analyticsType, setAnalyticsType] = useState('evm');
  const [projectId, setProjectId] = useState('1');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyticsTypes = [
    { id: 'evm', name: 'تحليل القيمة المكتسبة (EVM)', icon: Target },
    { id: 'financial', name: 'التحليل المالي', icon: DollarSign },
    { id: 'schedule', name: 'تحليل الجدول الزمني', icon: Calendar },
    { id: 'kpis', name: 'مؤشرات الأداء الرئيسية', icon: BarChart3 },
  ];

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = window.location.origin.replace('3000', '5000');
      let endpoint = '';
      
      switch (analyticsType) {
        case 'evm':
          endpoint = '/api/analytics/evm';
          break;
        case 'financial':
          endpoint = '/api/analytics/financial';
          break;
        case 'schedule':
          endpoint = '/api/analytics/schedule';
          break;
        case 'kpis':
          endpoint = '/api/analytics/kpis';
          break;
      }

      const response = await fetch(`${API_BASE}${endpoint}?project_id=${projectId}`, {
        method: 'GET'
      });

      if (!response.ok) throw new Error('فشل تحميل البيانات');

      const result = await response.json();
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.error || 'خطأ في تحميل البيانات');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [analyticsType, projectId]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, status }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        {status && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'good' ? 'bg-green-100 text-green-800' :
            status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status === 'good' ? 'جيد' : status === 'warning' ? 'تحذير' : 'خطر'}
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${
          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4" /> : 
           trend < 0 ? <TrendingDown className="w-4 h-4" /> : null}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );

  const renderEVMAnalysis = (evm: EVMData) => {
    const getStatus = (value: number, threshold1: number, threshold2: number) => {
      if (value >= threshold1) return 'good';
      if (value >= threshold2) return 'warning';
      return 'danger';
    };

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="القيمة المخططة (PV)"
            value={`${(evm.planned_value / 1000000).toFixed(2)}M SAR`}
            icon={Calendar}
            status="good"
          />
          <MetricCard
            title="القيمة المكتسبة (EV)"
            value={`${(evm.earned_value / 1000000).toFixed(2)}M SAR`}
            icon={TrendingUp}
            status={getStatus(evm.schedule_performance_index, 1, 0.9)}
          />
          <MetricCard
            title="التكلفة الفعلية (AC)"
            value={`${(evm.actual_cost / 1000000).toFixed(2)}M SAR`}
            icon={DollarSign}
            status={getStatus(evm.cost_performance_index, 1, 0.9)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="مؤشر أداء التكلفة (CPI)"
            value={evm.cost_performance_index.toFixed(2)}
            subtitle={evm.cost_performance_index >= 1 ? 'ضمن الميزانية' : 'تجاوز الميزانية'}
            icon={DollarSign}
            status={getStatus(evm.cost_performance_index, 1, 0.9)}
          />
          <MetricCard
            title="مؤشر أداء الجدول (SPI)"
            value={evm.schedule_performance_index.toFixed(2)}
            subtitle={evm.schedule_performance_index >= 1 ? 'على المسار' : 'متأخر'}
            icon={Calendar}
            status={getStatus(evm.schedule_performance_index, 1, 0.9)}
          />
          <MetricCard
            title="انحراف التكلفة (CV)"
            value={`${(evm.cost_variance / 1000000).toFixed(2)}M SAR`}
            subtitle={evm.cost_variance >= 0 ? 'توفير' : 'تجاوز'}
            icon={TrendingUp}
            status={evm.cost_variance >= 0 ? 'good' : 'danger'}
          />
          <MetricCard
            title="انحراف الجدول (SV)"
            value={`${(evm.schedule_variance / 1000000).toFixed(2)}M SAR`}
            subtitle={evm.schedule_variance >= 0 ? 'متقدم' : 'متأخر'}
            icon={Calendar}
            status={evm.schedule_variance >= 0 ? 'good' : 'danger'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              التقديرات المستقبلية
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">التكلفة المتوقعة (EAC)</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {(evm.estimate_at_completion / 1000000).toFixed(2)}M SAR
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">التكلفة المتبقية (ETC)</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {(evm.estimate_to_complete / 1000000).toFixed(2)}M SAR
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">الانحراف عند الإنجاز (VAC)</span>
                <span className={`text-lg font-bold ${
                  evm.variance_at_completion >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(evm.variance_at_completion / 1000000).toFixed(2)}M SAR
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              مؤشر الأداء المطلوب
            </h3>
            <div className="text-center py-8">
              <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-8 mb-4">
                <span className="text-5xl font-bold text-white">
                  {evm.to_complete_performance_index.toFixed(2)}
                </span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                مؤشر الأداء المطلوب للإنجاز (TCPI)
              </p>
              <p className={`text-sm font-semibold ${
                evm.to_complete_performance_index <= 1 ? 'text-green-600' : 
                evm.to_complete_performance_index <= 1.1 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {evm.to_complete_performance_index <= 1 ? 'قابل للتحقيق' : 
                 evm.to_complete_performance_index <= 1.1 ? 'يتطلب جهد إضافي' : 
                 'صعب التحقيق'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderGenericAnalysis = (data: any) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          بيانات التحليل متاحة
        </p>
        <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-700 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          التحليلات المتقدمة
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          تحليل شامل لأداء المشروع والتوقعات المستقبلية
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نوع التحليل
            </label>
            <div className="flex flex-wrap gap-2">
              {analyticsTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setAnalyticsType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      analyticsType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المشروع
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="معرف المشروع"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      ) : data ? (
        <div>
          {analyticsType === 'evm' && data.evm && renderEVMAnalysis(data.evm)}
          {analyticsType !== 'evm' && renderGenericAnalysis(data)}
        </div>
      ) : null}
    </div>
  );
};

export default AdvancedAnalytics;
