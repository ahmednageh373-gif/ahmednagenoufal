import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Database,
  GitBranch,
  Users,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface XERData {
  project?: {
    proj_id: string;
    proj_short_name: string;
    plan_start_date: string;
    plan_end_date: string;
  };
  activities?: any[];
  wbs?: any[];
  resources?: any[];
  statistics?: {
    total_activities: number;
    total_wbs: number;
    total_resources: number;
  };
}

const XERMagicTool: React.FC = () => {
  const [xerFile, setXerFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [xerData, setXerData] = useState<XERData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'wbs' | 'resources'>('overview');

  const API_BASE_URL = window.location.origin.replace(/300[01]/, '5000');

  const handleParseXER = async () => {
    if (!xerFile) {
      setError('الرجاء اختيار ملف XER');
      return;
    }

    try {
      setParsing(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', xerFile);

      const response = await fetch(`${API_BASE_URL}/api/primavera-magic/xer/parse`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setXerData(data.data);
      } else {
        setError(data.error || 'فشل تحليل ملف XER');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحليل الملف');
    } finally {
      setParsing(false);
    }
  };

  const renderOverview = () => {
    if (!xerData) return null;

    return (
      <div className="space-y-6">
        {/* Project Info */}
        {xerData.project && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات المشروع</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">معرف المشروع:</span>
                <p className="font-medium text-gray-900">{xerData.project.proj_id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">اسم المشروع:</span>
                <p className="font-medium text-gray-900">{xerData.project.proj_short_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">تاريخ البداية:</span>
                <p className="font-medium text-gray-900">{xerData.project.plan_start_date}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">تاريخ النهاية:</span>
                <p className="font-medium text-gray-900">{xerData.project.plan_end_date}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {xerData.statistics && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{xerData.statistics.total_activities}</span>
              </div>
              <p className="text-blue-100">إجمالي الأنشطة</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <GitBranch className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{xerData.statistics.total_wbs}</span>
              </div>
              <p className="text-green-100">عناصر WBS</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{xerData.statistics.total_resources}</span>
              </div>
              <p className="text-purple-100">الموارد</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActivities = () => {
    if (!xerData?.activities || xerData.activities.length === 0) {
      return <p className="text-gray-500">لا توجد أنشطة</p>;
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">معرف النشاط</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">اسم النشاط</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">المدة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {xerData.activities.slice(0, 10).map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{activity.task_code || activity.activity_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{activity.task_name || activity.activity_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{activity.target_drtn_hr_cnt || activity.original_duration || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.status_code === 'TK_Active' ? 'bg-green-100 text-green-800' :
                      activity.status_code === 'TK_Complete' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status_code || 'غير محدد'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {xerData.activities.length > 10 && (
          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center">
            عرض 10 من {xerData.activities.length} نشاط
          </div>
        )}
      </div>
    );
  };

  const renderWBS = () => {
    if (!xerData?.wbs || xerData.wbs.length === 0) {
      return <p className="text-gray-500">لا توجد عناصر WBS</p>;
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">معرف WBS</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">المستوى</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {xerData.wbs.slice(0, 10).map((wbs, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{wbs.wbs_short_name || wbs.wbs_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{wbs.wbs_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{wbs.seq_num || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {xerData.wbs.length > 10 && (
          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center">
            عرض 10 من {xerData.wbs.length} عنصر WBS
          </div>
        )}
      </div>
    );
  };

  const renderResources = () => {
    if (!xerData?.resources || xerData.resources.length === 0) {
      return <p className="text-gray-500">لا توجد موارد</p>;
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">معرف المورد</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">النوع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {xerData.resources.slice(0, 10).map((resource, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{resource.rsrc_short_name || resource.resource_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{resource.rsrc_name || resource.resource_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{resource.rsrc_type || 'غير محدد'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {xerData.resources.length > 10 && (
          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center">
            عرض 10 من {xerData.resources.length} مورد
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-r-4 border-green-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">XER Magic Tool</h1>
              <p className="text-gray-600 mt-1">تحليل وعرض ملفات XER من Primavera P6</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">عن هذه الأداة</h4>
                <p className="text-green-800 text-sm leading-relaxed">
                  أداة قوية لتحليل ملفات XER (تنسيق تصدير Primavera P6). 
                  تستخرج معلومات المشروع، الأنشطة، WBS، والموارد بتفاصيل كاملة.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">رفع وتحليل ملف XER</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xer"
                onChange={(e) => setXerFile(e.target.files?.[0] || null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleParseXER}
                disabled={!xerFile || parsing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    تحليل
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              يدعم ملفات XER المصدرة من Primavera P6
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">خطأ</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {xerData && (
          <>
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">تم التحليل بنجاح!</h3>
                  <p className="text-green-700 mt-1">تم تحليل ملف XER واستخراج البيانات</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    نظرة عامة
                  </button>
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'activities'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    الأنشطة
                  </button>
                  <button
                    onClick={() => setActiveTab('wbs')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'wbs'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    WBS
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'resources'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    الموارد
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'activities' && renderActivities()}
                {activeTab === 'wbs' && renderWBS()}
                {activeTab === 'resources' && renderResources()}
              </div>
            </div>
          </>
        )}

        {/* Usage Guide */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">دليل الاستخدام</h2>
          </div>
          
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-purple-600" />
              كيفية استخدام XER Magic Tool
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mr-4">
              <li>قم بتصدير مشروعك من Primavera P6 بتنسيق XER</li>
              <li>اضغط على "اختر ملف" وحدد ملف XER</li>
              <li>اضغط على "تحليل" لبدء عملية التحليل</li>
              <li>استعرض البيانات في التبويبات المختلفة (نظرة عامة، الأنشطة، WBS، الموارد)</li>
              <li>يمكنك تصدير البيانات المستخرجة لمزيد من التحليل</li>
            </ol>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>ملاحظة:</strong> يدعم النظام ملفات XER المصدرة من Primavera P6 الإصدارات 6.0 وما بعدها.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XERMagicTool;
