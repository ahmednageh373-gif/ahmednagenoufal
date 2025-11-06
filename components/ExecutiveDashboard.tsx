// 🎯 لوحة التحكم التنفيذية - Executive Dashboard
// نظرة شاملة لصاحب الشركة ومدير المشروع

import React, { useState, useMemo } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
    Users, DollarSign, Calendar, Target, Award, Clock, Activity,
    FileText, Zap, Shield, ArrowUp, ArrowDown, Minus, Download,
    Filter, RefreshCw, Bell, Settings, Eye, MapPin, Briefcase
} from '../lucide-icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { ExecutiveReport, ProjectMetrics, ProjectKPI, Notification } from '../types-extended';

interface ExecutiveDashboardProps {
    projectId: string;
    projectName: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ projectId, projectName }) => {
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('weekly');
    const [showNotifications, setShowNotifications] = useState(false);

    // Sample Executive Report Data
    const executiveReport: ExecutiveReport = {
        id: 'ER-001',
        projectId,
        reportDate: '2024-11-06',
        reportPeriod: 'Weekly',
        overallStatus: 'Yellow',
        scheduleStatus: 'Slight Delay',
        costStatus: 'On Budget',
        qualityStatus: 'Good',
        majorAccomplishments: [
            'إنجاز أعمال الخرسانة للأساسات بنسبة 100%',
            'استلام 80% من الحديد المطلوب',
            'اعتماد المخططات المعمارية النهائية'
        ],
        criticalIssues: [
            'تأخر تسليم بعض المعدات بسبب ظروف الشحن',
            'نقص في العمالة المتخصصة لأعمال الكهرباء',
            'حاجة لتعديل بعض المخططات الإنشائية'
        ],
        upcomingMilestones: [
            'بداية أعمال الهيكل الخرساني - 2024-11-10',
            'استلام معدات التكييف - 2024-11-15',
            'المراجعة الفنية الشهرية - 2024-11-20'
        ],
        decisionsRequired: [
            'الموافقة على تغيير في نوع البلاط المستخدم',
            'اعتماد ميزانية إضافية للعمالة',
            'اتخاذ قرار بشأن مقاول الكهرباء البديل'
        ],
        contractValue: 5000000,
        valuePaid: 1500000,
        valueEarned: 1100000,
        costToDate: 1150000,
        projectedFinalCost: 5100000,
        profitMargin: -2,
        physicalProgress: 22,
        plannedProgress: 24,
        scheduleDeviation: -2,
        currentManpower: 45,
        peakManpower: 80,
        activeEquipment: 12,
        progressTrend: 'Stable',
        costTrend: 'Stable',
        productivityTrend: 'Improving'
    };

    // Project Metrics
    const projectMetrics: ProjectMetrics = {
        projectId,
        date: '2024-11-06',
        totalTasks: 150,
        completedTasks: 33,
        inProgressTasks: 25,
        delayedTasks: 8,
        scheduleProgress: 22,
        criticalPathDuration: 180,
        projectDuration: 240,
        daysRemaining: 186,
        scheduleHealth: 'At Risk',
        totalBudget: 5000000,
        committedCost: 2000000,
        actualCost: 1150000,
        remainingBudget: 3850000,
        budgetUtilization: 23,
        financialHealth: 'Healthy',
        totalLabor: 60,
        activeLabor: 45,
        laborUtilization: 75,
        totalEquipment: 18,
        activeEquipment: 12,
        equipmentUtilization: 67,
        totalRisks: 12,
        openRisks: 5,
        highPriorityRisks: 2,
        qualityIssues: 3,
        safetyIncidents: 0,
        totalPurchaseOrders: 45,
        pendingPurchaseOrders: 12,
        deliveredPurchaseOrders: 28,
        procurementEfficiency: 82
    };

    // KPIs Data
    const kpis: ProjectKPI[] = [
        {
            id: 'KPI-001',
            name: 'نسبة الإنجاز الفعلي',
            category: 'Schedule',
            currentValue: 22,
            targetValue: 24,
            unit: '%',
            trend: 'Declining',
            status: 'Warning',
            lastUpdated: '2024-11-06',
            description: 'نسبة الإنجاز الفعلية مقارنة بالمخطط'
        },
        {
            id: 'KPI-002',
            name: 'مؤشر أداء التكلفة (CPI)',
            category: 'Cost',
            currentValue: 0.96,
            targetValue: 1.0,
            unit: '',
            trend: 'Stable',
            status: 'Warning',
            lastUpdated: '2024-11-06',
            description: 'كفاءة استخدام الميزانية'
        },
        {
            id: 'KPI-003',
            name: 'مؤشر أداء الجدول (SPI)',
            category: 'Schedule',
            currentValue: 0.92,
            targetValue: 1.0,
            unit: '',
            trend: 'Stable',
            status: 'Warning',
            lastUpdated: '2024-11-06',
            description: 'الالتزام بالجدول الزمني'
        },
        {
            id: 'KPI-004',
            name: 'معدل استخدام العمالة',
            category: 'Resource',
            currentValue: 75,
            targetValue: 80,
            unit: '%',
            trend: 'Improving',
            status: 'Good',
            lastUpdated: '2024-11-06',
            description: 'كفاءة استخدام العمالة'
        },
        {
            id: 'KPI-005',
            name: 'معدل الجودة',
            category: 'Quality',
            currentValue: 92,
            targetValue: 95,
            unit: '%',
            trend: 'Improving',
            status: 'Good',
            lastUpdated: '2024-11-06',
            description: 'نسبة الأعمال المقبولة من المرة الأولى'
        },
        {
            id: 'KPI-006',
            name: 'معدل السلامة',
            category: 'Safety',
            currentValue: 100,
            targetValue: 100,
            unit: '%',
            trend: 'Stable',
            status: 'Good',
            lastUpdated: '2024-11-06',
            description: 'أيام بدون حوادث'
        }
    ];

    // Notifications
    const notifications: Notification[] = [
        {
            id: 'N001',
            type: 'Critical',
            category: 'Schedule',
            title: 'تأخير محتمل في المسار الحرج',
            message: 'مهمة "صب الخرسانة للأساسات" متأخرة 3 أيام وتؤثر على المسار الحرج',
            date: '2024-11-06 09:30',
            read: false,
            actionRequired: true,
            actionLink: '/schedule',
            relatedEntityId: 'T-005',
            priority: 'Urgent'
        },
        {
            id: 'N002',
            type: 'Warning',
            category: 'Cost',
            title: 'اقتراب من حد الميزانية',
            message: 'بند "العمالة المباشرة" استخدم 85% من الميزانية المخصصة',
            date: '2024-11-06 10:15',
            read: false,
            actionRequired: true,
            actionLink: '/cost-control',
            relatedEntityId: 'BA-001',
            priority: 'High'
        },
        {
            id: 'N003',
            type: 'Info',
            category: 'Procurement',
            title: 'استلام أمر شراء',
            message: 'تم استلام شحنة الحديد - أمر شراء PO-012',
            date: '2024-11-06 11:45',
            read: true,
            actionRequired: false,
            relatedEntityId: 'PO-012',
            priority: 'Medium'
        }
    ];

    // Chart Data
    const progressTrendData = [
        { month: 'يونيو', مخطط: 10, فعلي: 9 },
        { month: 'يوليو', مخطط: 20, فعلي: 18 },
        { month: 'أغسطس', مخطط: 30, فعلي: 27 },
        { month: 'سبتمبر', مخطط: 40, فعلي: 36 },
        { month: 'أكتوبر', مخطط: 50, فعلي: 44 },
        { month: 'نوفمبر (حتى الآن)', مخطط: 60, فعلي: 52 }
    ];

    const costTrendData = [
        { month: 'يونيو', مخطط: 200000, فعلي: 180000 },
        { month: 'يوليو', مخطط: 400000, فعلي: 400000 },
        { month: 'أغسطس', مخطط: 600000, فعلي: 620000 },
        { month: 'سبتمبر', مخطط: 800000, فعلي: 850000 },
        { month: 'أكتوبر', مخطط: 1000000, فعلي: 1050000 },
        { month: 'نوفمبر (حتى الآن)', مخطط: 1200000, فعلي: 1150000 }
    ];

    const resourceUtilizationData = [
        { resource: 'العمالة', utilization: 75 },
        { resource: 'المعدات', utilization: 67 },
        { resource: 'المواد', utilization: 82 },
        { resource: 'المقاولون', utilization: 55 }
    ];

    const performanceRadarData = [
        { subject: 'الجدول', A: 92, fullMark: 100 },
        { subject: 'التكلفة', A: 96, fullMark: 100 },
        { subject: 'الجودة', A: 92, fullMark: 100 },
        { subject: 'السلامة', A: 100, fullMark: 100 },
        { subject: 'الموارد', A: 75, fullMark: 100 },
        { subject: 'المشتريات', A: 82, fullMark: 100 }
    ];

    // Status Indicators
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Green': return 'bg-green-500';
            case 'Yellow': return 'bg-yellow-500';
            case 'Red': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Green': return <CheckCircle size={20} />;
            case 'Yellow': return <AlertCircle size={20} />;
            case 'Red': return <AlertCircle size={20} />;
            default: return <Minus size={20} />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'Improving': return <ArrowUp className="text-green-600" size={16} />;
            case 'Declining': return <ArrowDown className="text-red-600" size={16} />;
            case 'Stable': return <Minus className="text-gray-600" size={16} />;
            default: return <Minus className="text-gray-600" size={16} />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Briefcase size={32} />
                            لوحة التحكم التنفيذية
                        </h1>
                        <p className="text-indigo-100 mt-1">
                            {projectName} - تقرير شامل لصاحب الشركة
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <Bell size={24} />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>
                        <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                            <RefreshCw size={24} />
                        </button>
                        <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                            <Download size={24} />
                        </button>
                    </div>
                </div>

                {/* Overall Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">الحالة العامة</span>
                            {getStatusIcon(executiveReport.overallStatus)}
                        </div>
                        <div className={`w-full h-2 rounded-full ${getStatusColor(executiveReport.overallStatus)}`} />
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">الجدول</span>
                            <Clock size={20} />
                        </div>
                        <p className="text-sm font-medium">{executiveReport.scheduleStatus}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">التكلفة</span>
                            <DollarSign size={20} />
                        </div>
                        <p className="text-sm font-medium">{executiveReport.costStatus}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">الجودة</span>
                            <Award size={20} />
                        </div>
                        <p className="text-sm font-medium">{executiveReport.qualityStatus}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - KPIs and Metrics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Financial Metrics */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <DollarSign size={24} className="text-green-600" />
                                المؤشرات المالية الرئيسية
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">قيمة العقد</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {(executiveReport.contractValue / 1000000).toFixed(1)}M ريال
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">المدفوع</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {(executiveReport.valuePaid / 1000000).toFixed(1)}M ريال
                                    </p>
                                    <p className="text-xs text-gray-500">{((executiveReport.valuePaid / executiveReport.contractValue) * 100).toFixed(0)}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">المكتسب</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {(executiveReport.valueEarned / 1000000).toFixed(1)}M ريال
                                    </p>
                                    <p className="text-xs text-gray-500">{((executiveReport.valueEarned / executiveReport.contractValue) * 100).toFixed(0)}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">هامش الربح</p>
                                    <p className={`text-xl font-bold ${executiveReport.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {executiveReport.profitMargin.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Overview Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                منحنى التقدم (مخطط vs فعلي)
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={progressTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="مخطط" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="فعلي" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Cost Trend Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                اتجاه التكاليف
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={costTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="مخطط" stroke="#4F46E5" strokeWidth={2} />
                                    <Line type="monotone" dataKey="فعلي" stroke="#EF4444" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Resource Utilization */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                استخدام الموارد
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={resourceUtilizationData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis dataKey="resource" type="category" />
                                    <Tooltip />
                                    <Bar dataKey="utilization" fill="#4F46E5" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Performance Radar */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                تحليل الأداء الشامل
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={performanceRadarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar name="الأداء" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column - KPIs, Issues, Decisions */}
                    <div className="space-y-6">
                        {/* KPIs Grid */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Target size={20} className="text-indigo-600" />
                                مؤشرات الأداء الرئيسية
                            </h3>
                            <div className="space-y-3">
                                {kpis.map(kpi => (
                                    <div key={kpi.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{kpi.name}</span>
                                            <div className="flex items-center gap-1">
                                                {getTrendIcon(kpi.trend)}
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    kpi.status === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    kpi.status === 'Warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {kpi.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {kpi.currentValue}{kpi.unit}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                الهدف: {kpi.targetValue}{kpi.unit}
                                            </span>
                                        </div>
                                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div 
                                                className={`h-1.5 rounded-full ${
                                                    kpi.status === 'Good' ? 'bg-green-500' :
                                                    kpi.status === 'Warning' ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min((kpi.currentValue / kpi.targetValue) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Major Accomplishments */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-600" />
                                الإنجازات الرئيسية
                            </h3>
                            <ul className="space-y-2">
                                {executiveReport.majorAccomplishments.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Critical Issues */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <AlertCircle size={20} className="text-red-600" />
                                القضايا الحرجة
                            </h3>
                            <ul className="space-y-2">
                                {executiveReport.criticalIssues.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                                        <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Upcoming Milestones */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-blue-600" />
                                المعالم القادمة
                            </h3>
                            <ul className="space-y-2">
                                {executiveReport.upcomingMilestones.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                                        <Clock size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Decisions Required */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Zap size={20} className="text-orange-600" />
                                قرارات مطلوبة
                            </h3>
                            <ul className="space-y-2">
                                {executiveReport.decisionsRequired.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                                        <Zap size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resource Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users size={20} className="text-purple-600" />
                                ملخص الموارد
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">العمالة الحالية</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{executiveReport.currentManpower}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ذروة العمالة</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{executiveReport.peakManpower}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">المعدات النشطة</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{executiveReport.activeEquipment}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="fixed inset-y-0 left-0 w-96 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 z-50 overflow-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Bell size={24} />
                                الإشعارات
                            </h3>
                            <button 
                                onClick={() => setShowNotifications(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3">
                            {notifications.map(notif => (
                                <div 
                                    key={notif.id}
                                    className={`p-4 rounded-lg border ${
                                        notif.type === 'Critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                                        notif.type === 'Warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                                        notif.type === 'Info' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' :
                                        'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                    } ${!notif.read ? 'font-semibold' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{notif.title}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            notif.priority === 'Urgent' ? 'bg-red-600 text-white' :
                                            notif.priority === 'High' ? 'bg-orange-600 text-white' :
                                            notif.priority === 'Medium' ? 'bg-yellow-600 text-white' :
                                            'bg-gray-600 text-white'
                                        }`}>
                                            {notif.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">{notif.message}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{notif.date}</span>
                                        {notif.actionRequired && (
                                            <button className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                                اتخاذ إجراء →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutiveDashboard;
