/**
 * NOUFAL Scheduling System - Productivity Database
 * قاعدة بيانات معدلات الإنتاجية للمملكة العربية السعودية
 * 
 * Based on Saudi construction industry standards and practices
 * Includes labor productivity, equipment rates, and crew compositions
 */

import { ProductivityRate } from '../types';

export interface ProductivityData {
    category: string;
    categoryAr: string;
    activities: ProductivityRate[];
}

/**
 * Comprehensive Saudi Arabia Construction Productivity Database
 * معدلات الإنتاجية حسب المعايير السعودية
 */
export class ProductivityDatabase {
    private static database: ProductivityData[] = [
        // ==================== خرسانة (Concrete) ====================
        {
            category: 'Concrete',
            categoryAr: 'الخرسانة',
            activities: [
                {
                    activityType: 'Concrete Pour - Foundations',
                    unit: 'm3',
                    laborProductivity: 0.8, // m3 per man-hour
                    equipmentProductivity: 12, // m3 per hour (concrete pump)
                    crewSize: 10,
                    crewComposition: [
                        { role: 'Foreman', count: 1 },
                        { role: 'Skilled Labor', count: 3 },
                        { role: 'General Labor', count: 6 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Concrete Pour - Columns',
                    unit: 'm3',
                    laborProductivity: 0.6,
                    equipmentProductivity: 10,
                    crewSize: 8,
                    crewComposition: [
                        { role: 'Foreman', count: 1 },
                        { role: 'Skilled Labor', count: 3 },
                        { role: 'General Labor', count: 4 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Concrete Pour - Slabs',
                    unit: 'm3',
                    laborProductivity: 1.0,
                    equipmentProductivity: 15,
                    crewSize: 12,
                    crewComposition: [
                        { role: 'Foreman', count: 1 },
                        { role: 'Skilled Labor', count: 4 },
                        { role: 'General Labor', count: 7 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Concrete Curing',
                    unit: 'm2',
                    laborProductivity: 50, // m2 per man-hour
                    crewSize: 2,
                    crewComposition: [
                        { role: 'General Labor', count: 2 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== حديد التسليح (Reinforcement) ====================
        {
            category: 'Reinforcement',
            categoryAr: 'حديد التسليح',
            activities: [
                {
                    activityType: 'Rebar Cutting and Bending',
                    unit: 'ton',
                    laborProductivity: 0.15, // ton per man-hour
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Steel Fixer', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Rebar Installation - Footings',
                    unit: 'ton',
                    laborProductivity: 0.12,
                    crewSize: 4,
                    crewComposition: [
                        { role: 'Steel Fixer', count: 3 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Rebar Installation - Columns',
                    unit: 'ton',
                    laborProductivity: 0.10,
                    crewSize: 4,
                    crewComposition: [
                        { role: 'Steel Fixer', count: 3 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Rebar Installation - Slabs',
                    unit: 'ton',
                    laborProductivity: 0.14,
                    crewSize: 6,
                    crewComposition: [
                        { role: 'Steel Fixer', count: 4 },
                        { role: 'Helper', count: 2 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== نجارة الخرسانة (Formwork) ====================
        {
            category: 'Formwork',
            categoryAr: 'نجارة الخرسانة',
            activities: [
                {
                    activityType: 'Formwork - Footings',
                    unit: 'm2',
                    laborProductivity: 2.5,
                    crewSize: 4,
                    crewComposition: [
                        { role: 'Carpenter', count: 3 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Formwork - Columns',
                    unit: 'm2',
                    laborProductivity: 2.0,
                    crewSize: 4,
                    crewComposition: [
                        { role: 'Carpenter', count: 3 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Formwork - Slabs',
                    unit: 'm2',
                    laborProductivity: 3.0,
                    crewSize: 6,
                    crewComposition: [
                        { role: 'Carpenter', count: 4 },
                        { role: 'Helper', count: 2 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Formwork Stripping',
                    unit: 'm2',
                    laborProductivity: 8.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Carpenter', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== البناء (Masonry) ====================
        {
            category: 'Masonry',
            categoryAr: 'البناء',
            activities: [
                {
                    activityType: 'Blockwork - 20cm',
                    unit: 'm2',
                    laborProductivity: 3.5,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Mason', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Blockwork - 15cm',
                    unit: 'm2',
                    laborProductivity: 4.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Mason', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Blockwork - 10cm',
                    unit: 'm2',
                    laborProductivity: 4.5,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Mason', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Brickwork',
                    unit: 'm2',
                    laborProductivity: 3.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Mason', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== اللياسة (Plastering) ====================
        {
            category: 'Plastering',
            categoryAr: 'اللياسة',
            activities: [
                {
                    activityType: 'Internal Plastering',
                    unit: 'm2',
                    laborProductivity: 5.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Plasterer', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'External Plastering',
                    unit: 'm2',
                    laborProductivity: 4.5,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Plasterer', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Gypsum Plastering',
                    unit: 'm2',
                    laborProductivity: 6.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Plasterer', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== البلاط (Tiling) ====================
        {
            category: 'Tiling',
            categoryAr: 'البلاط',
            activities: [
                {
                    activityType: 'Floor Tiling - Ceramic',
                    unit: 'm2',
                    laborProductivity: 5.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Tile Setter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Floor Tiling - Porcelain',
                    unit: 'm2',
                    laborProductivity: 4.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Tile Setter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Wall Tiling',
                    unit: 'm2',
                    laborProductivity: 4.5,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Tile Setter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Marble Installation',
                    unit: 'm2',
                    laborProductivity: 3.5,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Marble Setter', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== الدهانات (Painting) ====================
        {
            category: 'Painting',
            categoryAr: 'الدهانات',
            activities: [
                {
                    activityType: 'Interior Painting - Emulsion',
                    unit: 'm2',
                    laborProductivity: 25.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Painter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Exterior Painting',
                    unit: 'm2',
                    laborProductivity: 20.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Painter', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Primer Coat',
                    unit: 'm2',
                    laborProductivity: 30.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Painter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== السباكة (Plumbing) ====================
        {
            category: 'Plumbing',
            categoryAr: 'السباكة',
            activities: [
                {
                    activityType: 'Water Pipe Installation - PVC',
                    unit: 'm',
                    laborProductivity: 8.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Plumber', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Drainage Pipe Installation',
                    unit: 'm',
                    laborProductivity: 6.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Plumber', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Sanitary Fixtures Installation',
                    unit: 'no',
                    laborProductivity: 2.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Plumber', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== الكهرباء (Electrical) ====================
        {
            category: 'Electrical',
            categoryAr: 'الكهرباء',
            activities: [
                {
                    activityType: 'Conduit Installation',
                    unit: 'm',
                    laborProductivity: 12.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Electrician', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Cable Pulling',
                    unit: 'm',
                    laborProductivity: 20.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Electrician', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Lighting Fixtures Installation',
                    unit: 'no',
                    laborProductivity: 4.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Electrician', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Panel Board Installation',
                    unit: 'no',
                    laborProductivity: 0.5,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Electrician', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== التكييف (HVAC) ====================
        {
            category: 'HVAC',
            categoryAr: 'التكييف',
            activities: [
                {
                    activityType: 'Duct Installation',
                    unit: 'm2',
                    laborProductivity: 3.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'HVAC Technician', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'AC Unit Installation - Split',
                    unit: 'no',
                    laborProductivity: 1.5,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'HVAC Technician', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Chiller Installation',
                    unit: 'no',
                    laborProductivity: 0.2,
                    crewSize: 4,
                    crewComposition: [
                        { role: 'HVAC Technician', count: 2 },
                        { role: 'Crane Operator', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== الحفر (Excavation) ====================
        {
            category: 'Excavation',
            categoryAr: 'الحفر',
            activities: [
                {
                    activityType: 'Excavation - Normal Soil',
                    unit: 'm3',
                    laborProductivity: 0.5,
                    equipmentProductivity: 25, // m3 per hour (excavator)
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Excavator Operator', count: 1 },
                        { role: 'General Labor', count: 2 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Excavation - Rock',
                    unit: 'm3',
                    laborProductivity: 0.2,
                    equipmentProductivity: 8,
                    crewSize: 4,
                    crewComposition: [
                        { role: 'Excavator Operator', count: 1 },
                        { role: 'Blaster', count: 1 },
                        { role: 'General Labor', count: 2 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Backfilling',
                    unit: 'm3',
                    laborProductivity: 0.8,
                    equipmentProductivity: 30,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Equipment Operator', count: 1 },
                        { role: 'General Labor', count: 2 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== النجارة (Carpentry) ====================
        {
            category: 'Carpentry',
            categoryAr: 'النجارة',
            activities: [
                {
                    activityType: 'Door Installation - Wooden',
                    unit: 'no',
                    laborProductivity: 2.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Carpenter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Window Installation - Aluminum',
                    unit: 'm2',
                    laborProductivity: 3.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Carpenter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Kitchen Cabinet Installation',
                    unit: 'm',
                    laborProductivity: 2.5,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Carpenter', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        },
        // ==================== العزل (Insulation/Waterproofing) ====================
        {
            category: 'Insulation',
            categoryAr: 'العزل',
            activities: [
                {
                    activityType: 'Waterproofing - Membrane',
                    unit: 'm2',
                    laborProductivity: 15.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Waterproofing Specialist', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Thermal Insulation - Walls',
                    unit: 'm2',
                    laborProductivity: 20.0,
                    crewSize: 2,
                    crewComposition: [
                        { role: 'Insulation Worker', count: 1 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                },
                {
                    activityType: 'Roof Insulation',
                    unit: 'm2',
                    laborProductivity: 18.0,
                    crewSize: 3,
                    crewComposition: [
                        { role: 'Insulation Worker', count: 2 },
                        { role: 'Helper', count: 1 }
                    ],
                    region: 'Riyadh'
                }
            ]
        }
    ];

    /**
     * Get productivity rate for a specific activity type
     */
    static getProductivityRate(activityType: string): ProductivityRate | null {
        for (const category of this.database) {
            const activity = category.activities.find(a => 
                a.activityType.toLowerCase().includes(activityType.toLowerCase())
            );
            if (activity) return activity;
        }
        return null;
    }

    /**
     * Search for activities by keywords
     */
    static searchActivities(keywords: string[]): ProductivityRate[] {
        const results: ProductivityRate[] = [];
        for (const category of this.database) {
            for (const activity of category.activities) {
                const activityText = activity.activityType.toLowerCase();
                if (keywords.some(keyword => activityText.includes(keyword.toLowerCase()))) {
                    results.push(activity);
                }
            }
        }
        return results;
    }

    /**
     * Get all activities in a category
     */
    static getActivitiesByCategory(category: string): ProductivityRate[] {
        const categoryData = this.database.find(c => 
            c.category.toLowerCase() === category.toLowerCase() || 
            c.categoryAr === category
        );
        return categoryData ? categoryData.activities : [];
    }

    /**
     * Calculate activity duration based on quantity
     */
    static calculateDuration(
        activityType: string, 
        quantity: number, 
        workingHoursPerDay: number = 8
    ): number {
        const rate = this.getProductivityRate(activityType);
        if (!rate) return 0;

        const productivityPerHour = rate.laborProductivity * rate.crewSize;
        const totalHours = quantity / productivityPerHour;
        const days = Math.ceil(totalHours / workingHoursPerDay);
        
        return days;
    }

    /**
     * Calculate man-hours required
     */
    static calculateManHours(activityType: string, quantity: number): number {
        const rate = this.getProductivityRate(activityType);
        if (!rate) return 0;

        return (quantity / rate.laborProductivity) * rate.crewSize;
    }

    /**
     * Get all categories
     */
    static getAllCategories(): { category: string; categoryAr: string }[] {
        return this.database.map(d => ({
            category: d.category,
            categoryAr: d.categoryAr
        }));
    }

    /**
     * Get database statistics
     */
    static getStatistics() {
        return {
            totalCategories: this.database.length,
            totalActivities: this.database.reduce((sum, cat) => sum + cat.activities.length, 0),
            averageCrewSize: this.database
                .flatMap(cat => cat.activities)
                .reduce((sum, act) => sum + act.crewSize, 0) / 
                this.database.flatMap(cat => cat.activities).length
        };
    }

    /**
     * Get full database
     */
    static getFullDatabase(): ProductivityData[] {
        return this.database;
    }
}

export default ProductivityDatabase;
