"""
Resource Assignment Model - Assignment of resources to activities.
"""
from sqlalchemy import Column, Integer, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class ResourceAssignment(Base):
    __tablename__ = 'resource_assignments'
    
    id = Column(Integer, primary_key=True, index=True)
    
    activity_id = Column(Integer, ForeignKey('activities.id', ondelete='CASCADE'), nullable=False, index=True)
    resource_id = Column(Integer, ForeignKey('resources.id', ondelete='CASCADE'), nullable=False, index=True)
    
    quantity = Column(Numeric(15, 4), nullable=False, default=0)
    cost = Column(Numeric(20, 2), nullable=True, default=0)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    activity = relationship("Activity", back_populates="resource_assignments")
    resource = relationship("Resource", back_populates="assignments")
    
    def __repr__(self):
        return f"<ResourceAssignment(id={self.id})>"
