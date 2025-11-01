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
}

// --- Financial Manager ---

export interface FinancialItem {
    id: string;
    itemNumber?: string;        // الرقم التسلسلي - Item Number (new)
    code?: string;              // الكود/الرمز الإنشائي - Construction Code (new)
    category?: string;          // الفئة - Category (new)
    item: string;               // وصف البند - Description
    quantity: number;           // الكمية - Quantity
    unit: string;               // وحدة القياس - Unit of Measurement
    unitPrice: number;          // سعر الوحدة - Unit Price
    total: number;              // الإجمالي - Total
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
export type MemberRole = 'Admin' | 'Engineer' | 'Viewer';

export interface ProjectMember {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
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