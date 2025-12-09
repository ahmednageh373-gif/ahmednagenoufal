-- ═══════════════════════════════════════════════════════════════
-- نظام قاعدة البيانات المتكامل: BOQ + WBS + CPM + EVM
-- Integrated Database Schema: BOQ + WBS + CPM + EVM
-- تاريخ الإنشاء: 2025-11-09
-- الإصدار: 1.0
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1️⃣ جدول المشاريع (Projects)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT,
    location TEXT,
    client_name TEXT,
    contractor_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    total_duration_days INTEGER,
    currency TEXT DEFAULT 'SAR',
    total_budget DECIMAL(15, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster queries
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_start_date ON projects(start_date);

COMMENT ON TABLE projects IS 'جدول المشاريع - مشروع واحد يحتوي على عدة بنود مقايسة';

-- ═══════════════════════════════════════════════════════════════
-- 2️⃣ جدول بنود المقايسة (BOQ Items)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS boq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    description_en TEXT,
    category TEXT,
    unit TEXT NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    specification TEXT,
    drawings_ref TEXT,
    supplier_name TEXT,
    supplier_price DECIMAL(15, 2),
    lead_time_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_boq_items_project ON boq_items(project_id);
CREATE INDEX idx_boq_items_code ON boq_items(code);
CREATE INDEX idx_boq_items_category ON boq_items(category);
CREATE UNIQUE INDEX idx_boq_items_project_code ON boq_items(project_id, code);

COMMENT ON TABLE boq_items IS 'بنود المقايسة - مستخرج من ملف BOQ';

-- ═══════════════════════════════════════════════════════════════
-- 3️⃣ جدول الأنشطة الفرعية (WBS Activities)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS wbs_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_item_id UUID NOT NULL REFERENCES boq_items(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    activity_name_en TEXT,
    activity_type TEXT DEFAULT 'normal' CHECK (activity_type IN ('critical', 'non_critical', 'precise', 'external', 'normal')),
    unit TEXT NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    productivity_rate DECIMAL(10, 3),
    productivity_unit TEXT,
    crew_description TEXT,
    crew_skilled INTEGER DEFAULT 0,
    crew_unskilled INTEGER DEFAULT 0,
    crew_supervisor BOOLEAN DEFAULT false,
    equipment TEXT,
    duration_days DECIMAL(10, 2) NOT NULL,
    cost_riyal DECIMAL(15, 2) NOT NULL,
    weight_percent DECIMAL(5, 2) NOT NULL,
    risk_buffer_percent DECIMAL(5, 2) DEFAULT 3.0,
    logic_links JSONB DEFAULT '[]'::jsonb,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wbs_activities_boq_item ON wbs_activities(boq_item_id);
CREATE INDEX idx_wbs_activities_code ON wbs_activities(code);
CREATE INDEX idx_wbs_activities_type ON wbs_activities(activity_type);

COMMENT ON TABLE wbs_activities IS 'الأنشطة الفرعية - التفكيك إلى أنشطة دقيقة (WBS Level-3)';

-- ═══════════════════════════════════════════════════════════════
-- 4️⃣ جدول الجدول الزمني (Schedule Tasks)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS schedule_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES wbs_activities(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days DECIMAL(10, 2) NOT NULL,
    early_start DATE,
    early_finish DATE,
    late_start DATE,
    late_finish DATE,
    total_float DECIMAL(10, 2) DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    predecessors JSONB DEFAULT '[]'::jsonb,
    successors JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed', 'on_hold')),
    completion_percent DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schedule_tasks_activity ON schedule_tasks(activity_id);
CREATE INDEX idx_schedule_tasks_project ON schedule_tasks(project_id);
CREATE INDEX idx_schedule_tasks_dates ON schedule_tasks(start_date, end_date);
CREATE INDEX idx_schedule_tasks_critical ON schedule_tasks(is_critical);

COMMENT ON TABLE schedule_tasks IS 'الجدول الزمني - مهام CPM مع ES/EF/LS/LF/TF';

-- ═══════════════════════════════════════════════════════════════
-- 5️⃣ جدول التقويم (Calendar)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS project_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    calendar_date DATE NOT NULL,
    is_working_day BOOLEAN DEFAULT true,
    day_type TEXT DEFAULT 'normal' CHECK (day_type IN ('normal', 'weekend', 'holiday', 'weather_delay', 'custom')),
    weather_delay BOOLEAN DEFAULT false,
    holiday_delay BOOLEAN DEFAULT false,
    ramadan BOOLEAN DEFAULT false,
    shift_count INTEGER DEFAULT 1 CHECK (shift_count IN (1, 2, 3)),
    productivity_factor DECIMAL(5, 2) DEFAULT 1.0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_project ON project_calendar(project_id);
CREATE INDEX idx_calendar_date ON project_calendar(calendar_date);
CREATE INDEX idx_calendar_working ON project_calendar(is_working_day);
CREATE UNIQUE INDEX idx_calendar_project_date ON project_calendar(project_id, calendar_date);

COMMENT ON TABLE project_calendar IS 'تقويم العمل - أيام العمل والعطلات والتأخيرات';

-- ═══════════════════════════════════════════════════════════════
-- 6️⃣ جدول التقدم الفعلي (Progress)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS activity_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES wbs_activities(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    physical_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(15, 3) DEFAULT 0,
    actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(15, 2) DEFAULT 0,
    material_cost DECIMAL(15, 2) DEFAULT 0,
    equipment_cost DECIMAL(15, 2) DEFAULT 0,
    indirect_cost DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    location_lat DECIMAL(10, 7),
    location_lng DECIMAL(10, 7),
    quality_status TEXT DEFAULT 'good' CHECK (quality_status IN ('excellent', 'good', 'acceptable', 'poor', 'rejected')),
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_progress_activity ON activity_progress(activity_id);
CREATE INDEX idx_progress_date ON activity_progress(snapshot_date);
CREATE INDEX idx_progress_activity_date ON activity_progress(activity_id, snapshot_date);

COMMENT ON TABLE activity_progress IS 'التقدم الفعلي - يُدخل أسبوعياً من الموقع';

-- ═══════════════════════════════════════════════════════════════
-- 7️⃣ جدول مؤشرات EVM (EVM Indicators)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS evm_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES wbs_activities(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    planned_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    earned_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    cost_variance DECIMAL(15, 2) GENERATED ALWAYS AS (earned_value - actual_cost) STORED,
    schedule_variance DECIMAL(15, 2) GENERATED ALWAYS AS (earned_value - planned_value) STORED,
    cost_performance_index DECIMAL(10, 4) DEFAULT 0,
    schedule_performance_index DECIMAL(10, 4) DEFAULT 0,
    estimate_at_completion DECIMAL(15, 2) DEFAULT 0,
    estimate_to_complete DECIMAL(15, 2) DEFAULT 0,
    variance_at_completion DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evm_activity ON evm_indicators(activity_id);
CREATE INDEX idx_evm_date ON evm_indicators(snapshot_date);
CREATE UNIQUE INDEX idx_evm_activity_date ON evm_indicators(activity_id, snapshot_date);

COMMENT ON TABLE evm_indicators IS 'مؤشرات القيمة المكتسبة - يُحسب تلقائياً من Progress';

-- ═══════════════════════════════════════════════════════════════
-- 8️⃣ جدول ملخص المشروع (Project Summary)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS project_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_budget DECIMAL(15, 2) NOT NULL,
    total_pv DECIMAL(15, 2) DEFAULT 0,
    total_ev DECIMAL(15, 2) DEFAULT 0,
    total_ac DECIMAL(15, 2) DEFAULT 0,
    project_cpi DECIMAL(10, 4) DEFAULT 0,
    project_spi DECIMAL(10, 4) DEFAULT 0,
    project_eac DECIMAL(15, 2) DEFAULT 0,
    project_etc DECIMAL(15, 2) DEFAULT 0,
    project_vac DECIMAL(15, 2) DEFAULT 0,
    completion_percent DECIMAL(5, 2) DEFAULT 0,
    days_elapsed INTEGER DEFAULT 0,
    days_remaining INTEGER DEFAULT 0,
    critical_path_duration DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_summary_project ON project_summary(project_id);
CREATE INDEX idx_summary_date ON project_summary(snapshot_date);
CREATE UNIQUE INDEX idx_summary_project_date ON project_summary(project_id, snapshot_date);

COMMENT ON TABLE project_summary IS 'ملخص المشروع اليومي - إجماليات EVM للمشروع كله';

-- ═══════════════════════════════════════════════════════════════
-- 9️⃣ Views للتقارير السريعة
-- ═══════════════════════════════════════════════════════════════

-- View: آخر حالة لكل نشاط
CREATE OR REPLACE VIEW latest_activity_status AS
SELECT DISTINCT ON (ap.activity_id)
    ap.activity_id,
    wa.activity_name,
    wa.code,
    ap.snapshot_date,
    ap.physical_percent,
    ap.actual_cost,
    evm.planned_value,
    evm.earned_value,
    evm.cost_performance_index,
    evm.schedule_performance_index
FROM activity_progress ap
JOIN wbs_activities wa ON ap.activity_id = wa.id
LEFT JOIN evm_indicators evm ON evm.activity_id = ap.activity_id AND evm.snapshot_date = ap.snapshot_date
ORDER BY ap.activity_id, ap.snapshot_date DESC;

-- View: المهام الحرجة المتأخرة
CREATE OR REPLACE VIEW critical_delayed_tasks AS
SELECT 
    st.id,
    st.project_id,
    wa.activity_name,
    st.start_date,
    st.end_date,
    st.completion_percent,
    st.total_float,
    (st.end_date < CURRENT_DATE AND st.completion_percent < 100) AS is_delayed
FROM schedule_tasks st
JOIN wbs_activities wa ON st.activity_id = wa.id
WHERE st.is_critical = true
  AND st.status != 'completed'
  AND (st.end_date < CURRENT_DATE AND st.completion_percent < 100);

-- View: ملخص BOQ مع التكلفة الفعلية
CREATE OR REPLACE VIEW boq_with_actuals AS
SELECT 
    bi.id,
    bi.project_id,
    bi.code,
    bi.description,
    bi.quantity,
    bi.unit_price,
    bi.total_price AS planned_cost,
    COALESCE(SUM(ap.actual_cost), 0) AS actual_cost,
    bi.total_price - COALESCE(SUM(ap.actual_cost), 0) AS cost_variance
FROM boq_items bi
LEFT JOIN wbs_activities wa ON wa.boq_item_id = bi.id
LEFT JOIN activity_progress ap ON ap.activity_id = wa.id
GROUP BY bi.id, bi.code, bi.description, bi.quantity, bi.unit_price, bi.total_price;

-- ═══════════════════════════════════════════════════════════════
-- 🔟 Functions لحساب EVM تلقائياً
-- ═══════════════════════════════════════════════════════════════

-- Function: حساب PV, EV, AC لنشاط واحد
CREATE OR REPLACE FUNCTION calculate_evm_for_activity(
    p_activity_id UUID,
    p_snapshot_date DATE
) RETURNS TABLE(
    planned_value DECIMAL,
    earned_value DECIMAL,
    actual_cost DECIMAL,
    cpi DECIMAL,
    spi DECIMAL
) AS $$
DECLARE
    v_weight_percent DECIMAL;
    v_boq_total_cost DECIMAL;
    v_project_start DATE;
    v_project_duration INTEGER;
    v_days_elapsed INTEGER;
    v_time_progress DECIMAL;
    v_physical_percent DECIMAL;
    v_actual_cost DECIMAL;
    v_pv DECIMAL;
    v_ev DECIMAL;
    v_cpi DECIMAL;
    v_spi DECIMAL;
BEGIN
    -- جلب البيانات الأساسية
    SELECT 
        wa.weight_percent,
        bi.total_price,
        p.start_date,
        p.total_duration_days
    INTO 
        v_weight_percent,
        v_boq_total_cost,
        v_project_start,
        v_project_duration
    FROM wbs_activities wa
    JOIN boq_items bi ON wa.boq_item_id = bi.id
    JOIN projects p ON bi.project_id = p.id
    WHERE wa.id = p_activity_id;
    
    -- حساب الوقت المنقضي
    v_days_elapsed := p_snapshot_date - v_project_start;
    v_time_progress := v_days_elapsed::DECIMAL / NULLIF(v_project_duration, 0);
    
    -- جلب التقدم الفعلي
    SELECT 
        COALESCE(ap.physical_percent, 0),
        COALESCE(ap.actual_cost, 0)
    INTO 
        v_physical_percent,
        v_actual_cost
    FROM activity_progress ap
    WHERE ap.activity_id = p_activity_id
      AND ap.snapshot_date = p_snapshot_date;
    
    -- حساب PV
    v_pv := (v_weight_percent / 100.0) * v_boq_total_cost * v_time_progress;
    
    -- حساب EV
    v_ev := (v_weight_percent / 100.0) * v_boq_total_cost * (v_physical_percent / 100.0);
    
    -- حساب CPI و SPI
    v_cpi := CASE WHEN v_actual_cost > 0 THEN v_ev / v_actual_cost ELSE 0 END;
    v_spi := CASE WHEN v_pv > 0 THEN v_ev / v_pv ELSE 0 END;
    
    -- إرجاع النتائج
    RETURN QUERY SELECT v_pv, v_ev, v_actual_cost, v_cpi, v_spi;
END;
$$ LANGUAGE plpgsql;

-- Function: تحديث مؤشرات EVM عند إدخال تقدم جديد
CREATE OR REPLACE FUNCTION update_evm_on_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_pv DECIMAL;
    v_ev DECIMAL;
    v_ac DECIMAL;
    v_cpi DECIMAL;
    v_spi DECIMAL;
    v_boq_total_cost DECIMAL;
BEGIN
    -- حساب EVM
    SELECT * INTO v_pv, v_ev, v_ac, v_cpi, v_spi
    FROM calculate_evm_for_activity(NEW.activity_id, NEW.snapshot_date);
    
    -- جلب التكلفة الإجمالية للبند
    SELECT bi.total_price INTO v_boq_total_cost
    FROM wbs_activities wa
    JOIN boq_items bi ON wa.boq_item_id = bi.id
    WHERE wa.id = NEW.activity_id;
    
    -- إدخال أو تحديث المؤشرات
    INSERT INTO evm_indicators (
        activity_id,
        snapshot_date,
        planned_value,
        earned_value,
        actual_cost,
        cost_performance_index,
        schedule_performance_index,
        estimate_at_completion,
        estimate_to_complete,
        variance_at_completion
    ) VALUES (
        NEW.activity_id,
        NEW.snapshot_date,
        v_pv,
        v_ev,
        v_ac,
        v_cpi,
        v_spi,
        CASE WHEN v_cpi > 0 THEN v_boq_total_cost / v_cpi ELSE v_boq_total_cost END,
        CASE WHEN v_cpi > 0 THEN (v_boq_total_cost / v_cpi) - v_ac ELSE 0 END,
        v_boq_total_cost - CASE WHEN v_cpi > 0 THEN v_boq_total_cost / v_cpi ELSE v_boq_total_cost END
    )
    ON CONFLICT (activity_id, snapshot_date) DO UPDATE SET
        planned_value = EXCLUDED.planned_value,
        earned_value = EXCLUDED.earned_value,
        actual_cost = EXCLUDED.actual_cost,
        cost_performance_index = EXCLUDED.cost_performance_index,
        schedule_performance_index = EXCLUDED.schedule_performance_index,
        estimate_at_completion = EXCLUDED.estimate_at_completion,
        estimate_to_complete = EXCLUDED.estimate_to_complete,
        variance_at_completion = EXCLUDED.variance_at_completion;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: تشغيل حساب EVM عند إدخال تقدم
CREATE TRIGGER trigger_update_evm_on_progress
AFTER INSERT OR UPDATE ON activity_progress
FOR EACH ROW
EXECUTE FUNCTION update_evm_on_progress();

-- ═══════════════════════════════════════════════════════════════
-- 1️⃣1️⃣ Seed Data (بيانات اختبارية)
-- ═══════════════════════════════════════════════════════════════

-- إدخال مشروع تجريبي
INSERT INTO projects (name, name_en, location, start_date, total_duration_days, total_budget, status)
VALUES (
    'مشروع فيلا سكنية - الرياض',
    'Residential Villa Project - Riyadh',
    'الرياض - حي النرجس',
    '2025-01-01',
    90,
    1200000.00,
    'active'
) ON CONFLICT DO NOTHING;

COMMENT ON DATABASE postgres IS 'نظام إدارة المشاريع الإنشائية المتكامل - Construction Project Management System';

-- ═══════════════════════════════════════════════════════════════
-- ✅ انتهى Schema
-- ═══════════════════════════════════════════════════════════════
