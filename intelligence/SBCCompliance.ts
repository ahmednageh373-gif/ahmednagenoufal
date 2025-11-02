/**
 * NOUFAL Scheduling System - Saudi Building Code (SBC) Compliance Checker
 * فاحص الكود السعودي للبناء
 * 
 * Validates activities against Saudi Building Code requirements
 * Codes: SBC 301 (Concrete), SBC 304 (Steel), SBC 306 (Masonry), SBC 308 (Tiles), SBC 403 (Paint)
 */

import { AdvancedScheduleActivity, SBCRequirement } from '../types';

export interface SBCCode {
    code: string;
    title: string;
    titleAr: string;
    requirements: SBCRule[];
}

export interface SBCRule {
    ruleId: string;
    description: string;
    descriptionAr: string;
    minimumDuration?: number; // in days
    requiredInspections?: string[];
    applicableActivities: string[]; // activity keywords
    compliance: 'Mandatory' | 'Recommended';
}

/**
 * Saudi Building Code Compliance Checker
 */
export class SBCCompliance {
    private static codes: SBCCode[] = [
        // ==================== SBC 301: Concrete ====================
        {
            code: 'SBC-301',
            title: 'Concrete Structures',
            titleAr: 'المنشآت الخرسانية',
            requirements: [
                {
                    ruleId: 'SBC-301-7.1',
                    description: 'Minimum curing period for concrete: 7 days',
                    descriptionAr: 'فترة معالجة الخرسانة: 7 أيام كحد أدنى',
                    minimumDuration: 7,
                    requiredInspections: ['Concrete Strength Test', 'Curing Verification'],
                    applicableActivities: ['Concrete Curing', 'Curing', 'معالجة'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-301-6.3',
                    description: 'Formwork removal: Minimum 7 days for slabs, 3 days for walls/columns',
                    descriptionAr: 'فك النجارة: 7 أيام للبلاطات، 3 أيام للجدران والأعمدة',
                    minimumDuration: 3,
                    requiredInspections: ['Concrete Strength Verification'],
                    applicableActivities: ['Formwork Stripping', 'Stripping', 'فك النجارة'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-301-5.2',
                    description: 'Concrete placement must be continuous without cold joints',
                    descriptionAr: 'يجب أن يكون صب الخرسانة متواصلاً بدون وصلات باردة',
                    requiredInspections: ['Pour Inspection', 'Quality Control'],
                    applicableActivities: ['Concrete Pour', 'صب الخرسانة'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-301-4.1',
                    description: 'Concrete temperature during placement: 10-32°C',
                    descriptionAr: 'درجة حرارة الخرسانة أثناء الصب: 10-32 درجة مئوية',
                    requiredInspections: ['Temperature Monitoring'],
                    applicableActivities: ['Concrete Pour'],
                    compliance: 'Mandatory'
                }
            ]
        },
        // ==================== SBC 304: Steel Reinforcement ====================
        {
            code: 'SBC-304',
            title: 'Steel Reinforcement',
            titleAr: 'حديد التسليح',
            requirements: [
                {
                    ruleId: 'SBC-304-7.2',
                    description: 'Minimum concrete cover for reinforcement: 40mm for foundations, 20mm for slabs',
                    descriptionAr: 'الغطاء الخرساني للحديد: 40مم للأساسات، 20مم للبلاطات',
                    requiredInspections: ['Cover Verification', 'Pre-pour Inspection'],
                    applicableActivities: ['Rebar Installation', 'تركيب الحديد'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-304-6.1',
                    description: 'Rebar must be clean and free from rust, oil, or loose scale',
                    descriptionAr: 'يجب أن يكون الحديد نظيفاً وخالياً من الصدأ والزيوت',
                    requiredInspections: ['Material Inspection'],
                    applicableActivities: ['Rebar Installation'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-304-5.3',
                    description: 'Minimum lap splice length: 40 times bar diameter',
                    descriptionAr: 'طول الوصلة: 40 ضعف قطر السيخ كحد أدنى',
                    requiredInspections: ['Rebar Inspection'],
                    applicableActivities: ['Rebar Installation'],
                    compliance: 'Mandatory'
                }
            ]
        },
        // ==================== SBC 306: Masonry ====================
        {
            code: 'SBC-306',
            title: 'Masonry Construction',
            titleAr: 'أعمال البناء',
            requirements: [
                {
                    ruleId: 'SBC-306-4.2',
                    description: 'Block minimum compressive strength: 7 MPa',
                    descriptionAr: 'مقاومة الضغط للبلوك: 7 ميجا باسكال كحد أدنى',
                    requiredInspections: ['Material Testing', 'Block Strength Test'],
                    applicableActivities: ['Blockwork', 'البناء', 'Masonry'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-306-5.1',
                    description: 'Maximum water absorption for blocks: 10%',
                    descriptionAr: 'أقصى امتصاص للماء في البلوك: 10%',
                    requiredInspections: ['Material Testing'],
                    applicableActivities: ['Blockwork'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-306-6.3',
                    description: 'Curing of masonry: Minimum 7 days',
                    descriptionAr: 'معالجة البناء: 7 أيام كحد أدنى',
                    minimumDuration: 7,
                    requiredInspections: ['Curing Verification'],
                    applicableActivities: ['Blockwork', 'Masonry'],
                    compliance: 'Recommended'
                }
            ]
        },
        // ==================== SBC 308: Tiles and Finishes ====================
        {
            code: 'SBC-308',
            title: 'Tiles and Wall Finishes',
            titleAr: 'البلاط والتشطيبات',
            requirements: [
                {
                    ruleId: 'SBC-308-3.1',
                    description: 'Minimum curing time for tile adhesive: 24 hours',
                    descriptionAr: 'وقت معالجة لاصق البلاط: 24 ساعة كحد أدنى',
                    minimumDuration: 1,
                    requiredInspections: ['Adhesive Inspection'],
                    applicableActivities: ['Tiling', 'البلاط', 'Tile'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-308-4.2',
                    description: 'Grouting should be done 24-48 hours after tile installation',
                    descriptionAr: 'يجب عمل الفواصل بعد 24-48 ساعة من تركيب البلاط',
                    requiredInspections: ['Grouting Inspection'],
                    applicableActivities: ['Tiling'],
                    compliance: 'Mandatory'
                }
            ]
        },
        // ==================== SBC 403: Painting ====================
        {
            code: 'SBC-403',
            title: 'Painting and Coating',
            titleAr: 'الدهانات والطلاء',
            requirements: [
                {
                    ruleId: 'SBC-403-5.1',
                    description: 'Surface must be clean, dry, and free from dust before painting',
                    descriptionAr: 'يجب أن يكون السطح نظيفاً وجافاً وخالياً من الغبار قبل الدهان',
                    requiredInspections: ['Surface Preparation Check'],
                    applicableActivities: ['Painting', 'الدهان', 'Paint'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-403-6.2',
                    description: 'Minimum drying time between coats: 24 hours',
                    descriptionAr: 'وقت الجفاف بين الطبقات: 24 ساعة كحد أدنى',
                    minimumDuration: 1,
                    requiredInspections: ['Coating Inspection'],
                    applicableActivities: ['Painting'],
                    compliance: 'Mandatory'
                },
                {
                    ruleId: 'SBC-403-4.3',
                    description: 'Ambient temperature during painting: 10-35°C',
                    descriptionAr: 'درجة الحرارة المحيطة أثناء الدهان: 10-35 درجة مئوية',
                    requiredInspections: ['Environmental Conditions Check'],
                    applicableActivities: ['Painting'],
                    compliance: 'Recommended'
                }
            ]
        }
    ];

    /**
     * Check activity compliance with SBC
     */
    static checkCompliance(activity: AdvancedScheduleActivity): SBCRequirement[] {
        const requirements: SBCRequirement[] = [];

        for (const code of this.codes) {
            for (const rule of code.requirements) {
                // Check if rule applies to this activity
                const applies = rule.applicableActivities.some(keyword =>
                    activity.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    activity.description.toLowerCase().includes(keyword.toLowerCase()) ||
                    activity.category.toLowerCase().includes(keyword.toLowerCase())
                );

                if (applies) {
                    // Check compliance
                    let isCompliant = true;
                    let complianceNotes = '';

                    // Check duration compliance
                    if (rule.minimumDuration && activity.duration < rule.minimumDuration) {
                        isCompliant = false;
                        complianceNotes = `Duration ${activity.duration} days is less than required ${rule.minimumDuration} days`;
                    }

                    requirements.push({
                        code: rule.ruleId,
                        description: `${rule.descriptionAr} | ${rule.description}`,
                        minimumDuration: rule.minimumDuration,
                        requiredInspections: rule.requiredInspections,
                        complianceNotes: complianceNotes || 'Activity meets SBC requirements',
                        isCompliant
                    });
                }
            }
        }

        return requirements;
    }

    /**
     * Apply SBC compliance adjustments to activities
     */
    static applyComplianceAdjustments(activities: AdvancedScheduleActivity[]): void {
        for (const activity of activities) {
            const requirements = this.checkCompliance(activity);
            activity.sbcRequirements = requirements;

            // Adjust duration if non-compliant
            for (const req of requirements) {
                if (!req.isCompliant && req.minimumDuration) {
                    if (activity.duration < req.minimumDuration) {
                        activity.duration = req.minimumDuration;
                    }
                }
            }
        }
    }

    /**
     * Get all SBC codes
     */
    static getAllCodes(): SBCCode[] {
        return this.codes;
    }

    /**
     * Get specific SBC code requirements
     */
    static getCodeRequirements(codeNumber: string): SBCCode | null {
        return this.codes.find(c => c.code === codeNumber) || null;
    }

    /**
     * Generate compliance report for all activities
     */
    static generateComplianceReport(activities: AdvancedScheduleActivity[]): {
        totalActivities: number;
        compliantActivities: number;
        nonCompliantActivities: number;
        compliancePercentage: number;
        violations: {
            activityId: number;
            activityName: string;
            violations: SBCRequirement[];
        }[];
    } {
        let compliant = 0;
        const violations: {
            activityId: number;
            activityName: string;
            violations: SBCRequirement[];
        }[] = [];

        for (const activity of activities) {
            const requirements = activity.sbcRequirements || this.checkCompliance(activity);
            const hasViolations = requirements.some(req => !req.isCompliant);

            if (hasViolations) {
                violations.push({
                    activityId: activity.id,
                    activityName: activity.name,
                    violations: requirements.filter(req => !req.isCompliant)
                });
            } else if (requirements.length > 0) {
                compliant++;
            }
        }

        const totalWithRequirements = compliant + violations.length;
        const compliancePercentage = totalWithRequirements > 0 
            ? (compliant / totalWithRequirements) * 100 
            : 100;

        return {
            totalActivities: activities.length,
            compliantActivities: compliant,
            nonCompliantActivities: violations.length,
            compliancePercentage,
            violations
        };
    }

    /**
     * Get recommended inspection schedule based on SBC requirements
     */
    static getInspectionSchedule(activities: AdvancedScheduleActivity[]): {
        activityId: number;
        activityName: string;
        inspectionDate: string;
        inspectionType: string;
        sbcReference: string;
    }[] {
        const inspections: {
            activityId: number;
            activityName: string;
            inspectionDate: string;
            inspectionType: string;
            sbcReference: string;
        }[] = [];

        for (const activity of activities) {
            const requirements = activity.sbcRequirements || this.checkCompliance(activity);

            for (const req of requirements) {
                if (req.requiredInspections) {
                    for (const inspection of req.requiredInspections) {
                        // Schedule inspection before activity end
                        const inspectionDate = activity.startDate; // Typically at start or before pour

                        inspections.push({
                            activityId: activity.id,
                            activityName: activity.name,
                            inspectionDate,
                            inspectionType: inspection,
                            sbcReference: req.code
                        });
                    }
                }
            }
        }

        return inspections;
    }
}

export default SBCCompliance;
