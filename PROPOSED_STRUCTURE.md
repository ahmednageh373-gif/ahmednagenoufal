# 🗂️ البنية المقترحة للمشروع - Proposed Project Structure

## نظرة عامة

هذا المستند يوضح البنية المقترحة الجديدة لنظام NOUFAL الهندسي المتكامل.

---

## 📁 الهيكل الكامل

```
noufal-engineering-system/
│
├── 📂 backend/                           # Backend (Python/Flask)
│   │
│   ├── 📂 core/                          # الأنظمة الأساسية (12 نظام)
│   │   ├── __init__.py
│   │   ├── ExcelIntelligence.py         # ✅ موجود
│   │   ├── ItemClassifier.py            # ✅ موجود
│   │   ├── ProductivityDatabase.py      # ✅ موجود
│   │   ├── ItemAnalyzer.py              # ✅ موجود
│   │   ├── RelationshipEngine.py        # ✅ موجود
│   │   ├── ComprehensiveScheduler.py    # ✅ موجود
│   │   ├── SBCComplianceChecker.py      # ✅ موجود
│   │   ├── SCurveGenerator.py           # ✅ موجود
│   │   ├── RequestParser.py             # ✅ موجود
│   │   ├── RequestExecutor.py           # ✅ موجود
│   │   ├── AutomationEngine.py          # ✅ موجود
│   │   └── AutomationTemplates.py       # ✅ موجود
│   │
│   ├── 📂 integrations/                  # 🆕 وحدات التكامل
│   │   ├── __init__.py
│   │   ├── autocad_integration.py       # تكامل AutoCAD/DXF
│   │   ├── primavera_integration.py     # تكامل Primavera P6
│   │   ├── revit_integration.py         # تكامل Revit (مستقبلاً)
│   │   ├── sbc_integration.py           # تكامل كود البناء السعودي
│   │   └── excel_integration.py         # تكامل متقدم Excel
│   │
│   ├── 📂 models/                        # 🆕 Data Models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── project.py                   # Project Model
│   │   ├── boq.py                       # BOQ Items Model
│   │   ├── activity.py                  # Activity Model
│   │   ├── schedule.py                  # Schedule Model
│   │   ├── resource.py                  # Resource Model
│   │   ├── progress.py                  # Progress Log Model
│   │   ├── cost.py                      # Cost Model
│   │   ├── risk.py                      # Risk Model
│   │   ├── user.py                      # User Model
│   │   └── audit.py                     # Audit Log Model
│   │
│   ├── 📂 services/                      # 🆕 Business Logic Services
│   │   ├── __init__.py
│   │   ├── project_service.py           # Project CRUD
│   │   ├── boq_service.py               # BOQ Management
│   │   ├── schedule_service.py          # Schedule Generation
│   │   ├── progress_service.py          # Progress Tracking
│   │   ├── cost_service.py              # Cost Management
│   │   ├── report_service.py            # Report Generation
│   │   ├── auth_service.py              # Authentication
│   │   └── export_service.py            # Export to Excel/PDF/P6
│   │
│   ├── 📂 api/                           # 🆕 API Routes
│   │   ├── __init__.py
│   │   ├── projects.py                  # /api/projects
│   │   ├── boq.py                       # /api/boq
│   │   ├── activities.py                # /api/activities
│   │   ├── schedule.py                  # /api/schedule
│   │   ├── progress.py                  # /api/progress
│   │   ├── reports.py                   # /api/reports
│   │   ├── auth.py                      # /api/auth
│   │   └── users.py                     # /api/users
│   │
│   ├── 📂 utils/                         # 🆕 Utilities
│   │   ├── __init__.py
│   │   ├── validators.py                # Data Validation
│   │   ├── formatters.py                # Data Formatting
│   │   ├── converters.py                # Unit Converters
│   │   ├── date_utils.py                # Date Utilities
│   │   ├── sbc_standards.py             # SBC Standards Database
│   │   └── constants.py                 # Application Constants
│   │
│   ├── 📂 templates/                     # Report Templates
│   │   ├── 📂 reports/
│   │   │   ├── base_template.html       # Base Template
│   │   │   ├── project_report.html      # Project Report
│   │   │   ├── schedule_report.html     # Schedule Report
│   │   │   ├── boq_report.html          # BOQ Report
│   │   │   ├── compliance_report.html   # SBC Compliance
│   │   │   ├── progress_report.html     # Progress Report
│   │   │   └── cost_report.html         # Cost Report
│   │   │
│   │   ├── 📂 exports/
│   │   │   ├── excel_template.xlsx      # Excel Template
│   │   │   └── word_template.docx       # Word Template
│   │   │
│   │   └── 📂 styles/
│   │       ├── corporate.css            # Corporate Style
│   │       ├── technical.css            # Technical Style
│   │       └── arabic.css               # Arabic RTL Style
│   │
│   ├── 📂 data/                          # Static Data Files
│   │   ├── productivity_rates.json      # Productivity Database
│   │   ├── sbc_standards.json           # SBC Standards
│   │   └── default_templates.json       # Default Templates
│   │
│   ├── 📂 tests/                         # Unit Tests
│   │   ├── __init__.py
│   │   ├── 📂 test_core/
│   │   ├── 📂 test_integrations/
│   │   ├── 📂 test_models/
│   │   ├── 📂 test_services/
│   │   └── 📂 test_api/
│   │
│   ├── 📂 migrations/                    # Database Migrations (Alembic)
│   │   └── versions/
│   │
│   ├── 📂 uploads/                       # Uploaded Files
│   ├── 📂 exports/                       # Generated Exports
│   ├── 📂 logs/                          # Log Files
│   │
│   ├── app.py                            # Flask Application Factory
│   ├── config.py                         # 🆕 Configuration
│   ├── wsgi.py                           # WSGI Entry Point
│   ├── requirements.txt                  # ✅ موجود
│   ├── requirements-full.txt             # 🆕 All Dependencies
│   ├── requirements-dev.txt              # 🆕 Development Dependencies
│   └── README_BACKEND.md                 # Backend Documentation
│
├── 📂 frontend/                          # Frontend (React/TypeScript)
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/                # React Components
│   │   │   │
│   │   │   ├── 📂 core/                  # Core UI Components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── Modal.tsx
│   │   │   │
│   │   │   ├── 📂 engineering/           # 🆕 Engineering Specific
│   │   │   │   ├── 📂 BOQAnalyzer/
│   │   │   │   │   ├── BOQTable.tsx
│   │   │   │   │   ├── BOQImport.tsx
│   │   │   │   │   ├── BOQEditor.tsx
│   │   │   │   │   └── BOQSummary.tsx
│   │   │   │   │
│   │   │   │   ├── 📂 ScheduleViewer/
│   │   │   │   │   ├── GanttChart.tsx
│   │   │   │   │   ├── ScheduleTable.tsx
│   │   │   │   │   ├── CPMViewer.tsx
│   │   │   │   │   ├── WBSTree.tsx
│   │   │   │   │   └── ActivityEditor.tsx
│   │   │   │   │
│   │   │   │   ├── 📂 Dashboard/
│   │   │   │   │   ├── ProjectDashboard.tsx
│   │   │   │   │   ├── KPICards.tsx
│   │   │   │   │   ├── SCurveChart.tsx
│   │   │   │   │   ├── ProgressChart.tsx
│   │   │   │   │   └── CostChart.tsx
│   │   │   │   │
│   │   │   │   └── 📂 Progress/
│   │   │   │       ├── ProgressForm.tsx
│   │   │   │       ├── ProgressHistory.tsx
│   │   │   │       └── ProgressSummary.tsx
│   │   │   │
│   │   │   ├── 📂 integrations/          # 🆕 Integration Components
│   │   │   │   ├── AutoCADViewer/
│   │   │   │   ├── PrimaveraSync/
│   │   │   │   └── SBCCompliance/
│   │   │   │
│   │   │   └── 📂 reports/               # 🆕 Report Components
│   │   │       ├── ProjectReport/
│   │   │       ├── ScheduleReport/
│   │   │       └── ComplianceReport/
│   │   │
│   │   ├── 📂 services/                  # 🆕 API Services
│   │   │   ├── api.ts                    # Axios Configuration
│   │   │   ├── projectService.ts         # Project API
│   │   │   ├── boqService.ts             # BOQ API
│   │   │   ├── scheduleService.ts        # Schedule API
│   │   │   ├── progressService.ts        # Progress API
│   │   │   ├── reportService.ts          # Report API
│   │   │   └── authService.ts            # Auth API
│   │   │
│   │   ├── 📂 types/                     # 🆕 TypeScript Types
│   │   │   ├── project.ts
│   │   │   ├── boq.ts
│   │   │   ├── activity.ts
│   │   │   ├── schedule.ts
│   │   │   ├── resource.ts
│   │   │   ├── progress.ts
│   │   │   ├── api.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📂 hooks/                     # Custom React Hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── useBOQ.ts
│   │   │   ├── useSchedule.ts
│   │   │   ├── useProgress.ts
│   │   │   └── useAuth.ts
│   │   │
│   │   ├── 📂 store/                     # State Management (Zustand)
│   │   │   ├── projectStore.ts
│   │   │   ├── boqStore.ts
│   │   │   ├── scheduleStore.ts
│   │   │   └── authStore.ts
│   │   │
│   │   ├── 📂 utils/                     # Frontend Utilities
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── 📂 styles/                    # Styles
│   │   │   ├── global.css
│   │   │   └── themes.css
│   │   │
│   │   ├── App.tsx                       # ✅ موجود
│   │   ├── main.tsx                      # Entry Point
│   │   └── vite-env.d.ts                 # Vite Types
│   │
│   ├── 📂 public/                        # Static Assets
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/
│   │
│   ├── package.json                      # ✅ موجود
│   ├── tsconfig.json                     # ✅ موجود
│   ├── vite.config.ts                    # ✅ موجود
│   └── README_FRONTEND.md                # Frontend Documentation
│
├── 📂 docs/                              # 🆕 Documentation
│   ├── 📂 architecture/
│   │   ├── system_design.md
│   │   ├── database_schema.md
│   │   ├── api_reference.md
│   │   └── diagrams/
│   │
│   ├── 📂 guides/
│   │   ├── user_guide_ar.md             # دليل المستخدم عربي
│   │   ├── user_guide_en.md             # User Guide English
│   │   ├── developer_guide.md
│   │   ├── integration_guide.md
│   │   └── deployment_guide.md
│   │
│   ├── 📂 standards/
│   │   ├── sbc_standards.md             # Saudi Building Code
│   │   ├── naming_conventions.md
│   │   ├── code_standards.md
│   │   └── security_standards.md
│   │
│   └── 📂 tutorials/
│       ├── getting_started.md
│       ├── creating_project.md
│       ├── importing_boq.md
│       ├── generating_schedule.md
│       └── tracking_progress.md
│
├── 📂 templates/                         # 🆕 Project Templates
│   ├── 📂 villa_template/
│   │   ├── boq_template.xlsx
│   │   ├── drawings/
│   │   └── specifications/
│   │
│   ├── 📂 building_template/
│   │   ├── boq_template.xlsx
│   │   └── specifications/
│   │
│   └── 📂 infrastructure_template/
│       ├── boq_template.xlsx
│       └── specifications/
│
├── 📂 scripts/                           # 🆕 Utility Scripts
│   ├── setup.sh                          # Initial Setup
│   ├── start_dev.sh                      # Development Server
│   ├── deploy.sh                         # Deployment Script
│   ├── backup.sh                         # Backup Script
│   ├── migrate.sh                        # Database Migration
│   └── seed_data.py                      # Seed Test Data
│
├── 📂 .github/                           # GitHub Configuration
│   └── 📂 workflows/
│       ├── ci.yml                        # 🆕 CI Pipeline
│       ├── deploy.yml                    # 🆕 CD Pipeline
│       └── security.yml                  # 🆕 Security Scan
│
├── 📂 docker/                            # 🆕 Docker Configuration
│   ├── Dockerfile.backend                # Backend Container
│   ├── Dockerfile.frontend               # Frontend Container
│   └── nginx.conf                        # Nginx Configuration
│
├── .env.example                          # Environment Variables Template
├── .gitignore                            # ✅ موجود
├── docker-compose.yml                    # ✅ موجود (محدّث)
├── docker-compose.prod.yml               # 🆕 Production Compose
├── README.md                             # ✅ موجود (محدّث)
├── MASTER_PLAN.md                        # ✅ موجود
├── PROPOSED_STRUCTURE.md                 # 🆕 هذا الملف
├── implementation_checklist.md           # 🆕 قائمة التحقق
├── project_plan_*.xlsx                   # 🆕 خطة المشروع
└── LICENSE                               # License File

```

---

## 🎯 الملفات الجديدة المطلوب إنشاؤها

### Backend (15 ملف جديد)
1. ✅ `backend/config.py`
2. ✅ `backend/requirements-full.txt`
3. ✅ `backend/requirements-dev.txt`
4. ⏳ `backend/models/*.py` (10 models)
5. ⏳ `backend/services/*.py` (8 services)
6. ⏳ `backend/api/*.py` (8 routes)
7. ⏳ `backend/integrations/*.py` (5 integrations)
8. ⏳ `backend/utils/*.py` (7 utilities)

### Frontend (20 مكون جديد)
1. ⏳ `frontend/src/services/*.ts` (7 services)
2. ⏳ `frontend/src/types/*.ts` (8 type files)
3. ⏳ `frontend/src/hooks/*.ts` (5 hooks)
4. ⏳ `frontend/src/store/*.ts` (4 stores)

### Documentation (10 ملف)
1. ⏳ `docs/architecture/*.md` (4 files)
2. ⏳ `docs/guides/*.md` (5 files)
3. ⏳ `docs/standards/*.md` (4 files)
4. ⏳ `docs/tutorials/*.md` (5 files)

### Scripts & Config (8 ملفات)
1. ⏳ `scripts/*.sh` (5 shell scripts)
2. ⏳ `.github/workflows/*.yml` (3 workflows)
3. ⏳ `docker/*.dockerfile` (2 dockerfiles)

---

## 📊 إحصائيات المشروع

### الملفات الموجودة حالياً
- ✅ Backend Core: 12 نظام Python
- ✅ Frontend: 80+ مكون React
- ✅ Database: SQLite قاعدة بيانات
- ✅ API: 27+ endpoint

### الملفات الجديدة المطلوبة
- 🆕 Backend: ~40 ملف جديد
- 🆕 Frontend: ~30 ملف جديد
- 🆕 Documentation: ~20 ملف
- 🆕 Scripts: ~10 ملف

### الإجمالي المتوقع
- **~100 ملف جديد** لإكمال البنية المقترحة
- **المدة المتوقعة:** 50 يوم عمل
- **الفريق المطلوب:** 5-6 مطورين

---

## 🚀 خطوات التنفيذ

### Phase 1: البنية الأساسية (أسبوع 1)
```bash
# إنشاء المجلدات الأساسية
mkdir -p backend/{models,services,api,integrations,utils}
mkdir -p frontend/src/{services,types,hooks,store}
mkdir -p docs/{architecture,guides,standards,tutorials}
mkdir -p scripts docker .github/workflows
```

### Phase 2: Models & Database (أسبوع 2)
```bash
# إنشاء جميع Models
# تثبيت Alembic
# إنشاء Migrations
```

### Phase 3: Services & API (أسبوع 3-4)
```bash
# إنشاء Business Logic
# إنشاء API Endpoints
# اختبار API
```

### Phase 4: Frontend Integration (أسبوع 5-6)
```bash
# إنشاء Services
# إنشاء Types
# إنشاء Hooks & Stores
```

### Phase 5: Testing & Documentation (أسبوع 7)
```bash
# كتابة الاختبارات
# كتابة التوثيق
# إعداد CI/CD
```

---

## ✅ الحالة الحالية

- ✅ **Phase 1 - التخطيط:** مكتمل
- ✅ **Phase 2 - إنشاء الوثائق:** مكتمل
- 🔄 **Phase 3 - تنفيذ البنية:** قيد العمل
- ⏳ **Phase 4 - التطوير:** قادم
- ⏳ **Phase 5 - الاختبار:** قادم

---

**تاريخ الإنشاء:** 2025-11-06  
**آخر تحديث:** 2025-11-06  
**الحالة:** Active Development
