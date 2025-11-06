import React, { useState } from 'react';
import { X, Bot } from 'lucide-react';

interface GenerateDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  categoryName: string;
  isLoading: boolean;
}

export const GenerateDocModal: React.FC<GenerateDocModalProps> = ({ isOpen, onClose, onSubmit, categoryName, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content p-8 max-w-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">إنشاء مسودة: {categoryName}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
            <p className="mb-4 text-slate-600 dark:text-slate-400">
                صف للذكاء الاصطناعي المستند الذي ترغب في إنشائه. كن محدداً قدر الإمكان.
            </p>
          <div className="mb-4">
            <label htmlFor="docPrompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              وصف المستند المطلوب
            </label>
            <textarea
              id="docPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={5}
              placeholder={`مثال: قم بإنشاء مواصفات فنية لأعمال الخرسانة المسلحة لمبنى سكني من 5 طوابق، مع التركيز على جودة المواد ونسب الخلط.`}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
              إلغاء
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 disabled:bg-gray-400">
              {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جارٍ الإنشاء...</span>
                  </>
              ) : (
                  <>
                    <Bot size={18}/>
                    <span>إنشاء المسودة</span>
                  </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};