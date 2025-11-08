import React, { useState, useRef } from 'react';
import {
  Compass,
  Package,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Lightbulb,
  Settings,
  Camera,
  Upload,
  Loader2,
  Image as ImageIcon,
  X,
  Download
} from 'lucide-react';

interface SiteImage {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  analysis?: {
    description: string;
    issues: string[];
    recommendations: string[];
    quality_score: number;
    safety_concerns: string[];
    compliance_status: string;
  };
  uploadedAt: Date;
}

export const DesignExecutionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [projectId, setProjectId] = useState('1');
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: SiteImage[] = Array.from(files).map(file => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const,
      uploadedAt: new Date()
    }));

    setSiteImages(prev => [...newImages, ...prev]);

    // Auto-analyze each image
    newImages.forEach(img => analyzeImage(img));
  };

  // Analyze image using AI
  const analyzeImage = async (image: SiteImage) => {
    setSiteImages(prev => 
      prev.map(img => img.id === image.id ? { ...img, status: 'analyzing' as const } : img)
    );

    try {
      // Simulate AI analysis - في الإنتاج، استخدم understand_images tool
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnalysis = {
        description: 'موقع بناء سكني قيد التنفيذ، تظهر أعمال الهيكل الخرساني المسلح مع صب الأعمدة والجسور',
        issues: [
          'عدم وجود حواجز أمان كافية حول منطقة الصب',
          'تكدس مواد البناء بشكل غير منظم',
          'عدم وضوح اللافتات التحذيرية'
        ],
        recommendations: [
          'تركيب حواجز أمان معتمدة حول مناطق العمل',
          'تنظيم مواد البناء في مناطق مخصصة',
          'وضع لافتات تحذيرية واضحة ومضيئة',
          'توفير معدات السلامة للعمال'
        ],
        quality_score: 75,
        safety_concerns: [
          'خطر السقوط من الارتفاعات',
          'عدم وجود حواجز حماية',
          'مواد بناء غير مؤمنة'
        ],
        compliance_status: 'يتطلب تحسين'
      };

      setSiteImages(prev => 
        prev.map(img => 
          img.id === image.id 
            ? { ...img, status: 'completed' as const, analysis: mockAnalysis } 
            : img
        )
      );
    } catch (error) {
      setSiteImages(prev => 
        prev.map(img => img.id === image.id ? { ...img, status: 'error' as const } : img)
      );
    }
  };

  // Remove image
  const removeImage = (imageId: string) => {
    setSiteImages(prev => {
      const img = prev.find(i => i.id === imageId);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== imageId);
    });
  };

  // Generate report
  const generateReport = () => {
    const reportContent = `
تقرير تفتيش الموقع
===================
المشروع: ${projectId}
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
عدد الصور: ${siteImages.length}

${siteImages.map((img, index) => `
صورة ${index + 1}
---------
الحالة: ${img.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
${img.analysis ? `
الوصف: ${img.analysis.description}

المشاكل المكتشفة:
${img.analysis.issues.map(issue => `• ${issue}`).join('\n')}

التوصيات:
${img.analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

درجة الجودة: ${img.analysis.quality_score}/100
حالة الامتثال: ${img.analysis.compliance_status}

مخاوف السلامة:
${img.analysis.safety_concerns.map(concern => `⚠️ ${concern}`).join('\n')}
` : 'التحليل قيد التقدم...'}
`).join('\n---\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site_inspection_report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSiteInspection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          📸 تفتيش الموقع بالذكاء الاصطناعي
        </h2>
        <div className="flex gap-3">
          {siteImages.length > 0 && (
            <button
              onClick={generateReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              تحميل التقرير
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            رفع صور
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          كيفية الاستخدام
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✅ ارفع صور الموقع - سيتم التحليل تلقائياً</li>
          <li>⚡ التحليل يعمل بشكل مستمر بدون توقف</li>
          <li>📊 احصل على تقرير عربي شامل فوري</li>
          <li>🔍 اكتشاف المشاكل والمخاطر تلقائياً</li>
          <li>💡 توصيات فورية لتحسين الجودة والسلامة</li>
        </ul>
      </div>

      {/* Stats */}
      {siteImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الصور</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{siteImages.length}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">قيد التحليل</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {siteImages.filter(img => img.status === 'analyzing').length}
                </p>
              </div>
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مكتمل</p>
                <p className="text-2xl font-bold text-green-600">
                  {siteImages.filter(img => img.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">متوسط الجودة</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {siteImages.filter(img => img.analysis).length > 0
                    ? Math.round(
                        siteImages
                          .filter(img => img.analysis)
                          .reduce((sum, img) => sum + (img.analysis?.quality_score || 0), 0) /
                          siteImages.filter(img => img.analysis).length
                      )
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {siteImages.map(image => (
          <div
            key={image.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {/* Image Preview */}
            <div className="relative h-64 bg-gray-100 dark:bg-gray-700">
              <img
                src={image.preview}
                alt="صورة الموقع"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {image.status === 'analyzing' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
                    <p className="font-bold">جاري التحليل...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {image.uploadedAt.toLocaleString('ar-SA')}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    image.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : image.status === 'analyzing'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : image.status === 'error'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {image.status === 'completed'
                    ? '✅ مكتمل'
                    : image.status === 'analyzing'
                    ? '⏳ قيد التحليل'
                    : image.status === 'error'
                    ? '❌ خطأ'
                    : '📤 جاري الرفع'}
                </span>
              </div>

              {image.analysis && (
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      📝 الوصف
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {image.analysis.description}
                    </p>
                  </div>

                  {/* Quality Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        ⭐ درجة الجودة
                      </h4>
                      <span className="text-lg font-bold text-blue-600">
                        {image.analysis.quality_score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          image.analysis.quality_score >= 80
                            ? 'bg-green-500'
                            : image.analysis.quality_score >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${image.analysis.quality_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Issues */}
                  {image.analysis.issues.length > 0 && (
                    <div>
                      <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">
                        ⚠️ المشاكل المكتشفة
                      </h4>
                      <ul className="space-y-1">
                        {image.analysis.issues.map((issue, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-1">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Safety Concerns */}
                  {image.analysis.safety_concerns.length > 0 && (
                    <div>
                      <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                        🛡️ مخاوف السلامة
                      </h4>
                      <ul className="space-y-1">
                        {image.analysis.safety_concerns.map((concern, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                          >
                            <span className="text-orange-500 mt-1">⚠️</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {image.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">
                        💡 التوصيات
                      </h4>
                      <ul className="space-y-1">
                        {image.analysis.recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                          >
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Compliance Status */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        حالة الامتثال:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          image.analysis.compliance_status === 'مطابق'
                            ? 'bg-green-100 text-green-800'
                            : image.analysis.compliance_status === 'يتطلب تحسين'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {image.analysis.compliance_status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {image.status === 'analyzing' && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">جاري تحليل الصورة بالذكاء الاصطناعي...</p>
                  <p className="text-xs mt-1">لن تتوقف الشاشة، يمكنك متابعة العمل</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {siteImages.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            لا توجد صور بعد
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ابدأ برفع صور الموقع للحصول على تحليل فوري باللغة العربية
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            رفع صور الموقع
          </button>
        </div>
      )}
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
