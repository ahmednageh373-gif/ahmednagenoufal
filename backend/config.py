"""
NOUFAL Engineering System - Configuration
==========================================
ملف التكوين المركزي للنظام
"""

import os
from datetime import timedelta
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent

class Config:
    """Base configuration"""
    
    # Application
    APP_NAME = "NOUFAL Engineering Management System"
    APP_VERSION = "2.0.0"
    DEBUG = False
    TESTING = False
    
    # Secret Key
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{BASE_DIR / "noufal.db"}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # MongoDB (Alternative)
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/noufal_db'
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # File Upload
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'pdf', 'dxf', 'dwg'}
    
    # Export
    EXPORT_FOLDER = BASE_DIR / 'exports'
    TEMPLATE_FOLDER = BASE_DIR / 'templates'
    
    # Pagination
    ITEMS_PER_PAGE = 50
    MAX_ITEMS_PER_PAGE = 100
    
    # Productivity Database
    PRODUCTIVITY_DATA_PATH = BASE_DIR / 'data' / 'productivity_rates.json'
    
    # SBC Standards
    SBC_STANDARDS_PATH = BASE_DIR / 'data' / 'sbc_standards.json'
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = BASE_DIR / 'logs' / 'noufal.log'
    
    # Cache (Redis)
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Celery (Background Tasks)
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/1')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/2')
    
    # Email (Optional)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # API Rate Limiting
    RATELIMIT_ENABLED = True
    RATELIMIT_DEFAULT = "100 per hour"
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/3')
    
    # Sentry (Error Tracking)
    SENTRY_DSN = os.environ.get('SENTRY_DSN')
    
    # Google Gemini AI
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    @staticmethod
    def init_app(app):
        """Initialize application with config"""
        # Create necessary directories
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.EXPORT_FOLDER, exist_ok=True)
        os.makedirs(Config.TEMPLATE_FOLDER, exist_ok=True)
        os.makedirs(BASE_DIR / 'logs', exist_ok=True)
        os.makedirs(BASE_DIR / 'data', exist_ok=True)


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    LOG_LEVEL = 'DEBUG'


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Override with environment variables in production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://user:password@localhost/noufal_production'
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Log to syslog in production
        import logging
        from logging.handlers import SysLogHandler
        syslog_handler = SysLogHandler()
        syslog_handler.setLevel(logging.WARNING)
        app.logger.addHandler(syslog_handler)


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config(env=None):
    """Get configuration based on environment"""
    if env is None:
        env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])
