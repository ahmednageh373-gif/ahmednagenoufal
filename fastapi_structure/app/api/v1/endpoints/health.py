"""
Health Check Endpoints
"""

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import logger

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model"""

    success: bool
    status: str
    app: str
    version: str
    environment: str


class ReadinessResponse(BaseModel):
    """Readiness check response model"""

    success: bool
    ready: bool
    checks: dict


@router.get(
    "/",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check if API is running",
)
async def health_check():
    """
    Health check endpoint
    
    Returns:
        Health status of the API
    """
    logger.debug("Health check requested")

    return HealthResponse(
        success=True,
        status="healthy",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
    )


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness Check",
    description="Check if API and all dependencies are ready",
)
async def readiness_check():
    """
    Readiness check - checks all dependencies
    
    Returns:
        Readiness status with dependency checks
    """
    # TODO: Implement actual health checks
    checks = {
        "database": "ok",  # Check database connection
        "cache": "ok",  # Check Redis/cache
        "storage": "ok",  # Check file storage
    }

    all_ok = all(status == "ok" for status in checks.values())

    if not all_ok:
        logger.warning("Readiness check failed", checks=checks)

    return ReadinessResponse(success=all_ok, ready=all_ok, checks=checks)
