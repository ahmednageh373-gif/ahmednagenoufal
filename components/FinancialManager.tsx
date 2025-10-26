

import React, { useState, useMemo } from 'react';
// Fix: Correct import path for types.
import type { Project, FinancialItem, CostBreakdownItem, BOQItemSentiment, PurchaseOrder, DetailedCostBreakdown } from '../types';
// Fix: Correct import path for geminiService.
import { getCostBreakdown, analyzeFinancials, analyzeBOQForCodeCompliance, analyzeBOQSentiments, analyzeBOQPrices, generatePurchaseOrderFromBOQItem } from '../services/geminiService';
import { DollarSign, Search, FileText, Bot, BarChart, File, Printer, Smile, Frown, Meh, AlertTriangle, ShoppingCart } from 'lucide-react';
import { CostBreakdownModal } from './CostBreakdownModal';
import { OrderModal } from './OrderModal';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';

interface FinancialManagerProps {
    project: Project;
    onUpdatePurchaseOrders: (projectId: string, newOrders: PurchaseOrder[]) => void;
}

declare var XLSX: any;

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold">{value}</p>
    </div>
);

const SentimentIcon: React.FC<{ sentiment: 'Positive' | 'Negative' | 'Neutral' }> = ({ sentiment }) => {
    switch (sentiment) {
        case 'Positive': return <Smile size={18} className="text-green-500" />;
        case 'Negative': return <Frown size={18} className="text-red-500" />;
        case 'Neutral': return <Meh size={18} className="text-gray-500" />;
        default: return null;
    }
};

export const FinancialManager: React.FC<FinancialManagerProps> = ({ project, onUpdatePurchaseOrders }) => {
    const financials = project.data.financials || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'analysis' | 'code' | 'sentiment' | 'price'>('analysis');
    
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FinancialItem | null>(null);
    const [breakdownResult, setBreakdownResult] = useState<DetailedCostBreakdown | null>(null);
    const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
    const [breakdownError, setBreakdownError] = useState('');
    
    const [analysisResult, setAnalysisResult] = useState('');
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

    const [sentimentResults, setSentimentResults] = useState<BOQItemSentiment[]>([]);
    
    const [isPoModalOpen, setIsPoModalOpen] = useState(false);
    const [poDraft, setPoDraft] = useState<PurchaseOrder | null>(null);
    const [isGeneratingPo, setIsGeneratingPo] = useState<string | null>(null);

    const filteredFinancials = useMemo(() =>
        financials.filter(item =>
            item.item.toLowerCase().includes(searchTerm.toLowerCase())
        ), [financials, searchTerm]);

    const totalCost = useMemo(() =>
        financials.reduce((sum, item) => sum + item.total, 0), [financials]);

    const handleOpenBreakdown = async (item: FinancialItem) => {
        setSelectedItem(item);
        setIsBreakdownModalOpen(true);
        setIsBreakdownLoading(true);
        setBreakdownError('');
        setBreakdownResult(null);
        try {
            const result = await getCostBreakdown(item);
            setBreakdownResult(result);
        } catch (e) {
            setBreakdownError((e as Error).message);
        } finally {
            setIsBreakdownLoading(false);
        }
    };
    
    const handleRunAnalysis = async (type: 'financial' | 'code' | 'sentiment' | 'price') => {
        setIsAnalysisLoading(true);
        setAnalysisResult('');
        setSentimentResults([]);

        try {
            if (type === 'sentiment') {
                const results = await analyzeBOQSentiments(financials);
                setSentimentResults(results);
            } else if (type === 'price') {
                const result = await analyzeBOQPrices(financials);
                setAnalysisResult(result);
            } else {
                 const result = type === 'financial'
                    ? await analyzeFinancials(financials)
                    : await analyzeBOQForCodeCompliance(financials);
                setAnalysisResult(result);
            }
        } catch (e) {
            alert(`Analysis failed: ${(e as Error).message}`);
        } finally {
            setIsAnalysisLoading(false);
        }
    };
    
    const handleCreatePo = async (item: FinancialItem) => {
        setIsGeneratingPo(item.id);
        try {
            const draft = await generatePurchaseOrderFromBOQItem(item);
            setPoDraft({ ...draft, id: '', total: draft.quantity * draft.unitPrice });
            setIsPoModalOpen(true);
        } catch (e) {
            alert(`Failed to generate PO draft: ${(e as Error).message}`);
        } finally {
            setIsGeneratingPo(null);
        }
    };
    
    const handleSavePo = (orderData: Omit<PurchaseOrder, 'id'> | PurchaseOrder) => {
        const newOrder: PurchaseOrder = 'id' in orderData && orderData.id 
            ? orderData 
            : { ...orderData, id: uuidv4() };

        const updatedOrders = [...project.data.purchaseOrders, newOrder];
        onUpdatePurchaseOrders(project.id, updatedOrders);
        alert('تم إنشاء أمر الشراء بنجاح وإضافته إلى قسم المشتريات.');
    };

    const handleExportXLSX = () => {
        const dataToExport = financials.map(item => ({
            'ID': item.id,
            'البند': item.item,
            'الكمية': item.quantity,
            'الوحدة': item.unit,
            'سعر الوحدة': item.unitPrice,
            'الإجمالي': item.total
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Financials");
        XLSX.writeFile(workbook, `financials_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };


    return (
        <div>
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">الإدارة المالية</h1>
                    <p className="text-slate-500 mt-1">نظرة عامة على مقايسة الكميات لمشروع: {project.name}</p>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                        <File size={18} /><span>تصدير Excel</span>
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600">
                        <Printer size={18} /><span>طباعة / PDF</span>
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Stat label="التكلفة الإجمالية للمشروع" value={`${totalCost.toLocaleString('ar-SA')} SAR`} />
                <Stat label="عدد بنود المقايسة" value={String(financials.length)} />
                <Stat label="متوسط تكلفة البند" value={`${(totalCost / (financials.length || 1)).toLocaleString('ar-SA')} SAR`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-xl font-semibold">بنود المقايسة</h3>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="بحث في البنود..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 bg-slate-100 dark:bg-slate-800 rounded-lg py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-right responsive-table">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                                <tr>
                                    <th className="p-3">البند</th>
                                    <th className="p-3">الكمية</th>
                                    <th className="p-3">الوحدة</th>
                                    <th className="p-3">سعر الوحدة</th>
                                    <th className="p-3">الإجمالي</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFinancials.map(item => {
                                    const itemSentiment = sentimentResults.find(res => res.itemId === item.id);
                                    const isNegative = itemSentiment?.sentiment === 'Negative';
                                    
                                    return (
                                        <tr key={item.id} className={`border-b border-slate-200 dark:border-slate-800 last:border-b-0 transition-colors ${isNegative ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                            <td className="p-3 font-medium" data-label="البند">
                                                <div className="flex items-center gap-2">
                                                     {isNegative && (
                                                        <span title={itemSentiment.justification}>
                                                            <AlertTriangle size={16} className="text-red-500 shrink-0" />
                                                        </span>
                                                    )}
                                                    <span>{item.item}</span>
                                                </div>
                                            </td>
                                            <td className="p-3" data-label="الكمية">{item.quantity}</td>
                                            <td className="p-3" data-label="الوحدة">{item.unit}</td>
                                            <td className="p-3 font-mono" data-label="سعر الوحدة">{item.unitPrice.toLocaleString('ar-SA')}</td>
                                            <td className="p-3 font-mono font-semibold" data-label="الإجمالي">{item.total.toLocaleString('ar-SA')}</td>
                                            <td className="p-3" data-label="إجراء">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleOpenBreakdown(item)} className="text-sky-600 hover:underline text-sm font-semibold">تحليل</button>
                                                    <button onClick={() => handleCreatePo(item)} disabled={isGeneratingPo === item.id} className="text-indigo-600 hover:underline text-sm font-semibold disabled:text-gray-400 flex items-center gap-1">
                                                        {isGeneratingPo === item.id ? '...' : <ShoppingCart size={14}/>}
                                                        <span>{isGeneratingPo === item.id ? '' : 'أمر شراء'}</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-semibold mb-4">تحليل المقايسة بالذكاء الاصطناعي</h3>
                     <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-2 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                            <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>تحليل مالي</button>
                            <button onClick={() => setActiveTab('code')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'code' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>توافق الكود</button>
                            <button onClick={() => setActiveTab('sentiment')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'sentiment' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>تحليل المشاعر</button>
                            <button onClick={() => setActiveTab('price')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'price' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>تحليل الأسعار</button>
                        </nav>
                    </div>
                    <button onClick={() => handleRunAnalysis(activeTab)} disabled={isAnalysisLoading || financials.length === 0} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400">
                        <Bot size={18} /><span>{isAnalysisLoading ? '...جاري التحليل' : 'تشغيل التحليل'}</span>
                    </button>
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg min-h-[200px] max-h-[55vh] overflow-y-auto">
                        {isAnalysisLoading ? <p>...جاري التحليل</p> : 
                        activeTab === 'sentiment' && sentimentResults.length > 0 ? (
                            <table className="w-full text-sm">
                                <tbody>
                                    {sentimentResults.map(res => {
                                        const item = financials.find(f => f.id === res.itemId);
                                        return (
                                            <tr key={res.itemId} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                                <td className="p-2 w-10 text-center"><SentimentIcon sentiment={res.sentiment}/></td>
                                                <td className="p-2">
                                                    <p className="font-semibold">{item?.item}</p>
                                                    <p className="text-xs text-slate-500">{res.justification}</p>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) :
                        analysisResult ? <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(analysisResult) }}></div> : 
                        <p className="text-slate-500 text-center pt-8">ستظهر نتائج التحليل هنا.</p>}
                    </div>
                </div>
            </div>

            <CostBreakdownModal
                isOpen={isBreakdownModalOpen}
                onClose={() => setIsBreakdownModalOpen(false)}
                item={selectedItem}
                result={breakdownResult}
                isLoading={isBreakdownLoading}
                error={breakdownError}
            />
            
            <OrderModal
                isOpen={isPoModalOpen}
                onClose={() => setIsPoModalOpen(false)}
                onSave={handleSavePo}
                order={poDraft}
            />
        </div>
    );
};
