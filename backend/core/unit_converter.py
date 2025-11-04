"""
Unit Converter Module - محول الوحدات الشامل
=======================================

Comprehensive unit conversion for civil engineering calculations.
Supports metric ↔ imperial conversions for length, area, volume, weight, pressure, etc.

Author: NOUFAL Engineering Management System
Date: 2025-11-04
Version: 1.0
"""

from typing import Dict, Union, Optional
from enum import Enum
import math


class LengthUnit(Enum):
    """Length units"""
    # Metric
    MILLIMETER = "mm"
    CENTIMETER = "cm"
    METER = "m"
    KILOMETER = "km"
    # Imperial
    INCH = "in"
    FOOT = "ft"
    YARD = "yd"
    MILE = "mi"


class AreaUnit(Enum):
    """Area units"""
    # Metric
    SQUARE_MILLIMETER = "mm²"
    SQUARE_CENTIMETER = "cm²"
    SQUARE_METER = "m²"
    SQUARE_KILOMETER = "km²"
    HECTARE = "ha"
    # Imperial
    SQUARE_INCH = "in²"
    SQUARE_FOOT = "ft²"
    SQUARE_YARD = "yd²"
    ACRE = "acre"
    SQUARE_MILE = "mi²"


class VolumeUnit(Enum):
    """Volume units"""
    # Metric
    CUBIC_MILLIMETER = "mm³"
    CUBIC_CENTIMETER = "cm³"
    CUBIC_METER = "m³"
    LITER = "L"
    MILLILITER = "mL"
    # Imperial
    CUBIC_INCH = "in³"
    CUBIC_FOOT = "ft³"
    CUBIC_YARD = "yd³"
    GALLON_US = "gal(US)"
    GALLON_UK = "gal(UK)"


class WeightUnit(Enum):
    """Weight/Mass units"""
    # Metric
    MILLIGRAM = "mg"
    GRAM = "g"
    KILOGRAM = "kg"
    METRIC_TON = "ton"
    # Imperial
    OUNCE = "oz"
    POUND = "lb"
    TON_US = "ton(US)"
    TON_UK = "ton(UK)"


class PressureUnit(Enum):
    """Pressure/Stress units"""
    PASCAL = "Pa"
    KILOPASCAL = "kPa"
    MEGAPASCAL = "MPa"
    GIGAPASCAL = "GPa"
    BAR = "bar"
    PSI = "psi"
    KSI = "ksi"
    KG_PER_CM2 = "kg/cm²"


class ForceUnit(Enum):
    """Force units"""
    NEWTON = "N"
    KILONEWTON = "kN"
    MEGANEWTON = "MN"
    POUND_FORCE = "lbf"
    KILO_POUND_FORCE = "kip"
    KILOGRAM_FORCE = "kgf"
    TON_FORCE = "tonf"


class TemperatureUnit(Enum):
    """Temperature units"""
    CELSIUS = "°C"
    FAHRENHEIT = "°F"
    KELVIN = "K"


class UnitConverter:
    """
    Comprehensive unit converter for civil engineering.
    All conversions maintain high precision for engineering calculations.
    """
    
    # Conversion factors to base units (meter, m², m³, kg, Pa, N, °C)
    LENGTH_TO_METER = {
        LengthUnit.MILLIMETER: 0.001,
        LengthUnit.CENTIMETER: 0.01,
        LengthUnit.METER: 1.0,
        LengthUnit.KILOMETER: 1000.0,
        LengthUnit.INCH: 0.0254,
        LengthUnit.FOOT: 0.3048,
        LengthUnit.YARD: 0.9144,
        LengthUnit.MILE: 1609.344,
    }
    
    AREA_TO_SQUARE_METER = {
        AreaUnit.SQUARE_MILLIMETER: 0.000001,
        AreaUnit.SQUARE_CENTIMETER: 0.0001,
        AreaUnit.SQUARE_METER: 1.0,
        AreaUnit.SQUARE_KILOMETER: 1000000.0,
        AreaUnit.HECTARE: 10000.0,
        AreaUnit.SQUARE_INCH: 0.00064516,
        AreaUnit.SQUARE_FOOT: 0.09290304,
        AreaUnit.SQUARE_YARD: 0.83612736,
        AreaUnit.ACRE: 4046.8564224,
        AreaUnit.SQUARE_MILE: 2589988.110336,
    }
    
    VOLUME_TO_CUBIC_METER = {
        VolumeUnit.CUBIC_MILLIMETER: 0.000000001,
        VolumeUnit.CUBIC_CENTIMETER: 0.000001,
        VolumeUnit.CUBIC_METER: 1.0,
        VolumeUnit.LITER: 0.001,
        VolumeUnit.MILLILITER: 0.000001,
        VolumeUnit.CUBIC_INCH: 0.000016387064,
        VolumeUnit.CUBIC_FOOT: 0.028316846592,
        VolumeUnit.CUBIC_YARD: 0.764554857984,
        VolumeUnit.GALLON_US: 0.003785411784,
        VolumeUnit.GALLON_UK: 0.00454609,
    }
    
    WEIGHT_TO_KILOGRAM = {
        WeightUnit.MILLIGRAM: 0.000001,
        WeightUnit.GRAM: 0.001,
        WeightUnit.KILOGRAM: 1.0,
        WeightUnit.METRIC_TON: 1000.0,
        WeightUnit.OUNCE: 0.028349523125,
        WeightUnit.POUND: 0.45359237,
        WeightUnit.TON_US: 907.18474,
        WeightUnit.TON_UK: 1016.0469088,
    }
    
    PRESSURE_TO_PASCAL = {
        PressureUnit.PASCAL: 1.0,
        PressureUnit.KILOPASCAL: 1000.0,
        PressureUnit.MEGAPASCAL: 1000000.0,
        PressureUnit.GIGAPASCAL: 1000000000.0,
        PressureUnit.BAR: 100000.0,
        PressureUnit.PSI: 6894.757293168,
        PressureUnit.KSI: 6894757.293168,
        PressureUnit.KG_PER_CM2: 98066.5,
    }
    
    FORCE_TO_NEWTON = {
        ForceUnit.NEWTON: 1.0,
        ForceUnit.KILONEWTON: 1000.0,
        ForceUnit.MEGANEWTON: 1000000.0,
        ForceUnit.POUND_FORCE: 4.4482216152605,
        ForceUnit.KILO_POUND_FORCE: 4448.2216152605,
        ForceUnit.KILOGRAM_FORCE: 9.80665,
        ForceUnit.TON_FORCE: 9806.65,
    }
    
    @staticmethod
    def convert_length(
        value: float, 
        from_unit: LengthUnit, 
        to_unit: LengthUnit
    ) -> float:
        """
        Convert length between units.
        
        Args:
            value: Value to convert
            from_unit: Source unit
            to_unit: Target unit
            
        Returns:
            Converted value
        """
        # Convert to base (meter)
        meters = value * UnitConverter.LENGTH_TO_METER[from_unit]
        # Convert to target
        result = meters / UnitConverter.LENGTH_TO_METER[to_unit]
        return result
    
    @staticmethod
    def convert_area(
        value: float, 
        from_unit: AreaUnit, 
        to_unit: AreaUnit
    ) -> float:
        """Convert area between units"""
        square_meters = value * UnitConverter.AREA_TO_SQUARE_METER[from_unit]
        result = square_meters / UnitConverter.AREA_TO_SQUARE_METER[to_unit]
        return result
    
    @staticmethod
    def convert_volume(
        value: float, 
        from_unit: VolumeUnit, 
        to_unit: VolumeUnit
    ) -> float:
        """Convert volume between units"""
        cubic_meters = value * UnitConverter.VOLUME_TO_CUBIC_METER[from_unit]
        result = cubic_meters / UnitConverter.VOLUME_TO_CUBIC_METER[to_unit]
        return result
    
    @staticmethod
    def convert_weight(
        value: float, 
        from_unit: WeightUnit, 
        to_unit: WeightUnit
    ) -> float:
        """Convert weight between units"""
        kilograms = value * UnitConverter.WEIGHT_TO_KILOGRAM[from_unit]
        result = kilograms / UnitConverter.WEIGHT_TO_KILOGRAM[to_unit]
        return result
    
    @staticmethod
    def convert_pressure(
        value: float, 
        from_unit: PressureUnit, 
        to_unit: PressureUnit
    ) -> float:
        """Convert pressure between units"""
        pascals = value * UnitConverter.PRESSURE_TO_PASCAL[from_unit]
        result = pascals / UnitConverter.PRESSURE_TO_PASCAL[to_unit]
        return result
    
    @staticmethod
    def convert_force(
        value: float, 
        from_unit: ForceUnit, 
        to_unit: ForceUnit
    ) -> float:
        """Convert force between units"""
        newtons = value * UnitConverter.FORCE_TO_NEWTON[from_unit]
        result = newtons / UnitConverter.FORCE_TO_NEWTON[to_unit]
        return result
    
    @staticmethod
    def convert_temperature(
        value: float, 
        from_unit: TemperatureUnit, 
        to_unit: TemperatureUnit
    ) -> float:
        """
        Convert temperature between units.
        Temperature conversion is not linear, requires special handling.
        """
        # Convert to Celsius first
        if from_unit == TemperatureUnit.CELSIUS:
            celsius = value
        elif from_unit == TemperatureUnit.FAHRENHEIT:
            celsius = (value - 32) * 5 / 9
        elif from_unit == TemperatureUnit.KELVIN:
            celsius = value - 273.15
        else:
            raise ValueError(f"Unknown temperature unit: {from_unit}")
        
        # Convert from Celsius to target
        if to_unit == TemperatureUnit.CELSIUS:
            return celsius
        elif to_unit == TemperatureUnit.FAHRENHEIT:
            return celsius * 9 / 5 + 32
        elif to_unit == TemperatureUnit.KELVIN:
            return celsius + 273.15
        else:
            raise ValueError(f"Unknown temperature unit: {to_unit}")
    
    @staticmethod
    def batch_convert(
        values: Dict[str, float],
        conversions: Dict[str, tuple]
    ) -> Dict[str, float]:
        """
        Batch convert multiple values.
        
        Args:
            values: Dictionary of {name: value}
            conversions: Dictionary of {name: (from_unit, to_unit)}
            
        Returns:
            Dictionary of converted values
        """
        results = {}
        
        for name, value in values.items():
            if name not in conversions:
                results[name] = value  # No conversion specified
                continue
            
            from_unit, to_unit = conversions[name]
            
            # Determine unit type and convert
            if isinstance(from_unit, LengthUnit):
                results[name] = UnitConverter.convert_length(value, from_unit, to_unit)
            elif isinstance(from_unit, AreaUnit):
                results[name] = UnitConverter.convert_area(value, from_unit, to_unit)
            elif isinstance(from_unit, VolumeUnit):
                results[name] = UnitConverter.convert_volume(value, from_unit, to_unit)
            elif isinstance(from_unit, WeightUnit):
                results[name] = UnitConverter.convert_weight(value, from_unit, to_unit)
            elif isinstance(from_unit, PressureUnit):
                results[name] = UnitConverter.convert_pressure(value, from_unit, to_unit)
            elif isinstance(from_unit, ForceUnit):
                results[name] = UnitConverter.convert_force(value, from_unit, to_unit)
            elif isinstance(from_unit, TemperatureUnit):
                results[name] = UnitConverter.convert_temperature(value, from_unit, to_unit)
            else:
                raise ValueError(f"Unknown unit type for {name}")
        
        return results


class IrregularLandCalculator:
    """
    Calculator for irregular 4-sided land plots.
    Uses Bretschneider's formula for quadrilaterals.
    """
    
    @staticmethod
    def calculate_area_with_diagonal(
        side_a: float,
        side_b: float,
        side_c: float,
        side_d: float,
        diagonal_ac: float,
        unit: LengthUnit = LengthUnit.METER
    ) -> Dict[str, float]:
        """
        Calculate area of irregular quadrilateral using one diagonal.
        
        Args:
            side_a, side_b, side_c, side_d: Four sides of the plot
            diagonal_ac: One diagonal (connecting opposite corners)
            unit: Unit of measurement
            
        Returns:
            Dictionary with area in m² and ft²
        """
        # Convert all to meters
        if unit != LengthUnit.METER:
            side_a = UnitConverter.convert_length(side_a, unit, LengthUnit.METER)
            side_b = UnitConverter.convert_length(side_b, unit, LengthUnit.METER)
            side_c = UnitConverter.convert_length(side_c, unit, LengthUnit.METER)
            side_d = UnitConverter.convert_length(side_d, unit, LengthUnit.METER)
            diagonal_ac = UnitConverter.convert_length(diagonal_ac, unit, LengthUnit.METER)
        
        # Calculate area using two triangles
        # Triangle 1: sides a, b, diagonal
        s1 = (side_a + side_b + diagonal_ac) / 2
        area1 = math.sqrt(s1 * (s1 - side_a) * (s1 - side_b) * (s1 - diagonal_ac))
        
        # Triangle 2: sides c, d, diagonal
        s2 = (side_c + side_d + diagonal_ac) / 2
        area2 = math.sqrt(s2 * (s2 - side_c) * (s2 - side_d) * (s2 - diagonal_ac))
        
        total_area_sqm = area1 + area2
        total_area_sqft = UnitConverter.convert_area(
            total_area_sqm, 
            AreaUnit.SQUARE_METER, 
            AreaUnit.SQUARE_FOOT
        )
        
        return {
            'area_sqm': round(total_area_sqm, 2),
            'area_sqft': round(total_area_sqft, 2),
            'area_hectare': round(total_area_sqm / 10000, 4),
            'area_acre': round(
                UnitConverter.convert_area(total_area_sqm, AreaUnit.SQUARE_METER, AreaUnit.ACRE), 
                4
            )
        }
    
    @staticmethod
    def calculate_area_with_coordinates(
        coordinates: list[tuple[float, float]],
        unit: LengthUnit = LengthUnit.METER
    ) -> Dict[str, float]:
        """
        Calculate area using coordinates (x, y) of corners.
        Uses Shoelace formula (Gauss's area formula).
        
        Args:
            coordinates: List of (x, y) tuples for each corner (in order)
            unit: Unit of coordinates
            
        Returns:
            Dictionary with area in various units
        """
        if len(coordinates) != 4:
            raise ValueError("Exactly 4 coordinates required for quadrilateral")
        
        # Apply Shoelace formula
        n = len(coordinates)
        area = 0.0
        
        for i in range(n):
            j = (i + 1) % n
            area += coordinates[i][0] * coordinates[j][1]
            area -= coordinates[j][0] * coordinates[i][1]
        
        area = abs(area) / 2.0
        
        # Convert to meters if needed
        if unit != LengthUnit.METER:
            # Area conversion: multiply by square of length conversion factor
            factor = UnitConverter.LENGTH_TO_METER[unit]
            area = area * (factor ** 2)
        
        area_sqft = UnitConverter.convert_area(
            area, 
            AreaUnit.SQUARE_METER, 
            AreaUnit.SQUARE_FOOT
        )
        
        return {
            'area_sqm': round(area, 2),
            'area_sqft': round(area_sqft, 2),
            'area_hectare': round(area / 10000, 4),
            'area_acre': round(
                UnitConverter.convert_area(area, AreaUnit.SQUARE_METER, AreaUnit.ACRE), 
                4
            )
        }


# Example usage
if __name__ == "__main__":
    print("=" * 80)
    print("NOUFAL Unit Converter - محول الوحدات")
    print("=" * 80)
    
    # Example 1: Length conversion
    print("\n📏 LENGTH CONVERSION:")
    length_m = 10.0
    length_ft = UnitConverter.convert_length(length_m, LengthUnit.METER, LengthUnit.FOOT)
    length_in = UnitConverter.convert_length(length_m, LengthUnit.METER, LengthUnit.INCH)
    print(f"   {length_m} m = {length_ft:.2f} ft = {length_in:.2f} in")
    
    # Example 2: Area conversion
    print("\n📐 AREA CONVERSION:")
    area_sqm = 100.0
    area_sqft = UnitConverter.convert_area(area_sqm, AreaUnit.SQUARE_METER, AreaUnit.SQUARE_FOOT)
    print(f"   {area_sqm} m² = {area_sqft:.2f} ft²")
    
    # Example 3: Pressure conversion (concrete strength)
    print("\n💪 CONCRETE STRENGTH CONVERSION:")
    strength_mpa = 30.0
    strength_psi = UnitConverter.convert_pressure(
        strength_mpa, 
        PressureUnit.MEGAPASCAL, 
        PressureUnit.PSI
    )
    print(f"   {strength_mpa} MPa = {strength_psi:.0f} psi")
    
    # Example 4: Irregular land area
    print("\n🏞️  IRREGULAR LAND AREA CALCULATION:")
    calc = IrregularLandCalculator()
    result = calc.calculate_area_with_diagonal(
        side_a=25.0,
        side_b=30.0,
        side_c=28.0,
        side_d=32.0,
        diagonal_ac=40.0,
        unit=LengthUnit.METER
    )
    print(f"   Area: {result['area_sqm']} m²")
    print(f"   Area: {result['area_sqft']} ft²")
    print(f"   Area: {result['area_hectare']} hectare")
    print(f"   Area: {result['area_acre']} acre")
    
    # Example 5: Batch conversion
    print("\n🔄 BATCH CONVERSION:")
    values = {
        'column_width': 300.0,
        'slab_thickness': 150.0,
        'concrete_strength': 30.0,
    }
    conversions = {
        'column_width': (LengthUnit.MILLIMETER, LengthUnit.INCH),
        'slab_thickness': (LengthUnit.MILLIMETER, LengthUnit.INCH),
        'concrete_strength': (PressureUnit.MEGAPASCAL, PressureUnit.PSI),
    }
    results = UnitConverter.batch_convert(values, conversions)
    print(f"   Column width: {results['column_width']:.2f} in")
    print(f"   Slab thickness: {results['slab_thickness']:.2f} in")
    print(f"   Concrete strength: {results['concrete_strength']:.0f} psi")
    
    print("=" * 80)
