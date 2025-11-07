"""
موازنة الموارد - Resource Leveling

يحلل الحمل العمالي ويوازن توزيع العمالة لتجنب:
1. الذروات العالية (Peaks)
2. التقلبات الحادة في عدد العمال
3. تجاوز الطاقة الاستيعابية للموقع

الخطوات:
1. حساب الحمل اليومي لكل نشاط
2. رسم Histogram للعمالة
3. تحديد المشاكل (Peak > 120% of Average)
4. تطبيق استراتيجيات التوازن:
   - تأخير الأنشطة غير الحرجة (Using Float)
   - تقسيم الأنشطة الكبيرة
   - زيادة عدد الورديات
"""

from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import math

import sys
sys.path.append('/home/user/webapp')

from backend.scheduling.cpm_engine import CPMEngine, ScheduleActivity


@dataclass
class DailyResource:
    """الموارد اليومية"""
    day: int
    date: datetime
    total_workers: int = 0
    activities_running: List[str] = field(default_factory=list)
    labor_hours: float = 0.0


@dataclass
class ResourceHistogram:
    """مخطط توزيع الموارد"""
    daily_resources: Dict[int, DailyResource]  # day -> DailyResource
    peak_workers: int = 0
    peak_day: int = 0
    average_workers: float = 0.0
    min_workers: int = 0
    peak_ratio: float = 0.0  # Peak / Average
    
    def is_balanced(self, threshold: float = 1.20) -> bool:
        """هل التوزيع متوازن؟ (Peak ≤ threshold × Average)"""
        return self.peak_ratio <= threshold
    
    def get_summary(self) -> Dict:
        """ملخص التوزيع"""
        return {
            'peak_workers': self.peak_workers,
            'peak_day': self.peak_day,
            'average_workers': self.average_workers,
            'min_workers': self.min_workers,
            'peak_ratio': self.peak_ratio,
            'is_balanced': self.is_balanced(),
            'total_days': len(self.daily_resources),
            'working_days': sum(1 for dr in self.daily_resources.values() if dr.total_workers > 0)
        }


@dataclass
class SiteCapacity:
    """الطاقة الاستيعابية للموقع"""
    max_workers: int              # الحد الأقصى للعمال
    max_beds: int                 # عدد الأسِرّة
    max_meals: int                # عدد وجبات الطعام
    max_buses: int                # عدد الحافلات
    workspace_area_m2: float      # مساحة العمل (م²)
    
    def can_accommodate(self, workers: int) -> bool:
        """هل يمكن استيعاب هذا العدد من العمال؟"""
        return (workers <= self.max_workers and
                workers <= self.max_beds and
                workers <= self.max_meals and
                workers <= self.max_buses * 50)  # 50 عامل/حافلة


class ResourceLeveler:
    """موازن الموارد"""
    
    def __init__(self, cpm_engine: CPMEngine, site_capacity: Optional[SiteCapacity] = None):
        """
        تهيئة الموازن
        
        Args:
            cpm_engine: محرك CPM المحسوب
            site_capacity: الطاقة الاستيعابية للموقع (اختياري)
        """
        self.cpm = cpm_engine
        self.site_capacity = site_capacity
        self.original_histogram: Optional[ResourceHistogram] = None
        self.leveled_histogram: Optional[ResourceHistogram] = None
    
    def calculate_histogram(self, use_late_start: bool = False) -> ResourceHistogram:
        """
        حساب مخطط توزيع الموارد
        
        Args:
            use_late_start: استخدام Late Start بدلاً من Early Start (للموازنة)
        
        Returns:
            ResourceHistogram
        """
        # Initialize daily resources
        max_day = int(math.ceil(self.cpm.project_duration)) + 1
        daily_resources: Dict[int, DailyResource] = {}
        
        for day in range(max_day):
            date = self.cpm._add_working_days(self.cpm.project_start_date, day)
            daily_resources[day] = DailyResource(day=day, date=date)
        
        # Calculate resources for each activity
        for activity_id, activity in self.cpm.activities.items():
            start_day = int(activity.late_start if use_late_start else activity.early_start)
            end_day = int(math.ceil(activity.late_finish if use_late_start else activity.early_finish))
            
            for day in range(start_day, end_day):
                if day in daily_resources:
                    daily_resources[day].total_workers += activity.crew_size
                    daily_resources[day].labor_hours += activity.labor_hours_per_day
                    daily_resources[day].activities_running.append(activity_id)
        
        # Calculate statistics
        total_workers_all_days = sum(dr.total_workers for dr in daily_resources.values())
        working_days = sum(1 for dr in daily_resources.values() if dr.total_workers > 0)
        
        average_workers = total_workers_all_days / working_days if working_days > 0 else 0
        peak_workers = max((dr.total_workers for dr in daily_resources.values()), default=0)
        peak_day = max(daily_resources.keys(), key=lambda d: daily_resources[d].total_workers, default=0)
        min_workers = min((dr.total_workers for dr in daily_resources.values() if dr.total_workers > 0), default=0)
        
        peak_ratio = peak_workers / average_workers if average_workers > 0 else 0
        
        histogram = ResourceHistogram(
            daily_resources=daily_resources,
            peak_workers=peak_workers,
            peak_day=peak_day,
            average_workers=average_workers,
            min_workers=min_workers,
            peak_ratio=peak_ratio
        )
        
        return histogram
    
    def analyze_original(self) -> ResourceHistogram:
        """تحليل التوزيع الأصلي (Early Start)"""
        self.original_histogram = self.calculate_histogram(use_late_start=False)
        return self.original_histogram
    
    def level_resources(self, target_peak_ratio: float = 1.20) -> ResourceHistogram:
        """
        موازنة الموارد
        
        الاستراتيجية:
        1. تأخير الأنشطة غير الحرجة (استخدام Float)
        2. تقسيم الأنشطة الكبيرة
        3. التوصية بزيادة الورديات
        
        Args:
            target_peak_ratio: النسبة المستهدفة (Peak / Average)
        
        Returns:
            ResourceHistogram بعد الموازنة
        """
        # Start with Late Start schedule (maximizes float usage)
        self.leveled_histogram = self.calculate_histogram(use_late_start=True)
        
        # Check if already balanced
        if self.leveled_histogram.is_balanced(target_peak_ratio):
            return self.leveled_histogram
        
        # TODO: Advanced leveling strategies
        # For now, return Late Start schedule
        return self.leveled_histogram
    
    def check_capacity_violations(self) -> List[Tuple[int, int, int]]:
        """
        فحص تجاوزات الطاقة الاستيعابية
        
        Returns:
            قائمة (day, required_workers, max_capacity)
        """
        if not self.site_capacity or not self.original_histogram:
            return []
        
        violations = []
        for day, dr in self.original_histogram.daily_resources.items():
            if dr.total_workers > self.site_capacity.max_workers:
                violations.append((day, dr.total_workers, self.site_capacity.max_workers))
        
        return violations
    
    def suggest_shifts(self, activity_id: str) -> Dict[int, Tuple[float, int]]:
        """
        اقتراح عدد الورديات لتقليل الحمل
        
        Args:
            activity_id: رمز النشاط
        
        Returns:
            {shifts: (new_duration, new_crew_size)}
        """
        activity = self.cpm.activities.get(activity_id)
        if not activity:
            return {}
        
        suggestions = {}
        
        # 1 shift (current)
        suggestions[1] = (activity.duration, activity.crew_size)
        
        # 2 shifts (معامل 0.6)
        new_duration_2 = activity.duration * 0.6
        new_crew_2 = activity.crew_size * 2
        suggestions[2] = (new_duration_2, new_crew_2)
        
        # 3 shifts (معامل 0.45)
        new_duration_3 = activity.duration * 0.45
        new_crew_3 = activity.crew_size * 3
        suggestions[3] = (new_duration_3, new_crew_3)
        
        return suggestions
    
    def print_histogram(self, histogram: ResourceHistogram, title: str = "Histogram"):
        """طباعة المخطط"""
        print(f"\n{'=' * 100}")
        print(f"📊 {title}")
        print(f"{'=' * 100}")
        
        # Print summary first
        summary = histogram.get_summary()
        print(f"📈 الملخص:")
        print(f"   الذروة: {summary['peak_workers']} عامل (اليوم {summary['peak_day']})")
        print(f"   المتوسط: {summary['average_workers']:.1f} عامل")
        print(f"   الحد الأدنى: {summary['min_workers']} عامل")
        print(f"   نسبة الذروة: {summary['peak_ratio']:.2f} ({summary['peak_ratio']*100:.1f}%)")
        print(f"   متوازن: {'✅ نعم' if summary['is_balanced'] else '❌ لا (> 120%)'}")
        print(f"   أيام العمل: {summary['working_days']}/{summary['total_days']}")
        
        # Print daily breakdown (sample)
        print(f"\n📅 التفصيل اليومي (أول 30 يوم):")
        print(f"{'اليوم':>6} {'التاريخ':<12} {'العمال':>8} {'ساعات':>10} {'الأنشطة':<50}")
        print("-" * 100)
        
        for day in sorted(histogram.daily_resources.keys())[:30]:
            dr = histogram.daily_resources[day]
            if dr.total_workers > 0:
                activities_str = ', '.join(dr.activities_running[:3])
                if len(dr.activities_running) > 3:
                    activities_str += f" +{len(dr.activities_running) - 3} more"
                
                # Bar chart
                bar_length = int(dr.total_workers / histogram.peak_workers * 40)
                bar = "█" * bar_length
                
                print(f"{dr.day:>6} {dr.date.strftime('%Y-%m-%d'):<12} "
                      f"{dr.total_workers:>8} {dr.labor_hours:>10.1f} "
                      f"{bar:<40} {activities_str[:50]}")
        
        print("=" * 100)
    
    def export_csv(self, histogram: ResourceHistogram, filename: str):
        """تصدير إلى CSV"""
        import csv
        
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['Day', 'Date', 'Workers', 'Labor Hours', 'Activities Running', 'Activity Codes'])
            
            for day in sorted(histogram.daily_resources.keys()):
                dr = histogram.daily_resources[day]
                if dr.total_workers > 0:
                    writer.writerow([
                        dr.day,
                        dr.date.strftime('%Y-%m-%d'),
                        dr.total_workers,
                        f"{dr.labor_hours:.1f}",
                        len(dr.activities_running),
                        ', '.join(dr.activities_running)
                    ])
        
        print(f"✅ تم تصدير CSV: {filename}")


# ═══════════════════════════════════════════════════════════════
# اختبار سريع
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    from backend.data.activity_breakdown_rules import CONCRETE_SLAB_100M3
    from backend.scheduling.cpm_engine import build_schedule_from_boq
    
    print("=" * 100)
    print("🏗️  اختبار موازنة الموارد - Resource Leveling Test")
    print("=" * 100)
    
    # Build schedule
    cpm = build_schedule_from_boq(
        boq_breakdown=CONCRETE_SLAB_100M3,
        project_start_date=datetime(2025, 1, 1),
        shifts=1
    )
    
    # Define site capacity
    site_capacity = SiteCapacity(
        max_workers=50,
        max_beds=60,
        max_meals=100,
        max_buses=2,
        workspace_area_m2=5000.0
    )
    
    # Create leveler
    leveler = ResourceLeveler(cpm, site_capacity)
    
    # Analyze original
    print("\n📊 التوزيع الأصلي (Early Start):")
    original = leveler.analyze_original()
    leveler.print_histogram(original, "التوزيع الأصلي - Early Start Schedule")
    
    # Check capacity violations
    violations = leveler.check_capacity_violations()
    if violations:
        print(f"\n⚠️  تجاوزات الطاقة الاستيعابية:")
        for day, required, capacity in violations:
            print(f"   اليوم {day}: مطلوب {required} عامل، المتاح {capacity}")
    else:
        print(f"\n✅ لا توجد تجاوزات للطاقة الاستيعابية (الحد الأقصى: {site_capacity.max_workers} عامل)")
    
    # Level resources
    print("\n📊 التوزيع بعد الموازنة (Late Start):")
    leveled = leveler.level_resources(target_peak_ratio=1.20)
    leveler.print_histogram(leveled, "التوزيع بعد الموازنة - Late Start Schedule")
    
    # Shift suggestions
    print("\n💡 اقتراحات الورديات لتقليل الذروة:")
    for activity_id in cpm.critical_path[:3]:  # أول 3 أنشطة حرجة
        activity = cpm.activities[activity_id]
        suggestions = leveler.suggest_shifts(activity_id)
        
        print(f"\n   {activity_id}: {activity.name}")
        print(f"   {'ورديات':<10} {'المدة (يوم)':<15} {'الطاقم':<15} {'التأثير':<30}")
        print(f"   {'-' * 70}")
        
        for shifts, (duration, crew) in suggestions.items():
            impact = ""
            if shifts == 1:
                impact = "الحالي"
            elif shifts == 2:
                impact = f"وفر {activity.duration - duration:.1f} يوم، لكن +{crew - activity.crew_size} عامل"
            elif shifts == 3:
                impact = f"وفر {activity.duration - duration:.1f} يوم، لكن +{crew - activity.crew_size} عامل"
            
            print(f"   {shifts:<10} {duration:<15.1f} {crew:<15} {impact:<30}")
    
    # Export
    output_file = "/home/user/webapp/backend/data/schedules/resource_histogram.csv"
    leveler.export_csv(original, output_file)
