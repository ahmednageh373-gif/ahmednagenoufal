"""
NOUFAL ERP - Procurement Management Module
قسم المشتريات - نظام إدارة المشتريات والتوريدات

Features:
- Purchase Request (PR) Management
- Purchase Order (PO) Management
- Supplier Management
- Delivery Tracking
- Material Status Tracking
- Integration with Accounts & BOQ
"""

from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class PRStatus(Enum):
    """Purchase Request Status - حالة طلب الشراء"""
    DRAFT = "draft"                    # مسودة
    SUBMITTED = "submitted"            # تم التقديم
    APPROVED = "approved"              # معتمد
    REJECTED = "rejected"              # مرفوض
    CONVERTED_TO_PO = "converted_to_po"  # تم تحويله لأمر شراء


class POStatus(Enum):
    """Purchase Order Status - حالة أمر الشراء"""
    DRAFT = "draft"                    # مسودة
    SENT_TO_SUPPLIER = "sent"          # تم الإرسال للمورد
    CONFIRMED = "confirmed"            # مؤكد من المورد
    PARTIAL_DELIVERY = "partial"       # تم التوريد الجزئي
    FULLY_DELIVERED = "delivered"      # تم التوريد الكامل
    CANCELLED = "cancelled"            # ملغي


class MaterialStatus(Enum):
    """Material Status - حالة المواد"""
    REQUESTED = "requested"            # تم الطلب
    ORDERED = "ordered"                # قيد الشراء
    IN_TRANSIT = "in_transit"          # قيد التوريد
    DELIVERED = "delivered"            # تم الاستلام
    INSTALLED = "installed"            # تم التركيب


@dataclass
class Material:
    """Material item - صنف مادة"""
    id: int
    code: str
    name_ar: str
    name_en: str
    unit: str                          # m³, ton, piece, etc.
    category: str
    specification: str
    unit_price: float = 0.0
    supplier_id: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class PurchaseRequestItem:
    """Purchase Request Item - بند في طلب الشراء"""
    material_id: int
    material_name: str
    quantity: float
    unit: str
    required_date: datetime
    project_id: int
    boq_item_id: Optional[int] = None  # Link to BOQ
    specification: str = ""
    notes: str = ""
    estimated_price: float = 0.0
    status: MaterialStatus = MaterialStatus.REQUESTED


@dataclass
class PurchaseRequest:
    """Purchase Request - طلب شراء"""
    id: int
    pr_number: str                     # PR-2025-001
    project_id: int
    project_name: str
    requested_by_id: int
    requested_by_name: str
    department: str
    request_date: datetime
    required_date: datetime
    items: List[PurchaseRequestItem]
    status: PRStatus = PRStatus.DRAFT
    total_estimated_cost: float = 0.0
    justification: str = ""
    approved_by_id: Optional[int] = None
    approved_date: Optional[datetime] = None
    rejection_reason: str = ""
    notes: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class Supplier:
    """Supplier - مورد"""
    id: int
    code: str                          # SUP-001
    name_ar: str
    name_en: str
    category: str                      # Steel, Cement, Equipment, etc.
    contact_person: str
    phone: str
    email: str
    address: str
    tax_number: str
    payment_terms: str                 # Net 30, Net 60, etc.
    credit_limit: float = 0.0
    current_balance: float = 0.0
    rating: float = 0.0                # 0-5 stars
    is_active: bool = True
    notes: str = ""
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class PurchaseOrderItem:
    """Purchase Order Item - بند في أمر الشراء"""
    material_id: int
    material_name: str
    quantity: float
    unit: str
    unit_price: float
    total_price: float
    specification: str = ""
    delivery_date: Optional[datetime] = None
    delivered_quantity: float = 0.0
    remaining_quantity: float = 0.0
    notes: str = ""


@dataclass
class PurchaseOrder:
    """Purchase Order - أمر شراء"""
    id: int
    po_number: str                     # PO-2025-001
    pr_id: Optional[int] = None        # Link to Purchase Request
    project_id: int
    project_name: str
    supplier_id: int
    supplier_name: str
    order_date: datetime = field(default_factory=datetime.now)
    delivery_date: datetime = field(default_factory=lambda: datetime.now() + timedelta(days=30))
    items: List[PurchaseOrderItem] = field(default_factory=list)
    subtotal: float = 0.0
    tax_rate: float = 15.0             # VAT %
    tax_amount: float = 0.0
    total_amount: float = 0.0
    payment_terms: str = "Net 30"
    delivery_location: str = ""
    status: POStatus = POStatus.DRAFT
    sent_date: Optional[datetime] = None
    confirmed_date: Optional[datetime] = None
    created_by_id: int = 0
    approved_by_id: Optional[int] = None
    notes: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class DeliveryNote:
    """Delivery Note - إذن استلام"""
    id: int
    dn_number: str                     # DN-2025-001
    po_id: int
    po_number: str
    supplier_id: int
    supplier_name: str
    project_id: int
    delivery_date: datetime
    received_by_id: int
    received_by_name: str
    items: List[Dict]                  # List of delivered items
    total_delivered_items: int = 0
    delivery_location: str = ""
    vehicle_number: str = ""
    driver_name: str = ""
    notes: str = ""
    photos: List[str] = field(default_factory=list)  # Photo URLs
    is_complete: bool = False
    created_at: datetime = field(default_factory=datetime.now)


class ProcurementManager:
    """
    Procurement Management System
    نظام إدارة المشتريات
    """
    
    def __init__(self):
        self.purchase_requests: List[PurchaseRequest] = []
        self.purchase_orders: List[PurchaseOrder] = []
        self.suppliers: List[Supplier] = []
        self.delivery_notes: List[DeliveryNote] = []
        self.materials: List[Material] = []
        logger.info("ProcurementManager initialized")
    
    # ========== Purchase Request Management ==========
    
    def create_purchase_request(
        self,
        project_id: int,
        requested_by_id: int,
        items: List[PurchaseRequestItem],
        required_date: datetime,
        justification: str = ""
    ) -> PurchaseRequest:
        """
        Create new purchase request
        إنشاء طلب شراء جديد
        """
        pr_number = self._generate_pr_number()
        
        pr = PurchaseRequest(
            id=len(self.purchase_requests) + 1,
            pr_number=pr_number,
            project_id=project_id,
            project_name=f"Project {project_id}",  # Get from DB
            requested_by_id=requested_by_id,
            requested_by_name=f"User {requested_by_id}",  # Get from DB
            department="Engineering",
            request_date=datetime.now(),
            required_date=required_date,
            items=items,
            justification=justification,
            total_estimated_cost=sum(item.estimated_price * item.quantity for item in items)
        )
        
        self.purchase_requests.append(pr)
        logger.info(f"Created Purchase Request: {pr_number}")
        
        return pr
    
    def approve_purchase_request(self, pr_id: int, approved_by_id: int) -> bool:
        """
        Approve purchase request
        اعتماد طلب الشراء
        """
        pr = self._get_pr_by_id(pr_id)
        
        if not pr:
            return False
        
        if pr.status != PRStatus.SUBMITTED:
            logger.warning(f"PR {pr.pr_number} is not in submitted status")
            return False
        
        pr.status = PRStatus.APPROVED
        pr.approved_by_id = approved_by_id
        pr.approved_date = datetime.now()
        pr.updated_at = datetime.now()
        
        logger.info(f"Approved Purchase Request: {pr.pr_number}")
        return True
    
    def reject_purchase_request(self, pr_id: int, reason: str) -> bool:
        """Reject purchase request"""
        pr = self._get_pr_by_id(pr_id)
        
        if not pr:
            return False
        
        pr.status = PRStatus.REJECTED
        pr.rejection_reason = reason
        pr.updated_at = datetime.now()
        
        logger.info(f"Rejected Purchase Request: {pr.pr_number}")
        return True
    
    # ========== Purchase Order Management ==========
    
    def create_purchase_order(
        self,
        pr_id: Optional[int],
        project_id: int,
        supplier_id: int,
        items: List[PurchaseOrderItem],
        delivery_date: datetime,
        payment_terms: str = "Net 30"
    ) -> PurchaseOrder:
        """
        Create new purchase order
        إنشاء أمر شراء جديد
        """
        po_number = self._generate_po_number()
        
        # Calculate totals
        subtotal = sum(item.total_price for item in items)
        tax_amount = subtotal * 0.15  # 15% VAT
        total_amount = subtotal + tax_amount
        
        # Update remaining quantity for each item
        for item in items:
            item.remaining_quantity = item.quantity
        
        po = PurchaseOrder(
            id=len(self.purchase_orders) + 1,
            po_number=po_number,
            pr_id=pr_id,
            project_id=project_id,
            project_name=f"Project {project_id}",
            supplier_id=supplier_id,
            supplier_name=self._get_supplier_name(supplier_id),
            items=items,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            delivery_date=delivery_date,
            payment_terms=payment_terms
        )
        
        self.purchase_orders.append(po)
        
        # Update PR status if linked
        if pr_id:
            pr = self._get_pr_by_id(pr_id)
            if pr:
                pr.status = PRStatus.CONVERTED_TO_PO
                pr.updated_at = datetime.now()
        
        logger.info(f"Created Purchase Order: {po_number}")
        return po
    
    def send_purchase_order(self, po_id: int) -> bool:
        """
        Send purchase order to supplier
        إرسال أمر الشراء للمورد
        """
        po = self._get_po_by_id(po_id)
        
        if not po:
            return False
        
        po.status = POStatus.SENT_TO_SUPPLIER
        po.sent_date = datetime.now()
        po.updated_at = datetime.now()
        
        logger.info(f"Sent Purchase Order to supplier: {po.po_number}")
        return True
    
    def confirm_purchase_order(self, po_id: int) -> bool:
        """
        Confirm purchase order (supplier accepted)
        تأكيد أمر الشراء
        """
        po = self._get_po_by_id(po_id)
        
        if not po:
            return False
        
        po.status = POStatus.CONFIRMED
        po.confirmed_date = datetime.now()
        po.updated_at = datetime.now()
        
        logger.info(f"Confirmed Purchase Order: {po.po_number}")
        return True
    
    # ========== Delivery Management ==========
    
    def record_delivery(
        self,
        po_id: int,
        delivered_items: List[Dict],
        received_by_id: int,
        delivery_date: datetime,
        vehicle_number: str = "",
        notes: str = ""
    ) -> DeliveryNote:
        """
        Record material delivery
        تسجيل استلام المواد
        """
        po = self._get_po_by_id(po_id)
        
        if not po:
            raise ValueError(f"Purchase Order {po_id} not found")
        
        dn_number = self._generate_dn_number()
        
        # Update PO items with delivered quantities
        for delivered_item in delivered_items:
            material_id = delivered_item['material_id']
            delivered_qty = delivered_item['quantity']
            
            # Find corresponding PO item
            for po_item in po.items:
                if po_item.material_id == material_id:
                    po_item.delivered_quantity += delivered_qty
                    po_item.remaining_quantity = po_item.quantity - po_item.delivered_quantity
        
        # Update PO status
        all_delivered = all(item.remaining_quantity <= 0 for item in po.items)
        any_delivered = any(item.delivered_quantity > 0 for item in po.items)
        
        if all_delivered:
            po.status = POStatus.FULLY_DELIVERED
        elif any_delivered:
            po.status = POStatus.PARTIAL_DELIVERY
        
        po.updated_at = datetime.now()
        
        # Create delivery note
        dn = DeliveryNote(
            id=len(self.delivery_notes) + 1,
            dn_number=dn_number,
            po_id=po_id,
            po_number=po.po_number,
            supplier_id=po.supplier_id,
            supplier_name=po.supplier_name,
            project_id=po.project_id,
            delivery_date=delivery_date,
            received_by_id=received_by_id,
            received_by_name=f"User {received_by_id}",
            items=delivered_items,
            total_delivered_items=len(delivered_items),
            vehicle_number=vehicle_number,
            notes=notes,
            is_complete=all_delivered
        )
        
        self.delivery_notes.append(dn)
        
        logger.info(f"Recorded Delivery: {dn_number} for PO: {po.po_number}")
        return dn
    
    # ========== Supplier Management ==========
    
    def add_supplier(self, supplier: Supplier) -> Supplier:
        """Add new supplier"""
        self.suppliers.append(supplier)
        logger.info(f"Added supplier: {supplier.name_en}")
        return supplier
    
    def update_supplier_rating(self, supplier_id: int, rating: float) -> bool:
        """Update supplier performance rating"""
        supplier = self._get_supplier_by_id(supplier_id)
        
        if not supplier:
            return False
        
        supplier.rating = min(5.0, max(0.0, rating))
        logger.info(f"Updated supplier {supplier.name_en} rating to {rating}")
        return True
    
    def update_supplier_balance(self, supplier_id: int, amount: float, operation: str = "add") -> bool:
        """
        Update supplier balance
        تحديث رصيد المورد
        """
        supplier = self._get_supplier_by_id(supplier_id)
        
        if not supplier:
            return False
        
        if operation == "add":
            supplier.current_balance += amount
        elif operation == "subtract":
            supplier.current_balance -= amount
        else:
            return False
        
        logger.info(f"Updated supplier {supplier.name_en} balance: {supplier.current_balance}")
        return True
    
    # ========== Reporting & Analytics ==========
    
    def get_material_status_report(self, project_id: Optional[int] = None) -> Dict:
        """
        Get material status report
        تقرير حالة المواد
        """
        report = {
            MaterialStatus.REQUESTED: [],
            MaterialStatus.ORDERED: [],
            MaterialStatus.IN_TRANSIT: [],
            MaterialStatus.DELIVERED: [],
        }
        
        # Collect all PRs
        for pr in self.purchase_requests:
            if project_id and pr.project_id != project_id:
                continue
            
            for item in pr.items:
                report[item.status].append({
                    "pr_number": pr.pr_number,
                    "material": item.material_name,
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "required_date": item.required_date.isoformat(),
                    "status": item.status.value
                })
        
        return {
            "project_id": project_id,
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "requested": len(report[MaterialStatus.REQUESTED]),
                "ordered": len(report[MaterialStatus.ORDERED]),
                "in_transit": len(report[MaterialStatus.IN_TRANSIT]),
                "delivered": len(report[MaterialStatus.DELIVERED]),
            },
            "details": {
                status.value: items for status, items in report.items()
            }
        }
    
    def get_supplier_performance_report(self) -> List[Dict]:
        """
        Get supplier performance report
        تقرير أداء الموردين
        """
        report = []
        
        for supplier in self.suppliers:
            # Count POs
            supplier_pos = [po for po in self.purchase_orders if po.supplier_id == supplier.id]
            
            # Count deliveries
            supplier_deliveries = [dn for dn in self.delivery_notes if dn.supplier_id == supplier.id]
            
            # Calculate on-time delivery rate
            on_time = sum(1 for dn in supplier_deliveries if dn.delivery_date <= dn.delivery_date)  # TODO: Compare with PO date
            on_time_rate = (on_time / len(supplier_deliveries) * 100) if supplier_deliveries else 0
            
            report.append({
                "supplier_id": supplier.id,
                "supplier_name": supplier.name_en,
                "category": supplier.category,
                "rating": supplier.rating,
                "total_orders": len(supplier_pos),
                "total_deliveries": len(supplier_deliveries),
                "on_time_delivery_rate": round(on_time_rate, 2),
                "current_balance": supplier.current_balance,
                "is_active": supplier.is_active
            })
        
        return sorted(report, key=lambda x: x['rating'], reverse=True)
    
    def get_pending_deliveries(self, project_id: Optional[int] = None) -> List[Dict]:
        """
        Get list of pending deliveries
        قائمة التوريدات المعلقة
        """
        pending = []
        
        for po in self.purchase_orders:
            if po.status in [POStatus.CONFIRMED, POStatus.PARTIAL_DELIVERY]:
                if project_id and po.project_id != project_id:
                    continue
                
                for item in po.items:
                    if item.remaining_quantity > 0:
                        pending.append({
                            "po_number": po.po_number,
                            "supplier": po.supplier_name,
                            "material": item.material_name,
                            "ordered_quantity": item.quantity,
                            "delivered_quantity": item.delivered_quantity,
                            "remaining_quantity": item.remaining_quantity,
                            "unit": item.unit,
                            "expected_delivery_date": po.delivery_date.isoformat(),
                            "days_until_delivery": (po.delivery_date - datetime.now()).days
                        })
        
        return sorted(pending, key=lambda x: x['days_until_delivery'])
    
    # ========== Helper Methods ==========
    
    def _generate_pr_number(self) -> str:
        """Generate unique PR number"""
        year = datetime.now().year
        count = len(self.purchase_requests) + 1
        return f"PR-{year}-{count:04d}"
    
    def _generate_po_number(self) -> str:
        """Generate unique PO number"""
        year = datetime.now().year
        count = len(self.purchase_orders) + 1
        return f"PO-{year}-{count:04d}"
    
    def _generate_dn_number(self) -> str:
        """Generate unique DN number"""
        year = datetime.now().year
        count = len(self.delivery_notes) + 1
        return f"DN-{year}-{count:04d}"
    
    def _get_pr_by_id(self, pr_id: int) -> Optional[PurchaseRequest]:
        """Get purchase request by ID"""
        return next((pr for pr in self.purchase_requests if pr.id == pr_id), None)
    
    def _get_po_by_id(self, po_id: int) -> Optional[PurchaseOrder]:
        """Get purchase order by ID"""
        return next((po for po in self.purchase_orders if po.id == po_id), None)
    
    def _get_supplier_by_id(self, supplier_id: int) -> Optional[Supplier]:
        """Get supplier by ID"""
        return next((s for s in self.suppliers if s.id == supplier_id), None)
    
    def _get_supplier_name(self, supplier_id: int) -> str:
        """Get supplier name"""
        supplier = self._get_supplier_by_id(supplier_id)
        return supplier.name_en if supplier else f"Supplier {supplier_id}"


# Flask integration
def init_procurement(app):
    """Initialize procurement module for Flask app"""
    pm = ProcurementManager()
    app.config['PROCUREMENT_MANAGER'] = pm
    
    @app.route('/api/procurement/pr/create', methods=['POST'])
    def create_pr():
        """Create purchase request"""
        data = app.request.json
        # Implementation here
        return {"success": True, "pr_number": "PR-2025-0001"}
    
    @app.route('/api/procurement/po/create', methods=['POST'])
    def create_po():
        """Create purchase order"""
        data = app.request.json
        # Implementation here
        return {"success": True, "po_number": "PO-2025-0001"}
    
    @app.route('/api/procurement/reports/material-status')
    def material_status_report():
        """Get material status report"""
        project_id = app.request.args.get('project_id', type=int)
        return pm.get_material_status_report(project_id)
    
    @app.route('/api/procurement/reports/supplier-performance')
    def supplier_performance_report():
        """Get supplier performance report"""
        return {"suppliers": pm.get_supplier_performance_report()}
    
    @app.route('/api/procurement/reports/pending-deliveries')
    def pending_deliveries():
        """Get pending deliveries"""
        project_id = app.request.args.get('project_id', type=int)
        return {"deliveries": pm.get_pending_deliveries(project_id)}
    
    logger.info("Procurement module initialized")
    return pm


# Usage example
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    print("=" * 80)
    print("NOUFAL ERP - PROCUREMENT MODULE EXAMPLE")
    print("=" * 80)
    
    pm = ProcurementManager()
    
    # Add supplier
    supplier = Supplier(
        id=1,
        code="SUP-001",
        name_ar="شركة الفولاذ المتحد",
        name_en="United Steel Company",
        category="Steel",
        contact_person="Ahmed Ali",
        phone="+966501234567",
        email="info@unitedsteel.com",
        address="Riyadh, Saudi Arabia",
        tax_number="300123456789003",
        payment_terms="Net 30",
        credit_limit=1000000.0,
        rating=4.5
    )
    pm.add_supplier(supplier)
    
    # Create PR
    pr_items = [
        PurchaseRequestItem(
            material_id=1,
            material_name="Steel Bars 16mm",
            quantity=10.5,
            unit="Ton",
            required_date=datetime.now() + timedelta(days=15),
            project_id=1,
            estimated_price=2500.0
        )
    ]
    
    pr = pm.create_purchase_request(
        project_id=1,
        requested_by_id=101,
        items=pr_items,
        required_date=datetime.now() + timedelta(days=15),
        justification="Required for foundation work"
    )
    
    print(f"\n✅ Created Purchase Request: {pr.pr_number}")
    print(f"   Status: {pr.status.value}")
    print(f"   Total: {pr.total_estimated_cost:,.2f} SAR")
    
    # Get material status report
    print("\n" + "=" * 80)
    print("MATERIAL STATUS REPORT")
    print("=" * 80)
    report = pm.get_material_status_report()
    print(f"Requested: {report['summary']['requested']}")
    print(f"Ordered: {report['summary']['ordered']}")
    print(f"In Transit: {report['summary']['in_transit']}")
    print(f"Delivered: {report['summary']['delivered']}")
