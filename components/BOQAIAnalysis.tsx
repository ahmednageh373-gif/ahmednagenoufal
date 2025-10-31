import React, { useState, useCallback } from 'react';
import type { FinancialItem, ScheduleTask, ScheduleTaskStatus, ScheduleTaskPriority } from '../types';
import { Sparkles, Loader2, CheckCircle, AlertCircle, TrendingUp, Calculator, Calendar, Zap } from 'lucide-react';
import { generateScheduleFromFinancials } from '../services/geminiService';

interface BOQAIAnalysisProps {
    financials: FinancialItem[];
    onGeneratedSchedule?: (tasks: ScheduleTask[]) => void;
}

interface AIInsight {
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
}

export const BOQAIAnalysis: React.FC<BOQAIAnalysisProps> = ({ financials, onGeneratedSchedule }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [generatedTasks, setGeneratedTasks] = useState<ScheduleTask[]>([]);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    // تحليل المقايسة باستخدام AI
    const handleAnalyzeBOQ = useCallback(async () => {
        if (financials.length === 0) {
            alert('لا توجد بنود مقايسة للتحليل');
            return;
        }

        setIsAnalyzing(true);
        setInsights([]);
        setAnalysisComplete(false);

        try {
            // محاكاة تحليل AI (يمكن استبدالها بـ Gemini API)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const newInsights: AIInsight[] = [];

            // تحليل إجمالي التكلفة
            const totalCost = financials.reduce((sum, item) => sum + item.total, 0);
            if (totalCost > 1000000) {
                newInsights.push({
                    type: 'warning',
                    title: 'تكلفة مرتفعة',
                    description: `إجمالي التكلفة ${totalCost.toLocaleString()} ريال. يُنصح بمراجعة البنود الأعلى تكلفة وإمكانية التفاوض مع الموردين.`
                });
            } else {
                newInsights.push({
                    type: 'success',
                    title: 'تكلفة معقولة',
                    description: `إجمالي التكلفة ${totalCost.toLocaleString()} ريال ضمن النطاق المتوقع.`
                });
            }

            // تحليل عدد البنود
            if (financials.length < 10) {
                newInsights.push({
                    type: 'info',
                    title: 'مقايسة بسيطة',
                    description: `المشروع يحتوي على ${financials.length} بند فقط. قد يكون مشروعاً صغيراً أو تحتاج المقايسة لمزيد من التفصيل.`
                });
            } else if (financials.length > 50) {
                newInsights.push({
                    type: 'info',
                    title: 'مقايسة مفصلة',
                    description: `المشروع يحتوي على ${financials.length} بند. هذا يدل على مستوى تفصيل جيد في المقايسة.`
                });
            }

            // تحليل البنود ذات التكلفة العالية
            const expensiveItems = financials
                .filter(item => item.total > totalCost * 0.1)
                .sort((a, b) => b.total - a.total);

            if (expensiveItems.length > 0) {
                newInsights.push({
                    type: 'warning',
                    title: 'بنود عالية التكلفة',
                    description: `يوجد ${expensiveItems.length} بند/بنود تمثل أكثر من 10% من التكلفة الإجمالية. البند الأعلى: "${expensiveItems[0].item}" بتكلفة ${expensiveItems[0].total.toLocaleString()} ريال.`
                });
            }

            // تحليل الكميات غير المعتادة
            const zeroQuantityItems = financials.filter(item => item.quantity === 0);
            if (zeroQuantityItems.length > 0) {
                newInsights.push({
                    type: 'warning',
                    title: 'بنود بكمية صفر',
                    description: `يوجد ${zeroQuantityItems.length} بند/بنود بكمية صفر. يُرجى مراجعة هذه البنود.`
                });
            }

            // توصيات عامة
            newInsights.push({
                type: 'info',
                title: 'توصيات',
                description: 'يُنصح بمراجعة جميع البنود مع فريق المشروع، والتأكد من دقة الكميات وأسعار الوحدات، وإجراء مقارنة مع مشاريع مماثلة.'
            });

            setInsights(newInsights);
            setAnalysisComplete(true);
        } catch (error) {
            console.error('خطأ في تحليل المقايسة:', error);
            alert('فشل تحليل المقايسة. حاول مرة أخرى.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [financials]);

    // توليد جدول زمني من المقايسة
    const handleGenerateSchedule = useCallback(async () => {
        if (financials.length === 0) {
            alert('لا توجد بنود مقايسة لتوليد جدول زمني');
            return;
        }

        setIsGeneratingSchedule(true);
        setGeneratedTasks([]);

        try {
            // استخدام Gemini لتوليد الجدول الزمني
            const tasks = await generateScheduleFromFinancials(financials);
            setGeneratedTasks(tasks);
            
            alert(`تم توليد ${tasks.length} مهمة بنجاح!`);
        } catch (error) {
            console.error('خطأ في توليد الجدول الزمني:', error);
            
            // محاكاة توليد جدول زمني بسيط
            const mockTasks: ScheduleTask[] = financials.slice(0, 10).map((item, index) => {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() + index * 7);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 7);

                return {
                    id: Date.now() + index,
                    name: item.item,
                    start: startDate.toISOString().split('T')[0],
                    end: endDate.toISOString().split('T')[0],
                    progress: 0,
                    dependencies: index > 0 ? [Date.now() + index - 1] : [],
                    status: 'To Do' as ScheduleTaskStatus,
                    priority: 'Medium' as ScheduleTaskPriority,
                    category: 'Construction',
                    wbsCode: `${index + 1}.0`,
                };
            });

            setGeneratedTasks(mockTasks);
            alert(`تم توليد ${mockTasks.length} مهمة بنجاح (نسخة تجريبية)!`);
        } finally {
            setIsGeneratingSchedule(false);
        }
    }, [financials]);

    const handleAcceptSchedule = useCallback(() => {
        if (generatedTasks.length > 0 && onGeneratedSchedule) {
            onGeneratedSchedule(generatedTasks);
            alert('تم إضافة المهام إلى الجدول الزمني بنجاح!');
            setGeneratedTasks([]);
        }
    }, [generatedTasks, onGeneratedSchedule]);

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'info':
            default:
                return <TrendingUp className="w-5 h-5 text-blue-600" />;
        }
    };

    const getInsightBgColor = (type: string) => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'info':
            default:
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* عنوان القسم */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                        تحليل المقايسة بالذكاء الاصطناعي
                    </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    استخدم الذكاء الاصطناعي لتحليل المقايسة والحصول على رؤى وتوصيات ذكية
                </p>

                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Calculator className="w-5 h-5 text-indigo-600" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">عدد البنود</p>
                        </div>
                        <p className="text-2xl font-bold text-indigo-600">{financials.length}</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي التكلفة</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {financials.reduce((sum, item) => sum + item.total, 0).toLocaleString()} ريال
                        </p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">متوسط التكلفة</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                            {financials.length > 0 
                                ? Math.round(financials.reduce((sum, item) => sum + item.total, 0) / financials.length).toLocaleString()
                                : 0} ريال
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">المهام المقترحة</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{generatedTasks.length}</p>
                    </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleAnalyzeBOQ}
                        disabled={isAnalyzing || financials.length === 0}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري التحليل...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                تحليل المقايسة
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleGenerateSchedule}
                        disabled={isGeneratingSchedule || financials.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGeneratingSchedule ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري التوليد...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                توليد جدول زمني
                            </>
                        )}
                    </button>

                    {generatedTasks.length > 0 && (
                        <button
                            onClick={handleAcceptSchedule}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            قبول وإضافة {generatedTasks.length} مهمة
                        </button>
                    )}
                </div>
            </div>

            {/* نتائج التحليل */}
            {analysisComplete && insights.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        نتائج التحليل
                    </h4>

                    <div className="space-y-3">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg p-4 ${getInsightBgColor(insight.type)}`}
                            >
                                <div className="flex items-start gap-3">
                                    {getInsightIcon(insight.type)}
                                    <div className="flex-1">
                                        <h5 className="font-semibold mb-1">{insight.title}</h5>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* المهام المقترحة */}
            {generatedTasks.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        الجدول الزمني المقترح ({generatedTasks.length} مهمة)
                    </h4>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        اسم المهمة
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        تاريخ البدء
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        تاريخ الانتهاء
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                        كود WBS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {generatedTasks.map((task, index) => (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{task.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {task.start}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {task.end}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded">
                                                {task.wbsCode}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOQAIAnalysis;
