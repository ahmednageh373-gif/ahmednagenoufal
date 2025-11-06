import React, { useState, useEffect } from 'react';
import { useBOQIntegration, useFinancialIntegration, useNotifications } from '../hooks/useIntegration';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { BOQItem } from '../store/useProjectStore';

/**
 * EXAMPLE: Integrated BOQ Manager
 * 
 * This component demonstrates how to use the integration system:
 * 1. Changes in BOQ automatically update Financial data
 * 2. Notifications are sent when data changes
 * 3. Data is synced with the backend
 * 4. All changes propagate to other pages
 */
export const IntegratedBOQExample: React.FC = () => {
  const {
    boq,
    totalCost,
    addItem,
    updateItem,
    deleteItem,
    syncWithBackend,
  } = useBOQIntegration();

  const {
    financial,
    budgetVariance,
  } = useFinancialIntegration();

  const {
    notifications,
    unreadCount,
    markRead,
  } = useNotifications();

  const [editingItem, setEditingItem] = useState<Partial<BOQItem>>({
    description: '',
    quantity: 0,
    unit: '',
    unitPrice: 0,
    category: '',
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Watch for BOQ changes and show in console
  useEffect(() => {
    console.log('📊 BOQ Updated:', boq.length, 'items, Total:', totalCost);
  }, [boq, totalCost]);

  // Watch for Financial changes
  useEffect(() => {
    console.log('💰 Financial Updated:', financial);
  }, [financial]);

  const handleAddItem = () => {
    if (!editingItem.description || !editingItem.quantity || !editingItem.unitPrice) {
      alert('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    const newItem: BOQItem = {
      id: `boq-${Date.now()}`,
      description: editingItem.description!,
      quantity: editingItem.quantity!,
      unit: editingItem.unit || 'متر',
      unitPrice: editingItem.unitPrice!,
      totalCost: editingItem.quantity! * editingItem.unitPrice!,
      category: editingItem.category,
      status: 'pending',
    };

    addItem(newItem);

    // Reset form
    setEditingItem({
      description: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      category: '',
    });
  };

  const handleUpdateStatus = (id: string, status: BOQItem['status']) => {
    updateItem(id, { status });
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البند؟')) {
      deleteItem(id);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithBackend(boq);
      alert('تمت المزامنة بنجاح!');
    } catch (error) {
      alert('فشلت المزامنة');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إدارة المقايسة (مثال متكامل)</h1>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            مزامنة مع الخادم
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400">عدد البنود</div>
            <div className="text-2xl font-bold">{boq.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400">التكلفة الإجمالية</div>
            <div className="text-2xl font-bold">{totalCost.toLocaleString()} ريال</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400">الميزانية المتبقية</div>
            <div className="text-2xl font-bold">{financial.remaining.toLocaleString()} ريال</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="text-sm text-orange-600 dark:text-orange-400">الإشعارات</div>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">إضافة بند جديد</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="الوصف"
            value={editingItem.description || ''}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="number"
            placeholder="الكمية"
            value={editingItem.quantity || ''}
            onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="text"
            placeholder="الوحدة"
            value={editingItem.unit || ''}
            onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="number"
            placeholder="سعر الوحدة"
            value={editingItem.unitPrice || ''}
            onChange={(e) => setEditingItem({ ...editingItem, unitPrice: parseFloat(e.target.value) })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={handleAddItem}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={16} />
            إضافة
          </button>
        </div>
      </div>

      {/* BOQ Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right">الوصف</th>
                <th className="px-4 py-3 text-right">الكمية</th>
                <th className="px-4 py-3 text-right">الوحدة</th>
                <th className="px-4 py-3 text-right">سعر الوحدة</th>
                <th className="px-4 py-3 text-right">التكلفة الإجمالية</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {boq.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    لا توجد بنود في المقايسة
                  </td>
                </tr>
              ) : (
                boq.map((item) => (
                  <tr key={item.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{item.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">{item.totalCost.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status || 'pending'}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as BOQItem['status'])}
                        className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="approved">معتمد</option>
                        <option value="in_progress">قيد التنفيذ</option>
                        <option value="completed">مكتمل</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">الإشعارات الحديثة</h2>
        <div className="space-y-2">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              onClick={() => markRead(notification.id)}
              className={`p-3 rounded-lg cursor-pointer ${
                notification.read 
                  ? 'bg-gray-50 dark:bg-gray-700' 
                  : 'bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {notification.type === 'success' && '✅'}
                  {notification.type === 'error' && '❌'}
                  {notification.type === 'warning' && '⚠️'}
                  {notification.type === 'info' && 'ℹ️'}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">{notification.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              لا توجد إشعارات
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">الملخص المالي (تحديث تلقائي)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">الميزانية الإجمالية</div>
            <div className="text-2xl font-bold">{financial.totalBudget.toLocaleString()} ريال</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">المصروف</div>
            <div className="text-2xl font-bold text-red-600">{financial.totalSpent.toLocaleString()} ريال</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">المتبقي</div>
            <div className="text-2xl font-bold text-green-600">{financial.remaining.toLocaleString()} ريال</div>
          </div>
        </div>

        {/* Cost by Category */}
        {financial.costByCategory.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">التكلفة حسب الفئة</h3>
            <div className="space-y-2">
              {financial.costByCategory.map((category) => (
                <div key={category.category} className="flex items-center gap-4">
                  <div className="w-32 font-medium">{category.category}</div>
                  <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${(category.spent / category.budget) * 100}%` }}
                    />
                  </div>
                  <div className="w-48 text-sm">
                    {category.spent.toLocaleString()} / {category.budget.toLocaleString()} ريال
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Integration Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">
          💡 كيف يعمل التكامل
        </h2>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200">
          <li>✅ عند إضافة أو تعديل بند في المقايسة، يتم تحديث البيانات المالية تلقائياً</li>
          <li>✅ جميع التغييرات تُسجّل في الإشعارات</li>
          <li>✅ البيانات محفوظة في المتصفح وتُزامن مع الخادم</li>
          <li>✅ أي صفحة أخرى تستخدم نفس البيانات ستُحدّث فوراً</li>
          <li>✅ الحسابات المالية (الميزانية، المصروف، المتبقي) تُحدّث تلقائياً</li>
        </ul>
      </div>
    </div>
  );
};
