/**
 * BOQ Upload Hub - Integrated Workflow
 * مركز رفع المقايسات مع سير عمل متكامل مستوحى من Start Infinity
 */

import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, Download, Eye, Loader } from 'lucide-react';
import type { FinancialItem, ScheduleTask, PurchaseOrder } from '../types';
import { generateScheduleFromBOQ, generateScheduleSummary } from '../services/scheduleGenerator';
import { generatePurchaseOrders, generatePurchaseOrderSummary } from '../services/purchaseOrderGenerator';
import { generateProcurementPlan } from '../services/procurementPlanGenerator';
import { generateComprehensiveReport } from '../services/reportGenerator';

interface BOQUploadHubProps {
  projectId: string;
  projectName: string;
  onComplete?: (data: {
    boq: FinancialItem[];
    schedule: ScheduleTask[];
    purchaseOrders: PurchaseOrder[];
  }) => void;
}

type StepStatus = 'pending' | 'processing' | 'completed' | 'error';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  result?: any;
  error?: string;
}

export const BOQUploadHub: React.FC<BOQUploadHubProps> = ({ projectId, projectName, onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [boqData, setBOQData] = useState<FinancialItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 'upload', title: 'رفع المقايسة', description: 'رفع ملف Excel/CSV', status: 'pending' },
    { id: 'schedule', title: 'توليد الجدول الزمني', description: 'CPM Scheduling تلقائي', status: 'pending' },
    { id: 'purchase', title: 'توليد أوامر الشراء', description: 'أوامر شراء حسب التصنيف', status: 'pending' },
    { id: 'procurement', title: 'خطة المشتريات', description: 'جدول زمني للمشتريات', status: 'pending' },
    { id: 'report', title: 'التقرير الشامل', description: 'تقرير متكامل للمشروع', status: 'pending' }
  ]);

  const updateStepStatus = (stepId: string, status: StepStatus, result?: any, error?: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status, result, error } : step
    ));
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      updateStepStatus('upload', 'completed', { fileName: selectedFile.name });
    }
  }, []);

  const processWorkflow = async () => {
    if (!file) {
      alert('الرجاء رفع ملف المقايسة أولاً');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Parse BOQ (simplified - you'd use ExcelParser here)
      updateStepStatus('upload', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock BOQ data for demo
      const mockBOQ: FinancialItem[] = [
        { id: '1', description: 'حفر وتسوية', quantity: 500, unit: 'م3', unitPrice: 15, total: 7500, category: 'أعمال حفر' },
        { id: '2', description: 'خرسانة مسلحة للأساسات', quantity: 100, unit: 'م3', unitPrice: 350, total: 35000, category: 'خرسانة' },
        { id: '3', description: 'حديد تسليح', quantity: 15, unit: 'طن', unitPrice: 2500, total: 37500, category: 'حديد' },
        { id: '4', description: 'مباني طوب أحمر', quantity: 200, unit: 'م2', unitPrice: 80, total: 16000, category: 'مباني' },
        { id: '5', description: 'بلاط أرضيات', quantity: 150, unit: 'م2', unitPrice: 120, total: 18000, category: 'تشطيبات' }
      ];
      
      setBOQData(mockBOQ);
      updateStepStatus('upload', 'completed', { itemsCount: mockBOQ.length });

      // Step 2: Generate Schedule
      updateStepStatus('schedule', 'processing');
      const schedule = await generateScheduleFromBOQ(mockBOQ, {
        projectStartDate: new Date(),
        workingDaysPerWeek: 6,
        workingHoursPerDay: 8
      });
      const scheduleSummary = generateScheduleSummary(schedule);
      updateStepStatus('schedule', 'completed', { tasks: schedule.length, summary: scheduleSummary });

      // Step 3: Generate Purchase Orders
      updateStepStatus('purchase', 'processing');
      const purchaseOrders = await generatePurchaseOrders(mockBOQ, new Date(), { groupSimilar: true });
      const poSummary = generatePurchaseOrderSummary(purchaseOrders);
      updateStepStatus('purchase', 'completed', { orders: purchaseOrders.length, summary: poSummary });

      // Step 4: Generate Procurement Plan
      updateStepStatus('procurement', 'processing');
      const procurementPlan = await generateProcurementPlan(purchaseOrders, schedule);
      updateStepStatus('procurement', 'completed', procurementPlan);

      // Step 5: Generate Report
      updateStepStatus('report', 'processing');
      const report = await generateComprehensiveReport(mockBOQ, schedule, purchaseOrders, projectName);
      updateStepStatus('report', 'completed', report);

      // Call completion callback
      if (onComplete) {
        onComplete({ boq: mockBOQ, schedule, purchaseOrders });
      }

      console.log('✅ سير العمل المتكامل اكتمل بنجاح!');

    } catch (error) {
      console.error('❌ خطأ في سير العمل:', error);
      alert('حدث خطأ أثناء معالجة المقايسة');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'processing': return <Loader className="text-blue-500 animate-spin" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مركز رفع المقايسات</h1>
              <p className="text-gray-600 dark:text-gray-400">سير عمل متكامل تلقائي</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            ارفع ملف المقايسة وسيتم تلقائياً: توليد الجدول الزمني، أوامر الشراء، خطة المشتريات، والتقارير الشاملة.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Upload size={28} />
            رفع ملف المقايسة
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors">
            <Upload className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              اسحب وأفلت ملف Excel أو CSV هنا
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">أو انقر للاختيار من جهازك</p>
            
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer transition-colors"
            >
              اختر ملف
            </label>
            
            {file && (
              <div className="mt-6 flex items-center justify-center gap-3 text-green-600">
                <CheckCircle size={20} />
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>

          <button
            onClick={processWorkflow}
            disabled={!file || isProcessing}
            className="mt-8 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin" size={24} />
                جاري المعالجة...
              </>
            ) : (
              <>
                <ArrowRight size={24} />
                بدء سير العمل المتكامل
              </>
            )}
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">خطوات سير العمل</h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-6 rounded-xl border-2 transition-all ${
                  step.status === 'completed'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : step.status === 'processing'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse'
                    : step.status === 'error'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400">{index + 1}</div>
                    {getStatusIcon(step.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  
                  {step.status === 'completed' && step.result && (
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-2">
                        <Eye size={16} />
                        عرض
                      </button>
                      <button className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-2">
                        <Download size={16} />
                        تحميل
                      </button>
                    </div>
                  )}
                </div>
                
                {step.status === 'completed' && step.result && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOQUploadHub;
