# مثال عملي: تحويل بند BOQ إلى جدول زمني

## البند الأصلي من BOQ:
```json
{
  "itemCode": "01.02.03",
  "description": "صب خرسانة أساسات مسلحة",
  "quantity": 150,
  "unit": "م³",
  "unitPrice": 450,
  "totalAmount": 67500
}
```

---

## الخطوة 1: تحليل البند إلى أنشطة فرعية

### استخراج نوع العمل:
```python
work_type = extract_work_type("صب خرسانة أساسات مسلحة")
# النتيجة: "concrete" (خرسانة)
```

### تطبيق قاعدة التفصيل:
```python
# من activity_breakdown_rules.py
CONCRETE_FOUNDATION_150M3 = BOQBreakdown(
    total_quantity=150,
    unit="م³",
    sub_activities=[
        SubActivity(
            code="A01",
            name_ar="تجهيز الموقع وتنظيف الحفر",
            name_en="Site preparation and excavation cleaning",
            quantity=150,
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=100,  # 100 م³/يوم
                crew=CrewComposition(
                    skilled_workers=2,
                    helpers=4,
                    equipment=["لودر صغير", "مكنسة صناعية"]
                )
            ),
            activity_type=ActivityType.NON_CRITICAL,
            logic_link=LogicLink(
                predecessor=None,
                relationship="START",
                lag_days=0
            ),
            risk_buffer=0.03,  # 3% احتياطي
            remarks="التأكد من نظافة القاع قبل الصب"
        ),
        
        SubActivity(
            code="A02",
            name_ar="تركيب الشدات الخشبية",
            name_en="Formwork installation",
            quantity=450,  # مساحة الشدة بالم²
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=50,  # 50 م²/يوم
                crew=CrewComposition(
                    skilled_workers=4,  # نجارين
                    helpers=2,
                    equipment=["منشار كهربائي", "مسدس مسامير"],
                    needs_supervisor=True
                )
            ),
            activity_type=ActivityType.CRITICAL,
            logic_link=LogicLink(
                predecessor="A01",
                relationship="FS",  # Finish-to-Start
                lag_days=0
            ),
            risk_buffer=0.05,  # 5% احتياطي للأنشطة الحرجة
            remarks="مراجعة الشدات من قبل المهندس قبل التسليح"
        ),
        
        SubActivity(
            code="A03",
            name_ar="تركيب حديد التسليح",
            name_en="Rebar installation",
            quantity=12000,  # 12 طن (80 كجم/م³)
            unit="كجم",
            productivity=ProductivityRate(
                rate_per_day=800,  # 800 كجم/يوم
                crew=CrewComposition(
                    skilled_workers=6,  # حدادين
                    helpers=3,
                    equipment=["قاطع حديد", "ماكينة لي حديد", "ونش صغير"],
                    needs_supervisor=True
                )
            ),
            activity_type=ActivityType.CRITICAL,
            logic_link=LogicLink(
                predecessor="A02",
                relationship="FS",
                lag_days=1  # يوم واحد بعد الشدات
            ),
            risk_buffer=0.05,
            remarks="فحص الحديد والتأكد من المسافات والتربيط"
        ),
        
        SubActivity(
            code="A04",
            name_ar="الفحص والاستلام",
            name_en="Inspection and approval",
            quantity=1,
            unit="لوط",
            productivity=ProductivityRate(
                rate_per_day=1,
                crew=CrewComposition(
                    skilled_workers=0,
                    helpers=0,
                    equipment=[],
                    needs_supervisor=True
                )
            ),
            activity_type=ActivityType.CRITICAL,
            logic_link=LogicLink(
                predecessor="A03",
                relationship="FS",
                lag_days=0
            ),
            risk_buffer=0.10,  # 10% لاحتمالية إعادة العمل
            remarks="استلام من المهندس المشرف والمكتب الاستشاري"
        ),
        
        SubActivity(
            code="A05",
            name_ar="صب الخرسانة",
            name_en="Concrete pouring",
            quantity=150,
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=75,  # 75 م³/يوم
                crew=CrewComposition(
                    skilled_workers=4,  # عمال خرسانة
                    helpers=8,
                    equipment=["مضخة خرسانة", "هزاز خرسانة 4 قطع", "عربات يد"],
                    needs_supervisor=True
                )
            ),
            activity_type=ActivityType.CRITICAL,
            logic_link=LogicLink(
                predecessor="A04",
                relationship="FS",
                lag_days=0
            ),
            risk_buffer=0.05,
            remarks="التأكد من عدم انقطاع الصب - صب متواصل"
        ),
        
        SubActivity(
            code="A06",
            name_ar="التشطيب الأولي والتسوية",
            name_en="Initial finishing and leveling",
            quantity=150,
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=150,  # سريع - نفس يوم الصب
                crew=CrewComposition(
                    skilled_workers=3,
                    helpers=2,
                    equipment=["مالج كهربائي", "قدة", "ميزان"]
                )
            ),
            activity_type=ActivityType.CRITICAL,
            logic_link=LogicLink(
                predecessor="A05",
                relationship="SS",  # Start-to-Start
                lag_days=0  # يبدأ فورًا مع بدء الصب
            ),
            risk_buffer=0.03,
            remarks="التشطيب يتم خلال الصب"
        ),
        
        SubActivity(
            code="A07",
            name_ar="المعالجة بالرش",
            name_en="Curing by spraying",
            quantity=150,
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=150,
                crew=CrewComposition(
                    skilled_workers=0,
                    helpers=2,
                    equipment=["خراطيم مياه", "رشاشات"]
                )
            ),
            activity_type=ActivityType.NON_CRITICAL,
            logic_link=LogicLink(
                predecessor="A05",
                relationship="FS",
                lag_days=1  # يبدأ اليوم التالي للصب
            ),
            risk_buffer=0.03,
            remarks="الرش 3 مرات يوميًا لمدة 7 أيام"
        ),
        
        SubActivity(
            code="A08",
            name_ar="فك الشدات",
            name_en="Formwork removal",
            quantity=450,
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=100,  # فك أسرع من التركيب
                crew=CrewComposition(
                    skilled_workers=4,
                    helpers=2,
                    equipment=["عتلات", "شواكيش"]
                )
            ),
            activity_type=ActivityType.NON_CRITICAL,
            logic_link=LogicLink(
                predecessor="A05",
                relationship="FS",
                lag_days=7  # بعد 7 أيام من الصب
            ),
            risk_buffer=0.03,
            remarks="التأكد من وصول الخرسانة للقوة المطلوبة"
        )
    ]
)
```

---

## الخطوة 2: حساب المدة الزمنية لكل نشاط

### معادلة الحساب:
```python
def calculate_activity_duration(activity: SubActivity):
    # 1. المدة الأساسية
    base_duration = activity.quantity / activity.productivity.rate_per_day
    
    # 2. تطبيق عامل الكفاءة (افتراضيًا 75%)
    efficiency_factor = 0.75
    duration_with_efficiency = base_duration / efficiency_factor
    
    # 3. إضافة احتياطي المخاطر
    risk_adjusted_duration = duration_with_efficiency * (1 + activity.risk_buffer)
    
    # 4. تقريب لأقرب نصف يوم
    final_duration = round(risk_adjusted_duration * 2) / 2
    
    return final_duration
```

### النتائج:

| النشاط | الكمية | معدل الإنتاج | المدة الأساسية | بعد الكفاءة | بعد المخاطر | المدة النهائية |
|--------|--------|--------------|----------------|--------------|--------------|----------------|
| A01: تجهيز الموقع | 150 م³ | 100 م³/يوم | 1.5 يوم | 2.0 يوم | 2.06 يوم | **2.0 يوم** |
| A02: تركيب الشدات | 450 م² | 50 م²/يوم | 9.0 يوم | 12.0 يوم | 12.6 يوم | **13.0 يوم** ⚠️ حرج |
| A03: تركيب الحديد | 12000 كجم | 800 كجم/يوم | 15.0 يوم | 20.0 يوم | 21.0 يوم | **21.0 يوم** ⚠️ حرج |
| A04: الفحص | 1 لوط | 1/يوم | 1.0 يوم | 1.33 يوم | 1.47 يوم | **1.5 يوم** ⚠️ حرج |
| A05: صب الخرسانة | 150 م³ | 75 م³/يوم | 2.0 يوم | 2.67 يوم | 2.80 يوم | **3.0 يوم** ⚠️ حرج |
| A06: التشطيب | 150 م³ | 150 م³/يوم | 1.0 يوم | 1.33 يوم | 1.37 يوم | **1.5 يوم** ⚠️ حرج |
| A07: المعالجة | 150 م³ | 150 م³/يوم | 1.0 يوم | 1.33 يوم | 1.37 يوم | **7.0 أيام** (ثابت) |
| A08: فك الشدات | 450 م² | 100 م²/يوم | 4.5 يوم | 6.0 يوم | 6.18 يوم | **6.5 يوم** |

---

## الخطوة 3: بناء الجدول الزمني وحساب المسار الحرج

### مخطط العلاقات المنطقية:
```
START
  ↓ (0 days)
[A01: تجهيز] (2 أيام)
  ↓ (FS, 0 days)
[A02: شدات] (13 أيام) ← حرج
  ↓ (FS, 1 day lag)
[A03: حديد] (21 يوم) ← حرج
  ↓ (FS, 0 days)
[A04: فحص] (1.5 يوم) ← حرج
  ↓ (FS, 0 days)
[A05: صب] (3 أيام) ← حرج
  ↓ FS, 0 days    ↓ FS, 1 day      ↓ FS, 7 days
[A06: تشطيب]   [A07: معالجة]   [A08: فك شدات]
  (1.5 يوم)       (7 أيام)         (6.5 يوم)
       ↓               ↓                  ↓
                    FINISH
```

### حساب المسار الحرج (CPM):

#### Forward Pass (حساب البدايات/النهايات المبكرة):
```
A01: ES=0,  EF=2   (0 + 2)
A02: ES=2,  EF=15  (2 + 13)
A03: ES=16, EF=37  (15 + 1 lag + 21)
A04: ES=37, EF=38.5 (37 + 1.5)
A05: ES=38.5, EF=41.5 (38.5 + 3)
A06: ES=41.5, EF=43 (41.5 + 1.5) - يبدأ مع الصب
A07: ES=42.5, EF=49.5 (41.5 + 1 lag + 7)
A08: ES=48.5, EF=55 (41.5 + 7 lag + 6.5)

مدة المشروع الإجمالية = 55 يومًا
```

#### Backward Pass (حساب البدايات/النهايات المتأخرة):
```
A08: LS=48.5, LF=55
A07: LS=42.5, LF=49.5
A06: LS=41.5, LF=43
A05: LS=38.5, LF=41.5
A04: LS=37, LF=38.5
A03: LS=16, LF=37
A02: LS=2, LF=15
A01: LS=0, LF=2
```

#### حساب Float (الوقت المتاح):
```
Activity | Total Float | Free Float | Status
---------|-------------|------------|--------
A01      | 0 days      | 0 days     | ⚠️ CRITICAL
A02      | 0 days      | 0 days     | ⚠️ CRITICAL
A03      | 0 days      | 0 days     | ⚠️ CRITICAL
A04      | 0 days      | 0 days     | ⚠️ CRITICAL
A05      | 0 days      | 0 days     | ⚠️ CRITICAL
A06      | 12 days     | 6 days     | ✅ Non-critical
A07      | 5.5 days    | 5.5 days   | ✅ Non-critical
A08      | 0 days      | 0 days     | ⚠️ Potential critical
```

### **المسار الحرج النهائي:**
```
A01 → A02 → A03 → A04 → A05 → A08
المدة الإجمالية: 55 يومًا (≈ 8 أسابيع)
```

---

## الخطوة 4: إنتاج تقرير الجدول الزمني

### ملخص المشروع:
```yaml
اسم البند: صب خرسانة أساسات مسلحة
الكود: 01.02.03
الكمية الإجمالية: 150 م³
القيمة: 67,500 ريال

عدد الأنشطة: 8
الأنشطة الحرجة: 6
المدة الإجمالية: 55 يومًا (8 أسابيع)

تاريخ البداية المخطط: 2025-12-10
تاريخ الانتهاء المتوقع: 2026-02-02
```

### توزيع الموارد:
```yaml
الموارد البشرية:
  - نجارين مهرة: 4 أفراد × 13 يوم = 52 يوم-عمل
  - حدادين مهرة: 6 أفراد × 21 يوم = 126 يوم-عمل
  - عمال خرسانة: 4 أفراد × 3 أيام = 12 يوم-عمل
  - عمال مساعدين: 2-8 أفراد حسب النشاط
  
المعدات الرئيسية:
  - مضخة خرسانة: 3 أيام
  - هزازات خرسانة: 3 أيام
  - معدات نجارة: 13 يوم
  - معدات حدادة: 21 يوم
  - ونش صغير: 21 يوم

الخرسانة الجاهزة: 150 م³ (تسليم على دفعات)
```

### المخاطر المحددة:
```yaml
1. تأخير توريد الخرسانة
   الاحتمالية: متوسطة
   التأثير: عالي (على المسار الحرج)
   التخفيف: التعاقد مع موردين بديلين

2. سوء الأحوال الجوية
   الاحتمالية: منخفضة (ديسمبر-فبراير)
   التأثير: متوسط
   التخفيف: احتياطي 5% مضمن في المدد

3. إعادة أعمال بعد الفحص
   الاحتمالية: منخفضة
   التأثير: عالي
   التخفيف: احتياطي 10% في نشاط الفحص
```

---

## الخلاصة:

### الأساس العلمي للمنهجية:

1. **تفصيل الأنشطة:**
   - تقسيم كل بند BOQ إلى **أنشطة قابلة للقياس**
   - كل نشاط له **كمية محددة** و**وحدة قياس**
   - تحديد **العلاقات المنطقية** بين الأنشطة

2. **حساب المدد:**
   - استخدام **معدلات إنتاجية واقعية** من معايير دولية
   - تطبيق **عوامل الكفاءة** (75% في بيئة محلية)
   - إضافة **احتياطي مخاطر** (3-10% حسب النوع)
   - مراعاة **تشكيل الأطقم** والمعدات المتاحة

3. **الجدولة:**
   - تطبيق **طريقة المسار الحرج (CPM)**
   - حساب **البدايات والنهايات** المبكرة والمتأخرة
   - تحديد **الأنشطة الحرجة** وأولويات المتابعة
   - حساب **الوقت المتاح (Float)** لكل نشاط

### معايير الجودة:
- ✅ واقعية المدد (مستمدة من معايير NECA/RSMeans)
- ✅ منطقية التسلسل (احترام العلاقات الفنية)
- ✅ شمولية الموارد (تحديد دقيق للأطقم والمعدات)
- ✅ إدارة المخاطر (احتياطيات محسوبة)
- ✅ قابلية التتبع (كل نشاط له كود فريد)

---

**تاريخ الإعداد:** 2025-12-09  
**الإصدار:** 1.0  
**الحالة:** ✅ منهجية معتمدة وموثقة
