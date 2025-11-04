# مخطط وحدات التكامل (Integration Scripts Outline)

هذا المخطط يوضح كيفية استخدام المكتبات البرمجية (المرحلة 1) لربط البيانات بين الأدوات الهندسية (المرحلة 1) وفقاً لهيكل المشروع الموحد (المرحلة 2). سيتم تقسيم العمل إلى ثلاث وحدات برمجية رئيسية (Scripts) في مجلد `/02_Processing/Scripts`.

## 1. وحدة تحليل الكميات (quantity_analysis.py)

**الهدف:** أتمتة استخلاص وتحليل الكميات من جداول الكميات الأولية (BOQ) الناتجة عن AutoCAD/LISP.

| الرقم التسلسلي | الوظيفة | المكتبات المستخدمة | المدخلات (المسار) | المخرجات (المسار) |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **قراءة البيانات** | Pandas, Openpyxl | `/01_Input_Data/03_Cost/BOQ_Initial.xlsx` | DataFrame (Pandas) |
| 2 | **تنظيف البيانات** | Pandas | DataFrame | DataFrame (بيانات نظيفة) |
| 3 | **حساب الكميات** | Pandas, NumPy | DataFrame | DataFrame (مع حقول الكمية النهائية m³/m²) |
| 4 | **توليد تقرير الكميات** | python-docx | DataFrame | `/03_Output_Data/01_Quantities/Final_BOQ.xlsx` |
| 5 | **التكامل مع CAD** | ezdxf (اختياري) | `/01_Input_Data/01_CAD/Drawings/*.dxf` | استخراج بيانات الطبقات للمقارنة مع جداول الكميات. |

**ملاحظة:** سيتم تطبيق قواعد حساب الكميات الهندسية (مثل قواعد الحساب بالمتر المكعب أو المربع) داخل هذه الوحدة.

## 2. وحدة تحليل الجدول الزمني (schedule_analysis.py)

**الهدف:** تحليل تقدم المشروع، تحديد المسار الحرج، وتوليد منحنيات S-Curve.

| الرقم التسلسلي | الوظيفة | المكتبات المستخدمة | المدخلات (المسار) | المخرجات (المسار) |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **قراءة بيانات الجدول** | Pandas | `/01_Input_Data/02_Schedule/P6_Export/*.xml` | DataFrame (بيانات الجدول المخطط) |
| 2 | **قراءة بيانات التقدم** | Pandas | `/01_Input_Data/04_Site_Data/Daily_Reports/*.csv` | DataFrame (بيانات التقدم الفعلي) |
| 3 | **حساب التقدم** | Pandas | DataFrame (المخطط والفعلي) | DataFrame (نسب التقدم، الانحرافات) |
| 4 | **توليد منحنى S-Curve** | Matplotlib | DataFrame (التقدم) | `/03_Output_Data/03_Visuals/S_Curves/S_Curve_YYYYMMDD.png` |
| 5 | **تحليل المسار الحرج** | Pandas | DataFrame (الجدول) | DataFrame (الأنشطة الحرجة) |

## 3. وحدة توليد التقارير الذكية (smart_reports_generator.py)

**الهدف:** تجميع مخرجات الوحدات الأخرى في تقرير نهائي موحد ومنسق.

| الرقم التسلسلي | الوظيفة | المكتبات المستخدمة | المدخلات (المسار) | المخرجات (المسار) |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **تجميع البيانات** | Pandas | مخرجات `quantity_analysis.py` و `schedule_analysis.py` | تجميع البيانات في كائن واحد |
| 2 | **توليد النص التحليلي** | (AI Model - خارج نطاق المكتبات البرمجية المباشرة) | البيانات المجمعة | نص تحليلي باللغة العربية |
| 3 | **تنسيق التقرير** | python-docx | النص التحليلي، الرسوم البيانية (S-Curve) | `/03_Output_Data/02_Reports/Smart_Reports/Smart_Report_YYYYMMDD.docx` |
| 4 | **توليد PDF** | python-docx (أو أداة تحويل خارجية) | ملف DOCX | `/03_Output_Data/02_Reports/Smart_Reports/Smart_Report_YYYYMMDD.pdf` |

**التكامل الشامل:**

يتمثل التكامل في أن كل وحدة تعتمد على مخرجات الوحدة التي تسبقها، مما يخلق سير عمل متسلسل ومنطقي:

$$\text{Input Data} \xrightarrow{\text{quantity\_analysis.py}} \text{Quantities} \xrightarrow{\text{schedule\_analysis.py}} \text{Progress Analysis} \xrightarrow{\text{smart\_reports\_generator.py}} \text{Final Report}$$
