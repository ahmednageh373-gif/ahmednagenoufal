"""
Risk Model - Risk management for projects.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

class RiskProbability(enum.Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class RiskImpact(enum.Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class RiskStatus(enum.Enum):
    IDENTIFIED = "identified"
    ASSESSING = "assessing"
    MITIGATING = "mitigating"
    MONITORING = "monitoring"
    CLOSED = "closed"

class Risk(Base):
    __tablename__ = 'risks'
    
    id = Column(Integer, primary_key=True, index=True)
    
    project_id = Column(Integer, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    
    probability = Column(Enum(RiskProbability), nullable=False, index=True)
    impact = Column(Enum(RiskImpact), nullable=False, index=True)
    
    mitigation_plan = Column(Text, nullable=True)
    contingency_plan = Column(Text, nullable=True)
    
    status = Column(Enum(RiskStatus), default=RiskStatus.IDENTIFIED, nullable=False, index=True)
    owner = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    project = relationship("Project", back_populates="risks")
    
    def __repr__(self):
        return f"<Risk(id={self.id}, title='{self.title}')>"
