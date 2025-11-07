import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react';

interface DashboardData {
  role: string;
  title: string;
  summary?: any;
  financial_overview?: any;
  overview?: any;
  schedule?: any;
  budget?: any;
  team?: any;
}

export const AdvancedDashboard: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('company_owner');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { id: 'company_owner', name: 'صاحب الشركة', icon: Target },
    { id: 'project_manager', name: 'مدير المشروع', icon: Users },
    { id: 'site_engineer', name: 'مهندس الموقع', icon: Activity },
    { id: 'execution_engineer', name: 'مهندس التنفيذ', icon: BarChart3 },
    { id: 'supervisor', name: 'مشرف', icon: Users },
    { id: 'planning_engineer', name: 'مهندس التخطيط', icon: Calendar },
    { id: 'cost_control', name: 'كنترول كوست', icon: DollarSign },
    { id: 'technical_office', name: 'المكتب الفني', icon: Activity },
    { id: 'accounts_finance', name: 'الحسابات والمالية', icon: DollarSign },
  ];

  useEffect(() => {
    loadDashboard();
  }, [selectedRole]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = window.location.origin.replace('3000', '5000');
      const response = await fetch(
        `${API_BASE}/api/dashboards/${selectedRole}?user_id=1&project_id=1`
      );
      
      if (!response.ok) {
        throw new Error('فشل تحميل البيانات');
      }

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.dashboard);
      } else {
        throw new Error(result.error || 'خطأ في تحميل البيانات');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
          <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );

  const renderCompanyOwnerDashboard = (data: any) => {
    const summary = data.summary || {};
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="إجمالي المشاريع"
            value={summary.total_projects || 0}
            icon={Target}
            color="border-blue-500"
          />
          <MetricCard
            title="المشاريع النشطة"
            value={summary.active_projects || 0}
            icon={Activity}
            color="border-green-500"
          />
          <MetricCard
            title="صافي الربح"
            value={`${((summary.net_profit || 0) / 1000000).toFixed(1)}M SAR`}
            icon={DollarSign}
            color="border-purple-500"
          />
          <MetricCard
            title="هامش الربح"
            value={`${(summary.profit_margin || 0).toFixed(1)}%`}
            icon={TrendingUp}
            color="border-orange-500"
          />
        </div>

        {data.project_health && data.project_health.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">صحة المشاريع</h3>
            <div className="space-y-4">
              {data.project_health.map((project: any) => (
                <div key={project.project_id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{project.project_name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      project.health_score >= 80 ? 'bg-green-100 text-green-800' :
                      project.health_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.health_score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">الجدول</p>
                      <p className={project.schedule_variance < 0 ? 'text-green-600' : 'text-red-600'}>
                        {project.schedule_variance} يوم
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">التكلفة</p>
                      <p className={project.cost_variance < 0 ? 'text-green-600' : 'text-red-600'}>
                        {project.cost_variance.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">الجودة</p>
                      <p className="text-gray-900 dark:text-white">{project.quality_score}/100</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">السلامة</p>
                      <p className="text-gray-900 dark:text-white">{project.safety_score}/100</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderProjectManagerDashboard = (data: any) => {
    const overview = data.overview || {};
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="التقدم"
            value={`${(overview.current_progress || 0).toFixed(1)}%`}
            icon={Activity}
            color="border-blue-500"
          />
          <MetricCard
            title="فريق العمل"
            value={overview.team_size || 0}
            icon={Users}
            color="border-green-500"
          />
          <MetricCard
            title="الأيام المتبقية"
            value={overview.days_remaining || 0}
            icon={Clock}
            color="border-orange-500"
          />
          <MetricCard
            title="المقاولون"
            value={overview.active_subcontractors || 0}
            icon={Target}
            color="border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">حالة الجدول</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">حالة الجدول</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  overview.schedule_status === 'on_track' ? 'bg-green-100 text-green-800' :
                  overview.schedule_status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {overview.schedule_status === 'on_track' ? 'على المسار' : 
                   overview.schedule_status === 'at_risk' ? 'في خطر' : 'متأخر'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">حالة الميزانية</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  overview.budget_status === 'within_budget' ? 'bg-green-100 text-green-800' :
                  overview.budget_status === 'slight_overrun' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {overview.budget_status === 'within_budget' ? 'ضمن الميزانية' : 
                   overview.budget_status === 'slight_overrun' ? 'تجاوز طفيف' : 'تجاوز كبير'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">الإنجازات</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">المعالم المكتملة</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {overview.milestones_completed || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">المعالم المتبقية</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {overview.milestones_remaining || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderSiteEngineerDashboard = (data: any) => {
    const daily = data.daily_activities || {};
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="العمال اليوم"
            value={daily.total_workers || 0}
            icon={Users}
            color="border-blue-500"
          />
          <MetricCard
            title="الأنشطة الجارية"
            value={daily.activities_today || 0}
            icon={Activity}
            color="border-green-500"
          />
          <MetricCard
            title="التقارير الميدانية"
            value={daily.daily_reports_count || 0}
            icon={CheckCircle2}
            color="border-orange-500"
          />
          <MetricCard
            title="نسبة الحضور"
            value={`${((daily.attendance_rate || 0) * 100).toFixed(0)}%`}
            icon={Clock}
            color="border-purple-500"
          />
        </div>
      </>
    );
  };

  const renderOtherRoleDashboard = (data: any) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">
          لوحة التحكم لهذا الدور قيد التطوير
        </p>
        <pre className="mt-4 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          لوحة التحكم المتقدمة
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          اختر الدور لعرض لوحة التحكم المخصصة
        </p>
      </div>

      {/* Role Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-wrap gap-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedRole === role.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{role.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">خطأ</p>
          <p>{error}</p>
        </div>
      ) : dashboardData ? (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData.title}
            </h2>
          </div>
          
          {selectedRole === 'company_owner' && renderCompanyOwnerDashboard(dashboardData)}
          {selectedRole === 'project_manager' && renderProjectManagerDashboard(dashboardData)}
          {selectedRole === 'site_engineer' && renderSiteEngineerDashboard(dashboardData)}
          {(selectedRole === 'execution_engineer' || 
            selectedRole === 'supervisor' || 
            selectedRole === 'planning_engineer' || 
            selectedRole === 'cost_control' || 
            selectedRole === 'technical_office' || 
            selectedRole === 'accounts_finance') && renderOtherRoleDashboard(dashboardData)}
        </div>
      ) : null}
    </div>
  );
};

export default AdvancedDashboard;
