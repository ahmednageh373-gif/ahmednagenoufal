
import React, { useState, useEffect } from 'react';
// Fix: Correct import path for types.
import type { Risk, RiskCategory, RiskImpact, RiskProbability, RiskStatus } from '../types';
import { X } from 'lucide-react';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (risk: Omit<Risk, 'id'> | Risk) => void;
  risk: Risk | null; // Null for add, Risk object for edit
}

export const RiskModal: React.FC<RiskModalProps> = ({ isOpen, onClose, onSave, risk }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RiskCategory>('Technical');
  const [probability, setProbability] = useState<RiskProbability>('Medium');
  const [impact, setImpact] = useState<RiskImpact>('Medium');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [status, setStatus] = useState<RiskStatus>('Open');

  useEffect(() => {
    if (risk) {
      setDescription(risk.description);
      setCategory(risk.category);
      setProbability(risk.probability);
      setImpact(risk.impact);
      setMitigationPlan(risk.mitigationPlan);
      setStatus(risk.status);
    } else {
      // Reset for "Add New"
      setDescription('');
      setCategory('Technical');
      setProbability('Medium');
      setImpact('Medium');
      setMitigationPlan('');
      setStatus('Open');
    }
  }, [risk, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const riskData = { description, category, probability, impact, mitigationPlan, status };
    if (risk) {
      onSave({ ...riskData, id: risk.id });
    } else {
      onSave(riskData);
    }
    onClose();
  };

  if (!isOpen) return null;

  const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{risk ? 'تعديل الخطر' : 'إضافة خطر جديد'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="riskDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">وصف الخطر</label>
            <textarea
              id="riskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderSelect('riskCategory', 'الفئة', category, (e) => setCategory(e.target.value as RiskCategory), ['Financial', 'Technical', 'Schedule', 'Safety', 'Contractual'])}
            {renderSelect('riskProbability', 'الاحتمالية', probability, (e) => setProbability(e.target.value as RiskProbability), ['Low', 'Medium', 'High'])}
            {renderSelect('riskImpact', 'التأثير', impact, (e) => setImpact(e.target.value as RiskImpact), ['Low', 'Medium', 'High'])}
          </div>

          <div className="mb-4">
            <label htmlFor="riskMitigation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">خطة التخفيف</label>
            <textarea
              id="riskMitigation"
              value={mitigationPlan}
              // Fix: Completed the onChange handler which was truncated in the original file.
              onChange={(e) => setMitigationPlan(e.target.value)}
              rows={3}
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          {risk && renderSelect('riskStatus', 'الحالة', status, (e) => setStatus(e.target.value as RiskStatus), ['Open', 'In Progress', 'Closed'])}

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600">إلغاء</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
};
