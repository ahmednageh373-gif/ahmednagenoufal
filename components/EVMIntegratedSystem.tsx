/**
 * ═══════════════════════════════════════════════════════════════
 * نظام القيمة المكتسبة المتكامل (EVM Integrated System)
 * يتكامل مع جميع صفحات المقايسات والجدول الزمني
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  Clock,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface EVMActivity {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  boqItemId: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  weightPercent: number;
  durationDays: number;
  physicalPercent: number;
  actualCost: number;
  // Calculated
  plannedValue: number;
  earnedValue: number;
  costVariance: number;
  scheduleVariance: number;
  cpi: number;
  spi: number;
}

interface EVMProject {
  id: string;
  name: string;
  startDate: Date;
  currentDay: number;
  totalDuration: number;
  totalBudget: number;
  activities: EVMActivity[];
  // Summary
  totalPV: number;
  totalEV: number;
  totalAC: number;
  projectCPI: number;
  projectSPI: number;
  eac: number;
  etc: number;
  vac: number;
}

// ═══════════════════════════════════════════════════════════════
// EVM Calculator Class
// ═══════════════════════════════════════════════════════════════

class EVMCalculator {
  /**
   * حساب PV (Planned Value)
   * PV = Weight % × Budget × (Current Day ÷ Total Duration)
   */
  static calculatePV(
    weightPercent: number,
    totalBudget: number,
    currentDay: number,
    totalDuration: number
  ): number {
    const timeProgress = currentDay / totalDuration;
    return (weightPercent / 100) * totalBudget * timeProgress;
  }

  /**
   * حساب EV (Earned Value)
   * EV = Weight % × Budget × Physical %
   */
  static calculateEV(
    weightPercent: number,
    totalBudget: number,
    physicalPercent: number
  ): number {
    return (weightPercent / 100) * totalBudget * (physicalPercent / 100);
  }

  /**
   * حساب CPI (Cost Performance Index)
   * CPI = EV ÷ AC
   */
  static calculateCPI(earnedValue: number, actualCost: number): number {
    return actualCost > 0 ? earnedValue / actualCost : 0;
  }

  /**
   * حساب SPI (Schedule Performance Index)
   * SPI = EV ÷ PV
   */
  static calculateSPI(earnedValue: number, plannedValue: number): number {
    return plannedValue > 0 ? earnedValue / plannedValue : 0;
  }

  /**
   * حساب EAC (Estimate at Completion)
   * EAC = Budget ÷ CPI
   */
  static calculateEAC(budget: number, cpi: number): number {
    return cpi > 0 ? budget / cpi : budget;
  }

  /**
   * حساب جميع مؤشرات النشاط
   */
  static calculateActivityMetrics(
    activity: EVMActivity,
    totalBudget: number,
    currentDay: number,
    totalDuration: number
  ): EVMActivity {
    const pv = this.calculatePV(
      activity.weightPercent,
      totalBudget,
      currentDay,
      totalDuration
    );

    const ev = this.calculateEV(
      activity.weightPercent,
      totalBudget,
      activity.physicalPercent
    );

    const cpi = this.calculateCPI(ev, activity.actualCost);
    const spi = this.calculateSPI(ev, pv);

    return {
      ...activity,
      plannedValue: pv,
      earnedValue: ev,
      costVariance: ev - activity.actualCost,
      scheduleVariance: ev - pv,
      cpi,
      spi,
    };
  }

  /**
   * حساب إجماليات المشروع
   */
  static calculateProjectSummary(project: EVMProject): EVMProject {
    // حساب مؤشرات كل نشاط
    const updatedActivities = project.activities.map(activity =>
      this.calculateActivityMetrics(
        activity,
        project.totalBudget,
        project.currentDay,
        project.totalDuration
      )
    );

    // حساب الإجماليات
    const totalPV = updatedActivities.reduce((sum, a) => sum + a.plannedValue, 0);
    const totalEV = updatedActivities.reduce((sum, a) => sum + a.earnedValue, 0);
    const totalAC = updatedActivities.reduce((sum, a) => sum + a.actualCost, 0);

    const projectCPI = this.calculateCPI(totalEV, totalAC);
    const projectSPI = this.calculateSPI(totalEV, totalPV);

    const eac = this.calculateEAC(project.totalBudget, projectCPI);
    const etc = eac - totalAC;
    const vac = project.totalBudget - eac;

    return {
      ...project,
      activities: updatedActivities,
      totalPV,
      totalEV,
      totalAC,
      projectCPI,
      projectSPI,
      eac,
      etc,
      vac,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// Performance Status Badge Component
// ═══════════════════════════════════════════════════════════════

interface PerformanceBadgeProps {
  value: number;
  type: 'cpi' | 'spi';
}

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ value, type }) => {
  const getStatus = () => {
    if (value >= 1.1) return { label: 'ممتاز', color: 'bg-green-500', icon: CheckCircle };
    if (value >= 1.0) return { label: 'جيد', color: 'bg-blue-500', icon: CheckCircle };
    if (value >= 0.9) return { label: 'تحذير', color: 'bg-yellow-500', icon: AlertCircle };
    return { label: 'حرج', color: 'bg-red-500', icon: AlertCircle };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">{value.toFixed(2)}</span>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs ${status.color}`}>
        <Icon className="w-3 h-3" />
        {status.label}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Activity Progress Card
// ═══════════════════════════════════════════════════════════════

interface ActivityCardProps {
  activity: EVMActivity;
}

const ActivityProgressCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">{activity.nameAr}</h4>
          <p className="text-sm text-gray-500">{activity.code}</p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {activity.weightPercent.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>الإنجاز الفعلي</span>
          <span className="font-semibold">{activity.physicalPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${activity.physicalPercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">PV:</span>
          <span className="font-semibold ml-1">{activity.plannedValue.toFixed(0)} ريال</span>
        </div>
        <div>
          <span className="text-gray-600">EV:</span>
          <span className="font-semibold ml-1">{activity.earnedValue.toFixed(0)} ريال</span>
        </div>
        <div>
          <span className="text-gray-600">AC:</span>
          <span className="font-semibold ml-1">{activity.actualCost.toFixed(0)} ريال</span>
        </div>
        <div>
          <span className="text-gray-600">CV:</span>
          <span className={`font-semibold ml-1 ${activity.costVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {activity.costVariance >= 0 ? '+' : ''}{activity.costVariance.toFixed(0)} ريال
          </span>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
        <div>
          <span className="text-xs text-gray-600">CPI</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-lg font-bold">{activity.cpi.toFixed(2)}</span>
            {activity.cpi >= 1.0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-600">SPI</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-lg font-bold">{activity.spi.toFixed(2)}</span>
            {activity.spi >= 1.0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Project Summary Dashboard
// ═══════════════════════════════════════════════════════════════

interface ProjectSummaryProps {
  project: EVMProject;
}

const ProjectSummaryDashboard: React.FC<ProjectSummaryProps> = ({ project }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
        <div className="text-sm text-gray-600">
          يوم {project.currentDay} من {project.totalDuration}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">الميزانية</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {project.totalBudget.toLocaleString()} ريال
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">القيمة المكتسبة</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {project.totalEV.toLocaleString()} ريال
          </div>
          <div className="text-sm text-gray-500">
            {((project.totalEV / project.totalBudget) * 100).toFixed(1)}% من الميزانية
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">التكلفة الفعلية</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {project.totalAC.toLocaleString()} ريال
          </div>
          <div className="text-sm text-gray-500">
            {((project.totalAC / project.totalBudget) * 100).toFixed(1)}% من الميزانية
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">أداء التكلفة (CPI)</h3>
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <PerformanceBadge value={project.projectCPI} type="cpi" />
          <div className="mt-4 text-sm text-gray-600">
            {project.projectCPI >= 1.0 ? (
              <span className="text-green-600">✓ توفير في التكلفة</span>
            ) : (
              <span className="text-red-600">✗ زيادة في التكلفة</span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            التباين: {project.totalEV - project.totalAC >= 0 ? '+' : ''}
            {(project.totalEV - project.totalAC).toLocaleString()} ريال
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">أداء الجدولة (SPI)</h3>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <PerformanceBadge value={project.projectSPI} type="spi" />
          <div className="mt-4 text-sm text-gray-600">
            {project.projectSPI >= 1.0 ? (
              <span className="text-green-600">✓ متقدم عن الجدول</span>
            ) : (
              <span className="text-red-600">✗ متأخر عن الجدول</span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            التباين: {project.totalEV - project.totalPV >= 0 ? '+' : ''}
            {(project.totalEV - project.totalPV).toLocaleString()} ريال
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <span className="text-xs text-gray-600">التكلفة المتوقعة (EAC)</span>
          <div className="text-xl font-bold text-gray-800 mt-1">
            {project.eac.toLocaleString()} ريال
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <span className="text-xs text-gray-600">المتبقي للصرف (ETC)</span>
          <div className="text-xl font-bold text-gray-800 mt-1">
            {project.etc.toLocaleString()} ريال
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <span className="text-xs text-gray-600">التباين المتوقع (VAC)</span>
          <div className={`text-xl font-bold mt-1 ${project.vac >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {project.vac >= 0 ? '+' : ''}{project.vac.toLocaleString()} ريال
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main EVM Integrated System Component
// ═══════════════════════════════════════════════════════════════

export const EVMIntegratedSystem: React.FC = () => {
  const [project, setProject] = useState<EVMProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load demo data
  useEffect(() => {
    loadDemoProject();
  }, []);

  const loadDemoProject = () => {
    const demoProject: EVMProject = {
      id: 'proj-001',
      name: 'بلاط بورسلين 60×60 سم - داخلي',
      startDate: new Date('2025-01-01'),
      currentDay: 20,
      totalDuration: 61.5,
      totalBudget: 180000,
      activities: [
        {
          id: 'act-001',
          code: 'TILE-001-B',
          nameAr: 'فرشة أسمنتية',
          nameEn: 'Cement Screed',
          boqItemId: 'boq-001',
          unit: 'م²',
          quantity: 1200,
          unitPrice: 12,
          totalCost: 14400,
          weightPercent: 8.0,
          durationDays: 4.5,
          physicalPercent: 100,
          actualCost: 15200,
          plannedValue: 0,
          earnedValue: 0,
          costVariance: 0,
          scheduleVariance: 0,
          cpi: 0,
          spi: 0,
        },
        {
          id: 'act-002',
          code: 'TILE-001-C',
          nameAr: 'بؤج وأوتار',
          nameEn: 'Dots & Screeds',
          boqItemId: 'boq-001',
          unit: 'م',
          quantity: 480,
          unitPrice: 20,
          totalCost: 9600,
          weightPercent: 5.3,
          durationDays: 4.5,
          physicalPercent: 100,
          actualCost: 8100,
          plannedValue: 0,
          earnedValue: 0,
          costVariance: 0,
          scheduleVariance: 0,
          cpi: 0,
          spi: 0,
        },
        {
          id: 'act-003',
          code: 'TILE-001-D',
          nameAr: 'تركيب البلاط',
          nameEn: 'Tile Installation',
          boqItemId: 'boq-001',
          unit: 'م²',
          quantity: 1200,
          unitPrice: 120,
          totalCost: 144000,
          weightPercent: 80.0,
          durationDays: 42,
          physicalPercent: 75,
          actualCost: 120000,
          plannedValue: 0,
          earnedValue: 0,
          costVariance: 0,
          scheduleVariance: 0,
          cpi: 0,
          spi: 0,
        },
        {
          id: 'act-004',
          code: 'TILE-001-E',
          nameAr: 'تنعيم ومسح',
          nameEn: 'Grouting & Cleaning',
          boqItemId: 'boq-001',
          unit: 'م²',
          quantity: 1200,
          unitPrice: 6,
          totalCost: 7200,
          weightPercent: 4.0,
          durationDays: 6,
          physicalPercent: 0,
          actualCost: 6800,
          plannedValue: 0,
          earnedValue: 0,
          costVariance: 0,
          scheduleVariance: 0,
          cpi: 0,
          spi: 0,
        },
        {
          id: 'act-005',
          code: 'TILE-001-F',
          nameAr: 'معالجة مائية',
          nameEn: 'Water Curing',
          boqItemId: 'boq-001',
          unit: 'م²',
          quantity: 1200,
          unitPrice: 4,
          totalCost: 4800,
          weightPercent: 2.7,
          durationDays: 3,
          physicalPercent: 0,
          actualCost: 2100,
          plannedValue: 0,
          earnedValue: 0,
          costVariance: 0,
          scheduleVariance: 0,
          cpi: 0,
          spi: 0,
        },
      ],
      totalPV: 0,
      totalEV: 0,
      totalAC: 0,
      projectCPI: 0,
      projectSPI: 0,
      eac: 0,
      etc: 0,
      vac: 0,
    };

    // Calculate all metrics
    const calculatedProject = EVMCalculator.calculateProjectSummary(demoProject);
    setProject(calculatedProject);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (project) {
        const updated = EVMCalculator.calculateProjectSummary(project);
        setProject(updated);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleExportPDF = () => {
    alert('سيتم تصدير التقرير إلى PDF قريباً');
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">نظام القيمة المكتسبة (EVM)</h1>
          <p className="text-gray-600 mt-1">مراقبة شاملة لأداء التكلفة والجدولة</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* Project Summary */}
      <ProjectSummaryDashboard project={project} />

      {/* Activities Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">الأنشطة الفرعية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.activities.map(activity => (
            <ActivityProgressCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-3">🎯 التوصيات</h3>
        <ul className="space-y-2 text-sm text-yellow-900">
          {project.projectCPI < 0.9 && (
            <li>🚨 تجاوز حرج في التكلفة - مراجعة عاجلة للأسعار مطلوبة</li>
          )}
          {project.projectCPI >= 0.9 && project.projectCPI < 1.0 && (
            <li>⚠️ زيادة في التكلفة - مراقبة دقيقة مطلوبة</li>
          )}
          {project.projectSPI < 0.9 && (
            <li>🚨 تأخير حرج - زيادة عدد الورديات أو حجم الطاقم</li>
          )}
          {project.projectSPI >= 0.9 && project.projectSPI < 1.0 && (
            <li>⚠️ تأخير طفيف - تسريع المسار الحرج</li>
          )}
          {project.projectCPI >= 1.0 && project.projectSPI >= 1.0 && (
            <li>✅ أداء ممتاز - استمر على نفس الأداء ووثق الممارسات الجيدة</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EVMIntegratedSystem;
