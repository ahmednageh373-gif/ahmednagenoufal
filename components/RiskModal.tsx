

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