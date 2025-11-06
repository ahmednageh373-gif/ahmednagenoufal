// 🏗️ Extended Types for Complete ERP Integration
// نظام متكامل لإدارة المقاولات - التوسعات على الأنواع الأساسية

// ============================================
// 📦 RESOURCE MANAGEMENT - إدارة الموارد
// ============================================

export type ResourceType = 'Labor' | 'Equipment' | 'Material' | 'Subcontractor';
export type ResourceStatus = 'Available' | 'Assigned' | 'Busy' | 'Unavailable' | 'Maintenance';
export type LaborCategory = 'Engineer' | 'Supervisor' | 'Skilled Worker' | 'Labor' | 'Foreman' | 'Safety Officer';
export type EquipmentCategory = 'Heavy Equipment' | 'Light Equipment' | 'Tools' | 'Vehicles' | 'Scaffolding';

export interface LaborResource {
    id: string;
    name: string;
    category: LaborCategory;
    specialization: string;
    hourlyRate: number;
    dailyRate: number;
    contactPhone: string;
    nationalId: string;
    status: ResourceStatus;
    assignedTaskIds: number[];
    certifications: string[];
    joinDate: string;
    totalWorkHours: number;
    performanceRating: number; // 1-5
}

export interface EquipmentResource {
    id: string;
    name: string;
    category: EquipmentCategory;
    model: string;
    serialNumber: string;
    dailyRentalCost: number;
    hourlyRentalCost: number;
    status: ResourceStatus;
    assignedTaskIds: number[];
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    operatorRequired: boolean;
    fuelType?: string;
    capacity?: string;
    purchaseDate: string;
    purchasePrice: number;
    currentValue: number;
}

export interface MaterialResource {
    id: string;
    name: string;
    description: string;
    unit: string;
    unitPrice: number;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    linkedBOQItemIds: string[];
    supplierIds: string[];
    location: string;
    lastRestockDate: string;
    expiryDate?: string;
    quality: string;
}

export interface ResourceAllocation {
    id: string;
    resourceId: string;
    resourceType: ResourceType;
    taskId: number;
    startDate: string;
    endDate: string;
    quantity: number;
    unit: string;
    cost: number;
    utilizationRate: number; // 0-100%
    notes: string;
}

// ============================================
// 💰 COST CONTROL - إدارة التكاليف
// ============================================

export type CostType = 'Direct Labor' | 'Equipment' | 'Materials' | 'Subcontractor' | 'Overhead' | 'Indirect';
export type CostStatus = 'Planned' | 'Committed' | 'Actual' | 'Forecasted';
export type PaymentStatus = 'Pending' | 'Approved' | 'Paid' | 'Overdue' | 'Cancelled';

export interface CostItem {
    id: string;
    description: string;
    costType: CostType;
    costCode: string;
    linkedBOQItemId?: string;
    linkedTaskId?: number;
    plannedCost: number;
    committedCost: number;
    actualCost: number;
    variance: number; // plannedCost - actualCost
    variancePercentage: number;
    date: string;
    status: CostStatus;
    notes: string;
}

export interface BudgetAllocation {
    id: string;
    category: string;
    allocatedBudget: number;
    committedAmount: number;
    actualSpent: number;
    remaining: number;
    utilizationPercentage: number;
    forecastedTotal: number;
    varianceAtCompletion: number;
}

export interface PaymentCertificate {
    id: string;
    certificateNumber: string;
    date: string;
    periodFrom: string;
    periodTo: string;
    contractValue: number;
    previousPayments: number;
    currentWorkDone: number;
    materialOnSite: number;
    totalEarned: number;
    retentionPercentage: number;
    retentionAmount: number;
    netPayment: number;
    status: PaymentStatus;
    approvedBy: string;
    approvalDate?: string;
    items: PaymentCertificateItem[];
}

export interface PaymentCertificateItem {
    id: string;
    boqItemId: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    previousQuantity: number;
    currentQuantity: number;
    totalToDate: number;
    amount: number;
}

export interface CashFlow {
    id: string;
    date: string;
    description: string;
    category: string;
    inflow: number;
    outflow: number;
    balance: number;
    type: 'Income' | 'Expense';
    relatedDocumentId?: string;
    paymentMethod: string;
}

// ============================================
// 📊 EARNED VALUE MANAGEMENT - إدارة القيمة المكتسبة
// ============================================

export interface EVMData {
    date: string;
    
    // Planned Value (PV) - القيمة المخططة
    plannedValue: number;
    
    // Earned Value (EV) - القيمة المكتسبة
    earnedValue: number;
    
    // Actual Cost (AC) - التكلفة الفعلية
    actualCost: number;
    
    // Budget At Completion (BAC) - الميزانية عند الإنجاز
    budgetAtCompletion: number;
    
    // Schedule Variance (SV = EV - PV)
    scheduleVariance: number;
    scheduleVariancePercentage: number;
    
    // Cost Variance (CV = EV - AC)
    costVariance: number;
    costVariancePercentage: number;
    
    // Schedule Performance Index (SPI = EV / PV)
    schedulePerformanceIndex: number;
    
    // Cost Performance Index (CPI = EV / AC)
    costPerformanceIndex: number;
    
    // Estimate At Completion (EAC)
    estimateAtCompletion: number;
    
    // Estimate To Complete (ETC = EAC - AC)
    estimateToComplete: number;
    
    // Variance At Completion (VAC = BAC - EAC)
    varianceAtCompletion: number;
    
    // To Complete Performance Index (TCPI)
    toCompletePerformanceIndex: number;
}

// ============================================
// 📈 ANALYTICS & REPORTING - التقارير والتحليلات
// ============================================

export interface ProjectMetrics {
    projectId: string;
    date: string;
    
    // Schedule Metrics
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
    scheduleProgress: number;
    criticalPathDuration: number;
    projectDuration: number;
    daysRemaining: number;
    scheduleHealth: 'On Track' | 'At Risk' | 'Critical';
    
    // Financial Metrics
    totalBudget: number;
    committedCost: number;
    actualCost: number;
    remainingBudget: number;
    budgetUtilization: number;
    financialHealth: 'Healthy' | 'Warning' | 'Critical';
    
    // Resource Metrics
    totalLabor: number;
    activeLabor: number;
    laborUtilization: number;
    totalEquipment: number;
    activeEquipment: number;
    equipmentUtilization: number;
    
    // Quality & Safety
    totalRisks: number;
    openRisks: number;
    highPriorityRisks: number;
    qualityIssues: number;
    safetyIncidents: number;
    
    // Procurement
    totalPurchaseOrders: number;
    pendingPurchaseOrders: number;
    deliveredPurchaseOrders: number;
    procurementEfficiency: number;
}

export interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'gauge' | 'progress';
    title: string;
    dataSource: string;
    refreshInterval: number; // minutes
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    config: any;
}

// ============================================
// 🎯 EXECUTIVE DASHBOARD - لوحة التحكم التنفيذية
// ============================================

export interface ExecutiveReport {
    id: string;
    projectId: string;
    reportDate: string;
    reportPeriod: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
    
    // Executive Summary
    overallStatus: 'Green' | 'Yellow' | 'Red';
    scheduleStatus: 'On Track' | 'Slight Delay' | 'Major Delay';
    costStatus: 'Under Budget' | 'On Budget' | 'Over Budget';
    qualityStatus: 'Excellent' | 'Good' | 'Issues';
    
    // Key Highlights
    majorAccomplishments: string[];
    criticalIssues: string[];
    upcomingMilestones: string[];
    decisionsRequired: string[];
    
    // Financial Summary
    contractValue: number;
    valuePaid: number;
    valueEarned: number;
    costToDate: number;
    projectedFinalCost: number;
    profitMargin: number;
    
    // Progress Summary
    physicalProgress: number;
    plannedProgress: number;
    scheduleDeviation: number;
    
    // Resource Summary
    currentManpower: number;
    peakManpower: number;
    activeEquipment: number;
    
    // Trends
    progressTrend: 'Improving' | 'Stable' | 'Declining';
    costTrend: 'Improving' | 'Stable' | 'Worsening';
    productivityTrend: 'Improving' | 'Stable' | 'Declining';
}

// ============================================
// 📋 CHANGE MANAGEMENT - إدارة التغييرات
// ============================================

export type ChangeOrderStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Implemented';
export type ChangeImpact = 'Time' | 'Cost' | 'Scope' | 'Quality' | 'All';

export interface ChangeOrder {
    id: string;
    changeNumber: string;
    title: string;
    description: string;
    initiatedBy: string;
    initiatedDate: string;
    status: ChangeOrderStatus;
    
    // Impact Analysis
    impacts: ChangeImpact[];
    costImpact: number;
    scheduleImpact: number; // days
    scopeChange: string;
    
    // Justification
    reason: string;
    benefits: string;
    risks: string;
    
    // Approval
    reviewedBy?: string;
    reviewDate?: string;
    approvedBy?: string;
    approvalDate?: string;
    comments: string;
    
    // Implementation
    implementationDate?: string;
    actualCostImpact?: number;
    actualScheduleImpact?: number;
    
    // Linked Items
    linkedBOQItems: string[];
    linkedTasks: number[];
}

// ============================================
// 🔔 NOTIFICATIONS & ALERTS - الإشعارات والتنبيهات
// ============================================

export type NotificationType = 'Info' | 'Warning' | 'Critical' | 'Success';
export type NotificationCategory = 'Schedule' | 'Cost' | 'Quality' | 'Safety' | 'Resource' | 'Procurement';

export interface Notification {
    id: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    date: string;
    read: boolean;
    actionRequired: boolean;
    actionLink?: string;
    relatedEntityId?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

// ============================================
// 📝 CLAIMS MANAGEMENT - إدارة المطالبات
// ============================================

export type ClaimType = 'Delay' | 'Variation' | 'Extension of Time' | 'Additional Cost' | 'Force Majeure';
export type ClaimStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Negotiation' | 'Approved' | 'Rejected' | 'Settled';

export interface Claim {
    id: string;
    claimNumber: string;
    title: string;
    type: ClaimType;
    claimDate: string;
    claimAmount: number;
    timeExtensionDays: number;
    status: ClaimStatus;
    
    // Details
    description: string;
    contractualBasis: string;
    supportingDocuments: string[];
    
    // Analysis
    entitlement: string;
    quantification: string;
    
    // Response
    clientResponse?: string;
    negotiatedAmount?: number;
    negotiatedDays?: number;
    settlementDate?: string;
}

// ============================================
// 🌡️ WEATHER & SITE CONDITIONS - الطقس وظروف الموقع
// ============================================

export interface WeatherLog {
    id: string;
    date: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    conditions: string;
    workableHours: number;
    impactOnWork: 'None' | 'Minor' | 'Moderate' | 'Major' | 'Work Stopped';
    affectedActivities: number[];
}

// ============================================
// 📊 PRODUCTIVITY TRACKING - تتبع الإنتاجية
// ============================================

export interface ProductivityRecord {
    id: string;
    date: string;
    taskId: number;
    activity: string;
    
    // Resources Used
    laborCount: number;
    laborHours: number;
    equipmentHours: number;
    
    // Output
    quantityCompleted: number;
    unit: string;
    
    // Productivity Metrics
    productivityRate: number; // output per man-hour
    plannedRate: number;
    efficiency: number; // actual vs planned %
    
    // Factors
    weatherImpact: boolean;
    delayReasons: string[];
    notes: string;
}

// ============================================
// 🏆 KPIs - مؤشرات الأداء الرئيسية
// ============================================

export interface ProjectKPI {
    id: string;
    name: string;
    category: 'Schedule' | 'Cost' | 'Quality' | 'Safety' | 'Productivity' | 'Resource';
    currentValue: number;
    targetValue: number;
    unit: string;
    trend: 'Improving' | 'Stable' | 'Declining';
    status: 'Good' | 'Warning' | 'Critical';
    lastUpdated: string;
    description: string;
}
