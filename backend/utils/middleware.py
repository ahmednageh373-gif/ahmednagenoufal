"""
Middleware for Flask Application
Security, Rate Limiting, Logging, Error Handling
"""

from functools import wraps
from flask import request, jsonify, g
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
from typing import Callable
import traceback


def setup_rate_limiter(app):
    """Setup rate limiting for the application"""
    
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["100 per hour", "20 per minute"],
        storage_uri=app.config.get('RATE_LIMIT_STORAGE_URL', 'memory://'),
        strategy="fixed-window"
    )
    
    return limiter


def setup_security_headers(app):
    """Add security headers to all responses"""
    
    @app.after_request
    def add_security_headers(response):
        """Add security headers"""
        
        security_headers = app.config.get('SECURITY_HEADERS', {})
        
        for header, value in security_headers.items():
            response.headers[header] = value
        
        return response
    
    return app


def setup_request_logging(app, logger):
    """Setup request/response logging"""
    
    @app.before_request
    def log_request():
        """Log incoming request"""
        g.start_time = time.time()
        
        logger.info(
            f"Request: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'remote_addr': request.remote_addr,
                'user_agent': request.user_agent.string
            }
        )
    
    @app.after_request
    def log_response(response):
        """Log outgoing response"""
        
        if hasattr(g, 'start_time'):
            elapsed = time.time() - g.start_time
            
            logger.info(
                f"Response: {request.method} {request.path} - {response.status_code} ({elapsed:.3f}s)",
                extra={
                    'method': request.method,
                    'path': request.path,
                    'status_code': response.status_code,
                    'elapsed_time': elapsed
                }
            )
        
        return response
    
    return app


def setup_error_handlers(app, logger):
    """Setup centralized error handling"""
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle 400 Bad Request"""
        logger.warning(f"Bad Request: {str(error)}")
        return jsonify({
            'success': False,
            'error': 'Bad Request',
            'message': str(error)
        }), 400
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found"""
        logger.warning(f"Not Found: {request.path}")
        return jsonify({
            'success': False,
            'error': 'Not Found',
            'message': f'The requested URL {request.path} was not found'
        }), 404
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        """Handle 429 Too Many Requests"""
        logger.warning(f"Rate Limit Exceeded: {request.remote_addr}")
        return jsonify({
            'success': False,
            'error': 'Rate Limit Exceeded',
            'message': 'Too many requests. Please slow down.'
        }), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 Internal Server Error"""
        logger.error(
            f"Internal Server Error: {str(error)}\n{traceback.format_exc()}"
        )
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': 'An internal error occurred. Please try again later.'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Handle uncaught exceptions"""
        logger.error(
            f"Unhandled Exception: {str(error)}\n{traceback.format_exc()}"
        )
        
        # Return 500 for unhandled exceptions
        return jsonify({
            'success': False,
            'error': 'Internal Server Error',
            'message': str(error) if app.debug else 'An error occurred'
        }), 500
    
    return app


def require_api_key(f: Callable):
    """
    Decorator to require API key for endpoint
    
    Usage:
        @app.route('/api/protected')
        @require_api_key
        def protected_route():
            return jsonify({'message': 'Protected!'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API Key Required',
                'message': 'X-API-Key header is required'
            }), 401
        
        # TODO: Validate API key against database
        # For now, this is a placeholder
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_json(f: Callable):
    """
    Decorator to validate JSON payload
    
    Usage:
        @app.route('/api/data', methods=['POST'])
        @validate_json
        def process_data():
            data = request.json
            return jsonify({'success': True})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Invalid Content-Type',
                'message': 'Content-Type must be application/json'
            }), 400
        
        try:
            request.json  # Try to parse JSON
        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'Invalid JSON',
                'message': str(e)
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def measure_execution_time(f: Callable):
    """
    Decorator to measure and log execution time
    
    Usage:
        @app.route('/api/slow-operation')
        @measure_execution_time
        def slow_operation():
            # ... slow code
            return jsonify({'success': True})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        elapsed = time.time() - start_time
        
        print(f"⏱️  {f.__name__} executed in {elapsed:.3f}s")
        
        return result
    
    return decorated_function
