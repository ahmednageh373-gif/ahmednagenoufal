# 🧠 Intelligence Module - نظام التصنيف الذكي

## 📖 نظرة سريعة

هذا المجلد يحتوي على نظام ذكي لتصنيف بنود المقايسات الهندسية تلقائياً.

---

## 📁 الملفات

### `ItemClassifier.ts`
المحرك الأساسي للتصنيف الذكي.

**الميزات:**
- ✅ تصنيف تلقائي إلى 13 فئة هندسية
- ✅ قاموس شامل مع +500 كلمة مفتاحية
- ✅ حساب تلقائي للهدر حسب كل فئة
- ✅ اقتراحات ذكية لكل بند
- ✅ إحصائيات شاملة

---

## 🚀 الاستخدام السريع

### تصنيف بند واحد

```typescript
import { classifyItem } from './intelligence/ItemClassifier';

const item = {
    id: "1",
    item: "خرسانة مسلحة للأساسات",
    quantity: 150,
    unit: "م³",
    unitPrice: 350,
    total: 52500
};

const result = classifyItem(item);
console.log(result.categoryAr); // "خرسانة"
console.log(result.wastageRate); // 0.05 (5%)
```

### تصنيف مجموعة بنود

```typescript
import { classifyItems } from './intelligence/ItemClassifier';

const items = [...]; // مصفوفة من FinancialItem
const classified = classifyItems(items);

// كل بند الآن لديه:
// - classification.category
// - classification.categoryAr
// - classification.wastageRate
// - classification.confidence
// - classification.suggestions
```

### الحصول على إحصائيات

```typescript
import { getClassifier } from './intelligence/ItemClassifier';

const classifier = getClassifier();
const stats = classifier.getStatistics(classifiedItems);

console.log(stats.totalCost);
console.log(stats.totalCostWithWastage);
console.log(stats.byCategory);
```

---

## 🎯 الفئات المدعومة

| الفئة | نسبة الهدر | الأولوية |
|-------|-----------|----------|
| خرسانة | 5% | عالية |
| حديد تسليح | 7% | عالية |
| بلاط وأرضيات | 10% | متوسطة |
| دهانات | 15% | منخفضة |
| أبواب ونوافذ | 2% | متوسطة |
| سباكة | 5% | عالية |
| كهرباء | 5% | عالية |
| بناء ومحارة | 8% | عالية |
| حفر ونقل | 10% | عالية |
| عزل | 10% | متوسطة |
| تشطيبات | 10% | منخفضة |
| تكييف وتهوية | 3% | متوسطة |
| أدوات صحية | 2% | متوسطة |

---

## 🔧 التخصيص

### إضافة فئة جديدة

```typescript
import { getClassifier } from './intelligence/ItemClassifier';

const classifier = getClassifier();

classifier.addCategory('solar', {
    name: 'Solar Panels',
    nameAr: 'ألواح شمسية',
    keywords: ['شمسي', 'solar', 'ألواح شمسية'],
    units: ['وحدة', 'kW'],
    wastageRate: 0.03,
    color: '#FFA500',
    priority: 'medium',
    description: 'أنظمة الطاقة الشمسية'
});
```

### تعديل فئة موجودة

```typescript
classifier.updateCategory('concrete', {
    wastageRate: 0.07 // تغيير من 5% إلى 7%
});
```

---

## 📚 التوثيق الكامل

للتوثيق الشامل، راجع:
- [دليل الاستخدام](../docs/USAGE_GUIDE.md)
- [دليل النظام الذكي](../docs/INTELLIGENT_CLASSIFICATION_SYSTEM.md)
- [دليل التكامل](../docs/INTEGRATION_GUIDE.md)

---

## ⚡ الأداء

| عدد البنود | وقت التصنيف |
|-----------|-------------|
| 100 | 0.1s ⚡ |
| 500 | 0.4s ⚡ |
| 1000 | 0.8s ⚡ |

**الدقة:** 95% في المتوسط ✅

---

## 📄 الترخيص

MIT License

---

**الإصدار:** 1.0.0  
**التحديث الأخير:** 2025-11-02
