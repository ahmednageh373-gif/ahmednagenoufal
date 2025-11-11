/**
 * Custom Hooks for Easy Access to Project Store
 * Simplifies component code and improves performance with selectors
 */

import { useProjectStore } from '../store/useProjectStore';
import type { BOQItem, ScheduleActivity, RiskItem } from '../store/useProjectStore';

// ==================== BOQ HOOKS ====================

/**
 * Get all BOQ items
 */
export function useBOQData() {
  return useProjectStore(state => state.boq);
}

/**
 * Get BOQ actions (CRUD operations)
 */
export function useBOQActions() {
  return {
    updateBOQ: useProjectStore(state => state.updateBOQ),
    addItem: useProjectStore(state => state.addBOQItem),
    updateItem: useProjectStore(state => state.updateBOQItem),
    deleteItem: useProjectStore(state => state.deleteBOQItem),
  };
}

/**
 * Get a single BOQ item by ID
 */
export function useBOQItem(itemId: string) {
  return useProjectStore(state => 
    state.boq.find(item => item.id === itemId)
  );
}

/**
 * Get BOQ items by category
 */
export function useBOQByCategory(category: string) {
  return useProjectStore(state => 
    state.boq.filter(item => item.category === category)
  );
}

/**
 * Get BOQ items by status
 */
export function useBOQByStatus(status: BOQItem['status']) {
  return useProjectStore(state => 
    state.boq.filter(item => item.status === status)
  );
}

/**
 * Get BOQ statistics
 */
export function useBOQStats() {
  return useProjectStore(state => {
    const total = state.boq.length;
    const completed = state.boq.filter(item => item.status === 'completed').length;
    const inProgress = state.boq.filter(item => item.status === 'in_progress').length;
    const pending = state.boq.filter(item => item.status === 'pending').length;
    const totalCost = state.getTotalCost();
    
    return {
      total,
      completed,
      inProgress,
      pending,
      totalCost,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  });
}

// ==================== SCHEDULE HOOKS ====================

/**
 * Get all schedule activities
 */
export function useScheduleData() {
  return useProjectStore(state => state.schedule);
}

/**
 * Get schedule actions (CRUD operations)
 */
export function useScheduleActions() {
  return {
    updateSchedule: useProjectStore(state => state.updateSchedule),
    addActivity: useProjectStore(state => state.addScheduleActivity),
    updateActivity: useProjectStore(state => state.updateScheduleActivity),
    deleteActivity: useProjectStore(state => state.deleteScheduleActivity),
  };
}

/**
 * Get a single schedule activity by ID
 */
export function useScheduleActivity(activityId: string) {
  return useProjectStore(state => 
    state.schedule.find(activity => activity.id === activityId)
  );
}

/**
 * Get critical path activities
 */
export function useCriticalPath() {
  return useProjectStore(state => state.getCriticalPath());
}

/**
 * Get activities by status
 */
export function useActivitiesByStatus(status: ScheduleActivity['status']) {
  return useProjectStore(state => 
    state.schedule.filter(activity => activity.status === status)
  );
}

/**
 * Get delayed activities
 */
export function useDelayedActivities() {
  return useProjectStore(state => {
    const now = new Date().getTime();
    return state.schedule.filter(activity => {
      if (activity.status === 'completed') return false;
      const endDate = new Date(activity.endDate).getTime();
      return endDate < now;
    });
  });
}

/**
 * Get schedule statistics
 */
export function useScheduleStats() {
  return useProjectStore(state => {
    const total = state.schedule.length;
    const completed = state.schedule.filter(a => a.status === 'completed').length;
    const inProgress = state.schedule.filter(a => a.status === 'in-progress').length;
    const notStarted = state.schedule.filter(a => a.status === 'not-started').length;
    const delayed = state.schedule.filter(a => a.status === 'delayed').length;
    const overallProgress = state.getOverallProgress();
    const scheduleVariance = state.getScheduleVariance();
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      delayed,
      overallProgress,
      scheduleVariance,
      onTimeRate: total > 0 ? ((total - delayed) / total) * 100 : 100,
    };
  });
}

// ==================== FINANCIAL HOOKS ====================

/**
 * Get all financial data
 */
export function useFinancialData() {
  return useProjectStore(state => state.financial);
}

/**
 * Get financial actions
 */
export function useFinancialActions() {
  return {
    updateFinancial: useProjectStore(state => state.updateFinancial),
    recalculate: useProjectStore(state => state.recalculateFinancials),
  };
}

/**
 * Get financial metrics
 */
export function useFinancialMetrics() {
  return useProjectStore(state => ({
    totalCost: state.getTotalCost(),
    totalBudget: state.financial.totalBudget,
    totalSpent: state.financial.totalSpent,
    totalCommitted: state.financial.totalCommitted,
    remaining: state.financial.remaining,
    contingency: state.financial.contingency,
    budgetVariance: state.getBudgetVariance(),
    spendRate: state.financial.totalBudget > 0 
      ? (state.financial.totalSpent / state.financial.totalBudget) * 100 
      : 0,
    commitmentRate: state.financial.totalBudget > 0 
      ? (state.financial.totalCommitted / state.financial.totalBudget) * 100 
      : 0,
  }));
}

/**
 * Get cash flow data
 */
export function useCashFlow() {
  return useProjectStore(state => state.financial.cashFlow);
}

/**
 * Get cost by category
 */
export function useCostByCategory() {
  return useProjectStore(state => state.financial.costByCategory);
}

// ==================== RISK HOOKS ====================

/**
 * Get all risks
 */
export function useRisks() {
  return useProjectStore(state => state.risks);
}

/**
 * Get risk actions (CRUD operations)
 */
export function useRiskActions() {
  return {
    updateRisks: useProjectStore(state => state.updateRisks),
    addRisk: useProjectStore(state => state.addRisk),
    updateRisk: useProjectStore(state => state.updateRisk),
    deleteRisk: useProjectStore(state => state.deleteRisk),
  };
}

/**
 * Get a single risk by ID
 */
export function useRisk(riskId: string) {
  return useProjectStore(state => 
    state.risks.find(risk => risk.id === riskId)
  );
}

/**
 * Get high-priority risks (risk score >= 50)
 */
export function useHighRisks() {
  return useProjectStore(state => state.getHighRisks());
}

/**
 * Get risks by category
 */
export function useRisksByCategory(category: RiskItem['category']) {
  return useProjectStore(state => 
    state.risks.filter(risk => risk.category === category)
  );
}

/**
 * Get risks by status
 */
export function useRisksByStatus(status: RiskItem['status']) {
  return useProjectStore(state => 
    state.risks.filter(risk => risk.status === status)
  );
}

/**
 * Get risk statistics
 */
export function useRiskStats() {
  return useProjectStore(state => {
    const total = state.risks.length;
    const highRisks = state.getHighRisks().length;
    const mediumRisks = state.risks.filter(r => r.riskScore >= 25 && r.riskScore < 50).length;
    const lowRisks = state.risks.filter(r => r.riskScore < 25).length;
    const mitigating = state.risks.filter(r => r.status === 'mitigating').length;
    const closed = state.risks.filter(r => r.status === 'closed').length;
    
    const averageRiskScore = total > 0
      ? state.risks.reduce((sum, risk) => sum + risk.riskScore, 0) / total
      : 0;
    
    return {
      total,
      highRisks,
      mediumRisks,
      lowRisks,
      mitigating,
      closed,
      averageRiskScore,
      mitigationRate: total > 0 ? (closed / total) * 100 : 0,
    };
  });
}

// ==================== PROJECT HOOKS ====================

/**
 * Get project metadata
 */
export function useProjectMetadata() {
  return useProjectStore(state => state.project);
}

/**
 * Get project actions
 */
export function useProjectActions() {
  return {
    updateProject: useProjectStore(state => state.updateProject),
  };
}

/**
 * Get overall project progress
 */
export function useProjectProgress() {
  return useProjectStore(state => state.getOverallProgress());
}

/**
 * Get project health metrics
 */
export function useProjectHealth() {
  return useProjectStore(state => {
    const scheduleVariance = state.getScheduleVariance();
    const budgetVariance = state.getBudgetVariance();
    const highRisks = state.getHighRisks().length;
    const overallProgress = state.getOverallProgress();
    
    // Calculate health score (0-100)
    let healthScore = 100;
    
    // Deduct for schedule delays (max -30)
    if (scheduleVariance > 0) {
      healthScore -= Math.min(30, scheduleVariance * 2);
    }
    
    // Deduct for budget overruns (max -30)
    if (budgetVariance < 0) {
      const overrunPercentage = (Math.abs(budgetVariance) / state.financial.totalBudget) * 100;
      healthScore -= Math.min(30, overrunPercentage);
    }
    
    // Deduct for high risks (max -20)
    healthScore -= Math.min(20, highRisks * 5);
    
    // Bonus for good progress (max +10)
    if (overallProgress > 80) {
      healthScore += 10;
    }
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    return {
      score: Math.round(healthScore),
      status: healthScore >= 80 ? 'excellent' : 
              healthScore >= 60 ? 'good' : 
              healthScore >= 40 ? 'fair' : 'poor',
      factors: {
        scheduleVariance,
        budgetVariance,
        highRisks,
        overallProgress,
      },
    };
  });
}

// ==================== NOTIFICATION HOOKS ====================

/**
 * Get all notifications
 */
export function useNotifications() {
  return useProjectStore(state => state.notifications);
}

/**
 * Get unread notifications
 */
export function useUnreadNotifications() {
  return useProjectStore(state => 
    state.notifications.filter(n => !n.read)
  );
}

/**
 * Get notification count
 */
export function useNotificationCount() {
  return useProjectStore(state => ({
    total: state.notifications.length,
    unread: state.notifications.filter(n => !n.read).length,
  }));
}

/**
 * Get notification actions
 */
export function useNotificationActions() {
  return {
    add: useProjectStore(state => state.addNotification),
    markRead: useProjectStore(state => state.markNotificationRead),
    clear: useProjectStore(state => state.clearNotifications),
  };
}

// ==================== LOADING & SYNC HOOKS ====================

/**
 * Get loading state
 */
export function useIsLoading() {
  return useProjectStore(state => state.isLoading);
}

/**
 * Get sync actions and status
 */
export function useSync() {
  return {
    syncWithBackend: useProjectStore(state => state.syncWithBackend),
    lastSyncTime: useProjectStore(state => state.lastSyncTime),
    isLoading: useProjectStore(state => state.isLoading),
    setLoading: useProjectStore(state => state.setLoading),
  };
}

// ==================== COMBINED HOOKS ====================

/**
 * Get complete project overview
 */
export function useProjectOverview() {
  return {
    metadata: useProjectMetadata(),
    progress: useProjectProgress(),
    health: useProjectHealth(),
    boqStats: useBOQStats(),
    scheduleStats: useScheduleStats(),
    financialMetrics: useFinancialMetrics(),
    riskStats: useRiskStats(),
    notificationCount: useNotificationCount(),
  };
}

/**
 * Get all project data (for complete sync)
 */
export function useProjectData() {
  return {
    project: useProjectMetadata(),
    boq: useBOQData(),
    schedule: useScheduleData(),
    financial: useFinancialData(),
    risks: useRisks(),
    notifications: useNotifications(),
  };
}

/**
 * Get all project actions (for complete control)
 */
export function useProjectAllActions() {
  return {
    boq: useBOQActions(),
    schedule: useScheduleActions(),
    financial: useFinancialActions(),
    risk: useRiskActions(),
    project: useProjectActions(),
    notification: useNotificationActions(),
    sync: useSync(),
  };
}
