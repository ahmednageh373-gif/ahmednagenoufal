"""
Configuration Management for Noufal Engineering System
Handles environment variables and application settings
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).parent
PROJECT_ROOT = BASE_DIR.parent


class Config:
    """Base configuration class"""
    
    # ========================
    # Application Settings
    # ========================
    APP_NAME = "Noufal Engineering System"
    APP_VERSION = "2.1.0"
    
    # Flask Settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Server Settings
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # ========================
    # Database Configuration
    # ========================
    DATABASE_PATH = os.getenv('DATABASE_PATH', str(BASE_DIR / 'database' / 'noufal.db'))
    DATABASE_BACKUP_ENABLED = os.getenv('DATABASE_BACKUP_ENABLED', 'True').lower() == 'true'
    DATABASE_BACKUP_INTERVAL = int(os.getenv('DATABASE_BACKUP_INTERVAL', 86400))  # 24 hours
    
    # ========================
    # Upload Configuration
    # ========================
    UPLOAD_FOLDER = Path(os.getenv('UPLOAD_FOLDER', str(PROJECT_ROOT / 'uploads')))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 52428800))  # 50 MB
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'xlsx,xls,csv,pdf').split(','))
    
    # ========================
    # CORS Configuration
    # ========================
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:5173'
    ).split(',')
    
    # ========================
    # Rate Limiting
    # ========================
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '100 per hour')
    RATE_LIMIT_STORAGE_URL = os.getenv('RATE_LIMIT_STORAGE_URL', 'memory://')
    
    # ========================
    # Logging Configuration
    # ========================
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = Path(os.getenv('LOG_FILE', str(BASE_DIR / 'logs' / 'app.log')))
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10485760))  # 10 MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    
    # ========================
    # Feature Flags
    # ========================
    ENABLE_ANALYTICS = os.getenv('ENABLE_ANALYTICS', 'True').lower() == 'true'
    ENABLE_NOTIFICATIONS = os.getenv('ENABLE_NOTIFICATIONS', 'True').lower() == 'true'
    ENABLE_DOCUMENT_MANAGER = os.getenv('ENABLE_DOCUMENT_MANAGER', 'True').lower() == 'true'
    
    # ========================
    # Performance & Caching
    # ========================
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', 300))
    
    # ========================
    # Security Headers
    # ========================
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        # Create necessary directories
        Config.UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
        Config.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        # Database directory
        Path(Config.DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'
    LOG_LEVEL = 'WARNING'
    
    # More strict security in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Require SECRET_KEY in production
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Ensure SECRET_KEY is set in production
        if cls.SECRET_KEY == 'dev-secret-key-change-in-production':
            raise ValueError(
                "SECRET_KEY must be set in production! "
                "Set the SECRET_KEY environment variable."
            )


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    DATABASE_PATH = ':memory:'  # Use in-memory database for tests
    RATE_LIMIT_ENABLED = False  # Disable rate limiting in tests


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config(config_name: str = None) -> Config:
    """
    Get configuration object based on environment
    
    Args:
        config_name: Configuration name (development, production, testing)
        If None, uses FLASK_ENV environment variable
    
    Returns:
        Configuration class
    """
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    return config.get(config_name, config['default'])
