/**
 * AutoCAD Integration Hub - مركز تكامل AutoCAD
 * 
 * الربط الشامل بين جميع وحدات AutoCAD:
 * - DWGParser-Enhanced.js (المحلل المُحسّن)
 * - ScheduleParser.js (محلل الجداول)
 * - 2Dto3DConverter.js (محول 2D → 3D)
 * - LayerExtractor.js (مستخرج الطبقات)
 * 
 * @version 2.0.0
 * @author Ahmed Nageh
 * @date 2024-11-14
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    FileUp, 
    Layers, 
    Box, 
    Table2, 
    Download, 
    Eye, 
    Settings, 
    AlertCircle, 
    CheckCircle, 
    FileText,
    Loader2,
    Upload,
    FolderOpen,
    BarChart3,
    Package,
    Clock,
    TrendingUp,
    Save,
    Trash2,
    RefreshCw,
    Info
} from 'lucide-react';

// ==================== TYPES ====================

interface ImportOptions {
    normalizeUnits: boolean;
    validateData: boolean;
    extractTables: boolean;
    convertTo3D: boolean;
    detectOpenings: boolean;
    applySchedules: boolean;
    targetUnit: string;
}

interface ImportResult {
    success: boolean;
    fileHash?: string;
    fromCache?: boolean;
    entities?: any[];
    layers?: any[];
    tables?: any[];
    converted3D?: any[];
    schedules?: any;
    statistics?: {
        totalFiles: number;
        totalEntities: number;
        totalLayers: number;
        totalTables: number;
        total3DElements: number;
        processingTime: number;
    };
    warnings?: string[];
    errors?: string[];
    logs?: any[];
}

interface FileItem {
    file: File;
    status: 'pending' | 'processing' | 'success' | 'error';
    progress: number;
    result?: ImportResult;
    error?: string;
}

// ==================== MAIN COMPONENT ====================

export const AutoCADIntegrationHub: React.FC = () => {
    // ===== State Management =====
    const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [options, setOptions] = useState<ImportOptions>({
        normalizeUnits: true,
        validateData: true,
        extractTables: true,
        convertTo3D: true,
        detectOpenings: true,
        applySchedules: true,
        targetUnit: 'Millimeters'
    });
    const [overallProgress, setOverallProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [finalResults, setFinalResults] = useState<ImportResult | null>(null);
    const [viewMode, setViewMode] = useState<'3d' | 'layers' | 'tables' | 'schedules'>('3d');

    // Refs for dynamic script loading
    const parsersLoaded = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ===== Dynamic Script Loading =====
    useEffect(() => {
        const loadScripts = async () => {
            if (parsersLoaded.current) return;

            try {
                // Load DWGParser-Enhanced
                const dwgScript = document.createElement('script');
                dwgScript.src = '/DWGParser-Enhanced.js';
                dwgScript.async = true;
                document.body.appendChild(dwgScript);

                // Load ScheduleParser
                const scheduleScript = document.createElement('script');
                scheduleScript.src = '/ScheduleParser.js';
                scheduleScript.async = true;
                document.body.appendChild(scheduleScript);

                // Load 2Dto3DConverter
                const converterScript = document.createElement('script');
                converterScript.src = '/2Dto3DConverter.js';
                converterScript.async = true;
                document.body.appendChild(converterScript);

                // Wait for all scripts to load
                await Promise.all([
                    new Promise((resolve) => { dwgScript.onload = resolve; }),
                    new Promise((resolve) => { scheduleScript.onload = resolve; }),
                    new Promise((resolve) => { converterScript.onload = resolve; })
                ]);

                parsersLoaded.current = true;
                console.log('✅ جميع محللات AutoCAD تم تحميلها بنجاح');
            } catch (error) {
                console.error('❌ خطأ في تحميل محللات AutoCAD:', error);
            }
        };

        loadScripts();
    }, []);

    // ===== File Handling =====
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const validFiles = files.filter(file => {
            const ext = file.name.toLowerCase();
            return ext.endsWith('.dxf') || ext.endsWith('.xlsx') || ext.endsWith('.xls');
        });

        const fileItems: FileItem[] = validFiles.map((file: File) => ({
            file,
            status: 'pending' as const,
            progress: 0
        }));

        setSelectedFiles(prev => [...prev, ...fileItems]);
        setCurrentStep(2);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        
        const validFiles = files.filter(file => {
            const ext = file.name.toLowerCase();
            return ext.endsWith('.dxf') || ext.endsWith('.xlsx') || ext.endsWith('.xls');
        });

        const fileItems: FileItem[] = validFiles.map((file: File) => ({
            file,
            status: 'pending' as const,
            progress: 0
        }));

        setSelectedFiles(prev => [...prev, ...fileItems]);
        setCurrentStep(2);
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }, []);

    const removeFile = useCallback((index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearAllFiles = useCallback(() => {
        setSelectedFiles([]);
        setFinalResults(null);
        setCurrentStep(1);
        setOverallProgress(0);
    }, []);

    // ===== Main Import Process =====
    const startImport = useCallback(async () => {
        if (!parsersLoaded.current) {
            alert('⚠️ جاري تحميل المحللات، يرجى الانتظار...');
            return;
        }

        setIsProcessing(true);
        setCurrentStep(3);
        setOverallProgress(0);
        setProgressMessage('جاري بدء عملية الاستيراد...');

        try {
            // @ts-ignore - Loaded dynamically
            const EnhancedDWGParser = window.EnhancedDWGParser;
            // @ts-ignore
            const ScheduleParser = window.ScheduleParser;
            // @ts-ignore
            const TwoDToThreeDConverter = window.TwoDToThreeDConverter;

            if (!EnhancedDWGParser || !ScheduleParser) {
                throw new Error('المحللات غير محملة بشكل صحيح');
            }

            const parser = new EnhancedDWGParser();
            const scheduleParser = new ScheduleParser();

            const allEntities: any[] = [];
            const allLayers: any[] = [];
            const allTables: any[] = [];
            const allWarnings: string[] = [];
            const allErrors: string[] = [];
            const startTime = Date.now();

            // Process each file
            for (let i = 0; i < selectedFiles.length; i++) {
                const fileItem = selectedFiles[i];
                setProgressMessage(`جاري معالجة الملف ${i + 1} من ${selectedFiles.length}: ${fileItem.file.name}`);

                // Update file status
                setSelectedFiles(prev => {
                    const updated = [...prev];
                    updated[i].status = 'processing';
                    return updated;
                });

                try {
                    if (fileItem.file.name.toLowerCase().endsWith('.dxf')) {
                        // Process DXF file
                        const result = await parser.importFile(fileItem.file, {
                            ...options,
                            onProgress: (percent: number, message: string) => {
                                setSelectedFiles(prev => {
                                    const updated = [...prev];
                                    updated[i].progress = percent;
                                    return updated;
                                });
                                setOverallProgress(((i + percent / 100) / selectedFiles.length) * 100);
                                setProgressMessage(message);
                            }
                        });

                        if (result.entities) allEntities.push(...result.entities);
                        if (result.layers) allLayers.push(...result.layers);
                        if (result.tables) allTables.push(...result.tables);
                        if (result.warnings) allWarnings.push(...result.warnings);
                        if (result.errors) allErrors.push(...result.errors);

                        setSelectedFiles(prev => {
                            const updated = [...prev];
                            updated[i].status = 'success';
                            updated[i].progress = 100;
                            updated[i].result = result;
                            return updated;
                        });
                    } else {
                        // Process Excel file
                        setProgressMessage(`جاري معالجة ملف Excel: ${fileItem.file.name}`);
                        const tables = await scheduleParser.parseExcelFile(fileItem.file);
                        allTables.push(...tables);

                        setSelectedFiles(prev => {
                            const updated = [...prev];
                            updated[i].status = 'success';
                            updated[i].progress = 100;
                            return updated;
                        });
                    }
                } catch (error: any) {
                    console.error(`خطأ في معالجة الملف ${fileItem.file.name}:`, error);
                    allErrors.push(`خطأ في ${fileItem.file.name}: ${error.message}`);
                    
                    setSelectedFiles(prev => {
                        const updated = [...prev];
                        updated[i].status = 'error';
                        updated[i].error = error.message;
                        return updated;
                    });
                }
            }

            // Parse all schedules
            setProgressMessage('جاري تحليل الجداول والجدولة...');
            const schedules = await scheduleParser.parseAllSchedules(allTables);

            // Convert to 3D if enabled
            let converted3D: any[] = [];
            if (options.convertTo3D && allEntities.length > 0) {
                setProgressMessage('جاري التحويل إلى 3D...');
                // Note: Requires Babylon.js engine - would need to be initialized
                // converted3D = await converter.convertAll(parser, options);
                allWarnings.push('⚠️ التحويل إلى 3D يتطلب محرك Babylon.js - سيتم تفعيله عند التكامل مع المشهد 3D');
            }

            // Apply schedules if enabled
            if (options.applySchedules && converted3D.length > 0) {
                setProgressMessage('جاري تطبيق الجداول على العناصر...');
                scheduleParser.applySchedulesToElements(converted3D);
            }

            const processingTime = Date.now() - startTime;

            // Compile final results
            const finalResult: ImportResult = {
                success: true,
                entities: allEntities,
                layers: allLayers,
                tables: allTables,
                converted3D: converted3D,
                schedules: schedules,
                statistics: {
                    totalFiles: selectedFiles.length,
                    totalEntities: allEntities.length,
                    totalLayers: allLayers.length,
                    totalTables: allTables.length,
                    total3DElements: converted3D.length,
                    processingTime: processingTime
                },
                warnings: allWarnings,
                errors: allErrors,
                logs: parser.logger.export()
            };

            setFinalResults(finalResult);
            setCurrentStep(4);
            setOverallProgress(100);
            setProgressMessage('✅ تمت عملية الاستيراد بنجاح!');

        } catch (error: any) {
            console.error('خطأ في عملية الاستيراد:', error);
            setProgressMessage(`❌ خطأ: ${error.message}`);
            alert(`حدث خطأ في عملية الاستيراد:\n${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    }, [selectedFiles, options]);

    // ===== Options Handlers =====
    const toggleOption = useCallback((key: keyof ImportOptions) => {
        setOptions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    }, []);

    // ===== Download Report =====
    const downloadReport = useCallback(() => {
        if (!finalResults) return;

        const report = {
            timestamp: new Date().toISOString(),
            options: options,
            statistics: finalResults.statistics,
            warnings: finalResults.warnings,
            errors: finalResults.errors,
            logs: finalResults.logs
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autocad-import-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [finalResults, options]);

    // ===== Render =====
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
                            { num: 3, label: 'جاري المعالجة', icon: <Loader2 size={20} /> },
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
                            onClick={() => fileInputRef.current?.click()}
                            className="border-4 border-dashed border-blue-300 dark:border-blue-700 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all"
                        >
                            <input
                                ref={fileInputRef}
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

                {/* Step 2: Options & File List */}
                {currentStep >= 2 && currentStep < 4 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Options Panel */}
                        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <Settings size={24} />
                                إعدادات الاستيراد
                            </h3>
                            
                            <div className="space-y-4">
                                {Object.entries({
                                    normalizeUnits: 'توحيد الوحدات',
                                    validateData: 'التحقق من صحة البيانات',
                                    extractTables: 'استخراج الجداول',
                                    convertTo3D: 'التحويل إلى 3D',
                                    detectOpenings: 'كشف الفتحات',
                                    applySchedules: 'تطبيق الجداول'
                                }).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={options[key as keyof ImportOptions] as boolean}
                                            onChange={() => toggleOption(key as keyof ImportOptions)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 dark:text-gray-200 font-medium">{label}</span>
                                    </label>
                                ))}

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        الوحدة المستهدفة
                                    </label>
                                    <select
                                        value={options.targetUnit}
                                        onChange={(e) => setOptions(prev => ({ ...prev, targetUnit: e.target.value }))}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                                    >
                                        <option value="Millimeters">ملليمتر (mm)</option>
                                        <option value="Centimeters">سنتيمتر (cm)</option>
                                        <option value="Meters">متر (m)</option>
                                        <option value="Inches">بوصة (in)</option>
                                        <option value="Feet">قدم (ft)</option>
                                    </select>
                                </div>
                            </div>

                            {currentStep === 2 && (
                                <button
                                    onClick={startImport}
                                    disabled={selectedFiles.length === 0}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                                >
                                    بدء الاستيراد
                                </button>
                            )}
                        </div>

                        {/* Files List */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FileText size={24} />
                                    الملفات المحددة ({selectedFiles.length})
                                </h3>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center gap-2"
                                >
                                    <Upload size={18} />
                                    إضافة ملفات
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {isProcessing && (
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                            {progressMessage}
                                        </span>
                                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                            {overallProgress.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 rounded-full"
                                            style={{ width: `${overallProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {selectedFiles.map((fileItem, index) => (
                                    <div
                                        key={index}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all
                                            ${fileItem.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : ''}
                                            ${fileItem.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : ''}
                                            ${fileItem.status === 'processing' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : ''}
                                            ${fileItem.status === 'pending' ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600' : ''}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`
                                                    p-2 rounded-lg
                                                    ${fileItem.status === 'success' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : ''}
                                                    ${fileItem.status === 'error' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : ''}
                                                    ${fileItem.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : ''}
                                                    ${fileItem.status === 'pending' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
                                                `}>
                                                    {fileItem.status === 'success' && <CheckCircle size={20} />}
                                                    {fileItem.status === 'error' && <AlertCircle size={20} />}
                                                    {fileItem.status === 'processing' && <Loader2 size={20} className="animate-spin" />}
                                                    {fileItem.status === 'pending' && <FileText size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800 dark:text-white">
                                                        {fileItem.file.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {(fileItem.file.size / 1024).toFixed(2)} KB
                                                    </div>
                                                    {fileItem.status === 'processing' && (
                                                        <div className="mt-2">
                                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-600 transition-all duration-300"
                                                                    style={{ width: `${fileItem.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {fileItem.error && (
                                                        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                            {fileItem.error}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {fileItem.status === 'pending' && (
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Results */}
                {currentStep === 4 && finalResults && (
                    <div className="space-y-6">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                { label: 'الملفات', value: finalResults.statistics?.totalFiles || 0, icon: <FileText size={24} />, color: 'blue' },
                                { label: 'العناصر', value: finalResults.statistics?.totalEntities || 0, icon: <Package size={24} />, color: 'green' },
                                { label: 'الطبقات', value: finalResults.statistics?.totalLayers || 0, icon: <Layers size={24} />, color: 'purple' },
                                { label: 'الجداول', value: finalResults.statistics?.totalTables || 0, icon: <Table2 size={24} />, color: 'orange' },
                                { label: 'عناصر 3D', value: finalResults.statistics?.total3DElements || 0, icon: <Box size={24} />, color: 'pink' }
                            ].map((stat, index) => (
                                <div key={index} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-${stat.color}-500`}>
                                    <div className={`text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    الإجراءات
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={downloadReport}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <Download size={18} />
                                        تحميل التقرير
                                    </button>
                                    <button
                                        onClick={clearAllFiles}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <Upload size={18} />
                                        استيراد جديد
                                    </button>
                                </div>
                            </div>

                            {/* View Mode Tabs */}
                            <div className="flex gap-2 mb-6 overflow-x-auto">
                                {[
                                    { mode: '3d' as const, label: 'عناصر 3D', icon: <Box size={18} /> },
                                    { mode: 'layers' as const, label: 'الطبقات', icon: <Layers size={18} /> },
                                    { mode: 'tables' as const, label: 'الجداول', icon: <Table2 size={18} /> },
                                    { mode: 'schedules' as const, label: 'الجدولة', icon: <Clock size={18} /> }
                                ].map(tab => (
                                    <button
                                        key={tab.mode}
                                        onClick={() => setViewMode(tab.mode)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap
                                            ${viewMode === tab.mode 
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                                        `}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* View Content */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 min-h-96">
                                {viewMode === '3d' && (
                                    <div className="text-center py-12">
                                        <Box className="mx-auto mb-4 text-gray-400" size={64} />
                                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                            عرض العناصر ثلاثية الأبعاد
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            تم تحويل {finalResults.statistics?.total3DElements || 0} عنصر إلى 3D
                                        </p>
                                        <div className="text-sm text-gray-500 dark:text-gray-500">
                                            💡 سيتم عرض العناصر في محرك Babylon.js عند التكامل الكامل
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'layers' && (
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                            الطبقات المكتشفة ({finalResults.layers?.length || 0})
                                        </h4>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {finalResults.layers?.slice(0, 20).map((layer: any, index: number) => (
                                                <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-between">
                                                    <span className="font-semibold text-gray-800 dark:text-white">
                                                        {layer.name || `طبقة ${index + 1}`}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {layer.entityCount || 0} عنصر
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'tables' && (
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                            الجداول المستخرجة ({finalResults.tables?.length || 0})
                                        </h4>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            {finalResults.tables?.length === 0 ? (
                                                <p>لم يتم العثور على جداول</p>
                                            ) : (
                                                <p>تم استخراج {finalResults.tables?.length} جدول بنجاح</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'schedules' && (
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                            تحليل الجدولة
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {finalResults.schedules && Object.entries(finalResults.schedules).map(([key, value]: [string, any]) => (
                                                <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                                                    <h5 className="font-bold text-gray-800 dark:text-white mb-2 capitalize">
                                                        {key}
                                                    </h5>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {Array.isArray(value) ? `${value.length} عنصر` : 'بيانات متاحة'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Warnings and Errors */}
                            {(finalResults.warnings && finalResults.warnings.length > 0) && (
                                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="text-yellow-600 dark:text-yellow-400" size={20} />
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200">
                                            تحذيرات ({finalResults.warnings.length})
                                        </h4>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                        {finalResults.warnings.map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {(finalResults.errors && finalResults.errors.length > 0) && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                                        <h4 className="font-bold text-red-800 dark:text-red-200">
                                            أخطاء ({finalResults.errors.length})
                                        </h4>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                                        {finalResults.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoCADIntegrationHub;
