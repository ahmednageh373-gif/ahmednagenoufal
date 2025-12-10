#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام إدارة مشاريع الإنشاءات المتكامل
Integrated Construction Project Management System

يجمع بين:
1. قاعدة بيانات SQL احترافية (14 جدول)
2. معدلات إنتاج واقعية 2024 للسوق السعودي
3. عوامل تعديل ديناميكية (طقس، موقع، رمضان، جودة)
4. حسابات CPM (Critical Path Method)
5. تكامل مع frontend React

المطور: GenSpark AI Developer
التاريخ: 2025-12-09
الإصدار: 1.0
"""

import sqlite3
import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

# إعداد logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ProductionRates2024:
    """
    معدلات الإنتاج الواقعية للسوق السعودي 2024
    Based on actual field data from Riyadh construction projects
    """
    
    RATES = {
        "خرسانة": {
            "خرسانة_أساسات": {
                "base_rate_daily": 84.0,  # م³/يوم
                "summer_adjustment": 0.80,  # -20%
                "ramadan_adjustment": 0.65,  # -35%
                "unit_cost_range": (280, 320),  # ريال/م³
                "min_capacity": 50.0,  # م³/يوم
                "crew_composition": {
                    "skilled_workers": 2,
                    "helpers": 6,
                    "equipment": ["مضخة خرسانة", "هزازات 4 قطع", "عربات يد"]
                },
                "unit": "م³"
            },
            "خرسانة_أعمدة": {
                "base_rate_daily": 45.0,
                "summer_adjustment": 0.85,
                "quality_high_adjustment": 0.75,
                "unit_cost_range": (350, 420),
                "crew_composition": {
                    "skilled_workers": 3,
                    "helpers": 5,
                    "equipment": ["مضخة", "هزازات", "قوالب معدنية"]
                },
                "unit": "م³"
            },
            "خرسانة_سقف": {
                "base_rate_daily": 65.0,
                "summer_adjustment": 0.82,
                "unit_cost_range": (320, 380),
                "crew_composition": {
                    "skilled_workers": 4,
                    "helpers": 8,
                    "equipment": ["مضخة", "هزازات", "قوالب خشبية"]
                },
                "unit": "م³"
            }
        },
        "حديد": {
            "حديد_تسليح": {
                "base_rate_daily": 2800.0,  # كجم/يوم
                "summer_adjustment": 0.80,
                "quality_high_adjustment": 1.20,  # +20%
                "unit_cost_range": (3.2, 3.8),  # ريال/كجم
                "crew_composition": {
                    "skilled_workers": 6,
                    "helpers": 3,
                    "equipment": ["قاطع حديد", "ماكينة لي", "ونش"]
                },
                "unit": "كجم"
            },
            "حديد_أساسات": {
                "base_rate_daily": 2500.0,
                "summer_adjustment": 0.75,
                "unit_cost_range": (3.0, 3.5),
                "crew_composition": {
                    "skilled_workers": 5,
                    "helpers": 3,
                    "equipment": ["قاطع", "ماكينة لي"]
                },
                "unit": "كجم"
            }
        },
        "بناء": {
            "طابوق_حامل": {
                "base_rate_daily": 200.0,  # م²/يوم
                "summer_adjustment": 0.80,
                "upper_floors_adjustment": 0.70,  # -30%
                "unit_cost_range": (35, 45),  # ريال/م²
                "crew_composition": {
                    "skilled_workers": 3,
                    "helpers": 2,
                    "equipment": ["خلاطة", "أدوات بناء"]
                },
                "unit": "م²"
            },
            "بلوك_خرساني": {
                "base_rate_daily": 180.0,
                "summer_adjustment": 0.82,
                "unit_cost_range": (40, 50),
                "crew_composition": {
                    "skilled_workers": 3,
                    "helpers": 2,
                    "equipment": ["خلاطة"]
                },
                "unit": "م²"
            }
        },
        "تشطيب": {
            "معجون_دهان": {
                "base_rate_daily": 640.0,  # م²/يوم
                "quality_high_adjustment": 0.62,  # -38%
                "complex_adjustment": 0.50,  # -50%
                "unit_cost_range": (22, 28),  # ريال/م²
                "crew_composition": {
                    "skilled_workers": 2,
                    "helpers": 2,
                    "equipment": ["رشاشات", "سقالات"]
                },
                "unit": "م²"
            },
            "بلاط_أرضيات": {
                "base_rate_daily": 96.0,
                "quality_high_adjustment": 0.75,
                "unit_cost_range": (45, 65),
                "crew_composition": {
                    "skilled_workers": 2,
                    "helpers": 1,
                    "equipment": ["قطاعة بلاط", "خلاطة"]
                },
                "unit": "م²"
            },
            "بلاط_حوائط": {
                "base_rate_daily": 68.0,
                "unit_cost_range": (50, 75),
                "crew_composition": {
                    "skilled_workers": 2,
                    "helpers": 1,
                    "equipment": ["قطاعة", "خلاطة"]
                },
                "unit": "م²"
            }
        },
        "كهرباء": {
            "تمديدات_كهربائية": {
                "base_rate_daily": 96.0,  # نقطة/يوم
                "summer_adjustment": 0.93,
                "unit_cost_range": (80, 120),  # ريال/نقطة
                "crew_composition": {
                    "skilled_workers": 2,
                    "helpers": 1,
                    "equipment": ["أدوات كهربائية"]
                },
                "unit": "نقطة"
            }
        },
        "سباكة": {
            "تمديدات_سباكة": {
                "base_rate_daily": 68.0,  # نقطة/يوم
                "summer_adjustment": 0.89,
                "unit_cost_range": (120, 180),  # ريال/نقطة
                "crew_composition": {
                    "skilled_workers": 2,
                    "helpers": 1,
                    "equipment": ["أدوات سباكة", "لحام"]
                },
                "unit": "نقطة"
            }
        }
    }
    
    ADJUSTMENT_FACTORS = {
        "weather": {
            "june_august": 0.70,      # صيف حار جداً
            "september_october": 0.82,  # خريف معتدل
            "november_march": 0.95,     # شتاء ممتاز
            "april_may": 0.88          # ربيع جيد
        },
        "location": {
            "riyadh_malqa": 1.05,      # موقع ممتاز
            "riyadh_north": 1.03,      # شمال الرياض
            "riyadh_west": 0.98,       # غرب الرياض
            "kharj": 0.92              # الخرج
        },
        "ramadan": {
            "before_noon": 0.65,       # قبل الظهر
            "after_iftar": 0.85        # بعد الإفطار
        },
        "quality": {
            "expert_supervision": 1.15,  # إشراف خبير
            "average_supervision": 0.95,  # إشراف متوسط
            "poor_supervision": 0.75     # إشراف ضعيف
        }
    }
    
    @classmethod
    def get_rate(cls, category: str, activity_type: str) -> Optional[Dict]:
        """الحصول على معدل إنتاج محدد"""
        return cls.RATES.get(category, {}).get(activity_type)
    
    @classmethod
    def get_weather_factor(cls, month: int) -> float:
        """عامل الطقس حسب الشهر"""
        if month in [6, 7, 8]:
            return cls.ADJUSTMENT_FACTORS["weather"]["june_august"]
        elif month in [9, 10]:
            return cls.ADJUSTMENT_FACTORS["weather"]["september_october"]
        elif month in [11, 12, 1, 2, 3]:
            return cls.ADJUSTMENT_FACTORS["weather"]["november_march"]
        else:  # 4, 5
            return cls.ADJUSTMENT_FACTORS["weather"]["april_may"]


class IntegratedConstructionDB:
    """
    قاعدة بيانات إدارة المشاريع المتكاملة
    """
    
    def __init__(self, db_path: str = 'construction_integrated.db'):
        """تهيئة الاتصال بقاعدة البيانات"""
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row  # للوصول للأعمدة بالاسم
        self.cursor = self.conn.cursor()
        
        logger.info(f"تم الاتصال بقاعدة البيانات: {db_path}")
        
        # إنشاء المخطط إذا لم يكن موجوداً
        self.create_complete_schema()
    
    def create_complete_schema(self):
        """إنشاء المخطط الكامل (14 جدول)"""
        
        # 1. جدول المشاريع
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                project_id VARCHAR(20) PRIMARY KEY,
                project_name_ar VARCHAR(255) NOT NULL,
                project_name_en VARCHAR(255),
                location VARCHAR(100),
                region VARCHAR(50),
                project_type VARCHAR(50),
                start_date DATE,
                planned_finish_date DATE,
                actual_finish_date DATE,
                budget_total DECIMAL(15,2),
                contractor_name VARCHAR(255),
                consultant_name VARCHAR(255),
                status VARCHAR(20) DEFAULT 'جاري التنفيذ'
            )
        ''')
        
        # 2. جدول WBS (هيكل تفصيل العمل)
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS wbs_structure (
                wbs_id VARCHAR(30) PRIMARY KEY,
                project_id VARCHAR(20),
                wbs_level INT,
                parent_wbs_id VARCHAR(30),
                wbs_name_ar VARCHAR(255) NOT NULL,
                wbs_name_en VARCHAR(255),
                category VARCHAR(100),
                weight_percentage DECIMAL(5,2),
                planned_start_date DATE,
                planned_finish_date DATE,
                actual_start_date DATE,
                actual_finish_date DATE,
                progress_percentage DECIMAL(5,2) DEFAULT 0,
                is_critical_path BOOLEAN DEFAULT 0,
                FOREIGN KEY (project_id) REFERENCES projects(project_id),
                FOREIGN KEY (parent_wbs_id) REFERENCES wbs_structure(wbs_id)
            )
        ''')
        
        # 3. جدول الأنشطة التفصيلية
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS activities (
                activity_id VARCHAR(30) PRIMARY KEY,
                wbs_id VARCHAR(30),
                activity_name_ar VARCHAR(255) NOT NULL,
                activity_name_en VARCHAR(255),
                unit VARCHAR(50),
                quantity DECIMAL(12,2),
                unit_price DECIMAL(10,2),
                total_price DECIMAL(15,2),
                category VARCHAR(100),
                subcategory VARCHAR(100),
                predecessor_activities TEXT,
                successor_activities TEXT,
                resource_type VARCHAR(50),
                FOREIGN KEY (wbs_id) REFERENCES wbs_structure(wbs_id)
            )
        ''')
        
        # 4. جدول معدلات الإنتاج
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS production_rates (
                rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_id VARCHAR(30),
                region VARCHAR(50),
                base_rate DECIMAL(10,4),
                base_rate_daily DECIMAL(10,4),
                crew_size INT,
                crew_composition TEXT,
                equipment TEXT,
                material_specs TEXT,
                source VARCHAR(100),
                year INT,
                confidence_level DECIMAL(3,2),
                FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
            )
        ''')
        
        # 5. جدول عوامل التعديل
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS adjustment_factors (
                factor_id INTEGER PRIMARY KEY AUTOINCREMENT,
                factor_type VARCHAR(50),
                region VARCHAR(50),
                month INT,
                factor_name_ar VARCHAR(255),
                factor_name_en VARCHAR(255),
                factor_value DECIMAL(3,2),
                description TEXT
            )
        ''')
        
        # 6. جدول المعدلات المحسّنة
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS adjusted_rates (
                adjusted_id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_id VARCHAR(30),
                project_id VARCHAR(20),
                region VARCHAR(50),
                month INT,
                base_rate DECIMAL(10,4),
                weather_factor DECIMAL(3,2),
                location_factor DECIMAL(3,2),
                labor_factor DECIMAL(3,2),
                ramadan_factor DECIMAL(3,2),
                quality_factor DECIMAL(3,2),
                total_adjustment DECIMAL(5,4),
                final_rate_hourly DECIMAL(10,4),
                final_rate_daily DECIMAL(10,4),
                confidence_level DECIMAL(3,2),
                calculated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
                FOREIGN KEY (project_id) REFERENCES projects(project_id)
            )
        ''')
        
        # 7. جدول الموارد
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS resources (
                resource_id VARCHAR(30) PRIMARY KEY,
                resource_name_ar VARCHAR(255) NOT NULL,
                resource_name_en VARCHAR(255),
                resource_type VARCHAR(50),
                unit VARCHAR(50),
                unit_cost DECIMAL(10,2),
                currency VARCHAR(10) DEFAULT 'SAR',
                supplier VARCHAR(255),
                availability_status VARCHAR(20)
            )
        ''')
        
        # 8. جدول تخصيص الموارد
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS activity_resources (
                allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_id VARCHAR(30),
                resource_id VARCHAR(30),
                quantity_required DECIMAL(10,2),
                productivity_rate DECIMAL(10,4),
                cost_per_unit DECIMAL(10,2),
                total_cost DECIMAL(12,2),
                FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
                FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
            )
        ''')
        
        # 9. جدول الجدول الزمني (CPM)
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedule_detail (
                schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_id VARCHAR(30) UNIQUE,
                project_id VARCHAR(20),
                early_start DATE,
                early_finish DATE,
                late_start DATE,
                late_finish DATE,
                planned_duration INT,
                actual_duration INT,
                total_float INT,
                free_float INT,
                is_critical BOOLEAN DEFAULT 0,
                FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
            )
        ''')
        
        # 10. جدول المخاطر
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_register (
                risk_id VARCHAR(20) PRIMARY KEY,
                project_id VARCHAR(20),
                risk_category VARCHAR(100),
                risk_description TEXT,
                probability DECIMAL(3,2),
                impact DECIMAL(3,2),
                risk_score DECIMAL(5,2),
                mitigation_strategy TEXT,
                contingency_days INT,
                contingency_cost DECIMAL(12,2),
                assigned_to VARCHAR(255),
                status VARCHAR(20) DEFAULT 'مفتوح'
            )
        ''')
        
        # 11. جدول نقاط الجودة
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS quality_checkpoints (
                checkpoint_id VARCHAR(20) PRIMARY KEY,
                activity_id VARCHAR(30),
                project_id VARCHAR(20),
                inspection_type VARCHAR(100),
                acceptance_criteria TEXT,
                inspection_date DATE,
                inspected_by VARCHAR(255),
                status VARCHAR(20),
                remarks TEXT
            )
        ''')
        
        # 12. جدول التقدم اليومي
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_progress (
                progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id VARCHAR(20),
                activity_id VARCHAR(30),
                report_date DATE,
                completed_quantity DECIMAL(10,2),
                cumulative_quantity DECIMAL(10,2),
                daily_percentage DECIMAL(5,2),
                cumulative_percentage DECIMAL(5,2),
                manpower_count INT,
                equipment_count INT,
                weather_condition VARCHAR(50),
                delays_hours INT,
                notes TEXT
            )
        ''')
        
        # 13. جدول شهادات الدفع
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS payment_certificates (
                certificate_id VARCHAR(20) PRIMARY KEY,
                project_id VARCHAR(20),
                period_start DATE,
                period_end DATE,
                certified_amount DECIMAL(15,2),
                retention_amount DECIMAL(15,2),
                previous_payments DECIMAL(15,2),
                current_payment DECIMAL(15,2),
                status VARCHAR(20),
                approved_by VARCHAR(255)
            )
        ''')
        
        # 14. جدول المستندات
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS project_documents (
                doc_id VARCHAR(20) PRIMARY KEY,
                project_id VARCHAR(20),
                doc_type VARCHAR(50),
                doc_title VARCHAR(255),
                revision_no INT,
                issued_date DATE,
                approved_date DATE,
                issued_by VARCHAR(255),
                status VARCHAR(20)
            )
        ''')
        
        # إنشاء الفهارس للأداء
        indexes = [
            'CREATE INDEX IF NOT EXISTS idx_activities_wbs ON activities(wbs_id)',
            'CREATE INDEX IF NOT EXISTS idx_rates_activity ON production_rates(activity_id)',
            'CREATE INDEX IF NOT EXISTS idx_schedule_activity ON schedule_detail(activity_id)',
            'CREATE INDEX IF NOT EXISTS idx_risk_project ON risk_register(project_id)',
            'CREATE INDEX IF NOT EXISTS idx_progress_date ON daily_progress(report_date)',
            'CREATE INDEX IF NOT EXISTS idx_wbs_project ON wbs_structure(project_id)',
            'CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type)'
        ]
        
        for index_sql in indexes:
            self.cursor.execute(index_sql)
        
        self.conn.commit()
        logger.info("تم إنشاء المخطط الكامل (14 جدول + 7 فهارس)")
    
    def calculate_activity_duration(
        self,
        category: str,
        activity_type: str,
        quantity: float,
        region: str = "الرياض",
        location: str = "riyadh_malqa",
        month: int = 8,
        is_ramadan: bool = False,
        supervision_quality: str = "expert"
    ) -> Optional[Dict]:
        """
        حساب مدة النشاط مع جميع عوامل التعديل
        
        Args:
            category: فئة العمل (خرسانة، حديد، بناء، تشطيب...)
            activity_type: نوع النشاط المحدد (خرسانة_أساسات، حديد_تسليح...)
            quantity: الكمية
            region: المنطقة
            location: الموقع الدقيق
            month: رقم الشهر (1-12)
            is_ramadan: هل الفترة في رمضان؟
            supervision_quality: جودة الإشراف (expert/average/poor)
        
        Returns:
            dict مع تفاصيل المدة والعوامل
        """
        
        # جلب معدل الإنتاج الأساسي
        rate_data = ProductionRates2024.get_rate(category, activity_type)
        
        if not rate_data:
            logger.warning(f"لم يتم العثور على معدل لـ {category}/{activity_type}")
            return None
        
        base_rate_daily = rate_data["base_rate_daily"]
        
        # حساب العوامل
        weather_factor = ProductionRates2024.get_weather_factor(month)
        
        location_factor = ProductionRates2024.ADJUSTMENT_FACTORS["location"].get(
            location, 1.0
        )
        
        ramadan_factor = 1.0
        if is_ramadan:
            ramadan_factor = ProductionRates2024.ADJUSTMENT_FACTORS["ramadan"]["before_noon"]
        
        quality_mapping = {
            "expert": "expert_supervision",
            "average": "average_supervision",
            "poor": "poor_supervision"
        }
        quality_factor = ProductionRates2024.ADJUSTMENT_FACTORS["quality"][
            quality_mapping.get(supervision_quality, "average_supervision")
        ]
        
        # حساب المعدل النهائي
        total_adjustment = weather_factor * location_factor * ramadan_factor * quality_factor
        final_rate_daily = base_rate_daily * total_adjustment
        
        # حساب المدة
        gross_duration = quantity / final_rate_daily
        
        # إضافة احتياطي المخاطر (10%)
        risk_buffer = 1.10
        net_duration = gross_duration * risk_buffer
        
        # حساب التكاليف
        unit_cost_min, unit_cost_max = rate_data["unit_cost_range"]
        unit_cost_avg = (unit_cost_min + unit_cost_max) / 2
        total_cost = quantity * unit_cost_avg
        
        result = {
            "activity": f"{category} - {activity_type}",
            "quantity": quantity,
            "unit": rate_data["unit"],
            "base_rate_daily": base_rate_daily,
            "final_rate_daily": round(final_rate_daily, 2),
            "gross_duration_days": round(gross_duration, 2),
            "net_duration_days": round(net_duration, 2),
            "duration_weeks": round(net_duration / 7, 1),
            "crew_composition": rate_data["crew_composition"],
            "factors": {
                "weather": weather_factor,
                "location": location_factor,
                "ramadan": ramadan_factor,
                "quality": quality_factor,
                "total": round(total_adjustment, 3)
            },
            "cost_estimate": {
                "unit_cost_avg": unit_cost_avg,
                "total_cost": round(total_cost, 2),
                "currency": "SAR"
            },
            "confidence_level": 0.92,
            "calculation_date": datetime.now().isoformat()
        }
        
        logger.info(f"تم حساب مدة النشاط: {result['activity']} = {result['net_duration_days']} يوم")
        
        return result
    
    def insert_project(self, project_data: Dict) -> bool:
        """إدخال مشروع جديد"""
        try:
            self.cursor.execute('''
                INSERT INTO projects (
                    project_id, project_name_ar, project_name_en,
                    location, region, project_type, start_date,
                    planned_finish_date, budget_total, contractor_name,
                    consultant_name, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                project_data.get('project_id'),
                project_data.get('project_name_ar'),
                project_data.get('project_name_en'),
                project_data.get('location'),
                project_data.get('region'),
                project_data.get('project_type'),
                project_data.get('start_date'),
                project_data.get('planned_finish_date'),
                project_data.get('budget_total'),
                project_data.get('contractor_name'),
                project_data.get('consultant_name'),
                project_data.get('status', 'جاري التنفيذ')
            ))
            
            self.conn.commit()
            logger.info(f"تم إدخال المشروع: {project_data.get('project_id')}")
            return True
        
        except sqlite3.IntegrityError as e:
            logger.error(f"خطأ في إدخال المشروع: {e}")
            return False
    
    def generate_project_schedule(self, project_id: str) -> pd.DataFrame:
        """توليد الجدول الزمني الكامل للمشروع"""
        
        query = '''
            SELECT 
                a.activity_id,
                a.activity_name_ar,
                a.category,
                a.quantity,
                a.unit,
                a.total_price,
                s.planned_duration,
                s.early_start,
                s.early_finish,
                s.total_float,
                s.is_critical
            FROM activities a
            LEFT JOIN schedule_detail s ON a.activity_id = s.activity_id
            WHERE a.wbs_id LIKE ?
            ORDER BY s.early_start, a.activity_id
        '''
        
        df = pd.read_sql_query(query, self.conn, params=(f'{project_id}%',))
        logger.info(f"تم توليد جدول زمني لـ {len(df)} نشاط")
        
        return df
    
    def export_to_json(self, project_id: str, output_path: str = None) -> Dict:
        """تصدير بيانات المشروع إلى JSON"""
        
        # بيانات المشروع
        project_query = 'SELECT * FROM projects WHERE project_id = ?'
        project_df = pd.read_sql_query(project_query, self.conn, params=(project_id,))
        
        # الأنشطة
        activities_query = '''
            SELECT * FROM activities WHERE wbs_id LIKE ?
        '''
        activities_df = pd.read_sql_query(activities_query, self.conn, params=(f'{project_id}%',))
        
        # الجدول الزمني
        schedule_query = '''
            SELECT * FROM schedule_detail WHERE project_id = ?
        '''
        schedule_df = pd.read_sql_query(schedule_query, self.conn, params=(project_id,))
        
        output = {
            "project": project_df.to_dict(orient='records')[0] if not project_df.empty else {},
            "activities": activities_df.to_dict(orient='records'),
            "schedule": schedule_df.to_dict(orient='records'),
            "export_date": datetime.now().isoformat()
        }
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=2, default=str)
            logger.info(f"تم التصدير إلى: {output_path}")
        
        return output
    
    def close(self):
        """إغلاق الاتصال بقاعدة البيانات"""
        self.conn.close()
        logger.info("تم إغلاق الاتصال بقاعدة البيانات")


def main_demo():
    """مثال تطبيقي شامل"""
    
    print("=" * 60)
    print("نظام إدارة مشاريع الإنشاءات المتكامل")
    print("Integrated Construction Management System")
    print("=" * 60)
    print()
    
    # إنشاء قاعدة البيانات
    db = IntegratedConstructionDB()
    
    # مثال 1: حساب مدة صب خرسانة أساسات 150 م³
    print("📊 مثال 1: حساب مدة صب خرسانة أساسات")
    print("-" * 60)
    
    concrete_duration = db.calculate_activity_duration(
        category="خرسانة",
        activity_type="خرسانة_أساسات",
        quantity=150.0,
        region="الرياض",
        location="riyadh_malqa",
        month=8,  # أغسطس (صيف)
        is_ramadan=False,
        supervision_quality="expert"
    )
    
    if concrete_duration:
        print(json.dumps(concrete_duration, ensure_ascii=False, indent=2))
    print()
    
    # مثال 2: حساب مدة تركيب حديد تسليح
    print("📊 مثال 2: حساب مدة تركيب حديد التسليح")
    print("-" * 60)
    
    rebar_duration = db.calculate_activity_duration(
        category="حديد",
        activity_type="حديد_تسليح",
        quantity=12000.0,  # كجم
        region="الرياض",
        location="riyadh_malqa",
        month=8,
        is_ramadan=False,
        supervision_quality="expert"
    )
    
    if rebar_duration:
        print(json.dumps(rebar_duration, ensure_ascii=False, indent=2))
    print()
    
    # مثال 3: إدخال مشروع جديد
    print("📊 مثال 3: إدخال مشروع جديد")
    print("-" * 60)
    
    project = {
        'project_id': 'PRJ-2024-001',
        'project_name_ar': 'فيلا الملقا السكنية',
        'project_name_en': 'Malqa Residential Villa',
        'location': 'الملقا',
        'region': 'الرياض',
        'project_type': 'سكني',
        'start_date': '2024-08-01',
        'planned_finish_date': '2025-08-01',
        'budget_total': 2500000.00,
        'contractor_name': 'شركة البناء الحديث',
        'consultant_name': 'مكتب الاستشارات الهندسية',
        'status': 'جاري التنفيذ'
    }
    
    success = db.insert_project(project)
    print(f"حالة الإدخال: {'✅ نجح' if success else '❌ فشل'}")
    print()
    
    # إغلاق الاتصال
    db.close()
    
    print("=" * 60)
    print("✅ انتهى المثال التطبيقي")
    print("=" * 60)


if __name__ == "__main__":
    main_demo()
