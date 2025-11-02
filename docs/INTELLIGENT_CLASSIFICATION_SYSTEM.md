# 🧠 نظام التصنيف الذكي للبنود الهندسية

## 🎯 الفكرة الأساسية

تطبيقك الحالي يستورد البنود من Excel بنجاح ✅  
لكن يمكننا إضافة **ذكاء اصطناعي** لتحليل وتصنيف البنود تلقائياً! 🚀

---

## 🔄 التحسينات المقترحة

```
┌─────────────────────────────────────────────────────────────┐
│  النظام الحالي:                                             │
│  Excel → استيراد → عرض البنود                               │
│                                                               │
│  النظام المحسّن:                                             │
│  Excel → استيراد → تحليل ذكي → تصنيف → إحصائيات متقدمة     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ إضافة نظام التصنيف التلقائي

### المشكلة الحالية
```typescript
// البند المستورد:
{
    id: "1",
    item: "خرسانة مسلحة للأساسات",
    quantity: 150,
    unit: "م³",
    unitPrice: 350,
    total: 52500
}

// ❌ لا نعرف:
// - نوع البند (خرسانة؟ حديد؟ بلاط؟)
// - نسبة الهدر المناسبة
// - التصنيف الهندسي
// - الأولوية
```

### الحل: Item Classifier

```typescript
// intelligence/ItemClassifier.ts

export interface ItemCategory {
    name: string;
    nameAr: string;
    keywords: string[];
    units: string[];
    wastageRate: number;
    color: string;
    priority: 'high' | 'medium' | 'low';
}

export class ItemClassifier {
    private categories: Record<string, ItemCategory> = {
        concrete: {
            name: 'Concrete',
            nameAr: 'خرسانة',
            keywords: [
                'خرسانة', 'صبة', 'بيتون', 'concrete', 'صب',
                'خرسانه', 'كونكريت', 'اسمنت مسلح'
            ],
            units: ['م³', 'm3', 'متر مكعب', 'cubic meter'],
            wastageRate: 0.05, // 5%
            color: '#808080',
            priority: 'high'
        },
        
        steel: {
            name: 'Steel',
            nameAr: 'حديد تسليح',
            keywords: [
                'حديد', 'تسليح', 'steel', 'قضبان', 'حديد تسليح',
                'شبك', 'سيخ', 'اسياخ', 'حديد مسلح'
            ],
            units: ['طن', 'كجم', 'ton', 'kg', 'كيلو'],
            wastageRate: 0.07, // 7%
            color: '#8B0000',
            priority: 'high'
        },
        
        tiles: {
            name: 'Tiles',
            nameAr: 'بلاط وأرضيات',
            keywords: [
                'بلاط', 'سيراميك', 'رخام', 'جرانيت', 'tile',
                'ceramic', 'بورسلين', 'ارضيات', 'سراميك'
            ],
            units: ['م²', 'm2', 'متر مربع', 'square meter'],
            wastageRate: 0.10, // 10%
            color: '#F5DEB3',
            priority: 'medium'
        },
        
        paint: {
            name: 'Paint',
            nameAr: 'دهانات',
            keywords: [
                'دهان', 'طلاء', 'paint', 'صبغ', 'بوية',
                'دهانات', 'معجون', 'طلاء داخلي', 'طلاء خارجي'
            ],
            units: ['م²', 'm2', 'لتر', 'liter', 'جالون'],
            wastageRate: 0.15, // 15%
            color: '#87CEEB',
            priority: 'low'
        },
        
        doors: {
            name: 'Doors & Windows',
            nameAr: 'أبواب ونوافذ',
            keywords: [
                'باب', 'أبواب', 'door', 'شباك', 'نافذة',
                'نوافذ', 'برواز', 'شبابيك'
            ],
            units: ['عدد', 'قطعة', 'pcs', 'piece'],
            wastageRate: 0.02, // 2%
            color: '#8B4513',
            priority: 'medium'
        },
        
        plumbing: {
            name: 'Plumbing',
            nameAr: 'سباكة',
            keywords: [
                'أنبوب', 'أنابيب', 'مواسير', 'pipe', 'سباكة',
                'خزان', 'حنفية', 'صرف', 'مياه'
            ],
            units: ['م.ط', 'm', 'متر طولي', 'عدد'],
            wastageRate: 0.05, // 5%
            color: '#4169E1',
            priority: 'high'
        },
        
        electrical: {
            name: 'Electrical',
            nameAr: 'كهرباء',
            keywords: [
                'كابل', 'سلك', 'كهرباء', 'electric', 'wire',
                'مفتاح', 'لمبة', 'كشاف', 'لوحة كهرباء'
            ],
            units: ['م.ط', 'm', 'عدد', 'متر'],
            wastageRate: 0.05, // 5%
            color: '#FFD700',
            priority: 'high'
        },
        
        masonry: {
            name: 'Masonry',
            nameAr: 'بناء ومحارة',
            keywords: [
                'بناء', 'طوب', 'بلوك', 'محارة', 'مونة',
                'brick', 'block', 'plastering', 'لياسة'
            ],
            units: ['م²', 'm2', 'م³', 'm3'],
            wastageRate: 0.08, // 8%
            color: '#D2691E',
            priority: 'high'
        },
        
        excavation: {
            name: 'Excavation',
            nameAr: 'حفر ونقل',
            keywords: [
                'حفر', 'نقل', 'ردم', 'excavation', 'دفان',
                'حفريات', 'تسوية', 'نقل تراب'
            ],
            units: ['م³', 'm3'],
            wastageRate: 0.10, // 10%
            color: '#A0522D',
            priority: 'high'
        },
        
        insulation: {
            name: 'Insulation',
            nameAr: 'عزل',
            keywords: [
                'عزل', 'عازل', 'insulation', 'عزل مائي',
                'عزل حراري', 'فوم', 'بيتومين'
            ],
            units: ['م²', 'm2', 'كجم', 'kg'],
            wastageRate: 0.10, // 10%
            color: '#20B2AA',
            priority: 'medium'
        },
        
        finishing: {
            name: 'Finishing',
            nameAr: 'تشطيبات',
            keywords: [
                'تشطيب', 'ديكور', 'finishing', 'جبس',
                'اسقف', 'زخرفة', 'كورنيش'
            ],
            units: ['م²', 'm2', 'متر', 'm'],
            wastageRate: 0.10, // 10%
            color: '#DDA0DD',
            priority: 'low'
        }
    };

    /**
     * تصنيف بند واحد
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
                    score += 10;
                    matchedKeywords.push(keyword);
                }
            }

            // نقاط إضافية لتطابق الوحدة
            if (categoryData.units.some(u => unit.includes(u))) {
                score += 5;
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
        if (!bestMatch) {
            return {
                category: 'other',
                categoryAr: 'غير مصنف',
                confidence: 0,
                wastageRate: 0.05,
                color: '#CCCCCC',
                matchedKeywords: [],
                suggestions: []
            };
        }

        const categoryData = this.categories[bestMatch.category];
        
        return {
            category: bestMatch.category,
            categoryAr: categoryData.nameAr,
            confidence: Math.min(bestMatch.score / 15, 1), // normalize to 0-1
            wastageRate: categoryData.wastageRate,
            color: categoryData.color,
            priority: categoryData.priority,
            matchedKeywords: bestMatch.matchedKeywords,
            suggestions: this.getSuggestions(item, categoryData)
        };
    }

    /**
     * تصنيف مجموعة بنود
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
     */
    private getSuggestions(
        item: FinancialItem, 
        category: ItemCategory
    ): string[] {
        const suggestions: string[] = [];
        
        // اقتراح إضافة الهدر
        const withWastage = item.quantity * (1 + category.wastageRate);
        suggestions.push(
            `الكمية مع الهدر (${(category.wastageRate * 100).toFixed(0)}%): ${withWastage.toFixed(2)} ${item.unit}`
        );

        // اقتراح تحسين الوصف
        if (item.item.length < 10) {
            suggestions.push('يُنصح بإضافة تفاصيل أكثر للوصف');
        }

        // تحذير إذا كان السعر غير معقول
        if (item.unitPrice === 0) {
            suggestions.push('⚠️ السعر غير محدد');
        }

        return suggestions;
    }

    /**
     * الحصول على إحصائيات التصنيف
     */
    getStatistics(items: ClassifiedFinancialItem[]): CategoryStatistics {
        const stats: CategoryStatistics = {
            total: items.length,
            byCategory: {},
            totalCost: 0,
            totalCostWithWastage: 0
        };

        for (const item of items) {
            const category = item.classification.categoryAr;
            
            if (!stats.byCategory[category]) {
                stats.byCategory[category] = {
                    count: 0,
                    totalCost: 0,
                    totalCostWithWastage: 0,
                    color: item.classification.color
                };
            }

            const wastage = item.total * item.classification.wastageRate;
            
            stats.byCategory[category].count++;
            stats.byCategory[category].totalCost += item.total;
            stats.byCategory[category].totalCostWithWastage += item.total + wastage;
            
            stats.totalCost += item.total;
            stats.totalCostWithWastage += item.total + wastage;
        }

        return stats;
    }
}

// Types
export interface ClassificationResult {
    category: string;
    categoryAr: string;
    confidence: number;
    wastageRate: number;
    color: string;
    priority?: 'high' | 'medium' | 'low';
    matchedKeywords: string[];
    suggestions: string[];
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
        color: string;
    }>;
    totalCost: number;
    totalCostWithWastage: number;
}
```

---

## 2️⃣ دمج النظام مع الكود الموجود

### تحديث `parseExcel` في `BOQManualManager.tsx`

```typescript
import { ItemClassifier, ClassifiedFinancialItem } from './intelligence/ItemClassifier';

const parseExcel = (file: File): Promise<ClassifiedFinancialItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // ... الكود الموجود لاستخراج البنود ...
                
                const items: FinancialItem[] = []; // البنود المستخرجة
                
                // 🆕 تطبيق التصنيف الذكي
                const classifier = new ItemClassifier();
                const classifiedItems = classifier.classifyBatch(items);
                
                resolve(classifiedItems);
            } catch (error) { 
                reject(error); 
            }
        };
        reader.readAsArrayBuffer(file);
    });
};
```

---

## 3️⃣ إضافة واجهة عرض التصنيفات

### مكون جديد: `BOQClassificationView`

```typescript
interface BOQClassificationViewProps {
    items: ClassifiedFinancialItem[];
}

export const BOQClassificationView: React.FC<BOQClassificationViewProps> = ({ items }) => {
    const classifier = new ItemClassifier();
    const stats = classifier.getStatistics(items);

    return (
        <div className="space-y-6">
            {/* ملخص الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="إجمالي البنود"
                    value={stats.total}
                    icon="📊"
                />
                <StatCard
                    title="التكلفة الأساسية"
                    value={`${stats.totalCost.toLocaleString()} ريال`}
                    icon="💰"
                />
                <StatCard
                    title="التكلفة مع الهدر"
                    value={`${stats.totalCostWithWastage.toLocaleString()} ريال`}
                    icon="📈"
                    highlight
                />
            </div>

            {/* التصنيف حسب الفئة */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">التصنيف حسب الفئة</h3>
                <div className="space-y-3">
                    {Object.entries(stats.byCategory).map(([category, data]) => (
                        <CategoryBar
                            key={category}
                            category={category}
                            count={data.count}
                            cost={data.totalCost}
                            costWithWastage={data.totalCostWithWastage}
                            color={data.color}
                            percentage={(data.totalCost / stats.totalCost) * 100}
                        />
                    ))}
                </div>
            </div>

            {/* جدول البنود المصنفة */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">البنود المصنفة</h3>
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-right p-3">الوصف</th>
                            <th className="text-right p-3">التصنيف</th>
                            <th className="text-right p-3">الكمية</th>
                            <th className="text-right p-3">الهدر</th>
                            <th className="text-right p-3">الإجمالي</th>
                            <th className="text-right p-3">الثقة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => {
                            const wastage = item.quantity * item.classification.wastageRate;
                            const totalWithWastage = item.quantity + wastage;
                            
                            return (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3">{item.item}</td>
                                    <td className="p-3">
                                        <span 
                                            className="px-3 py-1 rounded-full text-sm font-medium"
                                            style={{ backgroundColor: item.classification.color + '40' }}
                                        >
                                            {item.classification.categoryAr}
                                        </span>
                                    </td>
                                    <td className="p-3">{item.quantity} {item.unit}</td>
                                    <td className="p-3 text-orange-600">
                                        +{wastage.toFixed(2)} ({(item.classification.wastageRate * 100).toFixed(0)}%)
                                    </td>
                                    <td className="p-3 font-bold">
                                        {totalWithWastage.toFixed(2)} {item.unit}
                                    </td>
                                    <td className="p-3">
                                        <ConfidenceMeter confidence={item.classification.confidence} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
```

---

## 4️⃣ أمثلة عملية

### مثال 1: تصنيف تلقائي

```typescript
const classifier = new ItemClassifier();

const item = {
    id: "1",
    item: "خرسانة مسلحة للأساسات درجة 350",
    quantity: 150,
    unit: "م³",
    unitPrice: 350,
    total: 52500
};

const result = classifier.classify(item);

console.log(result);
// {
//     category: 'concrete',
//     categoryAr: 'خرسانة',
//     confidence: 1.0,
//     wastageRate: 0.05,
//     color: '#808080',
//     priority: 'high',
//     matchedKeywords: ['خرسانة', 'مسلح'],
//     suggestions: [
//         'الكمية مع الهدر (5%): 157.50 م³',
//     ]
// }
```

### مثال 2: معالجة دفعة كاملة

```typescript
const items = [
    { id: "1", item: "خرسانة مسلحة", quantity: 150, unit: "م³", ... },
    { id: "2", item: "حديد تسليح 16مم", quantity: 12, unit: "طن", ... },
    { id: "3", item: "بلاط سيراميك", quantity: 450, unit: "م²", ... },
];

const classifiedItems = classifier.classifyBatch(items);

// كل بند الآن يحتوي على:
// - التصنيف التلقائي
// - نسبة الهدر
// - الاقتراحات
// - مستوى الثقة
```

### مثال 3: إحصائيات شاملة

```typescript
const stats = classifier.getStatistics(classifiedItems);

console.log(stats);
// {
//     total: 3,
//     byCategory: {
//         'خرسانة': {
//             count: 1,
//             totalCost: 52500,
//             totalCostWithWastage: 55125,
//             color: '#808080'
//         },
//         'حديد تسليح': {
//             count: 1,
//             totalCost: 54000,
//             totalCostWithWastage: 57780,
//             color: '#8B0000'
//         },
//         // ...
//     },
//     totalCost: 126500,
//     totalCostWithWastage: 135405
// }
```

---

## 5️⃣ التكامل مع Gemini AI (اختياري)

```typescript
import { GoogleGenerativeAI } from '@google/genai';

export class AIEnhancedClassifier extends ItemClassifier {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super();
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async classifyWithAI(item: FinancialItem): Promise<ClassificationResult> {
        // أولاً: التصنيف التقليدي
        const basicClassification = this.classify(item);

        // إذا كانت الثقة منخفضة، استخدم AI
        if (basicClassification.confidence < 0.5) {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            
            const prompt = `
                صنّف هذا البند الهندسي:
                الوصف: ${item.item}
                الوحدة: ${item.unit}
                الكمية: ${item.quantity}
                
                الفئات المتاحة: خرسانة، حديد تسليح، بلاط، دهانات، أبواب، سباكة، كهرباء
                
                أجب بـ JSON فقط:
                {
                    "category": "اسم الفئة",
                    "confidence": 0.95,
                    "reasoning": "السبب"
                }
            `;

            const result = await model.generateContent(prompt);
            const aiResponse = JSON.parse(result.response.text());

            return {
                ...basicClassification,
                category: aiResponse.category,
                confidence: aiResponse.confidence,
                aiReasoning: aiResponse.reasoning
            };
        }

        return basicClassification;
    }
}
```

---

## 🎯 الفوائد

### ✅ للمستخدمين
1. **توفير الوقت**: تصنيف تلقائي للبنود
2. **دقة أعلى**: حساب الهدر المناسب لكل فئة
3. **رؤى أفضل**: إحصائيات وتقارير مفصلة
4. **تحذيرات ذكية**: اكتشاف الأخطاء والمشاكل

### ✅ للمشروع
1. **تحكم أفضل**: معرفة توزيع التكاليف
2. **تخطيط دقيق**: حساب الكميات مع الهدر
3. **تقارير احترافية**: عرض البيانات بشكل مرئي

---

## 📝 الخطوات التالية

1. ✅ **تنفيذ `ItemClassifier`**
2. ✅ **دمجه مع `parseExcel`**
3. ✅ **إضافة واجهة العرض**
4. ✅ **اختبار مع ملفات حقيقية**
5. ✅ **(اختياري) التكامل مع Gemini AI**

---

**الخلاصة:** النظام الحالي ممتاز لاستيراد البيانات ✅  
مع إضافة التصنيف الذكي، سيصبح أداة قوية جداً! 🚀
