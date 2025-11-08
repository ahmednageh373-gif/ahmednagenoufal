/**
 * واجهة المقايسات المتكاملة
 * Integrated BOQ View
 */

import React, { useState } from 'react';
import { IntegratedBOQItem } from '../../src/types/integrated/IntegratedBOQ';
import { useProject } from '../../src/contexts/ProjectContext';
import { Calendar, DollarSign, Users, AlertTriangle, CheckCircle, Clock, Plus, RefreshCw } from 'lucide-react';

export const IntegratedBOQView: React.FC = () => {
  // ✅ استخدام البيانات الموحدة من Context
  const { boqItems, financialSummary, scheduleSummary, syncAllData, isSyncing } = useProject();
  const [selectedItem, setSelectedItem] = useState<IntegratedBOQItem | null>(null);

  const handleSync = async () => {
    await syncAllData();
    alert('تم المزامنة بنجاح ✅');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">المقايسات المتكاملة</h1>
        <p className="text-indigo-100">نظام متكامل يربط المقايسات بالجدول الزمني والمالية والمعايير الهندسية</p>
      </div>

      {/* Summary Cards - من البيانات الموحدة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<CheckCircle className="text-green-500" />}
          title="إجمالي البنود"
          value={boqItems.length.toString()}
          subtitle="بند مقايسات"
        />
        <SummaryCard
          icon={<Calendar className="text-blue-500" />}
          title="إجمالي المدة"
          value={`${scheduleSummary.totalDuration} يوم`}
          subtitle="من الجدول الزمني المتكامل"
        />
        <SummaryCard
          icon={<DollarSign className="text-yellow-500" />}
          title="التكلفة المقدرة"
          value={`${financialSummary.totalEstimated.toLocaleString()} ريال`}
          subtitle={`فعلي: ${financialSummary.totalActual.toLocaleString()}`}
        />
        <SummaryCard
          icon={<Users className="text-purple-500" />}
          title="المهام"
          value={`${scheduleSummary.completedTasks}/${scheduleSummary.completedTasks + scheduleSummary.inProgressTasks}`}
          subtitle={`${scheduleSummary.delayedTasks} متأخر`}
        />
      </div>

      {/* Sync Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={isSyncing ? 'animate-spin' : ''} size={20} />
          {isSyncing ? 'جاري المزامنة...' : 'مزامنة جميع البيانات'}
        </button>
      </div>

      {/* BOQ Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">بنود المقايسات</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">البند</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدة (أيام)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">العمالة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">حالة المزامنة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {boqItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-gray-500">
                      معيار: {item.engineeringStandards.codeReference}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {item.scheduleIntegration.calculatedDuration}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div>ماهر: {item.scheduleIntegration.resources.labor.skilled}</div>
                      <div>عادي: {item.scheduleIntegration.resources.labor.unskilled}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {item.financialIntegration.comparison.estimated.totalCost.toLocaleString()} ريال
                    </div>
                    <div className="text-sm text-gray-500">
                      فعلي: {item.financialIntegration.comparison.actual.totalCost.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <SyncStatusBadge status={item.scheduleIntegration.syncStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSync();
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      مزامنة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

const SummaryCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}> = ({ icon, title, value, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
  </div>
);

const SyncStatusBadge: React.FC<{ status: 'synced' | 'pending' | 'conflict' | 'error' }> = ({ status }) => {
  const styles = {
    synced: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    conflict: 'bg-orange-100 text-orange-800',
    error: 'bg-red-100 text-red-800'
  };

  const labels = {
    synced: 'متزامن',
    pending: 'قيد الانتظار',
    conflict: 'تعارض',
    error: 'خطأ'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const DetailPanel: React.FC<{
  item: IntegratedBOQItem;
  onClose: () => void;
}> = ({ item, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{item.description}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Schedule Integration */}
        <Section title="التكامل مع الجدول الزمني">
          <InfoRow label="المدة المحسوبة" value={`${item.scheduleIntegration.calculatedDuration} يوم`} />
          <InfoRow label="معدل الإنتاجية" value={`${item.scheduleIntegration.productivityRate} ${item.unit}/يوم`} />
          <InfoRow label="العمالة المطلوبة" value={
            `ماهر: ${item.scheduleIntegration.resources.labor.skilled}, عادي: ${item.scheduleIntegration.resources.labor.unskilled}`
          } />
        </Section>

        {/* Financial Integration */}
        <Section title="التكامل المالي">
          <InfoRow label="السعر للوحدة" value={`${item.financialIntegration.pricing.unitPrice} ${item.financialIntegration.pricing.currency}`} />
          <InfoRow label="التكلفة المقدرة" value={`${item.financialIntegration.comparison.estimated.totalCost.toLocaleString()} ريال`} />
          <InfoRow label="التكلفة الفعلية" value={`${item.financialIntegration.comparison.actual.totalCost.toLocaleString()} ريال`} />
          <InfoRow
            label="الانحراف"
            value={`${item.financialIntegration.comparison.variance.totalVariance.toLocaleString()} ريال (${item.financialIntegration.comparison.variance.percentageVariance.toFixed(1)}%)`}
            valueClass={item.financialIntegration.comparison.variance.totalVariance > 0 ? 'text-red-600' : 'text-green-600'}
          />
        </Section>

        {/* Engineering Standards */}
        <Section title="المعايير الهندسية">
          <InfoRow label="المعيار المطبق" value={item.engineeringStandards.codeReference} />
          <InfoRow label="نسبة الهدر" value={`${item.engineeringStandards.allowance}%`} />
          <InfoRow label="معامل الأمان" value={item.engineeringStandards.safetyFactor.toString()} />
        </Section>

        {/* Progress */}
        <Section title="التقدم الفعلي">
          <InfoRow label="الكمية المنجزة" value={`${item.actualProgress.completedQuantity} ${item.unit}`} />
          <InfoRow label="نسبة الإنجاز" value={`${item.actualProgress.percentageComplete}%`} />
          {item.actualProgress.completionDate && (
            <InfoRow label="تاريخ الإنجاز" value={new Date(item.actualProgress.completionDate).toLocaleDateString('ar-SA')} />
          )}
        </Section>
      </div>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-bold mb-3 text-indigo-600">{title}</h3>
    <div className="space-y-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      {children}
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; valueClass?: string }> = ({ label, value, valueClass = '' }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);
