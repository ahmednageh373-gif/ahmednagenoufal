import React, { useState, useCallback, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  BarChart3,
  FileText,
  Zap,
  Brain,
  Settings,
  Play,
  RefreshCw
} from 'lucide-react';

/**
 * NOUFAL Integrated System
 * النظام المتكامل الذي يربط React Frontend مع Python Backend
 * 
 * Backend APIs Available:
 * 1. POST /api/upload - رفع ملفات Excel
 * 2. POST /api/analyze-boq - تحليل BOQ كامل
 * 3. POST /api/classify - تصنيف البنود
 * 4. POST /api/generate-schedule - إنشاء جدول زمني
 * 5. POST /api/gantt-data - بيانات Gantt Chart
 * 6. POST /api/generate-s-curve - منحنى S-Curve
 * 7. POST /api/check-sbc-compliance - فحص الامتثال SBC
 * 8. GET  /api/productivity-rates - معدلات الإنتاجية
 * 9. POST /api/execute-request - تنفيذ طلبات ذكية
 * 10. POST /api/automations/trigger - تفعيل الأتمتة
 */

// Backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// TypeScript Interfaces
interface BOQItem {
  item_number?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price?: number;
  total_price?: number;
  category?: string;
}

interface ScheduleActivity {
  id: number;
  activity_name: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  progress: number;
  is_critical: boolean;
  dependencies: number[];
}

interface SCurveData {
  date: string;
  planned_progress: number;
  actual_progress?: number;
  days_elapsed: number;
}

interface AnalysisResult {
  items: BOQItem[];
  schedule?: ScheduleActivity[];
  s_curve?: SCurveData[];
  compliance?: any;
  summary?: {
    total_items: number;
    total_quantity: number;
    total_cost: number;
    project_duration: number;
    critical_activities: number;
  };
}

const NOUFALIntegratedSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'analyze' | 'schedule' | 'scurve' | 'automation'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check Backend Health
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  // Upload File
  const handleFileUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      setProgress(50);

      if (!response.ok) {
        throw new Error('فشل رفع الملف');
      }

      const data = await response.json();
      setProgress(100);
      
      // عرض رسالة نجاح
      alert(`✅ تم رفع الملف بنجاح!\n📁 ${data.filename}\n📊 ${data.items_count} بند`);
      
      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      setIsProcessing(false);
    }
  };

  // Analyze BOQ
  const handleAnalyzeBOQ = async () => {
    if (!file) {
      alert('⚠️ يرجى رفع ملف Excel أولاً');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(20);

      const response = await fetch(`${API_BASE_URL}/api/analyze-boq`, {
        method: 'POST',
        body: formData
      });

      setProgress(60);

      if (!response.ok) {
        throw new Error('فشل تحليل BOQ');
      }

      const data = await response.json();
      
      setProgress(100);
      setResult({
        items: data.items || [],
        summary: data.summary
      });

      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في التحليل');
      setIsProcessing(false);
    }
  };

  // Generate Schedule
  const handleGenerateSchedule = async () => {
    if (!result?.items || result.items.length === 0) {
      alert('⚠️ يرجى تحليل BOQ أولاً');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: 1,
          boq_items: result.items,
          start_date: new Date().toISOString().split('T')[0],
          working_days_per_week: 6
        })
      });

      setProgress(50);

      if (!response.ok) {
        throw new Error('فشل إنشاء الجدول الزمني');
      }

      const data = await response.json();
      
      setProgress(100);
      setResult(prev => ({
        ...prev!,
        schedule: data.activities,
        summary: {
          ...prev!.summary!,
          project_duration: data.total_duration_days,
          critical_activities: data.critical_path?.length || 0
        }
      }));

      alert(`✅ تم إنشاء الجدول الزمني!\n📅 ${data.total_duration_days} يوم\n🔴 ${data.critical_path?.length || 0} نشاط حرج`);

      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إنشاء الجدول');
      setIsProcessing(false);
    }
  };

  // Generate S-Curve
  const handleGenerateSCurve = async () => {
    if (!result?.schedule) {
      alert('⚠️ يرجى إنشاء الجدول الزمني أولاً');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const startDate = result.schedule[0]?.start_date || new Date().toISOString().split('T')[0];
      const duration = result.summary?.project_duration || 90;
      const endDate = new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const response = await fetch(`${API_BASE_URL}/api/generate-s-curve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: 1,
          start_date: startDate,
          end_date: endDate,
          num_points: 50
        })
      });

      setProgress(50);

      if (!response.ok) {
        throw new Error('فشل إنشاء منحنى S-Curve');
      }

      const data = await response.json();
      
      setProgress(100);
      setResult(prev => ({
        ...prev!,
        s_curve: data.planned_curve
      }));

      alert(`✅ تم إنشاء منحنى S-Curve!\n📊 ${data.planned_curve.length} نقطة`);

      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إنشاء المنحنى');
      setIsProcessing(false);
    }
  };

  // Check SBC Compliance
  const handleCheckCompliance = async () => {
    if (!result?.items) {
      alert('⚠️ يرجى تحليل BOQ أولاً');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/check-sbc-compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: result.items
        })
      });

      if (!response.ok) {
        throw new Error('فشل فحص الامتثال');
      }

      const data = await response.json();
      
      setResult(prev => ({
        ...prev!,
        compliance: data
      }));

      const complianceRate = (data.compliant_count / data.total_checked * 100).toFixed(1);
      alert(`✅ تم فحص الامتثال لـ SBC 2024!\n\n` +
            `✓ متوافق: ${data.compliant_count}\n` +
            `✗ غير متوافق: ${data.non_compliant_count}\n` +
            `📊 نسبة الامتثال: ${complianceRate}%`);

      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في فحص الامتثال');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                🏗️ نظام NOUFAL المتكامل
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                ربط كامل مع Python Backend (12 نظام)
              </p>
            </div>
          </div>

          {/* Backend Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              backendStatus === 'online' ? 'bg-green-500 animate-pulse' :
              backendStatus === 'offline' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Backend: {
                backendStatus === 'online' ? 'متصل' :
                backendStatus === 'offline' ? 'غير متصل' :
                'جاري الفحص...'
              }
            </span>
            <button
              onClick={checkBackendHealth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Backend Offline Warning */}
        {backendStatus === 'offline' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  ⚠️ Backend غير متصل
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  يرجى تشغيل Backend server:
                  <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded ml-2">
                    cd backend && python app.py
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Available Systems */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">✨ الأنظمة المتاحة (12)</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              'Excel Intelligence',
              'Item Classifier',
              'Productivity DB',
              'Item Analyzer',
              'Relationship Engine',
              'Scheduler',
              'SBC Compliance',
              'S-Curve Generator',
              'Request Parser',
              'Request Executor',
              'Automation Engine',
              'Automation Templates'
            ].map((system, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle2 className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">{system}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 inline-flex gap-2">
          {[
            { id: 'upload', icon: Upload, label: 'رفع ملف' },
            { id: 'analyze', icon: Brain, label: 'تحليل BOQ' },
            { id: 'schedule', icon: Calendar, label: 'الجدول الزمني' },
            { id: 'scurve', icon: TrendingUp, label: 'منحنى S-Curve' },
            { id: 'automation', icon: Zap, label: 'الأتمتة' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📂 رفع ملف Excel (BOQ)
            </h2>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                اسحب وأفلت ملف Excel هنا
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                أو انقر لاختيار ملف (.xlsx, .xls)
              </p>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isProcessing || backendStatus !== 'online'}
                />
                <span className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-lg shadow-lg transition-all cursor-pointer ${
                  backendStatus === 'online'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}>
                  <FileSpreadsheet className="w-6 h-6" />
                  اختر ملف Excel
                </span>
              </label>
            </div>

            {file && (
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    جاري المعالجة...
                  </span>
                  <span className="text-sm font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🧠 تحليل BOQ باستخدام AI
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={handleAnalyzeBOQ}
                  disabled={!file || isProcessing || backendStatus !== 'online'}
                  className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  تحليل BOQ
                </button>

                <button
                  onClick={handleCheckCompliance}
                  disabled={!result?.items || isProcessing || backendStatus !== 'online'}
                  className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  فحص SBC 2024
                </button>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    جاري التحليل...
                  </span>
                </div>
              )}

              {result?.items && result.items.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      نتائج التحليل ({result.items.length} بند)
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">#</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">البند</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">الكمية</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">الوحدة</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">الفئة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.quantity.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.unit}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                                {item.category || 'غير مصنف'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {result?.summary && (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.summary.total_items}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي البنود</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <FileText className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.summary.total_quantity?.toFixed(0) || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الكميات</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <Calendar className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.summary.project_duration || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مدة المشروع (يوم)</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.summary.critical_activities || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الأنشطة الحرجة</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📅 الجدول الزمني
            </h2>

            <button
              onClick={handleGenerateSchedule}
              disabled={!result?.items || isProcessing || backendStatus !== 'online'}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
            >
              <Calendar className="w-5 h-5" />
              إنشاء جدول زمني تلقائياً
            </button>

            {isProcessing && (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  جاري إنشاء الجدول الزمني...
                </span>
              </div>
            )}

            {result?.schedule && result.schedule.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    الأنشطة ({result.schedule.length})
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">النشاط</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">المدة</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">البداية</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">النهاية</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">التقدم</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((activity, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{activity.activity_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{activity.duration_days} يوم</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{activity.start_date}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{activity.end_date}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${activity.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {activity.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {activity.is_critical ? (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                حرج
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                عادي
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* S-Curve Tab */}
        {activeTab === 'scurve' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📈 منحنى S-Curve
            </h2>

            <button
              onClick={handleGenerateSCurve}
              disabled={!result?.schedule || isProcessing || backendStatus !== 'online'}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
            >
              <TrendingUp className="w-5 h-5" />
              إنشاء منحنى S-Curve
            </button>

            {isProcessing && (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  جاري إنشاء المنحنى...
                </span>
              </div>
            )}

            {result?.s_curve && result.s_curve.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  بيانات المنحنى ({result.s_curve.length} نقطة)
                </h3>
                <div className="h-96 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    📊 يمكن إضافة مكتبة Recharts أو D3.js لعرض المنحنى هنا
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              ⚡ الأتمتة الذكية
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تفعيل الأتمتة
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  تنفيذ تلقائي للمهام المتكررة
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  تفعيل
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  إعدادات الأتمتة
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  تخصيص قواعد وشروط التنفيذ
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  إعدادات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NOUFALIntegratedSystem;
