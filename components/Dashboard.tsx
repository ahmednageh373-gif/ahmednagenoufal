

import React, { useState, useRef } from 'react';
// Fix: Correct import path for types.
import type { Project, FinancialItem, ScheduleTask, ProjectWorkflow } from '../types';
import { GanttChartSquare, DollarSign, ShieldAlert, Target, Upload, Pyramid, File, Printer } from '../lucide-icons';
import { BoqAnalysisModal } from './BoqAnalysisModal';
// Fix: Correct import path for geminiService.
import { extractFinancialItemsFromBOQ, processBoqToSchedule, generateWBS } from '../services/geminiService';

interface DashboardProps {
    project: Project;
    onSelectView: (view: string) => void;
    onUpdateFinancials: (projectId: string, newFinancials: FinancialItem[], fileName: string) => void;
    onUpdateSchedule: (projectId: string, newSchedule: ScheduleTask[]) => void;
    onUpdateWorkflow: (projectId: string, newWorkflow: Partial<ProjectWorkflow>) => void;
}

declare var XLSX: any;

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string; onClick?: () => void }> = ({ title, value, icon: Icon, color, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-6 ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-indigo-500' : ''}`}
    >
        <div className={`p-4 rounded-full ${color}`}>
            <Icon className="text-white" size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ project, onSelectView, onUpdateFinancials, onUpdateSchedule, onUpdateWorkflow }) => {
    const totalTasks = project.data.schedule.length;
    const completedTasks = project.data.schedule.filter(t => t.progress === 100).length;
    const scheduleProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalCost = project.data.financials.reduce((sum, item) => sum + item.total, 0);
    const openRisks = project.data.riskRegister.filter(r => r.status === 'Open').length;
    const totalKRs = project.data.keyResults.length;
    const krProgress = totalKRs > 0 ? Math.round(
        project.data.keyResults.reduce((sum, kr) => {
            const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
            return sum + Math.min(100, progress);
        }, 0) / totalKRs
    ) : 0;

    // BOQ Import State
    const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
    const [boqAnalysisResult, setBoqAnalysisResult] = useState<FinancialItem[]>([]);
    const [boqFileName, setBoqFileName] = useState('');
    const [isAnalyzingBoq, setIsAnalyzingBoq] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [isGeneratingWBS, setIsGeneratingWBS] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

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
            setIsBoqModalOpen(false);
        } finally {
            setIsAnalyzingBoq(false);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleConfirmBoq = async (items: FinancialItem[], fileName: string, generateSchedule: boolean) => {
        onUpdateFinancials(project.id, items, fileName);
        setIsBoqModalOpen(false);

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
    
    const handleGenerateWBS = async () => {
        if (project.data.workflow.wbs && !window.confirm("سيقوم الذكاء الاصطناعي بإنشاء هيكل تجزئة عمل (WBS) جديد. قد يتم استبدال أي هيكل حالي في قسم 'هيكلة العمل'. هل تريد المتابعة؟")) {
            return;
        }
        setIsGeneratingWBS(true);
        try {
            const wbsResult = await generateWBS(project);
            onUpdateWorkflow(project.id, { wbs: wbsResult });
            alert('تم إنشاء هيكل تجزئة العمل بنجاح! يمكنك مراجعته وتعديله في قسم "هيكلة العمل".');
            onSelectView('workflow'); // Navigate to the workflow view
        } catch (error) {
            console.error("WBS Generation failed:", error);
            alert(`Failed to generate WBS: ${(error as Error).message}`);
        } finally {
            setIsGeneratingWBS(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportXLSX = () => {
        const upcomingTasksData = project.data.schedule
            .filter(t => t.status !== 'Done')
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 5)
            .map(task => ({
                'المهمة': task.name,
                'تاريخ البدء': task.start,
            }));

        const topRisksData = project.data.riskRegister
            .filter(r => r.status === 'Open' && r.impact === 'High')
            .slice(0, 5)
            .map(risk => ({
                'الخطر': risk.description,
                'الاحتمالية': risk.probability,
                'التأثير': risk.impact,
            }));

        const tasksSheet = XLSX.utils.json_to_sheet(upcomingTasksData);
        const risksSheet = XLSX.utils.json_to_sheet(topRisksData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, tasksSheet, "Upcoming Tasks");
        XLSX.utils.book_append_sheet(workbook, risksSheet, "Top Risks");
        XLSX.writeFile(workbook, `dashboard_${project.name.replace(/\s/g, '_')}.xlsx`);
    };


    return (
        <div className="printable-area">
            <header className="mb-8 flex justify-between items-center flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        نظرة عامة على مشروع: <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                        <File size={18} /><span>تصدير Excel</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isGeneratingSchedule || isGeneratingWBS} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400">
                        {isGeneratingSchedule ? (
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Upload size={18} />
                        )}
                        <span>{isGeneratingSchedule ? 'جاري إنشاء الجدول...' : 'استيراد مقايسة'}</span>
                    </button>
                     <button onClick={handleGenerateWBS} disabled={isGeneratingSchedule || isGeneratingWBS} className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400">
                        {isGeneratingWBS ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                           <Pyramid size={18} />
                        )}
                        <span>{isGeneratingWBS ? 'جاري الإنشاء...' : 'اقترح هيكل WBS (AI)'}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="تقدم الجدول الزمني" value={`${scheduleProgress}%`} icon={GanttChartSquare} color="bg-sky-500" onClick={() => onSelectView('schedule')} />
                <StatCard title="التكلفة الإجمالية" value={`${totalCost.toLocaleString('ar-SA')} SAR`} icon={DollarSign} color="bg-green-500" onClick={() => onSelectView('financials')} />
                <StatCard title="المخاطر المفتوحة" value={String(openRisks)} icon={ShieldAlert} color="bg-red-500" onClick={() => onSelectView('risks')} />
                <StatCard title="تقدم الأهداف (OKRs)" value={`${krProgress}%`} icon={Target} color="bg-indigo-500" onClick={() => onSelectView('okrs')} />
            </div>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                     <h3 className="text-xl font-semibold mb-4">المهام القادمة</h3>
                     <div className="space-y-3">
                        {project.data.schedule
                            .filter(t => t.status !== 'Done')
                            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                            .slice(0, 5)
                            .map(task => (
                                <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="font-medium">{task.name}</p>
                                    <p className="text-sm text-gray-500">تاريخ البدء: {task.start}</p>
                                </div>
                            ))
                        }
                         {project.data.schedule.filter(t => t.status !== 'Done').length === 0 && <p className="text-gray-500">لا توجد مهام قادمة.</p>}
                     </div>
                </div>
                 <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xl font-semibold mb-4">أعلى المخاطر</h3>
                    <div className="space-y-3">
                        {project.data.riskRegister
                            .filter(r => r.status === 'Open' && r.impact === 'High')
                            .slice(0, 5)
                            .map(risk => (
                                 <div key={risk.id} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                    <p className="font-medium">{risk.description}</p>
                                     <p className="text-sm text-red-700 dark:text-red-300">الاحتمالية: {risk.probability}, التأثير: {risk.impact}</p>
                                </div>
                            ))
                        }
                         {project.data.riskRegister.filter(r => r.status === 'Open' && r.impact === 'High').length === 0 && <p className="text-gray-500">لا توجد مخاطر عالية مفتوحة.</p>}
                    </div>
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

        </div>
    );
};
