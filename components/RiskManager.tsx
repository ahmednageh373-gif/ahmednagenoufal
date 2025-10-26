

import React, { useState, useCallback } from 'react';
// Fix: Correct import path for types.
import type { Project, Risk } from '../types';
// Fix: Correct import path for geminiService.
import { suggestRisks } from '../services/geminiService';
import { Plus, Bot, AlertTriangle, ChevronDown, Trash2, Pencil, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { RiskModal } from './RiskModal';

interface RiskManagerProps {
    project: Project;
    onUpdateRisks: (projectId: string, newRisks: Risk[]) => void;
}

declare var XLSX: any;

const RiskRow: React.FC<{ risk: Risk, onDelete: (riskId: string) => void, onEdit: (risk: Risk) => void }> = React.memo(({ risk, onDelete, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getRiskColor = (level: 'Low' | 'Medium' | 'High') => {
        switch (level) {
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };
    
    const statusColor = {
        'Open': 'bg-red-500',
        'In Progress': 'bg-yellow-500',
        'Closed': 'bg-green-500',
    };

    return (
        <div className="border-b border-slate-200 dark:border-slate-700">
            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                <div className="col-span-4 font-medium text-slate-800 dark:text-slate-200">{risk.description}</div>
                <div className="col-span-2 text-sm">{risk.category}</div>
                <div className="col-span-1"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(risk.probability)}`}>{risk.probability}</span></div>
                <div className="col-span-1"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(risk.impact)}`}>{risk.impact}</span></div>
                <div className="col-span-2 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusColor[risk.status]}`}></span>
                    <span>{risk.status}</span>
                </div>
                <div className="col-span-2 flex justify-end items-center gap-2">
                     <button onClick={() => onEdit(risk)} className="text-slate-400 hover:text-sky-500"><Pencil size={16} /></button>
                     <button onClick={() => onDelete(risk.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ChevronDown size={20} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {/* Mobile View */}
            <div className="md:hidden p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-slate-800 dark:text-slate-200 break-words w-4/5">{risk.description}</p>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => onEdit(risk)} className="text-slate-400 hover:text-sky-500 p-1"><Pencil size={16} /></button>
                        <button onClick={() => onDelete(risk.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <span><strong>الفئة:</strong> {risk.category}</span>
                    <span className="flex items-center gap-2"><strong>الحالة:</strong> <span className={`w-2.5 h-2.5 rounded-full ${statusColor[risk.status]}`}></span>{risk.status}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 font-semibold rounded-full ${getRiskColor(risk.probability)}`}>الاحتمالية: {risk.probability}</span>
                    <span className={`px-2 py-1 font-semibold rounded-full ${getRiskColor(risk.impact)}`}>التأثير: {risk.impact}</span>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-sky-600 mt-3 flex items-center gap-1">
                    {isExpanded ? 'إخفاء التفاصيل' : 'عرض خطة التخفيف'}
                    <ChevronDown size={16} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {isExpanded && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 mx-0 md:mx-4 mb-4 rounded-md">
                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">خطة التخفيف:</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{risk.mitigationPlan}</p>
                </div>
            )}
        </div>
    );
});


export const RiskManager: React.FC<RiskManagerProps> = ({ project, onUpdateRisks }) => {
    const risks = project.data.riskRegister || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestedRisks, setSuggestedRisks] = useState<Omit<Risk, 'id' | 'status'>[]>([]);
    const [suggestionError, setSuggestionError] = useState('');

    const handleAddRisk = (newRisk: Omit<Risk, 'id'>) => {
        const fullRisk: Risk = { ...newRisk, id: `risk-${Date.now()}` };
        onUpdateRisks(project.id, [...risks, fullRisk]);
    };

    const handleUpdateRisk = (updatedRisk: Risk) => {
        onUpdateRisks(project.id, risks.map(r => r.id === updatedRisk.id ? updatedRisk : r));
    };

    const handleDeleteRisk = useCallback((riskId: string) => {
         if (window.confirm('هل أنت متأكد من حذف هذا الخطر؟')) {
            onUpdateRisks(project.id, risks.filter(r => r.id !== riskId));
         }
    }, [project.id, risks, onUpdateRisks]);
    
    const handleSuggestRisks = async () => {
        setIsSuggesting(true);
        setSuggestionError('');
        setSuggestedRisks([]);
        try {
            const suggestions = await suggestRisks(project);
            setSuggestedRisks(suggestions);
        } catch (error) {
            setSuggestionError((error as Error).message);
        } finally {
            setIsSuggesting(false);
        }
    };

    const addSuggestedRisk = (suggestion: Omit<Risk, 'id' | 'status'>) => {
        handleAddRisk({ ...suggestion, status: 'Open' });
        setSuggestedRisks(prev => prev.filter(s => s.description !== suggestion.description));
    };

    const handleOpenModalForAdd = () => {
        setEditingRisk(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = useCallback((risk: Risk) => {
        setEditingRisk(risk);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRisk(null);
    };

    const handleSaveRisk = (riskData: Omit<Risk, 'id'> | Risk) => {
        if ('id' in riskData && riskData.id) {
            handleUpdateRisk(riskData as Risk);
        } else {
            handleAddRisk(riskData);
        }
    };
    
    const handleExportCSV = () => {
        const headers = ['ID', 'Description', 'Category', 'Probability', 'Impact', 'Mitigation_Plan', 'Status'];
        const rows = risks.map(risk =>
            [
                risk.id,
                `"${risk.description.replace(/"/g, '""')}"`,
                risk.category,
                risk.probability,
                risk.impact,
                `"${risk.mitigationPlan.replace(/"/g, '""')}"`,
                risk.status
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `risks_${project.name.replace(/\s/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleExportXLSX = () => {
        const dataToExport = risks.map(risk => ({
            'ID': risk.id,
            'وصف الخطر': risk.description,
            'الفئة': risk.category,
            'الاحتمالية': risk.probability,
            'التأثير': risk.impact,
            'خطة التخفيف': risk.mitigationPlan,
            'الحالة': risk.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Risk Register");
        XLSX.writeFile(workbook, `risks_${project.name.replace(/\s/g, '_')}.xlsx`);
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">إدارة المخاطر (سجل المخاطر)</h2>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
                متابعة وتخفيف المخاطر المحتملة لمشروع: <span className="font-semibold">{project.name}</span>
            </p>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">قائمة المخاطر</h3>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button onClick={handleExportCSV} disabled={risks.length === 0} className="flex items-center gap-2 bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors disabled:bg-slate-400">
                            <Download size={18} />
                            <span>تصدير CSV</span>
                        </button>
                        <button onClick={handleExportXLSX} disabled={risks.length === 0} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400">
                            <FileSpreadsheet size={18} />
                            <span>تصدير Excel</span>
                        </button>
                         <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                            <Printer size={18} /><span>طباعة / PDF</span>
                        </button>
                        <button onClick={handleSuggestRisks} disabled={isSuggesting} className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400">
                           <Bot size={18} />
                           <span>{isSuggesting ? '...جارٍ التحليل' : 'اقتراح مخاطر بالذكاء الاصطناعي'}</span>
                        </button>
                        <button onClick={handleOpenModalForAdd} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors">
                            <Plus size={18} />
                            <span>إضافة خطر جديد</span>
                        </button>
                    </div>
                </div>

                {suggestionError && <div className="text-red-500 my-2">{suggestionError}</div>}
                
                {isSuggesting && <div className="text-center p-4">جارٍ تحليل المشروع لاقتراح المخاطر...</div>}

                {suggestedRisks.length > 0 && (
                    <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg p-4 my-4">
                        <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">مخاطر مقترحة من الذكاء الاصطناعي:</h4>
                        <ul className="space-y-2">
                            {suggestedRisks.map((s, i) => (
                                <li key={i} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded">
                                    <span className="text-sm">{s.description}</span>
                                    <button onClick={() => addSuggestedRisk(s)} className="text-sm text-sky-600 hover:underline font-semibold">إضافة للسجل</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                   <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4 bg-slate-50 dark:bg-slate-900/50 font-semibold text-sm text-slate-600 dark:text-slate-400">
                        <div className="col-span-4">وصف الخطر</div>
                        <div className="col-span-2">الفئة</div>
                        <div className="col-span-1">الاحتمالية</div>
                        <div className="col-span-1">التأثير</div>
                        <div className="col-span-2">الحالة</div>
                        <div className="col-span-2"></div>
                   </div>
                    {risks.length > 0 ? (
                        risks.map(risk => <RiskRow key={risk.id} risk={risk} onDelete={handleDeleteRisk} onEdit={handleOpenModalForEdit} />)
                    ) : (
                        <div className="text-center p-12">
                            <AlertTriangle size={48} className="mx-auto text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">سجل المخاطر فارغ</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                قم بإضافة خطر جديد أو استخدم مساعد الذكاء الاصطناعي لاقتراح المخاطر.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <RiskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveRisk}
                risk={editingRisk}
            />
        </div>
    );
};
