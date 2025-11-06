


import React, { useState } from 'react';
import { processComplexQuery } from '../services/geminiService';
import { marked } from 'marked';
import { BrainCircuit, Send } from '../lucide-icons';

export const ComplexQueryTab: React.FC = () => {
    const [prompt, setPrompt] = useState('Provide a comprehensive risk assessment matrix for a high-rise building project in a seismic zone. Include financial, technical, and environmental risks, their probability, impact, and detailed mitigation strategies. The output should be a detailed markdown table.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');

    const handleQuery = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const response = await processComplexQuery(prompt);
            setResult(response);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const parsedResult = result ? marked.parse(result) : '';

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                        <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">استعلام معقد (وضع التفكير)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            اطرح أسئلة معقدة تتطلب تفكيرًا عميقًا وتخطيطًا متعدد الخطوات. يستخدم هذا الوضع نموذجًا متقدمًا بقدرات تفكير محسنة لتقديم إجابات شاملة.
                        </p>
                    </div>
                </div>
                <div className="mt-6">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="أدخل استفسارك المعقد هنا..."
                        rows={8}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleQuery}
                        disabled={isLoading || !prompt.trim()}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Send size={16} />
                        )}
                        <span>{isLoading ? '...يفكر الذكاء الاصطناعي بعمق' : 'إرسال الاستعلام'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                    <p className="font-bold">خطأ في الاستعلام</p>
                    <p>{error}</p>
                </div>
            )}

            {(isLoading || result) && (
                 <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">النتيجة</h3>
                    {isLoading && !result && (
                        <div className="text-center p-8 text-slate-500">
                            <p>يتم الآن معالجة طلبك المعقد. قد يستغرق هذا وقتًا أطول من المعتاد...</p>
                        </div>
                    )}
                    {result && (
                        <div
                            className="prose prose-slate dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: parsedResult }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};