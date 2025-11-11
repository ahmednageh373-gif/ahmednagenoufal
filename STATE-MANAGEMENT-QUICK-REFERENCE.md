# ⚡ مرجع سريع - State Management Quick Reference

## 🎯 للبدء السريع

### 1. Setup (إعداد أولي)

```typescript
// index.tsx or App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './store/queryClient';

function Root() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

---

## 📚 Hooks Reference (مرجع الـ Hooks)

### BOQ (المقايسة)

```typescript
import { 
  useBOQData,           // Get all BOQ items
  useBOQActions,        // Get CRUD functions
  useBOQItem,           // Get single item by ID
  useBOQStats,          // Get statistics
  useBOQByCategory,     // Filter by category
  useBOQByStatus        // Filter by status
} from './hooks/useProject';

// Example
function MyComponent() {
  const boq = useBOQData();                    // BOQItem[]
  const { updateItem } = useBOQActions();      // Function
  const item = useBOQItem('item-1');          // BOQItem | undefined
  const stats = useBOQStats();                // { total, completed, ... }
}
```

### Schedule (الجدول الزمني)

```typescript
import {
  useScheduleData,           // Get all activities
  useScheduleActions,        // Get CRUD functions
  useScheduleActivity,       // Get single activity
  useCriticalPath,           // Get critical path
  useActivitiesByStatus,     // Filter by status
  useDelayedActivities,      // Get delayed activities
  useScheduleStats           // Get statistics
} from './hooks/useProject';

// Example
function MyComponent() {
  const schedule = useScheduleData();                    // ScheduleActivity[]
  const criticalPath = useCriticalPath();               // ScheduleActivity[]
  const delayed = useDelayedActivities();               // ScheduleActivity[]
  const stats = useScheduleStats();                     // { total, delayed, ... }
}
```

### Financial (المالية)

```typescript
import {
  useFinancialData,          // Get all financial data
  useFinancialMetrics,       // Get metrics
  useCashFlow,               // Get cash flow
  useCostByCategory          // Get costs by category
} from './hooks/useProject';

// Example
function MyComponent() {
  const financial = useFinancialData();      // FinancialData
  const metrics = useFinancialMetrics();     // { totalCost, budgetVariance, ... }
  const cashFlow = useCashFlow();            // Array
  const costs = useCostByCategory();         // Array
}
```

### Risks (المخاطر)

```typescript
import {
  useRisks,                  // Get all risks
  useHighRisks,              // Get high-priority risks
  useRisksByCategory,        // Filter by category
  useRisksByStatus,          // Filter by status
  useRiskStats               // Get statistics
} from './hooks/useProject';

// Example
function MyComponent() {
  const risks = useRisks();                     // RiskItem[]
  const highRisks = useHighRisks();            // RiskItem[]
  const stats = useRiskStats();                // { total, highRisks, ... }
}
```

### Project (المشروع)

```typescript
import {
  useProjectMetadata,        // Get project info
  useProjectProgress,        // Get overall progress
  useProjectHealth,          // Get health metrics
  useProjectOverview         // Get complete overview
} from './hooks/useProject';

// Example
function MyComponent() {
  const project = useProjectMetadata();      // ProjectMetadata
  const progress = useProjectProgress();     // number (0-100)
  const health = useProjectHealth();         // { score, status, factors }
  const overview = useProjectOverview();     // Complete overview
}
```

### Notifications (الإشعارات)

```typescript
import {
  useNotifications,          // Get all notifications
  useUnreadNotifications,    // Get unread only
  useNotificationCount,      // Get counts
  useNotificationActions     // Get actions
} from './hooks/useProject';

// Example
function MyComponent() {
  const notifications = useNotifications();              // Notification[]
  const unread = useUnreadNotifications();              // Notification[]
  const { total, unread: count } = useNotificationCount();  // { total: number, unread: number }
  const { add, markRead, clear } = useNotificationActions();
  
  // Add notification
  add({
    type: 'success',
    title: 'عنوان',
    message: 'رسالة',
    read: false
  });
}
```

### AI Processing (معالجة الذكاء الاصطناعي)

```typescript
import { useAIProcess } from './hooks/useAIProcess';

function MyComponent() {
  const { runProcess, isProcessing, progress, status, error, clear } = 
    useAIProcess('unique-process-id');
  
  const handleProcess = async () => {
    const result = await runProcess('اسم العملية', async (updateProgress) => {
      // Step 1
      updateProgress(25);
      const step1 = await doSomething();
      
      // Step 2
      updateProgress(50);
      const step2 = await doMore();
      
      // Step 3
      updateProgress(100);
      return { step1, step2 };
    });
    
    console.log('Result:', result);
  };
  
  return (
    <button onClick={handleProcess} disabled={isProcessing}>
      {isProcessing ? `${progress}%` : 'بدء المعالجة'}
    </button>
  );
}
```

### React Query (البيانات السحابية)

```typescript
import {
  useProject,               // Fetch project
  useProjectMutation,       // Update project
  useBOQ,                   // Fetch BOQ
  useBOQMutation,           // Update BOQ
  useAddBOQItem,            // Add BOQ item
  useSchedule,              // Fetch schedule
  useCriticalPath,          // Fetch critical path
  useFinancial,             // Fetch financial
  useRisks,                 // Fetch risks
  useAddRisk                // Add risk
} from './hooks/useProjectQuery';

// Example: Fetch
function MyComponent() {
  const projectId = 'project-1';
  const { data, isLoading, error, refetch } = useBOQ(projectId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>BOQ has {data.length} items</div>;
}

// Example: Update (with optimistic update)
function MyComponent() {
  const projectId = 'project-1';
  const mutation = useBOQMutation(projectId);
  
  const handleUpdate = () => {
    mutation.mutate(newBOQItems, {
      onSuccess: () => console.log('Updated!'),
      onError: (error) => console.error('Failed!', error),
    });
  };
  
  return (
    <button onClick={handleUpdate} disabled={mutation.isLoading}>
      {mutation.isLoading ? 'جاري التحديث...' : 'تحديث'}
    </button>
  );
}
```

---

## 🔧 Common Patterns (أنماط شائعة)

### Pattern 1: Display List

```typescript
function ItemList() {
  const items = useBOQData();
  
  return (
    <div>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Pattern 2: Edit Item

```typescript
function ItemEditor({ itemId }) {
  const item = useBOQItem(itemId);
  const { updateItem } = useBOQActions();
  const [value, setValue] = useState(item?.quantity || 0);
  
  const handleSave = () => {
    updateItem(itemId, { quantity: value });
  };
  
  return (
    <input value={value} onChange={(e) => setValue(e.target.value)} />
    <button onClick={handleSave}>حفظ</button>
  );
}
```

### Pattern 3: Filtered List

```typescript
function CompletedItems() {
  const completed = useBOQByStatus('completed');
  
  return <div>{completed.length} completed items</div>;
}
```

### Pattern 4: Statistics Dashboard

```typescript
function Dashboard() {
  const boqStats = useBOQStats();
  const scheduleStats = useScheduleStats();
  const health = useProjectHealth();
  
  return (
    <div>
      <StatCard title="BOQ Progress" value={`${boqStats.completionRate}%`} />
      <StatCard title="Schedule" value={`${scheduleStats.onTimeRate}%`} />
      <StatCard title="Health" value={health.score} />
    </div>
  );
}
```

### Pattern 5: AI Processing

```typescript
function AIAnalyzer() {
  const { runProcess, isProcessing, progress } = useAIProcess('analyzer');
  const boq = useBOQData();
  const { updateBOQ } = useBOQActions();
  
  const handleAnalyze = async () => {
    const result = await runProcess('تحليل', async (updateProgress) => {
      updateProgress(50);
      const analyzed = await analyzeData(boq);
      updateProgress(100);
      return analyzed;
    });
    
    updateBOQ(result);
  };
  
  return (
    <>
      <button onClick={handleAnalyze} disabled={isProcessing}>
        تحليل
      </button>
      {isProcessing && <ProgressBar progress={progress} />}
    </>
  );
}
```

---

## ⚠️ Common Mistakes (أخطاء شائعة)

### ❌ Don't

```typescript
// ❌ Don't use store directly in components
const state = useProjectStore();

// ❌ Don't fetch without React Query
useEffect(() => {
  fetch('/api/boq').then(setData);
}, []);

// ❌ Don't forget Error Boundary
<MyComponent /> // No error protection

// ❌ Don't mix server/client state
const [boq, setBOQ] = useState([]); // Should use React Query
```

### ✅ Do

```typescript
// ✅ Use custom hooks
const boq = useBOQData();

// ✅ Use React Query for fetching
const { data } = useBOQ(projectId);

// ✅ Wrap with Error Boundary
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// ✅ Separate concerns
const serverData = useBOQ(projectId);     // Server state
const clientData = useBOQData();          // Client state
```

---

## 🚨 Troubleshooting (حل المشاكل)

### Problem: Data not updating

```typescript
// Solution: Invalidate query
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './store/queryClient';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: queryKeys.boq(projectId) });
```

### Problem: Too many re-renders

```typescript
// ❌ Bad: Component re-renders on any state change
const state = useProjectStore();

// ✅ Good: Component re-renders only when boq changes
const boq = useProjectStore(state => state.boq);

// ✅ Better: Use custom hook
const boq = useBOQData();
```

### Problem: Logger too verbose

```typescript
// Disable in production
import { logger } from './store/middleware/logger';

export const useProjectStore = create<ProjectState>()(
  process.env.NODE_ENV === 'development' 
    ? logger(devtools(persist(...)))
    : devtools(persist(...))
);
```

---

## 📖 Documentation Links

1. **STATE-MANAGEMENT-CRITICAL-FIXES.md** - المشاكل والحلول المفصلة
2. **STATE-MANAGEMENT-USAGE-EXAMPLES.md** - أمثلة مكونات كاملة
3. **STATE-MANAGEMENT-IMPLEMENTATION-SUMMARY.md** - ملخص التنفيذ
4. **STATE-MANAGEMENT-ARCHITECTURE.md** - البنية المعمارية المرئية

---

## 🎯 Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# View React Query DevTools
# Open http://localhost:3000 and look for floating icon

# View Zustand DevTools
# Open Redux DevTools extension in browser
```

---

## 💡 Tips

1. **Always use custom hooks** instead of store directly
2. **Use React Query for server data**, Zustand for client state
3. **Wrap critical components with ErrorBoundary**
4. **Enable DevTools in development** for debugging
5. **Use TypeScript** for type safety
6. **Monitor performance** with Logger Middleware
7. **Test optimistic updates** for better UX
8. **Keep queries updated** with invalidation

---

## ✅ Checklist for New Components

- [ ] Import necessary hooks from `./hooks/useProject`
- [ ] Use `useBOQ()` or similar for server data
- [ ] Use `useBOQData()` for cached client data
- [ ] Wrap with `<ErrorBoundary>` if critical
- [ ] Handle loading and error states
- [ ] Use TypeScript types from store
- [ ] Test with React Query DevTools
- [ ] Check Logger output for state changes

---

**هذا كل شيء! مرجع سريع وجاهز للاستخدام** ⚡
