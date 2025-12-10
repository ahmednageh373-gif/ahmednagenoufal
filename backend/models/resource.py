"""
Resource Model - Resources (labor, equipment, materials) for activities.
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

class ResourceType(enum.Enum):
    LABOR = "labor"
    EQUIPMENT = "equipment"
    MATERIAL = "material"

class Resource(Base):
    __tablename__ = 'resources'
    
    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(255), nullable=False, index=True)
    name_ar = Column(String(255), nullable=True)
    type = Column(Enum(ResourceType), nullable=False, index=True)
    
    unit = Column(String(20), nullable=False)
    unit_cost = Column(Numeric(15, 2), nullable=True, default=0)
    availability = Column(Numeric(15, 2), nullable=True)
    productivity_rate = Column(Numeric(10, 4), nullable=True)
    
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    assignments = relationship("ResourceAssignment", back_populates="resource", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Resource(id={self.id}, name='{self.name}')>"
