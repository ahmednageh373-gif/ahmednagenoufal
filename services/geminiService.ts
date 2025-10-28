import { GoogleGenAI, Type } from "@google/genai";
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
    
    // FIX: This function was incomplete. Added the call to the Gemini API and response handling.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Use a powerful model for this complex parsing task
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });

    try {
        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("AI response was empty.");
        }
        const tasks = JSON.parse(jsonText);
        // Data integrity check can be added here
        return tasks.map((task: any) => ({
            ...task,
            id: Number(task.id),
            progress: task.progress || 0,
            status: 'To Do',
            priority: 'Medium',
            dependencies: task.dependencies || [],
        }));
    } catch (e) {
        console.error("Failed to parse XER JSON:", response.text, e);
        throw new Error("Could not extract tasks from the XER file. The format might be unsupported or the AI response was invalid.");
    }
};

// FIX: Implement and export all missing service functions below.

export const processBoqToSchedule = async (items: FinancialItem[], projectStartDate: string): Promise<ScheduleTask[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the following Bill of Quantities (BOQ) items for a construction project starting on ${projectStartDate}, generate a logical project schedule.
    For each major activity derived from the BOQ, provide a task object. Infer logical dependencies between tasks. Estimate a reasonable duration in days.
    Format the output as a JSON array of ScheduleTask objects.
    Example: [{ "id": 1, "name": "Excavation Works", "start": "2024-01-01", "end": "2024-01-10", "progress": 0, "dependencies": [] }]

    BOQ Items:
    ---
    ${JSON.stringify(items, null, 2)}
    ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });

    try {
        return JSON.parse(response.text).map((task: any, index: number) => ({
            id: task.id || index + 1,
            name: task.name || 'Unnamed Task',
            start: task.start,
            end: task.end,
            progress: 0,
            dependencies: task.dependencies || [],
            status: 'To Do' as ScheduleTaskStatus,
            priority: 'Medium' as ScheduleTaskPriority,
        }));
    } catch (e) {
        console.error("Failed to parse schedule from BOQ:", response.text, e);
        throw new Error("Could not generate schedule from BOQ.");
    }
};

export const generateWBS = async (project: Project): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a Work Breakdown Structure (WBS) in markdown format for the following project:
    - Name: ${project.name}
    - Description: ${project.description}
    - Start Date: ${project.startDate}
    
    The WBS should be hierarchical, using nested lists. For example:
    - 1.0 Project Management
      - 1.1 Planning
      - 1.2 Execution
    - 2.0 Engineering
      - 2.1 ...
    `;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const performWhatIfAnalysis = async (schedule: ScheduleTask[], query: string): Promise<WhatIfAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a "what-if" analysis on the following project schedule.
    Scenario: "${query}"
    
    Current Schedule:
    ${JSON.stringify(schedule, null, 2)}
    
    Analyze the impact on the critical path, overall project duration, cost, and suggest mitigations.
    Return a JSON object with the format: { "impactSummary": "...", "newEndDate": "YYYY-MM-DD", "costImpact": "...", "criticalPathImpact": "..." }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const calculateCriticalPath = async (schedule: ScheduleTask[]): Promise<CriticalPathAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Calculate the critical path for the following project schedule.
    The schedule is provided as a JSON array of tasks with IDs, durations (implicit from start/end), and dependencies.
    
    Schedule:
    ${JSON.stringify(schedule, null, 2)}
    
    Return a JSON object with: { "criticalActivityIds": [1, 3, 5, ...], "projectDuration": 120, "totalFloat": { "1": 0, "2": 5, ... } }
    The activity IDs in the critical path should be numbers.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const getCostBreakdown = async (item: FinancialItem): Promise<DetailedCostBreakdown> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Provide a detailed cost breakdown for the construction BOQ item: "${item.item}".
    Assume a unit price of ${item.unitPrice} SAR per ${item.unit}.
    Break it down into 'Materials', 'Labor', and 'Equipment' costs.
    Also, provide a reasonable 'overheadsPercentage' and 'profitPercentage'.
    The output must be a JSON object of type DetailedCostBreakdown.
    Example: { "items": [{ "costType": "Materials", "description": "Cement", "quantity": 5, "unit": "bag", "estimatedUnitPrice": 20, "estimatedTotal": 100 }], "overheadsPercentage": 15, "profitPercentage": 10 }
    All descriptions and cost types must be in Arabic.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const analyzeFinancials = async (financials: FinancialItem[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the following Bill of Quantities. Identify the top 3 cost drivers and provide a brief financial summary in markdown format.
    
    BOQ:
    ${JSON.stringify(financials, null, 2)}
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const analyzeBOQForCodeCompliance = async (financials: FinancialItem[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Review the following BOQ items for potential conflicts or considerations regarding the Saudi Building Code (SBC). Highlight any items that may require special attention.
    
    BOQ:
    ${JSON.stringify(financials, null, 2)}
    
    Provide the response in markdown format.
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const analyzeBOQSentiments = async (financials: FinancialItem[]): Promise<BOQItemSentiment[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the sentiment of each description in the following BOQ. Look for terms that suggest risk, uncertainty, or potential issues (e.g., "as per engineer's instruction", "provisional sum", "high-risk").
    For each item, provide a sentiment ('Positive', 'Negative', 'Neutral') and a brief justification.
    
    BOQ:
    ${JSON.stringify(financials.map(f => ({ id: f.id, item: f.item })), null, 2)}

    Return a JSON array of objects with format: { "itemId": "...", "sentiment": "...", "justification": "..." }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
};

export const analyzeBOQPrices = async (financials: FinancialItem[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the unit prices in the following BOQ. Identify any prices that seem unusually high or low for the current market in Riyadh, Saudi Arabia. Provide a summary of your findings in markdown.
    
    BOQ:
    ${JSON.stringify(financials, null, 2)}
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
};

export const generatePurchaseOrderFromBOQItem = async (item: FinancialItem): Promise<Omit<PurchaseOrder, 'id' | 'total'>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const today = new Date().toISOString().split('T')[0];
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 14);
    const deliveryDate = delivery.toISOString().split('T')[0];

    const prompt = `Create a draft purchase order from this BOQ item:
    - Item: ${item.item}
    - Quantity: ${item.quantity} ${item.unit}
    - Unit Price: ${item.unitPrice}
    
    Suggest a generic supplier name.
    The output should be a JSON object with format: { "itemName": "...", "supplier": "...", "quantity": ..., "unitPrice": ..., "orderDate": "${today}", "expectedDelivery": "${deliveryDate}", "status": "Pending Approval" }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const generateChecklist = async (dailyActivities: string): Promise<ChecklistItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the following daily activities, generate a checklist for QA/QC and HSE.
    Activities: "${dailyActivities}"
    
    Return a JSON array of objects: { "id": "...", "category": "QA/QC" | "HSE", "text": "...", "status": "Pending" }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    const items = JSON.parse(response.text);
    return items.map((item: any) => ({ ...item, id: uuidv4() }));
};

export const createProjectFromTenderText = async (tenderText: string): Promise<Omit<Project, 'id'>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the following tender text and create a new project structure.
    Extract the project name, description, and start date.
    Generate a preliminary schedule and financial BOQ based on the text.
    
    Tender Text:
    ---
    ${tenderText}
    ---
    
    The output must be a single JSON object with the structure: { "name": "...", "description": "...", "startDate": "YYYY-MM-DD", "data": { "schedule": [...], "financials": [...] } }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    const projectData = JSON.parse(response.text);
    // Add other empty data structures
    projectData.data = {
        ...projectData.data,
        riskRegister: [], siteLog: [], workLog: [], checklists: [], engineeringDocs: [], drawings: [], drawingFolders: [], purchaseOrders: [], suppliers: [], quotes: [], items: [], workflow: { projectCharter: '', wbs: '' }, boqReconciliation: [], comparativeAnalysisReport: '', assistantSettings: { persona: 'projectManager', tone: 'formal', style: 'concise' }, objectives: [], keyResults: [], subcontractors: [], subcontractorInvoices: [], structuralAssessments: [], members: []
    };
    return projectData;
};

export const generateDocumentDraft = async (project: Project, prompt: string, category: string): Promise<{ title: string, content: string }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullPrompt = `For a project named "${project.name}" (${project.description}), generate a draft for a document in the category "${category}".
    User's request: "${prompt}"
    
    The output should be a JSON object: { "title": "...", "content": "..." }
    The content should be in markdown format.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const suggestRisks = async (project: Project): Promise<Omit<Risk, 'id' | 'status'>[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the project description "${project.description}", suggest 5 potential risks.
    For each risk, provide a description, category, probability, impact, and a mitigation plan.
    Return a JSON array of objects.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const analyzeSitePhoto = async (userNotes: string, imageFile: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);

    const contents = {
        parts: [
            { text: `Analyze this site photo from a civil engineering perspective. Identify progress, materials, safety issues, and quality of work. User notes: "${userNotes}". Respond in markdown.` },
            imagePart
        ]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
    });
    return response.text;
};

export const generateProjectCharter = async (project: Project, inputs: Record<string, string>): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a formal Project Charter in markdown for the project "${project.name}".
    Project Description: ${project.description}
    Use the following inputs:
    - High-level Requirements: ${inputs.requirements}
    - Feasibility: ${inputs.feasibility}
    - Stakeholders: ${inputs.stakeholders}
    - Initial Risks: ${inputs.risks}
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
};

export const generateWBSFromSchedule = async (schedule: ScheduleTask[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `From the given schedule, create a hierarchical Work Breakdown Structure (WBS) in markdown format. Group tasks into logical phases.
    
    Schedule:
    ${JSON.stringify(schedule.map(t => t.name), null, 2)}
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
};

export const analyzeBOQForValueEngineering = async (financials: FinancialItem[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a value engineering analysis on the provided BOQ. Suggest alternative materials or construction methods to reduce costs without compromising quality. Provide a detailed report in markdown.
    
    BOQ:
    ${JSON.stringify(financials, null, 2)}
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
};

export const reconcileBOQWithTakeoff = async (boqFile: File, takeoffFile: File): Promise<BOQMatch[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const boqCsv = await excelFileToCsvText(boqFile);
    const takeoffCsv = await excelFileToCsvText(takeoffFile);

    const prompt = `Reconcile the two following documents: a Bill of Quantities (BOQ) and a Quantity Takeoff sheet.
    Match items from the BOQ to items in the Takeoff, even if the descriptions are not identical.
    
    BOQ CSV:
    ---
    ${boqCsv}
    ---
    
    Takeoff CSV:
    ---
    ${takeoffCsv}
    ---
    
    Return a JSON array of matches: { "boqItemId": "...", "boqItemDescription": "...", "takeoffFile": "${takeoffFile.name}", "takeoffDescription": "...", "matchConfidence": 0.95 }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const runComparativeAnalysis = async (boqFile1: File, boqFile2: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const csv1 = await excelFileToCsvText(boqFile1);
    const csv2 = await excelFileToCsvText(boqFile2);

    const prompt = `Compare the two BOQ files provided. Generate a detailed comparative analysis report in markdown, highlighting differences in quantities, unit prices, and total costs for matched items.
    
    File 1 (${boqFile1.name}):
    ${csv1}
    
    File 2 (${boqFile2.name}):
    ${csv2}
    `;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
};

export const processComplexQuery = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 8192 } }
    });
    return response.text;
};

export const analyzeImageWithPrompt = async (prompt: string, imageFile: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);
    const contents = { parts: [{ text: prompt }, imagePart] };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
    });
    return response.text;
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio,
            outputMimeType: 'image/jpeg',
        },
    });
    return response.generatedImages[0].image.imageBytes;
};

export const queryWithMaps = async (prompt: string, location: { latitude: number, longitude: number }): Promise<LocationContact[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find the following near me: "${prompt}"`,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: location } }
        }
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!chunks) return [];

    return chunks.map((chunk: any) => ({
        name: chunk.maps.title,
        type: chunk.maps.placeAnswerSources?.placeDetails?.types?.[0] || 'Business',
        phone: chunk.maps.placeAnswerSources?.placeDetails?.nationalPhoneNumber || '',
        address: chunk.maps.placeAnswerSources?.placeDetails?.formattedAddress || '',
        mapsUri: chunk.maps.uri
    }));
};

export const analyzeDrawingImage = async (imageFile: File): Promise<DrawingAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze this engineering drawing. Provide a summary, extract key text/dimensions, and generate a preliminary Bill of Quantities (BOQ).
    The output must be a JSON object: { "summary": "...", "extractedText": "...", "preliminaryBOQ": [{ "item": "...", "description": "...", "quantity": ..., "unit": "..." }] }
    `;
    const contents = { parts: [{ text: prompt }, imagePart] };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
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
    if (!downloadLink) throw new Error("Video generation failed or returned no link.");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateSubTasksFromDescription = async (description: string): Promise<{ name: string; duration: number; predecessors: string[] }[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Break down the activity "${description}" into a list of sub-tasks for a project schedule. For each sub-task, estimate a duration in days and identify its predecessors from the generated list.
    Return a JSON array: [{ "name": "...", "duration": ..., "predecessors": ["..."] }]
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const getSaudiCodeAnalysis = async (project: Project, itemIds: string[], query: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const selectedItems = project.data.financials.filter(i => itemIds.includes(i.id));

    const prompt = `As a consultant for the Saudi Building Code (SBC), answer the following query regarding a construction project.
    Project: ${project.name}
    Query: "${query}"
    
    Relevant BOQ Items:
    ${JSON.stringify(selectedItems, null, 2)}
    
    Provide a detailed answer in markdown format, citing SBC sections if possible.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
};

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the sentiment of the following text.
    Text: "${text}"
    
    Return a JSON object: { "sentiment": "Positive" | "Negative" | "Neutral", "confidence": 0.9, "justification": "..." }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const analyzeScribdDocument = async (title: string, query: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `I am providing context from a Scribd document titled "${title}". Please answer my question based on this document.
    Question: "${query}"
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] } // Use search to find the document context
    });
    return response.text;
};

export const generateRecoveryPlan = async (project: Project, newEndDate: string, newStartDate?: string): Promise<{ plan: string, revisedSchedule: ScheduleTask[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a recovery plan for the project "${project.name}".
    The current schedule has delays.
    The new target ${newStartDate ? `start date is ${newStartDate}` : `end date is ${newEndDate}`}.
    
    Current Schedule:
    ${JSON.stringify(project.data.schedule, null, 2)}
    
    Propose a revised schedule using techniques like crashing, fast-tracking, and re-sequencing.
    The response must be a JSON object:
    {
      "plan": "Markdown summary of the recovery strategy...",
      "revisedSchedule": [
        {
          "id": 1, "name": "...", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD",
          "originalStart": "YYYY-MM-DD", "originalEnd": "YYYY-MM-DD",
          "revisedStart": "YYYY-MM-DD", "revisedEnd": "YYYY-MM-DD",
          "recoverySuggestion": "crashed" | "fast-tracked" | "re-sequenced" | "unchanged",
          ... other task properties
        }
      ]
    }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const generateRetrofittingPlan = async (defect: Defect): Promise<Omit<RetrofittingPlan, 'totalCost'>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a detailed retrofitting/repair plan for the following structural defect:
    - Location: ${defect.location}
    - Type: ${defect.type}
    - Description: ${defect.description}
    - Severity: ${defect.severity}
    
    Provide a step-by-step procedure, required materials with estimated quantities and unit costs, required labor hours, and estimated duration in days.
    Return a JSON object: { "procedure": ["..."], "requiredMaterials": [{"name": "...", "quantity": ..., "unit": "...", "unitCost": ...}], "requiredLaborHours": ..., "estimatedDurationDays": ... }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const analyzeBeam = async (input: BeamAnalysisInput): Promise<BeamAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze a simply supported beam with the following properties:
    ${JSON.stringify(input, null, 2)}
    
    Calculate the maximum bending moment, maximum shear force, and maximum deflection. Provide a brief summary of the results.
    Return a JSON object: { "maxBendingMoment": {"value": ..., "position": ...}, "maxShearForce": {"value": ..., "position": ...}, "maxDeflection": {"value": ..., "position": ...}, "summary": "..." }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const getConceptualEstimate = async (input: ConceptualEstimateInput, currentBoqTotal: number): Promise<ConceptualEstimateResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Provide a conceptual cost and duration estimate for a new construction project.
    
    Input:
    ${JSON.stringify(input, null, 2)}
    
    Additionally, compare this conceptual estimate with the project's current BOQ total of ${currentBoqTotal} SAR and provide a variance report.
    
    Return a JSON object: { "estimatedCost": ..., "estimatedDuration": ..., "majorResources": [...], "assumptions": "...", "varianceReport": "..." }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const performDynamicPriceAnalysis = async (financials: FinancialItem[]): Promise<DynamicPriceAnalysisItem[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a dynamic pricing analysis on the following BOQ items. Suggest a more competitive "dynamicUnitPrice" for each item based on current market rates, quantity discounts, etc.
    
    BOQ:
    ${JSON.stringify(financials.map(f => ({ id: f.id, name: f.item, unitPrice: f.unitPrice })), null, 2)}
    
    Return a JSON array: [{ "itemId": "...", "itemName": "...", "originalUnitPrice": ..., "dynamicUnitPrice": ..., "justification": "..." }]
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const performCuringAnalysis = async (input: CuringAnalysisInput): Promise<CuringAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze concrete curing time based on these parameters:
    - Concrete Grade: ${input.concreteGrade}
    - Ambient Temperature: ${input.ambientTemp}°C
    - Required Strength for Formwork Stripping: ${input.requiredStrength}%
    
    Calculate the minimum curing days required. Determine if early stripping is possible and provide engineering recommendations.
    Return a JSON object: { "curingDays": ..., "earlyStrippingPossible": true/false, "recommendations": "..." }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};

export const generateQualityPlan = async (project: Project, input: QualityPlanInput): Promise<QualityPlanResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const selectedItems = project.data.financials.filter(i => input.itemIds.includes(i.id));
    const prompt = `Generate an Inspection and Test Plan (ITP) in markdown format for the following construction activities.
    The plan should adhere to these standards: ${input.standards.join(', ')}.
    
    Activities/BOQ Items:
    ${JSON.stringify(selectedItems.map(i => i.item), null, 2)}
    
    The ITP should include columns for: Activity, Reference Document, Inspection Type, Acceptance Criteria, and Responsible Party.
    Return a JSON object: { "itpReport": "..." }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text);
};