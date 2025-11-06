/**
 * BOQ Upload Hub - Integrated Workflow
 * مركز رفع المقايسات مع سير عمل متكامل مستوحى من Start Infinity
 */

import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, Download, Eye, Loader } from '../lucide-icons';
import * as XLSX from 'xlsx';
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

  const parseExcelFile = async (file: File): Promise<FinancialItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
          
          // Find header row (contains "الوصف" or "البيان" or "Description")
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            const rowStr = row.join('|').toLowerCase();
            if (rowStr.includes('وصف') || rowStr.includes('بيان') || rowStr.includes('description') || 
                rowStr.includes('الكمية') || rowStr.includes('quantity')) {
              headerRowIndex = i;
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            console.warn('⚠️ لم يتم العثور على صف العناوين، سيتم استخدام الصف الأول');
            headerRowIndex = 0;
          }
          
          const headers = jsonData[headerRowIndex];
          const dataRows = jsonData.slice(headerRowIndex + 1);
          
          // Map column names to indices
          const findColumnIndex = (keywords: string[]): number => {
            for (let i = 0; i < headers.length; i++) {
              const header = String(headers[i] || '').toLowerCase();
              for (const keyword of keywords) {
                if (header.includes(keyword)) return i;
              }
            }
            return -1;
          };
          
          const itemNoCol = findColumnIndex(['رقم', 'no', 'number', '#', 'item no', 'رقم البند', 'م', 'تسلسلي', 'الرقم التسلسلي']);
          const descCol = findColumnIndex(['وصف', 'بيان', 'description', 'item', 'البند', 'وصف البند', 'التفاصيل', 'المواصفات']);
          const qtyCol = findColumnIndex(['كمية', 'quantity', 'qty', 'الكمية']);
          const unitCol = findColumnIndex(['وحدة', 'unit', 'الوحدة', 'وحدة القياس', 'القياس']);
          const priceCol = findColumnIndex(['سعر', 'price', 'unit price', 'السعر', 'سعر الوحدة', 'الفئة']);
          const totalCol = findColumnIndex(['إجمالي', 'total', 'amount', 'الإجمالي', 'المبلغ', 'الاجمالي']);
          const categoryCol = findColumnIndex(['فئة', 'category', 'type', 'التصنيف', 'النوع', 'الفئة']);
          
          console.log('📊 Column mapping:', { itemNoCol, descCol, qtyCol, unitCol, priceCol, totalCol, categoryCol });
          
          const boqItems: FinancialItem[] = [];
          
          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            if (!row || row.length === 0) continue;
            
            // Extract item number from file or generate sequential
            const itemNo = itemNoCol >= 0 ? String(row[itemNoCol] || '').trim() : '';
            const itemId = itemNo || `${i + 1}`;
            
            const description = descCol >= 0 ? String(row[descCol] || '').trim() : '';
            if (!description || description.length < 3) continue; // Skip empty or very short descriptions
            
            const quantity = qtyCol >= 0 ? parseFloat(String(row[qtyCol] || '0').replace(/,/g, '')) : 0;
            const unit = unitCol >= 0 ? String(row[unitCol] || 'وحدة').trim() : 'وحدة';
            const unitPrice = priceCol >= 0 ? parseFloat(String(row[priceCol] || '0').replace(/,/g, '')) : 0;
            const total = totalCol >= 0 ? parseFloat(String(row[totalCol] || '0').replace(/,/g, '')) : quantity * unitPrice;
            const category = categoryCol >= 0 ? String(row[categoryCol] || 'عام').trim() : 'عام';
            
            // Skip rows with zero or invalid quantities
            if (quantity <= 0) continue;
            
            boqItems.push({
              id: itemId,
              description,
              quantity,
              unit,
              unitPrice: unitPrice || (total / quantity),
              total: total || (quantity * unitPrice),
              category
            });
          }
          
          console.log(`✅ تم استخراج ${boqItems.length} بند من الملف`);
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

  const processWorkflow = async () => {
    if (!file) {
      alert('الرجاء رفع ملف المقايسة أولاً');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Parse BOQ from Excel file
      updateStepStatus('upload', 'processing');
      
      const parsedBOQ = await parseExcelFile(file);
      
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
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg col-span-full">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">تاريخ الإنجاز المتوقع</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.summary?.estimatedCompletionDate}</p>
            </div>
          </div>
        );

      case 'purchase':
        return (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">عدد الأوامر</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.orders}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.summary?.totalValue?.toLocaleString('ar-SA')} ريال
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">أولوية عالية</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {result.summary?.byPriority?.high || 0}
                </p>
              </div>
            </div>
            {result.summary?.byCategory && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">التوزيع حسب الفئة</h4>
                <div className="space-y-2">
                  {result.summary.byCategory.slice(0, 5).map((cat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.category}</span>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {cat.value?.toLocaleString('ar-SA')} ريال
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'procurement':
        return (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">عدد المواد</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.summary?.totalItems}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">القيمة الإجمالية</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.summary?.totalValue?.toLocaleString('ar-SA')} ريال
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">المواد الحرجة</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.summary?.criticalItems}</p>
              </div>
            </div>
            {result.milestones && (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">المعالم الرئيسية</h4>
                <div className="space-y-3">
                  {result.milestones.map((milestone: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{milestone.date}</p>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {milestone.totalValue?.toLocaleString('ar-SA')} ريال
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'report':
        return (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">بنود المقايسة</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.summary?.totalBOQItems}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مدة المشروع</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.summary?.projectDuration} يوم</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">قيمة المشتريات</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.summary?.totalProcurementValue?.toLocaleString('ar-SA')} ريال
                </p>
              </div>
            </div>
            {result.sections?.recommendations && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg border-r-4 border-amber-500">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-amber-600">💡</span>
                  التوصيات
                </h4>
                <ul className="space-y-2">
                  {result.sections.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
            <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-48">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        );
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
                
                {step.status === 'completed' && step.result && renderStepResult(step.id, step.result)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOQUploadHub;
