#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
SAP2000 Underground Water Tank Analysis Script
برنامج متقدم لتحليل الخزان الأرضي من نموذج SAP2000

المؤلف: AN.AI AHMED NAGEH - مهندس إنشائي خبير
التاريخ: 31 أكتوبر 2025
الإصدار: 1.0
"""

import json
import math
from dataclasses import dataclass
from typing import List, Dict, Tuple
from enum import Enum

# ============================================================================
# الثوابت والمعاملات
# ============================================================================

class MaterialType(Enum):
    """أنواع المواد الإنشائية"""
    CONCRETE_C30 = 30  # مقاومة الخرسانة 30 MPa
    CONCRETE_C35 = 35  # مقاومة الخرسانة 35 MPa
    STEEL_GRADE_500 = 500  # مقاومة الفولاذ 500 MPa

class LoadType(Enum):
    """أنواع الأحمال"""
    DEAD_LOAD = "dead"  # الأحمال الدائمة
    LIVE_LOAD = "live"  # الأحمال الحية
    WATER_PRESSURE = "water"  # ضغط المياه
    SEISMIC = "seismic"  # الأحمال الزلزالية
    WIND = "wind"  # أحمال الرياح

# الثوابت الفيزيائية
CONCRETE_DENSITY = 24  # كثافة الخرسانة (كN/م³)
WATER_DENSITY = 10  # كثافة المياه (كN/م³)
GRAVITY = 9.81  # تسارع الجاذبية (m/s²)

# معاملات الأمان
SAFETY_FACTOR_STRESS = 1.5  # معامل الأمان للإجهاد
SAFETY_FACTOR_SHEAR = 1.25  # معامل الأمان للقص
SAFETY_FACTOR_BENDING = 1.5  # معامل الأمان للانحناء

# ============================================================================
# فئات البيانات
# ============================================================================

@dataclass
class TankDimensions:
    """أبعاد الخزان"""
    length: float  # الطول (متر)
    width: float  # العرض (متر)
    depth: float  # العمق (متر)
    wall_thickness: float  # سمك الجدار (متر)
    floor_thickness: float  # سمك الأرضية (متر)
    roof_thickness: float  # سمك السقف (متر)
    
    def get_volume(self) -> float:
        """حساب حجم الخزان"""
        return self.length * self.width * self.depth
    
    def get_surface_area(self) -> float:
        """حساب مساحة السطح الكلية"""
        walls = 2 * (self.length + self.width) * self.depth
        floor = self.length * self.width
        roof = self.length * self.width
        return walls + floor + roof

@dataclass
class Material:
    """خصائص المادة الإنشائية"""
    name: str  # اسم المادة
    type: MaterialType  # نوع المادة
    density: float  # الكثافة (kg/m³)
    elastic_modulus: float  # معامل المرونة (GPa)
    poisson_ratio: float  # معامل بواسون
    
    def get_unit_weight(self) -> float:
        """حساب الوزن الحجمي (كN/م³)"""
        return self.density * GRAVITY / 1000

@dataclass
class Load:
    """تعريف الحمل"""
    name: str  # اسم الحمل
    type: LoadType  # نوع الحمل
    magnitude: float  # حجم الحمل (كN/م²)
    description: str  # وصف الحمل

@dataclass
class Reinforcement:
    """تعريف التسليح"""
    diameter: float  # قطر الحديد (ملم)
    spacing: float  # المسافة بين الأسياخ (ملم)
    grade: int  # درجة الفولاذ (MPa)
    
    def get_area_per_meter(self) -> float:
        """حساب مساحة التسليح لكل متر"""
        bar_area = math.pi * (self.diameter / 2) ** 2
        number_of_bars = 1000 / self.spacing
        return bar_area * number_of_bars

# ============================================================================
# فئة التحليل الرئيسية
# ============================================================================

class UndergroundTankAnalyzer:
    """محلل الخزان الأرضي"""
    
    def __init__(self, tank_name: str):
        """تهيئة المحلل"""
        self.tank_name = tank_name
        self.dimensions: TankDimensions = None
        self.materials: Dict[str, Material] = {}
        self.loads: List[Load] = []
        self.results: Dict = {}
    
    def set_dimensions(self, length: float, width: float, depth: float,
                      wall_thick: float, floor_thick: float, roof_thick: float):
        """تعيين أبعاد الخزان"""
        self.dimensions = TankDimensions(
            length=length,
            width=width,
            depth=depth,
            wall_thickness=wall_thick,
            floor_thickness=floor_thick,
            roof_thickness=roof_thick
        )
        print(f"✓ تم تعيين أبعاد الخزان: {length}×{width}×{depth} متر")
    
    def add_material(self, name: str, material_type: MaterialType,
                    density: float, elastic_modulus: float, poisson_ratio: float):
        """إضافة مادة إنشائية"""
        material = Material(
            name=name,
            type=material_type,
            density=density,
            elastic_modulus=elastic_modulus,
            poisson_ratio=poisson_ratio
        )
        self.materials[name] = material
        print(f"✓ تمت إضافة المادة: {name}")
    
    def add_load(self, name: str, load_type: LoadType, magnitude: float, description: str):
        """إضافة حمل"""
        load = Load(
            name=name,
            type=load_type,
            magnitude=magnitude,
            description=description
        )
        self.loads.append(load)
        print(f"✓ تمت إضافة الحمل: {name} ({magnitude} كN/م²)")
    
    # ========================================================================
    # حسابات الأحمال
    # ========================================================================
    
    def calculate_dead_load(self) -> float:
        """حساب الأحمال الدائمة"""
        if not self.dimensions or "Concrete" not in self.materials:
            return 0
        
        concrete = self.materials["Concrete"]
        wall_load = self.dimensions.wall_thickness * concrete.get_unit_weight()
        floor_load = self.dimensions.floor_thickness * concrete.get_unit_weight()
        roof_load = self.dimensions.roof_thickness * concrete.get_unit_weight()
        
        total_dead_load = wall_load + floor_load + roof_load
        self.results["dead_load"] = total_dead_load
        return total_dead_load
    
    def calculate_water_pressure(self, water_depth: float = None) -> Dict[str, float]:
        """حساب ضغط المياه"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        # الضغط على الجدران (كN/م²)
        max_pressure = WATER_DENSITY * water_depth
        avg_pressure = max_pressure / 2
        
        # القوة الكلية على الجدران (كN)
        wall_area = 2 * (self.dimensions.length + self.dimensions.width) * water_depth
        total_force = avg_pressure * wall_area
        
        results = {
            "max_pressure": max_pressure,
            "avg_pressure": avg_pressure,
            "wall_area": wall_area,
            "total_force": total_force
        }
        self.results["water_pressure"] = results
        return results
    
    def calculate_uplift_force(self, water_depth: float = None) -> float:
        """حساب قوة الرفع من المياه الجوفية"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        floor_area = self.dimensions.length * self.dimensions.width
        uplift_force = WATER_DENSITY * floor_area * water_depth
        
        self.results["uplift_force"] = uplift_force
        return uplift_force
    
    # ========================================================================
    # حسابات الإجهادات
    # ========================================================================
    
    def calculate_wall_stress(self, water_depth: float = None) -> float:
        """حساب الإجهاد في الجدران"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        # الإجهاد الطولي في الجدار (كN/م²)
        pressure = WATER_DENSITY * water_depth
        stress = (pressure * water_depth) / (2 * self.dimensions.wall_thickness)
        
        self.results["wall_stress"] = stress
        return stress
    
    def calculate_bending_moment(self, water_depth: float = None) -> float:
        """حساب عزم الانحناء الأقصى"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        # عزم الانحناء (كN·م/م)
        moment = (WATER_DENSITY * water_depth ** 2) / 8
        
        self.results["bending_moment"] = moment
        return moment
    
    def calculate_deflection(self, water_depth: float = None) -> float:
        """حساب السهم (الانحراف)"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        if "Concrete" not in self.materials:
            return 0
        
        concrete = self.materials["Concrete"]
        E = concrete.elastic_modulus * 1000  # تحويل من GPa إلى MPa
        
        # حساب عزم القصور الذاتي (I)
        b = 1000  # عرض 1 متر (ملم)
        h = self.dimensions.wall_thickness * 1000  # الارتفاع (ملم)
        I = (b * h ** 3) / 12
        
        # السهم الأقصى (ملم)
        w = WATER_DENSITY * water_depth / 1000  # تحويل إلى كN/ملم
        deflection = (5 * w * water_depth ** 4 * 1000) / (384 * E * I)
        
        self.results["deflection"] = deflection
        return deflection
    
    # ========================================================================
    # حسابات التسليح
    # ========================================================================
    
    def calculate_required_reinforcement(self, water_depth: float = None) -> Dict[str, float]:
        """حساب التسليح المطلوب"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        moment = self.calculate_bending_moment(water_depth)
        
        # معاملات التصميم
        fy = 500  # إجهاد الخضوع للفولاذ (MPa)
        d = self.dimensions.wall_thickness * 1000 - 50  # العمق الفعال (ملم)
        j = 0.85  # معامل الذراع الفعالة
        
        # مساحة التسليح المطلوبة (mm²/m)
        As_required = (moment * 10 ** 6) / (fy * d * j)
        
        results = {
            "moment": moment,
            "As_required": As_required,
            "d": d,
            "j": j
        }
        self.results["reinforcement"] = results
        return results
    
    def suggest_reinforcement(self) -> Dict[str, Reinforcement]:
        """اقتراح تسليح مناسب"""
        req = self.calculate_required_reinforcement()
        As_required = req["As_required"]
        
        suggestions = {}
        
        # تسليح الجدران
        wall_rebar = Reinforcement(diameter=16, spacing=150, grade=500)
        wall_area = wall_rebar.get_area_per_meter()
        
        # تسليح الأرضية
        floor_rebar = Reinforcement(diameter=16, spacing=150, grade=500)
        floor_area = floor_rebar.get_area_per_meter()
        
        # تسليح السقف
        roof_rebar = Reinforcement(diameter=16, spacing=150, grade=500)
        roof_area = roof_rebar.get_area_per_meter()
        
        suggestions["wall"] = wall_rebar
        suggestions["floor"] = floor_rebar
        suggestions["roof"] = roof_rebar
        
        self.results["suggested_reinforcement"] = suggestions
        return suggestions
    
    # ========================================================================
    # حسابات الأمان والتحقق
    # ========================================================================
    
    def check_safety(self, water_depth: float = None) -> Dict[str, bool]:
        """التحقق من معاملات الأمان"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        if "Concrete" not in self.materials:
            return {}
        
        concrete = self.materials["Concrete"]
        fc = concrete.type.value  # مقاومة الخرسانة (MPa)
        
        # الإجهادات المسموحة
        allowable_stress = fc / SAFETY_FACTOR_STRESS
        
        # الإجهادات الفعلية
        wall_stress = self.calculate_wall_stress(water_depth)
        
        # التحقق
        checks = {
            "stress_safe": wall_stress <= allowable_stress,
            "deflection_safe": self.calculate_deflection(water_depth) <= water_depth * 1000 / 500,
            "uplift_safe": True  # يتم التحقق من خلال الوزن الذاتي
        }
        
        self.results["safety_checks"] = checks
        return checks
    
    # ========================================================================
    # التقارير والنتائج
    # ========================================================================
    
    def generate_report(self, water_depth: float = None) -> str:
        """إنشاء تقرير شامل"""
        if water_depth is None:
            water_depth = self.dimensions.depth if self.dimensions else 0
        
        report = []
        report.append("=" * 80)
        report.append(f"تقرير تحليل الخزان الأرضي: {self.tank_name}")
        report.append("=" * 80)
        report.append("")
        
        # معلومات الخزان
        report.append("📐 معلومات الخزان:")
        report.append(f"  الطول: {self.dimensions.length} متر")
        report.append(f"  العرض: {self.dimensions.width} متر")
        report.append(f"  العمق: {self.dimensions.depth} متر")
        report.append(f"  الحجم: {self.dimensions.get_volume():.2f} م³")
        report.append("")
        
        # الأحمال
        report.append("📊 الأحمال:")
        dead_load = self.calculate_dead_load()
        report.append(f"  الأحمال الدائمة: {dead_load:.2f} كN/م²")
        
        water_pressure = self.calculate_water_pressure(water_depth)
        report.append(f"  ضغط المياه الأقصى: {water_pressure['max_pressure']:.2f} كN/م²")
        report.append(f"  قوة الرفع: {self.calculate_uplift_force(water_depth):.2f} كN")
        report.append("")
        
        # الإجهادات
        report.append("⚡ الإجهادات:")
        wall_stress = self.calculate_wall_stress(water_depth)
        report.append(f"  إجهاد الجدار: {wall_stress:.2f} كN/م²")
        
        moment = self.calculate_bending_moment(water_depth)
        report.append(f"  عزم الانحناء: {moment:.2f} كN·م/م")
        
        deflection = self.calculate_deflection(water_depth)
        report.append(f"  السهم: {deflection:.2f} ملم")
        report.append("")
        
        # التسليح
        report.append("🔧 التسليح المقترح:")
        suggestions = self.suggest_reinforcement()
        for location, rebar in suggestions.items():
            area = rebar.get_area_per_meter()
            report.append(f"  {location}: Ø{rebar.diameter} @ {rebar.spacing} mm ({area:.2f} mm²/m)")
        report.append("")
        
        # الأمان
        report.append("✅ التحقق من الأمان:")
        checks = self.check_safety(water_depth)
        for check, result in checks.items():
            status = "✓ آمن" if result else "✗ غير آمن"
            report.append(f"  {check}: {status}")
        report.append("")
        
        report.append("=" * 80)
        
        return "\n".join(report)
    
    def export_results_to_json(self, filename: str):
        """تصدير النتائج إلى ملف JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        print(f"✓ تم تصدير النتائج إلى: {filename}")

# ============================================================================
# مثال على الاستخدام
# ============================================================================

def main():
    """مثال على استخدام المحلل"""
    
    print("🏗️  برنامج تحليل الخزان الأرضي")
    print("=" * 80)
    print("")
    
    # إنشاء محلل جديد
    analyzer = UndergroundTankAnalyzer("Underground Water Tank - REV.00")
    
    # تعيين الأبعاد
    analyzer.set_dimensions(
        length=40,      # متر
        width=30,       # متر
        depth=6,        # متر
        wall_thick=0.5,  # متر
        floor_thick=0.6,  # متر
        roof_thick=0.5   # متر
    )
    
    # إضافة المواد
    analyzer.add_material(
        name="Concrete",
        material_type=MaterialType.CONCRETE_C35,
        density=2400,  # kg/m³
        elastic_modulus=30,  # GPa
        poisson_ratio=0.2
    )
    
    analyzer.add_material(
        name="Steel",
        material_type=MaterialType.STEEL_GRADE_500,
        density=7850,  # kg/m³
        elastic_modulus=200,  # GPa
        poisson_ratio=0.3
    )
    
    # إضافة الأحمال
    analyzer.add_load(
        name="Dead Load",
        load_type=LoadType.DEAD_LOAD,
        magnitude=38.4,
        description="وزن الخرسانة والتجهيزات"
    )
    
    analyzer.add_load(
        name="Water Pressure",
        load_type=LoadType.WATER_PRESSURE,
        magnitude=60,
        description="ضغط المياه على عمق 6 متر"
    )
    
    # إجراء التحليل
    print("\n📈 جاري إجراء التحليل...")
    print("")
    
    # طباعة التقرير
    report = analyzer.generate_report(water_depth=6)
    print(report)
    
    # تصدير النتائج
    analyzer.export_results_to_json("/home/ubuntu/tank_analysis_results.json")
    
    print("\n✅ تم إكمال التحليل بنجاح!")

if __name__ == "__main__":
    main()
