var B=Object.defineProperty,W=Object.defineProperties;var Y=Object.getOwnPropertyDescriptors;var w=Object.getOwnPropertySymbols;var G=Object.prototype.hasOwnProperty,U=Object.prototype.propertyIsEnumerable;var E=(m,i,o)=>i in m?B(m,i,{enumerable:!0,configurable:!0,writable:!0,value:o}):m[i]=o,A=(m,i)=>{for(var o in i||(i={}))G.call(i,o)&&E(m,o,i[o]);if(w)for(var o of w(i))U.call(i,o)&&E(m,o,i[o]);return m},S=(m,i)=>W(m,Y(i));import{r as d,j as e}from"./react-vendor-ITqvX6Xp.js";import{ac as y,aY as V,aI as D,j as Q,a2 as K,aZ as L,ah as z,X as Z,a_ as X,a$ as $,a7 as J,aC as _,aF as ee,F as te}from"./icons-lib-Bt_-gcnY.js";import"./vendor-8CkhJSGZ.js";const P=[{id:"autocad-complete",titleAr:"دورة AutoCAD الشاملة",titleEn:"Complete AutoCAD Course",category:"AutoCAD",difficulty:"beginner",estimatedHours:40,topics:["الأوامر الأساسية","الرسم ثنائي الأبعاد","التعديل والتحرير","الطباعة","المشاريع العملية"],description:"دورة شاملة في AutoCAD من البداية حتى الاحتراف، تشمل جميع الأوامر والتطبيقات العملية",featured:!0,order:1,documents:[{id:"autocad-training-1",title:"AutoCAD Training Guide",titleAr:"دليل تدريب AutoCAD",type:"markdown",category:"AutoCAD",difficulty:"beginner",description:"Comprehensive AutoCAD training covering all basic and advanced commands",descriptionAr:"دليل تدريبي شامل في AutoCAD يغطي جميع الأوامر الأساسية والمتقدمة",content:`# دليل تدريب AutoCAD الشامل

## المقدمة
AutoCAD هو برنامج التصميم بمساعدة الحاسوب الأكثر استخدامًا في العالم. يستخدم في:
- التصميم المعماري
- التصميم الإنشائي
- التصميم الميكانيكي
- رسم الخرائط

## الوحدة الأولى: الأساسيات

### 1.1 واجهة البرنامج
- شريط الأدوات الرئيسي
- لوحة الأوامر
- منطقة الرسم
- شريط الحالة

### 1.2 الأوامر الأساسية

#### أمر Line (خط)
\`\`\`
Command: LINE
Specify first point: (انقر نقطة البداية)
Specify next point: (انقر نقطة النهاية)
\`\`\`

#### أمر Circle (دائرة)
\`\`\`
Command: CIRCLE
Specify center point: (حدد مركز الدائرة)
Specify radius: (أدخل نصف القطر)
\`\`\`

#### أمر Rectangle (مستطيل)
\`\`\`
Command: RECTANGLE
Specify first corner point: (الزاوية الأولى)
Specify other corner point: (الزاوية المقابلة)
\`\`\`

## الوحدة الثانية: أوامر التعديل

### 2.1 Move (نقل)
\`\`\`
Command: MOVE
Select objects: (اختر الكائنات)
Specify base point: (نقطة الأساس)
Specify second point: (النقطة الجديدة)
\`\`\`

### 2.2 Copy (نسخ)
\`\`\`
Command: COPY
Select objects: (اختر الكائنات)
Specify base point: (نقطة الأساس)
Specify second point: (موقع النسخة)
\`\`\`

### 2.3 Rotate (دوران)
\`\`\`
Command: ROTATE
Select objects: (اختر الكائنات)
Specify base point: (نقطة المحور)
Specify rotation angle: (زاوية الدوران)
\`\`\`

### 2.4 Scale (مقياس)
\`\`\`
Command: SCALE
Select objects: (اختر الكائنات)
Specify base point: (نقطة الأساس)
Specify scale factor: (معامل المقياس)
\`\`\`

## الوحدة الثالثة: الطبقات (Layers)

### 3.1 إنشاء الطبقات
\`\`\`
Command: LAYER
- New Layer (طبقة جديدة)
- اسم الطبقة
- اللون
- نوع الخط
- سمك الخط
\`\`\`

### 3.2 إدارة الطبقات
- تفعيل/إخفاء الطبقات
- قفل/فتح الطبقات
- تجميد/إذابة الطبقات

## الوحدة الرابعة: الأبعاد (Dimensions)

### 4.1 أنواع الأبعاد
- Linear (خطي)
- Angular (زاوي)
- Radial (قطري)
- Diameter (قطر)

### 4.2 إعدادات الأبعاد
\`\`\`
Command: DIMSTYLE
- حجم النص
- نوع الأسهم
- دقة الأرقام
\`\`\`

## الوحدة الخامسة: الطباعة

### 5.1 إعداد الصفحة
\`\`\`
Command: PAGESETUP
- حجم الورق
- اتجاه الطباعة
- مقياس الرسم
\`\`\`

### 5.2 Plot/Print
\`\`\`
Command: PLOT
- اختيار الطابعة
- تحديد منطقة الطباعة
- ضبط المقياس
\`\`\`

## مشاريع عملية

### مشروع 1: رسم مسقط أفقي لشقة
1. رسم الحوائط الخارجية
2. رسم الحوائط الداخلية
3. إضافة الأبواب والشبابيك
4. وضع الأثاث
5. الأبعاد والتوصيفات
6. الطباعة

### مشروع 2: رسم واجهة معمارية
1. رسم خطوط الأساس
2. رسم النوافذ والأبواب
3. إضافة التفاصيل المعمارية
4. التظليل والتلوين
5. النصوص والتوضيحات

## نصائح وحيل

### اختصارات مهمة
- L = Line
- C = Circle
- M = Move
- CO = Copy
- E = Erase
- TR = Trim
- EX = Extend
- O = Offset
- F = Fillet

### إعدادات مهمة
- OSNAP: تفعيل النقاط الدقيقة
- ORTHO: تفعيل الرسم المستقيم
- POLAR: تفعيل التتبع القطبي
- SNAP: تفعيل الشبكة

## الخاتمة
هذا الدليل يغطي الأساسيات والمتوسط في AutoCAD. للتقدم، مارس يوميًا وحل المشاريع العملية.`,uploadDate:"2025-01-15",lastModified:"2025-01-15",tags:["AutoCAD","تدريب","رسم هندسي","CAD"],topics:["واجهة البرنامج","الأوامر الأساسية","أوامر التعديل","الطبقات","الأبعاد","الطباعة"],estimatedHours:20,featured:!0,views:0,downloads:0}]},{id:"structural-analysis",titleAr:"التحليل الإنشائي",titleEn:"Structural Analysis",category:"Structural",difficulty:"intermediate",estimatedHours:30,topics:["تحليل الخزانات","أحمال الرياح","الأحمال الزلزالية","التصميم الإنشائي"],description:"تحليل شامل للعناصر الإنشائية المختلفة وطرق التصميم",featured:!0,order:2,documents:[{id:"tank-analysis",title:"Tank Analysis Guide",titleAr:"دليل تحليل الخزانات",type:"markdown",category:"Structural",difficulty:"advanced",description:"Complete guide for water tank structural analysis and design",descriptionAr:"دليل شامل لتحليل وتصميم الخزانات الإنشائية",content:`# دليل تحليل الخزانات

## مقدمة
تحليل الخزانات من أهم التطبيقات الإنشائية التي تتطلب دقة عالية.

## أنواع الخزانات

### 1. الخزانات الأرضية (Ground Tanks)
- خزانات تحت مستوى الأرض
- خزانات على مستوى الأرض
- الأحمال والضغوط

### 2. الخزانات العلوية (Elevated Tanks)
- تصميم الأعمدة الداعمة
- تحليل الأساسات
- أحمال الرياح

## ضغط الماء

### القانون الأساسي
\`\`\`
P = ρ × g × h

حيث:
P = الضغط (Pa)
ρ = كثافة الماء (1000 kg/m³)
g = عجلة الجاذبية (9.81 m/s²)
h = ارتفاع الماء (m)
\`\`\`

### مثال عملي
لخزان ارتفاعه 4 متر:
\`\`\`
P = 1000 × 9.81 × 4
P = 39,240 Pa = 39.24 kPa
\`\`\`

## التصميم الإنشائي

### جدران الخزان
\`\`\`
سمك الجدار = f(h, P, fc', fy)

- h: ارتفاع الماء
- P: الضغط الجانبي
- fc': مقاومة الخرسانة
- fy: مقاومة الحديد
\`\`\`

### قاعدة الخزان
- حساب الضغط الرأسي
- تصميم التسليح السفلي
- تصميم التسليح العلوي

### سقف الخزان
- الأحمال الميتة
- الأحمال الحية
- أحمال الصيانة

## التفاصيل التنفيذية

### العزل المائي
- نوع العزل
- طريقة التطبيق
- الاختبارات

### الفواصل
- فواصل التمدد
- فواصل الهبوط
- مواد الإيقاف

## الاختبارات

### اختبار التسرب
1. ملء الخزان تدريجيًا
2. المراقبة لمدة 48 ساعة
3. قياس منسوب الماء
4. حساب نسبة التسرب المسموح بها

### معايير القبول
- تسرب أقل من 5% في أول يوم
- تسرب أقل من 2% في اليوم الثاني

## أمثلة عملية

### مثال 1: خزان أرضي 50 م³
- الأبعاد: 5م × 4م × 2.5م
- سمك الجدار: 20 سم
- سمك القاعدة: 25 سم
- التسليح: حسب الحسابات

### مثال 2: خزان علوي 20 م³
- ارتفاع البرج: 15 م
- أبعاد الخزان: 3م × 3م × 2.2م
- قطر الأعمدة: 50 سم
- الأساس: قواعد منفصلة`,uploadDate:"2025-01-15",lastModified:"2025-01-15",tags:["تحليل إنشائي","خزانات","تصميم","ضغط الماء"],topics:["أنواع الخزانات","ضغط الماء","التصميم الإنشائي","التفاصيل التنفيذية","الاختبارات"],estimatedHours:15,featured:!0,views:0,downloads:0},{id:"wind-seismic-loads",title:"Wind and Seismic Loads",titleAr:"أحمال الرياح والزلازل",type:"markdown",category:"Structural",difficulty:"advanced",description:"Understanding and calculating wind and seismic loads",descriptionAr:"فهم وحساب أحمال الرياح والزلازل",content:`# أحمال الرياح والزلازل

## أحمال الرياح (Wind Loads)

### المفاهيم الأساسية
- سرعة الرياح الأساسية (Basic Wind Speed)
- معامل الأهمية (Importance Factor)
- معامل التعرض (Exposure Category)
- ضغط الرياح الديناميكي (Dynamic Pressure)

### الكود المصري
\`\`\`
q = 0.613 × V² × Kz × Kzt × Kd

حيث:
q = ضغط الرياح (N/m²)
V = سرعة الرياح (m/s)
Kz = معامل الارتفاع
Kzt = معامل التضاريس
Kd = معامل الاتجاه
\`\`\`

### مثال عملي
لمبنى ارتفاع 20 متر في القاهرة:
\`\`\`
V = 40 m/s (سرعة الرياح الأساسية)
Kz = 1.0 (عند ارتفاع 20م)
Kzt = 1.0 (تضاريس عادية)
Kd = 0.85 (اتجاه عام)

q = 0.613 × 40² × 1.0 × 1.0 × 0.85
q = 833 N/m²
\`\`\`

## الأحمال الزلزالية (Seismic Loads)

### المناطق الزلزالية في مصر
1. **المنطقة 1**: القاهرة، الإسكندرية (Zone Factor = 0.125)
2. **المنطقة 2**: البحر الأحمر (Zone Factor = 0.25)
3. **المنطقة 3**: خليج العقبة (Zone Factor = 0.3)

### طريقة القوة الجانبية المكافئة

#### القوة القاعدية
\`\`\`
V = Cs × W

حيث:
V = القوة القاعدية الكلية
Cs = معامل الاستجابة الزلزالية
W = الوزن الإجمالي للمبنى
\`\`\`

#### حساب Cs
\`\`\`
Cs = (Z × I × Sa) / R

Z = معامل المنطقة الزلزالية
I = معامل الأهمية
Sa = طيف الاستجابة
R = معامل تعديل الاستجابة
\`\`\`

### مثال عملي: مبنى في القاهرة
\`\`\`
المعطيات:
- الارتفاع: 5 طوابق (15 متر)
- النظام الإنشائي: خرسانة مسلحة
- الاستخدام: سكني
- الوزن الكلي: 5000 kN

الحسابات:
Z = 0.125 (منطقة 1)
I = 1.0 (مبنى عادي)
Sa = 2.5 (من الكود)
R = 5.0 (إطارات خرسانية)

Cs = (0.125 × 1.0 × 2.5) / 5.0 = 0.0625

V = 0.0625 × 5000 = 312.5 kN
\`\`\`

### توزيع القوة على الطوابق
\`\`\`
Fi = (Wi × Hi / Σ(Wi × Hi)) × V

Fi = القوة على الطابق i
Wi = وزن الطابق i
Hi = ارتفاع الطابق i
\`\`\`

## تصميم العناصر الإنشائية

### الأعمدة
- التحقق من الاستقرار
- حساب العزوم الإضافية
- التسليح الطولي والعرضي

### الكمرات
- عزوم الانحناء
- قوى القص
- تفاصيل التسليح

### الحوائط القصية (Shear Walls)
- تحمل الأحمال الجانبية
- التسليح الرأسي والأفقي
- الفتحات والتفاصيل

## أمثلة تطبيقية

### مثال متكامل: مبنى 10 طوابق
\`\`\`
المواصفات:
- الموقع: الإسكندرية
- الارتفاع: 30 متر
- النظام: إطارات + حوائط قصية
- الاستخدام: تجاري

أحمال الرياح:
V = 45 m/s
q = 1050 N/m²

الأحمال الزلزالية:
Z = 0.125
V = 450 kN
\`\`\`

## برامج التحليل
- SAP2000
- ETABS
- SAFE
- STAAD.Pro

## المراجع
- الكود المصري للأحمال
- ECP 201
- ASCE 7`,uploadDate:"2025-01-15",lastModified:"2025-01-15",tags:["رياح","زلازل","أحمال","تصميم زلزالي"],topics:["أحمال الرياح","الأحمال الزلزالية","التصميم الإنشائي","الكود المصري"],estimatedHours:15,featured:!0,views:0,downloads:0}]},{id:"boq-extraction",titleAr:"استخراج المقايسات وإعداد BOQ",titleEn:"BOQ Extraction and Preparation",category:"BOQ",difficulty:"intermediate",estimatedHours:25,topics:["طرق استخراج الكميات","إعداد BOQ","التحليل المالي","التسعير"],description:"طرق احترافية لاستخراج الكميات وإعداد جداول المقايسات",featured:!0,order:3,documents:[{id:"quantity-extraction",title:"Quantity Extraction Methods",titleAr:"طرق استخراج الكميات",type:"markdown",category:"BOQ",difficulty:"intermediate",description:"Professional methods for quantity takeoff",descriptionAr:"طرق احترافية لاستخراج الكميات من المخططات",content:`# طرق استخراج الكميات

## المقدمة
استخراج الكميات هو أساس إعداد المقايسة الصحيحة وحساب التكاليف.

## طرق الاستخراج

### 1. الطريقة اليدوية
#### أدوات العمل
- مسطرة قياس
- آلة حاسبة
- جداول Excel
- المخططات المعمارية والإنشائية

#### خطوات العمل
1. دراسة المخططات جيدًا
2. تحديد بنود الأعمال
3. حساب الكميات لكل بند
4. التحقق من الحسابات
5. إعداد الجداول

### 2. الطريقة باستخدام AutoCAD

#### الأوامر المستخدمة
\`\`\`
AREA - قياس المساحات
DIST - قياس المسافات
LIST - معلومات الكائن
\`\`\`

#### مثال: حساب مساحة غرفة
\`\`\`
Command: AREA
Specify first corner point: (انقر الزاوية الأولى)
Specify next corner point: (انقر الزوايا بالترتيب)
...
Area = 20.00 m²
\`\`\`

### 3. برامج استخراج الكميات

#### Planswift
- رفع المخططات PDF
- تحديد المقاييس
- استخراج الكميات تلقائيًا
- التصدير إلى Excel

#### CostX
- ميزات متقدمة
- دعم BIM
- تقارير مفصلة

## بنود الأعمال الرئيسية

### أعمال الحفر
\`\`\`
الكمية = الطول × العرض × العمق
مثال: 10م × 8م × 2م = 160 م³
\`\`\`

### أعمال الخرسانة المسلحة

#### الأساسات
\`\`\`
حجم الخرسانة = عدد القواعد × (الطول × العرض × الارتفاع)
مثال: 4 قواعد × (2م × 2م × 0.5م) = 8 م³
\`\`\`

#### الأعمدة
\`\`\`
حجم العمود الواحد = المقطع × الارتفاع
مثال: (0.3م × 0.5م) × 3م = 0.45 م³
\`\`\`

#### الكمرات
\`\`\`
حجم الكمرة = المقطع × الطول
مثال: (0.25م × 0.5م) × 5م = 0.625 م³
\`\`\`

#### البلاطات
\`\`\`
حجم البلاطة = المساحة × السمك
مثال: (10م × 8م) × 0.15م = 12 م³
\`\`\`

### حساب كميات الحديد

#### طريقة الأوزان
\`\`\`
الوزن = الطول × (القطر²/162)

أمثلة:
قطر 10 مم: كل متر طولي = 0.617 كجم
قطر 12 مم: كل متر طولي = 0.888 كجم
قطر 16 مم: كل متر طولي = 1.580 كجم
قطر 20 مم: كل متر طولي = 2.470 كجم
قطر 25 مم: كل متر طولي = 3.850 كجم
\`\`\`

#### مثال عملي: عمود 3م × 6 حديد 16مم
\`\`\`
الطول الكلي = 3م × 6 أسياخ = 18 متر طولي
الوزن = 18 × 1.580 = 28.44 كجم
\`\`\`

### أعمال المباني

#### الحوائط
\`\`\`
المساحة = الطول × الارتفاع
خصم الفتحات (أبواب - شبابيك)

مثال:
حائط: 10م × 3م = 30 م²
باب: 1م × 2.1م = 2.1 م²
شباك: 1.5م × 1.2م = 1.8 م²
المساحة الصافية = 30 - 2.1 - 1.8 = 26.1 م²
\`\`\`

### أعمال البياض

#### حساب المساحة
\`\`\`
المساحة الكلية = مساحة الحوائط + مساحة الأسقف
\`\`\`

#### معاملات التكبير
\`\`\`
حوائط بلوك: معامل 1.1 (لتعويض الخسائر)
حوائط طوب: معامل 1.15
\`\`\`

### أعمال البلاط والأرضيات

#### حساب الكمية
\`\`\`
المساحة = الطول × العرض
الكمية بالقطع = المساحة / مساحة القطعة الواحدة
إضافة 10% للهالك

مثال:
مساحة الغرفة = 4م × 3م = 12 م²
مقاس البلاطة = 40سم × 40سم = 0.16 م²
عدد البلاطات = 12 / 0.16 = 75 بلاطة
إضافة 10% = 75 × 1.1 = 83 بلاطة
\`\`\`

## أمثلة شاملة

### مثال: فيلا دورين
\`\`\`
المساحة الإجمالية: 400 م²

الكميات الرئيسية:
- حفر: 200 م³
- خرسانة مسلحة: 120 م³
- حديد تسليح: 12 طن
- مباني طوب: 350 م²
- بياض: 800 م²
- بلاط: 400 م²
- سيراميك حوائط: 150 م²
- دهانات: 600 م²
\`\`\`

## نصائح مهمة

### التحقق من الكميات
1. راجع الحسابات مرتين
2. قارن مع مشاريع مشابهة
3. استخدم معدلات استهلاك قياسية
4. أضف نسبة للهالك

### الهالك (Waste)
- خرسانة: 2-3%
- حديد: 5-7%
- طوب/بلوك: 5%
- بلاط: 10%
- دهانات: 15%

## التصدير والتقارير
- تنظيم البيانات في جداول
- إضافة الرسومات التوضيحية
- حساب الأسعار
- إعداد التقرير النهائي`,uploadDate:"2025-01-15",lastModified:"2025-01-15",tags:["كميات","مقايسة","BOQ","استخراج"],topics:["طرق الاستخراج","بنود الأعمال","حساب الخرسانة","حساب الحديد","التحقق"],estimatedHours:12,views:0,downloads:0}]},{id:"scheduling",titleAr:"إدارة الجدولة الزمنية",titleEn:"Project Scheduling",category:"Scheduling",difficulty:"intermediate",estimatedHours:20,topics:["CPM","Gantt Chart","MS Project","Primavera"],description:"تقنيات إعداد وإدارة الجداول الزمنية للمشاريع",featured:!0,order:4,documents:[{id:"scheduling-basics",title:"Project Scheduling Fundamentals",titleAr:"أساسيات الجدولة الزمنية",type:"markdown",category:"Scheduling",difficulty:"beginner",description:"Learn the fundamentals of project scheduling",descriptionAr:"تعلم أساسيات إعداد الجداول الزمنية",content:`# أساسيات الجدولة الزمنية

## المقدمة
الجدولة الزمنية هي عملية تخطيط وتنظيم الأنشطة والموارد خلال فترة تنفيذ المشروع.

## أنواع الجداول الزمنية

### 1. Gantt Chart (مخطط جانت)
- تمثيل بياني للأنشطة
- سهل الفهم والتواصل
- يظهر التداخل بين الأنشطة

### 2. Network Diagram (الشبكة)
- يظهر الترابط بين الأنشطة
- يحدد المسار الحرج
- أكثر دقة للتحليل

### 3. Milestone Chart (مخطط المعالم)
- يركز على النقاط الرئيسية
- مناسب للإدارة العليا
- متابعة الإنجاز الكلي

## طريقة المسار الحرج (CPM)

### المفاهيم الأساسية

#### 1. النشاط (Activity)
\`\`\`
- الاسم
- المدة
- الموارد المطلوبة
- الأنشطة السابقة
\`\`\`

#### 2. التتابع (Sequence)
- Finish to Start (FS)
- Start to Start (SS)
- Finish to Finish (FF)
- Start to Finish (SF)

#### 3. الوقت المبكر والمتأخر
\`\`\`
ES = Early Start (البداية المبكرة)
EF = Early Finish (النهاية المبكرة)
LS = Late Start (البداية المتأخرة)
LF = Late Finish (النهاية المتأخرة)
\`\`\`

#### 4. الفترة المتاحة (Float)
\`\`\`
Total Float = LS - ES = LF - EF
Free Float = ES (التالي) - EF (الحالي)
\`\`\`

### مثال عملي

#### مشروع بناء منزل
\`\`\`
الأنشطة:
A: حفر الأساسات (3 أيام)
B: صب الأساسات (2 أيام) - بعد A
C: مباني الأساسات (4 أيام) - بعد B
D: عمل الأعمدة (5 أيام) - بعد C
E: صب السقف (3 أيام) - بعد D
F: المباني العلوية (10 أيام) - بعد E
G: البياض (8 أيام) - بعد F
H: الدهانات (5 أيام) - بعد G

المسار الحرج: A → B → C → D → E → F → G → H
المدة الكلية: 3+2+4+5+3+10+8+5 = 40 يوم
\`\`\`

## برامج الجدولة

### Microsoft Project
- سهل الاستخدام
- متكامل مع Office
- مناسب للمشاريع الصغيرة والمتوسطة

### Primavera P6
- قوي ومتقدم
- للمشاريع الكبيرة
- تقارير مفصلة

### إعداد الجدول الزمني

#### الخطوات
1. **تحديد الأنشطة**
   - تقسيم العمل (WBS)
   - تحديد المدة لكل نشاط
   - تحديد الموارد المطلوبة

2. **تحديد التتابع**
   - الأنشطة المتتالية
   - الأنشطة المتوازية
   - القيود والمحددات

3. **تقدير المدد**
   - الخبرة السابقة
   - معايير الإنتاجية
   - ظروف الموقع

4. **تحليل الجدول**
   - المسار الحرج
   - الفترات المتاحة
   - الموارد المطلوبة

5. **التحسين**
   - تقليل المدة
   - توزيع الموارد
   - حل التعارضات

## تقنيات التسريع

### 1. Crashing (الضغط)
- زيادة الموارد
- العمل لساعات إضافية
- زيادة التكلفة

### 2. Fast Tracking (المسار السريع)
- تنفيذ أنشطة بالتوازي
- زيادة المخاطر
- يتطلب تنسيق دقيق

## متابعة التنفيذ

### المؤشرات الرئيسية
\`\`\`
1. النسبة المئوية للإنجاز
2. الانحراف عن الجدول
3. التكلفة الفعلية مقابل المخططة
4. استهلاك الموارد
\`\`\`

### التقارير
- التقرير اليومي
- التقرير الأسبوعي
- التقرير الشهري
- تقرير التقدم (S-Curve)

## مثال متكامل

### مشروع: مبنى إداري 5 طوابق

#### المراحل الرئيسية
\`\`\`
1. الأعمال التمهيدية (10 أيام)
   - تسليم الموقع
   - الرفع المساحي
   - إعداد الورش

2. أعمال الحفر والأساسات (30 يوم)
   - الحفر
   - النظافة
   - الخرسانة العادية
   - الأساسات المسلحة

3. الهيكل الإنشائي (90 يوم)
   - الدور الأرضي (18 يوم)
   - الطابق الأول (18 يوم)
   - الطابق الثاني (18 يوم)
   - الطابق الثالث (18 يوم)
   - الطابق الرابع (18 يوم)

4. أعمال التشطيبات (60 يوم)
   - المباني
   - البياض
   - الأرضيات
   - الدهانات

5. الأعمال الكهروميكانيكية (45 يوم)
   - الكهرباء
   - السباكة
   - التكييف
   - المصاعد

المدة الكلية = 235 يوم (8 أشهر)
\`\`\`

## نصائح مهمة

### عند إعداد الجدول
1. كن واقعيًا في التقديرات
2. أضف وقت احتياطي
3. راعي الظروف الجوية
4. أدرج الأعياد والإجازات

### عند المتابعة
1. حدّث الجدول أسبوعيًا
2. قارن المخطط بالفعلي
3. حدد الانحرافات مبكرًا
4. اتخذ إجراءات تصحيحية

## الخاتمة
الجدولة الجيدة = تخطيط جيد + متابعة دقيقة + تحديث مستمر`,uploadDate:"2025-01-15",lastModified:"2025-01-15",tags:["جدولة","CPM","Gantt","مسار حرج"],topics:["أنواع الجداول","المسار الحرج","البرامج","المتابعة"],estimatedHours:10,views:0,downloads:0}]},{id:"programming",titleAr:"البرمجة والأتمتة",titleEn:"Programming & Automation",category:"Programming",difficulty:"advanced",estimatedHours:35,topics:["LISP","Python","YQArch","Automation"],description:"برمجة وأتمتة المهام الهندسية",order:5,documents:[{id:"lisp-guide",title:"AutoLISP Programming Guide",titleAr:"دليل برمجة AutoLISP",type:"markdown",category:"Programming",difficulty:"advanced",description:"Complete guide to AutoLISP programming for AutoCAD automation",descriptionAr:"دليل شامل لبرمجة AutoLISP لأتمتة AutoCAD",content:`# دليل برمجة AutoLISP

## المقدمة
AutoLISP هي لغة برمجة مدمجة في AutoCAD لأتمتة المهام المتكررة.

## الأساسيات

### بنية البرنامج
\`\`\`lisp
(defun C:MYCOMMAND ()
  ; الأوامر هنا
  (princ)
)
\`\`\`

### المتغيرات
\`\`\`lisp
(setq x 10)
(setq name "Ahmed")
(setq point (list 0 0 0))
\`\`\`

### العمليات الحسابية
\`\`\`lisp
(+ 5 3)      ; 8
(- 10 4)     ; 6
(* 6 7)      ; 42
(/ 20 4)     ; 5
\`\`\`

## الأوامر الأساسية

### رسم خط
\`\`\`lisp
(defun C:DLINE ()
  (setq pt1 (getpoint "\\nأول نقطة: "))
  (setq pt2 (getpoint pt1 "\\nثاني نقطة: "))
  (command "LINE" pt1 pt2 "")
  (princ)
)
\`\`\`

### رسم دائرة
\`\`\`lisp
(defun C:DCIRCLE ()
  (setq center (getpoint "\\nمركز الدائرة: "))
  (setq radius (getreal "\\nنصف القطر: "))
  (command "CIRCLE" center radius)
  (princ)
)
\`\`\`

## أمثلة عملية

### 1. رسم شبكة من النقاط
\`\`\`lisp
(defun C:GRID ()
  (setq rows (getint "\\nعدد الصفوف: "))
  (setq cols (getint "\\nعدد الأعمدة: "))
  (setq spacing (getreal "\\nالمسافة: "))
  (setq start (getpoint "\\nنقطة البداية: "))
  
  (setq x (car start))
  (setq y (cadr start))
  
  (repeat rows
    (setq current-x x)
    (repeat cols
      (command "POINT" (list current-x y))
      (setq current-x (+ current-x spacing))
    )
    (setq y (+ y spacing))
  )
  (princ)
)
\`\`\`

### 2. ترقيم تلقائي للعناصر
\`\`\`lisp
(defun C:NUMBER ()
  (setq num (getint "\\nرقم البداية: "))
  (setq ss (ssget))
  (setq count (sslength ss))
  
  (setq i 0)
  (repeat count
    (setq ent (ssname ss i))
    (setq pt (cdr (assoc 10 (entget ent))))
    (command "TEXT" pt 2.5 0 (itoa num))
    (setq num (+ num 1))
    (setq i (+ i 1))
  )
  (princ)
)
\`\`\`

### 3. حساب مساحة بوليلاين
\`\`\`lisp
(defun C:GETAREA ()
  (setq ent (car (entsel "\\nاختر البوليلاين: ")))
  (setq obj (vlax-ename->vla-object ent))
  (setq area (vla-get-area obj))
  (alert (strcat "المساحة = " (rtos area 2 2) " م²"))
  (princ)
)
\`\`\`

## وظائف متقدمة

### معالجة النصوص
\`\`\`lisp
(defun CHANGE-TEXT-SIZE ()
  (setq ss (ssget '((0 . "TEXT"))))
  (setq new-size (getreal "\\nالحجم الجديد: "))
  
  (setq i 0)
  (repeat (sslength ss)
    (setq ent (ssname ss i))
    (setq data (entget ent))
    (setq data (subst (cons 40 new-size)
                      (assoc 40 data)
                      data))
    (entmod data)
    (setq i (+ i 1))
  )
  (princ)
)
\`\`\`

### العمل مع الطبقات
\`\`\`lisp
(defun CREATE-LAYER (layer-name color linetype)
  (command "LAYER" "N" layer-name 
           "C" color layer-name
           "L" linetype layer-name
           "")
)

; استخدام:
(CREATE-LAYER "WALLS" "7" "CONTINUOUS")
\`\`\`

## مشروع متكامل: أداة إنشاء مخطط معماري

\`\`\`lisp
(defun C:APARTMENT ()
  ; إنشاء الطبقات
  (CREATE-LAYER "WALLS" "7" "CONTINUOUS")
  (CREATE-LAYER "DOORS" "3" "CONTINUOUS")
  (CREATE-LAYER "WINDOWS" "4" "CONTINUOUS")
  (CREATE-LAYER "DIMENSIONS" "2" "CONTINUOUS")
  
  ; رسم الحوائط الخارجية
  (setq p1 (getpoint "\\nأول زاوية: "))
  (setq p2 (getcorner p1 "\\nالزاوية المقابلة: "))
  
  (command "LAYER" "S" "WALLS" "")
  (command "RECTANG" p1 p2)
  
  ; إضافة أبواب
  (command "LAYER" "S" "DOORS" "")
  ; ... كود الأبواب
  
  ; إضافة شبابيك
  (command "LAYER" "S" "WINDOWS" "")
  ; ... كود الشبابيك
  
  ; إضافة الأبعاد
  (command "LAYER" "S" "DIMENSIONS" "")
  ; ... كود الأبعاد
  
  (princ "\\nتم إنشاء المخطط بنجاح!")
  (princ)
)
\`\`\`

## نصائح البرمجة

### 1. التعليقات
\`\`\`lisp
; تعليق سطر واحد
;| تعليق
   متعدد
   الأسطر |;
\`\`\`

### 2. معالجة الأخطاء
\`\`\`lisp
(defun C:SAFE ()
  (if (setq ent (entsel))
    (progn
      ; معالجة ناجحة
      (princ "\\nتم الاختيار")
    )
    ; لم يتم الاختيار
    (alert "لم يتم اختيار عنصر!")
  )
  (princ)
)
\`\`\`

### 3. الحلقات
\`\`\`lisp
; Repeat
(repeat 10
  (princ "\\n*")
)

; While
(setq i 0)
(while (< i 10)
  (princ i)
  (setq i (+ i 1))
)
\`\`\`

## التكامل مع AutoCAD

### قراءة الإعدادات
\`\`\`lisp
(getvar "CLAYER")    ; الطبقة الحالية
(getvar "DIMSCALE")  ; مقياس الأبعاد
\`\`\`

### تعيين الإعدادات
\`\`\`lisp
(setvar "CLAYER" "WALLS")
(setvar "OSMODE" 35)
\`\`\`

## الخاتمة
AutoLISP أداة قوية لزيادة الإنتاجية في AutoCAD. ابدأ ببرامج بسيطة وتدرج للأكثر تعقيدًا.`,uploadDate:"2025-01-15",lastModified:"2025-01-15",tags:["LISP","AutoCAD","برمجة","أتمتة"],topics:["الأساسيات","الأوامر","أمثلة عملية","مشاريع متكاملة"],estimatedHours:20,views:0,downloads:0}]}],oe=({project:m})=>{const[i,o]=d.useState(""),[g,k]=d.useState("all"),[x,q]=d.useState("all"),[se,ae]=d.useState(null),[c,O]=d.useState(null),[R,C]=d.useState(!1),[r,N]=d.useState({}),[h,j]=d.useState(new Set);d.useEffect(()=>{const t=localStorage.getItem("knowledge-progress");t&&N(JSON.parse(t));const s=localStorage.getItem("knowledge-bookmarks");s&&j(new Set(JSON.parse(s)))},[]);const v=(t,s)=>{const a=S(A({},r),{[t]:A(S(A({},r[t]),{documentId:t,lastViewed:new Date().toISOString()}),s)});N(a),localStorage.setItem("knowledge-progress",JSON.stringify(a))},I=t=>{const s=new Set(h);s.has(t)?s.delete(t):s.add(t),j(s),localStorage.setItem("knowledge-bookmarks",JSON.stringify([...s]))},T=d.useMemo(()=>P.filter(t=>{const s=i===""||t.titleAr.includes(i)||t.titleEn.toLowerCase().includes(i.toLowerCase())||t.topics.some(n=>n.includes(i)),a=g==="all"||t.category===g,l=x==="all"||t.difficulty===x;return s&&a&&l}),[i,g,x]),f=d.useMemo(()=>P.flatMap(t=>t.documents),[]),u=d.useMemo(()=>{const t=f.length,s=Object.values(r).filter(n=>n.completed).length,a=f.reduce((n,p)=>n+(p.estimatedHours||0),0),l=f.filter(n=>{var p;return(p=r[n.id])==null?void 0:p.completed}).reduce((n,p)=>n+(p.estimatedHours||0),0);return{total:t,completed:s,totalHours:a,completedHours:l}},[f,r]),M=t=>{var s,a;O(t),C(!0),v(t.id,{progress:((s=r[t.id])==null?void 0:s.progress)||0,completed:((a=r[t.id])==null?void 0:a.completed)||!1})},F=t=>{switch(t){case"pdf":return te;case"video":return ee;case"image":return _;case"xlsx":return J;case"pptx":return $;default:return y}},H=()=>{var t,s;return c?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",children:e.jsxs("div",{className:"bg-white rounded-lg max-w-6xl w-full h-[90vh] flex flex-col",children:[e.jsxs("div",{className:"p-4 border-b flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>C(!1),className:"p-2 hover:bg-gray-100 rounded-lg",children:e.jsx(Z,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-bold",children:c.titleAr}),e.jsx("p",{className:"text-sm text-gray-600",children:c.title})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>I(c.id),className:`p-2 rounded-lg ${h.has(c.id)?"bg-yellow-100 text-yellow-600":"hover:bg-gray-100"}`,children:h.has(c.id)?e.jsx(L,{className:"w-5 h-5"}):e.jsx(X,{className:"w-5 h-5"})}),e.jsx("button",{onClick:()=>{var l,n;const a=!((l=r[c.id])!=null&&l.completed);v(c.id,{completed:a,progress:a?100:((n=r[c.id])==null?void 0:n.progress)||0})},className:`px-4 py-2 rounded-lg ${(t=r[c.id])!=null&&t.completed?"bg-green-600 text-white":"bg-blue-600 text-white"}`,children:(s=r[c.id])!=null&&s.completed?"مكتمل ✓":"تحديد كمكتمل"})]})]}),e.jsx("div",{className:"flex-1 overflow-auto p-6",children:e.jsx("div",{className:"prose prose-lg max-w-none",dir:"rtl",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:c.content.replace(/\n/g,"<br/>")}})})})]})}):null};return e.jsxs("div",{className:"p-6 max-w-7xl mx-auto",dir:"rtl",children:[e.jsxs("div",{className:"mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold mb-2",children:"📚 قاعدة البيانات المعرفية الهندسية"}),e.jsx("p",{className:"text-gray-600",children:"مكتبة شاملة تحتوي على جميع المواد التدريبية والمراجع الهندسية"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",children:[e.jsxs("div",{className:"bg-blue-50 p-4 rounded-lg",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(y,{className:"w-5 h-5 text-blue-600"}),e.jsx("span",{className:"font-semibold",children:"إجمالي المواد"})]}),e.jsx("p",{className:"text-2xl font-bold text-blue-600",children:u.total})]}),e.jsxs("div",{className:"bg-green-50 p-4 rounded-lg",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(V,{className:"w-5 h-5 text-green-600"}),e.jsx("span",{className:"font-semibold",children:"المواد المكتملة"})]}),e.jsx("p",{className:"text-2xl font-bold text-green-600",children:u.completed})]}),e.jsxs("div",{className:"bg-purple-50 p-4 rounded-lg",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(D,{className:"w-5 h-5 text-purple-600"}),e.jsx("span",{className:"font-semibold",children:"ساعات التدريب"})]}),e.jsx("p",{className:"text-2xl font-bold text-purple-600",children:u.totalHours})]}),e.jsxs("div",{className:"bg-yellow-50 p-4 rounded-lg",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(Q,{className:"w-5 h-5 text-yellow-600"}),e.jsx("span",{className:"font-semibold",children:"التقدم"})]}),e.jsxs("p",{className:"text-2xl font-bold text-yellow-600",children:[u.total>0?Math.round(u.completed/u.total*100):0,"%"]})]})]}),e.jsx("div",{className:"bg-white p-4 rounded-lg shadow mb-6",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"relative",children:[e.jsx(K,{className:"absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"}),e.jsx("input",{type:"text",placeholder:"بحث في المواد...",value:i,onChange:t=>o(t.target.value),className:"w-full pr-10 p-2 border rounded-lg"})]}),e.jsxs("select",{value:g,onChange:t=>k(t.target.value),className:"p-2 border rounded-lg",children:[e.jsx("option",{value:"all",children:"جميع التصنيفات"}),e.jsx("option",{value:"AutoCAD",children:"AutoCAD"}),e.jsx("option",{value:"Structural",children:"إنشائي"}),e.jsx("option",{value:"BOQ",children:"مقايسات"}),e.jsx("option",{value:"Scheduling",children:"جدولة"}),e.jsx("option",{value:"Programming",children:"برمجة"}),e.jsx("option",{value:"Management",children:"إدارة"})]}),e.jsxs("select",{value:x,onChange:t=>q(t.target.value),className:"p-2 border rounded-lg",children:[e.jsx("option",{value:"all",children:"جميع المستويات"}),e.jsx("option",{value:"beginner",children:"مبتدئ"}),e.jsx("option",{value:"intermediate",children:"متوسط"}),e.jsx("option",{value:"advanced",children:"متقدم"})]})]})}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:T.map(t=>{const s=t.documents.filter(a=>{var l;return(l=r[a.id])==null?void 0:l.completed}).length/t.documents.length*100;return e.jsxs("div",{className:"bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow",children:[t.featured&&e.jsx("div",{className:"bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold",children:"⭐ مميز"}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex justify-between items-start mb-3",children:[e.jsx("h3",{className:"text-xl font-bold",children:t.titleAr}),e.jsx("span",{className:`px-2 py-1 rounded text-xs ${t.difficulty==="beginner"?"bg-green-100 text-green-700":t.difficulty==="intermediate"?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`,children:t.difficulty==="beginner"?"مبتدئ":t.difficulty==="intermediate"?"متوسط":"متقدم"})]}),e.jsx("p",{className:"text-sm text-gray-600 mb-4",children:t.description}),e.jsxs("div",{className:"flex items-center gap-4 mb-4 text-sm text-gray-600",children:[e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(D,{className:"w-4 h-4"}),e.jsxs("span",{children:[t.estimatedHours," ساعة"]})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(y,{className:"w-4 h-4"}),e.jsxs("span",{children:[t.documents.length," مادة"]})]})]}),e.jsxs("div",{className:"mb-4",children:[e.jsxs("div",{className:"flex justify-between text-sm mb-1",children:[e.jsx("span",{children:"التقدم"}),e.jsxs("span",{children:[Math.round(s),"%"]})]}),e.jsx("div",{className:"w-full bg-gray-200 rounded-full h-2",children:e.jsx("div",{className:"bg-blue-600 h-2 rounded-full transition-all",style:{width:`${s}%`}})})]}),e.jsxs("div",{className:"flex flex-wrap gap-2 mb-4",children:[t.topics.slice(0,3).map((a,l)=>e.jsx("span",{className:"text-xs bg-gray-100 px-2 py-1 rounded",children:a},l)),t.topics.length>3&&e.jsxs("span",{className:"text-xs text-gray-500",children:["+",t.topics.length-3]})]}),e.jsx("div",{className:"space-y-2",children:t.documents.map(a=>{var b;const l=F(a.type),n=(b=r[a.id])==null?void 0:b.completed,p=h.has(a.id);return e.jsxs("div",{className:"flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer",onClick:()=>M(a),children:[e.jsxs("div",{className:"flex items-center gap-2 flex-1",children:[e.jsx(l,{className:"w-4 h-4 text-gray-400"}),e.jsx("span",{className:`text-sm ${n?"line-through text-gray-400":""}`,children:a.titleAr})]}),e.jsxs("div",{className:"flex gap-1",children:[p&&e.jsx(L,{className:"w-4 h-4 text-yellow-500"}),n&&e.jsx("span",{className:"text-green-600",children:"✓"}),e.jsx(z,{className:"w-4 h-4 text-gray-400"})]})]},a.id)})})]})]},t.id)})}),R&&H()]})};export{oe as default};
