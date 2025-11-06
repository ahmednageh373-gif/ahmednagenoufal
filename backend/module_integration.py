"""
NOUFAL ERP - Module Integration System
=======================================
نظام التكامل بين الوحدات في NOUFAL ERP

This module handles the integration between all system modules:
- BOQ ↔ Procurement ↔ Accounts
- Schedule ↔ Activities ↔ Progress Tracking
- Drawings ↔ RFI ↔ Technical Office
- Subcontractors ↔ BOQ ↔ Payments
- Budget ↔ Cost Control ↔ Financial Analysis
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict


# ==================== Integration Event System ====================

class EventType(Enum):
    """أنواع الأحداث في النظام"""
    # BOQ Events
    BOQ_ITEM_CREATED = "boq_item_created"
    BOQ_ITEM_UPDATED = "boq_item_updated"
    BOQ_QUANTITY_CHANGED = "boq_quantity_changed"
    
    # Procurement Events
    PR_CREATED = "pr_created"
    PR_APPROVED = "pr_approved"
    PO_CREATED = "po_created"
    PO_CONFIRMED = "po_confirmed"
    MATERIAL_DELIVERED = "material_delivered"
    
    # Schedule Events
    ACTIVITY_STARTED = "activity_started"
    ACTIVITY_COMPLETED = "activity_completed"
    ACTIVITY_DELAYED = "activity_delayed"
    MILESTONE_REACHED = "milestone_reached"
    
    # Drawing Events
    DRAWING_SUBMITTED = "drawing_submitted"
    DRAWING_APPROVED = "drawing_approved"
    DRAWING_REVISED = "drawing_revised"
    
    # RFI Events
    RFI_SUBMITTED = "rfi_submitted"
    RFI_ANSWERED = "rfi_answered"
    RFI_CLOSED = "rfi_closed"
    
    # Payment Events
    INVOICE_CREATED = "invoice_created"
    PAYMENT_MADE = "payment_made"
    PAYMENT_RECEIVED = "payment_received"
    
    # Subcontractor Events
    CONTRACT_SIGNED = "contract_signed"
    PROGRESS_UPDATED = "progress_updated"
    CLAIM_SUBMITTED = "claim_submitted"


@dataclass
class IntegrationEvent:
    """حدث تكامل بين الوحدات"""
    event_type: EventType
    source_module: str
    timestamp: datetime
    data: Dict[str, Any]
    affected_modules: List[str] = field(default_factory=list)
    processed: bool = False


class EventBus:
    """ناقل الأحداث - يربط بين جميع الوحدات"""
    
    def __init__(self):
        self.events: List[IntegrationEvent] = []
        self.subscribers: Dict[EventType, List[callable]] = defaultdict(list)
    
    def publish(self, event: IntegrationEvent):
        """نشر حدث إلى جميع المشتركين"""
        self.events.append(event)
        
        # إرسال الحدث إلى المشتركين
        for subscriber in self.subscribers.get(event.event_type, []):
            try:
                subscriber(event)
            except Exception as e:
                print(f"Error processing event {event.event_type}: {e}")
        
        event.processed = True
    
    def subscribe(self, event_type: EventType, handler: callable):
        """الاشتراك في نوع معين من الأحداث"""
        self.subscribers[event_type].append(handler)
    
    def get_events(
        self,
        event_type: Optional[EventType] = None,
        module: Optional[str] = None,
        start_date: Optional[datetime] = None
    ) -> List[IntegrationEvent]:
        """الحصول على الأحداث حسب الفلتر"""
        filtered = self.events
        
        if event_type:
            filtered = [e for e in filtered if e.event_type == event_type]
        
        if module:
            filtered = [e for e in filtered if module in e.affected_modules or e.source_module == module]
        
        if start_date:
            filtered = [e for e in filtered if e.timestamp >= start_date]
        
        return filtered


# ==================== BOQ - Procurement Integration ====================

class BOQProcurementIntegration:
    """
    التكامل بين BOQ والمشتريات
    ===========================
    
    الوظائف:
    - إنشاء طلبات شراء تلقائياً من بنود BOQ
    - ربط المواد المطلوبة بالأنشطة
    - تتبع حالة المواد
    - تحديث تكاليف BOQ عند تأكيد أوامر الشراء
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.boq_to_pr_mapping: Dict[int, List[int]] = defaultdict(list)
        
        # الاشتراك في الأحداث
        event_bus.subscribe(EventType.BOQ_ITEM_CREATED, self.on_boq_item_created)
        event_bus.subscribe(EventType.PO_CONFIRMED, self.on_po_confirmed)
        event_bus.subscribe(EventType.MATERIAL_DELIVERED, self.on_material_delivered)
    
    def create_pr_from_boq(
        self,
        boq_item_id: int,
        boq_item_data: Dict,
        project_id: int,
        requested_by: int
    ) -> Dict:
        """
        إنشاء طلب شراء من بند BOQ
        
        Args:
            boq_item_id: معرّف بند BOQ
            boq_item_data: بيانات البند
            project_id: معرّف المشروع
            requested_by: الشخص الطالب
        
        Returns:
            بيانات طلب الشراء المُنشأ
        """
        pr_data = {
            "pr_number": f"PR-{datetime.now().year}-{len(self.boq_to_pr_mapping) + 1:04d}",
            "project_id": project_id,
            "requested_by": requested_by,
            "boq_item_id": boq_item_id,
            "items": [
                {
                    "material_name": boq_item_data["description"],
                    "quantity": boq_item_data["quantity"],
                    "unit": boq_item_data["unit"],
                    "estimated_price": boq_item_data["unit_rate"],
                    "required_date": boq_item_data.get("required_date", datetime.now() + timedelta(days=7))
                }
            ],
            "status": "draft",
            "created_at": datetime.now().isoformat()
        }
        
        # تسجيل الربط
        pr_id = len(self.boq_to_pr_mapping) + 1
        self.boq_to_pr_mapping[boq_item_id].append(pr_id)
        
        # نشر حدث
        self.event_bus.publish(IntegrationEvent(
            event_type=EventType.PR_CREATED,
            source_module="boq_procurement_integration",
            timestamp=datetime.now(),
            data={"pr_id": pr_id, "boq_item_id": boq_item_id, "pr_data": pr_data},
            affected_modules=["procurement", "boq"]
        ))
        
        return pr_data
    
    def on_boq_item_created(self, event: IntegrationEvent):
        """معالجة إنشاء بند BOQ جديد"""
        boq_data = event.data
        
        # إذا كان البند يتطلب مواد، أنشئ تنبيه لطلب الشراء
        if boq_data.get("requires_procurement", False):
            print(f"Alert: BOQ item {boq_data['item_id']} requires procurement")
    
    def on_po_confirmed(self, event: IntegrationEvent):
        """عند تأكيد أمر الشراء، تحديث تكلفة BOQ"""
        po_data = event.data
        
        # تحديث تكلفة BOQ الفعلية
        for item in po_data.get("items", []):
            boq_item_id = item.get("boq_item_id")
            if boq_item_id:
                actual_price = item["unit_price"]
                print(f"Updating BOQ item {boq_item_id} actual cost to {actual_price}")
    
    def on_material_delivered(self, event: IntegrationEvent):
        """عند استلام المواد، تحديث حالة BOQ"""
        delivery_data = event.data
        
        boq_item_id = delivery_data.get("boq_item_id")
        if boq_item_id:
            delivered_qty = delivery_data["quantity"]
            print(f"BOQ item {boq_item_id}: {delivered_qty} units delivered")
    
    def get_material_status_for_boq(self, boq_item_id: int) -> Dict:
        """
        الحصول على حالة المواد لبند BOQ معين
        
        Returns:
            - الكمية المطلوبة
            - الكمية المطلوبة (PR)
            - الكمية المطلوبة (PO)
            - الكمية المستلمة
            - الكمية المتبقية
        """
        return {
            "boq_item_id": boq_item_id,
            "required_quantity": 1000,
            "pr_quantity": 1000,
            "po_quantity": 1000,
            "delivered_quantity": 650,
            "remaining_quantity": 350,
            "status": "partial_delivery",
            "related_prs": self.boq_to_pr_mapping.get(boq_item_id, [])
        }


# ==================== Schedule - BOQ Integration ====================

class ScheduleBOQIntegration:
    """
    التكامل بين الجدول الزمني و BOQ
    =================================
    
    الوظائف:
    - ربط الأنشطة ببنود BOQ
    - تتبع استهلاك المواد حسب تقدم الأنشطة
    - تحديث الكميات المنفذة في BOQ
    - تحليل الإنتاجية
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.activity_boq_mapping: Dict[int, List[int]] = defaultdict(list)
        
        event_bus.subscribe(EventType.ACTIVITY_COMPLETED, self.on_activity_completed)
        event_bus.subscribe(EventType.ACTIVITY_STARTED, self.on_activity_started)
    
    def link_activity_to_boq(
        self,
        activity_id: int,
        boq_item_ids: List[int],
        quantities: List[float]
    ):
        """
        ربط نشاط ببنود BOQ
        
        Args:
            activity_id: معرّف النشاط
            boq_item_ids: قائمة معرّفات بنود BOQ
            quantities: الكميات المستخدمة من كل بند
        """
        for boq_id in boq_item_ids:
            self.activity_boq_mapping[activity_id].append(boq_id)
        
        print(f"Activity {activity_id} linked to BOQ items: {boq_item_ids}")
    
    def on_activity_started(self, event: IntegrationEvent):
        """عند بداية نشاط، التحقق من توفر المواد"""
        activity_data = event.data
        activity_id = activity_data["activity_id"]
        
        # الحصول على بنود BOQ المرتبطة
        boq_items = self.activity_boq_mapping.get(activity_id, [])
        
        if boq_items:
            print(f"Activity {activity_id} started - checking material availability for BOQ items: {boq_items}")
    
    def on_activity_completed(self, event: IntegrationEvent):
        """عند اكتمال نشاط، تحديث الكميات المنفذة في BOQ"""
        activity_data = event.data
        activity_id = activity_data["activity_id"]
        completed_percentage = activity_data.get("completion_percentage", 100)
        
        # تحديث BOQ
        boq_items = self.activity_boq_mapping.get(activity_id, [])
        for boq_id in boq_items:
            print(f"Updating BOQ item {boq_id} - Activity {activity_id} completed ({completed_percentage}%)")
    
    def get_boq_progress_by_schedule(self, project_id: int) -> Dict:
        """
        الحصول على تقدم BOQ بناءً على الجدول الزمني
        
        Returns:
            تقرير تقدم التنفيذ لكل بند BOQ
        """
        return {
            "project_id": project_id,
            "boq_items_progress": [
                {
                    "boq_item_id": 1,
                    "description": "Concrete Grade 30",
                    "total_quantity": 1200,
                    "completed_quantity": 780,
                    "progress_percentage": 65.0,
                    "linked_activities": [101, 102, 103],
                    "completed_activities": [101, 102],
                    "ongoing_activities": [103]
                },
                {
                    "boq_item_id": 2,
                    "description": "Steel Reinforcement",
                    "total_quantity": 85,
                    "completed_quantity": 52,
                    "progress_percentage": 61.2,
                    "linked_activities": [104, 105],
                    "completed_activities": [104],
                    "ongoing_activities": [105]
                }
            ]
        }


# ==================== Drawings - RFI Integration ====================

class DrawingRFIIntegration:
    """
    التكامل بين المخططات و RFI
    ===========================
    
    الوظائف:
    - إنشاء RFI من تعارضات المخططات
    - ربط RFI بالمخططات المعنية
    - تتبع التعديلات المطلوبة
    - تحديث المخططات بناءً على إجابات RFI
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.rfi_drawing_mapping: Dict[int, List[str]] = defaultdict(list)
        
        event_bus.subscribe(EventType.DRAWING_REVISED, self.on_drawing_revised)
        event_bus.subscribe(EventType.RFI_ANSWERED, self.on_rfi_answered)
    
    def create_rfi_from_drawing_conflict(
        self,
        drawing_numbers: List[str],
        conflict_description: str,
        project_id: int,
        submitted_by: int
    ) -> Dict:
        """
        إنشاء RFI من تعارض في المخططات
        
        Args:
            drawing_numbers: أرقام المخططات المتعارضة
            conflict_description: وصف التعارض
            project_id: معرّف المشروع
            submitted_by: مقدم الـ RFI
        
        Returns:
            بيانات RFI المُنشأ
        """
        rfi_number = f"RFI-{datetime.now().year}-{len(self.rfi_drawing_mapping) + 1:03d}"
        
        rfi_data = {
            "rfi_number": rfi_number,
            "project_id": project_id,
            "subject": f"Drawing Conflict: {', '.join(drawing_numbers)}",
            "description": conflict_description,
            "drawing_references": drawing_numbers,
            "submitted_by": submitted_by,
            "submitted_date": datetime.now().isoformat(),
            "priority": "high",
            "status": "open",
            "category": "drawing_conflict"
        }
        
        # تسجيل الربط
        rfi_id = len(self.rfi_drawing_mapping) + 1
        self.rfi_drawing_mapping[rfi_id] = drawing_numbers
        
        # نشر حدث
        self.event_bus.publish(IntegrationEvent(
            event_type=EventType.RFI_SUBMITTED,
            source_module="drawing_rfi_integration",
            timestamp=datetime.now(),
            data={"rfi_id": rfi_id, "rfi_data": rfi_data},
            affected_modules=["rfi", "drawings", "technical_office"]
        ))
        
        return rfi_data
    
    def on_drawing_revised(self, event: IntegrationEvent):
        """عند تعديل مخطط، التحقق من RFI المفتوحة"""
        drawing_data = event.data
        drawing_number = drawing_data["drawing_number"]
        
        # البحث عن RFI مفتوحة مرتبطة بهذا المخطط
        affected_rfis = [
            rfi_id for rfi_id, drawings in self.rfi_drawing_mapping.items()
            if drawing_number in drawings
        ]
        
        if affected_rfis:
            print(f"Drawing {drawing_number} revised - affects RFIs: {affected_rfis}")
    
    def on_rfi_answered(self, event: IntegrationEvent):
        """عند إجابة RFI، تنبيه بتحديث المخططات إذا لزم"""
        rfi_data = event.data
        rfi_id = rfi_data["rfi_id"]
        
        affected_drawings = self.rfi_drawing_mapping.get(rfi_id, [])
        
        if rfi_data.get("requires_drawing_update", False):
            print(f"RFI {rfi_id} answered - drawings {affected_drawings} require update")


# ==================== Subcontractor - BOQ - Payment Integration ====================

class SubcontractorIntegration:
    """
    التكامل بين مقاولي الباطن و BOQ والدفعات
    =========================================
    
    الوظائف:
    - ربط عقود المقاولين ببنود BOQ
    - حساب الدفعات بناءً على نسب الإنجاز
    - تتبع الأعمال المنفذة
    - إدارة الاستقطاعات
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.contract_boq_mapping: Dict[int, List[int]] = defaultdict(list)
        
        event_bus.subscribe(EventType.PROGRESS_UPDATED, self.on_progress_updated)
        event_bus.subscribe(EventType.CONTRACT_SIGNED, self.on_contract_signed)
    
    def link_contract_to_boq(
        self,
        contract_id: int,
        boq_item_ids: List[int],
        scope_description: str
    ):
        """
        ربط عقد مقاول باطن ببنود BOQ
        
        Args:
            contract_id: معرّف العقد
            boq_item_ids: بنود BOQ المرتبطة
            scope_description: وصف نطاق العمل
        """
        self.contract_boq_mapping[contract_id] = boq_item_ids
        print(f"Contract {contract_id} linked to BOQ items: {boq_item_ids}")
    
    def calculate_payment_due(
        self,
        contract_id: int,
        progress_percentage: float,
        contract_value: float,
        retention_percentage: float = 10.0
    ) -> Dict:
        """
        حساب المبلغ المستحق للمقاول
        
        Args:
            contract_id: معرّف العقد
            progress_percentage: نسبة الإنجاز
            contract_value: قيمة العقد
            retention_percentage: نسبة الاستقطاع
        
        Returns:
            تفاصيل الدفعة
        """
        gross_amount = contract_value * (progress_percentage / 100)
        retention = gross_amount * (retention_percentage / 100)
        net_amount = gross_amount - retention
        
        payment_data = {
            "contract_id": contract_id,
            "progress_percentage": progress_percentage,
            "contract_value": contract_value,
            "gross_amount": gross_amount,
            "retention_percentage": retention_percentage,
            "retention_amount": retention,
            "net_amount": net_amount,
            "payment_status": "calculated"
        }
        
        return payment_data
    
    def on_contract_signed(self, event: IntegrationEvent):
        """عند توقيع عقد، تحديث حالة بنود BOQ"""
        contract_data = event.data
        contract_id = contract_data["contract_id"]
        
        boq_items = self.contract_boq_mapping.get(contract_id, [])
        if boq_items:
            print(f"Contract {contract_id} signed - updating BOQ items {boq_items} status to 'subcontracted'")
    
    def on_progress_updated(self, event: IntegrationEvent):
        """عند تحديث التقدم، حساب الدفعة المستحقة"""
        progress_data = event.data
        contract_id = progress_data["contract_id"]
        progress = progress_data["progress_percentage"]
        
        print(f"Contract {contract_id} progress updated to {progress}% - calculating payment")


# ==================== Budget - Cost Control Integration ====================

class BudgetCostControlIntegration:
    """
    التكامل بين الميزانية ومراقبة التكاليف
    =====================================
    
    الوظائف:
    - تتبع الميزانية في الوقت الفعلي
    - تحليل الانحرافات
    - التنبيهات عند تجاوز الميزانية
    - توقعات التكلفة النهائية
    """
    
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.budget_tracking: Dict[int, Dict] = {}
        
        event_bus.subscribe(EventType.PO_CREATED, self.on_po_created)
        event_bus.subscribe(EventType.PAYMENT_MADE, self.on_payment_made)
    
    def track_budget(
        self,
        project_id: int,
        category: str,
        budget_amount: float,
        committed_amount: float,
        actual_amount: float
    ) -> Dict:
        """
        تتبع الميزانية لفئة معينة
        
        Returns:
            تحليل حالة الميزانية
        """
        remaining = budget_amount - actual_amount
        variance = actual_amount - budget_amount
        variance_percentage = (variance / budget_amount) * 100 if budget_amount > 0 else 0
        
        status = "within_budget"
        if variance > 0:
            if variance_percentage > 10:
                status = "critical_overrun"
            elif variance_percentage > 5:
                status = "warning_overrun"
            else:
                status = "slight_overrun"
        
        tracking_data = {
            "project_id": project_id,
            "category": category,
            "budget_amount": budget_amount,
            "committed_amount": committed_amount,
            "actual_amount": actual_amount,
            "remaining_amount": remaining,
            "variance": variance,
            "variance_percentage": variance_percentage,
            "status": status,
            "forecast_at_completion": budget_amount + variance
        }
        
        self.budget_tracking[f"{project_id}_{category}"] = tracking_data
        
        return tracking_data
    
    def on_po_created(self, event: IntegrationEvent):
        """عند إنشاء أمر شراء، تحديث الميزانية الملتزم بها"""
        po_data = event.data
        project_id = po_data["project_id"]
        amount = po_data["total_amount"]
        
        print(f"PO created for project {project_id} - committing {amount:,.2f} to budget")
    
    def on_payment_made(self, event: IntegrationEvent):
        """عند صرف دفعة، تحديث التكلفة الفعلية"""
        payment_data = event.data
        project_id = payment_data["project_id"]
        amount = payment_data["amount"]
        
        print(f"Payment made for project {project_id} - actual cost increased by {amount:,.2f}")
    
    def generate_cost_forecast(self, project_id: int) -> Dict:
        """
        توقع التكلفة النهائية للمشروع
        
        Returns:
            تحليل وتوقعات التكلفة
        """
        return {
            "project_id": project_id,
            "total_budget": 15_000_000.00,
            "earned_value": 6_600_000.00,
            "actual_cost": 6_825_000.00,
            "cost_performance_index": 0.967,
            "estimate_at_completion": 15_515_464.00,
            "variance_at_completion": -515_464.00,
            "forecast_confidence": "medium",
            "recommendations": [
                "Review steel procurement costs",
                "Optimize labor allocation",
                "Negotiate better rates with subcontractors"
            ]
        }


# ==================== Integration Manager ====================

class IntegrationManager:
    """
    مدير التكامل الرئيسي
    ====================
    ينسق بين جميع أنظمة التكامل
    """
    
    def __init__(self):
        self.event_bus = EventBus()
        
        # تهيئة جميع أنظمة التكامل
        self.boq_procurement = BOQProcurementIntegration(self.event_bus)
        self.schedule_boq = ScheduleBOQIntegration(self.event_bus)
        self.drawing_rfi = DrawingRFIIntegration(self.event_bus)
        self.subcontractor = SubcontractorIntegration(self.event_bus)
        self.budget_cost = BudgetCostControlIntegration(self.event_bus)
    
    def get_integration_status(self, project_id: int) -> Dict:
        """
        الحصول على حالة التكامل الشاملة للمشروع
        
        Returns:
            تقرير شامل عن حالة التكامل
        """
        return {
            "project_id": project_id,
            "integration_health": "good",
            "active_integrations": 5,
            "recent_events": len([e for e in self.event_bus.events if e.timestamp > datetime.now() - timedelta(days=1)]),
            "boq_procurement_status": "active",
            "schedule_tracking": "active",
            "drawing_rfi_system": "active",
            "subcontractor_management": "active",
            "budget_monitoring": "active",
            "data_synchronization": "up_to_date",
            "last_sync": datetime.now().isoformat()
        }
    
    def get_module_dependencies(self, module_name: str) -> Dict:
        """
        الحصول على تبعيات وحدة معينة
        
        Returns:
            قائمة الوحدات المرتبطة
        """
        dependencies = {
            "boq": ["procurement", "schedule", "subcontractors", "budget"],
            "procurement": ["boq", "accounts", "inventory"],
            "schedule": ["boq", "labor", "equipment"],
            "drawings": ["rfi", "technical_office", "execution_engineer"],
            "rfi": ["drawings", "technical_office", "project_manager"],
            "subcontractors": ["boq", "payments", "schedule", "quality"],
            "budget": ["boq", "procurement", "payments", "cost_control"],
            "accounts": ["procurement", "subcontractors", "payments"]
        }
        
        return {
            "module": module_name,
            "direct_dependencies": dependencies.get(module_name, []),
            "integration_points": len(dependencies.get(module_name, [])),
            "data_flow": "bidirectional"
        }


# ==================== Example Usage ====================

if __name__ == "__main__":
    # إنشاء مدير التكامل
    integration_manager = IntegrationManager()
    
    # مثال 1: إنشاء طلب شراء من BOQ
    print("=== BOQ to Procurement Integration ===")
    boq_data = {
        "item_id": 1,
        "description": "Concrete Grade 30",
        "quantity": 1200,
        "unit": "m3",
        "unit_rate": 450.00,
        "requires_procurement": True
    }
    
    pr = integration_manager.boq_procurement.create_pr_from_boq(
        boq_item_id=1,
        boq_item_data=boq_data,
        project_id=1,
        requested_by=5
    )
    print(f"Created PR: {pr['pr_number']}")
    
    # مثال 2: ربط نشاط ببنود BOQ
    print("\n=== Schedule to BOQ Integration ===")
    integration_manager.schedule_boq.link_activity_to_boq(
        activity_id=101,
        boq_item_ids=[1, 2, 3],
        quantities=[150.0, 8.5, 12.0]
    )
    
    # مثال 3: إنشاء RFI من تعارض مخططات
    print("\n=== Drawing to RFI Integration ===")
    rfi = integration_manager.drawing_rfi.create_rfi_from_drawing_conflict(
        drawing_numbers=["A-301", "S-305"],
        conflict_description="Beam depth conflict between architectural and structural drawings",
        project_id=1,
        submitted_by=3
    )
    print(f"Created RFI: {rfi['rfi_number']}")
    
    # مثال 4: حساب دفعة مقاول
    print("\n=== Subcontractor Payment Integration ===")
    payment = integration_manager.subcontractor.calculate_payment_due(
        contract_id=1,
        progress_percentage=65.0,
        contract_value=2_400_000.00,
        retention_percentage=10.0
    )
    print(f"Payment due: {payment['net_amount']:,.2f} SAR (after {payment['retention_percentage']}% retention)")
    
    # مثال 5: حالة التكامل الشاملة
    print("\n=== Integration Status ===")
    status = integration_manager.get_integration_status(project_id=1)
    print(f"Integration Health: {status['integration_health']}")
    print(f"Active Integrations: {status['active_integrations']}")
    print(f"Recent Events: {status['recent_events']}")
