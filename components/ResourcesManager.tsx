/**
 * 🏗️ نظام إدارة الموارد الشامل - Resources Management System
 * يشمل: العمالة، المعدات، المواد، المقاولين الفرعيين
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Hammer,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Download,
  Filter,
  Search,
  BarChart3
} from 'lucide-react';
import type { Project, ScheduleTask, FinancialItem } from '../types';

// ===== Types =====

export type ResourceType = 'labor' | 'equipment' | 'material' | 'subcontractor';
export type ResourceStatus = 'available' | 'assigned' | 'unavailable' | 'maintenance';

export interface LaborResource {
  id: string;
  name: string;
  type: 'labor';
  category: string; // 'مهندس', 'فني', 'عامل', 'سائق'
  specialty: string; // 'خرسانة', 'حديد', 'كهرباء', 'سباكة'
  status: ResourceStatus;
  costPerDay: number;
  assignedTo?: number; // task ID
  availability: string; // تاريخ التفرغ
  contactInfo: string;
  rating: number; // 1-5
  totalWorkedDays: number;
  nationalId?: string;
}

export interface EquipmentResource {
  id: string;
  name: string;
  type: 'equipment';
  category: string; // 'رافعة', 'خلاطة', 'قاطع', 'مولد'
  status: ResourceStatus;
  costPerDay: number;
  assignedTo?: number;
  availability: string;
  lastMaintenance: string;
  nextMaintenance: string;
  serialNumber: string;
  operatorName?: string;
}

export interface MaterialResource {
  id: string;
  name: string;
  type: 'material';
  category: string; // 'خرسانة', 'حديد', 'بلوك', 'رمل'
  unit: string; // 'م3', 'طن', 'وحدة'
  quantityInStock: number;
  quantityRequired: number;
  costPerUnit: number;
  assignedTo?: number;
  supplierName: string;
  supplierContact: string;
  leadTime: number; // بالأيام
  reorderLevel: number;
}

export interface SubcontractorResource {
  id: string;
  name: string;
  type: 'subcontractor';
  category: string; // 'كهرباء', 'سباكة', 'تكييف', 'نجارة'
  status: ResourceStatus;
  contractValue: number;
  assignedTo?: number;
  availability: string;
  contactInfo: string;
  rating: number;
  completedProjects: number;
  licenseNumber: string;
}

export type Resource = LaborResource | EquipmentResource | MaterialResource | SubcontractorResource;

interface ResourcesManagerProps {
  project: Project;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
}

// ===== Main Component =====

export const ResourcesManager: React.FC<ResourcesManagerProps> = ({ project, onUpdateProject }) => {
  // State
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem(`resources_${project.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'labor' | 'equipment' | 'material' | 'subcontractor'>('overview');

  // Save to localStorage
  const saveResources = (newResources: Resource[]) => {
    setResources(newResources);
    localStorage.setItem(`resources_${project.id}`, JSON.stringify(newResources));
  };

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const typeMatch = selectedType === 'all' || r.type === selectedType;
      const statusMatch = selectedStatus === 'all' || r.status === selectedStatus;
      const searchMatch = searchQuery === '' || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ('category' in r && r.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return typeMatch && statusMatch && searchMatch;
    });
  }, [resources, selectedType, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const labor = resources.filter(r => r.type === 'labor') as LaborResource[];
    const equipment = resources.filter(r => r.type === 'equipment') as EquipmentResource[];
    const materials = resources.filter(r => r.type === 'material') as MaterialResource[];
    const subcontractors = resources.filter(r => r.type === 'subcontractor') as SubcontractorResource[];

    const totalLaborCost = labor.reduce((sum, l) => sum + (l.costPerDay * l.totalWorkedDays), 0);
    const totalEquipmentCost = equipment.reduce((sum, e) => sum + e.costPerDay * 30, 0); // تقديري
    const totalMaterialCost = materials.reduce((sum, m) => sum + (m.costPerUnit * m.quantityRequired), 0);
    const totalSubcontractorCost = subcontractors.reduce((sum, s) => sum + s.contractValue, 0);

    return {
      laborCount: labor.length,
      laborAvailable: labor.filter(l => l.status === 'available').length,
      equipmentCount: equipment.length,
      equipmentAvailable: equipment.filter(e => e.status === 'available').length,
      materialCount: materials.length,
      materialLowStock: materials.filter(m => m.quantityInStock <= m.reorderLevel).length,
      subcontractorCount: subcontractors.length,
      subcontractorActive: subcontractors.filter(s => s.status === 'assigned').length,
      totalLaborCost,
      totalEquipmentCost,
      totalMaterialCost,
      totalSubcontractorCost,
      totalCost: totalLaborCost + totalEquipmentCost + totalMaterialCost + totalSubcontractorCost
    };
  }, [resources]);

  // Handlers
  const handleAddResource = () => {
    setEditingResource(null);
    setShowAddModal(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setShowAddModal(true);
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      saveResources(resources.filter(r => r.id !== id));
    }
  };

  const handleSaveResource = (resource: Resource) => {
    if (editingResource) {
      saveResources(resources.map(r => r.id === resource.id ? resource : r));
    } else {
      saveResources([...resources, { ...resource, id: Date.now().toString() }]);
    }
    setShowAddModal(false);
  };

  const handleAssignToTask = (resourceId: string, taskId: number) => {
    saveResources(resources.map(r => 
      r.id === resourceId ? { ...r, assignedTo: taskId, status: 'assigned' as ResourceStatus } : r
    ));
  };

  const exportResourcesReport = () => {
    const reportData = {
      projectName: project.name,
      generatedDate: new Date().toLocaleDateString('ar-SA'),
      statistics: stats,
      resources: filteredResources
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_الموارد_${project.name}_${Date.now()}.json`;
    a.click();
  };

  // ===== Render =====

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Package className="text-blue-600" />
              إدارة الموارد - {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              نظام شامل لإدارة العمالة، المعدات، المواد، والمقاولين الفرعيين
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportResourcesReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              تصدير التقرير
            </button>
            <button
              onClick={handleAddResource}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              إضافة مورد
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { key: 'labor', label: 'العمالة', icon: Users },
            { key: 'equipment', label: 'المعدات', icon: Hammer },
            { key: 'material', label: 'المواد', icon: Package },
            { key: 'subcontractor', label: 'المقاولون', icon: FileText }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setSelectedType(tab.key === 'overview' ? 'all' : tab.key as ResourceType);
              }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      {activeTab === 'overview' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="إجمالي العمالة"
              value={stats.laborCount.toString()}
              subtitle={`${stats.laborAvailable} متاح`}
              icon={Users}
              color="bg-blue-500"
              amount={stats.totalLaborCost}
            />
            <StatCard
              title="المعدات"
              value={stats.equipmentCount.toString()}
              subtitle={`${stats.equipmentAvailable} متاح`}
              icon={Hammer}
              color="bg-purple-500"
              amount={stats.totalEquipmentCost}
            />
            <StatCard
              title="المواد"
              value={stats.materialCount.toString()}
              subtitle={`${stats.materialLowStock} قليل المخزون`}
              icon={Package}
              color="bg-orange-500"
              amount={stats.totalMaterialCost}
            />
            <StatCard
              title="المقاولون الفرعيون"
              value={stats.subcontractorCount.toString()}
              subtitle={`${stats.subcontractorActive} نشط`}
              icon={FileText}
              color="bg-green-500"
              amount={stats.totalSubcontractorCost}
            />
          </div>

          {/* Total Cost Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-6">
            <h3 className="text-xl font-semibold mb-2">إجمالي تكلفة الموارد</h3>
            <p className="text-4xl font-bold">{stats.totalCost.toLocaleString('ar-SA')} ريال</p>
            <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <p className="opacity-80">العمالة</p>
                <p className="font-semibold">{((stats.totalLaborCost / stats.totalCost) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="opacity-80">المعدات</p>
                <p className="font-semibold">{((stats.totalEquipmentCost / stats.totalCost) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="opacity-80">المواد</p>
                <p className="font-semibold">{((stats.totalMaterialCost / stats.totalCost) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="opacity-80">المقاولون</p>
                <p className="font-semibold">{((stats.totalSubcontractorCost / stats.totalCost) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 pb-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث عن مورد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ResourceStatus | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="available">متاح</option>
            <option value="assigned">مُعيّن</option>
            <option value="unavailable">غير متاح</option>
            <option value="maintenance">صيانة</option>
          </select>
        </div>
      </div>

      {/* Resources List */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التصنيف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التكلفة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">معيّن لـ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResources.map(resource => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    tasks={project.data.schedule}
                    onEdit={handleEditResource}
                    onDelete={handleDeleteResource}
                    onAssign={handleAssignToTask}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ResourceModal
          resource={editingResource}
          onSave={handleSaveResource}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

// ===== Helper Components =====

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  amount: number;
}> = ({ title, value, subtitle, icon: Icon, color, amount }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{title}</p>
    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
      {amount.toLocaleString('ar-SA')} ريال
    </p>
  </div>
);

const ResourceRow: React.FC<{
  resource: Resource;
  tasks: ScheduleTask[];
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onAssign: (resourceId: string, taskId: number) => void;
}> = ({ resource, tasks, onEdit, onDelete, onAssign }) => {
  const getTypeIcon = () => {
    switch (resource.type) {
      case 'labor': return <Users size={16} />;
      case 'equipment': return <Hammer size={16} />;
      case 'material': return <Package size={16} />;
      case 'subcontractor': return <FileText size={16} />;
    }
  };

  const getStatusColor = () => {
    switch (resource.status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'unavailable': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getCost = () => {
    if (resource.type === 'material') {
      return `${resource.costPerUnit}/وحدة`;
    } else if (resource.type === 'subcontractor') {
      return `${resource.contractValue.toLocaleString('ar-SA')}`;
    } else {
      return `${resource.costPerDay}/يوم`;
    }
  };

  const assignedTask = resource.assignedTo ? tasks.find(t => t.id === resource.assignedTo) : null;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          {getTypeIcon()}
          <span className="text-sm">
            {resource.type === 'labor' && 'عمالة'}
            {resource.type === 'equipment' && 'معدات'}
            {resource.type === 'material' && 'مواد'}
            {resource.type === 'subcontractor' && 'مقاول'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
        {resource.name}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        {'category' in resource && resource.category}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {resource.status === 'available' && 'متاح'}
          {resource.status === 'assigned' && 'مُعيّن'}
          {resource.status === 'unavailable' && 'غير متاح'}
          {resource.status === 'maintenance' && 'صيانة'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        {getCost()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        {assignedTask ? assignedTask.name : '-'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(resource)}
            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ResourceModal: React.FC<{
  resource: Resource | null;
  onSave: (resource: Resource) => void;
  onClose: () => void;
}> = ({ resource, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Resource>>(
    resource || { type: 'labor', status: 'available' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Resource);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {resource ? 'تعديل المورد' : 'إضافة مورد جديد'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields would go here based on resource type */}
            <div className="text-center text-gray-600 dark:text-gray-400">
              النموذج التفصيلي سيتم إضافته
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourcesManager;
