import React, { useState } from 'react';
import type { Project, FinancialItem } from '../types';
import { getSaudiCodeAnalysis } from '../services/geminiService';
import { marked } from 'marked';
import { Bot, Scale } from '../lucide-icons';

interface SaudiCodeConsultantTabProps {
    project: Project;
}

export const SaudiCodeConsultantTab: React.FC<SaudiCodeConsultantTabProps> = ({ project }) => {
    const financials = project.data.financials || [];
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [userQuery, setUserQuery] = useState(
        'مراجعة أسعار الوحدات لهذه البنود مقارنة بأسعار السوق الحالية في الرياض. هل هي معقولة؟ مع الإشارة إلى أي تعارضات محتملة مع كود البناء السعودي.'
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');

    const handleCheckboxChange = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleRunAnalysis = async () => {
        if (selectedItemIds.length === 0 || !userQuery.trim()) {
            setError('الرجاء تحديد بند واحد على الأقل وإدخال استفسار.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult('');
        try {
            const result = await getSaudiCodeAnalysis(project, selectedItemIds, userQuery);
            setAnalysisResult(result);
        } catch (err) {
            setError((err as Error).message || 'حدث خطأ غير متوقع أثناء التحليل.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const parsedAnalysis = analysisResult ? marked.parse(analysisResult) : '';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">1. حدد البنود</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">اختر البنود من المقايسة لتحليلها.</p>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {financials.length > 0 ? financials.map(item => (
                        <label key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100">
                            <input
                                type="checkbox"
                                checked={selectedItemIds.includes(item.id)}
                                onChange={() => handleCheckboxChange(item.id)}
                                className="mt-1"
                            />
                            <span className="text-sm">{item.item}</span>
                        </label>
                    )) : (
                        <p className="text-sm text-slate-500">لا توجد بنود في المقايسة.</p>
                    )}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">2. اطرح سؤالك</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        اكتب سؤالك بوضوح حول البنود المحددة. يمكنك الاستفسار عن الأسعار، المواصفات، أو التوافق مع الكود السعودي.
                    </p>
                    <textarea
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        rows={5}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                     <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleRunAnalysis}
                            disabled={isLoading || selectedItemIds.length === 0 || !userQuery.trim()}
                            className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Bot size={18} />}
                            <span>{isLoading ? '...جاري التحليل' : 'تحليل'}</span>
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p>{error}</p></div>}
                
                {(isLoading || analysisResult) && (
                    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                             <Scale size={24} className="text-indigo-500" />
                             <h3 className="text-xl font-semibold text-slate-900 dark:text-white">إجابة المستشار الهندسي</h3>
                        </div>
                        {isLoading && !analysisResult ? (
                            <div className="text-center p-8 text-slate-500"><p>يقوم المستشار بتحليل طلبك...</p></div>
                        ) : (
                             <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parsedAnalysis }} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
