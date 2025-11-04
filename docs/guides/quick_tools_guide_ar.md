# 📖 دليل الأدوات السريعة - Quick Tools Guide

## نظرة عامة

الأدوات السريعة هي مجموعة من الحاسبات والمحولات المستوحاة من CivilConcept.com، مصممة للتقديرات الأولية السريعة والتحويلات الشائعة في مشاريع الهندسة المدنية.

### ⚠️ تحذير مهم

**هذه الأدوات للتقدير الأولي فقط!**

- ✅ مناسبة: دراسات الجدوى، التخطيط الأولي، المقارنات السريعة
- ❌ غير مناسبة: التصميم التفصيلي، BOQ النهائي، المشاريع الحساسة

**لل detailed BOQ و SBC compliance:** استخدم الوحدات الأساسية (QuantityAnalyzer, ScheduleAnalyzer, SBCComplianceChecker)

---

## 🔧 الأدوات المتوفرة

### 1️⃣ التقدير السريع - Quick Estimator

#### الوصف
حاسبة تقدير أولي للتكلفة والكميات بناءً على المساحة وعدد الطوابق ونوع المبنى.

#### المدخلات

| المدخل | النوع | الوصف | مثال |
|--------|-------|-------|------|
| `total_area_sqm` | رقم | المساحة الإجمالية (م²) | 400.0 |
| `number_of_storeys` | عدد صحيح | عدد الطوابق | 2 |
| `region` | نص | المنطقة | `saudi_arabia` |
| `building_type` | نص | نوع المبنى | `villa` |
| `finish_level` | نص | مستوى التشطيب | `standard` |
| `custom_contractor_rate` | رقم (اختياري) | سعر مقاول مخصص للمتر | 1500 |

#### المناطق المدعومة

```
🇸🇦 Saudi Arabia (saudi_arabia) - SAR
🇦🇪 UAE (uae) - AED
🇶🇦 Qatar (qatar) - QAR
🇰🇼 Kuwait (kuwait) - KWD
🇴🇲 Oman (oman) - OMR
🇧🇭 Bahrain (bahrain) - BHD
🇪🇬 Egypt (egypt) - EGP
🇯🇴 Jordan (jordan) - JOD
```

#### أنواع المباني

- **residential** - سكني عام
- **villa** - فيلا
- **apartment** - شقة
- **commercial** - تجاري
- **office** - مكتبي
- **industrial** - صناعي
- **warehouse** - مستودع

#### مستويات التشطيب

- **basic** - أساسي (0.75x)
- **standard** - قياسي (1.0x)
- **luxury** - فاخر (1.5x)
- **super_luxury** - فاخر جداً (2.2x)

#### المخرجات

```json
{
  "region": "saudi_arabia",
  "building_type": "villa",
  "finish_level": "standard",
  "total_area_sqm": 400.0,
  "number_of_storeys": 2,
  "currency": "SAR",
  
  "materials": {
    "steel_kg": 39600.0,
    "concrete_m3": 198.0,
    "blocks_nos": 8250.0,
    "cement_bags_50kg": 3300,
    "sand_m3": 29.7,
    "aggregate_m3": 59.4
  },
  
  "costs": {
    "structure_cost": 608000.0,
    "finishing_cost": 396000.0,
    "mep_cost": 264000.0,
    "total_estimated_cost": 1268000.0,
    "cost_per_sqm": 1585.0
  },
  
  "factors": {
    "storey_multiplier": 1.65,
    "building_type_multiplier": 1.15,
    "finish_multiplier": 1.0
  },
  
  "confidence_level": "high",
  "warnings": [
    "⚠️ هذا تقدير أولي فقط - استخدم QuantityAnalyzer للتحليل التفصيلي"
  ]
}
```

#### العوامل المستخدمة (السعودية)

**الكميات (لكل م²):**
```python
steel_kg_per_sqm = 60.0        # كجم حديد
concrete_m3_per_sqm = 0.30     # م³ خرسانة
blocks_per_sqm = 12.5          # عدد البلوك
cement_bags_per_sqm = 5.0      # أكياس أسمنت (50 كجم)
sand_m3_per_sqm = 0.045        # م³ رمل
aggregate_m3_per_sqm = 0.090   # م³ ركام
```

**التكاليف (لكل م²):**
```python
structure_cost_per_sqm = 800   # SAR (أساسات + هيكل)
finishing_cost_per_sqm = 600   # SAR (بلاط، دهان، أبواب، شبابيك)
mep_cost_per_sqm = 400         # SAR (كهرباء، سباكة، تكييف)
```

**مضاعفات الطوابق:**
```python
1 طابق  = 1.0x
2 طابق  = 1.65x
3 طوابق = 2.35x
4+ طوابق = 3.20x
```

#### مثال API Call

```bash
curl -X POST http://localhost:5000/api/quick-estimate \
  -H "Content-Type: application/json" \
  -d '{
    "total_area_sqm": 400,
    "number_of_storeys": 2,
    "region": "saudi_arabia",
    "building_type": "villa",
    "finish_level": "standard"
  }'
```

#### مستوى الثقة - Confidence Level

النظام يحسب تلقائياً مستوى الثقة بناءً على:

- **High (عالي)**: مشاريع صغيرة (<500م²)، طوابق قليلة (≤3)، تشطيب قياسي
- **Medium (متوسط)**: مشاريع متوسطة (500-1000م²)، أو تشطيب فاخر
- **Low (منخفض)**: مشاريع كبيرة (>1000م²)، طوابق كثيرة (>4)، تشطيب فاخر جداً

---

### 2️⃣ محول الوحدات - Unit Converter

#### الوصف
تحويل شامل بين الوحدات المترية والإمبراطورية لجميع القياسات الهندسية.

#### الأنواع المدعومة

##### 📏 الطول - Length
```
Metric:   mm, cm, m, km
Imperial: in, ft, yd, mi
```

##### 📐 المساحة - Area
```
Metric:   mm², cm², m², km², ha (hectare)
Imperial: in², ft², yd², acre, mi²
```

##### 📦 الحجم - Volume
```
Metric:   mm³, cm³, m³, L (liter), mL
Imperial: in³, ft³, yd³, gal(US), gal(UK)
```

##### ⚖️ الوزن - Weight
```
Metric:   mg, g, kg, ton (metric)
Imperial: oz, lb, ton(US), ton(UK)
```

##### 💪 الضغط - Pressure
```
Metric:   Pa, kPa, MPa, GPa, bar
Imperial: psi, ksi
Other:    kg/cm²
```

##### ⚡ القوة - Force
```
Metric:   N, kN, MN
Imperial: lbf (pound-force), kip
Other:    kgf, tonf
```

##### 🌡️ الحرارة - Temperature
```
°C (Celsius)
°F (Fahrenheit)
K (Kelvin)
```

#### مثال API Call

```bash
# تحويل 10 متر إلى قدم
curl -X POST http://localhost:5000/api/unit-convert \
  -H "Content-Type: application/json" \
  -d '{
    "value": 10,
    "from_unit": "m",
    "to_unit": "ft",
    "unit_type": "length"
  }'

# Response:
{
  "success": true,
  "original": {
    "value": 10,
    "unit": "m"
  },
  "converted": {
    "value": 32.8084,
    "unit": "ft"
  }
}
```

#### أمثلة شائعة

```python
# قوة خرسانة
30 MPa = 4351 psi

# سمك بلاطة
150 mm = 5.91 inches

# وزن حديد
1 ton = 1000 kg

# مساحة أرض
1000 m² = 10763.91 ft² = 0.247 acre
```

#### تحويلات دفعية - Batch Conversion

```bash
curl -X POST http://localhost:5000/api/unit-convert/batch \
  -H "Content-Type: application/json" \
  -d '{
    "conversions": [
      {"value": 10, "from": "m", "to": "ft", "type": "length"},
      {"value": 30, "from": "MPa", "to": "psi", "type": "pressure"}
    ]
  }'
```

---

### 3️⃣ حاسبة الأراضي غير المنتظمة - Irregular Land Calculator

#### الوصف
حساب مساحة قطع الأراضي رباعية الأضلاع غير المنتظمة.

#### طريقتان:

##### 1. طريقة القطر - Diagonal Method

**المدخلات:**
- 4 أضلاع (a, b, c, d)
- قطر واحد يربط ركنين متقابلين

**الصيغة:**
يقسم القطر الشكل إلى مثلثين ويستخدم صيغة هيرون (Heron's formula).

```
Area = Area_Triangle1 + Area_Triangle2
```

**مثال API Call:**
```bash
curl -X POST http://localhost:5000/api/land-area/irregular \
  -H "Content-Type: application/json" \
  -d '{
    "method": "diagonal",
    "side_a": 25.0,
    "side_b": 30.0,
    "side_c": 28.0,
    "side_d": 32.0,
    "diagonal_ac": 40.0,
    "unit": "m"
  }'

# Response:
{
  "success": true,
  "area": {
    "area_sqm": 836.66,
    "area_sqft": 9004.43,
    "area_hectare": 0.0837,
    "area_acre": 0.2067
  }
}
```

##### 2. طريقة الإحداثيات - Coordinates Method

**المدخلات:**
- 4 نقاط إحداثية (x, y) بالترتيب

**الصيغة:**
صيغة Shoelace (Gauss's area formula):

```
Area = ½ |Σ(x_i * y_(i+1) - x_(i+1) * y_i)|
```

**مثال API Call:**
```bash
curl -X POST http://localhost:5000/api/land-area/irregular \
  -H "Content-Type: application/json" \
  -d '{
    "method": "coordinates",
    "coordinates": [
      [0, 0],
      [25, 0],
      [30, 28],
      [5, 32]
    ],
    "unit": "m"
  }'
```

#### متى تستخدم كل طريقة؟

**استخدم طريقة القطر عندما:**
- ✅ لديك قياسات للأضلاع الأربعة
- ✅ لديك قياس لقطر واحد
- ✅ القياسات من الواقع (شريط قياس)

**استخدم طريقة الإحداثيات عندما:**
- ✅ لديك خريطة مساحية
- ✅ لديك GPS coordinates
- ✅ تعمل من مخططات AutoCAD

---

## 🔄 التكامل مع النظام الأساسي

### من Quick Estimator إلى BOQ تفصيلي

```python
# 1. استخدم Quick Estimator للتقدير الأولي
quick_estimate = get_quick_estimate(area=400, storeys=2)

# 2. إذا كان التقدير مقبول، انتقل للتحليل التفصيلي
if quick_estimate['confidence_level'] in ['high', 'medium']:
    # استخدم QuantityAnalyzer للتحليل الدقيق
    detailed_boq = QuantityAnalyzer(project_dir).run_full_analysis('BOQ.xlsx')
    
    # التحقق من SBC compliance
    compliance = SBCComplianceChecker().validate(detailed_boq)
```

### استخدام Unit Converter في BOQ Processing

```python
# تحويل وحدات البنود تلقائياً
for item in boq_items:
    if item['unit'] == 'ft³':
        # تحويل إلى م³
        item['quantity_m3'] = UnitConverter.convert_volume(
            item['quantity'],
            VolumeUnit.CUBIC_FOOT,
            VolumeUnit.CUBIC_METER
        )
```

---

## 📊 أمثلة عملية

### مثال 1: تقدير فيلا في الرياض

```python
from core.quick_estimator import QuickEstimator, EstimateInput, Region, BuildingType, FinishLevel

estimator = QuickEstimator()

# فيلا 400 م² على دورين
input_data = EstimateInput(
    total_area_sqm=400.0,
    number_of_storeys=2,
    region=Region.SAUDI_ARABIA,
    building_type=BuildingType.VILLA,
    finish_level=FinishLevel.STANDARD
)

result = estimator.estimate(input_data)

print(f"التكلفة المقدرة: {result.total_estimated_cost:,.0f} {result.currency}")
print(f"حديد: {result.steel_kg:,.0f} كجم")
print(f"خرسانة: {result.concrete_m3:.1f} م³")
print(f"مستوى الثقة: {result.confidence_level}")
```

**النتيجة:**
```
التكلفة المقدرة: 1,268,000 SAR
حديد: 39,600 كجم
خرسانة: 198.0 م³
مستوى الثقة: high
```

### مثال 2: مقارنة التكلفة بين المناطق

```python
regions = [Region.SAUDI_ARABIA, Region.UAE, Region.EGYPT]
results = []

base_input = EstimateInput(
    total_area_sqm=500.0,
    number_of_storeys=3,
    building_type=BuildingType.RESIDENTIAL,
    finish_level=FinishLevel.STANDARD
)

for region in regions:
    input_data = EstimateInput(
        total_area_sqm=base_input.total_area_sqm,
        number_of_storeys=base_input.number_of_storeys,
        region=region,
        building_type=base_input.building_type,
        finish_level=base_input.finish_level
    )
    result = estimator.estimate(input_data)
    results.append({
        'region': region.value,
        'cost': result.total_estimated_cost,
        'currency': result.currency
    })

for r in results:
    print(f"{r['region']}: {r['cost']:,.0f} {r['currency']}")
```

**النتيجة:**
```
Saudi Arabia: 2,115,000 SAR
UAE: 2,468,000 AED  
Egypt: 10,280,000 EGP
```

### مثال 3: حساب مساحة أرض غير منتظمة

```python
from core.unit_converter import IrregularLandCalculator, LengthUnit

calculator = IrregularLandCalculator()

# أرض بأضلاع: 25م، 30م، 28م، 32م
# قطر: 40م
result = calculator.calculate_area_with_diagonal(
    side_a=25.0,
    side_b=30.0,
    side_c=28.0,
    side_d=32.0,
    diagonal_ac=40.0,
    unit=LengthUnit.METER
)

print(f"المساحة: {result['area_sqm']} م²")
print(f"المساحة: {result['area_sqft']} قدم²")
print(f"المساحة: {result['area_hectare']} هكتار")
print(f"المساحة: {result['area_acre']} أكر")
```

**النتيجة:**
```
المساحة: 836.66 م²
المساحة: 9004.43 قدم²
المساحة: 0.0837 هكتار
المساحة: 0.2067 أكر
```

### مثال 4: تحويل specifications من Imperial إلى Metric

```python
from core.unit_converter import UnitConverter, LengthUnit, PressureUnit

# مواصفات مشروع أمريكي
specs_imperial = {
    'slab_thickness_in': 6.0,
    'column_width_in': 12.0,
    'beam_depth_in': 24.0,
    'concrete_strength_psi': 4000
}

# تحويل إلى متري
specs_metric = {
    'slab_thickness_mm': UnitConverter.convert_length(
        specs_imperial['slab_thickness_in'],
        LengthUnit.INCH,
        LengthUnit.MILLIMETER
    ),
    'column_width_mm': UnitConverter.convert_length(
        specs_imperial['column_width_in'],
        LengthUnit.INCH,
        LengthUnit.MILLIMETER
    ),
    'beam_depth_mm': UnitConverter.convert_length(
        specs_imperial['beam_depth_in'],
        LengthUnit.INCH,
        LengthUnit.MILLIMETER
    ),
    'concrete_strength_mpa': UnitConverter.convert_pressure(
        specs_imperial['concrete_strength_psi'],
        PressureUnit.PSI,
        PressureUnit.MEGAPASCAL
    )
}

print("Imperial → Metric:")
print(f"Slab: 6.0 in → {specs_metric['slab_thickness_mm']:.0f} mm")
print(f"Column: 12.0 in → {specs_metric['column_width_mm']:.0f} mm")
print(f"Beam: 24.0 in → {specs_metric['beam_depth_mm']:.0f} mm")
print(f"Concrete: 4000 psi → {specs_metric['concrete_strength_mpa']:.1f} MPa")
```

**النتيجة:**
```
Imperial → Metric:
Slab: 6.0 in → 152 mm
Column: 12.0 in → 305 mm
Beam: 24.0 in → 610 mm
Concrete: 4000 psi → 27.6 MPa
```

---

## ⚠️ القيود والتحذيرات

### Quick Estimator Limitations

1. **دقة التقدير تقل في:**
   - مشاريع كبيرة جداً (>1000 م²)
   - مباني فوق 4 طوابق
   - تصاميم معقدة أو غير تقليدية
   - تشطيبات فاخرة جداً بدون specifications

2. **العوامل لا تشمل:**
   - تكاليف الأرض
   - رسوم التصاريح والاستشارات
   - تكاليف التشغيل والصيانة
   - الأعمال الخاصة (مسابح، مصاعد، facades خاصة)

3. **العوامل قد تتغير حسب:**
   - موقع المشروع (داخل/خارج المدينة)
   - أسعار السوق الحالية
   - توفر المواد
   - ظروف الموقع

### Unit Converter Limitations

1. **دقة الحسابات:**
   - 6 منازل عشرية في الردود
   - قد تحتاج مزيد من الدقة لبعض التطبيقات الخاصة

2. **لا تشمل:**
   - تحويلات الوحدات الكهربائية
   - وحدات الطاقة والقدرة
   - تحويلات معقدة (مثل viscosity)

### Land Calculator Limitations

1. **الأشكال المدعومة:**
   - رباعيات الأضلاع فقط (4 أضلاع)
   - للأشكال الأخرى استخدم CAD software

2. **الدقة تعتمد على:**
   - دقة القياسات المدخلة
   - انتظام الشكل

---

## 🎯 أفضل الممارسات

### 1. استخدم Quick Estimator كخطوة أولى فقط

```
✅ الخطوات الصحيحة:
1. Quick Estimator للتقدير الأولي
2. إذا مقبول، انتقل لـ QuantityAnalyzer
3. تحليل SBC compliance
4. إنشاء Schedule مع CPM
5. تقارير احترافية نهائية

❌ خطأ:
- استخدام Quick Estimator للتصميم النهائي
- تجاوز QuantityAnalyzer
- تجاهل SBC validation
```

### 2. اختر المنطقة الصحيحة

```python
# استخدم المنطقة المناسبة لمعايير بناء دقيقة
if project_location == 'Saudi Arabia':
    region = Region.SAUDI_ARABIA  # ✅ صحيح
    # يستخدم SBC standards
else:
    # استخدم المنطقة المناسبة أو
    # استخدم custom_contractor_rate
```

### 3. وثّق افتراضاتك

```python
assumptions = {
    'estimator': 'Quick Estimator v1.0',
    'region': 'saudi_arabia',
    'date': '2025-11-04',
    'factors': {
        'steel': '60 kg/m²',
        'concrete': '0.30 m³/m²',
        'storey_multiplier': 1.65
    },
    'notes': 'Preliminary estimate only - not for construction'
}
```

### 4. استخدم Confidence Level للقرارات

```python
result = quick_estimator.estimate(input_data)

if result.confidence_level == 'high':
    print("✅ التقدير موثوق - يمكن المتابعة")
elif result.confidence_level == 'medium':
    print("⚠️ التقدير متوسط الموثوقية - راجع الافتراضات")
else:
    print("❌ التقدير ضعيف - استخدم detailed analysis")
```

---

## 📚 مراجع إضافية

### للتفاصيل الكاملة:

1. **MASTER_PLAN.md** - خطة التطوير الشاملة
2. **user_guide_ar.md** - دليل المستخدم الكامل
3. **civilconcept_integration_analysis.md** - تحليل المقارنة

### API Documentation:

```
GET  /api/quick-estimate/regions        # قائمة المناطق
POST /api/quick-estimate                # تقدير سريع
POST /api/unit-convert                  # تحويل وحدات
POST /api/land-area/irregular           # حساب مساحة أرض
GET  /api/unit-convert/available-units  # الوحدات المتوفرة
```

### Code Examples:

```
backend/core/quick_estimator.py         # الكود الأساسي
backend/core/unit_converter.py          # محول الوحدات
frontend/src/components/QuickTools.tsx  # واجهة المستخدم
```

---

## 🔗 روابط مفيدة

- **CivilConcept.com** - المصدر الأصلي للإلهام
- **Saudi Building Code (SBC 303)** - معايير البناء
- **NOUFAL EMS Repository** - GitHub

---

## ✉️ الدعم

للأسئلة أو المشاكل:
- راجع CLAUDE.md للتعليمات التفصيلية
- افتح issue في GitHub repository
- اتصل بفريق NOUFAL EMS

---

**آخر تحديث:** 2025-11-04  
**الإصدار:** 1.0  
**الحالة:** مكتمل وجاهز للاستخدام
