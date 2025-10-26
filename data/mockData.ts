// Fix: Import types from the newly created types.ts file.
import type { Project } from '../types';
import { projectTemplates } from './templates';

export const mockProjects: Project[] = [
    {
        id: 'proj-1',
        name: 'بناء فيلا سكنية - حي الياسمين',
        description: 'مشروع بناء فيلا دوبلكس بمساحة 400 متر مربع.',
        startDate: '2024-08-01',
        endDate: '2025-07-31',
        data: {
            ...JSON.parse(JSON.stringify(projectTemplates.find(t => t.id === 'template-villa')!.data)),
            financials: [ // Expanded BOQ for more realistic examples
                { id: 'boq-found-1', item: 'أعمال الحفر للأساسات', quantity: 500, unit: 'م3', unitPrice: 50, total: 25000 },
                { id: 'boq-found-2', item: 'خرسانة مسلحة للقواعد', quantity: 200, unit: 'م3', unitPrice: 450, total: 90000 },
                { id: 'boq-elec-1', item: 'تأسيس مواسير كهرباء - الطابق الأرضي', quantity: 1, unit: 'مقطوعية', unitPrice: 15000, total: 15000 },
                { id: 'boq-elec-2', item: 'سحب أسلاك وتوصيلات - الطابق الأرضي', quantity: 1, unit: 'مقطوعية', unitPrice: 12000, total: 12000 },
                { id: 'boq-plumb-1', item: 'تمديد مواسير الصرف الصحي والتغذية', quantity: 1, unit: 'مقطوعية', unitPrice: 25000, total: 25000 },
                { id: 'boq-vrf-1', item: 'اعمال تمديد وتركيب نحاس للمكيفات VRF', quantity: 1, unit: 'مقطوعية', unitPrice: 65000, total: 65000 },
                { id: 'boq-gypsum-1', item: 'اعمال تركيب الواح جبسية للأسقف المعلقة (جبس بورد)', quantity: 250, unit: 'م2', unitPrice: 65, total: 16250 },
            ],
            siteLog: [
                {
                    id: 'log-1',
                    date: '2024-07-20T10:00:00Z',
                    photoUrl: 'https://storage.googleapis.com/maker-suite-images/AN-AI/site1.jpg',
                    userNotes: 'تم الانتهاء من صب أعمدة الطابق الأرضي. الخرسانة تبدو جيدة.',
                    aiAnalysis: 'تحليل الصورة يظهر اكتمال صب الأعمدة. لا توجد تشققات واضحة. يجب التأكد من رش الخرسانة بالماء بشكل دوري. تم رصد بعض بقايا الأخشاب بالقرب من منطقة العمل، يجب إزالتها لتجنب مخاطر السلامة.',
                    latitude: 24.7938,
                    longitude: 46.6719,
                },
                {
                    id: 'log-2',
                    date: '2024-07-22T11:00:00Z',
                    photoUrl: 'https://storage.googleapis.com/maker-suite-images/AN-AI/site2.jpg',
                    userNotes: 'وصول شحنة حديد التسليح للسقف.',
                    aiAnalysis: 'الصورة تظهر كمية كبيرة من حديد التسليح. يبدو مطابقًا للمواصفات من حيث القطر. يجب التأكد من تخزينه بشكل صحيح بعيدًا عن الرطوبة والأتربة. لم يتم رصد أي عمال يرتدون خوذات في الصورة، وهذا يمثل خرقًا للسلامة.',
                    latitude: 24.7945,
                    longitude: 46.6725,
                },
                {
                    id: 'log-3',
                    date: '2024-07-25T09:00:00Z',
                    photoUrl: 'https://storage.googleapis.com/maker-suite-images/AN-AI/site3.jpg',
                    userNotes: 'ملاحظات عامة حول نظافة الموقع.',
                    aiAnalysis: 'الموقع يبدو غير منظم. هناك تراكم للمخلفات في عدة مناطق مما قد يعيق الحركة ويزيد من مخاطر الحوادث. ينصح بعمل حملة نظافة شاملة.',
                },
            ],
            objectives: [
                { id: 'obj-1', title: 'الانتهاء من أعمال الهيكل الخرساني', description: 'إكمال جميع الأعمال الخرسانية للمبنى الرئيسي في الوقت المحدد.' },
                { id: 'obj-2', title: 'تحقيق الالتزام بالميزانية', description: 'ضمان عدم تجاوز التكاليف الفعلية للميزانية المعتمدة للمشروع.' },
            ],
            keyResults: [
                { id: 'kr-1', objectiveId: 'obj-1', title: 'صب خرسانة الطابق الأرضي', currentValue: 150, targetValue: 150, status: 'On Track' },
                { id: 'kr-2', objectiveId: 'obj-1', title: 'صب خرسانة الطابق الأول', currentValue: 75, targetValue: 150, status: 'On Track' },
                { id: 'kr-3', objectiveId: 'obj-1', title: 'صب خرسانة السطح', currentValue: 0, targetValue: 100, status: 'On Track' },
                { id: 'kr-4', objectiveId: 'obj-2', title: 'الالتزام بتكلفة المواد بنسبة 95%', currentValue: 80, targetValue: 95, status: 'At Risk' },
                { id: 'kr-5', objectiveId: 'obj-2', title: 'تقليل تكاليف العمالة بنسبة 5%', currentValue: 2, targetValue: 5, status: 'On Track' },
            ],
            subcontractors: [
                { id: 'sub-1', name: 'شركة الإتقان للكهرباء', trade: 'أعمال كهربائية', contactPerson: 'سليمان العلي', contactEmail: 'solaiman@itqan.com', contactPhone: '0501234567' },
                { id: 'sub-2', name: 'مؤسسة الينابيع للسباكة', trade: 'أعمال السباكة والتكييف', contactPerson: 'خالد المصري', contactEmail: 'khalid@yanabee.com', contactPhone: '0557654321' },
                { id: 'sub-3', name: 'شركة هالة الرياض للتكييف', trade: 'أعمال التكييف VRF', contactPerson: 'عبدالله التركي', contactEmail: 'a.turki@hala-riyadh.com', contactPhone: '0533344455' },
                { id: 'sub-4', name: 'طارق للمقاولات العامة', trade: 'أعمال تشطيبات', contactPerson: 'طارق مياه', contactEmail: 'tariq.m@contractor.com', contactPhone: '0588899900' },
            ],
            suppliers: [
                { id: 'sup-1', name: 'شركة مواد البناء المتحدة', trade: 'مواد أساسية', contactPerson: 'محمد الحمد', email: 'm.hamad@united.com', phone: '0501112222', address: 'الرياض, المنطقة الصناعية', performanceIndex: 0.95 },
                { id: 'sup-2', name: 'تجهيزات الخرسانة العصرية', trade: 'خرسانة جاهزة', contactPerson: 'يوسف عبدالله', email: 'yusuf@modern-concrete.com', phone: '0503334444', address: 'الرياض, طريق الخرج', performanceIndex: 0.88 },
                { id: 'sup-3', name: 'الرواد للكهرباء والإنارة', trade: 'مواد كهربائية', contactPerson: 'علي سالم', email: 'ali.salem@rowad.sa', phone: '0505556666', address: 'الرياض, الملز', performanceIndex: 0.92 },
            ],
            quotes: [
                { id: 'q-1', supplierId: 'sup-2', materialName: 'خرسانة مسلحة للقواعد', unitPrice: 445, validUntil: '2024-09-01' },
                { id: 'q-2', supplierId: 'sup-1', materialName: 'خرسانة مسلحة للقواعد', unitPrice: 460, validUntil: '2024-09-15' },
                { id: 'q-3', supplierId: 'sup-2', materialName: 'خرسانة مسلحة للقواعد', unitPrice: 455, validUntil: '2024-08-30', notes: 'عرض خاص للدفع الفوري' },
                { id: 'q-4', supplierId: 'sup-3', materialName: 'تأسيس مواسير كهرباء - الطابق الأرضي', unitPrice: 14500, validUntil: '2024-09-01' },
                { id: 'q-5', supplierId: 'sup-3', materialName: 'سحب أسلاك وتوصيلات - الطابق الأرضي', unitPrice: 11800, validUntil: '2024-09-01' },
            ],
            structuralAssessments: [
                {
                    id: 'assess-1',
                    buildingName: 'المبنى الرئيسي (CHC)',
                    assessmentType: 'Visual',
                    defects: [
                        { 
                            id: 'def-1', 
                            location: 'العمود C3، الطابق الأرضي', 
                            type: 'إنشائي', 
                            description: 'تعشيش خرساني خفيف في الجزء السفلي من العمود.', 
                            severity: 'Medium', 
                            status: 'New',
                            photoUrl: 'https://storage.googleapis.com/maker-suite-images/AN-AI/defect1.jpg'
                        },
                        { 
                            id: 'def-2', 
                            location: 'السلم الخارجي', 
                            type: 'إنشائي', 
                            description: 'صدأ وتآكل في حديد التسليح المكشوف.', 
                            severity: 'High', 
                            status: 'New',
                            photoUrl: 'https://storage.googleapis.com/maker-suite-images/AN-AI/defect2.jpg'
                        },
                        { 
                            id: 'def-3', 
                            location: 'جدار الغرفة 201', 
                            type: 'معماري', 
                            description: 'تشققات شعرية في طبقة اللياسة.', 
                            severity: 'Low', 
                            status: 'New' 
                        }
                    ]
                },
                {
                    id: 'assess-2',
                    buildingName: 'سكن الممرضات',
                    assessmentType: 'Combined',
                    defects: []
                }
            ],
            subcontractorInvoices: [
                {
                    id: 'inv-1',
                    subcontractorId: 'sub-1',
                    invoiceNumber: 'INV-ELEC-001',
                    date: '2024-07-15',
                    status: 'Paid',
                    items: [
                        { id: 'item-1', boqItemId: 'boq-elec-1', description: 'تأسيس مواسير كهرباء الطابق الأرضي', executedQuantity: 1, unitPrice: 15000, total: 15000 }
                    ],
                    totalAmount: 15000,
                },
                {
                    id: 'inv-2',
                    subcontractorId: 'sub-2',
                    invoiceNumber: 'INV-PLUMB-001',
                    date: '2024-07-20',
                    status: 'Approved',
                    items: [
                        { id: 'item-2', boqItemId: 'boq-plumb-1', description: 'تمديد مواسير الصرف الصحي للطابق الأرضي', executedQuantity: 1, unitPrice: 25000, total: 25000 }
                    ],
                    totalAmount: 25000,
                },
                 {
                    id: 'inv-3',
                    subcontractorId: 'sub-1',
                    invoiceNumber: 'INV-ELEC-002',
                    date: '2024-08-01',
                    status: 'Submitted',
                    items: [
                        { id: 'item-3', boqItemId: 'boq-elec-2', description: 'سحب أسلاك الطابق الأرضي', executedQuantity: 1, unitPrice: 12000, total: 12000 }
                    ],
                    totalAmount: 12000,
                },
                {
                    id: 'inv-4',
                    subcontractorId: 'sub-3',
                    invoiceNumber: 'HR-FINAL-01',
                    date: '2024-08-10',
                    status: 'Approved',
                    items: [
                        { id: 'inv-4-item-1', boqItemId: 'boq-vrf-1', description: 'اعمال تركيب نحاس ولحام - الدور الثاني', executedQuantity: 186, unitPrice: 60, total: 11160 },
                        { id: 'inv-4-item-2', boqItemId: 'boq-vrf-1', description: 'اعمال تركيب وتشبيك النحاس بالمكينة الداخلية وتركيب كنترول واختبار', executedQuantity: 18, unitPrice: 300, total: 5400 }
                    ],
                    totalAmount: 16560,
                },
                {
                    id: 'inv-5',
                    subcontractorId: 'sub-4',
                    invoiceNumber: 'TM-004',
                    date: '2024-08-12',
                    status: 'Submitted',
                    items: [
                        { id: 'inv-5-item-1', boqItemId: 'boq-gypsum-1', description: 'اعمال تركيب جبس - سنجل', executedQuantity: 65, unitPrice: 22, total: 1430 },
                        { id: 'inv-5-item-2', boqItemId: 'boq-gypsum-1', description: 'اعمال تركيب جبس للاعمدة', executedQuantity: 1985, unitPrice: 22, total: 43670 }
                    ],
                    totalAmount: 45100,
                }
            ]
        }
    },
    {
        id: 'proj-2',
        name: 'مشروع تجاري - طريق الملك فهد',
        description: 'تطوير مبنى تجاري متعدد الاستخدامات.',
        startDate: '2024-09-15',
        data: JSON.parse(JSON.stringify(projectTemplates.find(t => t.id === 'template-empty')!.data))
    }
];
