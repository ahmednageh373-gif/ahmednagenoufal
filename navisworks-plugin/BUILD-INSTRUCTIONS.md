# تعليمات البناء والتثبيت - NOUFAL Navisworks Plugin

## 📋 المتطلبات الأساسية

### 1. أدوات التطوير
- **Visual Studio 2019 أو 2022** (Community, Professional, أو Enterprise)
  - تحميل: https://visualstudio.microsoft.com/downloads/
  - اختر: "Visual Studio Community 2022" (مجاني)
  
- **.NET Framework 4.8 Developer Pack**
  - تحميل: https://dotnet.microsoft.com/download/dotnet-framework/net48
  - مطلوب للتطوير والبناء

### 2. Autodesk Navisworks
- **Navisworks Manage 2024** (أو 2023, 2022, 2021)
  - نسخة تجريبية (30 يوم): https://www.autodesk.com/products/navisworks/free-trial
  - رخصة تعليمية (مجانية لسنة): https://www.autodesk.com/education/home
  
- **مسار التثبيت الافتراضي:**
  ```
  C:\Program Files\Autodesk\Navisworks Manage 2024\
  ```

---

## 🔨 خطوات البناء (Building)

### الطريقة 1: باستخدام Visual Studio (مُوصى بها)

1. **فتح المشروع**
   ```
   - انقر نقراً مزدوجاً على: NOUFAL.NavisworksPlugin.sln
   - سيفتح Visual Studio تلقائياً
   ```

2. **استعادة حزم NuGet**
   ```
   - انقر بزر الماوس الأيمن على Solution في Solution Explorer
   - اختر "Restore NuGet Packages"
   - انتظر حتى يكتمل التحميل
   ```

3. **اختيار وضع البناء**
   ```
   في شريط الأدوات العلوي:
   - للتطوير: اختر "Debug"
   - للإنتاج: اختر "Release"
   ```

4. **بناء المشروع**
   ```
   - اضغط Ctrl+Shift+B
   أو
   - من القائمة: Build → Build Solution
   ```

5. **التحقق من النجاح**
   ```
   في نافذة Output، يجب أن ترى:
   ========== Build: 1 succeeded, 0 failed ==========
   
   الملف الناتج:
   bin\Release\NOUFAL.NavisworksPlugin.dll
   ```

### الطريقة 2: باستخدام سطر الأوامر (Command Line)

1. **فتح Developer Command Prompt**
   ```
   ابحث في قائمة ابدأ عن:
   "Developer Command Prompt for VS 2022"
   ```

2. **الانتقال لمجلد المشروع**
   ```bash
   cd C:\path\to\navisworks-plugin
   ```

3. **بناء Debug**
   ```bash
   msbuild NOUFAL.NavisworksPlugin.csproj /p:Configuration=Debug
   ```

4. **بناء Release**
   ```bash
   msbuild NOUFAL.NavisworksPlugin.csproj /p:Configuration=Release
   ```

---

## 📦 التثبيت في Navisworks

### الخطوة 1: إنشاء مجلد الـ Plugin

```bash
# افتح Command Prompt وقم بتنفيذ:
mkdir "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents"
```

**أو يدوياً:**
1. افتح File Explorer
2. اذهب إلى: `%APPDATA%\Autodesk\ApplicationPlugins\`
3. أنشئ المجلدات: `NOUFAL.NavisworksPlugin.bundle\Contents\`

### الخطوة 2: نسخ ملفات الـ Plugin

```bash
# انسخ ملف DLL
copy bin\Release\NOUFAL.NavisworksPlugin.dll "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"

# انسخ مكتبات JSON
copy bin\Release\Newtonsoft.Json.dll "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"
```

### الخطوة 3: إنشاء ملف PackageContents.xml

أنشئ ملف في:
```
%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\PackageContents.xml
```

بالمحتوى التالي:
```xml
<?xml version="1.0" encoding="utf-8"?>
<ApplicationPackage 
    SchemaVersion="1.0" 
    AutodeskProduct="Navisworks" 
    ProductType="Application" 
    Name="NOUFAL.NavisworksPlugin" 
    AppVersion="1.0.0" 
    Description="Export model data to NOUFAL platform" 
    Author="NOUFAL"
    ProductCode="{A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D}"
    UpgradeCode="{B2C3D4E5-F6A7-4B5C-8D9E-0F1A2B3C4D5E}">
  
  <CompanyDetails 
      Name="NOUFAL" 
      Url="https://noufal.com" 
      Email="support@noufal.com"/>
  
  <Components Description="NOUFAL Navisworks Plugin">
    <RuntimeRequirements 
        OS="Win64" 
        Platform="Navisworks" 
        SeriesMin="2021" 
        SeriesMax="2025"/>
    
    <ComponentEntry 
        AppName="NOUFAL.NavisworksPlugin" 
        ModuleName="./Contents/NOUFAL.NavisworksPlugin.dll" 
        AppDescription="Export to NOUFAL" 
        LoadOnCommandInvocation="True" 
        LoadOnRevitStartup="False"/>
  </Components>
</ApplicationPackage>
```

---

## ✅ التحقق من التثبيت

### 1. افتح Navisworks Manage
```
ابدأ → Autodesk → Navisworks Manage 2024
```

### 2. افتح ملف نموذج
```
افتح أي ملف: .nwf, .nwd, .nwc, أو Revit, IFC, إلخ
```

### 3. تحقق من ظهور الـ Plugin
```
- اذهب إلى: Add-Ins tab
- ابحث عن: "External Tools" panel
- يجب أن ترى: "Export to NOUFAL" button
```

### إذا لم يظهر الـ Plugin:

1. **تفعيل Developer Mode**
   ```
   Options → Interface → Developer
   ☑️ "Show application plugins"
   ```

2. **فحص نافذة Plugins**
   ```
   Add-Ins → Plugins
   ابحث عن: NOUFAL.NavisworksPlugin
   تحقق من عمود Status: يجب أن يكون "Loaded"
   ```

3. **فحص الأخطاء**
   ```
   إذا كان Status = "Failed to load"
   انقر على اسم الـ Plugin لرؤية رسالة الخطأ
   ```

---

## 🧪 الاختبار

### اختبار أساسي

1. **افتح نموذج في Navisworks**
2. **اضغط على "Export to NOUFAL"**
3. **أدخل معلومات الاختبار:**
   ```
   API URL: https://api.noufal.com
   Project ID: test-project-123
   ```
4. **اختر الخيارات:**
   ```
   ☑️ Include Geometry
   ☑️ Include Properties
   ```
5. **اضغط "Export"**

### اختبار متقدم (مع Debugger)

1. **في Visual Studio:**
   ```
   - انقر بزر الماوس الأيمن على المشروع
   - Properties → Debug tab
   - Start external program:
     C:\Program Files\Autodesk\Navisworks Manage 2024\Roamer.exe
   ```

2. **ضع Breakpoints:**
   ```
   - افتح NOUFALPlugin.cs
   - اضغط F9 على سطر في دالة Execute()
   ```

3. **ابدأ التصحيح:**
   ```
   - اضغط F5
   - سيفتح Navisworks مع الـ debugger متصل
   - استخدم الـ plugin وستتوقف عند Breakpoints
   ```

---

## 🔧 حل المشاكل الشائعة

### مشكلة: "Plugin لا يظهر في Navisworks"

**الحل:**
```bash
# 1. تحقق من مسار الملفات
dir "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle"

# 2. تحقق من وجود الملفات المطلوبة:
# - PackageContents.xml (في المجلد الرئيسي)
# - Contents\NOUFAL.NavisworksPlugin.dll
# - Contents\Newtonsoft.Json.dll

# 3. أعد تشغيل Navisworks
```

### مشكلة: "Could not load file Newtonsoft.Json"

**الحل:**
```bash
# انسخ جميع ملفات DLL من bin\Release:
copy bin\Release\*.dll "%APPDATA%\Autodesk\ApplicationPlugins\NOUFAL.NavisworksPlugin.bundle\Contents\"
```

### مشكلة: "Build failed - Cannot find Navisworks API"

**الحل:**
1. تحقق من تثبيت Navisworks
2. افتح `.csproj` وعدّل مسارات HintPath:
```xml
<HintPath>C:\Program Files\Autodesk\Navisworks Manage 2024\api\NET\Autodesk.Navisworks.Api.dll</HintPath>
```

### مشكلة: ".NET Framework 4.8 not found"

**الحل:**
```
1. حمّل .NET Framework 4.8 Developer Pack
   https://dotnet.microsoft.com/download/dotnet-framework/net48
2. ثبّته
3. أعد تشغيل Visual Studio
4. أعد البناء
```

---

## 📝 ملاحظات إضافية

### تحديث الإصدار

عند تحديث الـ plugin:
1. **زِد رقم الإصدار** في `AssemblyInfo.cs`:
   ```csharp
   [assembly: AssemblyVersion("1.1.0.0")]
   ```

2. **أعد البناء** (Release mode)

3. **انسخ الملفات الجديدة** للمجلد نفسه

4. **أعد تشغيل Navisworks**

### دعم إصدارات Navisworks مختلفة

لاستهداف Navisworks 2023 بدلاً من 2024:
1. **عدّل HintPath في .csproj**:
   ```xml
   <HintPath>C:\Program Files\Autodesk\Navisworks Manage 2023\api\NET\Autodesk.Navisworks.Api.dll</HintPath>
   ```

2. **عدّل PackageContents.xml**:
   ```xml
   <RuntimeRequirements SeriesMin="2021" SeriesMax="2024"/>
   ```

---

## 📞 الدعم الفني

إذا واجهت مشاكل:
- **البريد الإلكتروني:** support@noufal.com
- **التوثيق:** https://docs.noufal.com/navisworks-plugin
- **GitHub Issues:** [repository-url]/issues

---

## ✅ قائمة التحقق النهائية

قبل الإصدار النهائي، تحقق من:

- [ ] بناء ناجح في وضع Release
- [ ] جميع ملفات DLL موجودة في مجلد الـ plugin
- [ ] PackageContents.xml صحيح
- [ ] الـ plugin يظهر في Navisworks
- [ ] التصدير يعمل بشكل صحيح
- [ ] معالجة الأخطاء تعمل
- [ ] شريط التقدم يعمل
- [ ] الإلغاء يعمل
- [ ] رسائل النجاح/الفشل صحيحة
- [ ] README.md محدّث
- [ ] رقم الإصدار صحيح في AssemblyInfo.cs

---

**آخر تحديث:** 2024-11-14  
**الإصدار:** 1.0.0
