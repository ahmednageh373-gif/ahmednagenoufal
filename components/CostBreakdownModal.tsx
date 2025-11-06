import React, { useMemo } from 'react';
import type { FinancialItem, DetailedCostBreakdown, CostBreakdownItem } from '../types';
import { X, Loader } from 'lucide-react';

interface CostBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FinancialItem | null;
  result: DetailedCostBreakdown | null;
  isLoading: boolean;
  error: string;
}

const CostGroup: React.FC<{ title: string, items: CostBreakdownItem[], color: string }> = ({ title, items, color }) => {
    const total = items.reduce((sum, item) => sum + item.estimatedTotal, 0);
    if (items.length === 0) return null;

    return (
        <tbody className="border-t-2 border-slate-300 dark:border-slate-600">
            <tr>
                <td colSpan={5} className={`p-2 font-bold text-lg ${color}`}>{title}</td>
            </tr>
            {items.map((row, index) => (
                <tr key={index} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <td className="p-2" data-label="الوصف">{row.description}</td>
                    <td className="p-2 font-mono text-center" data-label="الكمية">{row.quantity.toLocaleString('ar-SA')}</td>
                    <td className="p-2 text-center" data-label="الوحدة">{row.unit}</td>
                    <td className="p-2 font-mono" data-label="سعر الوحدة">{row.estimatedUnitPrice.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</td>
                    <td className="p-2 font-mono" data-label="الإجمالي">{row.estimatedTotal.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</td>
                </tr>
            ))}
             <tr>
                <td colSpan={4} className="p-2 text-left font-semibold">إجمالي {title}</td>
                <td className="p-2 font-mono font-semibold">{total.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</td>
            </tr>
        </tbody>
    );
};

export const CostBreakdownModal: React.FC<CostBreakdownModalProps> = ({ isOpen, onClose, item, result, isLoading, error }) => {
  if (!isOpen) return null;

  const { directCostTotal, overheadsAmount, profitAmount, finalTotal, groupedItems } = useMemo(() => {
    if (!result || !result.items) return { directCostTotal: 0, overheadsAmount: 0, profitAmount: 0, finalTotal: 0, groupedItems: {} };

    const directCostTotal = result.items.reduce((sum, row) => sum + row.estimatedTotal, 0);
    const overheadsAmount = directCostTotal * (result.overheadsPercentage / 100);
    const subtotalAfterOverheads = directCostTotal + overheadsAmount;
    const profitAmount = subtotalAfterOverheads * (result.profitPercentage / 100);
    const finalTotal = subtotalAfterOverheads + profitAmount;

    const groupedItems = result.items.reduce((acc, item) => {
      (acc[item.costType] = acc[item.costType] || []).push(item);
      return acc;
    }, {} as Record<CostBreakdownItem['costType'], CostBreakdownItem[]>);

    return { directCostTotal, overheadsAmount, profitAmount, finalTotal, groupedItems };
  }, [result]);


  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content p-8 max-w-4xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">تحليل تفصيلي لتكلفة الوحدة</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <p className="mb-6 text-slate-600 dark:text-slate-400 font-semibold">{item?.item}</p>
        
        {isLoading && (
            <div className="text-center p-12">
                <Loader className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" />
                <p>جاري تحليل التكلفة...</p>
            </div>
        )}

        {error && (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                <p className="font-bold">خطأ في التحليل</p>
                <p>{error}</p>
            </div>
        )}

        {result && (
             <div className="max-h-[60vh] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[700px] responsive-table">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                            <tr>
                                <th className="p-3">الوصف</th>
                                <th className="p-3 text-center">الكمية</th>
                                <th className="p-3 text-center">الوحدة</th>
                                <th className="p-3">سعر الوحدة</th>
                                <th className="p-3">الإجمالي</th>
                            </tr>
                        </thead>
                        
                        <CostGroup title="المواد" items={groupedItems['مواد'] || []} color="text-green-600 dark:text-green-400" />
                        <CostGroup title="العمالة" items={groupedItems['عمالة'] || []} color="text-sky-600 dark:text-sky-400" />
                        <CostGroup title="المعدات" items={groupedItems['معدات'] || []} color="text-amber-600 dark:text-amber-400" />

                        <tfoot className="bg-slate-100 dark:bg-slate-700 font-bold sticky bottom-0 text-sm">
                            <tr>
                                <td colSpan={4} className="p-2 text-left">إجمالي التكلفة المباشرة</td>
                                <td className="p-2 font-mono">{directCostTotal.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</td>
                            </tr>
                             <tr>
                                <td colSpan={4} className="p-2 text-left">التكاليف غير المباشرة ({result.overheadsPercentage}%)</td>
                                <td className="p-2 font-mono">{overheadsAmount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="p-2 text-left">هامش الربح ({result.profitPercentage}%)</td>
                                <td className="p-2 font-mono">{profitAmount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</td>
                            </tr>
                            <tr className="bg-slate-200 dark:bg-slate-600 text-base">
                                <td colSpan={4} className="p-3 text-left">السعر الإجمالي للوحدة</td>
                                <td className="p-3 font-mono">{finalTotal.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
             </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 italic">
            * إخلاء مسؤولية: هذا التحليل تم إنشاؤه بواسطة الذكاء الاصطناعي وهو تقديري فقط. الأسعار والكميات قد لا تكون دقيقة ويجب التحقق منها بواسطة متخصص.
        </p>

        <div className="flex justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                إغلاق
            </button>
        </div>
      </div>
    </div>
  );
};