"""
Primavera Magic Tools APIs
===========================
RESTful APIs for all 7 Magic Tools
"""

from flask import Blueprint, request, jsonify
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from core.primavera_magic_tools import (
    PrimaveraMagicToolsManager,
    SDKMagicTool,
    XERMagicTool,
    XLSMagicTool,
    SQLMagicTool,
    WBSMagicTool,
    RSCMagicTool,
    BOQMagicTool
)

# Create Blueprint
primavera_magic_api = Blueprint('primavera_magic_api', __name__)

# Database path
DB_PATH = str(Path(__file__).parent / 'database' / 'primavera_magic.db')

# Initialize manager
magic_tools = PrimaveraMagicToolsManager(DB_PATH)


# ============================================
# General Endpoints
# ============================================

@primavera_magic_api.route('/api/primavera-magic/tools', methods=['GET'])
def get_available_tools():
    """Get list of all available Magic Tools"""
    try:
        tools = magic_tools.get_available_tools()
        
        return jsonify({
            'success': True,
            'tools': tools,
            'total_count': len(tools)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# SDK Magic Tool APIs
# ============================================

@primavera_magic_api.route('/api/primavera-magic/sdk/import-activities', methods=['POST'])
def sdk_import_activities():
    """Import activities from Excel to Primavera"""
    try:
        data = request.json
        activities = data.get('activities', [])
        
        if not activities:
            return jsonify({
                'success': False,
                'error': 'No activities provided'
            }), 400
        
        result = magic_tools.sdk_tool.import_activities_from_excel(activities)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/sdk/export-activities', methods=['GET'])
def sdk_export_activities():
    """Export activities from Primavera to Excel"""
    try:
        project_id = request.args.get('project_id')
        
        activities = magic_tools.sdk_tool.export_activities_to_excel(project_id)
        
        return jsonify({
            'success': True,
            'activities': activities,
            'count': len(activities)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/sdk/create-project', methods=['POST'])
def sdk_create_project():
    """Create new Primavera project"""
    try:
        project_data = request.json
        
        result = magic_tools.sdk_tool.create_project(project_data)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# XER Magic Tool APIs
# ============================================

@primavera_magic_api.route('/api/primavera-magic/xer/parse', methods=['POST'])
def xer_parse_file():
    """Parse XER file"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        
        # Save temporarily
        temp_path = f"/tmp/{file.filename}"
        file.save(temp_path)
        
        # Parse XER
        result = magic_tools.xer_tool.parse_xer_file(temp_path)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/xer/extract-activities', methods=['POST'])
def xer_extract_activities():
    """Extract activities from parsed XER data"""
    try:
        xer_data = request.json
        
        activities = magic_tools.xer_tool.extract_activities_from_xer(xer_data)
        
        return jsonify({
            'success': True,
            'activities': activities,
            'count': len(activities)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/xer/extract-wbs', methods=['POST'])
def xer_extract_wbs():
    """Extract WBS from parsed XER data"""
    try:
        xer_data = request.json
        
        wbs_list = magic_tools.xer_tool.extract_wbs_from_xer(xer_data)
        
        return jsonify({
            'success': True,
            'wbs': wbs_list,
            'count': len(wbs_list)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# XLS Magic Tool APIs
# ============================================

@primavera_magic_api.route('/api/primavera-magic/xls/generate-activity-report', methods=['POST'])
def xls_generate_activity_report():
    """Generate Excel activity report"""
    try:
        data = request.json
        activities = data.get('activities', [])
        
        report = magic_tools.xls_tool.generate_activity_report(activities)
        
        return jsonify({
            'success': True,
            'report': report
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/xls/generate-resource-report', methods=['POST'])
def xls_generate_resource_report():
    """Generate Excel resource report"""
    try:
        data = request.json
        resources = data.get('resources', [])
        assignments = data.get('assignments', [])
        
        report = magic_tools.xls_tool.generate_resource_report(resources, assignments)
        
        return jsonify({
            'success': True,
            'report': report
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# SQL Magic Tool APIs
# ============================================

@primavera_magic_api.route('/api/primavera-magic/sql/execute', methods=['POST'])
def sql_execute_query():
    """Execute SQL query"""
    try:
        data = request.json
        query = data.get('query', '')
        params = data.get('params')
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'No query provided'
            }), 400
        
        result = magic_tools.sql_tool.execute_query(query, tuple(params) if params else None)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/sql/project-stats', methods=['GET'])
def sql_get_project_stats():
    """Get project statistics"""
    try:
        project_id = request.args.get('project_id', 'DEFAULT_PROJECT')
        
        stats = magic_tools.sql_tool.get_project_statistics(project_id)
        
        return jsonify({
            'success': True,
            'statistics': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# WBS Magic Tool APIs
# ============================================

@primavera_magic_api.route('/api/primavera-magic/wbs/create-from-excel', methods=['POST'])
def wbs_create_from_excel():
    """Create WBS from Excel data"""
    try:
        data = request.json
        wbs_data = data.get('wbs_data', [])
        project_id = data.get('project_id', 'DEFAULT_PROJECT')
        
        result = magic_tools.wbs_tool.create_wbs_from_excel(wbs_data, project_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/wbs/get-hierarchy', methods=['GET'])
def wbs_get_hierarchy():
    """Get WBS hierarchy"""
    try:
        project_id = request.args.get('project_id', 'DEFAULT_PROJECT')
        
        hierarchy = magic_tools.wbs_tool.get_wbs_hierarchy(project_id)
        
        return jsonify({
            'success': True,
            'wbs_hierarchy': hierarchy,
            'count': len(hierarchy)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/wbs/auto-number', methods=['POST'])
def wbs_auto_number():
    """Auto-number WBS"""
    try:
        data = request.json
        project_id = data.get('project_id', 'DEFAULT_PROJECT')
        
        result = magic_tools.wbs_tool.auto_number_wbs(project_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# RSC Magic Tool APIs
# ============================================

@primavera_magic_api.route('/api/primavera-magic/rsc/get-loading', methods=['GET'])
def rsc_get_loading():
    """Get resource loading"""
    try:
        project_id = request.args.get('project_id', 'DEFAULT_PROJECT')
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        
        result = magic_tools.rsc_tool.get_resource_loading(project_id, start_date, end_date)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/rsc/create-histogram', methods=['GET'])
def rsc_create_histogram():
    """Create resource histogram"""
    try:
        resource_id = request.args.get('resource_id', '')
        
        if not resource_id:
            return jsonify({
                'success': False,
                'error': 'resource_id is required'
            }), 400
        
        result = magic_tools.rsc_tool.create_resource_histogram(resource_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# BOQ Magic Tool APIs
# ============================================

@primavera_magic_api.route('/api/primavera-magic/boq/import-as-resources', methods=['POST'])
def boq_import_as_resources():
    """Import BOQ items as Primavera resources"""
    try:
        data = request.json
        boq_items = data.get('boq_items', [])
        project_id = data.get('project_id', 'DEFAULT_PROJECT')
        
        result = magic_tools.boq_tool.import_boq_as_resources(boq_items, project_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/boq/link-to-activities', methods=['POST'])
def boq_link_to_activities():
    """Link BOQ items to activities"""
    try:
        data = request.json
        boq_links = data.get('boq_links', [])
        
        result = magic_tools.boq_tool.link_boq_to_activities(boq_links)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@primavera_magic_api.route('/api/primavera-magic/boq/cost-report', methods=['GET'])
def boq_generate_cost_report():
    """Generate BOQ cost report"""
    try:
        project_id = request.args.get('project_id', 'DEFAULT_PROJECT')
        
        result = magic_tools.boq_tool.generate_boq_cost_report(project_id)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


print("✅ Primavera Magic Tools APIs Initialized")
