"""
NOUFAL ERP - Specialized Role Dashboards
========================================
لوحات التحكم المتخصصة لكل دور في نظام NOUFAL ERP

This module provides customized dashboard views for each of the 9 roles:
1. Company Owner - Executive Dashboard
2. Project Manager - Comprehensive Project Management
3. Site Engineer - Mobile Field Operations
4. Execution Engineer - Drawing Comparison & RFI
5. Supervisor - Labor & Activity Supervision
6. Accounts & Finance - Invoicing & Payments
7. Technical Office - Drawing Management
8. Cost Control Engineer - Cost Tracking
9. Planning Engineer - Schedule Management
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict


# ==================== Dashboard Data Models ====================

@dataclass
class DashboardWidget:
    """تمثيل عنصر واجهة في لوحة التحكم"""
    id: str
    title: str
    widget_type: str  # chart, metric, table, list, alert
    data: Any
    position: Dict[str, int]  # {row, col, width, height}
    refresh_interval: Optional[int] = None  # seconds
    icon: Optional[str] = None
    color: Optional[str] = None


@dataclass
class DashboardMetric:
    """مقياس أداء في لوحة التحكم"""
    label: str
    value: Any
    unit: str = ""
    trend: Optional[float] = None  # نسبة التغيير
    trend_direction: str = "neutral"  # up, down, neutral
    icon: Optional[str] = None
    color: str = "blue"


@dataclass
class DashboardAlert:
    """تنبيه في لوحة التحكم"""
    id: int
    title: str
    message: str
    severity: str  # critical, warning, info
    timestamp: datetime
    action_url: Optional[str] = None
    is_read: bool = False


# ==================== Company Owner Dashboard ====================

class CompanyOwnerDashboard:
    """
    لوحة التحكم التنفيذية لصاحب الشركة
    ===================================
    
    المميزات:
    - نظرة شاملة على جميع المشاريع
    - المؤشرات المالية الرئيسية
    - تحليل الربحية
    - حالة المشاريع في الوقت الفعلي
    - التنبيهات الحرجة
    """
    
    def get_executive_summary(self, company_id: int) -> Dict:
        """
        ملخص تنفيذي شامل
        
        Returns:
            - إجمالي المشاريع
            - الإيرادات الإجمالية
            - هامش الربح
            - الموظفين النشطين
            - المشاريع المتأخرة
        """
        return {
            "total_projects": 15,
            "active_projects": 8,
            "completed_projects": 7,
            "total_revenue": 45_000_000.00,
            "total_costs": 32_500_000.00,
            "net_profit": 12_500_000.00,
            "profit_margin": 27.78,  # percentage
            "active_employees": 127,
            "delayed_projects": 2,
            "projects_on_track": 6,
            "upcoming_milestones": 12,
            "cash_flow": 8_200_000.00,
            "outstanding_receivables": 3_400_000.00,
            "outstanding_payables": 1_900_000.00
        }
    
    def get_financial_overview(self, company_id: int) -> Dict:
        """نظرة عامة مالية"""
        return {
            "monthly_revenue": [
                {"month": "Jan", "revenue": 3_200_000, "costs": 2_400_000},
                {"month": "Feb", "revenue": 3_800_000, "costs": 2_700_000},
                {"month": "Mar", "revenue": 4_100_000, "costs": 2_950_000},
                {"month": "Apr", "revenue": 3_900_000, "costs": 2_800_000},
                {"month": "May", "revenue": 4_500_000, "costs": 3_200_000},
                {"month": "Jun", "revenue": 4_800_000, "costs": 3_400_000},
            ],
            "revenue_by_project": [
                {"project": "Riyadh Tower", "revenue": 15_000_000, "percentage": 33.3},
                {"project": "Jeddah Mall", "revenue": 12_000_000, "percentage": 26.7},
                {"project": "Dammam Hospital", "revenue": 10_500_000, "percentage": 23.3},
                {"project": "Others", "revenue": 7_500_000, "percentage": 16.7},
            ],
            "cost_breakdown": {
                "labor": 40.5,  # percentage
                "materials": 35.2,
                "subcontractors": 15.8,
                "equipment": 5.3,
                "overhead": 3.2
            }
        }
    
    def get_project_health_status(self, company_id: int) -> List[Dict]:
        """حالة صحة المشاريع"""
        return [
            {
                "project_id": 1,
                "project_name": "Riyadh Tower",
                "health_score": 92,  # out of 100
                "status": "excellent",
                "schedule_variance": -2,  # days (negative = ahead)
                "cost_variance": 1.5,  # percentage (positive = over budget)
                "quality_score": 95,
                "safety_score": 98
            },
            {
                "project_id": 2,
                "project_name": "Jeddah Mall",
                "health_score": 78,
                "status": "good",
                "schedule_variance": 5,
                "cost_variance": -2.3,
                "quality_score": 88,
                "safety_score": 92
            },
            {
                "project_id": 3,
                "project_name": "Dammam Hospital",
                "health_score": 65,
                "status": "at_risk",
                "schedule_variance": 15,
                "cost_variance": 8.7,
                "quality_score": 82,
                "safety_score": 85
            }
        ]
    
    def get_critical_alerts(self, company_id: int) -> List[DashboardAlert]:
        """التنبيهات الحرجة التي تحتاج انتباه صاحب الشركة"""
        return [
            DashboardAlert(
                id=1,
                title="تأخير حرج في مشروع مستشفى الدمام",
                message="المشروع متأخر 15 يوم عن الجدول المخطط. يتطلب تدخل فوري.",
                severity="critical",
                timestamp=datetime.now() - timedelta(hours=2),
                action_url="/projects/3/schedule"
            ),
            DashboardAlert(
                id=2,
                title="تجاوز ميزانية في بند الحديد",
                message="تجاوز الميزانية بنسبة 12% في مشروع برج الرياض",
                severity="warning",
                timestamp=datetime.now() - timedelta(hours=5),
                action_url="/projects/1/budget"
            ),
            DashboardAlert(
                id=3,
                title="مستحقات متأخرة من العميل",
                message="مستحقات بقيمة 2,400,000 ريال متأخرة 30 يوم",
                severity="warning",
                timestamp=datetime.now() - timedelta(days=1),
                action_url="/finance/receivables"
            )
        ]


# ==================== Project Manager Dashboard ====================

class ProjectManagerDashboard:
    """
    لوحة التحكم لمدير المشروع
    =========================
    
    المميزات:
    - إدارة شاملة للمشروع
    - متابعة الجدول الزمني
    - مراقبة الميزانية
    - إدارة الفريق
    - تقارير التقدم
    """
    
    def get_project_overview(self, project_id: int, manager_id: int) -> Dict:
        """نظرة عامة على المشروع"""
        return {
            "project_id": project_id,
            "project_name": "Riyadh Tower",
            "client": "Saudi Real Estate Co.",
            "contract_value": 15_000_000.00,
            "start_date": "2024-01-15",
            "planned_end_date": "2025-06-30",
            "current_progress": 45.5,  # percentage
            "schedule_status": "on_track",
            "budget_status": "slight_overrun",
            "quality_status": "excellent",
            "team_size": 45,
            "active_subcontractors": 8,
            "days_remaining": 365,
            "milestones_completed": 8,
            "milestones_remaining": 12
        }
    
    def get_schedule_dashboard(self, project_id: int) -> Dict:
        """لوحة الجدول الزمني"""
        return {
            "current_phase": "Structural Works",
            "phase_progress": 65.0,
            "critical_path_activities": [
                {
                    "activity": "Foundation Concrete Pour",
                    "status": "completed",
                    "planned_finish": "2024-03-15",
                    "actual_finish": "2024-03-13"
                },
                {
                    "activity": "Column Formwork - Level 5",
                    "status": "in_progress",
                    "progress": 75,
                    "planned_finish": "2024-07-20",
                    "forecast_finish": "2024-07-18"
                },
                {
                    "activity": "Slab Reinforcement - Level 4",
                    "status": "upcoming",
                    "planned_start": "2024-07-25",
                    "planned_finish": "2024-08-05"
                }
            ],
            "upcoming_milestones": [
                {
                    "milestone": "Structural Completion",
                    "date": "2024-12-30",
                    "days_remaining": 180,
                    "status": "on_track"
                },
                {
                    "milestone": "MEP Rough-in Complete",
                    "date": "2025-03-15",
                    "days_remaining": 255,
                    "status": "on_track"
                }
            ],
            "delayed_activities": [
                {
                    "activity": "Plumbing Rough-in - Level 3",
                    "delay_days": 5,
                    "impact": "medium",
                    "recovery_plan": "Add weekend shift"
                }
            ]
        }
    
    def get_budget_dashboard(self, project_id: int) -> Dict:
        """لوحة الميزانية والتكاليف"""
        return {
            "budget_summary": {
                "total_budget": 15_000_000.00,
                "committed_costs": 6_750_000.00,
                "actual_costs": 6_825_000.00,
                "remaining_budget": 8_175_000.00,
                "forecast_at_completion": 15_225_000.00,
                "variance": -225_000.00,  # over budget
                "variance_percentage": -1.5
            },
            "cost_by_category": [
                {
                    "category": "Labor",
                    "budget": 6_000_000,
                    "actual": 6_100_000,
                    "variance": -100_000,
                    "percentage": 40.0
                },
                {
                    "category": "Materials",
                    "budget": 5_250_000,
                    "actual": 5_150_000,
                    "variance": 100_000,
                    "percentage": 35.0
                },
                {
                    "category": "Subcontractors",
                    "budget": 2_400_000,
                    "actual": 2_375_000,
                    "variance": 25_000,
                    "percentage": 16.0
                },
                {
                    "category": "Equipment",
                    "budget": 900_000,
                    "actual": 875_000,
                    "variance": 25_000,
                    "percentage": 6.0
                }
            ],
            "cash_flow_forecast": [
                {"month": "Jul 2024", "planned": 1_200_000, "actual": 1_225_000},
                {"month": "Aug 2024", "planned": 1_350_000, "forecast": 1_380_000},
                {"month": "Sep 2024", "planned": 1_280_000, "forecast": 1_290_000}
            ]
        }
    
    def get_team_performance(self, project_id: int) -> Dict:
        """أداء الفريق"""
        return {
            "team_summary": {
                "total_staff": 45,
                "engineers": 12,
                "foremen": 8,
                "skilled_labor": 15,
                "unskilled_labor": 10,
                "attendance_rate": 96.5,
                "productivity_index": 92.0
            },
            "top_performers": [
                {
                    "name": "Ahmed Al-Qahtani",
                    "role": "Site Engineer",
                    "productivity": 98,
                    "tasks_completed": 145
                },
                {
                    "name": "Mohammed Al-Harbi",
                    "role": "Foreman",
                    "productivity": 95,
                    "tasks_completed": 132
                }
            ],
            "subcontractor_performance": [
                {
                    "subcontractor": "Steel Structures Co.",
                    "contract_value": 2_400_000,
                    "progress": 65.0,
                    "quality_rating": 4.5,
                    "on_time_delivery": 92.0
                },
                {
                    "subcontractor": "MEP Systems Ltd.",
                    "contract_value": 1_800_000,
                    "progress": 42.0,
                    "quality_rating": 4.2,
                    "on_time_delivery": 88.0
                }
            ]
        }


# ==================== Site Engineer Dashboard ====================

class SiteEngineerDashboard:
    """
    لوحة التحكم لمهندس الموقع
    ==========================
    
    المميزات:
    - التقارير اليومية
    - إدارة العمالة الميدانية
    - رفع الصور والوثائق
    - متابعة الأنشطة الجارية
    - الواجهة الأمثل للجوال
    """
    
    def get_daily_activities(self, project_id: int, engineer_id: int) -> Dict:
        """الأنشطة اليومية"""
        return {
            "date": datetime.now().date().isoformat(),
            "weather": {
                "condition": "Sunny",
                "temperature": 38,
                "suitable_for_work": True
            },
            "ongoing_activities": [
                {
                    "activity_id": 1,
                    "name": "Column Formwork - Level 5",
                    "zone": "Grid A-D / 1-4",
                    "crew_size": 8,
                    "progress_today": 15.0,
                    "total_progress": 75.0,
                    "status": "on_track"
                },
                {
                    "activity_id": 2,
                    "name": "Slab Reinforcement - Level 4",
                    "zone": "Grid E-H / 5-8",
                    "crew_size": 6,
                    "progress_today": 20.0,
                    "total_progress": 60.0,
                    "status": "ahead"
                }
            ],
            "completed_today": [
                {
                    "activity": "Concrete Curing - Level 3",
                    "completion_time": "14:30",
                    "quality_check": "passed"
                }
            ],
            "pending_tasks": [
                {
                    "task": "Request steel delivery for Level 6",
                    "priority": "high",
                    "due_time": "16:00"
                },
                {
                    "task": "Submit daily report",
                    "priority": "medium",
                    "due_time": "18:00"
                }
            ]
        }
    
    def get_labor_dashboard(self, project_id: int) -> Dict:
        """لوحة العمالة"""
        return {
            "today_attendance": {
                "total_expected": 45,
                "present": 43,
                "absent": 2,
                "attendance_rate": 95.6
            },
            "labor_by_trade": [
                {"trade": "Carpenters", "present": 12, "assigned": 12},
                {"trade": "Steel Fixers", "present": 10, "assigned": 10},
                {"trade": "Concrete Workers", "present": 8, "assigned": 9},
                {"trade": "Laborers", "present": 13, "assigned": 14}
            ],
            "productivity_tracking": {
                "target_man_hours": 360,
                "actual_man_hours": 344,
                "efficiency": 95.6
            },
            "safety_status": {
                "ppe_compliance": 98.0,
                "incidents_today": 0,
                "near_misses": 1,
                "safety_score": 96
            }
        }
    
    def submit_daily_report(
        self,
        project_id: int,
        engineer_id: int,
        report_data: Dict
    ) -> Dict:
        """تقديم التقرير اليومي"""
        report = {
            "report_id": f"DR-{datetime.now().strftime('%Y%m%d')}-001",
            "project_id": project_id,
            "engineer_id": engineer_id,
            "date": datetime.now().date().isoformat(),
            "activities_progress": report_data.get("activities", []),
            "labor_summary": report_data.get("labor", {}),
            "materials_used": report_data.get("materials", []),
            "equipment_usage": report_data.get("equipment", []),
            "issues_encountered": report_data.get("issues", []),
            "photos": report_data.get("photos", []),
            "weather": report_data.get("weather", {}),
            "notes": report_data.get("notes", ""),
            "submitted_at": datetime.now().isoformat(),
            "status": "submitted"
        }
        return report


# ==================== Execution Engineer Dashboard ====================

class ExecutionEngineerDashboard:
    """
    لوحة التحكم لمهندس التنفيذ
    ===========================
    
    المميزات:
    - مقارنة المخططات
    - إدارة RFI
    - متابعة التعديلات
    - مراجعة Shop Drawings
    """
    
    def get_drawing_comparison_dashboard(self, project_id: int) -> Dict:
        """لوحة مقارنة المخططات"""
        return {
            "pending_comparisons": [
                {
                    "drawing_number": "A-301",
                    "title": "Third Floor Plan",
                    "old_revision": "C",
                    "new_revision": "D",
                    "changes_count": 8,
                    "priority": "high"
                },
                {
                    "drawing_number": "S-205",
                    "title": "Foundation Details",
                    "old_revision": "B",
                    "new_revision": "C",
                    "changes_count": 3,
                    "priority": "medium"
                }
            ],
            "recent_comparisons": [
                {
                    "drawing_number": "A-201",
                    "compared_at": "2024-07-10 14:30",
                    "changes_identified": 5,
                    "rfis_generated": 2,
                    "status": "completed"
                }
            ],
            "change_impact_analysis": {
                "total_drawings_affected": 12,
                "critical_changes": 3,
                "moderate_changes": 7,
                "minor_changes": 15,
                "estimated_cost_impact": 45_000.00,
                "estimated_time_impact": 5  # days
            }
        }
    
    def get_rfi_dashboard(self, project_id: int) -> Dict:
        """لوحة RFI (Request for Information)"""
        return {
            "rfi_summary": {
                "total_rfis": 45,
                "open": 8,
                "under_review": 5,
                "answered": 30,
                "closed": 2,
                "avg_response_time": 3.2  # days
            },
            "open_rfis": [
                {
                    "rfi_number": "RFI-2024-045",
                    "subject": "Clarification on beam reinforcement detail",
                    "drawing_ref": "S-305",
                    "priority": "high",
                    "submitted_date": "2024-07-08",
                    "days_open": 5,
                    "assigned_to": "Technical Office"
                },
                {
                    "rfi_number": "RFI-2024-044",
                    "subject": "Window frame dimensions conflict",
                    "drawing_ref": "A-401, A-402",
                    "priority": "medium",
                    "submitted_date": "2024-07-10",
                    "days_open": 3,
                    "assigned_to": "Design Team"
                }
            ],
            "rfi_by_category": [
                {"category": "Structural", "count": 18, "percentage": 40.0},
                {"category": "Architectural", "count": 15, "percentage": 33.3},
                {"category": "MEP", "count": 12, "percentage": 26.7}
            ]
        }


# ==================== Supervisor Dashboard ====================

class SupervisorDashboard:
    """
    لوحة التحكم للمشرف
    ====================
    
    المميزات:
    - إشراف على العمالة
    - متابعة الأنشطة
    - مراقبة الجودة
    - السلامة
    """
    
    def get_supervision_dashboard(self, project_id: int, supervisor_id: int) -> Dict:
        """لوحة الإشراف"""
        return {
            "assigned_zone": "Grid A-D / Levels 4-6",
            "crew_size": 18,
            "active_activities": [
                {
                    "activity": "Formwork Installation - Level 5",
                    "crew": 8,
                    "progress": 65.0,
                    "status": "on_track",
                    "quality_checks": 3,
                    "issues": 0
                },
                {
                    "activity": "Reinforcement Placement - Level 4",
                    "crew": 6,
                    "progress": 80.0,
                    "status": "ahead",
                    "quality_checks": 2,
                    "issues": 0
                }
            ],
            "quality_inspections_today": [
                {
                    "inspection": "Concrete slump test",
                    "time": "09:30",
                    "result": "Passed",
                    "value": "150mm"
                },
                {
                    "inspection": "Reinforcement spacing check",
                    "time": "11:15",
                    "result": "Passed",
                    "notes": "All within tolerance"
                }
            ],
            "safety_observations": {
                "ppe_compliance": 98.0,
                "housekeeping_score": 92.0,
                "near_misses_today": 1,
                "corrective_actions": 2
            }
        }


# ==================== Planning Engineer Dashboard ====================

class PlanningEngineerDashboard:
    """
    لوحة التحكم لمهندس التخطيط
    ============================
    
    المميزات:
    - إدارة الجدول الزمني
    - تحليل المسار الحرج
    - تحديثات التقدم
    - تحليل الانحرافات
    """
    
    def get_schedule_analysis(self, project_id: int) -> Dict:
        """تحليل الجدول الزمني"""
        return {
            "schedule_performance": {
                "planned_progress": 45.0,
                "actual_progress": 43.5,
                "schedule_variance": -1.5,  # percentage
                "schedule_performance_index": 0.97,
                "estimated_completion": "2025-07-15",
                "baseline_completion": "2025-06-30",
                "delay_days": 15
            },
            "critical_path": [
                {
                    "activity": "Structural Steel Erection",
                    "float": 0,
                    "duration": 45,
                    "progress": 75.0,
                    "status": "critical"
                },
                {
                    "activity": "Facade Installation",
                    "float": 0,
                    "duration": 60,
                    "progress": 0,
                    "status": "upcoming"
                }
            ],
            "upcoming_constraints": [
                {
                    "constraint": "Steel delivery for Level 7",
                    "date": "2024-07-25",
                    "impact": "high",
                    "mitigation": "Confirm with supplier"
                }
            ],
            "recovery_plan": {
                "required_acceleration": 15,  # days
                "proposed_actions": [
                    "Add night shift for structural works",
                    "Increase crew size by 20%",
                    "Fast-track MEP coordination"
                ],
                "estimated_cost": 120_000.00
            }
        }


# ==================== Cost Control Engineer Dashboard ====================

class CostControlEngineerDashboard:
    """
    لوحة التحكم لمهندس الكنترول كوست
    ==================================
    
    المميزات:
    - مراقبة التكاليف
    - تحليل الانحرافات
    - التنبؤ بالتكلفة النهائية
    - تقارير القيمة المكتسبة
    """
    
    def get_cost_performance_dashboard(self, project_id: int) -> Dict:
        """لوحة أداء التكاليف"""
        return {
            "earned_value_analysis": {
                "planned_value": 6_750_000.00,
                "earned_value": 6_600_000.00,
                "actual_cost": 6_825_000.00,
                "cost_variance": -225_000.00,
                "schedule_variance": -150_000.00,
                "cost_performance_index": 0.967,
                "schedule_performance_index": 0.978,
                "estimate_at_completion": 15_225_000.00,
                "variance_at_completion": -225_000.00,
                "to_complete_performance_index": 1.028
            },
            "cost_trends": [
                {
                    "period": "Month 1",
                    "cpi": 1.02,
                    "spi": 1.05,
                    "status": "good"
                },
                {
                    "period": "Month 2",
                    "cpi": 0.98,
                    "spi": 1.01,
                    "status": "acceptable"
                },
                {
                    "period": "Month 3",
                    "cpi": 0.95,
                    "spi": 0.97,
                    "status": "warning"
                }
            ],
            "cost_alerts": [
                {
                    "category": "Steel Materials",
                    "budget": 2_100_000,
                    "committed": 2_240_000,
                    "variance": -140_000,
                    "variance_percentage": -6.7,
                    "alert_level": "high"
                }
            ]
        }


# ==================== Technical Office Dashboard ====================

class TechnicalOfficeDashboard:
    """
    لوحة التحكم للمكتب الفني
    =========================
    
    المميزات:
    - إدارة المخططات
    - موافقات Shop Drawings
    - إدارة المواصفات
    - المراسلات الفنية
    """
    
    def get_drawing_management_dashboard(self, project_id: int) -> Dict:
        """لوحة إدارة المخططات"""
        return {
            "drawing_status": {
                "total_drawings": 245,
                "approved": 198,
                "under_review": 12,
                "pending_submission": 8,
                "rejected": 3,
                "superseded": 24
            },
            "pending_approvals": [
                {
                    "drawing_number": "SD-MEP-101",
                    "title": "HVAC Duct Layout - Level 3",
                    "type": "Shop Drawing",
                    "submitted_by": "MEP Contractor",
                    "submitted_date": "2024-07-08",
                    "days_pending": 5,
                    "priority": "high"
                }
            ],
            "recent_revisions": [
                {
                    "drawing_number": "A-301",
                    "revision": "D",
                    "changes": "Updated window details",
                    "approved_date": "2024-07-10",
                    "impact": "minor"
                }
            ],
            "transmittals": {
                "sent": 45,
                "received": 38,
                "pending_response": 7,
                "overdue_responses": 2
            }
        }


# ==================== Accounts & Finance Dashboard ====================

class AccountsFinanceDashboard:
    """
    لوحة التحكم للحسابات والمالية
    ==============================
    
    المميزات:
    - إدارة الفواتير
    - متابعة المدفوعات
    - تقارير التدفق النقدي
    - المطالبات المالية
    """
    
    def get_financial_dashboard(self, project_id: int) -> Dict:
        """لوحة التحكم المالية"""
        return {
            "accounts_summary": {
                "total_invoiced": 6_750_000.00,
                "total_received": 5_400_000.00,
                "outstanding_receivables": 1_350_000.00,
                "total_paid": 4_850_000.00,
                "outstanding_payables": 780_000.00,
                "net_cash_position": 550_000.00
            },
            "pending_invoices": [
                {
                    "invoice_number": "INV-2024-045",
                    "amount": 850_000.00,
                    "issue_date": "2024-06-30",
                    "due_date": "2024-07-30",
                    "status": "sent",
                    "days_outstanding": 13
                }
            ],
            "upcoming_payments": [
                {
                    "payee": "Steel Supplier",
                    "amount": 340_000.00,
                    "due_date": "2024-07-20",
                    "days_until_due": 7,
                    "status": "approved"
                }
            ],
            "cash_flow_forecast": [
                {"month": "Jul 2024", "inflow": 1_200_000, "outflow": 950_000, "net": 250_000},
                {"month": "Aug 2024", "inflow": 1_350_000, "outflow": 1_100_000, "net": 250_000}
            ]
        }


# ==================== Dashboard Manager ====================

class DashboardManager:
    """مدير لوحات التحكم - يدير جميع لوحات التحكم المتخصصة"""
    
    def __init__(self):
        self.company_owner_dashboard = CompanyOwnerDashboard()
        self.project_manager_dashboard = ProjectManagerDashboard()
        self.site_engineer_dashboard = SiteEngineerDashboard()
        self.execution_engineer_dashboard = ExecutionEngineerDashboard()
        self.supervisor_dashboard = SupervisorDashboard()
        self.planning_engineer_dashboard = PlanningEngineerDashboard()
        self.cost_control_dashboard = CostControlEngineerDashboard()
        self.technical_office_dashboard = TechnicalOfficeDashboard()
        self.accounts_finance_dashboard = AccountsFinanceDashboard()
    
    def get_dashboard_for_role(
        self,
        role: str,
        user_id: int,
        project_id: Optional[int] = None,
        company_id: Optional[int] = None
    ) -> Dict:
        """
        الحصول على لوحة التحكم المناسبة حسب الدور
        
        Args:
            role: دور المستخدم
            user_id: معرّف المستخدم
            project_id: معرّف المشروع (اختياري)
            company_id: معرّف الشركة (اختياري)
        
        Returns:
            بيانات لوحة التحكم المناسبة
        """
        dashboards = {
            "company_owner": self._get_company_owner_dashboard,
            "project_manager": self._get_project_manager_dashboard,
            "site_engineer": self._get_site_engineer_dashboard,
            "execution_engineer": self._get_execution_engineer_dashboard,
            "supervisor": self._get_supervisor_dashboard,
            "planning_engineer": self._get_planning_engineer_dashboard,
            "cost_control": self._get_cost_control_dashboard,
            "technical_office": self._get_technical_office_dashboard,
            "accounts_finance": self._get_accounts_finance_dashboard
        }
        
        dashboard_func = dashboards.get(role)
        if not dashboard_func:
            return {"error": "Invalid role"}
        
        return dashboard_func(user_id, project_id, company_id)
    
    def _get_company_owner_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة صاحب الشركة"""
        return {
            "role": "company_owner",
            "title": "لوحة التحكم التنفيذية",
            "summary": self.company_owner_dashboard.get_executive_summary(company_id or 1),
            "financial_overview": self.company_owner_dashboard.get_financial_overview(company_id or 1),
            "project_health": self.company_owner_dashboard.get_project_health_status(company_id or 1),
            "critical_alerts": self.company_owner_dashboard.get_critical_alerts(company_id or 1)
        }
    
    def _get_project_manager_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة مدير المشروع"""
        pid = project_id or 1
        return {
            "role": "project_manager",
            "title": "لوحة إدارة المشروع",
            "overview": self.project_manager_dashboard.get_project_overview(pid, user_id),
            "schedule": self.project_manager_dashboard.get_schedule_dashboard(pid),
            "budget": self.project_manager_dashboard.get_budget_dashboard(pid),
            "team": self.project_manager_dashboard.get_team_performance(pid)
        }
    
    def _get_site_engineer_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة مهندس الموقع"""
        pid = project_id or 1
        return {
            "role": "site_engineer",
            "title": "لوحة العمليات الميدانية",
            "daily_activities": self.site_engineer_dashboard.get_daily_activities(pid, user_id),
            "labor": self.site_engineer_dashboard.get_labor_dashboard(pid)
        }
    
    def _get_execution_engineer_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة مهندس التنفيذ"""
        pid = project_id or 1
        return {
            "role": "execution_engineer",
            "title": "لوحة التنفيذ والمخططات",
            "drawing_comparison": self.execution_engineer_dashboard.get_drawing_comparison_dashboard(pid),
            "rfi": self.execution_engineer_dashboard.get_rfi_dashboard(pid)
        }
    
    def _get_supervisor_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة المشرف"""
        pid = project_id or 1
        return {
            "role": "supervisor",
            "title": "لوحة الإشراف",
            "supervision": self.supervisor_dashboard.get_supervision_dashboard(pid, user_id)
        }
    
    def _get_planning_engineer_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة مهندس التخطيط"""
        pid = project_id or 1
        return {
            "role": "planning_engineer",
            "title": "لوحة التخطيط والجدول الزمني",
            "schedule_analysis": self.planning_engineer_dashboard.get_schedule_analysis(pid)
        }
    
    def _get_cost_control_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة مهندس كنترول كوست"""
        pid = project_id or 1
        return {
            "role": "cost_control",
            "title": "لوحة مراقبة التكاليف",
            "cost_performance": self.cost_control_dashboard.get_cost_performance_dashboard(pid)
        }
    
    def _get_technical_office_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة المكتب الفني"""
        pid = project_id or 1
        return {
            "role": "technical_office",
            "title": "لوحة المكتب الفني",
            "drawing_management": self.technical_office_dashboard.get_drawing_management_dashboard(pid)
        }
    
    def _get_accounts_finance_dashboard(self, user_id: int, project_id: Optional[int], company_id: Optional[int]) -> Dict:
        """لوحة الحسابات والمالية"""
        pid = project_id or 1
        return {
            "role": "accounts_finance",
            "title": "لوحة الحسابات والمالية",
            "financial": self.accounts_finance_dashboard.get_financial_dashboard(pid)
        }


# ==================== Example Usage ====================

if __name__ == "__main__":
    # إنشاء مدير لوحات التحكم
    dashboard_manager = DashboardManager()
    
    # مثال 1: لوحة صاحب الشركة
    owner_dashboard = dashboard_manager.get_dashboard_for_role(
        role="company_owner",
        user_id=1,
        company_id=1
    )
    print("=== Company Owner Dashboard ===")
    print(f"Total Projects: {owner_dashboard['summary']['total_projects']}")
    print(f"Net Profit: {owner_dashboard['summary']['net_profit']:,.2f} SAR")
    print(f"Profit Margin: {owner_dashboard['summary']['profit_margin']}%")
    
    # مثال 2: لوحة مدير المشروع
    pm_dashboard = dashboard_manager.get_dashboard_for_role(
        role="project_manager",
        user_id=2,
        project_id=1
    )
    print("\n=== Project Manager Dashboard ===")
    print(f"Project: {pm_dashboard['overview']['project_name']}")
    print(f"Progress: {pm_dashboard['overview']['current_progress']}%")
    print(f"Budget Status: {pm_dashboard['overview']['budget_status']}")
    
    # مثال 3: لوحة مهندس الموقع
    site_dashboard = dashboard_manager.get_dashboard_for_role(
        role="site_engineer",
        user_id=3,
        project_id=1
    )
    print("\n=== Site Engineer Dashboard ===")
    print(f"Ongoing Activities: {len(site_dashboard['daily_activities']['ongoing_activities'])}")
    print(f"Attendance Rate: {site_dashboard['labor']['today_attendance']['attendance_rate']}%")
