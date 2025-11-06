import React, { useState, useMemo } from 'react';
import type { Project, ScheduleTask } from '../types';
import { generateRecoveryPlan } from '../services/geminiService';
import { Bot, File, Printer, AlertTriangle, CheckCircle, Calendar } from '../lucide-icons';
import { marked } from 'marked';
import { GanttChart } from './GanttChart';

interface RecoveryPlannerProps {
    project: Project;
    onUpdateSchedule: (projectId: string, newSchedule: ScheduleTask[]) => void;
}

declare var XLSX: any;

const getStrategyRowClass = (strategy?: ScheduleTask['recoverySuggestion']) => {
    switch (strategy) {
        case 'crashed':
            return 'bg-yellow-50 dark:bg-yellow-900/20';
        case 'fast-tracked':
            return 'bg-blue-50 dark:bg-blue-900/20';
        case 're-sequenced':
            return 'bg-purple-50 dark:bg-purple-900/20';
        default:
            return '';
    }
};

const getStrategyLabel = (strategy?: ScheduleTask['recoverySuggestion']) => {
    switch (strategy) {
        case 'crashed': return 'تكثيف العمل';
        case 'fast-tracked': return 'مسار سريع';
        case 're-sequenced': return 'معاد جدولته';
        default: return 'بدون تغيير';
    }
}

export const RecoveryPlanner: React.FC<RecoveryPlannerProps> = ({ project, onUpdateSchedule }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [plan, setPlan] = useState('');
    const [revisedSchedule, setRevisedSchedule] = useState<ScheduleTask[]>([]);
    
    const defaultEndDate = project.endDate || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0];
    const [newEndDate, setNewEndDate] = useState(defaultEndDate);
    const [newStartDate, setNewStartDate] = useState(project.startDate);


    const { delayedTasks } = useMemo(() => {
        const schedule = project.data.schedule || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const delayed = schedule.filter(task => task.progress < 100 && new Date(task.end) < today);
        
        return { delayedTasks: delayed };
    }, [project.data.schedule]);

    const handleGeneratePlan = async () => {
        if (!newEndDate && !newStartDate) {
            setError("يرجى تحديد تاريخ بدء أو انتهاء جديد للمشروع.");
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan('');
        setRevisedSchedule([]);
        try {
            // If the new start date is different from the project's original start date,
            // we assume a full reschedule is needed.
            const isReschedule = newStartDate !== project.startDate;
            const { plan: newPlan, revisedSchedule: newSchedule } = await generateRecoveryPlan(
                project, 
                newEndDate, 
                isReschedule ? newStartDate : undefined
            );
            setPlan(newPlan);
            setRevisedSchedule(newSchedule);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred during plan generation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApplyPlan = () => {
        if (revisedSchedule.length === 0) return;
        if (window.confirm("هل أنت متأكد من تطبيق هذه الخطة؟ سيتم استبدال الجدول الزمني الحالي بالجدول المعدل.")) {
            onUpdateSchedule(project.id, revisedSchedule);
            alert("تم تطبيق خطة التعافي بنجاح.");
        }
    };
    
    const handleExportXLSX = () => {
        if (revisedSchedule.length === 0) return;
        const dataToExport = revisedSchedule.map(task => ({
            'ID': task.id,
            'المهمة': task.name,
            'البدء الأصلي': task.originalStart,
            'الانتهاء الأصلي': task.originalEnd,
            'البدء المعدل': task.revisedStart,
            'الانتهاء المعدل': task.revisedEnd,
            'الإجراء المقترح': getStrategyLabel(task.recoverySuggestion)
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Recovery Plan");
        XLSX.writeFile(workbook, `recovery_plan_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };


    return (
        <div className="printable-area">
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold">خطة التعافي / إعادة الجدولة</h1>
                    <p className="text-gray-500 mt-1">إنشاء خطة لمعالجة التأخيرات أو إعادة جدولة المشروع.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} disabled={revisedSchedule.length === 0} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400"><File size={18} /><span>تصدير Excel</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600"><Printer size={18} /><span>طباعة / PDF</span></button>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800 mb-8 no-print">
                {delayedTasks.length > 0 && (
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={24} />
                            <div>
                                <h4 className="font-bold">تنبيه: المشروع متأخر</h4>
                                <p>يوجد حاليًا {delayedTasks.length} مهمة متأخرة عن موعدها. يوصى بإنشاء خطة تعافي.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label htmlFor="new-start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">إعادة جدولة من تاريخ بدء جديد</label>
                        <input id="new-start-date" type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg border dark:border-gray-600" />
                    </div>
                    <div className="text-center text-sm font-semibold text-gray-500">أو</div>
                    <div>
                        <label htmlFor="new-end-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">خطة تعافي لتاريخ انتهاء جديد</label>
                        <input id="new-end-date" type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg border dark:border-gray-600" />
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={handleGeneratePlan} disabled={isLoading} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 mx-auto">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Bot size={20} />}
                        <span>{isLoading ? '...جاري إنشاء الخطة' : 'إنشاء الخطة بالذكاء الاصطناعي'}</span>
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded my-4 no-print">{error}</div>}

            {(plan || revisedSchedule.length > 0) && (
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                         <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: marked.parse(plan) }}
                        />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">مقارنة الجدول الزمني</h3>
                            <button onClick={handleApplyPlan} className="no-print flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"><CheckCircle size={18} /><span>تطبيق الخطة</span></button>
                        </div>
                        <div className="overflow-x-auto">
                             <table className="w-full text-right text-sm responsive-table">
                                <thead>
                                    <tr className="border-b dark:border-gray-700"><th className="p-2">المهمة</th><th className="p-2">البدء الأصلي</th><th className="p-2">البدء المعدل</th><th className="p-2">الانتهاء الأصلي</th><th className="p-2">الانتهاء المعدل</th><th className="p-2">الإجراء</th></tr>
                                </thead>
                                <tbody>
                                    {revisedSchedule.map(task => (
                                        <tr key={task.id} className={`border-b dark:border-gray-700 last:border-0 ${getStrategyRowClass(task.recoverySuggestion)}`}>
                                            <td className="p-2 font-medium" data-label="المهمة">{task.name}</td>
                                            <td className="p-2 font-mono" data-label="البدء الأصلي"><del>{task.originalStart}</del></td>
                                            <td className="p-2 font-mono font-semibold" data-label="البدء المعدل">{task.revisedStart}</td>
                                            <td className="p-2 font-mono" data-label="الانتهاء الأصلي"><del>{task.originalEnd}</del></td>
                                            <td className="p-2 font-mono font-semibold" data-label="الانتهاء المعدل">{task.revisedEnd}</td>
                                            <td className="p-2 font-semibold" data-label="الإجراء">{getStrategyLabel(task.recoverySuggestion)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="printable-gantt">
                         <h3 className="text-xl font-bold mb-4">مخطط جانت المعدل</h3>
                         <GanttChart tasks={revisedSchedule} members={project.data.members || []} projectStartDate={project.startDate} cpmResult={null} />
                    </div>
                </div>
            )}
        </div>
    );
};