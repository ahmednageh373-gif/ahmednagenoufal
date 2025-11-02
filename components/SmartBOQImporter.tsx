/**
 * مستورد ذكي للمقايسات مع التصنيف التلقائي
 * Smart BOQ Importer with Auto-Classification
 * 
 * @component SmartBOQImporter
 * @version 1.0.0
 * 
 * هذا المكون يجمع بين:
 * - استيراد ملفات Excel
 * - التصنيف الذكي التلقائي
 * - عرض الإحصائيات والتقارير
 */

import React, { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet, Sparkles } from 'lucide-react';
import { classifyItems, type ClassifiedFinancialItem } from '../intelligence/ItemClassifier';
import { BOQClassificationView } from './BOQClassificationView';
import type { FinancialItem } from '../types';

declare var XLSX: any;

// ============================
// Interfaces
// ============================

interface SmartBOQImporterProps {
    onImportSuccess?: (items: ClassifiedFinancialItem[]) => void;
    onError?: (error: Error) => void;
}

interface ImportStats {
    totalItems: number;
    successfulClassifications: number;
    lowConfidenceCount: number;
    processingTime: number;
}

// ============================
// Helper Function - Excel Parser
// ============================

const parseExcel = (file: File): Promise<FinancialItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const headerKeywords = [
                    { keys: ['رقم', 'item', 'no', 'بند'], col: 'id' },
                    { keys: ['وصف', 'description', 'بند'], col: 'description' },
                    { keys: ['وحدة', 'unit'], col: 'unit' },
                    { keys: ['كمية', 'quantity', 'qty'], col: 'quantity' },
                    { keys: ['سعر', 'price', 'unit price'], col: 'unitPrice' },
                    { keys: ['إجمالي', 'total', 'amount'], col: 'total' },
                ];

                let headerRowIndex = -1;
                let colMapping: { [key: string]: number } = {};

                // Find header row
                for (let i = 0; i < json.length && headerRowIndex === -1; i++) {
                    const row = json[i];
                    for (let j = 0; j < row.length; j++) {
                        const cell = String(row[j] || '').toLowerCase().trim();
                        for (const keyword of headerKeywords) {
                            if (keyword.keys.some(k => cell.includes(k))) {
                                colMapping[keyword.col] = j;
                                headerRowIndex = i;
                                break;
                            }
                        }
                    }
                }

                if (headerRowIndex === -1 || Object.keys(colMapping).length < 4) {
                    return reject(new Error('فشل في تحديد رؤوس الأعمدة. الرجاء التأكد من تنسيق الملف.'));
                }

                // Extract data rows
                const items: FinancialItem[] = [];
                let itemIdCounter = 1;

                for (let i = headerRowIndex + 1; i < json.length; i++) {
                    const row = json[i];
                    
                    const description = String(row[colMapping['description']] || '').trim();
                    const unit = String(row[colMapping['unit']] || '').trim();
                    const quantity = Number(row[colMapping['quantity']]) || 0;
                    const unitPrice = Number(row[colMapping['unitPrice']]) || 0;
                    const total = colMapping['total'] !== undefined 
                        ? Number(row[colMapping['total']]) || (quantity * unitPrice)
                        : (quantity * unitPrice);
                    const id = colMapping['id'] !== undefined 
                        ? String(row[colMapping['id']] || '').trim()
                        : `f-import-${itemIdCounter}`;

                    if (description && (quantity > 0 || total > 0)) {
                        items.push({
                            id: id || `f-import-${itemIdCounter++}`,
                            item: description,
                            unit: unit,
                            quantity: quantity,
                            unitPrice: unitPrice,
                            total: total,
                        });
                        itemIdCounter++;
                    }
                }
                
                if (items.length === 0) {
                    return reject(new Error('لم يتم العثور على بنود صالحة في الملف.'));
                }
                
                resolve(items);
            } catch (error) { 
                reject(new Error('فشل في تحليل ملف Excel.')); 
            }
        };
        
        reader.onerror = () => reject(new Error('فشل في قراءة الملف.'));
        reader.readAsArrayBuffer(file);
    });
};

// ============================
// Main Component
// ============================

export const SmartBOQImporter: React.FC<SmartBOQImporterProps> = ({
    onImportSuccess,
    onError
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [items, setItems] = useState<ClassifiedFinancialItem[]>([]);
    const [stats, setStats] = useState<ImportStats | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        
        if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
            setError(null);
            setSuccess(false);
        } else {
            setFile(null);
            setError('صيغة الملف غير مدعومة. الرجاء اختيار ملف Excel (.xlsx)');
        }
    }, []);

    const handleImport = useCallback(async () => {
        if (!file) {
            setError('الرجاء اختيار ملف أولاً.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);
        
        const startTime = performance.now();

        try {
            // 1. قراءة ملف Excel
            console.log('📖 قراءة ملف Excel...');
            const rawItems = await parseExcel(file);
            console.log(`✅ تم استخراج ${rawItems.length} بند`);

            // 2. تطبيق التصنيف الذكي
            console.log('🤖 تطبيق التصنيف الذكي...');
            const classifiedItems = classifyItems(rawItems);
            console.log(`✅ تم تصنيف ${classifiedItems.length} بند`);

            // 3. حساب الإحصائيات
            const lowConfidenceCount = classifiedItems.filter(
                item => item.classification.confidence < 0.5
            ).length;

            const processingTime = performance.now() - startTime;

            const importStats: ImportStats = {
                totalItems: classifiedItems.length,
                successfulClassifications: classifiedItems.length - lowConfidenceCount,
                lowConfidenceCount,
                processingTime
            };

            // 4. حفظ النتائج
            setItems(classifiedItems);
            setStats(importStats);
            setSuccess(true);
            setActiveTab('results');

            // 5. استدعاء callback
            if (onImportSuccess) {
                onImportSuccess(classifiedItems);
            }

            console.log('🎉 اكتمل الاستيراد والتصنيف!');
            console.log('📊 الإحصائيات:', importStats);

        } catch (err: any) {
            const errorMessage = err.message || 'فشل في معالجة الملف';
            setError(errorMessage);
            
            if (onError) {
                onError(err);
            }
            
            console.error('❌ خطأ في الاستيراد:', err);
        } finally {
            setIsLoading(false);
        }
    }, [file, onImportSuccess, onError]);

    const handleReset = useCallback(() => {
        setFile(null);
        setItems([]);
        setStats(null);
        setError(null);
        setSuccess(false);
        setActiveTab('upload');
    }, []);

    return (
        <div className="space-y-6">
            {/* العنوان والتبويبات */}
            <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                    مستورد المقايسات الذكي
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    استيراد ملفات Excel مع تصنيف تلقائي للبنود وحساب الهدر
                </p>

                {items.length > 0 && (
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'upload'
                                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            رفع ملف
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'results'
                                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            النتائج والتحليل
                        </button>
                    </div>
                )}
            </div>

            {/* منطقة الرفع */}
            {activeTab === 'upload' && (
                <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center mb-4">
                        <Upload className="w-5 h-5 ml-2" />
                        <h3 className="text-lg font-semibold">استيراد ملف Excel</h3>
                    </div>

                    <div className="space-y-4">
                        {/* منطقة اختيار الملف */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                اختر ملف المقايسة (.xlsx)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".xlsx"
                                    disabled={isLoading}
                                    className="w-full p-3 border-2 border-dashed rounded-lg cursor-pointer
                                             hover:border-indigo-400 transition-colors
                                             dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            
                            {file && (
                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* رسائل الحالة */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-400">
                                        خطأ في الاستيراد
                                    </p>
                                    <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {success && stats && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                        نجح الاستيراد والتصنيف!
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                                        تم معالجة {stats.totalItems} بند في {(stats.processingTime / 1000).toFixed(2)} ثانية
                                    </p>
                                    {stats.lowConfidenceCount > 0 && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                            ⚠️ {stats.lowConfidenceCount} بند يحتاج مراجعة (ثقة منخفضة)
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* أزرار الإجراءات */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleImport}
                                disabled={!file || isLoading}
                                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg 
                                         hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                                         font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        جاري المعالجة...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        استيراد وتصنيف ذكي
                                    </>
                                )}
                            </button>

                            {(success || error) && (
                                <button
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                                             hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                >
                                    إعادة تعيين
                                </button>
                            )}
                        </div>

                        {/* معلومات مفيدة */}
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">💡 نصائح:</h4>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• تأكد من وجود عناوين واضحة في الصف الأول أو الثاني</li>
                                <li>• استخدم أسماء عربية أو إنجليزية للأعمدة: الوصف، الكمية، الوحدة، السعر</li>
                                <li>• سيتم تصنيف البنود تلقائياً حسب نوعها (خرسانة، حديد، بلاط، إلخ)</li>
                                <li>• سيتم حساب نسبة الهدر المناسبة لكل فئة تلقائياً</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* منطقة النتائج */}
            {activeTab === 'results' && items.length > 0 && (
                <BOQClassificationView items={items} />
            )}
        </div>
    );
};

export default SmartBOQImporter;
