"""
Navisworks API Endpoints
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import traceback
import time
import json

# سيتم استيراد NavisworksService عند التشغيل
# from services.navisworks_service import NavisworksService

navisworks_bp = Blueprint('navisworks', __name__, url_prefix='/api/projects')


# In-memory storage (replace with MongoDB in production)
MODELS_STORE = {}
ELEMENTS_STORE = {}


def generate_id():
    """Generate unique ID"""
    import uuid
    return str(uuid.uuid4())


@navisworks_bp.route('/<project_id>/navisworks/import', methods=['POST'])
def import_model(project_id):
    """
    Import Navisworks model
    POST /api/projects/:projectId/navisworks/import
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        model_data = data.get('modelData') or data
        
        if not model_data.get('fileName'):
            return jsonify({
                'success': False,
                'error': 'fileName is required'
            }), 400
        
        if not model_data.get('elements'):
            return jsonify({
                'success': False,
                'error': 'elements array is required'
            }), 400
        
        # Generate model ID
        model_id = generate_id()
        
        # Calculate statistics
        elements = model_data.get('elements', [])
        elements_with_geometry = sum(1 for el in elements if el.get('geometry'))
        elements_with_properties = sum(1 for el in elements if el.get('properties'))
        
        elements_by_category = {}
        for el in elements:
            cat = el.get('category', 'Unknown')
            elements_by_category[cat] = elements_by_category.get(cat, 0) + 1
        
        # Store model
        model_doc = {
            'modelId': model_id,
            'projectId': project_id,
            'fileName': model_data['fileName'],
            'modelData': model_data,
            'importedAt': datetime.utcnow().isoformat(),
            'viewerUrl': f'/projects/{project_id}/navisworks/{model_id}'
        }
        
        MODELS_STORE[model_id] = model_doc
        
        # Store elements separately
        for el in elements:
            element_key = f"{model_id}_{el['id']}"
            ELEMENTS_STORE[element_key] = {
                'modelId': model_id,
                'projectId': project_id,
                'elementId': el['id'],
                'elementData': el
            }
        
        # Response
        response = {
            'success': True,
            'data': {
                'modelId': model_id,
                'projectId': project_id,
                'fileName': model_data['fileName'],
                'elementsImported': len(elements),
                'importedAt': datetime.utcnow().isoformat(),
                'statistics': {
                    'totalElements': len(elements),
                    'elementsWithGeometry': elements_with_geometry,
                    'elementsWithProperties': elements_with_properties,
                    'elementsByCategory': elements_by_category
                },
                'viewerUrl': f'/projects/{project_id}/navisworks/{model_id}',
                'warnings': []
            }
        }
        
        return jsonify(response), 201
        
    except Exception as e:
        print(f"Error importing model: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@navisworks_bp.route('/<project_id>/navisworks/models', methods=['GET'])
def get_models(project_id):
    """
    Get all models for a project
    GET /api/projects/:projectId/navisworks/models
    """
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 20))
        
        # Filter models by project
        project_models = [
            m for m in MODELS_STORE.values() 
            if m['projectId'] == project_id
        ]
        
        # Sort by importedAt (newest first)
        project_models.sort(key=lambda x: x['importedAt'], reverse=True)
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated = project_models[start:end]
        
        # Simplified response
        models = [{
            'modelId': m['modelId'],
            'projectId': m['projectId'],
            'fileName': m['fileName'],
            'importedAt': m['importedAt'],
            'viewerUrl': m.get('viewerUrl'),
            'elementsCount': len(m['modelData'].get('elements', []))
        } for m in paginated]
        
        return jsonify({
            'success': True,
            'data': {
                'models': models,
                'totalCount': len(project_models),
                'page': page,
                'pageSize': page_size
            }
        })
        
    except Exception as e:
        print(f"Error getting models: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@navisworks_bp.route('/<project_id>/navisworks/models/<model_id>', methods=['GET'])
def get_model(project_id, model_id):
    """
    Get model by ID
    GET /api/projects/:projectId/navisworks/models/:modelId
    """
    try:
        model = MODELS_STORE.get(model_id)
        
        if not model:
            return jsonify({
                'success': False,
                'error': 'Model not found'
            }), 404
        
        if model['projectId'] != project_id:
            return jsonify({
                'success': False,
                'error': 'Model does not belong to this project'
            }), 403
        
        return jsonify({
            'success': True,
            'data': model['modelData']
        })
        
    except Exception as e:
        print(f"Error getting model: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@navisworks_bp.route('/<project_id>/navisworks/models/<model_id>/elements', methods=['GET'])
def get_elements(project_id, model_id):
    """
    Get elements for a model
    GET /api/projects/:projectId/navisworks/models/:modelId/elements
    """
    try:
        # Check if model exists
        model = MODELS_STORE.get(model_id)
        if not model:
            return jsonify({
                'success': False,
                'error': 'Model not found'
            }), 404
        
        # Get filter parameters
        category = request.args.get('category')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 100))
        
        # Get all elements for this model
        elements = [
            e['elementData'] for key, e in ELEMENTS_STORE.items()
            if e['modelId'] == model_id
        ]
        
        # Apply filters
        if category:
            elements = [e for e in elements if e.get('category') == category]
        
        if search:
            search_lower = search.lower()
            elements = [
                e for e in elements
                if search_lower in e.get('name', '').lower() or
                   search_lower in e.get('path', '').lower()
            ]
        
        # Pagination
        total = len(elements)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = elements[start:end]
        
        return jsonify({
            'success': True,
            'data': {
                'elements': paginated,
                'totalCount': total,
                'page': page,
                'pageSize': page_size
            }
        })
        
    except Exception as e:
        print(f"Error getting elements: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@navisworks_bp.route('/<project_id>/navisworks/models/<model_id>/elements/<element_id>', methods=['GET'])
def get_element(project_id, model_id, element_id):
    """
    Get single element
    GET /api/projects/:projectId/navisworks/models/:modelId/elements/:elementId
    """
    try:
        element_key = f"{model_id}_{element_id}"
        element = ELEMENTS_STORE.get(element_key)
        
        if not element:
            return jsonify({
                'success': False,
                'error': 'Element not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': element['elementData']
        })
        
    except Exception as e:
        print(f"Error getting element: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@navisworks_bp.route('/<project_id>/navisworks/models/<model_id>/categories', methods=['GET'])
def get_categories(project_id, model_id):
    """
    Get unique categories
    GET /api/projects/:projectId/navisworks/models/:modelId/categories
    """
    try:
        model = MODELS_STORE.get(model_id)
        if not model:
            return jsonify({
                'success': False,
                'error': 'Model not found'
            }), 404
        
        # Get unique categories
        elements = model['modelData'].get('elements', [])
        categories = sorted(set(el.get('category', 'Unknown') for el in elements))
        
        # Count elements per category
        category_counts = {}
        for el in elements:
            cat = el.get('category', 'Unknown')
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        return jsonify({
            'success': True,
            'data': {
                'categories': categories,
                'counts': category_counts
            }
        })
        
    except Exception as e:
        print(f"Error getting categories: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@navisworks_bp.route('/<project_id>/navisworks/models/<model_id>/statistics', methods=['GET'])
def get_statistics(project_id, model_id):
    """
    Get model statistics
    GET /api/projects/:projectId/navisworks/models/:modelId/statistics
    """
    try:
        model = MODELS_STORE.get(model_id)
        if not model:
            return jsonify({
                'success': False,
                'error': 'Model not found'
            }), 404
        
        stats = model['modelData'].get('statistics', {})
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        print(f"Error getting statistics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@navisworks_bp.route('/<project_id>/navisworks/models/<model_id>', methods=['DELETE'])
def delete_model(project_id, model_id):
    """
    Delete model
    DELETE /api/projects/:projectId/navisworks/models/:modelId
    """
    try:
        model = MODELS_STORE.get(model_id)
        if not model:
            return jsonify({
                'success': False,
                'error': 'Model not found'
            }), 404
        
        if model['projectId'] != project_id:
            return jsonify({
                'success': False,
                'error': 'Unauthorized'
            }), 403
        
        # Delete elements
        keys_to_delete = [k for k in ELEMENTS_STORE.keys() if k.startswith(f"{model_id}_")]
        for key in keys_to_delete:
            del ELEMENTS_STORE[key]
        
        # Delete model
        del MODELS_STORE[model_id]
        
        return jsonify({
            'success': True,
            'message': 'Model deleted successfully'
        })
        
    except Exception as e:
        print(f"Error deleting model: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Health check
@navisworks_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Navisworks API is running',
        'modelsCount': len(MODELS_STORE),
        'elementsCount': len(ELEMENTS_STORE)
    })
