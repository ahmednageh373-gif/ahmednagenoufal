// 💰 نظام إدارة التكاليف والإدارة المالية المتقدم
// Cost Control & Financial Management System

import React, { useState, useMemo } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, AlertCircle, 
    FileText, Download, Upload, Plus, Calendar, Filter,
    PieChart, BarChart3, TrendingUp as Activity, CheckCircle, XCircle,
    Clock, Target, Wallet, CreditCard, Receipt
} from 'lucide-react';
import type {
    CostItem, BudgetAllocation, PaymentCertificate, 
    CashFlow, EVMData, CostType, CostStatus, PaymentStatus
} from '../types-extended';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostControlSystemProps {
    projectId: string;
    totalBudget: number;
}

export const CostControlSystem: React.FC<CostControlSystemProps> = ({ projectId, totalBudget }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'budget' | 'payments' | 'cashflow' | 'evm'>('overview');
    const [filterType, setFilterType] = useState<CostType | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CostStatus | 'all'>('all');

    // Sample Data
    const [costItems] = useState<CostItem[]>([
        {
            id: 'C001',
            description: 'أجور عمالة - أعمال الخرسانة',
            costType: 'Direct Labor',
            costCode: 'LAB-001',
            linkedBOQItemId: 'F-001',
            linkedTaskId: 1,
            plannedCost: 50000,
            committedCost: 48000,
            actualCost: 52000,
            variance: -2000,
            variancePercentage: -4,
            date: '2024-11-01',
            status: 'Actual',
            notes: 'تجاوز التكلفة المخططة بسبب العمل الإضافي'
        },
        {
            id: 'C002',
            description: 'إيجار معدات - كرين 50 طن',
            costType: 'Equipment',
            costCode: 'EQP-001',
            linkedTaskId: 1,
            plannedCost: 25000,
            committedCost: 25000,
            actualCost: 25000,
            variance: 0,
            variancePercentage: 0,
            date: '2024-11-05',
            status: 'Actual',
            notes: 'ضمن الميزانية المخططة'
        },
        {
            id: 'C003',
            description: 'خرسانة جاهزة 350',
            costType: 'Materials',
            costCode: 'MAT-001',
            linkedBOQItemId: 'F-001',
            plannedCost: 150000,
            committedCost: 145000,
            actualCost: 0,
            variance: 5000,
            variancePercentage: 3.3,
            date: '2024-11-10',
            status: 'Committed',
            notes: 'تم الحصول على خصم من المورد'
        },
        {
            id: 'C004',
            description: 'مقاول باطن - أعمال الكهرباء',
            costType: 'Subcontractor',
            costCode: 'SUB-001',
            plannedCost: 200000,
            committedCost: 195000,
            actualCost: 0,
            variance: 5000,
            variancePercentage: 2.5,
            date: '2024-12-01',
            status: 'Committed',
            notes: 'عقد مقاول باطن بسعر تنافسي'
        }
    ]);

    const [budgetAllocations] = useState<BudgetAllocation[]>([
        {
            id: 'BA001',
            category: 'العمالة المباشرة',
            allocatedBudget: 500000,
            committedAmount: 380000,
            actualSpent: 250000,
            remaining: 250000,
            utilizationPercentage: 50,
            forecastedTotal: 520000,
            varianceAtCompletion: -20000
        },
        {
            id: 'BA002',
            category: 'المواد',
            allocatedBudget: 800000,
            committedAmount: 650000,
            actualSpent: 400000,
            remaining: 400000,
            utilizationPercentage: 50,
            forecastedTotal: 780000,
            varianceAtCompletion: 20000
        },
        {
            id: 'BA003',
            category: 'المعدات',
            allocatedBudget: 300000,
            committedAmount: 200000,
            actualSpent: 150000,
            remaining: 150000,
            utilizationPercentage: 50,
            forecastedTotal: 295000,
            varianceAtCompletion: 5000
        },
        {
            id: 'BA004',
            category: 'المقاولون من الباطن',
            allocatedBudget: 600000,
            committedAmount: 400000,
            actualSpent: 200000,
            remaining: 400000,
            utilizationPercentage: 33.3,
            forecastedTotal: 590000,
            varianceAtCompletion: 10000
        },
        {
            id: 'BA005',
            category: 'التكاليف العامة',
            allocatedBudget: 200000,
            committedAmount: 100000,
            actualSpent: 80000,
            remaining: 120000,
            utilizationPercentage: 40,
            forecastedTotal: 195000,
            varianceAtCompletion: 5000
        }
    ]);

    const [cashFlows] = useState<CashFlow[]>([
        {
            id: 'CF001',
            date: '2024-10-01',
            description: 'دفعة مقدمة من العميل',
            category: 'تحصيلات',
            inflow: 500000,
            outflow: 0,
            balance: 500000,
            type: 'Income',
            paymentMethod: 'تحويل بنكي'
        },
        {
            id: 'CF002',
            date: '2024-10-05',
            description: 'دفعة لمورد الخرسانة',
            category: 'مواد',
            inflow: 0,
            outflow: 150000,
            balance: 350000,
            type: 'Expense',
            relatedDocumentId: 'PO-001',
            paymentMethod: 'شيك'
        },
        {
            id: 'CF003',
            date: '2024-10-15',
            description: 'صرف رواتب العمالة',
            category: 'رواتب',
            inflow: 0,
            outflow: 80000,
            balance: 270000,
            type: 'Expense',
            paymentMethod: 'تحويل بنكي'
        },
        {
            id: 'CF004',
            date: '2024-11-01',
            description: 'المستخلص الأول',
            category: 'تحصيلات',
            inflow: 300000,
            outflow: 0,
            balance: 570000,
            type: 'Income',
            relatedDocumentId: 'PC-001',
            paymentMethod: 'تحويل بنكي'
        }
    ]);

    // EVM Data
    const evmData: EVMData = {
        date: '2024-11-06',
        plannedValue: 1200000,
        earnedValue: 1100000,
        actualCost: 1150000,
        budgetAtCompletion: 2400000,
        scheduleVariance: -100000,
        scheduleVariancePercentage: -8.3,
        costVariance: -50000,
        costVariancePercentage: -4.5,
        schedulePerformanceIndex: 0.917,
        costPerformanceIndex: 0.957,
        estimateAtCompletion: 2508000,
        estimateToComplete: 1358000,
        varianceAtCompletion: -108000,
        toCompletePerformanceIndex: 1.04
    };

    // Calculations
    const totalPlannedCost = useMemo(() => 
        costItems.reduce((sum, item) => sum + item.plannedCost, 0), 
        [costItems]
    );

    const totalCommittedCost = useMemo(() => 
        costItems.reduce((sum, item) => sum + item.committedCost, 0), 
        [costItems]
    );

    const totalActualCost = useMemo(() => 
        costItems.reduce((sum, item) => sum + item.actualCost, 0), 
        [costItems]
    );

    const totalVariance = totalPlannedCost - totalActualCost;
    const variancePercentage = totalPlannedCost > 0 ? ((totalVariance / totalPlannedCost) * 100).toFixed(1) : '0';

    // Chart Data
    const budgetChartData = budgetAllocations.map(ba => ({
        name: ba.category,
        مخطط: ba.allocatedBudget,
        ملتزم: ba.committedAmount,
        فعلي: ba.actualSpent
    }));

    const pieChartData = budgetAllocations.map(ba => ({
        name: ba.category,
        value: ba.actualSpent
    }));

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const evmChartData = [
        {
            month: 'يناير',
            PV: 200000,
            EV: 180000,
            AC: 190000
        },
        {
            month: 'فبراير',
            PV: 400000,
            EV: 380000,
            AC: 400000
        },
        {
            month: 'مارس',
            PV: 600000,
            EV: 550000,
            AC: 580000
        },
        {
            month: 'أبريل',
            PV: 800000,
            EV: 720000,
            AC: 760000
        },
        {
            month: 'مايو',
            PV: 1000000,
            EV: 900000,
            AC: 950000
        },
        {
            month: 'يونيو (حتى الآن)',
            PV: 1200000,
            EV: 1100000,
            AC: 1150000
        }
    ];

    const cashFlowChartData = cashFlows.map(cf => ({
        date: cf.date,
        تحصيلات: cf.inflow,
        مصروفات: cf.outflow,
        رصيد: cf.balance
    }));

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <DollarSign className="text-green-600" size={32} />
                            نظام إدارة التكاليف والإدارة المالية
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            تحكم شامل في التكاليف والميزانية والتدفقات النقدية
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Download size={20} />
                            تصدير التقرير
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            <Plus size={20} />
                            إضافة تكلفة
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">الميزانية الإجمالية</p>
                                <p className="text-2xl font-bold">{totalBudget.toLocaleString()} ريال</p>
                            </div>
                            <Target size={36} className="opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">التكلفة الفعلية</p>
                                <p className="text-2xl font-bold">{totalActualCost.toLocaleString()} ريال</p>
                                <p className="text-xs mt-1 opacity-75">
                                    {((totalActualCost / totalBudget) * 100).toFixed(1)}% من الميزانية
                                </p>
                            </div>
                            <Receipt size={36} className="opacity-50" />
                        </div>
                    </div>

                    <div className={`bg-gradient-to-br ${totalVariance >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white p-4 rounded-lg`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">الانحراف</p>
                                <p className="text-2xl font-bold">{totalVariance.toLocaleString()} ريال</p>
                                <p className="text-xs mt-1 opacity-75">
                                    {variancePercentage}% {totalVariance >= 0 ? 'توفير' : 'تجاوز'}
                                </p>
                            </div>
                            {totalVariance >= 0 ? <TrendingUp size={36} className="opacity-50" /> : <TrendingDown size={36} className="opacity-50" />}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">المتبقي</p>
                                <p className="text-2xl font-bold">{(totalBudget - totalActualCost).toLocaleString()} ريال</p>
                                <p className="text-xs mt-1 opacity-75">
                                    {(((totalBudget - totalActualCost) / totalBudget) * 100).toFixed(1)}% متبقي
                                </p>
                            </div>
                            <Wallet size={36} className="opacity-50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
                <div className="flex gap-2 overflow-x-auto">
                    {[
                        { key: 'overview', label: 'نظرة عامة', icon: TrendingUp as Activity },
                        { key: 'costs', label: 'التكاليف', icon: DollarSign },
                        { key: 'budget', label: 'الميزانية', icon: Target },
                        { key: 'payments', label: 'المستخلصات', icon: FileText },
                        { key: 'cashflow', label: 'التدفق النقدي', icon: TrendingUp },
                        { key: 'evm', label: 'إدارة القيمة المكتسبة', icon: BarChart3 }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <tab.icon className="inline mr-2" size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Budget Overview Chart */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    نظرة عامة على الميزانية حسب الفئة
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={budgetChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="مخطط" fill="#4F46E5" />
                                        <Bar dataKey="ملتزم" fill="#10B981" />
                                        <Bar dataKey="فعلي" fill="#F59E0B" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Cost Distribution Pie Chart */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    توزيع التكاليف الفعلية
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RePieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Budget Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {budgetAllocations.map(ba => (
                                <div key={ba.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">{ba.category}</h4>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">المخصص:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{ba.allocatedBudget.toLocaleString()} ريال</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">المنصرف:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{ba.actualSpent.toLocaleString()} ريال</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">المتبقي:</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">{ba.remaining.toLocaleString()} ريال</span>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">نسبة الاستخدام</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{ba.utilizationPercentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${ba.utilizationPercentage > 80 ? 'bg-red-500' : ba.utilizationPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min(ba.utilizationPercentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">التوقع النهائي:</span>
                                        <span className={`font-medium ${ba.varianceAtCompletion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {ba.forecastedTotal.toLocaleString()} ريال
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'costs' && (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex gap-4 mb-4">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="all">جميع الأنواع</option>
                                    <option value="Direct Labor">العمالة المباشرة</option>
                                    <option value="Equipment">المعدات</option>
                                    <option value="Materials">المواد</option>
                                    <option value="Subcontractor">المقاولون من الباطن</option>
                                    <option value="Overhead">التكاليف العامة</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="all">جميع الحالات</option>
                                    <option value="Planned">مخطط</option>
                                    <option value="Committed">ملتزم</option>
                                    <option value="Actual">فعلي</option>
                                    <option value="Forecasted">متوقع</option>
                                </select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الرمز</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الوصف</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">النوع</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">مخطط</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">ملتزم</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">فعلي</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الانحراف</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {costItems
                                            .filter(item => (filterType === 'all' || item.costType === filterType) && (filterStatus === 'all' || item.status === filterStatus))
                                            .map(item => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{item.costCode}</td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.description}</p>
                                                            {item.notes && <p className="text-xs text-gray-500 dark:text-gray-400">{item.notes}</p>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.costType}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.plannedCost.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.committedCost.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.actualCost.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={item.variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                            {item.variance.toLocaleString()} ({item.variancePercentage.toFixed(1)}%)
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            item.status === 'Actual' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                            item.status === 'Committed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'evm' && (
                    <div className="space-y-6">
                        {/* EVM Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مؤشر أداء الجدول (SPI)</p>
                                <p className={`text-3xl font-bold ${evmData.schedulePerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                                    {evmData.schedulePerformanceIndex.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {evmData.schedulePerformanceIndex >= 1 ? 'متقدم عن الجدول' : 'متأخر عن الجدول'}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مؤشر أداء التكلفة (CPI)</p>
                                <p className={`text-3xl font-bold ${evmData.costPerformanceIndex >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                                    {evmData.costPerformanceIndex.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {evmData.costPerformanceIndex >= 1 ? 'تحت الميزانية' : 'أعلى من الميزانية'}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">انحراف الجدول (SV)</p>
                                <p className={`text-3xl font-bold ${evmData.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {evmData.scheduleVariance.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {evmData.scheduleVariancePercentage.toFixed(1)}% من PV
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">انحراف التكلفة (CV)</p>
                                <p className={`text-3xl font-bold ${evmData.costVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {evmData.costVariance.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {evmData.costVariancePercentage.toFixed(1)}% من EV
                                </p>
                            </div>
                        </div>

                        {/* EVM Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                تحليل القيمة المكتسبة (EVM)
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={evmChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="PV" stroke="#4F46E5" strokeWidth={2} name="القيمة المخططة (PV)" />
                                    <Line type="monotone" dataKey="EV" stroke="#10B981" strokeWidth={2} name="القيمة المكتسبة (EV)" />
                                    <Line type="monotone" dataKey="AC" stroke="#EF4444" strokeWidth={2} name="التكلفة الفعلية (AC)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Forecast Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">التقدير عند الإنجاز (EAC)</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{evmData.estimateAtCompletion.toLocaleString()} ريال</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">التكلفة المتوقعة النهائية</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">التقدير للإنجاز (ETC)</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{evmData.estimateToComplete.toLocaleString()} ريال</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">التكلفة المتبقية المتوقعة</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الانحراف عند الإنجاز (VAC)</p>
                                <p className={`text-2xl font-bold ${evmData.varianceAtCompletion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {evmData.varianceAtCompletion.toLocaleString()} ريال
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {evmData.varianceAtCompletion >= 0 ? 'توفير متوقع' : 'تجاوز متوقع'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cashflow' && (
                    <div className="space-y-6">
                        {/* Cash Flow Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                التدفق النقدي
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={cashFlowChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="تحصيلات" stroke="#10B981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="مصروفات" stroke="#EF4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="رصيد" stroke="#4F46E5" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Cash Flow Table */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">التاريخ</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الوصف</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الفئة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">التحصيلات</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">المصروفات</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الرصيد</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">طريقة الدفع</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {cashFlows.map(cf => (
                                            <tr key={cf.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{cf.date}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{cf.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{cf.category}</td>
                                                <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                                                    {cf.inflow > 0 && `+${cf.inflow.toLocaleString()}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">
                                                    {cf.outflow > 0 && `-${cf.outflow.toLocaleString()}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold">
                                                    {cf.balance.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{cf.paymentMethod}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs content would go here */}
            </div>
        </div>
    );
};

export default CostControlSystem;
