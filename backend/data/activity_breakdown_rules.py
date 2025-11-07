"""
قواعد تفكيك بنود المقايسة إلى أنشطة فرعية (WBS Level-3)
Activity Breakdown Rules for BOQ Items to Sub-Activities

يحول كل بند من المقايسة إلى مجموعة أنشطة فرعية قابلة للجدولة
مع معدلات الإنتاج والطواقم والعلاقات المنطقية
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum


class LogicType(Enum):
    """أنواع العلاقات المنطقية"""
    FS = "Finish-to-Start"      # الدهان يبدأ بعد البياض
    SS = "Start-to-Start"        # البلاط يبدأ مع الفرشة (تداخل)
    FF = "Finish-to-Finish"      # المعالجة تنتهي مع الصب
    SF = "Start-to-Finish"       # نادر - تسليم المفتاح


class ActivityType(Enum):
    """نوع النشاط لتحديد الاحتياطي"""
    CRITICAL = "critical"         # +5%
    NON_CRITICAL = "non_critical" # +3%
    PRECISE = "precise"           # +8% (رخام فاخر)
    EXTERNAL = "external"         # +6% (أعمال خارجية)
    NORMAL = "normal"             # +3%


class RiskCategory(Enum):
    """فئات المخاطر"""
    WEATHER = "weather"           # +6% (أمطار، حرارة)
    RAMADAN = "ramadan"           # حسب الأيام الفعلية
    HOLIDAYS = "holidays"         # حسب التقويم
    MATERIAL = "material"         # +4% (تأخير توريد)
    LABOR = "labor"               # +5% (نقص عمالة)


@dataclass
class CrewComposition:
    """تكوين الطاقم"""
    description: str
    skilled_workers: int        # عمال مهرة
    helpers: int               # مساعدين
    equipment: str = "None"    # معدات مطلوبة
    supervisor: bool = False   # يحتاج مشرف؟
    
    @property
    def total_workers(self) -> int:
        """إجمالي العمالة"""
        return self.skilled_workers + self.helpers + (1 if self.supervisor else 0)


@dataclass
class ProductivityRate:
    """معدل الإنتاجية"""
    rate_per_day: float        # وحدة/يوم
    unit: str                  # الوحدة
    crew: CrewComposition      # الطاقم
    one_shift: float = 1.0     # معامل وردية واحدة
    two_shifts: float = 0.6    # معامل ورديتين
    three_shifts: float = 0.45 # معامل 3 ورديات
    
    def calculate_duration(self, quantity: float, shifts: int = 1) -> float:
        """حساب المدة بالأيام"""
        shift_factor = {1: self.one_shift, 2: self.two_shifts, 3: self.three_shifts}.get(shifts, 1.0)
        return (quantity / self.rate_per_day) / shift_factor


@dataclass
class LogicLink:
    """رابط منطقي بين الأنشطة"""
    logic_type: LogicType      # نوع العلاقة
    predecessor: str           # النشاط السابق
    lag_days: float = 0.0      # تأخير بالأيام (موجب) أو تقديم (سالب)
    
    def __str__(self) -> str:
        lag_str = f"+{self.lag_days}" if self.lag_days > 0 else (f"{self.lag_days}" if self.lag_days < 0 else "")
        return f"{self.logic_type.name}{lag_str} from '{self.predecessor}'"


@dataclass
class SubActivity:
    """نشاط فرعي واحد"""
    code: str                  # رمز النشاط
    name_ar: str               # الاسم بالعربية
    name_en: str               # الاسم بالإنجليزية
    unit: str                  # الوحدة
    productivity: ProductivityRate  # معدل الإنتاجية
    activity_type: ActivityType     # نوع النشاط
    logic_links: List[LogicLink] = field(default_factory=list)  # الروابط المنطقية
    risk_buffer: float = 0.0   # احتياطي المخاطر %
    remarks: str = ""          # ملاحظات
    
    def get_risk_buffer(self) -> float:
        """حساب الاحتياطي الكلي"""
        base_buffer = {
            ActivityType.CRITICAL: 5.0,
            ActivityType.NON_CRITICAL: 3.0,
            ActivityType.PRECISE: 8.0,
            ActivityType.EXTERNAL: 6.0,
            ActivityType.NORMAL: 3.0
        }.get(self.activity_type, 3.0)
        return base_buffer + self.risk_buffer
    
    def calculate_final_duration(self, quantity: float, shifts: int = 1) -> float:
        """حساب المدة النهائية مع الاحتياطي"""
        raw_duration = self.productivity.calculate_duration(quantity, shifts)
        buffer_factor = 1.0 + (self.get_risk_buffer() / 100.0)
        return raw_duration * buffer_factor


@dataclass
class BOQBreakdown:
    """تفكيك بند مقايسة كامل"""
    boq_code: str              # رمز البند في المقايسة
    boq_description: str       # وصف البند
    total_quantity: float      # الكمية الإجمالية
    unit: str                  # الوحدة
    sub_activities: List[SubActivity]  # الأنشطة الفرعية
    category: str = ""         # الفئة (خرسانة، لياسة، إلخ)


# ═══════════════════════════════════════════════════════════════
# 1️⃣ خرسانة بلاطة 100 م³ (Concrete Slab)
# ═══════════════════════════════════════════════════════════════

CONCRETE_SLAB_100M3 = BOQBreakdown(
    boq_code="CONC-SLAB-001",
    boq_description="خرسانة بلاطة 100 م³ - C30",
    total_quantity=100.0,
    unit="م³",
    category="Concrete Works",
    sub_activities=[
        SubActivity(
            code="CONC-SLAB-001-A",
            name_ar="تسليم موقع (Hand-over)",
            name_en="Site Handover & Survey",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=2.0,  # 2 تسليمات/يوم
                unit="LS",
                crew=CrewComposition("مهندس + مقيم", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[],  # نشاط البداية
            remarks="مستوى الحفر – تسليم نقاط التحكم"
        ),
        SubActivity(
            code="CONC-SLAB-001-B",
            name_ar="حفر يدوي/ميكانيكي",
            name_en="Excavation (Manual/Mechanical)",
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=25.0,
                unit="م³/يوم",
                crew=CrewComposition("1 حفار + 2 قلاب + 2 عامل", skilled_workers=1, helpers=2, equipment="Excavator 1.5m³")
            ),
            activity_type=ActivityType.NON_CRITICAL,
            logic_links=[LogicLink(LogicType.FS, "CONC-SLAB-001-A", lag_days=0)],
            remarks="عمق 0.6 م – تربة رملية"
        ),
        SubActivity(
            code="CONC-SLAB-001-C",
            name_ar="تمهيد وتنظيف",
            name_en="Leveling & Cleaning",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=400.0,
                unit="م²/يوم",
                crew=CrewComposition("2 عامل + مكنسة هواء", skilled_workers=2, helpers=0, equipment="Air blower")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "CONC-SLAB-001-B", lag_days=0)],
            remarks="منسوب النظافة ±2 سم"
        ),
        SubActivity(
            code="CONC-SLAB-001-D",
            name_ar="رمل فرشة (blinding) 5 cm",
            name_en="Sand Blinding 5 cm",
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=40.0,
                unit="م³/يوم",
                crew=CrewComposition("خلاطة صغيرة + 3 عامل", skilled_workers=1, helpers=2, equipment="Small mixer")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "CONC-SLAB-001-C", lag_days=0)],
            remarks="C15 – مستوى ±1 سم"
        ),
        SubActivity(
            code="CONC-SLAB-001-E",
            name_ar="قص وثني الحديد",
            name_en="Cutting & Bending Reinforcement",
            unit="طن",
            productivity=ProductivityRate(
                rate_per_day=1.1,
                unit="طن/يوم",
                crew=CrewComposition("1 حداد + 1 مساعد", skilled_workers=1, helpers=1, equipment="Bar bender")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.SS, "CONC-SLAB-001-D", lag_days=0)],  # تداخل
            remarks="يشمل نقل التسليح إلى الموقع"
        ),
        SubActivity(
            code="CONC-SLAB-001-F",
            name_ar="تركيب التسليح",
            name_en="Fixing Reinforcement",
            unit="طن",
            productivity=ProductivityRate(
                rate_per_day=1.1,
                unit="طن/يوم",
                crew=CrewComposition("1 حداد + 1 مساعد", skilled_workers=1, helpers=1, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "CONC-SLAB-001-E", lag_days=0)],
            remarks="رباط سلك 1.2 كجم/طن – كفرات بلاستيك"
        ),
        SubActivity(
            code="CONC-SLAB-001-G",
            name_ar="تجهير القوالب (propping)",
            name_en="Formwork & Propping",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=50.0,
                unit="م²/يوم",
                crew=CrewComposition("1 نجار + 1 مساعد", skilled_workers=1, helpers=1, equipment="Props")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[
                LogicLink(LogicType.SS, "CONC-SLAB-001-F", lag_days=0),  # يبدأ مع التسليح
                LogicLink(LogicType.FS, "CONC-SLAB-001-D", lag_days=1)   # بعد جفاف الفرشة
            ],
            remarks="فيدا 2×4 – بروبلكوب 18 مم"
        ),
        SubActivity(
            code="CONC-SLAB-001-H",
            name_ar="صب الخرسانة",
            name_en="Concrete Pouring",
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=40.0,
                unit="م³/يوم",
                crew=CrewComposition("مضخة + 6 عامل (فرمجة)", skilled_workers=2, helpers=4, equipment="Pump", supervisor=True)
            ),
            activity_type=ActivityType.CRITICAL,  # حرج
            logic_links=[
                LogicLink(LogicType.FS, "CONC-SLAB-001-F", lag_days=0),  # بعد انتهاء التسليح
                LogicLink(LogicType.FS, "CONC-SLAB-001-G", lag_days=0)   # بعد انتهاء القوالب
            ],
            remarks="شيك مضخة – هوز 125 مم – هزاز كهربائي"
        ),
        SubActivity(
            code="CONC-SLAB-001-I",
            name_ar="معالجة مائية",
            name_en="Water Curing",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=400.0,
                unit="م²/يوم",
                crew=CrewComposition("1 عامل + رشاش", skilled_workers=0, helpers=1, equipment="Sprayer")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "CONC-SLAB-001-H", lag_days=1)],  # بعد 24 ساعة
            remarks="7 أيام – رطوبة ≥ 95 %"
        ),
        SubActivity(
            code="CONC-SLAB-001-J",
            name_ar="فك القوالب",
            name_en="Formwork Removal",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=80.0,
                unit="م²/يوم",
                crew=CrewComposition("1 نجار + 1 مساعد", skilled_workers=1, helpers=1, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "CONC-SLAB-001-H", lag_days=1)],  # بعد 24 ساعة
            remarks="بعد 24 ساعة (C30) – رفع تدريجي"
        ),
        SubActivity(
            code="CONC-SLAB-001-K",
            name_ar="تسليم استشاري (Inspection)",
            name_en="Consultant Inspection",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=2.0,
                unit="LS/يوم",
                crew=CrewComposition("مهندس + مشرف", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[
                LogicLink(LogicType.FF, "CONC-SLAB-001-I", lag_days=0)  # ينتهي مع المعالجة
            ],
            remarks="Check-list: مستوى – كرش – رتش"
        )
    ]
)


# ═══════════════════════════════════════════════════════════════
# 2️⃣ لياسة جدران 200 م² (Plastering)
# ═══════════════════════════════════════════════════════════════

PLASTERING_200M2 = BOQBreakdown(
    boq_code="PLAST-001",
    boq_description="لياسة جدران داخلية 200 م²",
    total_quantity=200.0,
    unit="م²",
    category="Finishing Works",
    sub_activities=[
        SubActivity(
            code="PLAST-001-A",
            name_ar="تسليم سطح خرساني",
            name_en="Concrete Surface Handover",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=4.0,
                unit="LS/يوم",
                crew=CrewComposition("مهندس", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[],
            remarks="فحص الاستواء – التربية"
        ),
        SubActivity(
            code="PLAST-001-B",
            name_ar="طرطشة أسمنتية (spatter dash)",
            name_en="Spatter Dash",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=250.0,
                unit="م²/يوم",
                crew=CrewComposition("1 مبيض + 1 مساعد", skilled_workers=1, helpers=1, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "PLAST-001-A", lag_days=0)],
            remarks="سمك 3 مم – رش مسبق"
        ),
        SubActivity(
            code="PLAST-001-C",
            name_ar="بؤج واوتار (dots & screeds)",
            name_en="Dots & Screeds",
            unit="م",
            productivity=ProductivityRate(
                rate_per_day=60.0,
                unit="م/يوم",
                crew=CrewComposition("1 مبيض + 1 مساعد", skilled_workers=1, helpers=1, equipment="Water level")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "PLAST-001-B", lag_days=0)],
            remarks="بؤج @1.5 م – وتر أفقي كل 2 م"
        ),
        SubActivity(
            code="PLAST-001-D",
            name_ar="فترة شك (setting)",
            name_en="Setting Period",
            unit="ساعة",
            productivity=ProductivityRate(
                rate_per_day=2.0,  # يومان شك
                unit="يوم",
                crew=CrewComposition("—", skilled_workers=0, helpers=0, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "PLAST-001-C", lag_days=0)],
            remarks="لا يمسح قبل 4 ساعات"
        ),
        SubActivity(
            code="PLAST-001-E",
            name_ar="بياض أساسي 2 سم",
            name_en="Base Plaster 2 cm",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=140.0,
                unit="م²/يوم",
                crew=CrewComposition("2 مبيض + 1 مونة", skilled_workers=2, helpers=1, equipment="Mixer")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "PLAST-001-D", lag_days=0)],
            remarks="مونة 1:4 – دك بالمالجة"
        ),
        SubActivity(
            code="PLAST-001-F",
            name_ar="تنعيم واستواء",
            name_en="Smoothing & Leveling",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=200.0,
                unit="م²/يوم",
                crew=CrewComposition("2 مبيض", skilled_workers=2, helpers=0, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "PLAST-001-E", lag_days=0)],
            remarks="يمسح بالمستوى قبل الجفاف"
        ),
        SubActivity(
            code="PLAST-001-G",
            name_ar="معالجة مائية",
            name_en="Water Curing",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=400.0,
                unit="م²/يوم",
                crew=CrewComposition("1 عامل + بخاخ", skilled_workers=0, helpers=1, equipment="Sprayer")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "PLAST-001-F", lag_days=0)],
            remarks="رش خفيف 2 يوم متتالي"
        ),
        SubActivity(
            code="PLAST-001-H",
            name_ar="تسليم استشاري",
            name_en="Consultant Inspection",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=4.0,
                unit="LS/يوم",
                crew=CrewComposition("مهندس", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FF, "PLAST-001-G", lag_days=0)],
            remarks="فحص: الاستواء ±3 مم – لا تشققات"
        )
    ]
)


# ═══════════════════════════════════════════════════════════════
# 3️⃣ بلاط بورسلان 1,200 م² (Porcelain Tiles)
# ═══════════════════════════════════════════════════════════════

TILES_1200M2 = BOQBreakdown(
    boq_code="TILE-001",
    boq_description="بلاط بورسلان 1,200 م² - 60×60 سم",
    total_quantity=1200.0,
    unit="م²",
    category="Finishing Works",
    sub_activities=[
        SubActivity(
            code="TILE-001-A",
            name_ar="تسليم سطح خرساني",
            name_en="Concrete Surface Handover",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=1.0,
                unit="LS/يوم",
                crew=CrewComposition("مهندس + مقيم", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[],
            remarks="FS من خرسانة سقف"
        ),
        SubActivity(
            code="TILE-001-B",
            name_ar="فرشة أسمنتية 3 سم",
            name_en="Cement Screed 3 cm",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=300.0,
                unit="م²/يوم",
                crew=CrewComposition("2 عامل + خلاطة", skilled_workers=2, helpers=0, equipment="Mixer")
            ),
            activity_type=ActivityType.NON_CRITICAL,
            logic_links=[LogicLink(LogicType.FS, "TILE-001-A", lag_days=0)],
            risk_buffer=3.0,  # +3%
            remarks="مستوى أفقي ±3 مم"
        ),
        SubActivity(
            code="TILE-001-C",
            name_ar="بؤج واوتار",
            name_en="Dots & Screeds",
            unit="م",
            productivity=ProductivityRate(
                rate_per_day=120.0,
                unit="م/يوم",
                crew=CrewComposition("2 عامل", skilled_workers=2, helpers=0, equipment="Laser level")
            ),
            activity_type=ActivityType.NON_CRITICAL,
            logic_links=[LogicLink(LogicType.FS, "TILE-001-B", lag_days=1)],  # يوم تشقق
            risk_buffer=3.0,
            remarks="بؤج @1.5 م"
        ),
        SubActivity(
            code="TILE-001-D",
            name_ar="تركيب البلاط",
            name_en="Tile Installation",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=30.0,
                unit="م²/يوم",
                crew=CrewComposition("1 مبلط + 1 مساعد", skilled_workers=1, helpers=1, equipment="Tile cutter")
            ),
            activity_type=ActivityType.CRITICAL,  # حرج
            logic_links=[LogicLink(LogicType.FS, "TILE-001-C", lag_days=0)],
            risk_buffer=5.0,  # +5%
            remarks="فواصل 2 مم – لاصق بلاط"
        ),
        SubActivity(
            code="TILE-001-E",
            name_ar="تنعيم ومسح",
            name_en="Grouting & Cleaning",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=200.0,
                unit="م²/يوم",
                crew=CrewComposition("1 مبلط + 1 مساعد", skilled_workers=1, helpers=1, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "TILE-001-D", lag_days=0)],
            remarks="أسمنت أبيض – تلبيس"
        ),
        SubActivity(
            code="TILE-001-F",
            name_ar="معالجة مائية",
            name_en="Water Curing",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=400.0,
                unit="م²/يوم",
                crew=CrewComposition("1 عامل", skilled_workers=0, helpers=1, equipment="Sprayer")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "TILE-001-E", lag_days=0)],
            remarks="رش خفيف 3 أيام"
        ),
        SubActivity(
            code="TILE-001-G",
            name_ar="تسليم استشاري",
            name_en="Consultant Inspection",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=2.0,
                unit="LS/يوم",
                crew=CrewComposition("مهندس + QC", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FF, "TILE-001-F", lag_days=0)],
            remarks="فحص المستوى – الفواصل"
        )
    ]
)


# ═══════════════════════════════════════════════════════════════
# 4️⃣ سور شبك معدني 100 م (Chain Link Fence)
# ═══════════════════════════════════════════════════════════════

FENCE_100M = BOQBreakdown(
    boq_code="FENCE-001",
    boq_description="سور شبك معدني 100 م - ارتفاع 2 م",
    total_quantity=100.0,
    unit="م",
    category="External Works",
    sub_activities=[
        SubActivity(
            code="FENCE-001-A",
            name_ar="تسليم خط السور",
            name_en="Fence Line Survey",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=4.0,
                unit="LS/يوم",
                crew=CrewComposition("مهندس", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[],
            remarks="مخطط – مساحة – نقاط كيلومتر"
        ),
        SubActivity(
            code="FENCE-001-B",
            name_ar="حفر خنادق أعمدة",
            name_en="Post Holes Excavation",
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=25.0,
                unit="م³/يوم",
                crew=CrewComposition("1 حفار + 2 عامل", skilled_workers=1, helpers=2, equipment="Mini excavator")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "FENCE-001-A", lag_days=0)],
            remarks="0.3×0.3×0.6 م"
        ),
        SubActivity(
            code="FENCE-001-C",
            name_ar="خرسانة قواعد C15",
            name_en="Foundation Concrete C15",
            unit="م³",
            productivity=ProductivityRate(
                rate_per_day=30.0,
                unit="م³/يوم",
                crew=CrewComposition("خلاطة + 3 عامل", skilled_workers=1, helpers=2, equipment="Small mixer")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "FENCE-001-B", lag_days=0)],
            remarks="كعب 30×30×60 سم"
        ),
        SubActivity(
            code="FENCE-001-D",
            name_ar="تركيب العمدان H-Beam",
            name_en="H-Beam Posts Installation",
            unit="No",
            productivity=ProductivityRate(
                rate_per_day=20.0,
                unit="عمود/يوم",
                crew=CrewComposition("3 عامل + شوكية 3 طن", skilled_workers=2, helpers=1, equipment="Forklift 3T")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "FENCE-001-C", lag_days=1)],  # بعد جفاف الخرسانة
            remarks="محاذاة عمودية ±5 مم"
        ),
        SubActivity(
            code="FENCE-001-E",
            name_ar="تركيب الكمرة العلوية",
            name_en="Top Rail Installation",
            unit="م",
            productivity=ProductivityRate(
                rate_per_day=100.0,
                unit="م/يوم",
                crew=CrewComposition("3 عامل", skilled_workers=2, helpers=1, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "FENCE-001-D", lag_days=0)],
            remarks="أنبوب 48×3 مم – براغي"
        ),
        SubActivity(
            code="FENCE-001-F",
            name_ar="لف الشبك + السلك الشد",
            name_en="Chain Link Mesh & Tension Wire",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=250.0,
                unit="م²/يوم",
                crew=CrewComposition("4 عامل + شدادات", skilled_workers=2, helpers=2, equipment="Tensioners")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "FENCE-001-E", lag_days=0)],
            remarks="شد أفقي كل 1.5 م"
        ),
        SubActivity(
            code="FENCE-001-G",
            name_ar="تركيب البوابات",
            name_en="Gate Installation",
            unit="No",
            productivity=ProductivityRate(
                rate_per_day=4.0,
                unit="بوابة/يوم",
                crew=CrewComposition("3 عامل", skilled_workers=2, helpers=1, equipment="None")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.SS, "FENCE-001-F", lag_days=0)],  # تداخل
            remarks="تتضمن قفل ومسكات"
        ),
        SubActivity(
            code="FENCE-001-H",
            name_ar="طلاء بريمر + مط",
            name_en="Primer & Paint",
            unit="م²",
            productivity=ProductivityRate(
                rate_per_day=300.0,
                unit="م²/يوم",
                crew=CrewComposition("1 عامل + رش", skilled_workers=1, helpers=0, equipment="Spray gun")
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[LogicLink(LogicType.FS, "FENCE-001-F", lag_days=0)],
            remarks="2 معطف – مط أخضر"
        ),
        SubActivity(
            code="FENCE-001-I",
            name_ar="تسليم استشاري",
            name_en="Consultant Inspection",
            unit="LS",
            productivity=ProductivityRate(
                rate_per_day=4.0,
                unit="LS/يوم",
                crew=CrewComposition("مهندس", skilled_workers=1, helpers=0, supervisor=True)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[
                LogicLink(LogicType.FF, "FENCE-001-H", lag_days=0),
                LogicLink(LogicType.FF, "FENCE-001-G", lag_days=0)
            ],
            remarks="فحص الشد – المحاذاة – الرتوش"
        )
    ]
)


# ═══════════════════════════════════════════════════════════════
# قاعدة البيانات الرئيسية
# ═══════════════════════════════════════════════════════════════

ALL_BOQ_BREAKDOWNS: Dict[str, BOQBreakdown] = {
    "CONC-SLAB-001": CONCRETE_SLAB_100M3,
    "PLAST-001": PLASTERING_200M2,
    "TILE-001": TILES_1200M2,
    "FENCE-001": FENCE_100M
}


def get_breakdown_by_code(boq_code: str) -> Optional[BOQBreakdown]:
    """استرجاع تفكيك نشاط حسب الرمز"""
    return ALL_BOQ_BREAKDOWNS.get(boq_code)


def list_all_breakdowns() -> List[str]:
    """قائمة بجميع أكواد المقايسة المتاحة"""
    return list(ALL_BOQ_BREAKDOWNS.keys())


# ═══════════════════════════════════════════════════════════════
# اختبار سريع
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 80)
    print("🏗️  قاعدة بيانات تفكيك الأنشطة - Activity Breakdown Database")
    print("=" * 80)
    
    for boq_code, breakdown in ALL_BOQ_BREAKDOWNS.items():
        print(f"\n📦 {boq_code}: {breakdown.boq_description}")
        print(f"   الكمية: {breakdown.total_quantity} {breakdown.unit}")
        print(f"   عدد الأنشطة الفرعية: {len(breakdown.sub_activities)}")
        
        total_duration = 0.0
        for sub in breakdown.sub_activities:
            if sub.unit == "LS":
                quantity = 1.0
            elif "CONC-SLAB" in sub.code:
                if sub.unit == "م³":
                    quantity = 100.0 if "100 م³" in breakdown.boq_description else breakdown.total_quantity
                elif sub.unit == "م²":
                    quantity = 160.0  # مساحة البلاطة
                elif sub.unit == "طن":
                    quantity = 11.0  # وزن التسليح
                else:
                    quantity = 1.0
            elif "PLAST" in sub.code:
                quantity = 200.0 if sub.unit == "م²" else (80.0 if sub.unit == "م" else 1.0)
            elif "TILE" in sub.code:
                quantity = 1200.0 if sub.unit == "م²" else (480.0 if sub.unit == "م" else 1.0)
            elif "FENCE" in sub.code:
                if sub.unit == "م³":
                    quantity = 3.0
                elif sub.unit == "No":
                    quantity = 34.0 if "عمدان" in sub.name_ar else 1.0
                elif sub.unit == "م":
                    quantity = 100.0
                elif sub.unit == "م²":
                    quantity = 200.0
                else:
                    quantity = 1.0
            else:
                quantity = breakdown.total_quantity
            
            duration = sub.calculate_final_duration(quantity, shifts=1)
            total_duration += duration
            
            print(f"      └─ {sub.code}: {sub.name_ar} - {duration:.1f} يوم")
    
    print(f"\n✅ إجمالي الأكواد: {len(ALL_BOQ_BREAKDOWNS)}")
    print(f"✅ إجمالي الأنشطة الفرعية: {sum(len(b.sub_activities) for b in ALL_BOQ_BREAKDOWNS.values())}")
    print("=" * 80)
