"""
House Plan Integrator - دمج المخططات مع Quick Estimator
=========================================================

Automatically generates cost estimates from house plan data.
Integrates with Quick Estimator, Unit Converter, and BOQ systems.

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import json

# Import من الوحدات الأخرى
from .house_plan_extractor import (
    HousePlanData,
    RoomData,
    HousePlanAnalyzer
)
from .quick_estimator import (
    QuickEstimator,
    EstimateInput,
    EstimateOutput,
    Region,
    BuildingType,
    FinishLevel
)
from .unit_converter import UnitConverter, LengthUnit, AreaUnit


@dataclass
class IntegratedEstimate:
    """تقدير متكامل من المخطط"""
    plan_id: str
    plan_title: str
    plan_url: str
    
    # بيانات المخطط
    land_area_sqm: float
    building_area_sqm: float
    room_count: int
    bhk: Optional[int]
    
    # التقدير السريع
    quick_estimate: Dict[str, any]
    
    # تفاصيل إضافية
    room_breakdown: List[Dict[str, any]]
    confidence: float
    notes: List[str]


class HousePlanIntegrator:
    """
    معالج التكامل بين المخططات والتقديرات
    """
    
    def __init__(self):
        self.quick_estimator = QuickEstimator()
    
    def generate_estimate_from_plan(
        self,
        plan: HousePlanData,
        region: Region = Region.SAUDI_ARABIA,
        finish_level: FinishLevel = FinishLevel.STANDARD,
        custom_contractor_rate: Optional[float] = None
    ) -> IntegratedEstimate:
        """
        إنشاء تقدير تلقائي من بيانات المخطط
        
        Args:
            plan: بيانات المخطط
            region: المنطقة
            finish_level: مستوى التشطيب
            custom_contractor_rate: سعر مقاول مخصص (اختياري)
            
        Returns:
            IntegratedEstimate
        """
        # 1. تحويل الأبعاد إلى متر مربع
        land_area_sqm = self._convert_to_sqm(
            plan.land.total_area['value'],
            plan.land.total_area['unit']
        )
        
        building_width_m = self._convert_to_meters(
            plan.building.width['value'],
            plan.building.width['unit']
        )
        
        building_length_m = self._convert_to_meters(
            plan.building.length['value'],
            plan.building.length['unit']
        )
        
        building_area_sqm = building_width_m * building_length_m
        
        # 2. تحديد نوع المبنى
        building_type = self._determine_building_type(plan)
        
        # 3. تحديد عدد الطوابق (افتراضياً من BHK)
        storeys = self._estimate_storeys(plan)
        
        # 4. إنشاء input للـ Quick Estimator
        estimate_input = EstimateInput(
            total_area_sqm=building_area_sqm,
            number_of_storeys=storeys,
            region=region,
            building_type=building_type,
            finish_level=finish_level,
            custom_contractor_rate=custom_contractor_rate
        )
        
        # 5. الحصول على التقدير
        estimate_result = self.quick_estimator.estimate(estimate_input)
        
        # 6. تحليل الغرف
        room_breakdown = self._analyze_rooms(plan.rooms)
        
        # 7. إنشاء ملاحظات
        notes = self._generate_notes(plan, estimate_result)
        
        # 8. إنشاء النتيجة المتكاملة
        integrated_estimate = IntegratedEstimate(
            plan_id=plan.plan_id,
            plan_title=plan.title,
            plan_url=plan.url,
            land_area_sqm=land_area_sqm,
            building_area_sqm=building_area_sqm,
            room_count=len(plan.rooms),
            bhk=plan.bhk,
            quick_estimate={
                'region': estimate_result.region,
                'building_type': estimate_result.building_type,
                'finish_level': estimate_result.finish_level,
                'total_area_sqm': estimate_result.total_area_sqm,
                'number_of_storeys': estimate_result.number_of_storeys,
                'currency': estimate_result.currency,
                'materials': {
                    'steel_kg': estimate_result.steel_kg,
                    'concrete_m3': estimate_result.concrete_m3,
                    'blocks_nos': estimate_result.blocks_nos,
                    'cement_bags_50kg': estimate_result.cement_bags_50kg,
                    'sand_m3': estimate_result.sand_m3,
                    'aggregate_m3': estimate_result.aggregate_m3
                },
                'costs': {
                    'structure_cost': estimate_result.structure_cost,
                    'finishing_cost': estimate_result.finishing_cost,
                    'mep_cost': estimate_result.mep_cost,
                    'total_estimated_cost': estimate_result.total_estimated_cost,
                    'cost_per_sqm': estimate_result.cost_per_sqm
                },
                'confidence_level': estimate_result.confidence_level,
                'warnings': estimate_result.warnings
            },
            room_breakdown=room_breakdown,
            confidence=min(plan.confidence, self._estimate_confidence(estimate_result)),
            notes=notes
        )
        
        return integrated_estimate
    
    def _convert_to_sqm(self, value: float, unit: str) -> float:
        """تحويل إلى متر مربع"""
        unit_lower = unit.lower().replace(' ', '')
        
        if 'sqm' in unit_lower or 'm²' in unit_lower or 'squaremeter' in unit_lower:
            return value
        elif 'sqft' in unit_lower or 'ft²' in unit_lower or 'squarefeet' in unit_lower or 'squarefoot' in unit_lower:
            return UnitConverter.convert_area(value, AreaUnit.SQUARE_FOOT, AreaUnit.SQUARE_METER)
        else:
            # افتراضياً square feet
            return UnitConverter.convert_area(value, AreaUnit.SQUARE_FOOT, AreaUnit.SQUARE_METER)
    
    def _convert_to_meters(self, value: float, unit: str) -> float:
        """تحويل إلى متر"""
        unit_lower = unit.lower().replace(' ', '').replace("'", '')
        
        if unit_lower in ['m', 'meter', 'meters', 'metre', 'metres']:
            return value
        elif unit_lower in ['ft', 'feet', 'foot']:
            return UnitConverter.convert_length(value, LengthUnit.FOOT, LengthUnit.METER)
        elif unit_lower in ['in', 'inch', 'inches']:
            return UnitConverter.convert_length(value, LengthUnit.INCH, LengthUnit.METER)
        else:
            # افتراضياً feet
            return UnitConverter.convert_length(value, LengthUnit.FOOT, LengthUnit.METER)
    
    def _determine_building_type(self, plan: HousePlanData) -> BuildingType:
        """تحديد نوع المبنى من البيانات"""
        bhk = plan.bhk or 0
        
        if bhk >= 4:
            return BuildingType.VILLA
        elif bhk >= 2:
            if 'villa' in plan.title.lower():
                return BuildingType.VILLA
            else:
                return BuildingType.APARTMENT
        else:
            return BuildingType.RESIDENTIAL
    
    def _estimate_storeys(self, plan: HousePlanData) -> int:
        """تقدير عدد الطوابق"""
        # Check title for floor indications
        title_lower = plan.title.lower()
        
        if 'duplex' in title_lower or 'two story' in title_lower or 'g+1' in title_lower:
            return 2
        elif 'triplex' in title_lower or 'three story' in title_lower or 'g+2' in title_lower:
            return 3
        elif 'ground floor' in title_lower or 'single story' in title_lower or 'g floor' in title_lower:
            return 1
        
        # افتراضياً طابق واحد
        return 1
    
    def _analyze_rooms(self, rooms: List[RoomData]) -> List[Dict[str, any]]:
        """تحليل الغرف"""
        breakdown = []
        
        for room in rooms:
            # تحويل المساحة إلى m²
            area_sqm = self._convert_to_sqm(
                room.area['value'],
                room.area['unit']
            )
            
            breakdown.append({
                'name': room.name,
                'type': room.type,
                'dimensions': room.dimensions,
                'area_sqm': round(area_sqm, 2),
                'area_sqft': round(
                    UnitConverter.convert_area(area_sqm, AreaUnit.SQUARE_METER, AreaUnit.SQUARE_FOOT),
                    2
                )
            })
        
        return breakdown
    
    def _estimate_confidence(self, estimate_result: EstimateOutput) -> float:
        """تقدير مستوى الثقة"""
        if estimate_result.confidence_level == 'high':
            return 0.9
        elif estimate_result.confidence_level == 'medium':
            return 0.7
        else:
            return 0.5
    
    def _generate_notes(self, plan: HousePlanData, estimate: EstimateOutput) -> List[str]:
        """إنشاء ملاحظات"""
        notes = []
        
        # خطة الاستخراج
        notes.append(f"✅ Plan extracted with {plan.confidence:.0%} confidence")
        
        # التقدير
        notes.append(f"📊 Cost estimate: {estimate.confidence_level.upper()} confidence")
        
        # الغرف
        if len(plan.rooms) > 0:
            notes.append(f"🏠 {len(plan.rooms)} rooms identified")
        else:
            notes.append("⚠️ No rooms identified - manual verification recommended")
        
        # البنية الإنشائية
        if plan.structure.columns:
            notes.append(f"🏗️ {plan.structure.columns['count']} columns specified")
        
        if plan.structure.concrete:
            notes.append(f"🧱 Concrete grade: {plan.structure.concrete['grade']}")
        
        # التحذيرات من التقدير
        if estimate.warnings:
            notes.extend([f"⚠️ {w}" for w in estimate.warnings])
        
        return notes
    
    def compare_plans_with_estimates(
        self,
        plan1: HousePlanData,
        plan2: HousePlanData,
        region: Region = Region.SAUDI_ARABIA
    ) -> Dict[str, any]:
        """
        مقارنة مخططين مع التقديرات
        """
        # الحصول على التقديرات
        estimate1 = self.generate_estimate_from_plan(plan1, region)
        estimate2 = self.generate_estimate_from_plan(plan2, region)
        
        # المقارنة الأساسية
        basic_comparison = HousePlanAnalyzer.compare_plans(plan1, plan2)
        
        # مقارنة التكاليف
        cost_comparison = {
            'plan1_total_cost': estimate1.quick_estimate['costs']['total_estimated_cost'],
            'plan2_total_cost': estimate2.quick_estimate['costs']['total_estimated_cost'],
            'cost_difference': abs(
                estimate1.quick_estimate['costs']['total_estimated_cost'] -
                estimate2.quick_estimate['costs']['total_estimated_cost']
            ),
            'cheaper_plan': plan1.title if estimate1.quick_estimate['costs']['total_estimated_cost'] < 
                                            estimate2.quick_estimate['costs']['total_estimated_cost'] 
                                         else plan2.title
        }
        
        # مقارنة الكميات
        materials_comparison = {
            'steel': {
                'plan1': estimate1.quick_estimate['materials']['steel_kg'],
                'plan2': estimate2.quick_estimate['materials']['steel_kg'],
                'difference': abs(
                    estimate1.quick_estimate['materials']['steel_kg'] -
                    estimate2.quick_estimate['materials']['steel_kg']
                )
            },
            'concrete': {
                'plan1': estimate1.quick_estimate['materials']['concrete_m3'],
                'plan2': estimate2.quick_estimate['materials']['concrete_m3'],
                'difference': abs(
                    estimate1.quick_estimate['materials']['concrete_m3'] -
                    estimate2.quick_estimate['materials']['concrete_m3']
                )
            }
        }
        
        return {
            'basic_comparison': basic_comparison,
            'cost_comparison': cost_comparison,
            'materials_comparison': materials_comparison,
            'estimates': {
                'plan1': estimate1,
                'plan2': estimate2
            }
        }
    
    def generate_boq_from_plan(self, plan: HousePlanData) -> Dict[str, any]:
        """
        إنشاء BOQ أولي من المخطط
        (للتكامل مع QuantityAnalyzer لاحقاً)
        """
        # الحصول على التقدير
        estimate = self.generate_estimate_from_plan(plan)
        
        boq_items = []
        
        # 1. أعمال الحفر
        boq_items.append({
            'item_no': '01-001',
            'description': 'Excavation for foundations',
            'unit': 'm³',
            'quantity': estimate.building_area_sqm * 0.6,  # متوسط عمق 60 سم
            'category': 'Earthwork'
        })
        
        # 2. الخرسانة المسلحة
        boq_items.append({
            'item_no': '02-001',
            'description': f'Reinforced concrete - {plan.structure.concrete["grade"] if plan.structure.concrete else "M20"}',
            'unit': 'm³',
            'quantity': estimate.quick_estimate['materials']['concrete_m3'],
            'category': 'Concrete Work'
        })
        
        # 3. حديد التسليح
        boq_items.append({
            'item_no': '02-002',
            'description': f'Reinforcement steel - {plan.structure.rebar["grade"] if plan.structure.rebar else "Fe 500"}',
            'unit': 'kg',
            'quantity': estimate.quick_estimate['materials']['steel_kg'],
            'category': 'Steel Work'
        })
        
        # 4. البلوك
        boq_items.append({
            'item_no': '03-001',
            'description': 'Concrete blocks 20cm',
            'unit': 'nos',
            'quantity': estimate.quick_estimate['materials']['blocks_nos'],
            'category': 'Masonry'
        })
        
        # 5. الأسمنت
        boq_items.append({
            'item_no': '04-001',
            'description': 'Cement bags 50kg',
            'unit': 'bags',
            'quantity': estimate.quick_estimate['materials']['cement_bags_50kg'],
            'category': 'Materials'
        })
        
        # 6. بنود الغرف (تشطيبات)
        for idx, room in enumerate(plan.rooms, start=1):
            room_area_sqm = self._convert_to_sqm(room.area['value'], room.area['unit'])
            
            boq_items.append({
                'item_no': f'05-{idx:03d}',
                'description': f'{room.type.title()} - {room.name} - Floor tiles',
                'unit': 'm²',
                'quantity': room_area_sqm,
                'category': 'Finishes'
            })
        
        return {
            'plan_id': plan.plan_id,
            'plan_title': plan.title,
            'boq_items': boq_items,
            'total_items': len(boq_items),
            'notes': [
                '⚠️ This is a preliminary BOQ generated from plan data',
                '⚠️ Use QuantityAnalyzer for detailed BOQ with SBC compliance'
            ]
        }


# Example usage
if __name__ == '__main__':
    from house_plan_extractor import HousePlanScraper
    
    # استخراج مخطط
    url = 'https://www.civilconcept.com/3bhk-house-plan-27x44-feet-home-plan/'
    plan = HousePlanScraper.scrape_plan(url)
    
    if plan:
        # إنشاء تقدير متكامل
        integrator = HousePlanIntegrator()
        estimate = integrator.generate_estimate_from_plan(
            plan,
            region=Region.SAUDI_ARABIA,
            finish_level=FinishLevel.STANDARD
        )
        
        print("\n" + "="*80)
        print("INTEGRATED ESTIMATE")
        print("="*80)
        print(f"Plan: {estimate.plan_title}")
        print(f"Building Area: {estimate.building_area_sqm:.2f} m²")
        print(f"Rooms: {estimate.room_count}")
        print(f"\nTotal Cost: {estimate.quick_estimate['costs']['total_estimated_cost']:,.0f} {estimate.quick_estimate['currency']}")
        print(f"Cost per m²: {estimate.quick_estimate['costs']['cost_per_sqm']:,.0f} {estimate.quick_estimate['currency']}")
        print(f"\nConfidence: {estimate.confidence:.0%}")
        
        print("\nNotes:")
        for note in estimate.notes:
            print(f"  {note}")
        
        # إنشاء BOQ أولي
        boq = integrator.generate_boq_from_plan(plan)
        print(f"\nPreliminary BOQ: {boq['total_items']} items")
