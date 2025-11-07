import React, { useState } from 'react';
import { DollarSign, Upload, CheckCircle2, AlertCircle, Info, Loader2, ArrowRight, Database } from 'lucide-react';

const BOQMagicTool: React.FC = () => {
  const [boqFile, setBoqFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = window.location.origin.replace('3000', '5000');

  const handleImportBOQ = async () => {
    if (!boqFile) {
      setError('الرجاء اختيار ملف BOQ');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', boqFile);

      const response = await fetch(`${API_BASE_URL}/api/primavera-magic/boq/import-as-resources`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'فشل استيراد BOQ');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الاستيراد');
    } finally {
      setImporting(false);
    }
  };

  const handleLinkBOQ = async () => {
    try {
      setImporting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/primavera-magic/boq/link-to-activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boq_resource_mapping: [
            { boq_item_id: 'BOQ-001', activity_id: 'A1000' },
          ],
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'فشل ربط BOQ');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الربط');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-r-4 border-green-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BOQ Magic Tool</h1>
              <p className="text-gray-600 mt-1">دمج BOQ مع Primavera P6</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">عن هذه الأداة</h4>
                <p className="text-green-800 text-sm leading-relaxed">
                  استيراد بنود BOQ كموارد في Primavera وربطها بالأنشطة تلقائياً
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">استيراد BOQ</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setBoqFile(e.target.files?.[0] || null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleImportBOQ}
                disabled={!boqFile || importing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
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
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">ربط BOQ بالأنشطة</h2>
          </div>
          <button
            onClick={handleLinkBOQ}
            disabled={importing}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الربط...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                ربط تلقائي
              </>
            )}
          </button>
        </div>

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

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">دليل الاستخدام</h2>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-purple-600" />
              خطوات الاستخدام
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mr-4">
              <li>حضّر ملف Excel يحتوي على: رقم البند، الوصف، الكمية، السعر</li>
              <li>اختر الملف واضغط "استيراد"</li>
              <li>سيتم استيراد البنود كموارد في Primavera</li>
              <li>استخدم "ربط تلقائي" لربط البنود بالأنشطة</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOQMagicTool;
