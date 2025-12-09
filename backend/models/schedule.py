"""
Schedule Model - Master schedule for projects.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Schedule(Base):
    __tablename__ = 'schedules'
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    baseline_date = Column(Date, nullable=True)
    data_date = Column(Date, nullable=True)
    
    is_baseline = Column(Boolean, default=False)
    is_current = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="schedules")
    activities = relationship("Activity", back_populates="schedule", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Schedule(id={self.id}, name='{self.name}')>"
