

import React, { useState, useRef } from 'react';
// Fix: Correct import path for types.
import type { Project, DocumentCategory, EngineeringDocument, FinancialItem, ScheduleTask } from '../types';
import { Folder, FileText, Plus, Upload, Bot, ChevronDown, Trash2, Pencil, FolderUp, Loader2, File, Printer } from 'lucide-react';
// Fix: Correct import path for geminiService.
import { extractFinancialItemsFromBOQ, generateDocumentDraft, processBoqToSchedule } from '../services/geminiService';
import { BoqAnalysisModal } from './BoqAnalysisModal';
import { GenerateDocModal } from './GenerateDocModal';
import { v4 as uuidv4 } from 'uuid';

interface EngineeringDocsManagerProps {
    project: Project;
    onUpdateDocuments: (projectId: string, newDocs: DocumentCategory[]) => void;
    onUpdateFinancials: (projectId: string, newFinancials: FinancialItem[], fileName: string) => void;
    onUpdateSchedule: (projectId: string, newSchedule: ScheduleTask[]) => void;
}

declare var XLSX: any;

export const EngineeringDocsManager: React.FC<EngineeringDocsManagerProps> = ({ project, onUpdateDocuments, onUpdateFinancials, onUpdateSchedule }) => {
    const docCategories = project.data.engineeringDocs || [];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(docCategories[0]?.id || null);
    const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [boqAnalysisResult, setBoqAnalysisResult] = useState<FinancialItem[]>([]);
    const [boqFileName, setBoqFileName] = useState('');
    const [isAnalyzingBoq, setIsAnalyzingBoq] = useState(false);
    const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const activeCategory = docCategories.find(cat => cat.id === activeCategoryId);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !activeCategoryId) return;

        // Special handling for BOQ Excel files
        if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.csv')) {
            setIsAnalyzingBoq(true);
            setIsBoqModalOpen(true);
            setBoqFileName(file.name);
            setBoqAnalysisResult([]);
            try {
                const items = await extractFinancialItemsFromBOQ(file);
                setBoqAnalysisResult(items);
            } catch (error) {
                console.error("BOQ Analysis failed:", error);
                alert(`Failed to analyze BOQ: ${(error as Error).message}`);
                setIsBoqModalOpen(false); // Close if analysis fails
            } finally {
                setIsAnalyzingBoq(false);
            }
        } else {
             // Generic file handling
            const newDocument: EngineeringDocument = {
                id: `doc-${Date.now()}`,
                title: file.name,
                content: `File uploaded on ${new Date().toLocaleDateString()}`,
                lastUpdated: new Date().toISOString(),
                file: {
                    name: file.name,
                    url: URL.createObjectURL(file), // Note: This URL is temporary
                    type: file.type
                }
            };
            addDocumentToCategory(activeCategoryId, newDocument);
        }
         // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            let updatedCategories: DocumentCategory[] = JSON.parse(JSON.stringify(docCategories));

            const categoryMap = new Map<string, DocumentCategory>();
            updatedCategories.forEach(cat => categoryMap.set(cat.name, cat));

            // Fix: Cast the file list to an array of Files with the non-standard webkitRelativePath property.
            for (const file of Array.from(files) as (File & { webkitRelativePath: string })[]) {
                if (!file.webkitRelativePath) continue;

                const pathParts = file.webkitRelativePath.split('/');
                let targetCategory: DocumentCategory | undefined;

                // File is in a subfolder, which becomes the category
                if (pathParts.length > 2) {
                    const categoryName = pathParts[pathParts.length - 2];
                    targetCategory = categoryMap.get(categoryName);
                    if (!targetCategory) {
                        targetCategory = { id: `cat-${uuidv4()}`, name: categoryName, documents: [] };
                        updatedCategories.push(targetCategory);
                        categoryMap.set(categoryName, targetCategory);
                    }
                } else if (activeCategoryId) {
                    // File is in the root of the upload, add to the currently active category
                    targetCategory = updatedCategories.find(cat => cat.id === activeCategoryId);
                }

                if (targetCategory) {
                    const newDocument: EngineeringDocument = {
                        id: `doc-${uuidv4()}`,
                        title: file.name,
                        content: `File uploaded on ${new Date().toLocaleDateString()}`,
                        lastUpdated: new Date().toISOString(),
                        file: {
                            name: file.name,
                            url: URL.createObjectURL(file),
                            type: file.type,
                        },
                    };
                    targetCategory.documents.push(newDocument);
                }
            }
            onUpdateDocuments(project.id, updatedCategories);
        } catch (error) {
            console.error("Folder upload failed:", error);
            alert(`Folder upload failed: ${(error as Error).message}`);
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = '';
        }
    };


    const addDocumentToCategory = (categoryId: string, doc: EngineeringDocument) => {
        const updatedCategories = docCategories.map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, documents: [...cat.documents, doc] };
            }
            return cat;
        });
        onUpdateDocuments(project.id, updatedCategories);
    };

    const handleConfirmBoq = async (items: FinancialItem[], fileName: string, generateSchedule: boolean) => {
        // 1. Update financials
        onUpdateFinancials(project.id, items, fileName);
        setIsBoqModalOpen(false);

        // 2. Generate schedule if requested
        if (generateSchedule) {
            setIsGeneratingSchedule(true);
            try {
                const newSchedule = await processBoqToSchedule(items, project.startDate);
                if (newSchedule.length > 0) {
                     onUpdateSchedule(project.id, newSchedule);
                     alert('تم إنشاء وتحديث الجدول الزمني بنجاح بناءً على المقايسة.');
                } else {
                     alert('تم تحليل المقايسة ولكن لم يتم العثور على مهام لإنشاء جدول زمني.');
                }
            } catch(e) {
                alert(`فشل إنشاء الجدول الزمني: ${(e as Error).message}`);
            } finally {
                setIsGeneratingSchedule(false);
            }
        }
    };

    const handleGenerateDraft = async (prompt: string) => {
        if(!activeCategory) return;
        setIsGeneratingDoc(true);
        try {
            const { title, content } = await generateDocumentDraft(project, prompt, activeCategory.name);
            const newDocument: EngineeringDocument = {
                id: `doc-ai-${Date.now()}`,
                title,
                content,
                lastUpdated: new Date().toISOString(),
            };
            addDocumentToCategory(activeCategory.id, newDocument);
            setIsGenerateModalOpen(false);
        } catch (error) {
             alert(`Failed to generate draft: ${(error as Error).message}`);
        } finally {
            setIsGeneratingDoc(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportXLSX = () => {
        if (!activeCategory) {
            alert('Please select a category to export.');
            return;
        }
        const dataToExport = activeCategory.documents.map(doc => ({
            'العنوان': doc.title,
            'آخر تحديث': new Date(doc.lastUpdated).toLocaleDateString(),
            'اسم الملف': doc.file?.name || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, activeCategory.name.substring(0, 31));
        XLSX.writeFile(workbook, `docs_${activeCategory.name.replace(/\s/g, '_')}.xlsx`);
    };
    

    return (
        <div className="printable-area">
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المستندات الهندسية</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        إدارة المستندات الفنية والعقود لمشروع: <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} disabled={!activeCategory || !activeCategory.documents.length} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400">
                        <File size={18} /><span>تصدير Excel</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                     <button onClick={() => setIsGenerateModalOpen(true)} disabled={!activeCategoryId || isUploading} className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400">
                        <Bot size={18} /><span>إنشاء مسودة (AI)</span>
                    </button>
                     <button onClick={() => folderInputRef.current?.click()} disabled={!activeCategoryId || isUploading || isGeneratingSchedule} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400">
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <FolderUp size={18} />}
                        <span>{isUploading ? 'جاري الرفع...' : 'رفع مجلد'}</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={!activeCategoryId || isUploading || isGeneratingSchedule} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400">
                        {isGeneratingSchedule ? (
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Upload size={18} />
                        )}
                        <span>{isGeneratingSchedule ? 'جاري إنشاء الجدول...' : 'رفع مستند'}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <input type="file" ref={folderInputRef} onChange={handleFolderUpload} className="hidden" {...{ webkitdirectory: "", directory: "", multiple: true } as any} />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Categories Sidebar */}
                <div className="md:col-span-1 no-print">
                     <h3 className="text-lg font-semibold mb-3">الأقسام</h3>
                     <nav className="space-y-2">
                        {docCategories.map(cat => (
                             <button
                                key={cat.id}
                                onClick={() => setActiveCategoryId(cat.id)}
                                className={`w-full text-right flex items-center gap-3 p-3 rounded-lg transition-all text-sm font-medium ${
                                    activeCategoryId === cat.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <Folder size={20} />
                                <span>{cat.name} ({cat.documents.length})</span>
                            </button>
                        ))}
                     </nav>
                </div>

                {/* Documents List */}
                <div className="md:col-span-3">
                    {activeCategory ? (
                        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                            <h2 className="text-2xl font-bold mb-4">{activeCategory.name}</h2>
                            <div className="space-y-3">
                                {activeCategory.documents.map(doc => (
                                    <div key={doc.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <FileText size={24} className="text-indigo-500" />
                                            <div>
                                                <p className="font-semibold">{doc.title}</p>
                                                <p className="text-xs text-slate-500">آخر تحديث: {new Date(doc.lastUpdated).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 no-print">
                                            {doc.file && <a href={doc.file.url} download={doc.file.name} className="text-indigo-600 hover:underline text-sm">تحميل</a>}
                                            {/* Edit/Delete buttons can be added here */}
                                        </div>
                                    </div>
                                ))}
                                 {activeCategory.documents.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">لا توجد مستندات في هذا القسم.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                            <Folder size={48} className="mb-4" />
                            <h3 className="text-xl font-semibold">الرجاء اختيار قسم</h3>
                            <p>اختر قسمًا من القائمة لعرض مستنداته.</p>
                        </div>
                    )}
                </div>
            </div>

            <BoqAnalysisModal
                isOpen={isBoqModalOpen}
                onClose={() => setIsBoqModalOpen(false)}
                onConfirm={handleConfirmBoq}
                financialItems={boqAnalysisResult}
                fileName={boqFileName}
                isLoading={isAnalyzingBoq}
            />

            {activeCategory && <GenerateDocModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onSubmit={handleGenerateDraft}
                categoryName={activeCategory.name}
                isLoading={isGeneratingDoc}
            />}

        </div>
    );
};
