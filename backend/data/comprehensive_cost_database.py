"""
Comprehensive Construction Cost Database
=========================================
Real project data from multiple construction sectors in Saudi Arabia.

Data Sources:
- Building Construction (Residential, Commercial)
- Deep Foundations (Diaphragm Walls, Piles, Secant Piles)
- Marine Works (Wave Walls, Coral Relocation, Monopiles)
- Tunneling (TBM, Precast Segments, Cast-in-place)
- Rail Infrastructure (Rail Pits, Embedded Channels)
- Water Treatment (Basins, Liners, Gutters)
- Recreational Infrastructure (Cycle Tracks, LED Poles, Pergolas)
- Utilities (Electrical, Plumbing, Drainage)

Version: 2.0.0
Updated: 2025-11-07
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum


class ActivityCategory(Enum):
    """Construction activity categories"""
    CONCRETE = "concrete"
    REINFORCEMENT = "reinforcement"
    FORMWORK = "formwork"
    MASONRY = "masonry"
    FINISHES = "finishes"
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    DEEP_FOUNDATION = "deep_foundation"
    MARINE = "marine"
    TUNNELING = "tunneling"
    RAIL = "rail"
    LANDSCAPING = "landscaping"
    WATERPROOFING = "waterproofing"


class ComplexityLevel(Enum):
    """Project complexity levels"""
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"
    MEGA_PROJECT = "mega_project"


@dataclass
class ProductivityRate:
    """Productivity rate with crew information"""
    output_per_day: float
    unit: str
    crew_size: int = 0
    equipment: str = ""
    working_hours: float = 8.0
    
    @property
    def output_per_hour(self) -> float:
        """Calculate output per hour"""
        return self.output_per_day / self.working_hours
    
    @property
    def man_hours_per_unit(self) -> float:
        """Calculate man-hours per unit"""
        if self.output_per_day > 0 and self.crew_size > 0:
            return (self.crew_size * self.working_hours) / self.output_per_day
        return 0.0


@dataclass
class CostBreakdown:
    """Detailed cost breakdown"""
    material_cost: float
    labor_cost: float
    equipment_cost: float
    subcontractor_cost: float = 0.0
    overhead: float = 0.0
    profit_margin: float = 0.0
    
    @property
    def total_direct_cost(self) -> float:
        """Calculate total direct cost"""
        return self.material_cost + self.labor_cost + self.equipment_cost + self.subcontractor_cost
    
    @property
    def total_cost(self) -> float:
        """Calculate total cost including overhead and profit"""
        return self.total_direct_cost + self.overhead + self.profit_margin


@dataclass
class ConstructionActivity:
    """Complete construction activity data"""
    code: str
    name_ar: str
    name_en: str
    unit: str
    category: ActivityCategory
    complexity: ComplexityLevel
    cost: CostBreakdown
    productivity: ProductivityRate
    remarks: str = ""
    bid_range: Optional[Tuple[float, float]] = None  # (min_bid, max_bid)
    achieved_rate: Optional[float] = None
    quantity_range: Optional[Tuple[int, int]] = None  # Typical project quantities
    
    @property
    def unit_rate(self) -> float:
        """Get total unit rate"""
        return self.cost.total_cost
    
    def variance_from_bid(self) -> Optional[float]:
        """Calculate variance percentage from bid average"""
        if self.bid_range and self.achieved_rate:
            avg_bid = (self.bid_range[0] + self.bid_range[1]) / 2
            return ((self.achieved_rate - avg_bid) / avg_bid) * 100
        return None


# ==============================================================================
# COMPREHENSIVE COST DATABASE
# ==============================================================================

COST_DATABASE: Dict[str, ConstructionActivity] = {
    
    # =========================================================================
    # CONCRETE WORKS
    # =========================================================================
    
    'CONC-001': ConstructionActivity(
        code='CONC-001',
        name_ar='نقل & ضخ خرسانة',
        name_en='Concrete Transport & Pump',
        unit='m³',
        category=ActivityCategory.CONCRETE,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=18.90,
            labor_cost=93.30,
            equipment_cost=22.20
        ),
        productivity=ProductivityRate(
            output_per_day=30.0,
            unit='m³',
            crew_size=4,
            equipment='Concrete pump'
        ),
        remarks='Standard pumping, average distance'
    ),
    
    'CONC-002': ConstructionActivity(
        code='CONC-002',
        name_ar='خرسانة جاهزة عادية',
        name_en='Ready Mix Concrete (Normal)',
        unit='m³',
        category=ActivityCategory.CONCRETE,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=230.0,
            labor_cost=70.0,
            equipment_cost=30.0
        ),
        productivity=ProductivityRate(
            output_per_day=35.0,
            unit='m³',
            crew_size=6,
            equipment='Pump + Vibrator'
        ),
        remarks='C25-C30 grade'
    ),
    
    'CONC-003': ConstructionActivity(
        code='CONC-003',
        name_ar='أعمدة وكمرات C30',
        name_en='C30 Columns & Beams',
        unit='m³',
        category=ActivityCategory.CONCRETE,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=339.5,   # 70% of 485
            labor_cost=97.0,       # 20% of 485
            equipment_cost=48.5    # 10% of 485
        ),
        productivity=ProductivityRate(
            output_per_day=35.0,
            unit='m³',
            crew_size=8,
            equipment='Crane + Vibrator',
            working_hours=8.0
        ),
        achieved_rate=485.0,
        remarks='Gang of 8 workers'
    ),
    
    'CONC-004': ConstructionActivity(
        code='CONC-004',
        name_ar='C35 raft + blinding',
        name_en='C35 Raft Foundation + Blinding',
        unit='m³',
        category=ActivityCategory.CONCRETE,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=340.0,
            labor_cost=85.0,
            equipment_cost=35.0
        ),
        productivity=ProductivityRate(
            output_per_day=280.0,
            unit='m³',
            crew_size=12,
            equipment='2 pumps',
            working_hours=10.0
        ),
        achieved_rate=460.0,
        quantity_range=(15000, 25000),
        remarks='High volume pour, 2 pumps required'
    ),
    
    'CONC-005': ConstructionActivity(
        code='CONC-005',
        name_ar='C35 حوض مقاوم للماء',
        name_en='C35 Waterproof Basin',
        unit='m³',
        category=ActivityCategory.CONCRETE,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=357.0,   # 70% of 510
            labor_cost=102.0,      # 20% of 510
            equipment_cost=51.0    # 10% of 510
        ),
        productivity=ProductivityRate(
            output_per_day=210.0,
            unit='m³',
            crew_size=10,
            equipment='Pump + Crane',
            working_hours=10.0
        ),
        achieved_rate=510.0,
        remarks='Waterproofing additives included'
    ),
    
    'CONC-006': ConstructionActivity(
        code='CONC-006',
        name_ar='C45 بلاطة حفرة السكة',
        name_en='C45 Rail Pit Slab',
        unit='m³',
        category=ActivityCategory.RAIL,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=406.0,   # 70% of 580
            labor_cost=116.0,      # 20% of 580
            equipment_cost=58.0    # 10% of 580
        ),
        productivity=ProductivityRate(
            output_per_day=70.0,
            unit='m³',
            crew_size=8,
            equipment='Pump + Vibrator',
            working_hours=10.0
        ),
        achieved_rate=580.0,
        remarks='High strength concrete for rail infrastructure'
    ),
    
    'CONC-007': ConstructionActivity(
        code='CONC-007',
        name_ar='C50 جدار عازل',
        name_en='C50 Diaphragm Wall',
        unit='m³',
        category=ActivityCategory.DEEP_FOUNDATION,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=1274.0,  # 70% of 1820
            labor_cost=364.0,      # 20% of 1820
            equipment_cost=182.0   # 10% of 1820
        ),
        productivity=ProductivityRate(
            output_per_day=15.0,
            unit='m³',
            crew_size=6,
            equipment='Grab + Crane',
            working_hours=10.0
        ),
        bid_range=(1790.0, 1850.0),
        achieved_rate=1820.0,
        remarks='Deep foundation, specialized equipment'
    ),
    
    'CONC-008': ConstructionActivity(
        code='CONC-008',
        name_ar='C20 بلاطة مسار دراجات 200 مم',
        name_en='C20 Cycle Track Slab 200 mm',
        unit='m³',
        category=ActivityCategory.LANDSCAPING,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=290.5,   # 70% of 415
            labor_cost=83.0,       # 20% of 415
            equipment_cost=41.5    # 10% of 415
        ),
        productivity=ProductivityRate(
            output_per_day=100.0,
            unit='m³',
            crew_size=6,
            equipment='Paver',
            working_hours=8.0
        ),
        achieved_rate=415.0,
        remarks='Recreational infrastructure'
    ),
    
    'CONC-009': ConstructionActivity(
        code='CONC-009',
        name_ar='خرسانة قاع مصبوب في الموقع',
        name_en='Cast-in-place Invert',
        unit='m³',
        category=ActivityCategory.TUNNELING,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=770.0,   # 70% of 1100
            labor_cost=220.0,      # 20% of 1100
            equipment_cost=110.0   # 10% of 1100
        ),
        productivity=ProductivityRate(
            output_per_day=25.0,
            unit='m³',
            crew_size=8,
            equipment='Concrete pump',
            working_hours=10.0
        ),
        achieved_rate=1100.0,
        quantity_range=(3000, 5000),
        remarks='Tunnel invert, confined space'
    ),
    
    'CONC-010': ConstructionActivity(
        code='CONC-010',
        name_ar='جدار موج مسبق الصب 50 MPa',
        name_en='Precast Wave Wall 50 MPa',
        unit='m³',
        category=ActivityCategory.MARINE,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=665.0,   # 70% of 950
            labor_cost=190.0,      # 20% of 950
            equipment_cost=95.0    # 10% of 950
        ),
        productivity=ProductivityRate(
            output_per_day=12.0,
            unit='m³',
            crew_size=6,
            equipment='Crane + Barge',
            working_hours=10.0
        ),
        achieved_rate=950.0,
        quantity_range=(2000, 2500),
        remarks='Marine structure, high strength'
    ),
    
    # =========================================================================
    # REINFORCEMENT WORKS
    # =========================================================================
    
    'REBAR-001': ConstructionActivity(
        code='REBAR-001',
        name_ar='حديد تسليح عادي',
        name_en='Reinforcement Steel (Standard)',
        unit='طن',
        category=ActivityCategory.REINFORCEMENT,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=4400.0,
            labor_cost=440.0,
            equipment_cost=0.0
        ),
        productivity=ProductivityRate(
            output_per_day=1.1,
            unit='طن',
            crew_size=6,
            equipment='Bar bender + cutter',
            working_hours=8.0
        ),
        remarks='Grade 60, standard fixing'
    ),
    
    'REBAR-002': ConstructionActivity(
        code='REBAR-002',
        name_ar='حديد تسليح متقدم',
        name_en='Reinforcement Steel (Advanced)',
        unit='طن',
        category=ActivityCategory.REINFORCEMENT,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=2850.0,
            labor_cost=220.0,
            equipment_cost=50.0
        ),
        productivity=ProductivityRate(
            output_per_day=1.1,
            unit='طن',
            crew_size=6,
            equipment='Bar bender + cutter',
            working_hours=8.0
        ),
        remarks='High productivity rate'
    ),
    
    'REBAR-003': ConstructionActivity(
        code='REBAR-003',
        name_ar='حديد تسليح B500C',
        name_en='Reinforcement B500C',
        unit='t',
        category=ActivityCategory.REINFORCEMENT,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=2655.0,  # 90% of 2950
            labor_cost=265.5,      # 9% of 2950
            equipment_cost=29.5    # 1% of 2950
        ),
        productivity=ProductivityRate(
            output_per_day=65.0,
            unit='t',
            crew_size=8,
            equipment='Bar bender + cutter',
            working_hours=10.0
        ),
        achieved_rate=2950.0,
        quantity_range=(2500, 3500),
        remarks='High volume project'
    ),
    
    # =========================================================================
    # FORMWORK
    # =========================================================================
    
    'FORM-001': ConstructionActivity(
        code='FORM-001',
        name_ar='قوالب خشبية',
        name_en='Timber Formwork',
        unit='m²',
        category=ActivityCategory.FORMWORK,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=16.0,
            labor_cost=19.0,
            equipment_cost=0.0
        ),
        productivity=ProductivityRate(
            output_per_day=12.0,
            unit='m²',
            crew_size=4,
            equipment='None',
            working_hours=8.0
        ),
        remarks='Standard timber formwork'
    ),
    
    'FORM-002': ConstructionActivity(
        code='FORM-002',
        name_ar='قوالب بروبلكوب',
        name_en='Proplex Formwork',
        unit='m²',
        category=ActivityCategory.FORMWORK,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=6.5,
            labor_cost=10.0,
            equipment_cost=2.0
        ),
        productivity=ProductivityRate(
            output_per_day=9.0,
            unit='m²',
            crew_size=4,
            equipment='Crane',
            working_hours=8.0
        ),
        remarks='Reusable plastic formwork, 8-10 m²/m³ ratio'
    ),
    
    # =========================================================================
    # MASONRY & BLOCKWORK
    # =========================================================================
    
    'MSNR-001': ConstructionActivity(
        code='MSNR-001',
        name_ar='طوب 20×20×40',
        name_en='Block 20×20×40',
        unit='m²',
        category=ActivityCategory.MASONRY,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=18.0,
            labor_cost=15.0,
            equipment_cost=2.0
        ),
        productivity=ProductivityRate(
            output_per_day=12.0,
            unit='m²',
            crew_size=2,
            equipment='Mixer',
            working_hours=8.0
        ),
        remarks='1.5 m²/hour per mason'
    ),
    
    'MSNR-002': ConstructionActivity(
        code='MSNR-002',
        name_ar='طوب 15×20×40',
        name_en='Block 15×20×40',
        unit='m²',
        category=ActivityCategory.MASONRY,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=16.0,
            labor_cost=13.0,
            equipment_cost=2.0
        ),
        productivity=ProductivityRate(
            output_per_day=14.4,
            unit='m²',
            crew_size=2,
            equipment='Mixer',
            working_hours=8.0
        ),
        remarks='1.8 m²/hour per mason'
    ),
    
    'MSNR-003': ConstructionActivity(
        code='MSNR-003',
        name_ar='بناء بلوك 200 مم',
        name_en='200 mm Blockwork',
        unit='m²',
        category=ActivityCategory.MASONRY,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=36.4,    # 70% of 52
            labor_cost=10.4,       # 20% of 52
            equipment_cost=5.2     # 10% of 52
        ),
        productivity=ProductivityRate(
            output_per_day=22.0,
            unit='m²',
            crew_size=2,
            equipment='Mixer',
            working_hours=8.0
        ),
        achieved_rate=52.0,
        remarks='Standard blockwork'
    ),
    
    'MSNR-004': ConstructionActivity(
        code='MSNR-004',
        name_ar='المونة الأسمنتية',
        name_en='Cement Mortar',
        unit='m²',
        category=ActivityCategory.MASONRY,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=2.0,     # 0.02 m³/m² × 100
            labor_cost=1.0,        # 0.02 m³/m² × 50
            equipment_cost=0.2     # 0.02 m³/m² × 10
        ),
        productivity=ProductivityRate(
            output_per_day=100.0,
            unit='m²',
            crew_size=2,
            equipment='Mixer',
            working_hours=8.0
        ),
        remarks='0.02 m³/m² consumption'
    ),
    
    # =========================================================================
    # FINISHES & TILES
    # =========================================================================
    
    'TILE-001': ConstructionActivity(
        code='TILE-001',
        name_ar='بلاط بورسلين 60×60',
        name_en='Porcelain Tile 60×60',
        unit='m²',
        category=ActivityCategory.FINISHES,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=120.0,
            labor_cost=25.0,
            equipment_cost=3.0
        ),
        productivity=ProductivityRate(
            output_per_day=27.5,
            unit='m²',
            crew_size=2,
            equipment='Tile cutter',
            working_hours=8.0
        ),
        remarks='25-30 m²/day range'
    ),
    
    'TILE-002': ConstructionActivity(
        code='TILE-002',
        name_ar='بلاط سيراميك 30×30',
        name_en='Ceramic Tile 30×30',
        unit='m²',
        category=ActivityCategory.FINISHES,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=80.0,
            labor_cost=20.0,
            equipment_cost=2.0
        ),
        productivity=ProductivityRate(
            output_per_day=37.5,
            unit='m²',
            crew_size=2,
            equipment='Tile cutter',
            working_hours=8.0
        ),
        remarks='35-40 m²/day range'
    ),
    
    'TILE-003': ConstructionActivity(
        code='TILE-003',
        name_ar='بلاط مطاطي',
        name_en='Rubber Tile',
        unit='m²',
        category=ActivityCategory.FINISHES,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=150.0,
            labor_cost=30.0,
            equipment_cost=5.0
        ),
        productivity=ProductivityRate(
            output_per_day=22.5,
            unit='m²',
            crew_size=2,
            equipment='Roller',
            working_hours=8.0
        ),
        remarks='20-25 m²/day range'
    ),
    
    'TILE-004': ConstructionActivity(
        code='TILE-004',
        name_ar='بورسلين 60×60 سم',
        name_en='60×60 cm Porcelain',
        unit='m²',
        category=ActivityCategory.FINISHES,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=124.0,   # 80% of 155
            labor_cost=27.9,       # 18% of 155
            equipment_cost=3.1     # 2% of 155
        ),
        productivity=ProductivityRate(
            output_per_day=350.0,
            unit='m²',
            crew_size=6,
            equipment='Tile cutter',
            working_hours=10.0
        ),
        achieved_rate=155.0,
        quantity_range=(40000, 50000),
        remarks='High volume installation'
    ),
    
    'TILE-005': ConstructionActivity(
        code='TILE-005',
        name_ar='كسوة رخام 20 مم',
        name_en='Marble Cladding 20 mm',
        unit='m²',
        category=ActivityCategory.FINISHES,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=203.0,   # 70% of 290
            labor_cost=58.0,       # 20% of 290
            equipment_cost=29.0    # 10% of 290
        ),
        productivity=ProductivityRate(
            output_per_day=14.0,
            unit='m²',
            crew_size=3,
            equipment='Crane + Grinder',
            working_hours=8.0
        ),
        achieved_rate=290.0,
        remarks='High-end finish, slow installation'
    ),
    
    'TILE-006': ConstructionActivity(
        code='TILE-006',
        name_ar='سقف جبسوم بورد',
        name_en='Gypsum Board Ceiling',
        unit='m²',
        category=ActivityCategory.FINISHES,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=26.6,    # 70% of 38
            labor_cost=7.6,        # 20% of 38
            equipment_cost=3.8     # 10% of 38
        ),
        productivity=ProductivityRate(
            output_per_day=55.0,
            unit='m²',
            crew_size=3,
            equipment='Scaffolding',
            working_hours=8.0
        ),
        achieved_rate=38.0,
        remarks='False ceiling installation'
    ),
    
    'TILE-007': ConstructionActivity(
        code='TILE-007',
        name_ar='دهان إيبوكسي 3 مم',
        name_en='Epoxy Paint 3 mm',
        unit='m²',
        category=ActivityCategory.FINISHES,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=77.0,    # 70% of 110
            labor_cost=22.0,       # 20% of 110
            equipment_cost=11.0    # 10% of 110
        ),
        productivity=ProductivityRate(
            output_per_day=400.0,
            unit='m²',
            crew_size=3,
            equipment='Roller + Spray',
            working_hours=8.0
        ),
        achieved_rate=110.0,
        remarks='Industrial grade epoxy'
    ),
    
    # =========================================================================
    # PLUMBING & DRAINAGE
    # =========================================================================
    
    'PLUMB-001': ConstructionActivity(
        code='PLUMB-001',
        name_ar='UPVC 110 مم',
        name_en='UPVC 110 mm',
        unit='م',
        category=ActivityCategory.PLUMBING,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=45.0,
            labor_cost=15.0,
            equipment_cost=2.0
        ),
        productivity=ProductivityRate(
            output_per_day=70.0,
            unit='م',
            crew_size=2,
            equipment='Cutter + Welder',
            working_hours=8.0
        ),
        remarks='60-80 m/day range'
    ),
    
    'PLUMB-002': ConstructionActivity(
        code='PLUMB-002',
        name_ar='HDPE 160 مم',
        name_en='HDPE 160 mm',
        unit='م',
        category=ActivityCategory.PLUMBING,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=78.0,
            labor_cost=20.0,
            equipment_cost=3.0
        ),
        productivity=ProductivityRate(
            output_per_day=50.0,
            unit='م',
            crew_size=2,
            equipment='Welder',
            working_hours=8.0
        ),
        remarks='40-60 m/day range'
    ),
    
    'PLUMB-003': ConstructionActivity(
        code='PLUMB-003',
        name_ar='HDPE 200 مم عواصف',
        name_en='HDPE 200 mm Storm',
        unit='m',
        category=ActivityCategory.PLUMBING,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=71.4,    # 70% of 102
            labor_cost=25.5,       # 25% of 102
            equipment_cost=5.1     # 5% of 102
        ),
        productivity=ProductivityRate(
            output_per_day=160.0,
            unit='m',
            crew_size=3,
            equipment='Welder + Excavator',
            working_hours=10.0
        ),
        achieved_rate=102.0,
        quantity_range=(8000, 10000),
        remarks='Storm water drainage'
    ),
    
    'PLUMB-004': ConstructionActivity(
        code='PLUMB-004',
        name_ar='منهول 1.2 م',
        name_en='Manhole 1.2 m',
        unit='وحدة',
        category=ActivityCategory.PLUMBING,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=2500.0,
            labor_cost=800.0,
            equipment_cost=200.0
        ),
        productivity=ProductivityRate(
            output_per_day=2.5,
            unit='وحدة',
            crew_size=4,
            equipment='Crane',
            working_hours=8.0
        ),
        remarks='2-3 units/day range'
    ),
    
    'PLUMB-005': ConstructionActivity(
        code='PLUMB-005',
        name_ar='قنوات كابلات 500 kV (GRP)',
        name_en='500 kV Cable Ducts (GRP)',
        unit='m',
        category=ActivityCategory.ELECTRICAL,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=220.5,   # 70% of 315
            labor_cost=63.0,       # 20% of 315
            equipment_cost=31.5    # 10% of 315
        ),
        productivity=ProductivityRate(
            output_per_day=80.0,
            unit='m',
            crew_size=4,
            equipment='Excavator + Crane',
            working_hours=10.0
        ),
        bid_range=(310.0, 320.0),
        achieved_rate=315.0,
        remarks='High voltage cable ducts'
    ),
    
    # =========================================================================
    # ELECTRICAL WORKS
    # =========================================================================
    
    'ELEC-001': ConstructionActivity(
        code='ELEC-001',
        name_ar='قابس 16 أمبير',
        name_en='Power Outlet 16A',
        unit='نقطة',
        category=ActivityCategory.ELECTRICAL,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=140.0,
            labor_cost=70.0,
            equipment_cost=10.0
        ),
        productivity=ProductivityRate(
            output_per_day=17.5,
            unit='نقطة',
            crew_size=2,
            equipment='Tools',
            working_hours=8.0
        ),
        remarks='15-20 points/day range'
    ),
    
    'ELEC-002': ConstructionActivity(
        code='ELEC-002',
        name_ar='سبوت لايت LED',
        name_en='LED Spot Light',
        unit='نقطة',
        category=ActivityCategory.ELECTRICAL,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=70.0,
            labor_cost=35.0,
            equipment_cost=5.0
        ),
        productivity=ProductivityRate(
            output_per_day=22.5,
            unit='نقطة',
            crew_size=2,
            equipment='Ladder',
            working_hours=8.0
        ),
        remarks='20-25 points/day range'
    ),
    
    'ELEC-003': ConstructionActivity(
        code='ELEC-003',
        name_ar='لوحة توزيع رئيسية',
        name_en='Main Distribution Board',
        unit='لوحة',
        category=ActivityCategory.ELECTRICAL,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=35000.0,
            labor_cost=5000.0,
            equipment_cost=1000.0
        ),
        productivity=ProductivityRate(
            output_per_day=1.5,
            unit='لوحة',
            crew_size=3,
            equipment='Crane',
            working_hours=8.0
        ),
        remarks='1-2 panels/day range'
    ),
    
    'ELEC-004': ConstructionActivity(
        code='ELEC-004',
        name_ar='عمود LED 12 م (كامل)',
        name_en='LED Pole 12 m (Complete)',
        unit='عمود',
        category=ActivityCategory.ELECTRICAL,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=6860.0,  # 70% of 9800
            labor_cost=1960.0,     # 20% of 9800
            equipment_cost=980.0   # 10% of 9800
        ),
        productivity=ProductivityRate(
            output_per_day=3.0,
            unit='عمود',
            crew_size=4,
            equipment='Crane + Concrete truck',
            working_hours=8.0
        ),
        achieved_rate=9800.0,
        remarks='Complete installation with foundation'
    ),
    
    # =========================================================================
    # STEEL STRUCTURE
    # =========================================================================
    
    'STEEL-001': ConstructionActivity(
        code='STEEL-001',
        name_ar='شبك 2.5 مم مجلفن',
        name_en='Mesh 2.5 mm Galvanized',
        unit='م',
        category=ActivityCategory.REINFORCEMENT,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=28.0,
            labor_cost=12.0,
            equipment_cost=3.0
        ),
        productivity=ProductivityRate(
            output_per_day=90.0,
            unit='م',
            crew_size=2,
            equipment='Cutter + Welder',
            working_hours=8.0
        ),
        remarks='80-100 m/day range'
    ),
    
    'STEEL-002': ConstructionActivity(
        code='STEEL-002',
        name_ar='عمود H-Beam 60×60',
        name_en='Column H-Beam 60×60',
        unit='عمود',
        category=ActivityCategory.REINFORCEMENT,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=120.0,
            labor_cost=60.0,
            equipment_cost=20.0
        ),
        productivity=ProductivityRate(
            output_per_day=22.5,
            unit='عمود',
            crew_size=3,
            equipment='Crane + Welder',
            working_hours=8.0
        ),
        remarks='20-25 columns/day range'
    ),
    
    'STEEL-003': ConstructionActivity(
        code='STEEL-003',
        name_ar='كمرة علوية 48×3',
        name_en='Top Beam 48×3',
        unit='م',
        category=ActivityCategory.REINFORCEMENT,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=25.0,
            labor_cost=10.0,
            equipment_cost=3.0
        ),
        productivity=ProductivityRate(
            output_per_day=100.0,
            unit='م',
            crew_size=2,
            equipment='Welder',
            working_hours=8.0
        ),
        remarks='Fast installation'
    ),
    
    'STEEL-004': ConstructionActivity(
        code='STEEL-004',
        name_ar='مقاعد ستانلس ستيل',
        name_en='Stainless Steel Benches',
        unit='عدد',
        category=ActivityCategory.LANDSCAPING,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=1449.0,  # 70% of 2070
            labor_cost=414.0,      # 20% of 2070
            equipment_cost=207.0   # 10% of 2070
        ),
        productivity=ProductivityRate(
            output_per_day=4.0,
            unit='عدد',
            crew_size=2,
            equipment='Welder + Tools',
            working_hours=8.0
        ),
        bid_range=(2050.0, 2100.0),
        achieved_rate=2070.0,
        remarks='Custom fabrication'
    ),
    
    'STEEL-005': ConstructionActivity(
        code='STEEL-005',
        name_ar='مزراب ستانلس',
        name_en='Stainless Gutter',
        unit='m',
        category=ActivityCategory.WATERPROOFING,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=339.5,   # 70% of 485
            labor_cost=97.0,       # 20% of 485
            equipment_cost=48.5    # 10% of 485
        ),
        productivity=ProductivityRate(
            output_per_day=180.0,
            unit='m',
            crew_size=3,
            equipment='Welder + Lift',
            working_hours=8.0
        ),
        achieved_rate=485.0,
        remarks='Water treatment facility'
    ),
    
    'STEEL-006': ConstructionActivity(
        code='STEEL-006',
        name_ar='قناة سكة مدمجة',
        name_en='Embedded Rail Channel',
        unit='m',
        category=ActivityCategory.RAIL,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=1225.0,  # 70% of 1750
            labor_cost=350.0,      # 20% of 1750
            equipment_cost=175.0   # 10% of 1750
        ),
        productivity=ProductivityRate(
            output_per_day=60.0,
            unit='m',
            crew_size=4,
            equipment='Welder + Grinder',
            working_hours=10.0
        ),
        achieved_rate=1750.0,
        remarks='Precision rail installation'
    ),
    
    # =========================================================================
    # DEEP FOUNDATIONS
    # =========================================================================
    
    'FOUND-001': ConstructionActivity(
        code='FOUND-001',
        name_ar='خوازيق محفورة 1.2 م (25 م)',
        name_en='Bored Piles 1.2 m dia (25 m)',
        unit='m',
        category=ActivityCategory.DEEP_FOUNDATION,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=546.0,   # 70% of 780
            labor_cost=156.0,      # 20% of 780
            equipment_cost=78.0    # 10% of 780
        ),
        productivity=ProductivityRate(
            output_per_day=30.0,
            unit='m',
            crew_size=6,
            equipment='Piling rig',
            working_hours=10.0
        ),
        achieved_rate=780.0,
        quantity_range=(4000, 5000),
        remarks='25m deep piles'
    ),
    
    'FOUND-002': ConstructionActivity(
        code='FOUND-002',
        name_ar='خوازيق متداخلة Ø900',
        name_en='Secant Piles Ø900',
        unit='m',
        category=ActivityCategory.DEEP_FOUNDATION,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=455.0,   # 70% of 650
            labor_cost=130.0,      # 20% of 650
            equipment_cost=65.0    # 10% of 650
        ),
        productivity=ProductivityRate(
            output_per_day=25.0,
            unit='m',
            crew_size=6,
            equipment='Piling rig + Crane',
            working_hours=10.0
        ),
        bid_range=(645.0, 670.0),
        achieved_rate=650.0,
        remarks='Retaining wall system'
    ),
    
    'FOUND-003': ConstructionActivity(
        code='FOUND-003',
        name_ar='أوتاد أحادية 800 مم',
        name_en='Monopiles 800 mm dia',
        unit='m',
        category=ActivityCategory.MARINE,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=2065.0,  # 70% of 2950
            labor_cost=590.0,      # 20% of 2950
            equipment_cost=295.0   # 10% of 2950
        ),
        productivity=ProductivityRate(
            output_per_day=24.0,
            unit='m',
            crew_size=8,
            equipment='Barge + Piling hammer',
            working_hours=10.0
        ),
        achieved_rate=2950.0,
        remarks='Marine foundation, offshore'
    ),
    
    # =========================================================================
    # MARINE WORKS
    # =========================================================================
    
    'MARINE-001': ConstructionActivity(
        code='MARINE-001',
        name_ar='صخور حماية rip-rap (1-3 طن)',
        name_en='Rock Rip-rap Armour (1-3 t)',
        unit='m³',
        category=ActivityCategory.MARINE,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=133.0,   # 70% of 190
            labor_cost=38.0,       # 20% of 190
            equipment_cost=19.0    # 10% of 190
        ),
        productivity=ProductivityRate(
            output_per_day=500.0,
            unit='m³',
            crew_size=6,
            equipment='Barge + Crane',
            working_hours=10.0
        ),
        achieved_rate=190.0,
        quantity_range=(15000, 20000),
        remarks='Coastal protection'
    ),
    
    'MARINE-002': ConstructionActivity(
        code='MARINE-002',
        name_ar='حجر درع 8-10 طن',
        name_en='Armour Stone 8-10 t',
        unit='m³',
        category=ActivityCategory.MARINE,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=168.0,   # 70% of 240
            labor_cost=48.0,       # 20% of 240
            equipment_cost=24.0    # 10% of 240
        ),
        productivity=ProductivityRate(
            output_per_day=600.0,
            unit='m³',
            crew_size=8,
            equipment='Barge + Heavy crane',
            working_hours=10.0
        ),
        achieved_rate=240.0,
        remarks='Heavy armor, breakwater'
    ),
    
    'MARINE-003': ConstructionActivity(
        code='MARINE-003',
        name_ar='نقل الشعاب المرجانية',
        name_en='Coral Reef Relocation',
        unit='m²',
        category=ActivityCategory.MARINE,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=266.0,   # 70% of 380
            labor_cost=76.0,       # 20% of 380
            equipment_cost=38.0    # 10% of 380
        ),
        productivity=ProductivityRate(
            output_per_day=120.0,
            unit='m²',
            crew_size=6,
            equipment='Diving equipment + Barge',
            working_hours=8.0
        ),
        achieved_rate=380.0,
        remarks='Environmental protection, specialized divers'
    ),
    
    # =========================================================================
    # TUNNELING
    # =========================================================================
    
    'TUNNEL-001': ConstructionActivity(
        code='TUNNEL-001',
        name_ar='حفر TBM Ø9 م',
        name_en='TBM Excavation Ø9 m',
        unit='m',
        category=ActivityCategory.TUNNELING,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=6860.0,  # 70% of 9800
            labor_cost=1960.0,     # 20% of 9800
            equipment_cost=980.0   # 10% of 9800
        ),
        productivity=ProductivityRate(
            output_per_day=12.0,
            unit='m',
            crew_size=20,
            equipment='TBM machine',
            working_hours=24.0
        ),
        achieved_rate=9800.0,
        quantity_range=(2000, 2500),
        remarks='Tunnel boring machine, 24hr operation'
    ),
    
    'TUNNEL-002': ConstructionActivity(
        code='TUNNEL-002',
        name_ar='قطاع خرساني مسبق الصب 400 مم',
        name_en='Precast RC Segment 400 mm',
        unit='ring',
        category=ActivityCategory.TUNNELING,
        complexity=ComplexityLevel.MEGA_PROJECT,
        cost=CostBreakdown(
            material_cost=12950.0, # 70% of 18500
            labor_cost=3700.0,     # 20% of 18500
            equipment_cost=1850.0  # 10% of 18500
        ),
        productivity=ProductivityRate(
            output_per_day=6.0,
            unit='ring',
            crew_size=8,
            equipment='Erector + TBM',
            working_hours=24.0
        ),
        achieved_rate=18500.0,
        quantity_range=(1500, 2000),
        remarks='Tunnel lining, continuous operation'
    ),
    
    # =========================================================================
    # WATERPROOFING & INSULATION
    # =========================================================================
    
    'WATER-001': ConstructionActivity(
        code='WATER-001',
        name_ar='معالجة خرسانة',
        name_en='Concrete Curing',
        unit='m²',
        category=ActivityCategory.WATERPROOFING,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=0.60,
            labor_cost=3.30,
            equipment_cost=0.0
        ),
        productivity=ProductivityRate(
            output_per_day=200.0,
            unit='m²',
            crew_size=2,
            equipment='Sprayer',
            working_hours=8.0
        ),
        remarks='Curing compound application'
    ),
    
    'WATER-002': ConstructionActivity(
        code='WATER-002',
        name_ar='بطانة HDPE 1.5 مم',
        name_en='HDPE Liner 1.5 mm',
        unit='m²',
        category=ActivityCategory.WATERPROOFING,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=29.4,    # 70% of 42
            labor_cost=8.4,        # 20% of 42
            equipment_cost=4.2     # 10% of 42
        ),
        productivity=ProductivityRate(
            output_per_day=1200.0,
            unit='m²',
            crew_size=6,
            equipment='Welder',
            working_hours=10.0
        ),
        achieved_rate=42.0,
        remarks='Large crew, high productivity'
    ),
    
    'WATER-003': ConstructionActivity(
        code='WATER-003',
        name_ar='عزل XPS 50 مم',
        name_en='Insulation XPS 50 mm',
        unit='m²',
        category=ActivityCategory.WATERPROOFING,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=26.6,    # 70% of 38
            labor_cost=7.6,        # 20% of 38
            equipment_cost=3.8     # 10% of 38
        ),
        productivity=ProductivityRate(
            output_per_day=450.0,
            unit='m²',
            crew_size=3,
            equipment='Cutter',
            working_hours=8.0
        ),
        achieved_rate=38.0,
        remarks='Thermal insulation'
    ),
    
    'WATER-004': ConstructionActivity(
        code='WATER-004',
        name_ar='جيوتكستايل + طبقة ترشيح',
        name_en='Geotextile + Filter Layer',
        unit='m²',
        category=ActivityCategory.WATERPROOFING,
        complexity=ComplexityLevel.SIMPLE,
        cost=CostBreakdown(
            material_cost=18.9,    # 70% of 27
            labor_cost=5.4,        # 20% of 27
            equipment_cost=2.7     # 10% of 27
        ),
        productivity=ProductivityRate(
            output_per_day=800.0,
            unit='m²',
            crew_size=4,
            equipment='Roller',
            working_hours=8.0
        ),
        achieved_rate=27.0,
        quantity_range=(35000, 45000),
        remarks='Large area coverage'
    ),
    
    # =========================================================================
    # LANDSCAPING & RECREATIONAL
    # =========================================================================
    
    'LAND-001': ConstructionActivity(
        code='LAND-001',
        name_ar='أسفلت مطاطي 40 مم',
        name_en='Rubberized Asphalt 40 mm',
        unit='m²',
        category=ActivityCategory.LANDSCAPING,
        complexity=ComplexityLevel.MEDIUM,
        cost=CostBreakdown(
            material_cost=66.5,    # 70% of 95
            labor_cost=19.0,       # 20% of 95
            equipment_cost=9.5     # 10% of 95
        ),
        productivity=ProductivityRate(
            output_per_day=300.0,
            unit='m²',
            crew_size=5,
            equipment='Paver + Roller',
            working_hours=8.0
        ),
        achieved_rate=95.0,
        remarks='Sports surface'
    ),
    
    'LAND-002': ConstructionActivity(
        code='LAND-002',
        name_ar='برجولة خشبية للنزهات',
        name_en='Picnic Pergola Timber',
        unit='m²',
        category=ActivityCategory.LANDSCAPING,
        complexity=ComplexityLevel.COMPLEX,
        cost=CostBreakdown(
            material_cost=840.0,   # 70% of 1200
            labor_cost=240.0,      # 20% of 1200
            equipment_cost=120.0   # 10% of 1200
        ),
        productivity=ProductivityRate(
            output_per_day=8.0,
            unit='m²',
            crew_size=4,
            equipment='Crane + Tools',
            working_hours=8.0
        ),
        achieved_rate=1200.0,
        remarks='Custom timber structure'
    ),
}


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def get_activities_by_category(category: ActivityCategory) -> List[ConstructionActivity]:
    """Get all activities in a specific category"""
    return [
        activity for activity in COST_DATABASE.values()
        if activity.category == category
    ]


def get_activities_by_complexity(complexity: ComplexityLevel) -> List[ConstructionActivity]:
    """Get all activities of a specific complexity level"""
    return [
        activity for activity in COST_DATABASE.values()
        if activity.complexity == complexity
    ]


def search_activities(query: str) -> List[ConstructionActivity]:
    """Search activities by name (Arabic or English)"""
    query_lower = query.lower()
    return [
        activity for activity in COST_DATABASE.values()
        if query_lower in activity.name_ar.lower() or query_lower in activity.name_en.lower()
    ]


def get_activity_by_code(code: str) -> Optional[ConstructionActivity]:
    """Get activity by its code"""
    return COST_DATABASE.get(code)


def calculate_total_cost(activities: List[Tuple[str, float]]) -> Dict[str, float]:
    """
    Calculate total cost for multiple activities.
    
    Args:
        activities: List of (activity_code, quantity) tuples
        
    Returns:
        Dictionary with cost breakdown
    """
    total_material = 0.0
    total_labor = 0.0
    total_equipment = 0.0
    total_duration_hours = 0.0
    
    for code, quantity in activities:
        activity = get_activity_by_code(code)
        if activity:
            total_material += activity.cost.material_cost * quantity
            total_labor += activity.cost.labor_cost * quantity
            total_equipment += activity.cost.equipment_cost * quantity
            total_duration_hours += (quantity / activity.productivity.output_per_day) * 8
    
    return {
        'material_cost': total_material,
        'labor_cost': total_labor,
        'equipment_cost': total_equipment,
        'total_cost': total_material + total_labor + total_equipment,
        'estimated_duration_days': total_duration_hours / 8
    }


def export_to_excel(categories: Optional[List[ActivityCategory]] = None) -> str:
    """
    Export cost database to Excel format (returns CSV string).
    
    Args:
        categories: Optional list of categories to include
        
    Returns:
        CSV string
    """
    import csv
    from io import StringIO
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'Code', 'Name (Arabic)', 'Name (English)', 'Unit', 'Category',
        'Material Cost', 'Labor Cost', 'Equipment Cost', 'Total Cost',
        'Productivity (per day)', 'Man-hours per unit', 'Crew Size'
    ])
    
    # Data
    for activity in COST_DATABASE.values():
        if categories and activity.category not in categories:
            continue
        
        writer.writerow([
            activity.code,
            activity.name_ar,
            activity.name_en,
            activity.unit,
            activity.category.value,
            activity.cost.material_cost,
            activity.cost.labor_cost,
            activity.cost.equipment_cost,
            activity.unit_rate,
            activity.productivity.output_per_day,
            activity.productivity.man_hours_per_unit,
            activity.productivity.crew_size
        ])
    
    return output.getvalue()


# ==============================================================================
# SUMMARY STATISTICS
# ==============================================================================

def get_database_statistics() -> Dict[str, any]:
    """Get comprehensive statistics about the cost database"""
    stats = {
        'total_activities': len(COST_DATABASE),
        'by_category': {},
        'by_complexity': {},
        'cost_ranges': {
            'min_unit_rate': float('inf'),
            'max_unit_rate': 0.0,
            'avg_unit_rate': 0.0
        },
        'productivity_ranges': {
            'min_output': float('inf'),
            'max_output': 0.0
        }
    }
    
    # Count by category
    for category in ActivityCategory:
        count = len(get_activities_by_category(category))
        if count > 0:
            stats['by_category'][category.value] = count
    
    # Count by complexity
    for complexity in ComplexityLevel:
        count = len(get_activities_by_complexity(complexity))
        if count > 0:
            stats['by_complexity'][complexity.value] = count
    
    # Cost and productivity ranges
    total_rate = 0.0
    for activity in COST_DATABASE.values():
        rate = activity.unit_rate
        output = activity.productivity.output_per_day
        
        stats['cost_ranges']['min_unit_rate'] = min(stats['cost_ranges']['min_unit_rate'], rate)
        stats['cost_ranges']['max_unit_rate'] = max(stats['cost_ranges']['max_unit_rate'], rate)
        total_rate += rate
        
        stats['productivity_ranges']['min_output'] = min(stats['productivity_ranges']['min_output'], output)
        stats['productivity_ranges']['max_output'] = max(stats['productivity_ranges']['max_output'], output)
    
    stats['cost_ranges']['avg_unit_rate'] = total_rate / len(COST_DATABASE)
    
    return stats


if __name__ == "__main__":
    # Print database statistics
    stats = get_database_statistics()
    print("=" * 60)
    print("📊 COMPREHENSIVE COST DATABASE STATISTICS")
    print("=" * 60)
    print(f"Total Activities: {stats['total_activities']}")
    print(f"\nBy Category:")
    for category, count in stats['by_category'].items():
        print(f"  - {category}: {count}")
    print(f"\nBy Complexity:")
    for complexity, count in stats['by_complexity'].items():
        print(f"  - {complexity}: {count}")
    print(f"\nCost Ranges:")
    print(f"  - Min Unit Rate: {stats['cost_ranges']['min_unit_rate']:.2f} SAR")
    print(f"  - Max Unit Rate: {stats['cost_ranges']['max_unit_rate']:.2f} SAR")
    print(f"  - Avg Unit Rate: {stats['cost_ranges']['avg_unit_rate']:.2f} SAR")
    print("=" * 60)
