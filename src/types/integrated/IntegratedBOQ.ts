/**
 * أنواع بيانات المقايسات المتكاملة
 * Integrated BOQ Data Types
 * 
 * بند مقايسات متكامل يربط مع:
 * - الجدول الزمني (المدة والموارد)
 * - النظام المالي (التكاليف والموردين)
 * - المعايير الهندسية (الكود والمواصفات)
 * - التقدم الفعلي (من الموقع)
 */

/**
 * حالة المزامنة
 */
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

/**
 * التكامل مع الجدول الزمني
 * Schedule Integration
 */
export interface ScheduleIntegration {
  linkedTaskId: string | null;
  productivityRate: number;  // معدل الإنتاجية (وحدة/يوم)
  calculatedDuration: number; // المدة المحسوبة (أيام)
  resources: {
    labor: {
      skilled: number;
      unskilled: number;
      supervisor: number;
      totalCost: number;
      dailyCost: number;
    };
    equipment: Array<{
      id: string;
      type: string;
      quantity: number;
      dailyRate: number;
      totalCost: number;
    }>;
    materials: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      unitCost: number;
      totalCost: number;
    }>;
  };
  syncStatus: SyncStatus;
  lastSyncDate: Date | null;
}

/**
 * التكامل المالي
 * Financial Integration
 */
export interface FinancialIntegration {
  pricing: {
    unitPrice: number;
    currency: string;
    priceDate: Date;
  };
  comparison: {
    estimated: {
      materialCost: number;
      laborCost: number;
      equipmentCost: number;
      totalCost: number;
    };
    actual: {
      materialCost: number;
      laborCost: number;
      equipmentCost: number;
      totalCost: number;
    };
    variance: {
      materialVariance: number;
      laborVariance: number;
      equipmentVariance: number;
      totalVariance: number;
      percentageVariance: number;
    };
  };
  suppliers: Array<{
    name: string;
    price: number;
    leadTime: number;
    rating: number;
  }>;
  paymentStatus: 'pending' | 'partial' | 'complete';
}

/**
 * المعايير الهندسية
 * Engineering Standards
 */
export interface EngineeringStandards {
  applicableCode: 'SBC' | 'ISO' | 'ECP' | 'OTHER';
  codeReference: string;
  allowance: number; // نسبة الهدر %
  safetyFactor: number;
  qualityRequirements: string[];
  testingRequirements: string[];
  complianceStatus: boolean;
}

/**
 * التقدم الفعلي
 * Actual Progress
 */
export interface ActualProgress {
  completedQuantity: number;
  percentageComplete: number;
  completionDate: Date | null;
  siteUpdates: Array<{
    date: Date;
    quantity: number;
    updatedBy: string;
    photos: string[];
    location: {
      lat: number;
      lng: number;
    } | null;
    notes: string;
    quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  }>;
}

/**
 * بند مقايسات متكامل
 * Integrated BOQ Item
 */
export interface IntegratedBOQItem {
  // معلومات أساسية
  id: string;
  projectId: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  category: string;
  
  // التكامل مع الجدول الزمني
  scheduleIntegration: ScheduleIntegration;
  
  // التكامل المالي
  financialIntegration: FinancialIntegration;
  
  // المعايير الهندسية
  engineeringStandards: EngineeringStandards;
  
  // التقدم الفعلي
  actualProgress: ActualProgress;
  
  // معلومات إضافية
  createdDate: Date;
  lastModifiedDate: Date;
  createdBy: string;
  notes: string;
}

/**
 * مثال على بند مقايسات متكامل
 * Example Integrated BOQ Item
 */
export const EXAMPLE_INTEGRATED_BOQ_ITEM: IntegratedBOQItem = {
  id: 'boq-001',
  projectId: 'current-project',
  code: '03.01.001',
  description: 'صب خرسانة مسلحة للأساسات (C25)',
  quantity: 150,
  unit: 'm³',
  category: 'Concrete Works',
  
  scheduleIntegration: {
    linkedTaskId: 'task-001',
    productivityRate: 25, // 25 m³/day
    calculatedDuration: 6, // 150 ÷ 25 = 6 days
    resources: {
      labor: {
        skilled: 2,
        unskilled: 4,
        supervisor: 0.5,
        totalCost: 9600, // (2*300 + 4*200 + 0.5*400) * 6 days
        dailyCost: 1600
      },
      equipment: [
        { id: 'EQ-001', type: 'Concrete mixer', quantity: 1, dailyRate: 500, totalCost: 3000 },
        { id: 'EQ-002', type: 'Vibrator', quantity: 2, dailyRate: 200, totalCost: 2400 },
        { id: 'EQ-003', type: 'Wheelbarrows', quantity: 5, dailyRate: 50, totalCost: 1500 }
      ],
      materials: [
        { id: 'MAT-001', name: 'Concrete C25', quantity: 150, unit: 'm³', unitCost: 400, totalCost: 60000 },
        { id: 'MAT-002', name: 'Formwork', quantity: 300, unit: 'm²', unitCost: 80, totalCost: 24000 },
        { id: 'MAT-003', name: 'Steel reinforcement', quantity: 15, unit: 'ton', unitCost: 3500, totalCost: 52500 }
      ]
    },
    syncStatus: 'synced',
    lastSyncDate: new Date()
  },
  
  financialIntegration: {
    pricing: {
      unitPrice: 450,
      currency: 'SAR',
      priceDate: new Date()
    },
    comparison: {
      estimated: {
        materialCost: 50000,
        laborCost: 15000,
        equipmentCost: 2500,
        totalCost: 67500
      },
      actual: {
        materialCost: 52000,
        laborCost: 14500,
        equipmentCost: 2300,
        totalCost: 68800
      },
      variance: {
        materialVariance: 2000,
        laborVariance: -500,
        equipmentVariance: -200,
        totalVariance: 1300,
        percentageVariance: 1.93
      }
    },
    suppliers: [
      { name: 'مصنع الخرسانة الجاهزة', price: 450, leadTime: 1, rating: 4.5 },
      { name: 'مصنع البناء الحديث', price: 440, leadTime: 2, rating: 4.2 }
    ],
    paymentStatus: 'partial'
  },
  
  engineeringStandards: {
    applicableCode: 'SBC',
    codeReference: 'SBC 304-2018',
    allowance: 5, // 5% waste
    safetyFactor: 1.15,
    qualityRequirements: [
      'C25 minimum strength',
      'Slump 75-100mm',
      'Maximum water-cement ratio 0.50'
    ],
    testingRequirements: [
      'Cube test every 50m³',
      'Slump test every batch',
      'Temperature monitoring'
    ],
    complianceStatus: true
  },
  
  actualProgress: {
    completedQuantity: 90,
    percentageComplete: 60,
    completionDate: null,
    siteUpdates: [
      {
        date: new Date('2024-01-15'),
        quantity: 50,
        updatedBy: 'م. أحمد محمد',
        photos: ['/uploads/site-001.jpg'],
        location: { lat: 24.7136, lng: 46.6753 },
        notes: 'تم صب الأساسات الغربية بنجاح',
        quality: 'good'
      },
      {
        date: new Date('2024-01-17'),
        quantity: 40,
        updatedBy: 'م. أحمد محمد',
        photos: ['/uploads/site-002.jpg'],
        location: { lat: 24.7136, lng: 46.6753 },
        notes: 'استكمال صب الأساسات الشرقية',
        quality: 'excellent'
      }
    ]
  },
  
  createdDate: new Date('2024-01-10'),
  lastModifiedDate: new Date('2024-01-17'),
  createdBy: 'م. خالد العتيبي',
  notes: 'يجب التنسيق مع فريق حديد التسليح قبل الصب'
};

/**
 * ملخص مقايسات متكامل
 * Integrated BOQ Summary
 */
export interface IntegratedBOQSummary {
  totalItems: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  totalVariance: number;
  variancePercentage: number;
  completionPercentage: number;
  itemsByCategory: Record<string, number>;
  itemsByStatus: Record<SyncStatus, number>;
}

/**
 * Export all types
 */
export type {
  IntegratedBOQItem as default
};
