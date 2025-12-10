"""
Cost Model - Cost tracking and management.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

class CostType(enum.Enum):
    LABOR = "labor"
    MATERIAL = "material"
    EQUIPMENT = "equipment"
    SUBCONTRACTOR = "subcontractor"
    OVERHEAD = "overhead"
    OTHER = "other"

class Cost(Base):
    __tablename__ = 'costs'
    
    id = Column(Integer, primary_key=True, index=True)
    
    project_id = Column(Integer, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey('activities.id', ondelete='SET NULL'), nullable=True, index=True)
    
    date = Column(Date, nullable=False, index=True)
    cost_type = Column(Enum(CostType), nullable=False, index=True)
    amount = Column(Numeric(20, 2), nullable=False)
    description = Column(Text, nullable=True)
    invoice_number = Column(String(100), nullable=True, index=True)
    vendor = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="costs")
    
    def __repr__(self):
        return f"<Cost(id={self.id}, amount={self.amount})>"
