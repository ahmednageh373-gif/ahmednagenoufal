/**
 * NOUFAL Backend Hub - مركز التحكم في الـ 10 أنظمة
 * Integration with Python Backend Systems
 */

import React, { useState, useEffect } from 'react';
import { noufalAPI } from '../services/NOUFALBackendAPI';
import {
  Server,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Tags,
  TrendingUp,
  Microscope,
  Network,
  Calendar,
  ShieldCheck,
  Activity,
  MessageSquare,
  Zap,
  Upload,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Clock,
  PlayCircle,
  Loader2,
} from 'lucide-react';

interface SystemCard {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ElementType;
  description: string;
  status: boolean;
  color: string;
}

export const NOUFALBackendHub: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [naturalLanguageResult, setNaturalLanguageResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'nlp' | 'testing'>('overview');

  const systems: SystemCard[] = [
    {
      id: 'excel_intelligence',
      name: 'Excel Intelligence',
      nameAr: 'ذكاء Excel',
      icon: FileSpreadsheet,
      description: 'اكتشاف وتحليل ملفات Excel تلقائياً',
      status: false,
      color: 'green',
    },
    {
      id: 'item_classifier',
      name: 'Item Classifier',
      nameAr: 'مصنف البنود',
      icon: Tags,
      description: 'تصنيف البنود في 3 طبقات',
      status: false,
      color: 'blue',
    },
    {
      id: 'productivity_database',
      name: 'Productivity Database',
      nameAr: 'قاعدة الإنتاجية',
      icon: TrendingUp,
      description: 'معدلات الإنتاجية الموثوقة',
      status: false,
      color: 'purple',
    },
    {
      id: 'item_analyzer',
      name: 'Item Analyzer',
      nameAr: 'محلل البنود',
      icon: Microscope,
      description: 'تحليل عميق للبنود',
      status: false,
      color: 'yellow',
    },
    {
      id: 'relationship_engine',
      name: 'Relationship Engine',
      nameAr: 'محرك العلاقات',
      icon: Network,
      description: 'شبكة التبعيات + المسار الحرج',
      status: false,
      color: 'red',
    },
    {
      id: 'scheduler',
      name: 'Comprehensive Scheduler',
      nameAr: 'المجدول الشامل',
      icon: Calendar,
      description: 'جدولة كاملة مع Gantt',
      status: false,
      color: 'indigo',
    },
    {
      id: 'compliance_checker',
      name: 'SBC Compliance Checker',
      nameAr: 'فاحص كود البناء',
      icon: ShieldCheck,
      description: 'فحص الامتثال لكود البناء السعودي',
      status: false,
      color: 'orange',
    },
    {
      id: 's_curve_generator',
      name: 'S-Curve Generator',
      nameAr: 'مولد منحنى S',
      icon: Activity,
      description: 'منحنى S (مخطط/فعلي/مالي)',
      status: false,
      color: 'pink',
    },
    {
      id: 'request_parser',
      name: 'Request Parser',
      nameAr: 'محلل الطلبات',
      icon: MessageSquare,
      description: 'تحليل اللغة الطبيعية',
      status: false,
      color: 'teal',
    },
    {
      id: 'request_executor',
      name: 'Request Executor',
      nameAr: 'منفذ الطلبات',
      icon: Zap,
      description: 'تنفيذ موحد لجميع الأنظمة',
      status: false,
      color: 'cyan',
    },
  ];

  useEffect(() => {
    console.log('NOUFALBackendHub mounted, checking health...');
    console.log('API Base URL:', noufalAPI['baseUrl'] || 'undefined');
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      console.log('Checking backend health...');
      const [healthResponse, statusResponse] = await Promise.all([
        noufalAPI.healthCheck(),
        noufalAPI.getSystemStatus(),
      ]);

      console.log('Health response:', healthResponse);
      console.log('Status response:', statusResponse);

      setSystemStatus({
        health: healthResponse,
        status: statusResponse.data,
      });
    } catch (error) {
      console.error('Failed to check system health:', error);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await noufalAPI.uploadFile(selectedFile);
      setUploadResult(result);
      alert('✅ تم رفع وتحليل الملف بنجاح!');
    } catch (error) {
      alert('❌ فشل رفع الملف');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNaturalLanguageRequest = async () => {
    if (!naturalLanguageInput.trim()) return;

    setLoading(true);
    try {
      const result = await noufalAPI.executeRequest(naturalLanguageInput);
      setNaturalLanguageResult(result);
    } catch (error) {
      alert('❌ فشل تنفيذ الطلب');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSystemsWithStatus = () => {
    if (!systemStatus?.status?.systems) return systems;

    return systems.map((system) => ({
      ...system,
      status: systemStatus.status.systems[system.id] || false,
    }));
  };

  const activeSystemsCount = getSystemsWithStatus().filter((s) => s.status).length;
  const systemsPercentage = Math.round((activeSystemsCount / systems.length) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🚀 نظام NOUFAL المتكامل</h1>
            <p className="text-indigo-100">
              مركز التحكم في الـ 10 أنظمة الذكية للهندسة الإنشائية
            </p>
          </div>
          <div className="text-left">
            <div className="text-5xl font-bold">{activeSystemsCount}/10</div>
            <div className="text-indigo-200">أنظمة نشطة</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white/20 rounded-full h-4 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500 rounded-full"
            style={{ width: `${systemsPercentage}%` }}
          />
        </div>
        <div className="text-right mt-2 text-indigo-100 text-sm">{systemsPercentage}% جاهز</div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { id: 'upload', label: 'رفع الملفات', icon: Upload },
            { id: 'nlp', label: 'اللغة الطبيعية', icon: MessageSquare },
            { id: 'testing', label: 'الاختبارات', icon: PlayCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSystemsWithStatus().map((system) => {
              const Icon = system.icon;
              return (
                <div
                  key={system.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg bg-${system.color}-100 dark:bg-${system.color}-900/30`}
                    >
                      <Icon className={`text-${system.color}-600`} size={24} />
                    </div>
                    {system.status ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-gray-400" size={20} />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {system.nameAr}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {system.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{system.name}</p>
                </div>
              );
            })}
          </div>

          {/* System Info */}
          {systemStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="text-blue-600" />
                  <h3 className="font-bold">حالة الخادم</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {systemStatus.health.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Status: {systemStatus.health.status}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-purple-600" />
                  <h3 className="font-bold">الكاش</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p>ملف محمل: {systemStatus.status.cache.last_uploaded_file ? '✅' : '❌'}</p>
                  <p>تحليل: {systemStatus.status.cache.last_analysis ? '✅' : '❌'}</p>
                  <p>جدول: {systemStatus.status.cache.last_schedule ? '✅' : '❌'}</p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="text-green-600" />
                  <h3 className="font-bold">قاعدة البيانات</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {systemStatus.status.database.connected ? '✅ متصلة' : '❌ غير متصلة'}
                </p>
                <p className="text-xs text-gray-500 mt-2 truncate">
                  {systemStatus.status.database.path}
                </p>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={checkSystemHealth}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                جاري التحديث...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                تحديث الحالة
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">رفع وتحليل ملفات Excel</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium"
              >
                اختر ملف Excel
              </label>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
              )}
            </div>

            <button
              onClick={handleFileUpload}
              disabled={!selectedFile || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <PlayCircle size={20} />
                  رفع وتحليل
                </>
              )}
            </button>

            {uploadResult && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-bold mb-2">✅ نتيجة التحليل</h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(uploadResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NLP Tab */}
      {activeTab === 'nlp' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">واجهة اللغة الطبيعية</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اكتب طلبك بالعربية:</label>
              <textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="مثال: أنشئ جدول زمني للمشروع يبدأ في 2025-01-01"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-32"
              />
            </div>

            <div className="flex gap-2">
              {['أنشئ جدول زمني', 'حلل المقايسة', 'فحص الامتثال', 'منحنى S'].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setNaturalLanguageInput(suggestion)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handleNaturalLanguageRequest}
              disabled={!naturalLanguageInput.trim() || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  جاري التنفيذ...
                </>
              ) : (
                <>
                  <PlayCircle size={20} />
                  تنفيذ الطلب
                </>
              )}
            </button>

            {naturalLanguageResult && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-bold mb-2">📊 نتيجة التنفيذ</h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(naturalLanguageResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Testing Tab */}
      {activeTab === 'testing' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">اختبار الأنظمة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Health Check', endpoint: 'healthCheck', icon: Server },
              { name: 'System Status', endpoint: 'getSystemStatus', icon: CheckCircle },
              { name: 'Productivity Rates', endpoint: 'getProductivityRates', icon: TrendingUp },
            ].map((test) => (
              <button
                key={test.endpoint}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const result = await (noufalAPI as any)[test.endpoint]();
                    alert(`✅ ${test.name} نجح!\n\nالنتيجة في Console`);
                    console.log(`${test.name} Result:`, result);
                  } catch (error) {
                    alert(`❌ ${test.name} فشل`);
                    console.error(error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <test.icon size={24} className="text-indigo-600" />
                <span className="font-medium">{test.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
