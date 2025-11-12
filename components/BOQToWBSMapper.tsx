import React, { useState, useMemo } from 'react';
import { WBSNode, BOQItemExtended } from '../types';
import { Link, CheckCircle, XCircle, LayoutList, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';

interface BOQToWBSMapperProps {
    boqItems: BOQItemExtended[];
    wbsStructure: WBSNode[];
    onUpdateBOQItems: (updatedItems: BOQItemExtended[]) => void;
    onUpdateWBS: (updatedWBS: WBSNode[]) => void;
}

const BOQToWBSMapper: React.FC<BOQToWBSMapperProps> = ({ 
    boqItems, 
    wbsStructure, 
    onUpdateBOQItems, 
    onUpdateWBS 
}) => {
    const [selectedWBSId, setSelectedWBSId] = useState<string | null>(null);
    const [filterText, setFilterText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Calculate statistics
    const stats = useMemo(() => {
        const totalItems = boqItems.length;
        const linkedItems = boqItems.filter(item => item.wbsId).length;
        const totalBudget = boqItems.reduce((sum, item) => sum + item.cost, 0);
        const linkedBudget = boqItems
            .filter(item => item.wbsId)
            .reduce((sum, item) => sum + item.cost, 0);
        const linkageRate = totalItems > 0 ? (linkedItems / totalItems) * 100 : 0;

        return {
            totalItems,
            linkedItems,
            unlinkedItems: totalItems - linkedItems,
            totalBudget,
            linkedBudget,
            unlinkedBudget: totalBudget - linkedBudget,
            linkageRate
        };
    }, [boqItems]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(boqItems.map(item => item.category || 'غير مصنف'));
        return ['all', ...Array.from(cats)];
    }, [boqItems]);

    // Helper function to render WBS hierarchy
    const renderWBS = (nodes: WBSNode[], parentId: string | null = null, depth: number = 0): JSX.Element[] => {
        return nodes
            .filter(node => node.parentId === parentId)
            .map(node => {
                const linkedCost = boqItems
                    .filter(item => node.linkedBOQItems.includes(item.id))
                    .reduce((sum, item) => sum + item.cost, 0);
                
                const isSelected = selectedWBSId === node.id;
                
                return (
                    <div key={node.id}>
                        <div
                            className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                                isSelected 
                                    ? 'bg-indigo-100 dark:bg-indigo-800 shadow-md ring-2 ring-indigo-400' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            style={{ paddingRight: `${depth * 20 + 12}px` }}
                            onClick={() => setSelectedWBSId(node.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className={`font-semibold ${node.level === 1 ? 'text-base' : 'text-sm'} text-gray-800 dark:text-gray-100`}>
                                        {node.name}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Link size={12} />
                                            {node.linkedBOQItems.length} بند
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={12} />
                                            {linkedCost.toLocaleString('ar-SA')} ر.س
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{node.id}</span>
                            </div>
                        </div>
                        {renderWBS(nodes, node.id, depth + 1)}
                    </div>
                );
            });
    };

    // Filtered BOQ Items
    const filteredBOQItems = useMemo(() => {
        let filtered = boqItems;

        // Filter by search text
        if (filterText) {
            filtered = filtered.filter(item =>
                item.description.toLowerCase().includes(filterText.toLowerCase()) ||
                item.code?.toLowerCase().includes(filterText.toLowerCase()) ||
                item.item.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => 
                (item.category || 'غير مصنف') === selectedCategory
            );
        }

        return filtered;
    }, [boqItems, filterText, selectedCategory]);

    // Group BOQ items by their current link status
    const unlinkedItems = filteredBOQItems.filter(item => !item.wbsId);
    const linkedItems = filteredBOQItems.filter(item => item.wbsId);

    const handleLinkItem = (itemId: string) => {
        if (!selectedWBSId) {
            alert('الرجاء اختيار عنصر من هيكل تجزئة العمل (WBS) أولاً.');
            return;
        }

        const updatedItems = boqItems.map(item =>
            item.id === itemId ? { ...item, wbsId: selectedWBSId } : item
        );

        // Update WBS structure to reflect the new link and calculate budget
        const newWBS = wbsStructure.map(wbs => {
            if (wbs.id === selectedWBSId) {
                const newLinkedItems = Array.from(new Set([...wbs.linkedBOQItems, itemId]));
                const totalBudget = updatedItems
                    .filter(item => newLinkedItems.includes(item.id))
                    .reduce((sum, item) => sum + item.cost, 0);
                
                return { 
                    ...wbs, 
                    linkedBOQItems: newLinkedItems, 
                    totalBudget: totalBudget,
                    allocatedBudget: totalBudget // Initially, allocated = total
                };
            }
            return wbs;
        });

        onUpdateBOQItems(updatedItems);
        onUpdateWBS(newWBS);
    };

    const handleUnlinkItem = (itemId: string) => {
        const itemToUnlink = boqItems.find(item => item.id === itemId);
        if (!itemToUnlink || !itemToUnlink.wbsId) return;

        const wbsIdToUnlinkFrom = itemToUnlink.wbsId;

        const updatedItems = boqItems.map(item =>
            item.id === itemId ? { ...item, wbsId: null } : item
        );

        // Update WBS structure
        const newWBS = wbsStructure.map(wbs => {
            if (wbs.id === wbsIdToUnlinkFrom) {
                const newLinkedItems = wbs.linkedBOQItems.filter(id => id !== itemId);
                const totalBudget = updatedItems
                    .filter(item => newLinkedItems.includes(item.id))
                    .reduce((sum, item) => sum + item.cost, 0);
                
                return { 
                    ...wbs, 
                    linkedBOQItems: newLinkedItems, 
                    totalBudget: totalBudget,
                    allocatedBudget: totalBudget
                };
            }
            return wbs;
        });

        onUpdateBOQItems(updatedItems);
        onUpdateWBS(newWBS);
    };

    const selectedWBSNode = wbsStructure.find(w => w.id === selectedWBSId);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <Link size={28} />
                            ربط المقايسات بهيكل تجزئة العمل (TCI Mapper)
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            قم بربط بنود المقايسة (BOQ) بعناصر هيكل تجزئة العمل (WBS) لتمكين تكامل التكلفة والجدول الزمني (TCI) وحساب القيمة المكتسبة (EVM).
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">إجمالي البنود</div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalItems}</div>
                        <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                            {stats.totalBudget.toLocaleString('ar-SA')} ر.س
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-sm text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                            <CheckCircle size={14} />
                            البنود المرتبطة
                        </div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.linkedItems}</div>
                        <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                            {stats.linkedBudget.toLocaleString('ar-SA')} ر.س
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-sm text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                            <XCircle size={14} />
                            البنود غير المرتبطة
                        </div>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.unlinkedItems}</div>
                        <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                            {stats.unlinkedBudget.toLocaleString('ar-SA')} ر.س
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                            <TrendingUp size={14} />
                            نسبة الربط
                        </div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {stats.linkageRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                            من إجمالي البنود
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 p-6 overflow-hidden">
                {/* WBS Structure Panel */}
                <div className="w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <LayoutList size={20} />
                            هيكل تجزئة العمل (WBS)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            اختر عنصر WBS لربط البنود به
                        </p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {wbsStructure.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                <AlertCircle className="mx-auto mb-2" size={48} />
                                <p>لا يوجد هيكل WBS محدد</p>
                                <p className="text-sm mt-2">يرجى إنشاء هيكل WBS أولاً</p>
                            </div>
                        ) : (
                            renderWBS(wbsStructure)
                        )}
                    </div>

                    {selectedWBSNode && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-t border-indigo-200 dark:border-indigo-700">
                            <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                                العنصر المحدد:
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                <div className="font-bold">{selectedWBSNode.name}</div>
                                <div className="flex items-center gap-2 mt-2 text-xs">
                                    <span className="flex items-center gap-1">
                                        <Link size={12} />
                                        {selectedWBSNode.linkedBOQItems.length} بند مرتبط
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign size={12} />
                                        {selectedWBSNode.totalBudget.toLocaleString('ar-SA')} ر.س
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* BOQ Items Panel */}
                <div className="w-2/3 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-3">
                            بنود المقايسة (BOQ Items)
                        </h3>
                        
                        {/* Filters */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="ابحث عن بند مقايسة (الوصف أو الكود)..."
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                            <select
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'جميع التصنيفات' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {filteredBOQItems.length === 0 && (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                <AlertCircle className="mx-auto mb-2" size={48} />
                                <p>لا توجد بنود مقايسة مطابقة للبحث</p>
                            </div>
                        )}

                        {/* Unlinked Items */}
                        {unlinkedItems.length > 0 && (
                            <div>
                                <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <XCircle size={18} />
                                    بنود غير مرتبطة ({unlinkedItems.length})
                                </h4>
                                <div className="space-y-2">
                                    {unlinkedItems.map(item => (
                                        <div 
                                            key={item.id} 
                                            className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                                                        {item.code || item.id}
                                                    </span>
                                                    {item.category && (
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                                            {item.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {item.description || item.item}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <span>{item.quantity} {item.unit}</span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-red-600 dark:text-red-400">
                                                        {item.cost.toLocaleString('ar-SA')} ر.س
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleLinkItem(item.id)}
                                                disabled={!selectedWBSId}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Link size={14} />
                                                ربط
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Linked Items */}
                        {linkedItems.length > 0 && (
                            <div>
                                <h4 className="font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    بنود مرتبطة ({linkedItems.length})
                                </h4>
                                <div className="space-y-2">
                                    {linkedItems.map(item => {
                                        const linkedWBS = wbsStructure.find(w => w.id === item.wbsId);
                                        return (
                                            <div 
                                                key={item.id} 
                                                className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded">
                                                            {item.code || item.id}
                                                        </span>
                                                        {item.category && (
                                                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                                                {item.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                        {item.description || item.item}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                        <span>{item.quantity} {item.unit}</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                                            {item.cost.toLocaleString('ar-SA')} ر.س
                                                        </span>
                                                        <span>•</span>
                                                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                            مرتبط بـ: {linkedWBS?.name || 'غير معروف'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleUnlinkItem(item.id)}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    إلغاء الربط
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BOQToWBSMapper;
