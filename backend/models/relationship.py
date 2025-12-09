"""
Relationship Model - Activity relationships for CPM scheduling.
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

class RelationshipType(enum.Enum):
    FS = "FS"  # Finish-to-Start
    SS = "SS"  # Start-to-Start
    FF = "FF"  # Finish-to-Finish
    SF = "SF"  # Start-to-Finish

class Relationship(Base):
    __tablename__ = 'relationships'
    
    id = Column(Integer, primary_key=True, index=True)
    
    predecessor_id = Column(Integer, ForeignKey('activities.id', ondelete='CASCADE'), nullable=False, index=True)
    successor_id = Column(Integer, ForeignKey('activities.id', ondelete='CASCADE'), nullable=False, index=True)
    
    type = Column(Enum(RelationshipType), default=RelationshipType.FS, nullable=False)
    lag = Column(Integer, default=0)
    description = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    predecessor = relationship("Activity", foreign_keys=[predecessor_id], back_populates="successors")
    successor = relationship("Activity", foreign_keys=[successor_id], back_populates="predecessors")
    
    def __repr__(self):
        return f"<Relationship(id={self.id}, {self.predecessor_id} -> {self.successor_id})>"
