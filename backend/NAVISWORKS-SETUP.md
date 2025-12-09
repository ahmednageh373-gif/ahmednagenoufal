# 🚀 Navisworks API - دليل الإعداد

## المتطلبات

### 1. Python
```bash
python --version  # يجب أن يكون 3.8 أو أعلى
```

### 2. MongoDB
```bash
# تثبيت MongoDB
# Ubuntu/Debian:
sudo apt-get install mongodb

# macOS:
brew install mongodb-community

# Windows:
# تحميل من: https://www.mongodb.com/try/download/community

# تشغيل MongoDB
mongod
```

---

## التثبيت

### الخطوة 1: تثبيت المكتبات

```bash
cd backend
pip install -r requirements-navisworks.txt
```

أو تثبيت يدوي:
```bash
pip install Flask>=2.3.0
pip install flask-cors>=4.0.0
pip install pymongo>=4.6.0
pip install pydantic>=2.5.0
pip install python-dotenv>=1.0.0
```

---

### الخطوة 2: إعداد MongoDB

```bash
# إنشاء database
mongosh
> use noufal
> db.createCollection("navisworks_models")
> db.createCollection("navisworks_elements")
> exit
```

---

### الخطوة 3: إعداد Environment Variables

إنشاء ملف `.env` في مجلد backend:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=noufal

# Flask
FLASK_ENV=development
DEBUG=True

# Security (optional)
SECRET_KEY=your-secret-key-here
```

---

### الخطوة 4: تسجيل Routes

في ملف `backend/app.py`، أضف في النهاية:

```python
# Navisworks API
from register_navisworks_routes import register_navisworks_routes
register_navisworks_routes(app)
```

---

### الخطوة 5: تشغيل السيرفر

```bash
cd backend
python app.py
```

يجب أن ترى:
```
✅ Navisworks API routes registered
   - POST   /api/projects/:projectId/navisworks/import
   - GET    /api/projects/:projectId/navisworks/models
   ...
```

---

## الاختبار

### 1. Health Check

```bash
curl http://localhost:5000/api/projects/test-project/navisworks/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "service": "navisworks-api",
  "timestamp": "2024-11-14T..."
}
```

---

### 2. Import Test Model

إنشاء ملف `test-model.json`:

```json
{
  "fileName": "Test.nwf",
  "title": "Test Model",
  "units": "Meters",
  "boundingBox": {
    "minX": 0,
    "minY": 0,
    "minZ": 0,
    "maxX": 10,
    "maxY": 10,
    "maxZ": 5
  },
  "elements": [
    {
      "id": "test-element-001",
      "name": "Test Wall",
      "category": "Wall",
      "path": "Test / Wall",
      "properties": {},
      "geometry": {
        "vertices": [0, 0, 0, 10, 0, 0, 10, 0, 5, 0, 0, 5],
        "indices": [0, 1, 2, 0, 2, 3],
        "normals": [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0],
        "transform": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
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
    "exportStartTime": "2024-11-14T10:00:00Z",
    "exportEndTime": "2024-11-14T10:00:01Z"
  }
}
```

**Import:**
```bash
curl -X POST \
  http://localhost:5000/api/projects/test-project/navisworks/import \
  -H 'Content-Type: application/json' \
  -d @test-model.json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modelId": "...",
    "projectId": "test-project",
    "fileName": "Test.nwf",
    "elementsImported": 1,
    ...
  }
}
```

---

### 3. Get Models

```bash
curl http://localhost:5000/api/projects/test-project/navisworks/models
```

---

## هيكل الملفات

```
backend/
├── models/
│   └── navisworks_model.py          ← Data models
├── services/
│   └── navisworks_service.py        ← Business logic
├── api/
│   └── navisworks_api.py            ← API routes
├── middleware/
│   └── navisworks_validation.py     ← Validation
├── register_navisworks_routes.py    ← Route registration
├── requirements-navisworks.txt      ← Python dependencies
├── API-DOCUMENTATION.md             ← API docs
├── NAVISWORKS-SETUP.md              ← This file
└── app.py                            ← Main Flask app
```

---

## MongoDB Collections

### navisworks_models
```javascript
{
  _id: ObjectId("..."),
  modelId: "507f1f77bcf86cd799439011",
  projectId: "project-123",
  fileName: "Building.nwf",
  modelData: { ... },
  importedAt: ISODate("2024-11-14T15:30:50Z"),
  viewerUrl: "/projects/project-123/navisworks/..."
}
```

### navisworks_elements
```javascript
{
  _id: ObjectId("..."),
  modelId: "507f1f77bcf86cd799439011",
  projectId: "project-123",
  elementId: "element-001",
  name: "Wall-001",
  category: "Wall",
  path: "Model / Architecture / Walls / Wall-001",
  elementData: { ... }
}
```

---

## Indexes

يتم إنشاء Indexes تلقائياً:

### Models Collection
- `projectId` (ascending)
- `modelId` (unique)
- `importedAt` (descending)

### Elements Collection
- `modelId` (ascending)
- `projectId` (ascending)
- `elementId` (ascending)
- `category` (ascending)
- `name`, `path` (text search)

---

## حل المشاكل

### المشكلة: MongoDB connection failed

**الحل:**
```bash
# تحقق من تشغيل MongoDB
sudo systemctl status mongod

# أو
ps aux | grep mongod

# إعادة تشغيل
sudo systemctl start mongod
```

---

### المشكلة: Import failed - validation error

**الحل:**
تحقق من أن البيانات تحتوي على:
- `fileName` (string)
- `boundingBox` (object مع min/max X/Y/Z)
- `elements` (array غير فارغ)
- كل element له `id`, `name`, `category`, `path`

---

### المشكلة: Routes not registered

**الحل:**
تأكد من إضافة في `app.py`:
```python
from register_navisworks_routes import register_navisworks_routes
register_navisworks_routes(app)
```

---

### المشكلة: ModuleNotFoundError

**الحل:**
```bash
pip install -r requirements-navisworks.txt
```

---

## الأداء

### تحسين الأداء للنماذج الكبيرة

1. **استخدام Pagination:**
```python
# في get_elements
page_size = 100  # بدلاً من 1000
```

2. **إنشاء Indexes إضافية:**
```javascript
// في MongoDB
db.navisworks_elements.createIndex({ "modelId": 1, "category": 1 })
```

3. **Caching:**
```python
# استخدام Redis للـ caching (optional)
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'redis'})
```

---

## الأمان

### 1. Authentication Middleware

إضافة في `app.py`:
```python
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        # Verify token
        return f(*args, **kwargs)
    return decorated
```

### 2. CORS Configuration

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-frontend-domain.com"],
        "methods": ["GET", "POST", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### 3. Rate Limiting

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: request.remote_addr)

@navisworks_bp.route('/import', methods=['POST'])
@limiter.limit("10 per minute")
def import_model():
    ...
```

---

## الإنتاج (Production)

### 1. استخدام Gunicorn

```bash
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 2. Environment Variables

```env
FLASK_ENV=production
DEBUG=False
MONGODB_URI=mongodb://username:password@host:port/
SECRET_KEY=strong-random-key
```

### 3. MongoDB Atlas (Cloud)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/noufal?retryWrites=true&w=majority
```

---

## الدعم

- **API Documentation:** [API-DOCUMENTATION.md](API-DOCUMENTATION.md)
- **GitHub Issues:** [repository-url]/issues
- **Email:** support@noufal.com

---

**آخر تحديث:** 2024-11-14  
**الإصدار:** 1.0.0
