"""
Construction Performance Analyzer
==================================
Comprehensive system for analyzing construction costs and productivity
based on real project data.

Key Features:
1. Unit Cost Variance Analysis (±8% threshold)
2. Daily Output Comparison
3. Price-Time Matrix Generation
4. Benchmark Database Management

Author: Noufal Engineering System
Version: 2.0.0
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
from datetime import datetime, timedelta
import json


class VarianceLevel(Enum):
    """Cost variance severity levels"""
    ACCEPTABLE = "acceptable"      # Within ±8%
    WARNING = "warning"             # ±8% to ±15%
    CRITICAL = "critical"           # > ±15%


class PerformanceStatus(Enum):
    """Productivity performance status"""
    EXCELLENT = "excellent"  # > 120% of benchmark
    GOOD = "good"           # 100-120% of benchmark
    AVERAGE = "average"     # 80-100% of benchmark
    POOR = "poor"           # < 80% of benchmark


@dataclass
class CostVarianceAnalysis:
    """Analysis of cost variance from benchmark"""
    item_name: str
    benchmark_rate: float
    tender_rate: float
    variance_percent: float
    variance_level: VarianceLevel
    possible_reasons: List[str]
    recommendations: List[str]
    
    @property
    def variance_amount(self) -> float:
        """Calculate absolute variance"""
        return self.tender_rate - self.benchmark_rate


@dataclass
class ProductivityComparison:
    """Comparison of actual vs benchmark productivity"""
    activity_name: str
    benchmark_output: float
    actual_output: float
    unit: str
    performance_ratio: float  # actual / benchmark
    status: PerformanceStatus
    improvement_suggestions: List[str]
    
    @property
    def delay_days(self) -> float:
        """Calculate delay in days for 1000 units"""
        if self.actual_output > 0:
            benchmark_days = 1000 / self.benchmark_output
            actual_days = 1000 / self.actual_output
            return actual_days - benchmark_days
        return 0.0


@dataclass
class PriceTimeMatrix:
    """Price-Time matrix for value engineering"""
    activity: str
    base_cost: float
    base_duration: float
    unit: str
    scenarios: List[Dict[str, float]] = field(default_factory=list)
    
    def add_scenario(self, name: str, cost: float, duration: float, description: str = ""):
        """Add alternative scenario"""
        self.scenarios.append({
            'name': name,
            'cost': cost,
            'duration': duration,
            'description': description,
            'cost_increase': ((cost - self.base_cost) / self.base_cost) * 100,
            'time_reduction': ((self.base_duration - duration) / self.base_duration) * 100
        })


# ==============================================================================
# COMPREHENSIVE BENCHMARKS DATABASE
# ==============================================================================

EARTHWORK_BENCHMARKS = {
    'excavation_sandy': {
        'name_ar': 'حفر تربة رملية',
        'name_en': 'Sandy Soil Excavation',
        'productivity': {
            'min': 250,
            'max': 300,
            'avg': 275,
            'unit': 'm³/day'
        },
        'cost': {
            'min': 35,
            'max': 40,
            'avg': 37.5,
            'unit': 'SAR/m³'
        },
        'equipment': 'Excavator 1.5 m³ + Loader',
        'crew_size': 3
    },
    'excavation_clay': {
        'name_ar': 'حفر تربة طينية',
        'name_en': 'Clay Soil Excavation',
        'productivity': {
            'min': 180,
            'max': 220,
            'avg': 200,
            'unit': 'm³/day'
        },
        'cost': {
            'min': 45,
            'max': 50,
            'avg': 47.5,
            'unit': 'SAR/m³'
        },
        'equipment': 'Excavator 2.0 m³ + Loader',
        'crew_size': 4
    },
    'excavation_rock': {
        'name_ar': 'حفر تربة صخرية متوسطة',
        'name_en': 'Medium Rock Excavation',
        'productivity': {
            'min': 40,
            'max': 60,
            'avg': 50,
            'unit': 'm³/day'
        },
        'cost': {
            'min': 120,
            'max': 150,
            'avg': 135,
            'unit': 'SAR/m³'
        },
        'equipment': 'Excavator 3.0 m³ + Breaker',
        'crew_size': 4
    },
    'backfill_sandy': {
        'name_ar': 'ردم تربة رملية',
        'name_en': 'Sandy Backfill',
        'productivity': {
            'min': 200,
            'max': 200,
            'avg': 200,
            'unit': 'm³/day'
        },
        'cost': {
            'min': 25,
            'max': 30,
            'avg': 27.5,
            'unit': 'SAR/m³'
        },
        'equipment': 'Loader + Roller',
        'crew_size': 3
    },
    'backfill_clay': {
        'name_ar': 'ردم تربة طينية',
        'name_en': 'Clay Backfill',
        'productivity': {
            'min': 150,
            'max': 150,
            'avg': 150,
            'unit': 'm³/day'
        },
        'cost': {
            'min': 30,
            'max': 35,
            'avg': 32.5,
            'unit': 'SAR/m³'
        },
        'equipment': 'Loader + Roller',
        'crew_size': 3
    }
}

PAINTING_BENCHMARKS = {
    'plastic_interior': {
        'name_ar': 'بلاستيك داخلي 2 وجه',
        'name_en': 'Plastic Interior Paint 2 Coats',
        'productivity': 200,
        'cost': {
            'min': 11,
            'max': 13,
            'avg': 12,
            'unit': 'SAR/m²'
        },
        'coats': 2
    },
    'acrylic_exterior': {
        'name_ar': 'أكريليك خارجي 2 وجه',
        'name_en': 'Acrylic Exterior Paint 2 Coats',
        'productivity': 150,
        'cost': {
            'min': 15,
            'max': 18,
            'avg': 16.5,
            'unit': 'SAR/m²'
        },
        'coats': 2
    },
    'oil_paint': {
        'name_ar': 'بوية زيت 2 وجه',
        'name_en': 'Oil Paint 2 Coats',
        'productivity': 120,
        'cost': {
            'min': 19,
            'max': 22,
            'avg': 20.5,
            'unit': 'SAR/m²'
        },
        'coats': 2
    },
    'waterproof_paint': {
        'name_ar': 'بوية عازلة 1 وجه',
        'name_en': 'Waterproof Paint 1 Coat',
        'productivity': 250,
        'cost': {
            'min': 20,
            'max': 25,
            'avg': 22.5,
            'unit': 'SAR/m²'
        },
        'coats': 1
    }
}

WATERPROOFING_BENCHMARKS = {
    'hot_bitumen_3mm': {
        'name_ar': 'بيتومين ساخن 3 مم',
        'name_en': 'Hot Bitumen 3 mm',
        'productivity': 250,
        'cost': {
            'min': 28,
            'max': 32,
            'avg': 30,
            'unit': 'SAR/m²'
        }
    },
    'app_membrane_4mm': {
        'name_ar': 'APP ممبرين 4 مم',
        'name_en': 'APP Membrane 4 mm',
        'productivity': 350,
        'cost': {
            'min': 38,
            'max': 42,
            'avg': 40,
            'unit': 'SAR/m²'
        }
    },
    'pvc_membrane_1_5mm': {
        'name_ar': 'PVC 1.5 مم (سقف)',
        'name_en': 'PVC Membrane 1.5 mm (Roof)',
        'productivity': 300,
        'cost': {
            'min': 45,
            'max': 50,
            'avg': 47.5,
            'unit': 'SAR/m²'
        }
    }
}

TILES_BENCHMARKS = {
    'ceramic_floor_60x60': {
        'name_ar': 'سيراميك أرضي 60×60',
        'name_en': 'Ceramic Floor 60×60',
        'material_cost': {
            'min': 65,
            'max': 120,
            'avg': 92.5
        },
        'total_installed_cost': {
            'min': 140,
            'max': 180,
            'avg': 160
        }
    },
    'porcelain_60x120': {
        'name_ar': 'بورسلين 60×120',
        'name_en': 'Porcelain 60×120',
        'material_cost': {
            'min': 120,
            'max': 180,
            'avg': 150
        },
        'total_installed_cost': {
            'min': 200,
            'max': 260,
            'avg': 230
        }
    },
    'mosaic_30x30': {
        'name_ar': 'موزايكو 30×30',
        'name_en': 'Mosaic 30×30',
        'material_cost': {
            'min': 45,
            'max': 70,
            'avg': 57.5
        },
        'total_installed_cost': {
            'min': 110,
            'max': 140,
            'avg': 125
        }
    },
    'interlock_6cm': {
        'name_ar': 'إنترلوك 6 سم',
        'name_en': 'Interlock 6 cm',
        'material_cost': {
            'min': 28,
            'max': 35,
            'avg': 31.5
        },
        'total_installed_cost': {
            'min': 65,
            'max': 80,
            'avg': 72.5
        }
    },
    'epdm_rubber_13mm': {
        'name_ar': 'مطاطي EPDM 13 مم',
        'name_en': 'EPDM Rubber 13 mm',
        'material_cost': {
            'min': 150,
            'max': 180,
            'avg': 165
        },
        'total_installed_cost': {
            'min': 220,
            'max': 250,
            'avg': 235
        }
    }
}

BLOCKWORK_BENCHMARKS = {
    'block_15cm': {
        'name_ar': 'طوب 15 سم',
        'name_en': 'Block 15 cm',
        'price_per_1000': 1706,
        'blocks_per_sqm': 56,
        'material_cost_per_sqm': 95
    },
    'block_20cm': {
        'name_ar': 'طوب 20 سم',
        'name_en': 'Block 20 cm',
        'price_per_1000': 1756,
        'blocks_per_sqm': 40,
        'material_cost_per_sqm': 70
    }
}

AGGREGATES_BENCHMARKS = {
    'red_sand_soft': {
        'name_ar': 'رمل أحمر (Soft)',
        'name_en': 'Red Sand (Soft)',
        'fob_price': 39,
        'delivered_price': {
            'min': 54,
            'max': 58,
            'avg': 56
        },
        'max_distance_km': 25
    },
    'white_sand_soft': {
        'name_ar': 'رمل أبيض (Soft)',
        'name_en': 'White Sand (Soft)',
        'fob_price': 84,
        'delivered_price': {
            'min': 100,
            'max': 110,
            'avg': 105
        },
        'max_distance_km': 25
    },
    'gravel_3_4': {
        'name_ar': 'زلط ¾" (Mixed)',
        'name_en': 'Gravel ¾" (Mixed)',
        'fob_price': 54,
        'delivered_price': {
            'min': 70,
            'max': 75,
            'avg': 72.5
        },
        'max_distance_km': 25
    },
    'base_course_2_3': {
        'name_ar': 'أساس حجر 2"-3"',
        'name_en': 'Base Course Stone 2"-3"',
        'fob_price': 46,
        'delivered_price': {
            'min': 62,
            'max': 68,
            'avg': 65
        },
        'max_distance_km': 25
    }
}

CONCRETE_BENCHMARKS = {
    'C20_250kg': {
        'name_ar': 'C20 (250 kg)',
        'name_en': 'C20 (250 kg cement)',
        'fob_price': 196,
        'total_cost': {
            'min': 330,
            'max': 340,
            'avg': 335
        },
        'productivity': {
            'min': 30,
            'max': 40,
            'avg': 35,
            'unit': 'm³/day'
        },
        'equipment': 'Pump + Crew'
    },
    'C30_350kg': {
        'name_ar': 'C30 (350 kg)',
        'name_en': 'C30 (350 kg cement)',
        'fob_price': 215,
        'total_cost': {
            'min': 360,
            'max': 375,
            'avg': 367.5
        },
        'productivity': {
            'min': 30,
            'max': 40,
            'avg': 35,
            'unit': 'm³/day'
        },
        'equipment': 'Pump + Crew'
    },
    'C35_400kg': {
        'name_ar': 'C35 (400 kg)',
        'name_en': 'C35 (400 kg cement)',
        'fob_price': 225,
        'total_cost': {
            'min': 380,
            'max': 395,
            'avg': 387.5
        },
        'productivity': {
            'min': 25,
            'max': 35,
            'avg': 30,
            'unit': 'm³/day'
        },
        'equipment': 'Pump + Crew'
    },
    'C50_500kg': {
        'name_ar': 'C50 (500 kg)',
        'name_en': 'C50 (500 kg cement)',
        'fob_price': 245,
        'total_cost': {
            'min': 415,
            'max': 430,
            'avg': 422.5
        },
        'productivity': {
            'min': 20,
            'max': 30,
            'avg': 25,
            'unit': 'm³/day'
        },
        'equipment': 'Pump + Crew'
    }
}


# ==============================================================================
# ANALYSIS FUNCTIONS
# ==============================================================================

def analyze_cost_variance(item_name: str, benchmark_rate: float, tender_rate: float) -> CostVarianceAnalysis:
    """
    Analyze cost variance according to the ±8% rule.
    
    Args:
        item_name: Activity/item name
        benchmark_rate: Benchmark unit rate
        tender_rate: Tender/actual unit rate
        
    Returns:
        CostVarianceAnalysis with recommendations
    """
    variance_percent = ((tender_rate - benchmark_rate) / benchmark_rate) * 100
    abs_variance = abs(variance_percent)
    
    # Determine variance level
    if abs_variance <= 8:
        level = VarianceLevel.ACCEPTABLE
    elif abs_variance <= 15:
        level = VarianceLevel.WARNING
    else:
        level = VarianceLevel.CRITICAL
    
    # Generate possible reasons
    reasons = []
    recommendations = []
    
    if variance_percent > 8:
        # Higher than benchmark
        reasons = [
            "Quantity: Smaller quantities may increase unit rates",
            "Method: Different construction method used",
            "Location: Remote location increases transport costs",
            "Plant: Inadequate or inefficient equipment",
            "Material: Higher quality materials specified",
            "Labor: Higher wage rates or less skilled workforce",
            "Market: Recent price increases in materials"
        ]
        recommendations = [
            "Review quantity breakdowns and economies of scale",
            "Consider alternative construction methods",
            "Negotiate bulk purchase discounts",
            "Assess equipment efficiency and utilization",
            "Value engineer material specifications",
            "Review labor productivity and training needs"
        ]
    elif variance_percent < -8:
        # Lower than benchmark (may indicate issues)
        reasons = [
            "Quantity: Very large quantities reducing unit costs",
            "Method: More efficient construction method",
            "Plant: Modern, efficient equipment",
            "Competition: Aggressive bidding",
            "Quality: Lower quality materials/workmanship",
            "Risk: Bidder underestimating risks",
            "Incomplete: Missing scope items"
        ]
        recommendations = [
            "Verify scope completeness and specifications",
            "Check quality standards are maintained",
            "Assess contractor's understanding of risks",
            "Review method statements for feasibility",
            "Confirm equipment and labor availability",
            "Consider financial stability of bidder"
        ]
    else:
        reasons = ["Cost is within acceptable benchmark range"]
        recommendations = ["Proceed with confidence, rate is reasonable"]
    
    return CostVarianceAnalysis(
        item_name=item_name,
        benchmark_rate=benchmark_rate,
        tender_rate=tender_rate,
        variance_percent=variance_percent,
        variance_level=level,
        possible_reasons=reasons,
        recommendations=recommendations
    )


def compare_productivity(
    activity_name: str,
    benchmark_output: float,
    actual_output: float,
    unit: str
) -> ProductivityComparison:
    """
    Compare actual productivity with benchmark.
    
    Args:
        activity_name: Name of activity
        benchmark_output: Benchmark output per day
        actual_output: Actual/planned output per day
        unit: Unit of measurement
        
    Returns:
        ProductivityComparison with improvement suggestions
    """
    performance_ratio = (actual_output / benchmark_output) * 100 if benchmark_output > 0 else 0
    
    # Determine status
    if performance_ratio >= 120:
        status = PerformanceStatus.EXCELLENT
    elif performance_ratio >= 100:
        status = PerformanceStatus.GOOD
    elif performance_ratio >= 80:
        status = PerformanceStatus.AVERAGE
    else:
        status = PerformanceStatus.POOR
    
    # Generate improvement suggestions
    suggestions = []
    
    if performance_ratio < 100:
        suggestions = [
            "Plant Size: Check if equipment capacity is adequate",
            "Crew Skill: Assess worker experience and training",
            "Equipment Condition: Verify maintenance and efficiency",
            "Working Hours: Consider extended shifts or overtime",
            "Site Conditions: Evaluate access and workspace constraints",
            "Material Supply: Ensure timely delivery and availability",
            "Weather: Account for weather delays and protection",
            "Method: Review construction method for optimization"
        ]
    elif performance_ratio >= 120:
        suggestions = [
            "Excellent performance - document best practices",
            "Share method with other teams",
            "Consider if quality standards are maintained",
            "Verify actual quantities against recorded output"
        ]
    else:
        suggestions = [
            "Good performance within acceptable range",
            "Monitor continuously to maintain productivity",
            "Look for incremental improvement opportunities"
        ]
    
    return ProductivityComparison(
        activity_name=activity_name,
        benchmark_output=benchmark_output,
        actual_output=actual_output,
        unit=unit,
        performance_ratio=performance_ratio,
        status=status,
        improvement_suggestions=suggestions
    )


def generate_price_time_matrix(
    activity: str,
    base_cost: float,
    base_duration: float,
    unit: str,
    quantity: float = 1000.0
) -> PriceTimeMatrix:
    """
    Generate price-time matrix for value engineering.
    
    Args:
        activity: Activity name
        base_cost: Base unit cost
        base_duration: Base duration for quantity
        unit: Unit of measurement
        quantity: Quantity for analysis (default 1000)
        
    Returns:
        PriceTimeMatrix with scenarios
    """
    matrix = PriceTimeMatrix(
        activity=activity,
        base_cost=base_cost * quantity,
        base_duration=base_duration,
        unit=unit
    )
    
    # Generate scenarios
    # Normal scenario (baseline)
    matrix.add_scenario(
        "Normal Method",
        base_cost * quantity,
        base_duration,
        "Standard construction method with normal equipment"
    )
    
    # Fast track (+30% cost, -40% time)
    matrix.add_scenario(
        "Fast Track",
        base_cost * quantity * 1.30,
        base_duration * 0.60,
        "Larger equipment, extended shifts, premium rates"
    )
    
    # Accelerated (+50% cost, -50% time)
    matrix.add_scenario(
        "Maximum Acceleration",
        base_cost * quantity * 1.50,
        base_duration * 0.50,
        "Maximum resources, 24hr operation, multiple crews"
    )
    
    # Economy (-15% cost, +20% time)
    matrix.add_scenario(
        "Economy Method",
        base_cost * quantity * 0.85,
        base_duration * 1.20,
        "Smaller equipment, single shift, slower pace"
    )
    
    # Value engineered (varies)
    matrix.add_scenario(
        "Value Engineered",
        base_cost * quantity * 0.90,
        base_duration * 0.95,
        "Optimized method, better planning, improved efficiency"
    )
    
    return matrix


# ==============================================================================
# REPORTING FUNCTIONS
# ==============================================================================

def generate_variance_report(analyses: List[CostVarianceAnalysis]) -> str:
    """Generate comprehensive variance report"""
    report = []
    report.append("=" * 80)
    report.append("📊 COST VARIANCE ANALYSIS REPORT")
    report.append("=" * 80)
    report.append("")
    
    # Summary statistics
    total = len(analyses)
    acceptable = sum(1 for a in analyses if a.variance_level == VarianceLevel.ACCEPTABLE)
    warning = sum(1 for a in analyses if a.variance_level == VarianceLevel.WARNING)
    critical = sum(1 for a in analyses if a.variance_level == VarianceLevel.CRITICAL)
    
    report.append(f"Total Items Analyzed: {total}")
    report.append(f"  ✅ Acceptable (±8%): {acceptable} ({acceptable/total*100:.1f}%)")
    report.append(f"  ⚠️  Warning (±8-15%): {warning} ({warning/total*100:.1f}%)")
    report.append(f"  🚨 Critical (>±15%): {critical} ({critical/total*100:.1f}%)")
    report.append("")
    
    # Detailed findings
    for analysis in sorted(analyses, key=lambda x: abs(x.variance_percent), reverse=True):
        icon = "🚨" if analysis.variance_level == VarianceLevel.CRITICAL else \
               "⚠️" if analysis.variance_level == VarianceLevel.WARNING else "✅"
        
        report.append(f"{icon} {analysis.item_name}")
        report.append(f"   Benchmark: {analysis.benchmark_rate:.2f} SAR")
        report.append(f"   Tender: {analysis.tender_rate:.2f} SAR")
        report.append(f"   Variance: {analysis.variance_percent:+.1f}% ({analysis.variance_level.value.upper()})")
        
        if analysis.variance_level != VarianceLevel.ACCEPTABLE:
            report.append(f"   Possible Reasons:")
            for reason in analysis.possible_reasons[:3]:
                report.append(f"     • {reason}")
            report.append(f"   Recommendations:")
            for rec in analysis.recommendations[:2]:
                report.append(f"     → {rec}")
        report.append("")
    
    report.append("=" * 80)
    return "\n".join(report)


def generate_productivity_report(comparisons: List[ProductivityComparison]) -> str:
    """Generate productivity comparison report"""
    report = []
    report.append("=" * 80)
    report.append("⚡ PRODUCTIVITY ANALYSIS REPORT")
    report.append("=" * 80)
    report.append("")
    
    # Summary
    total = len(comparisons)
    excellent = sum(1 for c in comparisons if c.status == PerformanceStatus.EXCELLENT)
    good = sum(1 for c in comparisons if c.status == PerformanceStatus.GOOD)
    average = sum(1 for c in comparisons if c.status == PerformanceStatus.AVERAGE)
    poor = sum(1 for c in comparisons if c.status == PerformanceStatus.POOR)
    
    report.append(f"Total Activities Analyzed: {total}")
    report.append(f"  🌟 Excellent (>120%): {excellent}")
    report.append(f"  ✅ Good (100-120%): {good}")
    report.append(f"  ⚠️  Average (80-100%): {average}")
    report.append(f"  🚨 Poor (<80%): {poor}")
    report.append("")
    
    # Detailed analysis
    for comp in sorted(comparisons, key=lambda x: x.performance_ratio):
        icon = "🌟" if comp.status == PerformanceStatus.EXCELLENT else \
               "✅" if comp.status == PerformanceStatus.GOOD else \
               "⚠️" if comp.status == PerformanceStatus.AVERAGE else "🚨"
        
        report.append(f"{icon} {comp.activity_name}")
        report.append(f"   Benchmark: {comp.benchmark_output:.1f} {comp.unit}/day")
        report.append(f"   Actual: {comp.actual_output:.1f} {comp.unit}/day")
        report.append(f"   Performance: {comp.performance_ratio:.1f}% ({comp.status.value.upper()})")
        
        if comp.performance_ratio < 100:
            delay = comp.delay_days
            report.append(f"   ⏱️  Delay Impact: {delay:.1f} days per 1000 {comp.unit}")
        
        if comp.status != PerformanceStatus.EXCELLENT:
            report.append(f"   Key Improvements:")
            for suggestion in comp.improvement_suggestions[:3]:
                report.append(f"     • {suggestion}")
        report.append("")
    
    report.append("=" * 80)
    return "\n".join(report)


def export_price_time_matrix(matrix: PriceTimeMatrix) -> str:
    """Export price-time matrix in readable format"""
    output = []
    output.append("=" * 80)
    output.append(f"💰 PRICE-TIME MATRIX: {matrix.activity}")
    output.append("=" * 80)
    output.append(f"Base Cost: {matrix.base_cost:,.2f} SAR")
    output.append(f"Base Duration: {matrix.base_duration:.1f} days")
    output.append("")
    output.append(f"{'Scenario':<30} {'Cost (SAR)':<15} {'Duration':<12} {'Cost Δ%':<10} {'Time Δ%'}")
    output.append("-" * 80)
    
    for scenario in matrix.scenarios:
        output.append(
            f"{scenario['name']:<30} "
            f"{scenario['cost']:>13,.0f}  "
            f"{scenario['duration']:>10.1f}d  "
            f"{scenario['cost_increase']:>+8.1f}%  "
            f"{scenario['time_reduction']:>+7.1f}%"
        )
        output.append(f"  → {scenario['description']}")
        output.append("")
    
    output.append("=" * 80)
    output.append("💡 Use this matrix for:")
    output.append("   • Value engineering decisions")
    output.append("   • Acceleration cost estimation")
    output.append("   • Delay claim calculations")
    output.append("   • Alternative method evaluation")
    output.append("=" * 80)
    
    return "\n".join(output)


# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

if __name__ == "__main__":
    print("\n🔍 CONSTRUCTION PERFORMANCE ANALYZER - DEMO\n")
    
    # Example 1: Cost Variance Analysis
    print("Example 1: Cost Variance Analysis")
    print("-" * 50)
    
    variance1 = analyze_cost_variance(
        "Excavation - Sandy Soil",
        benchmark_rate=37.5,
        tender_rate=42.0
    )
    
    variance2 = analyze_cost_variance(
        "C30 Concrete",
        benchmark_rate=367.5,
        tender_rate=425.0
    )
    
    print(generate_variance_report([variance1, variance2]))
    
    # Example 2: Productivity Comparison
    print("\n\nExample 2: Productivity Comparison")
    print("-" * 50)
    
    prod1 = compare_productivity(
        "Sandy Soil Excavation",
        benchmark_output=275,
        actual_output=220,
        unit="m³"
    )
    
    prod2 = compare_productivity(
        "Plastic Paint Interior",
        benchmark_output=200,
        actual_output=240,
        unit="m²"
    )
    
    print(generate_productivity_report([prod1, prod2]))
    
    # Example 3: Price-Time Matrix
    print("\n\nExample 3: Price-Time Matrix")
    print("-" * 50)
    
    matrix = generate_price_time_matrix(
        activity="C30 Concrete Columns",
        base_cost=485,
        base_duration=28.6,  # 1000 m³ / 35 m³/day
        unit="m³",
        quantity=1000
    )
    
    print(export_price_time_matrix(matrix))
    
    print("\n✅ Demo completed successfully!")
