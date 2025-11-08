"""
NOUFAL ERP - Electronic RFI System
===================================
نظام RFI (Request for Information) الإلكتروني

This module provides comprehensive RFI management:
- RFI Creation and Submission
- RFI Review and Response
- Drawing Reference Integration
- Status Tracking and Notifications
- Response Time Analytics
- RFI Templates
- Automated Workflows
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict


# ==================== RFI Models ====================

class RFIStatus(Enum):
    """حالات RFI"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ANSWERED = "answered"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class RFIPriority(Enum):
    """أولويات RFI"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RFICategory(Enum):
    """فئات RFI"""
    DRAWING_CLARIFICATION = "drawing_clarification"
    SPECIFICATION_QUERY = "specification_query"
    MATERIAL_SUBSTITUTION = "material_substitution"
    DESIGN_CONFLICT = "design_conflict"
    CONSTRUCTION_METHOD = "construction_method"
    SITE_CONDITION = "site_condition"
    GENERAL_QUERY = "general_query"


@dataclass
class RFI:
    """طلب معلومات (RFI)"""
    rfi_id: int
    rfi_number: str
    project_id: int
    submitted_by: int
    submitted_by_name: str
    subject: str
    description: str
    category: RFICategory
    priority: RFIPriority
    status: RFIStatus
    drawing_references: List[str] = field(default_factory=list)
    specification_references: List[str] = field(default_factory=list)
    attachments: List[str] = field(default_factory=list)
    cost_impact: Optional[float] = None
    schedule_impact_days: Optional[int] = None
    submitted_date: datetime = field(default_factory=datetime.now)
    required_response_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    assigned_to_name: Optional[str] = None
    response: Optional[str] = None
    response_by: Optional[int] = None
    response_by_name: Optional[str] = None
    response_date: Optional[datetime] = None
    response_attachments: List[str] = field(default_factory=list)
    requires_drawing_update: bool = False
    affected_activities: List[int] = field(default_factory=list)


@dataclass
class RFIComment:
    """تعليق على RFI"""
    comment_id: int
    rfi_id: int
    user_id: int
    user_name: str
    comment: str
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class RFITemplate:
    """قالب RFI"""
    template_id: int
    name: str
    category: RFICategory
    subject_template: str
    description_template: str
    required_fields: List[str]


# ==================== RFI Management System ====================

class RFIManager:
    """
    مدير نظام RFI
    =============
    
    يدير دورة حياة RFI الكاملة
    """
    
    def __init__(self):
        self.rfis: List[RFI] = []
        self.comments: List[RFIComment] = []
        self.templates: List[RFITemplate] = []
        self._initialize_templates()
    
    def _initialize_templates(self):
        """تهيئة القوالب الافتراضية"""
        self.templates = [
            RFITemplate(
                template_id=1,
                name="Drawing Conflict Resolution",
                category=RFICategory.DESIGN_CONFLICT,
                subject_template="Conflict between drawings [DRAWING_NUMBERS]",
                description_template="Please clarify the conflict between the following drawings:\n\nDrawing 1: [DRAWING_1]\nDrawing 2: [DRAWING_2]\n\nConflict Description: [DESCRIPTION]\n\nProposed Resolution: [RESOLUTION]",
                required_fields=["drawing_references", "description"]
            ),
            RFITemplate(
                template_id=2,
                name="Material Substitution Request",
                category=RFICategory.MATERIAL_SUBSTITUTION,
                subject_template="Material substitution request for [MATERIAL_NAME]",
                description_template="Requesting approval for material substitution:\n\nOriginal Material: [ORIGINAL]\nProposed Material: [PROPOSED]\n\nReason: [REASON]\n\nTechnical Comparison: [COMPARISON]",
                required_fields=["description", "specification_references"]
            ),
            RFITemplate(
                template_id=3,
                name="Construction Method Clarification",
                category=RFICategory.CONSTRUCTION_METHOD,
                subject_template="Clarification needed for [WORK_ITEM]",
                description_template="Please clarify the construction method for:\n\nWork Item: [WORK_ITEM]\nLocation: [LOCATION]\n\nQuestion: [QUESTION]\n\nProposed Method: [METHOD]",
                required_fields=["description", "drawing_references"]
            )
        ]
    
    def create_rfi(
        self,
        project_id: int,
        submitted_by: int,
        submitted_by_name: str,
        rfi_data: Dict
    ) -> RFI:
        """
        إنشاء RFI جديد
        
        Args:
            project_id: معرّف المشروع
            submitted_by: معرّف مقدم الطلب
            submitted_by_name: اسم مقدم الطلب
            rfi_data: بيانات RFI
        
        Returns:
            RFI المُنشأ
        """
        rfi_number = self._generate_rfi_number(project_id)
        
        # تحديد تاريخ الرد المطلوب بناءً على الأولوية
        priority = RFIPriority(rfi_data.get("priority", "medium"))
        days_to_respond = {
            RFIPriority.CRITICAL: 1,
            RFIPriority.HIGH: 3,
            RFIPriority.MEDIUM: 7,
            RFIPriority.LOW: 14
        }
        required_response_date = datetime.now() + timedelta(days=days_to_respond[priority])
        
        rfi = RFI(
            rfi_id=len(self.rfis) + 1,
            rfi_number=rfi_number,
            project_id=project_id,
            submitted_by=submitted_by,
            submitted_by_name=submitted_by_name,
            subject=rfi_data["subject"],
            description=rfi_data["description"],
            category=RFICategory(rfi_data.get("category", "general_query")),
            priority=priority,
            status=RFIStatus.DRAFT,
            drawing_references=rfi_data.get("drawing_references", []),
            specification_references=rfi_data.get("specification_references", []),
            attachments=rfi_data.get("attachments", []),
            cost_impact=rfi_data.get("cost_impact"),
            schedule_impact_days=rfi_data.get("schedule_impact_days"),
            required_response_date=required_response_date,
            affected_activities=rfi_data.get("affected_activities", [])
        )
        
        self.rfis.append(rfi)
        return rfi
    
    def _generate_rfi_number(self, project_id: int) -> str:
        """توليد رقم RFI فريد"""
        year = datetime.now().year
        project_rfis = [r for r in self.rfis if r.project_id == project_id]
        sequence = len(project_rfis) + 1
        return f"RFI-P{project_id:03d}-{year}-{sequence:04d}"
    
    def submit_rfi(self, rfi_id: int) -> Dict:
        """
        تقديم RFI للمراجعة
        
        Args:
            rfi_id: معرّف RFI
        
        Returns:
            تأكيد التقديم
        """
        rfi = next((r for r in self.rfis if r.rfi_id == rfi_id), None)
        
        if not rfi:
            return {"success": False, "error": "RFI not found"}
        
        if rfi.status != RFIStatus.DRAFT:
            return {"success": False, "error": "RFI already submitted"}
        
        rfi.status = RFIStatus.SUBMITTED
        rfi.submitted_date = datetime.now()
        
        # تعيين تلقائي للمكتب الفني أو المهندس المسؤول
        rfi.assigned_to = self._auto_assign_rfi(rfi)
        
        return {
            "success": True,
            "rfi_number": rfi.rfi_number,
            "status": rfi.status.value,
            "assigned_to": rfi.assigned_to,
            "required_response_date": rfi.required_response_date.isoformat() if rfi.required_response_date else None
        }
    
    def _auto_assign_rfi(self, rfi: RFI) -> int:
        """تعيين RFI تلقائياً بناءً على الفئة"""
        assignment_map = {
            RFICategory.DRAWING_CLARIFICATION: 10,  # Technical Office
            RFICategory.DESIGN_CONFLICT: 10,
            RFICategory.SPECIFICATION_QUERY: 10,
            RFICategory.MATERIAL_SUBSTITUTION: 11,  # Procurement
            RFICategory.CONSTRUCTION_METHOD: 5,  # Project Manager
            RFICategory.SITE_CONDITION: 5,
            RFICategory.GENERAL_QUERY: 5
        }
        return assignment_map.get(rfi.category, 5)
    
    def respond_to_rfi(
        self,
        rfi_id: int,
        response_by: int,
        response_by_name: str,
        response_data: Dict
    ) -> Dict:
        """
        الرد على RFI
        
        Args:
            rfi_id: معرّف RFI
            response_by: معرّف المجيب
            response_by_name: اسم المجيب
            response_data: بيانات الرد
        
        Returns:
            تأكيد الرد
        """
        rfi = next((r for r in self.rfis if r.rfi_id == rfi_id), None)
        
        if not rfi:
            return {"success": False, "error": "RFI not found"}
        
        if rfi.status not in [RFIStatus.SUBMITTED, RFIStatus.UNDER_REVIEW]:
            return {"success": False, "error": "RFI cannot be answered in current status"}
        
        rfi.response = response_data["response"]
        rfi.response_by = response_by
        rfi.response_by_name = response_by_name
        rfi.response_date = datetime.now()
        rfi.response_attachments = response_data.get("attachments", [])
        rfi.requires_drawing_update = response_data.get("requires_drawing_update", False)
        rfi.status = RFIStatus.ANSWERED
        
        # حساب وقت الاستجابة
        response_time = (rfi.response_date - rfi.submitted_date).days
        
        return {
            "success": True,
            "rfi_number": rfi.rfi_number,
            "status": rfi.status.value,
            "response_time_days": response_time,
            "requires_drawing_update": rfi.requires_drawing_update
        }
    
    def close_rfi(self, rfi_id: int, closed_by: int) -> Dict:
        """
        إغلاق RFI بعد تطبيق الحل
        
        Args:
            rfi_id: معرّف RFI
            closed_by: معرّف من أغلق RFI
        
        Returns:
            تأكيد الإغلاق
        """
        rfi = next((r for r in self.rfis if r.rfi_id == rfi_id), None)
        
        if not rfi:
            return {"success": False, "error": "RFI not found"}
        
        if rfi.status != RFIStatus.ANSWERED:
            return {"success": False, "error": "RFI must be answered before closing"}
        
        rfi.status = RFIStatus.CLOSED
        
        return {
            "success": True,
            "rfi_number": rfi.rfi_number,
            "status": rfi.status.value
        }
    
    def add_comment(
        self,
        rfi_id: int,
        user_id: int,
        user_name: str,
        comment: str
    ) -> Dict:
        """
        إضافة تعليق على RFI
        
        Returns:
            تأكيد إضافة التعليق
        """
        rfi_comment = RFIComment(
            comment_id=len(self.comments) + 1,
            rfi_id=rfi_id,
            user_id=user_id,
            user_name=user_name,
            comment=comment
        )
        
        self.comments.append(rfi_comment)
        
        return {
            "success": True,
            "comment_id": rfi_comment.comment_id,
            "timestamp": rfi_comment.timestamp.isoformat()
        }
    
    def get_rfi(self, rfi_id: int) -> Optional[Dict]:
        """
        الحصول على تفاصيل RFI
        
        Returns:
            تفاصيل RFI الكاملة
        """
        rfi = next((r for r in self.rfis if r.rfi_id == rfi_id), None)
        
        if not rfi:
            return None
        
        # جلب التعليقات
        rfi_comments = [c for c in self.comments if c.rfi_id == rfi_id]
        
        return {
            "rfi_id": rfi.rfi_id,
            "rfi_number": rfi.rfi_number,
            "project_id": rfi.project_id,
            "submitted_by": rfi.submitted_by_name,
            "subject": rfi.subject,
            "description": rfi.description,
            "category": rfi.category.value,
            "priority": rfi.priority.value,
            "status": rfi.status.value,
            "drawing_references": rfi.drawing_references,
            "specification_references": rfi.specification_references,
            "attachments": rfi.attachments,
            "cost_impact": rfi.cost_impact,
            "schedule_impact_days": rfi.schedule_impact_days,
            "submitted_date": rfi.submitted_date.isoformat(),
            "required_response_date": rfi.required_response_date.isoformat() if rfi.required_response_date else None,
            "assigned_to": rfi.assigned_to_name,
            "response": rfi.response,
            "response_by": rfi.response_by_name,
            "response_date": rfi.response_date.isoformat() if rfi.response_date else None,
            "response_attachments": rfi.response_attachments,
            "requires_drawing_update": rfi.requires_drawing_update,
            "affected_activities": rfi.affected_activities,
            "comments": [
                {
                    "comment_id": c.comment_id,
                    "user_name": c.user_name,
                    "comment": c.comment,
                    "timestamp": c.timestamp.isoformat()
                }
                for c in rfi_comments
            ]
        }
    
    def get_rfi_list(
        self,
        project_id: Optional[int] = None,
        status: Optional[RFIStatus] = None,
        priority: Optional[RFIPriority] = None,
        assigned_to: Optional[int] = None
    ) -> List[Dict]:
        """
        الحصول على قائمة RFIs مع فلاتر
        
        Returns:
            قائمة RFIs
        """
        filtered = self.rfis
        
        if project_id:
            filtered = [r for r in filtered if r.project_id == project_id]
        
        if status:
            filtered = [r for r in filtered if r.status == status]
        
        if priority:
            filtered = [r for r in filtered if r.priority == priority]
        
        if assigned_to:
            filtered = [r for r in filtered if r.assigned_to == assigned_to]
        
        return [
            {
                "rfi_id": r.rfi_id,
                "rfi_number": r.rfi_number,
                "subject": r.subject,
                "category": r.category.value,
                "priority": r.priority.value,
                "status": r.status.value,
                "submitted_by": r.submitted_by_name,
                "submitted_date": r.submitted_date.isoformat(),
                "assigned_to": r.assigned_to_name,
                "days_open": (datetime.now() - r.submitted_date).days
            }
            for r in filtered
        ]
    
    def get_rfi_analytics(self, project_id: int) -> Dict:
        """
        تحليلات RFI للمشروع
        
        Returns:
            إحصائيات وتحليلات RFI
        """
        project_rfis = [r for r in self.rfis if r.project_id == project_id]
        
        if not project_rfis:
            return {"error": "No RFIs found for project"}
        
        # إحصائيات حسب الحالة
        status_counts = defaultdict(int)
        for rfi in project_rfis:
            status_counts[rfi.status.value] += 1
        
        # إحصائيات حسب الفئة
        category_counts = defaultdict(int)
        for rfi in project_rfis:
            category_counts[rfi.category.value] += 1
        
        # إحصائيات حسب الأولوية
        priority_counts = defaultdict(int)
        for rfi in project_rfis:
            priority_counts[rfi.priority.value] += 1
        
        # حساب متوسط وقت الاستجابة
        answered_rfis = [r for r in project_rfis if r.response_date]
        if answered_rfis:
            response_times = [(r.response_date - r.submitted_date).days for r in answered_rfis]
            avg_response_time = sum(response_times) / len(response_times)
        else:
            avg_response_time = 0
        
        # RFIs المتأخرة
        overdue_rfis = [
            r for r in project_rfis
            if r.status in [RFIStatus.SUBMITTED, RFIStatus.UNDER_REVIEW]
            and r.required_response_date
            and datetime.now() > r.required_response_date
        ]
        
        return {
            "project_id": project_id,
            "total_rfis": len(project_rfis),
            "by_status": dict(status_counts),
            "by_category": dict(category_counts),
            "by_priority": dict(priority_counts),
            "average_response_time_days": round(avg_response_time, 1),
            "overdue_rfis_count": len(overdue_rfis),
            "overdue_rfis": [
                {
                    "rfi_number": r.rfi_number,
                    "subject": r.subject,
                    "days_overdue": (datetime.now() - r.required_response_date).days
                }
                for r in overdue_rfis
            ]
        }
    
    def get_templates(self, category: Optional[RFICategory] = None) -> List[Dict]:
        """
        الحصول على قوالب RFI
        
        Returns:
            قائمة القوالب
        """
        templates = self.templates
        
        if category:
            templates = [t for t in templates if t.category == category]
        
        return [
            {
                "template_id": t.template_id,
                "name": t.name,
                "category": t.category.value,
                "subject_template": t.subject_template,
                "description_template": t.description_template,
                "required_fields": t.required_fields
            }
            for t in templates
        ]


# ==================== Example Usage ====================

if __name__ == "__main__":
    # إنشاء مدير RFI
    rfi_manager = RFIManager()
    
    # مثال 1: إنشاء RFI جديد
    print("=== Creating New RFI ===")
    rfi_data = {
        "subject": "Conflict between architectural and structural drawings",
        "description": "There is a conflict in beam depth between drawing A-301 and S-305. Architectural shows 600mm while structural shows 800mm.",
        "category": "design_conflict",
        "priority": "high",
        "drawing_references": ["A-301", "S-305"],
        "cost_impact": 25000.00,
        "schedule_impact_days": 3
    }
    
    rfi = rfi_manager.create_rfi(
        project_id=1,
        submitted_by=3,
        submitted_by_name="Ahmed Al-Qahtani (Site Engineer)",
        rfi_data=rfi_data
    )
    print(f"RFI Created: {rfi.rfi_number}")
    print(f"Status: {rfi.status.value}")
    
    # مثال 2: تقديم RFI
    print("\n=== Submitting RFI ===")
    submit_result = rfi_manager.submit_rfi(rfi.rfi_id)
    print(f"Submitted: {submit_result['success']}")
    print(f"Assigned to: {submit_result['assigned_to']}")
    print(f"Required response by: {submit_result['required_response_date']}")
    
    # مثال 3: الرد على RFI
    print("\n=== Responding to RFI ===")
    response_data = {
        "response": "The correct beam depth is 800mm as per structural calculation. Architectural drawing will be revised to Rev. D. Please use structural dimension for execution.",
        "attachments": ["revised_detail_01.pdf"],
        "requires_drawing_update": True
    }
    
    response_result = rfi_manager.respond_to_rfi(
        rfi_id=rfi.rfi_id,
        response_by=10,
        response_by_name="Technical Office Manager",
        response_data=response_data
    )
    print(f"Response submitted: {response_result['success']}")
    print(f"Response time: {response_result['response_time_days']} days")
    print(f"Requires drawing update: {response_result['requires_drawing_update']}")
    
    # مثال 4: تحليلات RFI
    print("\n=== RFI Analytics ===")
    analytics = rfi_manager.get_rfi_analytics(project_id=1)
    print(f"Total RFIs: {analytics['total_rfis']}")
    print(f"Average response time: {analytics['average_response_time_days']} days")
    print(f"Overdue: {analytics['overdue_rfis_count']}")
