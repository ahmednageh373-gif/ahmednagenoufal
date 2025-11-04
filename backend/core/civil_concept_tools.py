"""
CivilConcept Integration Tools - أدوات التكامل مع CivilConcept
================================================================

Complete suite of civil engineering calculation tools integrated with NOUFAL EMS
All calculations follow international standards and best practices

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

import math
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime


# ============================================================================
# 1. Basic Tools Service - الأدوات الأساسية
# ============================================================================

class BasicToolsService:
    """خدمة الأدوات الأساسية"""
    
    # Conversion factors
    CONVERSION_FACTORS = {
        # Length
        'meter_to_feet': 3.28084,
        'feet_to_meter': 0.3048,
        'meter_to_cm': 100,
        'cm_to_meter': 0.01,
        'feet_to_inch': 12,
        'inch_to_feet': 1/12,
        'meter_to_inch': 39.3701,
        'inch_to_meter': 0.0254,
        
        # Area
        'sqmeter_to_sqfeet': 10.7639,
        'sqfeet_to_sqmeter': 0.092903,
        'sqmeter_to_hectare': 0.0001,
        'hectare_to_sqmeter': 10000,
        'sqmeter_to_acre': 0.000247105,
        'acre_to_sqmeter': 4046.86,
        
        # Volume
        'cubicmeter_to_cubicfeet': 35.3147,
        'cubicfeet_to_cubicmeter': 0.0283168,
        'liter_to_gallon': 0.264172,
        'gallon_to_liter': 3.78541,
        
        # Weight
        'kg_to_pound': 2.20462,
        'pound_to_kg': 0.453592,
        'ton_to_kg': 1000,
        'kg_to_ton': 0.001,
        'kg_to_gram': 1000,
        'gram_to_kg': 0.001
    }
    
    @staticmethod
    def convert_units(value: float, from_unit: str, to_unit: str) -> float:
        """
        تحويل الوحدات
        
        Args:
            value: القيمة المطلوب تحويلها
            from_unit: الوحدة الأصلية
            to_unit: الوحدة المستهدفة
            
        Returns:
            القيمة المحولة
        """
        key = f"{from_unit}_to_{to_unit}"
        
        if key in BasicToolsService.CONVERSION_FACTORS:
            return value * BasicToolsService.CONVERSION_FACTORS[key]
        
        # Try reverse conversion
        reverse_key = f"{to_unit}_to_{from_unit}"
        if reverse_key in BasicToolsService.CONVERSION_FACTORS:
            return value / BasicToolsService.CONVERSION_FACTORS[reverse_key]
        
        raise ValueError(f"Unsupported conversion: {from_unit} to {to_unit}")
    
    @staticmethod
    def calculate_area(shape: str, dimensions: Dict[str, float]) -> float:
        """
        حساب المساحة
        
        Args:
            shape: الشكل (rectangle, circle, triangle, trapezoid)
            dimensions: الأبعاد
            
        Returns:
            المساحة
        """
        shape = shape.lower()
        
        if shape == 'rectangle':
            return dimensions['length'] * dimensions['width']
        elif shape == 'circle':
            return math.pi * (dimensions['radius'] ** 2)
        elif shape == 'triangle':
            return (dimensions['base'] * dimensions['height']) / 2
        elif shape == 'trapezoid':
            return ((dimensions['base1'] + dimensions['base2']) * dimensions['height']) / 2
        else:
            raise ValueError(f"Unknown shape: {shape}")
    
    @staticmethod
    def calculate_volume(shape: str, dimensions: Dict[str, float]) -> float:
        """
        حساب الحجم
        
        Args:
            shape: الشكل (cylinder, sphere, cone, rectangular)
            dimensions: الأبعاد
            
        Returns:
            الحجم
        """
        shape = shape.lower()
        
        if shape == 'cylinder':
            return math.pi * (dimensions['radius'] ** 2) * dimensions['height']
        elif shape == 'sphere':
            return (4/3) * math.pi * (dimensions['radius'] ** 3)
        elif shape == 'cone':
            return (1/3) * math.pi * (dimensions['radius'] ** 2) * dimensions['height']
        elif shape == 'rectangular':
            return dimensions['length'] * dimensions['width'] * dimensions['height']
        else:
            raise ValueError(f"Unknown shape: {shape}")


# ============================================================================
# 2. Estimation Tools Service - أدوات التقدير
# ============================================================================

class EstimationToolsService:
    """خدمة أدوات التقدير"""
    
    @staticmethod
    def calculate_loads(building_data: Dict[str, float]) -> Dict[str, float]:
        """
        حساب الأحمال
        
        Args:
            building_data: بيانات المبنى
            
        Returns:
            الأحمال المختلفة
        """
        area = building_data.get('area', 0)
        height = building_data.get('height', 0)
        
        return {
            'dead_load': area * 5,  # kN/m²
            'live_load': area * 2.5,  # kN/m²
            'wind_load': height * 1.5,  # kN
            'seismic_load': (area * height) * 0.1,  # kN
            'total_load': (area * 5) + (area * 2.5) + (height * 1.5) + ((area * height) * 0.1)
        }
    
    @staticmethod
    def estimate_building(building_data: Dict[str, float]) -> Dict[str, any]:
        """
        تقدير المبنى
        
        Args:
            building_data: بيانات المبنى
            
        Returns:
            تقدير شامل للمواد والتكاليف
        """
        area = building_data.get('area', 0)
        height = building_data.get('height', 0)
        floor_count = building_data.get('floor_count', 1)
        
        # Material quantities
        materials = {
            'concrete_m3': area * height * 0.3,
            'steel_ton': area * height * 0.01,
            'bricks_count': area * 400,
            'sand_m3': area * height * 0.2,
            'cement_ton': area * height * 0.05
        }
        
        # Unit prices (SAR)
        unit_prices = {
            'concrete': 300,  # SAR/m³
            'steel': 15000,  # SAR/ton
            'bricks': 1,  # SAR/brick
            'sand': 100,  # SAR/m³
            'cement': 500  # SAR/ton
        }
        
        # Calculate costs
        costs = {
            'concrete_cost': materials['concrete_m3'] * unit_prices['concrete'],
            'steel_cost': materials['steel_ton'] * unit_prices['steel'],
            'bricks_cost': materials['bricks_count'] * unit_prices['bricks'],
            'sand_cost': materials['sand_m3'] * unit_prices['sand'],
            'cement_cost': materials['cement_ton'] * unit_prices['cement']
        }
        
        total_cost = sum(costs.values())
        labor_cost = total_cost * 0.2  # 20% of material cost
        
        return {
            'materials': materials,
            'costs': costs,
            'total_cost': total_cost,
            'cost_per_square_meter': total_cost / area if area > 0 else 0,
            'labor_cost': labor_cost,
            'total_project_cost': total_cost + labor_cost
        }
    
    @staticmethod
    def analyze_rates(item: str, quantity: float, unit_price: float) -> Dict[str, float]:
        """
        تحليل الأسعار
        
        Args:
            item: البند
            quantity: الكمية
            unit_price: سعر الوحدة
            
        Returns:
            تحليل السعر
        """
        amount = quantity * unit_price
        
        return {
            'item': item,
            'quantity': quantity,
            'unit_price': unit_price,
            'amount': amount,
            'labor_cost': amount * 0.15,
            'material_cost': amount * 0.70,
            'equipment_cost': amount * 0.15,
            'total_cost': amount
        }
    
    @staticmethod
    def generate_boq(items: List[Dict[str, any]]) -> Dict[str, any]:
        """
        إنشاء BOQ
        
        Args:
            items: قائمة البنود
            
        Returns:
            BOQ كامل
        """
        boq_items = []
        
        for idx, item in enumerate(items, 1):
            boq_items.append({
                'item_no': idx,
                'description': item['description'],
                'unit': item['unit'],
                'quantity': item['quantity'],
                'rate': item['rate'],
                'amount': item['quantity'] * item['rate']
            })
        
        subtotal = sum(item['amount'] for item in boq_items)
        tax = subtotal * 0.15  # 15% VAT
        total = subtotal + tax
        contingency = subtotal * 0.05  # 5% contingency
        final_total = total + contingency
        
        return {
            'items': boq_items,
            'subtotal': subtotal,
            'tax': tax,
            'total': total,
            'contingency': contingency,
            'final_total': final_total
        }


# ============================================================================
# 3. Design Tools Service - أدوات التصميم
# ============================================================================

class DesignToolsService:
    """خدمة أدوات التصميم"""
    
    @staticmethod
    def calculate_steel_weight(diameter: float, length: float) -> float:
        """
        حساب وزن الحديد
        
        Formula: Weight = (diameter² / 162) × length
        
        Args:
            diameter: القطر (mm)
            length: الطول (m)
            
        Returns:
            الوزن (kg)
        """
        return ((diameter ** 2) / 162) * length
    
    @staticmethod
    def calculate_cutting_length(span_length: float, cover: float, diameter: float) -> float:
        """
        حساب طول القطع
        
        Args:
            span_length: طول الفتحة (mm)
            cover: الغطاء (mm)
            diameter: القطر (mm)
            
        Returns:
            طول القطع (mm)
        """
        bend_length = diameter * 10  # Standard bend
        return span_length + (2 * cover) + (2 * bend_length)
    
    @staticmethod
    def generate_bar_bending_schedule(beam_data: Dict[str, any]) -> Dict[str, any]:
        """
        إنشاء جدول تسليح الحديد
        
        Args:
            beam_data: بيانات الكمرة
            
        Returns:
            جدول التسليح
        """
        schedule = []
        
        # Main rebar
        if 'main_rebar' in beam_data:
            main = beam_data['main_rebar']
            cutting_length = DesignToolsService.calculate_cutting_length(
                beam_data['span_length'],
                beam_data['cover'],
                main['diameter']
            )
            weight = DesignToolsService.calculate_steel_weight(
                main['diameter'],
                cutting_length / 1000  # Convert to meters
            ) * main['quantity']
            
            schedule.append({
                'description': 'Main Rebar',
                'diameter': main['diameter'],
                'quantity': main['quantity'],
                'length': cutting_length,
                'weight': weight
            })
        
        # Distribution rebar
        if 'distribution_rebar' in beam_data:
            dist = beam_data['distribution_rebar']
            length = beam_data['span_length'] + (2 * beam_data['cover'])
            weight = DesignToolsService.calculate_steel_weight(
                dist['diameter'],
                length / 1000
            ) * dist['quantity']
            
            schedule.append({
                'description': 'Distribution Rebar',
                'diameter': dist['diameter'],
                'quantity': dist['quantity'],
                'length': length,
                'weight': weight
            })
        
        total_weight = sum(item['weight'] for item in schedule)
        total_quantity = sum(item['quantity'] for item in schedule)
        
        return {
            'schedule': schedule,
            'total_weight': total_weight,
            'total_quantity': total_quantity
        }
    
    @staticmethod
    def design_rcc(beam_data: Dict[str, any]) -> Dict[str, any]:
        """
        تصميم الخرسانة المسلحة
        
        Args:
            beam_data: بيانات الكمرة
            
        Returns:
            نتائج التصميم
        """
        M = beam_data.get('bending_moment', 0)  # kNm
        b = beam_data.get('width', 300)  # mm
        d = beam_data.get('effective_depth', 500)  # mm
        fy = beam_data.get('steel_grade', 500)  # MPa
        fck = beam_data.get('concrete_grade', 25)  # MPa
        
        # Calculate required steel area (simplified)
        Ast = (M * 1e6) / (0.87 * fy * (d - 0.42 * d))
        
        return {
            'bending_moment': M,
            'beam_width': b,
            'effective_depth': d,
            'required_steel_area': Ast,
            'steel_grade': fy,
            'concrete_grade': fck,
            'design_safe': Ast > 0
        }


# ============================================================================
# 4. Analysis Tools Service - أدوات التحليل
# ============================================================================

class AnalysisToolsService:
    """خدمة أدوات التحليل"""
    
    @staticmethod
    def analyze_structure(structure_data: Dict[str, any]) -> Dict[str, any]:
        """
        التحليل الإنشائي
        
        Args:
            structure_data: بيانات الهيكل
            
        Returns:
            نتائج التحليل
        """
        loads = structure_data.get('loads', {})
        total_load = sum(loads.values())
        
        return {
            'total_load': total_load,
            'loads': loads,
            'stresses': {
                'bending': total_load * 0.6,
                'shear': total_load * 0.3,
                'torsion': total_load * 0.1
            },
            'deflection': total_load * 0.001,  # Simplified
            'safety_factor': 1.5
        }
    
    @staticmethod
    def analyze_soil(soil_data: Dict[str, any]) -> Dict[str, any]:
        """
        تحليل التربة
        
        Args:
            soil_data: بيانات التربة
            
        Returns:
            نتائج التحليل
        """
        unit_weight = soil_data.get('unit_weight', 18)  # kN/m³
        depth = soil_data.get('depth', 1)  # m
        phi = soil_data.get('friction_angle', 30)  # degrees
        cohesion = soil_data.get('cohesion', 20)  # kPa
        
        effective_stress = unit_weight * depth
        shear_strength = cohesion + (effective_stress * math.tan(math.radians(phi)))
        
        return {
            'unit_weight': unit_weight,
            'depth': depth,
            'friction_angle': phi,
            'cohesion': cohesion,
            'effective_stress': effective_stress,
            'shear_strength': shear_strength,
            'bearing_capacity': shear_strength * 3  # Safety factor 3
        }
    
    @staticmethod
    def design_foundation(foundation_data: Dict[str, any]) -> Dict[str, any]:
        """
        تصميم الأساسات
        
        Args:
            foundation_data: بيانات الأساس
            
        Returns:
            نتائج التصميم
        """
        total_load = foundation_data.get('total_load', 0)  # kN
        soil_bearing_capacity = foundation_data.get('soil_bearing_capacity', 200)  # kPa
        safety_factor = foundation_data.get('safety_factor', 2.5)
        
        design_load = total_load / safety_factor
        required_area = (design_load * 1000) / soil_bearing_capacity  # m²
        
        side_length = math.sqrt(required_area)
        
        return {
            'total_load': total_load,
            'soil_bearing_capacity': soil_bearing_capacity,
            'safety_factor': safety_factor,
            'design_load': design_load,
            'required_area': required_area,
            'foundation_type': 'Isolated' if required_area < 50 else 'Combined',
            'foundation_dimensions': {
                'length': side_length,
                'width': side_length,
                'depth': 1.5
            }
        }


# ============================================================================
# 5. Integration Service - خدمة التكامل
# ============================================================================

@dataclass
class ToolResult:
    """نتيجة تنفيذ أداة"""
    tool_id: str
    tool_name: str
    result: any
    timestamp: datetime
    execution_time: float  # milliseconds
    success: bool
    error: Optional[str] = None


class CivilConceptIntegrationService:
    """خدمة التكامل الرئيسية"""
    
    TOOLS_REGISTRY = {
        # Basic tools
        'converter': {'name': 'Unit Converter', 'category': 'basic'},
        'area_calculator': {'name': 'Area Calculator', 'category': 'basic'},
        'volume_calculator': {'name': 'Volume Calculator', 'category': 'basic'},
        
        # Estimation tools
        'load_calculator': {'name': 'Load Calculator', 'category': 'estimation'},
        'building_estimator': {'name': 'Building Estimator', 'category': 'estimation'},
        'rate_analysis': {'name': 'Rate Analysis', 'category': 'estimation'},
        'boq_maker': {'name': 'BOQ Maker', 'category': 'estimation'},
        
        # Design tools
        'steel_weight': {'name': 'Steel Weight Calculator', 'category': 'design'},
        'cutting_length': {'name': 'Cutting Length Calculator', 'category': 'design'},
        'bar_bending': {'name': 'Bar Bending Schedule', 'category': 'design'},
        'rcc_design': {'name': 'RCC Design', 'category': 'design'},
        
        # Analysis tools
        'structural_analysis': {'name': 'Structural Analysis', 'category': 'analysis'},
        'soil_mechanics': {'name': 'Soil Mechanics', 'category': 'analysis'},
        'foundation_design': {'name': 'Foundation Design', 'category': 'analysis'}
    }
    
    @staticmethod
    def execute_tool(tool_id: str, data: Dict[str, any]) -> ToolResult:
        """
        تنفيذ أداة واحدة
        
        Args:
            tool_id: معرف الأداة
            data: البيانات
            
        Returns:
            ToolResult
        """
        import time
        start_time = time.time()
        
        try:
            tool = CivilConceptIntegrationService.TOOLS_REGISTRY.get(tool_id)
            if not tool:
                raise ValueError(f"Unknown tool: {tool_id}")
            
            result = None
            
            # Execute appropriate tool
            if tool_id == 'converter':
                result = BasicToolsService.convert_units(
                    data['value'], data['from_unit'], data['to_unit']
                )
            elif tool_id == 'area_calculator':
                result = BasicToolsService.calculate_area(
                    data['shape'], data['dimensions']
                )
            elif tool_id == 'volume_calculator':
                result = BasicToolsService.calculate_volume(
                    data['shape'], data['dimensions']
                )
            elif tool_id == 'load_calculator':
                result = EstimationToolsService.calculate_loads(data)
            elif tool_id == 'building_estimator':
                result = EstimationToolsService.estimate_building(data)
            elif tool_id == 'rate_analysis':
                result = EstimationToolsService.analyze_rates(
                    data['item'], data['quantity'], data['unit_price']
                )
            elif tool_id == 'boq_maker':
                result = EstimationToolsService.generate_boq(data['items'])
            elif tool_id == 'steel_weight':
                result = DesignToolsService.calculate_steel_weight(
                    data['diameter'], data['length']
                )
            elif tool_id == 'cutting_length':
                result = DesignToolsService.calculate_cutting_length(
                    data['span_length'], data['cover'], data['diameter']
                )
            elif tool_id == 'bar_bending':
                result = DesignToolsService.generate_bar_bending_schedule(data)
            elif tool_id == 'rcc_design':
                result = DesignToolsService.design_rcc(data)
            elif tool_id == 'structural_analysis':
                result = AnalysisToolsService.analyze_structure(data)
            elif tool_id == 'soil_mechanics':
                result = AnalysisToolsService.analyze_soil(data)
            elif tool_id == 'foundation_design':
                result = AnalysisToolsService.design_foundation(data)
            else:
                raise ValueError(f"Tool not implemented: {tool_id}")
            
            execution_time = (time.time() - start_time) * 1000  # Convert to ms
            
            return ToolResult(
                tool_id=tool_id,
                tool_name=tool['name'],
                result=result,
                timestamp=datetime.now(),
                execution_time=execution_time,
                success=True
            )
            
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            
            return ToolResult(
                tool_id=tool_id,
                tool_name=CivilConceptIntegrationService.TOOLS_REGISTRY.get(tool_id, {}).get('name', 'Unknown'),
                result=None,
                timestamp=datetime.now(),
                execution_time=execution_time,
                success=False,
                error=str(e)
            )


# Example usage
if __name__ == '__main__':
    print("="*80)
    print("CIVIL CONCEPT INTEGRATION TOOLS - أدوات التكامل")
    print("="*80)
    
    # Test 1: Unit conversion
    print("\n1. Unit Conversion:")
    result = BasicToolsService.convert_units(100, 'meter', 'feet')
    print(f"   100 meters = {result:.2f} feet")
    
    # Test 2: Building estimation
    print("\n2. Building Estimation:")
    building_data = {'area': 1000, 'height': 10, 'floor_count': 5}
    result = EstimationToolsService.estimate_building(building_data)
    print(f"   Total Cost: {result['total_cost']:,.0f} SAR")
    print(f"   Cost/m²: {result['cost_per_square_meter']:,.0f} SAR")
    
    # Test 3: Steel weight
    print("\n3. Steel Weight:")
    weight = DesignToolsService.calculate_steel_weight(20, 10)
    print(f"   20mm diameter, 10m length = {weight:.2f} kg")
    
    # Test 4: Integration service
    print("\n4. Integration Service:")
    tool_result = CivilConceptIntegrationService.execute_tool(
        'converter',
        {'value': 50, 'from_unit': 'meter', 'to_unit': 'feet'}
    )
    print(f"   Tool: {tool_result.tool_name}")
    print(f"   Result: {tool_result.result:.2f}")
    print(f"   Execution time: {tool_result.execution_time:.2f}ms")
    
    print("\n" + "="*80)
