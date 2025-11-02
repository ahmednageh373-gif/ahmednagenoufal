/**
 * نظام التصنيف الذكي للبنود الهندسية
 * Intelligent Item Classification System for Construction Projects
 * 
 * @module ItemClassifier
 * @version 1.0.0
 */

import type { FinancialItem } from '../types';

// ============================
// Types & Interfaces
// ============================

export interface ItemCategory {
    name: string;
    nameAr: string;
    keywords: string[];
    units: string[];
    wastageRate: number;
    color: string;
    priority: 'high' | 'medium' | 'low';
    description?: string;
}

export interface ClassificationResult {
    category: string;
    categoryAr: string;
    confidence: number;
    wastageRate: number;
    color: string;
    priority: 'high' | 'medium' | 'low';
    matchedKeywords: string[];
    suggestions: string[];
    aiReasoning?: string;
}

export interface ClassifiedFinancialItem extends FinancialItem {
    classification: ClassificationResult;
}

export interface CategoryStatistics {
    total: number;
    byCategory: Record<string, {
        count: number;
        totalCost: number;
        totalCostWithWastage: number;
        avgWastageRate: number;
        color: string;
    }>;
    totalCost: number;
    totalCostWithWastage: number;
    totalWastage: number;
}

// ============================
// Main Classifier Class
// ============================

export class ItemClassifier {
    private categories: Record<string, ItemCategory> = {
        concrete: {
            name: 'Concrete',
            nameAr: 'خرسانة',
            description: 'أعمال الخرسانة المسلحة والعادية',
            keywords: [
                'خرسانة', 'صبة', 'بيتون', 'concrete', 'صب',
                'خرسانه', 'كونكريت', 'اسمنت مسلح', 'خرسانة مسلحة',
                'خرسانة عادية', 'قواعد', 'أساسات', 'أعمدة', 'جسور',
                'بلاطات', 'سقف', 'لبشة'
            ],
            units: ['م³', 'm3', 'متر مكعب', 'cubic meter', 'مكعب'],
            wastageRate: 0.05, // 5%
            color: '#808080',
            priority: 'high'
        },

        steel: {
            name: 'Steel Reinforcement',
            nameAr: 'حديد تسليح',
            description: 'حديد التسليح وقضبان الحديد',
            keywords: [
                'حديد', 'تسليح', 'steel', 'قضبان', 'حديد تسليح',
                'شبك', 'سيخ', 'اسياخ', 'حديد مسلح', 'قضيب',
                'حديد 8', 'حديد 10', 'حديد 12', 'حديد 14', 'حديد 16',
                'حديد 20', 'حديد 25', 'حديد 32', 'شبك حديد',
                'شبوك', 'حديد تسليح عادي', 'حديد عالي المقاومة'
            ],
            units: ['طن', 'كجم', 'ton', 'kg', 'كيلو', 'كيلوجرام'],
            wastageRate: 0.07, // 7%
            color: '#8B0000',
            priority: 'high'
        },

        tiles: {
            name: 'Tiles & Flooring',
            nameAr: 'بلاط وأرضيات',
            description: 'البلاط والسيراميك والرخام',
            keywords: [
                'بلاط', 'سيراميك', 'رخام', 'جرانيت', 'tile',
                'ceramic', 'بورسلين', 'ارضيات', 'سراميك', 'بلاطات',
                'فرش', 'أرضية', 'تبليط', 'موزاييك', 'باركيه',
                'رخام طبيعي', 'رخام صناعي', 'جرانيت', 'حجر'
            ],
            units: ['م²', 'm2', 'متر مربع', 'square meter', 'مربع'],
            wastageRate: 0.10, // 10%
            color: '#F5DEB3',
            priority: 'medium'
        },

        paint: {
            name: 'Paint & Finishing',
            nameAr: 'دهانات',
            description: 'أعمال الدهان والطلاء',
            keywords: [
                'دهان', 'طلاء', 'paint', 'صبغ', 'بوية',
                'دهانات', 'معجون', 'طلاء داخلي', 'طلاء خارجي',
                'بلاستيك', 'زيت', 'جير', 'سيلر', 'برايمر',
                'وجه أول', 'وجه ثاني', 'وجه نهائي'
            ],
            units: ['م²', 'm2', 'لتر', 'liter', 'جالون', 'كيلو'],
            wastageRate: 0.15, // 15%
            color: '#87CEEB',
            priority: 'low'
        },

        doors: {
            name: 'Doors & Windows',
            nameAr: 'أبواب ونوافذ',
            description: 'الأبواب والنوافذ والشبابيك',
            keywords: [
                'باب', 'أبواب', 'door', 'شباك', 'نافذة',
                'نوافذ', 'برواز', 'شبابيك', 'باب خشبي',
                'باب حديد', 'باب ألمنيوم', 'درفة', 'درايش',
                'شباك المنيوم', 'نافذة خشبية', 'كوة'
            ],
            units: ['عدد', 'قطعة', 'pcs', 'piece', 'وحدة'],
            wastageRate: 0.02, // 2%
            color: '#8B4513',
            priority: 'medium'
        },

        plumbing: {
            name: 'Plumbing',
            nameAr: 'سباكة',
            description: 'أعمال السباكة والصرف الصحي',
            keywords: [
                'أنبوب', 'أنابيب', 'مواسير', 'pipe', 'سباكة',
                'خزان', 'حنفية', 'صرف', 'مياه', 'ماسورة',
                'مواسير pvc', 'مواسير حديد', 'خزان ماء',
                'صرف صحي', 'تغذية', 'كوع', 'تي', 'وصلة',
                'محبس', 'صمام', 'مضخة'
            ],
            units: ['م.ط', 'm', 'متر طولي', 'عدد', 'متر', 'قطعة'],
            wastageRate: 0.05, // 5%
            color: '#4169E1',
            priority: 'high'
        },

        electrical: {
            name: 'Electrical',
            nameAr: 'كهرباء',
            description: 'أعمال الكهرباء والإنارة',
            keywords: [
                'كابل', 'سلك', 'كهرباء', 'electric', 'wire',
                'مفتاح', 'لمبة', 'كشاف', 'لوحة كهرباء',
                'كابل كهرباء', 'سلك نحاس', 'قواطع', 'بريز',
                'مفاتيح', 'إنارة', 'كشافات', 'لمبات led',
                'توصيلات كهربائية', 'عداد كهرباء'
            ],
            units: ['م.ط', 'm', 'عدد', 'متر', 'قطعة', 'لفة'],
            wastageRate: 0.05, // 5%
            color: '#FFD700',
            priority: 'high'
        },

        masonry: {
            name: 'Masonry',
            nameAr: 'بناء ومحارة',
            description: 'أعمال البناء والمحارة',
            keywords: [
                'بناء', 'طوب', 'بلوك', 'محارة', 'مونة',
                'brick', 'block', 'plastering', 'لياسة', 'بياض',
                'طوب أحمر', 'بلوك أسمنتي', 'طابوق', 'جدار',
                'قواطع', 'حوائط', 'جدران', 'تبليط جدران'
            ],
            units: ['م²', 'm2', 'م³', 'm3', 'عدد', 'قطعة'],
            wastageRate: 0.08, // 8%
            color: '#D2691E',
            priority: 'high'
        },

        excavation: {
            name: 'Excavation & Earthwork',
            nameAr: 'حفر ونقل',
            description: 'أعمال الحفر والردم',
            keywords: [
                'حفر', 'نقل', 'ردم', 'excavation', 'دفان',
                'حفريات', 'تسوية', 'نقل تراب', 'حفر أساسات',
                'ردم رمل', 'ردم دفان', 'تسوية أرض', 'قشط',
                'حفر ميكانيكي', 'حفر يدوي'
            ],
            units: ['م³', 'm3', 'متر مكعب'],
            wastageRate: 0.10, // 10%
            color: '#A0522D',
            priority: 'high'
        },

        insulation: {
            name: 'Insulation',
            nameAr: 'عزل',
            description: 'أعمال العزل المائي والحراري',
            keywords: [
                'عزل', 'عازل', 'insulation', 'عزل مائي',
                'عزل حراري', 'فوم', 'بيتومين', 'عزل أسطح',
                'عزل خزانات', 'عزل حمامات', 'لفائف عزل',
                'فوم بولي يوريثان', 'بيتومين سائل', 'عزل رغوي'
            ],
            units: ['م²', 'm2', 'كجم', 'kg', 'لتر', 'لفة'],
            wastageRate: 0.10, // 10%
            color: '#20B2AA',
            priority: 'medium'
        },

        finishing: {
            name: 'Finishing Works',
            nameAr: 'تشطيبات',
            description: 'أعمال التشطيبات النهائية',
            keywords: [
                'تشطيب', 'ديكور', 'finishing', 'جبس',
                'اسقف', 'زخرفة', 'كورنيش', 'جبس بورد',
                'أسقف معلقة', 'ديكورات جبسية', 'كرانيش',
                'تشطيبات داخلية', 'تشطيبات خارجية'
            ],
            units: ['م²', 'm2', 'متر', 'm', 'قطعة', 'عدد'],
            wastageRate: 0.10, // 10%
            color: '#DDA0DD',
            priority: 'low'
        },

        hvac: {
            name: 'HVAC',
            nameAr: 'تكييف وتهوية',
            description: 'أنظمة التكييف والتهوية',
            keywords: [
                'تكييف', 'مكيف', 'تهوية', 'hvac', 'ac',
                'مكيفات', 'تكييف مركزي', 'سبليت', 'دكت',
                'مجاري هواء', 'شفاط', 'مراوح', 'وحدة تكييف'
            ],
            units: ['وحدة', 'عدد', 'طن تبريد', 'قطعة'],
            wastageRate: 0.03, // 3%
            color: '#40E0D0',
            priority: 'medium'
        },

        sanitaryware: {
            name: 'Sanitary Ware',
            nameAr: 'أدوات صحية',
            description: 'الأدوات الصحية والتجهيزات',
            keywords: [
                'مرحاض', 'مغسلة', 'شطاف', 'بانيو', 'حوض',
                'sanitary', 'toilet', 'sink', 'أدوات صحية',
                'كرسي إفرنجي', 'كرسي عربي', 'مغاسل',
                'خلاطات', 'حنفيات', 'دش', 'شاور'
            ],
            units: ['عدد', 'قطعة', 'وحدة', 'كامل'],
            wastageRate: 0.02, // 2%
            color: '#E6E6FA',
            priority: 'medium'
        }
    };

    /**
     * تصنيف بند واحد
     * Classify a single item
     */
    classify(item: FinancialItem): ClassificationResult {
        const description = item.item.toLowerCase();
        const unit = item.unit?.toLowerCase() || '';

        let bestMatch: {
            category: string;
            score: number;
            matchedKeywords: string[];
        } | null = null;

        // البحث في جميع الفئات
        for (const [categoryKey, categoryData] of Object.entries(this.categories)) {
            let score = 0;
            const matchedKeywords: string[] = [];

            // نقاط للكلمات المفتاحية
            for (const keyword of categoryData.keywords) {
                if (description.includes(keyword)) {
                    // كلمات أطول تحصل على نقاط أكثر
                    const keywordScore = keyword.length > 5 ? 15 : 10;
                    score += keywordScore;
                    matchedKeywords.push(keyword);
                }
            }

            // نقاط إضافية لتطابق الوحدة
            if (categoryData.units.some(u => unit.includes(u) || u.includes(unit))) {
                score += 5;
            }

            // نقاط إضافية إذا تطابقت عدة كلمات
            if (matchedKeywords.length > 1) {
                score += matchedKeywords.length * 3;
            }

            // تحديث أفضل تطابق
            if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = {
                    category: categoryKey,
                    score,
                    matchedKeywords
                };
            }
        }

        // إذا لم يتم العثور على تطابق
        if (!bestMatch || bestMatch.score < 10) {
            return {
                category: 'other',
                categoryAr: 'غير مصنف',
                confidence: 0,
                wastageRate: 0.05,
                color: '#CCCCCC',
                priority: 'low',
                matchedKeywords: [],
                suggestions: ['يُنصح بمراجعة الوصف وتحديثه', 'قد يحتاج البند إلى تصنيف يدوي']
            };
        }

        const categoryData = this.categories[bestMatch.category];
        const confidence = Math.min(bestMatch.score / 20, 1); // normalize to 0-1

        return {
            category: bestMatch.category,
            categoryAr: categoryData.nameAr,
            confidence,
            wastageRate: categoryData.wastageRate,
            color: categoryData.color,
            priority: categoryData.priority,
            matchedKeywords: bestMatch.matchedKeywords,
            suggestions: this.getSuggestions(item, categoryData, confidence)
        };
    }

    /**
     * تصنيف مجموعة بنود
     * Classify multiple items in batch
     */
    classifyBatch(items: FinancialItem[]): ClassifiedFinancialItem[] {
        return items.map(item => {
            const classification = this.classify(item);
            return {
                ...item,
                classification
            };
        });
    }

    /**
     * الحصول على اقتراحات للبند
     * Get suggestions for an item
     */
    private getSuggestions(
        item: FinancialItem,
        category: ItemCategory,
        confidence: number
    ): string[] {
        const suggestions: string[] = [];

        // اقتراح إضافة الهدر
        const wastageQuantity = item.quantity * category.wastageRate;
        const totalWithWastage = item.quantity + wastageQuantity;
        suggestions.push(
            `الكمية مع الهدر (${(category.wastageRate * 100).toFixed(0)}%): ${totalWithWastage.toFixed(2)} ${item.unit}`
        );

        // تحذير عند انخفاض الثقة
        if (confidence < 0.7) {
            suggestions.push('⚠️ ثقة التصنيف منخفضة - يُنصح بالمراجعة');
        }

        // اقتراح تحسين الوصف
        if (item.item.length < 10) {
            suggestions.push('💡 يُنصح بإضافة تفاصيل أكثر للوصف');
        }

        // تحذير إذا كان السعر غير معقول
        if (item.unitPrice === 0) {
            suggestions.push('⚠️ السعر غير محدد');
        } else if (item.unitPrice < 0) {
            suggestions.push('❌ السعر سالب - خطأ في البيانات');
        }

        // تحذير إذا كانت الكمية صفر
        if (item.quantity === 0) {
            suggestions.push('⚠️ الكمية صفر');
        } else if (item.quantity < 0) {
            suggestions.push('❌ الكمية سالبة - خطأ في البيانات');
        }

        return suggestions;
    }

    /**
     * الحصول على إحصائيات التصنيف
     * Get classification statistics
     */
    getStatistics(items: ClassifiedFinancialItem[]): CategoryStatistics {
        const stats: CategoryStatistics = {
            total: items.length,
            byCategory: {},
            totalCost: 0,
            totalCostWithWastage: 0,
            totalWastage: 0
        };

        for (const item of items) {
            const category = item.classification.categoryAr;

            if (!stats.byCategory[category]) {
                stats.byCategory[category] = {
                    count: 0,
                    totalCost: 0,
                    totalCostWithWastage: 0,
                    avgWastageRate: 0,
                    color: item.classification.color
                };
            }

            const wastage = item.total * item.classification.wastageRate;

            stats.byCategory[category].count++;
            stats.byCategory[category].totalCost += item.total;
            stats.byCategory[category].totalCostWithWastage += item.total + wastage;
            stats.byCategory[category].avgWastageRate += item.classification.wastageRate;

            stats.totalCost += item.total;
            stats.totalCostWithWastage += item.total + wastage;
            stats.totalWastage += wastage;
        }

        // حساب متوسط نسبة الهدر لكل فئة
        for (const category of Object.keys(stats.byCategory)) {
            stats.byCategory[category].avgWastageRate /= stats.byCategory[category].count;
        }

        return stats;
    }

    /**
     * الحصول على قائمة الفئات المتاحة
     * Get available categories
     */
    getCategories(): Record<string, ItemCategory> {
        return this.categories;
    }

    /**
     * إضافة فئة جديدة
     * Add a new category
     */
    addCategory(key: string, category: ItemCategory): void {
        this.categories[key] = category;
    }

    /**
     * تحديث فئة موجودة
     * Update an existing category
     */
    updateCategory(key: string, updates: Partial<ItemCategory>): void {
        if (this.categories[key]) {
            this.categories[key] = {
                ...this.categories[key],
                ...updates
            };
        }
    }

    /**
     * حذف فئة
     * Remove a category
     */
    removeCategory(key: string): void {
        delete this.categories[key];
    }
}

// ============================
// Helper Functions
// ============================

/**
 * إنشاء مثيل singleton من المصنف
 * Create a singleton instance of the classifier
 */
let classifierInstance: ItemClassifier | null = null;

export function getClassifier(): ItemClassifier {
    if (!classifierInstance) {
        classifierInstance = new ItemClassifier();
    }
    return classifierInstance;
}

/**
 * تصنيف سريع لبند واحد
 * Quick classify a single item
 */
export function classifyItem(item: FinancialItem): ClassificationResult {
    return getClassifier().classify(item);
}

/**
 * تصنيف سريع لمجموعة بنود
 * Quick classify multiple items
 */
export function classifyItems(items: FinancialItem[]): ClassifiedFinancialItem[] {
    return getClassifier().classifyBatch(items);
}
