"""
NOUFAL ERP - Design & Execution Engineer Module
================================================
قسم مهندس التصميم والتنفيذ

This module manages design phases and execution coordination:
- Design Phase Management
- Design Modifications Tracking
- Design vs Execution Compliance
- Integration with Technical Office
- 3D Model Viewing (BIM Integration)
- Shop Drawing Coordination
- Value Engineering
- Design Review Workflow
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict


# ==================== Design Models ====================

class DesignPhase(Enum):
    """مراحل التصميم"""
    CONCEPTUAL = "conceptual"
    SCHEMATIC = "schematic"
    DESIGN_DEVELOPMENT = "design_development"
    CONSTRUCTION_DOCUMENTS = "construction_documents"
    SHOP_DRAWINGS = "shop_drawings"
    AS_BUILT = "as_built"


class DesignStatus(Enum):
    """حالات التصميم"""
    IN_PROGRESS = "in_progress"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    APPROVED_WITH_COMMENTS = "approved_with_comments"
    REJECTED = "rejected"
    SUPERSEDED = "superseded"


class ComplianceLevel(Enum):
    """مستويات التوافق بين التصميم والتنفيذ"""
    FULL_COMPLIANCE = "full_compliance"
    MINOR_DEVIATION = "minor_deviation"
    MAJOR_DEVIATION = "major_deviation"
    NON_COMPLIANT = "non_compliant"


@dataclass
class DesignPackage:
    """حزمة تصميم"""
    package_id: int
    package_number: str
    project_id: int
    phase: DesignPhase
    discipline: str  # Architectural, Structural, MEP, Civil
    title: str
    description: str
    status: DesignStatus
    designer: int
    designer_name: str
    reviewer: Optional[int]
    reviewer_name: Optional[str]
    drawings_count: int
    specifications_count: int
    created_date: datetime
    submitted_date: Optional[datetime]
    approved_date: Optional[datetime]
    revision: str = "A"
    comments: List[str] = field(default_factory=list)


@dataclass
class DesignModification:
    """تعديل تصميمي"""
    modification_id: int
    modification_number: str
    project_id: int
    package_id: int
    title: str
    description: str
    reason: str
    initiated_by: int
    initiated_by_name: str
    affected_drawings: List[str]
    cost_impact: Optional[float]
    schedule_impact_days: Optional[int]
    status: str  # proposed, approved, rejected, implemented
    created_date: datetime
    approved_date: Optional[datetime]
    implemented_date: Optional[datetime]


@dataclass
class ComplianceCheck:
    """فحص التوافق بين التصميم والتنفيذ"""
    check_id: int
    project_id: int
    location: str
    drawing_reference: str
    design_requirement: str
    execution_status: str
    compliance_level: ComplianceLevel
    deviations: List[Dict]
    inspector: int
    inspector_name: str
    inspection_date: datetime
    photos: List[str] = field(default_factory=list)
    corrective_actions: List[str] = field(default_factory=list)


@dataclass
class ValueEngineeringProposal:
    """مقترح هندسة القيمة"""
    proposal_id: int
    project_id: int
    title: str
    description: str
    current_design: str
    proposed_design: str
    cost_savings: float
    time_savings_days: int
    quality_impact: str  # positive, neutral, negative
    risk_assessment: str
    submitted_by: int
    submitted_by_name: str
    status: str  # pending, under_review, approved, rejected, implemented
    submitted_date: datetime


# ==================== Design & Execution Manager ====================

class DesignExecutionManager:
    """
    مدير التصميم والتنفيذ
    ====================
    
    يدير دورة حياة التصميم والتنسيق مع التنفيذ
    """
    
    def __init__(self):
        self.design_packages: List[DesignPackage] = []
        self.design_modifications: List[DesignModification] = []
        self.compliance_checks: List[ComplianceCheck] = []
        self.ve_proposals: List[ValueEngineeringProposal] = []
    
    # ==================== Design Package Management ====================
    
    def create_design_package(
        self,
        project_id: int,
        package_data: Dict
    ) -> DesignPackage:
        """
        إنشاء حزمة تصميم جديدة
        
        Args:
            project_id: معرّف المشروع
            package_data: بيانات الحزمة
        
        Returns:
            حزمة التصميم المُنشأة
        """
        package_number = self._generate_package_number(
            project_id,
            package_data.get("discipline", "GEN")
        )
        
        package = DesignPackage(
            package_id=len(self.design_packages) + 1,
            package_number=package_number,
            project_id=project_id,
            phase=DesignPhase(package_data.get("phase", "schematic")),
            discipline=package_data["discipline"],
            title=package_data["title"],
            description=package_data.get("description", ""),
            status=DesignStatus.IN_PROGRESS,
            designer=package_data["designer"],
            designer_name=package_data["designer_name"],
            reviewer=package_data.get("reviewer"),
            reviewer_name=package_data.get("reviewer_name"),
            drawings_count=package_data.get("drawings_count", 0),
            specifications_count=package_data.get("specifications_count", 0),
            created_date=datetime.now()
        )
        
        self.design_packages.append(package)
        return package
    
    def _generate_package_number(self, project_id: int, discipline: str) -> str:
        """توليد رقم حزمة فريد"""
        year = datetime.now().year
        discipline_code = discipline[:3].upper()
        project_packages = [
            p for p in self.design_packages
            if p.project_id == project_id and p.discipline == discipline
        ]
        sequence = len(project_packages) + 1
        return f"DP-P{project_id:03d}-{discipline_code}-{year}-{sequence:03d}"
    
    def submit_for_review(self, package_id: int) -> Dict:
        """
        تقديم حزمة للمراجعة
        
        Args:
            package_id: معرّف الحزمة
        
        Returns:
            تأكيد التقديم
        """
        package = next((p for p in self.design_packages if p.package_id == package_id), None)
        
        if not package:
            return {"success": False, "error": "Package not found"}
        
        if package.status != DesignStatus.IN_PROGRESS:
            return {"success": False, "error": "Package is not in progress"}
        
        package.status = DesignStatus.UNDER_REVIEW
        package.submitted_date = datetime.now()
        
        return {
            "success": True,
            "package_number": package.package_number,
            "status": package.status.value,
            "submitted_date": package.submitted_date.isoformat()
        }
    
    def review_design_package(
        self,
        package_id: int,
        reviewer_id: int,
        review_data: Dict
    ) -> Dict:
        """
        مراجعة حزمة تصميم
        
        Args:
            package_id: معرّف الحزمة
            reviewer_id: معرّف المراجع
            review_data: بيانات المراجعة
        
        Returns:
            نتيجة المراجعة
        """
        package = next((p for p in self.design_packages if p.package_id == package_id), None)
        
        if not package:
            return {"success": False, "error": "Package not found"}
        
        status = DesignStatus(review_data["status"])
        package.status = status
        package.comments = review_data.get("comments", [])
        
        if status in [DesignStatus.APPROVED, DesignStatus.APPROVED_WITH_COMMENTS]:
            package.approved_date = datetime.now()
        
        return {
            "success": True,
            "package_number": package.package_number,
            "status": package.status.value,
            "comments_count": len(package.comments)
        }
    
    # ==================== Design Modifications ====================
    
    def initiate_design_modification(
        self,
        project_id: int,
        modification_data: Dict
    ) -> DesignModification:
        """
        بدء تعديل تصميمي
        
        Args:
            project_id: معرّف المشروع
            modification_data: بيانات التعديل
        
        Returns:
            التعديل التصميمي
        """
        modification_number = self._generate_modification_number(project_id)
        
        modification = DesignModification(
            modification_id=len(self.design_modifications) + 1,
            modification_number=modification_number,
            project_id=project_id,
            package_id=modification_data["package_id"],
            title=modification_data["title"],
            description=modification_data["description"],
            reason=modification_data["reason"],
            initiated_by=modification_data["initiated_by"],
            initiated_by_name=modification_data["initiated_by_name"],
            affected_drawings=modification_data.get("affected_drawings", []),
            cost_impact=modification_data.get("cost_impact"),
            schedule_impact_days=modification_data.get("schedule_impact_days"),
            status="proposed",
            created_date=datetime.now()
        )
        
        self.design_modifications.append(modification)
        return modification
    
    def _generate_modification_number(self, project_id: int) -> str:
        """توليد رقم تعديل فريد"""
        year = datetime.now().year
        project_mods = [m for m in self.design_modifications if m.project_id == project_id]
        sequence = len(project_mods) + 1
        return f"DM-P{project_id:03d}-{year}-{sequence:04d}"
    
    def approve_modification(self, modification_id: int, approver_id: int) -> Dict:
        """
        الموافقة على تعديل تصميمي
        
        Args:
            modification_id: معرّف التعديل
            approver_id: معرّف الموافق
        
        Returns:
            تأكيد الموافقة
        """
        modification = next(
            (m for m in self.design_modifications if m.modification_id == modification_id),
            None
        )
        
        if not modification:
            return {"success": False, "error": "Modification not found"}
        
        modification.status = "approved"
        modification.approved_date = datetime.now()
        
        return {
            "success": True,
            "modification_number": modification.modification_number,
            "status": modification.status,
            "cost_impact": modification.cost_impact,
            "schedule_impact_days": modification.schedule_impact_days
        }
    
    def mark_modification_implemented(self, modification_id: int) -> Dict:
        """
        تعليم التعديل كمُطبّق
        
        Args:
            modification_id: معرّف التعديل
        
        Returns:
            تأكيد التطبيق
        """
        modification = next(
            (m for m in self.design_modifications if m.modification_id == modification_id),
            None
        )
        
        if not modification:
            return {"success": False, "error": "Modification not found"}
        
        if modification.status != "approved":
            return {"success": False, "error": "Modification must be approved first"}
        
        modification.status = "implemented"
        modification.implemented_date = datetime.now()
        
        return {
            "success": True,
            "modification_number": modification.modification_number,
            "status": modification.status,
            "implemented_date": modification.implemented_date.isoformat()
        }
    
    # ==================== Compliance Checking ====================
    
    def perform_compliance_check(
        self,
        project_id: int,
        check_data: Dict
    ) -> ComplianceCheck:
        """
        إجراء فحص توافق بين التصميم والتنفيذ
        
        Args:
            project_id: معرّف المشروع
            check_data: بيانات الفحص
        
        Returns:
            نتيجة الفحص
        """
        check = ComplianceCheck(
            check_id=len(self.compliance_checks) + 1,
            project_id=project_id,
            location=check_data["location"],
            drawing_reference=check_data["drawing_reference"],
            design_requirement=check_data["design_requirement"],
            execution_status=check_data["execution_status"],
            compliance_level=ComplianceLevel(check_data.get("compliance_level", "full_compliance")),
            deviations=check_data.get("deviations", []),
            inspector=check_data["inspector"],
            inspector_name=check_data["inspector_name"],
            inspection_date=datetime.now(),
            photos=check_data.get("photos", []),
            corrective_actions=check_data.get("corrective_actions", [])
        )
        
        self.compliance_checks.append(check)
        return check
    
    def get_compliance_report(self, project_id: int) -> Dict:
        """
        الحصول على تقرير التوافق للمشروع
        
        Returns:
            تقرير توافق شامل
        """
        project_checks = [c for c in self.compliance_checks if c.project_id == project_id]
        
        if not project_checks:
            return {"error": "No compliance checks found"}
        
        # إحصائيات حسب مستوى التوافق
        compliance_counts = defaultdict(int)
        for check in project_checks:
            compliance_counts[check.compliance_level.value] += 1
        
        # الانحرافات الرئيسية
        major_deviations = [
            c for c in project_checks
            if c.compliance_level in [ComplianceLevel.MAJOR_DEVIATION, ComplianceLevel.NON_COMPLIANT]
        ]
        
        # نسبة التوافق الإجمالية
        compliant_count = len([c for c in project_checks if c.compliance_level == ComplianceLevel.FULL_COMPLIANCE])
        compliance_rate = (compliant_count / len(project_checks) * 100) if project_checks else 0
        
        return {
            "project_id": project_id,
            "total_checks": len(project_checks),
            "compliance_rate": round(compliance_rate, 2),
            "by_compliance_level": dict(compliance_counts),
            "major_deviations_count": len(major_deviations),
            "major_deviations": [
                {
                    "check_id": c.check_id,
                    "location": c.location,
                    "drawing_reference": c.drawing_reference,
                    "compliance_level": c.compliance_level.value,
                    "deviations_count": len(c.deviations),
                    "inspection_date": c.inspection_date.isoformat()
                }
                for c in major_deviations
            ]
        }
    
    # ==================== Value Engineering ====================
    
    def submit_ve_proposal(
        self,
        project_id: int,
        proposal_data: Dict
    ) -> ValueEngineeringProposal:
        """
        تقديم مقترح هندسة قيمة
        
        Args:
            project_id: معرّف المشروع
            proposal_data: بيانات المقترح
        
        Returns:
            مقترح هندسة القيمة
        """
        proposal = ValueEngineeringProposal(
            proposal_id=len(self.ve_proposals) + 1,
            project_id=project_id,
            title=proposal_data["title"],
            description=proposal_data["description"],
            current_design=proposal_data["current_design"],
            proposed_design=proposal_data["proposed_design"],
            cost_savings=proposal_data["cost_savings"],
            time_savings_days=proposal_data["time_savings_days"],
            quality_impact=proposal_data["quality_impact"],
            risk_assessment=proposal_data["risk_assessment"],
            submitted_by=proposal_data["submitted_by"],
            submitted_by_name=proposal_data["submitted_by_name"],
            status="pending",
            submitted_date=datetime.now()
        )
        
        self.ve_proposals.append(proposal)
        return proposal
    
    def get_ve_summary(self, project_id: int) -> Dict:
        """
        ملخص مقترحات هندسة القيمة
        
        Returns:
            ملخص VE
        """
        project_proposals = [p for p in self.ve_proposals if p.project_id == project_id]
        
        if not project_proposals:
            return {"error": "No VE proposals found"}
        
        # إحصائيات حسب الحالة
        status_counts = defaultdict(int)
        for proposal in project_proposals:
            status_counts[proposal.status] += 1
        
        # المدخرات المحتملة
        approved_proposals = [p for p in project_proposals if p.status == "approved"]
        implemented_proposals = [p for p in project_proposals if p.status == "implemented"]
        
        total_potential_savings = sum(p.cost_savings for p in approved_proposals)
        total_realized_savings = sum(p.cost_savings for p in implemented_proposals)
        total_time_savings = sum(p.time_savings_days for p in implemented_proposals)
        
        return {
            "project_id": project_id,
            "total_proposals": len(project_proposals),
            "by_status": dict(status_counts),
            "potential_cost_savings": total_potential_savings,
            "realized_cost_savings": total_realized_savings,
            "time_savings_days": total_time_savings,
            "top_proposals": [
                {
                    "proposal_id": p.proposal_id,
                    "title": p.title,
                    "cost_savings": p.cost_savings,
                    "time_savings_days": p.time_savings_days,
                    "status": p.status
                }
                for p in sorted(project_proposals, key=lambda x: x.cost_savings, reverse=True)[:5]
            ]
        }
    
    # ==================== Design Phase Dashboard ====================
    
    def get_design_dashboard(self, project_id: int) -> Dict:
        """
        لوحة تحكم التصميم للمشروع
        
        Returns:
            لوحة تحكم شاملة
        """
        project_packages = [p for p in self.design_packages if p.project_id == project_id]
        project_modifications = [m for m in self.design_modifications if m.project_id == project_id]
        
        # إحصائيات الحزم
        status_counts = defaultdict(int)
        for package in project_packages:
            status_counts[package.status.value] += 1
        
        # إحصائيات التعديلات
        mod_status_counts = defaultdict(int)
        for mod in project_modifications:
            mod_status_counts[mod.status] += 1
        
        return {
            "project_id": project_id,
            "design_packages": {
                "total": len(project_packages),
                "by_status": dict(status_counts),
                "by_phase": self._count_by_phase(project_packages),
                "by_discipline": self._count_by_discipline(project_packages)
            },
            "design_modifications": {
                "total": len(project_modifications),
                "by_status": dict(mod_status_counts),
                "total_cost_impact": sum(m.cost_impact or 0 for m in project_modifications),
                "total_schedule_impact": sum(m.schedule_impact_days or 0 for m in project_modifications)
            },
            "compliance": self.get_compliance_report(project_id) if self.compliance_checks else {},
            "value_engineering": self.get_ve_summary(project_id) if self.ve_proposals else {}
        }
    
    def _count_by_phase(self, packages: List[DesignPackage]) -> Dict[str, int]:
        """عد الحزم حسب المرحلة"""
        counts = defaultdict(int)
        for package in packages:
            counts[package.phase.value] += 1
        return dict(counts)
    
    def _count_by_discipline(self, packages: List[DesignPackage]) -> Dict[str, int]:
        """عد الحزم حسب التخصص"""
        counts = defaultdict(int)
        for package in packages:
            counts[package.discipline] += 1
        return dict(counts)


# ==================== Example Usage ====================

if __name__ == "__main__":
    # إنشاء مدير التصميم والتنفيذ
    de_manager = DesignExecutionManager()
    
    # مثال 1: إنشاء حزمة تصميم
    print("=== Creating Design Package ===")
    package_data = {
        "discipline": "Structural",
        "phase": "construction_documents",
        "title": "Foundation & Basement Design",
        "description": "Complete structural design for foundation and basement levels",
        "designer": 15,
        "designer_name": "Eng. Mohammed Al-Harbi",
        "reviewer": 16,
        "reviewer_name": "Senior Structural Engineer",
        "drawings_count": 25,
        "specifications_count": 8
    }
    
    package = de_manager.create_design_package(project_id=1, package_data=package_data)
    print(f"Package created: {package.package_number}")
    print(f"Phase: {package.phase.value}")
    print(f"Status: {package.status.value}")
    
    # مثال 2: تعديل تصميمي
    print("\n=== Design Modification ===")
    mod_data = {
        "package_id": package.package_id,
        "title": "Increase column size at Grid A1",
        "description": "Increase column from 600x600 to 700x700 due to additional load",
        "reason": "Additional HVAC equipment on roof",
        "initiated_by": 5,
        "initiated_by_name": "Project Manager",
        "affected_drawings": ["S-101", "S-102", "S-103"],
        "cost_impact": 15000.00,
        "schedule_impact_days": 2
    }
    
    modification = de_manager.initiate_design_modification(project_id=1, modification_data=mod_data)
    print(f"Modification created: {modification.modification_number}")
    print(f"Cost impact: {modification.cost_impact:,.2f} SAR")
    print(f"Schedule impact: {modification.schedule_impact_days} days")
    
    # مثال 3: فحص التوافق
    print("\n=== Compliance Check ===")
    check_data = {
        "location": "Grid A-D / Level 1",
        "drawing_reference": "S-201",
        "design_requirement": "Column reinforcement: 12Ø25mm",
        "execution_status": "Installed as per design",
        "compliance_level": "full_compliance",
        "inspector": 3,
        "inspector_name": "Site Engineer",
        "photos": ["photo_001.jpg", "photo_002.jpg"]
    }
    
    check = de_manager.perform_compliance_check(project_id=1, check_data=check_data)
    print(f"Compliance check completed: Check #{check.check_id}")
    print(f"Compliance level: {check.compliance_level.value}")
    
    # مثال 4: مقترح VE
    print("\n=== Value Engineering Proposal ===")
    ve_data = {
        "title": "Alternative foundation system",
        "description": "Use raft foundation instead of pile foundation",
        "current_design": "Pile foundation with 150 piles",
        "proposed_design": "Raft foundation 1.5m thick",
        "cost_savings": 450000.00,
        "time_savings_days": 15,
        "quality_impact": "neutral",
        "risk_assessment": "Low risk - soil investigation confirms suitability",
        "submitted_by": 15,
        "submitted_by_name": "Structural Engineer"
    }
    
    ve_proposal = de_manager.submit_ve_proposal(project_id=1, proposal_data=ve_data)
    print(f"VE Proposal submitted: #{ve_proposal.proposal_id}")
    print(f"Potential savings: {ve_proposal.cost_savings:,.2f} SAR")
    print(f"Time savings: {ve_proposal.time_savings_days} days")
