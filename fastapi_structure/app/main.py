"""
FastAPI Main Application
Noufal Engineering System - FastAPI Version
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time

from app.core.config import settings
from app.core.logging import logger
from app.api.v1.api import api_router
from app.middleware.timing import TimingMiddleware
from app.middleware.logging import LoggingMiddleware


# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for startup and shutdown
    """
    # Startup
    logger.info(
        "🚀 Starting API",
        extra={
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
        },
    )

    # Initialize services, database connections, etc.
    # await init_database()
    # await init_cache()

    yield

    # Shutdown
    logger.info("🛑 Shutting down API")
    # Cleanup resources
    # await close_database()
    # await close_cache()


# Rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.RATE_LIMIT_DEFAULT],
    storage_uri=settings.RATE_LIMIT_STORAGE_URL,
    strategy="fixed-window",
)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json" if not settings.DISABLE_DOCS else None,
    docs_url=f"{settings.API_V1_PREFIX}/docs" if not settings.DISABLE_DOCS else None,
    redoc_url=f"{settings.API_V1_PREFIX}/redoc" if not settings.DISABLE_DOCS else None,
    lifespan=lifespan,
    debug=settings.DEBUG,
)

# Set limiter state
app.state.limiter = limiter


# =====================================
# Exception Handlers
# =====================================


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded"""
    logger.warning(
        "Rate limit exceeded",
        extra={
            "client": request.client.host if request.client else "unknown",
            "path": request.url.path,
        },
    )
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "success": False,
            "error": "Rate Limit Exceeded",
            "message": "Too many requests. Please slow down.",
            "retry_after": exc.headers.get("Retry-After"),
        },
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(
        "Validation error",
        extra={"path": request.url.path, "errors": exc.errors()},
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error",
            "message": "Invalid request data",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.error(
        "Unhandled exception",
        extra={"path": request.url.path, "error": str(exc)},
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": str(exc) if settings.DEBUG else "An internal error occurred",
        },
    )


# =====================================
# Middleware
# =====================================

# Custom middleware
app.add_middleware(TimingMiddleware)
app.add_middleware(LoggingMiddleware)

# SlowAPI middleware (must be after setting app.state.limiter)
app.add_middleware(SlowAPIMiddleware)

# CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Response-Time"],
    )

# GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Trusted host (production only)
if not settings.DEBUG and settings.ALLOWED_HOSTS:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )


# =====================================
# Security Headers Middleware
# =====================================


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )

    return response


# =====================================
# Routes
# =====================================

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "success": True,
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": f"{settings.API_V1_PREFIX}/docs" if not settings.DISABLE_DOCS else None,
        "status": "running",
    }


# Health check
@app.get("/health", tags=["Health"])
@limiter.exempt
async def health_check():
    """
    Health check endpoint
    """
    return {
        "success": True,
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Readiness check
@app.get("/ready", tags=["Health"])
@limiter.exempt
async def readiness_check():
    """
    Readiness check - checks all dependencies
    """
    # TODO: Check database, cache, external services
    checks = {
        "database": "ok",  # Replace with actual check
        "cache": "ok",  # Replace with actual check
    }

    all_ok = all(status == "ok" for status in checks.values())

    return {
        "success": all_ok,
        "ready": all_ok,
        "checks": checks,
    }


# =====================================
# Development Only
# =====================================

if settings.DEBUG:

    @app.get("/debug/routes", tags=["Debug"])
    async def debug_routes():
        """List all registered routes"""
        routes = []
        for route in app.routes:
            route_info = {
                "path": getattr(route, "path", None),
                "name": getattr(route, "name", None),
                "methods": list(getattr(route, "methods", [])),
            }
            routes.append(route_info)
        return {"routes": routes}

    @app.get("/debug/config", tags=["Debug"])
    async def debug_config():
        """Show current configuration (non-sensitive)"""
        return {
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "cors_origins": [str(o) for o in settings.BACKEND_CORS_ORIGINS],
            "rate_limit": settings.RATE_LIMIT_DEFAULT,
        }


# =====================================
# Entry Point
# =====================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
        access_log=True,
    )
