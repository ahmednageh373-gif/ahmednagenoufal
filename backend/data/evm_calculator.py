"""
حاسبة القيمة المكتسبة (Earned Value Management - EVM Calculator)
يحسب جميع مؤشرات EVM بناءً على بيانات المشروع

تاريخ الإنشاء: 2025-11-09
الإصدار: 1.0
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum


class PerformanceStatus(Enum):
    """حالة الأداء"""
    EXCELLENT = "excellent"   # > 1.1
    GOOD = "good"             # 1.0 - 1.1
    WARNING = "warning"       # 0.9 - 1.0
    CRITICAL = "critical"     # < 0.9


@dataclass
class EVMActivity:
    """نشاط واحد مع بيانات EVM"""
    code: str
    name_ar: str
    name_en: str
    unit: str
    quantity: float
    unit_price: float           # سعر الوحدة (ريال)
    total_cost: float           # التكلفة الإجمالية (ريال)
    weight_percent: float       # الوزن النسبي (%)
    duration_days: float        # المدة (أيام)
    
    # بيانات التقدم
    physical_percent: float = 0.0      # نسبة الإنجاز الفعلية (%)
    actual_cost: float = 0.0           # التكلفة الفعلية (ريال)
    
    # مؤشرات محسوبة (تملأ تلقائياً)
    planned_value: float = 0.0         # PV
    earned_value: float = 0.0          # EV
    cost_variance: float = 0.0         # CV = EV - AC
    schedule_variance: float = 0.0     # SV = EV - PV
    cost_performance_index: float = 0.0     # CPI = EV / AC
    schedule_performance_index: float = 0.0 # SPI = EV / PV


@dataclass
class EVMProjectSnapshot:
    """لقطة EVM للمشروع في وقت محدد"""
    project_name: str
    snapshot_date: str
    current_day: int            # اليوم الحالي
    total_duration: int         # المدة الإجمالية (أيام)
    total_budget: float         # الميزانية الإجمالية (ريال)
    
    activities: List[EVMActivity] = field(default_factory=list)
    
    # إجماليات محسوبة
    total_pv: float = 0.0
    total_ev: float = 0.0
    total_ac: float = 0.0
    total_cv: float = 0.0
    total_sv: float = 0.0
    project_cpi: float = 0.0
    project_spi: float = 0.0
    
    # توقعات
    estimate_at_completion: float = 0.0      # EAC
    estimate_to_complete: float = 0.0        # ETC
    variance_at_completion: float = 0.0      # VAC
    
    def calculate_all(self):
        """حساب جميع المؤشرات"""
        self._calculate_activity_metrics()
        self._calculate_project_totals()
        self._calculate_forecasts()
    
    def _calculate_activity_metrics(self):
        """حساب مؤشرات كل نشاط"""
        time_progress_ratio = self.current_day / self.total_duration
        
        for activity in self.activities:
            # PV = Weight % × السعر الإجمالي × (الأيام الحالية ÷ الأيام الكلية)
            activity.planned_value = (
                activity.weight_percent / 100.0
            ) * self.total_budget * time_progress_ratio
            
            # EV = Weight % × السعر الإجمالي × Physical %
            activity.earned_value = (
                activity.weight_percent / 100.0
            ) * self.total_budget * (activity.physical_percent / 100.0)
            
            # CV = EV - AC
            activity.cost_variance = activity.earned_value - activity.actual_cost
            
            # SV = EV - PV
            activity.schedule_variance = activity.earned_value - activity.planned_value
            
            # CPI = EV / AC
            activity.cost_performance_index = (
                activity.earned_value / activity.actual_cost
                if activity.actual_cost > 0 else 0.0
            )
            
            # SPI = EV / PV
            activity.schedule_performance_index = (
                activity.earned_value / activity.planned_value
                if activity.planned_value > 0 else 0.0
            )
    
    def _calculate_project_totals(self):
        """حساب إجماليات المشروع"""
        self.total_pv = sum(a.planned_value for a in self.activities)
        self.total_ev = sum(a.earned_value for a in self.activities)
        self.total_ac = sum(a.actual_cost for a in self.activities)
        
        self.total_cv = self.total_ev - self.total_ac
        self.total_sv = self.total_ev - self.total_pv
        
        self.project_cpi = (
            self.total_ev / self.total_ac
            if self.total_ac > 0 else 0.0
        )
        
        self.project_spi = (
            self.total_ev / self.total_pv
            if self.total_pv > 0 else 0.0
        )
    
    def _calculate_forecasts(self):
        """حساب التوقعات"""
        # EAC = Budget / CPI
        self.estimate_at_completion = (
            self.total_budget / self.project_cpi
            if self.project_cpi > 0 else self.total_budget
        )
        
        # ETC = EAC - AC
        self.estimate_to_complete = self.estimate_at_completion - self.total_ac
        
        # VAC = BAC - EAC
        self.variance_at_completion = self.total_budget - self.estimate_at_completion
    
    def get_performance_status(self, index: float) -> PerformanceStatus:
        """تحديد حالة الأداء من المؤشر"""
        if index > 1.1:
            return PerformanceStatus.EXCELLENT
        elif index >= 1.0:
            return PerformanceStatus.GOOD
        elif index >= 0.9:
            return PerformanceStatus.WARNING
        else:
            return PerformanceStatus.CRITICAL
    
    def get_detailed_report(self) -> str:
        """تقرير نصي مفصل"""
        lines = []
        lines.append("=" * 80)
        lines.append(f"📊 تقرير القيمة المكتسبة (Earned Value Report)")
        lines.append("=" * 80)
        lines.append(f"المشروع: {self.project_name}")
        lines.append(f"التاريخ: {self.snapshot_date}")
        lines.append(f"اليوم {self.current_day} من {self.total_duration} ({self.current_day/self.total_duration*100:.1f}%)")
        lines.append("=" * 80)
        
        lines.append("\n📈 القيم الرئيسية:")
        lines.append(f"   Budget at Completion (BAC): {self.total_budget:,.0f} ريال")
        lines.append(f"   Planned Value (PV):         {self.total_pv:,.0f} ريال ({self.total_pv/self.total_budget*100:.1f}%)")
        lines.append(f"   Earned Value (EV):          {self.total_ev:,.0f} ريال ({self.total_ev/self.total_budget*100:.1f}%)")
        lines.append(f"   Actual Cost (AC):           {self.total_ac:,.0f} ريال ({self.total_ac/self.total_budget*100:.1f}%)")
        
        lines.append("\n📊 المؤشرات:")
        cpi_status = "✅" if self.project_cpi >= 1.0 else ("⚠️" if self.project_cpi >= 0.9 else "🚨")
        spi_status = "✅" if self.project_spi >= 1.0 else ("⚠️" if self.project_spi >= 0.9 else "🚨")
        
        lines.append(f"   Cost Performance Index (CPI):      {self.project_cpi:.2f} {cpi_status}")
        lines.append(f"   Schedule Performance Index (SPI):  {self.project_spi:.2f} {spi_status}")
        lines.append(f"   ")
        lines.append(f"   Cost Variance (CV):           {self.total_cv:+,.0f} ريال")
        lines.append(f"   Schedule Variance (SV):       {self.total_sv:+,.0f} ريال")
        
        lines.append("\n💰 التوقعات:")
        lines.append(f"   Estimate at Completion (EAC):  {self.estimate_at_completion:,.0f} ريال")
        lines.append(f"   Estimate to Complete (ETC):    {self.estimate_to_complete:,.0f} ريال")
        lines.append(f"   Variance at Completion (VAC):  {self.variance_at_completion:+,.0f} ريال")
        
        lines.append("\n⏰ توقع الإنهاء:")
        planned_end = self.total_duration
        predicted_end = self.total_duration / self.project_spi if self.project_spi > 0 else self.total_duration
        lines.append(f"   المخطط: يوم {planned_end}")
        lines.append(f"   المتوقع: يوم {predicted_end:.0f} ({'تأخير' if predicted_end > planned_end else 'تقدم'} {abs(predicted_end - planned_end):.0f} يوم)")
        
        lines.append("\n🎯 التوصيات:")
        if self.project_cpi < 0.9:
            lines.append("   1. 🚨 تجاوز حرج في التكلفة - مراجعة عاجلة للأسعار")
            lines.append("   2. البحث عن بدائل أرخص")
            lines.append("   3. تقليل الهدر")
            lines.append("   4. طلب Variation Order من العميل")
        elif self.project_cpi < 1.0:
            lines.append("   1. ⚠️ زيادة في التكلفة - مراقبة دقيقة")
            lines.append("   2. مراجعة أسعار الموردين")
        else:
            lines.append("   1. ✅ أداء تكلفة ممتاز - استمر!")
            lines.append("   2. وثق الممارسات الجيدة")
        
        if self.project_spi < 0.9:
            lines.append("   3. 🚨 تأخير حرج - إجراءات فورية")
            lines.append("   4. زيادة عدد الورديات")
            lines.append("   5. زيادة حجم الطاقم")
        elif self.project_spi < 1.0:
            lines.append("   3. ⚠️ تأخير طفيف - تسريع المسار الحرج")
        else:
            lines.append("   3. ✅ أداء جدولة ممتاز - استمر!")
        
        lines.append("=" * 80)
        
        return "\n".join(lines)
    
    def get_activity_table(self) -> str:
        """جدول تفصيلي للأنشطة"""
        lines = []
        lines.append("\n" + "=" * 120)
        lines.append("📋 تفاصيل الأنشطة:")
        lines.append("=" * 120)
        lines.append(f"{'النشاط':<30} | {'Weight%':>7} | {'PV':>12} | {'AC':>12} | {'Phys%':>6} | {'EV':>12} | {'SPI':>6} | {'CPI':>6}")
        lines.append("-" * 120)
        
        for activity in self.activities:
            spi_indicator = "✅" if activity.schedule_performance_index >= 1.0 else "🚨"
            cpi_indicator = "✅" if activity.cost_performance_index >= 1.0 else "🚨"
            
            lines.append(
                f"{activity.name_ar:<30} | "
                f"{activity.weight_percent:>6.1f}% | "
                f"{activity.planned_value:>12,.0f} | "
                f"{activity.actual_cost:>12,.0f} | "
                f"{activity.physical_percent:>5.0f}% | "
                f"{activity.earned_value:>12,.0f} | "
                f"{activity.schedule_performance_index:>5.2f} {spi_indicator} | "
                f"{activity.cost_performance_index:>5.2f} {cpi_indicator}"
            )
        
        lines.append("-" * 120)
        lines.append(
            f"{'الإجمالي':<30} | "
            f"{'100.0%':>7} | "
            f"{self.total_pv:>12,.0f} | "
            f"{self.total_ac:>12,.0f} | "
            f"{'—':>6} | "
            f"{self.total_ev:>12,.0f} | "
            f"{self.project_spi:>5.2f} {'✅' if self.project_spi >= 1.0 else '🚨'} | "
            f"{self.project_cpi:>5.2f} {'✅' if self.project_cpi >= 1.0 else '🚨'}"
        )
        lines.append("=" * 120)
        
        return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════
# مثال عملي: بلاط بورسلين 1,200 م² - 180,000 ريال
# ═══════════════════════════════════════════════════════════════

def create_tile_project_example() -> EVMProjectSnapshot:
    """إنشاء مثال مشروع بلاط بورسلين كما في المستند"""
    
    project = EVMProjectSnapshot(
        project_name="بلاط بورسلين 60×60 سم - داخلي",
        snapshot_date="2025-01-20",
        current_day=20,
        total_duration=61.5,
        total_budget=180000.0
    )
    
    # النشاط 1: فرشة أسمنتية
    project.activities.append(EVMActivity(
        code="TILE-001-B",
        name_ar="فرشة أسمنتية",
        name_en="Cement Screed",
        unit="م²",
        quantity=1200.0,
        unit_price=12.0,
        total_cost=14400.0,
        weight_percent=8.0,
        duration_days=4.5,
        physical_percent=100.0,
        actual_cost=15200.0
    ))
    
    # النشاط 2: بؤج وأوتار
    project.activities.append(EVMActivity(
        code="TILE-001-C",
        name_ar="بؤج وأوتار",
        name_en="Dots & Screeds",
        unit="م",
        quantity=480.0,
        unit_price=20.0,
        total_cost=9600.0,
        weight_percent=5.3,
        duration_days=4.5,
        physical_percent=100.0,
        actual_cost=8100.0
    ))
    
    # النشاط 3: تركيب البلاط (الأهم - 80%)
    project.activities.append(EVMActivity(
        code="TILE-001-D",
        name_ar="تركيب البلاط",
        name_en="Tile Installation",
        unit="م²",
        quantity=1200.0,
        unit_price=120.0,
        total_cost=144000.0,
        weight_percent=80.0,
        duration_days=42.0,
        physical_percent=75.0,
        actual_cost=120000.0
    ))
    
    # النشاط 4: تنعيم ومسح
    project.activities.append(EVMActivity(
        code="TILE-001-E",
        name_ar="تنعيم ومسح",
        name_en="Grouting & Cleaning",
        unit="م²",
        quantity=1200.0,
        unit_price=6.0,
        total_cost=7200.0,
        weight_percent=4.0,
        duration_days=6.0,
        physical_percent=0.0,
        actual_cost=6800.0
    ))
    
    # النشاط 5: معالجة مائية
    project.activities.append(EVMActivity(
        code="TILE-001-F",
        name_ar="معالجة مائية",
        name_en="Water Curing",
        unit="م²",
        quantity=1200.0,
        unit_price=4.0,
        total_cost=4800.0,
        weight_percent=2.7,
        duration_days=3.0,
        physical_percent=0.0,
        actual_cost=2100.0
    ))
    
    # حساب جميع المؤشرات
    project.calculate_all()
    
    return project


# ═══════════════════════════════════════════════════════════════
# اختبار سريع
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("🏗️  حاسبة القيمة المكتسبة - EVM Calculator\n")
    
    # إنشاء مثال المشروع
    project = create_tile_project_example()
    
    # طباعة التقرير الكامل
    print(project.get_detailed_report())
    
    # طباعة جدول الأنشطة
    print(project.get_activity_table())
    
    print("\n✅ تم إنشاء المثال بنجاح!")
    print(f"✅ عدد الأنشطة: {len(project.activities)}")
    print(f"✅ CPI = {project.project_cpi:.2f} | SPI = {project.project_spi:.2f}")
