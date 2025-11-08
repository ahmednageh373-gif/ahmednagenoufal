"""
محرك المسار الحرج - Critical Path Method (CPM) Engine

يحسب:
1. Early Start (ES) - أبكر بداية
2. Early Finish (EF) - أبكر نهاية
3. Late Start (LS) - أخر بداية
4. Late Finish (LF) - أخر نهاية
5. Total Float (TF) - الفائض الكلي
6. Free Float (FF) - الفائض الحر
7. Critical Path - المسار الحرج

يدعم جميع أنواع الروابط:
- FS (Finish-to-Start)
- SS (Start-to-Start)
- FF (Finish-to-Finish)
- SF (Start-to-Finish)
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import sys
sys.path.append('/home/user/webapp')

from backend.data.activity_breakdown_rules import (
    LogicType, SubActivity, BOQBreakdown, LogicLink
)


@dataclass
class ScheduleActivity:
    """نشاط في الجدول الزمني مع معلومات CPM"""
    activity_id: str
    name: str
    duration: float  # بالأيام
    
    # CPM Calculations
    early_start: float = 0.0
    early_finish: float = 0.0
    late_start: float = 0.0
    late_finish: float = 0.0
    total_float: float = 0.0
    free_float: float = 0.0
    
    # Status
    is_critical: bool = False
    is_milestone: bool = False
    
    # Relationships
    predecessors: List[Tuple[str, LogicType, float]] = field(default_factory=list)  # (id, type, lag)
    successors: List[Tuple[str, LogicType, float]] = field(default_factory=list)
    
    # Resources
    crew_size: int = 0
    labor_hours_per_day: float = 0.0
    
    # Dates (calculated from project start)
    calendar_start: Optional[datetime] = None
    calendar_finish: Optional[datetime] = None
    
    def __str__(self) -> str:
        critical_flag = "🔴" if self.is_critical else "⚪"
        return f"{critical_flag} {self.activity_id}: ES={self.early_start:.1f}, EF={self.early_finish:.1f}, TF={self.total_float:.1f}"


class CPMEngine:
    """محرك المسار الحرج"""
    
    def __init__(self, project_start_date: datetime, working_days_per_week: int = 6):
        """
        تهيئة المحرك
        
        Args:
            project_start_date: تاريخ بداية المشروع
            working_days_per_week: أيام العمل في الأسبوع (الافتراضي 6)
        """
        self.project_start_date = project_start_date
        self.working_days_per_week = working_days_per_week
        self.activities: Dict[str, ScheduleActivity] = {}
        self.critical_path: List[str] = []
        self.project_duration: float = 0.0
    
    def add_activity(self, activity: ScheduleActivity):
        """إضافة نشاط للجدول"""
        self.activities[activity.activity_id] = activity
    
    def add_relationship(self, predecessor_id: str, successor_id: str, 
                        logic_type: LogicType, lag: float = 0.0):
        """
        إضافة علاقة منطقية بين نشاطين
        
        Args:
            predecessor_id: النشاط السابق
            successor_id: النشاط اللاحق
            logic_type: نوع العلاقة (FS, SS, FF, SF)
            lag: التأخير/التقديم بالأيام
        """
        if predecessor_id not in self.activities or successor_id not in self.activities:
            raise ValueError(f"Activity not found: {predecessor_id} or {successor_id}")
        
        # Add to predecessor's successors
        self.activities[predecessor_id].successors.append((successor_id, logic_type, lag))
        
        # Add to successor's predecessors
        self.activities[successor_id].predecessors.append((predecessor_id, logic_type, lag))
    
    def forward_pass(self):
        """
        المسار الأمامي (Forward Pass)
        يحسب Early Start و Early Finish لكل نشاط
        """
        # Find activities with no predecessors (start activities)
        start_activities = [aid for aid, act in self.activities.items() if not act.predecessors]
        
        if not start_activities:
            raise ValueError("No start activities found (all activities have predecessors - circular dependency?)")
        
        # Initialize start activities
        for aid in start_activities:
            self.activities[aid].early_start = 0.0
            self.activities[aid].early_finish = self.activities[aid].duration
        
        # Process all activities using topological sort
        visited = set()
        
        def process_activity(activity_id: str):
            if activity_id in visited:
                return
            
            activity = self.activities[activity_id]
            
            # Process all predecessors first
            for pred_id, logic_type, lag in activity.predecessors:
                process_activity(pred_id)
            
            # Calculate Early Start based on predecessors
            if activity.predecessors:
                early_start_candidates = []
                
                for pred_id, logic_type, lag in activity.predecessors:
                    pred = self.activities[pred_id]
                    
                    if logic_type == LogicType.FS:
                        # Finish-to-Start: يبدأ بعد انتهاء السابق
                        candidate = pred.early_finish + lag
                    elif logic_type == LogicType.SS:
                        # Start-to-Start: يبدأ مع بداية السابق
                        candidate = pred.early_start + lag
                    elif logic_type == LogicType.FF:
                        # Finish-to-Finish: ينتهي مع انتهاء السابق
                        candidate = pred.early_finish + lag - activity.duration
                    elif logic_type == LogicType.SF:
                        # Start-to-Finish: ينتهي عند بداية السابق (نادر)
                        candidate = pred.early_start + lag - activity.duration
                    else:
                        candidate = 0.0
                    
                    early_start_candidates.append(candidate)
                
                activity.early_start = max(early_start_candidates)
            
            activity.early_finish = activity.early_start + activity.duration
            visited.add(activity_id)
        
        # Process all activities
        for activity_id in self.activities:
            process_activity(activity_id)
        
        # Project duration = maximum EF
        self.project_duration = max(act.early_finish for act in self.activities.values())
    
    def backward_pass(self):
        """
        المسار الخلفي (Backward Pass)
        يحسب Late Start و Late Finish لكل نشاط
        """
        # Find activities with no successors (end activities)
        end_activities = [aid for aid, act in self.activities.items() if not act.successors]
        
        if not end_activities:
            raise ValueError("No end activities found (all activities have successors - circular dependency?)")
        
        # Initialize end activities
        for aid in end_activities:
            self.activities[aid].late_finish = self.project_duration
            self.activities[aid].late_start = self.activities[aid].late_finish - self.activities[aid].duration
        
        # Process all activities in reverse topological order
        visited = set()
        
        def process_activity(activity_id: str):
            if activity_id in visited:
                return
            
            activity = self.activities[activity_id]
            
            # Process all successors first
            for succ_id, logic_type, lag in activity.successors:
                process_activity(succ_id)
            
            # Calculate Late Finish based on successors
            if activity.successors:
                late_finish_candidates = []
                
                for succ_id, logic_type, lag in activity.successors:
                    succ = self.activities[succ_id]
                    
                    if logic_type == LogicType.FS:
                        # Finish-to-Start
                        candidate = succ.late_start - lag
                    elif logic_type == LogicType.SS:
                        # Start-to-Start
                        candidate = succ.late_start - lag + activity.duration
                    elif logic_type == LogicType.FF:
                        # Finish-to-Finish
                        candidate = succ.late_finish - lag
                    elif logic_type == LogicType.SF:
                        # Start-to-Finish
                        candidate = succ.late_finish - lag + activity.duration
                    else:
                        candidate = self.project_duration
                    
                    late_finish_candidates.append(candidate)
                
                activity.late_finish = min(late_finish_candidates)
            
            activity.late_start = activity.late_finish - activity.duration
            visited.add(activity_id)
        
        # Process all activities in reverse
        for activity_id in reversed(list(self.activities.keys())):
            process_activity(activity_id)
    
    def calculate_float(self):
        """حساب الفائض الكلي والحر"""
        for activity_id, activity in self.activities.items():
            # Total Float = LS - ES (أو LF - EF)
            activity.total_float = activity.late_start - activity.early_start
            
            # Free Float = أقل ES للأنشطة التالية - EF الحالي
            if activity.successors:
                min_successor_es = min(
                    self.activities[succ_id].early_start 
                    for succ_id, _, _ in activity.successors
                )
                activity.free_float = min_successor_es - activity.early_finish
            else:
                activity.free_float = activity.total_float
            
            # Critical if Total Float ≈ 0
            activity.is_critical = abs(activity.total_float) < 0.01
    
    def find_critical_path(self) -> List[str]:
        """
        استخراج المسار الحرج
        Returns: قائمة بأكواد الأنشطة الحرجة مرتبة
        """
        critical_activities = [
            aid for aid, act in self.activities.items() 
            if act.is_critical
        ]
        
        # Sort by Early Start
        critical_activities.sort(key=lambda aid: self.activities[aid].early_start)
        
        self.critical_path = critical_activities
        return critical_activities
    
    def calculate_calendar_dates(self):
        """حساب التواريخ الميلادية لكل نشاط"""
        for activity in self.activities.values():
            activity.calendar_start = self._add_working_days(
                self.project_start_date, 
                int(activity.early_start)
            )
            activity.calendar_finish = self._add_working_days(
                self.project_start_date, 
                int(activity.early_finish)
            )
    
    def _add_working_days(self, start_date: datetime, days: int) -> datetime:
        """إضافة أيام عمل (تخطي الجمعة إذا كان 6 أيام عمل)"""
        current_date = start_date
        days_added = 0
        
        while days_added < days:
            current_date += timedelta(days=1)
            # Skip Friday if working 6 days/week
            if self.working_days_per_week == 6 and current_date.weekday() == 4:  # Friday
                continue
            days_added += 1
        
        return current_date
    
    def run_cpm(self):
        """تشغيل CPM الكامل"""
        print("🔄 Running Forward Pass...")
        self.forward_pass()
        
        print("🔄 Running Backward Pass...")
        self.backward_pass()
        
        print("🔄 Calculating Float...")
        self.calculate_float()
        
        print("🔄 Finding Critical Path...")
        self.find_critical_path()
        
        print("🔄 Calculating Calendar Dates...")
        self.calculate_calendar_dates()
        
        print(f"✅ CPM Complete! Project Duration: {self.project_duration:.1f} days")
        print(f"✅ Critical Activities: {len(self.critical_path)}/{len(self.activities)}")
    
    def get_summary(self) -> Dict:
        """ملخص المشروع"""
        total_activities = len(self.activities)
        critical_count = len(self.critical_path)
        
        return {
            'project_duration_days': self.project_duration,
            'project_duration_weeks': self.project_duration / 7,
            'project_start': self.project_start_date.strftime('%Y-%m-%d'),
            'project_finish': self._add_working_days(
                self.project_start_date, 
                int(self.project_duration)
            ).strftime('%Y-%m-%d'),
            'total_activities': total_activities,
            'critical_activities': critical_count,
            'criticality_percentage': (critical_count / total_activities * 100) if total_activities > 0 else 0,
            'working_days_per_week': self.working_days_per_week
        }
    
    def print_schedule(self):
        """طباعة الجدول الزمني"""
        print("\n" + "=" * 120)
        print("📊 الجدول الزمني - PROJECT SCHEDULE")
        print("=" * 120)
        print(f"{'رمز النشاط':<25} {'ES':>6} {'EF':>6} {'LS':>6} {'LF':>6} {'TF':>6} {'FF':>6} {'حرج':>6}")
        print("-" * 120)
        
        # Sort by Early Start
        sorted_activities = sorted(
            self.activities.values(), 
            key=lambda a: a.early_start
        )
        
        for activity in sorted_activities:
            critical_marker = "🔴" if activity.is_critical else "  "
            print(f"{activity.activity_id:<25} "
                  f"{activity.early_start:>6.1f} "
                  f"{activity.early_finish:>6.1f} "
                  f"{activity.late_start:>6.1f} "
                  f"{activity.late_finish:>6.1f} "
                  f"{activity.total_float:>6.1f} "
                  f"{activity.free_float:>6.1f} "
                  f"{critical_marker:>6}")
        
        print("=" * 120)
        
        # Summary
        summary = self.get_summary()
        print(f"\n📈 ملخص المشروع:")
        print(f"   المدة الإجمالية: {summary['project_duration_days']:.1f} يوم ({summary['project_duration_weeks']:.1f} أسبوع)")
        print(f"   تاريخ البداية: {summary['project_start']}")
        print(f"   تاريخ الانتهاء: {summary['project_finish']}")
        print(f"   إجمالي الأنشطة: {summary['total_activities']}")
        print(f"   الأنشطة الحرجة: {summary['critical_activities']} ({summary['criticality_percentage']:.1f}%)")
        print(f"   أيام العمل: {summary['working_days_per_week']} يوم/أسبوع")


def build_schedule_from_boq(boq_breakdown: BOQBreakdown, 
                            project_start_date: datetime,
                            shifts: int = 1) -> CPMEngine:
    """
    بناء جدول زمني من تفكيك المقايسة
    
    Args:
        boq_breakdown: تفكيك بند المقايسة
        project_start_date: تاريخ بداية المشروع
        shifts: عدد الورديات (1, 2, أو 3)
    
    Returns:
        CPMEngine مع الجدول الزمني المحسوب
    """
    cpm = CPMEngine(project_start_date)
    
    # Add all sub-activities
    for sub_activity in boq_breakdown.sub_activities:
        # Calculate quantity based on unit
        if sub_activity.unit == "LS":
            quantity = 1.0
        elif "CONC-SLAB" in sub_activity.code:
            if sub_activity.unit == "م³":
                quantity = 100.0
            elif sub_activity.unit == "م²":
                quantity = 160.0
            elif sub_activity.unit == "طن":
                quantity = 11.0
            else:
                quantity = 1.0
        elif "PLAST" in sub_activity.code:
            quantity = 200.0 if sub_activity.unit == "م²" else (80.0 if sub_activity.unit == "م" else 1.0)
        elif "TILE" in sub_activity.code:
            quantity = 1200.0 if sub_activity.unit == "م²" else (480.0 if sub_activity.unit == "م" else 1.0)
        elif "FENCE" in sub_activity.code:
            if sub_activity.unit == "م³":
                quantity = 3.0
            elif sub_activity.unit == "No":
                quantity = 34.0 if "عمدان" in sub_activity.name_ar else 1.0
            elif sub_activity.unit == "م":
                quantity = 100.0
            elif sub_activity.unit == "م²":
                quantity = 200.0
            else:
                quantity = 1.0
        else:
            quantity = boq_breakdown.total_quantity
        
        # Calculate duration
        duration = sub_activity.calculate_final_duration(quantity, shifts)
        
        # Create schedule activity
        schedule_activity = ScheduleActivity(
            activity_id=sub_activity.code,
            name=sub_activity.name_ar,
            duration=duration,
            crew_size=sub_activity.productivity.crew.total_workers,
            labor_hours_per_day=sub_activity.productivity.crew.total_workers * 8
        )
        
        cpm.add_activity(schedule_activity)
    
    # Add relationships
    for sub_activity in boq_breakdown.sub_activities:
        for logic_link in sub_activity.logic_links:
            cpm.add_relationship(
                predecessor_id=logic_link.predecessor,
                successor_id=sub_activity.code,
                logic_type=logic_link.logic_type,
                lag=logic_link.lag_days
            )
    
    # Run CPM
    cpm.run_cpm()
    
    return cpm


# ═══════════════════════════════════════════════════════════════
# اختبار سريع
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    from backend.data.activity_breakdown_rules import CONCRETE_SLAB_100M3, TILES_1200M2
    
    print("=" * 120)
    print("🏗️  اختبار محرك CPM - Testing CPM Engine")
    print("=" * 120)
    
    # Test 1: Concrete Slab
    print("\n📦 Test 1: خرسانة بلاطة 100 م³")
    print("-" * 120)
    
    cpm1 = build_schedule_from_boq(
        boq_breakdown=CONCRETE_SLAB_100M3,
        project_start_date=datetime(2025, 1, 1),
        shifts=1
    )
    
    cpm1.print_schedule()
    
    print("\n🔴 المسار الحرج:")
    for activity_id in cpm1.critical_path:
        activity = cpm1.activities[activity_id]
        print(f"   • {activity_id}: {activity.name} ({activity.duration:.1f} يوم)")
    
    # Test 2: Tiles
    print("\n\n📦 Test 2: بلاط بورسلان 1,200 م²")
    print("-" * 120)
    
    cpm2 = build_schedule_from_boq(
        boq_breakdown=TILES_1200M2,
        project_start_date=datetime(2025, 2, 1),
        shifts=1
    )
    
    cpm2.print_schedule()
    
    print("\n🔴 المسار الحرج:")
    for activity_id in cpm2.critical_path:
        activity = cpm2.activities[activity_id]
        print(f"   • {activity_id}: {activity.name} ({activity.duration:.1f} يوم)")
