import React, { useState, useEffect } from 'react';
import type { ScheduleTask, ScheduleTaskStatus, ScheduleTaskPriority } from '../types';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<ScheduleTask, 'id'> | ScheduleTask) => void;
  task: ScheduleTask | null;
  allTasks: ScheduleTask[];
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, allTasks }) => {
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [progress, setProgress] = useState(0);
  const [dependencies, setDependencies] = useState<number[]>([]);
  const [assignees, setAssignees] = useState('');
  const [status, setStatus] = useState<ScheduleTaskStatus>('To Do');
  const [priority, setPriority] = useState<ScheduleTaskPriority>('Medium');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (task) {
            setName(task.name);
            setStart(task.start);
            setEnd(task.end);
            setProgress(task.progress);
            setDependencies(task.dependencies || []);
            setAssignees((task.assignees || []).join(', '));
            setStatus(task.status || 'To Do');
            setPriority(task.priority || 'Medium');
            setCategory(task.category || '');
        } else {
            // Reset for new task
            const today = new Date().toISOString().split('T')[0];
            setName('');
            setStart(today);
            setEnd(today);
            setProgress(0);
            setDependencies([]);
            setAssignees('');
            setStatus('To Do');
            setPriority('Medium');
            setCategory('');
        }
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !start || !end) return;

    const assigneesArray = assignees.split(',').map(a => a.trim()).filter(Boolean);

    const taskData = { 
        name, 
        start, 
        end, 
        progress, 
        dependencies,
        assignees: assigneesArray,
        status,
        priority,
        category,
     };

    if (task) {
      onSave({ ...task, ...taskData });
    } else {
      onSave(taskData as Omit<ScheduleTask, 'id'>);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{task ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="taskName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">اسم المهمة</label>
            <input id="taskName" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="taskStart" className="block text-sm font-medium mb-2">تاريخ البدء</label>
              <input id="taskStart" type="date" value={start} onChange={e => setStart(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
            </div>
            <div>
              <label htmlFor="taskEnd" className="block text-sm font-medium mb-2">تاريخ الانتهاء</label>
              <input id="taskEnd" type="date" value={end} onChange={e => setEnd(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="taskProgress" className="block text-sm font-medium mb-2">التقدم ({progress}%)</label>
            <input id="taskProgress" type="range" min="0" max="100" value={progress} onChange={e => setProgress(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="mb-4">
             <label htmlFor="taskDependencies" className="block text-sm font-medium mb-2">تعتمد على</label>
             <select 
                id="taskDependencies"
                multiple
                value={dependencies.map(String)}
                // Fix: Explicitly type the 'option' parameter to resolve TypeScript error where it was inferred as 'unknown'.
                onChange={e => setDependencies(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => Number(option.value)))}
                className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg h-32"
            >
                {allTasks.filter(t => t.id !== task?.id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
             </select>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
                <label htmlFor="taskStatus" className="block text-sm font-medium mb-2">الحالة</label>
                <select id="taskStatus" value={status} onChange={e => setStatus(e.target.value as ScheduleTaskStatus)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
            <div>
                <label htmlFor="taskPriority" className="block text-sm font-medium mb-2">الأولوية</label>
                <select id="taskPriority" value={priority} onChange={e => setPriority(e.target.value as ScheduleTaskPriority)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
          </div>
           <div className="mb-4">
            <label htmlFor="taskAssignees" className="block text-sm font-medium mb-2">المسؤولون (افصل بينهم بفاصلة)</label>
            <input id="taskAssignees" type="text" value={assignees} onChange={e => setAssignees(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600">إلغاء</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};