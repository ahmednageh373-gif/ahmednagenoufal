import React, { useState, useEffect } from 'react';
import type { ProjectItem } from '../types';
import { X } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ProjectItem, 'id'> | ProjectItem) => void;
  item: ProjectItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ProjectItem['status']>('To Do');
  const [priority, setPriority] = useState<ProjectItem['priority']>('Medium');
  const [assignees, setAssignees] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [budget, setBudget] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (item) {
      setName(item.name);
      setStatus(item.status);
      setPriority(item.priority);
      setAssignees(item.assignees.join(', '));
      setStartDate(item.startDate);
      setEndDate(item.endDate);
      setBudget(item.budget);
      setProgress(item.progress);
    } else {
      // Reset for "Add New"
      setName('');
      setStatus('To Do');
      setPriority('Medium');
      setAssignees('');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
      setBudget(0);
      setProgress(0);
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const assigneesArray = assignees.split(',').map(a => a.trim()).filter(Boolean);
    const itemData = { name, status, priority, assignees: assigneesArray, startDate, endDate, budget, progress };
    
    if (item) {
      onSave({ ...item, ...itemData });
    } else {
      onSave(itemData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{item ? 'تعديل البند' : 'إضافة بند جديد'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
            <div className="mb-4">
                <label htmlFor="itemName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">اسم البند</label>
                <input id="itemName" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="itemStatus" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الحالة</label>
                    <select id="itemStatus" value={status} onChange={e => setStatus(e.target.value as ProjectItem['status'])} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="itemPriority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الأولوية</label>
                    <select id="itemPriority" value={priority} onChange={e => setPriority(e.target.value as ProjectItem['priority'])} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
            </div>
            
             <div className="mb-4">
                <label htmlFor="itemAssignees" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">المسؤولون (افصل بينهم بفاصلة)</label>
                <input id="itemAssignees" type="text" value={assignees} onChange={e => setAssignees(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="itemStartDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تاريخ البدء</label>
                    <input id="itemStartDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                 <div>
                    <label htmlFor="itemEndDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">تاريخ الانتهاء</label>
                    <input id="itemEndDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="itemBudget" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الميزانية (SAR)</label>
                <input id="itemBudget" type="number" value={budget} onChange={e => setBudget(parseFloat(e.target.value) || 0)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>

             <div className="mb-4">
                <label htmlFor="itemProgress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">التقدم ({progress}%)</label>
                <input id="itemProgress" type="range" min="0" max="100" value={progress} onChange={e => setProgress(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
            </div>
             <div className="flex justify-end gap-4 mt-6 shrink-0 border-t border-slate-200 dark:border-slate-700 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">
                    إلغاء
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">
                    حفظ
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
