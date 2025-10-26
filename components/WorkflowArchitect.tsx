import React, { useState, useEffect } from 'react';
import type { Project, ProjectWorkflow } from '../types';
import { generateProjectCharter, generateWBS, generateWBSFromSchedule } from '../services/geminiService';
import { Bot, Save, Pyramid, X, ChevronDown, ListChecks, Printer } from 'lucide-react';
import { marked } from 'marked';

interface WorkflowArchitectProps {
    project: Project;
    onUpdateWorkflow: (projectId: string, newWorkflow: Partial<ProjectWorkflow>) => void;
}

const CharterGenModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (inputs: Record<string, string>) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [inputs, setInputs] = useState({
        requirements: 'High-quality finishes, completion within 12 months, budget adherence.',
        feasibility: 'Feasibility study completed and approved. Land is secured.',
        stakeholders: 'Owner, Main Contractor, Sub-contractors, Consultants, Local Authorities.',
        risks: 'Potential material delivery delays, unexpected site conditions.'
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(inputs);
    };

    return (
        <div className="modal" style={{ display: 'block' }} onClick={onClose}>
            <div className="modal-content p-8 max-w-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">توليد ميثاق المشروع (AI)</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <p className="mb-4 text-slate-500">أدخل المعلومات الأساسية التالية لمساعدة الذكاء الاصطناعي على إنشاء ميثاق مشروع احترافي.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea name="requirements" value={inputs.requirements} onChange={handleChange} placeholder="المتطلبات عالية المستوى" rows={3} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <textarea name="feasibility" value={inputs.feasibility} onChange={handleChange} placeholder="دراسة الجدوى" rows={3} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <textarea name="stakeholders" value={inputs.stakeholders} onChange={handleChange} placeholder="أصحاب المصلحة الرئيسيون" rows={3} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <textarea name="risks" value={inputs.risks} onChange={handleChange} placeholder="المخاطر الأولية" rows={3} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600">إلغاء</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 rounded-lg bg-indigo-600 text-white flex items-center gap-2">
                             {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Bot size={18}/>}
                            <span>{isLoading ? '...جاري الإنشاء' : 'إنشاء الميثاق'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const baselineProgramTemplate = {
  id: 'baseline',
  name: 'إعداد البرنامج الأساسي (Baseline Program)',
  phases: [
    {
      title: 'الإعداد والهيكلة',
      steps: [
        '1. Introduction', '2. WBS', '3. WBS in P6'
      ]
    },
    {
      title: 'تخطيط الأنشطة',
      steps: [
        '4. Adding Activities', '5. Copy Activities', '6. Coding and assign', '7. Adding and assign Calendar'
      ]
    },
    {
      title: 'تقدير الموارد',
      steps: [
        '8. Assign cost resource', '9. Adding Manpower', '10. Key dates WBS-Dur and Activity types', '11. Engineering -Total Float', '12. Work package -Estimate Durtaion', '13. Finishings&MEPactivities + sequence'
      ]
    },
    {
      title: 'الإنهاء والتقارير',
      steps: [
        '14. Summary of preparing baseline program', '15. Crucial points and remarks', '16. Create Cash flow and manpower Curves', '17. Narrative report'
      ]
    }
  ]
};

export const WorkflowArchitect: React.FC<WorkflowArchitectProps> = ({ project, onUpdateWorkflow }) => {
    const [charter, setCharter] = useState(project.data.workflow?.projectCharter || '');
    const [wbs, setWbs] = useState(project.data.workflow?.wbs || '');
    const [activeTab, setActiveTab] = useState<'charter' | 'wbs'>('charter');
    const [activeTemplate, setActiveTemplate] = useState('lifecycle');
    
    const [baselineNotes, setBaselineNotes] = useState<Record<string, string>>({});
    const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({ [baselineProgramTemplate.phases[0].title]: true });

    const [isCharterGenLoading, setIsCharterGenLoading] = useState(false);
    const [isWbsGenLoading, setIsWbsGenLoading] = useState(false);
    const [isWbsFromScheduleLoading, setIsWbsFromScheduleLoading] = useState(false);
    const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);
    
    useEffect(() => {
        setCharter(project.data.workflow?.projectCharter || '');
        setWbs(project.data.workflow?.wbs || '');
    }, [project]);

    const handleSave = () => {
        const hasChanged = charter !== (project.data.workflow?.projectCharter || '') || wbs !== (project.data.workflow?.wbs || '');
        if (hasChanged) {
            onUpdateWorkflow(project.id, { projectCharter: charter, wbs });
            alert('تم حفظ هيكل العمل!');
        } else {
            alert('لا توجد تغييرات لحفظها.');
        }
    };

    const handleGenerateCharter = async (inputs: Record<string, string>) => {
        setIsCharterGenLoading(true);
        try {
            const result = await generateProjectCharter(project, inputs);
            setCharter(result);
            setIsCharterModalOpen(false);
        } catch (e) {
            alert(`Failed to generate charter: ${(e as Error).message}`);
        } finally {
            setIsCharterGenLoading(false);
        }
    };

    const handleGenerateWBS = async () => {
        if (wbs && !window.confirm('This will overwrite the current WBS. Are you sure?')) return;
        setIsWbsGenLoading(true);
        try {
            const result = await generateWBS(project);
            setWbs(result);
        } catch (e) {
            alert(`Failed to generate WBS: ${(e as Error).message}`);
        } finally {
            setIsWbsGenLoading(false);
        }
    };
    
    const handleGenerateWBSFromSchedule = async () => {
        if (wbs && !window.confirm('This will overwrite the current WBS. Are you sure?')) return;
        if (project.data.schedule.length === 0) {
            alert('لا يمكن إنشاء هيكل WBS من الجدول الزمني لأن الجدول فارغ.');
            return;
        }
        setIsWbsFromScheduleLoading(true);
        try {
            const result = await generateWBSFromSchedule(project.data.schedule);
            setWbs(result);
        } catch (e) {
            alert(`فشل إنشاء هيكل WBS من الجدول الزمني: ${(e as Error).message}`);
        } finally {
            setIsWbsFromScheduleLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const renderLifecycleTemplate = () => (
         <>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6 no-print">
                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
                    <button onClick={() => setActiveTab('charter')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'charter' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                        ميثاق المشروع
                    </button>
                    <button onClick={() => setActiveTab('wbs')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'wbs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                        هيكل تجزئة العمل (WBS)
                    </button>
                </nav>
            </div>
            {renderContent()}
        </>
    );
    
    const renderBaselineTemplate = () => (
        <div className="space-y-4">
            {baselineProgramTemplate.phases.map(phase => (
                <div key={phase.title} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                    <button 
                        onClick={() => setOpenPhases(p => ({ ...p, [phase.title]: !p[phase.title] }))}
                        className="w-full flex justify-between items-center p-4"
                    >
                        <h3 className="text-lg font-semibold">{phase.title}</h3>
                        <ChevronDown className={`transition-transform ${openPhases[phase.title] ? 'rotate-180' : ''}`} />
                    </button>
                    {openPhases[phase.title] && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                             {phase.steps.map(step => (
                                <div key={step} className="mb-4">
                                    <label className="font-medium text-gray-800 dark:text-gray-200">{step}</label>
                                    <textarea 
                                        value={baselineNotes[step] || ''}
                                        onChange={e => setBaselineNotes(prev => ({...prev, [step]: e.target.value}))}
                                        placeholder="...أضف ملاحظاتك هنا"
                                        rows={2}
                                        className="w-full mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                             ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        const isCharter = activeTab === 'charter';
        const content = isCharter ? charter : wbs;
        const setContent = isCharter ? setCharter : setWbs;
        const genLoading = isCharter ? isCharterGenLoading : isWbsGenLoading;
        const handleGen = isCharter ? () => setIsCharterModalOpen(true) : handleGenerateWBS;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="no-print">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">{isCharter ? 'محتوى ميثاق المشروع' : 'محتوى هيكل تجزئة العمل'}</h3>
                        <div className="flex gap-2">
                            {activeTab === 'wbs' && (
                                <button
                                    onClick={handleGenerateWBSFromSchedule}
                                    disabled={isWbsGenLoading || isWbsFromScheduleLoading || project.data.schedule.length === 0}
                                    className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-sky-700 disabled:bg-slate-400 text-sm"
                                >
                                    {isWbsFromScheduleLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Bot size={16} />}
                                    <span>إنشاء من الجدول الزمني</span>
                                </button>
                            )}
                            <button
                                onClick={handleGen}
                                disabled={genLoading || (activeTab === 'wbs' && isWbsFromScheduleLoading)}
                                className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-teal-700 disabled:bg-slate-400 text-sm"
                            >
                               {genLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Bot size={16} />}
                               <span>{isCharter ? 'إنشاء بالذكاء الاصطناعي' : 'إنشاء من الوصف'}</span>
                            </button>
                        </div>
                    </div>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[60vh] bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 font-mono text-sm"
                        placeholder={`أدخل ${isCharter ? 'ميثاق المشروع' : 'هيكل تجزئة العمل'} هنا...`}
                    />
                </div>
                 <div className="printable-area">
                    <h3 className="text-xl font-semibold mb-4">معاينة</h3>
                     <div 
                        className="prose prose-sm dark:prose-invert max-w-none h-[60vh] overflow-y-auto bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                        dangerouslySetInnerHTML={{ __html: marked.parse(content || 'لا يوجد محتوى للعرض.') }} 
                    />
                </div>
            </div>
        );
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3"><Pyramid/>مهندس سير العمل</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        إعداد وإنشاء وثائق ومنهجيات إدارة المشروع الأساسية.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <select 
                        value={activeTemplate}
                        onChange={e => setActiveTemplate(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="lifecycle">دورة حياة إدارة المشروع</option>
                        <option value="baseline">إعداد البرنامج الأساسي</option>
                    </select>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                    {activeTemplate === 'lifecycle' && (
                        <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                            <Save size={18} /><span>حفظ التغييرات</span>
                        </button>
                    )}
                </div>
            </header>
            
            {activeTemplate === 'lifecycle' ? renderLifecycleTemplate() : <div className="printable-area">{renderBaselineTemplate()}</div>}
            
            <CharterGenModal
                isOpen={isCharterModalOpen}
                onClose={() => setIsCharterModalOpen(false)}
                onSubmit={handleGenerateCharter}
                isLoading={isCharterGenLoading}
            />
        </div>
    );
};