# 🏗️ دليل التكامل الكامل مع AutoCAD

## 📚 جدول المحتويات

1. [نظرة عامة](#overview)
2. [المتطلبات](#requirements)
3. [التثبيت](#installation)
4. [الاستخدام](#usage)
5. [الصيغ المدعومة](#formats)
6. [الوحدات والمكونات](#modules)
7. [أمثلة عملية](#examples)
8. [حل المشاكل](#troubleshooting)
9. [الأسئلة الشائعة](#faq)

---

## 🎯 نظرة عامة {#overview}

نظام التكامل الكامل مع AutoCAD يتيح لك:

✅ **استيراد ملفات AutoCAD** (DXF)  
✅ **قراءة جميع الطبقات والعناصر**  
✅ **تحويل 2D إلى 3D تلقائياً**  
✅ **فهم جداول التشطيبات والتسليح**  
✅ **استخراج السماكات والأبعاد**  
✅ **إنشاء مخططات تنفيذية**  
✅ **دعم ملفات Excel للجداول**  

---

## 📋 المتطلبات {#requirements}

### متطلبات النظام:
- **المتصفح:** Chrome 90+، Firefox 88+، Edge 90+
- **الذاكرة:** 4 GB RAM كحد أدنى
- **المعالج:** Dual Core 2 GHz+

### المكتبات المطلوبة:

```html
<!-- Three.js للعرض 3D -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- dxf-parser لتحليل DXF -->
<script src="https://cdn.jsdelivr.net/npm/dxf-parser@latest/dist/dxf-parser.min.js"></script>

<!-- XLSX لقراءة Excel -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<!-- الوحدات المحسّنة -->
<script src="DWGParser-Enhanced.js"></script>
<script src="LayerExtractor.js"></script>
<script src="2Dto3DConverter.js"></script>
<script src="ScheduleParser.js"></script>
```

---

## 🚀 التثبيت {#installation}

### الخطوة 1: تحميل الملفات

```bash
cd /home/user/webapp
```

تأكد من وجود الملفات التالية:
- ✅ `DWGParser-Enhanced.js`
- ✅ `LayerExtractor.js`
- ✅ `2Dto3DConverter.js`
- ✅ `ScheduleParser.js`
- ✅ `AutoCADImporter.html`

### الخطوة 2: تضمين المكتبات

أضف في ملف HTML الخاص بك:

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <title>BIM App - AutoCAD Integration</title>
    
    <!-- المكتبات الأساسية -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    
    <!-- للـ DXF Parser -->
    <script src="https://cdn.jsdelivr.net/npm/dxf-parser@1.5.1/dist/dxf-parser.min.js"></script>
</head>
<body>
    <!-- محتوى الصفحة -->
    
    <!-- الوحدات المحسّنة -->
    <script src="DWGParser-Enhanced.js"></script>
    <script src="LayerExtractor.js"></script>
    <script src="2Dto3DConverter.js"></script>
    <script src="ScheduleParser.js"></script>
    
    <script src="app.js"></script>
</body>
</html>
```

---

## 📖 الاستخدام {#usage}

### 🔹 1. استيراد ملف DXF

#### الطريقة الأولى: واجهة رسومية

```javascript
// فتح صفحة الاستيراد
window.location.href = 'AutoCADImporter.html';
```

#### الطريقة الثانية: برمجياً

```javascript
// إنشاء محلل
const parser = new EnhancedDWGParser();

// استيراد الملف
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    const options = {
        normalizeUnits: true,        // توحيد الوحدات
        validateData: true,          // التحقق من البيانات
        extractTables: true,         // استخراج الجداول
        targetUnit: 'Millimeters',   // الوحدة المستهدفة
        onProgress: (percent, message) => {
            console.log(`${percent}%: ${message}`);
        }
    };
    
    try {
        const result = await parser.importFile(file, options);
        
        if (result.success) {
            console.log('✅ نجح الاستيراد:', result);
            console.log(`- ${result.entities.length} عنصر`);
            console.log(`- ${result.layers.length} طبقة`);
            console.log(`- ${result.tables.length} جدول`);
        } else {
            console.error('❌ فشل الاستيراد:', result.error);
        }
        
    } catch (error) {
        console.error('خطأ:', error);
    }
});
```

---

### 🔹 2. تحليل الطبقات

```javascript
// إنشاء محلل الطبقات
const layerExtractor = new LayerExtractor(parser);

// تحليل وتصنيف جميع الطبقات
const classifiedLayers = layerExtractor.analyzeAndClassifyLayers();

console.log('📊 الطبقات المصنفة:');
Object.entries(layerExtractor.layerCategories).forEach(([category, layers]) => {
    if (layers.length > 0) {
        console.log(`  ${category}: ${layers.length} طبقة`);
        
        layers.forEach(layer => {
            console.log(`    - ${layer.name}: ${layer.analysis.totalEntities} عنصر`);
        });
    }
});

// الحصول على تقرير تفصيلي
const report = layerExtractor.generateReport();
console.log('📋 التقرير:', report);
```

---

### 🔹 3. تحويل 2D إلى 3D

```javascript
// تهيئة المحول
const converter = new TwoDToThreeDConverter(engine, layerExtractor);

// تحويل جميع العناصر
const options = {
    heights: {
        floor: 3000,           // ارتفاع الطابق (مم)
        door: 2100,            // ارتفاع الأبواب
        window: 1200           // ارتفاع النوافذ
    },
    thickness: {
        exteriorWall: 250,     // سماكة الجدار الخارجي
        interiorWall: 150,     // سماكة الجدار الداخلي
        slab: 200              // سماكة البلاطة
    }
};

try {
    const result = await converter.convertAll(parser, options);
    
    if (result.success) {
        console.log('✅ تم التحويل إلى 3D:');
        console.log(`  - إجمالي العناصر: ${result.elements.length}`);
        
        const stats = result.statistics;
        console.log('  - الجدران:', stats.byType.wall || 0);
        console.log('  - الأعمدة:', stats.byType.column || 0);
        console.log('  - البلاطات:', stats.byType.slab || 0);
        console.log('  - الأبواب:', stats.byType.door || 0);
        console.log('  - النوافذ:', stats.byType.window || 0);
    }
    
} catch (error) {
    console.error('خطأ في التحويل:', error);
}
```

---

### 🔹 4. تحليل الجداول

#### تحليل جداول التشطيبات

```javascript
const scheduleParser = new ScheduleParser();

// تحليل جميع الجداول
const schedules = await scheduleParser.parseAllSchedules(parser.tables);

// عرض جداول التشطيبات
if (schedules.finishes.length > 0) {
    console.log('🎨 جداول التشطيبات:');
    
    schedules.finishes.forEach(schedule => {
        console.log(`\n  جدول: ${schedule.source}`);
        
        schedule.rooms.forEach(room => {
            console.log(`    الغرفة: ${room.room}`);
            console.log(`      - الأرضية: ${room.floor}`);
            console.log(`      - الجدار: ${room.wall}`);
            console.log(`      - السقف: ${room.ceiling}`);
            
            if (room.costs.floor) {
                console.log(`      - تكلفة الأرضية: ${room.costs.floor.cost} ريال/${room.costs.floor.unit}`);
            }
        });
    });
}
```

#### تحليل جداول التسليح

```javascript
// عرض جداول التسليح
if (schedules.reinforcement.length > 0) {
    console.log('\n🔩 جداول التسليح:');
    
    schedules.reinforcement.forEach(schedule => {
        console.log(`\n  جدول: ${schedule.source}`);
        console.log(`  - إجمالي الوزن: ${schedule.summary.totalWeight.toFixed(2)} كجم`);
        console.log(`  - إجمالي الطول: ${schedule.summary.totalLength.toFixed(2)} م`);
        
        console.log('\n  التوزيع حسب القطر:');
        Object.entries(schedule.summary.byDiameter).forEach(([diameter, data]) => {
            console.log(`    Ø${diameter}: ${data.count} قضيب، ${data.weight.toFixed(2)} كجم`);
        });
    });
}
```

#### تحليل جداول السماكات

```javascript
// عرض جداول السماكات
if (schedules.thickness.length > 0) {
    console.log('\n📏 جداول السماكات:');
    
    schedules.thickness.forEach(schedule => {
        console.log(`\n  جدول: ${schedule.source}`);
        
        Object.entries(schedule.elements).forEach(([elementType, items]) => {
            console.log(`\n    ${elementType}:`);
            items.forEach(item => {
                console.log(`      - ${item.location}: ${item.thickness} ${item.unit}`);
            });
        });
    });
}
```

---

### 🔹 5. قراءة ملفات Excel

```javascript
// استيراد ملف Excel يحتوي على جداول
const excelInput = document.getElementById('excelInput');
excelInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    try {
        // قراءة الجداول من Excel
        const tables = await scheduleParser.parseExcelFile(file);
        
        console.log(`✅ تم استخراج ${tables.length} جدول من Excel`);
        
        // تحليل الجداول
        const schedules = await scheduleParser.parseAllSchedules(tables);
        
        console.log('📊 نتائج التحليل:');
        console.log(`  - جداول تشطيبات: ${schedules.finishes.length}`);
        console.log(`  - جداول تسليح: ${schedules.reinforcement.length}`);
        console.log(`  - جداول سماكات: ${schedules.thickness.length}`);
        console.log(`  - جداول كميات: ${schedules.boq.length}`);
        
    } catch (error) {
        console.error('خطأ في قراءة Excel:', error);
    }
});
```

---

### 🔹 6. ربط الجداول بالعناصر 3D

```javascript
// تطبيق البيانات من الجداول على العناصر 3D
const appliedCount = scheduleParser.applySchedulesToElements(converter.generatedElements);

console.log(`✅ تم تطبيق البيانات على ${appliedCount} عنصر`);

// عرض عنصر مع بياناته
const wall = converter.generatedElements.find(e => e.type === 'wall');
if (wall) {
    console.log('\n🧱 مثال - جدار:');
    console.log('  الخصائص:', wall.properties);
    
    if (wall.properties.finishes) {
        console.log('  التشطيبات:', wall.properties.finishes);
    }
    
    if (wall.properties.thickness) {
        console.log(`  السماكة: ${wall.properties.thickness} mm`);
    }
}
```

---

## 📁 الصيغ المدعومة {#formats}

### ✅ DXF (AutoCAD Drawing Exchange Format)

**المدعوم:**
- ✅ DXF R12 إلى R2018
- ✅ ASCII و Binary
- ✅ جميع أنواع الكائنات الأساسية:
  - LINE, POLYLINE, LWPOLYLINE
  - CIRCLE, ARC, ELLIPSE
  - TEXT, MTEXT
  - INSERT (Blocks)
  - DIMENSION
  - TABLE (محدود)

**غير المدعوم حالياً:**
- ❌ DWG (يحتاج تحويل إلى DXF)
- ❌ 3D Solids (ACIS)
- ❌ Hatches معقدة
- ❌ External References (XREFs)

---

### ✅ Excel (.xlsx, .xls)

**المدعوم:**
- ✅ جداول التشطيبات
- ✅ جداول التسليح
- ✅ جداول السماكات
- ✅ جداول الكميات (BOQ)
- ✅ صيغ Excel متعددة

**المتطلبات:**
- يجب أن يكون الصف الأول عناوين الأعمدة
- البيانات يجب أن تكون في جدول منظم
- تجنب الخلايا المدمجة المعقدة

---

## 🧩 الوحدات والمكونات {#modules}

### 1️⃣ EnhancedDWGParser

**الوظائف الرئيسية:**

```javascript
const parser = new EnhancedDWGParser();

// استيراد ملف
await parser.importFile(file, options);

// الحصول على العناصر
const entities = parser.entities;
const layers = parser.layers;
const blocks = parser.blocks;
const tables = parser.tables;

// الإحصائيات
const stats = parser.getStatistics();

// السجلات
const logs = parser.logger.export();
```

**الخيارات:**

```javascript
const options = {
    useCache: true,              // استخدام الكاش
    forceReparse: false,         // إجبار إعادة التحليل
    validateData: true,          // التحقق من البيانات
    normalizeUnits: true,        // توحيد الوحدات
    targetUnit: 'Millimeters',   // الوحدة المستهدفة
    extractTables: true,         // استخراج الجداول
    extractBlocks: true,         // استخراج الكتل
    extractText: true,           // استخراج النصوص
    onProgress: (percent, msg) => {}  // دالة التقدم
};
```

---

### 2️⃣ LayerExtractor

**الوظائف الرئيسية:**

```javascript
const layerExtractor = new LayerExtractor(parser);

// تحليل وتصنيف
const classified = layerExtractor.analyzeAndClassifyLayers();

// الحصول على طبقات حسب الفئة
const archLayers = layerExtractor.layerCategories.architectural;
const structLayers = layerExtractor.layerCategories.structural;
const finishLayers = layerExtractor.layerCategories.finishes;

// تقرير
const report = layerExtractor.generateReport();
```

**الفئات المدعومة:**
- `architectural` - طبقات معمارية
- `structural` - طبقات إنشائية
- `mep` - طبقات MEP
- `electrical` - طبقات كهربائية
- `plumbing` - طبقات سباكة
- `finishes` - طبقات تشطيبات
- `dimensions` - طبقات أبعاد
- `text` - طبقات نصوص
- `furniture` - طبقات أثاث

---

### 3️⃣ TwoDToThreeDConverter

**الوظائف الرئيسية:**

```javascript
const converter = new TwoDToThreeDConverter(engine, layerExtractor);

// التحويل الكامل
const result = await converter.convertAll(parser, options);

// الوصول إلى العناصر المنشأة
const elements = converter.generatedElements;

// الإحصائيات
const stats = converter.getConversionStatistics();
```

**المعاملات:**

```javascript
const options = {
    heights: {
        floor: 3000,         // ارتفاع الطابق
        door: 2100,          // ارتفاع الأبواب
        window: 1200         // ارتفاع النوافذ
    },
    thickness: {
        exteriorWall: 250,   // جدار خارجي
        interiorWall: 150,   // جدار داخلي
        slab: 200,           // بلاطة
        foundation: 400      // أساس
    }
};
```

---

### 4️⃣ ScheduleParser

**الوظائف الرئيسية:**

```javascript
const scheduleParser = new ScheduleParser();

// تحليل جميع الجداول
const schedules = await scheduleParser.parseAllSchedules(tables);

// استيراد من Excel
const excelTables = await scheduleParser.parseExcelFile(file);

// تطبيق على العناصر
scheduleParser.applySchedulesToElements(elements);

// تقرير
const report = scheduleParser.generateReport();
```

**أنواع الجداول:**
- `finishes` - جداول تشطيبات
- `reinforcement` - جداول تسليح
- `thickness` - جداول سماكات
- `boq` - جداول كميات

---

## 💡 أمثلة عملية {#examples}

### مثال 1: استيراد كامل مع تحويل 3D

```javascript
async function fullImportWorkflow(file) {
    try {
        console.log('🚀 بدء سير العمل الكامل...');
        
        // 1️⃣ استيراد DXF
        const parser = new EnhancedDWGParser();
        const importResult = await parser.importFile(file, {
            normalizeUnits: true,
            validateData: true,
            extractTables: true,
            onProgress: (p, m) => console.log(`${p}%: ${m}`)
        });
        
        if (!importResult.success) {
            throw new Error(importResult.error);
        }
        
        console.log('✅ الاستيراد نجح');
        
        // 2️⃣ تحليل الطبقات
        const layerExtractor = new LayerExtractor(parser);
        const classified = layerExtractor.analyzeAndClassifyLayers();
        
        console.log('✅ تحليل الطبقات نجح');
        
        // 3️⃣ تحويل 2D → 3D
        const converter = new TwoDToThreeDConverter(window.engine, layerExtractor);
        const conversionResult = await converter.convertAll(parser, {
            heights: { floor: 3000, door: 2100, window: 1200 },
            thickness: { exteriorWall: 250, interiorWall: 150, slab: 200 }
        });
        
        console.log('✅ التحويل إلى 3D نجح');
        
        // 4️⃣ تحليل الجداول
        const scheduleParser = new ScheduleParser();
        const schedules = await scheduleParser.parseAllSchedules(parser.tables);
        
        console.log('✅ تحليل الجداول نجح');
        
        // 5️⃣ تطبيق البيانات
        const applied = scheduleParser.applySchedulesToElements(conversionResult.elements);
        
        console.log(`✅ تم تطبيق البيانات على ${applied} عنصر`);
        
        // 6️⃣ التقرير النهائي
        const finalReport = {
            import: importResult,
            layers: layerExtractor.generateReport(),
            conversion: conversionResult.statistics,
            schedules: scheduleParser.generateReport()
        };
        
        console.log('📊 التقرير النهائي:', finalReport);
        
        return finalReport;
        
    } catch (error) {
        console.error('❌ خطأ في سير العمل:', error);
        throw error;
    }
}

// الاستخدام
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await fullImportWorkflow(file);
    }
});
```

---

### مثال 2: تحليل جدول التسليح وحساب التكلفة

```javascript
async function analyzeRebarAndCost(excelFile) {
    const scheduleParser = new ScheduleParser();
    
    // قراءة Excel
    const tables = await scheduleParser.parseExcelFile(excelFile);
    
    // تحليل
    const schedules = await scheduleParser.parseAllSchedules(tables);
    
    // حساب التكلفة
    let totalCost = 0;
    const steelPrice = 3.5; // ريال/كجم
    
    schedules.reinforcement.forEach(schedule => {
        console.log(`\n📋 جدول التسليح: ${schedule.source}`);
        console.log(`الوزن الإجمالي: ${schedule.summary.totalWeight.toFixed(2)} كجم`);
        
        const cost = schedule.summary.totalWeight * steelPrice;
        totalCost += cost;
        
        console.log(`التكلفة: ${cost.toLocaleString('ar-SA')} ريال`);
        
        // تفصيل حسب القطر
        console.log('\nالتفصيل:');
        Object.entries(schedule.summary.byDiameter).forEach(([dia, data]) => {
            const diaCost = data.weight * steelPrice;
            console.log(`  Ø${dia}mm: ${data.count} قضيب، ${data.weight.toFixed(2)} كجم، ${diaCost.toLocaleString('ar-SA')} ريال`);
        });
    });
    
    console.log(`\n💰 التكلفة الإجمالية: ${totalCost.toLocaleString('ar-SA')} ريال`);
    
    return {
        totalWeight: schedules.reinforcement.reduce((sum, s) => sum + s.summary.totalWeight, 0),
        totalCost: totalCost,
        steelPrice: steelPrice
    };
}
```

---

### مثال 3: تصدير التقرير كـ PDF

```javascript
function generatePDFReport(importResult) {
    // استخدام jsPDF (يحتاج تضمين المكتبة)
    const doc = new jsPDF();
    
    doc.setFont('Arial', 'normal');
    doc.setFontSize(16);
    doc.text('تقرير استيراد AutoCAD', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let y = 40;
    
    // الإحصائيات العامة
    doc.text('الإحصائيات العامة:', 20, y);
    y += 10;
    
    doc.text(`عدد العناصر: ${importResult.entities.length}`, 30, y);
    y += 8;
    
    doc.text(`عدد الطبقات: ${importResult.layers.length}`, 30, y);
    y += 8;
    
    doc.text(`عدد الجداول: ${importResult.tables.length}`, 30, y);
    y += 15;
    
    // العناصر 3D
    if (importResult.conversion) {
        doc.text('العناصر المُنشأة:', 20, y);
        y += 10;
        
        const stats = importResult.conversion;
        Object.entries(stats.byType).forEach(([type, count]) => {
            doc.text(`${type}: ${count}`, 30, y);
            y += 8;
        });
    }
    
    // حفظ
    doc.save('import-report.pdf');
}
```

---

## 🔧 حل المشاكل {#troubleshooting}

### مشكلة: "dxf-parser غير متوفر"

**الحل:**

```html
<!-- تأكد من تضمين المكتبة قبل الوحدات -->
<script src="https://cdn.jsdelivr.net/npm/dxf-parser@1.5.1/dist/dxf-parser.min.js"></script>
<script src="DWGParser-Enhanced.js"></script>
```

---

### مشكلة: "فشل قراءة ملف DXF"

**الحلول المحتملة:**

1. **تأكد من صيغة الملف:**
   ```javascript
   // التحقق من الامتداد
   const ext = file.name.split('.').pop().toLowerCase();
   if (ext !== 'dxf') {
       alert('يرجى استخدام ملفات DXF فقط');
       return;
   }
   ```

2. **تأكد من إصدار DXF:**
   - ملفات DXF حديثة جداً (R2021+) قد تحتاج تحويل
   - احفظ كـ DXF R2018 أو أقدم

3. **حجم الملف:**
   ```javascript
   // للملفات الكبيرة (>10 MB)
   if (file.size > 10 * 1024 * 1024) {
       console.warn('ملف كبير، قد يستغرق وقتاً');
       // استخدم Web Worker إن أمكن
   }
   ```

---

### مشكلة: "التحويل إلى 3D غير دقيق"

**الحلول:**

1. **تحقق من تصنيف الطبقات:**
   ```javascript
   const report = layerExtractor.generateReport();
   console.log('الطبقات غير المصنفة:', report.classification.other);
   ```

2. **تخصيص قواعد التحويل:**
   ```javascript
   const options = {
       heights: {
           floor: 3000,  // اضبط حسب مشروعك
           door: 2100,
           window: 1200
       },
       thickness: {
           exteriorWall: 250,  // اضبط حسب المعايير
           interiorWall: 150
       }
   };
   ```

---

### مشكلة: "الجداول لا تُكتشف"

**الحلول:**

1. **تأكد من تنسيق الجدول:**
   - الصف الأول يجب أن يحتوي على عناوين واضحة
   - استخدم فواصل واضحة (|, Tab, أو مسافات مزدوجة)

2. **استخدم Excel بدلاً من DXF:**
   ```javascript
   // للجداول المعقدة، استخدم Excel
   const excelFile = document.getElementById('excelInput').files[0];
   const tables = await scheduleParser.parseExcelFile(excelFile);
   ```

---

## ❓ الأسئلة الشائعة {#faq}

### س1: هل يدعم النظام ملفات DWG مباشرة؟

**ج:** حالياً لا. DWG يحتاج تحويل إلى DXF أولاً. يمكنك:
- استخدام AutoCAD: `File > Save As > DXF`
- استخدام محول مجاني عبر الإنترنت
- في المستقبل سندعم DWG عبر Autodesk Forge API

---

### س2: ما هي أفضل طريقة لإدخال جداول التشطيبات؟

**ج:** أفضل طريقة هي **Excel**:
1. قم بإنشاء جدول في Excel
2. الصف الأول: عناوين (غرفة، أرضية، جدار، سقف)
3. الصفوف التالية: البيانات
4. احفظ كـ `.xlsx`
5. استورد باستخدام `scheduleParser.parseExcelFile()`

---

### س3: كيف أطبق الجداول على العناصر 3D؟

**ج:**

```javascript
// 1. تحليل الجداول
const schedules = await scheduleParser.parseAllSchedules(tables);

// 2. تطبيق على العناصر
const applied = scheduleParser.applySchedulesToElements(elements);

// 3. التحقق
elements.forEach(element => {
    if (element.properties.finishes) {
        console.log(`${element.type} له تشطيبات`);
    }
});
```

---

### س4: كيف أحسن الأداء للملفات الكبيرة؟

**ج:**

```javascript
// 1. استخدم الكاش
const options = {
    useCache: true,
    forceReparse: false
};

// 2. قلل عدد العمليات
const options = {
    extractTables: false,  // إذا لم تكن بحاجة للجداول
    extractBlocks: false   // إذا لم تكن بحاجة للكتل
};

// 3. استخدم Web Worker (متقدم)
const worker = new Worker('dwg-parser-worker.js');
worker.postMessage({ file: file });
```

---

### س5: كيف أصدر الكود السعودي SBC على العناصر المستوردة؟

**ج:**

```javascript
// بعد التحويل إلى 3D
const elements = converter.generatedElements;

// استخدم SBCChecker الموجود
const sbcChecker = new SBCChecker();
const violations = sbcChecker.checkAllCompliance(elements);

if (violations.length > 0) {
    console.log(`⚠️ ${violations.length} انحراف عن الكود`);
    violations.forEach(v => {
        console.log(`- ${v.element}: ${v.issue}`);
    });
} else {
    console.log('✅ جميع العناصر مطابقة للكود السعودي');
}
```

---

## 🎓 موارد إضافية

### الوثائق الرسمية:
- [Three.js Documentation](https://threejs.org/docs/)
- [DXF Reference](https://help.autodesk.com/view/OARX/2023/ENU/)
- [SBC 2024 Standards](https://www.sbc.gov.sa/)

### مكتبات مفيدة:
- [dxf-parser](https://github.com/gdsestimating/dxf-parser)
- [three-dxf-loader](https://github.com/gdsestimating/three-dxf-loader)
- [SheetJS (XLSX)](https://sheetjs.com/)

---

## 📞 الدعم

للمساعدة والدعم:
- 📧 Email: support@bim-app.com
- 💬 Discord: [Join Server](#)
- 📖 Wiki: [View Documentation](#)

---

**تم إعداده بواسطة:** AN.AI AHMED NAGEH  
**التاريخ:** 2024  
**الإصدار:** 1.0.0

✨ **نظام Noufal الهندسي الشامل**
