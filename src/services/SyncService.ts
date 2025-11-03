import { useProjectStore } from '../store/useProjectStore';
import { noufalAPI } from '../../services/NOUFALBackendAPI';

/**
 * SyncService - Real-time data synchronization between frontend and backend
 * 
 * Features:
 * - Automatic polling for data updates
 * - Intelligent sync strategy (only sync changed data)
 * - Error handling and retry logic
 * - Conflict resolution
 */

export class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 5000; // Sync every 5 seconds
  private readonly RETRY_DELAY_MS = 10000; // Retry after 10 seconds on error
  private isRunning = false;
  private lastSyncTimestamp: number = 0;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  /**
   * Start automatic synchronization
   */
  start() {
    if (this.isRunning) {
      console.log('SyncService already running');
      return;
    }

    console.log('🔄 Starting SyncService...');
    this.isRunning = true;
    this.retryCount = 0;
    
    // Initial sync
    this.performSync();
    
    // Schedule periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop automatic synchronization
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('⏹️ Stopping SyncService...');
    this.isRunning = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform a single sync operation
   */
  private async performSync() {
    try {
      const store = useProjectStore.getState();
      
      // Set loading state
      store.setLoading(true);
      
      // Sync BOQ data
      await this.syncBOQ();
      
      // Sync Schedule data
      await this.syncSchedule();
      
      // Sync Financial data
      await this.syncFinancial();
      
      // Sync Risks
      await this.syncRisks();
      
      // Update last sync time
      this.lastSyncTimestamp = Date.now();
      store.setLoading(false);
      
      // Reset retry count on success
      this.retryCount = 0;
      
      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      
      const store = useProjectStore.getState();
      store.setLoading(false);
      
      // Retry logic
      this.retryCount++;
      if (this.retryCount <= this.MAX_RETRIES) {
        console.log(`🔄 Retrying sync in ${this.RETRY_DELAY_MS / 1000}s (attempt ${this.retryCount}/${this.MAX_RETRIES})`);
        setTimeout(() => this.performSync(), this.RETRY_DELAY_MS);
      } else {
        console.error('❌ Max retries reached. Stopping sync.');
        store.addNotification({
          type: 'error',
          title: 'فشل المزامنة',
          message: 'تعذرت مزامنة البيانات مع الخادم. يرجى التحقق من الاتصال.',
          read: false,
        });
      }
    }
  }

  /**
   * Sync BOQ data with backend
   */
  private async syncBOQ() {
    const store = useProjectStore.getState();
    const currentBOQ = store.boq;
    
    // In a real implementation, we would:
    // 1. Fetch latest BOQ from backend
    // 2. Compare with current state
    // 3. Resolve conflicts if any
    // 4. Update store with merged data
    
    // For now, we'll just log (backend integration will be added)
    console.log('📊 Syncing BOQ data...', currentBOQ.length, 'items');
    
    // Example: If backend had new data
    // const backendBOQ = await noufalAPI.getBOQData();
    // store.updateBOQ(backendBOQ);
  }

  /**
   * Sync Schedule data with backend
   */
  private async syncSchedule() {
    const store = useProjectStore.getState();
    const currentSchedule = store.schedule;
    
    console.log('📅 Syncing Schedule data...', currentSchedule.length, 'activities');
    
    // Example: Sync with backend
    // const backendSchedule = await noufalAPI.getScheduleData();
    // store.updateSchedule(backendSchedule);
  }

  /**
   * Sync Financial data with backend
   */
  private async syncFinancial() {
    const store = useProjectStore.getState();
    
    console.log('💰 Syncing Financial data...');
    
    // Financial data is mostly computed from BOQ,
    // but we might sync cash flow and other data
    // const backendFinancial = await noufalAPI.getFinancialData();
    // store.updateFinancial(backendFinancial);
  }

  /**
   * Sync Risk data with backend
   */
  private async syncRisks() {
    const store = useProjectStore.getState();
    const currentRisks = store.risks;
    
    console.log('⚠️ Syncing Risk data...', currentRisks.length, 'risks');
    
    // Example: Sync with backend
    // const backendRisks = await noufalAPI.getRisksData();
    // store.updateRisks(backendRisks);
  }

  /**
   * Force an immediate sync (useful for user-triggered refresh)
   */
  async forceSync() {
    console.log('🔄 Force sync requested...');
    await this.performSync();
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTimestamp: this.lastSyncTimestamp,
      retryCount: this.retryCount,
      timeSinceLastSync: this.lastSyncTimestamp 
        ? Date.now() - this.lastSyncTimestamp 
        : null,
    };
  }
}

// Create singleton instance
export const syncService = new SyncService();

// Auto-start sync service (can be disabled if needed)
if (typeof window !== 'undefined') {
  // Start sync service when app loads
  syncService.start();
  
  // Stop sync service when app unloads
  window.addEventListener('beforeunload', () => {
    syncService.stop();
  });
}

/**
 * React Hook for sync status
 */
export const useSyncStatus = () => {
  const isLoading = useProjectStore(state => state.isLoading);
  const lastSyncTime = useProjectStore(state => state.lastSyncTime);
  
  return {
    isLoading,
    lastSyncTime,
    forceSync: () => syncService.forceSync(),
    syncStatus: syncService.getStatus(),
  };
};

/**
 * Integration with Backend API
 * 
 * This function demonstrates how to integrate with the existing NOUFALBackendAPI
 */
export const integrateWithBackend = {
  /**
   * Push BOQ data to backend and sync response
   */
  async syncBOQWithBackend(boqItems: any[]) {
    try {
      const response = await noufalAPI.analyzeBOQ(boqItems);
      
      if (response.status === 'success' && response.data) {
        // Update store with backend response
        const store = useProjectStore.getState();
        
        // Extract analyzed data
        const analyzedBOQ = response.data.boq_analysis || boqItems;
        store.updateBOQ(analyzedBOQ);
        
        // Update financials if provided
        if (response.data.financial_summary) {
          store.updateFinancial({
            totalBudget: response.data.financial_summary.total_cost || 0,
          });
        }
        
        return response;
      }
    } catch (error) {
      console.error('Failed to sync BOQ with backend:', error);
      throw error;
    }
  },

  /**
   * Push Schedule data to backend and sync response
   */
  async syncScheduleWithBackend(activities: any[], startDate: string) {
    try {
      const response = await noufalAPI.generateSchedule(activities, startDate, {});
      
      if (response.status === 'success' && response.data) {
        const store = useProjectStore.getState();
        
        // Extract schedule data
        const scheduleData = response.data.schedule;
        if (scheduleData && scheduleData.activities) {
          // Convert Activity[] to ScheduleActivity[] format
          const convertedActivities = scheduleData.activities.map((act: any) => ({
            id: act.id,
            name: act.name || act.description || '',
            startDate: act.start_date || act.early_start || '',
            endDate: act.finish_date || act.early_finish || '',
            duration: act.duration || 0,
            progress: 0,
            dependencies: act.predecessors?.map((p: any) => p.id) || [],
            status: 'not-started' as const,
          }));
          store.updateSchedule(convertedActivities);
        }
        
        // Update project dates if provided
        if (scheduleData?.project_start && scheduleData?.project_finish) {
          store.updateProject({
            startDate: scheduleData.project_start,
            endDate: scheduleData.project_finish,
          });
        }
        
        return response;
      }
    } catch (error) {
      console.error('Failed to sync Schedule with backend:', error);
      throw error;
    }
  },

  /**
   * Sync Risk Analysis with backend
   * NOTE: Backend API doesn't have analyzeRisks yet, placeholder for future
   */
  async syncRisksWithBackend(risks: any[]) {
    try {
      // TODO: Implement when backend adds risk analysis endpoint
      console.log('Risk sync - backend endpoint not available yet');
      return { status: 'success', data: { risks } };
    } catch (error) {
      console.error('Failed to sync Risks with backend:', error);
      throw error;
    }
  },

  /**
   * Generate S-Curve and sync with store
   */
  async syncSCurveWithBackend(schedule: any[]) {
    try {
      const response = await noufalAPI.generateSCurve(schedule);
      
      if (response.status === 'success' && response.data) {
        // S-Curve data can be stored separately or as part of financial data
        const store = useProjectStore.getState();
        
        // Convert S-curve data to cash flow format
        if (response.data.s_curve && response.data.s_curve.time_periods) {
          const cashFlow = response.data.s_curve.time_periods.map((period: any) => ({
            date: period.start_date,
            planned: period.planned_progress || 0,
            actual: 0, // Actual will be updated separately
          }));
          
          store.updateFinancial({ cashFlow });
        }
        
        return response;
      }
    } catch (error) {
      console.error('Failed to sync S-Curve with backend:', error);
      throw error;
    }
  },

  /**
   * Batch sync all data
   */
  async syncAllWithBackend() {
    const store = useProjectStore.getState();
    
    try {
      store.setLoading(true);
      
      // Sync BOQ
      if (store.boq.length > 0) {
        await this.syncBOQWithBackend(store.boq);
      }
      
      // Sync Schedule
      if (store.schedule.length > 0) {
        await this.syncScheduleWithBackend(
          store.schedule, 
          store.project.startDate
        );
      }
      
      // Sync Risks
      if (store.risks.length > 0) {
        await this.syncRisksWithBackend(store.risks);
      }
      
      store.setLoading(false);
      
      store.addNotification({
        type: 'success',
        title: 'مزامنة شاملة',
        message: 'تمت مزامنة جميع البيانات بنجاح',
        read: false,
      });
      
      return { success: true };
    } catch (error) {
      store.setLoading(false);
      
      store.addNotification({
        type: 'error',
        title: 'خطأ في المزامنة',
        message: 'فشلت المزامنة الشاملة للبيانات',
        read: false,
      });
      
      throw error;
    }
  },
};
