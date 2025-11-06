import React, { useState } from 'react';
import { analyzeSentiment } from '../services/geminiService';
import type { SentimentAnalysisResult } from '../types';
import { Bot, Smile, Frown, Meh } from '../lucide-icons';

const SentimentResultDisplay: React.FC<{ result: SentimentAnalysisResult }> = ({ result }) => {
    const sentimentConfig = {
        Positive: { icon: Smile, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/50', label: 'إيجابي' },
        Negative: { icon: Frown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/50', label: 'سلبي' },
        Neutral: { icon: Meh, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700/50', label: 'محايد' },
    };

    const config = sentimentConfig[result.sentiment];
    const Icon = config.icon;

    return (
        <div className={`p-6 rounded-lg ${config.bg}`}>
            <div className="flex items-center gap-4">
                <Icon size={48} className={config.color} />
                <div>
                    <h4 className={`text-2xl font-bold ${config.color}`}>{config.label}</h4>
                    <p className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        درجة الثقة: {Math.round(result.confidence * 100)}%
                    </p>
                </div>
            </div>
            <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-4">
                <h5 className="font-semibold text-slate-800 dark:text-slate-200">التبرير:</h5>
                <p className="text-sm text-slate-700 dark:text-slate-300">{result.justification}</p>
            </div>
        </div>
    );
};

export const SentimentAnalysisTab: React.FC = () => {
    const [textToAnalyze, setTextToAnalyze] = useState(
        'تم تسليم المواد في الوقت المحدد ولكن الجودة كانت أقل من المتوقع. العميل يبدو غير راضٍ عن تقدم العمل في الواجهات.'
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!textToAnalyze.trim()) return;
        setIsLoading(true);
        setError('');
        setAnalysisResult(null);
        try {
            const result = await analyzeSentiment(textToAnalyze);
            setAnalysisResult(result);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred during sentiment analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">تحليل المشاعر في النصوص</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    ألصق أي نص (مثل بريد إلكتروني، تقرير، أو ملاحظات) لفهم المشاعر الكامنة فيه.
                </p>
                <textarea
                    value={textToAnalyze}
                    onChange={(e) => setTextToAnalyze(e.target.value)}
                    rows={8}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="أدخل النص هنا لتحليله..."
                />
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !textToAnalyze.trim()}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Bot size={18} />
                        )}
                        <span>{isLoading ? '...جاري التحليل' : 'تحليل النص'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                    <p className="font-bold">خطأ في التحليل</p>
                    <p>{error}</p>
                </div>
            )}

            {isLoading && !analysisResult && (
                <div className="text-center p-8 text-slate-500">
                    <p>يقوم الذكاء الاصطناعي بتحليل المشاعر في النص...</p>
                </div>
            )}

            {analysisResult && (
                <SentimentResultDisplay result={analysisResult} />
            )}
        </div>
    );
};