"""
NOUFAL ERP - Drawing & Document Management Module
قسم المخططات والمستندات

Features:
- Central drawing library
- Electronic approval system
- Version control
- Automatic comparison between versions
- Technical correspondence tracking (Transmittals & Submittals)
- As-Built drawing updates
"""

from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class DrawingStatus(Enum):
    """Drawing Status"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUPERSEDED = "superseded"


class DocumentType(Enum):
    """Document Type"""
    DRAWING = "drawing"
    SPECIFICATION = "specification"
    CALCULATION = "calculation"
    REPORT = "report"
    CORRESPONDENCE = "correspondence"


@dataclass
class Drawing:
    """Drawing document"""
    id: int
    drawing_number: str
    title: str
    discipline: str  # Architectural, Structural, MEP, etc.
    project_id: int
    revision: str = "A"
    status: DrawingStatus = DrawingStatus.DRAFT
    file_path: str = ""
    file_type: str = "PDF"  # PDF, DWG, RVT
    created_by_id: int = 0
    created_date: datetime = field(default_factory=datetime.now)
    approved_by_id: Optional[int] = None
    approved_date: Optional[datetime] = None
    superseded_by: Optional[str] = None
    is_as_built: bool = False


@dataclass
class DrawingRevision:
    """Drawing revision history"""
    id: int
    drawing_id: int
    revision: str
    description: str
    revised_by_id: int
    revision_date: datetime
    file_path: str
    changes: List[str] = field(default_factory=list)


@dataclass
class Transmittal:
    """Technical transmittal"""
    id: int
    transmittal_number: str
    project_id: int
    from_company: str
    to_company: str
    date: datetime
    subject: str
    attachments: List[int] = field(default_factory=list)  # Drawing IDs
    notes: str = ""
    status: str = "sent"


class DrawingManager:
    """Drawing management system"""
    
    def __init__(self):
        self.drawings: List[Drawing] = []
        self.revisions: List[DrawingRevision] = []
        self.transmittals: List[Transmittal] = []
        logger.info("DrawingManager initialized")
    
    def add_drawing(self, drawing: Drawing) -> Drawing:
        """Add new drawing"""
        self.drawings.append(drawing)
        logger.info(f"Added drawing: {drawing.drawing_number}")
        return drawing
    
    def create_revision(self, drawing_id: int, description: str, changes: List[str]) -> DrawingRevision:
        """Create new revision"""
        drawing = next((d for d in self.drawings if d.id == drawing_id), None)
        if not drawing:
            raise ValueError(f"Drawing {drawing_id} not found")
        
        # Increment revision
        current_rev = drawing.revision
        new_rev = chr(ord(current_rev) + 1)
        
        revision = DrawingRevision(
            id=len(self.revisions) + 1,
            drawing_id=drawing_id,
            revision=new_rev,
            description=description,
            revised_by_id=1,
            revision_date=datetime.now(),
            file_path=f"/drawings/{drawing.drawing_number}_{new_rev}.pdf",
            changes=changes
        )
        
        self.revisions.append(revision)
        drawing.revision = new_rev
        drawing.status = DrawingStatus.DRAFT
        
        logger.info(f"Created revision {new_rev} for drawing {drawing.drawing_number}")
        return revision
    
    def approve_drawing(self, drawing_id: int, approved_by_id: int) -> bool:
        """Approve drawing"""
        drawing = next((d for d in self.drawings if d.id == drawing_id), None)
        if not drawing:
            return False
        
        drawing.status = DrawingStatus.APPROVED
        drawing.approved_by_id = approved_by_id
        drawing.approved_date = datetime.now()
        
        logger.info(f"Approved drawing: {drawing.drawing_number}")
        return True
    
    def create_transmittal(self, transmittal: Transmittal) -> Transmittal:
        """Create technical transmittal"""
        self.transmittals.append(transmittal)
        logger.info(f"Created transmittal: {transmittal.transmittal_number}")
        return transmittal
    
    def get_drawing_history(self, drawing_id: int) -> List[DrawingRevision]:
        """Get drawing revision history"""
        return [r for r in self.revisions if r.drawing_id == drawing_id]
    
    def compare_revisions(self, drawing_id: int, rev1: str, rev2: str) -> Dict:
        """Compare two revisions"""
        revisions = self.get_drawing_history(drawing_id)
        r1 = next((r for r in revisions if r.revision == rev1), None)
        r2 = next((r for r in revisions if r.revision == rev2), None)
        
        if not r1 or not r2:
            return {"error": "Revisions not found"}
        
        return {
            "drawing_id": drawing_id,
            "revision_1": rev1,
            "revision_2": rev2,
            "changes": r2.changes,
            "comparison_url": f"/api/drawings/compare/{drawing_id}/{rev1}/{rev2}"
        }


# Flask integration
def init_drawing_management(app):
    """Initialize drawing management module"""
    dm = DrawingManager()
    app.config['DRAWING_MANAGER'] = dm
    
    @app.route('/api/drawings/list')
    def list_drawings():
        return {"drawings": [d.__dict__ for d in dm.drawings]}
    
    @app.route('/api/drawings/<int:drawing_id>/revisions')
    def get_revisions(drawing_id):
        return {"revisions": [r.__dict__ for r in dm.get_drawing_history(drawing_id)]}
    
    logger.info("Drawing management module initialized")
    return dm
