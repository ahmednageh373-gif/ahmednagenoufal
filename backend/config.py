"""
NOUFAL ERP - Secure Configuration
================================
Production-ready configuration with security best practices
"""

import os
from datetime import timedelta
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    """Base configuration"""
    
    # ==================== Application ====================
    APP_NAME = "NOUFAL ERP"
    VERSION = "1.0.0"
    
    # Environment
    ENV = os.getenv('FLASK_ENV', 'production')
    DEBUG = False  # NEVER enable in production
    TESTING = False
    
    # ==================== Security ====================
    # Secret key - MUST be set in environment
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable must be set!")
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Session Configuration
    SESSION_COOKIE_SECURE = True  # Only send over HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access
    SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
    PERMANENT_SESSION_LIFETIME = timedelta(hours=1)
    
    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    # ==================== Database ====================
    # PostgreSQL for production
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///noufal_erp.db')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # Disable SQL logging in production
    
    # Connection pool settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
    }
    
    # ==================== API Keys ====================
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # ==================== CORS ====================
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
    CORS_ALLOW_CREDENTIALS = True
    CORS_MAX_AGE = 3600
    
    # ==================== Rate Limiting ====================
    RATELIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
    RATELIMIT_DEFAULT = "100/minute"
    RATELIMIT_STORAGE_URL = "memory://"
    
    # ==================== File Upload ====================
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB max file size
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls', 'doc', 'docx', 'png', 'jpg', 'jpeg'}
    
    # ==================== Logging ====================
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = BASE_DIR / 'logs' / 'app.log'
    
    # ==================== Email ====================
    MAIL_SERVER = os.getenv('SMTP_HOST', 'localhost')
    MAIL_PORT = int(os.getenv('SMTP_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('SMTP_USER')
    MAIL_PASSWORD = os.getenv('SMTP_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('SMTP_FROM', f'noreply@{APP_NAME.lower()}.com')


class DevelopmentConfig(Config):
    """Development configuration"""
    ENV = 'development'
    DEBUG = True  # Only in development
    SQLALCHEMY_ECHO = True  # Enable SQL logging
    SESSION_COOKIE_SECURE = False  # Allow HTTP in development
    RATELIMIT_ENABLED = False  # Disable rate limiting in dev


class ProductionConfig(Config):
    """Production configuration"""
    ENV = 'production'
    DEBUG = False
    TESTING = False
    
    # Strict security in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    
    # Force HTTPS
    PREFERRED_URL_SCHEME = 'https'


class TestingConfig(Config):
    """Testing configuration"""
    ENV = 'testing'
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}


def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'production')
    return config.get(env, config['default'])
