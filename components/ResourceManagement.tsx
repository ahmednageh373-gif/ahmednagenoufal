// 📦 نظام إدارة الموارد الشامل - Resource Management System
// إدارة العمالة، المعدات، المواد، وتخصيص الموارد

import React, { useState, useMemo } from 'react';
import {
    Users, Wrench, Package, Calendar, DollarSign, TrendingUp, 
    AlertTriangle, CheckCircle, Clock, Filter, Plus, Search,
    Download, Upload, Edit2, Trash2, Eye, Settings
} from 'lucide-react';
import type { 
    LaborResource, EquipmentResource, MaterialResource, 
    ResourceAllocation, ResourceType, ResourceStatus 
} from '../types-extended';

interface ResourceManagementProps {
    projectId: string;
    onClose?: () => void;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({ projectId, onClose }) => {
    // State Management
    const [activeTab, setActiveTab] = useState<'labor' | 'equipment' | 'materials' | 'allocations'>('labor');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<ResourceStatus | 'all'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Sample Data - في التطبيق الحقيقي، سيتم جلبها من API/localStorage
    const [laborResources] = useState<LaborResource[]>([
        {
            id: 'L001',
            name: 'أحمد محمد السعيد',
            category: 'Engineer',
            specialization: 'Civil Engineer',
            hourlyRate: 150,
            dailyRate: 1200,
            contactPhone: '0501234567',
            nationalId: '1234567890',
            status: 'Assigned',
            assignedTaskIds: [1, 2],
            certifications: ['PMP', 'LEED AP'],
            joinDate: '2024-01-15',
            totalWorkHours: 640,
            performanceRating: 4.5
        },
        {
            id: 'L002',
            name: 'خالد أحمد العتيبي',
            category: 'Supervisor',
            specialization: 'Construction Supervisor',
            hourlyRate: 100,
            dailyRate: 800,
            contactPhone: '0507654321',
            nationalId: '0987654321',
            status: 'Available',
            assignedTaskIds: [],
            certifications: ['OSHA', 'First Aid'],
            joinDate: '2024-02-01',
            totalWorkHours: 480,
            performanceRating: 4.2
        },
        {
            id: 'L003',
            name: 'محمد عبدالله القحطاني',
            category: 'Skilled Worker',
            specialization: 'Steel Fixer',
            hourlyRate: 50,
            dailyRate: 400,
            contactPhone: '0555555555',
            nationalId: '5555555555',
            status: 'Busy',
            assignedTaskIds: [3, 4, 5],
            certifications: ['Steel Fixing Certificate'],
            joinDate: '2023-11-10',
            totalWorkHours: 1280,
            performanceRating: 4.8
        }
    ]);

    const [equipmentResources] = useState<EquipmentResource[]>([
        {
            id: 'E001',
            name: 'كرين 50 طن',
            category: 'Heavy Equipment',
            model: 'Liebherr LTM 1050',
            serialNumber: 'LH-1050-2023-001',
            dailyRentalCost: 5000,
            hourlyRentalCost: 625,
            status: 'Assigned',
            assignedTaskIds: [1],
            lastMaintenanceDate: '2024-10-15',
            nextMaintenanceDate: '2025-01-15',
            operatorRequired: true,
            fuelType: 'Diesel',
            capacity: '50 Tons',
            purchaseDate: '2023-06-01',
            purchasePrice: 2500000,
            currentValue: 2200000
        },
        {
            id: 'E002',
            name: 'خلاطة خرسانة',
            category: 'Light Equipment',
            model: 'SANY HBT60C',
            serialNumber: 'SN-HBT60-2024-045',
            dailyRentalCost: 1500,
            hourlyRentalCost: 188,
            status: 'Available',
            assignedTaskIds: [],
            lastMaintenanceDate: '2024-11-01',
            nextMaintenanceDate: '2024-12-01',
            operatorRequired: true,
            fuelType: 'Diesel',
            capacity: '60 m³/h',
            purchaseDate: '2024-03-15',
            purchasePrice: 450000,
            currentValue: 430000
        }
    ]);

    const [materialResources] = useState<MaterialResource[]>([
        {
            id: 'M001',
            name: 'خرسانة جاهزة 350',
            description: 'خرسانة جاهزة مقاومة 350 كجم/سم²',
            unit: 'م³',
            unitPrice: 280,
            currentStock: 0,
            minimumStock: 0,
            maximumStock: 0,
            reorderPoint: 50,
            linkedBOQItemIds: ['F-001', 'F-002'],
            supplierIds: ['S001', 'S002'],
            location: 'من المورد مباشرة',
            lastRestockDate: '2024-11-05',
            quality: 'Grade A'
        },
        {
            id: 'M002',
            name: 'حديد تسليح 16mm',
            description: 'حديد تسليح عالي المقاومة قطر 16 ملم',
            unit: 'طن',
            unitPrice: 2800,
            currentStock: 15,
            minimumStock: 5,
            maximumStock: 50,
            reorderPoint: 10,
            linkedBOQItemIds: ['F-003'],
            supplierIds: ['S003'],
            location: 'مخزن الموقع - المنطقة A',
            lastRestockDate: '2024-10-28',
            quality: 'Grade 60'
        },
        {
            id: 'M003',
            name: 'بلوك 20 سم',
            description: 'بلوك خرساني مقاس 20×20×40 سم',
            unit: 'قالب',
            unitPrice: 3.5,
            currentStock: 5000,
            minimumStock: 1000,
            maximumStock: 10000,
            reorderPoint: 2000,
            linkedBOQItemIds: ['F-010'],
            supplierIds: ['S004'],
            location: 'ساحة التخزين - القسم B',
            lastRestockDate: '2024-11-01',
            quality: 'Grade B'
        }
    ]);

    const [allocations] = useState<ResourceAllocation[]>([
        {
            id: 'A001',
            resourceId: 'L001',
            resourceType: 'Labor',
            taskId: 1,
            startDate: '2024-11-01',
            endDate: '2024-11-15',
            quantity: 10,
            unit: 'days',
            cost: 12000,
            utilizationRate: 85,
            notes: 'مهندس مشرف على أعمال الخرسانة'
        },
        {
            id: 'A002',
            resourceId: 'E001',
            resourceType: 'Equipment',
            taskId: 1,
            startDate: '2024-11-05',
            endDate: '2024-11-10',
            quantity: 5,
            unit: 'days',
            cost: 25000,
            utilizationRate: 70,
            notes: 'كرين لرفع القوالب والحديد'
        }
    ]);

    // Filtered Data
    const filteredLabor = useMemo(() => {
        return laborResources.filter(labor => {
            const matchesSearch = labor.name.includes(searchTerm) || 
                                labor.specialization.includes(searchTerm);
            const matchesFilter = filterStatus === 'all' || labor.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [laborResources, searchTerm, filterStatus]);

    const filteredEquipment = useMemo(() => {
        return equipmentResources.filter(equipment => {
            const matchesSearch = equipment.name.includes(searchTerm) || 
                                equipment.model.includes(searchTerm);
            const matchesFilter = filterStatus === 'all' || equipment.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [equipmentResources, searchTerm, filterStatus]);

    const filteredMaterials = useMemo(() => {
        return materialResources.filter(material => {
            const matchesSearch = material.name.includes(searchTerm) || 
                                material.description.includes(searchTerm);
            return matchesSearch;
        });
    }, [materialResources, searchTerm]);

    // Statistics
    const stats = useMemo(() => {
        return {
            totalLabor: laborResources.length,
            availableLabor: laborResources.filter(l => l.status === 'Available').length,
            totalEquipment: equipmentResources.length,
            availableEquipment: equipmentResources.filter(e => e.status === 'Available').length,
            lowStockMaterials: materialResources.filter(m => m.currentStock <= m.reorderPoint).length,
            totalAllocations: allocations.length,
            totalLaborCost: allocations
                .filter(a => a.resourceType === 'Labor')
                .reduce((sum, a) => sum + a.cost, 0),
            totalEquipmentCost: allocations
                .filter(a => a.resourceType === 'Equipment')
                .reduce((sum, a) => sum + a.cost, 0)
        };
    }, [laborResources, equipmentResources, materialResources, allocations]);

    // Status Badge Component
    const StatusBadge: React.FC<{ status: ResourceStatus }> = ({ status }) => {
        const colors = {
            'Available': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'Assigned': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'Busy': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'Unavailable': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'Maintenance': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Users className="text-indigo-600" size={32} />
                            نظام إدارة الموارد
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            إدارة شاملة للعمالة والمعدات والمواد
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus size={20} />
                        إضافة مورد
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">إجمالي العمالة</p>
                                <p className="text-3xl font-bold">{stats.totalLabor}</p>
                                <p className="text-xs mt-1 opacity-75">متاح: {stats.availableLabor}</p>
                            </div>
                            <Users size={40} className="opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">إجمالي المعدات</p>
                                <p className="text-3xl font-bold">{stats.totalEquipment}</p>
                                <p className="text-xs mt-1 opacity-75">متاح: {stats.availableEquipment}</p>
                            </div>
                            <Wrench size={40} className="opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">المواد منخفضة المخزون</p>
                                <p className="text-3xl font-bold">{stats.lowStockMaterials}</p>
                                <p className="text-xs mt-1 opacity-75">تحتاج إعادة طلب</p>
                            </div>
                            <AlertTriangle size={40} className="opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">التكلفة الإجمالية</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalLaborCost + stats.totalEquipmentCost).toLocaleString()} ريال
                                </p>
                                <p className="text-xs mt-1 opacity-75">هذا الشهر</p>
                            </div>
                            <DollarSign size={40} className="opacity-50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('labor')}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === 'labor'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <Users className="inline mr-2" size={20} />
                        العمالة
                    </button>
                    <button
                        onClick={() => setActiveTab('equipment')}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === 'equipment'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <Wrench className="inline mr-2" size={20} />
                        المعدات
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === 'materials'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <Package className="inline mr-2" size={20} />
                        المواد
                    </button>
                    <button
                        onClick={() => setActiveTab('allocations')}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === 'allocations'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <Calendar className="inline mr-2" size={20} />
                        التخصيصات
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    {(activeTab === 'labor' || activeTab === 'equipment') && (
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as ResourceStatus | 'all')}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="Available">متاح</option>
                            <option value="Assigned">مخصص</option>
                            <option value="Busy">مشغول</option>
                            <option value="Unavailable">غير متاح</option>
                            <option value="Maintenance">صيانة</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'labor' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredLabor.map(labor => (
                            <div key={labor.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{labor.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{labor.specialization}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">الرقم: {labor.id}</p>
                                    </div>
                                    <StatusBadge status={labor.status} />
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">التصنيف:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{labor.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">الأجر اليومي:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{labor.dailyRate} ريال</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">ساعات العمل:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{labor.totalWorkHours} ساعة</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">التقييم:</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium text-gray-900 dark:text-white">{labor.performanceRating}</span>
                                            <span className="text-yellow-500">⭐</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">المهام المخصصة:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{labor.assignedTaskIds.length}</span>
                                    </div>
                                </div>

                                {labor.certifications.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الشهادات:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {labor.certifications.map((cert, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-xs">
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                                    <button className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                                        <Edit2 className="inline mr-1" size={14} />
                                        تعديل
                                    </button>
                                    <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
                                        <Eye className="inline mr-1" size={14} />
                                        تفاصيل
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'equipment' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredEquipment.map(equipment => (
                            <div key={equipment.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{equipment.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{equipment.model}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">الرقم التسلسلي: {equipment.serialNumber}</p>
                                    </div>
                                    <StatusBadge status={equipment.status} />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">التصنيف</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{equipment.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">الطاقة</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{equipment.capacity}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">الأجرة اليومية</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{equipment.dailyRentalCost} ريال</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">الأجرة الساعية</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{equipment.hourlyRentalCost} ريال</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">الصيانة القادمة</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{equipment.nextMaintenanceDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">القيمة الحالية</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{equipment.currentValue.toLocaleString()} ريال</p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">المهام المخصصة:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{equipment.assignedTaskIds.length}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                                    <button className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                                        <Edit2 className="inline mr-1" size={14} />
                                        تعديل
                                    </button>
                                    <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
                                        <Settings className="inline mr-1" size={14} />
                                        صيانة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الرقم</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">اسم المادة</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الوحدة</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">سعر الوحدة</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">المخزون الحالي</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">نقطة إعادة الطلب</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">الموقع</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredMaterials.map(material => {
                                    const needsReorder = material.currentStock <= material.reorderPoint;
                                    return (
                                        <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{material.id}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{material.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{material.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{material.unit}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{material.unitPrice} ريال</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={needsReorder ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'}>
                                                    {material.currentStock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{material.reorderPoint}</td>
                                            <td className="px-4 py-3">
                                                {needsReorder ? (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                                                        <AlertTriangle size={12} />
                                                        يحتاج طلب
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                                                        <CheckCircle size={12} />
                                                        متوفر
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{material.location}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'allocations' && (
                    <div className="space-y-4">
                        {allocations.map(allocation => (
                            <div key={allocation.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {allocation.resourceType}: {allocation.resourceId}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            المهمة رقم: {allocation.taskId}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-semibold">
                                        {allocation.resourceType}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">بداية</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{allocation.startDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">نهاية</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{allocation.endDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">الكمية</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{allocation.quantity} {allocation.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">التكلفة</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{allocation.cost.toLocaleString()} ريال</p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">معدل الاستخدام</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{allocation.utilizationRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-indigo-600 h-2 rounded-full transition-all"
                                            style={{ width: `${allocation.utilizationRate}%` }}
                                        />
                                    </div>
                                </div>

                                {allocation.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">ملاحظات:</p>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">{allocation.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceManagement;
