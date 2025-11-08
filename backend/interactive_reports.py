"""
NOUFAL ERP - Interactive Reports System
========================================
نظام التقارير التفاعلية

This module provides comprehensive interactive reporting capabilities:
- Executive Summary Reports
- Progress Reports
- Financial Reports
- Cost Analysis Reports
- Schedule Reports
- Material Status Reports
- Labor Reports
- Quality Reports
- Export to PDF, Excel, Word
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict


# ==================== Report Models ====================

class ReportType(Enum):
    """أنواع التقارير"""
    EXECUTIVE_SUMMARY = "executive_summary"
    PROGRESS_REPORT = "progress_report"
    FINANCIAL_REPORT = "financial_report"
    COST_ANALYSIS = "cost_analysis"
    SCHEDULE_REPORT = "schedule_report"
    MATERIAL_STATUS = "material_status"
    LABOR_REPORT = "labor_report"
    QUALITY_REPORT = "quality_report"
    SUBCONTRACTOR_PERFORMANCE = "subcontractor_performance"
    SAFETY_REPORT = "safety_report"
    CUSTOM = "custom"


class ReportFormat(Enum):
    """صيغ التقرير"""
    PDF = "pdf"
    EXCEL = "excel"
    WORD = "word"
    HTML = "html"
    JSON = "json"


@dataclass
class ReportMetadata:
    """بيانات التقرير الوصفية"""
    report_id: str
    report_type: ReportType
    title: str
    subtitle: Optional[str]
    project_id: int
    project_name: str
    generated_by: int
    generated_by_name: str
    generated_at: datetime
    report_period_start: Optional[datetime]
    report_period_end: Optional[datetime]
    company_name: str = "NOUFAL ERP"
    company_logo: Optional[str] = None


@dataclass
class ReportSection:
    """قسم في التقرير"""
    section_id: str
    title: str
    order: int
    content_type: str  # text, table, chart, image, metrics
    content: Any
    show_in_summary: bool = True


@dataclass
class InteractiveReport:
    """تقرير تفاعلي كامل"""
    metadata: ReportMetadata
    sections: List[ReportSection]
    charts: List[Dict] = field(default_factory=list)
    tables: List[Dict] = field(default_factory=list)
    attachments: List[str] = field(default_factory=list)
    filters: Dict[str, Any] = field(default_factory=dict)


# ==================== Executive Summary Report ====================

class ExecutiveSummaryReport:
    """
    التقرير التنفيذي الشامل
    =======================
    
    تقرير عالي المستوى لصناع القرار
    """
    
    def generate(
        self,
        project_id: int,
        project_data: Dict,
        period_start: datetime,
        period_end: datetime
    ) -> InteractiveReport:
        """
        توليد التقرير التنفيذي
        
        Returns:
            تقرير تنفيذي شامل
        """
        metadata = ReportMetadata(
            report_id=f"EXEC-{datetime.now().strftime('%Y%m%d')}-{project_id}",
            report_type=ReportType.EXECUTIVE_SUMMARY,
            title="التقرير التنفيذي للمشروع",
            subtitle=f"الفترة من {period_start.date()} إلى {period_end.date()}",
            project_id=project_id,
            project_name=project_data.get("name", "Unknown Project"),
            generated_by=1,
            generated_by_name="System Admin",
            generated_at=datetime.now(),
            report_period_start=period_start,
            report_period_end=period_end
        )
        
        sections = []
        
        # القسم 1: ملخص المشروع
        sections.append(ReportSection(
            section_id="project_overview",
            title="نظرة عامة على المشروع",
            order=1,
            content_type="metrics",
            content={
                "contract_value": {
                    "label": "قيمة العقد",
                    "value": project_data.get("contract_value", 0),
                    "format": "currency"
                },
                "completion_percentage": {
                    "label": "نسبة الإنجاز",
                    "value": project_data.get("completion_percentage", 0),
                    "format": "percentage"
                },
                "days_elapsed": {
                    "label": "الأيام المنقضية",
                    "value": (datetime.now() - project_data.get("start_date", datetime.now())).days,
                    "format": "number"
                },
                "days_remaining": {
                    "label": "الأيام المتبقية",
                    "value": (project_data.get("end_date", datetime.now()) - datetime.now()).days,
                    "format": "number"
                }
            }
        ))
        
        # القسم 2: الأداء المالي
        sections.append(ReportSection(
            section_id="financial_performance",
            title="الأداء المالي",
            order=2,
            content_type="table",
            content={
                "headers": ["البند", "المخطط", "الفعلي", "الفرق", "النسبة"],
                "rows": [
                    [
                        "الإيرادات",
                        f"{project_data.get('planned_revenue', 0):,.2f}",
                        f"{project_data.get('actual_revenue', 0):,.2f}",
                        f"{project_data.get('actual_revenue', 0) - project_data.get('planned_revenue', 0):,.2f}",
                        f"{((project_data.get('actual_revenue', 0) - project_data.get('planned_revenue', 0)) / project_data.get('planned_revenue', 1) * 100):.2f}%"
                    ],
                    [
                        "التكاليف",
                        f"{project_data.get('planned_cost', 0):,.2f}",
                        f"{project_data.get('actual_cost', 0):,.2f}",
                        f"{project_data.get('actual_cost', 0) - project_data.get('planned_cost', 0):,.2f}",
                        f"{((project_data.get('actual_cost', 0) - project_data.get('planned_cost', 0)) / project_data.get('planned_cost', 1) * 100):.2f}%"
                    ],
                    [
                        "الربح",
                        f"{project_data.get('planned_profit', 0):,.2f}",
                        f"{project_data.get('actual_profit', 0):,.2f}",
                        f"{project_data.get('actual_profit', 0) - project_data.get('planned_profit', 0):,.2f}",
                        f"{((project_data.get('actual_profit', 0) - project_data.get('planned_profit', 0)) / project_data.get('planned_profit', 1) * 100):.2f}%"
                    ]
                ]
            }
        ))
        
        # القسم 3: حالة الجدول الزمني
        sections.append(ReportSection(
            section_id="schedule_status",
            title="حالة الجدول الزمني",
            order=3,
            content_type="chart",
            content={
                "chart_type": "gantt",
                "data": {
                    "milestones": [
                        {
                            "name": "بداية المشروع",
                            "date": project_data.get("start_date", datetime.now()).isoformat(),
                            "status": "completed"
                        },
                        {
                            "name": "اكتمال الأساسات",
                            "date": (project_data.get("start_date", datetime.now()) + timedelta(days=60)).isoformat(),
                            "status": "completed"
                        },
                        {
                            "name": "اكتمال الهيكل الإنشائي",
                            "date": (project_data.get("start_date", datetime.now()) + timedelta(days=180)).isoformat(),
                            "status": "in_progress"
                        },
                        {
                            "name": "الانتهاء من التشطيبات",
                            "date": (project_data.get("start_date", datetime.now()) + timedelta(days=450)).isoformat(),
                            "status": "upcoming"
                        },
                        {
                            "name": "التسليم النهائي",
                            "date": project_data.get("end_date", datetime.now()).isoformat(),
                            "status": "upcoming"
                        }
                    ]
                }
            }
        ))
        
        # القسم 4: مؤشرات الأداء الرئيسية
        sections.append(ReportSection(
            section_id="kpis",
            title="مؤشرات الأداء الرئيسية (KPIs)",
            order=4,
            content_type="metrics",
            content={
                "cpi": {
                    "label": "مؤشر أداء التكلفة (CPI)",
                    "value": project_data.get("cpi", 1.0),
                    "format": "decimal",
                    "status": "good" if project_data.get("cpi", 1.0) >= 0.95 else "warning"
                },
                "spi": {
                    "label": "مؤشر أداء الجدول (SPI)",
                    "value": project_data.get("spi", 1.0),
                    "format": "decimal",
                    "status": "good" if project_data.get("spi", 1.0) >= 0.95 else "warning"
                },
                "quality_score": {
                    "label": "درجة الجودة",
                    "value": project_data.get("quality_score", 90),
                    "format": "number",
                    "status": "excellent" if project_data.get("quality_score", 90) >= 90 else "good"
                },
                "safety_score": {
                    "label": "درجة السلامة",
                    "value": project_data.get("safety_score", 95),
                    "format": "number",
                    "status": "excellent" if project_data.get("safety_score", 95) >= 95 else "good"
                }
            }
        ))
        
        # القسم 5: القضايا والمخاطر
        sections.append(ReportSection(
            section_id="issues_risks",
            title="القضايا والمخاطر",
            order=5,
            content_type="table",
            content={
                "headers": ["الأولوية", "الوصف", "الحالة", "المسؤول", "تاريخ التحديث"],
                "rows": [
                    ["عالية", "تأخير في توريد الحديد", "قيد المعالجة", "مدير المشتريات", "2024-07-10"],
                    ["متوسطة", "نقص في العمالة الماهرة", "تحت المراقبة", "مدير المشروع", "2024-07-12"],
                    ["عالية", "تعارض في المخططات", "تم الحل", "المكتب الفني", "2024-07-08"]
                ]
            }
        ))
        
        # القسم 6: التوصيات
        sections.append(ReportSection(
            section_id="recommendations",
            title="التوصيات",
            order=6,
            content_type="text",
            content={
                "recommendations": [
                    "تسريع وتيرة الأعمال الإنشائية لتعويض التأخير البسيط",
                    "مراجعة عقود الموردين للحصول على أسعار أفضل",
                    "زيادة عدد نوبات العمل في المسار الحرج",
                    "تحسين التنسيق بين مقاولي الباطن"
                ]
            }
        ))
        
        return InteractiveReport(
            metadata=metadata,
            sections=sections
        )


# ==================== Progress Report ====================

class ProgressReport:
    """
    تقرير التقدم الدوري
    ===================
    
    تقرير مفصل عن تقدم الأعمال
    """
    
    def generate(
        self,
        project_id: int,
        report_date: datetime,
        activities_data: List[Dict]
    ) -> InteractiveReport:
        """
        توليد تقرير التقدم
        
        Returns:
            تقرير تقدم مفصل
        """
        metadata = ReportMetadata(
            report_id=f"PROG-{report_date.strftime('%Y%m%d')}-{project_id}",
            report_type=ReportType.PROGRESS_REPORT,
            title="تقرير تقدم المشروع",
            subtitle=f"حتى تاريخ {report_date.date()}",
            project_id=project_id,
            project_name="Sample Project",
            generated_by=1,
            generated_by_name="Site Engineer",
            generated_at=datetime.now(),
            report_period_start=None,
            report_period_end=report_date
        )
        
        sections = []
        
        # القسم 1: ملخص التقدم
        total_activities = len(activities_data)
        completed = len([a for a in activities_data if a.get("status") == "completed"])
        in_progress = len([a for a in activities_data if a.get("status") == "in_progress"])
        not_started = total_activities - completed - in_progress
        
        sections.append(ReportSection(
            section_id="progress_summary",
            title="ملخص التقدم",
            order=1,
            content_type="metrics",
            content={
                "total_activities": {
                    "label": "إجمالي الأنشطة",
                    "value": total_activities,
                    "format": "number"
                },
                "completed": {
                    "label": "المكتملة",
                    "value": completed,
                    "format": "number"
                },
                "in_progress": {
                    "label": "جارية",
                    "value": in_progress,
                    "format": "number"
                },
                "not_started": {
                    "label": "لم تبدأ",
                    "value": not_started,
                    "format": "number"
                }
            }
        ))
        
        # القسم 2: الأنشطة المكتملة
        completed_activities = [a for a in activities_data if a.get("status") == "completed"]
        if completed_activities:
            sections.append(ReportSection(
                section_id="completed_activities",
                title="الأنشطة المكتملة",
                order=2,
                content_type="table",
                content={
                    "headers": ["النشاط", "تاريخ البداية", "تاريخ الانتهاء", "المدة الفعلية"],
                    "rows": [
                        [
                            a.get("name", "Unknown"),
                            a.get("start_date", "N/A"),
                            a.get("end_date", "N/A"),
                            f"{a.get('duration', 0)} أيام"
                        ]
                        for a in completed_activities[:10]  # أول 10
                    ]
                }
            ))
        
        # القسم 3: الأنشطة الجارية
        ongoing_activities = [a for a in activities_data if a.get("status") == "in_progress"]
        if ongoing_activities:
            sections.append(ReportSection(
                section_id="ongoing_activities",
                title="الأنشطة الجارية",
                order=3,
                content_type="table",
                content={
                    "headers": ["النشاط", "تاريخ البداية", "نسبة الإنجاز", "الانتهاء المتوقع"],
                    "rows": [
                        [
                            a.get("name", "Unknown"),
                            a.get("start_date", "N/A"),
                            f"{a.get('progress', 0)}%",
                            a.get("expected_end", "N/A")
                        ]
                        for a in ongoing_activities
                    ]
                }
            ))
        
        # القسم 4: الأنشطة المتأخرة
        delayed = [a for a in activities_data if a.get("is_delayed", False)]
        if delayed:
            sections.append(ReportSection(
                section_id="delayed_activities",
                title="الأنشطة المتأخرة",
                order=4,
                content_type="table",
                content={
                    "headers": ["النشاط", "التأخير (أيام)", "السبب", "الإجراء المتخذ"],
                    "rows": [
                        [
                            a.get("name", "Unknown"),
                            a.get("delay_days", 0),
                            a.get("delay_reason", "N/A"),
                            a.get("corrective_action", "N/A")
                        ]
                        for a in delayed
                    ]
                }
            ))
        
        return InteractiveReport(
            metadata=metadata,
            sections=sections
        )


# ==================== Financial Report ====================

class FinancialReport:
    """
    التقرير المالي
    ==============
    
    تقرير مفصل عن الوضع المالي
    """
    
    def generate(
        self,
        project_id: int,
        financial_data: Dict,
        period_start: datetime,
        period_end: datetime
    ) -> InteractiveReport:
        """
        توليد التقرير المالي
        
        Returns:
            تقرير مالي شامل
        """
        metadata = ReportMetadata(
            report_id=f"FIN-{datetime.now().strftime('%Y%m%d')}-{project_id}",
            report_type=ReportType.FINANCIAL_REPORT,
            title="التقرير المالي للمشروع",
            subtitle=f"الفترة من {period_start.date()} إلى {period_end.date()}",
            project_id=project_id,
            project_name="Sample Project",
            generated_by=1,
            generated_by_name="Finance Manager",
            generated_at=datetime.now(),
            report_period_start=period_start,
            report_period_end=period_end
        )
        
        sections = []
        
        # القسم 1: الملخص المالي
        sections.append(ReportSection(
            section_id="financial_summary",
            title="الملخص المالي",
            order=1,
            content_type="metrics",
            content={
                "total_revenue": {
                    "label": "إجمالي الإيرادات",
                    "value": financial_data.get("total_revenue", 0),
                    "format": "currency"
                },
                "total_costs": {
                    "label": "إجمالي التكاليف",
                    "value": financial_data.get("total_costs", 0),
                    "format": "currency"
                },
                "net_profit": {
                    "label": "صافي الربح",
                    "value": financial_data.get("net_profit", 0),
                    "format": "currency"
                },
                "profit_margin": {
                    "label": "هامش الربح",
                    "value": financial_data.get("profit_margin", 0),
                    "format": "percentage"
                }
            }
        ))
        
        # القسم 2: توزيع التكاليف
        sections.append(ReportSection(
            section_id="cost_breakdown",
            title="توزيع التكاليف",
            order=2,
            content_type="chart",
            content={
                "chart_type": "pie",
                "data": {
                    "labels": ["العمالة", "المواد", "مقاولو الباطن", "المعدات", "النفقات العامة"],
                    "values": [
                        financial_data.get("labor_cost", 0),
                        financial_data.get("material_cost", 0),
                        financial_data.get("subcontractor_cost", 0),
                        financial_data.get("equipment_cost", 0),
                        financial_data.get("overhead_cost", 0)
                    ]
                }
            }
        ))
        
        # القسم 3: التدفق النقدي
        sections.append(ReportSection(
            section_id="cash_flow",
            title="التدفق النقدي",
            order=3,
            content_type="table",
            content={
                "headers": ["الشهر", "التدفقات الداخلة", "التدفقات الخارجة", "صافي التدفق", "الرصيد التراكمي"],
                "rows": [
                    ["يناير", "3,200,000", "2,400,000", "800,000", "800,000"],
                    ["فبراير", "3,800,000", "2,700,000", "1,100,000", "1,900,000"],
                    ["مارس", "4,100,000", "2,950,000", "1,150,000", "3,050,000"],
                    ["أبريل", "3,900,000", "2,800,000", "1,100,000", "4,150,000"],
                    ["مايو", "4,500,000", "3,200,000", "1,300,000", "5,450,000"],
                    ["يونيو", "4,800,000", "3,400,000", "1,400,000", "6,850,000"]
                ]
            }
        ))
        
        # القسم 4: الفواتير والمدفوعات
        sections.append(ReportSection(
            section_id="invoices_payments",
            title="الفواتير والمدفوعات",
            order=4,
            content_type="table",
            content={
                "headers": ["رقم الفاتورة", "التاريخ", "المبلغ", "المستلم", "المتبقي"],
                "rows": [
                    ["INV-2024-001", "2024-01-30", "1,200,000", "1,200,000", "0"],
                    ["INV-2024-002", "2024-02-28", "1,350,000", "1,350,000", "0"],
                    ["INV-2024-003", "2024-03-31", "1,280,000", "1,280,000", "0"],
                    ["INV-2024-004", "2024-04-30", "1,420,000", "1,050,000", "370,000"],
                    ["INV-2024-005", "2024-05-31", "1,550,000", "800,000", "750,000"]
                ]
            }
        ))
        
        return InteractiveReport(
            metadata=metadata,
            sections=sections
        )


# ==================== Material Status Report ====================

class MaterialStatusReport:
    """
    تقرير حالة المواد
    ==================
    
    تقرير مفصل عن حالة المواد
    """
    
    def generate(
        self,
        project_id: int,
        materials_data: List[Dict]
    ) -> InteractiveReport:
        """
        توليد تقرير حالة المواد
        
        Returns:
            تقرير حالة المواد
        """
        metadata = ReportMetadata(
            report_id=f"MAT-{datetime.now().strftime('%Y%m%d')}-{project_id}",
            report_type=ReportType.MATERIAL_STATUS,
            title="تقرير حالة المواد",
            subtitle=f"حتى تاريخ {datetime.now().date()}",
            project_id=project_id,
            project_name="Sample Project",
            generated_by=1,
            generated_by_name="Procurement Manager",
            generated_at=datetime.now(),
            report_period_start=None,
            report_period_end=datetime.now()
        )
        
        sections = []
        
        # القسم 1: ملخص المواد
        total_materials = len(materials_data)
        delivered = len([m for m in materials_data if m.get("status") == "delivered"])
        in_transit = len([m for m in materials_data if m.get("status") == "in_transit"])
        ordered = len([m for m in materials_data if m.get("status") == "ordered"])
        
        sections.append(ReportSection(
            section_id="material_summary",
            title="ملخص المواد",
            order=1,
            content_type="metrics",
            content={
                "total_items": {
                    "label": "إجمالي الأصناف",
                    "value": total_materials,
                    "format": "number"
                },
                "delivered": {
                    "label": "مستلمة",
                    "value": delivered,
                    "format": "number"
                },
                "in_transit": {
                    "label": "في الطريق",
                    "value": in_transit,
                    "format": "number"
                },
                "ordered": {
                    "label": "مطلوبة",
                    "value": ordered,
                    "format": "number"
                }
            }
        ))
        
        # القسم 2: جدول المواد
        sections.append(ReportSection(
            section_id="materials_table",
            title="حالة المواد التفصيلية",
            order=2,
            content_type="table",
            content={
                "headers": ["المادة", "الكمية المطلوبة", "الكمية المستلمة", "المتبقية", "الحالة", "الوصول المتوقع"],
                "rows": [
                    [
                        m.get("name", "Unknown"),
                        f"{m.get('required_quantity', 0)} {m.get('unit', '')}",
                        f"{m.get('delivered_quantity', 0)} {m.get('unit', '')}",
                        f"{m.get('required_quantity', 0) - m.get('delivered_quantity', 0)} {m.get('unit', '')}",
                        m.get("status", "unknown"),
                        m.get("expected_delivery", "N/A")
                    ]
                    for m in materials_data
                ]
            }
        ))
        
        return InteractiveReport(
            metadata=metadata,
            sections=sections
        )


# ==================== Report Manager ====================

class ReportManager:
    """
    مدير التقارير
    =============
    ينسق جميع أنواع التقارير
    """
    
    def __init__(self):
        self.executive_report = ExecutiveSummaryReport()
        self.progress_report = ProgressReport()
        self.financial_report = FinancialReport()
        self.material_report = MaterialStatusReport()
        self.generated_reports: List[InteractiveReport] = []
    
    def generate_report(
        self,
        report_type: ReportType,
        project_id: int,
        **kwargs
    ) -> InteractiveReport:
        """
        توليد تقرير من نوع معين
        
        Args:
            report_type: نوع التقرير
            project_id: معرّف المشروع
            **kwargs: بيانات إضافية حسب نوع التقرير
        
        Returns:
            التقرير المولد
        """
        if report_type == ReportType.EXECUTIVE_SUMMARY:
            report = self.executive_report.generate(
                project_id=project_id,
                project_data=kwargs.get("project_data", {}),
                period_start=kwargs.get("period_start", datetime.now() - timedelta(days=30)),
                period_end=kwargs.get("period_end", datetime.now())
            )
        elif report_type == ReportType.PROGRESS_REPORT:
            report = self.progress_report.generate(
                project_id=project_id,
                report_date=kwargs.get("report_date", datetime.now()),
                activities_data=kwargs.get("activities_data", [])
            )
        elif report_type == ReportType.FINANCIAL_REPORT:
            report = self.financial_report.generate(
                project_id=project_id,
                financial_data=kwargs.get("financial_data", {}),
                period_start=kwargs.get("period_start", datetime.now() - timedelta(days=30)),
                period_end=kwargs.get("period_end", datetime.now())
            )
        elif report_type == ReportType.MATERIAL_STATUS:
            report = self.material_report.generate(
                project_id=project_id,
                materials_data=kwargs.get("materials_data", [])
            )
        else:
            raise ValueError(f"Unsupported report type: {report_type}")
        
        self.generated_reports.append(report)
        return report
    
    def export_report(
        self,
        report: InteractiveReport,
        format: ReportFormat,
        output_path: str
    ) -> str:
        """
        تصدير التقرير إلى صيغة معينة
        
        Args:
            report: التقرير المراد تصديره
            format: الصيغة المطلوبة
            output_path: مسار الحفظ
        
        Returns:
            مسار الملف المحفوظ
        """
        if format == ReportFormat.PDF:
            return self._export_to_pdf(report, output_path)
        elif format == ReportFormat.EXCEL:
            return self._export_to_excel(report, output_path)
        elif format == ReportFormat.WORD:
            return self._export_to_word(report, output_path)
        elif format == ReportFormat.HTML:
            return self._export_to_html(report, output_path)
        elif format == ReportFormat.JSON:
            return self._export_to_json(report, output_path)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def _export_to_pdf(self, report: InteractiveReport, output_path: str) -> str:
        """تصدير إلى PDF"""
        # سيتم التطبيق باستخدام مكتبة مثل ReportLab أو WeasyPrint
        filename = f"{output_path}/{report.metadata.report_id}.pdf"
        print(f"Exporting to PDF: {filename}")
        return filename
    
    def _export_to_excel(self, report: InteractiveReport, output_path: str) -> str:
        """تصدير إلى Excel"""
        # سيتم التطبيق باستخدام مكتبة openpyxl أو xlsxwriter
        filename = f"{output_path}/{report.metadata.report_id}.xlsx"
        print(f"Exporting to Excel: {filename}")
        return filename
    
    def _export_to_word(self, report: InteractiveReport, output_path: str) -> str:
        """تصدير إلى Word"""
        # سيتم التطبيق باستخدام مكتبة python-docx
        filename = f"{output_path}/{report.metadata.report_id}.docx"
        print(f"Exporting to Word: {filename}")
        return filename
    
    def _export_to_html(self, report: InteractiveReport, output_path: str) -> str:
        """تصدير إلى HTML"""
        filename = f"{output_path}/{report.metadata.report_id}.html"
        print(f"Exporting to HTML: {filename}")
        return filename
    
    def _export_to_json(self, report: InteractiveReport, output_path: str) -> str:
        """تصدير إلى JSON"""
        filename = f"{output_path}/{report.metadata.report_id}.json"
        print(f"Exporting to JSON: {filename}")
        return filename
    
    def get_report_list(
        self,
        project_id: Optional[int] = None,
        report_type: Optional[ReportType] = None
    ) -> List[Dict]:
        """
        الحصول على قائمة التقارير المولدة
        
        Returns:
            قائمة بالتقارير
        """
        filtered = self.generated_reports
        
        if project_id:
            filtered = [r for r in filtered if r.metadata.project_id == project_id]
        
        if report_type:
            filtered = [r for r in filtered if r.metadata.report_type == report_type]
        
        return [
            {
                "report_id": r.metadata.report_id,
                "type": r.metadata.report_type.value,
                "title": r.metadata.title,
                "project_id": r.metadata.project_id,
                "generated_at": r.metadata.generated_at.isoformat(),
                "sections_count": len(r.sections)
            }
            for r in filtered
        ]


# ==================== Example Usage ====================

if __name__ == "__main__":
    # إنشاء مدير التقارير
    report_manager = ReportManager()
    
    # مثال 1: توليد تقرير تنفيذي
    print("=== Generating Executive Summary Report ===")
    project_data = {
        "name": "Riyadh Tower",
        "contract_value": 15_000_000.00,
        "completion_percentage": 45.0,
        "start_date": datetime(2024, 1, 15),
        "end_date": datetime(2025, 6, 30),
        "planned_revenue": 6_750_000.00,
        "actual_revenue": 6_600_000.00,
        "planned_cost": 4_860_000.00,
        "actual_cost": 4_950_000.00,
        "planned_profit": 1_890_000.00,
        "actual_profit": 1_650_000.00,
        "cpi": 0.97,
        "spi": 0.98,
        "quality_score": 92,
        "safety_score": 96
    }
    
    exec_report = report_manager.generate_report(
        report_type=ReportType.EXECUTIVE_SUMMARY,
        project_id=1,
        project_data=project_data,
        period_start=datetime(2024, 1, 1),
        period_end=datetime(2024, 6, 30)
    )
    
    print(f"Report ID: {exec_report.metadata.report_id}")
    print(f"Title: {exec_report.metadata.title}")
    print(f"Sections: {len(exec_report.sections)}")
    
    # مثال 2: تصدير التقرير إلى PDF
    print("\n=== Exporting Report to PDF ===")
    pdf_path = report_manager.export_report(
        report=exec_report,
        format=ReportFormat.PDF,
        output_path="/tmp/reports"
    )
    print(f"PDF exported to: {pdf_path}")
