// Fix: Centralized type definitions for the entire application.

// --- Core Project Structure ---

export interface Project {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    data: ProjectData;
}

export interface ProjectData {
    schedule: ScheduleTask[];
    financials: FinancialItem[];
    riskRegister: Risk[];
    siteLog: SiteLogEntry[];
    workLog: WorkLogEntry[];
    checklists: ChecklistItem[];
    engineeringDocs: DocumentCategory[];
    drawings: Drawing[];
    drawingFolders: DrawingFolder[];
    purchaseOrders: PurchaseOrder[];
    suppliers: Supplier[];
    quotes: Quote[];
    items: ProjectItem[];
    workflow: ProjectWorkflow;
    boqReconciliation: BOQMatch[];
    comparativeAnalysisReport: string;
    assistantSettings: AssistantSettings;
    objectives: Objective[];
    keyResults: KeyResult[];
    subcontractors: Subcontractor[];
    subcontractorInvoices: SubcontractorInvoice[];
    structuralAssessments: StructuralAssessment[];
    members: ProjectMember[];
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    data: Partial<ProjectData>;
}

// --- Schedule Manager ---

export type ScheduleTaskStatus = 'To Do' | 'In Progress' | 'Done';
export type ScheduleTaskPriority = 'Low' | 'Medium' | 'High';

export interface ScheduleTask {
    id: number;
    wbsCode?: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies: number[];
    category?: string;
    status: ScheduleTaskStatus;
    priority: ScheduleTaskPriority;
    assignees?: string[];
    resourcesNeeded?: string[];
    // For recovery plan
    originalStart?: string;
    originalEnd?: string;
    revisedStart?: string;
    revisedEnd?: string;
    recoverySuggestion?: 'crashed' | 'fast-tracked' | 're-sequenced' | 'unchanged';
    // For baseline comparison
    baselineStart?: string;
    baselineEnd?: string;
    baselineProgress?: number;
}

// --- Financial Manager ---

export interface FinancialItem {
    id: string;
    item: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
}

// --- Risk Manager ---

export type RiskCategory = 'Financial' | 'Technical' | 'Schedule' | 'Safety' | 'Contractual';
export type RiskProbability = 'Low' | 'Medium' | 'High';
export type RiskImpact = 'Low' | 'Medium' | 'High';
export type RiskStatus = 'Open' | 'In Progress' | 'Closed';

export interface Risk {
    id: string;
    description: string;
    category: RiskCategory;
    probability: RiskProbability;
    impact: RiskImpact;
    mitigationPlan: string;
    status: RiskStatus;
}

// --- Site Tracker ---

export interface SiteLogEntry {
    id: string;
    date: string;
    photoUrl: string;
    userNotes: string;
    aiAnalysis: string;
    latitude?: number;
    longitude?: number;
}

export interface WorkLogEntry {
    id: string;
    date: string;
    activitiesPerformed: string;
    manpowerCount: number;
    linkedTaskIds: number[];
}

export type ChecklistItemCategory = 'QA/QC' | 'HSE';
export type ChecklistItemStatus = 'Pending' | 'Pass' | 'Fail' | 'N/A';

export interface ChecklistItem {
    id: string;
    category: ChecklistItemCategory;
    text: string;
    status: ChecklistItemStatus;
}

// --- Docs & Drawings ---

export interface EngineeringDocument {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
    file?: {
        name: string;
        url: string;
        type: string;
    };
}

export interface DocumentCategory {
    id: string;
    name: string;
    documents: EngineeringDocument[];
}

export interface DrawingVersion {
    version: number;
    date: string;
    description: string;
    url: string;
    fileName: string;
}

export interface Drawing {
    id: string;
    title: string;
    folderId: string | null;
    versions: DrawingVersion[];
    scheduleTaskIds?: number[];
}

export interface DrawingFolder {
    id: string;
    name: string;
    parentId: string | null;
}

// --- Procurement ---

export type PurchaseOrderStatus = 'Pending Approval' | 'Approved' | 'Ordered' | 'Delivered' | 'Cancelled';

export interface PurchaseOrder {
    id: string;
    itemName: string;
    supplier: string;
    quantity: number;
    unitPrice: number;
    total: number;
    orderDate: string;
    expectedDelivery: string;
    status: PurchaseOrderStatus;
}

export interface Supplier {
    id: string;
    name: string;
    trade: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    performanceIndex: number;
}

export interface Quote {
    id: string;
    supplierId: string;
    materialName: string;
    unitPrice: number;
    validUntil: string;
    notes?: string;
}

// --- Project Hub ---

export type ProjectItemStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type ProjectItemPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ProjectItem {
    id: string;
    name: string;
    status: ProjectItemStatus;
    priority: ProjectItemPriority;
    assignees: string[];
    startDate: string;
    endDate: string;
    budget: number;
    progress: number;
}

// --- Workflow & OKRs ---

export interface ProjectWorkflow {
    projectCharter: string;
    wbs: string;
}

export interface Objective {
    id: string;
    title: string;
    description: string;
}

export type KeyResultStatus = 'On Track' | 'At Risk' | 'Off Track';

export interface KeyResult {
    id: string;
    objectiveId: string;
    title: string;
    currentValue: number;
    targetValue: number;
    status: KeyResultStatus;
}

// --- Subcontractors ---

export interface Subcontractor {
    id: string;
    name: string;
    trade: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
}

export type SubcontractorInvoiceStatus = 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Rejected';

export interface SubcontractorInvoiceItem {
    id: string;
    boqItemId?: string;
    description: string;
    executedQuantity: number;
    unitPrice: number;
    total: number;
}

export interface SubcontractorInvoice {
    id: string;
    subcontractorId: string;
    invoiceNumber: string;
    date: string;
    status: SubcontractorInvoiceStatus;
    items: SubcontractorInvoiceItem[];
    totalAmount: number;
}

// --- Assessments ---

export type DefectSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type DefectStatus = 'New' | 'Plan Generated' | 'Fixed';

export interface Defect {
    id: string;
    location: string;
    type: 'Structural' | 'Architectural' | 'MEP' | 'إنشائي' | 'معماري'; // Keep both for now
    description: string;
    severity: DefectSeverity;
    status: DefectStatus;
    photoUrl?: string;
}

export interface StructuralAssessment {
    id: string;
    buildingName: string;
    assessmentType: 'Visual' | 'NDT' | 'Combined';
    defects: Defect[];
}

export interface RetrofittingPlan {
    procedure: string[];
    requiredMaterials: { name: string; quantity: number; unit: string; unitCost: number }[];
    requiredLaborHours: number;
    estimatedDurationDays: number;
    totalCost?: number;
}


// --- Project Members ---
export type MemberRole = 'Admin' | 'Engineer' | 'Viewer' | 'Project Manager' | 'Architect' | 'Contractor' | 'Consultant';

export interface ProjectMember {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    avatar?: string; // URL or data URI
    avatarColor?: string; // Hex color for generated avatars
    phone?: string;
    department?: string;
    skills?: string[];
    isActive?: boolean;
    joinedDate?: string;
}


// --- Gemini Service & Analysis Types ---

export interface AssistantSettings {
    persona: 'projectManager' | 'technicalAssistant' | 'educationalConsultant';
    tone: 'formal' | 'friendly';
    style: 'concise' | 'detailed';
}

export interface BOQMatch {
    boqItemId: string;
    boqItemDescription: string;
    takeoffFile: string;
    takeoffDescription: string;
    matchConfidence: number;
}

export interface DrawingAnalysisResult {
    summary: string;
    extractedText: string;
    preliminaryBOQ: {
        item: string;
        description: string;
        quantity: number;
        unit: string;
    }[];
}

export interface WhatIfAnalysisResult {
    impactSummary: string;
    newEndDate: string;
    costImpact: string;
    criticalPathImpact: string;
}

export interface CriticalPathAnalysis {
    criticalActivityIds: number[];
    projectDuration: number;
    totalFloat: Record<number, number>;
}

export interface CostBreakdownItem {
    costType: 'Materials' | 'Labor' | 'Equipment' | 'مواد' | 'عمالة' | 'معدات';
    description: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
    estimatedTotal: number;
}

export interface DetailedCostBreakdown {
    items: CostBreakdownItem[];
    overheadsPercentage: number;
    profitPercentage: number;
}

export interface BOQItemSentiment {
    itemId: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    justification: string;
}

export interface LocationContact {
    name: string;
    type: string;
    phone: string;
    address: string;
    mapsUri: string;
}

export interface SentimentAnalysisResult {
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    confidence: number;
    justification: string;
}

// --- AI-Powered Alerts ---

export interface Alert {
    id: string;
    type: 'Deadline' | 'Budget' | 'Risk';
    severity: 'Warning' | 'Concern' | 'Critical';
    message: string;
    relatedView: string;
}

export interface BeamSupport {
    // FIX: Add id for UI state management in React components
    id: string;
    type: 'Pin' | 'Roller' | 'Fixed';
    position: number;
}

export interface BeamLoad {
    // FIX: Add id for UI state management in React components
    id: string;
    type: 'Point' | 'UDL';
    magnitude: number;
    position: number;
    endPosition?: number;
}

export interface BeamAnalysisInput {
    length: number;
    // FIX: Omit was causing an error because 'id' was not on the base type. With 'id' added to BeamSupport/BeamLoad, Omit is correct.
    supports: Omit<BeamSupport, 'id'>[];
    loads: Omit<BeamLoad, 'id'>[];
}

export interface BeamAnalysisResult {
    maxBendingMoment: { value: number; position: number };
    maxShearForce: { value: number; position: number };
    maxDeflection: { value: number; position: number };
    summary: string;
}

export interface ConceptualEstimateInput {
    buildingType: string;
    location: string;
    floors: number;
    totalArea: number;
}

export interface ConceptualEstimateResult {
    estimatedCost: number;
    estimatedDuration: number;
    majorResources: { material: string; quantity: number; unit: string }[];
    assumptions: string;
    varianceReport: string;
}

export interface CuringAnalysisInput {
    concreteGrade: string;
    ambientTemp: number;
    requiredStrength: number;
}

export interface CuringAnalysisResult {
    curingDays: number;
    earlyStrippingPossible: boolean;
    recommendations: string;
}

export interface DynamicPriceAnalysisItem {
    itemId: string;
    itemName: string;
    originalUnitPrice: number;
    dynamicUnitPrice: number;
    justification: string;
}

export interface QualityPlanInput {
    itemIds: string[];
    standards: string[];
}

export interface QualityPlanResult {
    itpReport: string;
}

// --- Knowledge Database ---

export type KnowledgeDocumentType = 'markdown' | 'pdf' | 'pptx' | 'xlsx' | 'video' | 'image';
export type KnowledgeCategory = 
    | 'AutoCAD' 
    | 'Structural' 
    | 'BOQ' 
    | 'Scheduling' 
    | 'Programming'
    | 'Management'
    | 'Technical'
    | 'General';
export type KnowledgeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface KnowledgeDocument {
    id: string;
    title: string;
    titleAr: string;
    type: KnowledgeDocumentType;
    category: KnowledgeCategory;
    difficulty: KnowledgeDifficulty;
    description: string;
    descriptionAr: string;
    content: string;
    fileUrl?: string;
    fileSize?: number;
    uploadDate: string;
    lastModified: string;
    tags: string[];
    topics: string[];
    estimatedHours?: number;
    featured?: boolean;
    author?: string;
    version?: string;
    views?: number;
    downloads?: number;
}

export interface KnowledgeModule {
    id: string;
    titleAr: string;
    titleEn: string;
    category: KnowledgeCategory;
    difficulty: KnowledgeDifficulty;
    estimatedHours: number;
    topics: string[];
    description: string;
    documents: KnowledgeDocument[];
    prerequisites?: string[];
    learningOutcomes?: string[];
    featured?: boolean;
    order?: number;
}

export interface KnowledgeSearchResult {
    document: KnowledgeDocument;
    relevance: number;
    matchedContent: string;
    highlights: string[];
}

export interface UserProgress {
    documentId: string;
    completed: boolean;
    progress: number;
    lastViewed: string;
    notes?: string;
    bookmarked?: boolean;
}

// --- NOUFAL Advanced Scheduling System ---

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'; // Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish
export type ActivityStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';

export interface ActivityDependency {
    predecessorId: number;
    type: DependencyType;
    lag: number; // in days (can be negative for lead time)
}

export interface ResourceRequirement {
    resourceType: 'Labor' | 'Equipment' | 'Material';
    resourceName: string;
    quantity: number;
    unit: string;
    dailyRate?: number;
}

export interface AdvancedScheduleActivity {
    id: number;
    wbsCode: string;
    name: string;
    description: string;
    category: string;
    boqItemId?: string; // Link to BOQ item
    
    // Duration and dates
    duration: number; // in days (base duration before adjustments)
    adjustedDuration?: number; // duration after shift factor and risk buffer
    startDate: string;
    endDate: string;
    
    // CPM calculations
    earlyStart: string;
    earlyFinish: string;
    lateStart: string;
    lateFinish: string;
    totalFloat: number;
    freeFloat: number;
    isCritical: boolean;
    
    // Dependencies and relationships
    dependencies: ActivityDependency[];
    successors: number[];
    
    // Resources
    resources: ResourceRequirement[];
    
    // Progress and status
    progress: number; // 0-100
    status: ActivityStatus;
    actualStart?: string;
    actualFinish?: string;
    
    // SBC compliance
    sbcRequirements?: SBCRequirement[];
    
    // Productivity
    productivityRate?: number;
    estimatedManHours?: number;
    
    // NEW: Shift Configuration
    shiftConfig?: ShiftConfiguration;
    
    // NEW: Risk Buffer
    riskBuffer?: RiskBuffer;
}

export interface SBCRequirement {
    code: string; // e.g., 'SBC-301-7.1'
    description: string;
    minimumDuration?: number; // in days
    requiredInspections?: string[];
    complianceNotes?: string;
    isCompliant: boolean;
}

// --- NEW: Shift Configuration (معامل الورديات) ---
export interface ShiftConfiguration {
    shiftsPerDay: 1 | 2 | 3;
    shiftFactor: number; // 1.0 for 1 shift, 0.6 for 2 shifts, 0.45 for 3 shifts
    workHoursPerShift: number; // typically 8 hours
    description: string;
}

// --- NEW: Risk Buffer (احتياطي الزمن) ---
export type RiskType = 'non-critical' | 'critical' | 'external' | 'precision';

export interface RiskBuffer {
    riskType: RiskType;
    bufferPercentage: number; // 3%, 5%, 6%, or 8%
    bufferDays: number; // calculated days to add
    reason: string; // explanation for the buffer
}

// --- NEW: Resource Histogram (موازنة الأحمال) ---
export interface ResourceHistogram {
    date: string;
    laborCount: number;
    equipmentCount: number;
    materialCost: number;
}

export interface ResourceLevelingResult {
    histogram: ResourceHistogram[];
    peakLabor: number;
    averageLabor: number;
    peakToAverageRatio: number; // should be ≤ 1.20 (120%)
    isBalanced: boolean;
    recommendations: string[];
}

// --- NEW: Project Calendar (تقويم المشروع) ---
export interface ProjectCalendar {
    workDays: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
    holidays: { date: string; name: string; }[];
    rainyDayBuffer: number; // percentage (e.g., 6% = 1 rainy day per 17 work days)
    ramadanPeriods: { startDate: string; endDate: string; productivityFactor: number; }[];
    weatherConstraints?: {
        maxTemperature?: number; // e.g., 45°C
        minTemperature?: number;
        rainySeasonMonths?: number[]; // 1-12
    };
}

// --- NEW: Milestone (نقاط التسليم الرئيسية) ---
export interface ProjectMilestone {
    id: number;
    name: string;
    description: string;
    targetDate: string;
    actualDate?: string;
    status: 'Pending' | 'Achieved' | 'Delayed';
    linkedActivities: number[]; // activity IDs
    isContractual: boolean; // if linked to contract
    penalties?: {
        perDay: number;
        maxAmount: number;
    };
}

export interface ProductivityRate {
    activityType: string;
    unit: string;
    laborProductivity: number; // units per man-hour
    equipmentProductivity?: number;
    crewSize: number;
    crewComposition: {
        role: string;
        count: number;
    }[];
    region: 'Riyadh' | 'Jeddah' | 'Dammam' | 'Other';
}

export interface WBSItem {
    code: string;
    level: number;
    name: string;
    parentCode?: string;
    activities: AdvancedScheduleActivity[];
    totalDuration: number;
    totalCost: number;
}

export interface CPMAnalysisResult {
    criticalPath: number[]; // Activity IDs
    projectDuration: number;
    projectStart: string;
    projectFinish: string;
    criticalActivities: AdvancedScheduleActivity[];
    floatAnalysis: {
        activityId: number;
        totalFloat: number;
        freeFloat: number;
    }[];
}

export interface SCurveData {
    date: string;
    plannedProgress: number; // cumulative percentage
    actualProgress: number; // cumulative percentage
    plannedCost: number; // cumulative cost
    actualCost: number; // cumulative cost
    earnedValue: number;
}

export interface SchedulePerformanceMetrics {
    spi: number; // Schedule Performance Index
    cpi: number; // Cost Performance Index
    sv: number; // Schedule Variance
    cv: number; // Cost Variance
    estimatedCompletion: string;
    estimatedCost: number;
}

export interface ScheduleExportOptions {
    format: 'Excel' | 'PDF' | 'Primavera' | 'MS Project';
    includeGanttChart: boolean;
    includeCPM: boolean;
    includeSCurve: boolean;
    includeResourceHistogram: boolean;
    includeFloatAnalysis: boolean;
}

export interface PrimaveraActivity {
    activityId: string;
    activityName: string;
    originalDuration: number;
    remainingDuration: number;
    percentComplete: number;
    startDate: string;
    finishDate: string;
    calendarId: string;
    wbsId: string;
    predecessors: {
        predecessorActivityId: string;
        type: 'PR_FS' | 'PR_SS' | 'PR_FF' | 'PR_SF';
        lag: number;
    }[];
}

export interface ScheduleImportResult {
    activities: AdvancedScheduleActivity[];
    wbs: WBSItem[];
    metadata: {
        projectName: string;
        projectStart: string;
        projectFinish: string;
        totalActivities: number;
        importDate: string;
        sourceFormat: 'Excel' | 'PDF' | 'Primavera';
    };
    warnings: string[];
    errors: string[];
}

// --- Theme Customization ---

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink';

export interface ThemeColors {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

export interface ThemeConfig {
    mode: ThemeMode;
    colorScheme: ColorScheme;
    fontSize: FontSize;
    customColors?: Partial<ThemeColors>;
    borderRadius: 'none' | 'small' | 'medium' | 'large';
    spacing: 'compact' | 'normal' | 'comfortable';
    animations: boolean;
    highContrast: boolean;
}

export interface ThemePreset {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    config: ThemeConfig;
    preview: {
        primary: string;
        secondary: string;
        background: string;
    };
}

// --- Time-Cost Integration (TCI) Types ---

// WBS Node for TCI Integration
export interface WBSNode {
    id: string;
    name: string;
    nameEn?: string;
    level: number; // 1 for top level, 2 for second level, etc.
    parentId: string | null;
    linkedBOQItems: string[]; // Array of BOQ item IDs
    linkedScheduleTaskIds: number[]; // Array of schedule task IDs
    totalBudget: number; // Sum of linked BOQ item costs
    allocatedBudget: number; // Budget distributed to schedule tasks
    description?: string;
    category?: string;
}

// Extended ProjectItem for BOQ with WBS linking
export interface BOQItemExtended extends FinancialItem {
    code: string; // Item code from BOQ
    category?: string;
    wbsId?: string | null; // Link to WBS node
    description: string;
    cost: number; // Same as 'total' but more explicit
}

// Extended ScheduleTask with cost and EVM data
export interface ScheduleTaskExtended extends ScheduleTask {
    wbsId?: string | null; // Link to WBS node
    budgetedCost?: number; // Planned Value (PV) for this task
    actualCost?: number; // Actual Cost (AC) - from invoices/actuals
    earnedValue?: number; // EV = budgetedCost * (progress / 100)
    costVariance?: number; // CV = EV - AC
    scheduleVariance?: number; // SV = EV - PV (at current date)
    cpi?: number; // Cost Performance Index = EV / AC
    spi?: number; // Schedule Performance Index = EV / PV
}

// EVM Summary for Project
export interface EVMSummary {
    projectId: string;
    asOfDate: string;
    bac: number; // Budget at Completion (total project budget)
    pv: number; // Planned Value (should be completed by now)
    ev: number; // Earned Value (actually completed value)
    ac: number; // Actual Cost (spent so far)
    cv: number; // Cost Variance = EV - AC
    sv: number; // Schedule Variance = EV - PV
    cpi: number; // Cost Performance Index = EV / AC
    spi: number; // Schedule Performance Index = EV / PV
    eac: number; // Estimate at Completion = BAC / CPI
    etc: number; // Estimate to Complete = EAC - AC
    vac: number; // Variance at Completion = BAC - EAC
    tcpi: number; // To-Complete Performance Index
    percentComplete: number; // Overall project completion %
}

// TCI Mapping Configuration
export interface TCIConfig {
    projectId: string;
    wbsStructure: WBSNode[];
    costDistributionMethod: 'equal' | 'duration-weighted' | 'manual';
    autoCalculateEVM: boolean;
    evmCalculationDate: string; // Date for EVM calculations
    includedCategories?: string[]; // Filter which BOQ categories to include
}

// Cost Distribution Rule
export interface CostDistributionRule {
    wbsId: string;
    taskId: number;
    allocationPercentage: number; // 0-100
    allocationAmount: number; // Calculated amount
    method: 'manual' | 'auto';
}

// TCI Analytics Result
export interface TCIAnalytics {
    totalBOQItems: number;
    linkedBOQItems: number;
    unlinkedBOQItems: number;
    totalScheduleTasks: number;
    linkedScheduleTasks: number;
    unlinkedScheduleTasks: number;
    totalBudget: number;
    allocatedBudget: number;
    unallocatedBudget: number;
    evmSummary: EVMSummary;
    recommendations: string[];
}