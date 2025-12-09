"""
Database Models Package
======================

This package contains all SQLAlchemy database models for the NOUFAL system.

Models:
    - Project: Main project information
    - BOQItem: Bill of Quantities items
    - Activity: Schedule activities
    - Schedule: Master schedule
    - Relationship: Activity relationships (FS/SS/FF/SF)
    - Resource: Resources (labor, equipment, materials)
    - ResourceAssignment: Resource assignments to activities
    - ProgressLog: Daily progress tracking
    - Cost: Cost tracking and management
    - Risk: Risk management
    - User: System users
    - Role: User roles and permissions
    - SBCCompliance: Saudi Building Code compliance
    - AuditLog: System audit trail

Author: NOUFAL Engineering Team
Date: 2025-11-06
"""

# Import Base with fallback for different import contexts
try:
    from backend.database import Base
except ImportError:
    from database import Base

# Import all models so they're registered with SQLAlchemy
from .project import Project
from .boq import BOQItem
from .activity import Activity
from .schedule import Schedule
from .relationship import Relationship
from .resource import Resource
from .resource_assignment import ResourceAssignment
from .progress import ProgressLog
from .cost import Cost
from .risk import Risk
from .user import User
from .role import Role
from .sbc_compliance import SBCCompliance
from .audit import AuditLog

# Export all models
__all__ = [
    'Base',
    'Project',
    'BOQItem',
    'Activity',
    'Schedule',
    'Relationship',
    'Resource',
    'ResourceAssignment',
    'ProgressLog',
    'Cost',
    'Risk',
    'User',
    'Role',
    'SBCCompliance',
    'AuditLog',
]
