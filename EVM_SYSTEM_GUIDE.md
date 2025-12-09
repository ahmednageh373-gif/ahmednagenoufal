# 📊 دليل نظام القيمة المكتسبة (EVM System Guide)

**نظام متكامل لمراقبة التكلفة والجدولة**
**آخر تحديث:** 2025-11-09

---

## 🎯 **نظرة عامة**

هذا النظام يوفر **مراقبة شاملة** لأداء المشروع من خلال:

✅ **تتبع التكلفة** (Cost Control)
✅ **مراقبة الجدولة** (Schedule Control)
✅ **التنبؤ بالمستقبل** (Forecasting)
✅ **اتخاذ القرارات** (Decision Making)

---

## 📁 **الملفات الأساسية**

### **1️⃣ الوثائق (Documentation):**
```
📄 ITEM_TO_ACTIVITIES_DETAILED.md
   └─ منهجية تحويل البند إلى أنشطة دقيقة (12 خطوة)
   └─ مثال كامل: بلاط بورسلين 1,200 م²
   └─ جدول EVM تفصيلي مع SPI و CPI

📄 COMPLETE_METHODOLOGY.md
   └─ المنهجية الكاملة: WBS + CPM + EVM
   └─ مثال: خرسانة بلاطة 100 م³ (11 نشاط)
   └─ صيغ CPM (ES/EF/LS/LF/TF)

📄 HOW_ANALYSIS_WORKS.md
   └─ كيف يعمل تحليل المقايسة
   └─ التكامل بين BOQ والجدول الزمني
   └─ أمثلة عملية متعددة

📄 COMPLETE_CONSTRUCTION_DATA.md
   └─ قاعدة بيانات شاملة (11 فئة)
   └─ معدلات إنتاجية حقيقية
   └─ أسعار + طواقم + مواصفات جودة
```

### **2️⃣ الأكواد البرمجية (Code):**
```python
📦 backend/data/activity_breakdown_rules.py
   └─ تفكيك برمجي للبنود إلى أنشطة (WBS-3)
   └─ 4 أمثلة جاهزة:
      • خرسانة بلاطة 100 م³ (11 نشاط)
      • لياسة جدران 200 م² (8 أنشطة)
      • بلاط بورسلين 1,200 م² (7 أنشطة)
      • سور شبك معدني 100 م (9 أنشطة)

📦 backend/data/evm_calculator.py
   └─ حاسبة EVM كاملة
   └─ حساب PV, EV, AC, CPI, SPI, CV, SV, EAC, ETC, VAC
   └─ تقارير نصية تفصيلية
   └─ مثال عملي: بلاط بورسلين مع بيانات حقيقية
```

---

## 🚀 **كيفية الاستخدام**

### **السيناريو 1: تحليل بند من المقايسة**

#### **الخطوة 1: إنشاء مشروع EVM جديد**

```python
from backend.data.evm_calculator import EVMProjectSnapshot, EVMActivity

# إنشاء مشروع
project = EVMProjectSnapshot(
    project_name="مشروع بناء فيلا سكنية",
    snapshot_date="2025-01-15",
    current_day=15,          # نحن في اليوم 15
    total_duration=90,       # المشروع مدته 90 يوم
    total_budget=500000.0    # ميزانية 500 ألف ريال
)
```

#### **الخطوة 2: إضافة الأنشطة**

```python
# النشاط 1: أعمال الحفر
project.activities.append(EVMActivity(
    code="EXCAV-001",
    name_ar="أعمال الحفر",
    name_en="Excavation Works",
    unit="م³",
    quantity=200.0,
    unit_price=80.0,
    total_cost=16000.0,      # 200 × 80 = 16,000
    weight_percent=3.2,       # 16,000 ÷ 500,000 = 3.2%
    duration_days=8.0,
    physical_percent=100.0,   # تم الإنهاء
    actual_cost=17500.0       # تكلفة فعلية
))

# النشاط 2: صب الخرسانة
project.activities.append(EVMActivity(
    code="CONC-001",
    name_ar="صب خرسانة أساسات",
    name_en="Foundation Concrete",
    unit="م³",
    quantity=150.0,
    unit_price=450.0,
    total_cost=67500.0,      # 150 × 450 = 67,500
    weight_percent=13.5,      # 67,500 ÷ 500,000 = 13.5%
    duration_days=6.0,
    physical_percent=60.0,    # تم 60%
    actual_cost=42000.0       # ما صُرف حتى الآن
))

# ... أضف باقي الأنشطة
```

#### **الخطوة 3: حساب المؤشرات**

```python
# حساب جميع المؤشرات تلقائياً
project.calculate_all()

# طباعة التقرير الكامل
print(project.get_detailed_report())

# طباعة جدول الأنشطة
print(project.get_activity_table())
```

#### **الخطوة 4: قراءة النتائج**

```python
# الوصول للمؤشرات
print(f"CPI = {project.project_cpi:.2f}")
print(f"SPI = {project.project_spi:.2f}")
print(f"EAC = {project.estimate_at_completion:,.0f} ريال")

# تحليل الأداء
if project.project_cpi < 0.9:
    print("🚨 تجاوز حرج في التكلفة!")
elif project.project_cpi < 1.0:
    print("⚠️ زيادة في التكلفة")
else:
    print("✅ أداء تكلفة ممتاز")

if project.project_spi < 0.9:
    print("🚨 تأخير حرج في الجدولة!")
elif project.project_spi < 1.0:
    print("⚠️ تأخير في الجدولة")
else:
    print("✅ أداء جدولة ممتاز")
```

---

### **السيناريو 2: استخدام الأمثلة الجاهزة**

```python
from backend.data.evm_calculator import create_tile_project_example

# تحميل مثال بلاط بورسلين
project = create_tile_project_example()

# عرض التقرير
print(project.get_detailed_report())
print(project.get_activity_table())
```

**النتيجة المتوقعة:**
```
📊 تقرير القيمة المكتسبة (Earned Value Report)
================================================================================
المشروع: بلاط بورسلين 60×60 سم - داخلي
التاريخ: 2025-01-20
اليوم 20 من 61.5 (32.5%)
================================================================================

📈 القيم الرئيسية:
   Budget at Completion (BAC): 180,000 ريال
   Planned Value (PV):         58,537 ريال (32.5%)
   Earned Value (EV):          131,940 ريال (73.3%)
   Actual Cost (AC):           152,200 ريال (84.6%)

📊 المؤشرات:
   Cost Performance Index (CPI):      0.87 🚨 (زيادة 15%)
   Schedule Performance Index (SPI):  2.25 ✅ (تقدم 125%)
   
   Cost Variance (CV):           -20,260 ريال (خسارة)
   Schedule Variance (SV):       +73,403 ريال (تقدم)

💰 التوقعات:
   Estimate at Completion (EAC):  207,640 ريال
   Estimate to Complete (ETC):    55,440 ريال
   Variance at Completion (VAC):  -27,640 ريال (زيادة متوقعة)
```

---

### **السيناريو 3: تفكيك بند جديد**

```python
from backend.data.activity_breakdown_rules import get_breakdown_by_code

# تحميل تفكيك خرسانة بلاطة
concrete_breakdown = get_breakdown_by_code("CONC-SLAB-001")

print(f"البند: {concrete_breakdown.boq_description}")
print(f"الكمية: {concrete_breakdown.total_quantity} {concrete_breakdown.unit}")
print(f"عدد الأنشطة الفرعية: {len(concrete_breakdown.sub_activities)}")

# عرض الأنشطة الفرعية
for sub in concrete_breakdown.sub_activities:
    print(f"  • {sub.name_ar} ({sub.code})")
    print(f"    الوحدة: {sub.unit}")
    print(f"    معدل الإنتاج: {sub.productivity.rate_per_day} {sub.productivity.unit}")
    print(f"    الطاقم: {sub.productivity.crew.description}")
```

---

## 📊 **المؤشرات الرئيسية**

### **1️⃣ Cost Performance Index (CPI)**

```
CPI = Earned Value ÷ Actual Cost
CPI = EV ÷ AC

✅ CPI > 1.1  → توفير ممتاز (أقل من الميزانية)
✅ CPI = 1.0 - 1.1 → في حدود الميزانية
⚠️ CPI = 0.9 - 1.0 → زيادة طفيفة
🚨 CPI < 0.9  → زيادة حرجة (تجاوز الميزانية)
```

**مثال:**
```
EV = 100,000 ريال
AC = 85,000 ريال
CPI = 100,000 ÷ 85,000 = 1.18 ✅

معناه: نحصل على قيمة 1.18 ريال لكل 1 ريال ننفقه
```

### **2️⃣ Schedule Performance Index (SPI)**

```
SPI = Earned Value ÷ Planned Value
SPI = EV ÷ PV

✅ SPI > 1.1  → تقدم ممتاز (أسرع من المخطط)
✅ SPI = 1.0 - 1.1 → في الموعد
⚠️ SPI = 0.9 - 1.0 → تأخير طفيف
🚨 SPI < 0.9  → تأخير حرج
```

**مثال:**
```
EV = 100,000 ريال
PV = 120,000 ريال
SPI = 100,000 ÷ 120,000 = 0.83 🚨

معناه: نحن متأخرون بنسبة 17% عن الجدول
```

### **3️⃣ Estimate at Completion (EAC)**

```
EAC = Budget ÷ CPI

هذا هو التكلفة المتوقعة عند إنهاء المشروع
```

**مثال:**
```
Budget = 500,000 ريال
CPI = 0.85
EAC = 500,000 ÷ 0.85 = 588,235 ريال

معناه: المشروع سيكلف 588,235 ريال (زيادة 88,235)
```

---

## 🎯 **قرارات التصحيح**

### **الحالة 1: CPI < 0.9 (تجاوز حرج)**

```
🚨 الإجراءات الفورية:
1. مراجعة أسعار الموردين → البحث عن بدائل أرخص
2. تقليل الهدر → تحسين إدارة المخزون
3. هندسة قيمية (Value Engineering) → تبسيط التصميم
4. طلب Variation Order → زيادة الميزانية من العميل
5. تحسين الإنتاجية → تدريب العمالة
```

### **الحالة 2: SPI < 0.9 (تأخير حرج)**

```
🚨 الإجراءات الفورية:
1. زيادة عدد الورديات (1 → 2 ورديات)
2. زيادة حجم الطاقم (6 → 9 عمال)
3. عمل Overtime (ساعات إضافية)
4. تسريع المسار الحرج (Fast-track)
5. عمل أنشطة متوازية بدلاً من متسلسلة
6. استخدام معدات أكبر/أسرع
```

### **الحالة 3: CPI > 1.1 و SPI > 1.1 (ممتاز)**

```
✅ الإجراءات:
1. استمر على نفس الأداء
2. وثق الممارسات الجيدة (Best Practices)
3. يمكن تخفيف الموارد قليلاً (تقليل تكلفة)
4. استثمر الوقت الزائد في تحسين الجودة
```

---

## 📐 **الصيغ الأساسية**

### **القيم الثلاث:**
```
PV (Planned Value) = Weight % × Budget × (Current Day ÷ Total Duration)
EV (Earned Value)  = Weight % × Budget × Physical %
AC (Actual Cost)   = ما صُرف فعلاً من الموقع
```

### **المؤشرات:**
```
CPI = EV ÷ AC
SPI = EV ÷ PV

CV (Cost Variance)     = EV - AC
SV (Schedule Variance) = EV - PV
```

### **التوقعات:**
```
EAC (Estimate at Completion) = Budget ÷ CPI
ETC (Estimate to Complete)   = EAC - AC
VAC (Variance at Completion) = Budget - EAC
```

---

## 🔄 **دورة التحديث الأسبوعية**

### **كل أسبوع:**

1. **جمع البيانات من الموقع:**
   - نسبة الإنجاز الفعلية (Physical %)
   - التكلفة الفعلية (AC) من الفواتير
   - صور ميدانية

2. **تحديث النظام:**
   ```python
   # تحديث نشاط
   activity.physical_percent = 75.0  # تم 75%
   activity.actual_cost = 120000.0   # صرفنا 120,000
   
   # إعادة الحساب
   project.calculate_all()
   ```

3. **إصدار التقرير:**
   ```python
   print(project.get_detailed_report())
   print(project.get_activity_table())
   ```

4. **اجتماع المراجعة:**
   - عرض CPI و SPI
   - تحليل الانحرافات
   - اتخاذ قرارات التصحيح

5. **تنفيذ القرارات:**
   - زيادة عمالة؟
   - تغيير موردين؟
   - طلب Variation Order؟

---

## 📱 **التكامل مع الواجهة (Frontend)**

```typescript
// في React/TypeScript
import { useState, useEffect } from 'react';

interface EVMData {
  projectName: string;
  currentDay: number;
  totalDuration: number;
  totalBudget: number;
  totalPV: number;
  totalEV: number;
  totalAC: number;
  projectCPI: number;
  projectSPI: number;
  estimateAtCompletion: number;
}

function EVMDashboard() {
  const [evmData, setEvmData] = useState<EVMData | null>(null);

  useEffect(() => {
    // جلب البيانات من Backend
    fetch('/api/evm/current')
      .then(res => res.json())
      .then(data => setEvmData(data));
  }, []);

  if (!evmData) return <div>Loading...</div>;

  return (
    <div className="evm-dashboard">
      <h2>{evmData.projectName}</h2>
      
      <div className="metrics">
        <MetricCard 
          title="CPI" 
          value={evmData.projectCPI} 
          status={evmData.projectCPI >= 1.0 ? 'good' : 'bad'}
        />
        <MetricCard 
          title="SPI" 
          value={evmData.projectSPI} 
          status={evmData.projectSPI >= 1.0 ? 'good' : 'bad'}
        />
      </div>
      
      <ProgressChart 
        pv={evmData.totalPV}
        ev={evmData.totalEV}
        ac={evmData.totalAC}
      />
    </div>
  );
}
```

---

## 🎓 **أمثلة عملية إضافية**

### **مثال 1: مشروع صغير (فيلا سكنية)**
```python
project = EVMProjectSnapshot(
    project_name="فيلا سكنية - 300 م²",
    snapshot_date="2025-02-01",
    current_day=45,
    total_duration=180,
    total_budget=1200000.0
)
# ... أضف الأنشطة
```

### **مثال 2: مشروع متوسط (عمارة سكنية)**
```python
project = EVMProjectSnapshot(
    project_name="عمارة سكنية - 8 طوابق",
    snapshot_date="2025-03-15",
    current_day=120,
    total_duration=365,
    total_budget=15000000.0
)
# ... أضف الأنشطة
```

---

## 📚 **المراجع**

- `ITEM_TO_ACTIVITIES_DETAILED.md` - المثال الكامل
- `COMPLETE_METHODOLOGY.md` - المنهجية الشاملة
- `HOW_ANALYSIS_WORKS.md` - شرح التحليل
- `activity_breakdown_rules.py` - التفكيك البرمجي
- `evm_calculator.py` - حاسبة EVM

---

**تاريخ الإنشاء:** 2025-11-09
**الإصدار:** 1.0
**الحالة:** ✅ جاهز للاستخدام
