import React, { useState } from 'react';
import type { WhatIfAnalysisResult } from '../types';
import { X, Bot, Loader2 } from '../lucide-icons';
import { marked } from 'marked';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (query: string) => void;
  isLoading: boolean;
  result: WhatIfAnalysisResult | null;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({ isOpen, onClose, onAnalyze, isLoading, result }) => {
  const [query, setQuery] = useState('ماذا لو تأخرت أعمال الحفر لمدة 15 يومًا؟');

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content p-8 max-w-3xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">تحليل "ماذا لو؟"</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="mb-4">
          <label htmlFor="what-if-query" className="block text-sm font-medium mb-2">سيناريو افتراضي</label>
          <textarea
            id="what-if-query"
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={4}
            placeholder="مثال: ما هو تأثير زيادة الموارد في بند الهيكل الخرساني بنسبة 30% على تاريخ الانتهاء؟"
            className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
          />
        </div>

        <div className="flex justify-end">
          <button onClick={() => onAnalyze(query)} disabled={isLoading || !query.trim()} className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-slate-400">
            {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
            <span>{isLoading ? 'جاري التحليل...' : 'تحليل السيناريو'}</span>
          </button>
        </div>

        {result && !isLoading && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">نتائج التحليل</h3>
            <div className="prose dark:prose-invert max-w-none text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: marked.parse(result.impactSummary) }}></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs font-semibold">تاريخ الانتهاء الجديد</p>
                    <p className="font-bold text-lg text-red-500">{result.newEndDate}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs font-semibold">التأثير على التكلفة</p>
                    <p className="text-sm">{result.costImpact}</p>
                </div>
                 <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs font-semibold">التأثير على المسار الحرج</p>
                    <p className="text-sm">{result.criticalPathImpact}</p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
