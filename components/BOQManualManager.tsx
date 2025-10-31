import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Project, FinancialItem, ScheduleTask, ScheduleTaskStatus, ScheduleTaskPriority } from '../types';
import { Upload, FileText, Table, Clock, DollarSign, Download, PlusCircle, Trash2, Search, Layers } from 'lucide-react';
import { BOQAIAnalysis } from './BOQAIAnalysis';
import { BOQItemBreakdown } from './BOQItemBreakdown';

// Fix: Use XLSX from window since it's loaded via CDN
declare var XLSX: any;

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

                const items: FinancialItem[] = [];
                let itemIdCounter = 1;

                // Simple parsing - assumes first row is header
                for (let i = 1; i < json.length; i++) {
                    const row = json[i];
                    if (row && row.length >= 4) {
                        const item = String(row[0] || '').trim();
                        const unit = String(row[1] || '').trim();
                        const quantity = Number(row[2]) || 0;
                        const unitPrice = Number(row[3]) || 0;

                        if (item && (quantity > 0 || unitPrice > 0)) {
                            items.push({
                                id: `f-import-${itemIdCounter++}`,
                                item: item,
                                unit: unit,
                                quantity: quantity,
                                unitPrice: unitPrice,
                                total: quantity * unitPrice,
                            });
                        }
                    }
                }
                
                if (items.length === 0) {
                    return reject(new Error('لم يتم العثور على بنود مقايسة صالحة في الملف'));
                }
                
                resolve(items);
            } catch (error) { 
                reject(new Error('فشل في تحليل ملف Excel')); 
            }
        };
        reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
        reader.readAsArrayBuffer(file);
    });
};

// Helper function for Schedule Export
const exportScheduleToExcel = (data: ScheduleTask[], fileName: string) => {
    const exportData = data.map(task => ({
        'Activity ID': task.id,
        'Activity Name': task.name,
        'WBS Code': task.wbsCode || 'N/A',
        'Start Date': task.start,
        'Finish Date': task.end,
        'Duration (Days)': task.duration || 0,
        'Status': task.status === 'To Do' ? 'غير مُنجز' : task.status === 'In Progress' ? 'قيد التنفيذ' : 'مُنجز',
        'Progress (%)': task.progress,
        'Priority': task.priority === 'High' ? 'عالية' : task.priority === 'Medium' ? 'متوسطة' : 'منخفضة',
        'Dependencies': task.dependencies.join(', '),
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
    const [activeTab, setActiveTab] = useState<'file' | 'manual'>('file');
    const [manualInput, setManualInput] = useState('');

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
                if (!file) throw new Error('الرجاء اختيار ملف أولاً');
                fileName = file.name;
                items = await parseExcel(file);
            } else {
                fileName = 'Manual Input';
                const lines = manualInput.split('\n').filter(line => line.trim() !== '');
                items = lines.map((line, index) => {
                    const parts = line.split('|').map(p => p.trim());
                    const [item, unit, quantityStr, unitPriceStr] = parts;
                    const quantity = Number(quantityStr) || 0;
                    const unitPrice = Number(unitPriceStr) || 0;
                    return {
                        id: `f-manual-${index + 1}`,
                        item,
                        unit,
                        quantity,
                        unitPrice,
                        total: quantity * unitPrice,
                    };
                });
            }
            
            if (items.length === 0) throw new Error('لم يتم استخراج أي بنود');
            
            onImportSuccess(items, fileName);
            alert(`تم استيراد ${items.length} بند بنجاح من ${fileName}`);
            setFile(null);
            setManualInput('');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
                <Upload className="w-5 h-5 ml-2" /> استيراد المقايسة
            </h3>
            
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setActiveTab('file')}
                    className={`px-4 py-2 rounded ${activeTab === 'file' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                    تحميل ملف
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-4 py-2 rounded ${activeTab === 'manual' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                    إدخال يدوي
                </button>
            </div>

            {activeTab === 'file' ? (
                <div className="space-y-4">
                    <label className="block text-sm font-medium mb-2">
                        اختر ملف المقايسة (Excel)
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx"
                        className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    {file && <p className="text-sm text-gray-500">الملف المحدد: {file.name}</p>}
                </div>
            ) : (
                <div className="space-y-4">
                    <label className="block text-sm font-medium mb-2">
                        أدخل بنود المقايسة (كل بند في سطر بصيغة: الوصف | الوحدة | الكمية | سعر الوحدة)
                    </label>
                    <textarea
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="مثال: خرسانة مسلحة | م3 | 100 | 450"
                        rows={6}
                        className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                </div>
            )}

            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
            
            <button
                onClick={handleUpload}
                disabled={isLoading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {isLoading ? 'جاري التحميل...' : 'تحميل واستيراد'}
            </button>
        </div>
    );
};

interface BOQManagerProps {
    financials: FinancialItem[];
    onUpdateFinancials: (items: FinancialItem[]) => void;
    project: Project;
}

const BOQManager: React.FC<BOQManagerProps> = ({ financials, onUpdateFinancials, project }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState({ item: '', unit: '', quantity: 0, unitPrice: 0 });
    const [selectedItemForBreakdown, setSelectedItemForBreakdown] = useState<FinancialItem | null>(null);

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

    const totalCost = useMemo(() => financials.reduce((sum, item) => sum + item.total, 0), [financials]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center">
                    <Table className="w-5 h-5 ml-2" /> إدارة بنود المقايسة
                </h3>
                <button
                    onClick={handleExport}
                    disabled={financials.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
                >
                    <Download className="w-4 h-4 ml-2" /> تصدير Excel
                </button>
            </div>

            {/* Add New Item */}
            <div className="border dark:border-gray-600 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3">إضافة بند جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        placeholder="وصف البند"
                        value={newItem.item}
                        onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                        className="col-span-2 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <input
                        placeholder="الوحدة"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <input
                        type="number"
                        placeholder="الكمية"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                        className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <input
                        type="number"
                        placeholder="سعر الوحدة"
                        value={newItem.unitPrice}
                        onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                        className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                </div>
                <div className="flex justify-between items-center mt-3">
                    <p className="font-bold">الإجمالي: {(newItem.quantity * newItem.unitPrice).toLocaleString()} ريال</p>
                    <button
                        onClick={handleAddItem}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center"
                    >
                        <PlusCircle className="w-4 h-4 ml-2" /> إضافة بند
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        placeholder="ابحث بالوصف أو رقم البند..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">عدد البنود</p>
                        <p className="text-2xl font-bold text-indigo-600">{filteredFinancials.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">الإجمالي</p>
                        <p className="text-2xl font-bold text-green-600">{totalCost.toLocaleString()} ريال</p>
                    </div>
                </div>
            </div>

            {/* BOQ Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {['الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'إجراءات'].map(h => (
                                <th key={h} className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredFinancials.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3">
                                    <input
                                        value={item.item}
                                        onChange={(e) => handleUpdateItem(item.id, 'item', e.target.value)}
                                        className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        value={item.unit}
                                        onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                                        className="w-20 p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                                        className="w-24 p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm text-right"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                                        className="w-24 p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm text-right"
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                                    {item.total.toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedItemForBreakdown(item)}
                                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            title="تفصيل البند"
                                        >
                                            <Layers className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="حذف البند"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal تفصيل البند */}
            {selectedItemForBreakdown && (
                <BOQItemBreakdown
                    item={selectedItemForBreakdown}
                    isOpen={!!selectedItemForBreakdown}
                    onClose={() => setSelectedItemForBreakdown(null)}
                />
            )}
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
    const [newTask, setNewTask] = useState({
        name: '',
        duration: 0,
        start: new Date().toISOString().split('T')[0],
        status: 'To Do' as ScheduleTaskStatus,
        priority: 'Medium' as ScheduleTaskPriority,
    });

    useEffect(() => {
        setTasks(schedule);
    }, [schedule]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task =>
            task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(task.id).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tasks, searchTerm]);

    const handleAddTask = () => {
        if (!newTask.name.trim() || newTask.duration <= 0) return;
        
        const endDate = new Date(new Date(newTask.start).getTime() + newTask.duration * 24 * 60 * 60 * 1000);
        const newScheduleItem: ScheduleTask = {
            id: Date.now(),
            name: newTask.name,
            start: newTask.start,
            end: endDate.toISOString().split('T')[0],
            progress: 0,
            dependencies: [],
            status: newTask.status,
            priority: newTask.priority,
        };
        
        const updatedTasks = [...tasks, newScheduleItem];
        setTasks(updatedTasks);
        onUpdateSchedule(updatedTasks);
        setNewTask({
            name: '',
            duration: 0,
            start: new Date().toISOString().split('T')[0],
            status: 'To Do',
            priority: 'Medium',
        });
    };

    const handleUpdateTask = (id: number, field: keyof ScheduleTask, value: any) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === id) {
                const updatedTask = { ...task, [field]: value };
                if (field === 'start') {
                    const duration = Math.ceil((new Date(task.end).getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
                    updatedTask.end = new Date(new Date(value).getTime() + duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                }
                return updatedTask;
            }
            return task;
        });
        setTasks(updatedTasks);
        onUpdateSchedule(updatedTasks);
    };

    const handleDeleteTask = (id: number) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
        onUpdateSchedule(updatedTasks);
    };

    const handleExportSchedule = () => {
        exportScheduleToExcel(schedule, 'Project_Schedule_Manual');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center">
                    <Clock className="w-5 h-5 ml-2" /> إدارة الجدول الزمني
                </h3>
                <button
                    onClick={handleExportSchedule}
                    disabled={schedule.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
                >
                    <Download className="w-4 h-4 ml-2" /> تصدير Excel
                </button>
            </div>

            {/* Add New Task */}
            <div className="border dark:border-gray-600 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3">إضافة مهمة جديدة</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        placeholder="اسم النشاط"
                        value={newTask.name}
                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        className="col-span-2 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <input
                        type="number"
                        placeholder="المدة (أيام)"
                        value={newTask.duration}
                        onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })}
                        className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <input
                        type="date"
                        value={newTask.start}
                        onChange={(e) => setNewTask({ ...newTask, start: e.target.value })}
                        className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <select
                        value={newTask.status}
                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value as ScheduleTaskStatus })}
                        className="p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                        <option value="To Do">غير مُنجز</option>
                        <option value="In Progress">قيد التنفيذ</option>
                        <option value="Done">مُنجز</option>
                    </select>
                </div>
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={handleAddTask}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center"
                    >
                        <PlusCircle className="w-4 h-4 ml-2" /> إضافة مهمة
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        placeholder="ابحث بالاسم أو الكود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
                <h4 className="font-semibold mb-2">قائمة المهام ({filteredTasks.length})</h4>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {['الاسم', 'بدء', 'انتهاء', 'حالة', 'تقدم (%)', 'إجراء'].map(h => (
                                <th key={h} className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3">
                                    <input
                                        value={task.name}
                                        onChange={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                                        className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="date"
                                        value={task.start}
                                        onChange={(e) => handleUpdateTask(task.id, 'start', e.target.value)}
                                        className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {task.end}
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleUpdateTask(task.id, 'status', e.target.value as ScheduleTaskStatus)}
                                        className="p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                                    >
                                        <option value="To Do">غير مُنجز</option>
                                        <option value="In Progress">قيد التنفيذ</option>
                                        <option value="Done">مُنجز</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={task.progress}
                                        onChange={(e) => handleUpdateTask(task.id, 'progress', Number(e.target.value))}
                                        min="0"
                                        max="100"
                                        className="w-16 p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm text-right"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
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
    const [activeTab, setActiveTab] = useState<'import' | 'manage' | 'schedule' | 'ai-analysis'>('import');

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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">إدارة المقايسات والجداول الزمنية</h1>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b dark:border-gray-700 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('import')}
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'import' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
                >
                    1. استيراد المقايسة
                </button>
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'manage' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
                >
                    2. إدارة المقايسة
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'schedule' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
                >
                    3. إدارة الجدول الزمني
                </button>
                <button
                    onClick={() => setActiveTab('ai-analysis')}
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'ai-analysis' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}
                >
                    4. التحليل بالذكاء الاصطناعي ⚡
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'import' && <BOQImport onImportSuccess={handleImportSuccess} />}
            {activeTab === 'manage' && <BOQManager financials={currentFinancials} onUpdateFinancials={handleUpdateFinancials} project={project} />}
            {activeTab === 'schedule' && <ManualScheduleManager schedule={currentSchedule} financials={currentFinancials} onUpdateSchedule={handleUpdateSchedule} />}
            {activeTab === 'ai-analysis' && <BOQAIAnalysis financials={currentFinancials} onGeneratedSchedule={handleUpdateSchedule} />}
        </div>
    );
};

export default BOQManualManager;
