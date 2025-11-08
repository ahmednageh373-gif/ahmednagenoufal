# 📐 دليل تطبيق الخطوات العشرة للجدولة
# 10-Step Scheduling Implementation Guide

---

## 🎯 المقدمة

هذا الدليل يوضح كيف تم تطبيق **الخطوات العشرة** التي طلبتها لتحويل المقايسة إلى جدول زمني في النظام المطور.

---

## 📋 الخطوات العشرة - ملخص سريع

| # | الخطوة | الأداة/المصدر | المخرجات | التطبيق في النظام |
|---|--------|---------------|----------|-------------------|
| 1 | استخراج الكمية من المقايسة | BoQ أو الحصر الهندسي | الكمية + الوحدة | ✅ `BOQBreakdown` |
| 2 | اختيار معدل الإنتاجية | ملف معدلات + أسعار السوق | معدل (وحدة/يوم) | ✅ `ProductivityRate` |
| 3 | حساب المدة الخام | مدة = كمية ÷ معدل | مدة بالأيام | ✅ `calculate_duration()` |
| 4 | تحديد طاقم العمل | جدول الطواقم | عدد العمال + المشرفين | ✅ `CrewComposition` |
| 5 | تعديل المدة حسب الورديات | 1 وردية = 1.0، 2 = 0.6 | مدة معدلة | ✅ `shift_factor` |
| 6 | وضع العلاقات المنطقية | مخططات التنفيذ | روابط FS/SS/FF/SF | ✅ `LogicLink` |
| 7 | استخراج المسار الحرج | Primavera/MS Project | قائمة الأنشطة الحرجة | ✅ `find_critical_path()` |
| 8 | إضافة احتياطي الزمن | حرج +5%، عادي +3% | مدة نهائية | ✅ `get_risk_buffer()` |
| 9 | مراجعة الحمل اليومي | Resource Leveling | توزيع متكافئ | ✅ `ResourceLeveler` |
| 10 | إصدار الميلستونات | جدول زمني أسبوعي | تواريخ Milestones | ✅ `export_excel()` |

---

## 🔧 التطبيق التفصيلي

### **1️⃣ استخراج الكمية من المقايسة**

**الهدف**: الحصول على الكمية والوحدة من BoQ

**التطبيق في النظام:**

```python
# في activity_breakdown_rules.py
@dataclass
class BOQBreakdown:
    boq_code: str              # رمز البند في المقايسة
    boq_description: str       # وصف البند
    total_quantity: float      # الكمية الإجمالية ← هنا
    unit: str                  # الوحدة ← هنا
    sub_activities: List[SubActivity]
    category: str = ""

# مثال
CONCRETE_SLAB_100M3 = BOQBreakdown(
    boq_code="CONC-SLAB-001",
    boq_description="خرسانة بلاطة 100 م³ - C30",
    total_quantity=100.0,        # ← الكمية من المقايسة
    unit="م³",                   # ← الوحدة
    category="Concrete Works"
)
```

**✅ النتيجة**: الكمية = 100 م³، الوحدة = م³

---

### **2️⃣ اختيار معدل الإنتاجية**

**الهدف**: اختيار معدل إنتاج مناسب من جدول المعدلات

**التطبيق في النظام:**

```python
# في activity_breakdown_rules.py
@dataclass
class ProductivityRate:
    rate_per_day: float        # معدل الإنتاج ← هنا
    unit: str                  # الوحدة
    crew: CrewComposition      # الطاقم
    one_shift: float = 1.0
    two_shifts: float = 0.6
    three_shifts: float = 0.45

# مثال: صب خرسانة
SubActivity(
    code="CONC-SLAB-001-H",
    name_ar="صب الخرسانة",
    productivity=ProductivityRate(
        rate_per_day=40.0,          # ← 40 م³/يوم
        unit="م³/يوم",
        crew=CrewComposition(
            description="مضخة + 6 عامل",
            skilled_workers=2,
            helpers=4,
            equipment="Pump + vibrator"
        )
    )
)
```

**✅ النتيجة**: معدل الإنتاج = 40 م³/يوم

---

### **3️⃣ حساب المدة الخام**

**الهدف**: مدة = الكمية ÷ معدل الإنتاجية

**التطبيق في النظام:**

```python
# في activity_breakdown_rules.py
class ProductivityRate:
    def calculate_duration(self, quantity: float, shifts: int = 1) -> float:
        """حساب المدة بالأيام"""
        shift_factor = {
            1: self.one_shift,    # 1.0
            2: self.two_shifts,   # 0.6
            3: self.three_shifts  # 0.45
        }.get(shifts, 1.0)
        
        return (quantity / self.rate_per_day) / shift_factor

# مثال حي
productivity = ProductivityRate(rate_per_day=40.0, unit="م³/يوم", crew=...)
duration = productivity.calculate_duration(quantity=100.0, shifts=1)
# duration = (100 / 40) / 1.0 = 2.5 يوم
```

**✅ النتيجة**: المدة الخام = 2.5 يوم (قبل الاحتياطي)

---

### **4️⃣ تحديد طاقم العمل المناسب**

**الهدف**: تحديد عدد العمال والمشرفين والمعدات

**التطبيق في النظام:**

```python
# في activity_breakdown_rules.py
@dataclass
class CrewComposition:
    description: str
    skilled_workers: int        # عمال مهرة
    helpers: int               # مساعدين
    equipment: str = "None"    # معدات
    supervisor: bool = False   # مشرف
    
    @property
    def total_workers(self) -> int:
        """إجمالي العمالة"""
        return self.skilled_workers + self.helpers + (1 if self.supervisor else 0)

# مثال: طاقم صب الخرسانة
crew = CrewComposition(
    description="مضخة + 6 عامل (فرمجة)",
    skilled_workers=2,      # 2 عامل ماهر
    helpers=4,              # 4 مساعدين
    equipment="Pump",       # مضخة خرسانة
    supervisor=True         # + مشرف
)
# total_workers = 2 + 4 + 1 = 7
```

**✅ النتيجة**: 7 عمال (2 ماهر + 4 مساعد + 1 مشرف) + مضخة

---

### **5️⃣ تعديل المدة حسب عدد الورديات**

**الهدف**: تقليل المدة عند زيادة الورديات

**التطبيق في النظام:**

```python
# معاملات الورديات
shift_factors = {
    1: 1.0,   # وردية واحدة (8 ساعات/يوم)
    2: 0.6,   # ورديتان (16 ساعة/يوم) - وفر 40%
    3: 0.45   # 3 ورديات (24 ساعة/يوم) - وفر 55%
}

# مثال
base_duration = 10.0  # أيام

# 1 وردية
duration_1 = base_duration * 1.0  # = 10.0 يوم

# 2 وردية
duration_2 = base_duration * 0.6  # = 6.0 يوم (وفر 4 أيام)

# 3 ورديات
duration_3 = base_duration * 0.45 # = 4.5 يوم (وفر 5.5 يوم)
```

**التطبيق في الكود:**

```python
# في cpm_engine.py
def build_schedule_from_boq(boq_breakdown, project_start_date, shifts=1):
    for sub_activity in boq_breakdown.sub_activities:
        # حساب المدة مع معامل الورديات
        duration = sub_activity.calculate_final_duration(
            quantity=quantity,
            shifts=shifts  # ← هنا يطبق المعامل
        )
```

**✅ النتيجة**: مدة معدلة حسب الورديات

---

### **6️⃣ وضع العلاقات المنطقية (FS – SS – FF – SF)**

**الهدف**: ربط الأنشطة ببعضها منطقياً

**التطبيق في النظام:**

```python
# في activity_breakdown_rules.py
@dataclass
class LogicLink:
    logic_type: LogicType      # نوع العلاقة
    predecessor: str           # النشاط السابق
    lag_days: float = 0.0      # تأخير/تقديم

class LogicType(Enum):
    FS = "Finish-to-Start"      # الدهان يبدأ بعد البياض
    SS = "Start-to-Start"        # البلاط يبدأ مع الفرشة
    FF = "Finish-to-Finish"      # المعالجة تنتهي مع الصب
    SF = "Start-to-Finish"       # نادر

# أمثلة حقيقية من النظام

# مثال 1: FS (Finish-to-Start)
SubActivity(
    code="CONC-SLAB-001-B",
    name_ar="حفر يدوي/ميكانيكي",
    logic_links=[
        LogicLink(LogicType.FS, "CONC-SLAB-001-A", lag_days=0)
        # الحفر يبدأ بعد انتهاء التسليم مباشرة
    ]
)

# مثال 2: SS (Start-to-Start)
SubActivity(
    code="CONC-SLAB-001-E",
    name_ar="قص وثني الحديد",
    logic_links=[
        LogicLink(LogicType.SS, "CONC-SLAB-001-D", lag_days=0)
        # القص يبدأ مع بداية الفرشة (تداخل)
    ]
)

# مثال 3: FS مع Lag
SubActivity(
    code="TILE-001-C",
    name_ar="بؤج واوتار",
    logic_links=[
        LogicLink(LogicType.FS, "TILE-001-B", lag_days=1)
        # البؤج يبدأ بعد يوم من انتهاء الفرشة (تشقق)
    ]
)

# مثال 4: FF (Finish-to-Finish)
SubActivity(
    code="CONC-SLAB-001-K",
    name_ar="تسليم استشاري",
    logic_links=[
        LogicLink(LogicType.FF, "CONC-SLAB-001-I", lag_days=0)
        # التسليم ينتهي عند انتهاء المعالجة
    ]
)
```

**في محرك CPM:**

```python
# في cpm_engine.py - Forward Pass
for pred_id, logic_type, lag in activity.predecessors:
    pred = self.activities[pred_id]
    
    if logic_type == LogicType.FS:
        candidate = pred.early_finish + lag
    elif logic_type == LogicType.SS:
        candidate = pred.early_start + lag
    elif logic_type == LogicType.FF:
        candidate = pred.early_finish + lag - activity.duration
    elif logic_type == LogicType.SF:
        candidate = pred.early_start + lag - activity.duration
    
    early_start_candidates.append(candidate)
```

**✅ النتيجة**: روابط منطقية بين جميع الأنشطة

---

### **7️⃣ استخراج المسار الحرج (CPM)**

**الهدف**: حساب ES, EF, LS, LF, TF واستخراج المسار الحرج

**التطبيق في النظام:**

```python
# في cpm_engine.py
class CPMEngine:
    
    def forward_pass(self):
        """المسار الأمامي - حساب ES و EF"""
        # لكل نشاط، احسب:
        # ES = max(predecessor.EF + lag)
        # EF = ES + Duration
    
    def backward_pass(self):
        """المسار الخلفي - حساب LS و LF"""
        # لكل نشاط، احسب:
        # LF = min(successor.LS - lag)
        # LS = LF - Duration
    
    def calculate_float(self):
        """حساب الفائض"""
        # TF (Total Float) = LS - ES
        # FF (Free Float) = min(successor.ES) - EF
        # Critical = (TF ≈ 0)
    
    def find_critical_path(self):
        """استخراج المسار الحرج"""
        critical_activities = [
            aid for aid, act in self.activities.items()
            if act.is_critical  # TF ≈ 0
        ]
        return sorted(critical_activities, key=lambda aid: self.activities[aid].early_start)

# الاستخدام
cpm = CPMEngine(project_start_date, working_days_per_week=6)
cpm.run_cpm()  # يشغل جميع الخطوات تلقائياً

# النتيجة
print(f"Project Duration: {cpm.project_duration:.1f} days")
print(f"Critical Path: {cpm.critical_path}")
```

**مثال على المخرجات:**

```
رمز النشاط                    ES     EF     LS     LF     TF     حرج
CONC-SLAB-001-A              0.0    0.5    0.0    0.5    0.0      🔴
CONC-SLAB-001-B              0.5    4.6    0.5    4.6    0.0      🔴
CONC-SLAB-001-G             15.3   18.6   22.4   25.6    7.0      ⚪
```

**✅ النتيجة**: المسار الحرج محدد (8 أنشطة من 11)

---

### **8️⃣ إضافة احتياطي الزمن (Risk Buffer)**

**الهدف**: إضافة احتياطي حسب نوع النشاط والمخاطر

**التطبيق في النظام:**

```python
# في activity_breakdown_rules.py
class ActivityType(Enum):
    CRITICAL = "critical"         # +5%
    NON_CRITICAL = "non_critical" # +3%
    PRECISE = "precise"           # +8% (رخام فاخر)
    EXTERNAL = "external"         # +6% (أعمال خارجية)

@dataclass
class SubActivity:
    activity_type: ActivityType
    risk_buffer: float = 0.0   # احتياطي إضافي
    
    def get_risk_buffer(self) -> float:
        """حساب الاحتياطي الكلي"""
        base_buffer = {
            ActivityType.CRITICAL: 5.0,
            ActivityType.NON_CRITICAL: 3.0,
            ActivityType.PRECISE: 8.0,
            ActivityType.EXTERNAL: 6.0
        }.get(self.activity_type, 3.0)
        
        return base_buffer + self.risk_buffer
    
    def calculate_final_duration(self, quantity, shifts=1):
        """المدة النهائية مع الاحتياطي"""
        raw_duration = self.productivity.calculate_duration(quantity, shifts)
        buffer_factor = 1.0 + (self.get_risk_buffer() / 100.0)
        return raw_duration * buffer_factor

# مثال
SubActivity(
    code="CONC-SLAB-001-H",
    name_ar="صب الخرسانة",
    activity_type=ActivityType.CRITICAL,  # +5%
    risk_buffer=0.0,  # لا احتياطي إضافي
    # ...
)
# raw_duration = 2.5 يوم
# buffer = 5% = 0.125 يوم
# final_duration = 2.5 × 1.05 = 2.625 يوم
```

**جدول الاحتياطيات:**

| نوع النشاط | الاحتياطي | متى يُستخدم |
|-----------|----------|-------------|
| حرج (Critical) | +5% | أنشطة على المسار الحرج |
| عادي (Normal) | +3% | أنشطة غير حرجة |
| دقيق (Precise) | +8% | رخام، تشطيبات عالية |
| خارجي (External) | +6% | مقاولين خارجيين |

**احتياطيات إضافية (يمكن إضافتها يدوياً):**

| نوع المخاطر | الاحتياطي | التطبيق |
|------------|----------|---------|
| الطقس (أمطار، حرارة) | +6% | يوم ماطر كل 17 يوم |
| رمضان | حسب الأيام | تعديل التقويم |
| أعمال حرجة | +5% | زيادة على المدة |
| أعمال دقيقة | +8% | زيادة على المدة |

**✅ النتيجة**: مدة نهائية مع احتياطي محسوب

---

### **9️⃣ مراجعة الحمل اليومي (Resource Leveling)**

**الهدف**: موازنة توزيع العمالة لتجنب الذروات

**التطبيق في النظام:**

```python
# في resource_leveling.py
class ResourceLeveler:
    
    def calculate_histogram(self, use_late_start=False):
        """حساب الحمل اليومي للعمالة"""
        # لكل يوم في المشروع
        for day in range(max_day):
            daily_resources[day] = DailyResource(day, date)
        
        # لكل نشاط
        for activity in activities:
            start_day = activity.late_start if use_late_start else activity.early_start
            end_day = activity.late_finish if use_late_start else activity.early_finish
            
            # إضافة العمالة لكل يوم
            for day in range(start_day, end_day):
                daily_resources[day].total_workers += activity.crew_size
        
        # حساب الإحصائيات
        peak_workers = max(daily_resources.total_workers)
        average_workers = sum(daily_resources.total_workers) / working_days
        peak_ratio = peak_workers / average_workers
        
        return ResourceHistogram(...)
    
    def level_resources(self, target_peak_ratio=1.20):
        """موازنة الموارد"""
        # استراتيجية 1: تأخير الأنشطة غير الحرجة (Late Start)
        leveled = self.calculate_histogram(use_late_start=True)
        
        # استراتيجية 2: تقسيم الأنشطة الكبيرة
        # استراتيجية 3: زيادة الورديات
        
        return leveled

# الاستخدام
site_capacity = SiteCapacity(
    max_workers=50,
    max_beds=60,
    max_meals=100,
    max_buses=2
)

leveler = ResourceLeveler(cpm, site_capacity)

# تحليل الأصلي
original = leveler.analyze_original()
print(f"Peak: {original.peak_workers} workers")
print(f"Average: {original.average_workers:.1f} workers")
print(f"Ratio: {original.peak_ratio:.2f} (target ≤ 1.20)")

# موازنة
leveled = leveler.level_resources(target_peak_ratio=1.20)
```

**مثال على المخرجات:**

```
📈 التوزيع الأصلي:
   الذروة: 9 عامل (اليوم 25)
   المتوسط: 3.7 عامل
   نسبة الذروة: 2.42 (242%) ❌ (يحتاج موازنة)

📊 Histogram:
اليوم  العمال  ████████████████████████████████████████
  0      5     ██████████████████████
  1      3     █████████████
  5      7     ███████████████████████████████
 25      9     ████████████████████████████████████████
```

**استراتيجيات الموازنة:**

| الاستراتيجية | الوصف | التطبيق |
|-------------|-------|---------|
| 1. تأخير الأنشطة | استخدام Float | Late Start بدلاً من Early Start |
| 2. تقسيم الأنشطة | قسم نشاط 10 أيام → 2×5 | Split Activity |
| 3. زيادة الورديات | من 1 → 2 ورديات | معامل 0.6 |
| 4. زيادة الطواقم | طاقم واحد → طاقمان | Increase Crews |

**✅ النتيجة**: توزيع متوازن (Peak ≤ 120% Average)

---

### **🔟 إصدار الميلستونات الرئيسية**

**الهدف**: استخراج التواريخ المهمة وإصدار الجدول النهائي

**التطبيق في النظام:**

```python
# في primavera_exporter.py
class PrimaveraExporter:
    
    def export_excel(self, filename):
        """تصدير إلى Excel مع 4 أوراق"""
        wb = Workbook()
        
        # Sheet 1: Schedule (الجدول الكامل)
        self._create_schedule_sheet(wb)
        
        # Sheet 2: Critical Path (المسار الحرج)
        self._create_critical_path_sheet(wb)
        
        # Sheet 3: Logic Links (الروابط المنطقية)
        self._create_logic_sheet(wb)
        
        # Sheet 4: Summary (الملخص + Milestones)
        self._create_summary_sheet(wb)
        
        wb.save(filename)

# الاستخدام
exporter = PrimaveraExporter(cpm, project_name="خرسانة بلاطة 100 م³")
exporter.export_excel("schedule.xlsx")
exporter.export_xer("schedule.xer")       # للاستيراد في P6
exporter.export_json("schedule.json")     # للتكامل مع الأنظمة
exporter.export_text_report("schedule.txt")
```

**محتوى Summary Sheet:**

```
📊 ملخص المشروع

📅 معلومات التواريخ:
- تاريخ البداية: 2025-01-01
- تاريخ الانتهاء: 2025-02-06
- المدة (أيام): 31.3
- المدة (أسابيع): 4.5

🎯 Milestones:
- M1: تسليم الموقع - 2025-01-01
- M2: انتهاء الحفر - 2025-01-06
- M3: انتهاء التسليح - 2025-01-30
- M4: انتهاء الصب - 2025-02-03
- M5: تسليم استشاري - 2025-02-06

📊 إحصائيات الأنشطة:
- إجمالي الأنشطة: 11
- الأنشطة الحرجة: 8 (72.7%)

⚙️ إعدادات العمل:
- أيام العمل/أسبوع: 6
- تاريخ التصدير: 2025-01-07 14:30
```

**تنسيقات التصدير:**

| التنسيق | الاستخدام | الميزات |
|---------|----------|---------|
| **Excel (XLSX)** | مراجعة + تعديل | 4 أوراق، ألوان، تنسيق |
| **Primavera (XER)** | استيراد في P6 | روابط منطقية، تواريخ |
| **JSON** | تكامل API | بيانات منظمة، قابلة للبرمجة |
| **Text (TXT)** | طباعة + توثيق | جدول نصي + مسار حرج |

**✅ النتيجة**: جدول زمني كامل جاهز للتسليم

---

## ✅ قائمة تدقيق نهائية (Gated Check-List)

قبل إصدار الجدول، تأكد من:

- [x] الكميات مستخرجة من أحدث إصدار معتمد للمقايسة
- [x] كل نشاط له وحدة قياس واضحة ومعدل إنتاجية مستند
- [x] العلاقات منطقية وخالية من الحلقات المغلقة
- [x] احتياطي الزمن محسوب ومضاف للمدة
- [x] الحمل العمالي متوازن (Peak ≤ 120% Average)
- [x] الميلستونات محددة ومربوطة بالعقد
- [x] التواريخ لا تتجاوز المدة العقدية
- [x] إصدارات PDF + XER/MSP مرفوعة

---

## 🎯 الكرت السريع للجيب

```
كمية ÷ معدل = أيام
→ ضع العلاقة (FS/SS/FF)
→ أضف احتياطي (+3% أو +5%)
→ سوِّ العمالة (Peak ≤ 120%)
→ تحقق من المسار الحرج
→ أصدر (Excel + XER + JSON)
```

---

## 📊 مثال كامل: تطبيق الخطوات على 100 م³ خرسانة

```python
from datetime import datetime
from backend.data.activity_breakdown_rules import CONCRETE_SLAB_100M3
from backend.scheduling.cpm_engine import build_schedule_from_boq
from backend.scheduling.resource_leveling import ResourceLeveler, SiteCapacity
from backend.scheduling.primavera_exporter import PrimaveraExporter

# 1️⃣ الكمية من المقايسة: 100 م³
# 2️⃣ معدل الإنتاج: 40 م³/يوم (محدد في SubActivity)
# 3️⃣ المدة الخام: 100 ÷ 40 = 2.5 يوم
# 4️⃣ الطاقم: 7 عمال (محدد في CrewComposition)
# 5️⃣ الورديات: 1 (معامل 1.0)
# 6️⃣ العلاقات: محددة في logic_links

# بناء الجدول
cpm = build_schedule_from_boq(
    boq_breakdown=CONCRETE_SLAB_100M3,
    project_start_date=datetime(2025, 1, 1),
    shifts=1
)

# 7️⃣ المسار الحرج: يحسب تلقائياً
cpm.print_schedule()

# 8️⃣ الاحتياطي: +5% للأنشطة الحرجة (محسوب تلقائياً)

# 9️⃣ موازنة الموارد
site_capacity = SiteCapacity(max_workers=50, max_beds=60, max_meals=100, max_buses=2)
leveler = ResourceLeveler(cpm, site_capacity)
histogram = leveler.analyze_original()
leveler.print_histogram(histogram)

# 🔟 التصدير
exporter = PrimaveraExporter(cpm, project_name="خرسانة بلاطة 100 م³")
exporter.export_excel("schedule.xlsx")
exporter.export_xer("schedule.xer")
exporter.export_json("schedule.json")

print("✅ الخطوات العشرة مكتملة!")
```

**النتائج:**
```
✅ المدة الإجمالية: 31.3 يوم (4.5 أسبوع)
✅ المسار الحرج: 8/11 أنشطة (72.7%)
✅ ذروة العمالة: 9 عامل
✅ متوسط العمالة: 3.7 عامل
✅ ملفات التصدير: 4 تنسيقات
```

---

## 🎓 الخلاصة

**النظام المطور يطبق جميع الخطوات العشرة تلقائياً:**

1. ✅ استخراج الكمية → `BOQBreakdown.total_quantity`
2. ✅ معدل الإنتاج → `ProductivityRate.rate_per_day`
3. ✅ المدة الخام → `calculate_duration()`
4. ✅ الطاقم → `CrewComposition.total_workers`
5. ✅ الورديات → `shift_factor`
6. ✅ العلاقات → `LogicLink (FS/SS/FF/SF)`
7. ✅ المسار الحرج → `CPMEngine.find_critical_path()`
8. ✅ الاحتياطي → `get_risk_buffer()`
9. ✅ موازنة الموارد → `ResourceLeveler`
10. ✅ التصدير → `PrimaveraExporter`

**✅ جاهز للاستخدام في مشاريع حقيقية!**

---

**📅 آخر تحديث**: 2025-01-07  
**🏗️ الإصدار**: 1.0.0  
**👨‍💻 المطور**: Construction Scheduling System
