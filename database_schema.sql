-- ============================================
-- Database Schema for NOUFAL Project
-- Created: 2025-11-09
-- ============================================

-- جدول المشاريع
-- Projects table with user isolation
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس للأداء
-- Performance indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================
-- Row Level Security (RLS)
-- حماية البيانات - كل مستخدم يرى بياناته فقط
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدم برؤية مشاريعه فقط
-- Users can only view their own projects
CREATE POLICY "Users view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- السماح للمستخدم بإنشاء مشاريع جديدة
-- Users can insert their own projects
CREATE POLICY "Users insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدم بتعديل مشاريعه فقط
-- Users can update their own projects
CREATE POLICY "Users update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- السماح للمستخدم بحذف مشاريعه فقط
-- Users can delete their own projects
CREATE POLICY "Users delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Automatic Triggers
-- محفزات تلقائية
-- ============================================

-- تحديث تاريخ التعديل تلقائياً
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Verification Queries (optional)
-- استعلامات التحقق
-- ============================================

-- للتحقق من إنشاء الجدول بنجاح:
-- To verify table creation:
-- SELECT * FROM projects LIMIT 1;

-- للتحقق من RLS:
-- To verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'projects';

-- ============================================
-- Success Message
-- ============================================
-- إذا رأيت "Success. No rows returned" = تم بنجاح! ✅
-- If you see "Success. No rows returned" = Success! ✅
