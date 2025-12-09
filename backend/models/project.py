"""
Project Model
=============

Main project entity containing all project information.

Author: NOUFAL Engineering Team
Date: 2025-11-06
"""

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from .base import Base


class ProjectStatus(enum.Enum):
    """Project status enumeration."""
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Project(Base):
    """
    Project Model
    
    Represents a construction project with all its metadata.
    Central entity that links to BOQ, schedule, costs, etc.
    """
    
    __tablename__ = 'projects'
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    name_ar = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    project_code = Column(String(50), unique=True, nullable=False, index=True)
    project_type = Column(String(100), nullable=True)
    
    # Parties Involved
    client = Column(String(255), nullable=True)
    owner = Column(String(255), nullable=True)
    consultant = Column(String(255), nullable=True)
    contractor = Column(String(255), nullable=True)
    
    # Location
    location = Column(String(500), nullable=True)
    area = Column(Numeric(15, 2), nullable=True)
    
    # Dates
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    actual_start_date = Column(Date, nullable=True)
    actual_end_date = Column(Date, nullable=True)
    
    # Status
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING, nullable=False, index=True)
    
    # Financial
    budget = Column(Numeric(20, 2), nullable=True)
    contract_value = Column(Numeric(20, 2), nullable=True)
    currency = Column(String(3), default='SAR')
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    created_by = Column(Integer, nullable=True)
    
    # Relationships
    boq_items = relationship("BOQItem", back_populates="project", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="project", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="project", cascade="all, delete-orphan")
    costs = relationship("Cost", back_populates="project", cascade="all, delete-orphan")
    risks = relationship("Risk", back_populates="project", cascade="all, delete-orphan")
    progress_logs = relationship("ProgressLog", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project(id={self.id}, code='{self.project_code}', name='{self.name}')>"
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'name_ar': self.name_ar,
            'description': self.description,
            'project_code': self.project_code,
            'project_type': self.project_type,
            'client': self.client,
            'owner': self.owner,
            'consultant': self.consultant,
            'contractor': self.contractor,
            'location': self.location,
            'area': float(self.area) if self.area else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'actual_start_date': self.actual_start_date.isoformat() if self.actual_start_date else None,
            'actual_end_date': self.actual_end_date.isoformat() if self.actual_end_date else None,
            'status': self.status.value if self.status else None,
            'budget': float(self.budget) if self.budget else None,
            'contract_value': float(self.contract_value) if self.contract_value else None,
            'currency': self.currency,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
