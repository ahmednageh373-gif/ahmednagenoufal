// Basic types
export type RiskProbability = 'Low' | 'Medium' | 'High';
export type RiskImpact = 'Low' | 'Medium' | 'High';
export type RiskStatus = 'Open' | 'In Progress' | 'Closed';
export type RiskCategory = 'Financial' | 'Technical' | 'Schedule' | 'Safety' | 'Contractual';
export type ScheduleTaskStatus = 'To Do' | 'In Progress' | 'Done';
export type ScheduleTaskPriority = 'Low' | 'Medium' | 'High';
export type PurchaseOrderStatus = 'Pending Approval' | 'Approved' | 'Ordered' | 'Delivered' | 'Cancelled';
export type KeyResultStatus = 'On Track' | 'At Risk' | 'Off Track';
export type ProjectItemStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type ProjectItemPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

// Core Data Structures
export interface ScheduleTask {
    id: number;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies: number[];
    category?: string;
    status?: ScheduleTaskStatus;
    priority?: ScheduleTaskPriority;
    assignees?: string[];
    wbsCode?: string;
    resourcesNeeded?: string[];
    // For recovery plan
    originalStart?: string;
    originalEnd?: string;
    revisedStart?: string;
    revisedEnd?: string;
    recoverySuggestion?: 'crashed' | 'fast-tracked' | 're-sequenced' | 'unchanged';
}

export interface FinancialItem {
    id: string;
    item: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
}

export interface Risk {
    id: string;
    description: string;
    category: RiskCategory;
    probability: RiskProbability;
    impact: RiskImpact;
    mitigationPlan: string;
    status: RiskStatus;
}

export interface SiteLogEntry {
    id: string;
    date: string;
    photoUrl: string;
    userNotes: string;
    aiAnalysis: string;
    latitude?: number;
    longitude?: number;
}

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

export interface AuditEntry {
    timestamp: string;
    user: string; // 'System (AI)' or user name
    action: string;
}


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
    // New fields for smart procurement
    supplierId?: string | null;
    quoteId?: string | null;
    auditLog?: AuditEntry[];
}

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

export interface ProjectWorkflow {
    projectCharter: string;
    wbs: string;
}

export interface Objective {
    id: string;
    title: string;
    description: string;
}

export interface KeyResult {
    id: string;
    objectiveId: string;
    title: string;
    currentValue: number;
    targetValue: number;
    status: KeyResultStatus;
}

export interface Subcontractor {
    id: string;
    name: string;
    trade: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
}

export interface SubcontractorInvoiceItem {
    id: string;
    boqItemId?: string;
    description: string;
    executedQuantity: number;
    unitPrice: number;
    total: number;
}

// Fix: Export the SubcontractorInvoiceStatus type.
export type SubcontractorInvoiceStatus = 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Rejected';

export interface SubcontractorInvoice {
    id: string;
    subcontractorId: string;
    invoiceNumber: string;
    date: string;
    status: SubcontractorInvoiceStatus;
    items: SubcontractorInvoiceItem[];
    totalAmount: number;
}

// Types for Assessment & Retrofitting (Unit 5)
export type DefectStatus = 'New' | 'Plan Generated' | 'Fixed';
export type DefectSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Defect {
    id: string;
    location: string; // e.g., "Column C3, Ground Floor"
    type: string; // e.g., "Structural", "Architectural"
    description: string;
    severity: DefectSeverity;
    status: DefectStatus;
    photoUrl?: string; // Optional photo of the defect
}

export interface RetrofittingMaterial {
    name: string;
    quantity: number;
    unit: string;
    unitCost: number; // Estimated cost per unit in SAR
}

export interface RetrofittingPlan {
    procedure: string[]; // Steps to fix
    requiredMaterials: RetrofittingMaterial[];
    requiredLaborHours: number;
    estimatedDurationDays: number;
    totalCost?: number; // Calculated on the client
}

export interface StructuralAssessment {
    id: string;
    buildingName: string;
    assessmentType: 'Visual' | 'NDT' | 'Combined';
    defects: Defect[];
}


export interface Supplier {
    id: string;
    name: string;
    trade: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    performanceIndex: number; // 0 to 1
}

export interface Quote {
    id: string;
    supplierId: string;
    materialName: string; // Should match PO itemName
    unitPrice: number;
    validUntil: string;
    notes?: string;
}



// AI-related types
export interface BOQMatch {
    boqItemId: string;
    boqItemDescription: string;
    takeoffFile: string;
    takeoffDescription: string;
    matchConfidence: number;
}

export interface AssistantSettings {
    persona: 'projectManager' | 'technicalAssistant' | 'educationalConsultant';
    tone: 'formal' | 'friendly';
    style: 'concise' | 'detailed';
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
    totalFloat: Record<number, number>; // Task ID -> Total Float
}

export interface CostBreakdownItem {
    costType: 'مواد' | 'عمالة' | 'معدات';
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
    type?: string;
    phone?: string;
    address?: string;
    mapsUri?: string;
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

export interface BeamSupport {
    id?: string;
    type: 'Pin' | 'Roller' | 'Fixed';
    position: number;
}

export interface BeamLoad {
    id?: string;
    type: 'Point' | 'UDL'; // UDL: Uniformly Distributed Load
    magnitude: number;
    position: number;
    endPosition?: number; // Only for UDL
}

export interface BeamAnalysisInput {
    length: number;
    supports: Omit<BeamSupport, 'id'>[];
    loads: Omit<BeamLoad, 'id'>[];
}

export interface BeamAnalysisResult {
    maxBendingMoment: { value: number; position: number };
    maxShearForce: { value: number; position: number };
    maxDeflection: { value: number; position: number };
    summary: string;
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

export interface SentimentAnalysisResult {
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    confidence: number;
    justification: string;
}

export interface DynamicPriceAnalysisItem {
  itemId: string;
  itemName: string;
  originalUnitPrice: number;
  dynamicUnitPrice: number;
  justification: string;
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
    majorResources: {
        material: string;
        quantity: number;
        unit: string;
    }[];
    assumptions: string;
    varianceReport: string;
}

export interface QualityPlanInput {
    itemIds: string[];
    standards: string[];
}

export interface QualityPlanResult {
    itpReport: string; // Inspection and Test Plan as Markdown
}


// Project Structure
export interface ProjectData {
    schedule: ScheduleTask[];
    financials: FinancialItem[];
    riskRegister: Risk[];
    siteLog: SiteLogEntry[];
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
}

export interface Project {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    data: ProjectData;
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    data: Partial<ProjectData>;
}