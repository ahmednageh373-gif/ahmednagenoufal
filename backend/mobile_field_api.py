"""
NOUFAL ERP - Mobile Field Application API
==========================================
API للتطبيق الميداني

This module provides REST API endpoints for mobile field applications:
- Daily Reports Submission
- Site Photos Upload
- Labor Attendance Tracking
- Activity Progress Updates
- Material Requests
- Equipment Usage Logging
- Safety Observations
- Quality Inspections
- Offline Data Sync
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict
import json


# ==================== Mobile API Models ====================

@dataclass
class MobileUser:
    """مستخدم التطبيق الميداني"""
    user_id: int
    username: str
    full_name: str
    role: str
    project_id: int
    device_id: str
    last_sync: datetime
    is_online: bool = True


@dataclass
class DailyReport:
    """التقرير اليومي الميداني"""
    report_id: str
    project_id: int
    engineer_id: int
    report_date: datetime
    weather: Dict[str, Any]
    activities_progress: List[Dict]
    labor_attendance: Dict[str, Any]
    materials_used: List[Dict]
    equipment_usage: List[Dict]
    issues: List[Dict]
    photos: List[str]
    notes: str
    submitted_at: datetime
    sync_status: str = "synced"  # synced, pending, failed


@dataclass
class SitePhoto:
    """صورة من الموقع"""
    photo_id: str
    project_id: int
    uploaded_by: int
    location: str
    description: str
    photo_url: str
    thumbnail_url: str
    gps_coordinates: Optional[Dict[str, float]]
    taken_at: datetime
    uploaded_at: datetime
    tags: List[str] = field(default_factory=list)


@dataclass
class ActivityUpdate:
    """تحديث تقدم نشاط"""
    update_id: str
    activity_id: int
    project_id: int
    updated_by: int
    progress_percentage: float
    crew_size: int
    hours_worked: float
    issues_encountered: List[str]
    photos: List[str]
    notes: str
    timestamp: datetime


@dataclass
class MaterialRequest:
    """طلب مواد من الموقع"""
    request_id: str
    project_id: int
    requested_by: int
    material_name: str
    quantity: float
    unit: str
    urgency: str  # normal, urgent, critical
    required_date: datetime
    justification: str
    status: str = "pending"  # pending, approved, rejected, delivered
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class SafetyObservation:
    """ملاحظة سلامة"""
    observation_id: str
    project_id: int
    observer_id: int
    severity: str  # low, medium, high, critical
    category: str  # ppe, housekeeping, equipment, behavior
    description: str
    location: str
    photos: List[str]
    corrective_action: str
    action_taken: bool
    observed_at: datetime


# ==================== Mobile Field API ====================

class MobileFieldAPI:
    """
    API التطبيق الميداني
    ====================
    
    يوفر واجهة برمجية للتطبيق الميداني للجوال
    """
    
    def __init__(self):
        self.daily_reports: List[DailyReport] = []
        self.site_photos: List[SitePhoto] = []
        self.activity_updates: List[ActivityUpdate] = []
        self.material_requests: List[MaterialRequest] = []
        self.safety_observations: List[SafetyObservation] = []
        self.offline_queue: List[Dict] = []
    
    # ==================== Authentication ====================
    
    def login(self, username: str, password: str, device_id: str) -> Dict:
        """
        تسجيل دخول المستخدم
        
        Returns:
            token ومعلومات المستخدم
        """
        # في التطبيق الفعلي، سيتم التحقق من البيانات من قاعدة البيانات
        user = MobileUser(
            user_id=1,
            username=username,
            full_name="Ahmed Al-Qahtani",
            role="site_engineer",
            project_id=1,
            device_id=device_id,
            last_sync=datetime.now(),
            is_online=True
        )
        
        token = f"mobile_token_{user.user_id}_{datetime.now().timestamp()}"
        
        return {
            "success": True,
            "token": token,
            "user": {
                "user_id": user.user_id,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role,
                "project_id": user.project_id,
                "permissions": self._get_user_permissions(user.role)
            },
            "expires_in": 86400  # 24 hours
        }
    
    def _get_user_permissions(self, role: str) -> List[str]:
        """الحصول على صلاحيات المستخدم"""
        permissions_map = {
            "site_engineer": [
                "submit_daily_report",
                "upload_photos",
                "track_attendance",
                "update_activity_progress",
                "request_materials",
                "log_safety_observations"
            ],
            "supervisor": [
                "track_attendance",
                "update_activity_progress",
                "upload_photos",
                "log_safety_observations"
            ],
            "project_manager": [
                "view_all_reports",
                "approve_material_requests",
                "review_safety_observations"
            ]
        }
        return permissions_map.get(role, [])
    
    # ==================== Daily Reports ====================
    
    def submit_daily_report(
        self,
        project_id: int,
        engineer_id: int,
        report_data: Dict
    ) -> Dict:
        """
        تقديم التقرير اليومي
        
        Args:
            project_id: معرّف المشروع
            engineer_id: معرّف المهندس
            report_data: بيانات التقرير
        
        Returns:
            تأكيد التقديم
        """
        report = DailyReport(
            report_id=f"DR-{datetime.now().strftime('%Y%m%d')}-{len(self.daily_reports) + 1:03d}",
            project_id=project_id,
            engineer_id=engineer_id,
            report_date=datetime.fromisoformat(report_data.get("report_date", datetime.now().isoformat())),
            weather=report_data.get("weather", {}),
            activities_progress=report_data.get("activities_progress", []),
            labor_attendance=report_data.get("labor_attendance", {}),
            materials_used=report_data.get("materials_used", []),
            equipment_usage=report_data.get("equipment_usage", []),
            issues=report_data.get("issues", []),
            photos=report_data.get("photos", []),
            notes=report_data.get("notes", ""),
            submitted_at=datetime.now()
        )
        
        self.daily_reports.append(report)
        
        return {
            "success": True,
            "report_id": report.report_id,
            "message": "تم تقديم التقرير اليومي بنجاح",
            "timestamp": report.submitted_at.isoformat()
        }
    
    def get_daily_reports(
        self,
        project_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        الحصول على التقارير اليومية
        
        Returns:
            قائمة التقارير اليومية
        """
        reports = [r for r in self.daily_reports if r.project_id == project_id]
        
        if start_date:
            reports = [r for r in reports if r.report_date >= start_date]
        
        if end_date:
            reports = [r for r in reports if r.report_date <= end_date]
        
        return {
            "success": True,
            "count": len(reports),
            "reports": [
                {
                    "report_id": r.report_id,
                    "report_date": r.report_date.isoformat(),
                    "engineer_id": r.engineer_id,
                    "activities_count": len(r.activities_progress),
                    "photos_count": len(r.photos),
                    "issues_count": len(r.issues),
                    "submitted_at": r.submitted_at.isoformat()
                }
                for r in reports
            ]
        }
    
    # ==================== Site Photos ====================
    
    def upload_photo(
        self,
        project_id: int,
        user_id: int,
        photo_data: Dict
    ) -> Dict:
        """
        رفع صورة من الموقع
        
        Args:
            project_id: معرّف المشروع
            user_id: معرّف المستخدم
            photo_data: بيانات الصورة
        
        Returns:
            معلومات الصورة المرفوعة
        """
        photo = SitePhoto(
            photo_id=f"PHOTO-{datetime.now().strftime('%Y%m%d%H%M%S')}-{len(self.site_photos) + 1}",
            project_id=project_id,
            uploaded_by=user_id,
            location=photo_data.get("location", "Unknown"),
            description=photo_data.get("description", ""),
            photo_url=photo_data.get("photo_url", ""),
            thumbnail_url=photo_data.get("thumbnail_url", ""),
            gps_coordinates=photo_data.get("gps_coordinates"),
            taken_at=datetime.fromisoformat(photo_data.get("taken_at", datetime.now().isoformat())),
            uploaded_at=datetime.now(),
            tags=photo_data.get("tags", [])
        )
        
        self.site_photos.append(photo)
        
        return {
            "success": True,
            "photo_id": photo.photo_id,
            "message": "تم رفع الصورة بنجاح",
            "photo_url": photo.photo_url,
            "thumbnail_url": photo.thumbnail_url
        }
    
    def get_site_photos(
        self,
        project_id: int,
        location: Optional[str] = None,
        date: Optional[datetime] = None,
        tags: Optional[List[str]] = None
    ) -> Dict:
        """
        الحصول على صور الموقع
        
        Returns:
            قائمة الصور
        """
        photos = [p for p in self.site_photos if p.project_id == project_id]
        
        if location:
            photos = [p for p in photos if location.lower() in p.location.lower()]
        
        if date:
            photos = [p for p in photos if p.taken_at.date() == date.date()]
        
        if tags:
            photos = [p for p in photos if any(tag in p.tags for tag in tags)]
        
        return {
            "success": True,
            "count": len(photos),
            "photos": [
                {
                    "photo_id": p.photo_id,
                    "location": p.location,
                    "description": p.description,
                    "thumbnail_url": p.thumbnail_url,
                    "taken_at": p.taken_at.isoformat(),
                    "tags": p.tags
                }
                for p in photos
            ]
        }
    
    # ==================== Labor Attendance ====================
    
    def submit_attendance(
        self,
        project_id: int,
        supervisor_id: int,
        attendance_data: Dict
    ) -> Dict:
        """
        تقديم الحضور اليومي
        
        Args:
            project_id: معرّف المشروع
            supervisor_id: معرّف المشرف
            attendance_data: بيانات الحضور
        
        Returns:
            تأكيد التقديم
        """
        attendance_record = {
            "record_id": f"ATT-{datetime.now().strftime('%Y%m%d')}-{project_id}",
            "project_id": project_id,
            "supervisor_id": supervisor_id,
            "date": datetime.now().date().isoformat(),
            "attendance": attendance_data.get("attendance", []),
            "total_expected": attendance_data.get("total_expected", 0),
            "total_present": attendance_data.get("total_present", 0),
            "total_absent": attendance_data.get("total_absent", 0),
            "attendance_rate": attendance_data.get("attendance_rate", 0.0),
            "submitted_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "record_id": attendance_record["record_id"],
            "message": "تم تقديم الحضور بنجاح",
            "attendance_rate": attendance_record["attendance_rate"]
        }
    
    def get_attendance_history(
        self,
        project_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        الحصول على سجل الحضور
        
        Returns:
            سجل الحضور
        """
        # في التطبيق الفعلي، سيتم جلب البيانات من قاعدة البيانات
        return {
            "success": True,
            "project_id": project_id,
            "records": [
                {
                    "date": "2024-07-10",
                    "total_expected": 45,
                    "total_present": 43,
                    "attendance_rate": 95.6
                },
                {
                    "date": "2024-07-11",
                    "total_expected": 45,
                    "total_present": 44,
                    "attendance_rate": 97.8
                },
                {
                    "date": "2024-07-12",
                    "total_expected": 45,
                    "total_present": 42,
                    "attendance_rate": 93.3
                }
            ]
        }
    
    # ==================== Activity Progress ====================
    
    def update_activity_progress(
        self,
        activity_id: int,
        project_id: int,
        user_id: int,
        update_data: Dict
    ) -> Dict:
        """
        تحديث تقدم نشاط
        
        Args:
            activity_id: معرّف النشاط
            project_id: معرّف المشروع
            user_id: معرّف المستخدم
            update_data: بيانات التحديث
        
        Returns:
            تأكيد التحديث
        """
        update = ActivityUpdate(
            update_id=f"UPD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{activity_id}",
            activity_id=activity_id,
            project_id=project_id,
            updated_by=user_id,
            progress_percentage=update_data.get("progress_percentage", 0.0),
            crew_size=update_data.get("crew_size", 0),
            hours_worked=update_data.get("hours_worked", 0.0),
            issues_encountered=update_data.get("issues", []),
            photos=update_data.get("photos", []),
            notes=update_data.get("notes", ""),
            timestamp=datetime.now()
        )
        
        self.activity_updates.append(update)
        
        return {
            "success": True,
            "update_id": update.update_id,
            "message": "تم تحديث تقدم النشاط بنجاح",
            "progress_percentage": update.progress_percentage
        }
    
    def get_activity_updates(
        self,
        activity_id: int,
        limit: int = 10
    ) -> Dict:
        """
        الحصول على سجل تحديثات النشاط
        
        Returns:
            سجل التحديثات
        """
        updates = [u for u in self.activity_updates if u.activity_id == activity_id]
        updates.sort(key=lambda x: x.timestamp, reverse=True)
        updates = updates[:limit]
        
        return {
            "success": True,
            "activity_id": activity_id,
            "count": len(updates),
            "updates": [
                {
                    "update_id": u.update_id,
                    "progress_percentage": u.progress_percentage,
                    "crew_size": u.crew_size,
                    "hours_worked": u.hours_worked,
                    "timestamp": u.timestamp.isoformat()
                }
                for u in updates
            ]
        }
    
    # ==================== Material Requests ====================
    
    def submit_material_request(
        self,
        project_id: int,
        user_id: int,
        request_data: Dict
    ) -> Dict:
        """
        تقديم طلب مواد
        
        Args:
            project_id: معرّف المشروع
            user_id: معرّف المستخدم
            request_data: بيانات الطلب
        
        Returns:
            تأكيد الطلب
        """
        request = MaterialRequest(
            request_id=f"MR-{datetime.now().strftime('%Y%m%d')}-{len(self.material_requests) + 1:03d}",
            project_id=project_id,
            requested_by=user_id,
            material_name=request_data.get("material_name", ""),
            quantity=request_data.get("quantity", 0.0),
            unit=request_data.get("unit", ""),
            urgency=request_data.get("urgency", "normal"),
            required_date=datetime.fromisoformat(request_data.get("required_date", (datetime.now() + timedelta(days=7)).isoformat())),
            justification=request_data.get("justification", "")
        )
        
        self.material_requests.append(request)
        
        return {
            "success": True,
            "request_id": request.request_id,
            "message": "تم تقديم طلب المواد بنجاح",
            "status": request.status
        }
    
    def get_material_requests(
        self,
        project_id: int,
        status: Optional[str] = None
    ) -> Dict:
        """
        الحصول على طلبات المواد
        
        Returns:
            قائمة الطلبات
        """
        requests = [r for r in self.material_requests if r.project_id == project_id]
        
        if status:
            requests = [r for r in requests if r.status == status]
        
        return {
            "success": True,
            "count": len(requests),
            "requests": [
                {
                    "request_id": r.request_id,
                    "material_name": r.material_name,
                    "quantity": r.quantity,
                    "unit": r.unit,
                    "urgency": r.urgency,
                    "status": r.status,
                    "created_at": r.created_at.isoformat()
                }
                for r in requests
            ]
        }
    
    # ==================== Safety Observations ====================
    
    def log_safety_observation(
        self,
        project_id: int,
        user_id: int,
        observation_data: Dict
    ) -> Dict:
        """
        تسجيل ملاحظة سلامة
        
        Args:
            project_id: معرّف المشروع
            user_id: معرّف المستخدم
            observation_data: بيانات الملاحظة
        
        Returns:
            تأكيد التسجيل
        """
        observation = SafetyObservation(
            observation_id=f"SAFE-{datetime.now().strftime('%Y%m%d%H%M%S')}-{len(self.safety_observations) + 1}",
            project_id=project_id,
            observer_id=user_id,
            severity=observation_data.get("severity", "medium"),
            category=observation_data.get("category", "general"),
            description=observation_data.get("description", ""),
            location=observation_data.get("location", ""),
            photos=observation_data.get("photos", []),
            corrective_action=observation_data.get("corrective_action", ""),
            action_taken=observation_data.get("action_taken", False),
            observed_at=datetime.now()
        )
        
        self.safety_observations.append(observation)
        
        return {
            "success": True,
            "observation_id": observation.observation_id,
            "message": "تم تسجيل ملاحظة السلامة بنجاح",
            "severity": observation.severity
        }
    
    def get_safety_observations(
        self,
        project_id: int,
        severity: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict:
        """
        الحصول على ملاحظات السلامة
        
        Returns:
            قائمة الملاحظات
        """
        observations = [o for o in self.safety_observations if o.project_id == project_id]
        
        if severity:
            observations = [o for o in observations if o.severity == severity]
        
        if category:
            observations = [o for o in observations if o.category == category]
        
        return {
            "success": True,
            "count": len(observations),
            "observations": [
                {
                    "observation_id": o.observation_id,
                    "severity": o.severity,
                    "category": o.category,
                    "description": o.description,
                    "location": o.location,
                    "action_taken": o.action_taken,
                    "observed_at": o.observed_at.isoformat()
                }
                for o in observations
            ]
        }
    
    # ==================== Offline Sync ====================
    
    def queue_offline_data(self, data: Dict) -> Dict:
        """
        إضافة بيانات إلى قائمة الانتظار للمزامنة
        
        Args:
            data: البيانات المراد مزامنتها
        
        Returns:
            تأكيد الإضافة
        """
        queue_item = {
            "queue_id": f"QUEUE-{datetime.now().timestamp()}",
            "type": data.get("type", "unknown"),
            "data": data,
            "timestamp": datetime.now().isoformat(),
            "sync_attempts": 0,
            "status": "pending"
        }
        
        self.offline_queue.append(queue_item)
        
        return {
            "success": True,
            "queue_id": queue_item["queue_id"],
            "message": "تمت إضافة البيانات إلى قائمة المزامنة"
        }
    
    def sync_offline_data(self) -> Dict:
        """
        مزامنة البيانات المحفوظة في وضع عدم الاتصال
        
        Returns:
            نتيجة المزامنة
        """
        synced_count = 0
        failed_count = 0
        
        for item in self.offline_queue:
            if item["status"] == "pending":
                try:
                    # محاولة مزامنة البيانات
                    # في التطبيق الفعلي، سيتم معالجة كل نوع من البيانات
                    item["status"] = "synced"
                    item["sync_attempts"] += 1
                    synced_count += 1
                except Exception as e:
                    item["status"] = "failed"
                    item["sync_attempts"] += 1
                    failed_count += 1
        
        return {
            "success": True,
            "synced_count": synced_count,
            "failed_count": failed_count,
            "pending_count": len([i for i in self.offline_queue if i["status"] == "pending"]),
            "message": f"تمت مزامنة {synced_count} عنصر بنجاح"
        }
    
    # ==================== Dashboard Data ====================
    
    def get_mobile_dashboard(
        self,
        project_id: int,
        user_id: int
    ) -> Dict:
        """
        الحصول على بيانات لوحة التحكم الميدانية
        
        Returns:
            بيانات لوحة التحكم
        """
        return {
            "success": True,
            "project_id": project_id,
            "user_id": user_id,
            "dashboard": {
                "today_summary": {
                    "date": datetime.now().date().isoformat(),
                    "attendance_rate": 95.6,
                    "ongoing_activities": 8,
                    "completed_today": 2,
                    "photos_uploaded": 15,
                    "material_requests": 3,
                    "safety_observations": 1
                },
                "pending_tasks": [
                    {
                        "task_id": 1,
                        "title": "Submit daily report",
                        "priority": "high",
                        "due": "18:00"
                    },
                    {
                        "task_id": 2,
                        "title": "Update activity progress",
                        "priority": "medium",
                        "due": "16:00"
                    }
                ],
                "recent_activities": [
                    {
                        "activity": "Column Formwork - Level 5",
                        "progress": 75.0,
                        "status": "on_track"
                    },
                    {
                        "activity": "Slab Reinforcement - Level 4",
                        "progress": 60.0,
                        "status": "ahead"
                    }
                ],
                "alerts": [
                    {
                        "type": "warning",
                        "message": "Steel delivery delayed by 2 days"
                    }
                ]
            }
        }


# ==================== Example Usage ====================

if __name__ == "__main__":
    # إنشاء API
    mobile_api = MobileFieldAPI()
    
    # مثال 1: تسجيل الدخول
    print("=== User Login ===")
    login_result = mobile_api.login(
        username="ahmed.engineer",
        password="password123",
        device_id="DEVICE-123456"
    )
    print(f"Login successful: {login_result['success']}")
    print(f"User: {login_result['user']['full_name']}")
    print(f"Role: {login_result['user']['role']}")
    
    # مثال 2: تقديم تقرير يومي
    print("\n=== Submit Daily Report ===")
    report_data = {
        "report_date": datetime.now().isoformat(),
        "weather": {"condition": "Sunny", "temperature": 38},
        "activities_progress": [
            {"activity_id": 101, "progress": 15.0},
            {"activity_id": 102, "progress": 20.0}
        ],
        "labor_attendance": {"total": 45, "present": 43},
        "notes": "All activities on track"
    }
    
    report_result = mobile_api.submit_daily_report(
        project_id=1,
        engineer_id=1,
        report_data=report_data
    )
    print(f"Report submitted: {report_result['report_id']}")
    
    # مثال 3: رفع صورة
    print("\n=== Upload Photo ===")
    photo_data = {
        "location": "Grid A-D / Level 5",
        "description": "Column formwork installation",
        "photo_url": "/uploads/photo123.jpg",
        "thumbnail_url": "/uploads/thumb123.jpg",
        "taken_at": datetime.now().isoformat(),
        "tags": ["formwork", "level5", "columns"]
    }
    
    photo_result = mobile_api.upload_photo(
        project_id=1,
        user_id=1,
        photo_data=photo_data
    )
    print(f"Photo uploaded: {photo_result['photo_id']}")
    
    # مثال 4: طلب مواد
    print("\n=== Material Request ===")
    material_data = {
        "material_name": "Steel Reinforcement 16mm",
        "quantity": 2.5,
        "unit": "ton",
        "urgency": "urgent",
        "required_date": (datetime.now() + timedelta(days=2)).isoformat(),
        "justification": "Required for Level 6 slab"
    }
    
    material_result = mobile_api.submit_material_request(
        project_id=1,
        user_id=1,
        request_data=material_data
    )
    print(f"Material request submitted: {material_result['request_id']}")
