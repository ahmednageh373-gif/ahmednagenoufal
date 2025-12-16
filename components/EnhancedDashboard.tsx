/**
 * ═══════════════════════════════════════════════════════════════
 * لوحة التحكم الرئيسية المحسّنة (Enhanced Dashboard)
 * تصميم احترافي مع رسوم بيانية ومؤشرات أداء متقدمة
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useMemo } from 'react';
import type { Project, FinancialItem, ScheduleTask, ProjectWorkflow } from '../types';
import {
    GanttChartSquare, DollarSign, ShieldAlert, Target, Upload, Pyramid, 
    File, Printer, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
    Users, Calendar, Clock, Activity, Zap, Award, BarChart3, ArrowUp,
    ArrowDown, Minus, Eye, RefreshCw, Settings, Download
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { BoqAnalysisModal } from './BoqAnalysisModal';
import { extractFinancialItemsFromBOQ, processBoqToSchedule, generateWBS } from '../services/geminiService';
// REMOVED: import { NOUFALAgentCard } from './NOUFALAgentCard';

interface EnhancedDashboardProps {
    project: Project;
    onSelectView: (view: string) => void;
    onUpdateFinancials: (projectId: string, newFinancials: FinancialItem[], fileName: string) => void;
    onUpdateSchedule: (projectId: string, newSchedule: ScheduleTask[]) => void;
    onUpdateWorkflow: (projectId: string, newWorkflow: Partial<ProjectWorkflow>) => void;
}

declare var XLSX: any;

// ═══════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════

const KPICard: React.FC<{ 
    title: string; 
    value: string | number; 
    target?: string | number;
    icon: React.ElementType; 
    color: string; 
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    onClick?: () => void;
}> = ({ title, value, target, icon: Icon, color, trend, trendValue, onClick }) => {
    const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={color.replace('bg-', 'text-')} size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 ${trendColor}`}>
                        <TrendIcon size={16} />
                        <span className="text-sm font-semibold">{trendValue}</span>
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                {target && <p className="text-sm text-gray-500 dark:text-gray-400">/ {target}</p>}
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: 'success' | 'warning' | 'danger' | 'info'; text: string }> = ({ status, text }) => {
    const colors = {
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
            {text}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ 
    project, 
    onSelectView, 
    onUpdateFinancials, 
    onUpdateSchedule, 
    onUpdateWorkflow 
}) => {
    // ─────────────────────────────────────────────────────────
    // State Management
    // ─────────────────────────────────────────────────────────
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
    const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
    const [boqAnalysisResult, setBoqAnalysisResult] = useState<FinancialItem[]>([]);
    const [boqFileName, setBoqFileName] = useState('');
    const [isAnalyzingBoq, setIsAnalyzingBoq] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [isGeneratingWBS, setIsGeneratingWBS] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─────────────────────────────────────────────────────────
    // Calculated Metrics
    // ─────────────────────────────────────────────────────────
    const metrics = useMemo(() => {
        const totalTasks = project.data.schedule.length;
        const completedTasks = project.data.schedule.filter(t => t.progress === 100).length;
        const inProgressTasks = project.data.schedule.filter(t => t.progress > 0 && t.progress < 100).length;
        const delayedTasks = project.data.schedule.filter(t => {
            const today = new Date();
            const endDate = new Date(t.end);
            return t.progress < 100 && endDate < today;
        }).length;

        const scheduleProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const totalCost = project.data.financials.reduce((sum, item) => sum + item.total, 0);
        const openRisks = project.data.riskRegister.filter(r => r.status === 'Open').length;
        const highRisks = project.data.riskRegister.filter(r => r.status === 'Open' && r.impact === 'High').length;

        const totalKRs = project.data.keyResults.length;
        const krProgress = totalKRs > 0 ? Math.round(
            project.data.keyResults.reduce((sum, kr) => {
                const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
                return sum + Math.min(100, progress);
            }, 0) / totalKRs
        ) : 0;

        // Calculate schedule health
        const scheduleHealth = scheduleProgress >= 90 ? 'success' : 
                              scheduleProgress >= 70 ? 'warning' : 'danger';

        // Calculate cost health
        const costHealth = totalCost > 0 ? 'warning' : 'success';

        // Task distribution
        const tasksByStatus = {
            completed: completedTasks,
            inProgress: inProgressTasks,
            pending: totalTasks - completedTasks - inProgressTasks,
            delayed: delayedTasks
        };

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            delayedTasks,
            scheduleProgress,
            totalCost,
            openRisks,
            highRisks,
            krProgress,
            scheduleHealth,
            costHealth,
            tasksByStatus
        };
    }, [project]);

    // ─────────────────────────────────────────────────────────
    // Chart Data
    // ─────────────────────────────────────────────────────────
    const progressChartData = useMemo(() => {
        // Generate weekly progress data (mock data - replace with real data)
        return [
            { week: 'الأسبوع 1', planned: 10, actual: 8 },
            { week: 'الأسبوع 2', planned: 20, actual: 18 },
            { week: 'الأسبوع 3', planned: 30, actual: 28 },
            { week: 'الأسبوع 4', planned: 40, actual: metrics.scheduleProgress }
        ];
    }, [metrics.scheduleProgress]);

    const taskDistributionData = [
        { name: 'مكتملة', value: metrics.tasksByStatus.completed, color: '#10b981' },
        { name: 'قيد التنفيذ', value: metrics.tasksByStatus.inProgress, color: '#3b82f6' },
        { name: 'معلقة', value: metrics.tasksByStatus.pending, color: '#6b7280' },
        { name: 'متأخرة', value: metrics.tasksByStatus.delayed, color: '#ef4444' }
    ];

    const costBreakdownData = useMemo(() => {
        // Group financials by category
        const categories: { [key: string]: number } = {};
        project.data.financials.forEach(item => {
            const category = item.category || 'أخرى';
            categories[category] = (categories[category] || 0) + item.total;
        });

        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [project.data.financials]);

    // ─────────────────────────────────────────────────────────
    // Event Handlers
    // ─────────────────────────────────────────────────────────
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzingBoq(true);
        setIsBoqModalOpen(true);
        setBoqFileName(file.name);
        setBoqAnalysisResult([]);
        
        try {
            const items = await extractFinancialItemsFromBOQ(file);
            setBoqAnalysisResult(items);
        } catch (error) {
            console.error("BOQ Analysis failed:", error);
            alert(`فشل تحليل المقايسة: ${(error as Error).message}`);
            setIsBoqModalOpen(false);
        } finally {
            setIsAnalyzingBoq(false);
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleConfirmBoq = async (items: FinancialItem[], fileName: string, generateSchedule: boolean) => {
        onUpdateFinancials(project.id, items, fileName);
        setIsBoqModalOpen(false);

        if (generateSchedule) {
            setIsGeneratingSchedule(true);
            try {
                const newSchedule = await processBoqToSchedule(items, project.startDate);
                if (newSchedule.length > 0) {
                    onUpdateSchedule(project.id, newSchedule);
                    alert('تم إنشاء وتحديث الجدول الزمني بنجاح بناءً على المقايسة.');
                } else {
                    alert('تم تحليل المقايسة ولكن لم يتم العثور على مهام لإنشاء جدول زمني.');
                }
            } catch(e) {
                alert(`فشل إنشاء الجدول الزمني: ${(e as Error).message}`);
            } finally {
                setIsGeneratingSchedule(false);
            }
        }
    };

    const handleGenerateWBS = async () => {
        if (project.data.workflow.wbs && !window.confirm("سيقوم الذكاء الاصطناعي بإنشاء هيكل تجزئة عمل (WBS) جديد. هل تريد المتابعة؟")) {
            return;
        }
        
        setIsGeneratingWBS(true);
        try {
            const wbsResult = await generateWBS(project);
            onUpdateWorkflow(project.id, { wbs: wbsResult });
            alert('تم إنشاء هيكل تجزئة العمل بنجاح!');
            onSelectView('workflow');
        } catch (error) {
            console.error("WBS Generation failed:", error);
            alert(`فشل إنشاء WBS: ${(error as Error).message}`);
        } finally {
            setIsGeneratingWBS(false);
        }
    };

    const handlePrint = () => window.print();

    const handleExportXLSX = () => {
        const dashboardData = {
            metrics: [
                { المؤشر: 'تقدم الجدول الزمني', القيمة: `${metrics.scheduleProgress}%` },
                { المؤشر: 'المهام المكتملة', القيمة: `${metrics.completedTasks}/${metrics.totalTasks}` },
                { المؤشر: 'التكلفة الإجمالية', القيمة: `${metrics.totalCost.toLocaleString('ar-SA')} ريال` },
                { المؤشر: 'المخاطر المفتوحة', القيمة: metrics.openRisks }
            ],
            tasks: project.data.schedule.slice(0, 10).map(t => ({
                المهمة: t.name,
                الحالة: t.status,
                التقدم: `${t.progress}%`,
                البداية: t.start,
                النهاية: t.end
            }))
        };

        const metricsSheet = XLSX.utils.json_to_sheet(dashboardData.metrics);
        const tasksSheet = XLSX.utils.json_to_sheet(dashboardData.tasks);
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, metricsSheet, "المؤشرات");
        XLSX.utils.book_append_sheet(workbook, tasksSheet, "المهام");
        XLSX.writeFile(workbook, `dashboard_${project.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // ═══════════════════════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="space-y-6 printable-area">
            {/* ─────────────────────────────────────────────────────── */}
            {/* Header Section */}
            {/* ─────────────────────────────────────────────────────── */}
            <header className="flex justify-between items-start flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        لوحة التحكم الرئيسية
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Eye size={18} />
                        <span>نظرة شاملة على مشروع:</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{project.name}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="week">أسبوعي</option>
                        <option value="month">شهري</option>
                        <option value="quarter">ربع سنوي</option>
                    </select>

                    <button 
                        onClick={handleExportXLSX}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        <Download size={18} />
                        <span>تصدير Excel</span>
                    </button>

                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        <Printer size={18} />
                        <span>طباعة</span>
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isGeneratingSchedule || isGeneratingWBS}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingSchedule ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Upload size={18} />
                        )}
                        <span>{isGeneratingSchedule ? 'جاري الإنشاء...' : 'استيراد مقايسة'}</span>
                    </button>

                    <button 
                        onClick={handleGenerateWBS} 
                        disabled={isGeneratingSchedule || isGeneratingWBS}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingWBS ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Pyramid size={18} />
                        )}
                        <span>{isGeneratingWBS ? 'جاري الإنشاء...' : 'اقترح WBS (AI)'}</span>
                    </button>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".xlsx, .xls, .csv" 
                        className="hidden" 
                    />
                </div>
            </header>

            {/* REMOVED: NOUFAL Agent Card - User reported it takes too much space */}

            {/* ─────────────────────────────────────────────────────── */}
            {/* Project Health Status */}
            {/* ─────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">حالة المشروع</h2>
                        <p className="text-indigo-100">آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-sm opacity-90">الجدول الزمني</p>
                            <StatusBadge 
                                status={metrics.scheduleHealth} 
                                text={metrics.scheduleProgress >= 90 ? 'ممتاز' : metrics.scheduleProgress >= 70 ? 'جيد' : 'يحتاج اهتمام'} 
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm opacity-90">التكلفة</p>
                            <StatusBadge 
                                status={metrics.costHealth} 
                                text={metrics.totalCost > 0 ? 'ضمن الميزانية' : 'لم يبدأ'} 
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm opacity-90">المخاطر</p>
                            <StatusBadge 
                                status={metrics.highRisks > 0 ? 'danger' : metrics.openRisks > 0 ? 'warning' : 'success'} 
                                text={metrics.highRisks > 0 ? 'مرتفعة' : metrics.openRisks > 0 ? 'متوسطة' : 'منخفضة'} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* KPI Cards */}
            {/* ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="تقدم الجدول الزمني"
                    value={`${metrics.scheduleProgress}%`}
                    target="100%"
                    icon={GanttChartSquare}
                    color="bg-blue-500"
                    trend={metrics.scheduleProgress >= 70 ? 'up' : 'down'}
                    trendValue={`${metrics.completedTasks}/${metrics.totalTasks}`}
                    onClick={() => onSelectView('schedule')}
                />

                <KPICard
                    title="التكلفة الإجمالية"
                    value={metrics.totalCost.toLocaleString('ar-SA')}
                    icon={DollarSign}
                    color="bg-green-500"
                    trend="stable"
                    trendValue="ريال"
                    onClick={() => onSelectView('financials')}
                />

                <KPICard
                    title="المخاطر المفتوحة"
                    value={metrics.openRisks}
                    icon={ShieldAlert}
                    color="bg-red-500"
                    trend={metrics.highRisks > 0 ? 'up' : 'stable'}
                    trendValue={`${metrics.highRisks} عالية`}
                    onClick={() => onSelectView('risks')}
                />

                <KPICard
                    title="تقدم الأهداف"
                    value={`${metrics.krProgress}%`}
                    target="100%"
                    icon={Target}
                    color="bg-indigo-500"
                    trend={metrics.krProgress >= 70 ? 'up' : 'down'}
                    trendValue="OKRs"
                    onClick={() => onSelectView('okrs')}
                />
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* Secondary Metrics */}
            {/* ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <CheckCircle className="text-green-500" size={24} />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.completedTasks}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">مهام مكتملة</p>
                </div>

                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="text-blue-500" size={24} />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.inProgressTasks}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">مهام قيد التنفيذ</p>
                </div>

                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <AlertCircle className="text-red-500" size={24} />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.delayedTasks}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">مهام متأخرة</p>
                </div>

                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="text-gray-500" size={24} />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.tasksByStatus.pending}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">مهام معلقة</p>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* Charts Section */}
            {/* ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart3 size={24} className="text-indigo-500" />
                        منحنى التقدم (خطة vs فعلي)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={progressChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="week" className="text-sm" />
                            <YAxis className="text-sm" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="planned" 
                                stackId="1" 
                                stroke="#8b5cf6" 
                                fill="#8b5cf6" 
                                fillOpacity={0.6}
                                name="المخطط"
                            />
                            <Area 
                                type="monotone" 
                                dataKey="actual" 
                                stackId="2" 
                                stroke="#3b82f6" 
                                fill="#3b82f6" 
                                fillOpacity={0.6}
                                name="الفعلي"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Task Distribution */}
                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity size={24} className="text-indigo-500" />
                        توزيع المهام
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={taskDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {taskDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* Cost Breakdown Chart */}
            {/* ─────────────────────────────────────────────────────── */}
            {costBreakdownData.length > 0 && (
                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <DollarSign size={24} className="text-green-500" />
                        توزيع التكاليف حسب الفئة
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costBreakdownData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" className="text-sm" />
                            <YAxis className="text-sm" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                                formatter={(value: number) => `${value.toLocaleString('ar-SA')} ريال`}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} name="التكلفة" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────── */}
            {/* Details Section */}
            {/* ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Tasks */}
                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar size={24} className="text-indigo-500" />
                            المهام القادمة
                        </h3>
                        <button 
                            onClick={() => onSelectView('schedule')}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                        >
                            عرض الكل ←
                        </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {project.data.schedule
                            .filter(t => t.status !== 'Done')
                            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                            .slice(0, 8)
                            .map(task => (
                                <div 
                                    key={task.id} 
                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium text-gray-900 dark:text-white">{task.name}</p>
                                        <StatusBadge 
                                            status={task.status === 'In Progress' ? 'info' : 'warning'} 
                                            text={task.status} 
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {task.start}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Activity size={14} />
                                            {task.progress}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        }
                        {project.data.schedule.filter(t => t.status !== 'Done').length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                🎉 لا توجد مهام قادمة - جميع المهام مكتملة!
                            </p>
                        )}
                    </div>
                </div>

                {/* Critical Risks */}
                <div className="bg-white dark:bg-gray-900/70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldAlert size={24} className="text-red-500" />
                            المخاطر الحرجة
                        </h3>
                        <button 
                            onClick={() => onSelectView('risks')}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                        >
                            عرض الكل ←
                        </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {project.data.riskRegister
                            .filter(r => r.status === 'Open' && r.impact === 'High')
                            .slice(0, 8)
                            .map(risk => (
                                <div 
                                    key={risk.id} 
                                    className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <p className="font-medium text-gray-900 dark:text-white mb-2">{risk.description}</p>
                                    <div className="flex items-center gap-3 text-sm">
                                        <StatusBadge status="danger" text={`احتمالية: ${risk.probability}`} />
                                        <StatusBadge status="danger" text={`تأثير: ${risk.impact}`} />
                                    </div>
                                </div>
                            ))
                        }
                        {project.data.riskRegister.filter(r => r.status === 'Open' && r.impact === 'High').length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                ✅ لا توجد مخاطر حرجة حالياً
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────── */}
            {/* BOQ Analysis Modal */}
            {/* ─────────────────────────────────────────────────────── */}
            <BoqAnalysisModal
                isOpen={isBoqModalOpen}
                onClose={() => setIsBoqModalOpen(false)}
                onConfirm={handleConfirmBoq}
                financialItems={boqAnalysisResult}
                fileName={boqFileName}
                isLoading={isAnalyzingBoq}
            />
        </div>
    );
};
