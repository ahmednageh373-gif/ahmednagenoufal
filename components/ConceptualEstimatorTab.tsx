import React, { useState } from 'react';
import { marked } from 'marked';
import { Bot, Building, Loader2, BarChart3, Clock, Package } from 'lucide-react';
import type { Project, ConceptualEstimateInput, ConceptualEstimateResult } from '../types';
import { getConceptualEstimate } from '../services/geminiService';

interface ConceptualEstimatorTabProps {
    project: Project;
}

const ResultCard: React.FC<{ icon: React.ElementType, title: string, value: string, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${color}`} />
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
        </div>
    </div>
);

export const ConceptualEstimatorTab: React.FC<ConceptualEstimatorTabProps> = ({ project }) => {
    const [input, setInput] = useState<ConceptualEstimateInput>({
        buildingType: 'فيلا سكنية',
        location: 'الرياض، السعودية',
        floors: 2,
        totalArea: 400,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<ConceptualEstimateResult | null>(null);

    const handleInputChange = (field: keyof ConceptualEstimateInput, value: string | number) => {
        setInput(prev => ({ ...prev, [field]: value }));
    };

    const handleEstimate = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const currentBoqTotal = project.data.financials.reduce((sum, item) => sum + item.total, 0);
            const response = await getConceptualEstimate(input, currentBoqTotal);
            setResult(response);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                        <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">المقدر المبدئي للتكاليف والمدة</h3>
                        <p className="text-sm text-slate-500">
                            أدخل معلومات المشروع الأساسية للحصول على تقدير مبدئي للتكلفة والمدة والموارد.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">نوع المبنى</label>
                        <input type="text" value={input.buildingType} onChange={e => handleInputChange('buildingType', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">الموقع</label>
                        <input type="text" value={input.location} onChange={e => handleInputChange('location', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">عدد الطوابق</label>
                        <input type="number" value={input.floors} onChange={e => handleInputChange('floors', Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">المساحة الإجمالية (م²)</label>
                        <input type="number" value={input.totalArea} onChange={e => handleInputChange('totalArea', Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700" />
                    </div>
                </div>

                <div className="border-t pt-6">
                     <button onClick={handleEstimate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-400">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                        <span>{isLoading ? '...جاري التقدير' : 'إنشاء تقدير'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">التقدير المبدئي</h3>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
                {isLoading && !result && <div className="text-center p-8"><p>يقوم الذكاء الاصطناعي بإعداد تقديرك...</p></div>}
                {!isLoading && !result && !error && <div className="text-center p-8 text-slate-500"><p>ستظهر نتائج التقدير هنا.</p></div>}
                {result && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ResultCard icon={BarChart3} title="التكلفة التقديرية" value={result.estimatedCost.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })} color="text-green-500" />
                            <ResultCard icon={Clock} title="المدة التقديرية" value={`${result.estimatedDuration} يوم`} color="text-sky-500" />
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Package size={18}/> الموارد الرئيسية</h4>
                            <div className="space-y-2">
                                {result.majorResources.map(res => (
                                    <div key={res.material} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-sm">
                                        <span>{res.material}</span>
                                        <span className="font-mono font-semibold">{res.quantity.toLocaleString()} {res.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">تقرير التحقق من المقايسة</h4>
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: marked.parse(result.varianceReport) }}></div>
                        </div>
                        
                        <div>
                             <h4 className="font-semibold mb-2">الافتراضات</h4>
                             <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: marked.parse(result.assumptions) }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};