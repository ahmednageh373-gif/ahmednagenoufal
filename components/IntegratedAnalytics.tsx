/**
 * 📊 نظام التحليلات والتقارير المتكامل - Integrated Analytics & Reporting
 * نظام شامل للتقارير والتحليلات متعددة الأبعاد
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp as Activity,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  FileText,
  Target,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Share2,
  Printer
} from 'lucide-react';
import type { Project } from '../types';

interface IntegratedAnalyticsProps {
  projects: Project[];
  currentProject: Project;
}

export const IntegratedAnalytics: React.FC<IntegratedAnalyticsProps> = ({ projects, currentProject }) => {
  const [selectedReport, setSelectedReport] = useState<'summary' | 'financial' | 'schedule' | 'resources' | 'risks' | 'custom'>('summary');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [comparisonMode, setComparisonMode] = useState(false);

  // Analytics calculations
  const analytics = useMemo(() => {
    const proj = currentProject;
    
    // Schedule Analytics
    const totalTasks = proj.data.schedule.length;
    const completedTasks = proj.data.schedule.filter(t => t.progress === 100).length;
    const inProgressTasks = proj.data.schedule.filter(t => t.progress > 0 && t.progress < 100).length;
    const notStartedTasks = totalTasks - completedTasks - inProgressTasks;
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Financial Analytics
    const totalBudget = proj.data.financials.reduce((sum, item) => sum + item.total, 0);
    const spentBudget = totalBudget * (overallProgress / 100);
    const remainingBudget = totalBudget - spentBudget;
    
    // Risk Analytics
    const totalRisks = proj.data.riskRegister.length;
    const openRisks = proj.data.riskRegister.filter(r => r.status === 'Open').length;
    const highPriorityRisks = proj.data.riskRegister.filter(
      r => r.status === 'Open' && r.probability === 'High' && r.impact === 'High'
    ).length;
    
    // Resource Analytics (if available)
    const teamSize = proj.data.members?.length || 0;
    
    // Time Analytics
    const startDate = new Date(proj.startDate);
    const endDate = new Date(proj.endDate || proj.startDate);
    const today = new Date();
    const totalDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = totalDuration - elapsedDays;
    const plannedProgress = Math.max(0, Math.min(100, (elapsedDays / totalDuration) * 100));
    const scheduleVariance = overallProgress - plannedProgress;
    
    // Performance Indices
    const spi = plannedProgress > 0 ? overallProgress / plannedProgress : 1; // Schedule Performance Index
    const cpi = totalBudget > 0 ? totalBudget / (spentBudget || 1) : 1; // Cost Performance Index
    
    // Category breakdown
    const categoryStats = proj.data.schedule.reduce((acc, task) => {
      const category = task.category || 'غير مصنف';
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0, inProgress: 0 };
      }
      acc[category].total++;
      if (task.progress === 100) acc[category].completed++;
      else if (task.progress > 0) acc[category].inProgress++;
      return acc;
    }, {} as Record<string, { total: number; completed: number; inProgress: number }>);
    
    return {
      schedule: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        notStartedTasks,
        overallProgress,
        plannedProgress,
        scheduleVariance,
        spi
      },
      financial: {
        totalBudget,
        spentBudget,
        remainingBudget,
        cpi
      },
      risks: {
        totalRisks,
        openRisks,
        highPriorityRisks
      },
      resources: {
        teamSize
      },
      time: {
        totalDuration,
        elapsedDays,
        remainingDays
      },
      categoryStats
    };
  }, [currentProject]);

  const generatePDFReport = () => {
    alert('سيتم إنشاء تقرير PDF شامل مع الرسوم البيانية والإحصائيات');
  };

  const generateExcelReport = () => {
    alert('سيتم إنشاء تقرير Excel تفصيلي مع جميع البيانات');
  };

  const shareReport = () => {
    alert('سيتم مشاركة التقرير عبر البريد الإلكتروني أو رابط');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="text-indigo-600" />
              التحليلات والتقارير المتكاملة - {currentProject.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              تحليلات شاملة ومتعددة الأبعاد مع تقارير احترافية
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generatePDFReport}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FileText size={18} />
              PDF
            </button>
            <button
              onClick={generateExcelReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={18} />
              Excel
            </button>
            <button
              onClick={shareReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Share2 size={18} />
              مشاركة
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'summary', label: 'التقرير الموجز', icon: BarChart3 },
            { key: 'financial', label: 'التحليل المالي', icon: DollarSign },
            { key: 'schedule', label: 'تحليل الجدول', icon: Calendar },
            { key: 'resources', label: 'تحليل الموارد', icon: Users },
            { key: 'risks', label: 'تحليل المخاطر', icon: AlertCircle },
            { key: 'custom', label: 'تقرير مخصص', icon: FileText }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedReport(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                selectedReport === tab.key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Report */}
      {selectedReport === 'summary' && (
        <div className="flex-1 overflow-auto p-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="التقدم الإجمالي"
              value={`${analytics.schedule.overallProgress.toFixed(1)}%`}
              subtitle={`${analytics.schedule.completedTasks} / ${analytics.schedule.totalTasks} مهمة`}
              icon={Activity}
              color="bg-blue-600"
              trend={analytics.schedule.scheduleVariance >= 0 ? 'positive' : 'negative'}
              trendValue={`${Math.abs(analytics.schedule.scheduleVariance).toFixed(1)}%`}
            />
            <MetricCard
              title="الأداء المالي"
              value={`${(analytics.financial.cpi).toFixed(2)}`}
              subtitle={`${analytics.financial.spentBudget.toLocaleString('ar-SA')} من ${analytics.financial.totalBudget.toLocaleString('ar-SA')}`}
              icon={DollarSign}
              color="bg-green-600"
              trend={analytics.financial.cpi >= 1 ? 'positive' : 'negative'}
              trendValue={`CPI ${analytics.financial.cpi >= 1 ? 'جيد' : 'ضعيف'}`}
            />
            <MetricCard
              title="أداء الجدول"
              value={`${(analytics.schedule.spi).toFixed(2)}`}
              subtitle={`${analytics.time.elapsedDays} / ${analytics.time.totalDuration} يوم`}
              icon={Calendar}
              color="bg-purple-600"
              trend={analytics.schedule.spi >= 1 ? 'positive' : 'negative'}
              trendValue={`SPI ${analytics.schedule.spi >= 1 ? 'متقدم' : 'متأخر'}`}
            />
            <MetricCard
              title="المخاطر المفتوحة"
              value={analytics.risks.openRisks.toString()}
              subtitle={`${analytics.risks.highPriorityRisks} عالي الأولوية`}
              icon={AlertCircle}
              color="bg-red-600"
              trend={analytics.risks.openRisks === 0 ? 'positive' : 'negative'}
              trendValue={`${analytics.risks.totalRisks} إجمالي`}
            />
          </div>

          {/* Performance Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Schedule Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart size={20} />
                حالة المهام
              </h3>
              <div className="space-y-4">
                <ProgressItem
                  label="مكتملة"
                  count={analytics.schedule.completedTasks}
                  total={analytics.schedule.totalTasks}
                  color="bg-green-500"
                />
                <ProgressItem
                  label="قيد التنفيذ"
                  count={analytics.schedule.inProgressTasks}
                  total={analytics.schedule.totalTasks}
                  color="bg-blue-500"
                />
                <ProgressItem
                  label="لم تبدأ"
                  count={analytics.schedule.notStartedTasks}
                  total={analytics.schedule.totalTasks}
                  color="bg-gray-400"
                />
              </div>
            </div>

            {/* Budget Utilization */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                استخدام الميزانية
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">المصروفات</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {analytics.financial.spentBudget.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${(analytics.financial.spentBudget / analytics.financial.totalBudget) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">المتبقي</span>
                    <span className="text-sm font-semibold text-green-600">
                      {analytics.financial.remainingBudget.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${(analytics.financial.remainingBudget / analytics.financial.totalBudget) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">الميزانية الإجمالية</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {analytics.financial.totalBudget.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              التقدم حسب الفئة
            </h3>
            <div className="space-y-4">
              {Object.entries(analytics.categoryStats).map(([category, stats]) => {
                const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {stats.completed} / {stats.total} ({progress.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Other Report Views */}
      {selectedReport !== 'summary' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              {selectedReport === 'financial' && <DollarSign size={48} className="mx-auto text-green-600" />}
              {selectedReport === 'schedule' && <Calendar size={48} className="mx-auto text-blue-600" />}
              {selectedReport === 'resources' && <Users size={48} className="mx-auto text-purple-600" />}
              {selectedReport === 'risks' && <AlertCircle size={48} className="mx-auto text-red-600" />}
              {selectedReport === 'custom' && <FileText size={48} className="mx-auto text-indigo-600" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedReport === 'financial' && 'التحليل المالي التفصيلي'}
              {selectedReport === 'schedule' && 'تحليل الجدول الزمني التفصيلي'}
              {selectedReport === 'resources' && 'تحليل الموارد التفصيلي'}
              {selectedReport === 'risks' && 'تحليل المخاطر التفصيلي'}
              {selectedReport === 'custom' && 'إنشاء تقرير مخصص'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              سيتم إضافة التحليلات التفصيلية والرسوم البيانية المتقدمة هنا
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend: 'positive' | 'negative';
  trendValue: string;
}> = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      {trend === 'positive' ? (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp size={16} />
          <span className="text-xs font-medium">{trendValue}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle size={16} />
          <span className="text-xs font-medium">{trendValue}</span>
        </div>
      )}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
  </div>
);

const ProgressItem: React.FC<{
  label: string;
  count: number;
  total: number;
  color: string;
}> = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div className={`${color} h-3 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default IntegratedAnalytics;
