"""
Navisworks Validation Middleware
"""

from functools import wraps
from flask import request, jsonify
from typing import Dict, Any, List, Optional


def validate_bounding_box(bbox: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """Validate bounding box data"""
    if not bbox:
        return False, "Bounding box is required"
    
    required_fields = ['minX', 'minY', 'minZ', 'maxX', 'maxY', 'maxZ']
    for field in required_fields:
        if field not in bbox:
            return False, f"Bounding box missing field: {field}"
        
        if not isinstance(bbox[field], (int, float)):
            return False, f"Bounding box {field} must be a number"
    
    # Check dimensions
    if bbox['maxX'] <= bbox['minX']:
        return False, "Invalid bounding box: maxX must be greater than minX"
    if bbox['maxY'] <= bbox['minY']:
        return False, "Invalid bounding box: maxY must be greater than minY"
    if bbox['maxZ'] <= bbox['minZ']:
        return False, "Invalid bounding box: maxZ must be greater than minZ"
    
    return True, None


def validate_geometry(geometry: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """Validate geometry data"""
    if not geometry:
        return True, None  # Geometry is optional
    
    # Check vertices
    if 'vertices' not in geometry:
        return False, "Geometry missing vertices"
    
    vertices = geometry['vertices']
    if not isinstance(vertices, list):
        return False, "Vertices must be an array"
    
    if len(vertices) % 3 != 0:
        return False, "Vertices length must be divisible by 3"
    
    # Check indices
    if 'indices' not in geometry:
        return False, "Geometry missing indices"
    
    indices = geometry['indices']
    if not isinstance(indices, list):
        return False, "Indices must be an array"
    
    if len(indices) % 3 != 0:
        return False, "Indices length must be divisible by 3"
    
    # Check normals (optional but if present must be valid)
    if 'normals' in geometry and geometry['normals']:
        normals = geometry['normals']
        if len(normals) % 3 != 0:
            return False, "Normals length must be divisible by 3"
    
    # Check transform matrix
    if 'transform' in geometry:
        transform = geometry['transform']
        if not isinstance(transform, list) or len(transform) != 16:
            return False, "Transform matrix must be an array of 16 numbers"
    
    return True, None


def validate_element(element: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """Validate single element data"""
    # Required fields
    required_fields = ['id', 'name', 'category', 'path']
    for field in required_fields:
        if field not in element:
            return False, f"Element missing required field: {field}"
    
    # Validate bounding box if present
    if 'boundingBox' in element and element['boundingBox']:
        valid, error = validate_bounding_box(element['boundingBox'])
        if not valid:
            return False, f"Element bounding box invalid: {error}"
    
    # Validate geometry if present
    if 'geometry' in element and element['geometry']:
        valid, error = validate_geometry(element['geometry'])
        if not valid:
            return False, f"Element geometry invalid: {error}"
    
    # Validate properties (must be dict)
    if 'properties' in element:
        if not isinstance(element['properties'], dict):
            return False, "Element properties must be an object"
    
    return True, None


def validate_model_import():
    """
    Decorator to validate model import request
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'success': False,
                    'error': 'Request body is required',
                    'code': 'MISSING_BODY'
                }), 400
            
            # Required fields
            required_fields = ['fileName', 'title', 'units', 'boundingBox', 'elements']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}',
                        'code': 'MISSING_FIELD',
                        'field': field
                    }), 400
            
            # Validate bounding box
            valid, error = validate_bounding_box(data['boundingBox'])
            if not valid:
                return jsonify({
                    'success': False,
                    'error': error,
                    'code': 'INVALID_BBOX'
                }), 400
            
            # Validate elements
            elements = data['elements']
            if not isinstance(elements, list):
                return jsonify({
                    'success': False,
                    'error': 'Elements must be an array',
                    'code': 'INVALID_ELEMENTS'
                }), 400
            
            if len(elements) == 0:
                return jsonify({
                    'success': False,
                    'error': 'Model must contain at least one element',
                    'code': 'EMPTY_ELEMENTS'
                }), 400
            
            # Validate each element (sample validation for first 10)
            for i, element in enumerate(elements[:10]):
                valid, error = validate_element(element)
                if not valid:
                    return jsonify({
                        'success': False,
                        'error': f'Element {i} validation failed: {error}',
                        'code': 'INVALID_ELEMENT',
                        'elementIndex': i
                    }), 400
            
            # Check file size (approximate)
            import json
            data_size = len(json.dumps(data).encode('utf-8'))
            max_size = 100 * 1024 * 1024  # 100 MB
            
            if data_size > max_size:
                return jsonify({
                    'success': False,
                    'error': f'Request too large: {data_size / 1024 / 1024:.2f} MB (max: {max_size / 1024 / 1024} MB)',
                    'code': 'REQUEST_TOO_LARGE'
                }), 413
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def validate_pagination():
    """
    Decorator to validate pagination parameters
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            page = request.args.get('page', '1')
            page_size = request.args.get('pageSize', '20')
            
            # Validate page
            try:
                page = int(page)
                if page < 1:
                    return jsonify({
                        'success': False,
                        'error': 'Page must be >= 1',
                        'code': 'INVALID_PAGE'
                    }), 400
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Page must be a number',
                    'code': 'INVALID_PAGE'
                }), 400
            
            # Validate page size
            try:
                page_size = int(page_size)
                if page_size < 1 or page_size > 1000:
                    return jsonify({
                        'success': False,
                        'error': 'Page size must be between 1 and 1000',
                        'code': 'INVALID_PAGE_SIZE'
                    }), 400
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Page size must be a number',
                    'code': 'INVALID_PAGE_SIZE'
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def validate_model_id():
    """
    Decorator to validate model ID format
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            model_id = kwargs.get('model_id')
            
            if not model_id:
                return jsonify({
                    'success': False,
                    'error': 'Model ID is required',
                    'code': 'MISSING_MODEL_ID'
                }), 400
            
            # Validate ObjectId format (24 hex characters)
            if not isinstance(model_id, str) or len(model_id) != 24:
                return jsonify({
                    'success': False,
                    'error': 'Invalid model ID format',
                    'code': 'INVALID_MODEL_ID'
                }), 400
            
            try:
                int(model_id, 16)  # Check if hex
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid model ID format',
                    'code': 'INVALID_MODEL_ID'
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def validate_project_id():
    """
    Decorator to validate project ID
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            project_id = kwargs.get('project_id')
            
            if not project_id:
                return jsonify({
                    'success': False,
                    'error': 'Project ID is required',
                    'code': 'MISSING_PROJECT_ID'
                }), 400
            
            # Add project existence check here if needed
            # For now, just check it's not empty
            if not isinstance(project_id, str) or len(project_id.strip()) == 0:
                return jsonify({
                    'success': False,
                    'error': 'Invalid project ID',
                    'code': 'INVALID_PROJECT_ID'
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def rate_limit(max_requests: int = 100, window_seconds: int = 60):
    """
    Simple rate limiting decorator
    """
    import time
    from collections import defaultdict
    
    # In-memory rate limit storage (use Redis in production)
    request_counts = defaultdict(list)
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client IP
            client_ip = request.remote_addr
            
            current_time = time.time()
            
            # Clean old requests
            request_counts[client_ip] = [
                req_time for req_time in request_counts[client_ip]
                if current_time - req_time < window_seconds
            ]
            
            # Check limit
            if len(request_counts[client_ip]) >= max_requests:
                return jsonify({
                    'success': False,
                    'error': f'Rate limit exceeded: {max_requests} requests per {window_seconds} seconds',
                    'code': 'RATE_LIMIT_EXCEEDED'
                }), 429
            
            # Add current request
            request_counts[client_ip].append(current_time)
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator
