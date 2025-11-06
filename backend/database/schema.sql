-- ============================================
-- قاعدة بيانات نظام نوفل الهندسي الشامل
-- Noufal Engineering System Database
-- ============================================

-- 1️⃣ جدول معدلات الإنتاجية
CREATE TABLE IF NOT EXISTS productivity_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    rate_per_unit REAL NOT NULL,
    crew_size INTEGER,
    equipment_needed TEXT,
    complexity_factor REAL DEFAULT 1.0,
    weather_factor REAL DEFAULT 1.0,
    priority INTEGER DEFAULT 5,
    source VARCHAR(100),
    last_updated DATE DEFAULT CURRENT_DATE,
    notes TEXT
);

-- 2️⃣ جدول قاموس التصنيف (3 طبقات)
CREATE TABLE IF NOT EXISTS classification_dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword VARCHAR(200) NOT NULL,
    tier1_category VARCHAR(50),
    tier2_subcategory VARCHAR(50),
    tier3_specification VARCHAR(100),
    priority INTEGER DEFAULT 5,
    confidence_score REAL DEFAULT 0.8,
    alternative_keywords TEXT,
    notes TEXT
);

-- 3️⃣ جدول المشاريع
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name VARCHAR(200) NOT NULL,
    project_code VARCHAR(50) UNIQUE,
    client_name VARCHAR(200),
    location VARCHAR(200),
    start_date DATE,
    planned_end_date DATE,
    budget REAL,
    project_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Planning',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 4️⃣ جدول الملفات المرفوعة
CREATE TABLE IF NOT EXISTS uploaded_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT 0,
    processing_status VARCHAR(50),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 5️⃣ جدول البنود المحللة
CREATE TABLE IF NOT EXISTS analyzed_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    file_id INTEGER,
    item_number VARCHAR(50),
    item_description TEXT NOT NULL,
    quantity REAL,
    unit VARCHAR(20),
    tier1_category VARCHAR(50),
    tier2_subcategory VARCHAR(50),
    tier3_specification VARCHAR(100),
    unit_price REAL,
    total_price REAL,
    analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES uploaded_files(id) ON DELETE CASCADE
);

-- 6️⃣ جدول الأنشطة المولدة
CREATE TABLE IF NOT EXISTS generated_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    item_id INTEGER,
    activity_name VARCHAR(200) NOT NULL,
    activity_type VARCHAR(100),
    quantity REAL,
    unit VARCHAR(20),
    duration_days REAL NOT NULL,
    early_start INTEGER,
    early_finish INTEGER,
    late_start INTEGER,
    late_finish INTEGER,
    total_float INTEGER,
    is_critical BOOLEAN DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Planned',
    progress_percent REAL DEFAULT 0,
    crew_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES analyzed_items(id) ON DELETE SET NULL
);

-- الفهارس (Indexes) لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_productivity_activity ON productivity_rates(activity_type, category);
CREATE INDEX IF NOT EXISTS idx_classification_keyword ON classification_dictionary(keyword);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_activities_project ON generated_activities(project_id);
