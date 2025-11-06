/**
 * Manual Analysis Mode Component
 * وضع التحليل اليدوي المتقدم
 * 
 * Allows users to manually define activities, workers, and breakdown
 * يتيح للمستخدمين تعريف الأنشطة والعمالة والتفصيل يدوياً
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Users,
  Clock,
  DollarSign,
  Box,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import type { FinancialItem } from '../types';

interface ManualActivity {
  id: string;
  name: string;
  sequence: number;
  duration: number;
  workers: ManualWorker[];
  materials: ManualMaterial[];
  dependencies: string[];
  notes: string;
}

interface ManualWorker {
  id: string;
  role: string;
  count: number;
  dailyCost: number;
  productivity: number;
}

interface ManualMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  wastePercentage: number;
  unitCost: number;
}

interface ManualAnalysisState {
  item: FinancialItem | null;
  activities: ManualActivity[];
  currentActivity: ManualActivity | null;
  editMode: boolean;
}

export default function ManualAnalysisMode() {
  const [state, setState] = useState<ManualAnalysisState>({
    item: null,
    activities: [],
    currentActivity: null,
    editMode: false
  });

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);

  // Sample item for demo
  const sampleItem: FinancialItem = {
    id: 'sample-1',
    itemNumber: '1',
    description: 'خرسانة مسلحة للأعمدة',
    quantity: 50,
    unit: 'م3',
    unitPrice: 350,
    totalPrice: 17500,
    category: 'أعمال خرسانية'
  };

  // Load sample item
  const loadSampleItem = () => {
    setState(prev => ({
      ...prev,
      item: sampleItem,
      activities: []
    }));
  };

  // Add new activity
  const addActivity = (activityData: Partial<ManualActivity>) => {
    const newActivity: ManualActivity = {
      id: `activity-${Date.now()}`,
      name: activityData.name || 'نشاط جديد',
      sequence: state.activities.length + 1,
      duration: activityData.duration || 1,
      workers: activityData.workers || [],
      materials: activityData.materials || [],
      dependencies: activityData.dependencies || [],
      notes: activityData.notes || ''
    };

    setState(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity],
      currentActivity: null
    }));
    setShowActivityForm(false);
  };

  // Update activity
  const updateActivity = (activityId: string, updates: Partial<ManualActivity>) => {
    setState(prev => ({
      ...prev,
      activities: prev.activities.map(a =>
        a.id === activityId ? { ...a, ...updates } : a
      )
    }));
  };

  // Delete activity
  const deleteActivity = (activityId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
      setState(prev => ({
        ...prev,
        activities: prev.activities.filter(a => a.id !== activityId),
        currentActivity: prev.currentActivity?.id === activityId ? null : prev.currentActivity
      }));
    }
  };

  // Add worker to activity
  const addWorker = (activityId: string, worker: ManualWorker) => {
    updateActivity(activityId, {
      workers: [
        ...state.activities.find(a => a.id === activityId)!.workers,
        worker
      ]
    });
    setShowWorkerForm(false);
  };

  // Add material to activity
  const addMaterial = (activityId: string, material: ManualMaterial) => {
    updateActivity(activityId, {
      materials: [
        ...state.activities.find(a => a.id === activityId)!.materials,
        material
      ]
    });
    setShowMaterialForm(false);
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalDuration = state.activities.reduce((sum, a) => sum + a.duration, 0);
    const totalWorkers = state.activities.reduce(
      (sum, a) => sum + a.workers.reduce((wSum, w) => wSum + w.count, 0),
      0
    );
    const totalLaborCost = state.activities.reduce(
      (sum, a) => sum + a.workers.reduce(
        (wSum, w) => wSum + (w.count * w.dailyCost * a.duration),
        0
      ),
      0
    );
    const totalMaterialCost = state.activities.reduce(
      (sum, a) => sum + a.materials.reduce(
        (mSum, m) => mSum + (m.quantity * (1 + m.wastePercentage / 100) * m.unitCost),
        0
      ),
      0
    );

    return {
      totalDuration,
      totalWorkers,
      totalLaborCost,
      totalMaterialCost,
      grandTotal: totalLaborCost + totalMaterialCost
    };
  };

  const totals = calculateTotals();

  // Export to JSON
  const exportToJSON = () => {
    const data = {
      item: state.item,
      activities: state.activities,
      totals,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manual_analysis_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ⚙️ وضع التحليل اليدوي
          </h1>
          <p className="text-xl text-slate-300">
            Manual Analysis Mode - Complete Control Over Item Breakdown
          </p>
        </div>

        {/* Item Selection */}
        {!state.item ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <Upload className="w-24 h-24 mx-auto mb-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white mb-4">ابدأ التحليل اليدوي</h2>
              <p className="text-slate-300 mb-6">
                اختر بند من المقايسة لبدء التحليل اليدوي المفصل
              </p>
              <button
                onClick={loadSampleItem}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                تحميل بند تجريبي
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Item Card */}
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                      {state.item.itemNumber}
                    </span>
                    <h2 className="text-2xl font-bold text-white">{state.item.description}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">الكمية</p>
                      <p className="text-xl font-bold text-white">{state.item.quantity} {state.item.unit}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">سعر الوحدة</p>
                      <p className="text-xl font-bold text-white">{state.item.unitPrice.toLocaleString('ar-SA')} ريال</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">الإجمالي</p>
                      <p className="text-xl font-bold text-white">{state.item.totalPrice.toLocaleString('ar-SA')} ريال</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">الفئة</p>
                      <p className="text-xl font-bold text-white">{state.item.category}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setState(prev => ({ ...prev, item: null, activities: [] }))}
                  className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Statistics Bar */}
            {state.activities.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-blue-600/20 border border-blue-400/30 rounded-xl p-4">
                  <Clock className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-sm text-slate-300 mb-1">المدة الإجمالية</p>
                  <p className="text-2xl font-bold text-white">{totals.totalDuration} يوم</p>
                </div>
                <div className="bg-green-600/20 border border-green-400/30 rounded-xl p-4">
                  <Users className="w-6 h-6 text-green-400 mb-2" />
                  <p className="text-sm text-slate-300 mb-1">إجمالي العمالة</p>
                  <p className="text-2xl font-bold text-white">{totals.totalWorkers}</p>
                </div>
                <div className="bg-purple-600/20 border border-purple-400/30 rounded-xl p-4">
                  <DollarSign className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="text-sm text-slate-300 mb-1">تكلفة العمالة</p>
                  <p className="text-2xl font-bold text-white">{(totals.totalLaborCost / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-amber-600/20 border border-amber-400/30 rounded-xl p-4">
                  <Box className="w-6 h-6 text-amber-400 mb-2" />
                  <p className="text-sm text-slate-300 mb-1">تكلفة المواد</p>
                  <p className="text-2xl font-bold text-white">{(totals.totalMaterialCost / 1000).toFixed(1)}K</p>
                </div>
                <div className="bg-red-600/20 border border-red-400/30 rounded-xl p-4">
                  <CheckCircle2 className="w-6 h-6 text-red-400 mb-2" />
                  <p className="text-sm text-slate-300 mb-1">الإجمالي الكلي</p>
                  <p className="text-2xl font-bold text-white">{(totals.grandTotal / 1000).toFixed(1)}K</p>
                </div>
              </div>
            )}

            {/* Activities List */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">الأنشطة ({state.activities.length})</h3>
                <div className="flex gap-3">
                  {state.activities.length > 0 && (
                    <button
                      onClick={exportToJSON}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      تصدير JSON
                    </button>
                  )}
                  <button
                    onClick={() => setShowActivityForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة نشاط
                  </button>
                </div>
              </div>

              {state.activities.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400 text-lg">لا توجد أنشطة بعد</p>
                  <p className="text-slate-500">ابدأ بإضافة نشاط لتحليل البند يدوياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.activities.map((activity, index) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      index={index}
                      onEdit={() => {
                        setState(prev => ({ ...prev, currentActivity: activity }));
                        setShowActivityForm(true);
                      }}
                      onDelete={() => deleteActivity(activity.id)}
                      onAddWorker={() => {
                        setState(prev => ({ ...prev, currentActivity: activity }));
                        setShowWorkerForm(true);
                      }}
                      onAddMaterial={() => {
                        setState(prev => ({ ...prev, currentActivity: activity }));
                        setShowMaterialForm(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Activity Form Modal */}
        {showActivityForm && (
          <ActivityFormModal
            activity={state.currentActivity}
            onSave={(data) => {
              if (state.currentActivity) {
                updateActivity(state.currentActivity.id, data);
                setState(prev => ({ ...prev, currentActivity: null }));
              } else {
                addActivity(data);
              }
              setShowActivityForm(false);
            }}
            onCancel={() => {
              setShowActivityForm(false);
              setState(prev => ({ ...prev, currentActivity: null }));
            }}
          />
        )}

        {/* Worker Form Modal */}
        {showWorkerForm && state.currentActivity && (
          <WorkerFormModal
            onSave={(worker) => addWorker(state.currentActivity!.id, worker)}
            onCancel={() => setShowWorkerForm(false)}
          />
        )}

        {/* Material Form Modal */}
        {showMaterialForm && state.currentActivity && (
          <MaterialFormModal
            onSave={(material) => addMaterial(state.currentActivity!.id, material)}
            onCancel={() => setShowMaterialForm(false)}
          />
        )}
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({
  activity,
  index,
  onEdit,
  onDelete,
  onAddWorker,
  onAddMaterial
}: {
  activity: ManualActivity;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onAddWorker: () => void;
  onAddMaterial: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalLaborCost = activity.workers.reduce(
    (sum, w) => sum + (w.count * w.dailyCost * activity.duration),
    0
  );
  const totalMaterialCost = activity.materials.reduce(
    (sum, m) => sum + (m.quantity * (1 + m.wastePercentage / 100) * m.unitCost),
    0
  );

  return (
    <div className="bg-slate-700/50 rounded-xl border border-slate-600 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-700/70 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{activity.name}</h4>
              <p className="text-sm text-slate-400">
                {activity.duration} يوم • {activity.workers.length} عامل • {activity.materials.length} مادة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
              {totalLaborCost.toLocaleString('ar-SA')} ريال
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t border-slate-600 space-y-4">
          {/* Workers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-bold text-slate-300">العمالة</h5>
              <button
                onClick={onAddWorker}
                className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all text-sm"
              >
                <Plus className="w-3 h-3" />
                إضافة
              </button>
            </div>
            {activity.workers.length === 0 ? (
              <p className="text-sm text-slate-500">لا توجد عمالة محددة</p>
            ) : (
              <div className="space-y-2">
                {activity.workers.map(worker => (
                  <div key={worker.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{worker.role}</p>
                      <p className="text-sm text-slate-400">
                        {worker.count} عامل • {worker.dailyCost} ريال/يوم • إنتاجية: {worker.productivity}
                      </p>
                    </div>
                    <span className="text-green-400 font-bold">
                      {(worker.count * worker.dailyCost * activity.duration).toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-bold text-slate-300">المواد</h5>
              <button
                onClick={onAddMaterial}
                className="flex items-center gap-1 px-3 py-1 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 transition-all text-sm"
              >
                <Plus className="w-3 h-3" />
                إضافة
              </button>
            </div>
            {activity.materials.length === 0 ? (
              <p className="text-sm text-slate-500">لا توجد مواد محددة</p>
            ) : (
              <div className="space-y-2">
                {activity.materials.map(material => {
                  const totalQty = material.quantity * (1 + material.wastePercentage / 100);
                  const totalCost = totalQty * material.unitCost;
                  return (
                    <div key={material.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{material.name}</p>
                        <p className="text-sm text-slate-400">
                          {material.quantity} {material.unit} + {material.wastePercentage}% هدر = {totalQty.toFixed(2)} {material.unit}
                        </p>
                      </div>
                      <span className="text-amber-400 font-bold">
                        {totalCost.toLocaleString('ar-SA')} ريال
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          {activity.notes && (
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">📝 {activity.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Activity Form Modal
function ActivityFormModal({
  activity,
  onSave,
  onCancel
}: {
  activity: ManualActivity | null;
  onSave: (data: Partial<ManualActivity>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    duration: activity?.duration || 1,
    notes: activity?.notes || ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-6">
          {activity ? 'تعديل النشاط' : 'إضافة نشاط جديد'}
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">اسم النشاط</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="مثال: نجارة الأعمدة"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">المدة (أيام)</label>
            <input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ملاحظات (اختياري)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              rows={3}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Save className="w-4 h-4 inline mr-2" />
            حفظ
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// Worker Form Modal
function WorkerFormModal({
  onSave,
  onCancel
}: {
  onSave: (worker: ManualWorker) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    role: '',
    count: 1,
    dailyCost: 150,
    productivity: 10
  });

  const workerRoles = [
    'نجار',
    'حداد',
    'عامل خرسانة',
    'عامل بناء',
    'سباك',
    'كهربائي',
    'دهان',
    'بلاط',
    'عامل عادي'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-6">إضافة عامل</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">التخصص</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="">اختر التخصص</option>
              {workerRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">العدد</label>
            <input
              type="number"
              min="1"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">التكلفة اليومية (ريال)</label>
            <input
              type="number"
              min="0"
              value={formData.dailyCost}
              onChange={(e) => setFormData({ ...formData, dailyCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الإنتاجية (وحدة/يوم)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.productivity}
              onChange={(e) => setFormData({ ...formData, productivity: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (formData.role) {
                onSave({
                  id: `worker-${Date.now()}`,
                  ...formData
                });
              }
            }}
            disabled={!formData.role}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إضافة
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// Material Form Modal
function MaterialFormModal({
  onSave,
  onCancel
}: {
  onSave: (material: ManualMaterial) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'م3',
    wastePercentage: 5,
    unitCost: 0
  });

  const units = ['م3', 'م2', 'مط', 'طن', 'كجم', 'عدد', 'لتر'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-6">إضافة مادة</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">اسم المادة</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              placeholder="مثال: خرسانة جاهزة"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">الكمية</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">الوحدة</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">نسبة الهدر (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.wastePercentage}
              onChange={(e) => setFormData({ ...formData, wastePercentage: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">سعر الوحدة (ريال)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (formData.name) {
                onSave({
                  id: `material-${Date.now()}`,
                  ...formData
                });
              }
            }}
            disabled={!formData.name}
            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إضافة
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
