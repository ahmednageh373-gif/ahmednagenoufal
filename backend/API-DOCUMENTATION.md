### # Navisworks API Documentation

## 📋 نظرة عامة

API كامل للتكامل بين Navisworks Plugin والـ 3D Viewer، يوفر endpoints لاستيراد وإدارة واسترجاع بيانات نماذج Navisworks.

**Base URL:** `/api/projects/:projectId/navisworks`

---

## 🔐 Authentication

جميع endpoints تتطلب authentication (يجب إضافة middleware للتحقق من الصلاحيات).

**Header:**
```
Authorization: Bearer <token>
```

---

## 📍 Endpoints

### 1. Import Model

استيراد نموذج Navisworks جديد.

**Endpoint:** `POST /api/projects/:projectId/navisworks/import`

**Request Body:**
```json
{
  "fileName": "Building.nwf",
  "title": "Main Building - Level 1",
  "units": "Meters",
  "author": "Ahmed Ali",
  "lastModified": "2024-11-14T10:30:00Z",
  "fileSize": "245.6 MB",
  "boundingBox": {
    "minX": 0,
    "minY": 0,
    "minZ": 0,
    "maxX": 50.5,
    "maxY": 30.2,
    "maxZ": 15.8
  },
  "elements": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "name": "Wall-Ext-001",
      "category": "Wall",
      "path": "Model / Architecture / Walls / Exterior / Wall-Ext-001",
      "boundingBox": {
        "minX": 0,
        "minY": 0,
        "minZ": 0,
        "maxX": 10.5,
        "maxY": 0.3,
        "maxZ": 3.5
      },
      "properties": {
        "Element": {
          "Category": {
            "displayName": "Category",
            "value": "Walls",
            "type": "String"
          }
        },
        "Dimensions": {
          "Length": {
            "displayName": "Length",
            "value": 10.5,
            "type": "Double",
            "units": "m"
          }
        }
      },
      "geometry": {
        "vertices": [0, 0, 0, 10.5, 0, 0, ...],
        "indices": [0, 1, 2, 0, 2, 3, ...],
        "normals": [0, -1, 0, 0, -1, 0, ...],
        "transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        "triangleCount": 156,
        "vertexCount": 234
      },
      "material": {
        "name": "Concrete - Cast-in-Place",
        "diffuseColor": {
          "r": 0.7,
          "g": 0.7,
          "b": 0.7,
          "a": 1.0
        }
      }
    }
  ],
  "metadata": {
    "ExportDate": "2024-11-14 15:30:45",
    "NavisworksVersion": "2024.0.0.0"
  },
  "statistics": {
    "totalElements": 1547,
    "elementsWithGeometry": 1432,
    "elementsWithProperties": 1547,
    "elementsByCategory": {
      "Wall": 456,
      "Door": 89,
      "Window": 124
    },
    "exportStartTime": "2024-11-14T15:28:11Z",
    "exportEndTime": "2024-11-14T15:30:45Z"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "modelId": "507f1f77bcf86cd799439011",
    "projectId": "project-123",
    "fileName": "Building.nwf",
    "elementsImported": 1547,
    "fileSizeBytes": 25678912,
    "importedAt": "2024-11-14T15:30:50Z",
    "statistics": {
      "totalElements": 1547,
      "elementsWithGeometry": 1432,
      "elementsWithProperties": 1547,
      "elementsByCategory": {
        "Wall": 456,
        "Door": 89,
        "Window": 124
      },
      "processingTime": 4.532,
      "dataSizeBytes": 25678912
    },
    "viewerUrl": "/projects/project-123/navisworks/507f1f77bcf86cd799439011",
    "warnings": []
  }
}
```

**Errors:**
- `400` - Validation error
- `413` - Request too large (> 100 MB)
- `500` - Internal server error

---

### 2. Get Models List

الحصول على قائمة النماذج لمشروع معين.

**Endpoint:** `GET /api/projects/:projectId/navisworks/models`

**Query Parameters:**
- `page` (optional, default: 1) - رقم الصفحة
- `pageSize` (optional, default: 20, max: 1000) - عدد العناصر في الصفحة

**Example:**
```
GET /api/projects/project-123/navisworks/models?page=1&pageSize=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "modelId": "507f1f77bcf86cd799439011",
        "projectId": "project-123",
        "fileName": "Building.nwf",
        "importedAt": "2024-11-14T15:30:50Z",
        "viewerUrl": "/projects/project-123/navisworks/507f1f77bcf86cd799439011",
        "elementsCount": 1547
      }
    ],
    "totalCount": 5,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

---

### 3. Get Single Model

الحصول على نموذج واحد بكامل بياناته.

**Endpoint:** `GET /api/projects/:projectId/navisworks/models/:modelId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "modelId": "507f1f77bcf86cd799439011",
    "projectId": "project-123",
    "fileName": "Building.nwf",
    "modelData": {
      "fileName": "Building.nwf",
      "title": "Main Building",
      "units": "Meters",
      "boundingBox": { ... },
      "elements": [ ... ],
      "metadata": { ... },
      "statistics": { ... }
    },
    "importedAt": "2024-11-14T15:30:50Z",
    "viewerUrl": "/projects/project-123/navisworks/507f1f77bcf86cd799439011"
  }
}
```

**Errors:**
- `404` - Model not found
- `403` - Model does not belong to this project

---

### 4. Delete Model

حذف نموذج وجميع عناصره.

**Endpoint:** `DELETE /api/projects/:projectId/navisworks/models/:modelId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Model deleted successfully"
}
```

**Errors:**
- `404` - Model not found
- `403` - Model does not belong to this project

---

### 5. Get Elements

الحصول على عناصر النموذج مع إمكانية التصفية.

**Endpoint:** `GET /api/projects/:projectId/navisworks/models/:modelId/elements`

**Query Parameters:**
- `category` (optional) - تصفية حسب الفئة (مثل: "Wall", "Door")
- `search` (optional) - بحث في name و path
- `page` (optional, default: 1)
- `pageSize` (optional, default: 100, max: 1000)

**Example:**
```
GET /api/projects/project-123/navisworks/models/507f.../elements?category=Wall&search=exterior&page=1&pageSize=100
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "elements": [
      {
        "id": "element-001",
        "name": "Wall-Ext-001",
        "category": "Wall",
        "path": "Model / Architecture / Walls / Exterior / Wall-Ext-001",
        "boundingBox": { ... },
        "properties": { ... },
        "geometry": { ... }
      }
    ],
    "totalCount": 456,
    "page": 1,
    "pageSize": 100,
    "totalPages": 5
  }
}
```

---

### 6. Get Single Element

الحصول على عنصر واحد بكامل بياناته.

**Endpoint:** `GET /api/projects/:projectId/navisworks/models/:modelId/elements/:elementId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "element-001",
    "name": "Wall-Ext-001",
    "category": "Wall",
    "path": "Model / Architecture / Walls / Exterior / Wall-Ext-001",
    "boundingBox": {
      "minX": 0,
      "minY": 0,
      "minZ": 0,
      "maxX": 10.5,
      "maxY": 0.3,
      "maxZ": 3.5
    },
    "properties": {
      "Element": { ... },
      "Dimensions": { ... },
      "Identity Data": { ... }
    },
    "geometry": {
      "vertices": [...],
      "indices": [...],
      "normals": [...],
      "transform": [...],
      "triangleCount": 156,
      "vertexCount": 234
    },
    "material": {
      "name": "Concrete",
      "diffuseColor": { "r": 0.7, "g": 0.7, "b": 0.7, "a": 1.0 }
    },
    "metadata": {
      "guid": "...",
      "ifcType": "IfcWall"
    }
  }
}
```

**Errors:**
- `404` - Element not found

---

### 7. Get Categories

الحصول على قائمة الفئات الفريدة في النموذج.

**Endpoint:** `GET /api/projects/:projectId/navisworks/models/:modelId/categories`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      "Wall",
      "Door",
      "Window",
      "Column",
      "Beam",
      "Slab",
      "Roof"
    ]
  }
}
```

---

### 8. Get Statistics

الحصول على إحصائيات النموذج.

**Endpoint:** `GET /api/projects/:projectId/navisworks/models/:modelId/statistics`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalElements": 1547,
    "elementsWithGeometry": 1432,
    "elementsWithProperties": 1547,
    "elementsByCategory": {
      "Wall": 456,
      "Door": 89,
      "Window": 124,
      "Column": 78,
      "Beam": 234,
      "Slab": 45,
      "Roof": 12,
      "Unknown": 509
    },
    "duration": "00:02:34"
  }
}
```

---

### 9. Health Check

التحقق من صحة الخدمة.

**Endpoint:** `GET /api/projects/:projectId/navisworks/health`

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "service": "navisworks-api",
  "timestamp": "2024-11-14T15:45:00Z"
}
```

---

## 🗄️ Data Models

### BoundingBox
```typescript
{
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
  width?: number,
  height?: number,
  depth?: number
}
```

### GeometryData
```typescript
{
  vertices: number[],        // [x1, y1, z1, x2, y2, z2, ...]
  indices: number[],         // [i1, i2, i3, ...]
  normals: number[],         // [nx1, ny1, nz1, ...]
  uvs?: number[],            // [u1, v1, u2, v2, ...]
  transform: number[],       // 4x4 matrix (16 elements)
  triangleCount: number,
  vertexCount: number
}
```

### PropertyValue
```typescript
{
  displayName: string,
  value: any,
  type: string,              // "String", "Double", "Integer", etc.
  units?: string             // "m", "mm", "kg", etc.
}
```

---

## ⚠️ Error Responses

جميع الأخطاء تعيد response بالشكل التالي:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `MISSING_BODY` | Request body مفقود |
| `MISSING_FIELD` | حقل مطلوب مفقود |
| `INVALID_BBOX` | Bounding box غير صحيح |
| `INVALID_ELEMENTS` | Elements array غير صحيح |
| `EMPTY_ELEMENTS` | لا توجد عناصر |
| `INVALID_ELEMENT` | عنصر غير صحيح |
| `REQUEST_TOO_LARGE` | الطلب أكبر من 100 MB |
| `NOT_FOUND` | المورد غير موجود |
| `UNAUTHORIZED` | غير مصرح |
| `INVALID_PAGE` | رقم صفحة غير صحيح |
| `INVALID_PAGE_SIZE` | حجم صفحة غير صحيح |
| `RATE_LIMIT_EXCEEDED` | تم تجاوز الحد المسموح |
| `INTERNAL_ERROR` | خطأ داخلي |

---

## 🔒 Rate Limiting

- **Import:** 10 requests / minute
- **Other endpoints:** 100 requests / minute

عند تجاوز الحد:
```json
{
  "success": false,
  "error": "Rate limit exceeded: 100 requests per 60 seconds",
  "code": "RATE_LIMIT_EXCEEDED"
}
```
**Status:** `429 Too Many Requests`

---

## 📊 Performance

### Response Times (Average)
- Import Model: 3-10 seconds (depending on size)
- Get Models List: < 100ms
- Get Single Model: < 200ms
- Get Elements: < 150ms
- Get Single Element: < 50ms

### Size Limits
- Maximum request size: 100 MB
- Maximum elements per model: Unlimited (performance may degrade > 10,000)
- Maximum page size: 1,000 items

---

## 🧪 Testing

### Using cURL

**Import Model:**
```bash
curl -X POST \
  http://localhost:5000/api/projects/project-123/navisworks/import \
  -H 'Content-Type: application/json' \
  -d @model-data.json
```

**Get Models:**
```bash
curl http://localhost:5000/api/projects/project-123/navisworks/models
```

**Get Single Model:**
```bash
curl http://localhost:5000/api/projects/project-123/navisworks/models/507f1f77bcf86cd799439011
```

---

## 🔗 Integration

### From Navisworks Plugin

```csharp
// في NOUFALPlugin.cs
var response = await apiService.UploadModelDataAsync(projectId, modelData);

if (response.Success)
{
    MessageBox.Show($"تم رفع {response.Data.ElementsImported} عنصر بنجاح!");
}
```

### From React Frontend

```typescript
// في useNavisworksModel hook
const { data } = useQuery({
  queryKey: ['navisworks-model', projectId, modelId],
  queryFn: async () => {
    const response = await fetch(
      `/api/projects/${projectId}/navisworks/models/${modelId}`
    );
    return response.json();
  }
});
```

---

## 📝 Notes

1. **MongoDB**: يجب تشغيل MongoDB على localhost:27017 أو تحديث connection string
2. **Indexes**: يتم إنشاء indexes تلقائياً عند أول استخدام
3. **Validation**: يتم التحقق من صحة البيانات قبل الحفظ
4. **Performance**: استخدام pagination للنماذج الكبيرة
5. **Security**: يجب إضافة authentication middleware في الإنتاج

---

## 🚀 Deployment

### Requirements
```
Python 3.8+
Flask 2.0+
pymongo 4.0+
pydantic 2.0+
```

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=noufal
DEBUG=False
```

### Start Server
```bash
cd backend
python app.py
```

---

**آخر تحديث:** 2024-11-14  
**الإصدار:** 1.0.0
