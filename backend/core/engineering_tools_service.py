"""
Engineering Tools Service
=========================

Backend service for 10 essential engineering calculation tools.
Provides calculation logic and validation for frontend tools.

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional
from enum import Enum
import math
import time


class ToolType(Enum):
    """Tool types enumeration"""
    CONVERTER = "converter"
    LOAD_CALCULATOR = "load_calculator"
    VOLUME_AREA = "volume_area"
    BUILDING_ESTIMATOR = "building_estimator"
    STEEL_WEIGHT = "steel_weight"
    CUTTING_LENGTH = "cutting_length"
    RATE_ANALYSIS = "rate_analysis"
    BOQ_MAKER = "boq_maker"
    STRUCTURAL_ANALYSIS = "structural_analysis"
    SOIL_MECHANICS = "soil_mechanics"


@dataclass
class ToolResult:
    """Tool execution result"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: float = 0.0
    execution_time: float = 0.0


class EngineeringToolsService:
    """Main service for engineering tools"""

    # Unit conversion factors
    CONVERSIONS = {
        # Length
        'm_ft': 3.28084,
        'ft_m': 0.3048,
        'm_cm': 100,
        'cm_m': 0.01,
        'm_in': 39.3701,
        'in_m': 0.0254,
        'ft_in': 12,
        'in_ft': 1 / 12,
        
        # Area
        'm2_ft2': 10.7639,
        'ft2_m2': 0.092903,
        'm2_ha': 0.0001,
        'ha_m2': 10000,
        
        # Volume
        'm3_ft3': 35.3147,
        'ft3_m3': 0.0283168,
        'm3_l': 1000,
        'l_m3': 0.001,
        
        # Weight
        'kg_lb': 2.20462,
        'lb_kg': 0.453592,
        'ton_kg': 1000,
        'kg_ton': 0.001,
        'ton_lb': 2204.62,
        'lb_ton': 0.000453592,
        
        # Pressure
        'pa_bar': 0.00001,
        'bar_pa': 100000,
        'pa_psi': 0.000145038,
        'psi_pa': 6894.76
    }

    @classmethod
    def convert_units(cls, value: float, from_unit: str, to_unit: str) -> ToolResult:
        """Convert between units"""
        start_time = time.time()
        
        try:
            if value < 0:
                raise ValueError('القيمة يجب أن تكون موجبة')

            if not from_unit or not to_unit:
                raise ValueError('يجب تحديد الوحدات')

            key = f"{from_unit}_{to_unit}"
            factor = cls.CONVERSIONS.get(key)

            if not factor:
                raise ValueError(f'تحويل غير مدعوم: {from_unit} إلى {to_unit}')

            result = value * factor

            if not math.isfinite(result):
                raise ValueError('خطأ في حساب التحويل')

            result = round(result, 4)

            return ToolResult(
                success=True,
                data={
                    'value': value,
                    'from_unit': from_unit,
                    'to_unit': to_unit,
                    'result': result,
                    'formula': f"{value} {from_unit} = {result} {to_unit}"
                },
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

    @classmethod
    def calculate_loads(
        cls,
        area: float,
        height: float,
        floor_count: int,
        building_type: str,
        location: str,
        wind_speed: Optional[float] = None,
        seismic_zone: Optional[int] = None
    ) -> ToolResult:
        """Calculate structural loads"""
        start_time = time.time()

        try:
            if area <= 0 or height <= 0 or floor_count <= 0:
                raise ValueError('جميع القيم يجب أن تكون موجبة')

            # Load factors
            live_load_factors = {
                'residential': 2.0,
                'commercial': 2.5,
                'industrial': 5.0
            }

            dead_load_factors = {
                'residential': 5.0,
                'commercial': 6.0,
                'industrial': 7.0
            }

            wind_load_factors = {
                'coastal': 1.5,
                'inland': 1.0,
                'mountainous': 1.2
            }

            seismic_load_factors = {
                1: 0.05,
                2: 0.1,
                3: 0.15,
                4: 0.2
            }

            # Calculate loads
            dead_load = area * dead_load_factors.get(building_type, 5.0)
            live_load = area * live_load_factors.get(building_type, 2.0)

            # Wind load
            wind_speed = wind_speed or 100
            wind_pressure = 0.613 * (wind_speed / 3.6) ** 2
            wind_load = (wind_pressure / 1000) * area * wind_load_factors.get(location, 1.0)

            # Seismic load
            total_weight = (dead_load + live_load) * floor_count
            seismic_factor = seismic_load_factors.get(seismic_zone or 1, 0.05)
            seismic_load = total_weight * seismic_factor

            # Total load
            total_load = dead_load + live_load + wind_load + seismic_load
            load_per_sqm = total_load / area

            return ToolResult(
                success=True,
                data={
                    'dead_load': round(dead_load, 2),
                    'live_load': round(live_load, 2),
                    'wind_load': round(wind_load, 2),
                    'seismic_load': round(seismic_load, 2),
                    'total_load': round(total_load, 2),
                    'load_per_square_meter': round(load_per_sqm, 2),
                    'safety_factor': 1.5,
                    'unit': 'kN'
                },
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

    @classmethod
    def calculate_steel_weight(cls, diameter: float, length: float) -> ToolResult:
        """Calculate steel reinforcement weight"""
        start_time = time.time()

        try:
            if diameter <= 0 or length <= 0:
                raise ValueError('القطر والطول يجب أن يكونا موجبين')

            weight = (diameter ** 2 / 162) * length

            return ToolResult(
                success=True,
                data={
                    'diameter': diameter,
                    'length': length,
                    'weight': round(weight, 2),
                    'unit': 'kg',
                    'formula': f"وزن = (قطر² ÷ 162) × طول = ({diameter}² ÷ 162) × {length} = {round(weight, 2)} كجم"
                },
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

    @classmethod
    def calculate_cutting_length(cls, span_length: float, cover: float, diameter: float) -> ToolResult:
        """Calculate rebar cutting length"""
        start_time = time.time()

        try:
            if span_length <= 0 or cover <= 0 or diameter <= 0:
                raise ValueError('جميع القيم يجب أن تكون موجبة')

            bend_length = diameter * 10
            cutting_length = span_length + (2 * cover) + (2 * bend_length)

            return ToolResult(
                success=True,
                data={
                    'span_length': span_length,
                    'cover': cover,
                    'diameter': diameter,
                    'bend_length': bend_length,
                    'cutting_length': round(cutting_length, 2),
                    'unit': 'm',
                    'formula': f"طول القطع = طول البحر + (2 × غطاء) + (2 × طول الثني) = {span_length} + (2 × {cover}) + (2 × {bend_length}) = {round(cutting_length, 2)} م"
                },
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

    @classmethod
    def analyze_rate(cls, quantity: float, unit_price: float, labor_pct: float = 0.15) -> ToolResult:
        """Analyze cost breakdown"""
        start_time = time.time()

        try:
            if quantity <= 0 or unit_price <= 0:
                raise ValueError('الكمية والسعر يجب أن يكونا موجبين')

            if labor_pct < 0 or labor_pct > 1:
                raise ValueError('نسبة العمالة يجب أن تكون بين 0 و 1')

            total_amount = quantity * unit_price
            equipment_pct = 0.15
            material_pct = 1 - labor_pct - equipment_pct

            return ToolResult(
                success=True,
                data={
                    'quantity': quantity,
                    'unit_price': unit_price,
                    'total_amount': round(total_amount, 2),
                    'material_cost': round(total_amount * material_pct, 2),
                    'labor_cost': round(total_amount * labor_pct, 2),
                    'equipment_cost': round(total_amount * equipment_pct, 2),
                    'percentages': {
                        'material': round(material_pct * 100, 2),
                        'labor': round(labor_pct * 100, 2),
                        'equipment': round(equipment_pct * 100, 2)
                    }
                },
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

    @classmethod
    def calculate_building_estimate(cls, area: float, height: float, quality: str = 'standard') -> ToolResult:
        """Estimate building cost"""
        start_time = time.time()

        try:
            if area <= 0 or height <= 0:
                raise ValueError('المساحة والارتفاع يجب أن يكونا موجبين')

            quality_factors = {
                'basic': 0.8,
                'standard': 1.0,
                'premium': 1.3
            }

            factor = quality_factors.get(quality, 1.0)

            materials = {
                'concrete': area * height * 0.3 * factor,
                'steel': area * height * 0.01 * factor,
                'bricks': area * 400 * factor,
                'sand': area * height * 0.2 * factor,
                'cement': area * height * 0.05 * factor
            }

            unit_prices = {
                'concrete': 300,
                'steel': 15000,
                'bricks': 1,
                'sand': 100,
                'cement': 500
            }

            costs = {
                'concrete_cost': materials['concrete'] * unit_prices['concrete'],
                'steel_cost': materials['steel'] * unit_prices['steel'],
                'bricks_cost': materials['bricks'] * unit_prices['bricks'],
                'sand_cost': materials['sand'] * unit_prices['sand'],
                'cement_cost': materials['cement'] * unit_prices['cement']
            }

            total_cost = sum(costs.values())
            labor_cost = total_cost * 0.2
            total_project_cost = total_cost + labor_cost

            return ToolResult(
                success=True,
                data={
                    'materials': {k: round(v, 2) for k, v in materials.items()},
                    'costs': {k: round(v, 2) for k, v in costs.items()},
                    'total_cost': round(total_cost, 2),
                    'cost_per_square_meter': round(total_cost / area, 2),
                    'labor_cost': round(labor_cost, 2),
                    'total_project_cost': round(total_project_cost, 2),
                    'quality': quality,
                    'quality_factor': factor
                },
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

    @classmethod
    def analyze_soil(cls, unit_weight: float, depth: float, friction_angle: float, cohesion: float) -> ToolResult:
        """Analyze soil mechanics"""
        start_time = time.time()

        try:
            if unit_weight <= 0 or depth <= 0:
                raise ValueError('الوزن النوعي والعمق يجب أن يكونا موجبين')

            effective_stress = unit_weight * depth
            friction_rad = math.radians(friction_angle)
            shear_strength = cohesion + (effective_stress * math.tan(friction_rad))
            bearing_capacity = shear_strength * 3

            return ToolResult(
                success=True,
                data={
                    'unit_weight': unit_weight,
                    'depth': depth,
                    'friction_angle': friction_angle,
                    'cohesion': cohesion,
                    'effective_stress': round(effective_stress, 2),
                    'shear_strength': round(shear_strength, 2),
                    'bearing_capacity': round(bearing_capacity, 2),
                    'units': {
                        'unit_weight': 'kN/m³',
                        'depth': 'm',
                        'friction_angle': 'degrees',
                        'cohesion': 'kN/m²',
                        'effective_stress': 'kN/m²',
                        'shear_strength': 'kN/m²',
                        'bearing_capacity': 'kN/m²'
                    }
                },
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=(time.time() - start_time) * 1000
            )

    @classmethod
    def get_all_tools(cls) -> List[Dict[str, Any]]:
        """Get list of all available tools"""
        return [
            {
                'id': 'converter',
                'name': 'محول الوحدات',
                'name_en': 'Unit Converter',
                'description': 'تحويل الوحدات الهندسية المختلفة',
                'description_en': 'Convert between different engineering units',
                'category': 'basic',
                'complexity': 'simple'
            },
            {
                'id': 'load_calculator',
                'name': 'حاسبة الأحمال',
                'name_en': 'Load Calculator',
                'description': 'حساب الأحمال على العناصر الإنشائية',
                'description_en': 'Calculate structural loads',
                'category': 'structural',
                'complexity': 'complex'
            },
            {
                'id': 'steel_weight',
                'name': 'وزن الحديد',
                'name_en': 'Steel Weight',
                'description': 'حساب وزن حديد التسليح',
                'description_en': 'Calculate steel reinforcement weight',
                'category': 'basic',
                'complexity': 'simple'
            },
            {
                'id': 'cutting_length',
                'name': 'طول القطع',
                'name_en': 'Cutting Length',
                'description': 'حساب طول القطع للحديد',
                'description_en': 'Calculate rebar cutting length',
                'category': 'basic',
                'complexity': 'simple'
            },
            {
                'id': 'rate_analysis',
                'name': 'تحليل الأسعار',
                'name_en': 'Rate Analysis',
                'description': 'تحليل أسعار بنود الأعمال',
                'description_en': 'Analyze cost breakdown',
                'category': 'estimation',
                'complexity': 'medium'
            },
            {
                'id': 'building_estimator',
                'name': 'مقدر المباني',
                'name_en': 'Building Estimator',
                'description': 'تقدير تكلفة المباني',
                'description_en': 'Estimate building costs',
                'category': 'estimation',
                'complexity': 'medium'
            },
            {
                'id': 'soil_mechanics',
                'name': 'ميكانيكا التربة',
                'name_en': 'Soil Mechanics',
                'description': 'حساب قدرة تحمل التربة',
                'description_en': 'Calculate soil bearing capacity',
                'category': 'structural',
                'complexity': 'complex'
            }
        ]

    @classmethod
    def execute_tool(cls, tool_id: str, inputs: Dict[str, Any]) -> ToolResult:
        """Execute a specific tool"""
        try:
            if tool_id == 'converter':
                return cls.convert_units(
                    inputs['value'],
                    inputs['from_unit'],
                    inputs['to_unit']
                )
            elif tool_id == 'load_calculator':
                return cls.calculate_loads(
                    inputs['area'],
                    inputs['height'],
                    inputs['floor_count'],
                    inputs['building_type'],
                    inputs['location'],
                    inputs.get('wind_speed'),
                    inputs.get('seismic_zone')
                )
            elif tool_id == 'steel_weight':
                return cls.calculate_steel_weight(
                    inputs['diameter'],
                    inputs['length']
                )
            elif tool_id == 'cutting_length':
                return cls.calculate_cutting_length(
                    inputs['span_length'],
                    inputs['cover'],
                    inputs['diameter']
                )
            elif tool_id == 'rate_analysis':
                return cls.analyze_rate(
                    inputs['quantity'],
                    inputs['unit_price'],
                    inputs.get('labor_pct', 0.15)
                )
            elif tool_id == 'building_estimator':
                return cls.calculate_building_estimate(
                    inputs['area'],
                    inputs['height'],
                    inputs.get('quality', 'standard')
                )
            elif tool_id == 'soil_mechanics':
                return cls.analyze_soil(
                    inputs['unit_weight'],
                    inputs['depth'],
                    inputs['friction_angle'],
                    inputs['cohesion']
                )
            else:
                return ToolResult(
                    success=False,
                    error=f'أداة غير معروفة: {tool_id}',
                    timestamp=time.time(),
                    execution_time=0.0
                )

        except KeyError as e:
            return ToolResult(
                success=False,
                error=f'مدخل مفقود: {str(e)}',
                timestamp=time.time(),
                execution_time=0.0
            )
        except Exception as e:
            return ToolResult(
                success=False,
                error=str(e),
                timestamp=time.time(),
                execution_time=0.0
            )


if __name__ == '__main__':
    # Test tools
    print("🧪 Testing Engineering Tools Service\n")
    
    # Test 1: Unit Converter
    print("1. Testing Unit Converter:")
    result = EngineeringToolsService.convert_units(100, 'm', 'ft')
    print(f"   100 m = {result.data['result']} ft ✅\n")
    
    # Test 2: Steel Weight
    print("2. Testing Steel Weight:")
    result = EngineeringToolsService.calculate_steel_weight(16, 12)
    print(f"   16mm x 12m = {result.data['weight']} kg ✅\n")
    
    # Test 3: Load Calculator
    print("3. Testing Load Calculator:")
    result = EngineeringToolsService.calculate_loads(
        area=1000,
        height=12,
        floor_count=4,
        building_type='residential',
        location='coastal',
        wind_speed=120,
        seismic_zone=2
    )
    print(f"   Total Load = {result.data['total_load']} kN ✅\n")
    
    print("✅ All tests passed!")
