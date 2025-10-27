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


// --- Service Functions ---

export const extractFinancialItemsFromBOQ = async (file: File): Promise<FinancialItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

export const extractTasksFromXER = async (xerContent: string): Promise<ScheduleTask[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a Primavera P6 expert and data extraction specialist. The following is the FULL text content of a Primavera P6 .XER file.
Your task is to parse this file and extract the schedule activities.
- Focus ONLY on the '%T TASK' and '%T TASKPRED' tables to extract the required data and ignore all other tables.
- Activities are in the 'TASK' table (starts with %T	TASK). Data rows start with %R.
- Predecessors are in the 'TASKPRED' table (starts with %T	TASKPRED). Data rows start with %R.
- From the TASK table, extract: task_id, task_code, task_name, target_start_date, target_end_date.
- From the TASKPRED table, extract: task_id, pred_task_id to build dependencies.
For each task from the TASK table, provide a JSON object with: 'id' (from task_id, as a number), 'wbsCode' (from task_code), 'name' (from task_name), 'start' (formatted as YYYY-MM-DD), 'end' (formatted as YYYY-MM-DD), 'progress' (default to 0), and 'dependencies' (an array of predecessor task_id numbers, derived by matching from the TASKPRED table).
Ensure all dependencies from the TASKPRED table are correctly mapped to their respective tasks.
The final output must be a valid JSON array of these task objects.

XER Content:
---
${xerContent}
---
`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro', // Use a more powerful model for complex parsing
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        wbsCode: { type: Type.STRING },
                        name: { type: Type.STRING },
                        start: { type: Type.STRING },
                        end: { type: Type.STRING },
                        progress: { type: Type.NUMBER },
                        dependencies: { type: Type.ARRAY, items: { type: Type.NUMBER } },
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
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse XER to JSON:", responseText, e);
        throw new Error("Could not parse the .XER file. It might be in an unexpected format or too large.");
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
        endDate.setDate(endDate.getDate() + (task as any).duration -1);

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        const data = JSON.parse(jsonText);
        // This structure must align with the Omit<Project, 'id'> type
        return {
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            data: {
                schedule: data.schedule || [],
                financials: data.financials || [],
                riskRegister: data.riskRegister || [],
                // Initialize all other project data fields as empty
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
                members: [],
            }
        };
    } catch (e) {
        console.error("Failed to parse project from tender JSON:", responseText, e);
        throw new Error("Could not create project from tender text. The AI response was invalid.");
    }
};

export const reconcileBOQWithTakeoff = async (boqFile: File, takeoffFile: File): Promise<BOQMatch[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const boqCsv = await excelFileToCsvText(boqFile);
    const takeoffCsv = await excelFileToCsvText(takeoffFile);

    const prompt = `You are an expert quantity surveyor. Your task is to reconcile a Bill of Quantities (BOQ) file with a takeoff sheet file. Both are provided in CSV format.
    
    For each item in the BOQ, find the best matching item in the takeoff sheet based on the item description, even if the wording is not identical.
    
    BOQ CSV:
    ---
    ${boqCsv}
    ---
    
    Takeoff CSV:
    ---
    ${takeoffCsv}
    ---
    
    Provide the output as a JSON array of objects, where each object represents a match and contains:
    - 'boqItemId': The ID or item number from the BOQ.
    - 'boqItemDescription': The description from the BOQ.
    - 'takeoffFile': The name of the takeoff file ('${takeoffFile.name}').
    - 'takeoffDescription': The matching description from the takeoff sheet.
    - 'matchConfidence': A score from 0 to 1 indicating your confidence in the match.
    `;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
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
        console.error("Failed to parse reconciliation JSON:", responseText, e);
        throw new Error("Could not reconcile BOQs. The AI response was invalid.");
    }
};


export const runComparativeAnalysis = async (baseBoqFile: File, comparisonFile: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const baseCsv = await excelFileToCsvText(baseBoqFile);
    const comparisonCsv = await excelFileToCsvText(comparisonFile);
    
    const prompt = `Act as a senior financial analyst for construction projects. You are given two Bill of Quantities (BOQ) in CSV format.
    
    1.  Base BOQ (File: ${baseBoqFile.name}): This is the project's main budget.
    2.  Comparison BOQ (File: ${comparisonFile.name}): This could be a subcontractor's quote, a revised budget, or actual costs.

    Base BOQ CSV:
    ---
    ${baseCsv}
    ---
    
    Comparison BOQ CSV:
    ---
    ${comparisonCsv}
    ---
    
    Your task is to generate a detailed comparative analysis report in Markdown format. The report should include:
    -   A summary of total cost differences.
    -   A table showing a side-by-side comparison of key items, highlighting significant price variances (both positive and negative).
    -   An analysis of the potential reasons for these variances.
    -   Recommendations on whether the comparison BOQ is favorable and areas for negotiation.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Use pro model for more in-depth analysis
        contents: prompt,
    });
    return response.text;
};

export const generateDocumentDraft = async (project: Project, userPrompt: string, category: string): Promise<{title: string, content: string}> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a senior civil engineer. You need to draft a technical document for a project.

Project Context:
- Name: ${project.name}
- Description: ${project.description}
- Document Category: ${category}

User Request: "${userPrompt}"

Based on the user's request, generate a professional document draft. The output must be a JSON object with two keys:
1. 'title': A suitable title for the document.
2. 'content': The full content of the document in well-formatted Markdown.`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
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

export const analyzeDrawingImage = async (imageFile: File): Promise<DrawingAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `You are an expert quantity surveyor analyzing an engineering drawing.
Analyze the provided image and generate a JSON object containing:
1.  'summary': A brief summary of what the drawing represents (e.g., "Foundation plan for a residential villa").
2.  'extractedText': All legible text, dimensions, and labels from the drawing as a single string.
3.  'preliminaryBOQ': A preliminary Bill of Quantities based on the drawing. This should be an array of objects, each with 'item', 'description', 'quantity' (estimated from drawing), and 'unit'.

Example BOQ item: { "item": "Reinforced Concrete", "description": "Footing F1 (2.0x2.0x0.5m)", "quantity": 2.0, "unit": "m3" }
Provide only the JSON object as the response.`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: {
             responseMimeType: "application/json",
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
        console.error("Failed to parse drawing analysis JSON:", responseText, e);
        throw new Error("Could not analyze the drawing. The AI response was invalid.");
    }
};

export const performWhatIfAnalysis = async (schedule: ScheduleTask[], query: string): Promise<WhatIfAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const scheduleSummary = schedule.map(t => ({ id: t.id, name: t.name, start: t.start, end: t.end, dependencies: t.dependencies }) );
    
    const prompt = `Act as a senior project planner. Given the following project schedule (summary) and a "what-if" scenario, provide an analysis.

Current Schedule Summary:
${JSON.stringify(scheduleSummary, null, 2)}

"What-If" Scenario:
"${query}"

Your response must be a JSON object with the following structure:
- 'impactSummary': A detailed markdown text explaining the consequences of the scenario.
- 'newEndDate': The new estimated project end date in 'YYYY-MM-DD' format.
- 'costImpact': A brief string describing the likely cost impact (e.g., "Increased labor costs", "No significant impact").
- 'criticalPathImpact': A brief string on how the critical path is affected.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
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
        console.error("Failed to parse what-if analysis JSON:", responseText, e);
        throw new Error("Could not perform the analysis. The AI response was invalid.");
    }
};

export const calculateCriticalPath = async (schedule: ScheduleTask[]): Promise<CriticalPathAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const scheduleData = schedule.map(t => ({ id: t.id, name: t.name, start: t.start, end: t.end, dependencies: t.dependencies }));

    const prompt = `Analyze the following project schedule to determine the critical path using the Critical Path Method (CPM).
    
Schedule Data:
${JSON.stringify(scheduleData, null, 2)}

Provide the output as a JSON object containing:
- 'criticalActivityIds': An array of task IDs that are on the critical path.
- 'projectDuration': The total duration of the project in days.
- 'totalFloat': An object mapping each task ID to its total float in days.`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
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
        console.error("Failed to parse CPM analysis JSON:", responseText, e);
        throw new Error("Could not analyze critical path. The AI response was invalid.");
    }
};

export const generateSubTasksFromDescription = async (description: string): Promise<{name: string, duration: number, predecessors: string[]}[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as an expert construction planner. A main activity is described as: "${description}".
    
Break this activity down into a logical sequence of sub-tasks. For each sub-task, provide a name, an estimated duration in days, and a list of predecessor sub-task names it depends on from the list you are creating.

Format the output as a JSON array of objects.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
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

export const analyzeBOQForValueEngineering = async (financials: FinancialItem[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const boqSummary = financials.slice(0, 20).map(item => `- ${item.item} (Unit: ${item.unit}, Unit Price: ${item.unitPrice})`).join('\n');
    const prompt = `As a value engineering expert, analyze the following summary of a Bill of Quantities (BOQ).

BOQ Summary:
${boqSummary}

Generate a value engineering report in Markdown format. The report should identify:
1.  **Cost Reduction Opportunities:** Suggest alternative materials or construction methods that could reduce costs without compromising quality for specific items.
2.  **Potential Risks:** Highlight any items with unusually high or low prices that could indicate a risk or an error.
3.  **General Recommendations:** Provide overall advice for optimizing the project's value.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const analyzeBOQForCodeCompliance = async (financials: FinancialItem[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const boqSummary = financials.slice(0, 15).map(item => `- ${item.item}`).join('\n');
    const prompt = `Act as a consultant specializing in the Saudi Building Code (SBC). Review the following items from a project's Bill of Quantities.

BOQ Items:
${boqSummary}

Generate a report in Markdown that highlights potential areas of concern regarding compliance with the Saudi Building Code. For each point, mention the item and the potential SBC chapter or topic that should be double-checked (e.g., SBC 301 for structural loads, SBC 801 for electrical).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const getSaudiCodeAnalysis = async (project: Project, itemIds: string[], userQuery: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const selectedItems = project.data.financials.filter(item => itemIds.includes(item.id));
    const itemsContext = selectedItems.map(item => `- Item: ${item.item}, Unit Price: ${item.unitPrice} SAR, Quantity: ${item.quantity} ${item.unit}`).join('\n');

    const prompt = `You are a specialized AI assistant acting as a Saudi Building Code (SBC) and construction project consultant.
    
Project Context:
- Name: ${project.name}
- Description: ${project.description}

Selected BOQ Items for Analysis:
${itemsContext}

User's Query:
"${userQuery}"

Please provide a detailed and professional response in Markdown format, addressing the user's query by referencing the provided BOQ items and your knowledge of the Saudi Building Code and common construction practices in Saudi Arabia.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const analyzeBOQSentiments = async (financials: FinancialItem[]): Promise<BOQItemSentiment[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const itemsToAnalyze = financials.map(item => ({ id: item.id, description: item.item, unitPrice: item.unitPrice }));
    const prompt = `Analyze the "sentiment" of the following Bill of Quantities (BOQ) items from a project manager's perspective.
    
A 'Negative' sentiment means the item description implies high risk, complexity, potential for disputes, or has an unusually high price that could be problematic.
A 'Positive' sentiment implies a standard, low-risk item.
A 'Neutral' sentiment is for items that don't fall into the other categories.

BOQ Items:
${JSON.stringify(itemsToAnalyze, null, 2)}

Provide the output as a JSON array where each object has 'itemId', 'sentiment' ('Positive', 'Negative', or 'Neutral'), and a brief 'justification'.`;
    
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
                        itemId: { type: Type.STRING },
                        sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                        justification: { type: Type.STRING },
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
        console.error("Failed to parse BOQ sentiment JSON:", responseText, e);
        throw new Error("Could not analyze BOQ sentiments. The AI response was invalid.");
    }
};

export const analyzeBOQPrices = async (financials: FinancialItem[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const itemsToAnalyze = financials.map(item => ({ id: item.id, description: item.item, unitPrice: item.unitPrice, unit: item.unit }));
    const prompt = `Act as a pricing expert for the Saudi construction market. Analyze the following BOQ items and their unit prices.
    
BOQ Items:
${JSON.stringify(itemsToAnalyze, null, 2)}

Provide a Markdown report that:
1.  Identifies items that seem significantly overpriced or underpriced compared to current market rates.
2.  Provides a brief justification for your assessment.
3.  Suggests items where negotiation might be most fruitful.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const generatePurchaseOrderFromBOQItem = async (item: FinancialItem): Promise<Omit<PurchaseOrder, 'id' | 'total'>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create a draft for a Purchase Order based on the following Bill of Quantities item.
    
BOQ Item:
- Description: "${item.item}"
- Quantity: ${item.quantity} ${item.unit}
- Unit Price: ${item.unitPrice} SAR

Suggest a generic supplier name if not obvious from the description. Set the order date to today and the expected delivery date 14 days from now.

Provide the output as a JSON object.`;

    const responseStream = await ai.models.generateContentStream({
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
        console.error("Failed to parse PO draft JSON:", responseText, e);
        throw new Error("Could not generate PO draft. The AI response was invalid.");
    }
};

export const generateChecklist = async (dailyActivities: string): Promise<Omit<ChecklistItem, 'id' | 'status'>[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the following daily construction activities, generate a checklist with 3-5 relevant items for both 'QA/QC' (Quality Assurance/Quality Control) and 'HSE' (Health, Safety, and Environment).

Today's Activities: "${dailyActivities}"

Provide the output as a JSON array of objects. Each object should have 'category' ('QA/QC' or 'HSE') and 'text' (the checklist item description).`;

     const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, enum: ['QA/QC', 'HSE'] },
                        text: { type: Type.STRING }
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
        const items = JSON.parse(jsonText);
        return items.map((item: any) => ({
            ...item,
            id: `chk-${uuidv4()}`,
            status: 'Pending'
        }))

    } catch (e) {
        console.error("Failed to parse checklist JSON:", responseText, e);
        throw new Error("Could not generate checklist. The AI response was invalid.");
    }
};

export const generateRecoveryPlan = async (project: Project, newEndDate: string, newStartDate?: string): Promise<{ plan: string; revisedSchedule: ScheduleTask[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const scheduleContext = project.data.schedule.map(t => ({
        id: t.id,
        name: t.name,
        start: t.start,
        end: t.end,
        progress: t.progress,
        dependencies: t.dependencies
    }));

    const scenario = newStartDate 
        ? `The project needs to be completely rescheduled to start on ${newStartDate} and finish by ${newEndDate}.`
        : `The project is delayed and needs a recovery plan to meet a new target end date of ${newEndDate}.`;

    const prompt = `Act as an expert project planner. You are tasked with creating a recovery or rescheduling plan for a project.

Project Context:
- Name: ${project.name}
- Original Start: ${project.startDate}
- Original End: ${project.endDate}

Scenario: ${scenario}

Current Schedule:
${JSON.stringify(scheduleContext, null, 2)}

Your response must be a single JSON object with two keys:
1.  'plan': A detailed recovery plan in Markdown format. This plan should explain the strategy (e.g., crashing, fast-tracking, re-sequencing), identify which activities are affected, and justify the changes.
2.  'revisedSchedule': A complete, new schedule as a JSON array. Each task object must include: id, name, start, end, progress, dependencies, AND 'originalStart', 'originalEnd', 'revisedStart', 'revisedEnd', and a 'recoverySuggestion' field ('crashed', 'fast-tracked', 're-sequenced', or 'unchanged'). The new start/end dates should reflect the recovery plan. Ensure all dates are in 'YYYY-MM-DD' format.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    plan: { type: Type.STRING },
                    revisedSchedule: {
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
                                originalStart: { type: Type.STRING },
                                originalEnd: { type: Type.STRING },
                                revisedStart: { type: Type.STRING },
                                revisedEnd: { type: Type.STRING },
                                recoverySuggestion: { type: Type.STRING, enum: ['crashed', 'fast-tracked', 're-sequenced', 'unchanged']}
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
        console.error("Failed to parse recovery plan JSON:", responseText, e);
        throw new Error("Could not generate recovery plan. The AI response was invalid.");
    }
};

export const processComplexQuery = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 24576 } }
    });
    return response.text;
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio,
        },
    });
    return response.generatedImages[0].image.imageBytes;
};

export const generateVideos = async (prompt: string, aspectRatio: '16:9' | '9:16', resolution: '1080p' | '720p'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
            numberOfVideos: 1,
            resolution,
            aspectRatio
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const queryWithMaps = async (prompt: string, location: { latitude: number, longitude: number }): Promise<LocationContact[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: location } }
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!groundingChunks || !Array.isArray(groundingChunks)) {
        throw new Error("No location data found in the response.");
    }
    
    const contacts: LocationContact[] = groundingChunks
        .filter(chunk => chunk.maps)
        .map(chunk => ({
            name: chunk.maps.title || 'Unknown',
            type: chunk.maps.placeAnswerSources?.placeDetails?.types?.[0] || 'Place',
            phone: chunk.maps.placeAnswerSources?.placeDetails?.nationalPhoneNumber || '',
            address: chunk.maps.placeAnswerSources?.placeDetails?.formattedAddress || '',
            mapsUri: chunk.maps.uri,
        }));
        
    return contacts;
};

export const analyzeBeam = async (input: BeamAnalysisInput): Promise<BeamAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a structural analysis of a simple beam based on the following JSON input. Provide the results in JSON format.
    
Input:
${JSON.stringify(input, null, 2)}

Calculate the maximum bending moment, shear force, and deflection. Provide a summary of the results.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    maxBendingMoment: {
                        type: Type.OBJECT,
                        properties: { value: { type: Type.NUMBER }, position: { type: Type.NUMBER } }
                    },
                    maxShearForce: {
                        type: Type.OBJECT,
                        properties: { value: { type: Type.NUMBER }, position: { type: Type.NUMBER } }
                    },
                    maxDeflection: {
                        type: Type.OBJECT,
                        properties: { value: { type: Type.NUMBER }, position: { type: Type.NUMBER } }
                    },
                    summary: { type: Type.STRING },
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
        if (!jsonText) throw new Error("AI response was empty.");
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse beam analysis JSON:", responseText, e);
        throw new Error("Could not analyze the beam. The AI response was invalid.");
    }
};

export const getConceptualEstimate = async (input: ConceptualEstimateInput, currentBoqTotal?: number): Promise<ConceptualEstimateResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as an expert cost estimator. Based on the following project data for the Saudi market, provide a conceptual cost and duration estimate.
    
Input:
${JSON.stringify(input, null, 2)}
${currentBoqTotal && currentBoqTotal > 0 ? `\nThe current project BOQ total is ${currentBoqTotal.toLocaleString()} SAR. Generate a variance report comparing your conceptual estimate to this BOQ total.` : ''}

The output must be a JSON object with: 'estimatedCost' (number), 'estimatedDuration' (in days), 'majorResources' (array of {material, quantity, unit}), 'assumptions' (markdown string), and 'varianceReport' (markdown string, if applicable).`;
    
     const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    estimatedCost: { type: Type.NUMBER },
                    estimatedDuration: { type: Type.NUMBER },
                    majorResources: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                material: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                unit: { type: Type.STRING }
                            }
                        }
                    },
                    assumptions: { type: Type.STRING },
                    varianceReport: { type: Type.STRING },
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
        if (!jsonText) throw new Error("AI response was empty.");
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse conceptual estimate JSON:", responseText, e);
        throw new Error("Could not generate conceptual estimate. The AI response was invalid.");
    }
};

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the sentiment of the following text from a construction project context. Is it Positive, Negative, or Neutral?
    
Text: "${text}"

Provide the output as a JSON object with 'sentiment', 'confidence' (0-1), and 'justification'.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
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
    let responseText = '';
    for await (const chunk of responseStream) { responseText += chunk.text; }
    try {
        const jsonText = responseText.trim();
        if (!jsonText) throw new Error("AI response was empty.");
        return JSON.parse(jsonText);
    } catch (e) {
        throw new Error("Could not analyze sentiment. Invalid AI response.");
    }
};

export const performDynamicPriceAnalysis = async (financials: FinancialItem[]): Promise<DynamicPriceAnalysisItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as an advanced pricing engine for the Saudi construction market. Given the following BOQ items, propose a dynamic, competitive unit price for each.
    
Consider factors like:
-   Current market fluctuations for materials (e.g., steel, concrete).
-   Quantity discounts.
-   Project location (assume Riyadh unless stated otherwise).
-   Item complexity.

BOQ Items:
${JSON.stringify(financials.map(f => ({ id: f.id, description: f.item, quantity: f.quantity, unit: f.unit, unitPrice: f.unitPrice })), null, 2)}

Provide a JSON array where each object contains 'itemId', 'itemName', 'originalUnitPrice', 'dynamicUnitPrice', and a brief 'justification' for the proposed price.`;

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
                        itemId: { type: Type.STRING },
                        itemName: { type: Type.STRING },
                        originalUnitPrice: { type: Type.NUMBER },
                        dynamicUnitPrice: { type: Type.NUMBER },
                        justification: { type: Type.STRING }
                    }
                }
            }
        }
    });
    
    let responseText = '';
    for await (const chunk of responseStream) { responseText += chunk.text; }
    try {
        const jsonText = responseText.trim();
        if (!jsonText) throw new Error("AI response was empty.");
        return JSON.parse(jsonText);
    } catch (e) {
        throw new Error("Could not perform dynamic price analysis. Invalid AI response.");
    }
};

export const performCuringAnalysis = async (input: CuringAnalysisInput): Promise<CuringAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on ACI guidelines and standard engineering practices for concrete, analyze the following scenario for concrete curing.
    
Input: ${JSON.stringify(input, null, 2)}
    
Calculate the minimum required curing days and determine if early stripping of formwork is possible. Provide recommendations.
The output must be a JSON object with 'curingDays' (number), 'earlyStrippingPossible' (boolean), and 'recommendations' (markdown string).`;

     const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    curingDays: { type: Type.NUMBER },
                    earlyStrippingPossible: { type: Type.BOOLEAN },
                    recommendations: { type: Type.STRING }
                }
            }
        }
    });

    let responseText = '';
    for await (const chunk of responseStream) { responseText += chunk.text; }
    try {
        const jsonText = responseText.trim();
        if (!jsonText) throw new Error("AI response was empty.");
        return JSON.parse(jsonText);
    } catch (e) {
        throw new Error("Could not perform curing analysis. Invalid AI response.");
    }
};

export const generateQualityPlan = async (project: Project, input: QualityPlanInput): Promise<QualityPlanResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const itemDescriptions = project.data.financials
        .filter(f => input.itemIds.includes(f.id))
        .map(f => f.item);

    const prompt = `Generate a detailed Inspection and Test Plan (ITP) for the following construction activities, referencing the specified standards.
    
Activities:
${itemDescriptions.join('\n')}

Reference Standards:
${input.standards.join(', ')}

The output must be a JSON object containing a single key 'itpReport', which holds the complete ITP in a well-structured Markdown format, including tables for inspection stages, responsible parties, acceptance criteria, and records.`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    itpReport: { type: Type.STRING }
                }
            }
        }
    });

    let responseText = '';
    for await (const chunk of responseStream) { responseText += chunk.text; }
    try {
        const jsonText = responseText.trim();
        if (!jsonText) throw new Error("AI response was empty.");
        return JSON.parse(jsonText);
    } catch (e) {
        throw new Error("Could not generate quality plan. Invalid AI response.");
    }
};

export const generateRetrofittingPlan = async (defect: Defect): Promise<Omit<RetrofittingPlan, 'totalCost'>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a structural retrofitting expert. A defect has been identified in a building.
    
Defect Details:
${JSON.stringify(defect, null, 2)}

Generate a detailed retrofitting plan. The output must be a JSON object containing:
- 'procedure': An array of strings with step-by-step repair instructions.
- 'requiredMaterials': An array of objects, each with 'name', 'quantity', 'unit', and 'unitCost'.
- 'requiredLaborHours': An estimated number of man-hours.
- 'estimatedDurationDays': An estimated duration in days.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    procedure: { type: Type.ARRAY, items: { type: Type.STRING } },
                    requiredMaterials: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                unit: { type: Type.STRING },
                                unitCost: { type: Type.NUMBER },
                            }
                        }
                    },
                    requiredLaborHours: { type: Type.NUMBER },
                    estimatedDurationDays: { type: Type.NUMBER },
                }
            }
        }
    });
    
    let responseText = '';
    for await (const chunk of responseStream) { responseText += chunk.text; }
    try {
        const jsonText = responseText.trim();
        if (!jsonText) throw new Error("AI response was empty.");
        return JSON.parse(jsonText);
    } catch (e) {
        throw new Error("Could not generate retrofitting plan. Invalid AI response.");
    }
};

export const analyzeScribdDocument = async (title: string, query: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I have a document from Scribd titled "${title}". Please answer the following question about it: "${query}"`,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    return response.text;
};

export const analyzeImageWithPrompt = async (prompt: string, image: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(image);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
    });
    return response.text;
};