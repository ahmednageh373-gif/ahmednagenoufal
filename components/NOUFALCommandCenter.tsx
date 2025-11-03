/**
 * NOUFAL Command Center - مركز قيادة نوفل
 * واجهة موحدة للتحليل الذكي واليدوي للبنود
 */

import React, { useState, useCallback } from 'react';
import { Upload, Brain, Edit3, FileText, Download, Save, PlayCircle, Loader2, CheckCircle2, AlertCircle, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { FinancialItem } from '../types';
import { analyzeBOQ, type AnalyzedItem } from '../services/aiItemAnalyzer';
import { parsePDFFile } from '../services/pdfParser';

type AnalysisMode = 'ai' | 'manual' | 'hybrid';
type FileType = 'excel' | 'pdf' | 'manual';

interface AnalysisState {
  mode: AnalysisMode;
  items: FinancialItem[];
  analyzedItems: AnalyzedItem[];
  isAnalyzing: boolean;
  progress: number;
  selectedItem: AnalyzedItem | null;
}

export default function NOUFALCommandCenter() {
  const [state, setState] = useState<AnalysisState>({
    mode: 'ai',
    items: [],
    analyzedItems: [],
    isAnalyzing: false,
    progress: 0,
    selectedItem: null
  });

  const [fileType, setFileType] = useState<FileType>('excel');

  // معالج تحميل الملفات
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, isAnalyzing: true, progress: 10 }));

    try {
      let items: FinancialItem[] = [];

      if (file.name.endsWith('.pdf')) {
        // قراءة PDF
        const result = await parsePDFFile(file);
        if (result.success) {
          items = result.items;
        } else {
          alert(`خطأ في قراءة PDF: ${result.error}`);
          setState(prev => ({ ...prev, isAnalyzing: false, progress: 0 }));
          return;
        }
      } else {
        // قراءة Excel
        items = await parseExcelFile(file);
      }

      setState(prev => ({ ...prev, items, progress: 30 }));

      // بدء التحليل حسب الوضع المحدد
      if (state.mode === 'ai' || state.mode === 'hybrid') {
        await performAIAnalysis(items);
      } else {
        // الوضع اليدوي - عرض البنود للتحليل اليدوي
        setState(prev => ({ 
          ...prev, 
          isAnalyzing: false, 
          progress: 100,
          analyzedItems: items.map(item => ({
            ...item,
            analysis: {
              detectedActivity: null,
              breakdown: { activities: [], totalDuration: 0, criticalPath: [] },
              labor: { totalWorkers: 0, totalManDays: 0, totalCost: 0, breakdown: {} },
              materials: [],
              sbcCompliance: { applicableCodes: [], requirements: [], compliant: true, notes: [] },
              confidence: 0
            }
          }))
        }));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('حدث خطأ أثناء قراءة الملف');
      setState(prev => ({ ...prev, isAnalyzing: false, progress: 0 }));
    }
  }, [state.mode]);

  // قراءة Excel
  const parseExcelFile = async (file: File): Promise<FinancialItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

          // البحث عن صف العناوين
          let headerRow = -1;
          const keywords = ['رقم', 'وصف', 'بند', 'كمية', 'سعر', 'no', 'description', 'item'];
          
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && row.some((cell: any) => 
              keywords.some(keyword => String(cell).toLowerCase().includes(keyword))
            )) {
              headerRow = i;
              break;
            }
          }

          if (headerRow === -1) {
            headerRow = 0;
          }

          const items: FinancialItem[] = [];
          
          for (let i = headerRow + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const description = String(row[1] || row[2] || '').trim();
            const quantity = parseFloat(String(row[3] || row[4] || '0'));
            
            if (!description || quantity <= 0) continue;

            items.push({
              id: String(i),
              itemNumber: String(row[0] || i),
              description,
              quantity,
              unit: String(row[4] || row[5] || 'عدد'),
              unitPrice: parseFloat(String(row[5] || row[6] || '0')),
              totalPrice: parseFloat(String(row[6] || row[7] || '0')),
              category: 'عام'
            });
          }

          resolve(items);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  // تنفيذ التحليل بالذكاء الاصطناعي
  const performAIAnalysis = async (items: FinancialItem[]) => {
    setState(prev => ({ ...prev, progress: 40 }));

    try {
      const analyzedItems = await analyzeBOQ(items);
      
      setState(prev => ({
        ...prev,
        analyzedItems,
        isAnalyzing: false,
        progress: 100
      }));
    } catch (error) {
      console.error('Error analyzing items:', error);
      alert('حدث خطأ أثناء التحليل');
      setState(prev => ({ ...prev, isAnalyzing: false, progress: 0 }));
    }
  };

  // حساب الإحصائيات
  const stats = {
    totalItems: state.analyzedItems.length,
    avgConfidence: state.analyzedItems.length > 0 
      ? Math.round(state.analyzedItems.reduce((sum, item) => sum + item.analysis.confidence, 0) / state.analyzedItems.length)
      : 0,
    totalWorkers: state.analyzedItems.reduce((sum, item) => sum + item.analysis.labor.totalWorkers, 0),
    totalDuration: state.analyzedItems.reduce((sum, item) => sum + item.analysis.breakdown.totalDuration, 0),
    totalCost: state.analyzedItems.reduce((sum, item) => sum + item.analysis.labor.totalCost, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            مركز قيادة نوفل
          </h1>
          <p className="text-xl text-slate-300">
            محلل البنود الذكي | AI-Powered BOQ Analyzer
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setState(prev => ({ ...prev, mode: 'ai' }))}
            className={`p-6 rounded-2xl border-2 transition-all ${
              state.mode === 'ai'
                ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-400 shadow-lg shadow-cyan-500/50'
                : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
            }`}
          >
            <Brain className={`w-12 h-12 mx-auto mb-3 ${state.mode === 'ai' ? 'text-cyan-400' : 'text-slate-400'}`} />
            <h3 className="text-xl font-bold text-white mb-2">التحليل الذكي</h3>
            <p className="text-sm text-slate-300">استخدام Gemini AI</p>
          </button>

          <button
            onClick={() => setState(prev => ({ ...prev, mode: 'manual' }))}
            className={`p-6 rounded-2xl border-2 transition-all ${
              state.mode === 'manual'
                ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-400 shadow-lg shadow-purple-500/50'
                : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
            }`}
          >
            <Edit3 className={`w-12 h-12 mx-auto mb-3 ${state.mode === 'manual' ? 'text-purple-400' : 'text-slate-400'}`} />
            <h3 className="text-xl font-bold text-white mb-2">التحليل اليدوي</h3>
            <p className="text-sm text-slate-300">تحليل مخصص يدوياً</p>
          </button>

          <button
            onClick={() => setState(prev => ({ ...prev, mode: 'hybrid' }))}
            className={`p-6 rounded-2xl border-2 transition-all ${
              state.mode === 'hybrid'
                ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-400 shadow-lg shadow-amber-500/50'
                : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
            }`}
          >
            <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${state.mode === 'hybrid' ? 'text-amber-400' : 'text-slate-400'}`} />
            <h3 className="text-xl font-bold text-white mb-2">الوضع الهجين</h3>
            <p className="text-sm text-slate-300">AI + تحسينات يدوية</p>
          </button>
        </div>

        {/* File Upload */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">رفع الملف</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setFileType('excel')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  fileType === 'excel' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                Excel
              </button>
              <button
                onClick={() => setFileType('pdf')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  fileType === 'pdf' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setFileType('manual')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  fileType === 'manual' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                يدوي
              </button>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-cyan-400 transition-all cursor-pointer">
            <input
              type="file"
              accept={fileType === 'pdf' ? '.pdf' : '.xlsx,.xls,.csv'}
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
              <p className="text-xl text-white mb-2">
                اسحب الملف هنا أو انقر للتحميل
              </p>
              <p className="text-sm text-slate-400">
                {fileType === 'pdf' ? 'PDF Files' : 'Excel, CSV Files'}
              </p>
            </label>
          </div>

          {/* Progress Bar */}
          {state.isAnalyzing && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">جاري التحليل...</span>
                <span className="text-cyan-400">{state.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {state.analyzedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-6">
              <FileText className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-sm text-slate-300 mb-1">إجمالي البنود</p>
              <p className="text-3xl font-bold text-white">{stats.totalItems}</p>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-xl p-6">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-sm text-slate-300 mb-1">دقة التحليل</p>
              <p className="text-3xl font-bold text-white">{stats.avgConfidence}%</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-6">
              <Users className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-sm text-slate-300 mb-1">إجمالي العمالة</p>
              <p className="text-3xl font-bold text-white">{stats.totalWorkers}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-400/30 rounded-xl p-6">
              <Calendar className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-sm text-slate-300 mb-1">المدة (يوم)</p>
              <p className="text-3xl font-bold text-white">{stats.totalDuration}</p>
            </div>

            <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-400/30 rounded-xl p-6">
              <DollarSign className="w-8 h-8 text-red-400 mb-2" />
              <p className="text-sm text-slate-300 mb-1">تكلفة العمالة</p>
              <p className="text-3xl font-bold text-white">{(stats.totalCost / 1000).toFixed(1)}K</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        {state.analyzedItems.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">نتائج التحليل</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                  <Download className="w-4 h-4" />
                  تصدير Excel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                  <FileText className="w-4 h-4" />
                  طباعة PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-right py-4 px-4 text-slate-300 font-semibold">#</th>
                    <th className="text-right py-4 px-4 text-slate-300 font-semibold">البند</th>
                    <th className="text-right py-4 px-4 text-slate-300 font-semibold">الكمية</th>
                    <th className="text-right py-4 px-4 text-slate-300 font-semibold">الأنشطة</th>
                    <th className="text-right py-4 px-4 text-slate-300 font-semibold">العمالة</th>
                    <th className="text-right py-4 px-4 text-slate-300 font-semibold">المدة</th>
                    <th className="text-right py-4 px-4 text-slate-300 font-semibold">الدقة</th>
                  </tr>
                </thead>
                <tbody>
                  {state.analyzedItems.slice(0, 20).map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-700 hover:bg-slate-700/30 cursor-pointer transition-all"
                      onClick={() => setState(prev => ({ ...prev, selectedItem: item }))}
                    >
                      <td className="py-4 px-4 text-slate-400">{item.itemNumber}</td>
                      <td className="py-4 px-4 text-white">{item.description}</td>
                      <td className="py-4 px-4 text-slate-300">{item.quantity} {item.unit}</td>
                      <td className="py-4 px-4 text-cyan-400">{item.analysis.breakdown.activities.length}</td>
                      <td className="py-4 px-4 text-purple-400">{item.analysis.labor.totalWorkers}</td>
                      <td className="py-4 px-4 text-amber-400">{item.analysis.breakdown.totalDuration} يوم</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.analysis.confidence >= 90 ? 'bg-green-600/20 text-green-400' :
                          item.analysis.confidence >= 70 ? 'bg-blue-600/20 text-blue-400' :
                          'bg-amber-600/20 text-amber-400'
                        }`}>
                          {item.analysis.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
