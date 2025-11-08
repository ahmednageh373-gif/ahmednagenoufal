"""
Construction Performance Equations and Productivity Calculator
================================================================
معادلات الأداء الإنشائي وحاسبة الإنتاجية

This module provides comprehensive performance equations for construction activities
based on industry standards and real project data.

Features:
- Productivity rate calculations
- Man-hours estimation
- Duration forecasting
- Resource optimization
- Cost-performance analysis

Author: Noufal Engineering System
Version: 1.0.0
Date: 2025-11-07
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
import math


# ==============================================================================
# ENUMS & CONSTANTS
# ==============================================================================

class ActivityCategory(Enum):
    """Construction activity categories"""
    CONCRETE = "concrete"           # الخرسانة
    STEEL = "steel"                # الحديد
    FORMWORK = "formwork"          # القوالب
    MASONRY = "masonry"            # البناء
    TILES = "tiles"                # البلاط
    PLUMBING = "plumbing"          # السباكة
    ELECTRICAL = "electrical"       # الكهرباء
    FINISHING = "finishing"         # التشطيبات


class ProductivityFactor(Enum):
    """Factors affecting productivity"""
    WEATHER = "weather"             # الطقس
    SITE_ACCESS = "site_access"     # الوصول للموقع
    CREW_EXPERIENCE = "crew_experience"  # خبرة الفريق
    EQUIPMENT = "equipment"         # المعدات
    COORDINATION = "coordination"   # التنسيق


# ==============================================================================
# DATA MODELS
# ==============================================================================

@dataclass
class ProductivityRate:
    """Productivity rate for construction activity"""
    activity_name: str
    unit: str
    min_rate: float  # Minimum production per day
    max_rate: float  # Maximum production per day
    avg_rate: float  # Average production per day
    man_hours_per_unit: float
    crew_size: int
    category: ActivityCategory
    
    @property
    def daily_hours(self) -> float:
        """Calculate daily working hours"""
        return self.avg_rate * self.man_hours_per_unit
    
    @property
    def productivity_range(self) -> Tuple[float, float]:
        """Get productivity range"""
        return (self.min_rate, self.max_rate)


@dataclass
class PerformanceEquation:
    """Performance equation for activity"""
    activity_name: str
    formula: str
    variables: Dict[str, str]
    example: Dict[str, float]
    result_unit: str
    notes: str = ""


@dataclass
class DurationCalculation:
    """Duration calculation result"""
    activity_name: str
    total_quantity: float
    unit: str
    crew_size: int
    productivity_rate: float
    total_man_hours: float
    duration_days: float
    duration_with_buffer: float
    buffer_percentage: float = 10.0


# ==============================================================================
# PRODUCTIVITY DATABASE
# ==============================================================================

PRODUCTIVITY_RATES: Dict[str, ProductivityRate] = {
    # Concrete Activities (أعمال الخرسانة)
    'خرسانة جاهزة': ProductivityRate(
        activity_name='خرسانة جاهزة',
        unit='م³',
        min_rate=30.0,
        max_rate=40.0,
        avg_rate=35.0,
        man_hours_per_unit=0.2,
        crew_size=5,
        category=ActivityCategory.CONCRETE
    ),
    'نقل & ضخ': ProductivityRate(
        activity_name='نقل & ضخ خرسانة',
        unit='م³',
        min_rate=25.0,
        max_rate=35.0,
        avg_rate=30.0,
        man_hours_per_unit=1.8,
        crew_size=3,
        category=ActivityCategory.CONCRETE
    ),
    'هز & طرطشة': ProductivityRate(
        activity_name='هز & طرطشة خرسانة',
        unit='م³',
        min_rate=20.0,
        max_rate=30.0,
        avg_rate=25.0,
        man_hours_per_unit=0.68,
        crew_size=2,
        category=ActivityCategory.CONCRETE
    ),
    
    # Steel Activities (أعمال الحديد)
    'حديد تسليح': ProductivityRate(
        activity_name='حديد تسليح',
        unit='طن',
        min_rate=1.0,
        max_rate=1.2,
        avg_rate=1.1,
        man_hours_per_unit=7.27,
        crew_size=4,
        category=ActivityCategory.STEEL
    ),
    'حديد': ProductivityRate(
        activity_name='حديد (عام)',
        unit='طن',
        min_rate=0.8,
        max_rate=1.0,
        avg_rate=0.9,
        man_hours_per_unit=85.0,
        crew_size=6,
        category=ActivityCategory.STEEL
    ),
    
    # Formwork Activities (أعمال القوالب)
    'قوالب بروبلكوب': ProductivityRate(
        activity_name='قوالب بروبلكوب',
        unit='م²',
        min_rate=8.0,
        max_rate=10.0,
        avg_rate=9.0,
        man_hours_per_unit=0.89,
        crew_size=4,
        category=ActivityCategory.FORMWORK
    ),
    'قوالب': ProductivityRate(
        activity_name='قوالب (عام)',
        unit='م²',
        min_rate=10.0,
        max_rate=15.0,
        avg_rate=12.5,
        man_hours_per_unit=0.37,
        crew_size=3,
        category=ActivityCategory.FORMWORK
    ),
    
    # Masonry Activities (أعمال البناء)
    'طوب 20×20×40': ProductivityRate(
        activity_name='طوب 20×20×40',
        unit='م²',
        min_rate=10.0,
        max_rate=14.0,
        avg_rate=12.0,
        man_hours_per_unit=0.67,
        crew_size=2,
        category=ActivityCategory.MASONRY
    ),
    'طوب 15×20×40': ProductivityRate(
        activity_name='طوب 15×20×40',
        unit='م²',
        min_rate=12.0,
        max_rate=16.0,
        avg_rate=14.4,
        man_hours_per_unit=0.56,
        crew_size=2,
        category=ActivityCategory.MASONRY
    ),
    'المونة الأسمنتية': ProductivityRate(
        activity_name='المونة الأسمنتية',
        unit='م²',
        min_rate=80.0,
        max_rate=120.0,
        avg_rate=100.0,
        man_hours_per_unit=0.05,
        crew_size=2,
        category=ActivityCategory.MASONRY
    ),
    
    # Tiles & Flooring (البلاط والأرضيات)
    'بلاط بورسلين 60×60': ProductivityRate(
        activity_name='بلاط بورسلين 60×60',
        unit='م²',
        min_rate=25.0,
        max_rate=30.0,
        avg_rate=27.5,
        man_hours_per_unit=0.29,
        crew_size=2,
        category=ActivityCategory.TILES
    ),
    'بلاط سيراميك 30×30': ProductivityRate(
        activity_name='بلاط سيراميك 30×30',
        unit='م²',
        min_rate=35.0,
        max_rate=40.0,
        avg_rate=37.5,
        man_hours_per_unit=0.21,
        crew_size=2,
        category=ActivityCategory.TILES
    ),
    'بلاط مطاطي': ProductivityRate(
        activity_name='بلاط مطاطي',
        unit='م²',
        min_rate=20.0,
        max_rate=25.0,
        avg_rate=22.5,
        man_hours_per_unit=0.36,
        crew_size=2,
        category=ActivityCategory.TILES
    ),
    
    # Plumbing (السباكة)
    'UPVC 110 مم': ProductivityRate(
        activity_name='UPVC 110 مم',
        unit='م',
        min_rate=60.0,
        max_rate=80.0,
        avg_rate=70.0,
        man_hours_per_unit=0.11,
        crew_size=2,
        category=ActivityCategory.PLUMBING
    ),
    'HDPE 160 مم': ProductivityRate(
        activity_name='HDPE 160 مم',
        unit='م',
        min_rate=40.0,
        max_rate=60.0,
        avg_rate=50.0,
        man_hours_per_unit=0.16,
        crew_size=2,
        category=ActivityCategory.PLUMBING
    ),
    'manhole 1.2 م': ProductivityRate(
        activity_name='manhole 1.2 م',
        unit='وحدة',
        min_rate=2.0,
        max_rate=3.0,
        avg_rate=2.5,
        man_hours_per_unit=3.2,
        crew_size=4,
        category=ActivityCategory.PLUMBING
    ),
    
    # Electrical (الكهرباء)
    'قابس 16 أمبير': ProductivityRate(
        activity_name='قابس 16 أمبير',
        unit='نقطة',
        min_rate=15.0,
        max_rate=20.0,
        avg_rate=17.5,
        man_hours_per_unit=0.46,
        crew_size=1,
        category=ActivityCategory.ELECTRICAL
    ),
    'سبوت لايت LED': ProductivityRate(
        activity_name='سبوت لايت LED',
        unit='نقطة',
        min_rate=20.0,
        max_rate=25.0,
        avg_rate=22.5,
        man_hours_per_unit=0.36,
        crew_size=1,
        category=ActivityCategory.ELECTRICAL
    ),
    'لوحة توزيع رئيسية': ProductivityRate(
        activity_name='لوحة توزيع رئيسية',
        unit='لوحة',
        min_rate=1.0,
        max_rate=2.0,
        avg_rate=1.5,
        man_hours_per_unit=5.33,
        crew_size=2,
        category=ActivityCategory.ELECTRICAL
    ),
}


# ==============================================================================
# PERFORMANCE EQUATIONS
# ==============================================================================

PERFORMANCE_EQUATIONS: Dict[str, PerformanceEquation] = {
    'concrete_volume': PerformanceEquation(
        activity_name='حجم الخرسانة',
        formula='Volume = Length × Width × Height',
        variables={
            'Length': 'الطول (م)',
            'Width': 'العرض (م)',
            'Height': 'الارتفاع (م)'
        },
        example={'Length': 10.0, 'Width': 5.0, 'Height': 0.3},
        result_unit='م³',
        notes='لحساب حجم بلاطة خرسانية'
    ),
    
    'rebar_weight': PerformanceEquation(
        activity_name='وزن الحديد',
        formula='Weight = (D² × L × 0.00617) / 1000',
        variables={
            'D': 'قطر الحديد (مم)',
            'L': 'الطول الإجمالي (م)'
        },
        example={'D': 16.0, 'L': 100.0},
        result_unit='طن',
        notes='D² × L × 0.00617 = كجم، ÷ 1000 = طن'
    ),
    
    'formwork_area': PerformanceEquation(
        activity_name='مساحة القوالب',
        formula='Area = 2 × (Length + Width) × Height',
        variables={
            'Length': 'الطول (م)',
            'Width': 'العرض (م)',
            'Height': 'الارتفاع (م)'
        },
        example={'Length': 10.0, 'Width': 5.0, 'Height': 0.3},
        result_unit='م²',
        notes='لحساب مساحة قوالب الكمرات أو الجدران'
    ),
    
    'man_hours': PerformanceEquation(
        activity_name='ساعات العمل',
        formula='Man-Hours = Quantity × Rate',
        variables={
            'Quantity': 'الكمية',
            'Rate': 'معدل الإنتاج (ساعة/وحدة)'
        },
        example={'Quantity': 100.0, 'Rate': 0.2},
        result_unit='ساعة',
        notes='إجمالي ساعات العمل المطلوبة'
    ),
    
    'duration_days': PerformanceEquation(
        activity_name='المدة بالأيام',
        formula='Days = Man-Hours / (Crew Size × Hours per Day)',
        variables={
            'Man-Hours': 'إجمالي ساعات العمل',
            'Crew Size': 'عدد العمال',
            'Hours per Day': 'ساعات العمل اليومية (عادة 8)'
        },
        example={'Man-Hours': 100.0, 'Crew Size': 5.0, 'Hours per Day': 8.0},
        result_unit='يوم',
        notes='المدة الفعلية لإنجاز النشاط'
    ),
    
    'productivity_efficiency': PerformanceEquation(
        activity_name='كفاءة الإنتاجية',
        formula='Efficiency = (Actual Output / Planned Output) × 100',
        variables={
            'Actual Output': 'الإنتاج الفعلي',
            'Planned Output': 'الإنتاج المخطط'
        },
        example={'Actual Output': 32.0, 'Planned Output': 35.0},
        result_unit='%',
        notes='نسبة الإنتاجية الفعلية إلى المخططة'
    ),
    
    'cost_per_unit': PerformanceEquation(
        activity_name='التكلفة للوحدة',
        formula='Cost = Materials + Labor + Equipment',
        variables={
            'Materials': 'تكلفة المواد (ريال)',
            'Labor': 'تكلفة العمالة (ريال)',
            'Equipment': 'تكلفة المعدات (ريال)'
        },
        example={'Materials': 230.0, 'Labor': 70.0, 'Equipment': 30.0},
        result_unit='ريال/وحدة',
        notes='إجمالي التكلفة للوحدة الواحدة'
    ),
}


# ==============================================================================
# CALCULATOR FUNCTIONS
# ==============================================================================

class PerformanceCalculator:
    """Calculator for construction performance and productivity"""
    
    @staticmethod
    def calculate_duration(
        activity_name: str,
        quantity: float,
        crew_size: Optional[int] = None,
        hours_per_day: float = 8.0,
        buffer_percentage: float = 10.0
    ) -> DurationCalculation:
        """
        Calculate duration for activity based on quantity and crew size.
        
        Args:
            activity_name: Name of construction activity
            quantity: Total quantity to execute
            crew_size: Number of workers (if None, uses default from productivity rate)
            hours_per_day: Working hours per day
            buffer_percentage: Safety buffer percentage
            
        Returns:
            DurationCalculation with detailed breakdown
            
        Example:
            >>> calc = PerformanceCalculator()
            >>> result = calc.calculate_duration('خرسانة جاهزة', 100.0)
            >>> print(f"Duration: {result.duration_days} days")
        """
        if activity_name not in PRODUCTIVITY_RATES:
            raise ValueError(f"Activity not found: {activity_name}")
        
        prod_rate = PRODUCTIVITY_RATES[activity_name]
        actual_crew_size = crew_size or prod_rate.crew_size
        
        # Calculate man-hours
        total_man_hours = quantity * prod_rate.man_hours_per_unit
        
        # Calculate duration
        duration_days = total_man_hours / (actual_crew_size * hours_per_day)
        
        # Add buffer
        duration_with_buffer = duration_days * (1 + buffer_percentage / 100)
        
        return DurationCalculation(
            activity_name=activity_name,
            total_quantity=quantity,
            unit=prod_rate.unit,
            crew_size=actual_crew_size,
            productivity_rate=prod_rate.avg_rate,
            total_man_hours=total_man_hours,
            duration_days=duration_days,
            duration_with_buffer=duration_with_buffer,
            buffer_percentage=buffer_percentage
        )
    
    @staticmethod
    def calculate_productivity_efficiency(
        activity_name: str,
        actual_quantity: float,
        duration_days: float,
        crew_size: int
    ) -> Dict[str, float]:
        """
        Calculate actual productivity efficiency.
        
        Args:
            activity_name: Name of activity
            actual_quantity: Actual quantity produced
            duration_days: Actual duration taken
            crew_size: Number of workers used
            
        Returns:
            Dictionary with efficiency metrics
        """
        if activity_name not in PRODUCTIVITY_RATES:
            raise ValueError(f"Activity not found: {activity_name}")
        
        prod_rate = PRODUCTIVITY_RATES[activity_name]
        
        # Expected productivity
        expected_daily_output = prod_rate.avg_rate
        expected_total_output = expected_daily_output * duration_days
        
        # Actual productivity
        actual_daily_output = actual_quantity / duration_days
        
        # Efficiency
        efficiency = (actual_quantity / expected_total_output) * 100 if expected_total_output > 0 else 0
        
        return {
            'expected_daily_output': expected_daily_output,
            'actual_daily_output': actual_daily_output,
            'efficiency_percentage': efficiency,
            'productivity_variance': actual_daily_output - expected_daily_output,
            'total_man_hours_used': duration_days * crew_size * 8
        }
    
    @staticmethod
    def get_activity_info(activity_name: str) -> Optional[ProductivityRate]:
        """Get productivity information for activity."""
        return PRODUCTIVITY_RATES.get(activity_name)
    
    @staticmethod
    def list_activities_by_category(category: ActivityCategory) -> List[ProductivityRate]:
        """List all activities in a specific category."""
        return [
            rate for rate in PRODUCTIVITY_RATES.values()
            if rate.category == category
        ]
    
    @staticmethod
    def get_equation(equation_name: str) -> Optional[PerformanceEquation]:
        """Get performance equation by name."""
        return PERFORMANCE_EQUATIONS.get(equation_name)
    
    @staticmethod
    def calculate_concrete_volume(length: float, width: float, height: float) -> float:
        """Calculate concrete volume (م³)."""
        return length * width * height
    
    @staticmethod
    def calculate_rebar_weight(diameter_mm: float, total_length_m: float) -> float:
        """Calculate rebar weight in tons."""
        weight_kg = (diameter_mm ** 2) * total_length_m * 0.00617
        return weight_kg / 1000  # Convert to tons
    
    @staticmethod
    def calculate_formwork_area(length: float, width: float, height: float) -> float:
        """Calculate formwork area for beams/walls (م²)."""
        return 2 * (length + width) * height


# ==============================================================================
# USAGE EXAMPLE
# ==============================================================================

if __name__ == "__main__":
    calc = PerformanceCalculator()
    
    print("=" * 70)
    print("🏗️  CONSTRUCTION PERFORMANCE CALCULATOR")
    print("=" * 70)
    
    # Example 1: Calculate duration
    print("\n📊 Example 1: Calculate Duration for Concrete")
    print("-" * 70)
    result = calc.calculate_duration('خرسانة جاهزة', quantity=100.0, crew_size=5)
    print(f"Activity: {result.activity_name}")
    print(f"Quantity: {result.total_quantity} {result.unit}")
    print(f"Crew Size: {result.crew_size} workers")
    print(f"Total Man-Hours: {result.total_man_hours:.2f} hours")
    print(f"Duration (without buffer): {result.duration_days:.2f} days")
    print(f"Duration (with {result.buffer_percentage}% buffer): {result.duration_with_buffer:.2f} days")
    
    # Example 2: Calculate efficiency
    print("\n📊 Example 2: Calculate Productivity Efficiency")
    print("-" * 70)
    efficiency = calc.calculate_productivity_efficiency(
        activity_name='بلاط بورسلين 60×60',
        actual_quantity=250.0,
        duration_days=10.0,
        crew_size=2
    )
    print(f"Expected Daily Output: {efficiency['expected_daily_output']:.2f} m²/day")
    print(f"Actual Daily Output: {efficiency['actual_daily_output']:.2f} m²/day")
    print(f"Efficiency: {efficiency['efficiency_percentage']:.2f}%")
    print(f"Variance: {efficiency['productivity_variance']:.2f} m²/day")
    
    # Example 3: Performance equations
    print("\n📊 Example 3: Calculate Rebar Weight")
    print("-" * 70)
    weight = calc.calculate_rebar_weight(diameter_mm=16.0, total_length_m=1000.0)
    print(f"Diameter: 16 mm")
    print(f"Total Length: 1000 m")
    print(f"Weight: {weight:.3f} tons")
    
    print("\n" + "=" * 70)
