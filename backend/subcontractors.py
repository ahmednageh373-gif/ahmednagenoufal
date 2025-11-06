"""
NOUFAL ERP - Subcontractor Management Module
إدارة مقاولي الباطن

Features:
- Subcontractor contract management
- Work progress tracking
- Payment and claims management
- Performance evaluation
- Work documentation with photos
"""

from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class ContractStatus(Enum):
    """Contract Status"""
    DRAFT = "draft"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    COMPLETED = "completed"
    TERMINATED = "terminated"


class PaymentStatus(Enum):
    """Payment Status"""
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    REJECTED = "rejected"


@dataclass
class Subcontractor:
    """Subcontractor - مقاول باطن"""
    id: int
    code: str
    name_ar: str
    name_en: str
    specialty: str  # Concrete, Steel, MEP, etc.
    license_number: str
    tax_number: str
    contact_person: str
    phone: str
    email: str
    rating: float = 0.0
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class SubcontractorContract:
    """Contract with subcontractor"""
    id: int
    contract_number: str
    subcontractor_id: int
    subcontractor_name: str
    project_id: int
    scope_of_work: str
    contract_value: float
    start_date: datetime
    end_date: datetime
    status: ContractStatus = ContractStatus.DRAFT
    progress_percentage: float = 0.0
    total_paid: float = 0.0
    retention_percentage: float = 10.0
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class WorkProgress:
    """Work progress entry"""
    id: int
    contract_id: int
    date: datetime
    description: str
    quantity_completed: float
    unit: str
    progress_percentage: float
    photos: List[str] = field(default_factory=list)
    notes: str = ""
    submitted_by_id: int = 0
    approved: bool = False


@dataclass
class Payment:
    """Payment to subcontractor"""
    id: int
    payment_number: str
    contract_id: int
    amount: float
    retention_amount: float
    net_amount: float
    status: PaymentStatus = PaymentStatus.PENDING
    payment_date: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)


class SubcontractorManager:
    """Subcontractor management system"""
    
    def __init__(self):
        self.subcontractors: List[Subcontractor] = []
        self.contracts: List[SubcontractorContract] = []
        self.work_progress: List[WorkProgress] = []
        self.payments: List[Payment] = []
        logger.info("SubcontractorManager initialized")
    
    def add_subcontractor(self, subcontractor: Subcontractor) -> Subcontractor:
        """Add new subcontractor"""
        self.subcontractors.append(subcontractor)
        logger.info(f"Added subcontractor: {subcontractor.name_en}")
        return subcontractor
    
    def create_contract(self, contract: SubcontractorContract) -> SubcontractorContract:
        """Create new contract"""
        self.contracts.append(contract)
        logger.info(f"Created contract: {contract.contract_number}")
        return contract
    
    def record_progress(self, progress: WorkProgress) -> WorkProgress:
        """Record work progress"""
        self.work_progress.append(progress)
        
        # Update contract progress
        contract = next((c for c in self.contracts if c.id == progress.contract_id), None)
        if contract:
            contract.progress_percentage = progress.progress_percentage
        
        logger.info(f"Recorded progress for contract ID: {progress.contract_id}")
        return progress
    
    def create_payment(self, contract_id: int, amount: float) -> Payment:
        """Create payment"""
        contract = next((c for c in self.contracts if c.id == contract_id), None)
        if not contract:
            raise ValueError(f"Contract {contract_id} not found")
        
        retention = amount * (contract.retention_percentage / 100)
        net = amount - retention
        
        payment = Payment(
            id=len(self.payments) + 1,
            payment_number=f"PAY-{datetime.now().year}-{len(self.payments) + 1:04d}",
            contract_id=contract_id,
            amount=amount,
            retention_amount=retention,
            net_amount=net
        )
        
        self.payments.append(payment)
        contract.total_paid += net
        
        logger.info(f"Created payment: {payment.payment_number}")
        return payment
    
    def get_performance_report(self, subcontractor_id: int) -> Dict:
        """Get subcontractor performance report"""
        contracts = [c for c in self.contracts if c.subcontractor_id == subcontractor_id]
        
        return {
            "subcontractor_id": subcontractor_id,
            "total_contracts": len(contracts),
            "active_contracts": len([c for c in contracts if c.status == ContractStatus.ACTIVE]),
            "completed_contracts": len([c for c in contracts if c.status == ContractStatus.COMPLETED]),
            "total_value": sum(c.contract_value for c in contracts),
            "average_progress": sum(c.progress_percentage for c in contracts) / len(contracts) if contracts else 0
        }


# Flask integration
def init_subcontractors(app):
    """Initialize subcontractors module"""
    sm = SubcontractorManager()
    app.config['SUBCONTRACTOR_MANAGER'] = sm
    
    @app.route('/api/subcontractors/list')
    def list_subcontractors():
        return {"subcontractors": [s.__dict__ for s in sm.subcontractors]}
    
    @app.route('/api/subcontractors/contracts')
    def list_contracts():
        return {"contracts": [c.__dict__ for c in sm.contracts]}
    
    logger.info("Subcontractor module initialized")
    return sm
