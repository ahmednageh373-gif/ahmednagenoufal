import React, { useState, useEffect } from 'react';
import { 
  Box, 
  FileText, 
  Database, 
  GitBranch, 
  Users, 
  DollarSign,
  Activity,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: 'active' | 'beta' | 'coming_soon';
}

interface PrimaveraMagicToolsProps {
  onToolSelect: (toolId: string) => void;
}

const PrimaveraMagicTools: React.FC<PrimaveraMagicToolsProps> = ({ onToolSelect }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect API URL - handle both port 3000 and 3001
  const API_BASE_URL = window.location.origin.replace(/300[01]/, '5000');

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/primavera-magic/tools`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Primavera Magic Tools');
      }

      const data = await response.json();
      if (data.success) {
        setTools(data.tools);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
      console.error('Error fetching tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'package': <Box className="w-8 h-8" />,
      'file-text': <FileText className="w-8 h-8" />,
      'database': <Database className="w-8 h-8" />,
      'git-branch': <GitBranch className="w-8 h-8" />,
      'users': <Users className="w-8 h-8" />,
      'dollar-sign': <DollarSign className="w-8 h-8" />,
      'activity': <Activity className="w-8 h-8" />,
    };
    return icons[iconName] || <Settings className="w-8 h-8" />;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'active': (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          نشط
        </span>
      ),
      'beta': (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          تجريبي
        </span>
      ),
      'coming_soon': (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          <Info className="w-3 h-3" />
          قريباً
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="mr-3 text-lg text-gray-700">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">خطأ في التحميل</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchTools}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border-r-4 border-blue-600">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Primavera Magic Tools ⚡
            </h1>
            <p className="text-lg text-gray-600">
              مجموعة أدوات متكاملة لإدارة مشاريع Primavera P6 بذكاء واحترافية
            </p>
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{tools.filter(t => t.status === 'active').length} أداة نشطة</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>تكامل كامل مع Primavera P6</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span>دعم قواعد بيانات متعددة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
              onClick={() => onToolSelect(tool.id)}
            >
              <div className="p-6">
                {/* Tool Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                    {getIconComponent(tool.icon)}
                  </div>
                  {getStatusBadge(tool.status)}
                </div>

                {/* Tool Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {tool.description}
                </p>

                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {tool.category}
                  </span>
                  <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
                    <span>فتح الأداة</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Hover Effect Bar */}
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => onToolSelect('documentation')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-right group"
          >
            <div className="flex items-center justify-between mb-3">
              <Info className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">الدليل الإرشادي</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              دليل شامل لاستخدام جميع الأدوات مع أمثلة عملية
            </p>
            <div className="flex items-center justify-end gap-2 text-blue-600 text-sm font-medium">
              <span>اقرأ المزيد</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onToolSelect('examples')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-right group"
          >
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">أمثلة عملية</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              أمثلة حقيقية وسيناريوهات استخدام متنوعة
            </p>
            <div className="flex items-center justify-end gap-2 text-green-600 text-sm font-medium">
              <span>شاهد الأمثلة</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onToolSelect('api-reference')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-right group"
          >
            <div className="flex items-center justify-between mb-3">
              <Database className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">مرجع API</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              وثائق تقنية كاملة لجميع نقاط النهاية
            </p>
            <div className="flex items-center justify-end gap-2 text-purple-600 text-sm font-medium">
              <span>استعرض الواجهات</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">ملاحظة مهمة</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                جميع الأدوات متكاملة مع قاعدة بيانات Primavera P6 وتدعم تنسيقات XER و Excel.
                تأكد من وجود اتصال صحيح بقاعدة البيانات قبل البدء.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaveraMagicTools;
