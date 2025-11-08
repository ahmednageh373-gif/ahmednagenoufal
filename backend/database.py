"""
Database Configuration and Session Management
============================================

This module handles database connections and session management for the NOUFAL system.
Supports multiple database backends (SQLite, PostgreSQL, MongoDB).

Author: NOUFAL Engineering Team
Date: 2025-11-06
"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import StaticPool
import os
from contextlib import contextmanager

# Get database URL from environment or use default SQLite
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'sqlite:///./noufal_engineering.db'
)

# Create engine with appropriate settings
if DATABASE_URL.startswith('sqlite'):
    # SQLite specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=os.getenv('SQL_ECHO', 'false').lower() == 'true'
    )
    
    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL/MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=os.getenv('SQL_ECHO', 'false').lower() == 'true'
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create scoped session for thread-safety
db_session = scoped_session(SessionLocal)

# Create declarative base
Base = declarative_base()

# Bind base query property to scoped session
Base.query = db_session.query_property()


def get_db():
    """
    Get database session for dependency injection.
    
    Usage in Flask:
        @app.route('/api/endpoint')
        def endpoint():
            db = get_db()
            try:
                # your code here
                pass
            finally:
                db.close()
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for database session.
    
    Usage:
        with get_db_context() as db:
            # your code here
            pass
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """
    Initialize database by creating all tables.
    
    This should be called once when setting up the application.
    """
    # Import all models so they are registered with Base
    from backend.models import (
        project, boq, activity, schedule, relationship,
        resource, resource_assignment, progress, cost,
        risk, user, role, sbc_compliance, audit
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


def drop_db():
    """
    Drop all database tables.
    
    ⚠️ WARNING: This will delete all data!
    Use only in development/testing.
    """
    Base.metadata.drop_all(bind=engine)
    print("⚠️ All database tables dropped!")


def reset_db():
    """
    Reset database by dropping and recreating all tables.
    
    ⚠️ WARNING: This will delete all data!
    Use only in development/testing.
    """
    drop_db()
    init_db()
    print("🔄 Database reset complete!")


# Database utilities
class DatabaseUtils:
    """Utility functions for database operations."""
    
    @staticmethod
    def get_or_create(session, model, defaults=None, **kwargs):
        """
        Get an existing record or create a new one.
        
        Args:
            session: Database session
            model: SQLAlchemy model class
            defaults: Default values for creation
            **kwargs: Filter parameters
        
        Returns:
            tuple: (instance, created) where created is True if new record
        """
        instance = session.query(model).filter_by(**kwargs).first()
        if instance:
            return instance, False
        else:
            params = {**kwargs, **(defaults or {})}
            instance = model(**params)
            session.add(instance)
            session.flush()
            return instance, True
    
    @staticmethod
    def bulk_insert(session, model, data_list):
        """
        Bulk insert records efficiently.
        
        Args:
            session: Database session
            model: SQLAlchemy model class
            data_list: List of dictionaries with record data
        
        Returns:
            int: Number of records inserted
        """
        if not data_list:
            return 0
        
        session.bulk_insert_mappings(model, data_list)
        session.flush()
        return len(data_list)
    
    @staticmethod
    def bulk_update(session, model, data_list):
        """
        Bulk update records efficiently.
        
        Args:
            session: Database session
            model: SQLAlchemy model class
            data_list: List of dictionaries with record data (must include id)
        
        Returns:
            int: Number of records updated
        """
        if not data_list:
            return 0
        
        session.bulk_update_mappings(model, data_list)
        session.flush()
        return len(data_list)


# Export main objects
__all__ = [
    'engine',
    'SessionLocal',
    'db_session',
    'Base',
    'get_db',
    'get_db_context',
    'init_db',
    'drop_db',
    'reset_db',
    'DatabaseUtils',
]
