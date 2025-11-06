import React, { useState, useEffect } from 'react';
import type { AssistantSettings } from '../types';
import { X } from 'lucide-react';

interface AssistantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: AssistantSettings;
  onSave: (newSettings: AssistantSettings) => void;
}

const personaOptions: { key: AssistantSettings['persona']; label: string; description: string }[] = [
    { key: 'projectManager', label: 'مدير مشروع خبير', description: 'لغة رسمية، إجابات مفصلة، وتركيز على المنهجيات.' },
    { key: 'technicalAssistant', label: 'مساعد تقني', description: 'إجابات مباشرة، دقيقة، وتركز على البيانات والحقائق.' },
    { key: 'educationalConsultant', label: 'مستشار تعليمي', description: 'أسلوب ودي، شروحات واضحة للمفاهيم المعقدة.' },
];

const toneOptions: { key: AssistantSettings['tone']; label: string }[] = [
    { key: 'formal', label: 'رسمي' },
    { key: 'friendly', label: 'ودي' },
];

const styleOptions: { key: AssistantSettings['style']; label: string }[] = [
    { key: 'concise', label: 'مختصر' },
    { key: 'detailed', label: 'تفصيلي' },
];

export const AssistantSettingsModal: React.FC<AssistantSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [settings, setSettings] = useState<AssistantSettings>({
        persona: 'projectManager',
        tone: 'formal',
        style: 'concise',
        ...currentSettings
    });

    useEffect(() => {
        // Update local state if props change (e.g., when modal opens)
        setSettings({
            persona: 'projectManager',
            tone: 'formal',
            style: 'concise',
            ...currentSettings
        });
    }, [currentSettings, isOpen]);

    const handlePersonaChange = (persona: AssistantSettings['persona']) => {
        // Auto-adjust tone and style based on persona for a better UX
        switch (persona) {
            case 'projectManager':
                setSettings({ persona, tone: 'formal', style: 'detailed' });
                break;
            case 'technicalAssistant':
                setSettings({ persona, tone: 'formal', style: 'concise' });
                break;
            case 'educationalConsultant':
                setSettings({ persona, tone: 'friendly', style: 'detailed' });
                break;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
        onClose();
    };

    if (!isOpen) return null;
    
    const renderRadioGroup = <T extends string>(
        options: { key: T; label: string; description?: string }[],
        selectedValue: T,
        onChange: (value: T) => void,
        title: string
    ) => (
        <fieldset className="mb-6">
            <legend className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">{title}</legend>
            <div className="space-y-3">
                {options.map(({ key, label, description }) => (
                    <label
                        key={key}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedValue === key ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/50' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:border-indigo-300'
                        }`}
                    >
                        <input
                            type="radio"
                            name={title}
                            value={key}
                            checked={selectedValue === key}
                            onChange={() => onChange(key)}
                            className="h-4 w-4 mt-1 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="mr-3 text-sm">
                            <span className="font-medium text-slate-900 dark:text-white block">{label}</span>
                            {description && <span className="text-slate-500 dark:text-slate-400">{description}</span>}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content p-8 max-w-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">تخصيص شخصية المساعد</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
            
            {renderRadioGroup(personaOptions, settings.persona, handlePersonaChange, 'اختر شخصية المساعد')}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <fieldset>
                    <legend className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">النبرة</legend>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {toneOptions.map(({ key, label }) => (
                            <button type="button" key={key} onClick={() => setSettings(s => ({...s, tone: key}))} className={`w-full py-2 text-sm rounded-md ${settings.tone === key ? 'bg-white dark:bg-gray-900 shadow-sm' : ''}`}>{label}</button>
                        ))}
                    </div>
                </fieldset>
                 <fieldset>
                    <legend className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">أسلوب اللغة</legend>
                     <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {styleOptions.map(({ key, label }) => (
                            <button type="button" key={key} onClick={() => setSettings(s => ({...s, style: key}))} className={`w-full py-2 text-sm rounded-md ${settings.style === key ? 'bg-white dark:bg-gray-900 shadow-sm' : ''}`}>{label}</button>
                        ))}
                    </div>
                </fieldset>
            </div>
            
        </form>
         <div className="flex justify-end gap-4 mt-6 shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">
                إلغاء
            </button>
            <button type="submit" onClick={handleSubmit} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">
                حفظ الإعدادات
            </button>
        </div>
      </div>
    </div>
  );
};