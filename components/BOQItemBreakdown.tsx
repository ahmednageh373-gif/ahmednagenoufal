import React, { useState, useCallback, useMemo } from 'react';
import type { FinancialItem } from '../types';
import { X, Loader2, PieChart, TrendingUp, DollarSign, Users, Wrench, Truck, AlertCircle, CheckCircle, FileText, Download } from 'lucide-react';
import { getCostBreakdown } from '../services/geminiService';

interface CostBreakdownItem {
    category: 'مواد' | 'عمالة' | 'معدات' | 'مقاولي الباطن' | 'نقل' | 'إدارة' | 'أخرى';
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    percentage: number;
}

interface DetailedBreakdown {
    items: CostBreakdownItem[];
    overheads: number;
    profit: number;
    contingency: number;
    totalDirectCost: number;
    totalIndirectCost: number;
    grandTotal: number;
}

interface BOQItemBreakdownProps {
    item: FinancialItem;
    isOpen: boolean;
    onClose: () => void;
}

export const BOQItemBreakdown: React.FC<BOQItemBreakdownProps> = ({ item, isOpen, onClose }) => {
    const [breakdown, setBreakdown] = useState<DetailedBreakdown | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // تحليل البند باستخدام AI
    const analyzeItem = useCallback(async () => {
        setIsAnalyzing(true);
        setError(null);
        setBreakdown(null);

        try {
            const result = await getCostBreakdown(item);
            
            // تحويل البيانات إلى التنسيق المطلوب
            const totalDirectCost = result.items.reduce((sum, i) => sum + i.estimatedTotal, 0);
            const overheadsAmount = totalDirectCost * (result.overheadsPercentage / 100);
            const profitAmount = (totalDirectCost + overheadsAmount) * (result.profitPercentage / 100);
            const contingencyAmount = (totalDirectCost + overheadsAmount) * 0.05; // 5% طوارئ
            const grandTotal = totalDirectCost + overheadsAmount + profitAmount + contingencyAmount;

            const detailedBreakdown: DetailedBreakdown = {
                items: result.items.map(i => {
                    // تحديد التصنيف بناءً على الوصف
                    let category: CostBreakdownItem['category'] = 'أخرى';
                    const desc = i.description.toLowerCase();
                    
                    if (desc.includes('مواد') || desc.includes('خرسانة') || desc.includes('حديد') || desc.includes('أسمنت')) {
                        category = 'مواد';
                    } else if (desc.includes('عمالة') || desc.includes('عامل') || desc.includes('فني')) {
                        category = 'عمالة';
                    } else if (desc.includes('معدات') || desc.includes('رافعة') || desc.includes('حفار')) {
                        category = 'معدات';
                    } else if (desc.includes('نقل') || desc.includes('شحن') || desc.includes('توصيل')) {
                        category = 'نقل';
                    } else if (desc.includes('مقاول') || desc.includes('باطن')) {
                        category = 'مقاولي الباطن';
                    }

                    return {
                        category,
                        description: i.description,
                        quantity: i.quantity,
                        unit: i.unit,
                        unitPrice: i.estimatedUnitPrice,
                        total: i.estimatedTotal,
                        percentage: (i.estimatedTotal / grandTotal) * 100
                    };
                }),
                overheads: overheadsAmount,
                profit: profitAmount,
                contingency: contingencyAmount,
                totalDirectCost,
                totalIndirectCost: overheadsAmount + profitAmount + contingencyAmount,
                grandTotal
            };

            setBreakdown(detailedBreakdown);
        } catch (err) {
            console.error('Error analyzing item:', err);
            setError('فشل تحليل البند. حاول مرة أخرى.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [item]);

    // تحليل تلقائي عند فتح النافذة
    React.useEffect(() => {
        if (isOpen && !breakdown && !isAnalyzing) {
            analyzeItem();
        }
    }, [isOpen, breakdown, isAnalyzing, analyzeItem]);

    // حساب التوزيع حسب التصنيف
    const categoryBreakdown = useMemo(() => {
        if (!breakdown) return [];

        const categories = new Map<string, number>();
        breakdown.items.forEach(item => {
            const current = categories.get(item.category) || 0;
            categories.set(item.category, current + item.total);
        });

        return Array.from(categories.entries()).map(([category, total]) => ({
            category,
            total,
            percentage: (total / breakdown.totalDirectCost) * 100
        }));
    }, [breakdown]);

    // الحصول على الأيقونة المناسبة للتصنيف
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'مواد':
                return <FileText className="w-5 h-5" />;
            case 'عمالة':
                return <Users className="w-5 h-5" />;
            case 'معدات':
                return <Wrench className="w-5 h-5" />;
            case 'نقل':
                return <Truck className="w-5 h-5" />;
            case 'مقاولي الباطن':
                return <Users className="w-5 h-5" />;
            default:
                return <DollarSign className="w-5 h-5" />;
        }
    };

    // الحصول على اللون المناسب للتصنيف
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'مواد':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'عمالة':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'معدات':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'نقل':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'مقاولي الباطن':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    // تصدير التفصيل إلى ملف نصي
    const handleExport = () => {
        if (!breakdown) return;

        let content = `تفصيل بند المقايسة\n`;
        content += `=================\n\n`;
        content += `البند: ${item.item}\n`;
        content += `الكمية: ${item.quantity} ${item.unit}\n`;
        content += `سعر الوحدة: ${item.unitPrice.toLocaleString()} ريال\n`;
        content += `الإجمالي: ${item.total.toLocaleString()} ريال\n\n`;
        
        content += `التفصيل المالي:\n`;
        content += `===============\n\n`;
        
        breakdown.items.forEach((bi, index) => {
            content += `${index + 1}. ${bi.category} - ${bi.description}\n`;
            content += `   الكمية: ${bi.quantity} ${bi.unit}\n`;
            content += `   سعر الوحدة: ${bi.unitPrice.toLocaleString()} ريال\n`;
            content += `   الإجمالي: ${bi.total.toLocaleString()} ريال (${bi.percentage.toFixed(1)}%)\n\n`;
        });

        content += `\nالملخص المالي:\n`;
        content += `=============\n`;
        content += `التكاليف المباشرة: ${breakdown.totalDirectCost.toLocaleString()} ريال\n`;
        content += `المصاريف الإدارية: ${breakdown.overheads.toLocaleString()} ريال\n`;
        content += `الربح: ${breakdown.profit.toLocaleString()} ريال\n`;
        content += `الطوارئ: ${breakdown.contingency.toLocaleString()} ريال\n`;
        content += `التكاليف غير المباشرة: ${breakdown.totalIndirectCost.toLocaleString()} ريال\n`;
        content += `الإجمالي الكلي: ${breakdown.grandTotal.toLocaleString()} ريال\n`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `breakdown_${item.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PieChart className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold">تفصيل البند المالي</h2>
                            <p className="text-indigo-100 text-sm mt-1">تحليل شامل للتكاليف والمكونات</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* معلومات البند */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            معلومات البند
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">الوصف</p>
                                <p className="font-semibold text-lg">{item.item}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">الكمية</p>
                                <p className="font-semibold text-lg">{item.quantity} {item.unit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">سعر الوحدة</p>
                                <p className="font-semibold text-lg text-green-600">{item.unitPrice.toLocaleString()} ريال</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">الإجمالي</p>
                                <p className="font-semibold text-xl text-indigo-600">{item.total.toLocaleString()} ريال</p>
                            </div>
                        </div>
                    </div>

                    {/* حالة التحليل */}
                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                            <p className="text-lg font-medium">جاري تحليل البند بالذكاء الاصطناعي...</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                يتم الآن تفصيل التكاليف وحساب المكونات
                            </p>
                        </div>
                    )}

                    {/* خطأ */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 dark:text-red-300">حدث خطأ</p>
                                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                                <button
                                    onClick={analyzeItem}
                                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    إعادة المحاولة
                                </button>
                            </div>
                        </div>
                    )}

                    {/* نتائج التحليل */}
                    {breakdown && !isAnalyzing && (
                        <div className="space-y-6">
                            {/* التوزيع حسب التصنيف */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-indigo-600" />
                                        التوزيع حسب التصنيف
                                    </h3>
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        تصدير التفصيل
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {categoryBreakdown.map(({ category, total, percentage }) => (
                                        <div
                                            key={category}
                                            className={`rounded-lg p-4 ${getCategoryColor(category)}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                {getCategoryIcon(category)}
                                                <span className="font-semibold">{category}</span>
                                            </div>
                                            <p className="text-2xl font-bold">{total.toLocaleString()} ريال</p>
                                            <p className="text-sm mt-1">{percentage.toFixed(1)}% من التكلفة المباشرة</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* جدول التفصيل */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    تفصيل المكونات
                                </h3>

                                <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">#</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التصنيف</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الوصف</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الكمية</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">سعر الوحدة</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الإجمالي</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">النسبة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {breakdown.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                                                            {getCategoryIcon(item.category)}
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{item.description}</td>
                                                    <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                                                    <td className="px-4 py-3 text-sm font-medium">{item.unitPrice.toLocaleString()} ريال</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-green-600">{item.total.toLocaleString()} ريال</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                <div
                                                                    className="bg-indigo-600 h-2 rounded-full"
                                                                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">{item.percentage.toFixed(1)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* الملخص المالي */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    الملخص المالي
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">التكاليف المباشرة</span>
                                            <span className="font-bold text-lg">{breakdown.totalDirectCost.toLocaleString()} ريال</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">المصاريف الإدارية</span>
                                            <span className="font-medium">{breakdown.overheads.toLocaleString()} ريال</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">الربح</span>
                                            <span className="font-medium">{breakdown.profit.toLocaleString()} ريال</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">الطوارئ (5%)</span>
                                            <span className="font-medium">{breakdown.contingency.toLocaleString()} ريال</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">التكاليف غير المباشرة</span>
                                            <span className="font-bold text-lg text-orange-600">{breakdown.totalIndirectCost.toLocaleString()} ريال</span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">الإجمالي الكلي</span>
                                                <span className="text-3xl font-bold text-green-600">{breakdown.grandTotal.toLocaleString()} ريال</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            تم التحليل بواسطة الذكاء الاصطناعي • AN.AI
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BOQItemBreakdown;
