"""
SBC Compliance Model - Saudi Building Code compliance tracking.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class SBCCompliance(Base):
    __tablename__ = 'sbc_compliance'
    
    id = Column(Integer, primary_key=True, index=True)
    
    activity_id = Column(Integer, ForeignKey('activities.id', ondelete='CASCADE'), nullable=False, index=True)
    
    sbc_code = Column(String(50), nullable=False, index=True)
    requirement = Column(Text, nullable=False)
    
    is_compliant = Column(Boolean, nullable=True, index=True)
    checked_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    activity = relationship("Activity", back_populates="sbc_compliance")
    
    def __repr__(self):
        return f"<SBCCompliance(id={self.id}, sbc_code='{self.sbc_code}')>"
