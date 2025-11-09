# 🚀 دليل إعداد Supabase - خطوة بخطوة

## ✅ **تم تثبيت المكتبة:**
```bash
npm install @supabase/supabase-js ✅
```

---

## 📝 **الخطوة 1: إنشاء حساب Supabase**

### 1. اذهب إلى:
```
https://supabase.com
```

### 2. اضغط "Start your project"

### 3. سجل دخول بـ GitHub:
- اضغط "Continue with GitHub"
- وافق على الصلاحيات

### 4. أنشئ Organization جديد:
- اسم Organization: `AhmedNageh` (أو أي اسم تريده)

### 5. أنشئ Project جديد:
- **Name**: `noufal-projects`
- **Database Password**: اختر كلمة مرور قوية (احفظها!)
- **Region**: `Central EU (Frankfurt)` (الأقرب للسعودية)
- **Pricing Plan**: `Free` ✅

### 6. انتظر 2-3 دقائق حتى يتم إنشاء المشروع

---

## 🔑 **الخطوة 2: الحصول على API Keys**

### 1. بعد إنشاء المشروع، اذهب إلى:
```
Settings → API
```

### 2. ستجد:
- **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. انسخهما (ستحتاجهما في الخطوة 4)

---

## 🗄️ **الخطوة 3: إنشاء Database Schema**

### 1. اذهب إلى:
```
SQL Editor
```

### 2. انسخ والصق هذا الكود:

```sql
-- جدول المشاريع
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for better performance
  CONSTRAINT projects_name_check CHECK (char_length(name) >= 1)
);

-- فهارس للأداء
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_status ON projects(status);

-- Row Level Security (RLS) - الأمان
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدم برؤية مشاريعه فقط
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- السماح للمستخدم بإضافة مشاريع
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدم بتحديث مشاريعه
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدم بحذف مشاريعه
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- جدول المشاركات (للمستقبل)
CREATE TABLE project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT DEFAULT 'read', -- read, write, admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, shared_with_user_id)
);

-- RLS for shares
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares"
  ON project_shares FOR SELECT
  USING (
    auth.uid() = shared_with_user_id OR
    auth.uid() IN (
      SELECT user_id FROM projects WHERE id = project_id
    )
  );
```

### 3. اضغط "Run" أو F5

### 4. يجب أن ترى رسالة: ✅ **Success. No rows returned**

---

## 🔐 **الخطوة 4: إضافة API Keys إلى Netlify**

### 1. اذهب إلى Netlify Dashboard:
```
https://app.netlify.com/sites/anaiahmednagehnoufal/settings/env
```

### 2. اضغط "Add a variable"

### 3. أضف هذين المتغيرين:

**المتغير الأول:**
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://xxxxxxxxxxxxx.supabase.co` (من الخطوة 2)
- **Scopes**: ✅ All scopes

**المتغير الثاني:**
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (من الخطوة 2)
- **Scopes**: ✅ All scopes

### 4. اضغط "Save"

---

## 💻 **الخطوة 5: للتطوير المحلي**

### 1. أنشئ ملف `.env.local` في المجلد الرئيسي:

```bash
# في المجلد: /home/user/webapp/
echo "VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." >> .env.local
```

### 2. أضف `.env.local` إلى `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

⚠️ **مهم جداً**: لا ترفع `.env.local` إلى GitHub!

---

## 🎯 **الخطوة 6: تفعيل Google Authentication (اختياري)**

### 1. في Supabase Dashboard:
```
Authentication → Providers → Google
```

### 2. شغّل "Google enabled"

### 3. احصل على Google OAuth credentials:
- اذهب إلى: https://console.cloud.google.com/
- أنشئ مشروع جديد
- فعّل "Google+ API"
- أنشئ "OAuth 2.0 Client ID"
- Type: `Web application`
- Authorized redirect URIs: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`

### 4. انسخ:
- **Client ID**
- **Client Secret**

### 5. ضعهما في Supabase:
- الصق في حقول Google Provider
- Save

---

## 🧪 **الخطوة 7: اختبار الاتصال**

### 1. افتح Developer Console (F12) في موقعك

### 2. اكتب:
```javascript
import { supabase } from './lib/supabase';
await supabase.from('projects').select('count');
```

### 3. يجب أن ترى:
```json
{ data: [ { count: 0 } ], error: null }
```

---

## ✅ **اختبار كامل للنظام:**

### 1. تسجيل حساب جديد:
```typescript
import { signUp } from './lib/supabase';
await signUp('test@example.com', 'password123', 'Ahmed Nageh');
```

### 2. تسجيل الدخول:
```typescript
import { signIn } from './lib/supabase';
await signIn('test@example.com', 'password123');
```

### 3. إنشاء مشروع:
```typescript
import { createProject } from './services/projectService';
await createProject({
  name: 'مشروع تجريبي',
  description: 'اختبار النظام',
  status: 'active',
  data: {}
});
```

### 4. قراءة المشاريع:
```typescript
import { getUserProjects } from './services/projectService';
const projects = await getUserProjects();
console.log(projects);
```

---

## 📊 **إحصائيات وحدود الخطة المجانية:**

| الميزة | الحد المجاني |
|--------|--------------|
| **Database Storage** | 500 MB |
| **File Storage** | 1 GB |
| **Bandwidth** | 2 GB/شهر |
| **API Requests** | 50,000/شهر |
| **Users** | غير محدود |
| **Projects** | 2 مشروع |

---

## 🔧 **استكشاف الأخطاء:**

### خطأ: "Invalid API Key"
- ✅ تأكد من نسخ الـ anon key بالكامل
- ✅ تأكد من إضافته في Netlify Environment Variables

### خطأ: "Row Level Security"
- ✅ تأكد من تشغيل SQL script في الخطوة 3
- ✅ تأكد من تسجيل الدخول أولاً

### خطأ: "CORS"
- ✅ في Supabase: Settings → API → CORS
- ✅ أضف `https://www.ahmednagehnoufal.com`

---

## 🎉 **بعد الإعداد:**

### ستتمكن من:
- ✅ تسجيل المستخدمين
- ✅ تسجيل الدخول/الخروج
- ✅ حفظ المشاريع في Database حقيقي
- ✅ مزامنة البيانات بين الأجهزة
- ✅ مشاركة المشاريع مع الآخرين
- ✅ نسخ احتياطي تلقائي

---

## 📞 **هل تحتاج مساعدة؟**

أخبرني في أي خطوة أنت، وسأساعدك! 🚀

---

**آخر تحديث:** 2025-11-09  
**الإصدار:** 1.0  
**الحالة:** ✅ جاهز للتطبيق
