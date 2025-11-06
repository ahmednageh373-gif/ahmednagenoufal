# 🔧 دليل استكشاف أخطاء النشر

## 🚨 المشكلة: الصفحة البيضاء على Netlify

### الأعراض:
- ✅ الموقع يُحمل (العنوان يظهر)
- ❌ الصفحة بيضاء تماماً (بدون محتوى)
- ⏱️ Timeout بعد 30+ ثانية

---

## 🔍 خطوات التشخيص

### 1. تحقق من صفحة الاختبار

افتح: `https://anaiahmednagehnoufal.netlify.app/test.html`

**ماذا يجب أن ترى:**
- ✅ صفحة ملونة مع "صفحة اختبار نظام NOUFAL"
- ✅ قائمة بحالة الملفات (✅ أو ❌)

**إذا كانت صفحة test.html لا تعمل:**
→ مشكلة في النشر نفسه (Netlify لم ينشر الملفات)

### 2. افحص Console في المتصفح

افتح DevTools (F12) → Console

**الأخطاء المحتملة:**

| الخطأ | السبب | الحل |
|------|------|------|
| `Failed to load module` | ملفات assets مفقودة | أعد النشر |
| `import maps not supported` | المتصفح قديم | حدّث المتصفح |
| `TypeError: Cannot read...` | JavaScript error | افحص الكود |
| `404 Not Found` | مسار خاطئ | افحص _redirects |

### 3. افحص Network Tab

DevTools → Network → Reload

**افحص هذه الملفات:**
- ✅ `/` (index.html) → يجب 200 OK
- ✅ `/assets/index-C9Cw9Gwo.js` → يجب 200 OK
- ✅ `/assets/index-CrruL3fV.css` → يجب 200 OK

**إذا كانت 404:**
→ Netlify لم يبني المشروع بشكل صحيح

---

## 🛠️ الحلول المقترحة

### الحل 1: إعادة Deploy يدوياً على Netlify

1. اذهب إلى [Netlify Dashboard](https://app.netlify.com/)
2. افتح مشروعك `anaiahmednagehnoufal`
3. اضغط **"Deploys"** في القائمة الجانبية
4. اضغط **"Trigger deploy"** → **"Clear cache and deploy site"**
5. انتظر 2-3 دقائق

### الحل 2: فحص Build Log على Netlify

1. اذهب إلى **"Deploys"**
2. افتح آخر deploy (الأخضر أو الأحمر)
3. افحص الـ log للأخطاء

**الأخطاء الشائعة:**

```bash
# خطأ 1: npm install failed
❌ Error: Cannot find module 'react'
✅ الحل: تأكد من package.json صحيح

# خطأ 2: Build failed
❌ Error: vite build failed
✅ الحل: افحص vite.config.ts

# خطأ 3: Out of memory
❌ JavaScript heap out of memory
✅ الحل: أضف NODE_OPTIONS=--max_old_space_size=4096
```

### الحل 3: فحص البناء المحلي

```bash
cd /home/user/webapp

# 1. نظّف كل شيء
rm -rf dist node_modules

# 2. أعد التثبيت
npm install

# 3. ابنِ المشروع
npm run build

# 4. تحقق من الملفات
python test_build.py

# 5. اختبر محلياً
npm run preview
# ثم افتح http://localhost:4173
```

### الحل 4: تحديث الإعدادات على Netlify Dashboard

اذهب إلى **Site settings** → **Build & deploy**:

```
Build command: npm install && npm run build
Publish directory: dist
Node version: 20
```

### الحل 5: إضافة Environment Variables

في Netlify Dashboard → **Site settings** → **Environment variables**:

```
NODE_VERSION=20
NPM_VERSION=10
CI=true
```

---

## 📋 Checklist التحقق

قبل أن تسأل عن المساعدة، تأكد من:

- [ ] `git push origin main` تم تنفيذه بنجاح
- [ ] Netlify اكتشف التحديث (راجع Deploys)
- [ ] Build log لا يحتوي على أخطاء
- [ ] `test.html` تعمل بشكل صحيح
- [ ] `npm run build` يعمل محلياً بدون أخطاء
- [ ] `python test_build.py` يُظهر ✅ لجميع الملفات
- [ ] المتصفح محدّث (Chrome/Edge/Firefox آخر إصدار)
- [ ] تم مسح cache المتصفح (Ctrl+Shift+R)

---

## 🔬 الاختبارات المتقدمة

### اختبار 1: فحص الملفات مباشرة

```bash
# افتح هذه الروابط في المتصفح:
https://anaiahmednagehnoufal.netlify.app/
https://anaiahmednagehnoufal.netlify.app/test.html
https://anaiahmednagehnoufal.netlify.app/_redirects
https://anaiahmednagehnoufal.netlify.app/_headers
https://anaiahmednagehnoufal.netlify.app/assets/
```

**النتائج المتوقعة:**
- `/` → يجب أن تُحمل الصفحة الرئيسية
- `/test.html` → يجب أن تُحمل صفحة الاختبار
- `/_redirects` → يجب أن تُظهر نص الملف
- `/_headers` → يجب أن تُظهر نص الملف
- `/assets/` → 404 (طبيعي - لا directory listing)

### اختبار 2: فحص Headers

```bash
curl -I https://anaiahmednagehnoufal.netlify.app/

# يجب أن ترى:
# HTTP/2 200
# content-type: text/html
# x-nf-request-id: ...
```

### اختبار 3: فحص Assets

```bash
curl -I https://anaiahmednagehnoufal.netlify.app/assets/index-C9Cw9Gwo.js

# يجب أن ترى:
# HTTP/2 200
# content-type: text/javascript
# cache-control: public, max-age=31536000, immutable
```

---

## 🐛 الأخطاء الشائعة والحلول

### 1. "Blank page with loading spinner"

**السبب:** React لا يُحمل

**الحل:**
```bash
# 1. افحص Console للأخطاء
# 2. تأكد من أن React محزوم في bundle
grep -i "react" dist/assets/index-*.js
# يجب أن ترى: react.production.js
```

### 2. "Page loads but components don't work"

**السبب:** JavaScript errors في الكود

**الحل:**
```bash
# افحص TypeScript errors
npm run build
# إذا كانت هناك أخطاء، أصلحها أولاً
```

### 3. "404 on page refresh"

**السبب:** `_redirects` لا يعمل

**الحل:**
```bash
# تأكد من وجود الملف
cat dist/_redirects
# يجب أن يحتوي على: /*    /index.html   200

# إذا لم يكن موجوداً:
echo "/*    /index.html   200" > public/_redirects
npm run build
```

### 4. "Assets take too long to load"

**السبب:** Bundle كبير جداً

**الحل:**
```javascript
// في vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
        }
      }
    }
  }
})
```

---

## 📞 طلب المساعدة

إذا جربت كل شيء ولم ينجح، أرسل المعلومات التالية:

### معلومات مطلوبة:

1. **رابط الموقع:**
   ```
   https://anaiahmednagehnoufal.netlify.app/
   ```

2. **آخر commit:**
   ```bash
   git log --oneline -1
   # انسخ النتيجة
   ```

3. **Build log من Netlify:**
   - اذهب إلى Deploys → افتح آخر deploy
   - انسخ آخر 50 سطر من الـ log

4. **Console errors:**
   - افتح DevTools → Console
   - التقط screenshot للأخطاء

5. **Network errors:**
   - افتح DevTools → Network
   - افحص الملفات الحمراء (404)
   - انسخ أسماء الملفات المفقودة

---

## ✅ التأكد من النجاح

### علامات النجاح:

- ✅ صفحة الاختبار تعمل: `/test.html`
- ✅ جميع Assets تُحمل (200 OK)
- ✅ لا أخطاء في Console
- ✅ الصفحة الرئيسية تُحمل خلال < 5 ثواني
- ✅ يمكن التنقل بين الصفحات بدون refresh
- ✅ SPA routing يعمل (لا 404 على refresh)

### اختبار نهائي:

```bash
# افتح كل هذه الروابط - يجب أن تعمل جميعها:
https://anaiahmednagehnoufal.netlify.app/
https://anaiahmednagehnoufal.netlify.app/dashboard
https://anaiahmednagehnoufal.netlify.app/schedule
https://anaiahmednagehnoufal.netlify.app/financial
https://anaiahmednagehnoufal.netlify.app/test.html
```

---

## 🚀 الخطوات النهائية

إذا وصلت هنا ولم يعمل شيء:

1. **احذف المشروع من Netlify وابدأ من جديد:**
   - Site settings → Delete site
   - أعد إنشاء المشروع من GitHub

2. **جرب منصة أخرى:**
   - [Vercel](https://vercel.com/) (بديل ممتاز)
   - [Cloudflare Pages](https://pages.cloudflare.com/)
   - [GitHub Pages](https://pages.github.com/)

3. **تواصل مع Netlify Support:**
   - [Netlify Support](https://answers.netlify.com/)
   - قدّم جميع المعلومات المذكورة أعلاه

---

**آخر تحديث:** 2025-11-03  
**الحالة:** تحت الاختبار  
**Commit:** c818b1f

---

## 📚 موارد إضافية

- [Netlify Docs - SPA Configuration](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
- [Vite Docs - Building for Production](https://vitejs.dev/guide/build.html)
- [React Docs - Deployment](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
