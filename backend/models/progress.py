"""
Progress Log Model - Daily progress tracking for activities.
"""
from sqlalchemy import Column, Integer, Text, ForeignKey, Date, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class ProgressLog(Base):
    __tablename__ = 'progress_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    
    project_id = Column(Integer, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey('activities.id', ondelete='CASCADE'), nullable=False, index=True)
    
    date = Column(Date, nullable=False, index=True)
    progress_percentage = Column(Numeric(5, 2), nullable=False, default=0)
    completed_quantity = Column(Numeric(15, 4), nullable=True)
    notes = Column(Text, nullable=True)
    
    logged_by = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="progress_logs")
    activity = relationship("Activity", back_populates="progress_logs")
    
    def __repr__(self):
        return f"<ProgressLog(id={self.id}, date={self.date})>"
