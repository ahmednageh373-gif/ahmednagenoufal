"""
Activity Model - Schedule activities for CPM calculations.
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Date, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

class ActivityStatus(enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class Activity(Base):
    __tablename__ = 'activities'
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    schedule_id = Column(Integer, ForeignKey('schedules.id', ondelete='CASCADE'), nullable=True, index=True)
    boq_item_id = Column(Integer, ForeignKey('boq_items.id', ondelete='SET NULL'), nullable=True, index=True)
    
    activity_code = Column(String(50), nullable=False, index=True)
    activity_name = Column(String(255), nullable=False)
    activity_name_ar = Column(String(255), nullable=True)
    wbs_code = Column(String(50), nullable=True, index=True)
    description = Column(Text, nullable=True)
    
    duration = Column(Integer, nullable=False, default=1)
    actual_duration = Column(Integer, nullable=True)
    
    early_start = Column(Date, nullable=True)
    early_finish = Column(Date, nullable=True)
    late_start = Column(Date, nullable=True)
    late_finish = Column(Date, nullable=True)
    
    actual_start = Column(Date, nullable=True)
    actual_finish = Column(Date, nullable=True)
    
    total_float = Column(Integer, nullable=True, default=0)
    free_float = Column(Integer, nullable=True, default=0)
    is_critical = Column(Boolean, default=False, index=True)
    is_milestone = Column(Boolean, default=False)
    
    progress_percentage = Column(Numeric(5, 2), nullable=True, default=0)
    planned_cost = Column(Numeric(20, 2), nullable=True, default=0)
    actual_cost = Column(Numeric(20, 2), nullable=True, default=0)
    weight = Column(Numeric(8, 4), nullable=True, default=1.0)
    
    status = Column(Enum(ActivityStatus), default=ActivityStatus.NOT_STARTED, nullable=False, index=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="activities")
    schedule = relationship("Schedule", back_populates="activities")
    boq_item = relationship("BOQItem", back_populates="activities")
    
    predecessors = relationship("Relationship", foreign_keys="Relationship.successor_id", back_populates="successor", cascade="all, delete-orphan")
    successors = relationship("Relationship", foreign_keys="Relationship.predecessor_id", back_populates="predecessor", cascade="all, delete-orphan")
    
    resource_assignments = relationship("ResourceAssignment", back_populates="activity", cascade="all, delete-orphan")
    progress_logs = relationship("ProgressLog", back_populates="activity", cascade="all, delete-orphan")
    sbc_compliance = relationship("SBCCompliance", back_populates="activity", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Activity(id={self.id}, code='{self.activity_code}')>"
