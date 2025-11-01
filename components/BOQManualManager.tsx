import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Upload, Plus, Save, FileDown, Search, Edit2, Trash2, X, Check, FileSpreadsheet, Calendar, Link as LinkIcon } from 'lucide-react';
import type { Project } from '../types';

// --- Type Definitions ---

export interface BOQItem {
    id: string;
    itemNo: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

export interface ScheduleItem {
    id: string;
    taskName: string;
    boqItemIds: string[];
    startDate: string;
    duration: number;
    endDate: string;
    progress: number;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    notes?: string;
}

interface BOQManualManagerProps {
    project: Project;
}

// --- Helper Functions ---

const parseExcelDate = (excelDate: number): string => {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
};

const detectBOQColumns = (headers: string[]): Record<string, number> => {
    const mapping: Record<string, number> = {};
    
    const headerLower = headers.map(h => h.toLowerCase().trim());
    
    // Item Number mapping
    const itemNoPatterns = ['item no', 'رقم', 'item', 'no', 'م'];
    const itemNoIdx = headerLower.findIndex(h => 
        itemNoPatterns.some(p => h.includes(p.toLowerCase()))
    );
    if (itemNoIdx !== -1) mapping.itemNo = itemNoIdx;
    
    // Description mapping
    const descPatterns = ['description', 'الوصف', 'وصف', 'item description', 'البند'];
    const descIdx = headerLower.findIndex(h => 
        descPatterns.some(p => h.includes(p.toLowerCase()))
    );
    if (descIdx !== -1) mapping.description = descIdx;
    
    // Unit mapping
    const unitPatterns = ['unit', 'الوحدة', 'وحدة'];
    const unitIdx = headerLower.findIndex(h => 
        unitPatterns.some(p => h.includes(p.toLowerCase()))
    );
    if (unitIdx !== -1) mapping.unit = unitIdx;
    
    // Quantity mapping
    const qtyPatterns = ['quantity', 'الكمية', 'كمية', 'qty'];
    const qtyIdx = headerLower.findIndex(h => 
        qtyPatterns.some(p => h.includes(p.toLowerCase()))
    );
    if (qtyIdx !== -1) mapping.quantity = qtyIdx;
    
    // Unit Price mapping
    const pricePatterns = ['unit price', 'سعر الوحدة', 'price', 'rate'];
    const priceIdx = headerLower.findIndex(h => 
        pricePatterns.some(p => h.includes(p.toLowerCase()))
    );
    if (priceIdx !== -1) mapping.unitPrice = priceIdx;
    
    return mapping;
};

const parseBOQFromExcel = async (file: File): Promise<BOQItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = (window as any).XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = (window as any).XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                if (rows.length < 2) {
                    reject(new Error('الملف فارغ أو لا يحتوي على بيانات كافية'));
                    return;
                }
                
                // Find header row
                let headerRowIdx = 0;
                for (let i = 0; i < Math.min(5, rows.length); i++) {
                    const row = rows[i];
                    if (row && row.length > 3) {
                        headerRowIdx = i;
                        break;
                    }
                }
                
                const headers = rows[headerRowIdx];
                const columnMapping = detectBOQColumns(headers);
                
                const items: BOQItem[] = [];
                
                for (let i = headerRowIdx + 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;
                    
                    const itemNo = columnMapping.itemNo !== undefined ? String(row[columnMapping.itemNo] || '') : '';
                    const description = columnMapping.description !== undefined ? String(row[columnMapping.description] || '') : '';
                    
                    if (!description) continue;
                    
                    const unit = columnMapping.unit !== undefined ? String(row[columnMapping.unit] || 'م') : 'م';
                    const quantity = columnMapping.quantity !== undefined ? parseFloat(row[columnMapping.quantity]) || 0 : 0;
                    const unitPrice = columnMapping.unitPrice !== undefined ? parseFloat(row[columnMapping.unitPrice]) || 0 : 0;
                    
                    items.push({
                        id: `boq-${Date.now()}-${i}`,
                        itemNo: itemNo || `${i}`,
                        description,
                        unit,
                        quantity,
                        unitPrice,
                        totalPrice: quantity * unitPrice,
                    });
                }
                
                resolve(items);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('فشل قراءة الملف'));
        reader.readAsArrayBuffer(file);
    });
};

const exportBOQToExcel = (items: BOQItem[], fileName: string) => {
    const XLSX = (window as any).XLSX;
    
    const data = [
        ['رقم البند', 'الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'ملاحظات'],
        ...items.map(item => [
            item.itemNo,
            item.description,
            item.unit,
            item.quantity,
            item.unitPrice,
            item.totalPrice,
            item.notes || '',
        ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 10 },
        { wch: 40 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
    ];
    
    // Style header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4F46E5' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        };
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BOQ');
    XLSX.writeFile(wb, fileName);
};

const exportScheduleToExcel = (schedule: ScheduleItem[], boqItems: BOQItem[], fileName: string) => {
    const XLSX = (window as any).XLSX;
    
    const data = [
        ['اسم المهمة', 'بنود المقايسة المرتبطة', 'تاريخ البداية', 'المدة (أيام)', 'تاريخ النهاية', 'نسبة الإنجاز %', 'الحالة', 'الأولوية', 'ملاحظات'],
        ...schedule.map(task => {
            const linkedBOQs = task.boqItemIds
                .map(id => boqItems.find(b => b.id === id))
                .filter(Boolean)
                .map(b => b!.itemNo)
                .join(', ');
            
            return [
                task.taskName,
                linkedBOQs,
                task.startDate,
                task.duration,
                task.endDate,
                task.progress,
                task.status,
                task.priority,
                task.notes || '',
            ];
        })
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 30 },
        { wch: 25 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 30 },
    ];
    
    // Style header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '10B981' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        };
    }
    
    // Color code status
    for (let R = 1; R <= schedule.length; ++R) {
        const statusCell = ws[`G${R + 1}`];
        if (!statusCell) continue;
        
        let fillColor = 'F3F4F6';
        if (statusCell.v === 'Done') fillColor = '10B981';
        else if (statusCell.v === 'In Progress') fillColor = 'F59E0B';
        else if (statusCell.v === 'To Do') fillColor = 'EF4444';
        
        statusCell.s = {
            fill: { fgColor: { rgb: fillColor } },
            alignment: { horizontal: 'center', vertical: 'center' },
        };
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    XLSX.writeFile(wb, fileName);
};

const calculateEndDate = (startDate: string, duration: number): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
    return end.toISOString().split('T')[0];
};

// --- Main Component ---

export const BOQManualManager: React.FC<BOQManualManagerProps> = ({ project }) => {
    const [boqItems, setBOQItems] = useState<BOQItem[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingBOQId, setEditingBOQId] = useState<string | null>(null);
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'boq' | 'schedule'>('boq');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // BOQ form state
    const [newBOQ, setNewBOQ] = useState<Partial<BOQItem>>({
        itemNo: '',
        description: '',
        unit: 'م',
        quantity: 0,
        unitPrice: 0,
    });
    
    // Schedule form state
    const [newSchedule, setNewSchedule] = useState<Partial<ScheduleItem>>({
        taskName: '',
        boqItemIds: [],
        startDate: new Date().toISOString().split('T')[0],
        duration: 1,
        progress: 0,
        status: 'To Do',
        priority: 'Medium',
    });
    
    const [selectedBOQsForSchedule, setSelectedBOQsForSchedule] = useState<string[]>([]);
    
    // --- BOQ Management ---
    
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsImporting(true);
        try {
            const items = await parseBOQFromExcel(file);
            setBOQItems(items);
            alert(`تم استيراد ${items.length} بند بنجاح!`);
        } catch (error) {
            alert(`خطأ في الاستيراد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const handleAddBOQItem = () => {
        if (!newBOQ.description) {
            alert('يرجى إدخال وصف البند');
            return;
        }
        
        const item: BOQItem = {
            id: `boq-${Date.now()}`,
            itemNo: newBOQ.itemNo || `${boqItems.length + 1}`,
            description: newBOQ.description,
            unit: newBOQ.unit || 'م',
            quantity: newBOQ.quantity || 0,
            unitPrice: newBOQ.unitPrice || 0,
            totalPrice: (newBOQ.quantity || 0) * (newBOQ.unitPrice || 0),
            notes: newBOQ.notes,
        };
        
        setBOQItems([...boqItems, item]);
        setNewBOQ({
            itemNo: '',
            description: '',
            unit: 'م',
            quantity: 0,
            unitPrice: 0,
        });
    };
    
    const handleUpdateBOQItem = (id: string, updates: Partial<BOQItem>) => {
        setBOQItems(items =>
            items.map(item => {
                if (item.id === id) {
                    const updated = { ...item, ...updates };
                    updated.totalPrice = updated.quantity * updated.unitPrice;
                    return updated;
                }
                return item;
            })
        );
        setEditingBOQId(null);
    };
    
    const handleDeleteBOQItem = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا البند؟')) {
            setBOQItems(items => items.filter(item => item.id !== id));
        }
    };
    
    const handleExportBOQ = () => {
        if (boqItems.length === 0) {
            alert('لا توجد بنود للتصدير');
            return;
        }
        
        const fileName = `BOQ_${project.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
        exportBOQToExcel(boqItems, fileName);
    };
    
    // --- Schedule Management ---
    
    const handleAddScheduleItem = () => {
        if (!newSchedule.taskName) {
            alert('يرجى إدخال اسم المهمة');
            return;
        }
        
        const endDate = calculateEndDate(
            newSchedule.startDate || new Date().toISOString().split('T')[0],
            newSchedule.duration || 1
        );
        
        const item: ScheduleItem = {
            id: `schedule-${Date.now()}`,
            taskName: newSchedule.taskName,
            boqItemIds: selectedBOQsForSchedule,
            startDate: newSchedule.startDate || new Date().toISOString().split('T')[0],
            duration: newSchedule.duration || 1,
            endDate,
            progress: newSchedule.progress || 0,
            status: newSchedule.status || 'To Do',
            priority: newSchedule.priority || 'Medium',
            notes: newSchedule.notes,
        };
        
        setSchedule([...schedule, item]);
        setNewSchedule({
            taskName: '',
            boqItemIds: [],
            startDate: new Date().toISOString().split('T')[0],
            duration: 1,
            progress: 0,
            status: 'To Do',
            priority: 'Medium',
        });
        setSelectedBOQsForSchedule([]);
    };
    
    const handleUpdateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
        setSchedule(items =>
            items.map(item => {
                if (item.id === id) {
                    const updated = { ...item, ...updates };
                    if (updates.startDate || updates.duration) {
                        updated.endDate = calculateEndDate(updated.startDate, updated.duration);
                    }
                    return updated;
                }
                return item;
            })
        );
        setEditingScheduleId(null);
    };
    
    const handleDeleteScheduleItem = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            setSchedule(items => items.filter(item => item.id !== id));
        }
    };
    
    const handleExportSchedule = () => {
        if (schedule.length === 0) {
            alert('لا توجد مهام للتصدير');
            return;
        }
        
        const fileName = `Schedule_${project.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
        exportScheduleToExcel(schedule, boqItems, fileName);
    };
    
    // --- Filtering and Summary ---
    
    const filteredBOQItems = useMemo(() => {
        if (!searchQuery) return boqItems;
        const query = searchQuery.toLowerCase();
        return boqItems.filter(item =>
            item.itemNo.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.unit.toLowerCase().includes(query)
        );
    }, [boqItems, searchQuery]);
    
    const boqSummary = useMemo(() => {
        const total = boqItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return {
            totalItems: boqItems.length,
            totalCost: total,
        };
    }, [boqItems]);
    
    const scheduleSummary = useMemo(() => {
        const totalTasks = schedule.length;
        const completedTasks = schedule.filter(t => t.status === 'Done').length;
        const inProgressTasks = schedule.filter(t => t.status === 'In Progress').length;
        const avgProgress = schedule.length > 0
            ? schedule.reduce((sum, t) => sum + t.progress, 0) / schedule.length
            : 0;
        
        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            avgProgress: avgProgress.toFixed(1),
        };
    }, [schedule]);
    
    // --- Render ---
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            إدارة المقايسات والجداول الزمنية (يدوي)
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            إدارة شاملة للمقايسات والجداول الزمنية مع إمكانية الاستيراد والتصدير
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Upload size={20} />
                            استيراد Excel
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('boq')}
                            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                                activeTab === 'boq'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <FileSpreadsheet size={20} />
                            المقايسة (BOQ)
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                                activeTab === 'schedule'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Calendar size={20} />
                            الجدول الزمني
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    {activeTab === 'boq' ? (
                        <div className="space-y-6">
                            {/* BOQ Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي البنود</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {boqSummary.totalItems}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي التكلفة</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {boqSummary.totalCost.toLocaleString()} ر.س
                                    </p>
                                </div>
                            </div>
                            
                            {/* BOQ Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="البحث في البنود..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <button
                                    onClick={handleExportBOQ}
                                    disabled={boqItems.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileDown size={20} />
                                    تصدير Excel
                                </button>
                            </div>
                            
                            {/* Add BOQ Item Form */}
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">إضافة بند جديد</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                                    <input
                                        type="text"
                                        placeholder="رقم البند"
                                        value={newBOQ.itemNo || ''}
                                        onChange={(e) => setNewBOQ({ ...newBOQ, itemNo: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="text"
                                        placeholder="الوصف *"
                                        value={newBOQ.description || ''}
                                        onChange={(e) => setNewBOQ({ ...newBOQ, description: e.target.value })}
                                        className="sm:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="text"
                                        placeholder="الوحدة"
                                        value={newBOQ.unit || ''}
                                        onChange={(e) => setNewBOQ({ ...newBOQ, unit: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="الكمية"
                                        value={newBOQ.quantity || ''}
                                        onChange={(e) => setNewBOQ({ ...newBOQ, quantity: parseFloat(e.target.value) || 0 })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="سعر الوحدة"
                                        value={newBOQ.unitPrice || ''}
                                        onChange={(e) => setNewBOQ({ ...newBOQ, unitPrice: parseFloat(e.target.value) || 0 })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <button
                                    onClick={handleAddBOQItem}
                                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    <Plus size={20} />
                                    إضافة بند
                                </button>
                            </div>
                            
                            {/* BOQ Items Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">رقم البند</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">الوصف</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">الوحدة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">الكمية</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">سعر الوحدة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">الإجمالي</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredBOQItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    لا توجد بنود. قم بإضافة بنود جديدة أو استيراد من Excel
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBOQItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-4 py-3">{item.itemNo}</td>
                                                    <td className="px-4 py-3">
                                                        {editingBOQId === item.id ? (
                                                            <input
                                                                type="text"
                                                                value={item.description}
                                                                onChange={(e) => handleUpdateBOQItem(item.id, { description: e.target.value })}
                                                                className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                                                            />
                                                        ) : (
                                                            item.description
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">{item.unit}</td>
                                                    <td className="px-4 py-3">
                                                        {editingBOQId === item.id ? (
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => handleUpdateBOQItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                                                className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                                                            />
                                                        ) : (
                                                            item.quantity.toLocaleString()
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {editingBOQId === item.id ? (
                                                            <input
                                                                type="number"
                                                                value={item.unitPrice}
                                                                onChange={(e) => handleUpdateBOQItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                                                className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                                                            />
                                                        ) : (
                                                            item.unitPrice.toLocaleString()
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold">{item.totalPrice.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {editingBOQId === item.id ? (
                                                                <button
                                                                    onClick={() => setEditingBOQId(null)}
                                                                    className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setEditingBOQId(item.id)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                                >
                                                                    <Edit2 size={18} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteBOQItem(item.id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Schedule Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي المهام</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {scheduleSummary.totalTasks}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مكتمل</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {scheduleSummary.completedTasks}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">قيد التنفيذ</p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {scheduleSummary.inProgressTasks}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">متوسط الإنجاز</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {scheduleSummary.avgProgress}%
                                    </p>
                                </div>
                            </div>
                            
                            {/* Schedule Actions */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleExportSchedule}
                                    disabled={schedule.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileDown size={20} />
                                    تصدير Excel
                                </button>
                            </div>
                            
                            {/* Add Schedule Item Form */}
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">إضافة مهمة جديدة</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="اسم المهمة *"
                                        value={newSchedule.taskName || ''}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, taskName: e.target.value })}
                                        className="lg:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <div className="relative">
                                        <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            multiple
                                            value={selectedBOQsForSchedule}
                                            onChange={(e) => setSelectedBOQsForSchedule(Array.from(e.target.selectedOptions, option => option.value))}
                                            className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            size={3}
                                        >
                                            <option value="">-- ربط ببنود المقايسة --</option>
                                            {boqItems.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.itemNo} - {item.description.substring(0, 30)}...
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="date"
                                        value={newSchedule.startDate || ''}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="المدة (أيام)"
                                        value={newSchedule.duration || ''}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) || 1 })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="نسبة الإنجاز %"
                                        min="0"
                                        max="100"
                                        value={newSchedule.progress || ''}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, progress: parseInt(e.target.value) || 0 })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                    <select
                                        value={newSchedule.status || 'To Do'}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, status: e.target.value as ScheduleItem['status'] })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="To Do">لم يبدأ</option>
                                        <option value="In Progress">قيد التنفيذ</option>
                                        <option value="Done">مكتمل</option>
                                    </select>
                                    <select
                                        value={newSchedule.priority || 'Medium'}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, priority: e.target.value as ScheduleItem['priority'] })}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="Low">منخفضة</option>
                                        <option value="Medium">متوسطة</option>
                                        <option value="High">عالية</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddScheduleItem}
                                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    <Plus size={20} />
                                    إضافة مهمة
                                </button>
                            </div>
                            
                            {/* Schedule Items Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">اسم المهمة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">بنود مرتبطة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">البداية</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">المدة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">النهاية</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">الإنجاز</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">الأولوية</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {schedule.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    لا توجد مهام. قم بإضافة مهمة جديدة
                                                </td>
                                            </tr>
                                        ) : (
                                            schedule.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-4 py-3">{item.taskName}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {item.boqItemIds.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.boqItemIds.map(id => {
                                                                    const boqItem = boqItems.find(b => b.id === id);
                                                                    return boqItem ? (
                                                                        <span key={id} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                                                                            {boqItem.itemNo}
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">{item.startDate}</td>
                                                    <td className="px-4 py-3">{item.duration} يوم</td>
                                                    <td className="px-4 py-3">{item.endDate}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                                <div
                                                                    className="bg-green-500 h-2 rounded-full"
                                                                    style={{ width: `${item.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm">{item.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            item.status === 'Done'
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                : item.status === 'In Progress'
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {item.status === 'Done' ? 'مكتمل' : item.status === 'In Progress' ? 'قيد التنفيذ' : 'لم يبدأ'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            item.priority === 'High'
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                : item.priority === 'Medium'
                                                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                        }`}>
                                                            {item.priority === 'High' ? 'عالية' : item.priority === 'Medium' ? 'متوسطة' : 'منخفضة'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleDeleteScheduleItem(item.id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BOQManualManager;
