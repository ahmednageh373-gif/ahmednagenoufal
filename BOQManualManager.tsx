import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Project, FinancialItem, ScheduleTask, ScheduleTaskStatus, ScheduleTaskPriority, AdvancedScheduleActivity, WBSItem } from './types';
import { Upload, FileText, Table, Clock, DollarSign, Download, PlusCircle, Trash2, Search } from './lucide-icons';
import { SmartScheduleGenerator, AdvancedScheduleViewer } from './components/NOUFALScheduling';
import { AdvancedBOQScheduler } from './components/AdvancedBOQScheduler';
import { ParsedBOQItem } from './services/ExcelParser';

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
                    { keys: ['رقم', 'item', 'no'], col: 'id' },
                    { keys: ['وصف', 'description', 'بند'], col: 'description' },
                    { keys: ['وحدة', 'unit'], col: 'unit' },
                    { keys: ['كمية', 'quantity', 'qty'], col: 'quantity' },
                    { keys: ['سعر', 'price', 'unit price'], col: 'unitPrice' },
                    { keys: ['إجمالي', 'total', 'amount'], col: 'total' },
                ];

                let headerRowIndex = -1;
                let colMapping: { [key: string]: number } = {};

                // 1. Find the header row and map columns
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

                // 2. Extract data rows
                const items: FinancialItem[] = [];
                let itemIdCounter = 1;

                for (let i = headerRowIndex + 1; i < json.length; i++) {
                    const row = json[i];
                    
                    const description = String(row[colMapping['description']] || '').trim();
                    const unit = String(row[colMapping['unit']] || '').trim();
                    const quantity = Number(row[colMapping['quantity']]) || 0;
                    const unitPrice = Number(row[colMapping['unitPrice']]) || 0;
                    let total = colMapping['total'] !== undefined ? Number(row[colMapping['total']]) || 0 : 0;
                    const id = colMapping['id'] !== undefined ? String(row[colMapping['id']] || '').trim() : `f-import-${itemIdCounter}`;

                    // حساب الإجمالي بذكاء:
                    // 1. إذا كان الإجمالي موجود في الملف، استخدمه
                    // 2. إذا كان الإجمالي = 0، احسب من الكمية × سعر الوحدة
                    // 3. إذا كان سعر الوحدة = 0 لكن الإجمالي > 0، احسب سعر الوحدة
                    if (total === 0 && quantity > 0 && unitPrice > 0) {
                        total = quantity * unitPrice;
                    } else if (total > 0 && unitPrice === 0 && quantity > 0) {
                        // في هذه الحالة، الإجمالي موجود لكن سعر الوحدة مفقود، احسبه
                        // لا نعدل unitPrice لأن المستخدم ربما يريد أن يكون 0
                    }

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
    const [error, setError] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');
    const [activeTab, setActiveTab] = useState<'file' | 'manual'>('file');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile); 
            setError(null);
        } else { 
            setFile(null); 
            setError('صيغة الملف غير مدعومة. الرجاء اختيار ملف Excel (.xlsx)'); 
        }
    };

    const handleUpload = async () => {
        setIsLoading(true); 
        setError(null);
        try {
            let items: FinancialItem[] = [];
            let fileName = '';
            
            if (activeTab === 'file') {
                if (!file) { 
                    throw new Error('الرجاء اختيار ملف أولاً.'); 
                }
                fileName = file.name;
                items = await parseExcel(file);
            } else {
                fileName = 'إدخال يدوي';
                const lines = manualInput.split('\n').filter(line => line.trim() !== '');
                items = lines.map((line, index) => {
                    const parts = line.split('|').map(p => p.trim());
                    const [description, unit, quantityStr, unitPriceStr, totalStr] = parts;
                    const quantity = Number(quantityStr) || 0;
                    const unitPrice = Number(unitPriceStr) || 0;
                    const totalFromInput = Number(totalStr) || 0;
                    
                    // حساب الإجمالي بذكاء:
                    // 1. إذا كان الإجمالي موجود في الإدخال، استخدمه
                    // 2. إذا كان سعر الوحدة = 0 لكن الكمية موجودة، استخدم الرقم الثاني كإجمالي
                    // 3. احسب تلقائيًا من الكمية × سعر الوحدة
                    let calculatedTotal = 0;
                    if (totalFromInput > 0) {
                        calculatedTotal = totalFromInput;
                    } else if (unitPrice === 0 && quantity > 0 && parts.length >= 4) {
                        // الحالة المقلوبة: الرقم في عمود سعر الوحدة هو الإجمالي الحقيقي
                        calculatedTotal = quantity * Number(parts[3]);
                    } else {
                        calculatedTotal = quantity * unitPrice;
                    }
                    
                    return { 
                        id: `f-manual-${index + 1}`, 
                        item: description, 
                        unit, 
                        quantity, 
                        unitPrice, 
                        total: calculatedTotal
                    };
                });
            }
            
            if (items.length === 0) { 
                throw new Error('لم يتم استخراج أي بنود.'); 
            }
            
            onImportSuccess(items, fileName);
            alert(`تم استيراد ${items.length} بند بنجاح من ${fileName}.`);
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
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="font-semibold mb-1">📝 التنسيق:</p>
                            <p>وصف البند | الوحدة | الكمية | سعر الوحدة | الإجمالي (اختياري)</p>
                            <p className="mt-2 font-semibold">✅ مثال صحيح:</p>
                            <p className="font-mono">خرسانة مسلحة | م3 | 100 | 500 | 50000</p>
                            <p className="mt-1 font-mono">أعمال حفر | م3 | 200 | 50</p>
                            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                💡 ملاحظة: إذا كان سعر الوحدة = 0، سيتم حساب الإجمالي تلقائياً من الأرقام المتاحة
                            </p>
                        </div>
                        <textarea 
                            value={manualInput} 
                            onChange={(e) => setManualInput(e.target.value)} 
                            placeholder="وصف البند | الوحدة | الكمية | سعر الوحدة | الإجمالي&#10;مثال: خرسانة مسلحة | م3 | 100 | 500 | 50000&#10;مثال: أعمال حفر | م3 | 200 | 50"
                            rows={8}
                            className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-mono text-sm"
                        />
                    </div>
                )}
                
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <button 
                    onClick={handleUpload} 
                    disabled={isLoading} 
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold"
                >
                    {isLoading ? 'جاري التحميل...' : 'تحميل واستيراد'}
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
    const [newItem, setNewItem] = useState({ item: '', unit: '', quantity: 0, unitPrice: 0 });

    const filteredFinancials = useMemo(() => {
        return financials.filter(item =>
            item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [financials, searchTerm]);

    const handleAddItem = () => {
        if (!newItem.item.trim()) return;
        const newFinancialItem: FinancialItem = { 
            ...newItem, 
            id: `f-manual-${Date.now()}`, 
            total: newItem.quantity * newItem.unitPrice 
        };
        onUpdateFinancials([...financials, newFinancialItem]);
        setNewItem({ item: '', unit: '', quantity: 0, unitPrice: 0 });
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

            {/* BOQ Table */}
            <div className="overflow-x-auto">
                <h4 className="font-semibold mb-2">قائمة البنود ({filteredFinancials.length} من {financials.length})</h4>
                <table className="min-w-full text-right border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            {['الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'إجراء'].map(h => 
                                <th key={h} className="p-3 text-sm font-medium border-b">{h}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFinancials.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-2">
                                    <input 
                                        value={item.item} 
                                        onChange={(e) => handleUpdateItem(item.id, 'item', e.target.value)} 
                                        className="w-full p-1 border rounded dark:bg-slate-700"
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
                                <td className="p-2 font-bold text-blue-600">{item.total.toLocaleString()}</td>
                                <td className="p-2">
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
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
    const [activeTab, setActiveTab] = useState<'import' | 'manage' | 'analysis' | 'schedule' | 'noufal-generate' | 'noufal-view'>('import');
    
    // NOUFAL Advanced Scheduling System State
    const [advancedActivities, setAdvancedActivities] = useState<AdvancedScheduleActivity[]>([]);
    const [wbsStructure, setWBSStructure] = useState<WBSItem[]>([]);
    const [parsedBOQData, setParsedBOQData] = useState<ParsedBOQItem[]>([]);

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

    // NOUFAL: Handle schedule generation from BOQ with Specifications Analysis
    const handleScheduleGenerated = (
        activities: AdvancedScheduleActivity[], 
        wbs: WBSItem[], 
        parsedItems: ParsedBOQItem[]
    ) => {
        setAdvancedActivities(activities);
        setWBSStructure(wbs);
        setParsedBOQData(parsedItems);
        
        // Auto-switch to viewer after generation
        setActiveTab('noufal-view');
        
        const criticalCount = activities.filter(a => a.isCritical).length;
        const expansionRatio = parsedItems.length > 0 ? (activities.length / parsedItems.length).toFixed(1) : '0';
        
        alert(
            `✅ تم توليد الجدول الزمني بنجاح!\n\n` +
            `📊 البنود الأصلية: ${parsedItems.length} بند\n` +
            `🔧 الأنشطة المستخرجة: ${activities.length} نشاط\n` +
            `📈 معدل التوسع: ${expansionRatio}x\n` +
            `⚠️ الأنشطة الحرجة: ${criticalCount} نشاط\n` +
            `📁 أقسام WBS: ${wbs.length} قسم\n\n` +
            `تم تحليل مواصفات البنود وتقسيمها إلى أنشطة متعددة!`
        );
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">إدارة المقايسات والجداول الزمنية - نظام NOUFAL المتقدم</h1>
            
            <div className="mb-6">
                <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('import')} 
                        className={`px-4 py-3 font-semibold ${activeTab === 'import' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        1. استيراد
                    </button>
                    <button 
                        onClick={() => setActiveTab('manage')} 
                        className={`px-4 py-3 font-semibold ${activeTab === 'manage' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        2. إدارة المقايسة
                    </button>
                    <button 
                        onClick={() => setActiveTab('analysis')} 
                        className={`px-4 py-3 font-semibold ${activeTab === 'analysis' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        3. تحليل المقايسة
                    </button>
                    <button 
                        onClick={() => setActiveTab('schedule')} 
                        className={`px-4 py-3 font-semibold ${activeTab === 'schedule' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                    >
                        4. جدول يدوي
                    </button>
                    <button 
                        onClick={() => setActiveTab('noufal-generate')} 
                        className={`px-4 py-3 font-semibold ${activeTab === 'noufal-generate' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
                    >
                        5. ★ توليد NOUFAL
                    </button>
                    <button 
                        onClick={() => setActiveTab('noufal-view')} 
                        className={`px-4 py-3 font-semibold ${activeTab === 'noufal-view' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
                        disabled={advancedActivities.length === 0}
                    >
                        6. ★ عارض NOUFAL
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'import' && <BOQImport onImportSuccess={handleImportSuccess} />}
                {activeTab === 'manage' && <BOQManager financials={currentFinancials} schedule={currentSchedule} onUpdateFinancials={handleUpdateFinancials} />}
                {activeTab === 'analysis' && <BOQAnalysis financials={currentFinancials} />}
                {activeTab === 'schedule' && <ManualScheduleManager schedule={currentSchedule} financials={currentFinancials} onUpdateSchedule={handleUpdateSchedule} />}
                {activeTab === 'noufal-generate' && (
                    <AdvancedBOQScheduler 
                        onScheduleGenerated={handleScheduleGenerated}
                    />
                )}
                {activeTab === 'noufal-view' && (
                    <AdvancedScheduleViewer 
                        activities={advancedActivities}
                        wbs={wbsStructure}
                        projectName={project.name}
                    />
                )}
            </div>
        </div>
    );
};

export default BOQManualManager;
