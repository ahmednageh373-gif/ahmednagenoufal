import React, { useState } from 'react';
import {
  Compass,
  Package,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Lightbulb,
  Settings
} from 'lucide-react';

export const DesignExecutionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [projectId, setProjectId] = useState('1');

  const tabs = [
    { id: 'packages', name: 'حزم التصميم', icon: Package },
    { id: 'compliance', name: 'فحص الامتثال', icon: CheckCircle },
    { id: 'value_engineering', name: 'هندسة القيمة', icon: TrendingUp },
    { id: 'modifications', name: 'التعديلات', icon: Settings },
  ];

  const renderPackages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          حزم التصميم
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Package className="w-5 h-5" />
          حزمة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'التصميم المعماري', status: 'approved', progress: 100, color: 'bg-green-500' },
          { name: 'التصميم الإنشائي', status: 'in_review', progress: 75, color: 'bg-yellow-500' },
          { name: 'التصميم الكهروميكانيكي', status: 'draft', progress: 45, color: 'bg-blue-500' },
        ].map((pkg, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                pkg.status === 'approved' ? 'bg-green-100 text-green-800' :
                pkg.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {pkg.status === 'approved' ? 'معتمد' :
                 pkg.status === 'in_review' ? 'قيد المراجعة' : 'مسودة'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              {pkg.name}
            </h3>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>التقدم</span>
                <span>{pkg.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${pkg.color} h-2 rounded-full transition-all`}
                  style={{ width: `${pkg.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                الحزمة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                التخصص
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                المصمم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                تاريخ الإصدار
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                PKG-ARCH-001
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                معماري
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                م. أحمد محمد
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                2024-11-15
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  معتمد
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          فحص الامتثال
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <CheckCircle className="w-5 h-5" />
          فحص جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'إجمالي الفحوصات', value: 45, icon: FileText, color: 'bg-blue-500' },
          { title: 'مطابق', value: 38, icon: CheckCircle, color: 'bg-green-500' },
          { title: 'ملاحظات', value: 5, icon: AlertTriangle, color: 'bg-yellow-500' },
          { title: 'غير مطابق', value: 2, icon: AlertTriangle, color: 'bg-red-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className={`${stat.color} rounded-full p-3 w-fit mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          آخر الفحوصات
        </h3>
        <div className="space-y-4">
          {[
            { item: 'ارتفاع الأسقف', code: 'SBC-304', status: 'pass', result: 'مطابق' },
            { item: 'عرض الممرات', code: 'SBC-501', status: 'pass', result: 'مطابق' },
            { item: 'مخارج الطوارئ', code: 'SBC-701', status: 'warning', result: 'ملاحظات' },
          ].map((check, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  check.status === 'pass' ? 'bg-green-100' :
                  check.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {check.status === 'pass' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className={`w-5 h-5 ${
                      check.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {check.item}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    كود: {check.code}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                check.status === 'pass' ? 'bg-green-100 text-green-800' :
                check.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {check.result}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderValueEngineering = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          مقترحات هندسة القيمة
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Lightbulb className="w-5 h-5" />
          مقترح جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'إجمالي المقترحات', value: 12, color: 'bg-blue-500' },
          { title: 'إجمالي التوفير', value: '2.5M SAR', color: 'bg-green-500' },
          { title: 'قيد الدراسة', value: 5, color: 'bg-yellow-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className={`${stat.color} rounded-full p-3 w-fit mb-3`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                المقترح
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                البديل الحالي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                البديل المقترح
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                التوفير المتوقع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                VE-001
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                حوائط بلوك أسمنتي
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                حوائط جبس بورد
              </td>
              <td className="px-6 py-4 text-sm font-bold text-green-600">
                450,000 SAR
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  موافق عليه
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                VE-002
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                نظام تكييف مركزي
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                نظام VRF
              </td>
              <td className="px-6 py-4 text-sm font-bold text-green-600">
                1,200,000 SAR
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  قيد الدراسة
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Compass className="w-8 h-8" />
          إدارة التصميم والتنفيذ
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة حزم التصميم وفحص الامتثال وهندسة القيمة
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

      {/* Tab Content */}
      <div>
        {activeTab === 'packages' && renderPackages()}
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'value_engineering' && renderValueEngineering()}
        {activeTab === 'modifications' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-400">
              قسم التعديلات قيد التطوير
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignExecutionManager;
