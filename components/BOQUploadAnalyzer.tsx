/**
 * ═══════════════════════════════════════════════════════════════
 * مكون رفع وتحليل المقايسات
 * BOQ Upload & Automatic Analysis Component
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Loader,
  FileSpreadsheet,
  X,
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign,
} from 'lucide-react';
import SmartAssistantChat from './SmartAssistantChat';
import { processBOQFile, exportBOQToExcel } from '../src/utils/excelProcessor';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface BOQItem {
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface WBSActivity {
  code: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  quantity: number;
  productivityRate: number;
  crew: string;
  durationDays: number;
  costRiyal: number;
  weightPercent: number;
}

interface AnalysisResult {
  boqItems: BOQItem[];
  wbsActivities: WBSActivity[];
  summary: {
    totalItems: number;
    totalBudget: number;
    totalDuration: number;
    avgProductivity: number;
    categories: { [key: string]: number };
  };
}

// ═══════════════════════════════════════════════════════════════
// File Upload Component
// ═══════════════════════════════════════════════════════════════

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      onFileSelect(file);
    } else {
      alert('يرجى رفع ملف Excel أو CSV');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-800">جاري تحليل المقايسة...</p>
          <p className="text-sm text-gray-600 mt-2">قد يستغرق هذا بضع ثوانٍ</p>
        </div>
      ) : (
        <>
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            اسحب وأفلت ملف المقايسة هنا
          </h3>
          <p className="text-gray-600 mb-4">أو</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            اختر ملف من الجهاز
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-4">
            الصيغ المدعومة: Excel (.xlsx, .xls), CSV (.csv)
          </p>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Analysis Summary Component
// ═══════════════════════════════════════════════════════════════

interface AnalysisSummaryProps {
  result: AnalysisResult;
  onExport: () => void;
  onProceed: () => void;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ result, onExport, onProceed }) => {
  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-green-900">تم تحليل المقايسة بنجاح!</h3>
            <p className="text-green-700 mt-1">تم استخراج وتفكيك جميع البنود إلى أنشطة فرعية</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">إجمالي البنود</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{result.summary.totalItems}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">الميزانية الإجمالية</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {result.summary.totalBudget.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">ريال سعودي</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">المدة الإجمالية</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{result.summary.totalDuration}</div>
          <div className="text-xs text-gray-500">يوم</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">عدد الأنشطة</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{result.wbsActivities.length}</div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">توزيع التكلفة حسب الفئة</h4>
        <div className="space-y-3">
          {Object.entries(result.summary.categories).map(([category, cost]) => {
            const percentage = (cost / result.summary.totalBudget) * 100;
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-600">{cost.toLocaleString()} ريال ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOQ Items Preview */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">بنود المقايسة ({result.boqItems.length})</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الوحدة</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الكمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر الوحدة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.boqItems.slice(0, 5).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unitPrice.toLocaleString()} ريال
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.totalPrice.toLocaleString()} ريال
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.boqItems.length > 5 && (
            <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-600">
              و {result.boqItems.length - 5} بند إضافي...
            </div>
          )}
        </div>
      </div>

      {/* WBS Activities Preview */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">الأنشطة الفرعية (WBS) - {result.wbsActivities.length}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النشاط</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">المدة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الوزن %</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطاقم</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.wbsActivities.slice(0, 5).map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{activity.nameAr}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {activity.durationDays.toFixed(1)} يوم
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.costRiyal.toLocaleString()} ريال
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-blue-600">
                    {activity.weightPercent.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{activity.crew}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.wbsActivities.length > 5 && (
            <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-600">
              و {result.wbsActivities.length - 5} نشاط إضافي...
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onProceed}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
        >
          المتابعة إلى الجدول الزمني
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          تصدير Excel
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export const BOQUploadAnalyzer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);

    try {
      // ✅ REAL FILE PROCESSING - Fixed BOQ bug
      console.log('🔄 Processing BOQ file:', file.name);
      
      // Process the Excel file
      const processedData = await processBOQFile(file);
      
      console.log('✅ BOQ processing completed:', {
        totalItems: processedData.totalItems,
        totalCost: processedData.totalCost,
        categories: Object.keys(processedData.categories).length
      });

      // Generate WBS activities from BOQ items
      const wbsActivities = generateWBSActivities(processedData.items);

      // Calculate total duration
      const totalDuration = wbsActivities.reduce((sum, act) => sum + act.durationDays, 0);
      const avgProductivity = wbsActivities.length > 0 
        ? wbsActivities.reduce((sum, act) => sum + act.productivityRate, 0) / wbsActivities.length
        : 0;

      const result: AnalysisResult = {
        boqItems: processedData.items,
        wbsActivities,
        summary: {
          totalItems: processedData.totalItems,
          totalBudget: processedData.totalCost,
          totalDuration,
          avgProductivity,
          categories: processedData.categories,
        },
      };

      setAnalysisResult(result);
      setIsProcessing(false);

      console.log('🎉 Analysis complete - displaying results');
    } catch (error) {
      console.error('❌ Error processing BOQ file:', error);
      alert(`خطأ في معالجة الملف: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
      setUploadedFile(null);
    }
  };

  /**
   * Generate WBS activities from BOQ items
   * This creates sub-activities for each BOQ item based on the work type
   */
  const generateWBSActivities = (boqItems: BOQItem[]): WBSActivity[] => {
    const activities: WBSActivity[] = [];
    let totalCost = 0;

    // Calculate total cost for weight calculation
    boqItems.forEach(item => {
      totalCost += item.totalPrice;
    });

    boqItems.forEach((item, index) => {
      // Determine work type and create appropriate activities
      const desc = item.description.toLowerCase();
      let activityType = 'general';
      let productivityRate = 30; // Default
      let crew = 'طاقم عمل عام';

      if (desc.includes('بلاط') || desc.includes('tile')) {
        activityType = 'tiling';
        productivityRate = 40;
        crew = '1 مبلط + 1 مساعد';
      } else if (desc.includes('خرسانة') || desc.includes('concrete')) {
        activityType = 'concrete';
        productivityRate = 50;
        crew = 'مضخة + 6 عامل';
      } else if (desc.includes('دهان') || desc.includes('paint')) {
        activityType = 'painting';
        productivityRate = 80;
        crew = '2 دهان';
      } else if (desc.includes('حديد') || desc.includes('steel')) {
        activityType = 'steel';
        productivityRate = 1.2;
        crew = '2 حداد + 1 مساعد';
      }

      // Calculate duration
      const duration = item.quantity / productivityRate;
      const weight = (item.totalPrice / totalCost) * 100;

      // Create main activity
      const activity: WBSActivity = {
        code: `${item.code}-A`,
        nameAr: item.description,
        nameEn: item.description, // Could be translated
        unit: item.unit,
        quantity: item.quantity,
        productivityRate,
        crew,
        durationDays: duration,
        costRiyal: item.totalPrice,
        weightPercent: weight,
      };

      activities.push(activity);
    });

    return activities;
  };

  const handleExport = () => {
    if (!analysisResult) return;

    try {
      // Export processed BOQ data to Excel
      const processedData = {
        items: analysisResult.boqItems,
        totalItems: analysisResult.summary.totalItems,
        totalCost: analysisResult.summary.totalBudget,
        averageCost: analysisResult.summary.totalBudget / analysisResult.summary.totalItems,
        categories: analysisResult.summary.categories,
      };

      exportBOQToExcel(processedData, `boq_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      console.log('✅ BOQ data exported to Excel');
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      alert('حدث خطأ أثناء تصدير البيانات');
    }
  };

  const handleProceed = () => {
    alert('سيتم الانتقال إلى صفحة الجدول الزمني');
  };

  const handleReset = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* NOUFAL Agent Card */}
      <div className="mb-6">
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">رفع وتحليل المقايسة</h1>
          <p className="text-gray-600 mt-1">
            رفع ملف المقايسة وتفكيكه تلقائياً إلى أنشطة فرعية (WBS Level-3)

      {/* Smart Assistant Chat */}
      <SmartAssistantChat context="boq" projectName="تحليل المقايسات" />
          </p>
        </div>
        {analysisResult && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            إعادة تعيين
          </button>
        )}
      </div>

      {/* Instructions */}
      {!analysisResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">📌 تعليمات الرفع:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• تأكد من أن ملف المقايسة يحتوي على الأعمدة التالية: الكود، الوصف، الوحدة، الكمية، سعر الوحدة</li>
            <li>• يفضل أن يكون الملف بصيغة Excel (.xlsx) لنتائج أفضل</li>
            <li>• سيتم تفكيك كل بند تلقائياً إلى أنشطة فرعية باستخدام قاعدة البيانات المحلية</li>
            <li>• سيتم حساب المدة والتكلفة لكل نشاط بناءً على معدلات الإنتاجية المعتمدة</li>
          </ul>
        </div>
      )}

      {/* Content */}
      {!analysisResult ? (
        <FileUploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
      ) : (
        <AnalysisSummary
          result={analysisResult}
          onExport={handleExport}
          onProceed={handleProceed}
        />
      )}
    </div>
  );
};

export default BOQUploadAnalyzer;
