/**
 * أنواع بيانات الجدول الزمني المتكامل
 * Integrated Schedule Data Types
 */

import { IntegratedBOQItem } from './IntegratedBOQ';

/**
 * مستوى المخاطر
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * حالة المهمة
 */
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';

/**
 * التكامل مع المقايسات
 */
export interface BOQIntegration {
  linkedBOQItems: Array<{
    boqItemId: string;
    description: string;
    quantity: number;
    unit: string;
    contributionToTask: number;
    productivityRate: number;
    calculatedDays: number;
  }>;
  totalQuantities: Record<string, number>;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncDate: Date;
}

/**
 * التكامل المالي
 */
export interface FinancialIntegration {
  plannedCosts: {
    labor: number;
    equipment: number;
    materials: number;
    overhead: number;
    contingency: number;
    total: number;
  };
  actualCosts: {
    labor: number;
    equipment: number;
    materials: number;
    overhead: number;
    total: number;
  };
  variance: {
    amount: number;
    percentage: number;
    status: 'under' | 'on' | 'over';
  };
  delayCalculation: {
    directCosts: number;      // تكاليف مباشرة (عمالة، معدات)
    indirectCosts: number;    // تكاليف غير مباشرة (إدارة، تمويل)
    totalDelayCost: number;
  };
  cashFlow: {
    plannedPayments: Array<{
      date: Date;
      amount: number;
      description: string;
    }>;
    actualPayments: Array<{
      date: Date;
      amount: number;
      description: string;
    }>;
    remainingBalance: number;
  };
}

/**
 * نظام الإنذار المبكر
 */
export interface EarlyWarning {
  riskLevel: RiskLevel;
  predictions: {
    delayDays: number;
    completionDate: Date;
    costOverrun: number;
  };
  indicators: {
    progressRate: number;    // معدل التقدم الفعلي
    requiredRate: number;    // معدل التقدم المطلوب
    deviation: number;       // الانحراف %
  };
  recommendations: string[];
  alertDate: Date;
}

/**
 * إعادة الجدولة
 */
export interface ReScheduling {
  originalPlan: {
    startDate: Date;
    endDate: Date;
    duration: number;
  };
  revisedPlan: {
    startDate: Date;
    endDate: Date;
    duration: number;
    reason: string;
  };
  affectedTasks: string[];  // المهام المتأثرة
  additionalCost: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
}

/**
 * القيمة المكتسبة (EVM)
 */
export interface EarnedValue {
  plannedValue: number;       // PV - القيمة المخططة
  earnedValue: number;        // EV - القيمة المكتسبة
  actualCost: number;         // AC - التكلفة الفعلية
  
  // مؤشرات الأداء
  costPerformanceIndex: number;     // CPI = EV / AC
  schedulePerformanceIndex: number; // SPI = EV / PV
  costVariance: number;             // CV = EV - AC
  scheduleVariance: number;         // SV = EV - PV
  
  // التوقعات
  estimateAtCompletion: number;     // EAC
  estimateToComplete: number;       // ETC
  varianceAtCompletion: number;     // VAC
  
  calculationDate: Date;
}

/**
 * التقدم اليومي
 */
export interface DailyProgress {
  date: Date;
  progress: number;
  quantityCompleted: number;
  updatedBy: string;
  siteData: {
    laborPresent: number;
    equipmentUsed: string[];
    weatherConditions: string;
    issues: string[];
    photos: string[];
  };
}

/**
 * مهمة جدول زمني متكاملة
 */
export interface IntegratedScheduleTask {
  // معلومات أساسية
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  actualEndDate?: Date;
  duration: number;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  
  // العلاقات
  dependencies: string[];
  predecessors?: string[];
  successors?: string[];
  
  // التكامل مع المقايسات
  boqIntegration: BOQIntegration;
  
  // التكامل المالي
  financialIntegration: FinancialIntegration;
  
  // نظام الإنذار المبكر
  earlyWarning: EarlyWarning | null;
  
  // إعادة الجدولة
  reScheduling: ReScheduling | null;
  
  // القيمة المكتسبة
  earnedValue: EarnedValue;
  
  // التقدم الفعلي
  actualProgress: {
    percentageComplete: number;
    dailyProgress: DailyProgress[];
    prediction: {
      expectedCompletionDate: Date;
      expectedDelay: number;
      confidence: number;
    };
  };
  
  // الموارد
  resources: {
    labor: {
      skilled: {
        required: number;
        assigned: number;
        costPerDay: number;
        totalCost: number;
      };
      unskilled: {
        required: number;
        assigned: number;
        costPerDay: number;
        totalCost: number;
      };
      supervisor: {
        required: number;
        assigned: number;
        costPerDay: number;
        totalCost: number;
      };
      availability: {
        available: boolean;
      };
    };
    equipment: Array<{
      id: string;
      type: string;
      quantity: number;
      dailyRate: number;
      totalCost: number;
      booking: {
        status: 'available' | 'booked' | 'unavailable';
      };
    }>;
    materials: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      unitCost: number;
      totalCost: number;
      procurement: {
        status: 'not_ordered' | 'ordered' | 'delivered';
      };
    }>;
    resourceAnalysis: {
      adequateResources: boolean;
      bottlenecks: string[];
      recommendations: string[];
    };
  };
  
  assignedTo: {
    teamLead: string;
    engineers: string[];
    supervisors: string[];
  };
  
  // معلومات إضافية
  createdAt: Date;
  updatedAt: Date;
}

/**
 * مثال على مهمة متكاملة
 */
export const EXAMPLE_INTEGRATED_SCHEDULE_TASK: IntegratedScheduleTask = {
  id: 'task-001',
  projectId: 'PROJECT-001',
  name: 'صب خرسانة الأساسات',
  description: 'صب خرسانة مسلحة C25 للأساسات',
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-21'),
  actualEndDate: new Date('2024-01-21'),
  duration: 6,
  status: 'in-progress',
  priority: 'high',
  
  dependencies: ['task-000'],
  predecessors: ['task-000'],
  successors: ['task-002'],
  
  boqIntegration: {
    linkedBOQItems: [{
      boqItemId: 'boq-001',
      description: 'صب خرسانة مسلحة للأساسات (C25)',
      quantity: 150,
      unit: 'm³',
      contributionToTask: 100,
      productivityRate: 25,
      calculatedDays: 6
    }],
    totalQuantities: { 'concrete': 150 },
    syncStatus: 'synced',
    lastSyncDate: new Date('2024-01-17')
  },
  
  financialIntegration: {
    plannedCosts: {
      labor: 15000,
      equipment: 2500,
      materials: 50000,
      overhead: 2000,
      contingency: 1500,
      total: 71000
    },
    actualCosts: {
      labor: 14500,
      equipment: 2300,
      materials: 52000,
      overhead: 2000,
      total: 70800
    },
    variance: {
      amount: -200,
      percentage: -0.28,
      status: 'under'
    },
    delayCalculation: {
      directCosts: 0,
      indirectCosts: 0,
      totalDelayCost: 0
    },
    cashFlow: {
      plannedPayments: [
        { date: new Date('2024-01-15'), amount: 20000, description: 'دفعة أولى' },
        { date: new Date('2024-01-17'), amount: 35000, description: 'دفعة ثانية' }
      ],
      actualPayments: [
        { date: new Date('2024-01-15'), amount: 20000, description: 'دفعة أولى' },
        { date: new Date('2024-01-17'), amount: 36000, description: 'دفعة ثانية' }
      ],
      remainingBalance: 15000
    }
  },
  
  earlyWarning: {
    riskLevel: 'low',
    predictions: {
      delayDays: 0,
      completionDate: new Date('2024-01-21'),
      costOverrun: 1300
    },
    indicators: {
      progressRate: 60,
      requiredRate: 58,
      deviation: 2
    },
    recommendations: [
      'التقدم جيد - استمر بنفس الوتيرة',
      'راقب استهلاك المواد'
    ],
    alertDate: new Date('2024-01-17')
  },
  
  reScheduling: null,
  
  earnedValue: {
    plannedValue: 71000,
    earnedValue: 42600, // 60% × 71000
    actualCost: 70800,
    
    costPerformanceIndex: 0.60, // 42600 / 70800
    schedulePerformanceIndex: 0.60, // 42600 / 71000
    costVariance: -28200, // 42600 - 70800
    scheduleVariance: -28400, // 42600 - 71000
    
    estimateAtCompletion: 118000,
    estimateToComplete: 47200,
    varianceAtCompletion: -47000,
    
    calculationDate: new Date('2024-01-17')
  },
  
  actualProgress: {
    percentageComplete: 60,
    dailyProgress: [
      {
        date: new Date('2024-01-15'),
        progress: 33,
        quantityCompleted: 50,
        updatedBy: 'م. أحمد محمد',
        siteData: {
          laborPresent: 6,
          equipmentUsed: ['Mixer', 'Vibrator'],
          weatherConditions: 'Clear, 28°C',
          issues: [],
          photos: ['/uploads/progress-001.jpg']
        }
      },
      {
        date: new Date('2024-01-17'),
        progress: 60,
        quantityCompleted: 90,
        updatedBy: 'م. أحمد محمد',
        siteData: {
          laborPresent: 6,
          equipmentUsed: ['Mixer', 'Vibrator'],
          weatherConditions: 'Clear, 26°C',
          issues: [],
          photos: ['/uploads/progress-002.jpg']
        }
      }
    ],
    prediction: {
      expectedCompletionDate: new Date('2024-01-21'),
      expectedDelay: 0,
      confidence: 95
    }
  },
  
  resources: {
    labor: {
      skilled: {
        required: 4,
        assigned: 4,
        costPerDay: 300,
        totalCost: 7200
      },
      unskilled: {
        required: 2,
        assigned: 2,
        costPerDay: 200,
        totalCost: 2400
      },
      supervisor: {
        required: 1,
        assigned: 1,
        costPerDay: 400,
        totalCost: 2400
      },
      availability: {
        available: true
      }
    },
    equipment: [
      {
        id: 'EQ-001',
        type: 'Concrete Mixer',
        quantity: 1,
        dailyRate: 300,
        totalCost: 1800,
        booking: {
          status: 'booked'
        }
      },
      {
        id: 'EQ-002',
        type: 'Vibrator',
        quantity: 2,
        dailyRate: 100,
        totalCost: 1200,
        booking: {
          status: 'booked'
        }
      }
    ],
    materials: [
      {
        id: 'MAT-001',
        name: 'Concrete C25',
        quantity: 150,
        unit: 'm³',
        unitCost: 300,
        totalCost: 45000,
        procurement: {
          status: 'delivered'
        }
      },
      {
        id: 'MAT-002',
        name: 'Steel Reinforcement',
        quantity: 3,
        unit: 'ton',
        unitCost: 5000,
        totalCost: 15000,
        procurement: {
          status: 'delivered'
        }
      }
    ],
    resourceAnalysis: {
      adequateResources: true,
      bottlenecks: [],
      recommendations: ['جميع الموارد متوفرة']
    }
  },
  
  assignedTo: {
    teamLead: 'م. أحمد محمد',
    engineers: ['م. خالد', 'م. فهد'],
    supervisors: ['مشرف الخرسانة']
  },
  
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-17')
};

export type { IntegratedScheduleTask as default };
