import React from 'react';
import type { ScheduleTask } from '../types';
import { X, CheckCircle, AlertTriangle } from '../lucide-icons';

interface ScheduleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tasks: ScheduleTask[]) => void;
  tasks: ScheduleTask[];
  fileName: string;
}

export const ScheduleImportModal: React.FC<ScheduleImportModalProps> = ({ isOpen, onClose, onConfirm, tasks, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content p-8 max-w-4xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">تأكيد استيراد الجدول الزمني</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          تمت قراءة المهام التالية من الملف <span className="font-semibold">{fileName}</span>. سيؤدي التأكيد إلى استبدال الجدول الزمني الحالي.
        </p>

        {tasks.length > 0 ? (
          <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                <tr>
                  <th className="p-2">المهمة</th>
                  <th className="p-2">تاريخ البدء</th>
                  <th className="p-2">تاريخ الانتهاء</th>
                  <th className="p-2">الاعتماديات</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task.id || index} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <td className="p-2 font-medium">{task.name}</td>
                    <td className="p-2">{task.start}</td>
                    <td className="p-2">{task.end}</td>
                    <td className="p-2">{task.dependencies.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">لم يتم العثور على مهام</h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              لم يتمكن النظام من قراءة أي مهام. يرجى التأكد من أن الملف يحتوي على الأعمدة الصحيحة (المهمة, تاريخ البدء, تاريخ الانتهاء).
            </p>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onConfirm(tasks)}
            disabled={tasks.length === 0}
            className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400">
            <CheckCircle size={18} />
            تأكيد واستبدال
          </button>
        </div>
      </div>
    </div>
  );
};
