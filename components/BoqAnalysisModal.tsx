import React, { useState } from 'react';
import type { FinancialItem } from '../types';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface BoqAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: FinancialItem[], fileName: string, generateSchedule: boolean) => void;
  financialItems: FinancialItem[];
  fileName: string;
  isLoading: boolean;
}

export const BoqAnalysisModal: React.FC<BoqAnalysisModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    financialItems, 
    fileName,
    isLoading
}) => {
  const [generateSchedule, setGenerateSchedule] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(financialItems, fileName, generateSchedule);
  };

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content p-8 max-w-4xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">تأكيد بنود المقايسة</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <p className="mb-4 text-slate-600 dark:text-slate-400">
            تم استخراج البنود التالية من الملف <span className="font-semibold">{fileName}</span>. يرجى مراجعتها قبل إضافتها إلى السجل المالي للمشروع.
        </p>

        {isLoading ? (
             <div className="text-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p>جاري تحليل الملف...</p>
             </div>
        ) : financialItems.length > 0 ? (
            <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                        <tr>
                            <th className="p-3">البند</th>
                            <th className="p-3">الكمية</th>
                            <th className="p-3">الوحدة</th>
                            <th className="p-3">سعر الوحدة</th>
                            <th className="p-3">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financialItems.map(item => (
                            <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                <td className="p-3 font-medium max-w-sm">{item.item}</td>
                                <td className="p-3">{item.quantity}</td>
                                <td className="p-3">{item.unit}</td>
                                <td className="p-3 font-mono">{item.unitPrice.toLocaleString('ar-SA')}</td>
                                <td className="p-3 font-mono font-semibold">{item.total.toLocaleString('ar-SA')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center p-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">لم يتم العثور على بنود</h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                    لم يتمكن النظام من استخراج أي بنود من الملف. قد يكون الملف فارغًا أو بتنسيق غير مدعوم.
                </p>
            </div>
        )}
        
        <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={generateSchedule}
                    onChange={(e) => setGenerateSchedule(e.target.checked)}
                    className="h-5 w-5 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={financialItems.length === 0 || isLoading}
                />
                <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                        إنشاء / استبدال الجدول الزمني للمشروع بناءً على هذه المقايسة
                    </span>
                     <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        تحذير: سيؤدي هذا إلى استبدال الجدول الزمني الحالي بالكامل بجدول جديد تم إنشاؤه بواسطة الذكاء الاصطناعي.
                    </p>
                </div>
            </label>
        </div>


        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
            إلغاء
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            disabled={financialItems.length === 0 || isLoading}
            className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400">
            <CheckCircle size={18} />
            تأكيد وإضافة
          </button>
        </div>
      </div>
    </div>
  );
};