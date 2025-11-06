"""
NOUFAL ERP - Advanced Logging Configuration
نظام تسجيل الأخطاء والأحداث المتقدم

Features:
- Structured logging to multiple files
- Automatic log rotation
- Different log levels for different modules
- JSON formatted logs for easy parsing
- Error tracking and alerting
- Request/Response logging
- Audit trail logging
"""

import logging
import logging.handlers
import os
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Optional
import traceback


class JSONFormatter(logging.Formatter):
    """
    JSON formatter for structured logging
    منسق JSON للسجلات المنظمة
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Add extra fields
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'ip_address'):
            log_data['ip_address'] = record.ip_address
        
        return json.dumps(log_data, ensure_ascii=False)


class ColoredFormatter(logging.Formatter):
    """
    Colored formatter for console output
    منسق ملون لعرض وحدة التحكم
    """
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors"""
        # Add color to level name
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{self.COLORS['RESET']}"
        
        # Format the message
        formatted = super().format(record)
        
        # Reset level name
        record.levelname = levelname
        
        return formatted


class RequestFormatter(logging.Formatter):
    """
    Special formatter for HTTP request/response logging
    منسق خاص لتسجيل طلبات/استجابات HTTP
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """Format HTTP request/response log"""
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'method': getattr(record, 'method', 'UNKNOWN'),
            'path': getattr(record, 'path', 'UNKNOWN'),
            'status_code': getattr(record, 'status_code', 0),
            'response_time_ms': getattr(record, 'response_time_ms', 0),
            'user_id': getattr(record, 'user_id', None),
            'ip_address': getattr(record, 'ip_address', 'UNKNOWN'),
            'user_agent': getattr(record, 'user_agent', 'UNKNOWN'),
        }
        
        return json.dumps(log_data, ensure_ascii=False)


def setup_logging(
    app_name: str = "noufal_erp",
    log_dir: str = "logs",
    log_level: str = "INFO",
    enable_console: bool = True,
    enable_file: bool = True,
    enable_json: bool = True,
    max_bytes: int = 10 * 1024 * 1024,  # 10 MB
    backup_count: int = 10
) -> logging.Logger:
    """
    Setup comprehensive logging configuration
    إعداد تكوين تسجيل شامل
    
    Args:
        app_name: Application name for log files
        log_dir: Directory for log files
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        enable_console: Enable console logging
        enable_file: Enable file logging
        enable_json: Use JSON format for file logs
        max_bytes: Maximum size per log file before rotation
        backup_count: Number of backup files to keep
    
    Returns:
        Configured root logger
    """
    # Create log directory
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True, parents=True)
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Console Handler
    if enable_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        console_formatter = ColoredFormatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)
    
    # File Handler - General Application Logs
    if enable_file:
        general_log_file = log_path / f"{app_name}.log"
        general_handler = logging.handlers.RotatingFileHandler(
            general_log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        general_handler.setLevel(logging.INFO)
        
        if enable_json:
            general_formatter = JSONFormatter()
        else:
            general_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
        
        general_handler.setFormatter(general_formatter)
        root_logger.addHandler(general_handler)
    
    # File Handler - Error Logs Only
    if enable_file:
        error_log_file = log_path / f"{app_name}_errors.log"
        error_handler = logging.handlers.RotatingFileHandler(
            error_log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        
        if enable_json:
            error_formatter = JSONFormatter()
        else:
            error_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s\n'
                'Exception: %(exc_info)s\n',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
        
        error_handler.setFormatter(error_formatter)
        root_logger.addHandler(error_handler)
    
    # File Handler - Debug Logs
    if enable_file and log_level.upper() == 'DEBUG':
        debug_log_file = log_path / f"{app_name}_debug.log"
        debug_handler = logging.handlers.RotatingFileHandler(
            debug_log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        debug_handler.setLevel(logging.DEBUG)
        
        if enable_json:
            debug_formatter = JSONFormatter()
        else:
            debug_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
        
        debug_handler.setFormatter(debug_formatter)
        root_logger.addHandler(debug_handler)
    
    # File Handler - HTTP Request/Response Logs
    if enable_file:
        request_log_file = log_path / f"{app_name}_requests.log"
        request_handler = logging.handlers.RotatingFileHandler(
            request_log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        request_handler.setLevel(logging.INFO)
        request_handler.setFormatter(RequestFormatter())
        
        # Create separate logger for requests
        request_logger = logging.getLogger('http_requests')
        request_logger.setLevel(logging.INFO)
        request_logger.addHandler(request_handler)
        request_logger.propagate = False  # Don't propagate to root logger
    
    # File Handler - Audit Logs
    if enable_file:
        audit_log_file = log_path / f"{app_name}_audit.log"
        audit_handler = logging.handlers.RotatingFileHandler(
            audit_log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        audit_handler.setLevel(logging.INFO)
        audit_handler.setFormatter(JSONFormatter())
        
        # Create separate logger for audit
        audit_logger = logging.getLogger('audit')
        audit_logger.setLevel(logging.INFO)
        audit_logger.addHandler(audit_handler)
        audit_logger.propagate = False
    
    logging.info(f"Logging configured: level={log_level}, dir={log_dir}")
    
    return root_logger


def log_request(method: str, path: str, status_code: int, response_time_ms: float,
                user_id: Optional[int] = None, ip_address: Optional[str] = None,
                user_agent: Optional[str] = None):
    """
    Log HTTP request/response
    تسجيل طلب/استجابة HTTP
    """
    request_logger = logging.getLogger('http_requests')
    
    # Create log record with custom attributes
    record = request_logger.makeRecord(
        request_logger.name,
        logging.INFO,
        '',
        0,
        f"{method} {path} - {status_code} ({response_time_ms:.2f}ms)",
        (),
        None
    )
    
    # Add custom attributes
    record.method = method
    record.path = path
    record.status_code = status_code
    record.response_time_ms = response_time_ms
    record.user_id = user_id
    record.ip_address = ip_address or 'UNKNOWN'
    record.user_agent = user_agent or 'UNKNOWN'
    
    request_logger.handle(record)


def log_audit(event_type: str, user_id: Optional[int], action: str,
              resource: str, details: Optional[dict] = None,
              ip_address: Optional[str] = None):
    """
    Log audit event
    تسجيل حدث تدقيق
    """
    audit_logger = logging.getLogger('audit')
    
    audit_data = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'user_id': user_id,
        'action': action,
        'resource': resource,
        'details': details or {},
        'ip_address': ip_address or 'UNKNOWN'
    }
    
    audit_logger.info(json.dumps(audit_data, ensure_ascii=False))


# Flask integration
def init_logging(app):
    """
    Initialize logging for Flask application
    تهيئة التسجيل لتطبيق Flask
    """
    import time
    from flask import request, g
    
    # Setup logging
    log_dir = app.config.get('LOG_DIR', 'logs')
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    enable_json = app.config.get('LOG_JSON_FORMAT', True)
    
    setup_logging(
        app_name='noufal_erp',
        log_dir=log_dir,
        log_level=log_level,
        enable_json=enable_json
    )
    
    # Request logging middleware
    @app.before_request
    def before_request():
        """Store request start time"""
        g.start_time = time.time()
    
    @app.after_request
    def after_request(response):
        """Log request after completion"""
        if hasattr(g, 'start_time'):
            response_time_ms = (time.time() - g.start_time) * 1000
            
            # Get user_id if available
            user_id = getattr(g, 'user_id', None)
            
            # Log request
            log_request(
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                response_time_ms=response_time_ms,
                user_id=user_id,
                ip_address=request.remote_addr,
                user_agent=request.user_agent.string
            )
        
        return response
    
    # Error handler
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Log unhandled exceptions"""
        logging.error(
            f"Unhandled exception: {str(error)}",
            exc_info=True,
            extra={
                'path': request.path,
                'method': request.method,
                'ip_address': request.remote_addr
            }
        )
        
        # Return error response
        return {
            'error': 'Internal server error',
            'message': str(error) if app.debug else 'An error occurred'
        }, 500
    
    logging.info("Logging initialized for Flask app")


# Usage examples
if __name__ == "__main__":
    # Setup logging
    setup_logging(
        app_name="test_app",
        log_dir="logs",
        log_level="DEBUG",
        enable_console=True,
        enable_file=True,
        enable_json=True
    )
    
    # Get logger
    logger = logging.getLogger(__name__)
    
    print("=" * 80)
    print("LOGGING EXAMPLES")
    print("=" * 80)
    
    # Different log levels
    logger.debug("This is a DEBUG message")
    logger.info("This is an INFO message")
    logger.warning("This is a WARNING message")
    logger.error("This is an ERROR message")
    logger.critical("This is a CRITICAL message")
    
    # Log with exception
    try:
        result = 1 / 0
    except Exception as e:
        logger.error("Error occurred during calculation", exc_info=True)
    
    # Log HTTP request
    log_request(
        method="GET",
        path="/api/users/123",
        status_code=200,
        response_time_ms=45.67,
        user_id=123,
        ip_address="192.168.1.100",
        user_agent="Mozilla/5.0"
    )
    
    # Log audit event
    log_audit(
        event_type="USER_LOGIN",
        user_id=123,
        action="LOGIN",
        resource="authentication",
        details={"method": "password", "success": True},
        ip_address="192.168.1.100"
    )
    
    print("\n" + "=" * 80)
    print("Check the 'logs' directory for log files:")
    print("  - test_app.log (general logs)")
    print("  - test_app_errors.log (errors only)")
    print("  - test_app_debug.log (debug logs)")
    print("  - test_app_requests.log (HTTP requests)")
    print("  - test_app_audit.log (audit trail)")
    print("=" * 80)
