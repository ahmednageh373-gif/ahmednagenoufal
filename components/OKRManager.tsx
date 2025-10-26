import React, { useState, useMemo } from 'react';
import type { Project, Objective, KeyResult, KeyResultStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Target, Plus, CheckCircle, AlertCircle, XCircle, Pencil, Trash2, X, File, Printer } from 'lucide-react';

interface OKRManagerProps {
  project: Project;
  onUpdateObjectives: (projectId: string, objectives: Objective[]) => void;
  onUpdateKeyResults: (projectId: string, keyResults: KeyResult[]) => void;
}

declare var XLSX: any;

const statusMap: Record<KeyResultStatus, { icon: React.ElementType, color: string, label: string }> = {
    'On Track': { icon: CheckCircle, color: 'text-green-500', label: 'في المسار الصحيح' },
    'At Risk': { icon: AlertCircle, color: 'text-yellow-500', label: 'في خطر' },
    'Off Track': { icon: XCircle, color: 'text-red-500', label: 'خارج المسار' },
};

// --- Modal Component ---
const OKRModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    itemType: 'objective' | 'keyResult';
    itemData: Objective | KeyResult | null;
    objectives: Objective[];
    preselectedObjectiveId?: string | null;
}> = ({ isOpen, onClose, onSave, itemType, itemData, objectives, preselectedObjectiveId }) => {
    
    const isObjective = itemType === 'objective';
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [objectiveId, setObjectiveId] = useState('');
    const [currentValue, setCurrentValue] = useState(0);
    const [targetValue, setTargetValue] = useState(100);
    const [status, setStatus] = useState<KeyResultStatus>('On Track');

    useMemo(() => {
        if (itemData) {
            setTitle(itemData.title);
            if ('description' in itemData) setDescription(itemData.description);
            if ('objectiveId' in itemData) {
                setObjectiveId(itemData.objectiveId);
                setCurrentValue(itemData.currentValue);
                setTargetValue(itemData.targetValue);
                setStatus(itemData.status);
            }
        } else {
            setTitle('');
            setDescription('');
            setObjectiveId(preselectedObjectiveId || (objectives.length > 0 ? objectives[0].id : ''));
            setCurrentValue(0);
            setTargetValue(100);
            setStatus('On Track');
        }
    }, [itemData, isOpen, objectives, preselectedObjectiveId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const commonData = { id: itemData?.id || uuidv4(), title };
        if (isObjective) {
            onSave({ ...commonData, description });
        } else {
            onSave({ ...commonData, objectiveId, currentValue, targetValue, status });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal" style={{ display: 'block' }} onClick={onClose}>
            <div className="modal-content p-6 max-w-lg dark:bg-gray-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{itemData ? 'تعديل' : 'إضافة'} {isObjective ? 'هدف' : 'نتيجة رئيسية'}</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="العنوان" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    {isObjective && (
                        <textarea placeholder="الوصف" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"></textarea>
                    )}
                    {!isObjective && (
                        <>
                            <select value={objectiveId} onChange={e => setObjectiveId(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                <option value="" disabled>-- ربط بهدف --</option>
                                {objectives.map(obj => <option key={obj.id} value={obj.id}>{obj.title}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="القيمة الحالية" value={currentValue} onChange={e => setCurrentValue(Number(e.target.value))} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                                <input type="number" placeholder="القيمة المستهدفة" value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                            </div>
                             <select value={status} onChange={e => setStatus(e.target.value as KeyResultStatus)} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                {(Object.keys(statusMap) as KeyResultStatus[]).map(s => <option key={s} value={s}>{statusMap[s].label}</option>)}
                            </select>
                        </>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 font-semibold">إلغاء</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-indigo-600 text-white font-semibold">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const OKRManager: React.FC<OKRManagerProps> = ({ project, onUpdateObjectives, onUpdateKeyResults }) => {
    const objectives = project.data.objectives || [];
    const keyResults = project.data.keyResults || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<{ type: 'objective' | 'keyResult', data: Objective | KeyResult | null } | null>(null);
    const [preselectedObjectiveId, setPreselectedObjectiveId] = useState<string | null>(null);

    const objectivesWithProgress = useMemo(() => {
        return objectives.map(obj => {
            const relevantKRs = keyResults.filter(kr => kr.objectiveId === obj.id);
            if (relevantKRs.length === 0) {
                return { ...obj, progress: 0, keyResults: [] };
            }
            const totalProgress = relevantKRs.reduce((sum, kr) => {
                const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
                return sum + Math.min(100, progress);
            }, 0);
            const averageProgress = totalProgress / relevantKRs.length;

            const krsWithProgress = relevantKRs.map(kr => ({
                ...kr,
                progress: kr.targetValue > 0 ? Math.min(100, (kr.currentValue / kr.targetValue) * 100) : 0,
            }));

            return { ...obj, progress: averageProgress, keyResults: krsWithProgress };
        });
    }, [objectives, keyResults]);

    const handleSave = (data: Objective | KeyResult) => {
        if ('description' in data) { // It's an Objective
            const newObjectives = objectives.find(o => o.id === data.id)
                ? objectives.map(o => o.id === data.id ? data : o)
                : [...objectives, data];
            onUpdateObjectives(project.id, newObjectives);
        } else { // It's a KeyResult
            const newKeyResults = keyResults.find(kr => kr.id === data.id)
                ? keyResults.map(kr => kr.id === data.id ? data : kr)
                : [...keyResults, data];
            onUpdateKeyResults(project.id, newKeyResults);
        }
    };
    
    const handleDelete = (type: 'objective' | 'keyResult', id: string) => {
        if (type === 'objective') {
            if (window.confirm('هل أنت متأكد من حذف هذا الهدف؟ سيتم حذف جميع النتائج الرئيسية المرتبطة به.')) {
                onUpdateObjectives(project.id, objectives.filter(o => o.id !== id));
                onUpdateKeyResults(project.id, keyResults.filter(kr => kr.objectiveId !== id));
            }
        } else {
             if (window.confirm('هل أنت متأكد من حذف هذه النتيجة الرئيسية؟')) {
                onUpdateKeyResults(project.id, keyResults.filter(kr => kr.id !== id));
            }
        }
    }
    
    const handlePrint = () => {
        window.print();
    };

    const handleExportXLSX = () => {
        const data = objectivesWithProgress.flatMap(obj => [
            { 'النوع': 'الهدف', 'العنوان': obj.title, 'الوصف/الحالة': obj.description, 'التقدم': `${Math.round(obj.progress)}%` },
            ...obj.keyResults.map(kr => ({
                'النوع': 'نتيجة رئيسية',
                'العنوان': `  - ${kr.title}`,
                'الوصف/الحالة': `الحالة: ${statusMap[kr.status].label}, القيمة: ${kr.currentValue}/${kr.targetValue}`,
                'التقدم': `${Math.round(kr.progress)}%`
            }))
        ]);

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "OKRs");
        XLSX.writeFile(workbook, `okrs_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    return (
        <div className="printable-area">
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الأهداف والنتائج الرئيسية (OKRs)</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">تتبع الأهداف الاستراتيجية لمشروع: {project.name}</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"><File size={18} /><span>تصدير Excel</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600"><Printer size={18} /><span>طباعة / PDF</span></button>
                    <button onClick={() => { setEditingItem({ type: 'objective', data: null }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">
                        <Plus size={18} /><span>هدف جديد</span>
                    </button>
                    <button onClick={() => { setEditingItem({ type: 'keyResult', data: null }); setPreselectedObjectiveId(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800">
                        <Plus size={18} /><span>نتيجة رئيسية جديدة</span>
                    </button>
                </div>
            </header>
            
            <div className="space-y-6">
                {objectivesWithProgress.map(obj => (
                    <div key={obj.id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2"><Target className="text-indigo-500" /> {obj.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{obj.description}</p>
                            </div>
                             <div className="flex items-center gap-2 no-print">
                                <button onClick={() => { setEditingItem({ type: 'objective', data: obj }); setIsModalOpen(true); }} className="text-gray-400 hover:text-indigo-500"><Pencil size={16} /></button>
                                <button onClick={() => handleDelete('objective', obj.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${obj.progress}%` }}></div>
                            </div>
                            <span className="font-bold text-indigo-600">{Math.round(obj.progress)}%</span>
                        </div>
                        
                        <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                            {obj.keyResults.map(kr => {
                                const StatusIcon = statusMap[kr.status].icon;
                                return (
                                    <div key={kr.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-sm">{kr.title}</p>
                                            <div className="flex items-center gap-2 no-print">
                                                <button onClick={() => { setEditingItem({ type: 'keyResult', data: kr }); setIsModalOpen(true); }} className="text-gray-400 hover:text-indigo-500"><Pencil size={14} /></button>
                                                <button onClick={() => handleDelete('keyResult', kr.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${kr.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-500">{kr.currentValue}/{kr.targetValue}</span>
                                            <div className="flex items-center gap-1" title={statusMap[kr.status].label}>
                                                <StatusIcon size={14} className={statusMap[kr.status].color} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                             <button onClick={() => { setEditingItem({ type: 'keyResult', data: null }); setPreselectedObjectiveId(obj.id); setIsModalOpen(true); }} className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1 pt-2 no-print">
                                <Plus size={14} /> أضف نتيجة رئيسية
                            </button>
                        </div>
                    </div>
                ))}
                 {objectivesWithProgress.length === 0 && (
                     <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        <Target size={48} className="mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">لم يتم تحديد أهداف بعد</h3>
                        <p className="mt-1">ابدأ بإضافة هدف استراتيجي لمشروعك.</p>
                     </div>
                 )}
            </div>

            <OKRModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                itemType={editingItem?.type || 'objective'}
                itemData={editingItem?.data || null}
                objectives={objectives}
                preselectedObjectiveId={preselectedObjectiveId}
            />
        </div>
    );
};