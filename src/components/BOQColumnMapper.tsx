/**
 * BOQ Column Mapper Component
 * مكون تحديد رؤوس أعمدة المقايسة بشكل تفاعلي
 * 
 * يسمح للمستخدم باختيار الأعمدة المناسبة من ملف Excel
 * حتى لو كان الترتيب مختلفاً عن المعتاد
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, FileSpreadsheet, ArrowRight, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ColumnMapping {
  description: number | null;  // عمود الوصف
  unit: number | null;          // عمود الوحدة
  quantity: number | null;      // عمود الكمية
  unitPrice: number | null;     // عمود سعر الوحدة
  total: number | null;         // عمود الإجمالي
  itemNo: number | null;        // عمود رقم البند (اختياري)
  category: number | null;      // عمود الفئة/التصنيف (اختياري)
}

interface BOQColumnMapperProps {
  file: File;
  onMappingComplete: (mapping: ColumnMapping, headerRowIndex: number) => void;
  onCancel: () => void;
}

interface ColumnPreview {
  index: number;
  header: string;
  samples: string[];
  suggestedType: keyof ColumnMapping | null;
  confidence: number;
}

/**
 * تحليل العمود وتخمين نوعه بذكاء
 */
const analyzeColumn = (
  columnIndex: number,
  header: string,
  dataRows: any[][],
  maxSamples: number = 5
): ColumnPreview => {
  const headerLower = String(header || '').toLowerCase().trim();
  
  // جمع عينات من البيانات
  const samples = dataRows
    .slice(0, maxSamples)
    .map(row => String(row[columnIndex] || '').trim())
    .filter(val => val.length > 0);

  // قواعد التخمين الذكية
  let suggestedType: keyof ColumnMapping | null = null;
  let confidence = 0;

  // 1. تحليل رقم البند
  if (
    headerLower.match(/رقم|no|number|#|item.*no|م|تسلسل|الرقم.*تسلسل/i) &&
    samples.every(s => s.match(/^\d+$/))
  ) {
    suggestedType = 'itemNo';
    confidence = 0.95;
  }

  // 2. تحليل الوصف (نصوص طويلة)
  else if (
    headerLower.match(/وصف|بيان|description|item|بند|تفاصيل|مواصف/i) ||
    samples.some(s => s.length > 20 && !s.match(/^\d+$/))
  ) {
    suggestedType = 'description';
    confidence = headerLower.match(/وصف|description/i) ? 0.95 : 0.7;
  }

  // 3. تحليل الوحدة (نصوص قصيرة)
  else if (
    headerLower.match(/وحدة|unit|القياس/i) ||
    samples.every(s => s.length <= 5 && !s.match(/^\d+(\.\d+)?$/))
  ) {
    suggestedType = 'unit';
    confidence = headerLower.match(/وحدة|unit/i) ? 0.95 : 0.6;
  }

  // 4. تحليل الكمية (أرقام مع كسور)
  else if (
    headerLower.match(/كمية|quantity|qty/i) ||
    (samples.every(s => s.match(/^\d+(\.\d+)?$/)) && parseFloat(samples[0] || '0') < 10000)
  ) {
    suggestedType = 'quantity';
    confidence = headerLower.match(/كمية|quantity/i) ? 0.95 : 0.6;
  }

  // 5. تحليل سعر الوحدة (أرقام كبيرة نسبياً)
  else if (
    headerLower.match(/سعر.*وحدة|unit.*price|price|السعر/i) ||
    (samples.every(s => s.match(/^\d+(\.\d+)?$/)) && parseFloat(samples[0] || '0') > 100)
  ) {
    suggestedType = 'unitPrice';
    confidence = headerLower.match(/سعر|price/i) ? 0.95 : 0.5;
  }

  // 6. تحليل الإجمالي (أرقام كبيرة جداً)
  else if (
    headerLower.match(/إجمالي|total|amount|المبلغ|اجمالي/i) ||
    (samples.every(s => s.match(/^\d+(\.\d+)?$/)) && parseFloat(samples[0] || '0') > 10000)
  ) {
    suggestedType = 'total';
    confidence = headerLower.match(/إجمالي|total/i) ? 0.95 : 0.5;
  }

  // 7. تحليل الفئة/التصنيف
  else if (
    headerLower.match(/فئة|category|type|تصنيف|نوع/i)
  ) {
    suggestedType = 'category';
    confidence = 0.9;
  }

  return {
    index: columnIndex,
    header: header || `عمود ${columnIndex + 1}`,
    samples,
    suggestedType,
    confidence
  };
};

/**
 * مكون تحديد رؤوس الأعمدة
 */
export const BOQColumnMapper: React.FC<BOQColumnMapperProps> = ({ file, onMappingComplete, onCancel }) => {
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
  const [allRows, setAllRows] = useState<any[][]>([]);
  const [columnPreviews, setColumnPreviews] = useState<ColumnPreview[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    description: null,
    unit: null,
    quantity: null,
    unitPrice: null,
    total: null,
    itemNo: null,
    category: null
  });
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحميل وتحليل الملف
  useEffect(() => {
    const loadAndAnalyzeFile = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);

        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

            setAllRows(jsonData);

            // محاولة تحديد صف العناوين تلقائياً
            let detectedHeaderRow = 0;
            for (let i = 0; i < Math.min(10, jsonData.length); i++) {
              const row = jsonData[i];
              const rowStr = row.join('|').toLowerCase();
              if (
                rowStr.includes('وصف') || 
                rowStr.includes('description') || 
                rowStr.includes('كمية') || 
                rowStr.includes('quantity')
              ) {
                detectedHeaderRow = i;
                break;
              }
            }

            setHeaderRowIndex(detectedHeaderRow);
            analyzeColumns(jsonData, detectedHeaderRow);
            setIsAnalyzing(false);

          } catch (err) {
            setError('فشل في قراءة محتوى الملف');
            setIsAnalyzing(false);
          }
        };

        reader.onerror = () => {
          setError('فشل في تحميل الملف');
          setIsAnalyzing(false);
        };

        reader.readAsBinaryString(file);

      } catch (err) {
        setError('حدث خطأ غير متوقع');
        setIsAnalyzing(false);
      }
    };

    loadAndAnalyzeFile();
  }, [file]);

  // تحليل الأعمدة عند تغيير صف العناوين
  useEffect(() => {
    if (allRows.length > 0) {
      analyzeColumns(allRows, headerRowIndex);
    }
  }, [headerRowIndex, allRows]);

  /**
   * تحليل جميع الأعمدة
   */
  const analyzeColumns = (rows: any[][], headerRow: number) => {
    if (rows.length === 0 || headerRow >= rows.length) return;

    const headers = rows[headerRow];
    const dataRows = rows.slice(headerRow + 1);

    const previews: ColumnPreview[] = headers.map((header, index) => 
      analyzeColumn(index, header, dataRows, 5)
    );

    setColumnPreviews(previews);

    // اقتراح تعيين تلقائي بناءً على الثقة
    const autoMapping: ColumnMapping = {
      description: null,
      unit: null,
      quantity: null,
      unitPrice: null,
      total: null,
      itemNo: null,
      category: null
    };

    previews.forEach(preview => {
      if (preview.suggestedType && preview.confidence >= 0.7) {
        // تعيين العمود إذا لم يكن معيناً بالفعل
        if (autoMapping[preview.suggestedType] === null) {
          autoMapping[preview.suggestedType] = preview.index;
        }
      }
    });

    setMapping(autoMapping);
  };

  /**
   * تحديث التعيين عند اختيار المستخدم
   */
  const handleColumnSelect = (columnType: keyof ColumnMapping, columnIndex: number | null) => {
    setMapping(prev => ({
      ...prev,
      [columnType]: columnIndex
    }));
  };

  /**
   * التحقق من اكتمال التعيين الأساسي
   */
  const isValidMapping = (): boolean => {
    return (
      mapping.description !== null &&
      mapping.quantity !== null &&
      (mapping.unitPrice !== null || mapping.total !== null)
    );
  };

  /**
   * إنهاء التعيين
   */
  const handleComplete = () => {
    if (!isValidMapping()) {
      alert('الرجاء تحديد على الأقل: الوصف، الكمية، وأحد (سعر الوحدة أو الإجمالي)');
      return;
    }

    onMappingComplete(mapping, headerRowIndex);
  };

  /**
   * إعادة التحليل
   */
  const handleReanalyze = () => {
    if (allRows.length > 0) {
      analyzeColumns(allRows, headerRowIndex);
    }
  };

  /**
   * رسم خيار عمود واحد
   */
  const renderColumnOption = (
    label: string,
    type: keyof ColumnMapping,
    required: boolean = false
  ) => {
    const selectedIndex = mapping[type];
    const selectedPreview = columnPreviews.find(p => p.index === selectedIndex);

    return (
      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <select
          value={selectedIndex !== null ? selectedIndex : ''}
          onChange={(e) => handleColumnSelect(type, e.target.value ? parseInt(e.target.value) : null)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="">-- اختر العمود --</option>
          {columnPreviews.map(preview => (
            <option key={preview.index} value={preview.index}>
              {preview.header || `عمود ${preview.index + 1}`}
              {preview.suggestedType === type && ` ⭐ (${Math.round(preview.confidence * 100)}% ثقة)`}
            </option>
          ))}
        </select>

        {selectedPreview && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs">
            <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">عينات من البيانات:</p>
            <div className="space-y-1">
              {selectedPreview.samples.slice(0, 3).map((sample, idx) => (
                <p key={idx} className="text-gray-700 dark:text-gray-300 truncate">
                  • {sample || '(فارغ)'}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">جاري تحليل الملف...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">خطأ</h3>
        </div>
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileSpreadsheet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تحديد رؤوس الأعمدة</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">حدد الأعمدة المناسبة من ملف Excel</p>
        </div>
      </div>

      {/* Header Row Selection */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          صف العناوين (Header Row)
        </label>
        <div className="flex items-center gap-3">
          <select
            value={headerRowIndex}
            onChange={(e) => setHeaderRowIndex(parseInt(e.target.value))}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {allRows.slice(0, 10).map((_, index) => (
              <option key={index} value={index}>
                صف {index + 1}: {allRows[index]?.slice(0, 5).join(' | ').substring(0, 80)}...
              </option>
            ))}
          </select>
          <button
            onClick={handleReanalyze}
            className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة التحليل
          </button>
        </div>
      </div>

      {/* Column Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {renderColumnOption('وصف البند', 'description', true)}
        {renderColumnOption('وحدة القياس', 'unit', false)}
        {renderColumnOption('الكمية', 'quantity', true)}
        {renderColumnOption('سعر الوحدة', 'unitPrice', false)}
        {renderColumnOption('الإجمالي', 'total', false)}
        {renderColumnOption('رقم البند', 'itemNo', false)}
        {renderColumnOption('الفئة/التصنيف', 'category', false)}
      </div>

      {/* Validation Status */}
      <div className={`p-4 rounded-lg mb-6 ${
        isValidMapping() 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center gap-3">
          {isValidMapping() ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">التعيين صحيح ✓</p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  تم تحديد الحقول الأساسية بنجاح
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-300">التعيين غير مكتمل</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  الرجاء تحديد: الوصف، الكمية، وأحد (سعر الوحدة أو الإجمالي)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleComplete}
          disabled={!isValidMapping()}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          متابعة الاستيراد
        </button>
        
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
        >
          إلغاء
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 نصيحة:</strong> النظام يحاول التعرف على الأعمدة تلقائياً، لكن يمكنك تعديل أي اختيار حسب الحاجة.
          العلامة ⭐ تشير إلى الثقة العالية في التخمين التلقائي.
        </p>
      </div>
    </div>
  );
};

export default BOQColumnMapper;
