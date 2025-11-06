import React, { useState, useRef } from 'react';
// Fix: Removed .ts extension from import path.
import type { Project, BOQMatch } from '../types';
import { Bot, UploadCloud, File, Printer } from '../lucide-icons';
import { reconcileBOQWithTakeoff } from '../services/geminiService';

interface BOQReconciliationTabProps {
    project: Project;
    onUpdateBoqReconciliation: (projectId: string, newMatches: BOQMatch[]) => void;
}

declare var XLSX: any;

export const BOQReconciliationTab: React.FC<BOQReconciliationTabProps> = ({ project, onUpdateBoqReconciliation }) => {
    const [boqFile, setBoqFile] = useState<File | null>(null);
    const [takeoffFile, setTakeoffFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const boqFileInputRef = useRef<HTMLInputElement>(null);
    const takeoffFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'boq' | 'takeoff') => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (fileType === 'boq') setBoqFile(file);
        else setTakeoffFile(file);
    };

    const handleRunReconciliation = async () => {
        if (!boqFile || !takeoffFile) {
            setError('Please upload both a BOQ file and a takeoff file.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const results = await reconcileBOQWithTakeoff(boqFile, takeoffFile);
            onUpdateBoqReconciliation(project.id, results);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred during reconciliation.');
        } finally {
            setIsLoading(false);
        }
    };

    const savedMatches = project.data.boqReconciliation || [];
    
    const handlePrint = () => {
        window.print();
    };

    const handleExportXLSX = () => {
        const dataToExport = savedMatches.map(match => ({
            'بند المقايسة ID': match.boqItemId,
            'وصف بند المقايسة': match.boqItemDescription,
            'ملف الحصر': match.takeoffFile,
            'وصف بند الحصر': match.takeoffDescription,
            'درجة الثقة': match.matchConfidence,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BOQ Reconciliation");
        XLSX.writeFile(workbook, `boq_reconciliation_${project.name.replace(/\s/g, '_')}.xlsx`);
    };


    return (
        <div className="printable-area">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm mb-8 no-print">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">مطابقة المقايسة مع حصر الكميات</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    قم برفع ملف المقايسة التعاقدية وملف حصر الكميات (Takeoff Sheet) ليقوم الذكاء الاصطناعي بمطابقة البنود بينهما.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* BOQ File Uploader */}
                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                        onClick={() => boqFileInputRef.current?.click()}
                    >
                        <input type="file" accept=".xlsx, .xls, .csv" ref={boqFileInputRef} onChange={(e) => handleFileChange(e, 'boq')} className="hidden" />
                        <UploadCloud size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            {boqFile ? boqFile.name : '1. ارفع ملف المقايسة (BOQ)'}
                        </p>
                    </div>

                    {/* Takeoff File Uploader */}
                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                        onClick={() => takeoffFileInputRef.current?.click()}
                    >
                        <input type="file" accept=".xlsx, .xls, .csv" ref={takeoffFileInputRef} onChange={(e) => handleFileChange(e, 'takeoff')} className="hidden" />
                        <UploadCloud size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            {takeoffFile ? takeoffFile.name : '2. ارفع ملف حصر الكميات'}
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={handleRunReconciliation}
                        disabled={isLoading || !boqFile || !takeoffFile}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mx-auto"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Bot size={20} />
                        )}
                        <span>{isLoading ? '...جاري المطابقة' : 'بدء المطابقة'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded" role="alert">
                    <p className="font-bold">خطأ في المطابقة</p>
                    <p>{error}</p>
                </div>
            )}
            
            {savedMatches.length > 0 && (
                 <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">نتائج المطابقة</h3>
                         <div className="flex items-center gap-2 no-print">
                            <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"><File size={18} /><span>تصدير Excel</span></button>
                            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600"><Printer size={18} /><span>طباعة / PDF</span></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="p-3">بند المقايسة</th>
                                    <th className="p-3">بند حصر الكميات</th>
                                    <th className="p-3">ملف الحصر</th>
                                    <th className="p-3">درجة الثقة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedMatches.map((match, index) => (
                                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="p-3">
                                            <span className="font-mono text-xs text-slate-500">{match.boqItemId}</span>
                                            <p className="font-medium">{match.boqItemDescription}</p>
                                        </td>
                                        <td className="p-3">{match.takeoffDescription}</td>
                                        <td className="p-3 font-mono text-sm">{match.takeoffFile}</td>
                                        <td className="p-3 font-semibold">{match.matchConfidence}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            )}
        </div>
    );
};
