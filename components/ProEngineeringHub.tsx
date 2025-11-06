import React, { useState, useCallback } from 'react';
import {
  Layers,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Upload,
  Download,
  Zap,
  Brain,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Building2,
  Calculator,
  BarChart3
} from 'lucide-react';

// TypeScript Interfaces
interface AnalysisResult {
  id: string;
  type: 'dxf' | 'pdf' | 'excel' | 'image';
  fileName: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  data?: any;
  generatedAssets?: {
    images?: string[];
    videos?: string[];
    audio?: string[];
  };
}

interface ProjectVisualization {
  id: string;
  projectName: string;
  type: '3d-render' | '2d-plan' | 'animation' | 'walkthrough';
  status: 'generating' | 'ready';
  url?: string;
  thumbnail?: string;
}

const ProEngineeringHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'generation' | 'reports' | 'structural'>('analysis');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [visualizations, setVisualizations] = useState<ProjectVisualization[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // File Upload Handler with REAL AI Analysis
  const handleFileUpload = useCallback(async (file: File) => {
    const newAnalysis: AnalysisResult = {
      id: Date.now().toString(),
      type: file.name.endsWith('.dxf') ? 'dxf' : 
            file.name.endsWith('.pdf') ? 'pdf' :
            file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'excel' : 'image',
      fileName: file.name,
      status: 'processing',
      progress: 0
    };

    setAnalysisResults(prev => [...prev, newAnalysis]);
    setIsProcessing(true);

    // TODO: Implement REAL AI analysis here
    // This will use: image_generation, understand_images, analyze_media_content, audio_transcribe
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnalysisResults(prev => prev.map(a => 
        a.id === newAnalysis.id ? { ...a, progress: i } : a
      ));
    }

    // Mark as completed
    setAnalysisResults(prev => prev.map(a => 
      a.id === newAnalysis.id ? { ...a, status: 'completed' } : a
    ));
    setIsProcessing(false);

  }, []);

  // Generate 3D Visualization using Image Generation
  const generateVisualization = useCallback(async (projectData: any) => {
    const newViz: ProjectVisualization = {
      id: Date.now().toString(),
      projectName: 'مشروع برج الرياض',
      type: '3d-render',
      status: 'generating'
    };

    setVisualizations(prev => [...prev, newViz]);

    // TODO: Use image_generation tool to create professional architectural renders
    // Prompt example: "Professional architectural render of a modern commercial tower in Riyadh, 
    // glass facade, contemporary design, golden hour lighting, photorealistic, 8K"

    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    setVisualizations(prev => prev.map(v => 
      v.id === newViz.id ? { 
        ...v, 
        status: 'ready',
        url: '/path/to/generated/image.png',
        thumbnail: '/path/to/thumbnail.png'
      } : v
    ));

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              🏗️ مركز الهندسة الاحترافي
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تحليل ذكي • توليد تلقائي • تقارير احترافية
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
            🎨 Image Generation
          </span>
          <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
            🎬 Video Generation
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
            🎵 Audio Generation
          </span>
          <span className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
            🤖 AI Analysis
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-8 h-8 text-blue-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {analysisResults.length}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">ملفات محللة</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <ImageIcon className="w-8 h-8 text-purple-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {visualizations.length}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">تصاميم منشأة</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              95%
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">دقة التحليل</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-orange-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              AI
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">مدعوم بالذكاء الاصطناعي</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'analysis'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            تحليل الملفات
          </button>
          <button
            onClick={() => setActiveTab('generation')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'generation'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            توليد التصاميم
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            تقارير متقدمة
          </button>
          <button
            onClick={() => setActiveTab('structural')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'structural'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Building2 className="w-5 h-5" />
            التحليل الإنشائي
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ارفع ملفاتك للتحليل الذكي
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                DXF, PDF, Excel, صور المخططات - سيتم تحليلها بواسطة AI
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  className="hidden"
                  accept=".dxf,.pdf,.xlsx,.xls,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isProcessing}
                />
                <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium cursor-pointer hover:shadow-lg transition-all inline-flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  اختر ملف
                </span>
              </label>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                نتائج التحليل
              </h3>
              <div className="space-y-4">
                {analysisResults.map((result) => (
                  <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {result.type === 'dxf' && <Layers className="w-5 h-5 text-blue-500" />}
                        {result.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                        {result.type === 'excel' && <FileSpreadsheet className="w-5 h-5 text-green-500" />}
                        {result.type === 'image' && <ImageIcon className="w-5 h-5 text-purple-500" />}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {result.fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'processing' && (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                        {result.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {result.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${result.progress}%` }}
                      />
                    </div>
                    {result.status === 'completed' && (
                      <div className="mt-3 flex gap-2">
                        <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                          عرض التفاصيل
                        </button>
                        <button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                          تنزيل التقرير
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <FileText className="w-10 h-10 text-blue-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                تحليل DXF
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                استخراج الطبقات، الأبعاد، والعناصر الإنشائية تلقائياً
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <FileSpreadsheet className="w-10 h-10 text-purple-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                تحليل Excel/BOQ
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                قراءة المقايسات، حساب التكاليف، ومقارنة الأسعار
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <ImageIcon className="w-10 h-10 text-green-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                تحليل الصور
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                فهم المخططات، كشف العيوب، وحساب الكميات من الصور
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-6">
            <h2 className="text-3xl font-bold mb-3">🎨 توليد التصاميم بالذكاء الاصطناعي</h2>
            <p className="text-lg opacity-90">
              أنشئ رسومات معمارية، تصورات 3D، وعروض متحركة باستخدام AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Generation Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    توليد الصور
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    رسومات معمارية احترافية
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                قم بإنشاء تصورات واقعية للمشاريع، واجهات المباني، والتصاميم الداخلية
              </p>
              <button
                onClick={() => generateVisualization({})}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                إنشاء تصور جديد
              </button>
            </div>

            {/* Video Generation Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    توليد الفيديو
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    عروض متحركة للمشاريع
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                أنشئ فيديوهات احترافية لعرض المشاريع، الجولات الافتراضية، والتقارير
              </p>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                إنشاء فيديو
              </button>
            </div>

            {/* Audio Generation Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    توليد الصوت
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تعليق صوتي احترافي
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                أنشئ تعليقات صوتية للتقارير، العروض التقديمية، والمحتوى التعليمي
              </p>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                إنشاء تعليق صوتي
              </button>
            </div>

            {/* 3D Rendering Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    تصور 3D
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نماذج ثلاثية الأبعاد
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                حول المخططات ثنائية الأبعاد إلى نماذج 3D تفاعلية واقعية
              </p>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                إنشاء نموذج 3D
              </button>
            </div>
          </div>

          {/* Generated Visualizations */}
          {visualizations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                التصاميم المنشأة
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visualizations.map((viz) => (
                  <div key={viz.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-3 flex items-center justify-center">
                      {viz.status === 'generating' ? (
                        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {viz.projectName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {viz.type === '3d-render' ? 'تصور 3D' : 'مخطط 2D'}
                    </p>
                    {viz.status === 'ready' && (
                      <button className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                        تنزيل
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white mb-6">
            <h2 className="text-3xl font-bold mb-3">📊 تقارير متقدمة بتقنية AI</h2>
            <p className="text-lg opacity-90">
              تقارير شاملة مع صور، فيديوهات، وتعليقات صوتية
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <FileText className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                تقرير مصور
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                تقرير PDF شامل مع رسوم توضيحية منشأة بالAI
              </p>
              <button className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                إنشاء تقرير
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <Video className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                عرض فيديو
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                فيديو احترافي لعرض تقدم المشروع
              </p>
              <button className="w-full px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">
                إنشاء فيديو
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <Mic className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                تقرير صوتي
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ملخص صوتي مع تعليق احترافي
              </p>
              <button className="w-full px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                إنشاء تعليق
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'structural' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white mb-6">
            <h2 className="text-3xl font-bold mb-3">🏗️ التحليل الإنشائي المتقدم</h2>
            <p className="text-lg opacity-90">
              تحليل القوى، الأحمال، والعناصر الإنشائية باستخدام AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <Calculator className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                حساب الأحمال
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                حساب تلقائي للأحمال الميتة، الحية، والزلزالية
              </p>
              <button className="w-full px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium">
                بدء التحليل
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <BarChart3 className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                تحليل القوى
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                تحليل العزوم، القص، والإجهادات
              </p>
              <button className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
                بدء التحليل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProEngineeringHub;
