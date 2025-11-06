import React, { useState, useMemo, useEffect } from 'react';
import type { Project, Subcontractor, SubcontractorInvoice, SubcontractorInvoiceItem, SubcontractorInvoiceStatus, FinancialItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Users, Plus, Building, Mail, Phone, FileText, Printer, File, MoreVertical, Pencil, Trash2, X, Search } from '../lucide-icons';

// --- TYPE DEFINITIONS & MOCKS ---

const statusMap: Record<SubcontractorInvoiceStatus, { title: string; color: string }> = {
    'Draft': { title: 'مسودة', color: 'bg-gray-500' },
    'Submitted': { title: 'مقدم', color: 'bg-blue-500' },
    'Approved': { title: 'معتمد', color: 'bg-yellow-500' },
    'Paid': { title: 'مدفوع', color: 'bg-green-500' },
    'Rejected': { title: 'مرفوض', color: 'bg-red-500' },
};

// --- MODAL COMPONENTS (Scoped within this file for simplicity) ---

const SubcontractorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (sub: Omit<Subcontractor, 'id'> | Subcontractor) => void;
    subcontractor: Subcontractor | null;
}> = ({ isOpen, onClose, onSave, subcontractor }) => {
    const [name, setName] = useState(subcontractor?.name || '');
    const [trade, setTrade] = useState(subcontractor?.trade || '');
    const [contactPerson, setContactPerson] = useState(subcontractor?.contactPerson || '');
    const [contactEmail, setContactEmail] = useState(subcontractor?.contactEmail || '');
    const [contactPhone, setContactPhone] = useState(subcontractor?.contactPhone || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, trade, contactPerson, contactEmail, contactPhone };
        onSave(subcontractor ? { ...data, id: subcontractor.id } : data);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal" style={{ display: 'block' }} onClick={onClose}>
            <div className="modal-content p-6 max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{subcontractor ? 'تعديل مقاول' : 'إضافة مقاول باطن جديد'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="اسم الشركة" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <input type="text" placeholder="التخصص (مثال: كهرباء)" value={trade} onChange={e => setTrade(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <input type="text" placeholder="اسم جهة الاتصال" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <input type="email" placeholder="البريد الإلكتروني" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <input type="tel" placeholder="رقم الهاتف" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600">إلغاء</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-indigo-600 text-white">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (inv: Omit<SubcontractorInvoice, 'id'> | SubcontractorInvoice) => void;
    invoice: SubcontractorInvoice | null;
    subcontractorId: string;
    projectBoq: FinancialItem[];
}> = ({ isOpen, onClose, onSave, invoice, subcontractorId, projectBoq }) => {
    const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoiceNumber || '');
    const [date, setDate] = useState(invoice?.date || new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<SubcontractorInvoiceStatus>(invoice?.status || 'Draft');
    const [items, setItems] = useState<Partial<SubcontractorInvoiceItem>[]>(invoice?.items || [{ id: uuidv4() }]);

    const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.total || 0), 0), [items]);

    const handleItemChange = (index: number, field: keyof SubcontractorInvoiceItem, value: any) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };
        (currentItem as any)[field] = value;

        if (field === 'boqItemId') {
            const boqItem = projectBoq.find(b => b.id === value);
            if (boqItem) {
                currentItem.description = boqItem.item;
                currentItem.unitPrice = boqItem.unitPrice;
            }
        }

        if (field === 'executedQuantity' || field === 'unitPrice') {
            currentItem.total = (currentItem.executedQuantity || 0) * (currentItem.unitPrice || 0);
        }
        
        newItems[index] = currentItem;
        setItems(newItems);
    };
    
    const addItem = () => setItems([...items, { id: uuidv4() }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalItems = items.filter(i => i.description && i.executedQuantity && i.unitPrice != null) as SubcontractorInvoiceItem[];
        if(finalItems.length === 0) {
            alert("Please add at least one valid item to the invoice.");
            return;
        }
        const data = { invoiceNumber, date, status, items: finalItems, totalAmount, subcontractorId };
        onSave(invoice ? { ...data, id: invoice.id } : data);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal" style={{ display: 'block' }} onClick={onClose}>
            <div className="modal-content p-6 max-w-4xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{invoice ? 'تعديل المستخلص' : 'مستخلص جديد'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input type="text" placeholder="رقم المستخلص" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg" />
                        <select value={status} onChange={e => setStatus(e.target.value as SubcontractorInvoiceStatus)} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                            {Object.entries(statusMap).map(([key, value]) => <option key={key} value={key}>{value.title}</option>)}
                        </select>
                    </div>

                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                                <tr>
                                    <th className="p-2 text-right">بند المقايسة (اختياري)</th>
                                    <th className="p-2 text-right">الوصف</th>
                                    <th className="p-2 text-right">الكمية المنفذة</th>
                                    <th className="p-2 text-right">سعر الوحدة</th>
                                    <th className="p-2 text-right">الإجمالي</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className="border-b dark:border-gray-700 last:border-0">
                                        <td className="p-1"><select value={item.boqItemId} onChange={e => handleItemChange(index, 'boqItemId', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 p-1 rounded"><option value="">-- اختر --</option>{projectBoq.map(b => <option key={b.id} value={b.id}>{b.item}</option>)}</select></td>
                                        <td className="p-1"><input type="text" placeholder="وصف البند" value={item.description || ''} onChange={e => handleItemChange(index, 'description', e.target.value)} required className="w-full bg-gray-50 dark:bg-gray-900 p-1 rounded" /></td>
                                        <td className="p-1"><input type="number" placeholder="الكمية" value={item.executedQuantity || ''} onChange={e => handleItemChange(index, 'executedQuantity', Number(e.target.value))} required className="w-full bg-gray-50 dark:bg-gray-900 p-1 rounded" /></td>
                                        <td className="p-1"><input type="number" placeholder="السعر" value={item.unitPrice || ''} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} required className="w-full bg-gray-50 dark:bg-gray-900 p-1 rounded" /></td>
                                        <td className="p-1 font-mono">{item.total?.toLocaleString() || 0}</td>
                                        <td className="p-1 text-center"><button type="button" onClick={() => removeItem(index)}><X size={16} className="text-red-500"/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" onClick={addItem} className="text-sm text-indigo-600 font-semibold mt-2">إضافة بند +</button>

                    <div className="text-left font-bold text-lg mt-4">الإجمالي: {totalAmount.toLocaleString('ar-SA')} SAR</div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600">إلغاء</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-indigo-600 text-white">حفظ المستخلص</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface SubcontractorManagerProps {
    project: Project;
    onUpdateSubcontractors: (projectId: string, newSubs: Subcontractor[]) => void;
    onUpdateInvoices: (projectId: string, newInvoices: SubcontractorInvoice[]) => void;
}

declare var XLSX: any;

export const SubcontractorManager: React.FC<SubcontractorManagerProps> = ({ project, onUpdateSubcontractors, onUpdateInvoices }) => {
    const { subcontractors, subcontractorInvoices, financials } = project.data;
    const [selectedSubId, setSelectedSubId] = useState<string | null>(subcontractors.length > 0 ? subcontractors[0].id : null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subcontractor | null>(null);

    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<SubcontractorInvoice | null>(null);

    const filteredSubcontractors = useMemo(() => {
        if (!searchTerm) return subcontractors;
        const lowercasedFilter = searchTerm.toLowerCase();
        return subcontractors.filter(sub =>
            sub.name.toLowerCase().includes(lowercasedFilter) ||
            sub.trade.toLowerCase().includes(lowercasedFilter) ||
            sub.contactPerson.toLowerCase().includes(lowercasedFilter)
        );
    }, [subcontractors, searchTerm]);

    useEffect(() => {
        if (!selectedSubId || filteredSubcontractors.some(s => s.id === selectedSubId)) {
            return;
        }
        setSelectedSubId(filteredSubcontractors.length > 0 ? filteredSubcontractors[0].id : null);
    }, [filteredSubcontractors, selectedSubId]);

    const selectedSubcontractor = useMemo(() => filteredSubcontractors.find(s => s.id === selectedSubId), [filteredSubcontractors, selectedSubId]);
    const selectedSubInvoices = useMemo(() => subcontractorInvoices.filter(i => i.subcontractorId === selectedSubId), [subcontractorInvoices, selectedSubId]);

    const handleSaveSubcontractor = (data: Omit<Subcontractor, 'id'> | Subcontractor) => {
        let newSubs: Subcontractor[];
        if ('id' in data) {
            newSubs = subcontractors.map(s => s.id === data.id ? data : s);
        } else {
            const newSub = { ...data, id: uuidv4() };
            newSubs = [...subcontractors, newSub];
            setSelectedSubId(newSub.id);
        }
        onUpdateSubcontractors(project.id, newSubs);
    };
    
    const handleSaveInvoice = (data: Omit<SubcontractorInvoice, 'id'> | SubcontractorInvoice) => {
        let newInvoices: SubcontractorInvoice[];
        if ('id' in data) {
            newInvoices = subcontractorInvoices.map(i => i.id === data.id ? data : i);
        } else {
            newInvoices = [...subcontractorInvoices, { ...data, id: uuidv4() }];
        }
        onUpdateInvoices(project.id, newInvoices);
    };

    const handlePrint = () => window.print();
    const handleExportXLSX = () => {
        const subsData = subcontractors.map(s => ({
            'ID': s.id, 'الاسم': s.name, 'التخصص': s.trade, 'جهة الاتصال': s.contactPerson, 'البريد الإلكتروني': s.contactEmail, 'الهاتف': s.contactPhone
        }));
        const invoicesData = subcontractorInvoices.map(i => {
            const sub = subcontractors.find(s => s.id === i.subcontractorId);
            return {
                'ID المستخلص': i.id, 'رقم المستخلص': i.invoiceNumber, 'المقاول': sub?.name, 'التاريخ': i.date, 'الحالة': statusMap[i.status].title, 'الإجمالي': i.totalAmount
            };
        });
        const subsSheet = XLSX.utils.json_to_sheet(subsData);
        const invoicesSheet = XLSX.utils.json_to_sheet(invoicesData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, subsSheet, "Subcontractors");
        XLSX.utils.book_append_sheet(workbook, invoicesSheet, "Invoices");
        XLSX.writeFile(workbook, `subcontractors_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    return (
        <div className="printable-area">
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold">إدارة مقاولي الباطن</h1>
                    <p className="text-gray-500 mt-1">متابعة المستخلصات والكميات المنفذة لمشروع: {project.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"><File size={18} /><span>تصدير Excel</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600"><Printer size={18} /><span>طباعة / PDF</span></button>
                    <button onClick={() => { setEditingSub(null); setIsSubModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700"><Plus size={18} /><span>إضافة مقاول</span></button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Subcontractors List */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 p-4 rounded-xl shadow-sm border dark:border-gray-800 no-print">
                    <h3 className="font-bold mb-4">قائمة المقاولين</h3>
                    <div className="relative mb-4">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {filteredSubcontractors.map(sub => (
                            <button key={sub.id} onClick={() => setSelectedSubId(sub.id)} className={`w-full text-right p-3 rounded-lg flex items-center gap-3 ${selectedSubId === sub.id ? 'bg-indigo-100 dark:bg-indigo-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                <div className="bg-indigo-200 dark:bg-indigo-800 p-2 rounded-full"><Building size={16}/></div>
                                <div>
                                    <p className="font-semibold text-sm">{sub.name}</p>
                                    <p className="text-xs text-gray-500">{sub.trade}</p>
                                </div>
                            </button>
                        ))}
                        {filteredSubcontractors.length === 0 && (
                             <p className="text-center text-sm text-gray-500 py-4">لا توجد نتائج مطابقة.</p>
                        )}
                    </div>
                </div>

                {/* Details Panel */}
                <div className="lg:col-span-3">
                    {selectedSubcontractor ? (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                                <h2 className="text-2xl font-bold mb-2">{selectedSubcontractor.name}</h2>
                                <p className="text-gray-500 mb-4">{selectedSubcontractor.trade}</p>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                    <span className="flex items-center gap-2"><Users size={14}/> {selectedSubcontractor.contactPerson}</span>
                                    <span className="flex items-center gap-2"><Mail size={14}/> {selectedSubcontractor.contactEmail}</span>
                                    <span className="flex items-center gap-2"><Phone size={14}/> {selectedSubcontractor.contactPhone}</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold">المستخلصات</h3>
                                    <button onClick={() => { setEditingInvoice(null); setIsInvoiceModalOpen(true); }} className="no-print flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 text-sm"><Plus size={16} /><span>مستخلص جديد</span></button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead><tr className="border-b dark:border-gray-700"><th className="p-2">الرقم</th><th className="p-2">التاريخ</th><th className="p-2">الإجمالي</th><th className="p-2">الحالة</th><th className="p-2 no-print"></th></tr></thead>
                                        <tbody>
                                            {selectedSubInvoices.map(inv => (
                                                <tr key={inv.id} className="border-b dark:border-gray-700 last:border-0">
                                                    <td className="p-2 font-medium">{inv.invoiceNumber}</td>
                                                    <td className="p-2">{inv.date}</td>
                                                    <td className="p-2 font-mono">{inv.totalAmount.toLocaleString('ar-SA')} SAR</td>
                                                    <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${statusMap[inv.status].color}`}>{statusMap[inv.status].title}</span></td>
                                                    <td className="p-2 no-print"><button onClick={() => { setEditingInvoice(inv); setIsInvoiceModalOpen(true); }}><Pencil size={14}/></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-xl"><p>الرجاء اختيار مقاول لعرض التفاصيل</p></div>
                    )}
                </div>
            </div>

            <SubcontractorModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} onSave={handleSaveSubcontractor} subcontractor={editingSub} />
            {isInvoiceModalOpen && selectedSubId && <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} onSave={handleSaveInvoice} invoice={editingInvoice} subcontractorId={selectedSubId} projectBoq={financials} />}
        </div>
    );
};