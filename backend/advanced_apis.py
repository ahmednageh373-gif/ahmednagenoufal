"""
NOUFAL ERP - Advanced APIs
===========================
API endpoints for advanced construction management modules
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
from pathlib import Path

# Add path
sys.path.append(str(Path(__file__).parent))

# Import advanced modules
from dashboards import DashboardManager
from module_integration import IntegrationManager
from advanced_analytics import AnalyticsManager
from interactive_reports import ReportManager, ReportType, ReportFormat
from mobile_field_api import MobileFieldAPI
from rfi_system import RFIManager, RFICategory, RFIPriority
from design_execution import DesignExecutionManager

# Create Blueprint
advanced_api = Blueprint('advanced_api', __name__)

# Initialize managers
dashboard_manager = DashboardManager()
integration_manager = IntegrationManager()
analytics_manager = AnalyticsManager()
report_manager = ReportManager()
mobile_api = MobileFieldAPI()
rfi_manager = RFIManager()
design_manager = DesignExecutionManager()


# ==================== Dashboard APIs ====================

@advanced_api.route('/api/dashboards/<role>', methods=['GET'])
def get_dashboard(role):
    """Get dashboard for specific role"""
    try:
        user_id = request.args.get('user_id', type=int, default=1)
        project_id = request.args.get('project_id', type=int)
        company_id = request.args.get('company_id', type=int)
        
        dashboard = dashboard_manager.get_dashboard_for_role(
            role=role,
            user_id=user_id,
            project_id=project_id,
            company_id=company_id
        )
        
        return jsonify({
            "success": True,
            "dashboard": dashboard
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== Analytics APIs ====================

@advanced_api.route('/api/analytics/evm', methods=['POST', 'GET'])
def calculate_evm():
    """Calculate Earned Value Management metrics"""
    try:
        if request.method == 'GET':
            # Get project_id from query params for demo
            project_id = request.args.get('project_id', type=int, default=1)
        else:
            data = request.json or {}
            project_id = data.get('project_id', 1)
        
        # Generate sample data for demo
        import random
        budget = 10000000  # 10M SAR
        progress = random.uniform(0.6, 0.8)  # 60-80% complete
        
        planned_value = budget * 0.7  # Should be 70% complete by now
        earned_value = budget * progress  # Actually completed
        actual_cost = earned_value * random.uniform(0.95, 1.1)  # Slight variance
        
        evm = analytics_manager.evm_analyzer.calculate_evm(
            project_id=project_id,
            planned_value=planned_value,
            earned_value=earned_value,
            actual_cost=actual_cost,
            budget_at_completion=budget
        )
        
        status = analytics_manager.evm_analyzer.get_performance_status(evm)
        
        return jsonify({
            "success": True,
            "evm": {
                "planned_value": evm.planned_value,
                "earned_value": evm.earned_value,
                "actual_cost": evm.actual_cost,
                "cost_variance": evm.cost_variance,
                "schedule_variance": evm.schedule_variance,
                "cost_performance_index": evm.cost_performance_index,
                "schedule_performance_index": evm.schedule_performance_index,
                "estimate_at_completion": evm.estimate_at_completion,
                "estimate_to_complete": evm.estimate_to_complete,
                "variance_at_completion": evm.variance_at_completion,
                "to_complete_performance_index": evm.to_complete_performance_index
            },
            "status": status
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/analytics/financial', methods=['POST', 'GET'])
def get_financial_analytics():
    """Get financial analytics"""
    try:
        project_id = request.args.get('project_id', type=int, default=1) if request.method == 'GET' else request.json.get('project_id', 1)
        
        # Generate sample financial data
        import random
        analysis = {
            "project_id": project_id,
            "revenue": 12500000,
            "costs": 9800000,
            "profit": 2700000,
            "profit_margin": 21.6,
            "cash_flow": {
                "incoming": 3500000,
                "outgoing": 2900000,
                "net": 600000
            },
            "breakdown": {
                "materials": 3500000,
                "labor": 3800000,
                "equipment": 1200000,
                "subcontractors": 1300000
            }
        }
        
        return jsonify({
            "success": True,
            "financial": analysis
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/analytics/schedule', methods=['POST', 'GET'])
def get_schedule_analytics():
    """Get schedule analytics"""
    try:
        project_id = request.args.get('project_id', type=int, default=1) if request.method == 'GET' else request.json.get('project_id', 1)
        
        # Generate sample schedule data
        analysis = {
            "project_id": project_id,
            "total_activities": 150,
            "completed_activities": 98,
            "in_progress": 25,
            "not_started": 27,
            "critical_path_activities": 45,
            "on_track": 82,
            "at_risk": 15,
            "delayed": 3,
            "schedule_variance_days": -5,
            "completion_percentage": 65.3
        }
        
        return jsonify({
            "success": True,
            "schedule": analysis
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/analytics/kpis', methods=['POST', 'GET'])
def get_kpi_dashboard():
    """Get KPI dashboard"""
    try:
        project_id = request.args.get('project_id', type=int, default=1) if request.method == 'GET' else request.json.get('project_id', 1)
        
        # Generate sample KPI data
        kpis = {
            "project_id": project_id,
            "safety": {
                "incident_rate": 0.5,
                "days_without_incident": 45,
                "safety_score": 92
            },
            "quality": {
                "defects": 12,
                "rework_percentage": 2.3,
                "quality_score": 88
            },
            "productivity": {
                "planned_vs_actual": 105,
                "resource_utilization": 87,
                "productivity_score": 85
            },
            "overall_health": 87
        }
        
        return jsonify({
            "success": True,
            "kpis": kpis
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/analytics/comprehensive', methods=['POST'])
def get_comprehensive_analysis():
    """Get comprehensive project analysis"""
    try:
        data = request.json
        analysis = analytics_manager.get_comprehensive_analysis(
            project_id=data['project_id'],
            project_data=data['project_data']
        )
        
        return jsonify({
            "success": True,
            "analysis": analysis
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== Reports APIs ====================

@advanced_api.route('/api/reports/generate', methods=['POST'])
def generate_report():
    """Generate interactive report"""
    try:
        data = request.json
        report_type = ReportType(data['report_type'])
        
        report = report_manager.generate_report(
            report_type=report_type,
            project_id=data['project_id'],
            **data.get('options', {})
        )
        
        return jsonify({
            "success": True,
            "report": {
                "report_id": report.metadata.report_id,
                "title": report.metadata.title,
                "generated_at": report.metadata.generated_at.isoformat(),
                "sections_count": len(report.sections)
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/reports/list', methods=['GET'])
def list_reports():
    """Get list of generated reports"""
    try:
        project_id = request.args.get('project_id', type=int)
        reports = report_manager.get_report_list(project_id=project_id)
        
        return jsonify({
            "success": True,
            "reports": reports,
            "count": len(reports)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== Mobile API ====================

@advanced_api.route('/api/mobile/login', methods=['POST'])
def mobile_login():
    """Mobile app login"""
    try:
        data = request.json
        result = mobile_api.login(
            username=data['username'],
            password=data['password'],
            device_id=data['device_id']
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/mobile/daily-report', methods=['POST'])
def submit_daily_report():
    """Submit daily field report"""
    try:
        data = request.json
        result = mobile_api.submit_daily_report(
            project_id=data['project_id'],
            engineer_id=data['engineer_id'],
            report_data=data['report_data']
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/mobile/photo', methods=['POST'])
def upload_site_photo():
    """Upload site photo"""
    try:
        data = request.json
        result = mobile_api.upload_photo(
            project_id=data['project_id'],
            user_id=data['user_id'],
            photo_data=data['photo_data']
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/mobile/dashboard', methods=['GET'])
def get_mobile_dashboard():
    """Get mobile dashboard data"""
    try:
        project_id = request.args.get('project_id', type=int)
        user_id = request.args.get('user_id', type=int)
        
        dashboard = mobile_api.get_mobile_dashboard(
            project_id=project_id,
            user_id=user_id
        )
        
        return jsonify(dashboard)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== RFI APIs ====================

@advanced_api.route('/api/rfi/create', methods=['POST'])
def create_rfi():
    """Create new RFI"""
    try:
        data = request.json
        rfi = rfi_manager.create_rfi(
            project_id=data['project_id'],
            submitted_by=data['submitted_by'],
            submitted_by_name=data['submitted_by_name'],
            rfi_data=data['rfi_data']
        )
        
        return jsonify({
            "success": True,
            "rfi": {
                "rfi_id": rfi.rfi_id,
                "rfi_number": rfi.rfi_number,
                "status": rfi.status.value,
                "priority": rfi.priority.value
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/rfi/<int:rfi_id>/submit', methods=['POST'])
def submit_rfi(rfi_id):
    """Submit RFI for review"""
    try:
        result = rfi_manager.submit_rfi(rfi_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/rfi/<int:rfi_id>/respond', methods=['POST'])
def respond_to_rfi(rfi_id):
    """Respond to RFI"""
    try:
        data = request.json
        result = rfi_manager.respond_to_rfi(
            rfi_id=rfi_id,
            response_by=data['response_by'],
            response_by_name=data['response_by_name'],
            response_data=data['response_data']
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/rfi/list', methods=['GET'])
def list_rfis():
    """Get list of RFIs"""
    try:
        project_id = request.args.get('project_id', type=int)
        rfis = rfi_manager.get_rfi_list(project_id=project_id)
        
        return jsonify({
            "success": True,
            "rfis": rfis,
            "count": len(rfis)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/rfi/<int:rfi_id>', methods=['GET'])
def get_rfi_details(rfi_id):
    """Get RFI details"""
    try:
        rfi = rfi_manager.get_rfi(rfi_id)
        if not rfi:
            return jsonify({"success": False, "error": "RFI not found"}), 404
        
        return jsonify({
            "success": True,
            "rfi": rfi
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/rfi/analytics/<int:project_id>', methods=['GET'])
def get_rfi_analytics(project_id):
    """Get RFI analytics"""
    try:
        analytics = rfi_manager.get_rfi_analytics(project_id)
        return jsonify({
            "success": True,
            "analytics": analytics
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== Design & Execution APIs ====================

@advanced_api.route('/api/design/package/create', methods=['POST'])
def create_design_package():
    """Create design package"""
    try:
        data = request.json
        package = design_manager.create_design_package(
            project_id=data['project_id'],
            package_data=data['package_data']
        )
        
        return jsonify({
            "success": True,
            "package": {
                "package_id": package.package_id,
                "package_number": package.package_number,
                "status": package.status.value
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/design/modification/create', methods=['POST'])
def create_design_modification():
    """Create design modification"""
    try:
        data = request.json
        modification = design_manager.initiate_design_modification(
            project_id=data['project_id'],
            modification_data=data['modification_data']
        )
        
        return jsonify({
            "success": True,
            "modification": {
                "modification_id": modification.modification_id,
                "modification_number": modification.modification_number,
                "status": modification.status
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/design/compliance/check', methods=['POST'])
def perform_compliance_check():
    """Perform design vs execution compliance check"""
    try:
        data = request.json
        check = design_manager.perform_compliance_check(
            project_id=data['project_id'],
            check_data=data['check_data']
        )
        
        return jsonify({
            "success": True,
            "check": {
                "check_id": check.check_id,
                "compliance_level": check.compliance_level.value,
                "deviations_count": len(check.deviations)
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@advanced_api.route('/api/design/dashboard/<int:project_id>', methods=['GET'])
def get_design_dashboard(project_id):
    """Get design dashboard"""
    try:
        dashboard = design_manager.get_design_dashboard(project_id)
        return jsonify({
            "success": True,
            "dashboard": dashboard
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== Integration APIs ====================

@advanced_api.route('/api/integration/status/<int:project_id>', methods=['GET'])
def get_integration_status(project_id):
    """Get module integration status"""
    try:
        status = integration_manager.get_integration_status(project_id)
        return jsonify({
            "success": True,
            "status": status
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== Health Check ====================

@advanced_api.route('/api/advanced/health', methods=['GET'])
def advanced_health():
    """Health check for advanced modules"""
    return jsonify({
        "success": True,
        "message": "Advanced modules are running",
        "modules": {
            "dashboards": True,
            "analytics": True,
            "reports": True,
            "mobile_api": True,
            "rfi_system": True,
            "design_execution": True,
            "integration": True
        }
    })
