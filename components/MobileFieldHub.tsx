import React, { useState } from 'react';
import {
  Smartphone,
  Camera,
  FileText,
  Users,
  Upload,
  CheckCircle,
  Clock,
  MapPin,
  Loader,
  AlertCircle
} from 'lucide-react';

export const MobileFieldHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily_report');
  const [projectId, setProjectId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'daily_report', name: 'تقرير يومي', icon: FileText },
    { id: 'photos', name: 'الصور', icon: Camera },
    { id: 'attendance', name: 'الحضور', icon: Users },
    { id: 'sync', name: 'المزامنة', icon: Upload },
  ];

  const [dailyReport, setDailyReport] = useState({
    weather: '',
    activities: '',
    workers_count: '',
    issues: '',
    notes: ''
  });

  const submitDailyReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const API_BASE = window.location.origin.replace('3000', '5000');
      const response = await fetch(`${API_BASE}/api/mobile/daily-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: parseInt(projectId),
          engineer_id: 1,
          date: new Date().toISOString().split('T')[0],
          ...dailyReport
        })
      });

      if (!response.ok) throw new Error('فشل إرسال التقرير');

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setDailyReport({
          weather: '',
          activities: '',
          workers_count: '',
          issues: '',
          notes: ''
        });
      } else {
        throw new Error(result.error || 'خطأ في إرسال التقرير');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDailyReportTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            التقرير اليومي - {new Date().toLocaleDateString('ar-SA')}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          سجل أنشطة الموقع اليومية
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            حالة الطقس
          </label>
          <select
            value={dailyReport.weather}
            onChange={(e) => setDailyReport({ ...dailyReport, weather: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">اختر حالة الطقس</option>
            <option value="sunny">مشمس</option>
            <option value="cloudy">غائم</option>
            <option value="rainy">ممطر</option>
            <option value="hot">حار</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            عدد العمال
          </label>
          <input
            type="number"
            value={dailyReport.workers_count}
            onChange={(e) => setDailyReport({ ...dailyReport, workers_count: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="عدد العمال في الموقع"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          الأنشطة المنفذة
        </label>
        <textarea
          value={dailyReport.activities}
          onChange={(e) => setDailyReport({ ...dailyReport, activities: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="اكتب تفاصيل الأنشطة المنفذة اليوم..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          المشاكل والعوائق
        </label>
        <textarea
          value={dailyReport.issues}
          onChange={(e) => setDailyReport({ ...dailyReport, issues: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="سجل أي مشاكل أو عوائق..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ملاحظات إضافية
        </label>
        <textarea
          value={dailyReport.notes}
          onChange={(e) => setDailyReport({ ...dailyReport, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="أي ملاحظات أخرى..."
        />
      </div>

      <button
        onClick={submitDailyReport}
        disabled={loading}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            إرسال التقرير
          </>
        )}
      </button>
    </div>
  );

  const renderPhotosTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">رفع صور الموقع</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          التقط صور للتقدم والمشاكل في الموقع
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          اضغط لالتقاط صورة أو اختر من المعرض
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          رفع صورة
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Placeholder for uploaded photos */}
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );

  const renderAttendanceTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">تسجيل الحضور</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          سجل حضور وانصراف العمال والموظفين
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                الوقت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                محمد أحمد
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                07:00 ص
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  حاضر
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSyncTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">مزامنة البيانات</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          مزامنة البيانات المحفوظة محلياً مع السيرفر
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">تقارير يومية غير متزامنة</span>
          <span className="font-bold text-blue-600">3</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">صور غير مرفوعة</span>
          <span className="font-bold text-blue-600">12</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">سجلات حضور محلية</span>
          <span className="font-bold text-blue-600">7</span>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Upload className="w-5 h-5" />
        مزامنة الآن
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Smartphone className="w-8 h-8" />
          مركز العمليات الميدانية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          واجهة التطبيق الميداني لإدارة أنشطة الموقع
        </p>
      </div>

      {/* Project Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          المشروع الحالي
        </label>
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="معرف المشروع"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-bold">خطأ</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <p className="font-bold">تم الإرسال بنجاح!</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {activeTab === 'daily_report' && renderDailyReportTab()}
        {activeTab === 'photos' && renderPhotosTab()}
        {activeTab === 'attendance' && renderAttendanceTab()}
        {activeTab === 'sync' && renderSyncTab()}
      </div>
    </div>
  );
};

export default MobileFieldHub;
