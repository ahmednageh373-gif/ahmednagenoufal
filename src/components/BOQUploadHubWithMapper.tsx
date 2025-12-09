/**
 * BOQ Upload Hub with Smart Column Mapper
 * مركز رفع المقايسات مع نظام ذكي لتحديد رؤوس الأعمدة
 */

import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, Download, Eye, Loader, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { FinancialItem, ScheduleTask, PurchaseOrder } from '../types';
import { generateScheduleFromBOQ, generateScheduleSummary } from '../services/scheduleGenerator';
import { generatePurchaseOrders, generatePurchaseOrderSummary } from '../services/purchaseOrderGenerator';
import { generateProcurementPlan } from '../services/procurementPlanGenerator';
import { generateComprehensiveReport } from '../services/reportGenerator';
import SmartAssistantChat from './SmartAssistantChat';
import NOUFALAgentCard from './NOUFALAgentCard';
import { BOQColumnMapper, ColumnMapping } from './BOQColumnMapper';

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
type UploadMode = 'waiting' | 'mapping' | 'processing';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  result?: any;
  error?: string;
}

export const BOQUploadHubWithMapper: React.FC<BOQUploadHubProps> = ({ projectId, projectName, onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [boqData, setBOQData] = useState<FinancialItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>('waiting');
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
  
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

  /**
   * معالجة رفع الملف - عرض واجهة تحديد الأعمدة
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadMode('mapping'); // الانتقال إلى وضع تحديد الأعمدة
    }
  }, []);

  /**
   * إلغاء عملية تحديد الأعمدة
   */
  const handleMappingCancel = () => {
    setFile(null);
    setUploadMode('waiting');
    setColumnMapping(null);
    setHeaderRowIndex(0);
  };

  /**
   * اكتمال تحديد الأعمدة - بدء المعالجة
   */
  const handleMappingComplete = (mapping: ColumnMapping, headerRow: number) => {
    setColumnMapping(mapping);
    setHeaderRowIndex(headerRow);
    setUploadMode('processing');
    
    // بدء المعالجة التلقائية
    processWorkflowWithMapping(mapping, headerRow);
  };

  /**
   * استخراج البيانات من Excel باستخدام Column Mapping
   */
  const parseExcelWithMapping = async (
    file: File,
    mapping: ColumnMapping,
    headerRowIndex: number
  ): Promise<FinancialItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
          
          const dataRows = jsonData.slice(headerRowIndex + 1);
          const boqItems: FinancialItem[] = [];
          
          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            if (!row || row.length === 0) continue;
            
            // استخراج القيم باستخدام ال Mapping
            const itemNo = mapping.itemNo !== null ? String(row[mapping.itemNo] || '').trim() : '';
            const itemId = itemNo || `${i + 1}`;
            
            const description = mapping.description !== null ? String(row[mapping.description] || '').trim() : '';
            if (!description || description.length < 3) continue;
            
            const quantity = mapping.quantity !== null ? parseFloat(String(row[mapping.quantity] || '0').replace(/,/g, '')) : 0;
            const unit = mapping.unit !== null ? String(row[mapping.unit] || 'وحدة').trim() : 'وحدة';
            const unitPrice = mapping.unitPrice !== null ? parseFloat(String(row[mapping.unitPrice] || '0').replace(/,/g, '')) : 0;
            const total = mapping.total !== null ? parseFloat(String(row[mapping.total] || '0').replace(/,/g, '')) : 0;
            const category = mapping.category !== null ? String(row[mapping.category] || 'عام').trim() : 'عام';
            
            // حساب الإجمالي الذكي
            let calculatedTotal = total;
            if (calculatedTotal === 0 && quantity > 0 && unitPrice > 0) {
              calculatedTotal = quantity * unitPrice;
            }
            
            let calculatedUnitPrice = unitPrice;
            if (calculatedUnitPrice === 0 && calculatedTotal > 0 && quantity > 0) {
              calculatedUnitPrice = calculatedTotal / quantity;
            }
            
            // تخطي البنود غير الصالحة
            if (quantity <= 0 && calculatedTotal <= 0) continue;
            
            boqItems.push({
              id: itemId,
              description,
              quantity: quantity || 1,
              unit,
              unitPrice: calculatedUnitPrice,
              total: calculatedTotal || (quantity * calculatedUnitPrice),
              category
            });
          }
          
          console.log(`✅ تم استخراج ${boqItems.length} بند من الملف باستخدام التعيين المخصص`);
          resolve(boqItems);
          
        } catch (error) {
          console.error('❌ خطأ في قراءة الملف:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('فشل قراءة الملف'));
      reader.readAsBinaryString(file);
    });
  };

  /**
   * معالجة سير العمل الكامل باستخدام Mapping
   */
  const processWorkflowWithMapping = async (mapping: ColumnMapping, headerRow: number) => {
    if (!file) {
      alert('الرجاء رفع ملف المقايسة أولاً');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Parse BOQ from Excel file with custom mapping
      updateStepStatus('upload', 'processing');
      
      const parsedBOQ = await parseExcelWithMapping(file, mapping, headerRow);
      
      if (parsedBOQ.length === 0) {
        throw new Error('الملف لا يحتوي على بيانات صالحة');
      }
      
      setBOQData(parsedBOQ);
      updateStepStatus('upload', 'completed', { 
        itemsCount: parsedBOQ.length,
        totalValue: parsedBOQ.reduce((sum, item) => sum + item.total, 0)
      });

      // Step 2: Generate Schedule
      updateStepStatus('schedule', 'processing');
      const schedule = await generateScheduleFromBOQ(parsedBOQ, {
        projectStartDate: new Date(),
        workingDaysPerWeek: 6,
        workingHoursPerDay: 8
      });
      const scheduleSummary = generateScheduleSummary(schedule);
      updateStepStatus('schedule', 'completed', { tasks: schedule.length, summary: scheduleSummary });

      // Step 3: Generate Purchase Orders
      updateStepStatus('purchase', 'processing');
      const purchaseOrders = await generatePurchaseOrders(parsedBOQ, new Date(), { groupSimilar: true });
      const poSummary = generatePurchaseOrderSummary(purchaseOrders);
      updateStepStatus('purchase', 'completed', { orders: purchaseOrders.length, summary: poSummary });

      // Step 4: Generate Procurement Plan
      updateStepStatus('procurement', 'processing');
      const procurementPlan = await generateProcurementPlan(purchaseOrders, schedule);
      updateStepStatus('procurement', 'completed', procurementPlan);

      // Step 5: Generate Report
      updateStepStatus('report', 'processing');
      const report = await generateComprehensiveReport(parsedBOQ, schedule, purchaseOrders, projectName);
      updateStepStatus('report', 'completed', report);

      // Call completion callback
      if (onComplete) {
        onComplete({ boq: parsedBOQ, schedule, purchaseOrders });
      }

      console.log('✅ سير العمل المتكامل اكتمل بنجاح!');

    } catch (error) {
      console.error('❌ خطأ في سير العمل:', error);
      alert('حدث خطأ أثناء معالجة المقايسة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
      setUploadMode('waiting');
      setFile(null);
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

  const renderStepResult = (stepId: string, result: any) => {
    if (!result) return null;

    switch (stepId) {
      case 'upload':
        return (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">عدد البنود</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.itemsCount}</p>
                </div>
                <FileSpreadsheet className="text-indigo-600 dark:text-indigo-400" size={40} />
              </div>
            </div>
            {result.totalValue && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">القيمة الإجمالية</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.totalValue.toLocaleString('ar-SA')} ريال
                    </p>
                  </div>
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">عدد المهام</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.tasks}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">المدة الإجمالية</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.summary?.totalDuration} يوم</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">المهام الحرجة</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{result.summary?.numberOfCriticalActivities}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // عرض واجهة تحديد الأعمدة
  if (uploadMode === 'mapping' && file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <BOQColumnMapper
            file={file}
            onMappingComplete={handleMappingComplete}
            onCancel={handleMappingCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* NOUFAL Agent Card */}
        <div className="mb-6">
          <NOUFALAgentCard mode="compact" />
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مركز رفع المقايسات الذكي</h1>
              <p className="text-gray-600 dark:text-gray-400">مع نظام تحديد رؤوس الأعمدة التلقائي</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Settings className="text-blue-600 dark:text-blue-400" size={20} />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>جديد:</strong> يمكنك الآن اختيار رؤوس الأعمدة بنفسك، حتى لو كان ترتيب الملف مختلفاً!
            </p>
          </div>
        </div>

        {/* Smart Assistant Chat */}
        <SmartAssistantChat context="boq" projectName={projectName} />

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
            
            {file && uploadMode === 'processing' && (
              <div className="mt-6 flex items-center justify-center gap-3 text-green-600">
                <CheckCircle size={20} />
                <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Steps */}
        {uploadMode === 'processing' && (
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
                  
                  {step.status === 'completed' && step.result && renderStepResult(step.id, step.result)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BOQUploadHubWithMapper;
