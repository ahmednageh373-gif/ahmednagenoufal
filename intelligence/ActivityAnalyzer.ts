/**
 * NOUFAL Scheduling System - Activity Analyzer
 * محلل الأنشطة - تفكيك بنود المقايسة إلى هيكل تقسيم العمل (WBS)
 * 
 * Breaks down BOQ items into detailed construction activities with durations
 */

import { FinancialItem } from '../types';
import { 
    AdvancedScheduleActivity, 
    WBSItem, 
    ResourceRequirement,
    ActivityStatus 
} from '../types';
import ProductivityDatabase from './ProductivityDatabase';
import { ItemClassifier } from './ItemClassifier';

export interface ActivityBreakdown {
    boqItem: FinancialItem;
    activities: AdvancedScheduleActivity[];
    wbsCode: string;
    totalDuration: number;
    totalCost: number;
}

/**
 * Activity Analyzer - Converts BOQ items into detailed WBS activities
 */
export class ActivityAnalyzer {
    private activityIdCounter: number = 1;

    /**
     * Analyze BOQ items and break them down into activities
     */
    analyzeAndBreakdown(boqItems: FinancialItem[]): ActivityBreakdown[] {
        const breakdowns: ActivityBreakdown[] = [];
        
        for (const item of boqItems) {
            const breakdown = this.breakdownBOQItem(item);
            breakdowns.push(breakdown);
        }

        return breakdowns;
    }

    /**
     * Break down a single BOQ item into sub-activities
     */
    private breakdownBOQItem(boqItem: FinancialItem): ActivityBreakdown {
        // Classify the item first
        const classifier = new ItemClassifier();
        const classified = classifier.classify(boqItem);
        
        const category = classified.category;
        const activities: AdvancedScheduleActivity[] = [];
        
        // Generate WBS code
        const wbsCode = this.generateWBSCode(category, boqItem.id);

        // Break down based on category
        switch (category) {
            case 'concrete':
                activities.push(...this.breakdownConcrete(boqItem, wbsCode));
                break;
            case 'steel':
                activities.push(...this.breakdownSteel(boqItem, wbsCode));
                break;
            case 'masonry':
                activities.push(...this.breakdownMasonry(boqItem, wbsCode));
                break;
            case 'plastering':
                activities.push(...this.breakdownPlastering(boqItem, wbsCode));
                break;
            case 'tiles':
                activities.push(...this.breakdownTiling(boqItem, wbsCode));
                break;
            case 'paint':
                activities.push(...this.breakdownPainting(boqItem, wbsCode));
                break;
            case 'doors':
            case 'windows':
                activities.push(...this.breakdownCarpentry(boqItem, wbsCode));
                break;
            case 'plumbing':
                activities.push(...this.breakdownPlumbing(boqItem, wbsCode));
                break;
            case 'electrical':
                activities.push(...this.breakdownElectrical(boqItem, wbsCode));
                break;
            case 'hvac':
                activities.push(...this.breakdownHVAC(boqItem, wbsCode));
                break;
            case 'excavation':
                activities.push(...this.breakdownExcavation(boqItem, wbsCode));
                break;
            case 'insulation':
                activities.push(...this.breakdownInsulation(boqItem, wbsCode));
                break;
            default:
                // Generic breakdown
                activities.push(this.createGenericActivity(boqItem, wbsCode));
                break;
        }

        const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);
        const totalCost = boqItem.total;

        return {
            boqItem,
            activities,
            wbsCode,
            totalDuration,
            totalCost
        };
    }

    /**
     * Breakdown concrete activities
     */
    private breakdownConcrete(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        // Determine concrete type (foundations, columns, slabs, etc.)
        const itemText = boqItem.item.toLowerCase();
        let concreteType = 'Slabs';
        
        if (itemText.includes('أساس') || itemText.includes('قواعد') || itemText.includes('foundation')) {
            concreteType = 'Foundations';
        } else if (itemText.includes('عمود') || itemText.includes('أعمدة') || itemText.includes('column')) {
            concreteType = 'Columns';
        }

        // 1. Formwork
        const formworkActivity = this.createActivity(
            `${wbsCode}.1`,
            `نجارة الخرسانة - ${boqItem.item}`,
            `Formwork - ${concreteType}`,
            'Formwork',
            quantity,
            boqItem.id
        );
        activities.push(formworkActivity);

        // 2. Reinforcement
        const rebarActivity = this.createActivity(
            `${wbsCode}.2`,
            `حديد التسليح - ${boqItem.item}`,
            `Rebar Installation - ${concreteType}`,
            'Reinforcement',
            quantity * 0.15, // Estimate rebar tonnage
            boqItem.id
        );
        activities.push(rebarActivity);

        // 3. Concrete Pour
        const pourActivity = this.createActivity(
            `${wbsCode}.3`,
            `صب الخرسانة - ${boqItem.item}`,
            `Concrete Pour - ${concreteType}`,
            'Concrete',
            quantity,
            boqItem.id
        );
        activities.push(pourActivity);

        // 4. Curing (7 days minimum per SBC 301)
        const curingActivity = this.createActivity(
            `${wbsCode}.4`,
            `معالجة الخرسانة - ${boqItem.item}`,
            'Concrete Curing',
            'Concrete',
            quantity * 5, // m2 approximation
            boqItem.id,
            7 // Minimum curing duration
        );
        activities.push(curingActivity);

        // 5. Formwork Stripping
        const strippingActivity = this.createActivity(
            `${wbsCode}.5`,
            `فك النجارة - ${boqItem.item}`,
            'Formwork Stripping',
            'Formwork',
            quantity,
            boqItem.id
        );
        activities.push(strippingActivity);

        return activities;
    }

    /**
     * Breakdown steel reinforcement activities
     */
    private breakdownSteel(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        // 1. Cutting and Bending
        const cuttingActivity = this.createActivity(
            `${wbsCode}.1`,
            `قص وتشكيل الحديد - ${boqItem.item}`,
            'Rebar Cutting and Bending',
            'Reinforcement',
            quantity,
            boqItem.id
        );
        activities.push(cuttingActivity);

        // 2. Installation
        const installActivity = this.createActivity(
            `${wbsCode}.2`,
            `تركيب الحديد - ${boqItem.item}`,
            'Rebar Installation - Slabs',
            'Reinforcement',
            quantity,
            boqItem.id
        );
        activities.push(installActivity);

        return activities;
    }

    /**
     * Breakdown masonry activities
     */
    private breakdownMasonry(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        // Blockwork activity
        const blockworkActivity = this.createActivity(
            `${wbsCode}.1`,
            `بناء البلوك - ${boqItem.item}`,
            'Blockwork - 20cm',
            'Masonry',
            quantity,
            boqItem.id
        );
        activities.push(blockworkActivity);

        return activities;
    }

    /**
     * Breakdown plastering activities
     */
    private breakdownPlastering(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const plasteringActivity = this.createActivity(
            `${wbsCode}.1`,
            `اللياسة - ${boqItem.item}`,
            'Internal Plastering',
            'Plastering',
            quantity,
            boqItem.id
        );
        activities.push(plasteringActivity);

        return activities;
    }

    /**
     * Breakdown tiling activities
     */
    private breakdownTiling(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const tilingActivity = this.createActivity(
            `${wbsCode}.1`,
            `تركيب البلاط - ${boqItem.item}`,
            'Floor Tiling - Ceramic',
            'Tiling',
            quantity,
            boqItem.id
        );
        activities.push(tilingActivity);

        return activities;
    }

    /**
     * Breakdown painting activities
     */
    private breakdownPainting(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        // 1. Primer
        const primerActivity = this.createActivity(
            `${wbsCode}.1`,
            `طبقة الأساس - ${boqItem.item}`,
            'Primer Coat',
            'Painting',
            quantity,
            boqItem.id
        );
        activities.push(primerActivity);

        // 2. Final Paint
        const paintActivity = this.createActivity(
            `${wbsCode}.2`,
            `الدهان النهائي - ${boqItem.item}`,
            'Interior Painting - Emulsion',
            'Painting',
            quantity,
            boqItem.id
        );
        activities.push(paintActivity);

        return activities;
    }

    /**
     * Breakdown carpentry activities
     */
    private breakdownCarpentry(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const carpentryActivity = this.createActivity(
            `${wbsCode}.1`,
            `تركيب - ${boqItem.item}`,
            'Door Installation - Wooden',
            'Carpentry',
            quantity,
            boqItem.id
        );
        activities.push(carpentryActivity);

        return activities;
    }

    /**
     * Breakdown plumbing activities
     */
    private breakdownPlumbing(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const plumbingActivity = this.createActivity(
            `${wbsCode}.1`,
            `السباكة - ${boqItem.item}`,
            'Water Pipe Installation - PVC',
            'Plumbing',
            quantity,
            boqItem.id
        );
        activities.push(plumbingActivity);

        return activities;
    }

    /**
     * Breakdown electrical activities
     */
    private breakdownElectrical(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const electricalActivity = this.createActivity(
            `${wbsCode}.1`,
            `الكهرباء - ${boqItem.item}`,
            'Conduit Installation',
            'Electrical',
            quantity,
            boqItem.id
        );
        activities.push(electricalActivity);

        return activities;
    }

    /**
     * Breakdown HVAC activities
     */
    private breakdownHVAC(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const hvacActivity = this.createActivity(
            `${wbsCode}.1`,
            `التكييف - ${boqItem.item}`,
            'AC Unit Installation - Split',
            'HVAC',
            quantity,
            boqItem.id
        );
        activities.push(hvacActivity);

        return activities;
    }

    /**
     * Breakdown excavation activities
     */
    private breakdownExcavation(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const excavationActivity = this.createActivity(
            `${wbsCode}.1`,
            `الحفر - ${boqItem.item}`,
            'Excavation - Normal Soil',
            'Excavation',
            quantity,
            boqItem.id
        );
        activities.push(excavationActivity);

        return activities;
    }

    /**
     * Breakdown insulation activities
     */
    private breakdownInsulation(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity[] {
        const activities: AdvancedScheduleActivity[] = [];
        const quantity = boqItem.quantity;

        const insulationActivity = this.createActivity(
            `${wbsCode}.1`,
            `العزل - ${boqItem.item}`,
            'Waterproofing - Membrane',
            'Insulation',
            quantity,
            boqItem.id
        );
        activities.push(insulationActivity);

        return activities;
    }

    /**
     * Create a generic activity for unclassified items
     */
    private createGenericActivity(boqItem: FinancialItem, wbsCode: string): AdvancedScheduleActivity {
        return {
            id: this.activityIdCounter++,
            wbsCode: `${wbsCode}.1`,
            name: boqItem.item,
            description: `تنفيذ ${boqItem.item}`,
            category: 'General',
            boqItemId: boqItem.id,
            duration: 5, // Default 5 days
            startDate: '',
            endDate: '',
            earlyStart: '',
            earlyFinish: '',
            lateStart: '',
            lateFinish: '',
            totalFloat: 0,
            freeFloat: 0,
            isCritical: false,
            dependencies: [],
            successors: [],
            resources: [],
            progress: 0,
            status: 'Not Started' as ActivityStatus,
            productivityRate: 0,
            estimatedManHours: boqItem.quantity * 8
        };
    }

    /**
     * Create an activity with productivity calculations
     */
    private createActivity(
        wbsCode: string,
        name: string,
        activityType: string,
        category: string,
        quantity: number,
        boqItemId: string,
        minimumDuration?: number
    ): AdvancedScheduleActivity {
        // Get productivity rate
        const productivityRate = ProductivityDatabase.getProductivityRate(activityType);
        
        let duration = minimumDuration || 1;
        let manHours = 0;
        const resources: ResourceRequirement[] = [];

        if (productivityRate) {
            // Calculate duration
            duration = Math.max(
                minimumDuration || 1,
                ProductivityDatabase.calculateDuration(activityType, quantity)
            );
            
            // Calculate man-hours
            manHours = ProductivityDatabase.calculateManHours(activityType, quantity);

            // Add crew as resources
            productivityRate.crewComposition.forEach(crew => {
                resources.push({
                    resourceType: 'Labor',
                    resourceName: crew.role,
                    quantity: crew.count,
                    unit: 'persons',
                    dailyRate: 200 // Default daily rate in SAR
                });
            });
        }

        return {
            id: this.activityIdCounter++,
            wbsCode,
            name,
            description: `${activityType} - ${quantity} ${productivityRate?.unit || 'unit'}`,
            category,
            boqItemId,
            duration,
            startDate: '',
            endDate: '',
            earlyStart: '',
            earlyFinish: '',
            lateStart: '',
            lateFinish: '',
            totalFloat: 0,
            freeFloat: 0,
            isCritical: false,
            dependencies: [],
            successors: [],
            resources,
            progress: 0,
            status: 'Not Started' as ActivityStatus,
            productivityRate: productivityRate?.laborProductivity || 0,
            estimatedManHours: manHours
        };
    }

    /**
     * Generate WBS code based on category and BOQ item ID
     */
    private generateWBSCode(category: string, boqItemId: string): string {
        const categoryMap: { [key: string]: string } = {
            concrete: '01',
            steel: '02',
            masonry: '03',
            plastering: '04',
            tiles: '05',
            paint: '06',
            doors: '07',
            windows: '08',
            plumbing: '09',
            electrical: '10',
            hvac: '11',
            excavation: '12',
            insulation: '13',
            finishing: '14'
        };

        const categoryCode = categoryMap[category] || '99';
        const itemNumber = boqItemId.replace(/\D/g, '').padStart(4, '0');
        
        return `${categoryCode}.${itemNumber}`;
    }

    /**
     * Build complete WBS structure
     */
    buildWBS(breakdowns: ActivityBreakdown[]): WBSItem[] {
        const wbsItems: WBSItem[] = [];
        const categoryGroups = new Map<string, ActivityBreakdown[]>();

        // Group by category
        for (const breakdown of breakdowns) {
            const categoryCode = breakdown.wbsCode.split('.')[0];
            if (!categoryGroups.has(categoryCode)) {
                categoryGroups.set(categoryCode, []);
            }
            categoryGroups.get(categoryCode)!.push(breakdown);
        }

        // Create WBS items
        categoryGroups.forEach((items, categoryCode) => {
            const allActivities = items.flatMap(item => item.activities);
            const totalDuration = Math.max(...items.map(i => i.totalDuration));
            const totalCost = items.reduce((sum, i) => sum + i.totalCost, 0);

            wbsItems.push({
                code: categoryCode,
                level: 1,
                name: this.getCategoryName(categoryCode),
                activities: allActivities,
                totalDuration,
                totalCost
            });
        });

        return wbsItems;
    }

    /**
     * Get category name from code
     */
    private getCategoryName(code: string): string {
        const nameMap: { [key: string]: string } = {
            '01': 'الخرسانة (Concrete)',
            '02': 'حديد التسليح (Reinforcement)',
            '03': 'البناء (Masonry)',
            '04': 'اللياسة (Plastering)',
            '05': 'البلاط (Tiling)',
            '06': 'الدهانات (Painting)',
            '07': 'الأبواب (Doors)',
            '08': 'النوافذ (Windows)',
            '09': 'السباكة (Plumbing)',
            '10': 'الكهرباء (Electrical)',
            '11': 'التكييف (HVAC)',
            '12': 'الحفر (Excavation)',
            '13': 'العزل (Insulation)',
            '14': 'التشطيبات (Finishing)',
            '99': 'عام (General)'
        };

        return nameMap[code] || 'Unknown';
    }
}

export default ActivityAnalyzer;
