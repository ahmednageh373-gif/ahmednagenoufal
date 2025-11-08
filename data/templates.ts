import type { ProjectTemplate } from '../types';

const emptyProjectData = {
    schedule: [],
    financials: [],
    riskRegister: [],
    siteLog: [],
    workLog: [],
    checklists: [],
    engineeringDocs: [
        { id: 'cat-1', name: 'العقود والاتفاقيات', documents: [] },
        { id: 'cat-2', name: 'المواصفات الفنية', documents: [] },
        { id: 'cat-3', name: 'تقارير التربة', documents: [] },
        { id: 'cat-4', name: 'المراسلات الرسمية', documents: [] },
    ],
    drawings: [],
    drawingFolders: [],
    purchaseOrders: [],
    suppliers: [],
    quotes: [],
    items: [],
    workflow: { projectCharter: '', wbs: '' },
    boqReconciliation: [],
    comparativeAnalysisReport: '',
    assistantSettings: { persona: 'projectManager' as const, tone: 'formal' as const, style: 'concise' as const },
    objectives: [],
    keyResults: [],
    subcontractors: [],
    subcontractorInvoices: [],
    structuralAssessments: [],
    members: [],
};

export const projectTemplates: ProjectTemplate[] = [
    {
        id: 'template-empty',
        name: 'مشروع فارغ',
        description: 'ابدأ بمشروع نظيف بدون بيانات مسبقة.',
        data: JSON.parse(JSON.stringify(emptyProjectData))
    },
    {
        id: 'template-villa',
        name: 'فيلا سكنية',
        description: 'قالب أساسي لمشروع بناء فيلا سكنية.',
        data: {
            ...JSON.parse(JSON.stringify(emptyProjectData)),
            schedule: [
                { id: 1, name: 'التصميمات والترخيص', start: '2024-08-01', end: '2024-08-30', progress: 100, dependencies: [], category: 'Planning', status: 'Done', priority: 'High', assignees: ['AD'], baselineStart: '2024-08-01', baselineEnd: '2024-08-25' },
                { id: 2, name: 'أعمال الحفر والأساسات', start: '2024-09-01', end: '2024-09-20', progress: 50, dependencies: [1], category: 'Foundation', status: 'In Progress', priority: 'High', assignees: ['CE'], baselineStart: '2024-09-01', baselineEnd: '2024-09-15' },
                { id: 3, name: 'الهيكل الخرساني', start: '2024-09-21', end: '2024-11-10', progress: 0, dependencies: [2], category: 'Structure', status: 'To Do', priority: 'High', assignees: ['CE'], baselineStart: '2024-09-21', baselineEnd: '2024-11-05' },
            ],
            financials: [
                { id: 'boq-1', item: 'أعمال الحفر', quantity: 500, unit: 'م3', unitPrice: 50, total: 25000 },
                { id: 'boq-2', item: 'خرسانة مسلحة للأساسات', quantity: 200, unit: 'م3', unitPrice: 450, total: 90000 },
            ],
            purchaseOrders: [
                {
                    id: 'po-draft-1',
                    itemName: 'خرسانة مسلحة للقواعد',
                    supplier: '', // Left blank for smart procurement
                    quantity: 200,
                    unitPrice: 450,
                    total: 90000,
                    orderDate: new Date().toISOString().split('T')[0],
                    expectedDelivery: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
                    status: 'Pending Approval',
                }
            ],
            riskRegister: [
                { id: 'risk-1', description: 'تأخر في توريد حديد التسليح', category: 'Contractual', probability: 'Medium', impact: 'High', mitigationPlan: 'التعاقد مع موردين بديلين ووضع جدول توريد صارم.', status: 'Open' }
            ]
        }
    }
];
