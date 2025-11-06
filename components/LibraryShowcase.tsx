/**
 * Library Showcase Component
 * عرض توضيحي لجميع المكتبات
 * 
 * Demonstrates all integrated handlers in action
 */

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Box, 
  BarChart3,
  FileSpreadsheet,
  FileCode,
  Layers,
  TrendingUp,
  Globe,
  Zap,
  CheckCircle2
} from '../lucide-icons';

import {
  AutoCADHandler,
  AdvancedExcelHandler,
  AdvancedPDFHandler,
  Visualization3DHandler,
  ArabicTextHandler,
  ProjectAnalyticsHandler,
  IntegratedFileManager
} from '../services/integratedHandlers';

type DemoSection = 'autocad' | 'excel' | 'pdf' | '3d' | 'arabic' | 'analytics' | 'integrated';

export default function LibraryShowcase() {
  const [activeSection, setActiveSection] = useState<DemoSection>('integrated');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const viewer3DRef = useRef<HTMLDivElement>(null);

  // Demo Data
  const demoTasks = [
    { name: 'تحليل المتطلبات', start: '2025-01-01', end: '2025-01-10', duration: 10, progress: 100, assignee: 'أحمد' },
    { name: 'التصميم المعماري', start: '2025-01-11', end: '2025-01-25', duration: 15, progress: 80, assignee: 'فاطمة' },
    { name: 'التصميم الإنشائي', start: '2025-01-26', end: '2025-02-10', duration: 16, progress: 50, assignee: 'محمد' },
    { name: 'تنفيذ الأساسات', start: '2025-02-11', end: '2025-02-28', duration: 18, progress: 30, assignee: 'خالد' },
    { name: 'البناء والتشييد', start: '2025-03-01', end: '2025-04-15', duration: 45, progress: 10, assignee: 'سارة' }
  ];

  const demoData = [
    { 'رقم البند': '1', 'الوصف': 'حفر أساسات', 'الكمية': 150, 'الوحدة': 'م3', 'السعر': 80, 'الإجمالي': 12000 },
    { 'رقم البند': '2', 'الوصف': 'خرسانة مسلحة', 'الكمية': 200, 'الوحدة': 'م3', 'السعر': 350, 'الإجمالي': 70000 },
    { 'رقم البند': '3', 'الوصف': 'أعمال الطوب', 'الكمية': 500, 'الوحدة': 'م2', 'السعر': 120, 'الإجمالي': 60000 },
    { 'رقم البند': '4', 'الوصف': 'التشطيبات', 'الكمية': 300, 'الوحدة': 'م2', 'السعر': 200, 'الإجمالي': 60000 }
  ];

  const demoStats = {
    totalProjects: 15,
    activeProjects: 8,
    completedProjects: 7,
    totalValue: 5500000
  };

  // Handlers for each demo
  const handleAutoCADDemo = async () => {
    setLoading(true);
    try {
      // محاكاة قراءة ملف DXF
      const mockDXF = {
        entities: [
          { type: 'LWPOLYLINE', layer: 'Walls', vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }], thickness: 0.25 },
          { type: 'LWPOLYLINE', layer: 'Walls', vertices: [{ x: 0, y: 0 }, { x: 0, y: 8 }], thickness: 0.25 },
          { type: 'INSERT', name: 'Door-90', position: { x: 2, y: 0 } },
          { type: 'INSERT', name: 'Window-120', position: { x: 5, y: 0 } }
        ]
      };

      const walls = AutoCADHandler['extractWalls'](mockDXF);
      const openings = AutoCADHandler['extractOpenings'](mockDXF);

      setResults({
        type: 'autocad',
        data: {
          totalEntities: mockDXF.entities.length,
          walls: walls.length,
          openings: openings.length,
          details: { walls, openings }
        }
      });
    } catch (error) {
      console.error('AutoCAD demo error:', error);
    }
    setLoading(false);
  };

  const handleExcelDemo = async () => {
    setLoading(true);
    try {
      const blob = await AdvancedExcelHandler.createAdvancedExcel(demoData, {
        sheetName: 'بيانات المشروع',
        colorScheme: 'blue',
        rtl: true
      });

      setResults({
        type: 'excel',
        data: {
          size: `${(blob.size / 1024).toFixed(2)} KB`,
          rows: demoData.length,
          download: blob
        }
      });
    } catch (error) {
      console.error('Excel demo error:', error);
    }
    setLoading(false);
  };

  const handleGanttDemo = async () => {
    setLoading(true);
    try {
      const blob = await AdvancedExcelHandler.createGanttChart(demoTasks);

      setResults({
        type: 'gantt',
        data: {
          size: `${(blob.size / 1024).toFixed(2)} KB`,
          tasks: demoTasks.length,
          download: blob
        }
      });
    } catch (error) {
      console.error('Gantt demo error:', error);
    }
    setLoading(false);
  };

  const handleDashboardDemo = async () => {
    setLoading(true);
    try {
      const blob = await AdvancedExcelHandler.createDashboard(demoStats);

      setResults({
        type: 'dashboard',
        data: {
          size: `${(blob.size / 1024).toFixed(2)} KB`,
          stats: demoStats,
          download: blob
        }
      });
    } catch (error) {
      console.error('Dashboard demo error:', error);
    }
    setLoading(false);
  };

  const handlePDFDemo = async () => {
    setLoading(true);
    try {
      const pdfData = {
        title: 'تقرير المشروع الشامل',
        stats: {
          'المشاريع': 15,
          'النشطة': 8,
          'المكتملة': 7,
          'القيمة': '5.5M'
        },
        table: {
          headers: ['رقم البند', 'الوصف', 'الكمية', 'السعر', 'الإجمالي'],
          rows: demoData.map(d => Object.values(d))
        }
      };

      const blob = await AdvancedPDFHandler.createAdvancedReport(pdfData);

      setResults({
        type: 'pdf',
        data: {
          size: `${(blob.size / 1024).toFixed(2)} KB`,
          pages: 1,
          download: blob
        }
      });
    } catch (error) {
      console.error('PDF demo error:', error);
    }
    setLoading(false);
  };

  const handle3DDemo = () => {
    setLoading(true);
    try {
      if (viewer3DRef.current) {
        // تنظيف المحتوى السابق
        viewer3DRef.current.innerHTML = '';

        const walls = [
          { length: 10, height: 3, thickness: 0.25, position: { x: 0, y: 0, z: 0 } },
          { length: 8, height: 3, thickness: 0.25, position: { x: 5, y: 0, z: -4 } },
          { length: 10, height: 3, thickness: 0.25, position: { x: 0, y: 0, z: -8 } },
          { length: 8, height: 3, thickness: 0.25, position: { x: -5, y: 0, z: -4 } }
        ];

        const visualization = Visualization3DHandler.createBuildingVisualization(
          walls,
          viewer3DRef.current
        );

        setResults({
          type: '3d',
          data: {
            walls: walls.length,
            renderer: 'WebGL',
            interactive: true
          }
        });
      }
    } catch (error) {
      console.error('3D demo error:', error);
    }
    setLoading(false);
  };

  const handleArabicDemo = () => {
    setLoading(true);
    try {
      const text = 'مشروع بناء فيلا سكنية بمساحة 500 متر مربع';
      const textWithNumbers = 'السعر: 123456 ريال';
      const date = new Date();

      setResults({
        type: 'arabic',
        data: {
          isArabic: ArabicTextHandler.isArabic(text),
          noDiacritics: ArabicTextHandler.removeDiacritics(text),
          arabicNumbers: ArabicTextHandler.convertNumbersToArabic(textWithNumbers),
          englishNumbers: ArabicTextHandler.convertNumbersToEnglish('١٢٣٤٥٦'),
          currency: ArabicTextHandler.formatCurrency(123456),
          hijriDate: ArabicTextHandler.formatHijriDate(date)
        }
      });
    } catch (error) {
      console.error('Arabic demo error:', error);
    }
    setLoading(false);
  };

  const handleAnalyticsDemo = () => {
    setLoading(true);
    try {
      const criticalPath = ProjectAnalyticsHandler.calculateCriticalPath(demoTasks);
      const risks = ProjectAnalyticsHandler.analyzeRisks(demoTasks);
      const completion = ProjectAnalyticsHandler.calculateCompletionRate(demoTasks);

      setResults({
        type: 'analytics',
        data: {
          criticalPath: criticalPath.criticalPath.length,
          duration: criticalPath.duration,
          risks: risks.totalRisks,
          highRisks: risks.highSeverity,
          completion: `${completion}%`
        }
      });
    } catch (error) {
      console.error('Analytics demo error:', error);
    }
    setLoading(false);
  };

  const handleDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'integrated' as DemoSection, name: 'عرض متكامل', icon: Zap, color: 'from-purple-600 to-pink-600' },
    { id: 'autocad' as DemoSection, name: 'AutoCAD/DXF', icon: Layers, color: 'from-blue-600 to-cyan-600' },
    { id: 'excel' as DemoSection, name: 'Excel متقدم', icon: FileSpreadsheet, color: 'from-green-600 to-emerald-600' },
    { id: 'pdf' as DemoSection, name: 'PDF متقدم', icon: FileText, color: 'from-red-600 to-rose-600' },
    { id: '3d' as DemoSection, name: 'عرض 3D', icon: Box, color: 'from-amber-600 to-orange-600' },
    { id: 'arabic' as DemoSection, name: 'نصوص عربية', icon: Globe, color: 'from-indigo-600 to-purple-600' },
    { id: 'analytics' as DemoSection, name: 'تحليلات', icon: TrendingUp, color: 'from-teal-600 to-cyan-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            📚 عرض المكتبات المتكاملة
          </h1>
          <p className="text-xl text-slate-300">
            Integrated Libraries Showcase - 7 Powerful Handlers
          </p>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setResults(null);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeSection === section.id
                  ? `bg-gradient-to-br ${section.color} border-white shadow-lg shadow-${section.color}/50`
                  : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
              }`}
            >
              <section.icon className={`w-8 h-8 mx-auto mb-2 ${
                activeSection === section.id ? 'text-white' : 'text-slate-400'
              }`} />
              <p className={`text-sm font-bold ${
                activeSection === section.id ? 'text-white' : 'text-slate-300'
              }`}>
                {section.name}
              </p>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 min-h-[500px]">
          {activeSection === 'autocad' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">AutoCAD / DXF Handler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={handleAutoCADDemo}
                  className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  disabled={loading}
                >
                  {loading ? 'جاري المعالجة...' : 'تحليل ملف DXF تجريبي'}
                </button>
              </div>
              {results?.type === 'autocad' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">إجمالي الكيانات</p>
                    <p className="text-3xl font-bold text-white">{results.data.totalEntities}</p>
                  </div>
                  <div className="bg-green-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">الجدران</p>
                    <p className="text-3xl font-bold text-white">{results.data.walls}</p>
                  </div>
                  <div className="bg-purple-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">الفتحات</p>
                    <p className="text-3xl font-bold text-white">{results.data.openings}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'excel' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Advanced Excel Handler</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={handleExcelDemo}
                  className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  disabled={loading}
                >
                  إنشاء Excel متقدم
                </button>
                <button
                  onClick={handleGanttDemo}
                  className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  disabled={loading}
                >
                  إنشاء مخطط جانت
                </button>
                <button
                  onClick={handleDashboardDemo}
                  className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  disabled={loading}
                >
                  إنشاء لوحة تحكم
                </button>
              </div>
              {results && results.data.download && (
                <div className="bg-green-600/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold mb-2">الملف جاهز للتحميل!</p>
                      <p className="text-slate-300">الحجم: {results.data.size}</p>
                      {results.data.rows && <p className="text-slate-300">الصفوف: {results.data.rows}</p>}
                      {results.data.tasks && <p className="text-slate-300">المهام: {results.data.tasks}</p>}
                    </div>
                    <button
                      onClick={() => handleDownload(results.data.download, `NOUFAL_${results.type}_${Date.now()}.xlsx`)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      تحميل
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'pdf' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Advanced PDF Handler</h2>
              <button
                onClick={handlePDFDemo}
                className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all mb-6"
                disabled={loading}
              >
                إنشاء تقرير PDF متقدم
              </button>
              {results?.type === 'pdf' && results.data.download && (
                <div className="bg-red-600/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold mb-2">تقرير PDF جاهز!</p>
                      <p className="text-slate-300">الحجم: {results.data.size}</p>
                      <p className="text-slate-300">الصفحات: {results.data.pages}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(results.data.download, `NOUFAL_Report_${Date.now()}.pdf`)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      تحميل
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === '3d' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">3D Visualization</h2>
              <button
                onClick={handle3DDemo}
                className="p-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all mb-6"
                disabled={loading}
              >
                عرض مبنى ثلاثي الأبعاد
              </button>
              <div
                ref={viewer3DRef}
                className="w-full h-96 bg-slate-900 rounded-lg border-2 border-slate-700"
              />
            </div>
          )}

          {activeSection === 'arabic' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Arabic Text Handler</h2>
              <button
                onClick={handleArabicDemo}
                className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all mb-6"
                disabled={loading}
              >
                معالجة النصوص العربية
              </button>
              {results?.type === 'arabic' && (
                <div className="space-y-4">
                  <div className="bg-indigo-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-2">نص عربي؟</p>
                    <p className="text-white font-bold">{results.data.isArabic ? 'نعم ✓' : 'لا'}</p>
                  </div>
                  <div className="bg-purple-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-2">تحويل الأرقام إلى عربي</p>
                    <p className="text-white font-bold">{results.data.arabicNumbers}</p>
                  </div>
                  <div className="bg-blue-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-2">تنسيق العملة</p>
                    <p className="text-white font-bold">{results.data.currency}</p>
                  </div>
                  <div className="bg-teal-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-2">التاريخ الهجري</p>
                    <p className="text-white font-bold">{results.data.hijriDate}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Project Analytics</h2>
              <button
                onClick={handleAnalyticsDemo}
                className="p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all mb-6"
                disabled={loading}
              >
                تحليل المشروع
              </button>
              {results?.type === 'analytics' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">المسار الحرج</p>
                    <p className="text-3xl font-bold text-white">{results.data.criticalPath}</p>
                  </div>
                  <div className="bg-green-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">المدة (يوم)</p>
                    <p className="text-3xl font-bold text-white">{results.data.duration}</p>
                  </div>
                  <div className="bg-amber-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">المخاطر</p>
                    <p className="text-3xl font-bold text-white">{results.data.risks}</p>
                  </div>
                  <div className="bg-red-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">عالية الخطورة</p>
                    <p className="text-3xl font-bold text-white">{results.data.highRisks}</p>
                  </div>
                  <div className="bg-purple-600/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-300 mb-1">الإنجاز</p>
                    <p className="text-3xl font-bold text-white">{results.data.completion}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'integrated' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">🚀 Integrated Showcase</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6 rounded-xl border border-blue-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-6 h-6" />
                    AutoCAD/DXF
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      قراءة ملفات DXF
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      استخراج الجدران والفتحات
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      حساب الأبعاد
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 rounded-xl border border-green-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6" />
                    Excel متقدم
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تنسيق كامل مع RTL
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      مخططات جانت
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      لوحات تحكم تفاعلية
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 p-6 rounded-xl border border-red-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    PDF متقدم
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تقارير احترافية
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      دمج ملفات PDF
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      استخراج صفحات محددة
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 p-6 rounded-xl border border-amber-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Box className="w-6 h-6" />
                    عرض 3D
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Three.js integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تصور المباني
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تفاعلي بالكامل
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-6 rounded-xl border border-indigo-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-6 h-6" />
                    نصوص عربية
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      معالجة ثنائية الاتجاه
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تحويل الأرقام
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تنسيق التواريخ الهجرية
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 p-6 rounded-xl border border-teal-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    تحليلات المشروع
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      المسار الحرج (CPM)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تقدير التكاليف
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      تحليل المخاطر
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
