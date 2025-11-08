import React, { useState } from 'react';
import { 
  Box, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ArrowRight,
  FileText,
  Database,
  Loader2
} from 'lucide-react';

interface Activity {
  activity_id: string;
  activity_name: string;
  wbs_id: string;
  original_duration: number;
  remaining_duration: number;
  actual_start?: string;
  actual_finish?: string;
  status: string;
}

const SDKMagicTool: React.FC = () => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = window.location.origin.replace(/300[01]/, '5000');

  const handleImport = async () => {
    if (!importFile) {
      setError('الرجاء اختيار ملف Excel');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch(`${API_BASE_URL}/api/primavera-magic/sdk/import-excel`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'فشل الاستيراد');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الاستيراد');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/primavera-magic/sdk/export-activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'excel',
          include_resources: true,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل التصدير');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `primavera_export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setResult({
        success: true,
        message: 'تم التصدير بنجاح',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التصدير');
    } finally {
      setExporting(false);
    }
  };

  const handleImportActivities = async () => {
    try {
      setImporting(true);
      setError(null);

      // Sample activities data
      const activities = [
        {
          activity_id: 'A1000',
          activity_name: 'Site Mobilization',
          wbs_id: 'WBS-01',
          original_duration: 5,
          remaining_duration: 5,
          status: 'Not Started',
        },
      ];

      const response = await fetch(`${API_BASE_URL}/api/primavera-magic/sdk/import-activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'فشل استيراد الأنشطة');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء استيراد الأنشطة');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-r-4 border-blue-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
              <Box className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SDK Magic Tool</h1>
              <p className="text-gray-600 mt-1">استيراد وتصدير البيانات من وإلى Primavera P6</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">عن هذه الأداة</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  تتيح لك هذه الأداة استيراد الأنشطة والموارد من Excel إلى Primavera P6، 
                  وتصدير البيانات من قاعدة البيانات إلى Excel أو تنسيقات أخرى.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">استيراد من Excel</h2>
          </div>

          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر ملف Excel
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      استيراد
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                يدعم تنسيقات: .xlsx, .xls
              </p>
            </div>

            {/* Quick Import Button */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">استيراد سريع (تجريبي)</h3>
              <button
                onClick={handleImportActivities}
                disabled={importing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الاستيراد...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    استيراد أنشطة تجريبية
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                استيراد بيانات تجريبية لاختبار الأداة
              </p>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">تصدير إلى Excel</h2>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">خيارات التصدير</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">تضمين الموارد</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">تضمين التواريخ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">تضمين التكاليف</span>
                  </label>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">تنسيق الملف</h3>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="json">JSON (.json)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التصدير...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  تصدير البيانات
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
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

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">نجح!</h3>
            </div>
            <div className="bg-white rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Usage Guide */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">دليل الاستخدام</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-600" />
                الاستيراد من Excel
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mr-4">
                <li>حضّر ملف Excel بالأعمدة: activity_id, activity_name, wbs_id, duration</li>
                <li>اضغط على "اختر ملف Excel" وحدد الملف</li>
                <li>اضغط على "استيراد" لبدء عملية الاستيراد</li>
                <li>انتظر حتى تكتمل العملية وشاهد النتائج</li>
              </ol>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-600" />
                التصدير إلى Excel
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mr-4">
                <li>حدد خيارات التصدير المطلوبة (الموارد، التواريخ، التكاليف)</li>
                <li>اختر تنسيق الملف (Excel, CSV, JSON)</li>
                <li>اضغط على "تصدير البيانات"</li>
                <li>سيتم تنزيل الملف تلقائياً</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKMagicTool;
