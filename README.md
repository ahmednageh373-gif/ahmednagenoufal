# 🏗️ Construction Scheduling System | نظام الجدولة الإنشائي

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)

**نظام متكامل لتحويل بنود المقايسة إلى جدول زمني احترافي باستخدام CPM**

[English](#english) | [العربية](#arabic)

</div>

---

<a name="arabic"></a>
## 🇸🇦 النسخة العربية

### 📋 نظرة عامة

نظام شامل يحول **بنود المقايسة (BOQ)** إلى **جدول زمني تفصيلي** مع:
- ✅ محرك المسار الحرج (CPM) كامل
- ✅ موازنة الموارد (Resource Leveling)
- ✅ تصدير متعدد (Excel, Primavera XER, JSON)
- ✅ REST API جاهز للاستخدام
- ✅ تطبيق الخطوات العشرة للجدولة

### 🎯 الميزات الرئيسية

#### 1️⃣ **تفكيك تلقائي للمقايسة**
```python
# تحويل بند مقايسة إلى 11 نشاط فرعي تلقائياً
from backend.data.activity_breakdown_rules import CONCRETE_SLAB_100M3

print(f"عدد الأنشطة: {len(CONCRETE_SLAB_100M3.sub_activities)}")
# Output: عدد الأنشطة: 11
```

#### 2️⃣ **محرك CPM المتقدم**
- حساب Early Start/Finish
- حساب Late Start/Finish
- استخراج المسار الحرج تلقائياً
- دعم جميع أنواع الروابط (FS, SS, FF, SF)

#### 3️⃣ **موازنة الموارد**
```python
# كشف الذروات وتوزيع العمالة
leveler = ResourceLeveler(cpm, site_capacity)
histogram = leveler.analyze_original()

print(f"الذروة: {histogram.peak_workers} عامل")
print(f"المتوسط: {histogram.average_workers:.1f} عامل")
print(f"متوازن: {histogram.is_balanced()}")
```

#### 4️⃣ **تصدير متعدد التنسيقات**
| التنسيق | الاستخدام | الميزات |
|---------|----------|---------|
| **Excel** | مراجعة وتعديل | 4 أوراق، ألوان، تنسيق احترافي |
| **Primavera XER** | استيراد في P6 | متوافق مع Primavera |
| **JSON** | تكامل API | بيانات منظمة |
| **Text** | طباعة وتوثيق | تقرير نصي كامل |

### 🚀 بداية سريعة

#### التثبيت
```bash
git clone https://github.com/ahmednageh373-gif/ahmednagenoufal.git
cd ahmednagenoufal
pip install -r requirements.txt
```

#### الاستخدام الأساسي
```python
from datetime import datetime
from backend.data.activity_breakdown_rules import CONCRETE_SLAB_100M3
from backend.scheduling.cpm_engine import build_schedule_from_boq
from backend.scheduling.primavera_exporter import PrimaveraExporter

# 1. بناء الجدول
cpm = build_schedule_from_boq(
    boq_breakdown=CONCRETE_SLAB_100M3,
    project_start_date=datetime(2025, 1, 1),
    shifts=1
)

# 2. عرض النتائج
cpm.print_schedule()

# 3. التصدير
exporter = PrimaveraExporter(cpm, "مشروع سكني")
exporter.export_excel("schedule.xlsx")
exporter.export_xer("schedule.xer")
```

#### استخدام REST API
```bash
# تشغيل السيرفر
uvicorn backend.api.schedule_api:router --reload

# توليد جدول زمني
curl -X POST http://localhost:8000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -d '{
    "boq_code": "CONC-SLAB-001",
    "project_name": "مشروع مكتبي",
    "project_start_date": "2025-01-01",
    "shifts": 1,
    "max_workers": 50
  }'
```

### 📊 نتائج الاختبار

**مثال: خرسانة بلاطة 100 م³**

```
✅ المدة الإجمالية: 31.3 يوم (4.5 أسبوع)
✅ تاريخ الانتهاء: 2025-02-06
✅ الأنشطة الحرجة: 8/11 (72.7%)
✅ ذروة العمالة: 9 عامل
✅ متوسط العمالة: 3.7 عامل
```

### 📂 هيكل المشروع

```
backend/
├── data/
│   ├── activity_breakdown_rules.py    # قواعد تفكيك المقايسة (35+ نشاط)
│   └── schedules/                     # ملفات التصدير
├── scheduling/
│   ├── cpm_engine.py                  # محرك المسار الحرج
│   ├── resource_leveling.py           # موازنة الموارد
│   └── primavera_exporter.py          # التصدير (Excel/XER/JSON)
└── api/
    └── schedule_api.py                 # REST API (5 endpoints)
```

### 📘 التوثيق الكامل

| الملف | الوصف | الحجم |
|------|-------|------|
| [SCHEDULE_SYSTEM_GUIDE.md](SCHEDULE_SYSTEM_GUIDE.md) | دليل النظام الشامل (عربي) | 12.3 KB |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | توثيق REST API (إنجليزي) | 12.3 KB |
| [10_STEPS_IMPLEMENTATION_GUIDE.md](10_STEPS_IMPLEMENTATION_GUIDE.md) | تطبيق الخطوات العشرة | 18.6 KB |

### 🎓 الخطوات العشرة للجدولة

النظام يطبق جميع الخطوات تلقائياً:

| # | الخطوة | التطبيق | ✅ |
|---|--------|---------|---|
| 1 | استخراج الكمية | `BOQBreakdown` | ✅ |
| 2 | معدل الإنتاجية | `ProductivityRate` | ✅ |
| 3 | حساب المدة | `calculate_duration()` | ✅ |
| 4 | طاقم العمل | `CrewComposition` | ✅ |
| 5 | الورديات | `shift_factor` | ✅ |
| 6 | العلاقات المنطقية | `LogicLink` | ✅ |
| 7 | المسار الحرج | `CPMEngine` | ✅ |
| 8 | احتياطي الزمن | `get_risk_buffer()` | ✅ |
| 9 | موازنة الموارد | `ResourceLeveler` | ✅ |
| 10 | الميلستونات | `PrimaveraExporter` | ✅ |

### 🔧 المتطلبات

```txt
python >= 3.11
fastapi >= 0.100.0
pydantic >= 2.0.0
openpyxl >= 3.1.0
uvicorn >= 0.23.0
```

### 📦 بنود المقايسة المتاحة

| الكود | الوصف | الأنشطة | الفئة |
|------|-------|---------|-------|
| CONC-SLAB-001 | خرسانة بلاطة 100 م³ | 11 | Concrete Works |
| PLAST-001 | لياسة جدران 200 م² | 8 | Finishing |
| TILE-001 | بلاط بورسلان 1,200 م² | 7 | Finishing |
| FENCE-001 | سور شبك معدني 100 م | 9 | External Works |

### 🤝 المساهمة

نرحب بمساهماتكم! يرجى:
1. Fork المستودع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

### 📝 الترخيص

هذا المشروع مرخص تحت MIT License - انظر ملف [LICENSE](LICENSE) للتفاصيل.

### 📧 التواصل

- **المطور**: Ahmed Nageh
- **GitHub**: [@ahmednageh373-gif](https://github.com/ahmednageh373-gif)
- **المستودع**: [ahmednagenoufal](https://github.com/ahmednageh373-gif/ahmednagenoufal)

### 🌟 إذا أعجبك المشروع، لا تنسى النجمة ⭐

---

<a name="english"></a>
## 🇬🇧 English Version

### 📋 Overview

A comprehensive system that converts **Bill of Quantities (BOQ)** into detailed **project schedules** with:
- ✅ Full CPM (Critical Path Method) engine
- ✅ Resource Leveling & Histogram
- ✅ Multi-format export (Excel, Primavera XER, JSON)
- ✅ Production-ready REST API
- ✅ 10-step scheduling workflow implementation

### 🎯 Key Features

#### 1️⃣ **Automatic BOQ Breakdown**
Converts single BOQ item into 11+ sub-activities automatically with:
- Productivity rates
- Crew compositions
- Logic relationships (FS/SS/FF/SF)
- Risk buffers

#### 2️⃣ **Advanced CPM Engine**
- Forward/Backward pass calculations
- Early Start/Finish & Late Start/Finish
- Total Float & Free Float
- Automatic critical path extraction
- All logic types supported (FS, SS, FF, SF with lag)

#### 3️⃣ **Resource Leveling**
- Daily workforce histogram
- Peak detection (target ≤ 120% of average)
- Site capacity validation
- Shift optimization suggestions

#### 4️⃣ **Multi-Format Export**
- **Excel**: 4 formatted sheets (Schedule, Critical Path, Logic, Summary)
- **Primavera XER**: For P6 import
- **JSON**: For API integration
- **Text Report**: For documentation

### 🚀 Quick Start

#### Installation
```bash
git clone https://github.com/ahmednageh373-gif/ahmednagenoufal.git
cd ahmednagenoufal
pip install -r requirements.txt
```

#### Basic Usage
```python
from datetime import datetime
from backend.data.activity_breakdown_rules import CONCRETE_SLAB_100M3
from backend.scheduling.cpm_engine import build_schedule_from_boq
from backend.scheduling.primavera_exporter import PrimaveraExporter

# Build schedule
cpm = build_schedule_from_boq(
    boq_breakdown=CONCRETE_SLAB_100M3,
    project_start_date=datetime(2025, 1, 1),
    shifts=1
)

# Display results
cpm.print_schedule()

# Export
exporter = PrimaveraExporter(cpm, "Residential Project")
exporter.export_excel("schedule.xlsx")
exporter.export_xer("schedule.xer")
```

#### REST API
```bash
# Start server
uvicorn backend.api.schedule_api:router --reload

# Generate schedule
curl -X POST http://localhost:8000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -d '{
    "boq_code": "CONC-SLAB-001",
    "project_name": "Office Building",
    "project_start_date": "2025-01-01",
    "shifts": 1,
    "max_workers": 50
  }'
```

### 📊 Test Results

**Example: 100m³ Concrete Slab**

```
✅ Total Duration: 31.3 days (4.5 weeks)
✅ Completion Date: 2025-02-06
✅ Critical Activities: 8/11 (72.7%)
✅ Peak Workers: 9
✅ Average Workers: 3.7
```

### 📂 Project Structure

```
backend/
├── data/
│   ├── activity_breakdown_rules.py    # BOQ breakdown rules (35+ activities)
│   └── schedules/                     # Export files
├── scheduling/
│   ├── cpm_engine.py                  # CPM engine
│   ├── resource_leveling.py           # Resource leveling
│   └── primavera_exporter.py          # Multi-format export
└── api/
    └── schedule_api.py                 # REST API (5 endpoints)
```

### 📘 Documentation

| File | Description | Size |
|------|-------------|------|
| [SCHEDULE_SYSTEM_GUIDE.md](SCHEDULE_SYSTEM_GUIDE.md) | Complete system guide (Arabic) | 12.3 KB |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | REST API documentation (English) | 12.3 KB |
| [10_STEPS_IMPLEMENTATION_GUIDE.md](10_STEPS_IMPLEMENTATION_GUIDE.md) | 10-step workflow guide (Arabic) | 18.6 KB |

### 🔧 Requirements

```txt
python >= 3.11
fastapi >= 0.100.0
pydantic >= 2.0.0
openpyxl >= 3.1.0
uvicorn >= 0.23.0
```

### 📦 Available BOQ Items

| Code | Description | Activities | Category |
|------|-------------|------------|----------|
| CONC-SLAB-001 | 100m³ Concrete Slab | 11 | Concrete Works |
| PLAST-001 | 200m² Wall Plastering | 8 | Finishing |
| TILE-001 | 1,200m² Porcelain Tiles | 7 | Finishing |
| FENCE-001 | 100m Chain Link Fence | 9 | External Works |

### 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 📧 Contact

- **Developer**: Ahmed Nageh
- **GitHub**: [@ahmednageh373-gif](https://github.com/ahmednageh373-gif)
- **Repository**: [ahmednagenoufal](https://github.com/ahmednageh373-gif/ahmednagenoufal)

### 🌟 If you like this project, don't forget to give it a star ⭐

---

<div align="center">

**Built with ❤️ for the Construction Industry**

![Construction](https://img.shields.io/badge/Industry-Construction-orange.svg)
![Scheduling](https://img.shields.io/badge/Type-Scheduling-blue.svg)
![CPM](https://img.shields.io/badge/Method-CPM-green.svg)

</div>
