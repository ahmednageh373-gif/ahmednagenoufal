# دليل البدء السريع - NOUFAL Navisworks Plugin ⚡

## ⏱️ 5 دقائق للتشغيل

### المتطلبات الأساسية
```
✅ Visual Studio 2019/2022 (Community مجاني)
✅ .NET Framework 4.8 Developer Pack
✅ Navisworks Manage 2024/2023/2022/2021
```

---

## 🚀 الخطوات السريعة

### 1️⃣ البناء (Build)

**في Visual Studio:**
```
1. افتح: NOUFAL.NavisworksPlugin.sln
2. انقر: Build → Build Solution
   أو اضغط: Ctrl+Shift+B
```

**أو في Command Line:**
```bash
# افتح Developer Command Prompt for VS 2022
cd C:\path\to\navisworks-plugin
msbuild NOUFAL.NavisworksPlugin.csproj /p:Configuration=Release
```

---

### 2️⃣ التثبيت (Install)

**نسخ سريع (Copy-Paste في Command Prompt):**

```bash
:: إنشاء المجلد
mkdir "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents"

:: نسخ الملفات
copy bin\Release\NOUFAL.NavisworksPlugin.dll "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"
copy bin\Release\Newtonsoft.Json.dll "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"

:: نسخ PackageContents.xml
copy PackageContents.xml "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\"

echo تم التثبيت بنجاح!
```

---

### 3️⃣ الاختبار (Test)

```
1. افتح Navisworks Manage
2. افتح أي ملف نموذج (.nwf, .nwd, .nwc)
3. اذهب إلى: Add-Ins → External Tools
4. اضغط: "Export to NOUFAL"
5. أدخل:
   - API URL: https://api.noufal.com
   - Project ID: test-project-123
6. اختر الخيارات
7. اضغط "Export"
```

---

## ✅ التحقق السريع

### هل يعمل الـ Plugin؟

```bash
# افتح File Explorer
# اذهب إلى:
%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle

# يجب أن ترى:
✓ PackageContents.xml
✓ Contents\
  ✓ NOUFAL.NavisworksPlugin.dll
  ✓ Newtonsoft.Json.dll
```

---

## 🔧 حل المشاكل السريع

### المشكلة: Plugin لا يظهر

```
الحل:
1. في Navisworks: Options → Interface → Developer
2. ✅ فعّل: "Show application plugins"
3. Add-Ins → Plugins
4. ابحث عن: NOUFAL.NavisworksPlugin
5. تحقق من Status (يجب أن يكون "Loaded")
```

### المشكلة: Build Failed

```
الحل:
1. تحقق من تثبيت .NET Framework 4.8 Developer Pack
2. افتح .csproj وعدّل HintPath:
   <HintPath>C:\Program Files\Autodesk\Navisworks Manage 2024\api\NET\Autodesk.Navisworks.Api.dll</HintPath>
3. أعد البناء
```

### المشكلة: Could not load Newtonsoft.Json

```
الحل:
انسخ جميع DLLs:
copy bin\Release\*.dll "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"
```

---

## 📂 هيكل الملفات المطلوب

```
%APPDATA%\Autodesk\ApplicationPlugins\
└── NOUFAL.NavisworksPlugin.bundle\
    ├── PackageContents.xml          ← ملف التعريف
    └── Contents\
        ├── NOUFAL.NavisworksPlugin.dll  ← الـ Plugin نفسه
        └── Newtonsoft.Json.dll          ← مكتبة JSON
```

---

## 🎯 ميزات سريعة

### ماذا يفعل الـ Plugin؟

✅ **تصدير النموذج الكامل** أو العناصر المحددة فقط  
✅ **استخراج الأشكال الهندسية** (Triangulated Meshes)  
✅ **استخراج جميع الخصائص** (Properties من PropertyCategories)  
✅ **رفع مباشر** إلى NOUFAL API  
✅ **شريط تقدم** مع إمكانية الإلغاء  
✅ **واجهة عربية** كاملة  

---

## 🔍 الأوامر المفيدة

### فتح مجلد الـ Plugins:
```bash
explorer "%APPDATA%\Autodesk\ApplicationPlugins"
```

### فتح مجلد الـ Build:
```bash
cd navisworks-plugin
explorer bin\Release
```

### فحص ملفات DLL:
```bash
dir bin\Release\*.dll
```

---

## 📚 مزيد من التفاصيل

- **دليل مفصل:** [BUILD-INSTRUCTIONS.md](BUILD-INSTRUCTIONS.md)
- **التوثيق الكامل:** [README.md](README.md)
- **ملخص المشروع:** [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)

---

## 🆘 الدعم السريع

**مشكلة؟**
- **البريد:** support@noufal.com
- **التوثيق:** https://docs.noufal.com/navisworks-plugin

---

## 🎉 تهانينا!

إذا وصلت هنا، فأنت الآن جاهز لاستخدام NOUFAL Navisworks Plugin!

---

**نصيحة:** احفظ نسخة من مجلد `bin\Release` في مكان آمن للتوزيع السريع!
