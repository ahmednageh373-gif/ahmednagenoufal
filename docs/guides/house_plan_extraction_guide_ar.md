# 🏠 دليل استخراج المخططات المنزلية

## نظرة عامة

نظام استخراج البيانات من المخططات المنزلية يسمح لك باستخراج البيانات الإنشائية تلقائياً من مواقع مثل CivilConcept.com وإنشاء تقديرات تكلفة فورية + BOQ أولي.

### الميزات الرئيسية

✅ **Web Scraping تلقائي** - استخراج البيانات من HTML tables  
✅ **تكامل مع Quick Estimator** - تقدير تكلفة فوري من المخطط  
✅ **تحويل وحدات ذكي** - تحويل تلقائي بين ft و m  
✅ **إنشاء BOQ أولي** - قائمة كميات أولية من المخطط  
✅ **مقارنة المخططات** - مقارنة بين مخططين مع التقديرات  
✅ **تحليل الغرف** - تحليل تفصيلي لجميع الغرف  

---

## 📦 البيانات المستخرجة

### 1. بيانات الأرض - Land Data
```python
{
  "total_area": {"value": 1188, "unit": "sq ft", "alternate": "110.4 sq m"},
  "width": {"value": 27, "unit": "ft", "alternate": "8.2 m"},
  "length": {"value": 44, "unit": "ft", "alternate": "13.4 m"},
  "shape": "rectangular"
}
```

### 2. بيانات المبنى - Building Data
```python
{
  "width": {"value": 27, "unit": "ft"},
  "length": {"value": 44, "unit": "ft"},
  "building_type": "residential",
  "design_style": "modern"
}
```

### 3. بيانات الغرف - Rooms Data
```python
[
  {
    "name": "Bed Room 1",
    "type": "bedroom",
    "dimensions": {"length": 12, "width": 10, "unit": "ft"},
    "area": {"value": 120, "unit": "sq ft"}
  },
  ...
]
```

### 4. البيانات الإنشائية - Structure Data
```python
{
  "columns": {"count": 24, "spacing": 10},
  "concrete": {"grade": "M20", "type": "RCC"},
  "rebar": {"grade": "Fe 500", "diameter": 16},
  "beams": ["Beam1: 9x12 in", "Beam2: 9x9 in"]
}
```

---

## 🔧 API Endpoints

### 1. استخراج مخطط واحد

```bash
POST /api/house-plan/scrape
```

**Request:**
```json
{
  "url": "https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/"
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "plan_id": "3bhk_house_plan_27x44_feet_home_plan",
    "title": "3BHK House Plan 27×44 Feet Home Plan",
    "url": "...",
    "bhk": 3,
    "square_feet": 1188,
    "land": { ... },
    "building": { ... },
    "rooms": [ ... ],
    "structure": { ... },
    "confidence": 0.85,
    "extracted_at": "2025-11-04T12:00:00Z"
  }
}
```

### 2. استخراج قائمة المخططات

```bash
POST /api/house-plan/scrape-list
```

**Request:**
```json
{
  "url": "https://www.civilconcept.com/house-plan/",
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "urls": [
    "https://www.civilconcept.com/3bhk-house-plan-...",
    "https://www.civilconcept.com/2bhk-house-plan-...",
    ...
  ]
}
```

### 3. تقدير تلقائي من مخطط

```bash
POST /api/house-plan/estimate
```

**Request:**
```json
{
  "url": "https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/",
  "region": "saudi_arabia",
  "finish_level": "standard",
  "custom_contractor_rate": null
}
```

**Response:**
```json
{
  "success": true,
  "estimate": {
    "plan_title": "3BHK House Plan 27×44 Feet",
    "land_area_sqm": 110.4,
    "building_area_sqm": 91.5,
    "room_count": 8,
    "bhk": 3,
    "quick_estimate": {
      "costs": {
        "total_estimated_cost": 732000,
        "cost_per_sqm": 8000,
        "structure_cost": 320000,
        "finishing_cost": 240000,
        "mep_cost": 172000
      },
      "materials": {
        "steel_kg": 5490,
        "concrete_m3": 27.5,
        "blocks_nos": 1144,
        "cement_bags_50kg": 458
      },
      "currency": "SAR",
      "confidence_level": "high"
    },
    "room_breakdown": [ ... ],
    "confidence": 0.85,
    "notes": [
      "✅ Plan extracted with 85% confidence",
      "📊 Cost estimate: HIGH confidence",
      "🏠 8 rooms identified"
    ]
  }
}
```

### 4. إنشاء BOQ من مخطط

```bash
POST /api/house-plan/generate-boq
```

**Request:**
```json
{
  "url": "https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/"
}
```

**Response:**
```json
{
  "success": true,
  "boq": {
    "plan_id": "3bhk_house_plan_27x44_feet_home_plan",
    "plan_title": "3BHK House Plan 27×44 Feet",
    "boq_items": [
      {
        "item_no": "01-001",
        "description": "Excavation for foundations",
        "unit": "m³",
        "quantity": 54.9,
        "category": "Earthwork"
      },
      {
        "item_no": "02-001",
        "description": "Reinforced concrete - M20",
        "unit": "m³",
        "quantity": 27.5,
        "category": "Concrete Work"
      },
      ...
    ],
    "total_items": 15,
    "notes": [
      "⚠️ This is a preliminary BOQ generated from plan data",
      "⚠️ Use QuantityAnalyzer for detailed BOQ with SBC compliance"
    ]
  }
}
```

### 5. مقارنة مخططين

```bash
POST /api/house-plan/compare
```

**Request:**
```json
{
  "url1": "https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/",
  "url2": "https://www.civilconcept.com/900-sq-ft-house-plans-29x35-feet-home-plan/",
  "region": "saudi_arabia"
}
```

**Response:**
```json
{
  "success": true,
  "comparison": {
    "basic_comparison": {
      "land_area_difference": {
        "plan1": 1188,
        "plan2": 900,
        "difference": 288,
        "percentage_difference": 24.24
      },
      "room_count": {
        "plan1": 8,
        "plan2": 6
      }
    },
    "cost_comparison": {
      "plan1_total_cost": 732000,
      "plan2_total_cost": 564000,
      "cost_difference": 168000,
      "cheaper_plan": "900 Sq Ft House Plan"
    },
    "materials_comparison": {
      "steel": {
        "plan1": 5490,
        "plan2": 4200,
        "difference": 1290
      },
      "concrete": {
        "plan1": 27.5,
        "plan2": 21.0,
        "difference": 6.5
      }
    }
  }
}
```

---

## 💻 Python Usage Examples

### مثال 1: استخراج مخطط واحد

```python
from core.house_plan_extractor import HousePlanScraper

# استخراج المخطط
url = 'https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/'
plan = HousePlanScraper.scrape_plan(url)

print(f"Title: {plan.title}")
print(f"BHK: {plan.bhk}")
print(f"Land Area: {plan.land.total_area['value']} {plan.land.total_area['unit']}")
print(f"Rooms: {len(plan.rooms)}")
print(f"Confidence: {plan.confidence:.0%}")
```

**النتيجة:**
```
Title: 3BHK House Plan 27×44 Feet Home Plan
BHK: 3
Land Area: 1188 sq ft
Rooms: 8
Confidence: 85%
```

### مثال 2: تقدير تلقائي

```python
from core.house_plan_integrator import HousePlanIntegrator
from core.quick_estimator import Region, FinishLevel

# استخراج المخطط
plan = HousePlanScraper.scrape_plan(url)

# إنشاء تقدير
integrator = HousePlanIntegrator()
estimate = integrator.generate_estimate_from_plan(
    plan,
    region=Region.SAUDI_ARABIA,
    finish_level=FinishLevel.STANDARD
)

print(f"Total Cost: {estimate.quick_estimate['costs']['total_estimated_cost']:,.0f} SAR")
print(f"Building Area: {estimate.building_area_sqm:.1f} m²")
print(f"Cost per m²: {estimate.quick_estimate['costs']['cost_per_sqm']:,.0f} SAR")
```

**النتيجة:**
```
Total Cost: 732,000 SAR
Building Area: 91.5 m²
Cost per m²: 8,000 SAR
```

### مثال 3: إنشاء BOQ

```python
# إنشاء BOQ أولي
boq = integrator.generate_boq_from_plan(plan)

print(f"BOQ Items: {boq['total_items']}")
for item in boq['boq_items'][:5]:  # أول 5 بنود
    print(f"{item['item_no']}: {item['description']} - {item['quantity']} {item['unit']}")
```

**النتيجة:**
```
BOQ Items: 15
01-001: Excavation for foundations - 54.9 m³
02-001: Reinforced concrete - M20 - 27.5 m³
02-002: Reinforcement steel - Fe 500 - 5490 kg
03-001: Concrete blocks 20cm - 1144 nos
04-001: Cement bags 50kg - 458 bags
```

### مثال 4: مقارنة مخططين

```python
# استخراج مخططين
plan1 = HousePlanScraper.scrape_plan(url1)
plan2 = HousePlanScraper.scrape_plan(url2)

# مقارنة
comparison = integrator.compare_plans_with_estimates(plan1, plan2)

print("Cost Comparison:")
print(f"Plan 1: {comparison['cost_comparison']['plan1_total_cost']:,.0f} SAR")
print(f"Plan 2: {comparison['cost_comparison']['plan2_total_cost']:,.0f} SAR")
print(f"Difference: {comparison['cost_comparison']['cost_difference']:,.0f} SAR")
print(f"Cheaper: {comparison['cost_comparison']['cheaper_plan']}")
```

---

## 🎯 حالات الاستخدام

### 1. دراسة جدوى سريعة

```python
# استخراج + تقدير
plan = HousePlanScraper.scrape_plan(url)
estimate = integrator.generate_estimate_from_plan(plan)

# عرض ملخص
print(f"📊 Feasibility Study")
print(f"Land: {estimate.land_area_sqm:.1f} m²")
print(f"Building: {estimate.building_area_sqm:.1f} m²")
print(f"Total Cost: {estimate.quick_estimate['costs']['total_estimated_cost']:,.0f} SAR")
print(f"Cost/m²: {estimate.quick_estimate['costs']['cost_per_sqm']:,.0f} SAR/m²")

if estimate.confidence > 0.8:
    print("✅ High confidence - proceed with detailed analysis")
else:
    print("⚠️ Low confidence - manual verification recommended")
```

### 2. اختيار أفضل مخطط

```python
# قائمة المخططات المحتملة
urls = [
    'https://www.civilconcept.com/3bhk-house-plan-27x44-feet/',
    'https://www.civilconcept.com/900-sq-ft-house-plans-29x35-feet/',
    'https://www.civilconcept.com/2bhk-house-plan-30x40-feet/'
]

# استخراج وتقدير جميع المخططات
estimates = []
for url in urls:
    plan = HousePlanScraper.scrape_plan(url)
    if plan:
        estimate = integrator.generate_estimate_from_plan(plan)
        estimates.append(estimate)

# إيجاد الأرخص
cheapest = min(estimates, key=lambda e: e.quick_estimate['costs']['total_estimated_cost'])
print(f"Best Option: {cheapest.plan_title}")
print(f"Cost: {cheapest.quick_estimate['costs']['total_estimated_cost']:,.0f} SAR")
```

### 3. إنشاء BOQ للمقاول

```python
# استخراج + BOQ
plan = HousePlanScraper.scrape_plan(url)
boq = integrator.generate_boq_from_plan(plan)

# حفظ كـ JSON
import json
with open('preliminary_boq.json', 'w') as f:
    json.dump(boq, f, indent=2)

print(f"✅ BOQ saved with {boq['total_items']} items")
```

---

## ⚠️ القيود والتحذيرات

### 1. دقة الاستخراج

- **High Confidence (>80%)**: بيانات كاملة، يمكن الاعتماد عليها
- **Medium Confidence (60-80%)**: بيانات ناقصة، تحتاج مراجعة
- **Low Confidence (<60%)**: بيانات غير كاملة، تحتاج استخراج يدوي

### 2. المواقع المدعومة

حالياً:
- ✅ CivilConcept.com
- ⚠️ مواقع أخرى تحتاج تعديل selectors

### 3. التقدير الأولي فقط

```
⚠️ هذا التقدير للدراسة الأولية فقط!

للتفصيل الكامل:
→ استخدم QuantityAnalyzer (BOQ تفصيلي)
→ استخدم SBCComplianceChecker (التحقق من SBC)
→ استخدم ScheduleAnalyzer (CPM + EVM)
```

---

## 🔗 التكامل مع الأنظمة الأخرى

### مع Quick Estimator

```python
# المخطط → التقدير السريع
plan = HousePlanScraper.scrape_plan(url)
estimate = integrator.generate_estimate_from_plan(plan)
# estimate يحتوي على quick_estimate بالكامل
```

### مع Unit Converter

```python
from core.unit_converter import UnitConverter, LengthUnit, AreaUnit

# تحويل أبعاد المخطط
width_ft = plan.building.width['value']
width_m = UnitConverter.convert_length(width_ft, LengthUnit.FOOT, LengthUnit.METER)

area_sqft = plan.land.total_area['value']
area_sqm = UnitConverter.convert_area(area_sqft, AreaUnit.SQUARE_FOOT, AreaUnit.SQUARE_METER)
```

### مع QuantityAnalyzer (للمستقبل)

```python
# المخطط → BOQ أولي → BOQ تفصيلي
preliminary_boq = integrator.generate_boq_from_plan(plan)

# TODO: تحويل إلى Excel BOQ format
# من ثم استخدام QuantityAnalyzer للتحليل التفصيلي
```

---

## 📚 مراجع إضافية

- **house_plan_extractor.py** - الكود الأساسي للاستخراج
- **house_plan_integrator.py** - التكامل مع Quick Estimator
- **quick_tools_guide_ar.md** - دليل Quick Estimator
- **civilconcept_integration_analysis.md** - تحليل التكامل

---

## ✉️ الدعم

للمساعدة:
- راجع أمثلة الاستخدام أعلاه
- افتح issue في GitHub
- اتصل بفريق NOUFAL EMS

---

**آخر تحديث:** 2025-11-04  
**الإصدار:** 1.0  
**الحالة:** مكتمل وجاهز للاستخدام
