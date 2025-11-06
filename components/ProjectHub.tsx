import React, { useState, useMemo } from 'react';
import type { Project, ProjectItem } from '../types';
import { Plus, Search, LayoutGrid, List, File, Printer, Grip, AlignJustify } from '../lucide-icons';
import { KanbanBoard } from './KanbanBoard';
import { ItemModal } from './ItemModal';
import { v4 as uuidv4 } from 'uuid';

interface ProjectHubProps {
  project: Project;
  onUpdateItems: (projectId: string, newItems: ProjectItem[]) => void;
}

declare var XLSX: any;

const ItemTable: React.FC<{ items: ProjectItem[], onEdit: (item: ProjectItem) => void }> = ({ items, onEdit }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-right responsive-table">
            <thead className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                <tr>
                    <th className="p-3">البند</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">الأولوية</th>
                    <th className="p-3">المسؤولون</th>
                    <th className="p-3">تاريخ الانتهاء</th>
                    <th className="p-3">التقدم</th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer" onClick={() => onEdit(item)}>
                        <td className="p-3 font-medium" data-label="البند">{item.name}</td>
                        <td className="p-3" data-label="الحالة">{item.status}</td>
                        <td className="p-3" data-label="الأولوية">{item.priority}</td>
                        <td className="p-3" data-label="المسؤولون">{item.assignees.join(', ')}</td>
                        <td className="p-3" data-label="تاريخ الانتهاء">{item.endDate}</td>
                        <td className="p-3" data-label="التقدم">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const statusOptions: ProjectItem['status'][] = ['To Do', 'In Progress', 'Review', 'Done'];
const priorityOptions: ProjectItem['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];


export const ProjectHub: React.FC<ProjectHubProps> = ({ project, onUpdateItems }) => {
    const items = project.data.items || [];
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [cardView, setCardView] = useState<'compact' | 'detailed'>('detailed');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectItem['status'] | ''>('');
    const [priorityFilter, setPriorityFilter] = useState<ProjectItem['priority'] | ''>('');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter ? item.status === statusFilter : true;
            const matchesPriority = priorityFilter ? item.priority === priorityFilter : true;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [items, searchTerm, statusFilter, priorityFilter]);

    const handleSaveItem = (itemData: Omit<ProjectItem, 'id'> | ProjectItem) => {
        let updatedItems: ProjectItem[];
        if ('id' in itemData && items.some(i => i.id === itemData.id)) { // Editing
            updatedItems = items.map(item => (item.id === itemData.id ? (itemData as ProjectItem) : item));
        } else { // Adding
            const newItem: ProjectItem = { ...(itemData as Omit<ProjectItem, 'id'>), id: `item-${uuidv4()}` };
            updatedItems = [...items, newItem];
        }
        onUpdateItems(project.id, updatedItems);
    };
    
    const handleUpdateItemsFromKanban = (newItems: ProjectItem[]) => {
        onUpdateItems(project.id, newItems);
    };

    const handleOpenModalForEdit = (item: ProjectItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const handleExportXLSX = () => {
        const dataToExport = filteredItems.map(item => ({
            'ID': item.id,
            'البند': item.name,
            'الحالة': item.status,
            'الأولوية': item.priority,
            'المسؤولون': item.assignees.join(', '),
            'تاريخ البدء': item.startDate,
            'تاريخ الانتهاء': item.endDate,
            'الميزانية': item.budget,
            'التقدم': item.progress,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Project Items");
        XLSX.writeFile(workbook, `project_items_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">مركز المشروع</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">نظرة شاملة على مهام وبنود مشروع: {project.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                        <File size={18} /><span>تصدير Excel</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                    <button
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700"
                    >
                        <Plus size={18} /><span>إضافة بند جديد</span>
                    </button>
                </div>
            </div>
            
            <div className="mb-4 flex items-center justify-between p-2 flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                 <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث في البنود..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-52 bg-white dark:bg-slate-700 rounded-lg py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                     <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as ProjectItem['status'] | '')}
                        className="bg-white dark:bg-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    >
                        <option value="">كل الحالات</option>
                        {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                     <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value as ProjectItem['priority'] | '')}
                        className="bg-white dark:bg-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    >
                        <option value="">كل الأولويات</option>
                        {priorityOptions.map(priority => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-2 rounded-md ${viewMode === 'board' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}
                            aria-label="Kanban view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}
                            aria-label="List view"
                        >
                            <List size={18} />
                        </button>
                    </div>
                     {viewMode === 'board' && (
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-lg">
                            <button
                                onClick={() => setCardView('compact')}
                                className={`p-2 rounded-md ${cardView === 'compact' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}
                                aria-label="Compact card view"
                                title="Compact View"
                            >
                                <Grip size={18} />
                            </button>
                            <button
                                onClick={() => setCardView('detailed')}
                                className={`p-2 rounded-md ${cardView === 'detailed' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}
                                aria-label="Detailed card view"
                                title="Detailed View"
                            >
                                <AlignJustify size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'board' ? (
                <KanbanBoard items={filteredItems} onUpdateItems={handleUpdateItemsFromKanban} viewMode={cardView} />
            ) : (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                   <ItemTable items={filteredItems} onEdit={handleOpenModalForEdit} />
                </div>
            )}

            <ItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
                item={editingItem}
            />
        </div>
    );
};