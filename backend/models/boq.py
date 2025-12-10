"""
BOQ Item Model
==============

Bill of Quantities items for construction projects.

Author: NOUFAL Engineering Team
Date: 2025-11-06
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class BOQItem(Base):
    """BOQ Item Model - Represents individual items in a Bill of Quantities."""
    
    __tablename__ = 'boq_items'
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Item Information
    item_code = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    description_ar = Column(Text, nullable=True)
    
    # Classification
    category = Column(String(100), nullable=True, index=True)
    subcategory = Column(String(100), nullable=True)
    wbs_code = Column(String(50), nullable=True, index=True)
    
    # Quantities and Costs
    unit = Column(String(20), nullable=False)
    quantity = Column(Numeric(15, 4), nullable=False, default=0)
    unit_price = Column(Numeric(15, 2), nullable=True, default=0)
    total_price = Column(Numeric(20, 2), nullable=True, default=0)
    
    # Cost Breakdown
    material_percentage = Column(Numeric(5, 2), nullable=True, default=0)
    labor_percentage = Column(Numeric(5, 2), nullable=True, default=0)
    equipment_percentage = Column(Numeric(5, 2), nullable=True, default=0)
    
    # Additional Information
    notes = Column(Text, nullable=True)
    sbc_code = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="boq_items")
    activities = relationship("Activity", back_populates="boq_item")
    
    def __repr__(self):
        return f"<BOQItem(id={self.id}, code='{self.item_code}')>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'item_code': self.item_code,
            'description': self.description,
            'description_ar': self.description_ar,
            'category': self.category,
            'unit': self.unit,
            'quantity': float(self.quantity) if self.quantity else 0,
            'unit_price': float(self.unit_price) if self.unit_price else 0,
            'total_price': float(self.total_price) if self.total_price else 0,
        }
