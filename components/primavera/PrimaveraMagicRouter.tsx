import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import PrimaveraMagicTools from './PrimaveraMagicTools';
import SDKMagicTool from './SDKMagicTool';
import XERMagicTool from './XERMagicTool';
import BOQMagicTool from './BOQMagicTool';
import PrimaveraMagicDocumentation from './PrimaveraMagicDocumentation';

// Placeholder components for remaining tools
const XLSMagicTool: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">XLS Magic Tool 📊</h1>
      <p className="text-gray-600">إنشاء تقارير Excel احترافية من بيانات Primavera</p>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">قريباً: واجهة متقدمة لإنشاء تقارير Excel مخصصة</p>
      </div>
    </div>
  </div>
);

const SQLMagicTool: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">SQL Magic Tool 🗃️</h1>
      <p className="text-gray-600">استعلامات SQL مباشرة على قاعدة بيانات Primavera</p>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">قريباً: محرر SQL متقدم مع استعلامات جاهزة</p>
      </div>
    </div>
  </div>
);

const WBSMagicTool: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">WBS Magic Tool 🌳</h1>
      <p className="text-gray-600">إدارة وتصميم هيكل WBS بطريقة مرئية</p>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">قريباً: مصمم WBS تفاعلي مع السحب والإفلات</p>
      </div>
    </div>
  </div>
);

const RSCMagicTool: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">RSC Magic Tool 👥</h1>
      <p className="text-gray-600">إدارة الموارد وتحليل الاستخدام</p>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">قريباً: لوحة تحكم شاملة لإدارة الموارد</p>
      </div>
    </div>
  </div>
);

const PrimaveraMagicRouter: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <PrimaveraMagicTools onToolSelect={setCurrentView} />;
      case 'sdk':
        return <SDKMagicTool />;
      case 'xer':
        return <XERMagicTool />;
      case 'xls':
        return <XLSMagicTool />;
      case 'sql':
        return <SQLMagicTool />;
      case 'wbs':
        return <WBSMagicTool />;
      case 'rsc':
        return <RSCMagicTool />;
      case 'boq':
        return <BOQMagicTool />;
      case 'documentation':
      case 'examples':
      case 'api-reference':
        return <PrimaveraMagicDocumentation />;
      default:
        return <PrimaveraMagicTools onToolSelect={setCurrentView} />;
    }
  };

  return (
    <div className="relative">
      {/* Back Button */}
      {currentView !== 'home' && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all text-gray-700 hover:text-blue-600 font-medium"
          >
            <ArrowRight className="w-5 h-5 transform rotate-180" />
            العودة إلى القائمة الرئيسية
          </button>
        </div>
      )}

      {/* Current View */}
      {renderView()}
    </div>
  );
};

export default PrimaveraMagicRouter;
