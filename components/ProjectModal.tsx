

import React, { useState, useEffect } from 'react';
// Fix: Correct import path for types.
import type { Project, ProjectTemplate } from '../types';
import { projectTemplates } from '../data/templates';
// Fix: Correct import path for geminiService.
import { createProjectFromTenderText } from '../services/geminiService';
import { X, Bot, UploadCloud } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (newProject: Omit<Project, 'id'>) => void;
}

// Type guard to check if an object has the required properties for a project import
const isProjectImportData = (obj: any): obj is Omit<Project, 'id'> => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.name === 'string' &&
        typeof obj.description === 'string' &&
        typeof obj.startDate === 'string' &&
        typeof obj.data === 'object' &&
        obj.data !== null
    );
};


export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onAddProject }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'tender' | 'import'>('manual');
  
  // Manual form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate>(projectTemplates[0]);
  
  // Tender form state
  const [tenderText, setTenderText] = useState('');
  const [isAnalyzingTender, setIsAnalyzingTender] = useState(false);
  
  // Import form state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-fill description from template when modal opens or template changes on the manual tab.
    if (isOpen && activeTab === 'manual' && selectedTemplate) {
      setDescription(selectedTemplate.description);
    }
  }, [isOpen, activeTab, selectedTemplate]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate) return;

    const newProject = {
      name,
      description,
      startDate,
      data: JSON.parse(JSON.stringify(selectedTemplate.data)), // Deep copy template data
    };
    onAddProject(newProject);
    resetAndClose();
  };
  
  const handleAnalyzeAndCreate = async () => {
    if (!tenderText.trim()) return;
    setIsAnalyzingTender(true);
    setError('');
    try {
        const newProjectData = await createProjectFromTenderText(tenderText);
        onAddProject(newProjectData);
        resetAndClose();
    } catch (e) {
        setError(`AI Analysis Failed: ${(e as Error).message}`);
        setIsAnalyzingTender(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        if (e.target.files[0].type === 'application/json') {
            setImportFile(e.target.files[0]);
            setError('');
        } else {
            setError('خطأ: يرجى تحديد ملف JSON فقط.');
            setImportFile(null);
        }
    }
  };

  const handleImportProject = () => {
    if (!importFile) return;
    setIsImporting(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            if (typeof event.target?.result !== 'string') {
                throw new Error("لا يمكن قراءة الملف.");
            }
            const projectData = JSON.parse(event.target.result);
            if (isProjectImportData(projectData)) {
                onAddProject(projectData);
                resetAndClose();
            } else {
                throw new Error("ملف JSON غير صالح. تأكد من أنه يحتوي على الخصائص المطلوبة: name, description, startDate, data.");
            }
        } catch (e) {
            setError(`فشل الاستيراد: ${(e as Error).message}`);
            setIsImporting(false);
        }
    };
    reader.onerror = () => {
        setError('فشل في قراءة الملف.');
        setIsImporting(false);
    };
    reader.readAsText(importFile);
  };


  const resetAndClose = () => {
    // Manual state
    setName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    // Tender state
    setTenderText('');
    setIsAnalyzingTender(false);
    // Import state
    setImportFile(null);
    setIsImporting(false);
    // Common state
    setError('');
    setActiveTab('manual');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }} onClick={resetAndClose}>
      <div className="modal-content p-8 max-w-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">إضافة مشروع جديد</h2>
          <button onClick={resetAndClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                >
                    إنشاء يدوي
                </button>
                 <button
                    onClick={() => setActiveTab('tender')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'tender' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                >
                    إنشاء من مناقصة (AI)
                </button>
                 <button
                    onClick={() => setActiveTab('import')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'import' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                >
                    استيراد من ملف
                </button>
            </nav>
        </div>

        {activeTab === 'manual' && (
             <form onSubmit={handleManualSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">اسم المشروع</label>
                        <input type="text" id="projectName" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="projectStartDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تاريخ بدء المشروع</label>
                        <input type="date" id="projectStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="projectDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">وصف المشروع</label>
                    <textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
                <div className="mb-6">
                    <label htmlFor="projectTemplate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">استخدام قالب</label>
                    <select id="projectTemplate" value={selectedTemplate.id} onChange={(e) => setSelectedTemplate(projectTemplates.find(t => t.id === e.target.value)!)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {projectTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name} - {template.description}</option>
                    ))}
                    </select>
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={resetAndClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">إضافة المشروع</button>
                </div>
            </form>
        )}
        
        {activeTab === 'tender' && (
            <div>
                <p className="mb-4 text-slate-600 dark:text-slate-400 text-sm">
                   الصق النص الكامل لإشعار المناقصة أدناه. سيقوم الذكاء الاصطناعي بتحليله لإعداد اسم المشروع ووصفه وجدوله الزمني الأولي والشؤون المالية والمخاطر تلقائيًا.
                </p>
                <textarea
                    value={tenderText}
                    onChange={(e) => setTenderText(e.target.value)}
                    rows={12}
                    placeholder="الصق نص إشعار المناقصة هنا..."
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={resetAndClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">إلغاء</button>
                    <button type="button" onClick={handleAnalyzeAndCreate} disabled={isAnalyzingTender || !tenderText.trim()} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center gap-2 disabled:bg-gray-400">
                        {isAnalyzingTender ? (
                             <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>...جاري التحليل</span>
                             </>
                        ) : (
                            <>
                                <Bot size={18}/>
                                <span>تحليل وإنشاء المشروع</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'import' && (
            <div>
                <p className="mb-4 text-slate-600 dark:text-slate-400 text-sm">
                   قم باستيراد مشروع كامل من ملف JSON. يجب أن يتوافق هيكل الملف مع هيكل بيانات المشروع في التطبيق.
                </p>
                 <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-700/50"
                    onClick={() => document.getElementById('project-import-input')?.click()}
                >
                    <input type="file" accept=".json" id="project-import-input" onChange={handleFileChange} className="hidden" />
                    <UploadCloud size={48} className="mx-auto mb-2 text-gray-400" />
                    {importFile ? (
                        <p className="font-semibold text-indigo-600">{importFile.name}</p>
                    ) : (
                         <>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">انقر لاختيار ملف أو اسحبه هنا</p>
                            <p className="text-xs text-slate-500">ملف JSON فقط</p>
                         </>
                    )}
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={resetAndClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">إلغاء</button>
                    <button type="button" onClick={handleImportProject} disabled={isImporting || !importFile} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center gap-2 disabled:bg-gray-400">
                        {isImporting ? (
                             <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>...جاري الاستيراد</span>
                             </>
                        ) : (
                            <span>استيراد المشروع</span>
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
