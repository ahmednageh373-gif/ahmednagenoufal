/**
 * React Query Hooks for Project Data
 * Integrates TanStack Query with Zustand Store
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjectStore } from '../store/useProjectStore';
import { queryKeys, handleQueryError, handleMutationSuccess } from '../store/queryClient';
import type { 
  BOQItem, 
  ScheduleActivity, 
  ProjectMetadata,
  FinancialData,
  RiskItem 
} from '../store/useProjectStore';

// ==================== API FUNCTIONS ====================
// These will be implemented with your actual backend

const api = {
  /**
   * Project API
   */
  fetchProject: async (projectId: string): Promise<ProjectMetadata> => {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/projects/${projectId}`);
    if (!response.ok) throw new Error('فشل في تحميل بيانات المشروع');
    return response.json();
  },
  
  updateProject: async (projectId: string, data: Partial<ProjectMetadata>): Promise<ProjectMetadata> => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('فشل في تحديث المشروع');
    return response.json();
  },

  /**
   * BOQ API
   */
  fetchBOQ: async (projectId: string): Promise<BOQItem[]> => {
    const response = await fetch(`/api/projects/${projectId}/boq`);
    if (!response.ok) throw new Error('فشل في تحميل المقايسة');
    return response.json();
  },
  
  updateBOQ: async (projectId: string, items: BOQItem[]): Promise<BOQItem[]> => {
    const response = await fetch(`/api/projects/${projectId}/boq`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    if (!response.ok) throw new Error('فشل في تحديث المقايسة');
    return response.json();
  },
  
  addBOQItem: async (projectId: string, item: BOQItem): Promise<BOQItem> => {
    const response = await fetch(`/api/projects/${projectId}/boq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('فشل في إضافة البند');
    return response.json();
  },
  
  updateBOQItem: async (projectId: string, itemId: string, updates: Partial<BOQItem>): Promise<BOQItem> => {
    const response = await fetch(`/api/projects/${projectId}/boq/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('فشل في تحديث البند');
    return response.json();
  },
  
  deleteBOQItem: async (projectId: string, itemId: string): Promise<void> => {
    const response = await fetch(`/api/projects/${projectId}/boq/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('فشل في حذف البند');
  },

  /**
   * Schedule API
   */
  fetchSchedule: async (projectId: string): Promise<ScheduleActivity[]> => {
    const response = await fetch(`/api/projects/${projectId}/schedule`);
    if (!response.ok) throw new Error('فشل في تحميل الجدول الزمني');
    return response.json();
  },
  
  updateSchedule: async (projectId: string, activities: ScheduleActivity[]): Promise<ScheduleActivity[]> => {
    const response = await fetch(`/api/projects/${projectId}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activities),
    });
    if (!response.ok) throw new Error('فشل في تحديث الجدول الزمني');
    return response.json();
  },
  
  addScheduleActivity: async (projectId: string, activity: ScheduleActivity): Promise<ScheduleActivity> => {
    const response = await fetch(`/api/projects/${projectId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!response.ok) throw new Error('فشل في إضافة النشاط');
    return response.json();
  },
  
  fetchCriticalPath: async (projectId: string): Promise<ScheduleActivity[]> => {
    const response = await fetch(`/api/projects/${projectId}/schedule/critical-path`);
    if (!response.ok) throw new Error('فشل في تحميل المسار الحرج');
    return response.json();
  },

  /**
   * Financial API
   */
  fetchFinancial: async (projectId: string): Promise<FinancialData> => {
    const response = await fetch(`/api/projects/${projectId}/financial`);
    if (!response.ok) throw new Error('فشل في تحميل البيانات المالية');
    return response.json();
  },

  /**
   * Risk API
   */
  fetchRisks: async (projectId: string): Promise<RiskItem[]> => {
    const response = await fetch(`/api/projects/${projectId}/risks`);
    if (!response.ok) throw new Error('فشل في تحميل المخاطر');
    return response.json();
  },
  
  addRisk: async (projectId: string, risk: RiskItem): Promise<RiskItem> => {
    const response = await fetch(`/api/projects/${projectId}/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error('فشل في إضافة المخاطرة');
    return response.json();
  },
};

// ==================== PROJECT HOOKS ====================

/**
 * Hook to fetch and sync project data
 */
export function useProject(projectId: string, options?: { enabled?: boolean }) {
  const updateProject = useProjectStore(state => state.updateProject);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.fetchProject(projectId),
    enabled: options?.enabled !== false,
    onSuccess: (data) => {
      updateProject(data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'خطأ في تحميل المشروع',
        message: handleQueryError(error),
        read: false,
      });
    },
  });
}

/**
 * Hook to update project metadata
 */
export function useProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  const updateProject = useProjectStore(state => state.updateProject);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useMutation({
    mutationFn: (updates: Partial<ProjectMetadata>) => 
      api.updateProject(projectId, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.project(projectId) });
      
      const previous = queryClient.getQueryData<ProjectMetadata>(queryKeys.project(projectId));
      
      if (previous) {
        queryClient.setQueryData<ProjectMetadata>(
          queryKeys.project(projectId),
          { ...previous, ...updates }
        );
      }
      
      // Optimistically update store
      updateProject(updates);
      
      return { previous };
    },
    onError: (error: any, _updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.project(projectId), context.previous);
        updateProject(context.previous);
      }
      
      addNotification({
        type: 'error',
        title: 'فشل التحديث',
        message: handleQueryError(error),
        read: false,
      });
    },
    onSuccess: () => {
      handleMutationSuccess('تم تحديث المشروع بنجاح');
      addNotification({
        type: 'success',
        title: 'نجح التحديث',
        message: 'تم تحديث بيانات المشروع',
        read: false,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
    },
  });
}

// ==================== BOQ HOOKS ====================

/**
 * Hook to fetch and sync BOQ data
 */
export function useBOQ(projectId: string, options?: { enabled?: boolean }) {
  const updateBOQ = useProjectStore(state => state.updateBOQ);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useQuery({
    queryKey: queryKeys.boq(projectId),
    queryFn: () => api.fetchBOQ(projectId),
    enabled: options?.enabled !== false,
    onSuccess: (data) => {
      updateBOQ(data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'خطأ في تحميل المقايسة',
        message: handleQueryError(error),
        read: false,
      });
    },
  });
}

/**
 * Hook to update entire BOQ
 */
export function useBOQMutation(projectId: string) {
  const queryClient = useQueryClient();
  const updateBOQ = useProjectStore(state => state.updateBOQ);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useMutation({
    mutationFn: (items: BOQItem[]) => api.updateBOQ(projectId, items),
    onMutate: async (newItems) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boq(projectId) });
      
      const previousBOQ = queryClient.getQueryData<BOQItem[]>(queryKeys.boq(projectId));
      
      // Optimistic update
      queryClient.setQueryData<BOQItem[]>(queryKeys.boq(projectId), newItems);
      updateBOQ(newItems);
      
      return { previousBOQ };
    },
    onError: (error: any, _newItems, context) => {
      if (context?.previousBOQ) {
        queryClient.setQueryData(queryKeys.boq(projectId), context.previousBOQ);
        updateBOQ(context.previousBOQ);
      }
      
      addNotification({
        type: 'error',
        title: 'فشل تحديث المقايسة',
        message: handleQueryError(error),
        read: false,
      });
    },
    onSuccess: () => {
      handleMutationSuccess('تم تحديث المقايسة بنجاح');
      addNotification({
        type: 'success',
        title: 'نجح التحديث',
        message: 'تم تحديث المقايسة',
        read: false,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boq(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.financial(projectId) });
    },
  });
}

/**
 * Hook to add new BOQ item
 */
export function useAddBOQItem(projectId: string) {
  const queryClient = useQueryClient();
  const addBOQItem = useProjectStore(state => state.addBOQItem);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useMutation({
    mutationFn: (item: BOQItem) => api.addBOQItem(projectId, item),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boq(projectId) });
      
      const previous = queryClient.getQueryData<BOQItem[]>(queryKeys.boq(projectId));
      
      if (previous) {
        queryClient.setQueryData<BOQItem[]>(
          queryKeys.boq(projectId),
          [...previous, newItem]
        );
      }
      
      addBOQItem(newItem);
      
      return { previous };
    },
    onError: (error: any, _item, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.boq(projectId), context.previous);
      }
      
      addNotification({
        type: 'error',
        title: 'فشلت الإضافة',
        message: handleQueryError(error),
        read: false,
      });
    },
    onSuccess: (data) => {
      handleMutationSuccess('تمت إضافة البند بنجاح');
      addNotification({
        type: 'success',
        title: 'تمت الإضافة',
        message: `تمت إضافة: ${data.description}`,
        read: false,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boq(projectId) });
    },
  });
}

// ==================== SCHEDULE HOOKS ====================

/**
 * Hook to fetch and sync schedule data
 */
export function useSchedule(projectId: string, options?: { enabled?: boolean }) {
  const updateSchedule = useProjectStore(state => state.updateSchedule);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useQuery({
    queryKey: queryKeys.schedule(projectId),
    queryFn: () => api.fetchSchedule(projectId),
    enabled: options?.enabled !== false,
    onSuccess: (data) => {
      updateSchedule(data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'خطأ في تحميل الجدول الزمني',
        message: handleQueryError(error),
        read: false,
      });
    },
  });
}

/**
 * Hook to fetch critical path
 */
export function useCriticalPath(projectId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.criticalPath(projectId),
    queryFn: () => api.fetchCriticalPath(projectId),
    enabled: options?.enabled !== false,
  });
}

// ==================== FINANCIAL HOOKS ====================

/**
 * Hook to fetch financial data
 */
export function useFinancial(projectId: string, options?: { enabled?: boolean }) {
  const updateFinancial = useProjectStore(state => state.updateFinancial);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useQuery({
    queryKey: queryKeys.financial(projectId),
    queryFn: () => api.fetchFinancial(projectId),
    enabled: options?.enabled !== false,
    onSuccess: (data) => {
      updateFinancial(data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'خطأ في تحميل البيانات المالية',
        message: handleQueryError(error),
        read: false,
      });
    },
  });
}

// ==================== RISK HOOKS ====================

/**
 * Hook to fetch risks
 */
export function useRisks(projectId: string, options?: { enabled?: boolean }) {
  const updateRisks = useProjectStore(state => state.updateRisks);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useQuery({
    queryKey: queryKeys.risks(projectId),
    queryFn: () => api.fetchRisks(projectId),
    enabled: options?.enabled !== false,
    onSuccess: (data) => {
      updateRisks(data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'خطأ في تحميل المخاطر',
        message: handleQueryError(error),
        read: false,
      });
    },
  });
}

/**
 * Hook to add new risk
 */
export function useAddRisk(projectId: string) {
  const queryClient = useQueryClient();
  const addRisk = useProjectStore(state => state.addRisk);
  const addNotification = useProjectStore(state => state.addNotification);
  
  return useMutation({
    mutationFn: (risk: RiskItem) => api.addRisk(projectId, risk),
    onMutate: async (newRisk) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.risks(projectId) });
      
      const previous = queryClient.getQueryData<RiskItem[]>(queryKeys.risks(projectId));
      
      if (previous) {
        queryClient.setQueryData<RiskItem[]>(
          queryKeys.risks(projectId),
          [...previous, newRisk]
        );
      }
      
      addRisk(newRisk);
      
      return { previous };
    },
    onError: (error: any, _risk, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.risks(projectId), context.previous);
      }
      
      addNotification({
        type: 'error',
        title: 'فشلت الإضافة',
        message: handleQueryError(error),
        read: false,
      });
    },
    onSuccess: (data) => {
      handleMutationSuccess('تمت إضافة المخاطرة بنجاح');
      addNotification({
        type: data.riskScore >= 50 ? 'warning' : 'success',
        title: 'تمت الإضافة',
        message: `تمت إضافة مخاطرة: ${data.title}`,
        read: false,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.risks(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.highRisks(projectId) });
    },
  });
}
