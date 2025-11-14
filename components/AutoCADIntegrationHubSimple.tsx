/**
 * AutoCAD Integration Hub - Simple Version
 * نسخة مبسطة وآمنة من مركز تكامل AutoCAD
 */

import React, { useState } from 'react';
import { 
    FileUp, 
    Layers, 
    Box, 
    Table2, 
    Download,
    Settings, 
    AlertCircle, 
    CheckCircle, 
    FileText,
    Upload,
    FolderOpen,
    Package,
    Clock,
    RefreshCw,
    Info
} from 'lucide-react';

export const AutoCADIntegrationHubSimple: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const validFiles = files.filter(file => {
            const ext = file.name.toLowerCase();
            return ext.endsWith('.dxf') || ext.endsWith('.xlsx') || ext.endsWith('.xls');
        });
        setSelectedFiles(validFiles);
        if (validFiles.length > 0) {
            setCurrentStep(2);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const validFiles = files.filter(file => {
            const ext = file.name.toLowerCase();
            return ext.endsWith('.dxf') || ext.endsWith('.xlsx') || ext.endsWith('.xls');
        });
        setSelectedFiles(validFiles);
        if (validFiles.length > 0) {
            setCurrentStep(2);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllFiles = () => {
        setSelectedFiles([]);
        setCurrentStep(1);
    };

    const startImport = () => {
        alert('🚧 وظيفة الاستيراد قيد التطوير\n\nالمحللات الكاملة متاحة في:\n• DWGParser-Enhanced.js\n• ScheduleParser.js\n• 2Dto3DConverter.js\n\nيمكنك استخدام AutoCADImporter.html للاستيراد الكامل');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 p-6" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg">
                                <FileUp className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                                    مركز تكامل AutoCAD
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    استيراد وتحليل ملفات DXF وExcel بذكاء
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearAllFiles}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                        >
                            <RefreshCw size={18} />
                            <span>مسح الكل</span>
                        </button>
                    </div>

                    {/* Process Steps */}
                    <div className="flex items-center justify-between mt-8 relative">
                        {[
                            { num: 1, label: 'اختر الملفات', icon: <FolderOpen size={20} /> },
                            { num: 2, label: 'اضبط الإعدادات', icon: <Settings size={20} /> },
                            { num: 3, label: 'جاري المعالجة', icon: <Package size={20} /> },
                            { num: 4, label: 'النتائج', icon: <CheckCircle size={20} /> }
                        ].map((step, index) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center z-10">
                                    <div className={`
                                        w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                                        ${currentStep >= step.num 
                                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                                    `}>
                                        {currentStep > step.num ? <CheckCircle size={24} /> : step.icon}
                                    </div>
                                    <span className={`mt-2 text-sm font-semibold ${currentStep >= step.num ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < 3 && (
                                    <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                                        currentStep > step.num 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Step 1: File Upload */}
                {currentStep === 1 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => document.getElementById('fileInput')?.click()}
                            className="border-4 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all"
                        >
                            <input
                                id="fileInput"
                                type="file"
                                multiple
                                accept=".dxf,.xlsx,.xls"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Upload className="mx-auto mb-4 text-blue-500" size={64} />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                اسحب الملفات هنا أو انقر للاختيار
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                الصيغ المدعومة: DXF, XLSX, XLS
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                                    ✓ AutoCAD DXF
                                </span>
                                <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                                    ✓ Microsoft Excel
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: File List & Settings */}
                {currentStep >= 2 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <FileText size={24} />
                            الملفات المحددة ({selectedFiles.length})
                        </h3>

                        <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 dark:text-white">
                                                    {file.name}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {(file.size / 1024).toFixed(2)} KB
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => document.getElementById('fileInput')?.click()}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                إضافة المزيد
                            </button>
                            <button
                                onClick={startImport}
                                disabled={selectedFiles.length === 0}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                            >
                                بدء الاستيراد
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-semibold mb-1">للاستخدام الكامل:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>افتح <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">AutoCADImporter.html</code> في المتصفح</li>
                                        <li>أو استخدم المحللات مباشرة: <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">DWGParser-Enhanced.js</code></li>
                                        <li>التوثيق الكامل في: <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">AUTOCAD-INTEGRATION-GUIDE.md</code></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoCADIntegrationHubSimple;
