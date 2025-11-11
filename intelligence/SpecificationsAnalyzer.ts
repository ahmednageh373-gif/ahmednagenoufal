/**
 * NOUFAL - محلل المواصفات التفصيلي
 * Specifications Analyzer - يفكك البنود بناءً على المواصفات التفصيلية
 * 
 * يحلل المواصفات الكاملة لكل بند ويفككها إلى أنشطة منفصلة
 */

import { FinancialItem, AdvancedScheduleActivity, ActivityStatus } from '../types';
import ProductivityDatabase from './ProductivityDatabase';

export interface DetailedSpecification {
    originalItem: FinancialItem;
    serialNumber: string;
    category: string;
    itemName: string;
    description: string;
    fullSpecifications: string;
    extractedActivities: ExtractedActivity[];
}

export interface ExtractedActivity {
    name: string;
    description: string;
    type: 'excavation' | 'concrete' | 'reinforcement' | 'formwork' | 'masonry' | 
          'waterproofing' | 'backfill' | 'painting' | 'installation' | 'supply' | 'other';
    keywords: string[];
    estimatedQuantity: number;
    unit: string;
    sequence: number;  // ترتيب التنفيذ (10=حفر, 20=خرسانة عادية, 30=تسليح, إلخ)
    parentItemName: string;  // اسم البند الأصلي
}

/**
 * محلل المواصفات المتقدم
 * يقرأ المواصفات التفصيلية ويستخرج الأنشطة
 */
export class SpecificationsAnalyzer {
    /**
     * أنماط البحث عن الأنشطة في المواصفات
     * مرتبة حسب تسلسل التنفيذ الطبيعي
     * 🔥 محسّن لاستخراج المزيد من الأنشطة
     */
    private static activityPatterns = [
        // 1. أعمال الحفر (أولاً)
        {
            keywords: ['حفر', 'حفريات', 'excavation', 'حفر بعمق', 'الحفر للأساسات', 'حفر أساسات', 'excavate', 'dig'],
            type: 'excavation' as const,
            activityName: 'أعمال الحفر',
            sequence: 10
        },
        // 2. الخرسانة العادية (بعد الحفر)
        {
            keywords: ['خرسانة عادية', 'plain concrete', 'صب قواعد', 'خرسانه عاديه', 'خرسانة نظافة', 'lean concrete', 'بلين كونكريت'],
            type: 'concrete' as const,
            activityName: 'صب خرسانة عادية',
            sequence: 20
        },
        // 3. حديد التسليح (قبل الخرسانة المسلحة)
        {
            keywords: ['حديد التسليح', 'reinforcement', 'تسليح', 'التسليح', 'حديد مسلح', 'steel bars', 'rebar', 'حديد', 'حديد التسليح'],
            type: 'reinforcement' as const,
            activityName: 'تركيب حديد التسليح',
            sequence: 30
        },
        // 4. النجارة / الشدات (مع التسليح)
        {
            keywords: ['نجارة', 'formwork', 'شدات', 'قوالب', 'شدة خشبية', 'shuttering', 'form work', 'قوالب خشبية', 'الشدة'],
            type: 'formwork' as const,
            activityName: 'أعمال النجارة والشدات',
            sequence: 35
        },
        // 5. الخرسانة المسلحة (بعد التسليح والشدات)
        {
            keywords: ['خرسانة مسلحة', 'reinforced concrete', 'خرسانه مسلحه', 'قواعد مسلحة', 'صب مسلح', 'concrete', 'rc', 'r.c'],
            type: 'concrete' as const,
            activityName: 'صب خرسانة مسلحة',
            sequence: 40
        },
        // 6. الميدات (بعد الخرسانة المسلحة)
        {
            keywords: ['ميدات', 'ميده', 'grade beams', 'الميدات الأرضية', 'grade beam', 'tie beam'],
            type: 'concrete' as const,
            activityName: 'تنفيذ الميدات',
            sequence: 45
        },
        // 7. العزل (بعد الخرسانة)
        {
            keywords: ['عزل', 'waterproofing', 'عزل الأساسات', 'دهان بيتوميني', 'عازل للرطوبة', 'عزل مائي', 'insulation', 'بيتومين', 'bitumen'],
            type: 'waterproofing' as const,
            activityName: 'أعمال العزل',
            sequence: 50
        },
        // 8. المبيدات (قبل الردم)
        {
            keywords: ['مبيدات', 'النمل الأبيض', 'دودة الأرض', 'رش المبيدات', 'pesticide', 'termite'],
            type: 'installation' as const,
            activityName: 'رش المبيدات',
            sequence: 55
        },
        // 9. الردم (بعد العزل)
        {
            keywords: ['ردم', 'backfill', 'الردم حول', 'رمال نظيفة', 'ناتج الحفر', 'ردم الأساسات', 'fill', 'back fill'],
            type: 'backfill' as const,
            activityName: 'أعمال الردم',
            sequence: 60
        },
        // 10. الأعمدة (بعد الأساسات)
        {
            keywords: ['أعمدة', 'columns', 'عمود', 'أعمدة خرسانية', 'باكيات', 'column', 'pillar'],
            type: 'concrete' as const,
            activityName: 'تنفيذ الأعمدة',
            sequence: 70
        },
        // 11. البناء (بعد الهيكل)
        {
            keywords: ['بناء', 'مباني', 'masonry', 'طوب', 'بلوك', 'جدران', 'blockwork', 'brickwork', 'wall'],
            type: 'masonry' as const,
            activityName: 'أعمال البناء',
            sequence: 80
        },
        // 12. الدهان (أخيراً)
        {
            keywords: ['دهان', 'painting', 'طلاء', 'دهان ناري', 'وجه اساسي', 'paint', 'coating'],
            type: 'painting' as const,
            activityName: 'أعمال الدهان',
            sequence: 90
        },
        // 13. التركيب
        {
            keywords: ['تركيب', 'installation', 'install', 'تثبيت', 'fixing', 'mounting'],
            type: 'installation' as const,
            activityName: 'أعمال التركيب',
            sequence: 85
        },
        // 14. التوريد (في البداية)
        {
            keywords: ['توريد', 'supply', 'توريد وتركيب', 'توريد و تركيب', 'supplying', 'procurement'],
            type: 'supply' as const,
            activityName: 'التوريد',
            sequence: 5
        },
        // 15. القواعد والأساسات
        {
            keywords: ['قواعد', 'أساسات', 'foundation', 'footing', 'base', 'القاعدة'],
            type: 'concrete' as const,
            activityName: 'تنفيذ القواعد',
            sequence: 25
        },
        // 16. الأسقف والبلاطات
        {
            keywords: ['سقف', 'بلاطة', 'slab', 'بلاطات', 'الأسقف', 'deck'],
            type: 'concrete' as const,
            activityName: 'تنفيذ الأسقف',
            sequence: 75
        },
        // 17. السباكة والكهرباء
        {
            keywords: ['سباكة', 'كهرباء', 'plumbing', 'electrical', 'مواسير', 'كابلات', 'pipes', 'cables'],
            type: 'installation' as const,
            activityName: 'أعمال السباكة والكهرباء',
            sequence: 82
        },
        // 18. التشطيبات
        {
            keywords: ['تشطيب', 'تشطيبات', 'finishing', 'finishes', 'بلاط', 'tiles', 'رخام', 'marble'],
            type: 'installation' as const,
            activityName: 'أعمال التشطيبات',
            sequence: 88
        }
    ];

    /**
     * تحليل المواصفات التفصيلية واستخراج الأنشطة
     */
    static analyzeSpecifications(
        serialNumber: string,
        category: string,
        itemName: string,
        description: string,
        fullSpecifications: string,
        unit: string,
        quantity: number,
        unitPrice: number
    ): DetailedSpecification {
        const originalItem: FinancialItem = {
            id: `BOQ-${serialNumber}`,
            item: itemName,
            unit,
            quantity,
            unitPrice,
            total: quantity * unitPrice
        };

        // استخراج الأنشطة من المواصفات
        const extractedActivities = this.extractActivitiesFromSpecs(
            fullSpecifications,
            itemName,
            unit,
            quantity
        );

        return {
            originalItem,
            serialNumber,
            category,
            itemName,
            description,
            fullSpecifications,
            extractedActivities
        };
    }

    /**
     * استخراج الأنشطة من المواصفات
     * يرتب الأنشطة حسب تسلسل التنفيذ الطبيعي
     * 🔥 محسّن لاستخراج المزيد من الأنشطة
     */
    private static extractActivitiesFromSpecs(
        specifications: string,
        itemName: string,
        unit: string,
        quantity: number
    ): ExtractedActivity[] {
        const activities: ExtractedActivity[] = [];
        const specsLower = specifications.toLowerCase();
        const itemNameLower = itemName.toLowerCase();
        
        // البحث في كل من المواصفات واسم البند
        const searchText = `${specsLower} ${itemNameLower}`;

        // البحث عن كل نمط في المواصفات واسم البند
        for (const pattern of this.activityPatterns) {
            const found = pattern.keywords.some(keyword => 
                searchText.includes(keyword.toLowerCase())
            );

            if (found) {
                // استخراج الجمل المتعلقة بهذا النشاط
                const relevantSentences = this.extractRelevantSentences(
                    specifications,
                    pattern.keywords
                );

                activities.push({
                    name: `${pattern.activityName} - ${itemName}`,
                    description: relevantSentences || specifications.substring(0, 150),
                    type: pattern.type,
                    keywords: pattern.keywords,
                    estimatedQuantity: this.estimateActivityQuantity(
                        quantity,
                        unit,
                        pattern.type
                    ),
                    unit: this.determineActivityUnit(unit, pattern.type),
                    sequence: pattern.sequence,
                    parentItemName: itemName
                });
            }
        }

        // ترتيب الأنشطة حسب sequence (حفر أولاً، ثم خرسانة، إلخ)
        activities.sort((a, b) => a.sequence - b.sequence);

        // إزالة التكرارات (نفس النوع ونفس البند)
        const uniqueActivities = activities.filter((activity, index, self) => 
            index === self.findIndex((a) => 
                a.type === activity.type && a.sequence === activity.sequence
            )
        );

        // إذا لم نجد أي أنشطة محددة، ننشئ نشاط عام
        if (uniqueActivities.length === 0) {
            // محاولة استنتاج النوع من الوحدة
            let activityType: ExtractedActivity['type'] = 'other';
            let activityName = itemName;
            
            if (unit.includes('م3') || unit === 'م٣') {
                activityType = 'concrete';
                activityName = `تنفيذ - ${itemName}`;
            } else if (unit.includes('م2') || unit === 'م٢' || unit.includes('متر مربع')) {
                activityType = 'installation';
                activityName = `تركيب - ${itemName}`;
            } else if (unit.includes('طن') || unit === 'ton') {
                activityType = 'supply';
                activityName = `توريد - ${itemName}`;
            }
            
            uniqueActivities.push({
                name: activityName,
                description: specifications,
                type: activityType,
                keywords: [],
                estimatedQuantity: quantity,
                unit: unit,
                sequence: 50,  // وسط التسلسل
                parentItemName: itemName
            });
        }

        return uniqueActivities;
    }

    /**
     * استخراج الجمل ذات الصلة
     */
    private static extractRelevantSentences(
        specifications: string,
        keywords: string[]
    ): string {
        const sentences = specifications.split(/[.،؛]/).map(s => s.trim());
        const relevant: string[] = [];

        for (const sentence of sentences) {
            const sentenceLower = sentence.toLowerCase();
            if (keywords.some(k => sentenceLower.includes(k.toLowerCase()))) {
                relevant.push(sentence);
            }
        }

        return relevant.length > 0 
            ? relevant.join('. ') 
            : specifications.substring(0, 200) + '...';
    }

    /**
     * تقدير كمية النشاط
     */
    private static estimateActivityQuantity(
        totalQuantity: number,
        unit: string,
        activityType: string
    ): number {
        // تقديرات بناءً على نوع النشاط
        switch (activityType) {
            case 'excavation':
                return totalQuantity; // نفس كمية البند الأصلي
            case 'concrete':
                return totalQuantity; // نفس الكمية
            case 'reinforcement':
                // تقدير: 120 كجم حديد لكل م3 خرسانة
                return unit.includes('م') ? totalQuantity * 0.12 : totalQuantity;
            case 'formwork':
                // تقدير: 6 م2 نجارة لكل م3 خرسانة
                return unit.includes('م') ? totalQuantity * 6 : totalQuantity;
            case 'waterproofing':
                return totalQuantity * 0.5; // تقدير
            case 'backfill':
                return totalQuantity * 0.8; // 80% من الحفر
            default:
                return totalQuantity;
        }
    }

    /**
     * تحديد وحدة القياس للنشاط
     */
    private static determineActivityUnit(originalUnit: string, activityType: string): string {
        switch (activityType) {
            case 'excavation':
            case 'concrete':
            case 'backfill':
                return 'م3';
            case 'reinforcement':
                return 'طن';
            case 'formwork':
            case 'waterproofing':
            case 'painting':
                return 'م2';
            case 'installation':
            case 'supply':
                return originalUnit;
            default:
                return originalUnit;
        }
    }

    /**
     * تحويل الأنشطة المستخرجة إلى أنشطة جدول زمني
     * مع تطبيق معامل الورديات واحتياطي الزمن
     */
    static convertToScheduleActivities(
        detailedSpecs: DetailedSpecification[],
        projectStartDate: Date,
        defaultShiftsPerDay: 1 | 2 | 3 = 1
    ): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        let activityId = 1;
        let currentDate = new Date(projectStartDate);

        for (const spec of detailedSpecs) {
            const wbsPrefix = `${spec.category}.${spec.serialNumber}`;

            // إنشاء نشاط لكل نشاط مستخرج
            for (let i = 0; i < spec.extractedActivities.length; i++) {
                const extracted = spec.extractedActivities[i];
                
                // الخطوة 4: حساب المدة الخام بناءً على الإنتاجية والورديات
                const shiftConfig = {
                    shiftsPerDay: defaultShiftsPerDay,
                    shiftFactor: this.getShiftFactor(defaultShiftsPerDay),
                    workHoursPerShift: 8,
                    description: defaultShiftsPerDay === 1 ? 'وردية واحدة' : 
                                defaultShiftsPerDay === 2 ? 'ورديتان' : 'ثلاث ورديات'
                };

                const baseDuration = this.calculateActivityDuration(
                    extracted.type,
                    extracted.estimatedQuantity,
                    extracted.unit,
                    shiftConfig
                );

                // الخطوة 7: إضافة احتياطي الزمن (سيتم تحديث isCritical بعد CPM)
                const { adjustedDuration, riskBuffer } = this.applyRiskBuffer(
                    baseDuration,
                    extracted.type,
                    false, // will be updated after CPM
                    false  // isExternal - can be configured per activity
                );

                const activity: AdvancedScheduleActivity = {
                    id: activityId++,
                    wbsCode: `${wbsPrefix}.${i + 1}`,
                    name: extracted.name,
                    description: extracted.description,
                    category: spec.category,
                    boqItemId: spec.originalItem.id,
                    duration: baseDuration,
                    adjustedDuration: adjustedDuration,
                    startDate: currentDate.toISOString().split('T')[0],
                    endDate: this.addDays(currentDate, adjustedDuration).toISOString().split('T')[0],
                    earlyStart: '',
                    earlyFinish: '',
                    lateStart: '',
                    lateFinish: '',
                    totalFloat: 0,
                    freeFloat: 0,
                    isCritical: false,
                    dependencies: this.generateDependencies(activityId, i),
                    successors: [],
                    resources: this.generateResources(extracted.type),
                    progress: 0,
                    status: 'Not Started' as ActivityStatus,
                    productivityRate: 0,
                    estimatedManHours: this.estimateManHours(extracted.type, extracted.estimatedQuantity),
                    shiftConfig: shiftConfig,
                    riskBuffer: riskBuffer
                };

                activities.push(activity);
                
                // تحديث التاريخ الحالي (مع تداخل جزئي)
                currentDate = this.addDays(currentDate, Math.ceil(adjustedDuration / 2));
            }
        }

        return activities;
    }

    /**
     * حساب مدة النشاط (الخطوة 4)
     * المدة = الكمية ÷ (معدل الإنتاجية × عدد الورديات)
     */
    private static calculateActivityDuration(
        activityType: string,
        quantity: number,
        unit: string,
        shiftConfig?: { shiftsPerDay: 1 | 2 | 3 }
    ): number {
        // معدلات إنتاجية تقديرية (من ProductivityDatabase)
        const rates: { [key: string]: number } = {
            'excavation': 25, // م3 per day
            'concrete': 15,   // م3 per day
            'reinforcement': 1, // ton per day
            'formwork': 20,   // م2 per day
            'waterproofing': 30, // م2 per day
            'backfill': 30,   // م3 per day
            'masonry': 10,    // م2 per day
            'painting': 40,   // م2 per day
            'installation': 5, // units per day
            'supply': 1       // instant
        };

        const rate = rates[activityType] || 10;
        
        // الخطوة 5: معامل التحويل حسب عدد الورديات
        const shiftFactor = this.getShiftFactor(shiftConfig?.shiftsPerDay || 1);
        
        // المدة الخام = الكمية ÷ (معدل × معامل الوردية)
        const rawDuration = quantity / (rate * shiftFactor);
        const calculatedDays = Math.ceil(rawDuration);
        
        // حد أدنى 0.5 يوم، حد أقصى 30 يوم
        return Math.max(0.5, Math.min(30, calculatedDays));
    }

    /**
     * الخطوة 5: معامل التحويل حسب عدد الورديات
     */
    private static getShiftFactor(shiftsPerDay: 1 | 2 | 3): number {
        const factors: { [key: number]: number } = {
            1: 1.0,  // وردية واحدة = 100%
            2: 0.6,  // ورديتان = 60% كفاءة
            3: 0.45  // ثلاث ورديات = 45% كفاءة
        };
        return factors[shiftsPerDay] || 1.0;
    }

    /**
     * الخطوة 7: إضافة احتياطي الزمن (Risk Buffer)
     */
    private static applyRiskBuffer(
        baseDuration: number,
        activityType: string,
        isCritical: boolean,
        isExternal: boolean = false
    ): { adjustedDuration: number; riskBuffer: any } {
        let bufferPercentage = 3; // default: غير حرج
        let riskType: 'non-critical' | 'critical' | 'external' | 'precision' = 'non-critical';
        let reason = 'نشاط غير حرج';

        // تحديد نسبة الاحتياطي حسب نوع النشاط
        if (activityType === 'painting' || activityType === 'installation') {
            bufferPercentage = 8;
            riskType = 'precision';
            reason = 'أعمال دقيقة (رخام، دهان فاخر)';
        } else if (isExternal) {
            bufferPercentage = 6;
            riskType = 'external';
            reason = 'أعمال خارجية (مقاول باطن)';
        } else if (isCritical) {
            bufferPercentage = 5;
            riskType = 'critical';
            reason = 'نشاط حرج (Critical Path)';
        }

        const bufferDays = Math.ceil(baseDuration * (bufferPercentage / 100));
        const adjustedDuration = baseDuration + bufferDays;

        return {
            adjustedDuration,
            riskBuffer: {
                riskType,
                bufferPercentage,
                bufferDays,
                reason
            }
        };
    }

    /**
     * توليد العلاقات التلقائية
     */
    private static generateDependencies(
        currentActivityId: number,
        sequenceInItem: number
    ): any[] {
        // النشاط الأول في كل بند لا يعتمد على شيء
        if (sequenceInItem === 0) {
            return [];
        }

        // الأنشطة الأخرى تعتمد على النشاط السابق (FS)
        return [{
            predecessorId: currentActivityId - 1,
            type: 'FS',
            lag: 0
        }];
    }

    /**
     * توليد الموارد
     */
    private static generateResources(activityType: string): any[] {
        const resourceMap: { [key: string]: any[] } = {
            'excavation': [
                { resourceType: 'Equipment', resourceName: 'حفارة', quantity: 1, unit: 'units', dailyRate: 1200 },
                { resourceType: 'Labor', resourceName: 'عمال', quantity: 3, unit: 'persons', dailyRate: 200 }
            ],
            'concrete': [
                { resourceType: 'Labor', resourceName: 'عمال خرسانة', quantity: 8, unit: 'persons', dailyRate: 250 },
                { resourceType: 'Equipment', resourceName: 'مضخة خرسانة', quantity: 1, unit: 'units', dailyRate: 800 }
            ],
            'reinforcement': [
                { resourceType: 'Labor', resourceName: 'حدادين', quantity: 4, unit: 'persons', dailyRate: 300 }
            ],
            'formwork': [
                { resourceType: 'Labor', resourceName: 'نجارين', quantity: 4, unit: 'persons', dailyRate: 280 }
            ]
        };

        return resourceMap[activityType] || [
            { resourceType: 'Labor', resourceName: 'عمال عامين', quantity: 3, unit: 'persons', dailyRate: 200 }
        ];
    }

    /**
     * تقدير ساعات العمل
     */
    private static estimateManHours(activityType: string, quantity: number): number {
        const hoursPerUnit: { [key: string]: number } = {
            'excavation': 0.5,
            'concrete': 1.0,
            'reinforcement': 8.0,
            'formwork': 0.8,
            'waterproofing': 0.4,
            'backfill': 0.3,
            'masonry': 1.2,
            'painting': 0.2,
            'installation': 2.0,
            'supply': 0.1
        };

        const hours = hoursPerUnit[activityType] || 0.5;
        return Math.ceil(quantity * hours);
    }

    /**
     * إضافة أيام لتاريخ
     */
    private static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

export default SpecificationsAnalyzer;
