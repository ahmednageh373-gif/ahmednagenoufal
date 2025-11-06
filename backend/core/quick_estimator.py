"""
Quick Estimator Module - نظام التقدير السريع
====================================

Factor-based preliminary cost estimation inspired by CivilConcept.com
Provides quick rough order of magnitude estimates for feasibility studies.

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import math


class Region(Enum):
    """Supported regions with specific construction factors"""
    SAUDI_ARABIA = "saudi_arabia"
    UAE = "uae"
    QATAR = "qatar"
    KUWAIT = "kuwait"
    OMAN = "oman"
    BAHRAIN = "bahrain"
    EGYPT = "egypt"
    JORDAN = "jordan"


class BuildingType(Enum):
    """Building types with different material requirements"""
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"
    VILLA = "villa"
    APARTMENT = "apartment"
    WAREHOUSE = "warehouse"
    OFFICE = "office"


class FinishLevel(Enum):
    """Finish quality levels"""
    BASIC = "basic"
    STANDARD = "standard"
    LUXURY = "luxury"
    SUPER_LUXURY = "super_luxury"


@dataclass
class RegionalFactors:
    """Material factors for a specific region"""
    # Material quantities per square meter
    steel_kg_per_sqm: float  # Steel reinforcement (kg/m²)
    concrete_m3_per_sqm: float  # Concrete volume (m³/m²)
    blocks_per_sqm: float  # Concrete blocks or bricks
    cement_bags_per_sqm: float  # Cement bags (50kg each)
    sand_m3_per_sqm: float  # Sand volume (m³/m²)
    aggregate_m3_per_sqm: float  # Aggregate volume (m³/m²)
    
    # Cost factors (base currency per m²)
    structure_cost_per_sqm: float  # Structure only
    finishing_cost_per_sqm: float  # Finishing work
    mep_cost_per_sqm: float  # MEP (Mechanical, Electrical, Plumbing)
    
    # Multipliers
    storey_multiplier_2: float  # For 2-storey buildings
    storey_multiplier_3: float  # For 3-storey buildings
    storey_multiplier_4plus: float  # For 4+ storey buildings
    
    # Building type multipliers
    building_type_multipliers: Dict[BuildingType, float]
    
    # Finish level multipliers
    finish_multipliers: Dict[FinishLevel, float]
    
    # Currency
    currency: str


class QuickEstimatorConfig:
    """Configuration for regional construction factors"""
    
    REGIONAL_FACTORS = {
        Region.SAUDI_ARABIA: RegionalFactors(
            # Material quantities (based on SBC standards)
            steel_kg_per_sqm=60.0,  # ~5.5 kg/sqft converted to kg/m²
            concrete_m3_per_sqm=0.30,  # Average for structure
            blocks_per_sqm=12.5,  # 20cm hollow concrete blocks
            cement_bags_per_sqm=5.0,  # 50kg bags
            sand_m3_per_sqm=0.045,
            aggregate_m3_per_sqm=0.090,
            
            # Cost factors (SAR per m²) - 2024 average prices
            structure_cost_per_sqm=800.0,  # Foundations + structure
            finishing_cost_per_sqm=600.0,  # Tiles, plaster, paint, doors, windows
            mep_cost_per_sqm=400.0,  # Electrical, plumbing, HVAC
            
            # Storey multipliers
            storey_multiplier_2=1.65,
            storey_multiplier_3=2.35,
            storey_multiplier_4plus=3.20,
            
            # Building type multipliers
            building_type_multipliers={
                BuildingType.RESIDENTIAL: 1.0,
                BuildingType.VILLA: 1.15,
                BuildingType.APARTMENT: 0.95,
                BuildingType.COMMERCIAL: 1.25,
                BuildingType.OFFICE: 1.30,
                BuildingType.INDUSTRIAL: 0.85,
                BuildingType.WAREHOUSE: 0.70,
            },
            
            # Finish level multipliers
            finish_multipliers={
                FinishLevel.BASIC: 0.75,
                FinishLevel.STANDARD: 1.0,
                FinishLevel.LUXURY: 1.50,
                FinishLevel.SUPER_LUXURY: 2.20,
            },
            
            currency="SAR"
        ),
        
        Region.UAE: RegionalFactors(
            steel_kg_per_sqm=65.0,
            concrete_m3_per_sqm=0.32,
            blocks_per_sqm=12.5,
            cement_bags_per_sqm=5.2,
            sand_m3_per_sqm=0.048,
            aggregate_m3_per_sqm=0.095,
            structure_cost_per_sqm=900.0,  # AED
            finishing_cost_per_sqm=700.0,
            mep_cost_per_sqm=450.0,
            storey_multiplier_2=1.70,
            storey_multiplier_3=2.40,
            storey_multiplier_4plus=3.30,
            building_type_multipliers={
                BuildingType.RESIDENTIAL: 1.0,
                BuildingType.VILLA: 1.20,
                BuildingType.APARTMENT: 0.95,
                BuildingType.COMMERCIAL: 1.30,
                BuildingType.OFFICE: 1.35,
                BuildingType.INDUSTRIAL: 0.85,
                BuildingType.WAREHOUSE: 0.70,
            },
            finish_multipliers={
                FinishLevel.BASIC: 0.75,
                FinishLevel.STANDARD: 1.0,
                FinishLevel.LUXURY: 1.60,
                FinishLevel.SUPER_LUXURY: 2.50,
            },
            currency="AED"
        ),
        
        Region.EGYPT: RegionalFactors(
            steel_kg_per_sqm=55.0,
            concrete_m3_per_sqm=0.28,
            blocks_per_sqm=12.0,
            cement_bags_per_sqm=4.8,
            sand_m3_per_sqm=0.042,
            aggregate_m3_per_sqm=0.085,
            structure_cost_per_sqm=3500.0,  # EGP
            finishing_cost_per_sqm=2500.0,
            mep_cost_per_sqm=1500.0,
            storey_multiplier_2=1.70,
            storey_multiplier_3=2.40,
            storey_multiplier_4plus=3.25,
            building_type_multipliers={
                BuildingType.RESIDENTIAL: 1.0,
                BuildingType.VILLA: 1.10,
                BuildingType.APARTMENT: 0.90,
                BuildingType.COMMERCIAL: 1.20,
                BuildingType.OFFICE: 1.25,
                BuildingType.INDUSTRIAL: 0.80,
                BuildingType.WAREHOUSE: 0.65,
            },
            finish_multipliers={
                FinishLevel.BASIC: 0.70,
                FinishLevel.STANDARD: 1.0,
                FinishLevel.LUXURY: 1.40,
                FinishLevel.SUPER_LUXURY: 2.00,
            },
            currency="EGP"
        ),
    }


@dataclass
class EstimateInput:
    """Input parameters for quick estimation"""
    # Basic dimensions
    total_area_sqm: float
    number_of_storeys: int
    
    # Building characteristics
    region: Region = Region.SAUDI_ARABIA
    building_type: BuildingType = BuildingType.RESIDENTIAL
    finish_level: FinishLevel = FinishLevel.STANDARD
    
    # Optional: Detailed room breakdown (for more accuracy)
    rooms: Optional[List[Dict[str, float]]] = None  # [{'length': 4.0, 'width': 5.0}, ...]
    
    # Optional: Custom contractor rate (overrides calculated cost)
    custom_contractor_rate: Optional[float] = None


@dataclass
class EstimateOutput:
    """Output of quick estimation"""
    # Input summary
    region: str
    building_type: str
    finish_level: str
    total_area_sqm: float
    number_of_storeys: int
    currency: str
    
    # Material quantities
    steel_kg: float
    concrete_m3: float
    blocks_nos: float
    cement_bags_50kg: float
    sand_m3: float
    aggregate_m3: float
    
    # Cost breakdown
    structure_cost: float
    finishing_cost: float
    mep_cost: float
    total_estimated_cost: float
    cost_per_sqm: float
    
    # Factors used
    storey_multiplier: float
    building_type_multiplier: float
    finish_multiplier: float
    
    # Warnings and notes
    warnings: List[str]
    confidence_level: str  # "low", "medium", "high"


class QuickEstimator:
    """
    Quick preliminary cost estimator for construction projects.
    
    ⚠️ WARNING: This is for PRELIMINARY ESTIMATES ONLY!
    For detailed BOQ and SBC compliance, use the full QuantityAnalyzer module.
    """
    
    def __init__(self, config: Optional[QuickEstimatorConfig] = None):
        self.config = config or QuickEstimatorConfig()
    
    def estimate(self, input_data: EstimateInput) -> EstimateOutput:
        """
        Generate quick preliminary estimate.
        
        Args:
            input_data: Input parameters for estimation
            
        Returns:
            EstimateOutput with quantities and costs
        """
        # Get regional factors
        factors = self.config.REGIONAL_FACTORS.get(input_data.region)
        if not factors:
            raise ValueError(f"Region {input_data.region} not supported")
        
        # Calculate storey multiplier
        storey_multiplier = self._get_storey_multiplier(
            input_data.number_of_storeys, 
            factors
        )
        
        # Get building type multiplier
        building_type_multiplier = factors.building_type_multipliers.get(
            input_data.building_type, 
            1.0
        )
        
        # Get finish level multiplier
        finish_multiplier = factors.finish_multipliers.get(
            input_data.finish_level, 
            1.0
        )
        
        # Calculate base quantities (per storey)
        base_area = input_data.total_area_sqm
        
        # Material quantities with multipliers
        steel_kg = base_area * factors.steel_kg_per_sqm * storey_multiplier
        concrete_m3 = base_area * factors.concrete_m3_per_sqm * storey_multiplier
        blocks = base_area * factors.blocks_per_sqm * storey_multiplier
        cement_bags = base_area * factors.cement_bags_per_sqm * storey_multiplier
        sand_m3 = base_area * factors.sand_m3_per_sqm * storey_multiplier
        aggregate_m3 = base_area * factors.aggregate_m3_per_sqm * storey_multiplier
        
        # Cost calculations
        if input_data.custom_contractor_rate:
            # Use custom rate if provided
            total_cost = base_area * input_data.custom_contractor_rate * storey_multiplier
            structure_cost = total_cost * 0.45  # Estimated breakdown
            finishing_cost = total_cost * 0.35
            mep_cost = total_cost * 0.20
        else:
            # Calculate from factors
            structure_cost = (
                base_area * 
                factors.structure_cost_per_sqm * 
                storey_multiplier * 
                building_type_multiplier
            )
            
            finishing_cost = (
                base_area * 
                factors.finishing_cost_per_sqm * 
                storey_multiplier * 
                finish_multiplier
            )
            
            mep_cost = (
                base_area * 
                factors.mep_cost_per_sqm * 
                storey_multiplier * 
                building_type_multiplier
            )
            
            total_cost = structure_cost + finishing_cost + mep_cost
        
        cost_per_sqm = total_cost / (base_area * input_data.number_of_storeys)
        
        # Generate warnings and determine confidence level
        warnings = self._generate_warnings(input_data)
        confidence_level = self._calculate_confidence_level(input_data)
        
        return EstimateOutput(
            region=input_data.region.value,
            building_type=input_data.building_type.value,
            finish_level=input_data.finish_level.value,
            total_area_sqm=base_area,
            number_of_storeys=input_data.number_of_storeys,
            currency=factors.currency,
            steel_kg=round(steel_kg, 2),
            concrete_m3=round(concrete_m3, 2),
            blocks_nos=round(blocks, 0),
            cement_bags_50kg=round(cement_bags, 0),
            sand_m3=round(sand_m3, 2),
            aggregate_m3=round(aggregate_m3, 2),
            structure_cost=round(structure_cost, 2),
            finishing_cost=round(finishing_cost, 2),
            mep_cost=round(mep_cost, 2),
            total_estimated_cost=round(total_cost, 2),
            cost_per_sqm=round(cost_per_sqm, 2),
            storey_multiplier=storey_multiplier,
            building_type_multiplier=building_type_multiplier,
            finish_multiplier=finish_multiplier,
            warnings=warnings,
            confidence_level=confidence_level
        )
    
    def _get_storey_multiplier(self, storeys: int, factors: RegionalFactors) -> float:
        """Calculate storey multiplier based on number of storeys"""
        if storeys == 1:
            return 1.0
        elif storeys == 2:
            return factors.storey_multiplier_2
        elif storeys == 3:
            return factors.storey_multiplier_3
        else:  # 4+
            return factors.storey_multiplier_4plus
    
    def _generate_warnings(self, input_data: EstimateInput) -> List[str]:
        """Generate warnings about estimate limitations"""
        warnings = []
        
        warnings.append(
            "⚠️ هذا تقدير أولي فقط - استخدم QuantityAnalyzer للتحليل التفصيلي"
        )
        warnings.append(
            "⚠️ This is a preliminary estimate only - use QuantityAnalyzer for detailed analysis"
        )
        
        if input_data.total_area_sqm > 1000:
            warnings.append(
                "⚠️ دقة التقدير تقل للمشاريع الكبيرة (>1000م²)"
            )
            warnings.append(
                "⚠️ Estimate accuracy decreases for large projects (>1000 m²)"
            )
        
        if input_data.number_of_storeys > 4:
            warnings.append(
                "⚠️ المباني فوق 4 طوابق تحتاج تحليل إنشائي متخصص"
            )
            warnings.append(
                "⚠️ Buildings over 4 storeys require specialized structural analysis"
            )
        
        if input_data.finish_level in [FinishLevel.LUXURY, FinishLevel.SUPER_LUXURY]:
            warnings.append(
                "⚠️ التشطيبات الفاخرة تحتاج specifications تفصيلية"
            )
            warnings.append(
                "⚠️ Luxury finishes require detailed specifications"
            )
        
        return warnings
    
    def _calculate_confidence_level(self, input_data: EstimateInput) -> str:
        """Determine confidence level of estimate"""
        score = 100
        
        # Area factor
        if input_data.total_area_sqm > 1000:
            score -= 20
        elif input_data.total_area_sqm > 500:
            score -= 10
        
        # Storey factor
        if input_data.number_of_storeys > 4:
            score -= 20
        elif input_data.number_of_storeys > 3:
            score -= 10
        
        # Finish level factor
        if input_data.finish_level in [FinishLevel.LUXURY, FinishLevel.SUPER_LUXURY]:
            score -= 15
        
        # Building type factor
        if input_data.building_type in [BuildingType.INDUSTRIAL, BuildingType.COMMERCIAL]:
            score -= 10
        
        if score >= 80:
            return "high"
        elif score >= 60:
            return "medium"
        else:
            return "low"
    
    def generate_comparison_table(
        self, 
        base_input: EstimateInput, 
        variations: List[Dict]
    ) -> List[EstimateOutput]:
        """
        Generate multiple estimates for comparison.
        
        Args:
            base_input: Base estimation parameters
            variations: List of parameter variations to test
                       e.g., [{'finish_level': FinishLevel.BASIC}, ...]
        
        Returns:
            List of EstimateOutput for comparison
        """
        results = []
        
        # Base estimate
        results.append(self.estimate(base_input))
        
        # Variations
        for variation in variations:
            modified_input = EstimateInput(
                total_area_sqm=variation.get('total_area_sqm', base_input.total_area_sqm),
                number_of_storeys=variation.get('number_of_storeys', base_input.number_of_storeys),
                region=variation.get('region', base_input.region),
                building_type=variation.get('building_type', base_input.building_type),
                finish_level=variation.get('finish_level', base_input.finish_level),
                custom_contractor_rate=variation.get('custom_contractor_rate')
            )
            results.append(self.estimate(modified_input))
        
        return results


# Example usage
if __name__ == "__main__":
    # Example: Villa in Saudi Arabia
    estimator = QuickEstimator()
    
    input_data = EstimateInput(
        total_area_sqm=400.0,  # 400 m² per floor
        number_of_storeys=2,    # G+1 (2 storeys)
        region=Region.SAUDI_ARABIA,
        building_type=BuildingType.VILLA,
        finish_level=FinishLevel.STANDARD
    )
    
    result = estimator.estimate(input_data)
    
    print("=" * 80)
    print("NOUFAL Quick Estimator - تقدير سريع")
    print("=" * 80)
    print(f"\n📍 Region: {result.region}")
    print(f"🏠 Building Type: {result.building_type}")
    print(f"✨ Finish Level: {result.finish_level}")
    print(f"📐 Total Area: {result.total_area_sqm} m²")
    print(f"🏢 Storeys: {result.number_of_storeys}")
    print(f"\n💰 COST ESTIMATE ({result.currency}):")
    print(f"   Structure: {result.structure_cost:,.2f}")
    print(f"   Finishing: {result.finishing_cost:,.2f}")
    print(f"   MEP: {result.mep_cost:,.2f}")
    print(f"   ─────────────────────")
    print(f"   TOTAL: {result.total_estimated_cost:,.2f}")
    print(f"   Cost/m²: {result.cost_per_sqm:,.2f}")
    print(f"\n📦 MATERIAL QUANTITIES:")
    print(f"   Steel: {result.steel_kg:,.0f} kg")
    print(f"   Concrete: {result.concrete_m3:,.2f} m³")
    print(f"   Blocks: {result.blocks_nos:,.0f} nos")
    print(f"   Cement: {result.cement_bags_50kg:,.0f} bags (50kg)")
    print(f"   Sand: {result.sand_m3:,.2f} m³")
    print(f"   Aggregate: {result.aggregate_m3:,.2f} m³")
    print(f"\n📊 CONFIDENCE: {result.confidence_level.upper()}")
    print(f"\n⚠️  WARNINGS:")
    for warning in result.warnings:
        print(f"   {warning}")
    print("=" * 80)
