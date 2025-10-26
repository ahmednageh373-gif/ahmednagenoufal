import React, { useState, useEffect } from 'react';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types';

const statusMap: Record<PurchaseOrderStatus, { title: string; color: string }> = {
    'Pending Approval': { title: 'قيد الموافقة', color: 'bg-amber-500' },
    'Approved': { title: 'معتمد', color: 'bg-sky-500' },
    'Ordered': { title: 'تم الطلب', color: 'bg-indigo-500' },
    'Delivered': { title: 'تم التسليم', color: 'bg-green-500' },
    'Cancelled': { title: 'ملغي', color: 'bg-slate-500' },
};

export const OrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<PurchaseOrder, 'id'> | PurchaseOrder) => void;
  order: PurchaseOrder | null;
}> = ({ isOpen, onClose, onSave, order }) => {
    const [itemName, setItemName] = useState('');
    const [supplier, setSupplier] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [expectedDelivery, setExpectedDelivery] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<PurchaseOrderStatus>('Pending Approval');

    useEffect(() => {
        if (isOpen) {
            if (order) {
                setItemName(order.itemName);
                setSupplier(order.supplier);
                setQuantity(order.quantity);
                setUnitPrice(order.unitPrice);
                setOrderDate(order.orderDate);
                setExpectedDelivery(order.expectedDelivery);
                setStatus(order.status);
            } else {
                setItemName(''); setSupplier(''); setQuantity(1); setUnitPrice(0);
                const today = new Date().toISOString().split('T')[0];
                const delivery = new Date();
                delivery.setDate(delivery.getDate() + 14);
                setOrderDate(today); 
                setExpectedDelivery(delivery.toISOString().split('T')[0]); 
                setStatus('Pending Approval');
            }
        }
    }, [order, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const total = quantity * unitPrice;
        const orderData = { itemName, supplier, quantity, unitPrice, total, orderDate, expectedDelivery, status };
        onSave(order && order.id ? { ...order, ...orderData } : orderData);
        onClose();
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{order && order.id ? 'تعديل أمر الشراء' : 'أمر شراء جديد'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="اسم البند" value={itemName} onChange={e => setItemName(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
                    <input type="text" placeholder="المورد" value={supplier} onChange={e => setSupplier(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="الكمية" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="0" className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
                        <input type="number" placeholder="سعر الوحدة" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} min="0" step="0.01" className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">تاريخ الطلب</label><input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" /></div>
                        <div><label className="text-sm">التسليم المتوقع</label><input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg" /></div>
                    </div>
                     <select value={status} onChange={e => setStatus(e.target.value as PurchaseOrderStatus)} className="w-full bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                        {(Object.keys(statusMap) as PurchaseOrderStatus[]).map(s => <option key={s} value={s}>{statusMap[s].title}</option>)}
                    </select>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-200 dark:bg-slate-600">إلغاء</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-sky-600 text-white">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
