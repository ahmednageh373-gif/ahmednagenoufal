/**
 * 👔 لوحة التحكم التنفيذية - Executive Dashboard
 * لوحة شاملة لصاحب الشركة ومدير المشاريع لمتابعة جميع المشاريع
 */

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Briefcase,
  FileText,
  Settings,
  Download,
  RefreshCcw
} from 'lucide-react';
import type { Project } from '../types';

interface ExecutiveDashboardProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

interface ProjectKPI {
  id: string;
  name: string;
  progress: number;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  scheduleVariance: number;
  costVariance: number;
  totalBudget: number;
  spentBudget: number;
  openRisks: number;
  criticalRisks: number;
  teamSize: number;
  daysRemaining: number;
  completionDate: string;
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ projects, onSelectProject }) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'financial' | 'schedule' | 'risks' | 'resources'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'budget' | 'health'>('health');

  // Calculate KPIs for all projects
  const projectsKPI = useMemo((): ProjectKPI[] => {
    return projects.map(project => {
      const totalTasks = project.data.schedule.length;
      const completedTasks = project.data.schedule.filter(t => t.progress === 100).length;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const totalBudget = project.data.financials.reduce((sum, item) => sum + item.total, 0);
      const spentBudget = totalBudget * (progress / 100); // تقديري
      
      const openRisks = project.data.riskRegister.filter(r => r.status === 'Open').length;
      const criticalRisks = project.data.riskRegister.filter(
        r => r.status === 'Open' && r.probability === 'High' && r.impact === 'High'
      ).length;
      
      const teamSize = project.data.members?.length || 0;
      
      const endDate = new Date(project.endDate || project.startDate);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate performance indices
      const plannedProgress = getPlannedProgress(project);
      const spi = plannedProgress > 0 ? progress / plannedProgress : 1;
      const cpi = totalBudget > 0 ? totalBudget / (spentBudget || 1) : 1;
      
      const scheduleVariance = progress - plannedProgress;
      const costVariance = totalBudget - spentBudget;
      
      // Determine project health
      let health: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
      if (criticalRisks > 0 || cpi < 0.8 || spi < 0.8) {
        health = 'critical';
      } else if (openRisks > 5 || cpi < 0.9 || spi < 0.9) {
        health = 'warning';
      } else if (cpi >= 1 && spi >= 1) {
        health = 'excellent';
      }
      
      return {
        id: project.id,
        name: project.name,
        progress,
        health,
        scheduleVariance,
        costVariance,
        totalBudget,
        spentBudget,
        openRisks,
        criticalRisks,
        teamSize,
        daysRemaining,
        completionDate: project.endDate || 'غير محدد',
        cpi,
        spi
      };
    });
  }, [projects]);

  // Calculate portfolio statistics
  const portfolioStats = useMemo(() => {
    const totalProjects = projectsKPI.length;
    const activeProjects = projectsKPI.filter(p => p.progress < 100 && p.progress > 0).length;
    const completedProjects = projectsKPI.filter(p => p.progress === 100).length;
    const notStartedProjects = projectsKPI.filter(p => p.progress === 0).length;
    
    const totalBudget = projectsKPI.reduce((sum, p) => sum + p.totalBudget, 0);
    const totalSpent = projectsKPI.reduce((sum, p) => sum + p.spentBudget, 0);
    const budgetUtilization = (totalSpent / totalBudget) * 100;
    
    const avgProgress = projectsKPI.reduce((sum, p) => sum + p.progress, 0) / totalProjects;
    
    const healthyProjects = projectsKPI.filter(p => p.health === 'excellent' || p.health === 'good').length;
    const atRiskProjects = projectsKPI.filter(p => p.health === 'warning' || p.health === 'critical').length;
    
    const totalRisks = projectsKPI.reduce((sum, p) => sum + p.openRisks, 0);
    const criticalRisks = projectsKPI.reduce((sum, p) => sum + p.criticalRisks, 0);
    
    const totalTeamMembers = projectsKPI.reduce((sum, p) => sum + p.teamSize, 0);
    
    const avgCPI = projectsKPI.reduce((sum, p) => sum + p.cpi, 0) / totalProjects;
    const avgSPI = projectsKPI.reduce((sum, p) => sum + p.spi, 0) / totalProjects;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      notStartedProjects,
      totalBudget,
      totalSpent,
      budgetUtilization,
      avgProgress,
      healthyProjects,
      atRiskProjects,
      totalRisks,
      criticalRisks,
      totalTeamMembers,
      avgCPI,
      avgSPI
    };
  }, [projectsKPI]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    return [...projectsKPI].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name, 'ar');
        case 'progress': return b.progress - a.progress;
        case 'budget': return b.totalBudget - a.totalBudget;
        case 'health':
          const healthOrder = { excellent: 4, good: 3, warning: 2, critical: 1 };
          return healthOrder[b.health] - healthOrder[a.health];
        default: return 0;
      }
    });
  }, [projectsKPI, sortBy]);

  const exportPortfolioReport = () => {
    const report = {
      generatedDate: new Date().toLocaleString('ar-SA'),
      portfolioStats,
      projects: projectsKPI
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_محفظة_المشاريع_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LayoutDashboard className="text-purple-600" />
              لوحة التحكم التنفيذية
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              نظرة شاملة على جميع المشاريع والأداء العام للمحفظة
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCcw size={20} />
              تحديث
            </button>
            <button
              onClick={exportPortfolioReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download size={20} />
              تصدير التقرير
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
            { key: 'financial', label: 'الأداء المالي', icon: DollarSign },
            { key: 'schedule', label: 'الجداول الزمنية', icon: Calendar },
            { key: 'risks', label: 'المخاطر', icon: AlertTriangle },
            { key: 'resources', label: 'الموارد', icon: Users }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                selectedView === tab.key
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="flex-1 overflow-auto p-6">
          {/* Executive KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ExecutiveKPI
              title="إجمالي المشاريع"
              value={portfolioStats.totalProjects}
              subtitle={`${portfolioStats.activeProjects} نشط | ${portfolioStats.completedProjects} مكتمل`}
              icon={Building2}
              color="bg-blue-600"
              trend="neutral"
            />
            <ExecutiveKPI
              title="الميزانية الإجمالية"
              value={`${(portfolioStats.totalBudget / 1000000).toFixed(1)}M`}
              subtitle={`${portfolioStats.budgetUtilization.toFixed(1)}% مستخدم`}
              icon={DollarSign}
              color="bg-green-600"
              trend={portfolioStats.budgetUtilization < 90 ? 'positive' : 'warning'}
            />
            <ExecutiveKPI
              title="متوسط التقدم"
              value={`${portfolioStats.avgProgress.toFixed(1)}%`}
              subtitle={`CPI: ${portfolioStats.avgCPI.toFixed(2)} | SPI: ${portfolioStats.avgSPI.toFixed(2)}`}
              icon={Activity}
              color="bg-purple-600"
              trend={portfolioStats.avgSPI >= 1 ? 'positive' : 'negative'}
            />
            <ExecutiveKPI
              title="المشاريع المعرضة للخطر"
              value={portfolioStats.atRiskProjects}
              subtitle={`${portfolioStats.criticalRisks} مخاطر حرجة`}
              icon={AlertTriangle}
              color="bg-red-600"
              trend={portfolioStats.atRiskProjects === 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* Portfolio Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Health Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart size={20} />
                توزيع صحة المشاريع
              </h3>
              <div className="space-y-3">
                {[
                  { status: 'excellent', label: 'ممتاز', color: 'bg-emerald-500', count: projectsKPI.filter(p => p.health === 'excellent').length },
                  { status: 'good', label: 'جيد', color: 'bg-blue-500', count: projectsKPI.filter(p => p.health === 'good').length },
                  { status: 'warning', label: 'تحذير', color: 'bg-yellow-500', count: projectsKPI.filter(p => p.health === 'warning').length },
                  { status: 'critical', label: 'حرج', color: 'bg-red-500', count: projectsKPI.filter(p => p.health === 'critical').length }
                ].map(item => {
                  const percentage = (item.count / portfolioStats.totalProjects) * 100;
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className={`${item.color} h-3 rounded-full`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                الأداء المالي للمحفظة
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">الميزانية الإجمالية</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {portfolioStats.totalBudget.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">المصروفات حتى الآن</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {portfolioStats.totalSpent.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">المتبقي</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {(portfolioStats.totalBudget - portfolioStats.totalSpent).toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">معامل أداء التكلفة (CPI)</span>
                  <span className={`text-lg font-bold ${portfolioStats.avgCPI >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioStats.avgCPI.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">قائمة المشاريع</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="health">ترتيب حسب: الصحة</option>
                <option value="name">ترتيب حسب: الاسم</option>
                <option value="progress">ترتيب حسب: التقدم</option>
                <option value="budget">ترتيب حسب: الميزانية</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المشروع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الصحة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التقدم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الميزانية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CPI / SPI</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المخاطر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الأيام المتبقية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedProjects.map(project => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      onClick={() => onSelectProject(project.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Other Views */}
      {selectedView !== 'overview' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedView === 'financial' && 'التحليل المالي التفصيلي'}
              {selectedView === 'schedule' && 'تحليل الجداول الزمنية'}
              {selectedView === 'risks' && 'إدارة مخاطر المحفظة'}
              {selectedView === 'resources' && 'إدارة موارد المحفظة'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">سيتم إضافة التفاصيل الكاملة قريباً</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function
function getPlannedProgress(project: Project): number {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate || project.startDate);
  const today = new Date();
  
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
}

// Helper Components
const ExecutiveKPI: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend: 'positive' | 'negative' | 'warning' | 'neutral';
}> = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const getTrendIcon = () => {
    if (trend === 'positive') return <TrendingUp className="text-green-500" size={20} />;
    if (trend === 'negative') return <TrendingDown className="text-red-500" size={20} />;
    if (trend === 'warning') return <AlertTriangle className="text-yellow-500" size={20} />;
    return <Activity className="text-gray-500" size={20} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        {getTrendIcon()}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
};

const ProjectRow: React.FC<{
  project: ProjectKPI;
  onClick: () => void;
}> = ({ project, onClick }) => {
  const getHealthBadge = () => {
    const colors = {
      excellent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    const labels = {
      excellent: 'ممتاز',
      good: 'جيد',
      warning: 'تحذير',
      critical: 'حرج'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[project.health]}`}>
        {labels[project.health]}
      </span>
    );
  };

  return (
    <tr
      onClick={onClick}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
    >
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">الإنجاز: {project.completionDate}</div>
      </td>
      <td className="px-6 py-4">{getHealthBadge()}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
            {project.progress.toFixed(0)}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {(project.totalBudget / 1000000).toFixed(2)}M ريال
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          مصروف: {(project.spentBudget / 1000000).toFixed(2)}M
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <span className={`font-medium ${project.cpi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
            {project.cpi.toFixed(2)}
          </span>
          {' / '}
          <span className={`font-medium ${project.spi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
            {project.spi.toFixed(2)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">
          {project.openRisks} مفتوح
        </div>
        {project.criticalRisks > 0 && (
          <div className="text-xs text-red-600 dark:text-red-400">
            {project.criticalRisks} حرج
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-medium ${
          project.daysRemaining < 0
            ? 'text-red-600'
            : project.daysRemaining < 30
            ? 'text-yellow-600'
            : 'text-gray-900 dark:text-white'
        }`}>
          {project.daysRemaining} يوم
        </span>
      </td>
    </tr>
  );
};

export default ExecutiveDashboard;
