import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  FileSpreadsheet,
  FileImage,
  Mail,
  Share2,
  Eye,
  CheckCircle2
} from '../lucide-icons';

// TypeScript Interfaces
interface Report {
  id: string;
  title: string;
  type: 'financial' | 'progress' | 'team' | 'custom';
  period: string;
  generatedDate: string;
  status: 'ready' | 'generating' | 'scheduled';
  size: string;
  format: 'pdf' | 'excel' | 'word';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'financial' | 'progress' | 'team' | 'custom';
  fields: string[];
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const SmartReportsSystem: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'analytics'>('templates');

  // Report Templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'التقرير المالي الشامل',
      description: 'تقرير مفصل عن الميزانية والمصروفات والأرباح',
      icon: DollarSign,
      category: 'financial',
      fields: ['budget', 'expenses', 'profit', 'roi', 'forecasts']
    },
    {
      id: '2',
      name: 'تقرير التقدم والإنجاز',
      description: 'تتبع تقدم المشاريع والمهام المنجزة',
      icon: TrendingUp,
      category: 'progress',
      fields: ['completed_tasks', 'milestones', 'delays', 'performance']
    },
    {
      id: '3',
      name: 'تقرير أداء الفريق',
      description: 'تحليل إنتاجية وأداء أعضاء الفريق',
      icon: Users,
      category: 'team',
      fields: ['productivity', 'attendance', 'tasks_per_member', 'efficiency']
    },
    {
      id: '4',
      name: 'تقرير الجدول الزمني',
      description: 'تحليل الالتزام بالمواعيد والتأخيرات',
      icon: Clock,
      category: 'progress',
      fields: ['deadlines', 'delays', 'timeline_analysis', 'critical_path']
    },
    {
      id: '5',
      name: 'تقرير مخصص',
      description: 'إنشاء تقرير مخصص حسب احتياجاتك',
      icon: FileText,
      category: 'custom',
      fields: ['custom_fields']
    }
  ];

  // Generated Reports History
  const [reports] = useState<Report[]>([
    {
      id: '1',
      title: 'التقرير المالي - يناير 2025',
      type: 'financial',
      period: 'شهري',
      generatedDate: '2025-01-15',
      status: 'ready',
      size: '2.4 MB',
      format: 'pdf'
    },
    {
      id: '2',
      title: 'تقرير التقدم - Q4 2024',
      type: 'progress',
      period: 'ربع سنوي',
      generatedDate: '2024-12-31',
      status: 'ready',
      size: '1.8 MB',
      format: 'excel'
    },
    {
      id: '3',
      title: 'تقرير أداء الفريق - ديسمبر',
      type: 'team',
      period: 'شهري',
      generatedDate: '2024-12-01',
      status: 'ready',
      size: '1.2 MB',
      format: 'pdf'
    }
  ]);

  // Analytics Data for Charts
  const budgetData: ChartData[] = [
    { name: 'مصروفات', value: 68, color: '#ef4444' },
    { name: 'متبقي', value: 32, color: '#10b981' }
  ];

  const projectsData: ChartData[] = [
    { name: 'نشط', value: 12, color: '#3b82f6' },
    { name: 'مكتمل', value: 23, color: '#10b981' },
    { name: 'متأخر', value: 5, color: '#f59e0b' },
    { name: 'معلق', value: 8, color: '#6b7280' }
  ];

  // Generate Report Handler
  const handleGenerateReport = () => {
    if (!selectedTemplate) {
      alert('⚠️ يرجى اختيار نموذج تقرير أولاً');
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('✅ تم إنشاء التقرير بنجاح! يمكنك تنزيله من صفحة السجل.');
    }, 3000);
  };

  // Status Badge Component
  const StatusBadge: React.FC<{ status: Report['status'] }> = ({ status }) => {
    const statusConfig = {
      ready: { text: 'جاهز', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      generating: { text: 'جاري الإنشاء', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      scheduled: { text: 'مجدول', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
        {statusConfig[status].text}
      </span>
    );
  };

  // Format Badge Component
  const FormatBadge: React.FC<{ format: Report['format'] }> = ({ format }) => {
    const formatConfig = {
      pdf: { icon: FileText, color: 'text-red-600' },
      excel: { icon: FileSpreadsheet, color: 'text-green-600' },
      word: { icon: FileText, color: 'text-blue-600' }
    };

    const Icon = formatConfig[format].icon;

    return (
      <div className={`flex items-center gap-1 ${formatConfig[format].color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase">{format}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📊 نظام التقارير الذكية
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء وإدارة التقارير التفصيلية للمشاريع
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📋 نماذج التقارير
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📁 سجل التقارير
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📈 التحليلات
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Report Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              إعدادات التقرير
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  الفترة الزمنية
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="week">أسبوعي</option>
                  <option value="month">شهري</option>
                  <option value="quarter">ربع سنوي</option>
                  <option value="year">سنوي</option>
                </select>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  صيغة التقرير
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🌐 اللغة
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500">
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Report Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate === template.id;

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:scale-105 border-2 ${
                    isSelected
                      ? 'border-purple-500 shadow-purple-500/50'
                      : 'border-transparent hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-purple-500" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {template.fields.slice(0, 3).map((field, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"
                      >
                        {field}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{template.fields.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedTemplate || isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري إنشاء التقرير...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  إنشاء التقرير
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📁 سجل التقارير المنشأة
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    اسم التقرير
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الفترة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الصيغة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الحجم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {report.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {report.generatedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <FormatBadge format={report.format} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {report.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="تنزيل">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors" title="عرض">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="مشاركة">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="إرسال بالبريد">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">24</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي التقارير</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">8</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">تقارير هذا الشهر</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Download className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">156</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مرات التنزيل</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">+23%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">معدل النمو</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Budget Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                توزيع الميزانية
              </h3>
              <div className="space-y-3">
                {budgetData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                توزيع المشاريع
              </h3>
              <div className="space-y-3">
                {projectsData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{ width: `${(item.value / 48) * 100}%`, backgroundColor: item.color }}
                      />
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

export default SmartReportsSystem;
