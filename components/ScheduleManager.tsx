import React, { useState, useMemo, useCallback } from 'react';
// Fix: Correct import path for types.
import type { Project, ScheduleTask, WhatIfAnalysisResult, CriticalPathAnalysis } from '../types';
import { GanttChart } from './GanttChart';
import { TaskModal } from './TaskModal';
import { SubTaskGeneratorModal } from './SubTaskGeneratorModal';
import { ScheduleImportModal } from './ScheduleImportModal';
import { WhatIfModal } from './WhatIfModal';
import { performWhatIfAnalysis, calculateCriticalPath } from '../services/geminiService';
import { Bot, Plus, Calendar, File, Printer, Upload, BarChart, CalendarDays, Hash, Network } from 'lucide-react';

interface ScheduleManagerProps {
    project: Project;
    onUpdateSchedule: (projectId: string, newSchedule: ScheduleTask[]) => void;
}

declare var XLSX: any;

// Helper function for recovery plan sheet
const getStrategyLabel = (strategy?: ScheduleTask['recoverySuggestion']) => {
    switch (strategy) {
        case 'crashed': return 'تكثيف العمل';
        case 'fast-tracked': return 'مسار سريع';
        case 're-sequenced': return 'معاد جدولته';
        case 'unchanged': return 'بدون تغيير';
        default: return 'N/A';
    }
};

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | number }> = ({ icon: Icon, label, value }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg flex items-center gap-4">
        <Icon className="w-6 h-6 text-indigo-500" />
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ project, onUpdateSchedule }) => {
    const schedule = project.data.schedule || [];
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importedTasks, setImportedTasks] = useState<ScheduleTask[]>([]);
    const [importFileName, setImportFileName] = useState('');
    const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);

    // What-If Analysis State
    const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
    const [whatIfResult, setWhatIfResult] = useState<WhatIfAnalysisResult | null>(null);
    const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);
    
    // Critical Path Method State
    const [cpmResult, setCpmResult] = useState<CriticalPathAnalysis | null>(null);
    const [isCpmLoading, setIsCpmLoading] = useState(false);
    
    const projectMetrics = useMemo(() => {
        if (schedule.length === 0) {
            return {
                totalTasks: 0,
                overallDuration: 0,
                startDate: project.startDate,
                endDate: project.endDate || project.startDate,
            };
        }
        const startDates = schedule.map(t => new Date(t.start).getTime());
        const endDates = schedule.map(t => new Date(t.end).getTime());
        const minDate = new Date(Math.min(...startDates));
        const maxDate = new Date(Math.max(...endDates));
        const duration = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return {
            totalTasks: schedule.length,
            overallDuration: cpmResult?.projectDuration || duration,
            startDate: minDate.toISOString().split('T')[0],
            endDate: maxDate.toISOString().split('T')[0],
        };
    }, [schedule, project.startDate, project.endDate, cpmResult]);

    const handleOpenTaskModalForAdd = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const handleOpenTaskModalForEdit = useCallback((task: ScheduleTask) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    }, []);
    
    const handleSaveTask = (taskData: Omit<ScheduleTask, 'id'> | ScheduleTask) => {
        let newSchedule: ScheduleTask[];
        if ('id' in taskData) { // Editing existing task
            newSchedule = schedule.map(t => t.id === taskData.id ? taskData : t);
        } else { // Adding new task
            const newId = schedule.length > 0 ? Math.max(...schedule.map(t => t.id)) + 1 : 1;
            const newTask: ScheduleTask = { ...taskData, id: newId };
            newSchedule = [...schedule, newTask];
        }
        onUpdateSchedule(project.id, newSchedule);
    };

    const handleDeleteTask = useCallback((taskId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            // Also remove this task from any dependencies lists
            const newSchedule = schedule
                .filter(t => t.id !== taskId)
                .map(t => ({
                    ...t,
                    dependencies: t.dependencies.filter(depId => depId !== taskId)
                }));
            onUpdateSchedule(project.id, newSchedule);
        }
    }, [project.id, schedule, onUpdateSchedule]);
    
    const handleAddGeneratedTasks = (generatedTasks: { name: string; duration: number; predecessors: string[] }[]) => {
        let currentSchedule = [...schedule];
        let maxId = currentSchedule.length > 0 ? Math.max(...currentSchedule.map(t => t.id)) : 0;
        
        const newTasks: ScheduleTask[] = [];
        const nameToIdMap: Record<string, number> = {};

        // First pass: create tasks and map names to new IDs
        generatedTasks.forEach(genTask => {
            maxId++;
            const newTask: Omit<ScheduleTask, 'start' | 'end' | 'dependencies'> & { dependencies: string[] } = {
                id: maxId,
                name: genTask.name,
                progress: 0,
                dependencies: genTask.predecessors,
                category: 'Generated',
                status: 'To Do',
                priority: 'Medium',
                assignees: []
            };
            newTasks.push(newTask as any); // Temporarily cast to add to list
            nameToIdMap[genTask.name] = maxId;
        });

        // Second pass: resolve dependencies and dates
        const finalNewTasks = newTasks.map((newTask, index) => {
            const genTask = generatedTasks[index];
            const dependencies = genTask.predecessors.map(pName => nameToIdMap[pName]).filter(Boolean);
            
            let startDate = new Date(project.startDate);
            if (dependencies.length > 0) {
                const predecessorEndDates = dependencies.map(depId => {
                    const predecessor = currentSchedule.find(t => t.id === depId) || newTasks.find(t => t.id === depId);
                    // This is a simplified date logic, might need refinement
                    return predecessor ? new Date((predecessor as any).end || project.startDate) : new Date(project.startDate);
                });
                startDate = new Date(Math.max(...predecessorEndDates.map(d => d.getTime())));
                startDate.setDate(startDate.getDate() + 1); // Start the day after
            }

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (genTask.duration - 1));

            return {
                ...(newTask as ScheduleTask),
                dependencies: dependencies,
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
            };
        });

        onUpdateSchedule(project.id, [...currentSchedule, ...finalNewTasks]);
    };
    
    const handleScheduleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImportFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const tasks: ScheduleTask[] = json.map((row, index) => {
                    // Handle Excel's date format (serial number)
                    const excelDateToJSDate = (serial: number) => new Date(Date.UTC(0, 0, serial - 1));
                    const startDate = typeof row['تاريخ البدء'] === 'number' ? excelDateToJSDate(row['تاريخ البدء']).toISOString().split('T')[0] : row['تاريخ البدء'];
                    const endDate = typeof row['تاريخ الانتهاء'] === 'number' ? excelDateToJSDate(row['تاريخ الانتهاء']).toISOString().split('T')[0] : row['تاريخ الانتهاء'];

                    return {
                        id: row['ID'] || index + 1,
                        name: row['المهمة'] || 'مهمة غير مسماة',
                        start: startDate,
                        end: endDate,
                        progress: row['التقدم'] || 0,
                        dependencies: row['الاعتماديات'] ? String(row['الاعتماديات']).split(',').map(Number).filter(n => !isNaN(n)) : [],
                        category: row['الفئة'] || 'مستورد',
                        status: row['الحالة'] || 'To Do',
                        priority: row['الأولوية'] || 'Medium',
                        assignees: row['المسؤولون'] ? String(row['المسؤولون']).split(',').map(s => s.trim()) : [],
                    };
                });

                setImportedTasks(tasks);
                setIsImportModalOpen(true);

            } catch (error) {
                alert(`فشل في قراءة الملف: ${(error as Error).message}`);
            }
        };
        reader.readAsBinaryString(file);
        event.target.value = ''; // Reset file input
    };

    const handleConfirmImport = (tasks: ScheduleTask[]) => {
        onUpdateSchedule(project.id, tasks);
        setIsImportModalOpen(false);
    };

    const handleExportXLSX = () => {
        if (schedule.length === 0) return;
        const wb = XLSX.utils.book_new();

        // --- Sheet 1: Cover Page ---
        const coverData = [
            ["اسم المشروع:", project.name],
            ["الوصف:", project.description],
            ["تاريخ الإنشاء:", new Date().toLocaleDateString('ar-SA')],
            [],
            ["إجمالي المهام:", projectMetrics.totalTasks],
            ["المدة الكلية (أيام):", projectMetrics.overallDuration],
            ["تاريخ البدء:", projectMetrics.startDate],
            ["تاريخ الانتهاء:", projectMetrics.endDate],
        ];
        const coverWs = XLSX.utils.aoa_to_sheet(coverData);
        coverWs['!cols'] = [{ wch: 20 }, { wch: 50 }];
        // Simple styling
        coverWs['A1'].s = { font: { bold: true } };
        coverWs['A2'].s = { font: { bold: true } };
        XLSX.utils.book_append_sheet(wb, coverWs, "Cover Page");


        // --- Sheet 2: Data Sheet ---
        const dataToExport = schedule.map(t => ({
            'WBS': t.wbsCode || '-',
            'ID': t.id,
            'Activity Name': t.name,
            'Duration': Math.ceil((new Date(t.end).getTime() - new Date(t.start).getTime()) / (1000 * 60 * 60 * 24)) + 1,
            'Start Date': t.start,
            'End Date': t.end,
            'Predecessors': t.dependencies.join(', '),
            'Resources': (t.resourcesNeeded || []).join(', ')
        }));
        const dataWs = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, dataWs, "Schedule Data");

        // --- Sheet 3: Visual Gantt ---
        const ganttHeaderStyle = { font: { bold: true, color: { rgb: "FFFFFFFF" } }, fill: { fgColor: { rgb: "FF1F4E78" } } };
        const taskNameStyle = { font: { bold: true } };
        const weekendStyle = { fill: { fgColor: { rgb: "FFF1F5F9" } } };
        const taskBarStyle = { fill: { fgColor: { rgb: "FF3B82F6" } } };
        const progressBarStyle = { fill: { fgColor: { rgb: "FF60A5FA" } } };
        
        const dates = schedule.flatMap(t => [new Date(t.start), new Date(t.end)]);
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        let currentDate = new Date(minDate);
        const dateHeaders: Date[] = [];
        while (currentDate <= maxDate) {
            dateHeaders.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const aoa: any[][] = [];
        const mainHeaders = ["المهمة", "تاريخ البدء", "تاريخ الانتهاء"];
        const timelineHeaders = dateHeaders.map(d => d.toLocaleDateString('ar-SA', { day: '2-digit', month: 'short' }));
        aoa.push([...mainHeaders, ...timelineHeaders]);

        schedule.forEach(task => {
            const row = [task.name, task.start, task.end];
            aoa.push([...row, ...dateHeaders.map(() => '')]);
        });
        
        const ganttWs = XLSX.utils.aoa_to_sheet(aoa);

        Object.keys(ganttHeaderStyle).length > 0 && XLSX.utils.sheet_add_aoa(ganttWs, [[]], { origin: -1 }); // dummy call to satisfy types
        for (let C = 0; C < mainHeaders.length + dateHeaders.length; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (ganttWs[cellAddress]) ganttWs[cellAddress].s = ganttHeaderStyle;
        }

        schedule.forEach((task, i) => {
            const rowIndex = i + 1;
            ganttWs[`A${rowIndex}`].s = taskNameStyle;
            const taskStart = new Date(task.start);
            const taskEnd = new Date(task.end);
            dateHeaders.forEach((headerDate, j) => {
                const colIndex = mainHeaders.length + j;
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                const day = headerDate.getDay();
                if (day === 4 || day === 5) {
                    ganttWs[cellAddress] = ganttWs[cellAddress] || {};
                    ganttWs[cellAddress].s = weekendStyle;
                }
                if (headerDate >= taskStart && headerDate <= taskEnd) {
                    ganttWs[cellAddress] = ganttWs[cellAddress] || {};
                    const progressWidth = (task.progress / 100);
                    const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
                    const daysFromStart = (headerDate.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);
                    if (daysFromStart < taskDuration * progressWidth) {
                        ganttWs[cellAddress].s = progressBarStyle;
                    } else {
                        ganttWs[cellAddress].s = taskBarStyle;
                    }
                }
            });
        });
        
        ganttWs['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 12 }, ...dateHeaders.map(() => ({ wch: 10 }))];
        XLSX.utils.book_append_sheet(wb, ganttWs, 'Visual Gantt Chart');
        
        XLSX.writeFile(wb, `professional_schedule_${project.name.replace(/\s/g, '_')}.xlsx`);
    };


    const handlePrint = () => {
        window.print();
    };

    const handlePerformWhatIfAnalysis = async (query: string) => {
        if (schedule.length === 0) {
            alert("لا يمكن إجراء التحليل على جدول زمني فارغ.");
            return;
        }
        setIsWhatIfLoading(true);
        setWhatIfResult(null);
        try {
            const result = await performWhatIfAnalysis(schedule, query);
            setWhatIfResult(result);
        } catch (e) {
            alert(`فشل تحليل "ماذا لو؟": ${(e as Error).message}`);
        } finally {
            setIsWhatIfLoading(false);
        }
    };

    const handleAnalyzeCPM = async () => {
        if (schedule.length === 0) {
            alert("لا يمكن تحليل المسار الحرج لجدول فارغ.");
            return;
        }
        setIsCpmLoading(true);
        try {
            const result = await calculateCriticalPath(schedule);
            setCpmResult(result);
            alert(`تم تحليل المسار الحرج بنجاح. المدة الجديدة للمشروع هي ${result.projectDuration} يوم. تم تلوين المهام الحرجة باللون الأحمر.`);
        } catch (e) {
            alert(`فشل تحليل المسار الحرج: ${(e as Error).message}`);
            setCpmResult(null);
        } finally {
            setIsCpmLoading(false);
        }
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الجدول الزمني</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        تخطيط وتتبع المهام لمشروع: <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                     <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                        <File size={18} /><span>تصدير Excel احترافي</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                     <label className="flex items-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 cursor-pointer">
                        <Upload size={18} />
                        <span>استيراد جدول زمني</span>
                        <input type="file" onChange={handleScheduleImport} accept=".xlsx, .xls" className="hidden" />
                    </label>
                    <button onClick={handleAnalyzeCPM} disabled={isCpmLoading} className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-slate-400">
                        {isCpmLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Network size={18} />}
                        <span>{isCpmLoading ? '...جارٍ التحليل' : 'تحليل المسار الحرج'}</span>
                    </button>
                    <button onClick={() => setIsWhatIfModalOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700">
                        <Bot size={18} /><span>تحليل "ماذا لو؟" (AI)</span>
                    </button>
                    <button onClick={() => setIsSubTaskModalOpen(true)} className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700">
                        <Bot size={18} /><span>إنشاء مهام فرعية (AI)</span>
                    </button>
                    <button onClick={handleOpenTaskModalForAdd} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">
                        <Plus size={18} /><span>إضافة مهمة</span>
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 no-print">
                <StatCard icon={Hash} label="إجمالي المهام" value={projectMetrics.totalTasks} />
                <StatCard icon={CalendarDays} label="المدة الكلية (أيام)" value={projectMetrics.overallDuration} />
                <StatCard icon={Calendar} label="تاريخ البدء" value={projectMetrics.startDate} />
                <StatCard icon={Calendar} label="تاريخ الانتهاء" value={projectMetrics.endDate} />
            </div>

            <div className="overflow-x-auto">
                 <div className="min-w-[1000px] printable-gantt">
                    <GanttChart 
                        tasks={schedule} 
                        projectStartDate={project.startDate}
                        onEditTask={handleOpenTaskModalForEdit}
                        onDeleteTask={handleDeleteTask}
                        cpmResult={cpmResult}
                    />
                 </div>
            </div>
            
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                task={editingTask}
                allTasks={schedule}
            />

            <SubTaskGeneratorModal
                isOpen={isSubTaskModalOpen}
                onClose={() => setIsSubTaskModalOpen(false)}
                onAddTasks={handleAddGeneratedTasks}
            />
            
            <ScheduleImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onConfirm={handleConfirmImport}
                tasks={importedTasks}
                fileName={importFileName}
            />

            <WhatIfModal
                isOpen={isWhatIfModalOpen}
                onClose={() => { setIsWhatIfModalOpen(false); setWhatIfResult(null); }}
                onAnalyze={handlePerformWhatIfAnalysis}
                isLoading={isWhatIfLoading}
                result={whatIfResult}
            />
        </div>
    );
};
