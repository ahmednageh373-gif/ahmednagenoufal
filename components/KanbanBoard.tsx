import React, { useState } from 'react';
import type { ProjectItem } from '../types';
import { MoreHorizontal, CalendarDays } from 'lucide-react';

interface KanbanBoardProps {
  items: ProjectItem[];
  onUpdateItems: (items: ProjectItem[]) => void;
  viewMode: 'compact' | 'detailed';
}

const statusMap: Record<ProjectItem['status'], { title: string; color: string }> = {
    'To Do': { title: 'للقيام به', color: 'bg-slate-500' },
    'In Progress': { title: 'قيد التنفيذ', color: 'bg-sky-500' },
    'Review': { title: 'للمراجعة', color: 'bg-amber-500' },
    'Done': { title: 'تم', color: 'bg-green-500' },
};

const priorityColors: Record<ProjectItem['priority'], string> = {
    'Low': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    'Medium': 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
    'High': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'Urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const priorityBorderColors: Record<ProjectItem['priority'], string> = {
    'Low': 'border-slate-400',
    'Medium': 'border-sky-500',
    'High': 'border-amber-500',
    'Urgent': 'border-red-500',
};


const KanbanCard: React.FC<{ item: ProjectItem; viewMode: 'compact' | 'detailed' }> = ({ item, viewMode }) => {
    if (viewMode === 'compact') {
        return (
            <div className={`bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 ${priorityBorderColors[item.priority]}`}>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{item.name}</p>
                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center -space-x-2">
                        {item.assignees.slice(0, 3).map(assignee => (
                             <img key={assignee} src={`https://i.pravatar.cc/24?u=${assignee}`} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800" alt={assignee} title={assignee} />
                        ))}
                    </div>
                    <span className="text-xs font-mono text-slate-500">{item.progress}%</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[item.priority]}`}>
                    {item.priority}
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={18} />
                </button>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-4">{item.name}</p>
            
            <div className="mb-4">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>التقدم</span>
                    <span>{item.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex items-center -space-x-2">
                    {item.assignees.map(assignee => (
                         <img key={assignee} src={`https://i.pravatar.cc/24?u=${assignee}`} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800" alt={assignee} title={assignee} />
                    ))}
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                     <div className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        <span>{new Date(item.endDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</span>
                     </div>
                </div>
            </div>
        </div>
    );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ items, onUpdateItems, viewMode }) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [justDroppedItemId, setJustDroppedItemId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
        setDraggedItemId(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('kanban-column-drag-over');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('kanban-column-drag-over');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProjectItem['status']) => {
        e.preventDefault();
        e.currentTarget.classList.remove('kanban-column-drag-over');
        const itemId = e.dataTransfer.getData('text/plain');

        if (itemId && items.find(i => i.id === itemId)?.status !== newStatus) {
            const updatedItems = items.map(item => {
                if (item.id === itemId) {
                    return { ...item, status: newStatus };
                }
                return item;
            });
            onUpdateItems(updatedItems);
            setJustDroppedItemId(itemId);
            setTimeout(() => setJustDroppedItemId(null), 1000);
        }
        setDraggedItemId(null);
    };

    const columns = Object.keys(statusMap) as (keyof typeof statusMap)[];

    return (
        <div className="w-full overflow-x-auto p-2">
            <div className="flex gap-6 min-w-max">
                {columns.map(status => {
                    const columnItems = items.filter(item => item.status === status);
                    return (
                        <div
                            key={status}
                            className="w-80 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex-shrink-0 transition-colors"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="flex justify-between items-center mb-4 px-1">
                                <div className="flex items-center gap-2">
                                     <span className={`w-2 h-2 rounded-full ${statusMap[status].color}`}></span>
                                     <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{statusMap[status].title}</h3>
                                </div>
                                <span className="text-sm font-semibold text-slate-500">{columnItems.length}</span>
                            </div>
                            <div className="space-y-3">
                                {columnItems.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item.id)}
                                        className={`cursor-move ${draggedItemId === item.id ? 'opacity-50' : ''} ${justDroppedItemId === item.id ? 'card-drop-success' : ''}`}
                                    >
                                        <KanbanCard item={item} viewMode={viewMode} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};