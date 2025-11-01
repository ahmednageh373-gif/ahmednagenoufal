import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Project, FinancialItem, ScheduleTask, ScheduleTaskStatus, ScheduleTaskPriority } from './types';
import { Upload, FileText, Table, Clock, DollarSign, Download, PlusCircle, Trash2, Search } from 'lucide-react';

declare var XLSX: any;
declare var pdfjsLib: any;

// Set worker source for pdfjs-dist
if (typeof window !== 'undefined' && typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// --- Helper Functions ---

// Helper function for Excel export (BOQ)
const exportToExcel = (data: FinancialItem[], fileName: string) => {
    const exportData = data.map(item => ({
        'الرقم التسلسلي': item.itemNumber || '',
        'الكود': item.code || '',
        'الفئة': item.category || '',
        'رقم البند': item.id,
        'الوصف': item.item,
        'الوحدة': item.unit,
        'الكمية': item.quantity,
        'سعر الوحدة': item.unitPrice,
        'الإجمالي': item.total,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المقايسة');
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// دالة لاستخراج البيانات من Excel مع إمكانية التحديد اليدوي
const parseExcelWithMapping = (
    file: File, 
    manualMapping?: { [key: string]: number },
    headerRow?: number,
    onProgress?: (progress: number) => void
): Promise<{ items: FinancialItem[], previewData?: any[], headers?: string[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                onProgress?.(10);
                
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                onProgress?.(30);
                
                const workbook = XLSX.read(data, { 
                    type: 'array',
                    cellDates: false,
                    cellNF: false,
                    cellStyles: false
                });
                
                onProgress?.(50);
                
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { 
                    header: 1,
                    defval: '',
                    blankrows: false
                });

                onProgress?.(70);

                // إذا كان هناك mapping يدوي
                if (manualMapping && headerRow !== undefined) {
                    const items = extractItemsWithMapping(json, manualMapping, headerRow);
                    onProgress?.(100);
                    resolve({ items });
                    return;
                }

                // محاولة الكشف التلقائي
                const autoResult = attemptAutoDetection(json);
                
                if (autoResult.success) {
                    onProgress?.(100);
                    resolve({ items: autoResult.items });
                } else {
                    // إرجاع بيانات للمعاينة والتحديد اليدوي
                    resolve({ 
                        items: [], 
                        previewData: json.slice(0, 10),
                        headers: json[0] || []
                    });
                }
            } catch (error) { 
                reject(new Error('فشل في تحليل ملف Excel.')); 
            }
        };
        reader.onerror = () => reject(new Error('فشل في قراءة الملف.'));
        reader.readAsArrayBuffer(file);
    });
};

// دالة الكشف التلقائي
const attemptAutoDetection = (json: any[]): { success: boolean, items: FinancialItem[], headerRowIndex?: number, colMapping?: any } => {
    const headerKeywords = [
        { keys: ['رقم تسلسلي', 'تسلسلي', 'itemnum', 'item number', 'serial'], col: 'itemNumber' },
        { keys: ['كود', 'رمز', 'إنشائي', 'code', 'construction code'], col: 'code' },
        { keys: ['فئة', 'category', 'class'], col: 'category' },
        { keys: ['رقم', 'item', 'no', 'م'], col: 'id' },
        { keys: ['وصف', 'description', 'بند', 'item', 'بيان'], col: 'description' },
        { keys: ['وحدة', 'unit', 'قياس'], col: 'unit' },
        { keys: ['كمية', 'quantity', 'qty', 'الكمية'], col: 'quantity' },
        { keys: ['سعر', 'price', 'unit price', 'rate', 'السعر', 'وحدة'], col: 'unitPrice' },
        { keys: ['إجمالي', 'total', 'amount', 'المبلغ'], col: 'total' },
    ];

    let headerRowIndex = -1;
    let colMapping: { [key: string]: number } = {};

    const searchLimit = Math.min(20, json.length);
    for (let i = 0; i < searchLimit && headerRowIndex === -1; i++) {
        const row = json[i];
        const tempMapping: { [key: string]: number } = {};
        
        for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').toLowerCase().trim();
            if (!cell) continue;
            
            for (const keyword of headerKeywords) {
                if (keyword.keys.some(k => cell.includes(k)) && !tempMapping[keyword.col]) {
                    tempMapping[keyword.col] = j;
                }
            }
        }
        
        if (tempMapping['description'] !== undefined && tempMapping['quantity'] !== undefined) {
            colMapping = tempMapping;
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1 || !colMapping['description']) {
        return { success: false, items: [] };
    }

    const items = extractItemsWithMapping(json, colMapping, headerRowIndex);
    return { success: true, items, headerRowIndex, colMapping };
};

// دالة استخراج البنود باستخدام mapping محدد
const extractItemsWithMapping = (json: any[], colMapping: { [key: string]: number }, headerRowIndex: number): FinancialItem[] => {
    const items: FinancialItem[] = [];
    let itemIdCounter = 1;

    for (let i = headerRowIndex + 1; i < json.length; i++) {
        const row = json[i];
        if (!row || row.length === 0) continue;
        
        const description = String(row[colMapping['description']] || '').trim();
        if (!description) continue;
        
        const unit = String(row[colMapping['unit']] || 'م').trim();
        const quantity = Number(row[colMapping['quantity']]) || 0;
        const unitPrice = Number(row[colMapping['unitPrice']]) || 0;
        const total = colMapping['total'] !== undefined 
            ? (Number(row[colMapping['total']]) || (quantity * unitPrice))
            : (quantity * unitPrice);
        const id = colMapping['id'] !== undefined 
            ? String(row[colMapping['id']] || '').trim() 
            : '';
        
        // New fields
        const itemNumber = colMapping['itemNumber'] !== undefined
            ? String(row[colMapping['itemNumber']] || '').trim()
            : '';
        const code = colMapping['code'] !== undefined
            ? String(row[colMapping['code']] || '').trim()
            : '';
        const category = colMapping['category'] !== undefined
            ? String(row[colMapping['category']] || '').trim()
            : '';

        if (quantity > 0 || total > 0) {
            items.push({
                id: id || `f-import-${itemIdCounter}`,
                itemNumber: itemNumber || undefined,
                code: code || undefined,
                category: category || undefined,
                item: description,
                unit: unit,
                quantity: quantity,
                unitPrice: unitPrice,
                total: total,
            });
            itemIdCounter++;
        }
    }

    return items;
};

// الدالة القديمة للتوافق
const parseExcel = (file: File, onProgress?: (progress: number) => void): Promise<FinancialItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                onProgress?.(10); // بدء القراءة
                
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                onProgress?.(30); // تم قراءة البيانات
                
                // قراءة سريعة بدون تنسيق معقد
                const workbook = XLSX.read(data, { 
                    type: 'array',
                    cellDates: false,
                    cellNF: false,
                    cellStyles: false
                });
                
                onProgress?.(50); // تم تحليل الملف
                
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // استخدام defval لتجنب القيم الفارغة
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { 
                    header: 1,
                    defval: '',
                    blankrows: false // تجاهل الصفوف الفارغة
                });

                onProgress?.(70); // تم تحويل البيانات

                const headerKeywords = [
                    { keys: ['رقم', 'item', 'no', 'code'], col: 'id' },
                    { keys: ['وصف', 'description', 'بند', 'item'], col: 'description' },
                    { keys: ['وحدة', 'unit'], col: 'unit' },
                    { keys: ['كمية', 'quantity', 'qty'], col: 'quantity' },
                    { keys: ['سعر', 'price', 'unit price', 'rate'], col: 'unitPrice' },
                    { keys: ['إجمالي', 'total', 'amount'], col: 'total' },
                ];

                let headerRowIndex = -1;
                let colMapping: { [key: string]: number } = {};

                // 1. البحث عن رأس الجدول (أول 20 صف فقط)
                const searchLimit = Math.min(20, json.length);
                for (let i = 0; i < searchLimit && headerRowIndex === -1; i++) {
                    const row = json[i];
                    const tempMapping: { [key: string]: number } = {};
                    
                    for (let j = 0; j < row.length; j++) {
                        const cell = String(row[j] || '').toLowerCase().trim();
                        if (!cell) continue;
                        
                        for (const keyword of headerKeywords) {
                            if (keyword.keys.some(k => cell.includes(k)) && !tempMapping[keyword.col]) {
                                tempMapping[keyword.col] = j;
                            }
                        }
                    }
                    
                    // إذا وجدنا على الأقل الوصف والكمية
                    if (tempMapping['description'] !== undefined && tempMapping['quantity'] !== undefined) {
                        colMapping = tempMapping;
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1 || !colMapping['description']) {
                    return reject(new Error('فشل في تحديد رؤوس الأعمدة. الرجاء التأكد من تنسيق الملف.'));
                }

                onProgress?.(80); // بدء استخراج البيانات

                // 2. استخراج البيانات بكفاءة
                const items: FinancialItem[] = [];
                let itemIdCounter = 1;
                const totalRows = json.length - headerRowIndex - 1;
                
                // معالجة الصفوف في دفعات للأداء
                const BATCH_SIZE = 100;
                let processedRows = 0;

                for (let i = headerRowIndex + 1; i < json.length; i++) {
                    const row = json[i];
                    if (!row || row.length === 0) continue;
                    
                    const description = String(row[colMapping['description']] || '').trim();
                    if (!description) continue; // تخطي الصفوف بدون وصف
                    
                    const unit = String(row[colMapping['unit']] || 'م').trim();
                    const quantity = Number(row[colMapping['quantity']]) || 0;
                    const unitPrice = Number(row[colMapping['unitPrice']]) || 0;
                    const total = colMapping['total'] !== undefined 
                        ? (Number(row[colMapping['total']]) || (quantity * unitPrice))
                        : (quantity * unitPrice);
                    const id = colMapping['id'] !== undefined 
                        ? String(row[colMapping['id']] || '').trim() 
                        : '';

                    if (quantity > 0 || total > 0) {
                        items.push({
                            id: id || `f-import-${itemIdCounter}`,
                            item: description,
                            unit: unit,
                            quantity: quantity,
                            unitPrice: unitPrice,
                            total: total,
                        });
                        itemIdCounter++;
                    }
                    
                    processedRows++;
                    
                    // تحديث التقدم كل دفعة
                    if (processedRows % BATCH_SIZE === 0 && onProgress) {
                        const progress = 80 + Math.floor((processedRows / totalRows) * 15);
                        onProgress(Math.min(progress, 95));
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

// --- Schedule Export Helper ---
const exportScheduleToExcel = (data: ScheduleTask[], fileName: string) => {
    const exportData = data.map(task => ({
        'رقم المهمة': task.id,
        'اسم النشاط': task.name,
        'كود WBS': task.wbsCode || 'N/A',
        'تاريخ البدء': task.start,
        'تاريخ الانتهاء': task.end,
        'الحالة': task.status === 'To Do' ? 'غير مُنجز' : task.status === 'In Progress' ? 'قيد التنفيذ' : 'مُنجز',
        'التقدم %': task.progress,
        'الأولوية': task.priority === 'High' ? 'عالية' : task.priority === 'Medium' ? 'متوسطة' : 'منخفضة',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الجدول الزمني');
    XLSX.writeFile(wb, `${fileName}_SCHEDULE_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// --- Child Components ---

interface BOQImportProps {
    onImportSuccess: (items: FinancialItem[], fileName: string) => void;
}

const BOQImport: React.FC<BOQImportProps> = ({ onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');
    const [activeTab, setActiveTab] = useState<'file' | 'manual'>('file');
    
    // للتحديد اليدوي
    const [showColumnMapper, setShowColumnMapper] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<{ [key: string]: number }>({});
    const [headerRowNumber, setHeaderRowNumber] = useState(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile); 
            setError(null);
            setShowColumnMapper(false); // إخفاء mapper عند اختيار ملف جديد
        } else { 
            setFile(null); 
            setError('صيغة الملف غير مدعومة. الرجاء اختيار ملف Excel (.xlsx)'); 
        }
    };
    
    // تأكيد التحديد اليدوي للأعمدة
    const handleManualMappingConfirm = async () => {
        if (!file) return;
        
        // التحقق من وجود الأعمدة المطلوبة
        if (columnMapping['description'] === undefined || columnMapping['quantity'] === undefined) {
            setError('يجب تحديد عمود الوصف والكمية على الأقل');
            return;
        }
        
        setIsLoading(true);
        setLoadingProgress(0);
        setError(null);
        
        try {
            const result = await parseExcelWithMapping(
                file, 
                columnMapping, 
                headerRowNumber,
                (progress) => setLoadingProgress(progress)
            );
            
            if (result.items.length === 0) {
                throw new Error('لم يتم استخراج أي بنود. تحقق من تحديد الأعمدة ورقم صف الرأس.');
            }
            
            onImportSuccess(result.items, file.name);
            
            const totalAmount = result.items.reduce((sum, item) => sum + item.total, 0);
            alert(`✅ تم استيراد ${result.items.length} بند بنجاح!\n💰 الإجمالي: ${totalAmount.toLocaleString('ar-EG')} ريال\n📁 المصدر: ${file.name}`);
            
            // إعادة تعيين
            setFile(null);
            setShowColumnMapper(false);
            setColumnMapping({});
            setPreviewData([]);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        setIsLoading(true); 
        setLoadingProgress(0);
        setError(null);
        try {
            let items: FinancialItem[] = [];
            let fileName = '';
            
            if (activeTab === 'file') {
                if (!file) { 
                    throw new Error('الرجاء اختيار ملف أولاً.'); 
                }
                fileName = file.name;
                
                // محاولة الكشف التلقائي أولاً
                const result = await parseExcelWithMapping(file, undefined, undefined, (progress) => {
                    setLoadingProgress(progress);
                });
                
                // إذا فشل الكشف التلقائي
                if (result.items.length === 0 && result.previewData) {
                    setPreviewData(result.previewData);
                    setAvailableHeaders(result.headers || []);
                    setShowColumnMapper(true);
                    setIsLoading(false);
                    setError('لم يتم التعرف على الأعمدة تلقائياً. الرجاء تحديد الأعمدة يدوياً أدناه.');
                    return;
                }
                
                items = result.items;
                setLoadingProgress(100);
            } else {
                fileName = 'إدخال يدوي';
                setLoadingProgress(50);
                const lines = manualInput.split('\n').filter(line => line.trim() !== '');
                items = lines.map((line, index) => {
                    const parts = line.split('|').map(p => p.trim());
                    const [description, unit, quantityStr, unitPriceStr] = parts;
                    const quantity = Number(quantityStr) || 0;
                    const unitPrice = Number(unitPriceStr) || 0;
                    return { 
                        id: `f-manual-${index + 1}`, 
                        item: description, 
                        unit, 
                        quantity, 
                        unitPrice, 
                        total: quantity * unitPrice 
                    };
                });
                setLoadingProgress(100);
            }
            
            if (items.length === 0) { 
                throw new Error('لم يتم استخراج أي بنود.'); 
            }
            
            onImportSuccess(items, fileName);
            
            // رسالة نجاح محسّنة
            const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
            alert(`✅ تم استيراد ${items.length} بند بنجاح!\n💰 الإجمالي: ${totalAmount.toLocaleString('ar-EG')} ريال\n📁 المصدر: ${fileName}`);
            
            setFile(null);
            setManualInput('');
        } catch (e: any) { 
            setError(e.message); 
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center mb-4">
                <Upload className="w-5 h-5 ml-2" />
                <h2 className="text-xl font-semibold">استيراد المقايسة</h2>
            </div>
            
            <div className="mb-4">
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('file')} 
                        className={`px-4 py-2 ${activeTab === 'file' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        تحميل ملف
                    </button>
                    <button 
                        onClick={() => setActiveTab('manual')} 
                        className={`px-4 py-2 ${activeTab === 'manual' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        إدخال يدوي
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {activeTab === 'file' ? (
                    <div>
                        <label className="block text-sm font-medium mb-2">اختر ملف Excel (.xlsx)</label>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            accept=".xlsx" 
                            className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        />
                        {file && <p className="text-sm text-gray-500 mt-2">الملف المحدد: {file.name}</p>}
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium mb-2">أدخل بنود المقايسة (كل بند في سطر)</label>
                        <textarea 
                            value={manualInput} 
                            onChange={(e) => setManualInput(e.target.value)} 
                            placeholder="وصف البند | الوحدة | الكمية | سعر الوحدة&#10;مثال: خرسانة مسلحة | م3 | 100 | 500"
                            rows={6}
                            className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                )}
                
                {/* Column Mapper - يظهر عند فشل الكشف التلقائي */}
                {showColumnMapper && previewData.length > 0 && (
                    <div className="border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            تحديد الأعمدة يدوياً
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            لم نتمكن من التعرف على أعمدة الملف تلقائياً. الرجاء تحديد الأعمدة المناسبة أدناه:
                        </p>
                        
                        {/* Header Row Number */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                رقم صف العناوين (Header Row)
                            </label>
                            <input 
                                type="number" 
                                value={headerRowNumber}
                                onChange={(e) => setHeaderRowNumber(Number(e.target.value))}
                                min={0}
                                max={previewData.length - 1}
                                className="w-32 p-2 border rounded-lg dark:bg-slate-800"
                                placeholder="0"
                            />
                            <span className="text-xs text-gray-500 mr-2">(عادة 0 أو 1)</span>
                        </div>
                        
                        {/* Column Mapping */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <span className="text-red-500">*</span> عمود الوصف/البند
                                </label>
                                <select 
                                    value={columnMapping['description'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, description: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <span className="text-red-500">*</span> عمود الكمية
                                </label>
                                <select 
                                    value={columnMapping['quantity'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, quantity: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    عمود الوحدة (اختياري)
                                </label>
                                <select 
                                    value={columnMapping['unit'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, unit: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    عمود سعر الوحدة (اختياري)
                                </label>
                                <select 
                                    value={columnMapping['unitPrice'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, unitPrice: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    عمود الإجمالي (اختياري)
                                </label>
                                <select 
                                    value={columnMapping['total'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, total: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    عمود الرقم التسلسلي (اختياري)
                                </label>
                                <select 
                                    value={columnMapping['itemNumber'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, itemNumber: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    عمود الكود/الرمز الإنشائي (اختياري)
                                </label>
                                <select 
                                    value={columnMapping['code'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, code: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    عمود الفئة (اختياري)
                                </label>
                                <select 
                                    value={columnMapping['category'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, category: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    عمود رقم البند (اختياري)
                                </label>
                                <select 
                                    value={columnMapping['id'] ?? ''}
                                    onChange={(e) => setColumnMapping({...columnMapping, id: Number(e.target.value)})}
                                    className="w-full p-2 border rounded-lg dark:bg-slate-800"
                                >
                                    <option value="">-- اختر --</option>
                                    {availableHeaders.map((header, idx) => (
                                        <option key={idx} value={idx}>
                                            العمود {idx + 1}: {String(header).substring(0, 30)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Preview Table */}
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2">معاينة البيانات (أول 5 صفوف):</h4>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                        <tr>
                                            {availableHeaders.map((header, idx) => (
                                                <th key={idx} className="p-2 border text-right">
                                                    <div className="text-xs text-gray-500">عمود {idx + 1}</div>
                                                    <div className="font-semibold">{String(header).substring(0, 20)}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 5).map((row, rowIdx) => (
                                            <tr key={rowIdx} className="border-t">
                                                {row.map((cell: any, cellIdx: number) => (
                                                    <td key={cellIdx} className="p-2 border">
                                                        {String(cell).substring(0, 50)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Confirm Button */}
                        <button
                            onClick={handleManualMappingConfirm}
                            disabled={!columnMapping['description'] || !columnMapping['quantity']}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                        >
                            ✓ تأكيد واستيراد البيانات
                        </button>
                    </div>
                )}
                
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">❌ {error}</p>
                    </div>
                )}
                
                {isLoading && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">جاري المعالجة...</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{loadingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-center text-gray-500">
                            {loadingProgress < 30 ? '📄 جاري قراءة الملف...' :
                             loadingProgress < 50 ? '🔍 تحليل البيانات...' :
                             loadingProgress < 80 ? '⚙️ استخراج البنود...' :
                             loadingProgress < 95 ? '📊 معالجة الكميات...' :
                             '✅ جاري الانتهاء...'}
                        </p>
                    </div>
                )}
                
                <button 
                    onClick={handleUpload} 
                    disabled={isLoading} 
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري المعالجة... {loadingProgress}%
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Upload className="w-5 h-5" />
                            تحميل واستيراد المقايسة
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

interface BOQManagerProps { 
    financials: FinancialItem[]; 
    schedule: ScheduleTask[];
    onUpdateFinancials: (items: FinancialItem[]) => void; 
}

const BOQManager: React.FC<BOQManagerProps> = ({ financials, schedule, onUpdateFinancials }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState({ 
        itemNumber: '', 
        code: '', 
        category: '', 
        item: '', 
        unit: '', 
        quantity: 0, 
        unitPrice: 0 
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50); // عرض 50 بند في الصفحة

    const filteredFinancials = useMemo(() => {
        return financials.filter(item =>
            item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [financials, searchTerm]);
    
    // Pagination
    const totalPages = Math.ceil(filteredFinancials.length / itemsPerPage);
    const paginatedFinancials = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredFinancials.slice(start, end);
    }, [filteredFinancials, currentPage, itemsPerPage]);
    
    // إعادة تعيين الصفحة عند البحث
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleAddItem = () => {
        if (!newItem.item.trim()) return;
        const newFinancialItem: FinancialItem = { 
            ...newItem, 
            id: `f-manual-${Date.now()}`, 
            itemNumber: newItem.itemNumber || undefined,
            code: newItem.code || undefined,
            category: newItem.category || undefined,
            total: newItem.quantity * newItem.unitPrice 
        };
        onUpdateFinancials([...financials, newFinancialItem]);
        setNewItem({ 
            itemNumber: '', 
            code: '', 
            category: '', 
            item: '', 
            unit: '', 
            quantity: 0, 
            unitPrice: 0 
        });
    };
    
    const handleUpdateItem = (id: string, field: keyof FinancialItem, value: string | number) => {
        onUpdateFinancials(financials.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'unitPrice') {
                    updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const handleDeleteItem = (id: string) => {
        onUpdateFinancials(financials.filter(i => i.id !== id));
    };

    const handleExport = () => {
        exportToExcel(financials, 'BOQ_Manual_Export');
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <Table className="w-5 h-5 ml-2" />
                    <h2 className="text-xl font-semibold">إدارة بنود المقايسة</h2>
                </div>
                <button 
                    onClick={handleExport} 
                    disabled={financials.length === 0}
                    className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                    <Download className="w-4 h-4" /> تصدير Excel
                </button>
            </div>

            {/* Add New Item Form */}
            <div className="border p-4 rounded-lg mb-6 bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold mb-3">إضافة بند جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input 
                        placeholder="وصف البند" 
                        value={newItem.item} 
                        onChange={(e) => setNewItem({...newItem, item: e.target.value})} 
                        className="col-span-2 p-2 border rounded-lg dark:bg-slate-700"
                    />
                    <input 
                        placeholder="الوحدة" 
                        value={newItem.unit} 
                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})} 
                        className="p-2 border rounded-lg dark:bg-slate-700"
                    />
                    <input 
                        type="number" 
                        placeholder="الكمية" 
                        value={newItem.quantity} 
                        onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})} 
                        className="p-2 border rounded-lg dark:bg-slate-700"
                    />
                    <input 
                        type="number" 
                        placeholder="سعر الوحدة" 
                        value={newItem.unitPrice} 
                        onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})} 
                        className="p-2 border rounded-lg dark:bg-slate-700"
                    />
                </div>
                <div className="flex justify-between items-center mt-3">
                    <p className="font-bold text-lg">الإجمالي: {(newItem.quantity * newItem.unitPrice).toLocaleString()} ريال</p>
                    <button 
                        onClick={handleAddItem}
                        className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                        <PlusCircle className="w-4 h-4"/> إضافة بند
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    placeholder="ابحث بالوصف أو رقم البند..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full p-2 pr-10 border rounded-lg dark:bg-slate-800"
                />
            </div>

            {/* Stats and Page Size */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                    <h4 className="font-semibold">
                        قائمة البنود: {filteredFinancials.length} {filteredFinancials.length !== financials.length && `من ${financials.length}`}
                    </h4>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="p-2 border rounded-lg dark:bg-slate-800 text-sm"
                    >
                        <option value={25}>25 بند/صفحة</option>
                        <option value={50}>50 بند/صفحة</option>
                        <option value={100}>100 بند/صفحة</option>
                        <option value={500}>500 بند/صفحة</option>
                        <option value={filteredFinancials.length}>الكل</option>
                    </select>
                </div>
                {totalPages > 1 && (
                    <div className="text-sm text-gray-600">
                        الصفحة {currentPage} من {totalPages}
                    </div>
                )}
            </div>

            {/* BOQ Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-right border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                        <tr>
                            {['#', 'رقم البند', 'الكود', 'الفئة', 'الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'إجراء'].map(h => 
                                <th key={h} className="p-3 text-sm font-medium border-b whitespace-nowrap">{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedFinancials.map((item, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                            return (
                            <tr key={item.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-2 text-center text-sm text-gray-500">
                                    {globalIndex}
                                </td>
                                <td className="p-2">
                                    <input 
                                        value={item.itemNumber || ''} 
                                        onChange={(e) => handleUpdateItem(item.id, 'itemNumber', e.target.value)} 
                                        placeholder="رقم"
                                        className="w-20 p-1 border rounded dark:bg-slate-700 text-sm"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        value={item.code || ''} 
                                        onChange={(e) => handleUpdateItem(item.id, 'code', e.target.value)} 
                                        placeholder="كود"
                                        className="w-24 p-1 border rounded dark:bg-slate-700 text-sm"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        value={item.category || ''} 
                                        onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)} 
                                        placeholder="فئة"
                                        className="w-24 p-1 border rounded dark:bg-slate-700 text-sm"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        value={item.item} 
                                        onChange={(e) => handleUpdateItem(item.id, 'item', e.target.value)} 
                                        className="w-full min-w-[200px] p-1 border rounded dark:bg-slate-700"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        value={item.unit} 
                                        onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)} 
                                        className="w-20 p-1 border rounded dark:bg-slate-700"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))} 
                                        className="w-24 p-1 border rounded dark:bg-slate-700 text-right"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="number" 
                                        value={item.unitPrice} 
                                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))} 
                                        className="w-24 p-1 border rounded dark:bg-slate-700 text-right"
                                    />
                                </td>
                                <td className="p-2 font-bold text-blue-600 whitespace-nowrap">{item.total.toLocaleString()}</td>
                                <td className="p-2">
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            «
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            ‹ السابق
                        </button>
                        
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 border rounded-lg ${
                                            currentPage === pageNum 
                                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            التالي ›
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            »
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface BOQAnalysisProps { 
    financials: FinancialItem[]; 
}

const BOQAnalysis: React.FC<BOQAnalysisProps> = ({ financials }) => {
    const totalCost = useMemo(() => 
        financials.reduce((sum, item) => sum + item.total, 0), [financials]
    );

    const avgCost = useMemo(() => 
        financials.length > 0 ? totalCost / financials.length : 0, [totalCost, financials]
    );

    return (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center mb-4">
                <DollarSign className="w-5 h-5 ml-2" />
                <h2 className="text-xl font-semibold">تحليل المقايسة</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">الإجمالي العام</p>
                    <p className="text-2xl font-bold text-blue-600">{totalCost.toLocaleString()} ريال</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">عدد البنود</p>
                    <p className="text-2xl font-bold text-green-600">{financials.length}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">متوسط التكلفة</p>
                    <p className="text-2xl font-bold text-purple-600">{avgCost.toLocaleString()} ريال</p>
                </div>
            </div>
        </div>
    );
};

interface ManualScheduleManagerProps { 
    schedule: ScheduleTask[]; 
    financials: FinancialItem[];
    onUpdateSchedule: (schedule: ScheduleTask[]) => void; 
}

const ManualScheduleManager: React.FC<ManualScheduleManagerProps> = ({ schedule, financials, onUpdateSchedule }) => {
    const [tasks, setTasks] = useState<ScheduleTask[]>(schedule);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => { 
        setTasks(schedule); 
    }, [schedule]);

    const filteredSchedule = useMemo(() => {
        return tasks.filter(task =>
            task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.id.toString().includes(searchTerm)
        );
    }, [tasks, searchTerm]);

    const [newTask, setNewTask] = useState({ 
        name: '', 
        start: new Date().toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0], 
        status: 'To Do' as ScheduleTaskStatus, 
        priority: 'Medium' as ScheduleTaskPriority,
        wbsCode: '',
        category: '',
        dependencies: [] as number[],
    });

    const handleAddTask = () => {
        if (!newTask.name.trim()) return;
        const newScheduleItem: ScheduleTask = { 
            ...newTask, 
            id: Date.now(), 
            progress: 0,
        };
        const updatedTasks = [...tasks, newScheduleItem];
        setTasks(updatedTasks);
        onUpdateSchedule(updatedTasks);
        setNewTask({ 
            name: '', 
            start: new Date().toISOString().split('T')[0], 
            end: new Date().toISOString().split('T')[0], 
            status: 'To Do' as ScheduleTaskStatus, 
            priority: 'Medium' as ScheduleTaskPriority,
            wbsCode: '',
            category: '',
            dependencies: [] as number[],
        });
    };

    const handleTaskUpdate = (id: number, field: keyof ScheduleTask, value: any) => {
        const updatedTasks = tasks.map(task => 
            task.id === id ? { ...task, [field]: value } : task
        );
        setTasks(updatedTasks);
        onUpdateSchedule(updatedTasks);
    };

    const handleDeleteTask = (id: number) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
        onUpdateSchedule(updatedTasks);
    };

    const handleExportSchedule = () => {
        exportScheduleToExcel(schedule, 'Project_Schedule');
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <Clock className="w-5 h-5 ml-2" />
                    <h2 className="text-xl font-semibold">إدارة الجدول الزمني</h2>
                </div>
                <button 
                    onClick={handleExportSchedule} 
                    disabled={schedule.length === 0}
                    className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                    <Download className="w-4 h-4" /> تصدير Excel
                </button>
            </div>

            {/* Add New Task Form */}
            <div className="border p-4 rounded-lg mb-6 bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold mb-3">إضافة مهمة جديدة</h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <input 
                        placeholder="اسم النشاط" 
                        value={newTask.name} 
                        onChange={(e) => setNewTask({...newTask, name: e.target.value})} 
                        className="col-span-2 p-2 border rounded-lg dark:bg-slate-700"
                    />
                    <input 
                        type="date" 
                        value={newTask.start} 
                        onChange={(e) => setNewTask({...newTask, start: e.target.value})} 
                        className="p-2 border rounded-lg dark:bg-slate-700"
                    />
                    <input 
                        type="date" 
                        value={newTask.end} 
                        onChange={(e) => setNewTask({...newTask, end: e.target.value})} 
                        className="p-2 border rounded-lg dark:bg-slate-700"
                    />
                    <select 
                        value={newTask.status} 
                        onChange={(e) => setNewTask({...newTask, status: e.target.value as ScheduleTaskStatus})} 
                        className="p-2 border rounded-lg dark:bg-slate-700"
                    >
                        <option value="To Do">غير مُنجز</option>
                        <option value="In Progress">قيد التنفيذ</option>
                        <option value="Done">مُنجز</option>
                    </select>
                    <select 
                        value={newTask.priority} 
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as ScheduleTaskPriority})} 
                        className="p-2 border rounded-lg dark:bg-slate-700"
                    >
                        <option value="High">عالية</option>
                        <option value="Medium">متوسطة</option>
                        <option value="Low">منخفضة</option>
                    </select>
                </div>
                <button 
                    onClick={handleAddTask}
                    className="mt-3 flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-semibold"
                >
                    <PlusCircle className="w-4 h-4"/> إضافة مهمة
                </button>
            </div>

            {/* Search */}
            <div className="mb-4 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    placeholder="ابحث بالاسم أو الكود..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full p-2 pr-10 border rounded-lg dark:bg-slate-800"
                />
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
                <h4 className="font-semibold mb-2">قائمة المهام ({filteredSchedule.length} من {tasks.length})</h4>
                <table className="min-w-full text-right border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            {['الاسم', 'بدء', 'انتهاء', 'حالة', 'تقدم %', 'إجراء'].map(h => 
                                <th key={h} className="p-3 text-sm font-medium border-b">{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchedule.map((task) => (
                            <tr key={task.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-2">
                                    <input 
                                        value={task.name} 
                                        onChange={(e) => handleTaskUpdate(task.id, 'name', e.target.value)} 
                                        className="w-full p-1 border rounded dark:bg-slate-700"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="date" 
                                        value={task.start} 
                                        onChange={(e) => handleTaskUpdate(task.id, 'start', e.target.value)} 
                                        className="p-1 border rounded dark:bg-slate-700"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="date" 
                                        value={task.end} 
                                        onChange={(e) => handleTaskUpdate(task.id, 'end', e.target.value)} 
                                        className="p-1 border rounded dark:bg-slate-700"
                                    />
                                </td>
                                <td className="p-2">
                                    <select 
                                        value={task.status} 
                                        onChange={(e) => handleTaskUpdate(task.id, 'status', e.target.value)} 
                                        className="p-1 border rounded dark:bg-slate-700"
                                    >
                                        <option value="To Do">غير مُنجز</option>
                                        <option value="In Progress">قيد التنفيذ</option>
                                        <option value="Done">مُنجز</option>
                                    </select>
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="number" 
                                        value={task.progress} 
                                        onChange={(e) => handleTaskUpdate(task.id, 'progress', Number(e.target.value))} 
                                        min="0" 
                                        max="100"
                                        className="w-20 p-1 border rounded dark:bg-slate-700 text-right"
                                    />
                                </td>
                                <td className="p-2">
                                    <button 
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Component ---

interface BOQManualManagerProps {
    project: Project;
    onUpdateFinancials: (projectId: string, newFinancials: FinancialItem[]) => void;
    onUpdateSchedule: (projectId: string, newSchedule: ScheduleTask[]) => void;
}

export const BOQManualManager: React.FC<BOQManualManagerProps> = ({ project, onUpdateFinancials, onUpdateSchedule }) => {
    const [currentFinancials, setCurrentFinancials] = useState<FinancialItem[]>(project.data.financials || []);
    const [currentSchedule, setCurrentSchedule] = useState<ScheduleTask[]>(project.data.schedule || []);
    const [activeTab, setActiveTab] = useState<'import' | 'manage' | 'analysis' | 'schedule'>('import');

    useEffect(() => {
        setCurrentFinancials(project.data.financials || []);
        setCurrentSchedule(project.data.schedule || []);
    }, [project]);

    const handleImportSuccess = (items: FinancialItem[], fileName: string) => {
        const newItems = [...currentFinancials, ...items];
        setCurrentFinancials(newItems);
        onUpdateFinancials(project.id, newItems);
    };

    const handleUpdateFinancials = (items: FinancialItem[]) => {
        setCurrentFinancials(items);
        onUpdateFinancials(project.id, items);
    };

    const handleUpdateSchedule = (tasks: ScheduleTask[]) => {
        setCurrentSchedule(tasks);
        onUpdateSchedule(project.id, tasks);
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">إدارة المقايسات والجداول الزمنية (يدوي)</h1>
            
            <div className="mb-6">
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('import')} 
                        className={`px-6 py-3 font-semibold ${activeTab === 'import' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        1. استيراد
                    </button>
                    <button 
                        onClick={() => setActiveTab('manage')} 
                        className={`px-6 py-3 font-semibold ${activeTab === 'manage' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        2. إدارة المقايسة
                    </button>
                    <button 
                        onClick={() => setActiveTab('analysis')} 
                        className={`px-6 py-3 font-semibold ${activeTab === 'analysis' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        3. تحليل المقايسة
                    </button>
                    <button 
                        onClick={() => setActiveTab('schedule')} 
                        className={`px-6 py-3 font-semibold ${activeTab === 'schedule' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        4. إدارة الجدول الزمني
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'import' && <BOQImport onImportSuccess={handleImportSuccess} />}
                {activeTab === 'manage' && <BOQManager financials={currentFinancials} schedule={currentSchedule} onUpdateFinancials={handleUpdateFinancials} />}
                {activeTab === 'analysis' && <BOQAnalysis financials={currentFinancials} />}
                {activeTab === 'schedule' && <ManualScheduleManager schedule={currentSchedule} financials={currentFinancials} onUpdateSchedule={handleUpdateSchedule} />}
            </div>
        </div>
    );
};

export default BOQManualManager;
