import React, { useState, useMemo, useRef } from 'react';
// Fix: Correct import path for types.
import type { ScheduleTask, CriticalPathAnalysis } from '../types';
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

export const GanttChart: React.FC<GanttChartProps> = React.memo(({ tasks, projectStartDate, onEditTask, onDeleteTask, cpmResult }) => {
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
                        <div className="w-20 font-semibold text-sm text-center">الأولوية</div>
                        <div className="w-16 font-semibold text-sm text-center">Float</div>
                    </div>
                     <div ref={listBodyRef} onScroll={handleScroll} className="overflow-y-scroll overflow-x-hidden" style={{ maxHeight: '60vh' }}>
                        {processedTasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`h-12 flex items-center p-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-opacity duration-300 ${hoveredTaskId && !highlightedTaskIds.has(task.id) ? 'opacity-20' : 'opacity-100'}`}
                                onMouseEnter={() => setHoveredTaskId(task.id)}
                                onMouseLeave={() => setHoveredTaskId(null)}
                            >
                                <div className="flex-grow text-sm truncate font-medium">{task.name}</div>
                                <div className="w-20 flex justify-center items-center">
                                    {(task.assignees || []).slice(0, 2).map(a => <div key={a} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold -ml-2 border-2 border-white dark:border-gray-900/50">{a.charAt(0)}</div>)}
                                </div>
                                <div className="w-20 flex justify-center">{getStatusIcon(task.status)}</div>
                                <div className="w-20 flex justify-center"><div className={`w-3/4 h-1.5 rounded-full border-2 ${getPriorityColor(task.priority)}`}></div></div>
                                <div className="w-16 text-sm font-mono text-center">{cpmResult ? (cpmResult.totalFloat[task.id] ?? '-') : '-'}</div>
                                {onEditTask && onDeleteTask && (
                                     <button onClick={(e) => handleMenuClick(e, task.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-full no-print">
                                        <MoreHorizontal size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline (Right Side) */}
                <div className="flex-grow flex flex-col">
                    <div ref={timelineHeaderRef} className="h-20 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                        <div className="relative" style={{ width: projectDuration * DAY_WIDTH }}>
                            {/* Month Headers */}
                             {months.map(month => (
                                 <div key={month.name} className="absolute top-0 h-10 flex items-center justify-center border-b border-l border-gray-200 dark:border-gray-800" style={{ left: month.startDay * DAY_WIDTH }}>
                                     <span className="text-xs font-semibold px-2">{month.name}</span>
                                 </div>
                             ))}
                             {/* Day Headers */}
                             {days.map((day, i) => {
                                 const isWeekend = day.date.getDay() === 5 || day.date.getDay() === 4; // Fri/Thu
                                 return <div key={i} className={`absolute top-10 h-10 flex items-center justify-center text-xs border-l border-gray-200 dark:border-gray-800 ${isWeekend ? 'text-gray-400' : ''}`} style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}>{day.dayNumber}</div>
                             })}
                        </div>
                    </div>
                    <div ref={timelineBodyRef} onScroll={handleScroll} className="overflow-scroll" style={{ maxHeight: '60vh' }}>
                        <div className="relative" style={{ width: projectDuration * DAY_WIDTH, height: processedTasks.length * 48 }}>
                            {/* Grid Lines */}
                            {days.map((day, i) => {
                                const isWeekend = day.date.getDay() === 5 || day.date.getDay() === 4;
                                return <div key={i} className={`absolute top-0 h-full border-l border-gray-200/70 dark:border-gray-800/50 ${isWeekend ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''}`} style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}></div>
                            })}

                            {/* Today Marker */}
                            {todayPosition >= 0 && todayPosition < projectDuration && (
                                <div className="absolute top-0 h-full border-r-2 border-red-500 z-10" style={{ left: todayPosition * DAY_WIDTH }}>
                                    <div className="absolute -top-1.5 -right-[9px] text-xs text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center font-bold">!</div>
                                </div>
                            )}

                            {/* Task Bars */}
                            {processedTasks.map((task, index) => {
                                const isCritical = cpmResult?.criticalActivityIds.includes(task.id);
                                const criticalPathColors = {
                                    bg: 'bg-red-100 dark:bg-red-500/10 group-hover:bg-red-200 dark:group-hover:bg-red-500/20',
                                    fill: 'bg-red-500',
                                };
                                const barColors = isCritical ? criticalPathColors : getBarStatusColors(task.status);
                                const priorityClass = getBarPriorityClass(task.priority);

                                return (
                                    <div 
                                        key={task.id} 
                                        className={`absolute h-12 flex items-center group transition-opacity duration-300 ${hoveredTaskId && !highlightedTaskIds.has(task.id) ? 'opacity-20' : 'opacity-100'}`}
                                        style={{ top: index * 48, left: 0, width: projectDuration * DAY_WIDTH }}
                                        onMouseEnter={() => setHoveredTaskId(task.id)}
                                        onMouseLeave={() => setHoveredTaskId(null)}
                                    >
                                        {/* Baseline Bar */}
                                        {task.originalStartDay != null && task.originalDuration != null && (
                                            <div
                                                className="absolute h-4 top-5 bg-gray-300 dark:bg-gray-600 rounded opacity-80"
                                                style={{ left: task.originalStartDay * DAY_WIDTH, width: task.originalDuration * DAY_WIDTH }}
                                                title={`Original: ${task.originalStart} to ${task.originalEnd}`}
                                            />
                                        )}
                                        
                                        {/* Main Task Bar */}
                                        <div
                                            className={`absolute h-8 ${onEditTask ? 'cursor-pointer' : ''} ${barColors.bg} ${priorityClass} rounded flex items-center relative overflow-hidden shadow-sm transition-colors`}
                                            style={{ top: '8px', left: task.startDay * DAY_WIDTH, width: task.duration * DAY_WIDTH }}
                                            onClick={() => onEditTask && onEditTask(task)}
                                        >
                                            <div className={`absolute top-0 right-0 h-full ${barColors.fill} rounded transition-all duration-300 ease-in-out`} style={{ width: `${task.progress}%` }}></div>
                                            <span className="text-xs text-gray-800 dark:text-gray-100 font-semibold px-2 truncate relative z-10">{task.name}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Dependency Links Overlay */}
                            {dependencyLinks.length > 0 && (
                                <svg
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                    style={{ width: projectDuration * DAY_WIDTH, height: processedTasks.length * 48 }}
                                >
                                    <defs>
                                        <marker
                                            id="arrowhead"
                                            viewBox="0 0 10 10"
                                            refX="8"
                                            refY="5"
                                            markerWidth="6"
                                            markerHeight="6"
                                            orient="auto-start-reverse"
                                        >
                                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                                        </marker>
                                    </defs>
                                    {dependencyLinks.map(link => (
                                        <path
                                            key={link.key}
                                            d={link.d}
                                            stroke="#3b82f6"
                                            strokeWidth="1.5"
                                            fill="none"
                                            markerEnd="url(#arrowhead)"
                                            className="opacity-70"
                                        />
                                    ))}
                                </svg>
                            )}
                        </div>
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
