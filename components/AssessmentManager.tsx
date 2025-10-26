import React, { useState, useMemo, useEffect } from 'react';
import type { Project, StructuralAssessment, Defect, RetrofittingPlan } from '../types';
import { ClipboardCheck, Bot, Building, Loader2, Plus, Wrench, Package, Clock, DollarSign, Check, AlertTriangle } from 'lucide-react';
import { generateRetrofittingPlan } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface AssessmentManagerProps {
    project: Project;
    onUpdateAssessments: (projectId: string, newAssessments: StructuralAssessment[]) => void;
}

const PlanDetails: React.FC<{ plan: RetrofittingPlan }> = ({ plan }) => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                <DollarSign className="text-green-500"/>
                <div>
                    <p className="text-sm text-gray-500">التكلفة الإجمالية</p>
                    <p className="font-bold text-lg">{plan.totalCost?.toLocaleString('ar-SA')} SAR</p>
                </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                <Clock className="text-blue-500"/>
                <div>
                    <p className="text-sm text-gray-500">المدة المقدرة</p>
                    <p className="font-bold text-lg">{plan.estimatedDurationDays} أيام</p>
                </div>
            </div>
             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                <Wrench className="text-yellow-500"/>
                <div>
                    <p className="text-sm text-gray-500">ساعات العمل</p>
                    <p className="font-bold text-lg">{plan.requiredLaborHours} ساعة</p>
                </div>
            </div>
        </div>
        
        <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Wrench/> إجراءات الإصلاح</h4>
            <ol className="list-decimal list-inside space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm">
                {plan.procedure.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
        </div>
        
        <div>
             <h4 className="font-semibold mb-2 flex items-center gap-2"><Package/> المواد المطلوبة</h4>
             <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800"><tr className="text-right"><th className="p-2">المادة</th><th className="p-2">الكمية</th><th className="p-2">الوحدة</th><th className="p-2">تكلفة الوحدة (SAR)</th></tr></thead>
                    <tbody>
                        {plan.requiredMaterials.map((mat, i) => (
                            <tr key={i} className="border-t dark:border-gray-700"><td className="p-2">{mat.name}</td><td className="p-2">{mat.quantity}</td><td className="p-2">{mat.unit}</td><td className="p-2 font-mono">{mat.unitCost}</td></tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    </div>
);


export const AssessmentManager: React.FC<AssessmentManagerProps> = ({ project, onUpdateAssessments }) => {
    const assessments = project.data.structuralAssessments || [];
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(assessments.length > 0 ? assessments[0].id : null);
    const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);
    const [plan, setPlan] = useState<RetrofittingPlan | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [error, setError] = useState('');

    const selectedAssessment = useMemo(() => assessments.find(a => a.id === selectedAssessmentId), [assessments, selectedAssessmentId]);
    const selectedDefect = useMemo(() => selectedAssessment?.defects.find(d => d.id === selectedDefectId), [selectedAssessment, selectedDefectId]);
    
    useEffect(() => {
        setSelectedDefectId(null);
        setPlan(null);
    }, [selectedAssessmentId]);

    useEffect(() => {
        setPlan(null);
    }, [selectedDefectId]);

    const handleGeneratePlan = async () => {
        if (!selectedDefect) return;
        setIsLoadingPlan(true);
        setError('');
        setPlan(null);
        try {
            const generatedPlan = await generateRetrofittingPlan(selectedDefect);
            
            const materialCost = generatedPlan.requiredMaterials.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
            const laborCost = generatedPlan.requiredLaborHours * 40; // 40 SAR/hr assumption
            // Fix: Create a new plan object that includes the calculated totalCost, adhering to the RetrofittingPlan type.
            const completePlan: RetrofittingPlan = {
                ...generatedPlan,
                totalCost: parseFloat((materialCost + laborCost).toFixed(2)),
            };
            
            setPlan(completePlan);
            handleUpdateDefect(selectedDefect.id, { status: 'Plan Generated' });

        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoadingPlan(false);
        }
    };
    
    const handleUpdateDefect = (defectId: string, updates: Partial<Defect>) => {
        if (!selectedAssessmentId) return;
        const updatedAssessments = assessments.map(asm => {
            if (asm.id === selectedAssessmentId) {
                return {
                    ...asm,
                    defects: asm.defects.map(def => def.id === defectId ? { ...def, ...updates } : def)
                };
            }
            return asm;
        });
        onUpdateAssessments(project.id, updatedAssessments);
    };
    
    const handleFixDefect = () => {
        if (!selectedDefectId) return;
        handleUpdateDefect(selectedDefectId, { status: 'Fixed' });
        setPlan(null);
        setSelectedDefectId(null);
    };

    const handleAddAssessment = () => {
        const newName = prompt("أدخل اسم المبنى أو الوحدة الجديدة للتقييم:", `مبنى ${assessments.length + 1}`);
        if (newName) {
            const newAssessment: StructuralAssessment = {
                id: uuidv4(),
                buildingName: newName,
                assessmentType: 'Visual',
                defects: [],
            };
            onUpdateAssessments(project.id, [...assessments, newAssessment]);
            setSelectedAssessmentId(newAssessment.id);
        }
    };

    const renderSeverityBadge = (severity: Defect['severity']) => {
        const colors = {
            Low: 'bg-green-100 text-green-800 dark:bg-green-900/50',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
            High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50',
            Critical: 'bg-red-100 text-red-800 dark:bg-red-900/50',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[severity]}`}>{severity}</span>;
    };
    
    const renderStatusBadge = (status: Defect['status']) => {
        const colors = {
            New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
            'Plan Generated': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50',
            Fixed: 'bg-gray-200 text-gray-800 dark:bg-gray-700',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
    }

    return (
        <div>
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3"><ClipboardCheck/>إدارة التقييم والترميم</h1>
                    <p className="text-gray-500 mt-1">سجل العيوب الإنشائية وقم بتوليد خطط إصلاح ذكية.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-900/50 p-4 rounded-xl shadow-sm border dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">قائمة التقييمات</h3>
                             <button onClick={handleAddAssessment} className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full"><Plus size={18}/></button>
                        </div>
                        <div className="space-y-2 max-h-[25vh] overflow-y-auto">
                            {assessments.map(item => (
                                <button key={item.id} onClick={() => setSelectedAssessmentId(item.id)} className={`w-full text-right p-3 rounded-lg flex items-center gap-3 ${selectedAssessmentId === item.id ? 'bg-indigo-100 dark:bg-indigo-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    <div className="bg-indigo-200 dark:bg-indigo-800 p-2 rounded-full"><Building size={16}/></div>
                                    <div><p className="font-semibold text-sm">{item.buildingName}</p><p className="text-xs text-gray-500">{item.assessmentType}</p></div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900/50 p-4 rounded-xl shadow-sm border dark:border-gray-800">
                        <h3 className="font-bold mb-4">العيوب المسجلة</h3>
                        <div className="space-y-2 max-h-[45vh] overflow-y-auto">
                            {selectedAssessment?.defects.map(defect => (
                                <button key={defect.id} onClick={() => setSelectedDefectId(defect.id)} className={`w-full text-right p-3 rounded-lg border-l-4 ${selectedDefectId === defect.id ? 'bg-gray-100 dark:bg-gray-800 border-indigo-500' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm">{defect.location}</p>
                                        {renderSeverityBadge(defect.severity)}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{defect.description}</p>
                                    <div className="mt-2">{renderStatusBadge(defect.status)}</div>
                                </button>
                            ))}
                            {selectedAssessment && selectedAssessment.defects.length === 0 && <p className="text-center text-sm text-gray-500 py-4">لا توجد عيوب مسجلة لهذا التقييم.</p>}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                    {selectedDefect ? (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold">{selectedDefect.description}</h2>
                                <p className="text-sm text-gray-500">{selectedDefect.location} - {selectedDefect.type}</p>
                            </div>
                            {selectedDefect.photoUrl && <img src={selectedDefect.photoUrl} alt="Defect" className="rounded-lg max-h-64 w-full object-cover" />}
                            
                            <div className="border-t dark:border-gray-700 pt-4">
                                {plan ? (
                                    <>
                                        <PlanDetails plan={plan} />
                                        <div className="mt-6 flex justify-end">
                                            <button onClick={handleFixDefect} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                                                <Check size={18} />
                                                <span>تأكيد الإصلاح</span>
                                            </button>
                                        </div>
                                    </>
                                ) : isLoadingPlan ? (
                                    <div className="text-center p-8"><Loader2 size={32} className="animate-spin text-indigo-500 mx-auto"/><p className="mt-2">جاري إنشاء خطة الإصلاح...</p></div>
                                ) : (
                                    selectedDefect.status !== 'Fixed' && (
                                        <button onClick={handleGeneratePlan} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">
                                            <Bot size={18} />
                                            <span>إنشاء خطة تعديل (AI)</span>
                                        </button>
                                    )
                                )}
                                {selectedDefect.status === 'Fixed' && <p className="font-semibold text-green-600 flex items-center gap-2"><Check/> تم إصلاح هذا العيب.</p>}
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <div>
                                <ClipboardCheck size={48} className="mx-auto mb-4"/>
                                <h3 className="text-lg font-semibold">اختر عيبًا من القائمة</h3>
                                <p>اختر عيبًا لعرض تفاصيله أو لتوليد خطة إصلاح.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
