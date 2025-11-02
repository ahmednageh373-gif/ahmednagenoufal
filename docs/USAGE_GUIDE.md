# 📘 دليل الاستخدام الشامل: النظام الذكي لتحليل المقايسات

## 🎯 نظرة عامة

هذا الدليل يشرح كيفية استخدام النظام الذكي الجديد لتحليل وتصنيف بنود المقايسة تلقائياً.

---

## 🚀 البدء السريع

### الخطوة 1: استيراد ملف Excel

```typescript
// في مكون BOQManualManager.tsx أو أي مكون آخر

import { classifyItems } from '../intelligence/ItemClassifier';

// بعد استيراد البنود من Excel
const handleImport = async (file: File) => {
    // 1. استيراد البنود (الكود الموجود)
    const items = await parseExcel(file);
    
    // 2. تطبيق التصنيف الذكي 🆕
    const classifiedItems = classifyItems(items);
    
    // 3. حفظ البنود المصنفة
    setFinancialItems(classifiedItems);
    
    console.log('تم تصنيف', classifiedItems.length, 'بند');
};
```

### الخطوة 2: عرض التصنيفات

```typescript
import { BOQClassificationView } from '../components/BOQClassificationView';

function MyComponent() {
    const [items, setItems] = useState<ClassifiedFinancialItem[]>([]);
    
    return (
        <BOQClassificationView 
            items={items}
            onItemClick={(item) => {
                console.log('تم النقر على:', item.item);
                // يمكنك فتح modal للتفاصيل
            }}
        />
    );
}
```

---

## 📦 مثال كامل: استيراد وتصنيف

```typescript
import React, { useState } from 'react';
import { classifyItems } from '../intelligence/ItemClassifier';
import { BOQClassificationView } from '../components/BOQClassificationView';
import type { ClassifiedFinancialItem } from '../intelligence/ItemClassifier';

export const SmartBOQManager: React.FC = () => {
    const [items, setItems] = useState<ClassifiedFinancialItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            // 1. قراءة الملف
            const rawItems = await parseExcel(file);
            
            // 2. تطبيق التصنيف الذكي
            const classified = classifyItems(rawItems);
            
            // 3. حفظ النتائج
            setItems(classified);
            
            alert(`تم استيراد وتصنيف ${classified.length} بند بنجاح! ✅`);
        } catch (error) {
            console.error('خطأ:', error);
            alert('فشل في معالجة الملف ❌');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* رفع الملف */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">استيراد ملف المقايسة</h2>
                <input 
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                    className="w-full p-2 border rounded-lg"
                />
                {isLoading && <p className="mt-2 text-gray-600">جاري المعالجة...</p>}
            </div>

            {/* عرض النتائج */}
            {items.length > 0 && (
                <BOQClassificationView items={items} />
            )}
        </div>
    );
};
```

---

## 🔧 الاستخدامات المتقدمة

### 1. تصنيف بند واحد

```typescript
import { ItemClassifier, classifyItem } from '../intelligence/ItemClassifier';

const item = {
    id: "1",
    item: "خرسانة مسلحة للأساسات درجة 350",
    quantity: 150,
    unit: "م³",
    unitPrice: 350,
    total: 52500
};

// طريقة 1: استخدام الدالة المساعدة (موصى به)
const result = classifyItem(item);

console.log(result);
// {
//     category: 'concrete',
//     categoryAr: 'خرسانة',
//     confidence: 1.0,
//     wastageRate: 0.05,
//     color: '#808080',
//     priority: 'high',
//     matchedKeywords: ['خرسانة'],
//     suggestions: ['الكمية مع الهدر (5%): 157.50 م³']
// }

// طريقة 2: استخدام المصنف مباشرة
const classifier = new ItemClassifier();
const result2 = classifier.classify(item);
```

### 2. الحصول على إحصائيات

```typescript
import { getClassifier } from '../intelligence/ItemClassifier';

const classifier = getClassifier();
const stats = classifier.getStatistics(classifiedItems);

console.log('إجمالي البنود:', stats.total);
console.log('التكلفة الأساسية:', stats.totalCost);
console.log('التكلفة مع الهدر:', stats.totalCostWithWastage);
console.log('إجمالي الهدر:', stats.totalWastage);

// التوزيع حسب الفئة
Object.entries(stats.byCategory).forEach(([category, data]) => {
    console.log(`${category}: ${data.count} بند بتكلفة ${data.totalCost}`);
});
```

### 3. تخصيص الفئات

```typescript
import { ItemClassifier } from '../intelligence/ItemClassifier';

const classifier = new ItemClassifier();

// إضافة فئة جديدة
classifier.addCategory('landscaping', {
    name: 'Landscaping',
    nameAr: 'تنسيق حدائق',
    keywords: ['نباتات', 'أشجار', 'حديقة', 'تنسيق', 'زراعة'],
    units: ['م²', 'عدد'],
    wastageRate: 0.10,
    color: '#228B22',
    priority: 'low',
    description: 'أعمال تنسيق الحدائق'
});

// تحديث فئة موجودة
classifier.updateCategory('concrete', {
    wastageRate: 0.07  // زيادة نسبة الهدر من 5% إلى 7%
});

// حذف فئة
classifier.removeCategory('finishing');
```

### 4. فلترة البنود حسب التصنيف

```typescript
// البنود ذات الثقة المنخفضة
const lowConfidence = classifiedItems.filter(
    item => item.classification.confidence < 0.5
);

// البنود ذات الأولوية العالية
const highPriority = classifiedItems.filter(
    item => item.classification.priority === 'high'
);

// بنود الخرسانة فقط
const concreteItems = classifiedItems.filter(
    item => item.classification.category === 'concrete'
);

// حساب إجمالي الخرسانة مع الهدر
const concreteTotal = concreteItems.reduce((sum, item) => {
    const withWastage = item.total * (1 + item.classification.wastageRate);
    return sum + withWastage;
}, 0);

console.log('إجمالي تكلفة الخرسانة:', concreteTotal);
```

### 5. تصدير التصنيفات إلى Excel

```typescript
declare var XLSX: any;

function exportClassifiedBOQ(items: ClassifiedFinancialItem[]) {
    const exportData = items.map(item => {
        const wastage = item.quantity * item.classification.wastageRate;
        const totalQty = item.quantity + wastage;
        const totalCost = item.total * (1 + item.classification.wastageRate);
        
        return {
            'رقم البند': item.id,
            'الوصف': item.item,
            'التصنيف': item.classification.categoryAr,
            'الوحدة': item.unit,
            'الكمية الأساسية': item.quantity,
            'نسبة الهدر %': (item.classification.wastageRate * 100).toFixed(1),
            'كمية الهدر': wastage.toFixed(2),
            'الكمية الإجمالية': totalQty.toFixed(2),
            'سعر الوحدة': item.unitPrice,
            'التكلفة الأساسية': item.total,
            'التكلفة الإجمالية': totalCost.toFixed(2),
            'الثقة': (item.classification.confidence * 100).toFixed(0) + '%',
            'الأولوية': item.classification.priority,
            'الاقتراحات': item.classification.suggestions.join(' | ')
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المقايسة المصنفة');
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `BOQ_Classified_${date}.xlsx`);
}
```

---

## 📊 الفئات المتاحة

| الفئة | الكلمات المفتاحية | نسبة الهدر | الأولوية |
|-------|-------------------|------------|----------|
| **خرسانة** | خرسانة، صبة، بيتون، concrete | 5% | عالية |
| **حديد تسليح** | حديد، تسليح، steel، قضبان | 7% | عالية |
| **بلاط وأرضيات** | بلاط، سيراميك، رخام، جرانيت | 10% | متوسطة |
| **دهانات** | دهان، طلاء، paint، صبغ | 15% | منخفضة |
| **أبواب ونوافذ** | باب، شباك، نافذة، door | 2% | متوسطة |
| **سباكة** | أنبوب، مواسير، pipe، سباكة | 5% | عالية |
| **كهرباء** | كابل، سلك، كهرباء، electric | 5% | عالية |
| **بناء ومحارة** | بناء، طوب، بلوك، محارة | 8% | عالية |
| **حفر ونقل** | حفر، نقل، ردم، excavation | 10% | عالية |
| **عزل** | عزل، عازل، insulation | 10% | متوسطة |
| **تشطيبات** | تشطيب، ديكور، finishing، جبس | 10% | منخفضة |
| **تكييف وتهوية** | تكييف، مكيف، hvac | 3% | متوسطة |
| **أدوات صحية** | مرحاض، مغسلة، حوض، sanitary | 2% | متوسطة |

---

## 🎨 تخصيص الواجهة

### تغيير الألوان

```typescript
// في ItemClassifier.ts
const categories = {
    concrete: {
        // ... باقي الخصائص
        color: '#YOUR_COLOR_HERE',  // استبدل باللون المطلوب
    }
};
```

### إضافة أيقونات مخصصة

```typescript
// في BOQClassificationView.tsx
import { YourCustomIcon } from 'lucide-react';

// استخدم الأيقونة في StatCard
<StatCard
    title="عنوان مخصص"
    value={value}
    icon={<YourCustomIcon className="w-6 h-6" />}
/>
```

---

## 🔍 أمثلة عملية من الواقع

### مثال 1: مشروع بناء سكني

```typescript
// ملف Excel يحتوي على:
const items = [
    { item: "خرسانة مسلحة للقواعد درجة 350", quantity: 85, unit: "م³", unitPrice: 380 },
    { item: "حديد تسليح عالي المقاومة 16 مم", quantity: 15, unit: "طن", unitPrice: 4800 },
    { item: "بلاط سيراميك فاخر للأرضيات", quantity: 320, unit: "م²", unitPrice: 65 },
    { item: "دهان بلاستيك للجدران الداخلية", quantity: 680, unit: "م²", unitPrice: 18 },
    { item: "أبواب خشبية مصفحة", quantity: 12, unit: "عدد", unitPrice: 1800 },
];

// بعد التصنيف:
const classified = classifyItems(items);

// النتائج:
classified.forEach(item => {
    console.log(`${item.item} → ${item.classification.categoryAr}`);
    console.log(`  الكمية مع الهدر: ${item.quantity * (1 + item.classification.wastageRate)}`);
    console.log(`  الثقة: ${(item.classification.confidence * 100).toFixed(0)}%`);
});

// الإحصائيات:
const stats = getClassifier().getStatistics(classified);
console.log('\nالتوزيع:');
Object.entries(stats.byCategory).forEach(([cat, data]) => {
    console.log(`${cat}: ${data.count} بند (${((data.totalCost / stats.totalCost) * 100).toFixed(1)}%)`);
});
```

### مثال 2: إنشاء تقرير مفصل

```typescript
function generateDetailedReport(items: ClassifiedFinancialItem[]) {
    const classifier = getClassifier();
    const stats = classifier.getStatistics(items);
    
    const report = {
        summary: {
            totalItems: stats.total,
            totalCost: stats.totalCost,
            totalWastage: stats.totalWastage,
            totalWithWastage: stats.totalCostWithWastage,
            savingsPercentage: ((stats.totalWastage / stats.totalCost) * 100).toFixed(2)
        },
        byCategory: Object.entries(stats.byCategory).map(([name, data]) => ({
            category: name,
            items: data.count,
            cost: data.totalCost,
            wastage: data.totalCostWithWastage - data.totalCost,
            percentage: ((data.totalCost / stats.totalCost) * 100).toFixed(2)
        })),
        warnings: {
            lowConfidence: items.filter(i => i.classification.confidence < 0.5).length,
            highPriority: items.filter(i => i.classification.priority === 'high').length,
            missingPrices: items.filter(i => i.unitPrice === 0).length
        }
    };
    
    return report;
}

// استخدام:
const report = generateDetailedReport(classifiedItems);
console.log(JSON.stringify(report, null, 2));
```

---

## ⚡ نصائح للأداء

### 1. استخدام Singleton Pattern

```typescript
// ✅ جيد - استخدم getClassifier()
const classifier = getClassifier();
const results = items.map(item => classifier.classify(item));

// ❌ سيء - إنشاء instance جديد في كل مرة
items.map(item => new ItemClassifier().classify(item));
```

### 2. استخدام useMemo للتحسين

```typescript
import { useMemo } from 'react';

function MyComponent({ items }) {
    // تصنيف مرة واحدة فقط عند تغيير items
    const classified = useMemo(() => classifyItems(items), [items]);
    
    // حساب الإحصائيات مرة واحدة
    const stats = useMemo(() => 
        getClassifier().getStatistics(classified), 
        [classified]
    );
    
    return <BOQClassificationView items={classified} />;
}
```

### 3. معالجة الدفعات الكبيرة

```typescript
// للملفات الكبيرة (1000+ بند)
async function classifyLargeFile(items: FinancialItem[]) {
    const batchSize = 100;
    const results: ClassifiedFinancialItem[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const classified = classifyItems(batch);
        results.push(...classified);
        
        // تحديث progress bar
        const progress = ((i + batch.length) / items.length) * 100;
        console.log(`معالجة: ${progress.toFixed(0)}%`);
        
        // إعطاء المتصفح فرصة للتنفس
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: تصنيف غير دقيق

```typescript
// الحل 1: تحسين الوصف
const item = {
    item: "مواد بناء",  // ❌ غامض
    // ...
};

// أفضل:
const item = {
    item: "طوب أحمر للبناء",  // ✅ واضح
    // ...
};

// الحل 2: إضافة كلمات مفتاحية
classifier.updateCategory('masonry', {
    keywords: [...existingKeywords, 'مواد بناء']
});
```

### المشكلة: ثقة منخفضة

```typescript
// افحص نتيجة التصنيف
const result = classifyItem(item);

if (result.confidence < 0.5) {
    console.log('الكلمات المتطابقة:', result.matchedKeywords);
    console.log('الاقتراحات:', result.suggestions);
    
    // قد تحتاج:
    // 1. تحسين الوصف
    // 2. إضافة كلمات مفتاحية جديدة
    // 3. مراجعة الوحدة المستخدمة
}
```

---

## 📝 الخلاصة

الآن لديك:
- ✅ نظام ذكي لتصنيف البنود تلقائياً
- ✅ حساب دقيق للهدر لكل فئة
- ✅ إحصائيات وتقارير شاملة
- ✅ واجهة احترافية لعرض البيانات
- ✅ قابلية للتخصيص والتوسع

**للبدء:** ارفع ملف Excel وشاهد السحر يحدث! ✨

---

## 🔗 روابط مفيدة

- [دليل معالجة Excel](./EXCEL_HANDLING_GUIDE.md)
- [دليل النظام الذكي](./INTELLIGENT_CLASSIFICATION_SYSTEM.md)
- [أمثلة الأكواد](../examples/)
- [التوثيق الرسمي](./README.md)

---

**آخر تحديث:** 2025-11-02  
**الإصدار:** 1.0.0
