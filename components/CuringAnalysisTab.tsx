import React, { useState } from 'react';
import { performCuringAnalysis } from '../services/geminiService';
import type { CuringAnalysisInput, CuringAnalysisResult } from '../types';
import { Bot, Thermometer, HardHat, Hourglass, Check, AlertTriangle, Loader2 } from '../lucide-icons';
import { marked } from 'marked';

export const CuringAnalysisTab: React.FC = () => {
    const [input, setInput] = useState<CuringAnalysisInput>({
        concreteGrade: 'C35',
        ambientTemp: 25,
        requiredStrength: 75,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<CuringAnalysisResult | null>(null);

    const handleInputChange = (field: keyof CuringAnalysisInput, value: string | number) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const analysisResult = await performCuringAnalysis(input);
            setResult(analysisResult);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const ResultCard: React.FC<{ icon: React.ElementType, title: string, value: string, color: string }> = ({ icon: Icon, title, value, color }) => (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center gap-4">
            <Icon className={`w-8 h-8 ${color}`} />
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-cyan-100 dark:bg-cyan-900/50 p-3 rounded-full">
                        <HardHat className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">تحليل المعالجة وفك الشدات</h3>
                        <p className="text-sm text-slate-500">
                            احسب المدة الزمنية اللازمة لمعالجة الخرسانة بناءً على الظروف لضمان السلامة الإنشائية.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">إجهاد الخرسانة (f'c)</label>
                    <input type="text" value={input.concreteGrade} onChange={e => handleInputChange('concreteGrade', e.target.value)} placeholder="e.g., C35" className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">درجة الحرارة المحيطة (°C)</label>
                    <input type="number" value={input.ambientTemp} onChange={e => handleInputChange('ambientTemp', Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">القوة المطلوبة للفك (%)</label>
                    <input type="number" value={input.requiredStrength} onChange={e => handleInputChange('requiredStrength', Number(e.target.value))} min="0" max="100" className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                </div>
                
                <div className="border-t pt-6">
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-cyan-700 disabled:bg-slate-400">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                        <span>{isLoading ? 'جاري التحليل...' : 'تحليل'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">النتائج الهندسية</h3>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
                {isLoading && !result && <div className="text-center p-8"><p>جاري إجراء الحسابات الهندسية...</p></div>}
                {!isLoading && !result && !error && <div className="text-center p-8 text-slate-500"><p>ستظهر نتائج التحليل هنا.</p></div>}
                {result && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ResultCard icon={Hourglass} title="أقل مدة معالجة" value={`${result.curingDays} أيام`} color="text-cyan-500" />
                            <ResultCard 
                                icon={result.earlyStrippingPossible ? Check : AlertTriangle} 
                                title="إمكانية الفك المبكر" 
                                value={result.earlyStrippingPossible ? "ممكن" : "غير موصى به"} 
                                color={result.earlyStrippingPossible ? "text-green-500" : "text-red-500"} 
                            />
                        </div>
                        <div>
                             <h4 className="font-semibold mb-2">التوصيات الهندسية</h4>
                             <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: marked.parse(result.recommendations) }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};