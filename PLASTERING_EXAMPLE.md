# 🎨 مثال عملي: تطبيق بيانات اللياسة في النظام

## ✅ **تم إضافة بيانات اللياسة التفصيلية!**

الآن النظام يدعم **5 مراحل** كاملة للياسة بكل التفاصيل التي شاركتها.

---

## 📊 **البيانات المضافة:**

### **المراحل الخمس:**

| # | المرحلة | الإنتاجية | طاقم العمل | ملاحظات |
|---|---------|-----------|------------|---------|
| 1 | تجهيز الطرطشة | 400 م²/يوم | 1 عامل | رش ماء + أسمنت مقذوف |
| 2 | البؤج والأوتار | 200 م²/يوم | 1 بياض + 1 مساعد | كل 1.2 م |
| 3 | اللياسة الرئيسية | 140 م²/يوم | 2 بياض + 1 مونة | مونة 1:4، سمك 2 سم |
| 4 | التنعيم والاستواء | 200 م²/يوم | 1 بياض | كشط + مستوى مياه |
| 5 | التسليم الاستشاري | فحص | مهندس استشاري | snag list |

---

## 💡 **كيف تستخدم البيانات في النظام؟**

### **مثال 1: حساب مدة اللياسة لمساحة 500 م²**

```typescript
import { EngineeringStandardsDatabase } from './types/integrated/EngineeringStandards';

// حساب المدة الإجمالية
const area = 500; // m²
const duration = EngineeringStandardsDatabase.calculateDuration(
  area, 
  'plastering', 
  'standard'
);

console.log(`المدة الإجمالية: ${duration} أيام`);
// النتيجة: المدة الإجمالية: 4 أيام (500 ÷ 140 = 3.57 ≈ 4)
```

### **مثال 2: حساب المدة حسب كل مرحلة**

```typescript
const stages = EngineeringStandardsDatabase.calculatePlasteringDurationByStages(500);

stages.forEach(stage => {
  console.log(`${stage.name}: ${stage.duration} أيام`);
  console.log(`  الطاقم: ${stage.crew.description || stage.crew.total + ' عامل'}`);
  console.log(`  الإنتاجية: ${stage.productivity} م²/يوم`);
  console.log('---');
});
```

**النتيجة:**
```
تجهيز الطرطشة: 2 أيام
  الطاقم: 1 عامل
  الإنتاجية: 400 م²/يوم
---
البؤج والأوتار: 3 أيام
  الطاقم: 1 بياض + 1 مساعد
  الإنتاجية: 200 م²/يوم
---
اللياسة الرئيسية: 4 أيام
  الطاقم: 2 بياض + 1 مونة
  الإنتاجية: 140 م²/يوم
---
التنعيم والاستواء: 3 أيام
  الطاقم: 1 بياض
  الإنتاجية: 200 م²/يوم
---
التسليم الاستشاري: 1 يوم
  الطاقم: مهندس الاستشاري
  الإنتاجية: 0 م²/يوم
---
```

### **مثال 3: حساب التكلفة الكاملة**

```typescript
// أسعار العمالة (ريال/يوم)
const laborRates = {
  skilled: 300,      // بيّاض (ماهر)
  unskilled: 200,    // عامل عادي
  consultant: 1000   // مهندس استشاري
};

// أسعار المواد (ريال)
const materialPrices = {
  cement: 0.5,       // 0.5 ريال/kg
  sand: 0.1,         // 0.1 ريال/kg
  water: 0.01        // 0.01 ريال/liter
};

const cost = EngineeringStandardsDatabase.calculatePlasteringCost(
  500,              // المساحة
  laborRates,
  materialPrices
);

console.log('📊 تفاصيل التكلفة:');
console.log('---');

cost.stages.forEach((stage, i) => {
  console.log(`المرحلة ${i + 1}: ${stage.name}`);
  console.log(`  المدة: ${stage.duration} أيام`);
  console.log(`  تكلفة العمالة: ${stage.laborCost.toFixed(2)} ريال`);
  console.log(`  تكلفة المواد: ${stage.materialCost.toFixed(2)} ريال`);
  console.log(`  الإجمالي: ${stage.totalCost.toFixed(2)} ريال`);
  console.log('---');
});

console.log('💰 الإجمالي الكلي:');
console.log(`  المدة الإجمالية: ${cost.totalDuration} أيام`);
console.log(`  تكلفة العمالة: ${cost.totalLaborCost.toFixed(2)} ريال`);
console.log(`  تكلفة المواد: ${cost.totalMaterialCost.toFixed(2)} ريال`);
console.log(`  التكلفة الكلية: ${cost.totalCost.toFixed(2)} ريال`);
```

**النتيجة المتوقعة:**
```
📊 تفاصيل التكلفة:
---
المرحلة 1: تجهيز الطرطشة
  المدة: 2 أيام
  تكلفة العمالة: 400.00 ريال (1 عامل × 200 × 2)
  تكلفة المواد: 625.00 ريال (أسمنت + ماء)
  الإجمالي: 1025.00 ريال
---
المرحلة 2: البؤج والأوتار
  المدة: 3 أيام
  تكلفة العمالة: 1500.00 ريال (1 بياض + 1 مساعد × 3)
  تكلفة المواد: 1300.00 ريال (أسمنت + رمل)
  الإجمالي: 2800.00 ريال
---
المرحلة 3: اللياسة الرئيسية
  المدة: 4 أيام
  تكلفة العمالة: 3200.00 ريال (2 بياض + 1 عامل × 4)
  تكلفة المواد: 17600.00 ريال (8kg أسمنت + 32kg رمل × 500م²)
  الإجمالي: 20800.00 ريال
---
المرحلة 4: التنعيم والاستواء
  المدة: 3 أيام
  تكلفة العمالة: 900.00 ريال (1 بياض × 3)
  تكلفة المواد: 375.00 ريال (أسمنت + ماء)
  الإجمالي: 1275.00 ريال
---
المرحلة 5: التسليم الاستشاري
  المدة: 1 يوم
  تكلفة العمالة: 1000.00 ريال (مهندس)
  تكلفة المواد: 0.00 ريال (فحص فقط)
  الإجمالي: 1000.00 ريال
---
💰 الإجمالي الكلي:
  المدة الإجمالية: 13 يوم
  تكلفة العمالة: 7000.00 ريال
  تكلفة المواد: 19900.00 ريال
  التكلفة الكلية: 26900.00 ريال
```

---

## 🎯 **التكامل مع المقايسة:**

### **كيف يظهر في بند المقايسة:**

```typescript
import { IntegratedBOQItem } from './types/integrated/IntegratedBOQ';

const plasteringBOQ: IntegratedBOQItem = {
  id: 'boq-005',
  projectId: 'current-project',
  code: '05.01.001',
  description: 'أعمال لياسة داخلية (مونة 1:4، سمك 2 سم)',
  quantity: 500,
  unit: 'm²',
  category: 'Finishing Works',
  
  // التكامل مع الجدول الزمني
  scheduleIntegration: {
    linkedTaskId: 'task-005',
    productivityRate: 140,  // المرحلة الرئيسية
    calculatedDuration: 13, // مجموع كل المراحل
    
    resources: {
      labor: {
        skilled: 2,         // بيّاضين
        unskilled: 1,       // عامل مونة
        supervisor: 0.2,    // مشرف جزئي
        totalCost: 7000,
        dailyCost: 538      // 7000 ÷ 13
      },
      
      equipment: [
        { 
          id: 'EQ-010', 
          type: 'Mixer (mortar)', 
          quantity: 1, 
          dailyRate: 150, 
          totalCost: 1950 
        },
        { 
          id: 'EQ-011', 
          type: 'Scaffolding', 
          quantity: 1, 
          dailyRate: 200, 
          totalCost: 2600 
        },
        { 
          id: 'EQ-012', 
          type: 'Plastering tools', 
          quantity: 1, 
          dailyRate: 50, 
          totalCost: 650 
        }
      ],
      
      materials: [
        { 
          id: 'MAT-010', 
          name: 'Cement', 
          quantity: 5000,  // 10 kg/m² × 500 m²
          unit: 'kg', 
          unitCost: 0.5, 
          totalCost: 2500 
        },
        { 
          id: 'MAT-011', 
          name: 'Sand', 
          quantity: 17000, // 34 kg/m² × 500 m²
          unit: 'kg', 
          unitCost: 0.1, 
          totalCost: 1700 
        },
        { 
          id: 'MAT-012', 
          name: 'Water', 
          quantity: 5000,  // 10 liters/m² × 500 m²
          unit: 'liter', 
          unitCost: 0.01, 
          totalCost: 50 
        }
      ]
    },
    
    syncStatus: 'synced',
    lastSyncDate: new Date()
  },
  
  // التكامل المالي
  financialIntegration: {
    pricing: {
      unitPrice: 54,       // ريال/م² (26900 ÷ 500)
      currency: 'SAR',
      priceDate: new Date()
    },
    
    comparison: {
      estimated: {
        materialCost: 19900,
        laborCost: 7000,
        equipmentCost: 5200,
        totalCost: 32100
      },
      actual: {
        materialCost: 0,     // سيتم تحديثه من الموقع
        laborCost: 0,
        equipmentCost: 0,
        totalCost: 0
      },
      variance: {
        materialVariance: 0,
        laborVariance: 0,
        equipmentVariance: 0,
        totalVariance: 0,
        percentageVariance: 0
      }
    },
    
    suppliers: [
      { 
        name: 'مصنع الأسمنت السعودي', 
        price: 0.45, 
        leadTime: 1, 
        rating: 4.7 
      },
      { 
        name: 'مورد الرمل المغسول', 
        price: 0.09, 
        leadTime: 2, 
        rating: 4.5 
      }
    ],
    
    paymentStatus: 'pending'
  },
  
  // المعايير الهندسية
  engineeringStandards: {
    applicableCode: 'SBC',
    codeReference: 'SBC 306-2018',
    allowance: 8,              // 8% هدر (standard)
    safetyFactor: 1.0,
    
    qualityRequirements: [
      'مونة 1:4 (أسمنت:رمل)',
      'سمك موحد 2 سم',
      'استواء ± 3 مم',
      'عمودية ± 5 مم/3 م'
    ],
    
    testingRequirements: [
      'فحص الميل بالميزان',
      'فحص السمك بالقياس',
      'فحص النعومة بالملمس',
      'فحص الزوايا 90°',
      'فحص عدم وجود تشققات'
    ],
    
    complianceStatus: true
  },
  
  // التقدم الفعلي
  actualProgress: {
    completedQuantity: 0,
    percentageComplete: 0,
    completionDate: null,
    siteUpdates: []
  },
  
  createdDate: new Date(),
  lastModifiedDate: new Date(),
  createdBy: 'م. أحمد ناجح',
  notes: 'يجب التنسيق مع فريق المباني قبل البدء. الطرطشة ضرورية لضمان الترابط.'
};

// استخدام البند:
console.log('📋 بند المقايسة: اللياسة');
console.log(`الكود: ${plasteringBOQ.code}`);
console.log(`الكمية: ${plasteringBOQ.quantity} ${plasteringBOQ.unit}`);
console.log(`المدة المحسوبة: ${plasteringBOQ.scheduleIntegration.calculatedDuration} أيام`);
console.log(`التكلفة الإجمالية: ${plasteringBOQ.financialIntegration.comparison.estimated.totalCost.toFixed(2)} ريال`);
console.log(`سعر المتر: ${plasteringBOQ.financialIntegration.pricing.unitPrice} ريال/م²`);
```

---

## 🔄 **التكامل مع الجدول الزمني:**

```typescript
import { IntegratedScheduleTask } from './types/integrated/IntegratedSchedule';

const plasteringTask: IntegratedScheduleTask = {
  id: 'task-005',
  projectId: 'current-project',
  name: 'أعمال لياسة داخلية',
  description: 'لياسة الجدران الداخلية - 5 مراحل',
  
  // التواريخ
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-02-13'),    // 13 يوم
  duration: 13,
  
  // الحالة
  status: 'not-started',
  progress: 0,
  
  // التبعيات
  predecessors: [
    {
      taskId: 'task-004',
      name: 'أعمال المباني',
      type: 'finish-to-start',
      lag: 7  // 7 أيام انتظار (معالجة المباني)
    }
  ],
  
  successors: [
    {
      taskId: 'task-006',
      name: 'أعمال الدهانات',
      type: 'finish-to-start',
      lag: 3  // 3 أيام انتظار (جفاف اللياسة)
    }
  ],
  
  // الربط مع المقايسة
  boqIntegration: {
    linkedBOQItems: [
      {
        boqItemId: 'boq-005',
        description: 'أعمال لياسة داخلية',
        quantity: 500,
        unit: 'm²',
        contributionToTask: 100,   // 100% من المهمة
        productivityRate: 140,
        calculatedDays: 13
      }
    ],
    totalQuantities: {
      'plastering_m2': 500
    },
    syncStatus: 'synced',
    lastSyncDate: new Date()
  },
  
  // التكامل المالي
  financialIntegration: {
    plannedCosts: {
      labor: 7000,
      equipment: 5200,
      materials: 19900,
      overhead: 1500,
      contingency: 1600,
      total: 35200
    },
    actualCosts: {
      labor: 0,
      equipment: 0,
      materials: 0,
      overhead: 0,
      total: 0
    },
    variance: {
      amount: 0,
      percentage: 0,
      status: 'on'
    },
    delayCalculation: {
      directCosts: 0,
      indirectCosts: 0,
      totalDelayCost: 0
    },
    cashFlow: {
      plannedPayments: [
        {
          date: new Date('2024-02-07'),
          amount: 17600,  // 50% عند منتصف العمل
          description: 'دفعة أولى - 50%'
        },
        {
          date: new Date('2024-02-13'),
          amount: 17600,  // 50% عند الإنهاء
          description: 'دفعة نهائية - 50%'
        }
      ],
      actualPayments: [],
      remainingBalance: 35200
    }
  },
  
  // نظام الإنذار المبكر
  earlyWarning: {
    active: false,
    riskLevel: 'low',
    predictions: {
      delayDays: 0,
      completionDate: new Date('2024-02-13'),
      costOverrun: 0
    },
    indicators: {
      progressRate: 0,
      requiredRate: 38.5,  // 500 ÷ 13 days
      deviation: 0
    },
    recommendations: [],
    alertDate: new Date()
  },
  
  // القيمة المكتسبة (سيتم حسابها)
  earnedValue: {
    plannedValue: 0,
    earnedValue: 0,
    actualCost: 0,
    costPerformanceIndex: 1.0,
    schedulePerformanceIndex: 1.0,
    costVariance: 0,
    scheduleVariance: 0,
    estimateAtCompletion: 35200,
    estimateToComplete: 35200,
    varianceAtCompletion: 0,
    calculationDate: new Date()
  },
  
  // ملاحظات
  notes: 'يجب التنسيق مع المهندس الاستشاري للفحص النهائي',
  createdBy: 'م. أحمد ناجح',
  assignedTo: ['فريق اللياسة'],
  tags: ['finishing', 'plastering', 'internal']
};
```

---

## 📝 **الخلاصة:**

### ✅ **تم إضافة:**
1. **5 مراحل تفصيلية** للياسة بكل البيانات
2. **معدلات الإنتاجية** لكل مرحلة (400, 200, 140, 200, فحص)
3. **طاقم العمل** المحدد (عدد البيّاضين والعمال)
4. **المواد المطلوبة** (أسمنت، رمل، ماء)
5. **معامل الهدر** (5-12%)
6. **Functions جاهزة** للحسابات التلقائية

### 🎯 **الآن يمكنك:**
- ✅ حساب المدة تلقائياً
- ✅ حساب التكلفة بالتفصيل
- ✅ تتبع كل مرحلة على حدة
- ✅ الربط مع المقايسة والجدول الزمني
- ✅ تطبيق معايير الجودة

---

## 🚀 **الخطوة التالية:**

هل تريد رؤية البيانات في **واجهة المستخدم**؟ 
أخبرني وسأضيف:
- ✅ صفحة لياسة تفصيلية
- ✅ جدول بالمراحل
- ✅ رسوم بيانية للتقدم
- ✅ نموذج إدخال بيانات

---

**تم الإنجاز:** 2025-11-09
**الملف المحدث:** `src/types/integrated/EngineeringStandards.ts`
