import React, { useState } from 'react';
import { Menu, X, Home, Calendar, DollarSign, AlertTriangle, MapPin, FileText, Settings } from 'lucide-react';

// Simple fallback app that works without lazy loading
export const SimpleApp: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: Home },
    { id: 'schedule', name: 'الجدول الزمني', icon: Calendar },
    { id: 'financial', name: 'الإدارة المالية', icon: DollarSign },
    { id: 'risks', name: 'إدارة المخاطر', icon: AlertTriangle },
    { id: 'site', name: 'متابعة الموقع', icon: MapPin },
    { id: 'docs', name: 'المستندات', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">مرحباً بك في نظام NOUFAL</h1>
              <p className="text-xl opacity-90">نظام إدارة المشاريع الهندسية المتكامل</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المشاريع النشطة</h3>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">8</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">قيد التنفيذ</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">المهام</h3>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-300" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">مهمة نشطة</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">الميزانية</h3>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">5.2M</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">ريال سعودي</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">التقدم</h3>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">68%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">معدل الإنجاز</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🚀 الميزات الرئيسية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">إدارة المشاريع</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">تتبع شامل لجميع مشاريعك الهندسية</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">الجداول الزمنية</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">تخطيط ومتابعة الجداول الزمنية</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">الإدارة المالية</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">متابعة الميزانيات والمصروفات</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">إدارة المستندات</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">تنظيم وأرشفة المستندات الهندسية</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-dashed border-green-300 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">✅ النظام يعمل بنجاح!</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    جميع الأنظمة الفرعية جاهزة. اختر قسماً من القائمة الجانبية للبدء.
                  </p>
                </div>
                <div className="text-6xl">🎉</div>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">📅 الجدول الزمني</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              قم بإنشاء ومتابعة الجداول الزمنية للمشاريع الهندسية
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-900 dark:text-blue-200">
                🔧 هذا القسم قيد التطوير. سيتم إضافة مخططات Gantt وتتبع المهام قريباً.
              </p>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">💰 الإدارة المالية</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              إدارة الميزانيات والمصروفات ومتابعة التكاليف
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">الإيرادات</p>
                <p className="text-2xl font-bold">5,200,000 ريال</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">المصروفات</p>
                <p className="text-2xl font-bold">3,500,000 ريال</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">الصافي</p>
                <p className="text-2xl font-bold">1,700,000 ريال</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🚧 قيد التطوير</h2>
            <p className="text-gray-600 dark:text-gray-300">هذا القسم سيكون متاحاً قريباً</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              نظام NOUFAL للمشاريع الهندسية
            </h1>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">متصل</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } lg:relative lg:translate-x-0 mt-[73px]`}
        >
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 mt-[73px]">
          {renderContent()}
        </main>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
