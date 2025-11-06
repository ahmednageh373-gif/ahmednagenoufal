import React, { useState, useMemo } from 'react';
import type { Project, DynamicPriceAnalysisItem } from '../types';
import { performDynamicPriceAnalysis } from '../services/geminiService';
import { Bot, TrendingDown, TrendingUp } from '../lucide-icons';

interface DynamicPricingTabProps {
    project: Project;
}

export const DynamicPricingTab: React.FC<DynamicPricingTabProps> = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState<DynamicPriceAnalysisItem[] | null>(null);

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAnalysisResult(null);
        try {
            const result = await performDynamicPriceAnalysis(project.data.financials);
            setAnalysisResult(result);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const { potentialSavings } = useMemo(() => {
        if (!analysisResult) return { potentialSavings: 0 };

        const totalOriginalCost = project.data.financials.reduce((sum, item) => sum + item.total, 0);

        const totalDynamicCost = project.data.financials.reduce((sum, item) => {
            const analyzedItem = analysisResult.find(a => a.itemId === item.id);
            if (analyzedItem) {
                return sum + (item.quantity * analyzedItem.dynamicUnitPrice);
            }
            return sum + item.total; // Use original if not in analysis
        }, 0);

        return { 
            potentialSavings: totalOriginalCost - totalDynamicCost,
        };
    }, [analysisResult, project.data.financials]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                <h3 className="text-xl font-bold mb-2">محرك التسعير الديناميكي المتقدم</h3>
                <p className="text-sm text-slate-500 mb-4">
                    يقوم الذكاء الاصطناعي بتحليل المقايسة لاقتراح أسعار تنافسية بناءً على أسعار السوق الحالية، خصومات الكميات، وتقلبات الأسعار.
                </p>
                <button
                    onClick={handleRunAnalysis}
                    disabled={isLoading || project.data.financials.length === 0}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400"
                >
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Bot size={18} />}
                    <span>{isLoading ? '...جاري التحليل' : 'تشغيل محرك التسعير'}</span>
                </button>
                 {project.data.financials.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">لا يمكن إجراء التحليل. يرجى رفع مقايسة المشروع أولاً.</p>
                )}
            </div>
            
            {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}
            
            {analysisResult && (
                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                    <h3 className="text-xl font-bold mb-4">نتائج التحليل</h3>
                    
                    <div className={`p-4 rounded-lg mb-4 flex items-center gap-4 ${potentialSavings >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        {potentialSavings >= 0 ? <TrendingDown className="w-8 h-8 text-green-500" /> : <TrendingUp className="w-8 h-8 text-red-500" />}
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">إجمالي الوفورات المحتملة</p>
                            <p className={`text-2xl font-bold ${potentialSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {potentialSavings.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                <tr>
                                    <th className="p-3">البند</th>
                                    <th className="p-3">السعر الأصلي</th>
                                    <th className="p-3">السعر المقترح</th>
                                    <th className="p-3">التبرير</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysisResult.map(item => {
                                    const diff = item.dynamicUnitPrice - item.originalUnitPrice;
                                    const diffColor = diff < 0 ? 'text-green-500' : diff > 0 ? 'text-red-500' : 'text-slate-500';
                                    return (
                                        <tr key={item.itemId} className="border-b dark:border-gray-700 last:border-0">
                                            <td className="p-3 font-medium">{item.itemName}</td>
                                            <td className="p-3 font-mono">{item.originalUnitPrice.toLocaleString('ar-SA')}</td>
                                            <td className={`p-3 font-mono font-bold ${diffColor}`}>
                                                {item.dynamicUnitPrice.toLocaleString('ar-SA')}
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-400">{item.justification}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};