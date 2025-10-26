import { GoogleGenAI, Type } from "@google/genai";
// Fix: Add ScheduleTaskStatus and ScheduleTaskPriority to the type import.
import type { Project, FinancialItem, ScheduleTask, Risk, BeamAnalysisInput, BeamAnalysisResult, DrawingAnalysisResult, WhatIfAnalysisResult, CriticalPathAnalysis, DetailedCostBreakdown, CostBreakdownItem, BOQItemSentiment, PurchaseOrder, LocationContact, SentimentAnalysisResult, BeamSupport, BeamLoad, DynamicPriceAnalysisItem, CuringAnalysisInput, CuringAnalysisResult, ConceptualEstimateInput, ConceptualEstimateResult, QualityPlanInput, QualityPlanResult, ScheduleTaskStatus, ScheduleTaskPriority, Supplier, Quote, StructuralAssessment, BOQMatch, Defect, RetrofittingPlan } from "../types";
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

export const generateWBS = async (project: Project): Promise<string> => {
    const prompt = `Generate a Work Breakdown Structure (WBS) in markdown list format for a project with the following details:
    Name: ${project.name}
    Description: ${project.description}
    Start Date: ${project.startDate}
    
    The WBS should be hierarchical and cover all major phases from planning to closeout.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateWBSFromSchedule = async (schedule: ScheduleTask[]): Promise<string> => {
    const taskNames = schedule.map(t => t.name).join('\n - ');
    const prompt = `Given the following list of tasks from a project schedule, generate a hierarchical Work Breakdown Structure (WBS) in markdown list format. Group related tasks under appropriate parent items.

Tasks:
- ${taskNames}
`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};


// --- RULE-BASED COST BREAKDOWN ---
export const getCostBreakdown = async (item: FinancialItem): Promise<DetailedCostBreakdown> => {
    const breakdown: { items: CostBreakdownItem[], overheadsPercentage: number, profitPercentage: number } = {
        items: [],
        overheadsPercentage: 15,
        profitPercentage: 10,
    };

    if (item.item.includes('Concrete') || item.item.includes('خرسانة') || item.item.includes('Column') || item.item.includes('Slab')) {
        breakdown.items.push({ costType: 'مواد', description: 'أسمنت', quantity: 0.4, unit: 'طن', estimatedUnitPrice: 350, estimatedTotal: 0.4 * 350 });
        breakdown.items.push({ costType: 'مواد', description: 'حديد تسليح', quantity: 100, unit: 'كجم', estimatedUnitPrice: 3.5, estimatedTotal: 100 * 3.5 });
        breakdown.items.push({ costType: 'عمالة', description: 'نجار', quantity: 8, unit: 'ساعة', estimatedUnitPrice: 25, estimatedTotal: 8 * 25 });
        breakdown.items.push({ costType: 'عمالة', description: 'حداد', quantity: 8, unit: 'ساعة', estimatedUnitPrice: 25, estimatedTotal: 8 * 25 });
        breakdown.items.push({ costType: 'معدات', description: 'خلاطة', quantity: 4, unit: 'ساعة', estimatedUnitPrice: 100, estimatedTotal: 4 * 100 });
    } else if (item.item.includes('Excavation') || item.item.includes('حفر')) {
        breakdown.items.push({ costType: 'معدات', description: 'حفار', quantity: 8, unit: 'ساعة', estimatedUnitPrice: 300, estimatedTotal: 8 * 300 });
        breakdown.items.push({ costType: 'عمالة', description: 'عامل', quantity: 8, unit: 'ساعة', estimatedUnitPrice: 20, estimatedTotal: 8 * 20 });
    } else {
        // Fallback for other items
        const materialCost = item.unitPrice * 0.5;
        const laborCost = item.unitPrice * 0.3;
        const equipmentCost = item.unitPrice * 0.2;
        breakdown.items.push({ costType: 'مواد', description: 'مواد متنوعة', quantity: 1, unit: 'مقطوعية', estimatedUnitPrice: materialCost, estimatedTotal: materialCost });
        breakdown.items.push({ costType: 'عمالة', description: 'عمالة متنوعة', quantity: 1, unit: 'مقطوعية', estimatedUnitPrice: laborCost, estimatedTotal: laborCost });
        breakdown.items.push({ costType: 'معدات', description: 'معدات متنوعة', quantity: 1, unit: 'مقطوعية', estimatedUnitPrice: equipmentCost, estimatedTotal: equipmentCost });
    }
    
    // Normalize totals to match unit price
    const estimatedDirectCost = breakdown.items.reduce((sum, i) => sum + i.estimatedTotal, 0);
    const scaleFactor = item.unitPrice / (estimatedDirectCost * (1 + (breakdown.overheadsPercentage / 100)) * (1 + (breakdown.profitPercentage / 100)));
    
    breakdown.items = breakdown.items.map(i => ({
        ...i,
        estimatedUnitPrice: i.estimatedUnitPrice * scaleFactor,
        estimatedTotal: i.estimatedTotal * scaleFactor
    }));

    return breakdown;
};

// --- NEWLY IMPLEMENTED AI FUNCTIONS ---

export const createProjectFromTenderText = async (tenderText: string): Promise<Omit<Project, 'id'>> => {
    const prompt = `Analyze the following tender document text and extract the project details. Provide the output as a JSON object with keys: "name", "description", and "startDate". The start date should be a reasonable estimate based on the text, defaulting to next month if not specified.

Tender Text:
---
${tenderText}
---
`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    const result = JSON.parse(response.text);
    return {
        name: result.name || 'New Project from Tender',
        description: result.description || '',
        startDate: result.startDate || new Date().toISOString().split('T')[0],
        data: {
            schedule: [], financials: [], riskRegister: [], siteLog: [], engineeringDocs: [], drawings: [], drawingFolders: [],
            purchaseOrders: [], items: [], workflow: { projectCharter: '', wbs: '' }, boqReconciliation: [],
            comparativeAnalysisReport: '', assistantSettings: { persona: 'projectManager', tone: 'formal', style: 'concise' },
            objectives: [], keyResults: [], subcontractors: [], subcontractorInvoices: [], structuralAssessments: [], suppliers: [], quotes: []
        },
    };
};

export const suggestRisks = async (project: Project): Promise<Omit<Risk, 'id' | 'status'>[]> => {
    const prompt = `For a construction project named "${project.name}" with description "${project.description}", suggest 5 potential risks. For each risk, provide a description, category ('Financial', 'Technical', 'Schedule', 'Safety', 'Contractual'), probability ('Low', 'Medium', 'High'), impact ('Low', 'Medium', 'High'), and a mitigationPlan. Return as a JSON array.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const analyzeFinancials = async (financials: FinancialItem[]): Promise<string> => {
    const summary = financials.slice(0, 10).map(i => `${i.item}: ${i.total}`).join('\n');
    const prompt = `Analyze the following financial items from a Bill of Quantities. Provide a brief summary, identify the top 3 cost drivers, and point out any potential financial risks or opportunities (e.g., items with very high costs, unusual unit prices). Format as markdown.\n\n${summary}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const getSaudiCodeAnalysis = async (project: Project, itemIds: string[], userQuery: string): Promise<string> => {
    const items = project.data.financials.filter(i => itemIds.includes(i.id));
    const itemsText = items.map(i => `- ${i.item} (Quantity: ${i.quantity} ${i.unit}, Unit Price: ${i.unitPrice})`).join('\n');
    const prompt = `As a Saudi Building Code (SBC) consultant, answer the user's query regarding the following BOQ items for the project "${project.name}".\n\nItems:\n${itemsText}\n\nUser Query: "${userQuery}"\n\nProvide a detailed answer referencing SBC sections where applicable. Format as markdown.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const analyzeBOQForCodeCompliance = async (financials: FinancialItem[]): Promise<string> => {
    const prompt = `Review the following Bill of Quantities items and identify any potential non-compliance issues or items that require special attention according to the Saudi Building Code (SBC). For each identified item, explain the potential issue. If no issues are found, state that. Format as markdown.\n\nItems:\n${financials.map(i => `- ${i.item}`).join('\n')}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const analyzeBOQSentiments = async (financials: FinancialItem[]): Promise<BOQItemSentiment[]> => {
    const prompt = `Analyze the descriptions of the following BOQ items for potential ambiguity, risk, or unusual wording (sentiment). For each item, provide its id, sentiment ('Positive', 'Negative', 'Neutral'), and a brief justification. Return as a JSON array.\n\nItems:\n${financials.map(i => JSON.stringify({id: i.id, item: i.item})).join('\n')}`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
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
        console.error("Failed to parse BOQ Sentiments JSON:", responseText, e);
        throw new Error("Could not analyze BOQ sentiments. The AI response was invalid.");
    }
};

export const analyzeBOQPrices = async (financials: FinancialItem[]): Promise<string> => {
    const prompt = `Analyze the unit prices in this BOQ. Identify any prices that seem unusually high or low for the Saudi market and suggest what could be the reason. Format as a markdown report.\n\nBOQ:\n${financials.map(i => `- ${i.item}: ${i.unitPrice} SAR/${i.unit}`).join('\n')}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generatePurchaseOrderFromBOQItem = async (item: FinancialItem): Promise<Omit<PurchaseOrder, 'id' | 'total'>> => {
    return {
        itemName: item.item,
        supplier: '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pending Approval',
    };
};

export const analyzeSitePhoto = async (userNotes: string, imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `As a construction site manager, analyze the attached site photo. Consider the user's notes: "${userNotes}". Provide a report in markdown covering:
- Progress Assessment
- Quality of Work
- Safety Observations
- Materials on Site`;
    const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [{ parts: [{ text: prompt }, imagePart] }],
    });
    return response.text;
};

export const generateDocumentDraft = async (project: Project, prompt: string, categoryName: string): Promise<{ title: string; content: string }> => {
    const fullPrompt = `For a project named "${project.name}", generate a document draft for the category "${categoryName}". User prompt: "${prompt}". The output should be a JSON object with "title" and "content" (in markdown).`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const performWhatIfAnalysis = async (schedule: ScheduleTask[], query: string): Promise<WhatIfAnalysisResult> => {
    const prompt = `Given a project schedule, perform a "what-if" analysis based on the user's query. Provide a summary of the impact, the new estimated end date, cost impact, and critical path impact. Return a JSON object with keys: "impactSummary", "newEndDate", "costImpact", "criticalPathImpact".\n\nSchedule Summary: ${schedule.length} tasks, from ${schedule[0]?.start} to ${schedule[schedule.length-1]?.end}\n\nQuery: "${query}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const calculateCriticalPath = async (schedule: ScheduleTask[]): Promise<CriticalPathAnalysis> => {
    const prompt = `Calculate the critical path for the following project schedule. The schedule lists tasks with id, duration (end-start), and dependencies. Return a JSON object with "criticalActivityIds" (array of numbers), "projectDuration" (number), and "totalFloat" (object mapping task id to float days).\n\nTasks:\n${schedule.map(t => JSON.stringify({id: t.id, start:t.start, end:t.end, dependencies: t.dependencies})).join('\n')}`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
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
        console.error("Failed to parse Critical Path JSON:", responseText, e);
        throw new Error("Could not calculate critical path. The AI response was invalid.");
    }
};

export const reconcileBOQWithTakeoff = async (boqFile: File, takeoffFile: File): Promise<BOQMatch[]> => {
    const boqCsv = await excelFileToCsvText(boqFile);
    const takeoffCsv = await excelFileToCsvText(takeoffFile);

    const prompt = `Reconcile the two attached CSV data sets: a Bill of Quantities (BOQ) and a Quantity Takeoff. Match items between them, even if descriptions differ. For each match, provide the BOQ item ID (if available, otherwise use row index), BOQ description, takeoff file name, takeoff description, and a match confidence score (0-1). Return a JSON array.

---
BOQ CSV Data from file: ${boqFile.name}
${boqCsv}
---
Takeoff CSV Data from file: ${takeoffFile.name}
${takeoffCsv}
---
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
        const result = JSON.parse(jsonText);
        // Add the takeoff filename to the result if not present
        return result.map((item: any) => ({ ...item, takeoffFile: item.takeoffFile || takeoffFile.name }));
    } catch (e) {
        console.error("Failed to parse reconciliation JSON:", responseText, e);
        throw new Error("Could not reconcile BOQ with takeoff. The AI response was invalid.");
    }
};

export const runComparativeAnalysis = async (boqFile: File, comparisonFile: File): Promise<string> => {
    const boqCsv = await excelFileToCsvText(boqFile);
    const comparisonCsv = await excelFileToCsvText(comparisonFile);
    
    const prompt = `Analyze and compare the two attached financial documents (a base BOQ and a comparison file), provided as CSV data. Generate a detailed markdown report highlighting key differences in quantities, unit prices, and totals. Provide insights on potential savings or overruns.

---
Base BOQ CSV Data from file: ${boqFile.name}
${boqCsv}
---
Comparison File CSV Data from file: ${comparisonFile.name}
${comparisonCsv}
---
`;
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let responseText = '';
    for await (const chunk of responseStream) {
        responseText += chunk.text;
    }

    return responseText;
};

export const analyzeDrawingImage = async (imageFile: File): Promise<DrawingAnalysisResult> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze the attached engineering drawing. Provide a JSON object with: "summary" (a brief description), "extractedText" (key text and dimensions), and "preliminaryBOQ" (an array of items with item, description, quantity, and unit).`;
    const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [{ parts: [{ text: prompt }, imagePart] }],
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const processComplexQuery = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 8192 } },
    });
    return response.text;
};

export const analyzeImageWithPrompt = async (prompt: string, imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [{ parts: [{ text: prompt }, imagePart] }],
    });
    return response.text;
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1, aspectRatio, outputMimeType: 'image/jpeg' },
    });
    return response.generatedImages[0].image.imageBytes;
};

export const generateVideos = async (prompt: string, aspectRatio: '16:9' | '9:16', resolution: '1080p' | '720p'): Promise<string> => {
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: { numberOfVideos: 1, resolution, aspectRatio },
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to produce a download link.");
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
};

export const queryWithMaps = async (prompt: string, location: { latitude: number; longitude: number }): Promise<LocationContact[]> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: location } }
        },
    });
    
    // The response text is often a natural language summary. The structured data is in grounding chunks.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!chunks) return [];
    
    return chunks.map((chunk: any) => ({
        name: chunk.maps?.title || 'Unknown',
        type: chunk.maps?.placeSubCategory || undefined,
        phone: chunk.maps?.phoneNumber || undefined,
        address: chunk.maps?.address || undefined,
        mapsUri: chunk.maps?.uri || undefined,
    }));
};

export const getConceptualEstimate = async (input: ConceptualEstimateInput, currentBoqTotal: number): Promise<ConceptualEstimateResult> => {
    const prompt = `Provide a conceptual cost and duration estimate for a construction project with these details: ${JSON.stringify(input)}. The current detailed BOQ total is ${currentBoqTotal > 0 ? currentBoqTotal : 'not available'}.
    Return a JSON object with:
    - "estimatedCost": number
    - "estimatedDuration": number (in days)
    - "majorResources": array of {material, quantity, unit}
    - "assumptions": markdown string
    - "varianceReport": markdown string comparing the conceptual estimate to the current BOQ total.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysisResult> => {
    const prompt = `Analyze the sentiment of the following text. Return a JSON object with "sentiment" ('Positive', 'Negative', 'Neutral'), "confidence" (0-1), and "justification" (string).\n\nText: "${text}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const performDynamicPriceAnalysis = async (financials: FinancialItem[]): Promise<DynamicPriceAnalysisItem[]> => {
    const prompt = `Act as a procurement expert in Saudi Arabia. For the following BOQ items, provide dynamic, competitive unit prices based on current market rates, bulk discounts, etc. Return a JSON array with "itemId", "itemName", "originalUnitPrice", "dynamicUnitPrice", and "justification" for each item.\n\nItems:\n${financials.map(i => JSON.stringify({id: i.id, item: i.item, quantity: i.quantity, unitPrice: i.unitPrice})).join('\n')}`;
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
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
        console.error("Failed to parse Dynamic Price Analysis JSON:", responseText, e);
        throw new Error("Could not perform dynamic price analysis. The AI response was invalid.");
    }
};

export const performCuringAnalysis = async (input: CuringAnalysisInput): Promise<CuringAnalysisResult> => {
    const prompt = `Based on concrete curing principles (e.g., ACI guidelines), analyze the following scenario: ${JSON.stringify(input)}.
    Return a JSON object with:
    - "curingDays": number (estimated minimum curing days)
    - "earlyStrippingPossible": boolean
    - "recommendations": markdown string with detailed advice.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const generateQualityPlan = async (project: Project, input: QualityPlanInput): Promise<QualityPlanResult> => {
    const items = project.data.financials.filter(i => input.itemIds.includes(i.id));
    const prompt = `Generate a detailed Inspection and Test Plan (ITP) in markdown format for the following construction activities, referencing these standards: ${input.standards.join(', ')}.\n\nActivities:\n${items.map(i => `- ${i.item}`).join('\n')}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return { itpReport: response.text };
};

export const generateProjectCharter = async (project: Project, inputs: Record<string, string>): Promise<string> => {
    const prompt = `Generate a professional Project Charter in markdown format for a project named "${project.name}" (${project.description}). Use the following details:\n\n${Object.entries(inputs).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateSubTasksFromDescription = async (description: string): Promise<{ name: string; duration: number; predecessors: string[] }[]> => {
    const prompt = `Break down the construction activity "${description}" into a list of sub-tasks with logical predecessors and estimated durations in days. Return a JSON array of objects, each with "name", "duration" (number), and "predecessors" (array of strings).`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const analyzeScribdDocument = async (title: string, query: string): Promise<string> => {
    const prompt = `I am providing the title of a Scribd document: "${title}". Based on public knowledge of this document, please answer the following question: "${query}"`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const analyzeStructuralAssessment = async (buildingName: string, findings: string): Promise<{ riskAnalysis: string; recommendations: string; }> => {
    const prompt = `Act as an expert structural engineer analyzing an assessment for "${buildingName}". Findings: "${findings}". Provide a JSON object with "riskAnalysis" and "recommendations" in markdown format, referencing Saudi Building Code (SBC) where applicable.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const generateRetrofittingPlan = async (defect: Defect): Promise<Omit<RetrofittingPlan, 'totalCost'>> => {
    const prompt = `Act as a senior structural retrofitting consultant. For the following defect in a building, provide a detailed retrofitting plan.
    Defect Details:
    - Location: ${defect.location}
    - Type: ${defect.type}
    - Description: ${defect.description}
    - Severity: ${defect.severity}

    Provide a JSON object with the following structure:
    {
      "procedure": ["Step 1...", "Step 2...", "..."],
      "requiredMaterials": [{ "name": "Material Name", "quantity": 10, "unit": "kg", "unitCost": 50 }],
      "requiredLaborHours": 16,
      "estimatedDurationDays": 2
    }

    The procedure should be clear and professional. Base the materials and quantities on the defect description. The unitCost should be a reasonable estimate in SAR. Required labor hours and duration should be practical.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const plan = JSON.parse(response.text);
        // Basic validation
        if (plan.procedure && plan.requiredMaterials && plan.requiredLaborHours && plan.estimatedDurationDays) {
            return plan;
        } else {
            throw new Error("AI response is missing required fields for the plan.");
        }
    } catch (e) {
        console.error("Failed to parse retrofitting plan:", response.text, e);
        throw new Error("Could not generate a valid retrofitting plan from the AI.");
    }
};

export const analyzeBeam = async (input: BeamAnalysisInput): Promise<BeamAnalysisResult> => {
    const prompt = `Perform a structural analysis of a simple beam with the following properties: ${JSON.stringify(input)}. Calculate and return a JSON object with maxBendingMoment {value, position}, maxShearForce {value, position}, maxDeflection {value, position}, and a summary (markdown string).`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const analyzeBOQForValueEngineering = async (financials: FinancialItem[]): Promise<string> => {
    const prompt = `Perform a value engineering analysis on the following BOQ. Suggest cost-saving alternatives for materials or methods without compromising quality, referencing common practices in Saudi Arabia. Format as a markdown report.\n\nBOQ:\n${financials.map(i => `- ${i.item}: ${i.total}`).join('\n')}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateRecoveryPlan = async (project: Project, newEndDate: string, newStartDate?: string): Promise<{ plan: string, revisedSchedule: ScheduleTask[] }> => {
    const prompt = `A construction project named "${project.name}" is delayed. The original schedule has ${project.data.schedule.length} tasks.
    The goal is to create a recovery plan to meet a new end date of ${newEndDate}.
    ${newStartDate ? `The project will be fully rescheduled to start on ${newStartDate}.` : 'The project is already in progress.'}

    Suggest a recovery plan including strategies like crashing, fast-tracking, and re-sequencing.
    Then, provide a revised full schedule as a JSON array. Each task object should have the same properties as the original, plus 'originalStart', 'originalEnd', 'revisedStart', 'revisedEnd', and 'recoverySuggestion' ('crashed', 'fast-tracked', 're-sequenced', 'unchanged').

    Return a single JSON object with two keys:
    1. "plan": A markdown string explaining the recovery strategy.
    2. "revisedSchedule": The complete new schedule as a JSON array.

    Original schedule summary:
    ${project.data.schedule.slice(0, 15).map(t => `Task ${t.id} (${t.name}) from ${t.start} to ${t.end}`).join('\n')}
    `;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
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
        const result = JSON.parse(jsonText);
        // Data validation
        if (typeof result.plan === 'string' && Array.isArray(result.revisedSchedule)) {
            const validatedSchedule = result.revisedSchedule.map((task: any) => ({
                id: task.id,
                name: task.name,
                start: task.revisedStart || task.start,
                end: task.revisedEnd || task.end,
                progress: task.progress || 0,
                dependencies: task.dependencies || [],
                // Keep original data and add new fields
                ...task,
            }));
            return { plan: result.plan, revisedSchedule: validatedSchedule };
        } else {
            throw new Error('Invalid JSON structure from AI.');
        }
    } catch (e) {
        console.error("Failed to parse recovery plan:", responseText, e);
        throw new Error("Could not generate a valid recovery plan from the AI.");
    }
};