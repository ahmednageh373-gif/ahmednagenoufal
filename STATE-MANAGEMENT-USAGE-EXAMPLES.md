# 📚 أمثلة استخدام إدارة الحالة - State Management Usage Examples

## 🎯 نظرة عامة

هذا الدليل يوضح كيفية استخدام نظام إدارة الحالة الجديد في مكونات React.

---

## 1️⃣ إعداد التطبيق (App Setup)

### الخطوة 1: Wrap التطبيق بـ QueryClientProvider

**ملف**: `index.tsx` أو `App.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './store/queryClient';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* DevTools for debugging (only in development) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

### الخطوة 2: (اختياري) إضافة Logger Middleware إلى Store

**ملف**: `src/store/useProjectStore.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from './middleware/logger'; // Import logger

export const useProjectStore = create<ProjectState>()(
  logger( // Add logger wrapper
    devtools(
      persist(
        (set, get) => ({
          // ... your store implementation
        }),
        { name: 'noufal-project-store' }
      )
    ),
    'ProjectStore' // Store name for logger
  )
);
```

---

## 2️⃣ أمثلة المكونات (Component Examples)

### مثال 1: عرض المقايسة (BOQ Display)

```typescript
import React from 'react';
import { useBOQData, useBOQStats } from '../hooks/useProject';
import { useBOQ } from '../hooks/useProjectQuery';

function BOQDashboard() {
  const projectId = 'project-1';
  
  // Fetch BOQ from server (with React Query)
  const { isLoading, error, refetch } = useBOQ(projectId);
  
  // Get BOQ data from store
  const boqItems = useBOQData();
  const stats = useBOQStats();
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تحميل المقايسة...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">حدث خطأ في تحميل المقايسة</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="إجمالي البنود" value={stats.total} />
        <StatCard title="مكتمل" value={stats.completed} />
        <StatCard title="قيد التنفيذ" value={stats.inProgress} />
        <StatCard title="الإجمالي" value={`${stats.totalCost.toLocaleString('ar-SA')} ر.س`} />
      </div>
      
      {/* BOQ Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right">الوصف</th>
              <th className="px-6 py-3 text-right">الكمية</th>
              <th className="px-6 py-3 text-right">الوحدة</th>
              <th className="px-6 py-3 text-right">سعر الوحدة</th>
              <th className="px-6 py-3 text-right">الإجمالي</th>
              <th className="px-6 py-3 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {boqItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{item.description}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">{item.unit}</td>
                <td className="px-6 py-4">{item.unitPrice.toLocaleString('ar-SA')}</td>
                <td className="px-6 py-4">{item.totalCost.toLocaleString('ar-SA')}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### مثال 2: تحديث بند في المقايسة (Update BOQ Item)

```typescript
import React, { useState } from 'react';
import { useBOQActions, useBOQItem } from '../hooks/useProject';
import { useNotificationActions } from '../hooks/useProject';

function BOQItemEditor({ itemId }: { itemId: string }) {
  const item = useBOQItem(itemId);
  const { updateItem } = useBOQActions();
  const { add: addNotification } = useNotificationActions();
  
  const [quantity, setQuantity] = useState(item?.quantity || 0);
  const [unitPrice, setUnitPrice] = useState(item?.unitPrice || 0);
  
  if (!item) {
    return <div>البند غير موجود</div>;
  }
  
  const handleSave = () => {
    updateItem(itemId, {
      quantity,
      unitPrice,
      totalCost: quantity * unitPrice,
    });
    
    addNotification({
      type: 'success',
      title: 'تم التحديث',
      message: `تم تحديث ${item.description}`,
      read: false,
    });
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">{item.description}</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">الكمية</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">سعر الوحدة</label>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-lg font-bold">
            الإجمالي: {(quantity * unitPrice).toLocaleString('ar-SA')} ر.س
          </p>
        </div>
        
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          حفظ التعديلات
        </button>
      </div>
    </div>
  );
}
```

### مثال 3: معالجة بالذكاء الاصطناعي (AI Processing)

```typescript
import React, { useState } from 'react';
import { useAIProcess } from '../hooks/useAIProcess';
import { useBOQData, useBOQActions } from '../hooks/useProject';

function BOQAnalyzer() {
  const boqData = useBOQData();
  const { updateBOQ } = useBOQActions();
  const { runProcess, isProcessing, progress } = useAIProcess('boq-analysis');
  
  const handleAnalyze = async () => {
    try {
      const result = await runProcess('تحليل المقايسة', async (updateProgress) => {
        // Step 1: Validate data
        updateProgress(20);
        console.log('Validating BOQ data...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 2: Calculate costs
        updateProgress(50);
        console.log('Calculating costs...');
        const updatedItems = boqData.map(item => ({
          ...item,
          totalCost: item.quantity * item.unitPrice,
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 3: Categorize items
        updateProgress(80);
        console.log('Categorizing items...');
        // AI logic here...
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 4: Finalize
        updateProgress(100);
        return updatedItems;
      });
      
      updateBOQ(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">تحليل المقايسة بالذكاء الاصطناعي</h3>
      
      <button
        onClick={handleAnalyze}
        disabled={isProcessing || boqData.length === 0}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
      >
        {isProcessing ? `جاري التحليل... ${progress}%` : 'تحليل المقايسة'}
      </button>
      
      {isProcessing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {progress}% مكتمل
          </p>
        </div>
      )}
    </div>
  );
}
```

### مثال 4: عرض الإشعارات (Notifications)

```typescript
import React from 'react';
import { useNotifications, useNotificationActions, useNotificationCount } from '../hooks/useProject';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

function NotificationCenter() {
  const notifications = useNotifications();
  const { markRead, clear } = useNotificationActions();
  const { unread } = useNotificationCount();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unread}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg">الإشعارات</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clear}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  مسح الكل
                </button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                لا توجد إشعارات
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markRead(notif.id)}
                >
                  <div className="flex gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{notif.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.timestamp).toLocaleString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### مثال 5: Dashboard شامل (Complete Dashboard)

```typescript
import React from 'react';
import { useProjectOverview } from '../hooks/useProject';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

function ProjectDashboard() {
  const overview = useProjectOverview();
  
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };
  
  return (
    <div className="p-8 space-y-8">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">{overview.metadata.name}</h1>
        <p className="mt-2">{overview.metadata.client}</p>
        <div className="mt-4 flex gap-4">
          <div>
            <span className="text-blue-100">الحالة:</span>
            <span className="font-bold mr-2">{overview.metadata.status}</span>
          </div>
          <div>
            <span className="text-blue-100">التقدم:</span>
            <span className="font-bold mr-2">{overview.progress}%</span>
          </div>
        </div>
      </div>
      
      {/* Health Score */}
      <div className={`p-6 rounded-lg ${getHealthColor(overview.health.score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">صحة المشروع</h3>
            <p className="text-sm mt-1">
              {overview.health.status === 'excellent' ? 'ممتاز' :
               overview.health.status === 'good' ? 'جيد' :
               overview.health.status === 'fair' ? 'مقبول' : 'يحتاج تحسين'}
            </p>
          </div>
          <div className="text-4xl font-bold">
            {overview.health.score}%
          </div>
        </div>
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* BOQ Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">المقايسة</h3>
          <div className="space-y-2">
            <StatRow label="إجمالي البنود" value={overview.boqStats.total} />
            <StatRow label="مكتمل" value={overview.boqStats.completed} />
            <StatRow label="نسبة الإنجاز" value={`${overview.boqStats.completionRate.toFixed(1)}%`} />
            <StatRow 
              label="التكلفة الإجمالية" 
              value={`${overview.boqStats.totalCost.toLocaleString('ar-SA')} ر.س`} 
            />
          </div>
        </div>
        
        {/* Schedule Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">الجدول الزمني</h3>
          <div className="space-y-2">
            <StatRow label="إجمالي الأنشطة" value={overview.scheduleStats.total} />
            <StatRow label="مكتمل" value={overview.scheduleStats.completed} />
            <StatRow label="متأخر" value={overview.scheduleStats.delayed} className="text-red-600" />
            <StatRow 
              label="نسبة الالتزام" 
              value={`${overview.scheduleStats.onTimeRate.toFixed(1)}%`}
            />
          </div>
        </div>
        
        {/* Financial Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">المالية</h3>
          <div className="space-y-2">
            <StatRow 
              label="الميزانية" 
              value={`${overview.financialMetrics.totalBudget.toLocaleString('ar-SA')} ر.س`} 
            />
            <StatRow 
              label="المصروف" 
              value={`${overview.financialMetrics.totalSpent.toLocaleString('ar-SA')} ر.س`}
            />
            <StatRow 
              label="المتبقي" 
              value={`${overview.financialMetrics.remaining.toLocaleString('ar-SA')} ر.س`}
            />
            <StatRow 
              label="نسبة الصرف" 
              value={`${overview.financialMetrics.spendRate.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>
      
      {/* Risks Alert */}
      {overview.riskStats.highRisks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="font-bold text-red-900">تنبيه: مخاطر عالية</h3>
            <p className="text-red-700">
              يوجد {overview.riskStats.highRisks} مخاطرة عالية تحتاج إلى اهتمام فوري
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, className = '' }: { label: string; value: any; className?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className={`font-semibold ${className}`}>{value}</span>
    </div>
  );
}
```

---

## 3️⃣ أفضل الممارسات (Best Practices)

### ✅ استخدم Hooks المخصصة

```typescript
// ❌ لا تفعل
const boq = useProjectStore(state => state.boq);
const updateBOQ = useProjectStore(state => state.updateBOQ);

// ✅ افعل
const boq = useBOQData();
const { updateBOQ } = useBOQActions();
```

### ✅ استخدم React Query للبيانات السحابية

```typescript
// ✅ البيانات من الخادم
const { data, isLoading } = useBOQ(projectId);

// ✅ البيانات المحلية
const boqItems = useBOQData();
```

### ✅ استخدم Error Boundary

```typescript
function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### ✅ استخدم Optimistic Updates

```typescript
const mutation = useBOQMutation(projectId);

// Automatic optimistic update
mutation.mutate(newBOQItems);
```

---

## 4️⃣ Troubleshooting

### Problem: البيانات لا تتحدث

**الحل**:
```typescript
// Force refetch
const { refetch } = useBOQ(projectId);
refetch();

// Or invalidate query
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: queryKeys.boq(projectId) });
```

### Problem: Logger يعرض الكثير من Logs

**الحل**:
```typescript
// Disable logger in production
import { logger } from './store/middleware/logger';

export const useProjectStore = create<ProjectState>()(
  process.env.NODE_ENV === 'development' 
    ? logger(devtools(persist(...)), 'ProjectStore')
    : devtools(persist(...))
);
```

---

## 5️⃣ النتيجة النهائية

### قبل:
```typescript
// ❌ مكونات معقدة
function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData).catch(setError);
  }, []);
  
  // 50+ lines of boilerplate code
}
```

### بعد:
```typescript
// ✅ مكونات بسيطة
function MyComponent() {
  const { data, isLoading, error } = useBOQ(projectId);
  const boqItems = useBOQData();
  
  // Clean and simple!
}
```

---

## 📚 المراجع

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**تم! الآن لديك نظام إدارة حالة قوي ومتكامل** ✅
