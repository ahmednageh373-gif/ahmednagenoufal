/**
 * مكون عرض تصنيفات المقايسة
 * BOQ Classification Viewer Component
 * 
 * @component BOQClassificationView
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { 
    PieChart, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle, 
    Info,
    DollarSign,
    Package,
    Percent
} from '../lucide-icons';
import type { ClassifiedFinancialItem, CategoryStatistics } from '../intelligence/ItemClassifier';
import { getClassifier } from '../intelligence/ItemClassifier';

// ============================
// Interfaces
// ============================

interface BOQClassificationViewProps {
    items: ClassifiedFinancialItem[];
    onItemClick?: (item: ClassifiedFinancialItem) => void;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
}

interface CategoryBarProps {
    category: string;
    count: number;
    cost: number;
    costWithWastage: number;
    color: string;
    percentage: number;
}

interface ConfidenceMeterProps {
    confidence: number;
}

// ============================
// Helper Components
// ============================

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    icon, 
    color = 'bg-blue-50 dark:bg-blue-900/20',
    subtitle 
}) => {
    return (
        <div className={`${color} rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="text-gray-400 dark:text-gray-500">
                    {icon}
                </div>
            </div>
        </div>
    );
};

const CategoryBar: React.FC<CategoryBarProps> = ({
    category,
    count,
    cost,
    costWithWastage,
    color,
    percentage
}) => {
    const wastage = costWithWastage - cost;
    const wastagePercentage = ((wastage / cost) * 100).toFixed(1);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">{category}</span>
                    <span className="text-gray-500">({count} بند)</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{cost.toLocaleString()} ريال</span>
                    <span className="text-orange-600 text-xs">
                        +{wastage.toLocaleString()} ({wastagePercentage}%)
                    </span>
                    <span className="font-bold">{percentage.toFixed(1)}%</span>
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                    }}
                />
            </div>
        </div>
    );
};

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ confidence }) => {
    const getConfidenceColor = (conf: number): string => {
        if (conf >= 0.8) return 'bg-green-500';
        if (conf >= 0.5) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getConfidenceText = (conf: number): string => {
        if (conf >= 0.8) return 'عالية';
        if (conf >= 0.5) return 'متوسطة';
        return 'منخفضة';
    };

    return (
        <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className={`h-full rounded-full ${getConfidenceColor(confidence)} transition-all duration-300`}
                    style={{ width: `${confidence * 100}%` }}
                />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[50px]">
                {getConfidenceText(confidence)}
            </span>
        </div>
    );
};

// ============================
// Main Component
// ============================

export const BOQClassificationView: React.FC<BOQClassificationViewProps> = ({ 
    items,
    onItemClick 
}) => {
    const classifier = getClassifier();
    
    // حساب الإحصائيات
    const stats: CategoryStatistics = useMemo(() => {
        return classifier.getStatistics(items);
    }, [items, classifier]);

    // حساب البنود ذات الثقة المنخفضة
    const lowConfidenceItems = useMemo(() => {
        return items.filter(item => item.classification.confidence < 0.5);
    }, [items]);

    // حساب البنود ذات الأولوية العالية
    const highPriorityItems = useMemo(() => {
        return items.filter(item => item.classification.priority === 'high');
    }, [items]);

    // ترتيب الفئات حسب التكلفة
    const sortedCategories = useMemo(() => {
        return Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b.totalCost - a.totalCost);
    }, [stats]);

    return (
        <div className="space-y-6">
            {/* ملخص الإحصائيات */}
            <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <PieChart className="w-6 h-6" />
                    ملخص التصنيف الذكي
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="إجمالي البنود"
                        value={stats.total}
                        icon={<Package className="w-6 h-6" />}
                        color="bg-blue-50 dark:bg-blue-900/20"
                    />
                    
                    <StatCard
                        title="التكلفة الأساسية"
                        value={`${stats.totalCost.toLocaleString()} ريال`}
                        icon={<DollarSign className="w-6 h-6" />}
                        color="bg-green-50 dark:bg-green-900/20"
                    />
                    
                    <StatCard
                        title="إجمالي الهدر"
                        value={`${stats.totalWastage.toLocaleString()} ريال`}
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="bg-orange-50 dark:bg-orange-900/20"
                        subtitle={`${((stats.totalWastage / stats.totalCost) * 100).toFixed(1)}% من التكلفة`}
                    />
                    
                    <StatCard
                        title="التكلفة النهائية"
                        value={`${stats.totalCostWithWastage.toLocaleString()} ريال`}
                        icon={<CheckCircle className="w-6 h-6" />}
                        color="bg-purple-50 dark:bg-purple-900/20"
                        subtitle="شامل الهدر"
                    />
                </div>
            </div>

            {/* تحذيرات وملاحظات */}
            {(lowConfidenceItems.length > 0 || highPriorityItems.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lowConfidenceItems.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                                        بنود تحتاج مراجعة
                                    </h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                                        {lowConfidenceItems.length} بند بثقة تصنيف منخفضة
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {highPriorityItems.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                                        بنود ذات أولوية عالية
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-500">
                                        {highPriorityItems.length} بند يحتاج اهتمام خاص
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* التصنيف حسب الفئة */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    التوزيع حسب الفئة
                </h3>
                <div className="space-y-4">
                    {sortedCategories.map(([category, data]) => (
                        <CategoryBar
                            key={category}
                            category={category}
                            count={data.count}
                            cost={data.totalCost}
                            costWithWastage={data.totalCostWithWastage}
                            color={data.color}
                            percentage={(data.totalCost / stats.totalCost) * 100}
                        />
                    ))}
                </div>
            </div>

            {/* جدول البنود المصنفة */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4">البنود المصنفة بالتفصيل</h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold">الوصف</th>
                                <th className="p-3 text-sm font-semibold">التصنيف</th>
                                <th className="p-3 text-sm font-semibold">الكمية</th>
                                <th className="p-3 text-sm font-semibold">الهدر</th>
                                <th className="p-3 text-sm font-semibold">الإجمالي</th>
                                <th className="p-3 text-sm font-semibold">السعر الإجمالي</th>
                                <th className="p-3 text-sm font-semibold">الثقة</th>
                                <th className="p-3 text-sm font-semibold">الأولوية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const wastage = item.quantity * item.classification.wastageRate;
                                const totalWithWastage = item.quantity + wastage;
                                const costWastage = item.total * item.classification.wastageRate;
                                const totalCost = item.total + costWastage;

                                return (
                                    <tr 
                                        key={item.id}
                                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900/50' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}
                                        onClick={() => onItemClick?.(item)}
                                    >
                                        <td className="p-3">
                                            <div>
                                                <div className="font-medium">{item.item}</div>
                                                {item.classification.matchedKeywords.length > 0 && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        🔍 {item.classification.matchedKeywords.slice(0, 2).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span 
                                                className="inline-block px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                                                style={{ 
                                                    backgroundColor: item.classification.color + '40',
                                                    color: item.classification.color
                                                }}
                                            >
                                                {item.classification.categoryAr}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="font-medium">{item.quantity.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">{item.unit}</div>
                                        </td>
                                        <td className="p-3 text-center text-orange-600 dark:text-orange-400">
                                            <div className="font-medium">+{wastage.toFixed(2)}</div>
                                            <div className="text-xs">
                                                ({(item.classification.wastageRate * 100).toFixed(0)}%)
                                            </div>
                                        </td>
                                        <td className="p-3 text-center font-bold text-green-600 dark:text-green-400">
                                            <div>{totalWithWastage.toFixed(2)}</div>
                                            <div className="text-xs text-gray-500">{item.unit}</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="font-bold">{totalCost.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">
                                                أساسي: {item.total.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <ConfidenceMeter confidence={item.classification.confidence} />
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                item.classification.priority === 'high' 
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : item.classification.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                {item.classification.priority === 'high' ? 'عالية' 
                                                    : item.classification.priority === 'medium' ? 'متوسطة' 
                                                    : 'منخفضة'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-100 dark:bg-slate-800/50 border-t-2 border-slate-300 dark:border-slate-700 font-bold">
                            <tr>
                                <td colSpan={5} className="p-3 text-right">الإجمالي:</td>
                                <td className="p-3 text-center text-lg">
                                    {stats.totalCostWithWastage.toLocaleString()} ريال
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* البنود التي تحتاج مراجعة */}
            {lowConfidenceItems.length > 0 && (
                <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 shadow-sm border border-yellow-200 dark:border-yellow-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                        <AlertTriangle className="w-5 h-5" />
                        بنود تحتاج مراجعة ({lowConfidenceItems.length})
                    </h3>
                    <div className="space-y-3">
                        {lowConfidenceItems.map(item => (
                            <div 
                                key={item.id}
                                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.item}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            الكمية: {item.quantity} {item.unit}
                                        </p>
                                    </div>
                                    <ConfidenceMeter confidence={item.classification.confidence} />
                                </div>
                                {item.classification.suggestions.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {item.classification.suggestions.map((suggestion, idx) => (
                                            <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                                • {suggestion}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOQClassificationView;
