import React, { useState } from 'react';
import type { Project, QualityPlanInput, QualityPlanResult } from '../types';
import { generateQualityPlan } from '../services/geminiService';
import { Bot, CheckSquare, Loader2 } from 'lucide-react';
import { marked } from 'marked';

interface QualityPlanGeneratorTabProps {
    project: Project;
}

const availableStandards = ['Saudi Building Code (SBC)', 'ACI', 'ASTM', 'ISO 9001'];

export const QualityPlanGeneratorTab: React.FC<QualityPlanGeneratorTabProps> = ({ project }) => {
    const financials = project.data.financials || [];
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [selectedStandards, setSelectedStandards] = useState<string[]>(['Saudi Building Code (SBC)', 'ACI']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<QualityPlanResult | null>(null);

    const handleItemCheckboxChange = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleStandardCheckboxChange = (standard: string) => {
        setSelectedStandards(prev =>
            prev.includes(standard)
                ? prev.filter(s => s !== standard)
                : [...prev, standard]
        );
    };

    const handleGenerate = async () => {
        if (selectedItemIds.length === 0) {
            setError('الرجاء تحديد بند واحد على الأقل.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const input: QualityPlanInput = {
                itemIds: selectedItemIds,
                standards: selectedStandards
            };
            const response = await generateQualityPlan(project, input);
            setResult(response);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">1. حدد بنود العمل</h3>
                    <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {financials.map(item => (
                            <label key={item.id} className="flex items-center gap-2 p-1 text-sm cursor-pointer">
                                <input type="checkbox" checked={selectedItemIds.includes(item.id)} onChange={() => handleItemCheckboxChange(item.id)} />
                                <span>{item.item}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">2. حدد المعايير المرجعية</h3>
                    <div className="space-y-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        {availableStandards.map(standard => (
                            <label key={standard} className="flex items-center gap-2 p-1 text-sm cursor-pointer">
                                <input type="checkbox" checked={selectedStandards.includes(standard)} onChange={() => handleStandardCheckboxChange(standard)} />
                                <span>{standard}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="border-t pt-4">
                     <button onClick={handleGenerate} disabled={isLoading || selectedItemIds.length === 0} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                        <span>{isLoading ? 'جاري إنشاء الخطة...' : 'إنشاء خطة الجودة (ITP)'}</span>
                    </button>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckSquare /> خطة الفحص والاختبار (ITP)</h3>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
                {isLoading && !result && <div className="text-center p-8"><p>يقوم مهندس الجودة (AI) بإعداد الخطة...</p></div>}
                {!isLoading && !result && !error && <div className="text-center p-8 text-slate-500"><p>ستظهر خطة الفحص والاختبار هنا.</p></div>}
                {result && (
                     <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(result.itpReport) }}></div>
                )}
            </div>
        </div>
    );
};