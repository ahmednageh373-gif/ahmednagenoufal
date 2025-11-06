import React, { useState } from 'react';
import { marked } from 'marked';
import { Bot, AlertTriangle, DollarSign } from 'lucide-react';
// Fix: Removed .ts extension from import path.
import type { Project } from '../types';
import { analyzeBOQForValueEngineering } from '../services/geminiService';


export const ValueEngineeringTab: React.FC<{ project: Project }> = ({ project }) => {
    const financials = project.data.financials || [];
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAnalysisResult('');

        try {
            const result = await analyzeBOQForValueEngineering(financials);
            setAnalysisResult(result);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    const parsedAnalysis = analysisResult ? marked.parse(analysisResult) : '';

    return (
        <div>
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm mb-8">
                <div className="flex flex-col items-center text-center">
                    <DollarSign size={48} className="mx-auto mb-4 text-green-500" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">تحليل هندسة القيمة</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
                        استخدم الذكاء الاصطناعي لتحليل مقايسة المشروع وتحديد فرص توفير التكاليف، والكشف عن المخاطر المحتملة في الميزانية، والحصول على توصيات لتحسين القيمة.
                    </p>
                    
                     <button
                        onClick={handleRunAnalysis}
                        disabled={isLoading || financials.length === 0}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mx-auto"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Bot size={20} />
                        )}
                        <span>{isLoading ? '...جاري التحليل' : 'بدء تحليل هندسة القيمة'}</span>
                    </button>
                    {financials.length === 0 && (
                        <p className="text-xs text-red-500 mt-2">لا يمكن إجراء التحليل. يرجى رفع مقايسة المشروع أولاً.</p>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded" role="alert">
                    <p className="font-bold">خطأ في التحليل</p>
                    <p>{error}</p>
                </div>
            )}

            {(isLoading || analysisResult) && (
                 <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">تقرير هندسة القيمة</h3>
                     {isLoading && !analysisResult && (
                        <div className="text-center p-8">
                            <p>يقوم الذكاء الاصطناعي بتحليل بياناتك، يرجى الانتظار...</p>
                        </div>
                     )}
                     {analysisResult && (
                        <div
                            className="prose prose-slate dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: parsedAnalysis }}
                        />
                     )}
                </div>
            )}

             {!analysisResult && !isLoading && (
                 <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">لم يتم إجراء تحليل بعد</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        انقر على زر التحليل أعلاه لبدء العملية.
                    </p>
                </div>
             )}
        </div>
    );
};
