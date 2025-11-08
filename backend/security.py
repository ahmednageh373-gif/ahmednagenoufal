"""
NOUFAL ERP - Security Middleware & Utilities
============================================
Comprehensive security features for production deployment
"""

from flask import request, jsonify
from functools import wraps
from datetime import datetime, timedelta
import hashlib
import secrets
import re


class SecurityHeaders:
    """
    Add security headers to all responses
    Protects against XSS, clickjacking, MIME sniffing, etc.
    """
    
    @staticmethod
    def init_app(app):
        @app.after_request
        def add_security_headers(response):
            # Prevent XSS attacks
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            
            # Content Security Policy
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://apis.google.com; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://generativelanguage.googleapis.com; "
                "frame-ancestors 'none';"
            )
            response.headers['Content-Security-Policy'] = csp
            
            # HSTS - Force HTTPS (only in production)
            if app.config.get('ENV') == 'production':
                response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            
            # Referrer Policy
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            
            # Permissions Policy (formerly Feature Policy)
            response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
            
            return response


class RateLimiter:
    """
    Simple rate limiter to prevent abuse
    """
    
    def __init__(self):
        self.requests = {}
        self.cleanup_interval = timedelta(minutes=5)
        self.last_cleanup = datetime.now()
    
    def is_allowed(self, identifier, max_requests=100, window_seconds=60):
        """
        Check if request is allowed based on rate limit
        
        Args:
            identifier: IP address or user ID
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
        
        Returns:
            bool: True if allowed, False if rate limit exceeded
        """
        now = datetime.now()
        
        # Cleanup old entries periodically
        if now - self.last_cleanup > self.cleanup_interval:
            self._cleanup()
        
        # Get or create request history for this identifier
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Remove requests outside the window
        window_start = now - timedelta(seconds=window_seconds)
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if req_time > window_start
        ]
        
        # Check if under limit
        if len(self.requests[identifier]) >= max_requests:
            return False
        
        # Add current request
        self.requests[identifier].append(now)
        return True
    
    def _cleanup(self):
        """Remove old entries to prevent memory bloat"""
        cutoff = datetime.now() - timedelta(minutes=10)
        self.requests = {
            identifier: times
            for identifier, times in self.requests.items()
            if times and times[-1] > cutoff
        }
        self.last_cleanup = datetime.now()


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(max_requests=100, window_seconds=60):
    """
    Decorator to apply rate limiting to endpoints
    
    Usage:
        @app.route('/api/endpoint')
        @rate_limit(max_requests=10, window_seconds=60)
        def endpoint():
            return jsonify({'message': 'success'})
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get identifier (IP address)
            identifier = request.remote_addr
            
            if not rate_limiter.is_allowed(identifier, max_requests, window_seconds):
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Maximum {max_requests} requests per {window_seconds} seconds'
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


class InputValidator:
    """
    Validate and sanitize user inputs
    """
    
    @staticmethod
    def sanitize_string(text, max_length=1000):
        """Remove potentially dangerous characters from string"""
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove SQL injection attempts
        dangerous_patterns = [
            r'DROP\s+TABLE',
            r'DELETE\s+FROM',
            r'INSERT\s+INTO',
            r'UPDATE\s+\w+\s+SET',
            r'UNION\s+SELECT',
            r'--',
            r'/\*.*?\*/',
        ]
        
        for pattern in dangerous_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        # Limit length
        return text[:max_length]
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone):
        """Validate phone number (Saudi format)"""
        # Remove spaces and special characters
        phone = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Saudi phone patterns
        patterns = [
            r'^05\d{8}$',  # Mobile: 05XXXXXXXX
            r'^9665\d{8}$',  # International mobile: 9665XXXXXXXX
            r'^0[1-9]\d{7}$',  # Landline: 0XXXXXXXX
        ]
        
        return any(re.match(pattern, phone) for pattern in patterns)
    
    @staticmethod
    def validate_file_extension(filename, allowed_extensions):
        """Check if file extension is allowed"""
        if '.' not in filename:
            return False
        ext = filename.rsplit('.', 1)[1].lower()
        return ext in allowed_extensions


class PasswordHasher:
    """
    Secure password hashing using SHA-256 with salt
    For production, consider using bcrypt or Argon2
    """
    
    @staticmethod
    def hash_password(password, salt=None):
        """
        Hash password with salt
        
        Args:
            password: Plain text password
            salt: Optional salt (generated if not provided)
        
        Returns:
            tuple: (hashed_password, salt)
        """
        if salt is None:
            salt = secrets.token_hex(32)
        
        # Combine password and salt
        salted_password = (password + salt).encode('utf-8')
        
        # Hash multiple times for added security
        hashed = hashlib.sha256(salted_password).hexdigest()
        for _ in range(10000):  # 10,000 iterations
            hashed = hashlib.sha256(hashed.encode('utf-8')).hexdigest()
        
        return hashed, salt
    
    @staticmethod
    def verify_password(password, hashed_password, salt):
        """Verify password against hash"""
        new_hash, _ = PasswordHasher.hash_password(password, salt)
        return new_hash == hashed_password


class APIKeyManager:
    """
    Manage API keys securely
    """
    
    @staticmethod
    def generate_api_key():
        """Generate a secure API key"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def hash_api_key(api_key):
        """Hash API key for storage"""
        return hashlib.sha256(api_key.encode('utf-8')).hexdigest()
    
    @staticmethod
    def verify_api_key(api_key, hashed_key):
        """Verify API key against hash"""
        return APIKeyManager.hash_api_key(api_key) == hashed_key


def require_api_key(f):
    """
    Decorator to require API key authentication
    
    Usage:
        @app.route('/api/secure-endpoint')
        @require_api_key
        def secure_endpoint():
            return jsonify({'message': 'authenticated'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        # TODO: Verify API key against database
        # For now, check against environment variable
        import os
        valid_key = os.getenv('API_KEY')
        
        if api_key != valid_key:
            return jsonify({'error': 'Invalid API key'}), 403
        
        return f(*args, **kwargs)
    return decorated_function


class AuditLogger:
    """
    Log security-relevant events
    """
    
    @staticmethod
    def log_event(event_type, user_id=None, ip_address=None, details=None):
        """
        Log security event
        
        Args:
            event_type: Type of event (login, logout, failed_auth, etc.)
            user_id: User ID if applicable
            ip_address: IP address of request
            details: Additional details
        """
        from datetime import datetime
        
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': ip_address,
            'details': details
        }
        
        # TODO: Store in database or log file
        # For now, print to console
        print(f"[SECURITY AUDIT] {log_entry}")
        
        return log_entry


def init_security(app):
    """
    Initialize all security features
    
    Usage:
        from security import init_security
        init_security(app)
    """
    # Add security headers
    SecurityHeaders.init_app(app)
    
    # Log all requests in production
    if app.config.get('ENV') == 'production':
        @app.before_request
        def log_request():
            AuditLogger.log_event(
                event_type='request',
                ip_address=request.remote_addr,
                details=f"{request.method} {request.path}"
            )
