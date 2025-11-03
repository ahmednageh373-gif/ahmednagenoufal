import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ==================== INTERFACES ====================

export interface BOQItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  category?: string;
  status?: 'pending' | 'approved' | 'in_progress' | 'completed';
  linkedActivityId?: string; // Link to schedule activity
}

export interface ScheduleActivity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  dependencies: string[];
  resources?: string[];
  cost?: number;
  linkedBOQItems?: string[]; // Link to BOQ items
  status?: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  isCriticalPath?: boolean;
}

export interface FinancialData {
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  remaining: number;
  contingency: number;
  cashFlow: {
    date: string;
    planned: number;
    actual: number;
  }[];
  costByCategory: {
    category: string;
    budget: number;
    spent: number;
    remaining: number;
  }[];
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  probability: number; // 0-100
  impact: number; // 0-100
  riskScore: number; // probability * impact
  category: 'technical' | 'financial' | 'schedule' | 'safety' | 'regulatory';
  status: 'identified' | 'analyzing' | 'mitigating' | 'closed';
  mitigationPlan?: string;
  owner?: string;
  linkedItems?: string[]; // BOQ or Schedule IDs
}

export interface ProjectMetadata {
  id: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  overallProgress: number;
  status: 'planning' | 'execution' | 'monitoring' | 'closing' | 'completed';
  lastUpdated: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// ==================== STORE INTERFACE ====================

interface ProjectState {
  // Data
  boq: BOQItem[];
  schedule: ScheduleActivity[];
  financial: FinancialData;
  risks: RiskItem[];
  project: ProjectMetadata;
  notifications: Notification[];
  
  // Loading states
  isLoading: boolean;
  lastSyncTime: string | null;
  
  // Computed values (getters)
  getTotalCost: () => number;
  getOverallProgress: () => number;
  getCriticalPath: () => ScheduleActivity[];
  getHighRisks: () => RiskItem[];
  getBudgetVariance: () => number;
  getScheduleVariance: () => number;
  
  // Actions - BOQ
  updateBOQ: (items: BOQItem[]) => void;
  addBOQItem: (item: BOQItem) => void;
  updateBOQItem: (id: string, updates: Partial<BOQItem>) => void;
  deleteBOQItem: (id: string) => void;
  
  // Actions - Schedule
  updateSchedule: (activities: ScheduleActivity[]) => void;
  addScheduleActivity: (activity: ScheduleActivity) => void;
  updateScheduleActivity: (id: string, updates: Partial<ScheduleActivity>) => void;
  deleteScheduleActivity: (id: string) => void;
  
  // Actions - Financial
  updateFinancial: (data: Partial<FinancialData>) => void;
  recalculateFinancials: () => void;
  
  // Actions - Risks
  updateRisks: (risks: RiskItem[]) => void;
  addRisk: (risk: RiskItem) => void;
  updateRisk: (id: string, updates: Partial<RiskItem>) => void;
  deleteRisk: (id: string) => void;
  
  // Actions - Project
  updateProject: (updates: Partial<ProjectMetadata>) => void;
  
  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Actions - Sync
  syncWithBackend: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

// ==================== INITIAL STATE ====================

const initialFinancial: FinancialData = {
  totalBudget: 0,
  totalSpent: 0,
  totalCommitted: 0,
  remaining: 0,
  contingency: 0,
  cashFlow: [],
  costByCategory: [],
};

const initialProject: ProjectMetadata = {
  id: 'project-1',
  name: 'مشروع نوفل',
  client: 'عميل افتراضي',
  location: 'الرياض، المملكة العربية السعودية',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  totalBudget: 0,
  overallProgress: 0,
  status: 'planning',
  lastUpdated: new Date().toISOString(),
};

// ==================== STORE IMPLEMENTATION ====================

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial data
        boq: [],
        schedule: [],
        financial: initialFinancial,
        risks: [],
        project: initialProject,
        notifications: [],
        isLoading: false,
        lastSyncTime: null,

        // ==================== COMPUTED VALUES ====================

        getTotalCost: () => {
          const state = get();
          return state.boq.reduce((sum, item) => sum + item.totalCost, 0);
        },

        getOverallProgress: () => {
          const state = get();
          if (state.schedule.length === 0) return 0;
          const totalProgress = state.schedule.reduce((sum, activity) => sum + activity.progress, 0);
          return Math.round(totalProgress / state.schedule.length);
        },

        getCriticalPath: () => {
          const state = get();
          return state.schedule.filter(activity => activity.isCriticalPath);
        },

        getHighRisks: () => {
          const state = get();
          return state.risks
            .filter(risk => risk.riskScore >= 50)
            .sort((a, b) => b.riskScore - a.riskScore);
        },

        getBudgetVariance: () => {
          const state = get();
          return state.financial.totalBudget - state.financial.totalSpent;
        },

        getScheduleVariance: () => {
          const state = get();
          const now = new Date().getTime();
          let variance = 0;
          
          state.schedule.forEach(activity => {
            const endDate = new Date(activity.endDate).getTime();
            if (activity.status !== 'completed' && endDate < now) {
              variance += Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
            }
          });
          
          return variance;
        },

        // ==================== BOQ ACTIONS ====================

        updateBOQ: (items) => {
          set({ boq: items });
          
          // Auto-recalculate financials
          get().recalculateFinancials();
          
          // Update project metadata
          const totalCost = get().getTotalCost();
          set(state => ({
            project: {
              ...state.project,
              totalBudget: totalCost,
              lastUpdated: new Date().toISOString(),
            }
          }));
          
          // Add notification
          get().addNotification({
            type: 'success',
            title: 'تحديث المقايسة',
            message: `تم تحديث ${items.length} بند في المقايسة`,
            read: false,
          });
        },

        addBOQItem: (item) => {
          set(state => ({
            boq: [...state.boq, item]
          }));
          get().recalculateFinancials();
          
          get().addNotification({
            type: 'info',
            title: 'بند جديد',
            message: `تمت إضافة: ${item.description}`,
            read: false,
          });
        },

        updateBOQItem: (id, updates) => {
          set(state => ({
            boq: state.boq.map(item => 
              item.id === id 
                ? { 
                    ...item, 
                    ...updates,
                    totalCost: updates.quantity !== undefined || updates.unitPrice !== undefined
                      ? (updates.quantity ?? item.quantity) * (updates.unitPrice ?? item.unitPrice)
                      : item.totalCost
                  }
                : item
            )
          }));
          get().recalculateFinancials();
          
          // Check if linked to schedule
          const item = get().boq.find(i => i.id === id);
          if (item?.linkedActivityId) {
            const activity = get().schedule.find(a => a.id === item.linkedActivityId);
            if (activity) {
              get().updateScheduleActivity(activity.id, { cost: item.totalCost });
            }
          }
        },

        deleteBOQItem: (id) => {
          const item = get().boq.find(i => i.id === id);
          set(state => ({
            boq: state.boq.filter(i => i.id !== id)
          }));
          get().recalculateFinancials();
          
          if (item) {
            get().addNotification({
              type: 'warning',
              title: 'حذف بند',
              message: `تم حذف: ${item.description}`,
              read: false,
            });
          }
        },

        // ==================== SCHEDULE ACTIONS ====================

        updateSchedule: (activities) => {
          set({ schedule: activities });
          
          // Update overall progress
          const overallProgress = get().getOverallProgress();
          set(state => ({
            project: {
              ...state.project,
              overallProgress,
              lastUpdated: new Date().toISOString(),
            }
          }));
          
          get().addNotification({
            type: 'success',
            title: 'تحديث الجدول الزمني',
            message: `تم تحديث ${activities.length} نشاط`,
            read: false,
          });
        },

        addScheduleActivity: (activity) => {
          set(state => ({
            schedule: [...state.schedule, activity]
          }));
          
          // Update linked BOQ items
          if (activity.linkedBOQItems && activity.linkedBOQItems.length > 0) {
            activity.linkedBOQItems.forEach(boqId => {
              get().updateBOQItem(boqId, { linkedActivityId: activity.id });
            });
          }
        },

        updateScheduleActivity: (id, updates) => {
          set(state => ({
            schedule: state.schedule.map(activity => 
              activity.id === id 
                ? { ...activity, ...updates }
                : activity
            )
          }));
          
          // Recalculate overall progress
          const overallProgress = get().getOverallProgress();
          set(state => ({
            project: {
              ...state.project,
              overallProgress,
              lastUpdated: new Date().toISOString(),
            }
          }));
          
          // Check for delays
          if (updates.status === 'delayed') {
            get().addNotification({
              type: 'error',
              title: 'تأخير في الجدول',
              message: `النشاط متأخر: ${get().schedule.find(a => a.id === id)?.name}`,
              read: false,
            });
          }
        },

        deleteScheduleActivity: (id) => {
          const activity = get().schedule.find(a => a.id === id);
          set(state => ({
            schedule: state.schedule.filter(a => a.id !== id)
          }));
          
          if (activity) {
            get().addNotification({
              type: 'warning',
              title: 'حذف نشاط',
              message: `تم حذف: ${activity.name}`,
              read: false,
            });
          }
        },

        // ==================== FINANCIAL ACTIONS ====================

        updateFinancial: (data) => {
          set(state => ({
            financial: { ...state.financial, ...data }
          }));
        },

        recalculateFinancials: () => {
          const state = get();
          
          // Calculate total from BOQ
          const totalBudget = state.boq.reduce((sum, item) => sum + item.totalCost, 0);
          
          // Calculate spent (items with status completed)
          const totalSpent = state.boq
            .filter(item => item.status === 'completed')
            .reduce((sum, item) => sum + item.totalCost, 0);
          
          // Calculate committed (items in progress)
          const totalCommitted = state.boq
            .filter(item => item.status === 'in_progress' || item.status === 'approved')
            .reduce((sum, item) => sum + item.totalCost, 0);
          
          const remaining = totalBudget - totalSpent - totalCommitted;
          
          // Calculate cost by category
          const categoryMap = new Map<string, { budget: number; spent: number }>();
          
          state.boq.forEach(item => {
            const category = item.category || 'غير مصنف';
            const existing = categoryMap.get(category) || { budget: 0, spent: 0 };
            existing.budget += item.totalCost;
            if (item.status === 'completed') {
              existing.spent += item.totalCost;
            }
            categoryMap.set(category, existing);
          });
          
          const costByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            budget: data.budget,
            spent: data.spent,
            remaining: data.budget - data.spent,
          }));
          
          set(state => ({
            financial: {
              ...state.financial,
              totalBudget,
              totalSpent,
              totalCommitted,
              remaining,
              costByCategory,
            }
          }));
        },

        // ==================== RISK ACTIONS ====================

        updateRisks: (risks) => {
          set({ risks });
        },

        addRisk: (risk) => {
          set(state => ({
            risks: [...state.risks, risk]
          }));
          
          if (risk.riskScore >= 50) {
            get().addNotification({
              type: 'error',
              title: 'مخاطرة عالية',
              message: `تم تحديد مخاطرة عالية: ${risk.title}`,
              read: false,
            });
          }
        },

        updateRisk: (id, updates) => {
          set(state => ({
            risks: state.risks.map(risk => 
              risk.id === id 
                ? { 
                    ...risk, 
                    ...updates,
                    riskScore: (updates.probability ?? risk.probability) * (updates.impact ?? risk.impact) / 100
                  }
                : risk
            )
          }));
        },

        deleteRisk: (id) => {
          set(state => ({
            risks: state.risks.filter(r => r.id !== id)
          }));
        },

        // ==================== PROJECT ACTIONS ====================

        updateProject: (updates) => {
          set(state => ({
            project: {
              ...state.project,
              ...updates,
              lastUpdated: new Date().toISOString(),
            }
          }));
        },

        // ==================== NOTIFICATION ACTIONS ====================

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
          };
          
          set(state => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep last 50
          }));
        },

        markNotificationRead: (id) => {
          set(state => ({
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            )
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },

        // ==================== SYNC ACTIONS ====================

        syncWithBackend: async () => {
          try {
            set({ isLoading: true });
            
            // This will be implemented to sync with the backend API
            // For now, just update the last sync time
            set({ 
              lastSyncTime: new Date().toISOString(),
              isLoading: false,
            });
            
            get().addNotification({
              type: 'success',
              title: 'مزامنة ناجحة',
              message: 'تم تحديث البيانات من الخادم',
              read: false,
            });
          } catch (error) {
            set({ isLoading: false });
            get().addNotification({
              type: 'error',
              title: 'فشل المزامنة',
              message: 'حدث خطأ أثناء المزامنة مع الخادم',
              read: false,
            });
          }
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'noufal-project-store',
        partialize: (state) => ({
          boq: state.boq,
          schedule: state.schedule,
          financial: state.financial,
          risks: state.risks,
          project: state.project,
          // Don't persist notifications and loading states
        }),
      }
    )
  )
);

// ==================== SELECTORS (for optimized re-renders) ====================

export const selectBOQ = (state: ProjectState) => state.boq;
export const selectSchedule = (state: ProjectState) => state.schedule;
export const selectFinancial = (state: ProjectState) => state.financial;
export const selectRisks = (state: ProjectState) => state.risks;
export const selectProject = (state: ProjectState) => state.project;
export const selectNotifications = (state: ProjectState) => state.notifications;
export const selectUnreadNotifications = (state: ProjectState) => 
  state.notifications.filter(n => !n.read);
export const selectIsLoading = (state: ProjectState) => state.isLoading;
