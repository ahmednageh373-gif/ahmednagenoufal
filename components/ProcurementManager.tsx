import React, { useState, useMemo } from 'react';
import type { Project, PurchaseOrder, PurchaseOrderStatus } from '../types';
import { Plus, Search, LayoutGrid, List, MoreHorizontal, Pencil, Trash2, File, Printer } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { OrderModal } from './OrderModal';

// --- View Components ---

const statusMap: Record<PurchaseOrderStatus, { title: string; color: string }> = {
    'Pending Approval': { title: 'قيد الموافقة', color: 'bg-amber-500' },
    'Approved': { title: 'معتمد', color: 'bg-sky-500' },
    'Ordered': { title: 'تم الطلب', color: 'bg-indigo-500' },
    'Delivered': { title: 'تم التسليم', color: 'bg-green-500' },
    'Cancelled': { title: 'ملغي', color: 'bg-slate-500' },
};

const OrderCard: React.FC<{ order: PurchaseOrder }> = ({ order }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="font-semibold text-sm mb-1">{order.itemName}</p>
            <p className="text-xs text-slate-500 mb-2">{order.supplier}</p>
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-sky-600 dark:text-sky-400">{order.total.toLocaleString('ar-SA')} SAR</span>
                <span className="text-slate-400">{order.expectedDelivery}</span>
            </div>
        </div>
    );
};

const OrderTable: React.FC<{ orders: PurchaseOrder[], onEdit: (order: PurchaseOrder) => void, onDelete: (id: string) => void }> = ({ orders, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-right responsive-table">
            <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                    <th className="p-3">البند</th><th className="p-3">المورد</th><th className="p-3">الحالة</th>
                    <th className="p-3">الكمية</th><th className="p-3">الإجمالي</th><th className="p-3">تاريخ الطلب</th><th className="p-3"></th>
                </tr>
            </thead>
            <tbody>
                {orders.map(order => (
                    <tr key={order.id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="p-3 font-medium" data-label="البند">{order.itemName}</td>
                        <td className="p-3" data-label="المورد">{order.supplier}</td>
                        <td className="p-3" data-label="الحالة">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${statusMap[order.status].color}`}>
                                {statusMap[order.status].title}
                            </span>
                        </td>
                        <td className="p-3" data-label="الكمية">{order.quantity}</td>
                        <td className="p-3 font-mono" data-label="الإجمالي">{order.total.toLocaleString('ar-SA')}</td>
                        <td className="p-3 font-mono" data-label="تاريخ الطلب">{order.orderDate}</td>
                        <td className="p-3" data-label="إجراءات">
                             <div className="flex items-center gap-2">
                                <button onClick={() => onEdit(order)} className="text-slate-500 hover:text-sky-500 p-1"><Pencil size={16} /></button>
                                <button onClick={() => onDelete(order.id)} className="text-slate-500 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const OrderKanban: React.FC<{ orders: PurchaseOrder[], onUpdateOrders: (orders: PurchaseOrder[]) => void }> = ({ orders, onUpdateOrders }) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [justDroppedItemId, setJustDroppedItemId] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('kanban-column-drag-over');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('kanban-column-drag-over');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: PurchaseOrderStatus) => {
        e.preventDefault();
        e.currentTarget.classList.remove('kanban-column-drag-over');
        const itemId = e.dataTransfer.getData('text/plain');
        if(itemId && orders.find(o => o.id === itemId)?.status !== newStatus) {
            const updatedOrders = orders.map(o => o.id === itemId ? {...o, status: newStatus} : o);
            onUpdateOrders(updatedOrders);
            setJustDroppedItemId(itemId);
            setTimeout(() => setJustDroppedItemId(null), 1000);
        }
        setDraggedItemId(null);
    };
    
    return (
        <div className="w-full overflow-x-auto p-2">
            <div className="flex gap-6 min-w-max">
                {(Object.keys(statusMap) as PurchaseOrderStatus[]).map(status => {
                    const columnOrders = orders.filter(o => o.status === status);
                    return (
                        <div key={status} 
                             onDragOver={handleDragOver}
                             onDragLeave={handleDragLeave}
                             onDrop={e => handleDrop(e, status)}
                             className="w-72 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 shrink-0 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`w-2 h-2 rounded-full ${statusMap[status].color}`}></span>
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{statusMap[status].title}</h4>
                                <span className="text-sm font-semibold text-slate-500 mr-auto">{columnOrders.length}</span>
                            </div>
                            <div className="space-y-3">
                                {columnOrders.map(order => (
                                    <div key={order.id} 
                                         draggable 
                                         onDragStart={e => { e.dataTransfer.setData('text/plain', order.id); setDraggedItemId(order.id); }} 
                                         onDragEnd={() => setDraggedItemId(null)}
                                         className={`cursor-move ${draggedItemId === order.id ? 'opacity-50' : ''} ${justDroppedItemId === order.id ? 'card-drop-success' : ''}`}
                                    >
                                        <OrderCard order={order} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main Manager Component ---
interface ProcurementManagerProps {
    project: Project;
    onUpdatePurchaseOrders: (projectId: string, newOrders: PurchaseOrder[]) => void;
}

declare var XLSX: any;

export const ProcurementManager: React.FC<ProcurementManagerProps> = ({ project, onUpdatePurchaseOrders }) => {
    const orders = project.data.purchaseOrders || [];
    const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = useMemo(() => orders.filter(order =>
        order.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    ), [orders, searchTerm]);

    const handleSaveOrder = (orderData: Omit<PurchaseOrder, 'id'> | PurchaseOrder) => {
        let updatedOrders: PurchaseOrder[];
        if ('id' in orderData && orderData.id) {
            updatedOrders = orders.map(o => o.id === orderData.id ? orderData : o);
        } else {
            updatedOrders = [...orders, { ...orderData, id: uuidv4() }];
        }
        onUpdatePurchaseOrders(project.id, updatedOrders);
    };

    const handleDeleteOrder = (orderId: string) => {
        if (window.confirm('هل أنت متأكد من حذف أمر الشراء هذا؟')) {
            onUpdatePurchaseOrders(project.id, orders.filter(o => o.id !== orderId));
        }
    };
    
    const handleUpdateFromKanban = (newOrders: PurchaseOrder[]) => {
        onUpdatePurchaseOrders(project.id, newOrders);
    };

    const handleOpenModalForEdit = (order: PurchaseOrder) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };
    
    const handleExportXLSX = () => {
        const dataToExport = filteredOrders.map(order => ({
            'ID': order.id,
            'البند': order.itemName,
            'المورد': order.supplier,
            'الكمية': order.quantity,
            'سعر الوحدة': order.unitPrice,
            'الإجمالي': order.total,
            'تاريخ الطلب': order.orderDate,
            'التسليم المتوقع': order.expectedDelivery,
            'الحالة': statusMap[order.status].title,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");
        XLSX.writeFile(workbook, `purchase_orders_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">إدارة المشتريات</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">تتبع أوامر الشراء لمشروع: {project.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                        <File size={18} /><span>تصدير Excel</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                    <button
                        onClick={() => { setEditingOrder(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700"
                    >
                        <Plus size={18} /><span>أمر شراء جديد</span>
                    </button>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between p-2 flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="بحث في الطلبات..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-64 bg-white dark:bg-slate-700 rounded-lg py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-lg">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}><List size={18} /></button>
                    <button onClick={() => setViewMode('board')} className={`p-2 rounded-md ${viewMode === 'board' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}><LayoutGrid size={18} /></button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                {viewMode === 'list' ? (
                    <OrderTable orders={filteredOrders} onEdit={handleOpenModalForEdit} onDelete={handleDeleteOrder} />
                ) : (
                    <OrderKanban orders={filteredOrders} onUpdateOrders={handleUpdateFromKanban} />
                )}
                 {filteredOrders.length === 0 && <p className="text-center p-8 text-slate-500">لا توجد أوامر شراء مطابقة.</p>}
            </div>

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrder}
                order={editingOrder}
            />
        </div>
    );
};