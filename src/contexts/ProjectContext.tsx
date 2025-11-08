/**
 * Project Context - نظام موحد لإدارة بيانات المشروع الكامل
 * Single Source of Truth for All Project Data
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IntegratedBOQItem } from '../types/integrated/IntegratedBOQ';
import { IntegratedScheduleTask } from '../types/integrated/IntegratedSchedule';
import { IntegrationService } from '../services/integration/IntegrationService';

interface ProjectContextData {
  // Project Basic Info
  projectId: string;
  projectName: string;
  
  // Integrated Data - المصدر الموحد للبيانات
  boqItems: IntegratedBOQItem[];
  scheduleTasks: IntegratedScheduleTask[];
  
  // Financial Summary
  financialSummary: {
    totalEstimated: number;
    totalActual: number;
    variance: number;
    variancePercentage: number;
  };
  
  // Schedule Summary
  scheduleSummary: {
    totalDuration: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
  };
  
  // Actions - الإجراءات الموحدة
  addBOQItem: (item: IntegratedBOQItem) => void;
  updateBOQItem: (itemId: string, updates: Partial<IntegratedBOQItem>) => void;
  deleteBOQItem: (itemId: string) => void;
  
  addScheduleTask: (task: IntegratedScheduleTask) => void;
  updateScheduleTask: (taskId: string, updates: Partial<IntegratedScheduleTask>) => void;
  deleteScheduleTask: (taskId: string) => void;
  
  updateProgress: (taskId: string, progress: number, completedQuantity: number) => void;
  syncAllData: () => Promise<void>;
  
  // Real-time sync status
  lastSyncDate: Date | null;
  isSyncing: boolean;
}

const ProjectContext = createContext<ProjectContextData | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage on mount
  const [boqItems, setBOQItems] = useState<IntegratedBOQItem[]>(() => {
    const saved = localStorage.getItem('INTEGRATED_BOQ_ITEMS');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [scheduleTasks, setScheduleTasks] = useState<IntegratedScheduleTask[]>(() => {
    const saved = localStorage.getItem('INTEGRATED_SCHEDULE_TASKS');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('INTEGRATED_BOQ_ITEMS', JSON.stringify(boqItems));
  }, [boqItems]);
  
  useEffect(() => {
    localStorage.setItem('INTEGRATED_SCHEDULE_TASKS', JSON.stringify(scheduleTasks));
  }, [scheduleTasks]);
  
  // Calculate Financial Summary
  const financialSummary = React.useMemo(() => {
    const totalEstimated = boqItems.reduce((sum, item) => 
      sum + item.financialIntegration.comparison.estimated.totalCost, 0
    );
    const totalActual = boqItems.reduce((sum, item) => 
      sum + item.financialIntegration.comparison.actual.totalCost, 0
    );
    const variance = totalActual - totalEstimated;
    const variancePercentage = totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;
    
    return { totalEstimated, totalActual, variance, variancePercentage };
  }, [boqItems]);
  
  // Calculate Schedule Summary
  const scheduleSummary = React.useMemo(() => {
    const totalDuration = scheduleTasks.reduce((sum, task) => sum + task.duration, 0);
    const completedTasks = scheduleTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = scheduleTasks.filter(t => t.status === 'in_progress').length;
    const delayedTasks = scheduleTasks.filter(t => 
      t.earlyWarning && t.earlyWarning.active && t.earlyWarning.predictions.delayDays > 0
    ).length;
    
    return { totalDuration, completedTasks, inProgressTasks, delayedTasks };
  }, [scheduleTasks]);
  
  // ==================== BOQ ACTIONS ====================
  
  const addBOQItem = useCallback((item: IntegratedBOQItem) => {
    setBOQItems(prev => [...prev, item]);
    
    // Auto-sync with schedule
    IntegrationService.syncBOQItem(item).then(result => {
      if (result.scheduleUpdated) {
        // Create or update corresponding schedule task
        const existingTask = scheduleTasks.find(t => t.id === item.scheduleIntegration.linkedTaskId);
        if (!existingTask) {
          // Create new task
          const laborCost = item.scheduleIntegration.resources.labor.totalCost;
          const equipmentCost = item.scheduleIntegration.resources.equipment.reduce((sum, eq) => sum + eq.totalCost, 0);
          const materialsCost = item.scheduleIntegration.resources.materials.reduce((sum, mat) => sum + mat.totalCost, 0);
          const overhead = 0;
          const contingency = 0;
          const totalCost = laborCost + equipmentCost + materialsCost + overhead + contingency;
          
          const newTask: IntegratedScheduleTask = {
            id: item.scheduleIntegration.linkedTaskId,
            projectId: item.projectId,
            name: item.description,
            description: `مهمة مرتبطة بـ ${item.description}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + item.scheduleIntegration.calculatedDuration * 24 * 60 * 60 * 1000),
            duration: item.scheduleIntegration.calculatedDuration,
            dependencies: [],
            boqIntegration: {
              linkedBOQItems: [{
                boqItemId: item.id,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                contributionToTask: 100,
                productivityRate: item.scheduleIntegration.productivityRate,
                calculatedDays: item.scheduleIntegration.calculatedDuration
              }],
              totalQuantities: { [item.unit]: item.quantity },
              syncStatus: 'synced',
              lastSyncDate: new Date()
            },
            financialIntegration: {
              plannedCosts: {
                labor: laborCost,
                equipment: equipmentCost,
                materials: materialsCost,
                overhead: overhead,
                contingency: contingency,
                total: totalCost
              },
              actualCosts: {
                labor: 0,
                equipment: 0,
                materials: 0,
                overhead: 0,
                total: 0
              },
              variance: {
                amount: 0,
                percentage: 0,
                status: 'on'
              },
              delayCalculation: {
                directCosts: 0,
                indirectCosts: 0,
                totalDelayCost: 0
              },
              cashFlow: {
                plannedPayments: [],
                actualPayments: [],
                remainingBalance: 0
              }
            },
            resources: {
              labor: {
                skilled: {
                  required: item.scheduleIntegration.resources.labor.skilled,
                  assigned: 0,
                  costPerDay: 300,
                  totalCost: item.scheduleIntegration.resources.labor.skilled * 300 * item.scheduleIntegration.calculatedDuration
                },
                unskilled: {
                  required: item.scheduleIntegration.resources.labor.unskilled,
                  assigned: 0,
                  costPerDay: 200,
                  totalCost: item.scheduleIntegration.resources.labor.unskilled * 200 * item.scheduleIntegration.calculatedDuration
                },
                supervisor: {
                  required: item.scheduleIntegration.resources.labor.supervisor,
                  assigned: 0,
                  costPerDay: 400,
                  totalCost: item.scheduleIntegration.resources.labor.supervisor * 400 * item.scheduleIntegration.calculatedDuration
                },
                availability: {
                  available: true
                }
              },
              equipment: item.scheduleIntegration.resources.equipment.map(eq => ({
                ...eq,
                booking: {
                  status: 'available' as const
                }
              })),
              materials: item.scheduleIntegration.resources.materials.map(mat => ({
                ...mat,
                procurement: {
                  status: 'not_ordered' as const
                }
              })),
              resourceAnalysis: {
                adequateResources: true,
                bottlenecks: [],
                recommendations: []
              }
            },
            earlyWarning: null,
            reScheduling: null,
            earnedValue: {
              plannedValue: totalCost,
              earnedValue: 0,
              actualCost: 0,
              costPerformanceIndex: 0,
              schedulePerformanceIndex: 0,
              costVariance: 0,
              scheduleVariance: 0,
              estimateAtCompletion: totalCost,
              estimateToComplete: totalCost,
              varianceAtCompletion: 0,
              calculationDate: new Date()
            },
            actualProgress: {
              percentageComplete: 0,
              dailyProgress: [],
              prediction: {
                expectedCompletionDate: new Date(Date.now() + item.scheduleIntegration.calculatedDuration * 24 * 60 * 60 * 1000),
                expectedDelay: 0,
                confidence: 100
              }
            },
            status: 'not-started',
            priority: 'medium',
            assignedTo: {
              teamLead: '',
              engineers: [],
              supervisors: []
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          setScheduleTasks(prev => [...prev, newTask]);
        }
      }
    });
  }, [scheduleTasks]);
  
  const updateBOQItem = useCallback((itemId: string, updates: Partial<IntegratedBOQItem>) => {
    setBOQItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        // Re-sync
        IntegrationService.syncBOQItem(updated);
        return updated;
      }
      return item;
    }));
  }, []);
  
  const deleteBOQItem = useCallback((itemId: string) => {
    setBOQItems(prev => prev.filter(item => item.id !== itemId));
    // Also delete linked schedule task
    const item = boqItems.find(i => i.id === itemId);
    if (item) {
      setScheduleTasks(prev => prev.filter(t => t.id !== item.scheduleIntegration.linkedTaskId));
    }
  }, [boqItems]);
  
  // ==================== SCHEDULE ACTIONS ====================
  
  const addScheduleTask = useCallback((task: IntegratedScheduleTask) => {
    setScheduleTasks(prev => [...prev, task]);
  }, []);
  
  const updateScheduleTask = useCallback((taskId: string, updates: Partial<IntegratedScheduleTask>) => {
    setScheduleTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updated = { ...task, ...updates };
        // Re-sync
        IntegrationService.syncScheduleTask(updated);
        return updated;
      }
      return task;
    }));
  }, []);
  
  const deleteScheduleTask = useCallback((taskId: string) => {
    setScheduleTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);
  
  // ==================== PROGRESS UPDATE ====================
  
  const updateProgress = useCallback((taskId: string, progress: number, completedQuantity: number) => {
    setScheduleTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updated = {
          ...task,
          actualProgress: {
            ...task.actualProgress,
            percentageComplete: progress,
            dailyProgress: [
              ...task.actualProgress.dailyProgress,
              {
                date: new Date(),
                progress,
                quantityCompleted: completedQuantity,
                updatedBy: 'System',
                siteData: {
                  laborPresent: 0,
                  equipmentUsed: [],
                  weatherConditions: 'مناسب',
                  issues: [],
                  photos: []
                }
              }
            ]
          }
        };
        
        // Update linked BOQ item
        const linkedBOQItem = task.boqIntegration.linkedBOQItems[0];
        if (linkedBOQItem) {
          setBOQItems(prevBOQ => prevBOQ.map(boq => {
            if (boq.id === linkedBOQItem.boqItemId) {
              return {
                ...boq,
                actualProgress: {
                  ...boq.actualProgress,
                  completedQuantity,
                  percentageComplete: progress
                }
              };
            }
            return boq;
          }));
        }
        
        return updated;
      }
      return task;
    }));
  }, []);
  
  // ==================== SYNC ALL ====================
  
  const syncAllData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Sync all BOQ items
      for (const item of boqItems) {
        await IntegrationService.syncBOQItem(item);
      }
      
      // Sync all schedule tasks
      for (const task of scheduleTasks) {
        await IntegrationService.syncScheduleTask(task);
      }
      
      setLastSyncDate(new Date());
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [boqItems, scheduleTasks]);
  
  const value: ProjectContextData = {
    projectId: 'current-project',
    projectName: 'المشروع الحالي',
    boqItems,
    scheduleTasks,
    financialSummary,
    scheduleSummary,
    addBOQItem,
    updateBOQItem,
    deleteBOQItem,
    addScheduleTask,
    updateScheduleTask,
    deleteScheduleTask,
    updateProgress,
    syncAllData,
    lastSyncDate,
    isSyncing
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
