import React, { useState, useRef } from 'react';
// Fix: Removed .ts extension from import path.
import type { Project } from '../types';
import { Bot, UploadCloud } from '../lucide-icons';
import { runComparativeAnalysis } from '../services/geminiService';
import { marked } from 'marked';

interface ComparativeAnalysisTabProps {
    project: Project;
    onUpdateComparativeAnalysis: (projectId: string, newReport: string) => void;
}


export const ComparativeAnalysisTab: React.FC<ComparativeAnalysisTabProps> = ({ project, onUpdateComparativeAnalysis }) => {
    const [boqFile, setBoqFile] = useState<File | null>(null);
    const [comparisonFile, setComparisonFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const boqFileInputRef = useRef<HTMLInputElement>(null);
    const comparisonFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'boq' | 'comparison') => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (fileType === 'boq') setBoqFile(file);
        else setComparisonFile(file);
    };

    const handleRunAnalysis = async () => {
        if (!boqFile || !comparisonFile) {
            setError('يرجى رفع ملف المقايسة وملف المقارنة.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const report = await runComparativeAnalysis(boqFile, comparisonFile);
            onUpdateComparativeAnalysis(project.id, report);
        } catch (err) {
            setError((err as Error).message || 'حدث خطأ غير متوقع أثناء التحليل.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const savedReport = project.data.comparativeAnalysisReport || '';
    const parsedReport = savedReport ? marked.parse(savedReport) : '';

    return (
        <div>
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm mb-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">تحليل المقارنة المالية</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    بناءً على المنطق المقدم، قم برفع ملف مقايسة أساسي وملف مقارنة مالية. سيقوم الذكاء الاصطناعي بتحليلهما معًا لإنشاء تقرير مفصل.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* BOQ File Uploader */}
                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                        onClick={() => boqFileInputRef.current?.click()}
                    >
                        <input type="file" accept=".xlsx, .xls, .csv" ref={boqFileInputRef} onChange={(e) => handleFileChange(e, 'boq')} className="hidden" />
                        <UploadCloud size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            {boqFile ? boqFile.name : '1. ارفع ملف المقايسة الأساسي'}
                        </p>
                    </div>

                    {/* Comparison File Uploader */}
                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                        onClick={() => comparisonFileInputRef.current?.click()}
                    >
                        <input type="file" accept=".xlsx, .xls, .csv" ref={comparisonFileInputRef} onChange={(e) => handleFileChange(e, 'comparison')} className="hidden" />
                        <UploadCloud size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            {comparisonFile ? comparisonFile.name : '2. ارفع ملف المقارنة المالية'}
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={handleRunAnalysis}
                        disabled={isLoading || !boqFile || !comparisonFile}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mx-auto"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Bot size={20} />
                        )}
                        <span>{isLoading ? '...جاري التحليل' : 'بدء التحليل المقارن'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded" role="alert">
                    <p className="font-bold">خطأ في التحليل</p>
                    <p>{error}</p>
                </div>
            )}
            
            {(isLoading || savedReport) && (
                 <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">التقرير التحليلي</h3>
                     {isLoading && !savedReport && (
                        <div className="text-center p-8">
                            <p>يقوم الذكاء الاصطناعي بتحليل الملفات، يرجى الانتظار...</p>
                        </div>
                     )}
                     {savedReport && (
                        <div
                            className="prose prose-slate dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: parsedReport }}
                        />
                     )}
                </div>
            )}
        </div>
    );
};
