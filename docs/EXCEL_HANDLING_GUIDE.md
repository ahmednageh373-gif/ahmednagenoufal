# 📊 دليل شامل: كيف يتعامل التطبيق مع ملفات Excel

## 🎯 نظرة عامة

تطبيق **AN.AI** يستخدم مكتبة **XLSX** (SheetJS) لقراءة وكتابة ملفات Excel. هذا الدليل يشرح بالتفصيل الآلية الكاملة من البداية إلى النهاية.

---

## 📦 المكتبة المستخدمة: XLSX (SheetJS)

### التثبيت والإعداد
```typescript
// في index.html، يتم تحميل XLSX من CDN:
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

// في الكود، يتم التصريح عنها:
declare var XLSX: any;
```

### الوثائق الرسمية
- 🔗 [SheetJS Documentation](https://docs.sheetjs.com/)
- 🔗 [GitHub Repository](https://github.com/SheetJS/sheetjs)

---

## 🔄 المراحل الأربع للتعامل مع Excel

```
┌─────────────────────────────────────────────────────────────┐
│  1️⃣  رفع الملف (File Upload)                                │
│      ↓ المستخدم يختار ملف .xlsx                            │
│                                                               │
│  2️⃣  قراءة الملف (File Reading)                             │
│      ↓ FileReader API يقرأ الملف كـ ArrayBuffer            │
│                                                               │
│  3️⃣  تحليل البيانات (Data Parsing)                          │
│      ↓ XLSX يحول البيانات إلى JSON                          │
│                                                               │
│  4️⃣  استخراج ومعالجة (Extract & Process)                   │
│      ↓ تحديد الأعمدة واستخراج البنود                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ المرحلة الأولى: رفع الملف

### الكود الفعلي من `BOQManualManager.tsx`

```typescript
// المكون: BOQImport
const BOQImport: React.FC<BOQImportProps> = ({ onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    
    // معالج تغيير الملف
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        
        // التحقق من صيغة الملف
        if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile); 
            setError(null);
        } else { 
            setFile(null); 
            setError('صيغة الملف غير مدعومة. الرجاء اختيار ملف Excel (.xlsx)'); 
        }
    };

    return (
        <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".xlsx" 
            className="w-full p-2 border rounded-lg"
        />
    );
};
```

### ما يحدث هنا:
- ✅ **input type="file"** يفتح نافذة اختيار الملف
- ✅ **accept=".xlsx"** يحدد فقط ملفات Excel
- ✅ التحقق من الامتداد قبل القبول
- ✅ حفظ كائن الملف في الـ state

---

## 2️⃣ المرحلة الثانية: قراءة الملف

### الكود الفعلي

```typescript
const parseExcel = (file: File): Promise<FinancialItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        // عند انتهاء القراءة بنجاح
        reader.onload = (e) => {
            try {
                // تحويل البيانات إلى Uint8Array
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                
                // استخدام XLSX لقراءة الملف
                const workbook = XLSX.read(data, { type: 'array' });
                
                // ... باقي الكود
            } catch (error) { 
                reject(new Error('فشل في تحليل ملف Excel.')); 
            }
        };
        
        // معالج الخطأ
        reader.onerror = () => reject(new Error('فشل في قراءة الملف.'));
        
        // بدء القراءة كـ ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
};
```

### التفصيل:

#### 📖 FileReader API
```typescript
const reader = new FileReader();

// الخيارات المتاحة للقراءة:
reader.readAsArrayBuffer(file);  // ✅ المستخدم - للبيانات الثنائية
reader.readAsText(file);         // للنصوص
reader.readAsDataURL(file);      // للصور والملفات لرفعها
reader.readAsBinaryString(file); // للبيانات الثنائية (قديم)
```

#### 🔢 ArrayBuffer vs Uint8Array
```typescript
// ArrayBuffer: مخزن للبيانات الثنائية الخام
const arrayBuffer = e.target?.result as ArrayBuffer;

// Uint8Array: طريقة لقراءة/كتابة ArrayBuffer كأرقام من 0-255
const uint8Array = new Uint8Array(arrayBuffer);

// مثال:
// ArrayBuffer: [01101110 01101111] (بيانات ثنائية خام)
// Uint8Array:  [110, 111]           (أرقام يمكن التعامل معها)
```

---

## 3️⃣ المرحلة الثالثة: تحليل البيانات مع XLSX

### الكود الفعلي

```typescript
// 1. قراءة الـ Workbook (ملف Excel الكامل)
const workbook = XLSX.read(data, { type: 'array' });

// 2. الحصول على اسم أول ورقة
const sheetName = workbook.SheetNames[0];
// مثال: "Sheet1", "المقايسة", "BOQ"

// 3. الحصول على الورقة نفسها
const worksheet = workbook.Sheets[sheetName];

// 4. تحويل الورقة إلى JSON
const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
```

### 📊 بنية البيانات

#### مثال ملف Excel:
```
┌────────┬──────────────────┬─────────┬────────┬────────┐
│ البند  │     الوصف       │ الكمية │ الوحدة │ السعر  │
├────────┼──────────────────┼─────────┼────────┼────────┤
│  1     │ خرسانة مسلحة    │  150    │  م³    │  350   │
│  2     │ حديد تسليح      │   12    │  طن    │  4500  │
│  3     │ بلاط سيراميك    │  450    │  م²    │   45   │
└────────┴──────────────────┴─────────┴────────┴────────┘
```

#### بعد `sheet_to_json` مع `header: 1`:
```typescript
json = [
    ["البند", "الوصف", "الكمية", "الوحدة", "السعر"],      // الصف 0 (العناوين)
    [1, "خرسانة مسلحة", 150, "م³", 350],                   // الصف 1
    [2, "حديد تسليح", 12, "طن", 4500],                     // الصف 2
    [3, "بلاط سيراميك", 450, "م²", 45],                    // الصف 3
]
```

#### بدون `header: 1` (الوضع الافتراضي):
```typescript
json = [
    { "البند": 1, "الوصف": "خرسانة مسلحة", "الكمية": 150, "الوحدة": "م³", "السعر": 350 },
    { "البند": 2, "الوصف": "حديد تسليح", "الكمية": 12, "الوحدة": "طن", "السعر": 4500 },
    { "البند": 3, "الوصف": "بلاط سيراميك", "الكمية": 450, "الوحدة": "م²", "السعر": 45 },
]
```

**لماذا نستخدم `header: 1`؟**
- ✅ لأن أسماء الأعمدة قد تكون بالعربية أو الإنجليزية
- ✅ نريد أن نكتشف العناوين تلقائياً بدلاً من الاعتماد عليها
- ✅ أكثر مرونة مع ملفات Excel مختلفة الأشكال

---

## 4️⃣ المرحلة الرابعة: الذكاء - اكتشاف العناوين

### 🎯 المشكلة
ملفات Excel تأتي بأشكال مختلفة:
- بعضها العناوين بالعربية: "البند", "الوصف", "الكمية"
- بعضها بالإنجليزية: "Item", "Description", "Quantity"
- بعضها مختلط: "رقم البند", "Item No", "بند"
- العناوين قد تكون في الصف الأول أو الثاني أو الثالث

### 🧠 الحل: نظام ذكي للكشف

```typescript
// قاموس الكلمات المفتاحية
const headerKeywords = [
    { keys: ['رقم', 'item', 'no', 'بند'], col: 'id' },
    { keys: ['وصف', 'description', 'بند'], col: 'description' },
    { keys: ['وحدة', 'unit'], col: 'unit' },
    { keys: ['كمية', 'quantity', 'qty'], col: 'quantity' },
    { keys: ['سعر', 'price', 'unit price'], col: 'unitPrice' },
    { keys: ['إجمالي', 'total', 'amount'], col: 'total' },
];

let headerRowIndex = -1;
let colMapping: { [key: string]: number } = {};

// البحث عن صف العناوين
for (let i = 0; i < json.length && headerRowIndex === -1; i++) {
    const row = json[i];
    
    for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toLowerCase().trim();
        
        for (const keyword of headerKeywords) {
            if (keyword.keys.some(k => cell.includes(k))) {
                colMapping[keyword.col] = j;  // حفظ رقم العمود
                headerRowIndex = i;           // حفظ رقم الصف
                break;
            }
        }
    }
}
```

### 📝 مثال عملي

#### ملف Excel:
```
الصف 0: ["تقرير المقايسة"]               // عنوان الملف
الصف 1: ["المشروع: مبنى سكني"]          // معلومات إضافية  
الصف 2: ["رقم", "الوصف", "الكمية", "الوحدة", "السعر"]  // ← العناوين هنا!
الصف 3: [1, "خرسانة", 150, "م³", 350]
```

#### النتيجة:
```typescript
headerRowIndex = 2  // العناوين في الصف الثاني (index 2)
colMapping = {
    id: 0,           // عمود "رقم" في الموضع 0
    description: 1,  // عمود "الوصف" في الموضع 1
    quantity: 2,     // عمود "الكمية" في الموضع 2
    unit: 3,         // عمود "الوحدة" في الموضع 3
    unitPrice: 4     // عمود "السعر" في الموضع 4
}
```

---

## 5️⃣ المرحلة الخامسة: استخراج البيانات

### الكود الفعلي

```typescript
const items: FinancialItem[] = [];
let itemIdCounter = 1;

// نبدأ من الصف التالي للعناوين
for (let i = headerRowIndex + 1; i < json.length; i++) {
    const row = json[i];
    
    // استخراج القيم باستخدام colMapping
    const description = String(row[colMapping['description']] || '').trim();
    const unit = String(row[colMapping['unit']] || '').trim();
    const quantity = Number(row[colMapping['quantity']]) || 0;
    const unitPrice = Number(row[colMapping['unitPrice']]) || 0;
    
    // حساب الإجمالي
    const total = colMapping['total'] !== undefined 
        ? Number(row[colMapping['total']]) || (quantity * unitPrice)
        : (quantity * unitPrice);
    
    // الحصول على ID أو إنشاء واحد
    const id = colMapping['id'] !== undefined 
        ? String(row[colMapping['id']] || '').trim()
        : `f-import-${itemIdCounter}`;
    
    // التحقق من صلاحية البند
    if (description && (quantity > 0 || total > 0)) {
        items.push({
            id: id || `f-import-${itemIdCounter++}`,
            item: description,
            unit: unit,
            quantity: quantity,
            unitPrice: unitPrice,
            total: total,
        });
        itemIdCounter++;
    }
}
```

### 📊 مثال التحويل النهائي

#### بيانات Excel الخام:
```typescript
row = [1, "خرسانة مسلحة للأساسات", 150, "م³", 350]
```

#### بعد المعالجة:
```typescript
{
    id: "1",                          // أو "f-import-1" إذا لم يوجد
    item: "خرسانة مسلحة للأساسات",
    quantity: 150,
    unit: "م³",
    unitPrice: 350,
    total: 52500                      // 150 × 350
}
```

---

## 📤 التصدير إلى Excel

### الكود الفعلي

```typescript
const exportToExcel = (data: FinancialItem[], fileName: string) => {
    // 1. تحضير البيانات للتصدير
    const exportData = data.map(item => ({
        'رقم البند': item.id,
        'الوصف': item.item,
        'الوحدة': item.unit,
        'الكمية': item.quantity,
        'سعر الوحدة': item.unitPrice,
        'الإجمالي': item.total,
    }));

    // 2. إنشاء ورقة عمل من JSON
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 3. إنشاء كتاب عمل جديد
    const wb = XLSX.utils.book_new();
    
    // 4. إضافة الورقة إلى الكتاب
    XLSX.utils.book_append_sheet(wb, ws, 'المقايسة');
    
    // 5. حفظ الملف
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${fileName}_${date}.xlsx`);
};
```

### 🔄 تدفق التصدير

```
JavaScript Object
      ↓
json_to_sheet()    → تحويل إلى Sheet
      ↓
book_new()         → إنشاء Workbook
      ↓
book_append_sheet() → إضافة Sheet للـ Workbook
      ↓
writeFile()        → حفظ الملف
      ↓
تنزيل في المتصفح
```

---

## 🎓 أمثلة عملية كاملة

### مثال 1: استيراد ملف بسيط

**الملف: project_quantities.xlsx**
```
| البند | الوصف          | الكمية | الوحدة | السعر |
|-------|----------------|--------|--------|-------|
| 1     | خرسانة مسلحة   | 150    | م³     | 350   |
| 2     | حديد تسليح     | 12     | طن     | 4500  |
```

**الكود:**
```typescript
const file = /* ملف من input */;
const items = await parseExcel(file);

console.log(items);
// [
//   { id: "1", item: "خرسانة مسلحة", quantity: 150, unit: "م³", unitPrice: 350, total: 52500 },
//   { id: "2", item: "حديد تسليح", quantity: 12, unit: "طن", unitPrice: 4500, total: 54000 }
// ]
```

### مثال 2: ملف معقد مع عناوين مختلفة

**الملف: complex_boq.xlsx**
```
الصف 0: ["مشروع البناء السكني - 2024"]
الصف 1: []
الصف 2: ["Item No", "Description", "Qty", "Unit", "Rate", "Amount"]
الصف 3: ["A-01", "Concrete Foundation", "100", "m³", "400", "40000"]
```

**النتيجة:**
```typescript
// النظام يكتشف تلقائياً:
// - headerRowIndex = 2
// - colMapping = { id: 0, description: 1, quantity: 2, unit: 3, unitPrice: 4, total: 5 }

items = [{
    id: "A-01",
    item: "Concrete Foundation",
    quantity: 100,
    unit: "m³",
    unitPrice: 400,
    total: 40000
}]
```

---

## 🔧 معالجة الحالات الخاصة

### 1. ملف بدون عمود ID
```typescript
// النظام يُنشئ IDs تلقائياً
id: `f-import-${itemIdCounter++}`
// مثال: "f-import-1", "f-import-2", ...
```

### 2. ملف بدون عمود الإجمالي
```typescript
// النظام يحسب الإجمالي تلقائياً
total = quantity * unitPrice
```

### 3. خلايا فارغة
```typescript
const description = String(row[colMapping['description']] || '').trim();
// إذا كانت الخلية فارغة، يُستخدم string فارغ

const quantity = Number(row[colMapping['quantity']]) || 0;
// إذا كانت الخلية فارغة أو غير رقمية، يُستخدم 0
```

### 4. صفوف غير صالحة
```typescript
// يتم تجاهل الصفوف التي:
// - ليس لها وصف
// - الكمية = 0 والإجمالي = 0

if (description && (quantity > 0 || total > 0)) {
    items.push(/* البند */);
}
```

---

## 🎯 أفضل الممارسات

### ✅ للمستخدمين

1. **تنسيق الملف:**
   - ضع العناوين في الصف الأول أو الثاني
   - استخدم كلمات واضحة: "الوصف", "الكمية", إلخ
   - تجنب الخلايا المدمجة في صف العناوين

2. **البيانات:**
   - تأكد من أن الأرقام بتنسيق رقمي، ليس نص
   - لا تترك صفوف فارغة بين البيانات
   - استخدم نفس الوحدة لنفس نوع البند

3. **الملف:**
   - احفظ الملف بصيغة `.xlsx` (ليس `.xls`)
   - تجنب كلمات المرور والحماية
   - احتفظ بنسخة احتياطية قبل التعديل

### ✅ للمطورين

1. **معالجة الأخطاء:**
   ```typescript
   try {
       const items = await parseExcel(file);
   } catch (error) {
       console.error('خطأ في قراءة الملف:', error);
       alert('فشل استيراد الملف. تحقق من التنسيق.');
   }
   ```

2. **التحقق من البيانات:**
   ```typescript
   if (items.length === 0) {
       throw new Error('لم يتم العثور على بنود صالحة');
   }
   
   if (Object.keys(colMapping).length < 4) {
       throw new Error('فشل في تحديد رؤوس الأعمدة');
   }
   ```

3. **الأداء:**
   ```typescript
   // للملفات الكبيرة، استخدم Web Workers
   const worker = new Worker('excelParser.worker.js');
   worker.postMessage({ file });
   worker.onmessage = (e) => {
       const items = e.data;
   };
   ```

---

## 🐛 استكشاف الأخطاء الشائعة

### خطأ: "فشل في تحديد رؤوس الأعمدة"

**السبب:**
- العناوين بصيغة غير متوقعة
- الملف لا يحتوي على عناوين واضحة

**الحل:**
```typescript
// أضف كلمات مفتاحية إضافية
const headerKeywords = [
    { keys: ['رقم', 'item', 'no', 'بند', '#', 'ر.ت'], col: 'id' },
    // ...
];
```

### خطأ: "لم يتم العثور على بنود صالحة"

**السبب:**
- جميع الصفوف فارغة أو غير صالحة
- colMapping غير صحيح

**الحل:**
```typescript
// أضف logging للتشخيص
console.log('Header Row Index:', headerRowIndex);
console.log('Column Mapping:', colMapping);
console.log('First Data Row:', json[headerRowIndex + 1]);
```

### خطأ: الأرقام تُقرأ كنصوص

**السبب:**
- الخلايا منسقة كنص في Excel

**الحل:**
```typescript
// استخدم Number() للتحويل الإجباري
const quantity = Number(String(row[colMapping['quantity']]).replace(/[^\d.-]/g, '')) || 0;
```

---

## 🚀 التحسينات المستقبلية

### 1. التعلم الآلي لاكتشاف الأنماط
```typescript
// تحليل ملفات سابقة لتحسين الدقة
interface LearningPattern {
    fileStructure: any;
    columnMapping: any;
    accuracy: number;
}

function learnFromHistory(patterns: LearningPattern[]) {
    // تطبيق خوارزميات ML
}
```

### 2. دعم صيغ Excel المعقدة
```typescript
// قراءة الصيغ بدلاً من القيم فقط
const formula = worksheet[cellAddress].f;
// مثال: "=B2*C2"
```

### 3. التحقق المتقدم من البيانات
```typescript
interface ValidationRule {
    field: string;
    rule: (value: any) => boolean;
    message: string;
}

const rules: ValidationRule[] = [
    {
        field: 'quantity',
        rule: (v) => v > 0,
        message: 'الكمية يجب أن تكون أكبر من صفر'
    }
];
```

---

## 📚 موارد إضافية

### الوثائق الرسمية
- 📖 [SheetJS Documentation](https://docs.sheetjs.com/)
- 📖 [FileReader API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- 📖 [ArrayBuffer - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

### أمثلة وشروحات
- 💻 [SheetJS Demos](https://sheetjs.com/demos/)
- 💻 [React File Upload Examples](https://react-dropzone.js.org/)

### مجتمع المطورين
- 💬 [Stack Overflow - SheetJS Tag](https://stackoverflow.com/questions/tagged/sheetjs)
- 💬 [GitHub Discussions](https://github.com/SheetJS/sheetjs/discussions)

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من هذا الدليل
2. راجع أمثلة الأكواد
3. افحص console للأخطاء
4. تواصل مع فريق الدعم

---

**آخر تحديث:** 2025-11-02  
**الإصدار:** 1.0.0  
**المؤلف:** AN.AI Development Team
