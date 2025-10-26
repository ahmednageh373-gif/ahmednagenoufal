import React, { useState, useMemo, useRef } from 'react';
// Fix: Correct import path for types.
import type { ScheduleTask, CriticalPathAnalysis, ProjectMember } from '../types';
import { MoreHorizontal, User, Circle, CheckCircle, Clock } from 'lucide-react';
import { TaskContextMenu } from './TaskContextMenu';

// A type for tasks that have been processed to include calculated values
export interface ProcessedScheduleTask extends ScheduleTask {
    startDay: number;
    duration: number;
    originalStartDay?: number;
    originalDuration?: number;
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

export const GanttChart: React.FC<GanttChartProps> = React.memo(({ tasks, members, projectStartDate, onEditTask, onDeleteTask, cpmResult }) => {
    const [activeMenuTaskId, setActiveMenuTaskId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
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

            return { ...task, startDay, duration, originalStartDay, originalDuration };
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

    return (
        <div ref={containerRef} className="gantt-container bg-white dark:bg-gray-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 w-full overflow-hidden relative">
            <div className="flex">
                {/* Task List (Left Side) */}
                <div className="w-[500px] border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
                    <div className="h-20 flex items-center p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <div className="flex-grow font-semibold text-sm">المهمة</div>
                        <div className="w-20 font-semibold text-sm text-center">المسؤول</div>
                        <div className="w-20 font-semibold text-sm text-center">الحالة</div>
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
                                    <div className="w-20 flex justify-center">{getStatusIcon(task.status)}</div>
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
                            
                            // Recovery Plan Baseline Bar
                            const hasRecoveryBaseline = task.originalStartDay !== undefined && task.originalDuration !== undefined;

                            return (
                                <div
                                    key={task.id}
                                    className={`absolute h-12 flex items-center group cursor-pointer ${highlightedTaskIds.size > 0 && !highlightedTaskIds.has(task.id) ? 'opacity-30' : ''}`}
                                    style={{ top: `${index * 48}px` }}
                                    onMouseEnter={() => setHoveredTaskId(task.id)}
                                    onMouseLeave={() => setHoveredTaskId(null)}
                                    onClick={() => onEditTask && onEditTask(task)}
                                >
                                    {hasRecoveryBaseline && (
                                        <div 
                                            className="absolute h-4 bg-gray-300 dark:bg-gray-600 rounded-md opacity-70"
                                            style={{ left: `${task.originalStartDay! * DAY_WIDTH}px`, width: `${task.originalDuration! * DAY_WIDTH}px` }}
                                        />
                                    )}
                                    <div
                                        className={`relative h-8 rounded-md flex items-center justify-between px-2 text-xs font-medium text-white ${barColors.bg} ${getBarPriorityClass(task.priority)} ${isCritical ? 'ring-2 ring-red-500' : ''}`}
                                        style={{ left: `${task.startDay * DAY_WIDTH}px`, width: `${task.duration * DAY_WIDTH}px` }}
                                    >
                                        <div className={`absolute top-0 left-0 h-full rounded-md ${barColors.fill}`} style={{ width: `${task.progress}%` }}></div>
                                        <span className="relative truncate">{task.name}</span>
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