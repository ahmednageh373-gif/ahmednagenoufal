"""
API Router - Main router that includes all endpoint routers
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health, boq, analysis

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)

api_router.include_router(
    boq.router,
    prefix="/boq",
    tags=["BOQ"],
)

api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["Analysis"],
)

# Add more routers as needed
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
