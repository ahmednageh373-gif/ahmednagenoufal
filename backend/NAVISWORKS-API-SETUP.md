# Navisworks API Setup Guide

## 📡 API Endpoints

### 1. Import Model
```http
POST /api/projects/:projectId/navisworks/import
Content-Type: application/json

{
  "modelData": {
    "fileName": "Building.nwf",
    "title": "Main Building",
    "units": "Meters",
    "boundingBox": { ... },
    "elements": [ ... ],
    "statistics": { ... }
  }
}
```

### 2. Get Models List
```http
GET /api/projects/:projectId/navisworks/models?page=1&pageSize=20
```

### 3. Get Model by ID
```http
GET /api/projects/:projectId/navisworks/models/:modelId
```

### 4. Get Elements
```http
GET /api/projects/:projectId/navisworks/models/:modelId/elements?category=Wall&search=exterior&page=1&pageSize=100
```

### 5. Get Single Element
```http
GET /api/projects/:projectId/navisworks/models/:modelId/elements/:elementId
```

### 6. Get Categories
```http
GET /api/projects/:projectId/navisworks/models/:modelId/categories
```

### 7. Get Statistics
```http
GET /api/projects/:projectId/navisworks/models/:modelId/statistics
```

### 8. Delete Model
```http
DELETE /api/projects/:projectId/navisworks/models/:modelId
```

### 9. Health Check
```http
GET /api/projects/health
```

---

## 🔧 Setup Instructions

### 1. Register Blueprint in app.py

Add to `backend/app.py`:

```python
# Import Navisworks API
from api.navisworks_api import navisworks_bp

# Register blueprint
app.register_blueprint(navisworks_bp)
```

### 2. Test the API

```bash
# Health check
curl http://localhost:5000/api/projects/health

# Import a model
curl -X POST http://localhost:5000/api/projects/project-123/navisworks/import \
  -H "Content-Type: application/json" \
  -d @test-model.json

# Get models
curl http://localhost:5000/api/projects/project-123/navisworks/models
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🗄️ Data Storage

**Current**: In-memory storage (للتطوير)
- `MODELS_STORE` - Dictionary of models
- `ELEMENTS_STORE` - Dictionary of elements

**Production**: MongoDB (recommended)
- Install: `pip install pymongo`
- Use: `NavisworksService` class

---

## 🔐 Authentication (Optional)

Add authentication middleware:

```python
from functools import wraps
from flask import request, jsonify

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        # Verify token here
        return f(*args, **kwargs)
    return decorated

# Use on endpoints
@navisworks_bp.route('/...', methods=['POST'])
@require_auth
def import_model(project_id):
    # ...
```

---

## 📝 Testing with curl

### Import Test Model
```bash
curl -X POST http://localhost:5000/api/projects/test-project/navisworks/import \
  -H "Content-Type: application/json" \
  -d '{
    "modelData": {
      "fileName": "test.nwf",
      "title": "Test Model",
      "units": "Meters",
      "boundingBox": {
        "minX": 0, "minY": 0, "minZ": 0,
        "maxX": 100, "maxY": 100, "maxZ": 50
      },
      "elements": [
        {
          "id": "elem-1",
          "name": "Wall-001",
          "category": "Wall",
          "path": "Model/Walls/Wall-001",
          "properties": {},
          "geometry": {
            "vertices": [0,0,0, 10,0,0, 10,0,3, 0,0,3],
            "indices": [0,1,2, 0,2,3],
            "normals": [0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0],
            "transform": [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
            "triangleCount": 2,
            "vertexCount": 4
          }
        }
      ],
      "metadata": {},
      "statistics": {
        "totalElements": 1,
        "elementsWithGeometry": 1,
        "elementsWithProperties": 0,
        "elementsByCategory": {"Wall": 1},
        "exportStartTime": "2024-11-14T10:00:00",
        "exportEndTime": "2024-11-14T10:00:05"
      }
    }
  }'
```

### Get Models
```bash
curl http://localhost:5000/api/projects/test-project/navisworks/models
```

### Get Model Details
```bash
# Use modelId from import response
curl http://localhost:5000/api/projects/test-project/navisworks/models/{modelId}
```

---

## 🚀 Integration with Frontend

### React Query Hook
```typescript
import { useQuery } from '@tanstack/react-query';

export function useNavisworksModel(projectId: string, modelId: string) {
  return useQuery({
    queryKey: ['navisworks-model', projectId, modelId],
    queryFn: async () => {
      const response = await fetch(
        `/api/projects/${projectId}/navisworks/models/${modelId}`
      );
      const data = await response.json();
      return data.data;
    },
  });
}
```

### Usage in Component
```typescript
const { data: modelData, isLoading } = useNavisworksModel(
  projectId,
  modelId
);
```

---

## 📦 Deployment Considerations

### Environment Variables
```bash
# .env
MONGODB_URI=mongodb://localhost:27017/noufal
FLASK_ENV=production
SECRET_KEY=your-secret-key
```

### Production Setup
1. Install MongoDB
2. Update `NavisworksService` to use MongoDB
3. Add authentication
4. Enable CORS for frontend domain
5. Use production WSGI server (gunicorn)

```bash
# Install dependencies
pip install pymongo gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🐛 Troubleshooting

### Issue: CORS Error
```python
# In app.py
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "https://your-domain.com"]
    }
})
```

### Issue: Large Payload
```python
# In app.py
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
```

### Issue: Timeout
```python
# In app.py
from flask import Flask
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False  # Faster JSON
```

---

## 📚 Related Documentation

- **Plugin Guide**: `navisworks-plugin/README.md`
- **3D Viewer**: `src/components/Navisworks/README.md`
- **Types**: `src/types/navisworks.types.ts`

---

**Status**: ✅ Ready for use  
**Version**: 1.0.0  
**Last Updated**: 2024-11-14
