"""
Dashboard Service - خدمة لوحة التحكم
====================================

Provides statistics and monitoring for Unified Dashboard
Tracks tool usage, system health, and recent activities

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import json


@dataclass
class DashboardStats:
    """إحصائيات لوحة التحكم"""
    total_projects: int
    active_tools: int
    completed_calculations: int
    system_health: float
    last_update: str


@dataclass
class ToolUsage:
    """استخدام الأداة"""
    tool_id: str
    tool_name: str
    tool_name_ar: str
    category: str
    usage_count: int
    last_used: Optional[str]
    avg_execution_time: Optional[float]


@dataclass
class RecentActivity:
    """نشاط حديث"""
    id: str
    tool_id: str
    tool_name: str
    action: str
    action_ar: str
    timestamp: str
    user: str
    status: str  # success, warning, error
    execution_time: Optional[float]
    details: Optional[Dict]


@dataclass
class SystemHealth:
    """صحة النظام"""
    overall_health: float
    database_health: float
    api_health: float
    tools_health: float
    last_check: str
    issues: List[str]


class DashboardService:
    """خدمة لوحة التحكم"""
    
    def __init__(self, db_path: str):
        """
        Initialize dashboard service
        
        Args:
            db_path: Path to database
        """
        self.db_path = db_path
        self._init_tables()
    
    def _init_tables(self):
        """Initialize database tables for dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tool usage tracking table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tool_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tool_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                tool_name_ar TEXT NOT NULL,
                category TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                user TEXT,
                execution_time REAL,
                status TEXT DEFAULT 'success',
                details TEXT
            )
        """)
        
        # Project tracking table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS dashboard_projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_name TEXT NOT NULL,
                project_name_ar TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                owner TEXT
            )
        """)
        
        # System health log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_health_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                overall_health REAL NOT NULL,
                database_health REAL NOT NULL,
                api_health REAL NOT NULL,
                tools_health REAL NOT NULL,
                issues TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def get_dashboard_stats(self) -> DashboardStats:
        """
        Get dashboard statistics
        
        Returns:
            DashboardStats object
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Count total projects
        cursor.execute("""
            SELECT COUNT(*) FROM dashboard_projects
            WHERE status IN ('active', 'on-hold')
        """)
        total_projects = cursor.fetchone()[0]
        
        # Count active tools (tools used in last 30 days)
        thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
        cursor.execute("""
            SELECT COUNT(DISTINCT tool_id) FROM tool_usage
            WHERE timestamp > ?
        """, (thirty_days_ago,))
        active_tools = cursor.fetchone()[0]
        
        # Count completed calculations
        cursor.execute("""
            SELECT COUNT(*) FROM tool_usage
            WHERE status = 'success'
        """)
        completed_calculations = cursor.fetchone()[0]
        
        # Get latest system health
        cursor.execute("""
            SELECT overall_health FROM system_health_log
            ORDER BY timestamp DESC LIMIT 1
        """)
        result = cursor.fetchone()
        system_health = result[0] if result else 0.0
        
        conn.close()
        
        return DashboardStats(
            total_projects=total_projects,
            active_tools=active_tools,
            completed_calculations=completed_calculations,
            system_health=system_health,
            last_update=datetime.now().isoformat()
        )
    
    def get_tool_usage_stats(self, limit: int = 30) -> List[ToolUsage]:
        """
        Get tool usage statistics
        
        Args:
            limit: Maximum number of tools to return
            
        Returns:
            List of ToolUsage objects
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                tool_id,
                tool_name,
                tool_name_ar,
                category,
                COUNT(*) as usage_count,
                MAX(timestamp) as last_used,
                AVG(execution_time) as avg_execution_time
            FROM tool_usage
            GROUP BY tool_id
            ORDER BY usage_count DESC
            LIMIT ?
        """, (limit,))
        
        results = []
        for row in cursor.fetchall():
            results.append(ToolUsage(
                tool_id=row[0],
                tool_name=row[1],
                tool_name_ar=row[2],
                category=row[3],
                usage_count=row[4],
                last_used=row[5],
                avg_execution_time=row[6]
            ))
        
        conn.close()
        return results
    
    def get_recent_activities(self, limit: int = 20) -> List[RecentActivity]:
        """
        Get recent activities
        
        Args:
            limit: Maximum number of activities to return
            
        Returns:
            List of RecentActivity objects
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                tool_id,
                tool_name,
                tool_name_ar,
                timestamp,
                user,
                status,
                execution_time,
                details
            FROM tool_usage
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))
        
        results = []
        for row in cursor.fetchall():
            # Create action description
            action = f"Used {row[2]}"
            action_ar = f"استخدم {row[3]}"
            
            details = None
            if row[8]:
                try:
                    details = json.loads(row[8])
                    if 'action' in details:
                        action = details['action']
                    if 'action_ar' in details:
                        action_ar = details['action_ar']
                except:
                    pass
            
            results.append(RecentActivity(
                id=str(row[0]),
                tool_id=row[1],
                tool_name=row[2],
                action=action,
                action_ar=action_ar,
                timestamp=row[4],
                user=row[5] or 'Anonymous',
                status=row[6],
                execution_time=row[7],
                details=details
            ))
        
        conn.close()
        return results
    
    def check_system_health(self) -> SystemHealth:
        """
        Check system health
        
        Returns:
            SystemHealth object
        """
        issues = []
        
        # Check database
        database_health = 100.0
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()
        except Exception as e:
            database_health = 0.0
            issues.append(f"Database error: {str(e)}")
        
        # Check API health (based on recent errors)
        api_health = 100.0
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Count errors in last hour
            one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
            cursor.execute("""
                SELECT COUNT(*) FROM tool_usage
                WHERE timestamp > ? AND status = 'error'
            """, (one_hour_ago,))
            error_count = cursor.fetchone()[0]
            
            # Count total requests in last hour
            cursor.execute("""
                SELECT COUNT(*) FROM tool_usage
                WHERE timestamp > ?
            """, (one_hour_ago,))
            total_count = cursor.fetchone()[0]
            
            if total_count > 0:
                error_rate = error_count / total_count
                api_health = max(0, 100 - (error_rate * 100))
                if error_rate > 0.1:
                    issues.append(f"High error rate: {error_rate*100:.1f}%")
            
            conn.close()
        except Exception as e:
            api_health = 50.0
            issues.append(f"API health check error: {str(e)}")
        
        # Check tools health (based on usage)
        tools_health = 100.0
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if tools are being used
            twenty_four_hours_ago = (datetime.now() - timedelta(hours=24)).isoformat()
            cursor.execute("""
                SELECT COUNT(DISTINCT tool_id) FROM tool_usage
                WHERE timestamp > ?
            """, (twenty_four_hours_ago,))
            active_tools = cursor.fetchone()[0]
            
            if active_tools < 5:
                tools_health = 70.0
                issues.append(f"Low tool usage: only {active_tools} tools used in 24h")
            
            conn.close()
        except Exception as e:
            tools_health = 50.0
            issues.append(f"Tools health check error: {str(e)}")
        
        # Calculate overall health
        overall_health = (database_health + api_health + tools_health) / 3
        
        # Log health check
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO system_health_log 
            (timestamp, overall_health, database_health, api_health, tools_health, issues)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().isoformat(),
            overall_health,
            database_health,
            api_health,
            tools_health,
            json.dumps(issues)
        ))
        conn.commit()
        conn.close()
        
        return SystemHealth(
            overall_health=overall_health,
            database_health=database_health,
            api_health=api_health,
            tools_health=tools_health,
            last_check=datetime.now().isoformat(),
            issues=issues
        )
    
    def log_tool_usage(
        self,
        tool_id: str,
        tool_name: str,
        tool_name_ar: str,
        category: str,
        user: Optional[str] = None,
        execution_time: Optional[float] = None,
        status: str = 'success',
        details: Optional[Dict] = None
    ):
        """
        Log tool usage
        
        Args:
            tool_id: Tool identifier
            tool_name: Tool name in English
            tool_name_ar: Tool name in Arabic
            category: Tool category
            user: User who used the tool
            execution_time: Execution time in seconds
            status: Status (success, warning, error)
            details: Additional details
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO tool_usage 
            (tool_id, tool_name, tool_name_ar, category, timestamp, user, execution_time, status, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tool_id,
            tool_name,
            tool_name_ar,
            category,
            datetime.now().isoformat(),
            user,
            execution_time,
            status,
            json.dumps(details) if details else None
        ))
        
        conn.commit()
        conn.close()
    
    def create_project(
        self,
        project_name: str,
        project_name_ar: str,
        owner: Optional[str] = None
    ) -> int:
        """
        Create a new project
        
        Args:
            project_name: Project name in English
            project_name_ar: Project name in Arabic
            owner: Project owner
            
        Returns:
            Project ID
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO dashboard_projects 
            (project_name, project_name_ar, status, created_at, updated_at, owner)
            VALUES (?, ?, 'active', ?, ?, ?)
        """, (project_name, project_name_ar, now, now, owner))
        
        project_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return project_id
    
    def get_projects(self, status: Optional[str] = None) -> List[Dict]:
        """
        Get projects
        
        Args:
            status: Filter by status (active, completed, on-hold)
            
        Returns:
            List of projects
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if status:
            cursor.execute("""
                SELECT id, project_name, project_name_ar, status, created_at, updated_at, owner
                FROM dashboard_projects
                WHERE status = ?
                ORDER BY updated_at DESC
            """, (status,))
        else:
            cursor.execute("""
                SELECT id, project_name, project_name_ar, status, created_at, updated_at, owner
                FROM dashboard_projects
                ORDER BY updated_at DESC
            """)
        
        projects = []
        for row in cursor.fetchall():
            projects.append({
                'id': row[0],
                'project_name': row[1],
                'project_name_ar': row[2],
                'status': row[3],
                'created_at': row[4],
                'updated_at': row[5],
                'owner': row[6]
            })
        
        conn.close()
        return projects
    
    def get_tool_categories_stats(self) -> Dict[str, int]:
        """
        Get usage statistics by category
        
        Returns:
            Dictionary of category: usage_count
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT category, COUNT(*) as count
            FROM tool_usage
            GROUP BY category
            ORDER BY count DESC
        """)
        
        stats = {}
        for row in cursor.fetchall():
            stats[row[0]] = row[1]
        
        conn.close()
        return stats
    
    def get_usage_trend(self, days: int = 30) -> List[Dict]:
        """
        Get usage trend over time
        
        Args:
            days: Number of days to analyze
            
        Returns:
            List of daily usage statistics
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute("""
            SELECT 
                DATE(timestamp) as date,
                COUNT(*) as total_usage,
                COUNT(DISTINCT tool_id) as unique_tools,
                COUNT(DISTINCT user) as unique_users
            FROM tool_usage
            WHERE timestamp > ?
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        """, (start_date,))
        
        trend = []
        for row in cursor.fetchall():
            trend.append({
                'date': row[0],
                'total_usage': row[1],
                'unique_tools': row[2],
                'unique_users': row[3]
            })
        
        conn.close()
        return trend
