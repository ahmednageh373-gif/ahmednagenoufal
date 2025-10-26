import React, { useState, useEffect } from 'react';
import type { Risk, RiskCategory, RiskImpact, RiskProbability, RiskStatus } from '../types';
import { Modal } from './Modal';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={risk ? 'تعديل الخطر' : 'إضافة خطر جديد'}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="riskDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">وصف الخطر</label>
          <textarea id="riskDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect('riskCategory', 'الفئة', category, e => setCategory(e.target.value as RiskCategory), ['Financial', 'Technical', 'Schedule', 'Safety', 'Contractual'])}
          {renderSelect('riskStatus', 'الحالة', status, e => setStatus(e.target.value as RiskStatus), ['Open', 'In Progress', 'Closed'])}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelect('riskProbability', 'الاحتمالية', probability, e => setProbability(e.target.value as RiskProbability), ['Low', 'Medium', 'High'])}
            {renderSelect('riskImpact', 'التأثير', impact, e => setImpact(e.target.value as RiskImpact), ['Low', 'Medium', 'High'])}
        </div>
        <div className="mb-4">
          <label htmlFor="riskMitigation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">خطة التخفيف</label>
          <textarea id="riskMitigation" value={mitigationPlan} onChange={e => setMitigationPlan(e.target.value)} required rows={4} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg"></textarea>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600">إلغاء</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white">حفظ</button>
        </div>
      </form>
    </Modal>
  );
};
