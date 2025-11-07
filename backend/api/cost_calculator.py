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
