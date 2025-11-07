import React, { useState, useMemo, useRef } from 'react';
// Fix: Correct import path for types.
import type { ScheduleTask, CriticalPathAnalysis, ProjectMember } from '../types';
import { MoreHorizontal, User, Circle, CheckCircle, Clock, TrendingUp, TrendingDown, Minus, Eye, EyeOff, Info } from 'lucide-react';
import { TaskContextMenu } from './TaskContextMenu';

// A type for tasks that have been processed to include calculated values
export interface ProcessedScheduleTask extends ScheduleTask {
    startDay: number;
    duration: number;
    originalStartDay?: number;
    originalDuration?: number;
    baselineStartDay?: number;
    baselineDuration?: number;
    variance?: 'ahead' | 'behind' | 'on-track';
    varianceDays?: number;
}

interface GanttChartProps {
    tasks: ScheduleTask[];
    members: ProjectMember[];
    projectStartDate: string;
    onEditTask?: (task: ScheduleTask) => void;
    onDeleteTask?: (taskId: number) => void;
    cpmResult: CriticalPathAnalysis | null;
}

const DAY_WIDTH = 35; // px

const getDaysDiff = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const getStatusIcon = (status?: 'To Do' | 'In Progress' | 'Done') => {
    switch (status) {
        case 'Done': return <CheckCircle size={16} className="text-green-500" />;
        case 'In Progress': return <Clock size={16} className="text-sky-500 animate-spin [animation-duration:3s]" />;
        case 'To Do':
        default: return <Circle size={16} className="text-slate-400" />;
    }
};

const getPriorityColor = (priority?: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
        case 'High': return 'border-red-500';
        case 'Medium': return 'border-yellow-500';
        case 'Low':
        default: return 'border-slate-300';
    }
};

const getBarStatusColors = (status?: 'To Do' | 'In Progress' | 'Done') => {
    switch (status) {
        case 'Done':
            return {
                bg: 'bg-green-100 dark:bg-green-500/10 group-hover:bg-green-200 dark:group-hover:bg-green-500/20',
                fill: 'bg-green-500',
            };
        case 'In Progress':
            return {
                bg: 'bg-sky-100 dark:bg-sky-500/10 group-hover:bg-sky-200 dark:group-hover:bg-sky-500/20',
                fill: 'bg-sky-500',
            };
        case 'To Do':
        default:
            return {
                bg: 'bg-slate-200 dark:bg-slate-700/30 group-hover:bg-slate-300 dark:group-hover:bg-slate-700/50',
                fill: 'bg-slate-500 dark:bg-slate-400',
            };
    }
};

const getBarPriorityClass = (priority?: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
        case 'High':
            return 'border-r-4 border-red-500';
        case 'Medium':
            return 'border-r-4 border-yellow-500';
        case 'Low':
        default:
            return '';
    }
};

const getVarianceIcon = (variance?: 'ahead' | 'behind' | 'on-track', days?: number) => {
    if (!variance || days === undefined) return null;
    
    switch (variance) {
        case 'ahead':
            return (
                <div className="flex items-center gap-1 text-green-600" title={`متقدم ${Math.abs(days)} يوم`}>
                    <TrendingUp size={14} />
                    <span className="text-xs font-medium">{Math.abs(days)}د</span>
                </div>
            );
        case 'behind':
            return (
                <div className="flex items-center gap-1 text-red-600" title={`متأخر ${days} يوم`}>
                    <TrendingDown size={14} />
                    <span className="text-xs font-medium">{days}د</span>
                </div>
            );
        case 'on-track':
            return (
                <div className="flex items-center gap-1 text-blue-600" title="في المسار الصحيح">
                    <Minus size={14} />
                </div>
            );
        default:
            return null;
    }
};

export const GanttChart: React.FC<GanttChartProps> = React.memo(({ tasks, members, projectStartDate, onEditTask, onDeleteTask, cpmResult }) => {
    const [activeMenuTaskId, setActiveMenuTaskId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
    const [showBaseline, setShowBaseline] = useState(true);
    const [showVarianceIndicators, setShowVarianceIndicators] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineHeaderRef = useRef<HTMLDivElement>(null);
    const listBodyRef = useRef<HTMLDivElement>(null);
    const timelineBodyRef = useRef<HTMLDivElement>(null);


    const { processedTasks, projectDuration, startDate, months, days } = useMemo(() => {
        if (tasks.length === 0) {
            return { processedTasks: [], projectDuration: 30, startDate: new Date(projectStartDate), months: [], days: [] };
        }

        const validTasks = tasks.filter(t => t.start && t.end && !isNaN(new Date(t.start).getTime()) && !isNaN(new Date(t.end).getTime()));
        
        const allDates = validTasks.flatMap(t => {
            const dates = [new Date(t.start).getTime(), new Date(t.end).getTime()];
            if (t.originalStart) dates.push(new Date(t.originalStart).getTime());
            if (t.originalEnd) dates.push(new Date(t.originalEnd).getTime());
            if (t.baselineStart) dates.push(new Date(t.baselineStart).getTime());
            if (t.baselineEnd) dates.push(new Date(t.baselineEnd).getTime());
            return dates;
        });
        
        if (allDates.length === 0) allDates.push(new Date(projectStartDate).getTime());

        const startDate = new Date(Math.min(...allDates));
        startDate.setDate(startDate.getDate() - 7); // Add padding
        const endDate = new Date(Math.max(...allDates));
        endDate.setDate(endDate.getDate() + 7); // Add padding

        const projectDuration = getDaysDiff(endDate, startDate) + 1;

        const processedTasks: ProcessedScheduleTask[] = validTasks.map(task => {
            const taskStart = new Date(task.start);
            const taskEnd = new Date(task.end);
            const startDay = getDaysDiff(taskStart, startDate);
            const duration = getDaysDiff(taskEnd, taskStart) + 1;
            
            const originalStartDay = task.originalStart ? getDaysDiff(new Date(task.originalStart), startDate) : undefined;
            const originalDuration = (task.originalStart && task.originalEnd) ? getDaysDiff(new Date(task.originalEnd), new Date(task.originalStart)) + 1 : undefined;

            // Baseline calculation (prefer baselineStart/End, fallback to originalStart/End)
            const baselineStartDate = task.baselineStart || task.originalStart;
            const baselineEndDate = task.baselineEnd || task.originalEnd;
            const baselineStartDay = baselineStartDate ? getDaysDiff(new Date(baselineStartDate), startDate) : undefined;
            const baselineDuration = (baselineStartDate && baselineEndDate) ? getDaysDiff(new Date(baselineEndDate), new Date(baselineStartDate)) + 1 : undefined;

            // Calculate variance
            let variance: 'ahead' | 'behind' | 'on-track' | undefined;
            let varianceDays: number | undefined;
            if (baselineEndDate) {
                const actualEnd = new Date(task.end);
                const plannedEnd = new Date(baselineEndDate);
                varianceDays = getDaysDiff(actualEnd, plannedEnd);
                
                if (Math.abs(varianceDays) <= 2) {
                    variance = 'on-track';
                } else if (varianceDays < 0) {
                    variance = 'ahead'; // Finishing earlier than planned
                } else {
                    variance = 'behind'; // Finishing later than planned
                }
            }

            return { ...task, startDay, duration, originalStartDay, originalDuration, baselineStartDay, baselineDuration, variance, varianceDays };
        }).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        // Generate month and day headers
        const months = [];
        const days = [];
        let loopDate = new Date(startDate);
        let currentMonth = -1;
        while (loopDate <= endDate) {
            if(loopDate.getMonth() !== currentMonth) {
                 months.push({
                    name: loopDate.toLocaleString('ar-SA', { month: 'long', year: 'numeric' }),
                    startDay: getDaysDiff(loopDate, startDate)
                });
                currentMonth = loopDate.getMonth();
            }
             days.push({
                date: new Date(loopDate),
                dayNumber: loopDate.getDate()
            });
            loopDate.setDate(loopDate.getDate() + 1);
        }

        return { processedTasks, projectDuration, startDate, months, days };
    }, [tasks, projectStartDate]);
    
    const { highlightedTaskIds, dependencyLinks } = useMemo(() => {
        if (!hoveredTaskId) {
            return { highlightedTaskIds: new Set<number>(), dependencyLinks: [] };
        }

        const highlightedIds = new Set<number>([hoveredTaskId]);
        const links: { key: string; d: string }[] = [];
        const hoveredTask = processedTasks.find(t => t.id === hoveredTaskId);
        if (!hoveredTask) return { highlightedTaskIds, dependencyLinks: [] };

        const hoveredTaskIndex = processedTasks.findIndex(t => t.id === hoveredTaskId);
        const y1 = hoveredTaskIndex * 48 + 24; // Y center of hovered task bar

        // Find predecessors (dependencies of hovered task)
        hoveredTask.dependencies.forEach(depId => {
            const predecessorTask = processedTasks.find(t => t.id === depId);
            if (predecessorTask) {
                highlightedIds.add(depId);
                const predecessorIndex = processedTasks.findIndex(t => t.id === depId);
                const y2 = predecessorIndex * 48 + 24;
                const x1 = (predecessorTask.startDay + predecessorTask.duration) * DAY_WIDTH;
                const x2 = hoveredTask.startDay * DAY_WIDTH;
                
                const d = `M ${x1} ${y2} C ${x1 + 40} ${y2}, ${x2 - 40} ${y1}, ${x2} ${y1}`;
                links.push({ key: `${depId}-${hoveredTaskId}`, d });
            }
        });

        // Find successors (tasks that depend on hovered task)
        processedTasks.forEach((successorTask, successorIndex) => {
            if (successorTask.dependencies.includes(hoveredTaskId)) {
                highlightedIds.add(successorTask.id);
                const y2 = successorIndex * 48 + 24;
                const x1 = (hoveredTask.startDay + hoveredTask.duration) * DAY_WIDTH;
                const x2 = successorTask.startDay * DAY_WIDTH;

                const d = `M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`;
                links.push({ key: `${hoveredTaskId}-${successorTask.id}`, d });
            }
        });

        return { highlightedTaskIds: highlightedIds, dependencyLinks: links };

    }, [hoveredTaskId, processedTasks]);


    const handleMenuClick = (event: React.MouseEvent, taskId: number) => {
        event.stopPropagation();
        if (!onEditTask || !onDeleteTask) return; // Don't show menu if handlers are missing
        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        
        if(containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom - containerRect.top + 8, // Position below the button
                right: containerRect.right - rect.right - (144 / 2) + (rect.width / 2), // Center the menu (144 is menu width)
            });
            setActiveMenuTaskId(taskId === activeMenuTaskId ? null : taskId);
        }
    };
    
     const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (listBodyRef.current && timelineBodyRef.current) {
            listBodyRef.current.scrollTop = target.scrollTop;
            timelineBodyRef.current.scrollTop = target.scrollTop;
        }
        if (timelineHeaderRef.current) {
            timelineHeaderRef.current.scrollLeft = target.scrollLeft;
        }
    };

    if (tasks.length === 0) {
        return <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg">لا توجد مهام لعرضها.</div>;
    }

    const todayPosition = getDaysDiff(new Date(), startDate);

    // Calculate baseline statistics
    const baselineStats = useMemo(() => {
        const tasksWithBaseline = processedTasks.filter(t => t.baselineStartDay !== undefined);
        const ahead = tasksWithBaseline.filter(t => t.variance === 'ahead').length;
        const behind = tasksWithBaseline.filter(t => t.variance === 'behind').length;
        const onTrack = tasksWithBaseline.filter(t => t.variance === 'on-track').length;
        return { total: tasksWithBaseline.length, ahead, behind, onTrack };
    }, [processedTasks]);

    return (
        <div ref={containerRef} className="gantt-container bg-white dark:bg-gray-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 w-full overflow-hidden relative">
            {/* Baseline Controls */}
            {baselineStats.total > 0 && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">مقارنة الأساس</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-700 dark:text-green-400">{baselineStats.ahead} متقدم</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Minus className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-700 dark:text-blue-400">{baselineStats.onTrack} في المسار</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                <span className="font-medium text-red-700 dark:text-red-400">{baselineStats.behind} متأخر</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowBaseline(!showBaseline)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                showBaseline 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                            }`}
                        >
                            {showBaseline ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span className="text-sm font-medium">{showBaseline ? 'إخفاء الأساس' : 'إظهار الأساس'}</span>
                        </button>
                        <button
                            onClick={() => setShowVarianceIndicators(!showVarianceIndicators)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                showVarianceIndicators 
                                    ? 'bg-purple-600 text-white shadow-md' 
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">{showVarianceIndicators ? 'إخفاء التباين' : 'إظهار التباين'}</span>
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex">
                {/* Task List (Left Side) */}
                <div className="w-[580px] border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                    <div className="h-20 flex items-center p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <div className="flex-grow font-semibold text-sm">المهمة</div>
                        <div className="w-20 font-semibold text-sm text-center">المسؤول</div>
                        <div className="w-16 font-semibold text-sm text-center">الحالة</div>
                        {showVarianceIndicators && baselineStats.total > 0 && (
                            <div className="w-16 font-semibold text-sm text-center">التباين</div>
                        )}
                        <div className="w-10"></div>
                    </div>
                    <div ref={listBodyRef} className="overflow-y-hidden" style={{ height: `${processedTasks.length * 48}px` }}>
                        {processedTasks.map(task => {
                            const assignees = members.filter(m => task.assignees?.includes(m.id));
                            return (
                                <div
                                    key={task.id}
                                    className={`flex items-center p-3 h-12 border-b border-gray-100 dark:border-gray-800 transition-colors ${
                                        highlightedTaskIds.has(task.id) ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                                    }`}
                                >
                                    <div className={`flex-grow truncate text-sm flex items-center gap-2 border-r-4 pr-2 ${getPriorityColor(task.priority)}`}>
                                        <span className="font-mono text-xs text-slate-400">{task.id}</span>
                                        <span className="truncate">{task.name}</span>
                                    </div>
                                    <div className="w-20 flex justify-center items-center -space-x-2">
                                        {assignees.slice(0,3).map(member => (
                                             <div key={member.id} title={member.name} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-indigo-600 border-2 border-white dark:border-gray-900">
                                                {member.name.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-16 flex justify-center">{getStatusIcon(task.status)}</div>
                                    {showVarianceIndicators && baselineStats.total > 0 && (
                                        <div className="w-16 flex justify-center">
                                            {getVarianceIcon(task.variance, task.varianceDays)}
                                        </div>
                                    )}
                                    <div className="w-10 flex justify-center">
                                        {onEditTask && onDeleteTask && (
                                            <button onClick={(e) => handleMenuClick(e, task.id)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline (Right Side) */}
                <div className="flex-grow overflow-x-auto" onScroll={handleScroll}>
                    <div ref={timelineHeaderRef} className="h-20 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10" style={{ width: `${projectDuration * DAY_WIDTH}px` }}>
                        {/* Month Headers */}
                        <div className="h-10 flex border-b border-gray-200 dark:border-gray-800">
                            {months.map((month, i) => (
                                <div key={i} className="flex items-center justify-center font-semibold text-sm border-l border-gray-200 dark:border-gray-800" style={{ width: `${(days.filter(d => d.date.toLocaleString('ar-SA', {month:'long', year:'numeric'}) === month.name).length) * DAY_WIDTH}px` }}>
                                    {month.name}
                                </div>
                            ))}
                        </div>
                        {/* Day Headers */}
                        <div className="h-10 flex">
                            {days.map((day, i) => {
                                const isWeekend = day.date.getDay() === 4 || day.date.getDay() === 5; // Thurs, Fri
                                return (
                                    <div key={i} className={`w-[${DAY_WIDTH}px] h-full flex items-center justify-center text-xs border-l border-gray-200 dark:border-gray-800 ${isWeekend ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`}>
                                        {day.dayNumber}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div ref={timelineBodyRef} className="relative" style={{ width: `${projectDuration * DAY_WIDTH}px`, height: `${processedTasks.length * 48}px` }}>
                         {/* Grid Lines */}
                        {days.map((_, i) => (
                            <div key={i} className="absolute top-0 h-full border-l border-gray-100 dark:border-gray-800" style={{ left: `${i * DAY_WIDTH}px`, width: `${DAY_WIDTH}px` }}></div>
                        ))}

                        {/* Today Line */}
                        {todayPosition >= 0 && todayPosition < projectDuration && (
                            <div className="absolute top-0 h-full w-0.5 bg-red-500 z-10" style={{ left: `${todayPosition * DAY_WIDTH + DAY_WIDTH / 2}px` }}>
                                <div className="absolute -top-4 -translate-x-1/2 text-xs text-red-500 font-bold">اليوم</div>
                            </div>
                        )}
                        
                        {/* Dependency Lines */}
                        <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                           {dependencyLinks.map(link => (
                               <path key={link.key} d={link.d} stroke="#4f46e5" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                           ))}
                           <defs>
                               <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                   <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
                               </marker>
                           </defs>
                        </svg>

                        {/* Task Bars */}
                        {processedTasks.map((task, index) => {
                            const isCritical = cpmResult?.criticalActivityIds.includes(task.id);
                            const barColors = getBarStatusColors(task.status);
                            
                            // Baseline visualization
                            const hasBaseline = showBaseline && task.baselineStartDay !== undefined && task.baselineDuration !== undefined;
                            
                            // Determine variance visual styling
                            let varianceIndicatorColor = '';
                            if (showVarianceIndicators && task.variance) {
                                switch (task.variance) {
                                    case 'ahead':
                                        varianceIndicatorColor = 'ring-2 ring-green-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900';
                                        break;
                                    case 'behind':
                                        varianceIndicatorColor = 'ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900';
                                        break;
                                    case 'on-track':
                                        varianceIndicatorColor = 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900';
                                        break;
                                }
                            }

                            return (
                                <div
                                    key={task.id}
                                    className={`absolute h-12 flex flex-col justify-center group cursor-pointer ${highlightedTaskIds.size > 0 && !highlightedTaskIds.has(task.id) ? 'opacity-30' : ''}`}
                                    style={{ top: `${index * 48}px` }}
                                    onMouseEnter={() => setHoveredTaskId(task.id)}
                                    onMouseLeave={() => setHoveredTaskId(null)}
                                    onClick={() => onEditTask && onEditTask(task)}
                                >
                                    {/* Baseline Bar (shown below actual bar) */}
                                    {hasBaseline && (
                                        <div 
                                            className="absolute top-8 h-2 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-60 group-hover:opacity-80 transition-opacity"
                                            style={{ 
                                                left: `${task.baselineStartDay! * DAY_WIDTH}px`, 
                                                width: `${task.baselineDuration! * DAY_WIDTH}px` 
                                            }}
                                            title={`الأساس: ${task.baselineStart} - ${task.baselineEnd}`}
                                        >
                                            <div className="absolute -top-1 left-0 w-0.5 h-4 bg-gray-500"></div>
                                            <div className="absolute -top-1 right-0 w-0.5 h-4 bg-gray-500"></div>
                                        </div>
                                    )}
                                    
                                    {/* Actual Task Bar */}
                                    <div
                                        className={`relative h-8 rounded-md flex items-center justify-between px-2 text-xs font-medium text-white ${barColors.bg} ${getBarPriorityClass(task.priority)} ${isCritical ? 'ring-2 ring-red-500' : varianceIndicatorColor}`}
                                        style={{ left: `${task.startDay * DAY_WIDTH}px`, width: `${task.duration * DAY_WIDTH}px` }}
                                    >
                                        <div className={`absolute top-0 left-0 h-full rounded-md ${barColors.fill}`} style={{ width: `${task.progress}%` }}></div>
                                        <span className="relative truncate">{task.name}</span>
                                        
                                        {/* Variance indicator badge on bar */}
                                        {showVarianceIndicators && task.variance && task.varianceDays !== undefined && (
                                            <span className={`relative ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                task.variance === 'ahead' ? 'bg-green-500' :
                                                task.variance === 'behind' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}>
                                                {task.variance === 'ahead' ? `+${Math.abs(task.varianceDays)}` : 
                                                 task.variance === 'behind' ? `-${task.varianceDays}` : '✓'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
             {activeMenuTaskId && onEditTask && onDeleteTask && (
                <TaskContextMenu
                    position={menuPosition}
                    onClose={() => setActiveMenuTaskId(null)}
                    onEdit={() => onEditTask(tasks.find(t => t.id === activeMenuTaskId)!)}
                    onDelete={() => onDeleteTask(activeMenuTaskId)}
                />
            )}
        </div>
    );
});