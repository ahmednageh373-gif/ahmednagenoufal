"""
Configuration Management for FastAPI
Uses Pydantic Settings for type-safe configuration
"""

from typing import List, Optional, Union
from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings with environment variable support
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ========================
    # Application Settings
    # ========================
    APP_NAME: str = "Noufal Engineering System API"
    APP_DESCRIPTION: str = "FastAPI backend for construction management"
    APP_VERSION: str = "2.1.0"
    ENVIRONMENT: str = Field(default="development", pattern="^(development|staging|production)$")
    DEBUG: bool = False

    # ========================
    # Server Settings
    # ========================
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"

    # ========================
    # Security
    # ========================
    SECRET_KEY: str = Field(
        default="change-this-secret-key-in-production",
        min_length=32,
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
        ]
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Allowed hosts (for production)
    ALLOWED_HOSTS: List[str] = Field(default_factory=lambda: ["*"])

    # ========================
    # Rate Limiting
    # ========================
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: str = "100/hour"
    RATE_LIMIT_STORAGE_URL: str = "memory://"

    # ========================
    # Database
    # ========================
    DATABASE_URL: str = "sqlite:///./database/noufal.db"
    DATABASE_ECHO: bool = False  # SQL logging

    # ========================
    # Redis / Cache
    # ========================
    REDIS_URL: Optional[str] = None
    CACHE_TTL: int = 300  # 5 minutes

    # ========================
    # File Upload
    # ========================
    UPLOAD_DIR: Path = Path("uploads")
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS: List[str] = Field(
        default_factory=lambda: ["xlsx", "xls", "csv", "pdf", "dwg"]
    )

    # ========================
    # Logging
    # ========================
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[Path] = Path("logs/app.log")
    LOG_FORMAT: str = "json"  # or "text"
    LOG_MAX_BYTES: int = 10 * 1024 * 1024  # 10 MB
    LOG_BACKUP_COUNT: int = 5

    # ========================
    # Documentation
    # ========================
    DISABLE_DOCS: bool = False  # Disable in production

    # ========================
    # External APIs
    # ========================
    # Add your external API keys here
    # EXTERNAL_API_KEY: Optional[str] = None

    # ========================
    # Feature Flags
    # ========================
    ENABLE_ANALYTICS: bool = True
    ENABLE_NOTIFICATIONS: bool = True
    ENABLE_WEBSOCKETS: bool = False

    # ========================
    # Performance
    # ========================
    WORKERS: int = 4
    WORKER_CLASS: str = "uvicorn.workers.UvicornWorker"
    KEEPALIVE: int = 5

    # ========================
    # Validation
    # ========================
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Create directories
        if self.UPLOAD_DIR:
            self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        if self.LOG_FILE:
            self.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

        # Validate production settings
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY == "change-this-secret-key-in-production":
                raise ValueError(
                    "SECRET_KEY must be changed in production! "
                    "Set SECRET_KEY environment variable."
                )

            if self.DEBUG:
                raise ValueError("DEBUG must be False in production!")

    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT == "development"

    class Config:
        case_sensitive = True


# Create global settings instance
settings = Settings()
