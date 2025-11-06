/**
 * SBC 2024 Compliance Checker
 * فاحص الامتثال لكود البناء السعودي 2024
 */

import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, FileCheck, Download } from 'lucide-react';
import { SBC_CATEGORIES, SBC_2024_REQUIREMENTS, ViolationSeverity, type SBCRequirement } from '../data/sbc2024-codes';

export const SBCComplianceChecker: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkResults, setCheckResults] = useState<Map<string, boolean>>(new Map());
  const [violations, setViolations] = useState<any[]>([]);

  const requirements = selectedCategory === 'all' 
    ? SBC_2024_REQUIREMENTS 
    : SBC_2024_REQUIREMENTS.filter(r => r.category === selectedCategory);

  const handleCheck = (reqId: string, checkpointId: string, passed: boolean) => {
    const key = `${reqId}-${checkpointId}`;
    setCheckResults(new Map(checkResults.set(key, passed)));
    
    if (!passed) {
      const req = SBC_2024_REQUIREMENTS.find(r => r.id === reqId);
      const checkpoint = req?.checkpoints.find(c => c.id === checkpointId);
      if (req && checkpoint) {
        setViolations(prev => [...prev, {
          requirement: req.title,
          checkpoint: checkpoint.description,
          severity: checkpoint.mandatory ? ViolationSeverity.CRITICAL : ViolationSeverity.MEDIUM
        }]);
      }
    }
  };

  const totalChecks = SBC_2024_REQUIREMENTS.reduce((sum, r) => sum + r.checkpoints.length, 0);
  const passedChecks = Array.from(checkResults.values()).filter(v => v).length;
  const complianceRate = totalChecks > 0 ? (passedChecks / totalChecks * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">فاحص كود البناء السعودي 2024</h1>
              <p className="text-gray-600 dark:text-gray-400">Saudi Building Code SBC 2024 Compliance Checker</p>
            </div>
          </div>
          
          {/* Compliance Rate */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">نسبة الامتثال</span>
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{complianceRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${complianceRate}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {passedChecks} من {totalChecks} فحص مكتمل
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">التصنيفات</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-4 rounded-xl font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              الكل ({SBC_2024_REQUIREMENTS.length})
            </button>
            {SBC_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-xl font-medium text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {cat.nameAr}
                <div className="text-xs opacity-75 mt-1">{cat.code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-6">
          {requirements.map(req => (
            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileCheck className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-mono rounded-full">
                      {req.code}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{req.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{req.description}</p>
                  
                  {/* Requirements List */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">المتطلبات:</h4>
                    <ul className="space-y-1">
                      {req.requirements.map((r, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Checkpoints */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">نقاط الفحص:</h4>
                    {req.checkpoints.map(cp => {
                      const key = `${req.id}-${cp.id}`;
                      const status = checkResults.get(key);
                      
                      return (
                        <div key={cp.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCheck(req.id, cp.id, true)}
                              className={`p-2 rounded-lg transition-all ${
                                status === true
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-green-100'
                              }`}
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleCheck(req.id, cp.id, false)}
                              className={`p-2 rounded-lg transition-all ${
                                status === false
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-100'
                              }`}
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800 dark:text-gray-200">{cp.description}</span>
                              {cp.mandatory && (
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full">
                                  إلزامي
                                </span>
                              )}
                            </div>
                            {cp.reference && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">المرجع: {cp.reference}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {req.penalties && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-r-4 border-red-500 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertTriangle size={20} />
                        <span className="font-semibold">العقوبات: {req.penalties}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Violations Summary */}
        {violations.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-3">
              <AlertTriangle size={28} />
              المخالفات المكتشفة ({violations.length})
            </h2>
            <div className="space-y-3">
              {violations.map((v, i) => (
                <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-r-4 border-red-500">
                  <div className="font-semibold text-gray-900 dark:text-white">{v.requirement}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{v.checkpoint}</div>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                    v.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {v.severity === 'critical' ? 'حرج' : 'متوسط'}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Download size={20} />
              تحميل تقرير المخالفات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SBCComplianceChecker;
