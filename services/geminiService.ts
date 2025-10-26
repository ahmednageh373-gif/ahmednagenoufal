
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Add ScheduleTaskStatus and ScheduleTaskPriority to the type import.
import type { Project, FinancialItem, ScheduleTask, Risk, BeamAnalysisInput, BeamAnalysisResult, DrawingAnalysisResult, WhatIfAnalysisResult, CriticalPathAnalysis, DetailedCostBreakdown, CostBreakdownItem, BOQItemSentiment, PurchaseOrder, LocationContact, SentimentAnalysisResult, BeamSupport, BeamLoad, DynamicPriceAnalysisItem, CuringAnalysisInput, CuringAnalysisResult, ConceptualEstimateInput, ConceptualEstimateResult, QualityPlanInput, QualityPlanResult, ScheduleTaskStatus, ScheduleTaskPriority, Supplier, Quote, StructuralAssessment, BOQMatch, Defect, RetrofittingPlan, ChecklistItem } from "../types";
import { v4 as uuidv4 } from 'uuid';

// This will allow using the XLSX library loaded from the CDN in index.html
declare var XLSX: any;

// Helper to read file as base64
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

// Helper to parse Excel files into CSV text
const excelFileToCsvText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const csv = XLSX.utils.sheet_to_csv(worksheet);
                if (!csv) {
                    reject(new Error("Could not convert Excel file to CSV. The sheet might be empty."));
                    return;
                }
                resolve(csv);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// --- Service Functions ---

export const extractFinancialItemsFromBOQ = async (file: File): Promise<FinancialItem[]> => {
    const csvData = await excelFileToCsvText(file);

    const prompt = `Extract Bill of Quantities items from the following CSV data. The columns are likely 'Item Description', 'Quantity', 'Unit', 'Unit Price', 'Total'. For each item, provide a unique ID, a description (item), quantity, unit, unit price, and total. Format the output as a JSON array of objects. Example: [{id: 'boq-1', item: 'Excavation', quantity: 100, unit: 'm3', unitPrice: 50, total: 5000}]. Make sure all numbers are parsed correctly. If a row seems to be a header or not a BOQ item, ignore it.

CSV Data:
---
${csvData}
---
`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique identifier for the item." },
                        item: { type: Type.STRING, description: "The description of the BOQ item." },
                        quantity: { type: Type.NUMBER, description: "The quantity of the item." },
                        unit: { type: Type.STRING, description: "The unit of measurement." },
                        unitPrice: { type: Type.NUMBER, description: "The price per unit." },
                        total: { type: Type.NUMBER, description: "The total price for the item." },
                    }
                }
            }
        },
    });

    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }

    try {
        const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        const items = JSON.parse(jsonText);
        // Ensure data integrity
        return items.map((item: any) => ({
            id: item.id || `boq-${uuidv4()}`,
            item: item.item || 'Unnamed Item',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || 'N/A',
            unitPrice: Number(item.unitPrice) || 0,
            total: Number(item.total) || 0,
        }));
    } catch (e) {
        console.error("Failed to parse BOQ JSON:", responseText, e);
        throw new Error("Could not extract financial items from the file. The format might be unsupported or the AI response was invalid.");
    }
};

// --- RULE-BASED SCHEDULE GENERATION ---
const estimateDuration = (item: FinancialItem): number => {
    if (item.unit === 'م3' && item.quantity > 0) return Math.ceil(item.quantity / 20); // 20 m3 per day
    if (item.unit === 'م2' && item.quantity > 0) return Math.ceil(item.quantity / 100); // 100 m2 per day
    return 5; // Default duration
};

const getPhaseFromDescription = (description: string): string => {
    if (description.includes('Foundation') || description.includes('Excavation') || description.includes('أساسات') || description.includes('حفر')) {
      return 'Foundation Work';
    } else if (description.includes('Column') || description.includes('Beam') || description.includes('Slab') || description.includes('عمود') || description.includes('جسر') || description.includes('سقف')) {
      return 'Structural Work';
    } else if (description.includes('Paint') || description.includes('Floor') || description.includes('Tile') || description.includes('دهان') || description.includes('بلاط') || description.includes('أرضيات')) {
      return 'Finishing Work';
    } else if (description.includes('Wall') || description.includes('Partition') || description.includes('جدار') || description.includes('قاطع')) {
      return 'Interior Work';
    }
    return 'Miscellaneous';
};

export const processBoqToSchedule = async (items: FinancialItem[], projectStartDate: string): Promise<ScheduleTask[]> => {
    const CONSTRUCTION_SEQUENCE: { [key: string]: string[] } = {
        'Pre-Construction': [],
        'Site Preparation': [],
        'Foundation Work': ['Site Preparation'],
        'Structural Work': ['Foundation Work'],
        'Enclosure': ['Structural Work'],
        'Interior Work': ['Enclosure'],
        'Finishing Work': ['Interior Work'],
        'Close-Out': ['Finishing Work']
    };
    
    const schedule: Omit<ScheduleTask, 'start' | 'end'>[] = [];
    let activityCounter = 1;
    const phaseEndDates: { [phase: string]: string } = {};
    const phaseLastActivityId: { [phase: string]: number } = {};
    
    const sortedItems = [...items].sort((a,b) => {
        const phaseA = getPhaseFromDescription(a.item);
        const phaseB = getPhaseFromDescription(b.item);
        const indexA = Object.keys(CONSTRUCTION_SEQUENCE).indexOf(phaseA);
        const indexB = Object.keys(CONSTRUCTION_SEQUENCE).indexOf(phaseB);
        return indexA - indexB;
    });

    for (const item of sortedItems) {
        const phase = getPhaseFromDescription(item.item);
        const duration = estimateDuration(item);
        
        const newActivity = {
            id: activityCounter,
            name: item.item,
            progress: 0,
            dependencies: [],
            category: phase,
            status: 'To Do' as ScheduleTaskStatus,
            priority: 'Medium' as ScheduleTaskPriority,
            duration,
        };
        schedule.push(newActivity);
        activityCounter++;
    }

    const taskMap = new Map(schedule.map(t => [t.id, t]));
    const taskDates = new Map<number, {start: Date, end: Date}>();

    for(const task of schedule) {
        const phase = task.category || 'Miscellaneous';
        const phasePredecessors = CONSTRUCTION_SEQUENCE[phase as keyof typeof CONSTRUCTION_SEQUENCE] || [];

        let maxPredecessorEndDate = new Date(projectStartDate);
        
        // Add dependency to the last task of the previous phase
        for (const predPhase of phasePredecessors) {
            if(phaseLastActivityId[predPhase]) {
                const predecessorId = phaseLastActivityId[predPhase];
                 if (!task.dependencies.includes(predecessorId)) {
                    task.dependencies.push(predecessorId);
                }
            }
        }
        
        // Add dependency to the immediate previous task within the same phase
        if (phaseLastActivityId[phase]) {
            task.dependencies.push(phaseLastActivityId[phase]);
        }
        
        for (const depId of task.dependencies) {
             const predEndDate = taskDates.get(depId)?.end;
             if (predEndDate && predEndDate > maxPredecessorEndDate) {
                 maxPredecessorEndDate = predEndDate;
             }
        }

        const startDate = new Date(maxPredecessorEndDate);
        startDate.setDate(startDate.getDate() + 1); // Start the day after the last predecessor
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (task as any).duration -1);

        taskDates.set(task.id, { start: startDate, end: endDate });
        phaseLastActivityId[phase] = task.id;
    }
    
    const finalSchedule: ScheduleTask[] = schedule.map(task => {
        const dates = taskDates.get(task.id);
        return {
            ...task,
            start: dates?.start.toISOString().split('T')[0] || projectStartDate,
            end: dates?.end.toISOString().split('T')[0] || projectStartDate,
        }
    });

    return finalSchedule;
};

// Fix: Add the missing generateProjectCharter function, which was being imported in WorkflowArchitect.tsx.
export const generateProjectCharter = async (project: Project, inputs: Record<string, string>): Promise<string> => {
    const prompt = `Act as a senior project manager. Generate a comprehensive Project Charter in Markdown format for the following project.
    
    Project Details:
    - Name: ${project.name}
    - Description: ${project.description}
    - Start Date: ${project.startDate}
    - End Date: ${project.endDate || 'Not specified'}

    User-provided Inputs:
    - High-level Requirements: ${inputs.requirements}
    - Feasibility Study Summary: ${inputs.feasibility}
    - Key Stakeholders: ${inputs.stakeholders}
    - Initial Risks: ${inputs.risks}

    The Project Charter should be well-structured and include at least the following sections:
    1.  Project Title and Description
    2.  Project Purpose/Justification
    3.  Measurable Objectives and Success Criteria
    4.  High-Level Requirements
    5.  Assumptions and Constraints
    6.  High-Level Risks
    7.  Milestone Schedule
    8.  Summary Budget
    9.  Key Stakeholders
    10. Project Approval Requirements (what constitutes success)
    11. Project Manager Assignment and Authority Level

    Provide a professional and detailed document.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using pro for a more detailed document
        contents: prompt,
    });
    return response.text;
};

export const generateWBS = async (project: Project): Promise<string> => {
    const prompt = `Generate a Work Breakdown Structure (WBS) in markdown list format for a project with the following details:
    Name: ${project.name}
    Description: ${project.description}
    Start Date: ${project.startDate}
    End Date: ${project.endDate || 'Not specified'}

    The WBS should cover major project phases like:
    1. Project Management
    2. Engineering & Design
    3. Procurement
    4. Construction (with sub-phases like Substructure, Superstructure, Finishes)
    5. Commissioning & Handover

    Provide a detailed, multi-level list.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const generateWBSFromSchedule = async (schedule: ScheduleTask[]): Promise<string> => {
    const scheduleSummary = schedule.map(t => `- ${t.name} (Category: ${t.category || 'None'})`).join('\n');
    const prompt = `Based on the following list of project activities and their categories, generate a hierarchical Work Breakdown Structure (WBS) in markdown list format. Group related tasks under appropriate parent levels.

Activities:
${scheduleSummary}

The WBS should be logical and well-structured.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const getCostBreakdown = async (item: FinancialItem): Promise<DetailedCostBreakdown> => {
    const prompt = `Act as an expert pricing and execution engineer. Your task is to provide a detailed cost breakdown for ONE unit of the following Bill of Quantities (BOQ) item.

**Crucial Instruction:** You must derive the component quantities based on the main item's unit of measurement. For composite items (like a fence measured in linear meters), calculate the required quantities of base materials (like concrete in m³, rebar in kg) for that single unit. For example, to price 1 linear meter of a fence, you must first calculate the volume of its concrete footing. State any assumptions you make (e.g., footing dimensions) if not specified in the description.

**BOQ Item Details:**
- Item Description: "${item.item}"
- Unit of Measurement: ${item.unit}
- Tender Unit Price: ${item.unitPrice} SAR

**Required Output:**
Break down the cost for ONE '${item.unit}' into three categories: 'مواد' (Materials), 'عمالة' (Labor), and 'معدات' (Equipment).
For each component, provide:
- description: The specific material, labor type, or equipment.
- quantity: The consumption rate of this component for ONE unit of the main BOQ item.
- unit: The component's own unit (e.g., 'm3', 'hour', 'day').
- estimatedUnitPrice: The market price for one unit of the component.
- estimatedTotal: The total cost for this component (quantity * estimatedUnitPrice).

Also provide an estimated 'overheadsPercentage' (e.g., 15 for 15%) and 'profitPercentage' (e.g., 10 for 10%).
The final JSON structure must follow this schema.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                costType: { type: Type.STRING, enum: ['مواد', 'عمالة', 'معدات'] },
                                description: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                unit: { type: Type.STRING },
                                estimatedUnitPrice: { type: Type.NUMBER },
                                estimatedTotal: { type: Type.NUMBER },
                            }
                        }
                    },
                    overheadsPercentage: { type: Type.NUMBER },
                    profitPercentage: { type: Type.NUMBER },
                }
            }
        }
    });

    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }

    try {
        const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse Cost Breakdown JSON:", responseText, e);
        throw new Error("Could not generate cost breakdown. The AI response was invalid.");
    }
};

export const analyzeFinancials = async (financials: FinancialItem[]): Promise<string> => {
    if (financials.length === 0) {
        return "No financial data available to analyze.";
    }
    const summary = financials.map(item => `${item.item}: ${item.total} SAR`).join('\n');
    const totalCost = financials.reduce((sum, item) => sum + item.total, 0);

    const prompt = `Analyze the following Bill of Quantities summary. The total cost is ${totalCost.toLocaleString()} SAR.
    
    Summary:
    ${summary}
    
    Provide a concise financial analysis in Markdown format. Highlight the top 3 cost drivers and suggest potential areas for cost savings or value engineering.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const suggestRisks = async (project: Project): Promise<Omit<Risk, 'id' | 'status'>[]> => {
    const prompt = `Based on the following project description, suggest 3 to 5 potential risks. For each risk, provide a description, category, probability, impact, and a mitigation plan.
    
    Project Name: ${project.name}
    Description: ${project.description}
    Start Date: ${project.startDate}
    
    Format the output as a JSON array of objects.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        category: { type: Type.STRING, enum: ['Financial', 'Technical', 'Schedule', 'Safety', 'Contractual'] },
                        probability: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                        impact: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                        mitigationPlan: { type: Type.STRING },
                    }
                }
            }
        }
    });
    
    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }

    try {
         const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse suggested risks JSON:", responseText, e);
        throw new Error("Could not suggest risks. The AI response was invalid.");
    }
};

export const analyzeSitePhoto = async (userNotes: string, photo: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(photo);

    const prompt = `Analyze this site photo from a civil engineering project manager's perspective.
    
    User notes (for context): "${userNotes || 'No notes provided.'}"
    
    Your analysis should be in Markdown and cover:
    1.  **Progress Assessment:** What stage of work is shown?
    2.  **Quality Check:** Are there any visible quality issues (e.g., concrete honeycombing, rebar spacing)?
    3.  **Safety Compliance:** Identify any safety violations (e.g., missing PPE, unsafe scaffolding, poor housekeeping).
    4.  **Recommendations:** Suggest immediate actions or points to verify.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
    });
    return response.text;
};

export const createProjectFromTenderText = async (tenderText: string): Promise<Omit<Project, 'id'>> => {
    const prompt = `Analyze the following tender document text and extract the necessary information to create a new project structure. 
    
    Tender Text:
    ---
    ${tenderText}
    ---
    
    Extract the following and format as JSON:
    1.  'name': A suitable project name.
    2.  'description': A concise project description.
    3.  'startDate': The estimated project start date (format: YYYY-MM-DD).
    4.  'schedule': An array of 3-5 high-level schedule tasks with id, name, start, end, progress (0), and dependencies ([]).
    5.  'financials': An array of 3-5 key financial items (BOQ) with id, item, quantity, unit, unitPrice, and total.
    6.  'riskRegister': An array of 1-2 potential risks based on the tender.
    
    Use reasonable estimations if some data is not explicitly mentioned. The entire output must be a single JSON object.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    schedule: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.NUMBER },
                                name: { type: Type.STRING },
                                start: { type: Type.STRING },
                                end: { type: Type.STRING },
                                progress: { type: Type.NUMBER },
                                dependencies: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            }
                        }
                    },
                    financials: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                item: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                unit: { type: Type.STRING },
                                unitPrice: { type: Type.NUMBER },
                                total: { type: Type.NUMBER },
                            }
                        }
                    },
                    riskRegister: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                description: { type: Type.STRING },
                                category: { type: Type.STRING, enum: ['Financial', 'Technical', 'Schedule', 'Safety', 'Contractual'] },
                                probability: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                                impact: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                                mitigationPlan: { type: Type.STRING },
                                status: { type: Type.STRING, enum: ['Open', 'In Progress', 'Closed'] },
                            }
                        }
                    }
                }
            }
        }
    });

    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }
    
    try {
        const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        const parsed = JSON.parse(jsonText);
        // Construct the full project data structure
        const projectData: Omit<Project, 'id'> = {
            name: parsed.name,
            description: parsed.description,
            startDate: parsed.startDate,
            data: {
                schedule: parsed.schedule || [],
                financials: parsed.financials || [],
                riskRegister: parsed.riskRegister || [],
                siteLog: [],
                workLog: [],
                checklists: [],
                engineeringDocs: [],
                drawings: [],
                drawingFolders: [],
                purchaseOrders: [],
                suppliers: [],
                quotes: [],
                items: [],
                workflow: { projectCharter: '', wbs: '' },
                boqReconciliation: [],
                comparativeAnalysisReport: '',
                assistantSettings: { persona: 'projectManager', tone: 'formal', style: 'concise' },
                objectives: [],
                keyResults: [],
                subcontractors: [],
                subcontractorInvoices: [],
                structuralAssessments: [],
            }
        };
        return projectData;

    } catch (e) {
        console.error("Failed to parse project from tender JSON:", responseText, e);
        throw new Error("Could not create project from tender. The AI response was invalid.");
    }
};

export const generateDocumentDraft = async (project: Project, userPrompt: string, categoryName: string): Promise<{ title: string; content: string }> => {
    const prompt = `As a senior engineer, create a draft for a document in the category "${categoryName}" for the project "${project.name}".
    
    User's Request: "${userPrompt}"
    
    The output should be a JSON object with two keys: "title" (a suitable document title) and "content" (the full document content in Markdown format).`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                }
            }
        }
    });
    
     let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }

    try {
        const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse document draft JSON:", responseText, e);
        throw new Error("Could not generate document draft. The AI response was invalid.");
    }
};

export const generateSubTasksFromDescription = async (description: string): Promise<{ name: string; duration: number; predecessors: string[] }[]> => {
    const prompt = `Break down the following high-level construction activity into a detailed list of sub-tasks. For each sub-task, estimate its duration in days and identify its immediate predecessors from the generated list.
    
    High-Level Activity: "${description}"
    
    The output must be a JSON array of objects, where each object has "name", "duration" (an integer), and "predecessors" (an array of strings).`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        duration: { type: Type.NUMBER },
                        predecessors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        }
    });

    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }
    
    try {
        const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse sub-tasks JSON:", responseText, e);
        throw new Error("Could not generate sub-tasks. The AI response was invalid.");
    }
};


// --- Analysis Center Functions ---

export const reconcileBOQWithTakeoff = async (boqFile: File, takeoffFile: File): Promise<BOQMatch[]> => {
    const boqCsv = await excelFileToCsvText(boqFile);
    const takeoffCsv = await excelFileToCsvText(takeoffFile);

    const prompt = `Reconcile the two following CSV files: a Bill of Quantities (BOQ) and a Quantity Takeoff sheet. Match items between them even if the descriptions are not identical.
    
    BOQ CSV Data:
    ---
    ${boqCsv}
    ---
    
    Takeoff CSV Data:
    ---
    ${takeoffCsv}
    ---
    
    Return a JSON array of matches. For each match, provide the BOQ item ID, BOQ description, takeoff file name, takeoff description, and a confidence score (0-1).`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        boqItemId: { type: Type.STRING },
                        boqItemDescription: { type: Type.STRING },
                        takeoffFile: { type: Type.STRING },
                        takeoffDescription: { type: Type.STRING },
                        matchConfidence: { type: Type.NUMBER },
                    }
                }
            }
        }
    });

    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }

    try {
        const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse BOQ reconciliation JSON:", responseText, e);
        throw new Error("Could not reconcile BOQs. The AI response was invalid.");
    }
};

export const runComparativeAnalysis = async (baseBoqFile: File, comparisonFile: File): Promise<string> => {
    const baseCsv = await excelFileToCsvText(baseBoqFile);
    const comparisonCsv = await excelFileToCsvText(comparisonFile);
    
    const prompt = `You are a senior cost control engineer. Perform a comparative analysis between the base BOQ and a financial comparison file (e.g., a subcontractor's quotation).
    
    Base BOQ (Our Estimate):
    ---
    ${baseCsv}
    ---
    
    Comparison File (Their Quote):
    ---
    ${comparisonCsv}
    ---
    
    Provide a detailed report in Markdown format. The report should:
    1.  Match items between the two files.
    2.  Highlight significant price differences (variances).
    3.  Identify any items present in one file but missing in the other (scope gap).
    4.  Conclude with a summary and recommendations (e.g., "Negotiate on steel prices," "Clarify scope for electrical works").`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
};

export const analyzeBOQForValueEngineering = async (financials: FinancialItem[]): Promise<string> => {
    const boqSummary = financials.map(item => `- ${item.item} (Unit: ${item.unit}, Total: ${item.total} SAR)`).join('\n');
    const prompt = `Act as a value engineering expert. Analyze the following BOQ summary and provide a detailed report in Markdown format.

BOQ:
${boqSummary}

Your report should:
1.  Identify the top 3-5 items with the highest potential for cost savings.
2.  For each identified item, suggest specific alternative materials, construction methods, or design modifications.
3.  For each suggestion, explain the potential cost savings, impact on quality, and effect on the project schedule.
4.  Conclude with a summary of the most viable value engineering proposals.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
};

export const analyzeBOQForCodeCompliance = async (financials: FinancialItem[]): Promise<string> => {
    const boqSummary = financials.map(item => `- ${item.item}`).join('\n');
    const prompt = `As an expert on the Saudi Building Code (SBC), review the following list of BOQ items.
    
Items:
${boqSummary}

Identify any items that might have specific or critical requirements under the SBC. For each identified item, provide a brief explanation of the relevant SBC chapter or requirement (e.g., "Fire resistance rating for partition walls as per SBC 201," "Seismic design considerations for structural columns as per SBC 301"). Format the response as a Markdown list. If no specific critical requirements are apparent, state that the items appear to be standard.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const getSaudiCodeAnalysis = async (project: Project, itemIds: string[], userQuery: string): Promise<string> => {
    const selectedItems = project.data.financials.filter(item => itemIds.includes(item.id));
    const itemsText = selectedItems.map(item => `- ${item.item} (Unit Price: ${item.unitPrice} SAR)`).join('\n');

    const prompt = `Act as a consultant engineer specializing in the Saudi Building Code (SBC) and local market prices.
    
Project Context: ${project.description}
Selected BOQ Items:
${itemsText}

User Query: "${userQuery}"

Provide a comprehensive answer in Markdown format, addressing the user's query directly while referencing the SBC and current market conditions where applicable.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
};

export const analyzeDrawingImage = async (imageFile: File): Promise<DrawingAnalysisResult> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze the provided engineering drawing. Extract key information and generate a preliminary Bill of Quantities (BOQ).

The output must be a single JSON object with the following structure:
- "summary": A brief one-paragraph summary of the drawing's content.
- "extractedText": A string containing all legible text and dimensions from the drawing.
- "preliminaryBOQ": An array of objects, where each object represents a BOQ item with keys "item", "description", "quantity" (as a number), and "unit".`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    extractedText: { type: Type.STRING },
                    preliminaryBOQ: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                item: { type: Type.STRING },
                                description: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                unit: { type: Type.STRING },
                            }
                        }
                    }
                }
            }
        }
    });

    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }

    try {
        const jsonText = responseText.trim();
        if (!jsonText) {
             throw new Error("AI response was empty.");
        }
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse Drawing Analysis JSON:", responseText, e);
        throw new Error("Could not analyze drawing. The AI response was invalid.");
    }
};

// Fix: Correctly implement analyzeImageWithPrompt, which was corrupted in the original file.
export const analyzeImageWithPrompt = async (prompt: string, imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const fullPrompt = `${prompt}\n\nPlease provide the analysis in Markdown format.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: fullPrompt }, imagePart] },
    });
    return response.text;
};

// Fix: Add all missing functions below to resolve import errors in components.

export const performWhatIfAnalysis = async (schedule: ScheduleTask[], query: string): Promise<WhatIfAnalysisResult> => {
    const scheduleSummary = schedule.map(t => `ID ${t.id}: ${t.name}, Start: ${t.start}, End: ${t.end}, Dependencies: [${t.dependencies.join(', ')}]`).join('\n');

    const prompt = `Given the following project schedule:
---
${scheduleSummary}
---
Analyze the following "what-if" scenario: "${query}"

Provide the impact analysis as a JSON object with the following structure:
- "impactSummary": A concise summary of the impact in Markdown.
- "newEndDate": The new estimated project end date (YYYY-MM-DD).
- "costImpact": A brief description of the likely cost impact (e.g., "Increased labor costs", "No significant impact").
- "criticalPathImpact": A brief description of how the critical path is affected.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    impactSummary: { type: Type.STRING },
                    newEndDate: { type: Type.STRING },
                    costImpact: { type: Type.STRING },
                    criticalPathImpact: { type: Type.STRING },
                }
            }
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse What-If Analysis JSON:", response.text, e);
        throw new Error("Could not perform what-if analysis. The AI response was invalid.");
    }
};

export const calculateCriticalPath = async (schedule: ScheduleTask[]): Promise<CriticalPathAnalysis> => {
    const taskDetails = schedule.map(t => ({
        id: t.id,
        duration: Math.ceil((new Date(t.end).getTime() - new Date(t.start).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        dependencies: t.dependencies
    }));

    const prompt = `Calculate the critical path for the following project tasks.
Tasks (id, duration, dependencies):
${JSON.stringify(taskDetails, null, 2)}

Return a JSON object with:
- "criticalActivityIds": An array of task IDs on the critical path.
- "projectDuration": The total project duration in days.
- "totalFloat": An object mapping each task ID to its total float in days.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    criticalActivityIds: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    projectDuration: { type: Type.NUMBER },
                    totalFloat: { type: Type.OBJECT }
                }
            }
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        console.error("Failed to parse Critical Path JSON:", response.text, e);
        throw new Error("Could not calculate critical path. The AI response was invalid.");
    }
};

export const analyzeBOQSentiments = async (financials: FinancialItem[]): Promise<BOQItemSentiment[]> => {
    const prompt = `Analyze the sentiment of the following Bill of Quantities (BOQ) item descriptions. For each item, classify the sentiment as 'Positive', 'Negative', or 'Neutral'. A negative sentiment might indicate ambiguity, potential for disputes, or non-standard items that require clarification. Provide a brief justification.
BOQ Items:
${financials.map(f => `${f.id}: ${f.item}`).join('\n')}

Return a JSON array of objects with "itemId", "sentiment", and "justification".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemId: { type: Type.STRING },
                        sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                        justification: { type: Type.STRING },
                    }
                }
            }
        }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not analyze BOQ sentiments.");
    }
};

export const analyzeBOQPrices = async (financials: FinancialItem[]): Promise<string> => {
    const prompt = `As a senior quantity surveyor, analyze the unit prices in the following BOQ. Compare them to your general knowledge of current market prices in Saudi Arabia. Provide a Markdown report highlighting items that seem significantly overpriced or underpriced, and suggest potential reasons or negotiation points.
BOQ:
${financials.map(f => `- ${f.item}: ${f.unitPrice} SAR/${f.unit}`).join('\n')}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
};

export const generatePurchaseOrderFromBOQItem = async (item: FinancialItem): Promise<Omit<PurchaseOrder, 'id' | 'total'>> => {
    const prompt = `Generate a draft Purchase Order for the following BOQ item. Suggest a generic supplier name. The output should be a JSON object.
Item: ${item.item}
Quantity: ${item.quantity}
Unit Price: ${item.unitPrice}
`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    supplier: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    unitPrice: { type: Type.NUMBER },
                    orderDate: { type: Type.STRING },
                    expectedDelivery: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['Pending Approval', 'Approved', 'Ordered', 'Delivered', 'Cancelled'] },
                }
            }
        }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not generate purchase order draft.");
    }
};

export const processComplexQuery = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 8192 }
        }
    });
    return response.text;
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio as any,
            outputMimeType: "image/jpeg"
        }
    });
    return response.generatedImages[0].image.imageBytes;
};

export const queryWithMaps = async (prompt: string, location: { latitude: number, longitude: number }): Promise<LocationContact[]> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on my current location, find places related to: "${prompt}". For each place found, extract its name, type (e.g., 'Supplier', 'Contractor'), phone number, address, and Google Maps URI. Format the result as a JSON array of objects.`,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: { latLng: location }
            },
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        address: { type: Type.STRING },
                        mapsUri: { type: Type.STRING },
                    }
                }
            }
        },
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not process location query.");
    }
};

export const generateVideos = async (prompt: string, aspectRatio: string, resolution: string): Promise<string> => {
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            aspectRatio: aspectRatio as any,
            resolution: resolution as any,
        }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation succeeded but no download link was provided.");
    }
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysisResult> => {
    const prompt = `Analyze the sentiment of the following text. Return a JSON object with "sentiment" ('Positive', 'Negative', 'Neutral'), "confidence" (a number between 0 and 1), and "justification" (a brief explanation).
Text:
---
${text}
---`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                    confidence: { type: Type.NUMBER },
                    justification: { type: Type.STRING },
                }
            }
        }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not analyze sentiment.");
    }
};

export const analyzeScribdDocument = async (title: string, query: string): Promise<string> => {
    const prompt = `Using Google Search, find information and summaries about a Scribd document titled "${title}". Based on the information you find, answer the following question: "${query}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    return response.text;
};

export const generateRecoveryPlan = async (project: Project, newEndDate: string, newStartDate?: string): Promise<{ plan: string; revisedSchedule: ScheduleTask[] }> => {
    const prompt = `
    Project: ${project.name}
    Current Schedule: ${JSON.stringify(project.data.schedule)}
    New Target End Date: ${newEndDate}
    ${newStartDate ? `New Target Start Date: ${newStartDate}` : ''}

    Analyze the schedule and generate a recovery plan to meet the new target date. Provide:
    1. A "plan" as a markdown string explaining the strategy (crashing, fast-tracking, re-sequencing).
    2. A "revisedSchedule" as a JSON array of tasks. For each task, include all original fields plus:
       - originalStart, originalEnd: The dates from the current schedule.
       - revisedStart, revisedEnd: The new proposed dates.
       - recoverySuggestion: 'crashed', 'fast-tracked', 're-sequenced', or 'unchanged'.
       The 'start' and 'end' dates in the main task object should be the new revised dates.

    Return a single JSON object: { "plan": "...", "revisedSchedule": [...] }.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });
    try {
        const result = JSON.parse(response.text.trim());
        // Ensure start/end are updated
        result.revisedSchedule = result.revisedSchedule.map((t: any) => ({
            ...t,
            start: t.revisedStart,
            end: t.revisedEnd,
        }));
        return result;
    } catch (e) {
        throw new Error("Could not generate recovery plan.");
    }
};

export const generateRetrofittingPlan = async (defect: Defect): Promise<RetrofittingPlan> => {
    const prompt = `Generate a detailed retrofitting plan for the following structural defect.
Defect: ${JSON.stringify(defect)}

Return a JSON object with:
- "procedure": An array of step-by-step repair instructions.
- "requiredMaterials": An array of objects, each with "name", "quantity", "unit", and "unitCost" (estimated cost in SAR).
- "requiredLaborHours": Estimated total labor hours.
- "estimatedDurationDays": Estimated total duration in days.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not generate retrofitting plan.");
    }
};

export const analyzeBeam = async (input: BeamAnalysisInput): Promise<BeamAnalysisResult> => {
    const prompt = `Perform a structural analysis on a beam with the following properties:
${JSON.stringify(input, null, 2)}

Calculate the reactions, shear force diagram (SFD), bending moment diagram (BMD), and deflection.
Return a JSON object with:
- "maxBendingMoment": { "value": number (kNm), "position": number (m) }
- "maxShearForce": { "value": number (kN), "position": number (m) }
- "maxDeflection": { "value": number (mm), "position": number (m) }
- "summary": A markdown summary of the results, including reaction forces.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not analyze beam.");
    }
};

export const getConceptualEstimate = async (input: ConceptualEstimateInput, currentBoqTotal: number): Promise<ConceptualEstimateResult> => {
    const prompt = `Provide a conceptual cost and duration estimate for the following project:
${JSON.stringify(input)}
The current BOQ total is ${currentBoqTotal} SAR.

Return a JSON object with:
- "estimatedCost": number (SAR)
- "estimatedDuration": number (days)
- "majorResources": array of { "material": string, "quantity": number, "unit": string }
- "assumptions": markdown string of assumptions made.
- "varianceReport": markdown string comparing your "estimatedCost" with the "currentBoqTotal", explaining any significant variance.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not generate conceptual estimate.");
    }
};

export const performDynamicPriceAnalysis = async (financials: FinancialItem[]): Promise<DynamicPriceAnalysisItem[]> => {
    const prompt = `Act as a procurement expert. Analyze the following BOQ items and provide dynamic, competitive unit prices based on current market conditions, quantity discounts, etc.
BOQ:
${JSON.stringify(financials.map(f => ({ id: f.id, name: f.item, quantity: f.quantity, unit: f.unit, unitPrice: f.unitPrice })))}

Return a JSON array, with an object for each item that has a suggested price change. Each object should have: "itemId", "itemName", "originalUnitPrice", "dynamicUnitPrice", and "justification".`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not perform dynamic price analysis.");
    }
};

export const performCuringAnalysis = async (input: CuringAnalysisInput): Promise<CuringAnalysisResult> => {
    const prompt = `Based on ACI standards and general engineering principles, analyze the concrete curing time for the following conditions:
${JSON.stringify(input)}

Return a JSON object with:
- "curingDays": minimum required curing days (number).
- "earlyStrippingPossible": boolean.
- "recommendations": markdown string with detailed recommendations.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not perform curing analysis.");
    }
};

export const generateQualityPlan = async (project: Project, planInput: QualityPlanInput): Promise<QualityPlanResult> => {
    const selectedItems = project.data.financials.filter(f => planInput.itemIds.includes(f.id));
    const prompt = `For a project '${project.name}', generate an Inspection and Test Plan (ITP) in Markdown format.
The ITP should cover these BOQ items:
${selectedItems.map(item => `- ${item.item}`).join('\n')}

It must adhere to these standards:
${planInput.standards.join(', ')}

The output should be a single JSON object with one key: "itpReport", containing the full markdown text.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Could not generate quality plan.");
    }
};
