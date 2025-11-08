"""
Construction Cost Calculator API
=================================
API endpoints for calculating construction costs based on activities.

Integrates with the cost analysis table shared by the user:
- نقل & ضخ (Transport & Pump)
- هز & طرطشة (Vibration)
- حديد (Steel)
- قوالب (Formwork)
- معالجة (Curing)

Author: Noufal Engineering System
Version: 1.0.0
"""

from flask import Blueprint, request, jsonify
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
cost_calculator_bp = Blueprint('cost_calculator', __name__, url_prefix='/api/v1/cost')


# ==============================================================================
# DATA MODELS
# ==============================================================================

@dataclass
class CostItem:
    """Construction activity cost breakdown"""
    activity_name: str
    unit: str
    material_cost: float  # ريال per unit
    labor_cost: float     # ريال per unit
    equipment_cost: float # ريال per unit
    man_hours_per_unit: float
    
    @property
    def total_cost_per_unit(self) -> float:
        """Calculate total cost per unit"""
        return self.material_cost + self.labor_cost + self.equipment_cost


@dataclass
class CostCalculation:
    """Result of cost calculation for specific quantity"""
    activity_name: str
    quantity: float
    unit: str
    material_cost: float
    labor_cost: float
    equipment_cost: float
    total_cost: float
    man_hours: float
    cost_per_unit: float


@dataclass
class BOQCostAnalysis:
    """Complete BOQ cost analysis"""
    total_material_cost: float
    total_labor_cost: float
    total_equipment_cost: float
    total_cost: float
    total_man_hours: float
    estimated_duration_days: float
    items: List[CostCalculation]
    breakdown_by_activity: Dict[str, float]


# ==============================================================================
# COST DATABASE (from user's table)
# ==============================================================================

CONSTRUCTION_COSTS: Dict[str, CostItem] = {
    'نقل & ضخ': CostItem(
        activity_name='نقل & ضخ',
        unit='م³',
        material_cost=18.90,
        labor_cost=93.30,
        equipment_cost=22.20,
        man_hours_per_unit=1.8
    ),
    'هز & طرطشة': CostItem(
        activity_name='هز & طرطشة',
        unit='م³',
        material_cost=0.0,
        labor_cost=35.40,
        equipment_cost=0.0,
        man_hours_per_unit=0.68
    ),
    'حديد': CostItem(
        activity_name='حديد',
        unit='طن',
        material_cost=4400.0,
        labor_cost=440.0,
        equipment_cost=0.0,
        man_hours_per_unit=85.0
    ),
    'قوالب': CostItem(
        activity_name='قوالب',
        unit='م²',
        material_cost=16.0,
        labor_cost=19.0,
        equipment_cost=0.0,
        man_hours_per_unit=0.37
    ),
    'معالجة': CostItem(
        activity_name='معالجة',
        unit='م²',
        material_cost=0.60,
        labor_cost=3.30,
        equipment_cost=0.0,
        man_hours_per_unit=0.063
    ),
    # New activities from user's comprehensive table
    'خرسانة جاهزة': CostItem(
        activity_name='خرسانة جاهزة',
        unit='م³',
        material_cost=230.0,
        labor_cost=70.0,
        equipment_cost=30.0,
        man_hours_per_unit=0.2  # 30-40 m³/day → ~0.2 hrs/m³
    ),
    'حديد تسليح': CostItem(
        activity_name='حديد تسليح',
        unit='طن',
        material_cost=2850.0,
        labor_cost=220.0,
        equipment_cost=50.0,
        man_hours_per_unit=7.27  # 1.1 ton/day → ~7.27 hrs/ton
    ),
    'قوالب بروبلكوب': CostItem(
        activity_name='قوالب بروبلكوب',
        unit='م²',
        material_cost=6.5,
        labor_cost=10.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.89  # 8-10 m²/day → ~0.89 hrs/m²
    ),
    'طوب 20×20×40': CostItem(
        activity_name='طوب 20×20×40',
        unit='م²',
        material_cost=18.0,
        labor_cost=15.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.67  # 1.5 m²/hr → 0.67 hrs/m²
    ),
    'طوب 15×20×40': CostItem(
        activity_name='طوب 15×20×40',
        unit='م²',
        material_cost=16.0,
        labor_cost=13.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.56  # 1.8 m²/hr → 0.56 hrs/m²
    ),
    'المونة الأسمنتية': CostItem(
        activity_name='المونة الأسمنتية',
        unit='م²',
        material_cost=2.0,   # 0.02 m³/m² × 100 ريال/م³
        labor_cost=1.0,     # 0.02 m³/m² × 50 ريال/م³
        equipment_cost=0.2,  # 0.02 m³/m² × 10 ريال/م³
        man_hours_per_unit=0.05  # Estimated
    ),
    # Tiles and Flooring (البلاط والأرضيات)
    'بلاط بورسلين 60×60': CostItem(
        activity_name='بلاط بورسلين 60×60',
        unit='م²',
        material_cost=120.0,
        labor_cost=25.0,
        equipment_cost=3.0,
        man_hours_per_unit=0.29  # 25-30 m²/day → ~0.29 hrs/m²
    ),
    'بلاط سيراميك 30×30': CostItem(
        activity_name='بلاط سيراميك 30×30',
        unit='م²',
        material_cost=80.0,
        labor_cost=20.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.21  # 35-40 m²/day → ~0.21 hrs/m²
    ),
    'بلاط مطاطي': CostItem(
        activity_name='بلاط مطاطي',
        unit='م²',
        material_cost=150.0,
        labor_cost=30.0,
        equipment_cost=5.0,
        man_hours_per_unit=0.36  # 20-25 m²/day → ~0.36 hrs/m²
    ),
    # Steel Structure (الهياكل المعدنية)
    'شبك 2.5 مم مجلفن': CostItem(
        activity_name='شبك 2.5 مم مجلفن',
        unit='م',
        material_cost=28.0,
        labor_cost=12.0,
        equipment_cost=3.0,
        man_hours_per_unit=0.09  # 80-100 m/day → ~0.09 hrs/m
    ),
    'عمود H-Beam 60×60': CostItem(
        activity_name='عمود H-Beam 60×60',
        unit='عمود',
        material_cost=120.0,
        labor_cost=60.0,
        equipment_cost=20.0,
        man_hours_per_unit=0.36  # 20-25 columns/day → ~0.36 hrs/column
    ),
    'كمرة علوية 48×3': CostItem(
        activity_name='كمرة علوية 48×3',
        unit='م',
        material_cost=25.0,
        labor_cost=10.0,
        equipment_cost=3.0,
        man_hours_per_unit=0.08  # 100 m/day → 0.08 hrs/m
    ),
    # Plumbing & Drainage (السباكة والصرف)
    'UPVC 110 مم': CostItem(
        activity_name='UPVC 110 مم',
        unit='م',
        material_cost=45.0,
        labor_cost=15.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.11  # 60-80 m/day → ~0.11 hrs/m
    ),
    'HDPE 160 مم': CostItem(
        activity_name='HDPE 160 مم',
        unit='م',
        material_cost=78.0,
        labor_cost=20.0,
        equipment_cost=3.0,
        man_hours_per_unit=0.16  # 40-60 m/day → ~0.16 hrs/m
    ),
    'manhole 1.2 م': CostItem(
        activity_name='manhole 1.2 م',
        unit='وحدة',
        material_cost=2500.0,
        labor_cost=800.0,
        equipment_cost=200.0,
        man_hours_per_unit=3.2  # 2-3 units/day → ~3.2 hrs/unit
    ),
    # Electrical & Lighting (الكهرباء والإضاءة)
    'قابس 16 أمبير': CostItem(
        activity_name='قابس 16 أمبير',
        unit='نقطة',
        material_cost=140.0,
        labor_cost=70.0,
        equipment_cost=10.0,
        man_hours_per_unit=0.46  # 15-20 points/day → ~0.46 hrs/point
    ),
    'سبوت لايت LED': CostItem(
        activity_name='سبوت لايت LED',
        unit='نقطة',
        material_cost=70.0,
        labor_cost=35.0,
        equipment_cost=5.0,
        man_hours_per_unit=0.36  # 20-25 points/day → ~0.36 hrs/point
    ),
    'لوحة توزيع رئيسية': CostItem(
        activity_name='لوحة توزيع رئيسية',
        unit='لوحة',
        material_cost=35000.0,
        labor_cost=5000.0,
        equipment_cost=1000.0,
        man_hours_per_unit=5.33  # 1-2 panels/day → ~5.33 hrs/panel
    ),
    # English aliases for API flexibility
    'transport': CostItem(
        activity_name='نقل & ضخ',
        unit='m³',
        material_cost=18.90,
        labor_cost=93.30,
        equipment_cost=22.20,
        man_hours_per_unit=1.8
    ),
    'vibration': CostItem(
        activity_name='هز & طرطشة',
        unit='m³',
        material_cost=0.0,
        labor_cost=35.40,
        equipment_cost=0.0,
        man_hours_per_unit=0.68
    ),
    'steel': CostItem(
        activity_name='حديد',
        unit='ton',
        material_cost=4400.0,
        labor_cost=440.0,
        equipment_cost=0.0,
        man_hours_per_unit=85.0
    ),
    'formwork': CostItem(
        activity_name='قوالب',
        unit='m²',
        material_cost=16.0,
        labor_cost=19.0,
        equipment_cost=0.0,
        man_hours_per_unit=0.37
    ),
    'curing': CostItem(
        activity_name='معالجة',
        unit='m²',
        material_cost=0.60,
        labor_cost=3.30,
        equipment_cost=0.0,
        man_hours_per_unit=0.063
    ),
    # Additional English aliases
    'ready_mix_concrete': CostItem(
        activity_name='خرسانة جاهزة',
        unit='m³',
        material_cost=230.0,
        labor_cost=70.0,
        equipment_cost=30.0,
        man_hours_per_unit=0.2
    ),
    'rebar': CostItem(
        activity_name='حديد تسليح',
        unit='ton',
        material_cost=2850.0,
        labor_cost=220.0,
        equipment_cost=50.0,
        man_hours_per_unit=7.27
    ),
    'proplex_formwork': CostItem(
        activity_name='قوالب بروبلكوب',
        unit='m²',
        material_cost=6.5,
        labor_cost=10.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.89
    ),
    'porcelain_tile_60x60': CostItem(
        activity_name='بلاط بورسلين 60×60',
        unit='m²',
        material_cost=120.0,
        labor_cost=25.0,
        equipment_cost=3.0,
        man_hours_per_unit=0.29
    ),
    'ceramic_tile_30x30': CostItem(
        activity_name='بلاط سيراميك 30×30',
        unit='m²',
        material_cost=80.0,
        labor_cost=20.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.21
    ),
    'upvc_pipe_110mm': CostItem(
        activity_name='UPVC 110 مم',
        unit='m',
        material_cost=45.0,
        labor_cost=15.0,
        equipment_cost=2.0,
        man_hours_per_unit=0.11
    ),
    'hdpe_pipe_160mm': CostItem(
        activity_name='HDPE 160 مم',
        unit='m',
        material_cost=78.0,
        labor_cost=20.0,
        equipment_cost=3.0,
        man_hours_per_unit=0.16
    ),
    'power_outlet_16a': CostItem(
        activity_name='قابس 16 أمبير',
        unit='point',
        material_cost=140.0,
        labor_cost=70.0,
        equipment_cost=10.0,
        man_hours_per_unit=0.46
    ),
    'led_spot_light': CostItem(
        activity_name='سبوت لايت LED',
        unit='point',
        material_cost=70.0,
        labor_cost=35.0,
        equipment_cost=5.0,
        man_hours_per_unit=0.36
    ),
    'main_distribution_board': CostItem(
        activity_name='لوحة توزيع رئيسية',
        unit='panel',
        material_cost=35000.0,
        labor_cost=5000.0,
        equipment_cost=1000.0,
        man_hours_per_unit=5.33
    ),
    # Real Project Data - High Volume Activities
    'C35 raft + blinding': CostItem(
        activity_name='C35 raft + blinding',
        unit='m³',
        material_cost=340.0,
        labor_cost=85.0,
        equipment_cost=35.0,
        man_hours_per_unit=0.029  # 280 m³/day with 2 pumps → ~0.029 hrs/m³
    ),
    'HDPE 200 mm storm': CostItem(
        activity_name='HDPE 200 mm storm',
        unit='m',
        material_cost=71.4,   # 70% materials (102 × 0.7)
        labor_cost=25.5,      # 25% labour (102 × 0.25)
        equipment_cost=5.1,   # 5% plant (102 × 0.05)
        man_hours_per_unit=0.05  # 160 m/day → 0.05 hrs/m
    ),
    'Reinforcement B500C': CostItem(
        activity_name='Reinforcement B500C',
        unit='t',
        material_cost=2655.0,  # 90% materials (2950 × 0.9)
        labor_cost=265.5,      # 9% labour (2950 × 0.09)
        equipment_cost=29.5,   # 1% plant (2950 × 0.01)
        man_hours_per_unit=0.123  # 65 t/day → 0.123 hrs/t
    ),
    '60×60 cm porcelain': CostItem(
        activity_name='60×60 cm porcelain',
        unit='m²',
        material_cost=124.0,   # 80% materials (155 × 0.8)
        labor_cost=27.9,       # 18% labour (155 × 0.18)
        equipment_cost=3.1,    # 2% plant (155 × 0.02)
        man_hours_per_unit=0.023  # 350 m²/day → 0.023 hrs/m²
    ),
    # Bid Data - Deep Foundation & Infrastructure
    'C50 diaphragm wall': CostItem(
        activity_name='C50 diaphragm wall',
        unit='m³',
        material_cost=1274.0,  # 70% materials (1820 × 0.7)
        labor_cost=364.0,      # 20% labour (1820 × 0.2)
        equipment_cost=182.0,  # 10% plant (1820 × 0.1)
        man_hours_per_unit=2.5  # Estimated for deep foundation work
    ),
    'Secant piles Ø900': CostItem(
        activity_name='Secant piles Ø900',
        unit='m',
        material_cost=422.5,   # 65% materials (650 × 0.65)
        labor_cost=130.0,      # 20% labour (650 × 0.2)
        equipment_cost=97.5,   # 15% plant (650 × 0.15)
        man_hours_per_unit=1.2  # Estimated for pile installation
    ),
    '500 kV cable ducts (GRP)': CostItem(
        activity_name='500 kV cable ducts (GRP)',
        unit='m',
        material_cost=252.0,   # 80% materials (315 × 0.8)
        labor_cost=50.4,       # 16% labour (315 × 0.16)
        equipment_cost=12.6,   # 4% plant (315 × 0.04)
        man_hours_per_unit=0.15  # Estimated
    ),
    'Stainless steel benches': CostItem(
        activity_name='Stainless steel benches',
        unit='No',
        material_cost=1655.9,  # 80% materials (2070 × 0.8)
        labor_cost=372.6,      # 18% labour (2070 × 0.18)
        equipment_cost=41.4,   # 2% plant (2070 × 0.02)
        man_hours_per_unit=3.0  # Estimated for custom fabrication
    ),
    # Structural Concrete & Finishes
    'C30 columns & beams': CostItem(
        activity_name='C30 columns & beams',
        unit='m³',
        material_cost=339.5,   # 70% materials (485 × 0.7)
        labor_cost=121.25,     # 25% labour (485 × 0.25)
        equipment_cost=24.25,  # 5% plant (485 × 0.05)
        man_hours_per_unit=0.229  # 35 m³/day with gang of 8 → 0.229 hrs/m³
    ),
    '200 mm blockwork': CostItem(
        activity_name='200 mm blockwork',
        unit='m²',
        material_cost=36.4,    # 70% materials (52 × 0.7)
        labor_cost=14.04,      # 27% labour (52 × 0.27)
        equipment_cost=1.56,   # 3% plant (52 × 0.03)
        man_hours_per_unit=0.364  # 22 m²/day → 0.364 hrs/m²
    ),
    'Gypsum board ceiling': CostItem(
        activity_name='Gypsum board ceiling',
        unit='m²',
        material_cost=26.6,    # 70% materials (38 × 0.7)
        labor_cost=10.26,      # 27% labour (38 × 0.27)
        equipment_cost=1.14,   # 3% plant (38 × 0.03)
        man_hours_per_unit=0.145  # 55 m²/day → 0.145 hrs/m²
    ),
    'Marble cladding 20 mm': CostItem(
        activity_name='Marble cladding 20 mm',
        unit='m²',
        material_cost=203.0,   # 70% materials (290 × 0.7)
        labor_cost=78.3,       # 27% labour (290 × 0.27)
        equipment_cost=8.7,    # 3% plant (290 × 0.03)
        man_hours_per_unit=0.571  # 14 m²/day → 0.571 hrs/m²
    ),
}


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def find_cost_item(activity: str) -> Optional[CostItem]:
    """
    Find cost item by activity name (case-insensitive).
    
    Args:
        activity: Activity name (Arabic or English)
        
    Returns:
        CostItem or None if not found
    """
    activity_lower = activity.lower().strip()
    
    # Direct lookup
    if activity in CONSTRUCTION_COSTS:
        return CONSTRUCTION_COSTS[activity]
    
    # Case-insensitive search
    for key, item in CONSTRUCTION_COSTS.items():
        if key.lower() == activity_lower:
            return item
    
    return None


def calculate_cost(activity: str, quantity: float) -> Optional[CostCalculation]:
    """
    Calculate costs for specific activity and quantity.
    
    Args:
        activity: Activity name
        quantity: Quantity to calculate
        
    Returns:
        CostCalculation or None if activity not found
    """
    cost_item = find_cost_item(activity)
    if not cost_item:
        return None
    
    return CostCalculation(
        activity_name=cost_item.activity_name,
        quantity=quantity,
        unit=cost_item.unit,
        material_cost=cost_item.material_cost * quantity,
        labor_cost=cost_item.labor_cost * quantity,
        equipment_cost=cost_item.equipment_cost * quantity,
        total_cost=cost_item.total_cost_per_unit * quantity,
        man_hours=cost_item.man_hours_per_unit * quantity,
        cost_per_unit=cost_item.total_cost_per_unit
    )


# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@cost_calculator_bp.route('/activities', methods=['GET'])
def list_activities():
    """
    List all available construction activities with their cost data.
    
    Returns:
        JSON with list of activities and their unit costs
        
    Example:
        GET /api/v1/cost/activities
        
        Response:
        {
            "success": true,
            "activities": [
                {
                    "activity_name": "نقل & ضخ",
                    "unit": "م³",
                    "material_cost": 18.90,
                    "labor_cost": 93.30,
                    "equipment_cost": 22.20,
                    "total_cost_per_unit": 134.40,
                    "man_hours_per_unit": 1.8
                },
                ...
            ]
        }
    """
    try:
        # Get unique activities (remove English aliases)
        unique_activities = {}
        for key, item in CONSTRUCTION_COSTS.items():
            if item.activity_name not in [v.activity_name for v in unique_activities.values()]:
                unique_activities[key] = item
        
        activities = [
            {
                **asdict(item),
                'total_cost_per_unit': item.total_cost_per_unit
            }
            for item in unique_activities.values()
        ]
        
        return jsonify({
            'success': True,
            'count': len(activities),
            'activities': activities
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing activities: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to list activities'
        }), 500


@cost_calculator_bp.route('/calculate', methods=['POST'])
def calculate():
    """
    Calculate costs for a single construction activity.
    
    Request Body:
        {
            "activity": "نقل & ضخ",  // Activity name (Arabic or English)
            "quantity": 100.0,       // Quantity to calculate
            "unit": "م³"             // Optional: unit verification
        }
        
    Returns:
        Cost breakdown for the specified quantity
        
    Example:
        POST /api/v1/cost/calculate
        {
            "activity": "نقل & ضخ",
            "quantity": 100
        }
        
        Response:
        {
            "success": true,
            "calculation": {
                "activity_name": "نقل & ضخ",
                "quantity": 100,
                "unit": "م³",
                "material_cost": 1890.0,
                "labor_cost": 9330.0,
                "equipment_cost": 2220.0,
                "total_cost": 13440.0,
                "man_hours": 180.0,
                "cost_per_unit": 134.40
            }
        }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        activity = data.get('activity')
        quantity = data.get('quantity')
        
        if not activity:
            return jsonify({
                'success': False,
                'error': 'activity field is required'
            }), 400
        
        if not quantity or quantity <= 0:
            return jsonify({
                'success': False,
                'error': 'quantity must be a positive number'
            }), 400
        
        # Calculate costs
        calculation = calculate_cost(activity, float(quantity))
        
        if not calculation:
            return jsonify({
                'success': False,
                'error': f'Activity not found: {activity}',
                'available_activities': list(CONSTRUCTION_COSTS.keys())
            }), 404
        
        return jsonify({
            'success': True,
            'calculation': asdict(calculation)
        }), 200
        
    except Exception as e:
        logger.error(f"Error calculating costs: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate costs'
        }), 500


@cost_calculator_bp.route('/boq/analyze', methods=['POST'])
def analyze_boq():
    """
    Analyze complete BOQ (Bill of Quantities) with cost breakdown.
    
    Request Body:
        {
            "project_name": "Project ABC",  // Optional
            "items": [
                {
                    "activity": "نقل & ضخ",
                    "quantity": 100
                },
                {
                    "activity": "حديد",
                    "quantity": 5
                },
                ...
            ],
            "labor_config": {               // Optional
                "workers_count": 10,
                "hours_per_day": 8,
                "days_per_week": 6
            }
        }
        
    Returns:
        Complete cost analysis with breakdown
        
    Example Response:
        {
            "success": true,
            "analysis": {
                "total_material_cost": 23890.0,
                "total_labor_cost": 11530.0,
                "total_equipment_cost": 2220.0,
                "total_cost": 37640.0,
                "total_man_hours": 605.0,
                "estimated_duration_days": 7.56,
                "breakdown_by_activity": {
                    "نقل & ضخ": 13440.0,
                    "حديد": 24200.0
                },
                "items": [...]
            }
        }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'items' not in data:
            return jsonify({
                'success': False,
                'error': 'items array is required'
            }), 400
        
        items = data.get('items', [])
        if not items:
            return jsonify({
                'success': False,
                'error': 'items array cannot be empty'
            }), 400
        
        # Labor configuration
        labor_config = data.get('labor_config', {})
        workers_count = labor_config.get('workers_count', 10)
        hours_per_day = labor_config.get('hours_per_day', 8)
        days_per_week = labor_config.get('days_per_week', 6)
        
        # Calculate costs for each item
        calculations = []
        total_material = 0
        total_labor = 0
        total_equipment = 0
        total_man_hours = 0
        breakdown_by_activity = {}
        
        for item in items:
            activity = item.get('activity')
            quantity = item.get('quantity')
            
            if not activity or not quantity:
                continue
            
            calc = calculate_cost(activity, float(quantity))
            if calc:
                calculations.append(calc)
                total_material += calc.material_cost
                total_labor += calc.labor_cost
                total_equipment += calc.equipment_cost
                total_man_hours += calc.man_hours
                
                # Breakdown by activity
                if calc.activity_name not in breakdown_by_activity:
                    breakdown_by_activity[calc.activity_name] = 0
                breakdown_by_activity[calc.activity_name] += calc.total_cost
        
        total_cost = total_material + total_labor + total_equipment
        
        # Calculate duration
        hours_per_week = workers_count * hours_per_day * days_per_week
        estimated_weeks = total_man_hours / hours_per_week if hours_per_week > 0 else 0
        estimated_days = estimated_weeks * 7
        
        # Build analysis result
        analysis = BOQCostAnalysis(
            total_material_cost=total_material,
            total_labor_cost=total_labor,
            total_equipment_cost=total_equipment,
            total_cost=total_cost,
            total_man_hours=total_man_hours,
            estimated_duration_days=estimated_days,
            items=calculations,
            breakdown_by_activity=breakdown_by_activity
        )
        
        return jsonify({
            'success': True,
            'project_name': data.get('project_name', 'Unnamed Project'),
            'analysis': {
                **asdict(analysis),
                'items': [asdict(item) for item in analysis.items]
            },
            'labor_config': {
                'workers_count': workers_count,
                'hours_per_day': hours_per_day,
                'days_per_week': days_per_week
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing BOQ: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to analyze BOQ'
        }), 500


@cost_calculator_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for cost calculator service."""
    return jsonify({
        'success': True,
        'service': 'cost_calculator',
        'status': 'healthy',
        'available_activities': len(CONSTRUCTION_COSTS),
        'timestamp': datetime.now().isoformat()
    }), 200


# ==============================================================================
# ERROR HANDLERS
# ==============================================================================

@cost_calculator_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@cost_calculator_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500
