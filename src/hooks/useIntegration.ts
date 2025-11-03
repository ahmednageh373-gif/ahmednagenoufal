import { useEffect, useCallback } from 'react';
import { useProjectStore, BOQItem, ScheduleActivity, RiskItem } from '../store/useProjectStore';
import { integrateWithBackend } from '../services/SyncService';

/**
 * Custom hooks for seamless integration between components
 */

// ==================== BOQ INTEGRATION ====================

/**
 * Hook for BOQ management with automatic financial updates
 */
export const useBOQIntegration = () => {
  const boq = useProjectStore(state => state.boq);
  const updateBOQ = useProjectStore(state => state.updateBOQ);
  const addBOQItem = useProjectStore(state => state.addBOQItem);
  const updateBOQItem = useProjectStore(state => state.updateBOQItem);
  const deleteBOQItem = useProjectStore(state => state.deleteBOQItem);
  const getTotalCost = useProjectStore(state => state.getTotalCost);
  
  // Sync with backend when BOQ changes
  const syncBOQ = useCallback(async (items: BOQItem[]) => {
    try {
      await integrateWithBackend.syncBOQWithBackend(items);
    } catch (error) {
      console.error('Failed to sync BOQ:', error);
    }
  }, []);
  
  return {
    boq,
    totalCost: getTotalCost(),
    addItem: addBOQItem,
    updateItem: updateBOQItem,
    deleteItem: deleteBOQItem,
    updateAll: updateBOQ,
    syncWithBackend: syncBOQ,
  };
};

// ==================== SCHEDULE INTEGRATION ====================

/**
 * Hook for Schedule management with automatic progress updates
 */
export const useScheduleIntegration = () => {
  const schedule = useProjectStore(state => state.schedule);
  const updateSchedule = useProjectStore(state => state.updateSchedule);
  const addActivity = useProjectStore(state => state.addScheduleActivity);
  const updateActivity = useProjectStore(state => state.updateScheduleActivity);
  const deleteActivity = useProjectStore(state => state.deleteScheduleActivity);
  const getOverallProgress = useProjectStore(state => state.getOverallProgress);
  const getCriticalPath = useProjectStore(state => state.getCriticalPath);
  const project = useProjectStore(state => state.project);
  
  // Sync with backend when schedule changes
  const syncSchedule = useCallback(async (activities: ScheduleActivity[]) => {
    try {
      await integrateWithBackend.syncScheduleWithBackend(activities, project.startDate);
    } catch (error) {
      console.error('Failed to sync Schedule:', error);
    }
  }, [project.startDate]);
  
  return {
    schedule,
    overallProgress: getOverallProgress(),
    criticalPath: getCriticalPath(),
    addActivity,
    updateActivity,
    deleteActivity,
    updateAll: updateSchedule,
    syncWithBackend: syncSchedule,
  };
};

// ==================== FINANCIAL INTEGRATION ====================

/**
 * Hook for Financial data with automatic calculations
 */
export const useFinancialIntegration = () => {
  const financial = useProjectStore(state => state.financial);
  const updateFinancial = useProjectStore(state => state.updateFinancial);
  const recalculateFinancials = useProjectStore(state => state.recalculateFinancials);
  const getBudgetVariance = useProjectStore(state => state.getBudgetVariance);
  const boq = useProjectStore(state => state.boq);
  
  // Auto-recalculate when BOQ changes
  useEffect(() => {
    recalculateFinancials();
  }, [boq, recalculateFinancials]);
  
  return {
    financial,
    budgetVariance: getBudgetVariance(),
    updateFinancial,
    recalculate: recalculateFinancials,
  };
};

// ==================== RISK INTEGRATION ====================

/**
 * Hook for Risk management with automatic alerts
 */
export const useRiskIntegration = () => {
  const risks = useProjectStore(state => state.risks);
  const updateRisks = useProjectStore(state => state.updateRisks);
  const addRisk = useProjectStore(state => state.addRisk);
  const updateRisk = useProjectStore(state => state.updateRisk);
  const deleteRisk = useProjectStore(state => state.deleteRisk);
  const getHighRisks = useProjectStore(state => state.getHighRisks);
  
  // Sync with backend when risks change
  const syncRisks = useCallback(async (riskItems: RiskItem[]) => {
    try {
      await integrateWithBackend.syncRisksWithBackend(riskItems);
    } catch (error) {
      console.error('Failed to sync Risks:', error);
    }
  }, []);
  
  return {
    risks,
    highRisks: getHighRisks(),
    addRisk,
    updateRisk,
    deleteRisk,
    updateAll: updateRisks,
    syncWithBackend: syncRisks,
  };
};

// ==================== PROJECT INTEGRATION ====================

/**
 * Hook for Project metadata with all computed values
 */
export const useProjectIntegration = () => {
  const project = useProjectStore(state => state.project);
  const updateProject = useProjectStore(state => state.updateProject);
  const getTotalCost = useProjectStore(state => state.getTotalCost);
  const getOverallProgress = useProjectStore(state => state.getOverallProgress);
  const getBudgetVariance = useProjectStore(state => state.getBudgetVariance);
  const getScheduleVariance = useProjectStore(state => state.getScheduleVariance);
  const getHighRisks = useProjectStore(state => state.getHighRisks);
  
  return {
    project,
    totalCost: getTotalCost(),
    overallProgress: getOverallProgress(),
    budgetVariance: getBudgetVariance(),
    scheduleVariance: getScheduleVariance(),
    highRisksCount: getHighRisks().length,
    updateProject,
  };
};

// ==================== NOTIFICATIONS INTEGRATION ====================

/**
 * Hook for Notifications management
 */
export const useNotifications = () => {
  const notifications = useProjectStore(state => state.notifications);
  const addNotification = useProjectStore(state => state.addNotification);
  const markNotificationRead = useProjectStore(state => state.markNotificationRead);
  const clearNotifications = useProjectStore(state => state.clearNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markRead: markNotificationRead,
    clearAll: clearNotifications,
  };
};

// ==================== CROSS-PAGE DATA FLOW ====================

/**
 * Hook for monitoring data changes across the application
 * Use this to trigger side effects when specific data changes
 */
export const useDataChangeListener = (
  onChange: {
    onBOQChange?: (boq: BOQItem[]) => void;
    onScheduleChange?: (schedule: ScheduleActivity[]) => void;
    onFinancialChange?: (financial: any) => void;
    onRiskChange?: (risks: RiskItem[]) => void;
  }
) => {
  const boq = useProjectStore(state => state.boq);
  const schedule = useProjectStore(state => state.schedule);
  const financial = useProjectStore(state => state.financial);
  const risks = useProjectStore(state => state.risks);
  
  useEffect(() => {
    onChange.onBOQChange?.(boq);
  }, [boq, onChange.onBOQChange]);
  
  useEffect(() => {
    onChange.onScheduleChange?.(schedule);
  }, [schedule, onChange.onScheduleChange]);
  
  useEffect(() => {
    onChange.onFinancialChange?.(financial);
  }, [financial, onChange.onFinancialChange]);
  
  useEffect(() => {
    onChange.onRiskChange?.(risks);
  }, [risks, onChange.onRiskChange]);
};

// ==================== LOADING STATE ====================

/**
 * Hook for application-wide loading state
 */
export const useLoadingState = () => {
  const isLoading = useProjectStore(state => state.isLoading);
  const setLoading = useProjectStore(state => state.setLoading);
  
  return {
    isLoading,
    setLoading,
  };
};

// ==================== SYNC MANAGEMENT ====================

/**
 * Hook for manual sync control
 */
export const useSyncControl = () => {
  const syncWithBackend = useProjectStore(state => state.syncWithBackend);
  const lastSyncTime = useProjectStore(state => state.lastSyncTime);
  
  const syncAll = useCallback(async () => {
    try {
      await integrateWithBackend.syncAllWithBackend();
    } catch (error) {
      console.error('Failed to sync all data:', error);
    }
  }, []);
  
  return {
    syncWithBackend,
    syncAll,
    lastSyncTime,
  };
};

// ==================== GANTT CHART INTEGRATION ====================

/**
 * Hook specifically for Gantt chart data with auto-updates
 */
export const useGanttIntegration = () => {
  const schedule = useProjectStore(state => state.schedule);
  const project = useProjectStore(state => state.project);
  
  // Transform schedule data to Gantt-compatible format
  const ganttData = schedule.map(activity => ({
    id: activity.id,
    name: activity.name,
    start: new Date(activity.startDate),
    end: new Date(activity.endDate),
    progress: activity.progress,
    dependencies: activity.dependencies,
    type: activity.isCriticalPath ? 'critical' : 'normal',
    status: activity.status,
  }));
  
  return {
    ganttData,
    projectStart: new Date(project.startDate),
    projectEnd: new Date(project.endDate),
    overallProgress: project.overallProgress,
  };
};

// ==================== S-CURVE INTEGRATION ====================

/**
 * Hook for S-Curve data with financial integration
 */
export const useSCurveIntegration = () => {
  const financial = useProjectStore(state => state.financial);
  const schedule = useProjectStore(state => state.schedule);
  
  // Generate S-Curve from backend
  const generateSCurve = useCallback(async () => {
    try {
      await integrateWithBackend.syncSCurveWithBackend(schedule);
    } catch (error) {
      console.error('Failed to generate S-Curve:', error);
    }
  }, [schedule]);
  
  return {
    cashFlow: financial.cashFlow,
    generateSCurve,
  };
};

// ==================== DASHBOARD INTEGRATION ====================

/**
 * Hook for Dashboard with all aggregated data
 */
export const useDashboardIntegration = () => {
  const project = useProjectStore(state => state.project);
  const getTotalCost = useProjectStore(state => state.getTotalCost);
  const getOverallProgress = useProjectStore(state => state.getOverallProgress);
  const getBudgetVariance = useProjectStore(state => state.getBudgetVariance);
  const getScheduleVariance = useProjectStore(state => state.getScheduleVariance);
  const getHighRisks = useProjectStore(state => state.getHighRisks);
  const financial = useProjectStore(state => state.financial);
  const schedule = useProjectStore(state => state.schedule);
  const boq = useProjectStore(state => state.boq);
  
  return {
    project,
    stats: {
      totalCost: getTotalCost(),
      overallProgress: getOverallProgress(),
      budgetVariance: getBudgetVariance(),
      scheduleVariance: getScheduleVariance(),
      highRisksCount: getHighRisks().length,
      totalActivities: schedule.length,
      completedActivities: schedule.filter(a => a.status === 'completed').length,
      totalBOQItems: boq.length,
      completedBOQItems: boq.filter(b => b.status === 'completed').length,
    },
    financial,
    schedule,
    risks: getHighRisks(),
  };
};
