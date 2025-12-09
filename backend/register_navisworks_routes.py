"""
Register Navisworks Routes
Add this to app.py to register Navisworks API routes
"""

from api.navisworks_api import navisworks_bp

def register_navisworks_routes(app):
    """
    Register Navisworks API routes
    
    Usage in app.py:
    
    from register_navisworks_routes import register_navisworks_routes
    register_navisworks_routes(app)
    """
    app.register_blueprint(navisworks_bp)
    print("✅ Navisworks API routes registered")
    print("   - POST   /api/projects/:projectId/navisworks/import")
    print("   - GET    /api/projects/:projectId/navisworks/models")
    print("   - GET    /api/projects/:projectId/navisworks/models/:modelId")
    print("   - DELETE /api/projects/:projectId/navisworks/models/:modelId")
    print("   - GET    /api/projects/:projectId/navisworks/models/:modelId/elements")
    print("   - GET    /api/projects/:projectId/navisworks/models/:modelId/elements/:elementId")
    print("   - GET    /api/projects/:projectId/navisworks/models/:modelId/categories")
    print("   - GET    /api/projects/:projectId/navisworks/models/:modelId/statistics")
    print("   - GET    /api/projects/:projectId/navisworks/health")
