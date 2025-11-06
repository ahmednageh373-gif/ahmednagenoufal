/**
 * 💰 نظام التكاليف والإدارة المالية الشامل - Cost Control & Financial Management
 * يشمل: ميزانية المشروع، القيمة المكتسبة (EVM), تتبع التدفقات، التنبؤات المالية
 */

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  FileText,
  Download,
  Plus,
  Edit2,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { Project, FinancialItem, ScheduleTask } from '../types';

// ===== Types =====

export interface BudgetItem {
  id: string;
  category: string; // 'عمالة', 'معدات', 'مواد', 'مقاولون', 'عام'
  description: string;
  budgetedCost: number;
  actualCost: number;
  committedCost: number; // التكاليف المُلتزم بها
  forecastCost: number; // التكلفة المتوقعة
  variance: number; // الانحراف
  variancePercent: number;
}

export interface CashFlowEntry {
  id: string;
  date: string;
  type: 'inflow' | 'outflow';
  category: string;
  amount: number;
  description: string;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  invoiceNumber?: string;
}

export interface EVMData {
  // Earned Value Management Metrics
  pv: number; // Planned Value - القيمة المخططة
  ev: number; // Earned Value - القيمة المكتسبة
  ac: number; // Actual Cost - التكلفة الفعلية
  bac: number; // Budget at Completion - الميزانية عند الإنجاز
  etc: number; // Estimate to Complete - التقدير للإنجاز
  eac: number; // Estimate at Completion - التقدير عند الإنجاز
  vac: number; // Variance at Completion - الانحراف عند الإنجاز
  spi: number; // Schedule Performance Index
  cpi: number; // Cost Performance Index
  sv: number; // Schedule Variance
  cv: number; // Cost Variance
  tcpi: number; // To-Complete Performance Index
}

interface CostControlSystemProps {
  project: Project;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
}

// ===== Main Component =====

export const CostControlSystem: React.FC<CostControlSystemProps> = ({ project, onUpdateProject }) => {
  // State
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem(`budget_${project.id}`);
    return saved ? JSON.parse(saved) : initializeBudget(project);
  });

  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>(() => {
    const saved = localStorage.getItem(`cashflow_${project.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'evm' | 'cashflow' | 'forecast'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  // Calculate EVM Metrics
  const evmData = useMemo(() => calculateEVM(project, budgetItems), [project, budgetItems]);

  // Calculate Budget Summary
  const budgetSummary = useMemo(() => {
    const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgetedCost, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);
    const totalCommitted = budgetItems.reduce((sum, item) => sum + item.committedCost, 0);
    const totalForecast = budgetItems.reduce((sum, item) => sum + item.forecastCost, 0);
    
    return {
      totalBudgeted,
      totalActual,
      totalCommitted,
      totalForecast,
      variance: totalBudgeted - totalActual,
      variancePercent: ((totalBudgeted - totalActual) / totalBudgeted) * 100,
      remainingBudget: totalBudgeted - totalActual - totalCommitted,
      utilizationRate: (totalActual / totalBudgeted) * 100
    };
  }, [budgetItems]);

  // Calculate Cash Flow Summary
  const cashFlowSummary = useMemo(() => {
    const inflows = cashFlow.filter(cf => cf.type === 'inflow').reduce((sum, cf) => sum + cf.amount, 0);
    const outflows = cashFlow.filter(cf => cf.type === 'outflow').reduce((sum, cf) => sum + cf.amount, 0);
    const pending = cashFlow.filter(cf => cf.paymentStatus === 'pending').reduce((sum, cf) => sum + cf.amount, 0);
    const overdue = cashFlow.filter(cf => cf.paymentStatus === 'overdue').reduce((sum, cf) => sum + cf.amount, 0);
    
    return {
      inflows,
      outflows,
      netCashFlow: inflows - outflows,
      pending,
      overdue
    };
  }, [cashFlow]);

  // Save functions
  const saveBudget = (items: BudgetItem[]) => {
    setBudgetItems(items);
    localStorage.setItem(`budget_${project.id}`, JSON.stringify(items));
  };

  const saveCashFlow = (entries: CashFlowEntry[]) => {
    setCashFlow(entries);
    localStorage.setItem(`cashflow_${project.id}`, JSON.stringify(entries));
  };

  // Export Report
  const exportFinancialReport = () => {
    const report = {
      projectName: project.name,
      generatedDate: new Date().toLocaleString('ar-SA'),
      budgetSummary,
      evmData,
      cashFlowSummary,
      budgetItems,
      cashFlow
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_مالي_${project.name}_${Date.now()}.json`;
    a.click();
  };

  // ===== Render =====

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-900/20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DollarSign className="text-green-600" />
              نظام التكاليف والإدارة المالية - {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              نظام شامل لإدارة الميزانية، القيمة المكتسبة، التدفقات النقدية، والتنبؤات المالية
            </p>
          </div>
          <button
            onClick={exportFinancialReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            تصدير التقرير المالي
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { key: 'budget', label: 'الميزانية', icon: DollarSign },
            { key: 'evm', label: 'القيمة المكتسبة', icon: TrendingUp },
            { key: 'cashflow', label: 'التدفقات النقدية', icon: Calendar },
            { key: 'forecast', label: 'التنبؤات', icon: LineChart }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-auto p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              title="الميزانية الإجمالية"
              value={budgetSummary.totalBudgeted}
              subtitle={`${budgetSummary.utilizationRate.toFixed(1)}% مستخدم`}
              icon={DollarSign}
              color="bg-blue-500"
              trend={budgetSummary.variance >= 0 ? 'positive' : 'negative'}
            />
            <KPICard
              title="التكلفة الفعلية"
              value={budgetSummary.totalActual}
              subtitle={`${Math.abs(budgetSummary.variancePercent).toFixed(1)}% انحراف`}
              icon={TrendingUp}
              color="bg-purple-500"
              trend={budgetSummary.variance >= 0 ? 'positive' : 'negative'}
            />
            <KPICard
              title="مؤشر أداء التكلفة"
              value={evmData.cpi}
              subtitle={evmData.cpi >= 1 ? 'أقل من الميزانية' : 'أعلى من الميزانية'}
              icon={BarChart3}
              color="bg-green-500"
              trend={evmData.cpi >= 1 ? 'positive' : 'negative'}
              isRatio
            />
            <KPICard
              title="الميزانية المتبقية"
              value={budgetSummary.remainingBudget}
              subtitle={`${((budgetSummary.remainingBudget / budgetSummary.totalBudgeted) * 100).toFixed(1)}% من الإجمالي`}
              icon={PieChart}
              color="bg-orange-500"
              trend={budgetSummary.remainingBudget >= 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* EVM Summary Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white mb-6">
            <h3 className="text-2xl font-bold mb-4">ملخص القيمة المكتسبة (EVM)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-80">القيمة المخططة (PV)</p>
                <p className="text-2xl font-bold">{evmData.pv.toLocaleString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">القيمة المكتسبة (EV)</p>
                <p className="text-2xl font-bold">{evmData.ev.toLocaleString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">التكلفة الفعلية (AC)</p>
                <p className="text-2xl font-bold">{evmData.ac.toLocaleString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">التقدير عند الإنجاز (EAC)</p>
                <p className="text-2xl font-bold">{evmData.eac.toLocaleString('ar-SA')}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-sm opacity-80">SPI</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  {evmData.spi.toFixed(2)}
                  {evmData.spi >= 1 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">CPI</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  {evmData.cpi.toFixed(2)}
                  {evmData.cpi >= 1 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">انحراف الجدول (SV)</p>
                <p className="text-xl font-bold">{evmData.sv.toLocaleString('ar-SA')}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">انحراف التكلفة (CV)</p>
                <p className="text-xl font-bold">{evmData.cv.toLocaleString('ar-SA')}</p>
              </div>
            </div>
          </div>

          {/* Budget Categories Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">توزيع الميزانية حسب الفئة</h3>
            <div className="space-y-4">
              {budgetItems.map(item => (
                <BudgetProgressBar key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="flex-1 overflow-auto p-6">
          <BudgetManagementView
            budgetItems={budgetItems}
            onUpdateBudget={saveBudget}
            projectId={project.id}
          />
        </div>
      )}

      {/* EVM Tab */}
      {activeTab === 'evm' && (
        <div className="flex-1 overflow-auto p-6">
          <EVMDetailedView evmData={evmData} project={project} />
        </div>
      )}

      {/* Cash Flow Tab */}
      {activeTab === 'cashflow' && (
        <div className="flex-1 overflow-auto p-6">
          <CashFlowManagementView
            cashFlow={cashFlow}
            onUpdateCashFlow={saveCashFlow}
            summary={cashFlowSummary}
          />
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="flex-1 overflow-auto p-6">
          <ForecastView
            evmData={evmData}
            budgetSummary={budgetSummary}
            project={project}
          />
        </div>
      )}
    </div>
  );
};

// ===== Helper Functions =====

function initializeBudget(project: Project): BudgetItem[] {
  const categories = ['عمالة', 'معدات', 'مواد', 'مقاولون فرعيون', 'نفقات عامة'];
  const totalBudget = project.data.financials.reduce((sum, item) => sum + item.total, 0);
  
  return categories.map((category, index) => {
    const budgetedCost = totalBudget / categories.length;
    const actualCost = budgetedCost * (Math.random() * 0.4 + 0.6); // 60-100%
    const committedCost = budgetedCost * 0.1;
    const forecastCost = actualCost + committedCost;
    
    return {
      id: `budget-${index}`,
      category,
      description: `ميزانية ${category}`,
      budgetedCost,
      actualCost,
      committedCost,
      forecastCost,
      variance: budgetedCost - actualCost,
      variancePercent: ((budgetedCost - actualCost) / budgetedCost) * 100
    };
  });
}

function calculateEVM(project: Project, budgetItems: BudgetItem[]): EVMData {
  const bac = budgetItems.reduce((sum, item) => sum + item.budgetedCost, 0);
  const ac = budgetItems.reduce((sum, item) => sum + item.actualCost, 0);
  
  // Calculate project progress
  const totalTasks = project.data.schedule.length;
  const progressSum = project.data.schedule.reduce((sum, task) => sum + task.progress, 0);
  const projectProgress = totalTasks > 0 ? progressSum / totalTasks : 0;
  
  const pv = bac * (projectProgress / 100);
  const ev = bac * (projectProgress / 100);
  
  const sv = ev - pv;
  const cv = ev - ac;
  
  const spi = pv > 0 ? ev / pv : 1;
  const cpi = ac > 0 ? ev / ac : 1;
  
  const etc = cpi > 0 ? (bac - ev) / cpi : 0;
  const eac = ac + etc;
  const vac = bac - eac;
  
  const tcpi = (bac - ev) > 0 ? (bac - ev) / (bac - ac) : 1;
  
  return { pv, ev, ac, bac, etc, eac, vac, spi, cpi, sv, cv, tcpi };
}

// ===== Helper Components =====

const KPICard: React.FC<{
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend: 'positive' | 'negative';
  isRatio?: boolean;
}> = ({ title, value, subtitle, icon: Icon, color, trend, isRatio }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      {trend === 'positive' ? (
        <CheckCircle className="text-green-500" size={24} />
      ) : (
        <AlertTriangle className="text-red-500" size={24} />
      )}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">
      {isRatio ? value.toFixed(2) : value.toLocaleString('ar-SA')}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
  </div>
);

const BudgetProgressBar: React.FC<{ item: BudgetItem }> = ({ item }) => {
  const percentage = (item.actualCost / item.budgetedCost) * 100;
  const isOverBudget = percentage > 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
        <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
          {item.actualCost.toLocaleString('ar-SA')} / {item.budgetedCost.toLocaleString('ar-SA')} ريال
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
        <span>{percentage.toFixed(1)}% مستخدم</span>
        <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
          {Math.abs(item.variance).toLocaleString('ar-SA')} ريال {item.variance >= 0 ? 'توفير' : 'تجاوز'}
        </span>
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const BudgetManagementView: React.FC<any> = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">إدارة الميزانية التفصيلية</h3>
    <p className="text-gray-600 dark:text-gray-400">سيتم إضافة واجهة إدارة الميزانية التفصيلية هنا</p>
  </div>
);

const EVMDetailedView: React.FC<any> = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">تحليل القيمة المكتسبة التفصيلي</h3>
    <p className="text-gray-600 dark:text-gray-400">سيتم إضافة رسوم بيانية وتحليلات EVM هنا</p>
  </div>
);

const CashFlowManagementView: React.FC<any> = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">إدارة التدفقات النقدية</h3>
    <p className="text-gray-600 dark:text-gray-400">سيتم إضافة جدول التدفقات النقدية هنا</p>
  </div>
);

const ForecastView: React.FC<any> = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">التنبؤات المالية</h3>
    <p className="text-gray-600 dark:text-gray-400">سيتم إضافة تحليلات التنبؤ المالي هنا</p>
  </div>
);

export default CostControlSystem;
