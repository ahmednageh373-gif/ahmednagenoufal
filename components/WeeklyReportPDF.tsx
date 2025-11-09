/**
 * ═══════════════════════════════════════════════════════════════
 * مولد التقارير الأسبوعية بصيغة PDF
 * Weekly Report PDF Generator with EVM Analysis
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Mail,
  Printer,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface WeeklyReportData {
  projectName: string;
  reportDate: string;
  reportWeek: number;
  totalWeeks: number;
  
  // Summary
  totalBudget: number;
  totalPV: number;
  totalEV: number;
  totalAC: number;
  projectCPI: number;
  projectSPI: number;
  eac: number;
  etc: number;
  vac: number;
  
  // Activities
  activities: {
    code: string;
    name: string;
    plannedProgress: number;
    actualProgress: number;
    plannedCost: number;
    actualCost: number;
    cpi: number;
    spi: number;
    status: 'on-track' | 'warning' | 'critical';
  }[];
  
  // Alerts
  alerts: {
    type: 'cost-overrun' | 'schedule-delay' | 'critical-path' | 'milestone';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    activity?: string;
  }[];
  
  // Recommendations
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════
// Alert Component
// ═══════════════════════════════════════════════════════════════

interface AlertBadgeProps {
  alert: WeeklyReportData['alerts'][0];
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ alert }) => {
  const getAlertStyle = () => {
    switch (alert.severity) {
      case 'critical':
        return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', icon: AlertTriangle };
      case 'high':
        return { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-800', icon: AlertTriangle };
      case 'medium':
        return { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800', icon: Clock };
      default:
        return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', icon: CheckCircle };
    }
  };

  const style = getAlertStyle();
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.text} border-l-4 ${style.border} p-4 rounded-r-lg mb-3`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{alert.message}</p>
          {alert.activity && (
            <p className="text-sm mt-1 opacity-75">النشاط: {alert.activity}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Performance Summary Card
// ═══════════════════════════════════════════════════════════════

interface PerformanceSummaryProps {
  data: WeeklyReportData;
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">ملخص الأداء</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">الميزانية</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {data.totalBudget.toLocaleString()} ريال
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">القيمة المكتسبة</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {data.totalEV.toLocaleString()} ريال
          </div>
          <div className="text-sm text-gray-500">
            {((data.totalEV / data.totalBudget) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">التكلفة الفعلية</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {data.totalAC.toLocaleString()} ريال
          </div>
          <div className="text-sm text-gray-500">
            {((data.totalAC / data.totalBudget) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">مؤشر أداء التكلفة (CPI)</span>
            {data.projectCPI >= 1.0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-800">{data.projectCPI.toFixed(2)}</div>
          <p className={`text-sm mt-2 ${data.projectCPI >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.projectCPI >= 1.0 ? '✓ توفير في التكلفة' : '✗ زيادة في التكلفة'}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">مؤشر أداء الجدولة (SPI)</span>
            {data.projectSPI >= 1.0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-800">{data.projectSPI.toFixed(2)}</div>
          <p className={`text-sm mt-2 ${data.projectSPI >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.projectSPI >= 1.0 ? '✓ متقدم عن الجدول' : '✗ متأخر عن الجدول'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <span className="text-xs text-gray-600">التكلفة المتوقعة (EAC)</span>
          <div className="text-xl font-bold text-gray-800 mt-1">
            {data.eac.toLocaleString()} ريال
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <span className="text-xs text-gray-600">المتبقي للصرف (ETC)</span>
          <div className="text-xl font-bold text-gray-800 mt-1">
            {data.etc.toLocaleString()} ريال
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <span className="text-xs text-gray-600">التباين المتوقع (VAC)</span>
          <div className={`text-xl font-bold mt-1 ${data.vac >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.vac >= 0 ? '+' : ''}{data.vac.toLocaleString()} ريال
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Activities Table
// ═══════════════════════════════════════════════════════════════

interface ActivitiesTableProps {
  activities: WeeklyReportData['activities'];
}

const ActivitiesTable: React.FC<ActivitiesTableProps> = ({ activities }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">سليم</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">تحذير</span>;
      case 'critical':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">حرج</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النشاط</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">التقدم المخطط</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">التقدم الفعلي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة المخططة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة الفعلية</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">CPI</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">SPI</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {activity.code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{activity.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className="font-semibold">{activity.plannedProgress}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-semibold ${
                    activity.actualProgress >= activity.plannedProgress ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.actualProgress}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.plannedCost.toLocaleString()} ريال
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.actualCost.toLocaleString()} ريال
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${
                    activity.cpi >= 1.0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.cpi.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-bold ${
                    activity.spi >= 1.0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.spi.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(activity.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main Weekly Report Component
// ═══════════════════════════════════════════════════════════════

export const WeeklyReportPDF: React.FC = () => {
  const [reportData, setReportData] = useState<WeeklyReportData>({
    projectName: 'مشروع بلاط بورسلين 60×60 سم',
    reportDate: new Date().toLocaleDateString('ar-SA'),
    reportWeek: 3,
    totalWeeks: 9,
    totalBudget: 180000,
    totalPV: 58537,
    totalEV: 131940,
    totalAC: 152200,
    projectCPI: 0.87,
    projectSPI: 2.25,
    eac: 207640,
    etc: 55440,
    vac: -27640,
    activities: [
      {
        code: 'TILE-001-B',
        name: 'فرشة أسمنتية',
        plannedProgress: 32.5,
        actualProgress: 100,
        plannedCost: 4683,
        actualCost: 15200,
        cpi: 0.95,
        spi: 3.08,
        status: 'warning',
      },
      {
        code: 'TILE-001-C',
        name: 'بؤج وأوتار',
        plannedProgress: 32.5,
        actualProgress: 100,
        plannedCost: 3102,
        actualCost: 8100,
        cpi: 1.18,
        spi: 3.07,
        status: 'on-track',
      },
      {
        code: 'TILE-001-D',
        name: 'تركيب البلاط',
        plannedProgress: 32.5,
        actualProgress: 75,
        plannedCost: 46829,
        actualCost: 120000,
        cpi: 0.90,
        spi: 2.31,
        status: 'warning',
      },
    ],
    alerts: [
      {
        type: 'cost-overrun',
        severity: 'critical',
        message: 'تجاوز حرج في التكلفة: CPI = 0.87 (أقل من 0.90)',
        activity: 'جميع الأنشطة',
      },
      {
        type: 'cost-overrun',
        severity: 'high',
        message: 'زيادة في تكلفة الفرشة الأسمنتية بنسبة 224%',
        activity: 'TILE-001-B',
      },
      {
        type: 'schedule-delay',
        severity: 'medium',
        message: 'تقدم ممتاز في الجدولة: SPI = 2.25 (متقدم 125%)',
      },
    ],
    recommendations: [
      'مراجعة عاجلة لأسعار الموردين والبحث عن بدائل أرخص',
      'تحسين إدارة المخزون لتقليل نسبة الهدر الحالية',
      'طلب Variation Order من العميل لتغطية الزيادة في التكلفة',
      'الاستفادة من التقدم السريع لتحسين الجودة والتأكد من المواصفات',
      'توثيق الممارسات الجيدة التي أدت إلى التقدم في الجدولة',
    ],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      alert('تم إنشاء التقرير الأسبوعي بنجاح!\n\nيحتوي التقرير على:\n✓ ملخص الأداء (CPI/SPI)\n✓ جدول الأنشطة التفصيلي\n✓ التنبيهات والتحذيرات\n✓ التوصيات\n✓ مخططات Gantt\n✓ منحنيات S-Curve');
      setIsGenerating(false);
    }, 2000);
  };

  const handleSendEmail = () => {
    alert('سيتم إرسال التقرير عبر البريد الإلكتروني إلى:\n- المالك\n- الاستشاري\n- مدير المشروع');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">التقرير الأسبوعي</h1>
          <p className="text-gray-600 mt-1">
            الأسبوع {reportData.reportWeek} من {reportData.totalWeeks} • {reportData.reportDate}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            إرسال
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'جاري الإنشاء...' : 'تصدير PDF'}
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{reportData.projectName}</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">تاريخ التقرير:</span>
            <span className="font-semibold mr-2">{reportData.reportDate}</span>
          </div>
          <div>
            <span className="text-gray-600">فترة التقرير:</span>
            <span className="font-semibold mr-2">الأسبوع {reportData.reportWeek}</span>
          </div>
          <div>
            <span className="text-gray-600">نسبة الإنجاز:</span>
            <span className="font-semibold mr-2">
              {((reportData.reportWeek / reportData.totalWeeks) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <PerformanceSummary data={reportData} />

      {/* Alerts Section */}
      {reportData.alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">التنبيهات والتحذيرات</h3>
          {reportData.alerts.map((alert, index) => (
            <AlertBadge key={index} alert={alert} />
          ))}
        </div>
      )}

      {/* Activities Table */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الأنشطة</h3>
        <ActivitiesTable activities={reportData.activities} />
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">🎯 التوصيات</h3>
        <ul className="space-y-2">
          {reportData.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-blue-800">
              <span className="font-bold">{index + 1}.</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeeklyReportPDF;
