import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Fix: Import type from types.ts for better code organization.
import { analyzeDrawingImage } from '../services/geminiService';
import type { Project, DrawingAnalysisResult, FinancialItem } from '../types';
import { UploadCloud, Bot, Download, FileText, ListChecks, MessageSquare, Printer, PlusCircle, Link2, X } from 'lucide-react';

// Make XLSX library available
declare var XLSX: any;

interface DrawingAnalysisTabProps {
    project: Project;
    onUpdateFinancials: (projectId: string, newFinancials: FinancialItem[]) => void;
}

const LinkItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onLink: (boqItemId: string) => void;
    boqItems: FinancialItem[];
    aiItem: DrawingAnalysisResult['preliminaryBOQ'][0] | null;
}> = ({ isOpen, onClose, onLink, boqItems, aiItem }) => {
    const [selectedBoqId, setSelectedBoqId] = useState<string>('');

    if (!isOpen || !aiItem) return null;

    const handleLinkClick = () => {
        if (selectedBoqId) {
            onLink(selectedBoqId);
        }
    };

    return (
        <div className="modal" style={{ display: 'block' }} onClick={onClose}>
            <div className="modal-content p-6 max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">ربط بند من المخطط</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                    سيتم تحديث كمية البند المختار في المقايسة الرئيسية بالكمية المستخرجة من المخطط.
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
                    <p className="font-semibold">{aiItem.item}</p>
                    <p className="text-sm">الكمية المستخرجة: <span className="font-bold">{aiItem.quantity} {aiItem.unit}</span></p>
                </div>
                <div>
                    <label htmlFor="boq-item-select" className="block text-sm font-medium mb-2">اختر البند من المقايسة الرئيسية</label>
                    <select
                        id="boq-item-select"
                        value={selectedBoqId}
                        onChange={e => setSelectedBoqId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border dark:border-gray-600"
                    >
                        <option value="" disabled>-- اختر بندًا لربطه --</option>
                        {boqItems.map(item => (
                            <option key={item.id} value={item.id}>{item.item} (الكمية الحالية: {item.quantity})</option>
                        ))}
                    </select>
                </div>
                 <div className="flex justify-end gap-2 pt-6 mt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600">إلغاء</button>
                    <button onClick={handleLinkClick} disabled={!selectedBoqId} className="py-2 px-4 rounded-lg bg-indigo-600 text-white disabled:bg-gray-400">ربط وتحديث الكمية</button>
                </div>
            </div>
        </div>
    );
};


export const DrawingAnalysisTab: React.FC<DrawingAnalysisTabProps> = ({ project, onUpdateFinancials }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState<DrawingAnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLinking, setIsLinking] = useState(false);
    const [linkingItem, setLinkingItem] = useState<DrawingAnalysisResult['preliminaryBOQ'][0] | null>(null);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setAnalysisResult(null);
            setError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile) {
            setError('يرجى رفع صورة المخطط أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult(null);
        try {
            const result = await analyzeDrawingImage(imageFile);
            setAnalysisResult(result);
        } catch (err) {
            setError((err as Error).message || 'حدث خطأ غير متوقع أثناء تحليل المخطط.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddItemToBOQ = (itemToAdd: DrawingAnalysisResult['preliminaryBOQ'][0]) => {
        const newFinancialItem: FinancialItem = {
            id: `boq-ai-${uuidv4()}`,
            item: `${itemToAdd.item} - ${itemToAdd.description}`,
            quantity: itemToAdd.quantity,
            unit: itemToAdd.unit,
            unitPrice: 0, // Price to be filled later
            total: 0,
        };

        const currentFinancials = project.data.financials || [];
        const newFinancials = [...currentFinancials, newFinancialItem];
        onUpdateFinancials(project.id, newFinancials);
        
        alert(`"${newFinancialItem.item}" تم إضافته إلى المقايسة الرئيسية.`);
    };
    
    const handleOpenLinkModal = (itemToLink: DrawingAnalysisResult['preliminaryBOQ'][0]) => {
        setLinkingItem(itemToLink);
        setIsLinking(true);
    };

    const handleLinkItemToBOQ = (existingBoqId: string) => {
        if (!linkingItem) return;

        const existingItem = project.data.financials.find(i => i.id === existingBoqId);
        if (!existingItem) return;

        const updatedFinancials = project.data.financials.map(item => {
            if (item.id === existingBoqId) {
                const newQuantity = linkingItem.quantity;
                return {
                    ...item,
                    quantity: newQuantity,
                    total: newQuantity * item.unitPrice // Correctly update total
                };
            }
            return item;
        });

        onUpdateFinancials(project.id, updatedFinancials);
        alert(`تم تحديث كمية البند "${existingItem.item}" إلى ${linkingItem.quantity}.`);
        setIsLinking(false);
        setLinkingItem(null);
    };


    const handleExportToExcel = () => {
        if (!analysisResult || analysisResult.preliminaryBOQ.length === 0) return;
        
        const dataToExport = analysisResult.preliminaryBOQ.map(item => ({
            'البند': item.item,
            'الوصف': item.description,
            'الكمية': item.quantity,
            'الوحدة': item.unit
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Preliminary BOQ");
        XLSX.writeFile(workbook, `Preliminary_BOQ_${imageFile?.name.replace(/\.[^/.]+$/, "")}.xlsx`);
    };
    
    const handlePrint = () => {
        window.print();
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 printable-area">
            {/* Left Column: Uploader and Actions */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6 no-print">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">محلل المخططات وحصر الكميات</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        ارفع صورة عالية الجودة للمخطط ليقوم الذكاء الاصطناعي بتحليلها واستخراج مقايسة كميات أولية.
                    </p>
                </div>
                
                <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl min-h-[250px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-800/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" accept="image/png, image/jpeg, image/bmp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {previewUrl ? (
                        <img src={previewUrl} alt="معاينة المخطط" className="object-contain max-h-80 rounded-lg p-2" />
                    ) : (
                        <div className="text-center text-gray-500 p-4">
                            <UploadCloud size={48} className="mx-auto mb-2" />
                            <p className="font-semibold">انقر لرفع صورة المخطط</p>
                            <p className="text-xs mt-1">يدعم PNG, JPG, BMP</p>
                        </div>
                    )}
                </div>

                <div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !imageFile}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Bot size={20} />
                        )}
                        <span>{isLoading ? '...جاري تحليل المخطط' : 'تحليل وحصر الكميات'}</span>
                    </button>
                </div>
            </div>

            {/* Right Column: Results */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">نتائج التحليل</h3>
                     <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 no-print">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                        <p className="font-bold">خطأ في التحليل</p>
                        <p>{error}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="text-center p-8 text-slate-500">
                        <p>يقوم الذكاء الاصطناعي بتحليل المخطط، قد يستغرق الأمر بضع لحظات...</p>
                    </div>
                )}
                
                {!isLoading && !analysisResult && !error && (
                     <div className="text-center p-8 text-slate-500">
                        <p>ستظهر نتائج التحليل التفصيلية هنا.</p>
                    </div>
                )}
                
                {analysisResult && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div>
                             <div className="flex items-center gap-2 mb-2">
                                <MessageSquare size={18} className="text-indigo-500"/>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">ملخص المخطط</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">{analysisResult.summary}</p>
                        </div>

                        {/* Extracted Text */}
                        <div>
                             <div className="flex items-center gap-2 mb-2">
                                <FileText size={18} className="text-indigo-500"/>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">النصوص والأبعاد المستخرجة</h4>
                            </div>
                            <pre className="text-xs text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md max-h-40 overflow-auto whitespace-pre-wrap font-sans">{analysisResult.extractedText}</pre>
                        </div>

                        {/* Preliminary BOQ */}
                        <div>
                             <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <ListChecks size={18} className="text-indigo-500"/>
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">مقايسة الكميات الأولية</h4>
                                </div>
                                <button
                                    onClick={handleExportToExcel}
                                    disabled={analysisResult.preliminaryBOQ.length === 0}
                                    className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold py-1 px-2 rounded-md hover:bg-green-200 no-print"
                                >
                                    <Download size={14}/>
                                    تصدير Excel
                                </button>
                            </div>
                            <div className="max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                 <table className="w-full text-right text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                        <tr>
                                            <th className="p-2">البند</th>
                                            <th className="p-2">الكمية</th>
                                            <th className="p-2">الوحدة</th>
                                            <th className="p-2 no-print">إجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysisResult.preliminaryBOQ.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                                <td className="p-2 font-medium">{item.item}</td>
                                                <td className="p-2">{item.quantity}</td>
                                                <td className="p-2">{item.unit}</td>
                                                <td className="p-2 no-print">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleAddItemToBOQ(item)} title="إضافة كبند جديد" className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-semibold">
                                                            <PlusCircle size={14}/>
                                                        </button>
                                                         <button onClick={() => handleOpenLinkModal(item)} title="ربط ببند قائم" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-semibold">
                                                            <Link2 size={14}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
             <LinkItemModal 
                isOpen={isLinking}
                onClose={() => setIsLinking(false)}
                onLink={handleLinkItemToBOQ}
                boqItems={project.data.financials || []}
                aiItem={linkingItem}
            />
        </div>
    );
};
