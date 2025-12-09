/**
 * TanStack Query Client Configuration
 * Centralized configuration for React Query
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      
      // Cache time: how long inactive data stays in cache (10 minutes)
      gcTime: 10 * 60 * 1000, // Previously 'cacheTime' in v4
      
      // Retry failed requests 3 times
      retry: (failureCount, error: any) => {
        // Don't retry on 404 errors
        if (error?.response?.status === 404) return false;
        // Retry up to 3 times
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount if data is stale
      refetchOnMount: true,
      
      // Enable network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Global mutation error handler
      onError: (error: any) => {
        console.error('❌ Mutation error:', error);
        
        // You can add notification here
        // Example: toast.error(error.message);
      },
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

/**
 * Query Keys Factory
 * Centralized query keys to avoid typos and ensure consistency
 */
export const queryKeys = {
  // Project keys
  project: (projectId: string) => ['project', projectId] as const,
  projects: () => ['projects'] as const,
  
  // BOQ keys
  boq: (projectId: string) => ['boq', projectId] as const,
  boqItem: (projectId: string, itemId: string) => ['boq', projectId, itemId] as const,
  
  // Schedule keys
  schedule: (projectId: string) => ['schedule', projectId] as const,
  scheduleActivity: (projectId: string, activityId: string) => 
    ['schedule', projectId, activityId] as const,
  criticalPath: (projectId: string) => ['schedule', projectId, 'critical-path'] as const,
  
  // Financial keys
  financial: (projectId: string) => ['financial', projectId] as const,
  cashFlow: (projectId: string) => ['financial', projectId, 'cash-flow'] as const,
  costByCategory: (projectId: string) => ['financial', projectId, 'cost-by-category'] as const,
  
  // Risk keys
  risks: (projectId: string) => ['risks', projectId] as const,
  risk: (projectId: string, riskId: string) => ['risks', projectId, riskId] as const,
  highRisks: (projectId: string) => ['risks', projectId, 'high'] as const,
  
  // AI Processing keys
  aiProcess: (processId: string) => ['ai-process', processId] as const,
  
  // Notification keys
  notifications: () => ['notifications'] as const,
  unreadNotifications: () => ['notifications', 'unread'] as const,
} as const;

/**
 * Error handler for API calls
 */
export function handleQueryError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'حدث خطأ غير متوقع';
}

/**
 * Success handler for mutations
 */
export function handleMutationSuccess(message: string = 'تمت العملية بنجاح') {
  console.log('✅', message);
  // You can add notification here
  // Example: toast.success(message);
}
