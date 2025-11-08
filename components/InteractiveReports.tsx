import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Activity,
  AlertCircle,
  Loader,
  CheckCircle,
  FileSpreadsheet,
  File
} from 'lucide-react';

export const InteractiveReports: React.FC = () => {
  const [reportType, setReportType] = useState('executive_summary');
  const [projectId, setProjectId] = useState('1');
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  const reportTypes = [
    { id: 'executive_summary', name: 'التقرير التنفيذي', icon: FileText },
    { id: 'progress_report', name: 'تقرير التقدم', icon: Activity },
    { id: 'financial_report', name: 'التقرير المالي', icon: DollarSign },
    { id: 'variance_report', name: 'تقرير الانحرافات', icon: AlertCircle },
    { id: 'resource_report', name: 'تقرير الموارد', icon: Activity },
  ];

  const formats = [
    { id: 'json', name: 'JSON', icon: File },
    { id: 'pdf', name: 'PDF', icon: FileText },
    { id: 'excel', name: 'Excel', icon: FileSpreadsheet },
    { id: 'html', name: 'HTML', icon: FileText },
  ];

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setReportData(null);

    try {
      const API_BASE = window.location.origin.replace('3000', '5000');
      const response = await fetch(`${API_BASE}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          project_id: parseInt(projectId),
          format: format,
          include_charts: true,
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-12-31'
          }
        })
      });

      if (!response.ok) throw new Error('فشل إنشاء التقرير');

      const result = await response.json();
      if (result.success) {
        setReportData(result.report);
        setSuccess(true);
      } else {
        throw new Error(result.error || 'خطأ في إنشاء التقرير');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!reportData) return;

    try {
      const API_BASE = window.location.origin.replace('3000', '5000');
      const response = await fetch(`${API_BASE}/api/reports/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportData.report_id,
          format: format
        })
      });

      if (!response.ok) throw new Error('فشل تصدير التقرير');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportData.report_id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderReportPreview = (report: any) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {report.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(report.generated_at).toLocaleDateString('ar-SA')}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {report.report_type}
            </span>
          </div>
        </div>

        {report.summary && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">ملخص تنفيذي</h3>
            <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
          </div>
        )}

        {report.sections && report.sections.length > 0 && (
          <div className="space-y-6">
            {report.sections.map((section: any, index: number) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {section.title}
                </h3>
                {section.content && (
                  <div className="text-gray-700 dark:text-gray-300 mb-3">
                    {typeof section.content === 'string' ? (
                      <p>{section.content}</p>
                    ) : (
                      <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-700 p-4 rounded">
                        {JSON.stringify(section.content, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
                {section.data && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(section.data).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{key}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            تصدير التقرير ({format.toUpperCase()})
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          التقارير التفاعلية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إنشاء وتصدير تقارير احترافية بصيغ متعددة
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نوع التقرير
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              صيغة التصدير
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {formats.map((fmt) => (
                <option key={fmt.id} value={fmt.id}>
                  {fmt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المشروع
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="معرف المشروع"
            />
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              جاري الإنشاء...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              إنشاء التقرير
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-bold">خطأ</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && !error && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <p className="font-bold">تم إنشاء التقرير بنجاح!</p>
        </div>
      )}

      {/* Report Preview */}
      {reportData && renderReportPreview(reportData)}
    </div>
  );
};

export default InteractiveReports;
