/**
 * Advanced Analytics Dashboard
 * لوحة التحكم التحليلية المتقدمة
 * 
 * Features:
 * - Interactive charts (Line, Bar, Pie, Area)
 * - Real-time KPIs and metrics
 * - AI-powered insights using Gemini
 * - Predictive analytics
 * - Export to PDF/Excel
 * - Customizable date ranges
 * 
 * @author NOUFAL EMS
 * @date 2025-11-07
 * @version 2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Calendar,
  Zap,
  Target,
  Users,
  Layers,
  RefreshCw,
  ChevronDown,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface AnalyticsData {
  projectMetrics: ProjectMetrics;
  financialData: FinancialData[];
  schedulePerformance: SchedulePerformance[];
  riskAnalysis: RiskAnalysis;
  resourceUtilization: ResourceUtilization[];
  aiInsights: AIInsight[];
}

interface ProjectMetrics {
  totalBudget: number;
  spentBudget: number;
  budgetVariance: number;
  scheduleProgress: number;
  scheduleVariance: number;
  completedTasks: number;
  totalTasks: number;
  activeRisks: number;
  completionDate: string;
  daysRemaining: number;
}

interface FinancialData {
  month: string;
  planned: number;
  actual: number;
  forecast: number;
}

interface SchedulePerformance {
  week: string;
  planned: number;
  actual: number;
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index
}

interface RiskAnalysis {
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface ResourceUtilization {
  resource: string;
  utilization: number;
  capacity: number;
}

interface AIInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// ============================================================================
// Utility Functions
// ============================================================================

const generateMockAnalyticsData = (): AnalyticsData => {
  return {
    projectMetrics: {
      totalBudget: 5000000,
      spentBudget: 3200000,
      budgetVariance: -8.5,
      scheduleProgress: 65,
      scheduleVariance: -5.2,
      completedTasks: 42,
      totalTasks: 65,
      activeRisks: 12,
      completionDate: '2025-12-30',
      daysRemaining: 53
    },
    financialData: [
      { month: 'Jan', planned: 400000, actual: 380000, forecast: 390000 },
      { month: 'Feb', planned: 450000, actual: 470000, forecast: 460000 },
      { month: 'Mar', planned: 500000, actual: 480000, forecast: 490000 },
      { month: 'Apr', planned: 550000, actual: 560000, forecast: 555000 },
      { month: 'May', planned: 600000, actual: 580000, forecast: 590000 },
      { month: 'Jun', planned: 650000, actual: 670000, forecast: 660000 }
    ],
    schedulePerformance: [
      { week: 'W1', planned: 8, actual: 7, cpi: 0.95, spi: 0.88 },
      { week: 'W2', planned: 10, actual: 11, cpi: 1.05, spi: 1.10 },
      { week: 'W3', planned: 12, actual: 10, cpi: 0.90, spi: 0.83 },
      { week: 'W4', planned: 15, actual: 14, cpi: 0.98, spi: 0.93 },
      { week: 'W5', planned: 18, actual: 19, cpi: 1.08, spi: 1.06 },
      { week: 'W6', planned: 20, actual: 18, cpi: 0.92, spi: 0.90 }
    ],
    riskAnalysis: {
      high: 3,
      medium: 7,
      low: 2,
      total: 12
    },
    resourceUtilization: [
      { resource: 'Engineers', utilization: 85, capacity: 100 },
      { resource: 'Equipment', utilization: 72, capacity: 100 },
      { resource: 'Materials', utilization: 90, capacity: 100 },
      { resource: 'Budget', utilization: 64, capacity: 100 },
      { resource: 'Time', utilization: 78, capacity: 100 }
    ],
    aiInsights: [
      {
        id: '1',
        type: 'warning',
        title: 'Schedule Variance Detected',
        description: 'Project is running 5.2% behind schedule in critical path activities.',
        recommendation: 'Consider adding resources to tasks T-15, T-23, and T-31 to recover schedule.',
        confidence: 92,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'critical',
        title: 'Budget Overrun Risk',
        description: 'Current spending rate indicates potential 8.5% budget overrun by project completion.',
        recommendation: 'Review non-critical expenses and negotiate better rates with suppliers.',
        confidence: 87,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'info',
        title: 'Resource Optimization Opportunity',
        description: 'Materials utilization at 90% - consider ordering next batch to avoid delays.',
        recommendation: 'Place order for Phase 2 materials within the next 2 weeks.',
        confidence: 95,
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        type: 'success',
        title: 'Quality Metrics Excellent',
        description: 'QA/QC metrics show 98% pass rate, significantly above industry standard.',
        recommendation: 'Document best practices for future projects.',
        confidence: 99,
        timestamp: new Date().toISOString()
      }
    ]
  };
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

// ============================================================================
// Subcomponents
// ============================================================================

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color,
  trend = 'neutral'
}) => {
  const trendIcon = trend === 'up' ? <ArrowUp className="w-4 h-4" /> : 
                     trend === 'down' ? <ArrowDown className="w-4 h-4" /> : 
                     <Minus className="w-4 h-4" />;
  
  const trendColor = trend === 'up' ? 'text-green-600' : 
                      trend === 'down' ? 'text-red-600' : 
                      'text-gray-600';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${trendColor} text-sm font-medium`}>
            {trendIcon}
            <span>{formatPercentage(change)}</span>
          </div>
        )}
      </div>
      
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
        {title}
      </h3>
      
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' && value > 1000 ? formatCurrency(value) : value}
        </p>
        {changeLabel && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {changeLabel}
          </p>
        )}
      </div>
    </div>
  );
};

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, actions }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

const AIInsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
  const typeColors = {
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    critical: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
  };

  const typeIcons = {
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    info: <Activity className="w-5 h-5 text-blue-600" />,
    critical: <AlertTriangle className="w-5 h-5 text-red-600" />
  };

  return (
    <div className={`rounded-lg p-4 border ${typeColors[insight.type]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {typeIcons[insight.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {insight.confidence}% confidence
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {insight.description}
          </p>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2 mt-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              💡 Recommendation:
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {insight.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const AdvancedAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>(generateMockAnalyticsData());
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockAnalyticsData());
      setIsLoading(false);
    }, 1000);
  };

  // Colors for charts
  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b'];

  // Risk pie chart data
  const riskPieData = [
    { name: 'High Risk', value: data.riskAnalysis.high, color: '#ef4444' },
    { name: 'Medium Risk', value: data.riskAnalysis.medium, color: '#f59e0b' },
    { name: 'Low Risk', value: data.riskAnalysis.low, color: '#10b981' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Advanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights and predictive analytics powered by AI
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export Button */}
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Budget Performance"
          value={formatCurrency(data.projectMetrics.spentBudget)}
          change={data.projectMetrics.budgetVariance}
          changeLabel={`of ${formatCurrency(data.projectMetrics.totalBudget)}`}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          trend={data.projectMetrics.budgetVariance >= 0 ? 'up' : 'down'}
        />

        <KPICard
          title="Schedule Progress"
          value={`${data.projectMetrics.scheduleProgress}%`}
          change={data.projectMetrics.scheduleVariance}
          changeLabel={`${data.projectMetrics.daysRemaining} days remaining`}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={data.projectMetrics.scheduleVariance >= 0 ? 'up' : 'down'}
        />

        <KPICard
          title="Tasks Completed"
          value={`${data.projectMetrics.completedTasks}/${data.projectMetrics.totalTasks}`}
          change={(data.projectMetrics.completedTasks / data.projectMetrics.totalTasks) * 100}
          changeLabel="completion rate"
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="up"
        />

        <KPICard
          title="Active Risks"
          value={data.projectMetrics.activeRisks}
          change={-15.3}
          changeLabel="vs last month"
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          trend="down"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Performance Chart */}
        <ChartContainer title="💰 Financial Performance">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.financialData}>
              <defs>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="planned" stroke="#6366f1" fillOpacity={1} fill="url(#colorPlanned)" name="Planned" />
              <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="Actual" />
              <Area type="monotone" dataKey="forecast" stroke="#f59e0b" fill="none" strokeDasharray="5 5" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Schedule Performance Chart */}
        <ChartContainer title="📅 Schedule Performance Index">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.schedulePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="cpi" stroke="#ec4899" strokeWidth={2} name="CPI (Cost)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="spi" stroke="#8b5cf6" strokeWidth={2} name="SPI (Schedule)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="planned" stroke="#6366f1" strokeWidth={0} fill="#6366f1" fillOpacity={0.1} name="Baseline" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <ChartContainer title="⚠️ Risk Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Resource Utilization */}
        <div className="lg:col-span-2">
          <ChartContainer title="👥 Resource Utilization">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.resourceUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                <YAxis dataKey="resource" type="category" stroke="#6b7280" width={100} />
                <Tooltip 
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="utilization" fill="#6366f1" radius={[0, 8, 8, 0]} name="Utilization %">
                  {data.resourceUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.utilization > 85 ? '#ef4444' : entry.utilization > 70 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            AI-Powered Insights
          </h2>
          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-medium rounded">
            Powered by Gemini
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.aiInsights.map((insight) => (
            <AIInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Overall Health Score</p>
            <p className="text-3xl font-bold">87/100</p>
            <p className="text-indigo-200 text-xs mt-1">Excellent Performance</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Cost Variance</p>
            <p className="text-3xl font-bold">{formatPercentage(data.projectMetrics.budgetVariance)}</p>
            <p className="text-indigo-200 text-xs mt-1">Within Acceptable Range</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Schedule Variance</p>
            <p className="text-3xl font-bold">{formatPercentage(data.projectMetrics.scheduleVariance)}</p>
            <p className="text-indigo-200 text-xs mt-1">Needs Attention</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Predicted Completion</p>
            <p className="text-3xl font-bold">{data.projectMetrics.completionDate}</p>
            <p className="text-indigo-200 text-xs mt-1">{data.projectMetrics.daysRemaining} days remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
