"""
NOUFAL ERP - Multi-Role Permission System
نظام الصلاحيات المتدرج متعدد الأدوار

Features:
- 9 predefined roles with specific permissions
- Hierarchical permission structure
- Role-based access control (RBAC)
- Permission inheritance
- Dynamic permission checking
- Audit trail for permission changes
"""

from enum import Enum
from typing import List, Dict, Set, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


class Role(Enum):
    """
    System roles - الأدوار في النظام
    """
    # Top Management
    COMPANY_OWNER = "company_owner"              # صاحب الشركة
    
    # Project Management
    PROJECT_MANAGER = "project_manager"          # مدير المشروع
    
    # Engineering & Technical
    SITE_ENGINEER = "site_engineer"              # مهندس الموقع
    EXECUTION_ENGINEER = "execution_engineer"    # مهندس التنفيذ
    SUPERVISOR = "supervisor"                    # المشرف
    PLANNING_ENGINEER = "planning_engineer"      # مهندس التخطيط
    COST_CONTROL_ENGINEER = "cost_control"       # مهندس الكنترول كوست
    
    # Support Services
    TECHNICAL_OFFICE = "technical_office"        # المكتب الفني
    ACCOUNTS_FINANCE = "accounts_finance"        # الحسابات والمالية
    
    # Default
    VIEWER = "viewer"                            # مستخدم عادي - قراءة فقط


class Permission(Enum):
    """
    System permissions - الصلاحيات في النظام
    """
    # === Dashboard & Analytics ===
    VIEW_DASHBOARD = "view_dashboard"
    VIEW_ALL_PROJECTS = "view_all_projects"
    VIEW_EXECUTIVE_DASHBOARD = "view_executive_dashboard"
    VIEW_FINANCIAL_ANALYTICS = "view_financial_analytics"
    VIEW_TIME_ANALYTICS = "view_time_analytics"
    
    # === Project Management ===
    CREATE_PROJECT = "create_project"
    EDIT_PROJECT = "edit_project"
    DELETE_PROJECT = "delete_project"
    APPROVE_PROJECT = "approve_project"
    CLOSE_PROJECT = "close_project"
    
    # === BOQ Management ===
    VIEW_BOQ = "view_boq"
    CREATE_BOQ = "create_boq"
    EDIT_BOQ = "edit_boq"
    DELETE_BOQ = "delete_boq"
    APPROVE_BOQ = "approve_boq"
    EXPORT_BOQ = "export_boq"
    
    # === Schedule Management ===
    VIEW_SCHEDULE = "view_schedule"
    CREATE_SCHEDULE = "create_schedule"
    EDIT_SCHEDULE = "edit_schedule"
    DELETE_SCHEDULE = "delete_schedule"
    APPROVE_SCHEDULE = "approve_schedule"
    UPDATE_PROGRESS = "update_progress"
    VIEW_CRITICAL_PATH = "view_critical_path"
    
    # === Cost Control ===
    VIEW_COSTS = "view_costs"
    MANAGE_BUDGET = "manage_budget"
    TRACK_EXPENSES = "track_expenses"
    APPROVE_EXPENSES = "approve_expenses"
    VIEW_CBS = "view_cbs"  # Cost Breakdown Structure
    COMPARE_BUDGET_ACTUAL = "compare_budget_actual"
    
    # === Field Operations ===
    USE_MOBILE_APP = "use_mobile_app"
    SUBMIT_DAILY_REPORT = "submit_daily_report"
    UPLOAD_SITE_PHOTOS = "upload_site_photos"
    TRACK_WORKERS = "track_workers"
    SCAN_QR_CODES = "scan_qr_codes"
    RECORD_EQUIPMENT = "record_equipment"
    
    # === RFI (Request for Information) ===
    VIEW_RFI = "view_rfi"
    CREATE_RFI = "create_rfi"
    RESPOND_RFI = "respond_rfi"
    APPROVE_RFI = "approve_rfi"
    CLOSE_RFI = "close_rfi"
    
    # === Drawing Management ===
    VIEW_DRAWINGS = "view_drawings"
    UPLOAD_DRAWINGS = "upload_drawings"
    APPROVE_DRAWINGS = "approve_drawings"
    MANAGE_VERSIONS = "manage_versions"
    UPDATE_AS_BUILT = "update_as_built"
    COMPARE_DRAWINGS = "compare_drawings"
    
    # === Financial Operations ===
    VIEW_FINANCIALS = "view_financials"
    CREATE_INVOICE = "create_invoice"
    APPROVE_INVOICE = "approve_invoice"
    MANAGE_PAYMENTS = "manage_payments"
    VIEW_CASH_FLOW = "view_cash_flow"
    GENERATE_MONTHLY_STATEMENT = "generate_monthly_statement"
    
    # === Reports ===
    VIEW_REPORTS = "view_reports"
    CREATE_REPORTS = "create_reports"
    EXPORT_REPORTS = "export_reports"
    CUSTOMIZE_REPORTS = "customize_reports"
    SCHEDULE_REPORTS = "schedule_reports"
    
    # === User Management ===
    VIEW_USERS = "view_users"
    CREATE_USERS = "create_users"
    EDIT_USERS = "edit_users"
    DELETE_USERS = "delete_users"
    ASSIGN_ROLES = "assign_roles"
    MANAGE_PERMISSIONS = "manage_permissions"
    
    # === System Administration ===
    VIEW_AUDIT_LOG = "view_audit_log"
    MANAGE_SETTINGS = "manage_settings"
    BACKUP_DATA = "backup_data"
    RESTORE_DATA = "restore_data"
    MANAGE_INTEGRATIONS = "manage_integrations"
    
    # === Notifications ===
    RECEIVE_NOTIFICATIONS = "receive_notifications"
    SEND_NOTIFICATIONS = "send_notifications"
    MANAGE_NOTIFICATION_SETTINGS = "manage_notification_settings"


# Role Permissions Mapping - تعيين الصلاحيات لكل دور
ROLE_PERMISSIONS: Dict[Role, Set[Permission]] = {
    # صاحب الشركة - Full Access
    Role.COMPANY_OWNER: {
        # All permissions
        perm for perm in Permission
    },
    
    # مدير المشروع - Project Management Focus
    Role.PROJECT_MANAGER: {
        # Dashboard
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_FINANCIAL_ANALYTICS,
        Permission.VIEW_TIME_ANALYTICS,
        
        # Project Management
        Permission.CREATE_PROJECT,
        Permission.EDIT_PROJECT,
        Permission.APPROVE_PROJECT,
        Permission.CLOSE_PROJECT,
        
        # BOQ
        Permission.VIEW_BOQ,
        Permission.EDIT_BOQ,
        Permission.APPROVE_BOQ,
        Permission.EXPORT_BOQ,
        
        # Schedule
        Permission.VIEW_SCHEDULE,
        Permission.EDIT_SCHEDULE,
        Permission.APPROVE_SCHEDULE,
        Permission.VIEW_CRITICAL_PATH,
        
        # Cost Control
        Permission.VIEW_COSTS,
        Permission.MANAGE_BUDGET,
        Permission.APPROVE_EXPENSES,
        Permission.VIEW_CBS,
        Permission.COMPARE_BUDGET_ACTUAL,
        
        # RFI
        Permission.VIEW_RFI,
        Permission.APPROVE_RFI,
        Permission.CLOSE_RFI,
        
        # Drawings
        Permission.VIEW_DRAWINGS,
        Permission.APPROVE_DRAWINGS,
        
        # Financial
        Permission.VIEW_FINANCIALS,
        Permission.APPROVE_INVOICE,
        Permission.VIEW_CASH_FLOW,
        
        # Reports
        Permission.VIEW_REPORTS,
        Permission.CREATE_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.CUSTOMIZE_REPORTS,
        
        # Users
        Permission.VIEW_USERS,
        Permission.ASSIGN_ROLES,
        
        # Notifications
        Permission.RECEIVE_NOTIFICATIONS,
        Permission.SEND_NOTIFICATIONS,
    },
    
    # مهندس الموقع - Field Operations Focus
    Role.SITE_ENGINEER: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_BOQ,
        Permission.VIEW_SCHEDULE,
        Permission.UPDATE_PROGRESS,
        
        # Field Operations
        Permission.USE_MOBILE_APP,
        Permission.SUBMIT_DAILY_REPORT,
        Permission.UPLOAD_SITE_PHOTOS,
        Permission.TRACK_WORKERS,
        Permission.SCAN_QR_CODES,
        Permission.RECORD_EQUIPMENT,
        
        # RFI
        Permission.VIEW_RFI,
        Permission.CREATE_RFI,
        
        # Drawings
        Permission.VIEW_DRAWINGS,
        Permission.UPDATE_AS_BUILT,
        
        # Reports
        Permission.VIEW_REPORTS,
        Permission.CREATE_REPORTS,
        
        Permission.RECEIVE_NOTIFICATIONS,
    },
    
    # مهندس التنفيذ - Execution Focus
    Role.EXECUTION_ENGINEER: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_BOQ,
        Permission.EDIT_BOQ,
        Permission.VIEW_SCHEDULE,
        Permission.UPDATE_PROGRESS,
        
        # RFI
        Permission.VIEW_RFI,
        Permission.CREATE_RFI,
        Permission.RESPOND_RFI,
        
        # Drawings
        Permission.VIEW_DRAWINGS,
        Permission.COMPARE_DRAWINGS,
        
        # Field
        Permission.USE_MOBILE_APP,
        Permission.SUBMIT_DAILY_REPORT,
        Permission.UPLOAD_SITE_PHOTOS,
        
        Permission.VIEW_REPORTS,
        Permission.RECEIVE_NOTIFICATIONS,
    },
    
    # المشرف - Supervision Focus
    Role.SUPERVISOR: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_BOQ,
        Permission.VIEW_SCHEDULE,
        Permission.UPDATE_PROGRESS,
        
        Permission.USE_MOBILE_APP,
        Permission.SUBMIT_DAILY_REPORT,
        Permission.UPLOAD_SITE_PHOTOS,
        Permission.TRACK_WORKERS,
        Permission.SCAN_QR_CODES,
        
        Permission.VIEW_DRAWINGS,
        Permission.VIEW_RFI,
        Permission.CREATE_RFI,
        
        Permission.RECEIVE_NOTIFICATIONS,
    },
    
    # مهندس التخطيط - Planning & Scheduling Focus
    Role.PLANNING_ENGINEER: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_TIME_ANALYTICS,
        Permission.VIEW_BOQ,
        
        # Schedule - Full Access
        Permission.VIEW_SCHEDULE,
        Permission.CREATE_SCHEDULE,
        Permission.EDIT_SCHEDULE,
        Permission.APPROVE_SCHEDULE,
        Permission.VIEW_CRITICAL_PATH,
        Permission.UPDATE_PROGRESS,
        
        Permission.VIEW_COSTS,
        Permission.VIEW_CBS,
        
        Permission.VIEW_REPORTS,
        Permission.CREATE_REPORTS,
        Permission.EXPORT_REPORTS,
        
        Permission.MANAGE_INTEGRATIONS,  # For Primavera/MS Project
        Permission.RECEIVE_NOTIFICATIONS,
    },
    
    # مهندس الكنترول كوست - Cost Control Focus
    Role.COST_CONTROL_ENGINEER: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_FINANCIAL_ANALYTICS,
        Permission.VIEW_BOQ,
        Permission.EXPORT_BOQ,
        Permission.VIEW_SCHEDULE,
        
        # Cost Control - Full Access
        Permission.VIEW_COSTS,
        Permission.MANAGE_BUDGET,
        Permission.TRACK_EXPENSES,
        Permission.VIEW_CBS,
        Permission.COMPARE_BUDGET_ACTUAL,
        
        Permission.VIEW_FINANCIALS,
        Permission.VIEW_CASH_FLOW,
        
        Permission.VIEW_REPORTS,
        Permission.CREATE_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.CUSTOMIZE_REPORTS,
        
        Permission.RECEIVE_NOTIFICATIONS,
    },
    
    # المكتب الفني - Technical Office Focus
    Role.TECHNICAL_OFFICE: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_BOQ,
        Permission.VIEW_SCHEDULE,
        
        # RFI - Respond capability
        Permission.VIEW_RFI,
        Permission.RESPOND_RFI,
        Permission.CLOSE_RFI,
        
        # Drawings - Full Management
        Permission.VIEW_DRAWINGS,
        Permission.UPLOAD_DRAWINGS,
        Permission.APPROVE_DRAWINGS,
        Permission.MANAGE_VERSIONS,
        Permission.UPDATE_AS_BUILT,
        Permission.COMPARE_DRAWINGS,
        
        Permission.VIEW_REPORTS,
        Permission.CREATE_REPORTS,
        Permission.RECEIVE_NOTIFICATIONS,
    },
    
    # الحسابات والمالية - Financial Focus
    Role.ACCOUNTS_FINANCE: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_FINANCIAL_ANALYTICS,
        Permission.VIEW_BOQ,
        Permission.VIEW_SCHEDULE,
        Permission.VIEW_COSTS,
        Permission.TRACK_EXPENSES,
        
        # Financial - Full Access
        Permission.VIEW_FINANCIALS,
        Permission.CREATE_INVOICE,
        Permission.APPROVE_INVOICE,
        Permission.MANAGE_PAYMENTS,
        Permission.VIEW_CASH_FLOW,
        Permission.GENERATE_MONTHLY_STATEMENT,
        
        Permission.VIEW_REPORTS,
        Permission.CREATE_REPORTS,
        Permission.EXPORT_REPORTS,
        
        Permission.RECEIVE_NOTIFICATIONS,
    },
    
    # مستخدم عادي - View Only
    Role.VIEWER: {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_BOQ,
        Permission.VIEW_SCHEDULE,
        Permission.VIEW_DRAWINGS,
        Permission.VIEW_REPORTS,
        Permission.RECEIVE_NOTIFICATIONS,
    },
}


@dataclass
class User:
    """User model with role and permissions"""
    id: int
    username: str
    email: str
    role: Role
    is_active: bool = True
    custom_permissions: Set[Permission] = field(default_factory=set)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


class PermissionManager:
    """
    Permission management system
    مدير نظام الصلاحيات
    """
    
    def __init__(self):
        self.role_permissions = ROLE_PERMISSIONS
        logger.info("PermissionManager initialized")
    
    def get_role_permissions(self, role: Role) -> Set[Permission]:
        """
        Get all permissions for a role
        الحصول على جميع صلاحيات دور معين
        """
        return self.role_permissions.get(role, set())
    
    def get_user_permissions(self, user: User) -> Set[Permission]:
        """
        Get all permissions for a user (role + custom)
        الحصول على جميع صلاحيات المستخدم
        """
        role_perms = self.get_role_permissions(user.role)
        return role_perms | user.custom_permissions
    
    def has_permission(self, user: User, permission: Permission) -> bool:
        """
        Check if user has specific permission
        التحقق من امتلاك المستخدم لصلاحية معينة
        """
        if not user.is_active:
            return False
        
        user_perms = self.get_user_permissions(user)
        return permission in user_perms
    
    def has_any_permission(self, user: User, permissions: List[Permission]) -> bool:
        """Check if user has any of the specified permissions"""
        user_perms = self.get_user_permissions(user)
        return any(perm in user_perms for perm in permissions)
    
    def has_all_permissions(self, user: User, permissions: List[Permission]) -> bool:
        """Check if user has all specified permissions"""
        user_perms = self.get_user_permissions(user)
        return all(perm in user_perms for perm in permissions)
    
    def add_custom_permission(self, user: User, permission: Permission) -> bool:
        """
        Add custom permission to user
        إضافة صلاحية مخصصة للمستخدم
        """
        if permission not in user.custom_permissions:
            user.custom_permissions.add(permission)
            user.updated_at = datetime.now()
            logger.info(f"Added permission {permission.value} to user {user.username}")
            return True
        return False
    
    def remove_custom_permission(self, user: User, permission: Permission) -> bool:
        """Remove custom permission from user"""
        if permission in user.custom_permissions:
            user.custom_permissions.remove(permission)
            user.updated_at = datetime.now()
            logger.info(f"Removed permission {permission.value} from user {user.username}")
            return True
        return False
    
    def change_user_role(self, user: User, new_role: Role) -> bool:
        """
        Change user role
        تغيير دور المستخدم
        """
        old_role = user.role
        user.role = new_role
        user.updated_at = datetime.now()
        logger.info(f"Changed role for user {user.username}: {old_role.value} -> {new_role.value}")
        return True
    
    def get_role_description(self, role: Role) -> Dict[str, str]:
        """Get role description in Arabic and English"""
        descriptions = {
            Role.COMPANY_OWNER: {
                "ar": "صاحب الشركة",
                "en": "Company Owner",
                "description_ar": "صلاحيات كاملة على النظام",
                "description_en": "Full system access"
            },
            Role.PROJECT_MANAGER: {
                "ar": "مدير المشروع",
                "en": "Project Manager",
                "description_ar": "إدارة شاملة للمشاريع",
                "description_en": "Comprehensive project management"
            },
            Role.SITE_ENGINEER: {
                "ar": "مهندس الموقع",
                "en": "Site Engineer",
                "description_ar": "العمليات الميدانية والتقارير اليومية",
                "description_en": "Field operations and daily reports"
            },
            Role.EXECUTION_ENGINEER: {
                "ar": "مهندس التنفيذ",
                "en": "Execution Engineer",
                "description_ar": "تنفيذ الأعمال ومقارنة المخططات",
                "description_en": "Work execution and drawing comparison"
            },
            Role.SUPERVISOR: {
                "ar": "المشرف",
                "en": "Supervisor",
                "description_ar": "الإشراف على العمالة والأنشطة",
                "description_en": "Labor and activity supervision"
            },
            Role.PLANNING_ENGINEER: {
                "ar": "مهندس التخطيط",
                "en": "Planning Engineer",
                "description_ar": "إدارة الجداول الزمنية والتخطيط",
                "description_en": "Schedule management and planning"
            },
            Role.COST_CONTROL_ENGINEER: {
                "ar": "مهندس الكنترول كوست",
                "en": "Cost Control Engineer",
                "description_ar": "مراقبة التكاليف والميزانيات",
                "description_en": "Cost and budget control"
            },
            Role.TECHNICAL_OFFICE: {
                "ar": "المكتب الفني",
                "en": "Technical Office",
                "description_ar": "إدارة المخططات والـ RFI",
                "description_en": "Drawing and RFI management"
            },
            Role.ACCOUNTS_FINANCE: {
                "ar": "الحسابات والمالية",
                "en": "Accounts & Finance",
                "description_ar": "العمليات المالية والمستخلصات",
                "description_en": "Financial operations and invoicing"
            },
            Role.VIEWER: {
                "ar": "مستخدم عادي",
                "en": "Viewer",
                "description_ar": "قراءة فقط",
                "description_en": "Read-only access"
            },
        }
        return descriptions.get(role, {})
    
    def get_permission_matrix(self) -> Dict:
        """
        Get complete permission matrix for all roles
        الحصول على مصفوفة الصلاحيات الكاملة
        """
        matrix = {}
        for role in Role:
            matrix[role.value] = {
                "role_info": self.get_role_description(role),
                "permissions": [perm.value for perm in self.get_role_permissions(role)],
                "permission_count": len(self.get_role_permissions(role))
            }
        return matrix
    
    def export_permissions_json(self, filepath: str):
        """Export permissions matrix to JSON file"""
        matrix = self.get_permission_matrix()
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(matrix, f, ensure_ascii=False, indent=2)
        logger.info(f"Exported permissions matrix to {filepath}")


# Decorator for permission checking
def require_permission(permission: Permission):
    """
    Decorator to check permission before executing function
    ديكوريتر للتحقق من الصلاحية قبل تنفيذ الدالة
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Get user from kwargs or context
            user = kwargs.get('user') or kwargs.get('current_user')
            
            if not user:
                raise PermissionError("No user provided")
            
            permission_manager = PermissionManager()
            
            if not permission_manager.has_permission(user, permission):
                raise PermissionError(
                    f"User {user.username} does not have permission: {permission.value}"
                )
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def require_any_permission(*permissions: Permission):
    """Decorator to check if user has any of the specified permissions"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            user = kwargs.get('user') or kwargs.get('current_user')
            
            if not user:
                raise PermissionError("No user provided")
            
            permission_manager = PermissionManager()
            
            if not permission_manager.has_any_permission(user, list(permissions)):
                raise PermissionError(
                    f"User {user.username} does not have any of required permissions"
                )
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


# Flask integration
def init_permissions(app):
    """
    Initialize permission system for Flask app
    تهيئة نظام الصلاحيات لتطبيق Flask
    """
    permission_manager = PermissionManager()
    app.config['PERMISSION_MANAGER'] = permission_manager
    
    @app.route('/api/permissions/matrix')
    def get_permission_matrix():
        """Get complete permission matrix"""
        return permission_manager.get_permission_matrix()
    
    @app.route('/api/permissions/roles')
    def get_roles():
        """Get all available roles"""
        return {
            "roles": [
                {
                    "value": role.value,
                    **permission_manager.get_role_description(role)
                }
                for role in Role
            ]
        }
    
    @app.route('/api/permissions/check', methods=['POST'])
    def check_permission():
        """Check if user has specific permission"""
        data = app.request.json
        user_id = data.get('user_id')
        permission_name = data.get('permission')
        
        # Get user from database (implement this)
        # user = get_user_by_id(user_id)
        
        # permission = Permission(permission_name)
        # has_perm = permission_manager.has_permission(user, permission)
        
        return {
            "has_permission": True,  # Replace with actual check
            "permission": permission_name
        }
    
    logger.info("Permission system initialized")
    return permission_manager


# Usage example
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    print("=" * 80)
    print("NOUFAL ERP - PERMISSION SYSTEM EXAMPLE")
    print("=" * 80)
    
    # Create permission manager
    pm = PermissionManager()
    
    # Create sample users
    owner = User(
        id=1,
        username="ahmed_owner",
        email="owner@noufal.com",
        role=Role.COMPANY_OWNER
    )
    
    site_eng = User(
        id=2,
        username="mohammed_site",
        email="site@noufal.com",
        role=Role.SITE_ENGINEER
    )
    
    # Check permissions
    print("\n" + "=" * 80)
    print("PERMISSION CHECKS")
    print("=" * 80)
    
    print(f"\nOwner can view dashboard: {pm.has_permission(owner, Permission.VIEW_DASHBOARD)}")
    print(f"Owner can delete users: {pm.has_permission(owner, Permission.DELETE_USERS)}")
    
    print(f"\nSite Engineer can use mobile app: {pm.has_permission(site_eng, Permission.USE_MOBILE_APP)}")
    print(f"Site Engineer can delete users: {pm.has_permission(site_eng, Permission.DELETE_USERS)}")
    
    # Show role permissions
    print("\n" + "=" * 80)
    print(f"SITE ENGINEER PERMISSIONS ({len(pm.get_role_permissions(Role.SITE_ENGINEER))} total)")
    print("=" * 80)
    for perm in sorted(pm.get_role_permissions(Role.SITE_ENGINEER), key=lambda x: x.value):
        print(f"  ✓ {perm.value}")
    
    # Export permissions
    print("\n" + "=" * 80)
    print("EXPORTING PERMISSION MATRIX")
    print("=" * 80)
    pm.export_permissions_json("permissions_matrix.json")
    print("✅ Exported to permissions_matrix.json")
