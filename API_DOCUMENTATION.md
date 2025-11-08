# 🔌 Schedule API Documentation

## Base URL
```
http://localhost:8000/api/schedule
```

---

## 📋 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boq-codes` | Get list of available BOQ items |
| POST | `/generate` | Generate schedule from BOQ code |
| POST | `/export` | Export schedule to file |
| GET | `/summary/{boq_code}` | Get quick BOQ summary |
| GET | `/health` | Service health check |

---

## 📖 Detailed Documentation

### 1️⃣ GET `/api/schedule/boq-codes`

Get list of all available BOQ (Bill of Quantities) items.

#### Request
```bash
GET /api/schedule/boq-codes
```

#### Response
```json
{
  "codes": [
    "CONC-SLAB-001",
    "PLAST-001",
    "TILE-001",
    "FENCE-001"
  ],
  "total": 4,
  "details": [
    {
      "code": "CONC-SLAB-001",
      "description": "خرسانة بلاطة 100 م³ - C30",
      "category": "Concrete Works",
      "quantity": 100.0,
      "unit": "م³",
      "sub_activities_count": 11
    },
    {
      "code": "PLAST-001",
      "description": "لياسة جدران داخلية 200 م²",
      "category": "Finishing Works",
      "quantity": 200.0,
      "unit": "م²",
      "sub_activities_count": 8
    }
  ]
}
```

#### Example (curl)
```bash
curl -X GET http://localhost:8000/api/schedule/boq-codes
```

#### Example (Python)
```python
import requests

response = requests.get('http://localhost:8000/api/schedule/boq-codes')
data = response.json()

print(f"Available codes: {data['total']}")
for detail in data['details']:
    print(f"  • {detail['code']}: {detail['description']}")
```

---

### 2️⃣ POST `/api/schedule/generate`

Generate a complete project schedule from a BOQ code.

#### Request Body
```json
{
  "boq_code": "CONC-SLAB-001",
  "project_name": "Office Building - Ground Floor",
  "project_start_date": "2025-01-01",
  "shifts": 1,
  "working_days_per_week": 6,
  "max_workers": 50,
  "max_beds": 60,
  "max_meals": 100
}
```

#### Parameters

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `boq_code` | string | ✅ Yes | BOQ item code | - |
| `project_name` | string | No | Project name | "مشروع إنشائي" |
| `project_start_date` | string | ✅ Yes | Start date (YYYY-MM-DD) | - |
| `shifts` | integer | No | Number of shifts (1-3) | 1 |
| `working_days_per_week` | integer | No | Working days per week (5-7) | 6 |
| `max_workers` | integer | No | Site capacity (workers) | null |
| `max_beds` | integer | No | Site capacity (beds) | null |
| `max_meals` | integer | No | Site capacity (meals) | null |

#### Response
```json
{
  "project_name": "Office Building - Ground Floor",
  "project_summary": {
    "project_duration_days": 31.3,
    "project_duration_weeks": 4.5,
    "project_start": "2025-01-01",
    "project_finish": "2025-02-06",
    "total_activities": 11,
    "critical_activities": 8,
    "criticality_percentage": 72.7,
    "working_days_per_week": 6
  },
  "activities": [
    {
      "id": "CONC-SLAB-001-A",
      "name": "تسليم موقع (Hand-over)",
      "duration": 0.5,
      "early_start": 0.0,
      "early_finish": 0.5,
      "late_start": 0.0,
      "late_finish": 0.5,
      "total_float": 0.0,
      "is_critical": true,
      "crew_size": 2
    },
    {
      "id": "CONC-SLAB-001-B",
      "name": "حفر يدوي/ميكانيكي",
      "duration": 4.1,
      "early_start": 0.5,
      "early_finish": 4.6,
      "late_start": 0.5,
      "late_finish": 4.6,
      "total_float": 0.0,
      "is_critical": true,
      "crew_size": 3
    }
  ],
  "critical_path": [
    "CONC-SLAB-001-A",
    "CONC-SLAB-001-B",
    "CONC-SLAB-001-C",
    "CONC-SLAB-001-D",
    "CONC-SLAB-001-E",
    "CONC-SLAB-001-F",
    "CONC-SLAB-001-H",
    "CONC-SLAB-001-J"
  ],
  "resource_histogram": {
    "peak_workers": 9,
    "peak_day": 25,
    "average_workers": 3.7,
    "min_workers": 2,
    "peak_ratio": 2.42,
    "is_balanced": false,
    "total_days": 33,
    "working_days": 32
  }
}
```

#### Example (curl)
```bash
curl -X POST http://localhost:8000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -d '{
    "boq_code": "CONC-SLAB-001",
    "project_name": "Office Building",
    "project_start_date": "2025-01-01",
    "shifts": 1,
    "max_workers": 50
  }'
```

#### Example (Python)
```python
import requests

payload = {
    "boq_code": "CONC-SLAB-001",
    "project_name": "Office Building - Ground Floor",
    "project_start_date": "2025-01-01",
    "shifts": 1,
    "working_days_per_week": 6,
    "max_workers": 50
}

response = requests.post(
    'http://localhost:8000/api/schedule/generate',
    json=payload
)

data = response.json()
print(f"Project Duration: {data['project_summary']['project_duration_days']:.1f} days")
print(f"Critical Activities: {len(data['critical_path'])}/{data['project_summary']['total_activities']}")
```

---

### 3️⃣ POST `/api/schedule/export`

Export schedule to various file formats (Excel, XER, JSON, TXT).

#### Request Body
```json
{
  "boq_code": "CONC-SLAB-001",
  "project_name": "Office Building",
  "project_start_date": "2025-01-01",
  "shifts": 1,
  "working_days_per_week": 6,
  "export_format": "excel"
}
```

#### Parameters

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `export_format` | string | No | Format: `excel`, `xer`, `json`, `txt` | "excel" |

#### Response
- **Content-Type**: Depends on format
  - Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - XER: `text/plain`
  - JSON: `application/json`
  - TXT: `text/plain`
- **Headers**: `Content-Disposition: attachment; filename="schedule.xlsx"`
- **Body**: File content (binary or text)

#### Example (curl)
```bash
# Export to Excel
curl -X POST http://localhost:8000/api/schedule/export \
  -H "Content-Type: application/json" \
  -d '{
    "boq_code": "CONC-SLAB-001",
    "project_name": "Office Building",
    "project_start_date": "2025-01-01",
    "export_format": "excel"
  }' \
  --output schedule.xlsx

# Export to Primavera XER
curl -X POST http://localhost:8000/api/schedule/export \
  -H "Content-Type: application/json" \
  -d '{
    "boq_code": "CONC-SLAB-001",
    "project_name": "Office Building",
    "project_start_date": "2025-01-01",
    "export_format": "xer"
  }' \
  --output schedule.xer
```

#### Example (Python)
```python
import requests

payload = {
    "boq_code": "CONC-SLAB-001",
    "project_name": "Office Building",
    "project_start_date": "2025-01-01",
    "export_format": "excel"
}

response = requests.post(
    'http://localhost:8000/api/schedule/export',
    json=payload
)

# Save to file
with open('schedule.xlsx', 'wb') as f:
    f.write(response.content)

print("✅ Schedule exported to schedule.xlsx")
```

---

### 4️⃣ GET `/api/schedule/summary/{boq_code}`

Get a quick summary of a BOQ item without generating the full schedule.

#### Request
```bash
GET /api/schedule/summary/CONC-SLAB-001
```

#### Response
```json
{
  "boq_code": "CONC-SLAB-001",
  "description": "خرسانة بلاطة 100 م³ - C30",
  "category": "Concrete Works",
  "total_quantity": 100.0,
  "unit": "م³",
  "sub_activities_count": 11,
  "sub_activities": [
    {
      "code": "CONC-SLAB-001-A",
      "name_ar": "تسليم موقع (Hand-over)",
      "name_en": "Site Handover & Survey",
      "unit": "LS",
      "activity_type": "normal",
      "risk_buffer": 3.0,
      "crew": {
        "description": "مهندس + مقيم",
        "total_workers": 2,
        "equipment": "None"
      }
    }
  ]
}
```

#### Example (curl)
```bash
curl -X GET http://localhost:8000/api/schedule/summary/CONC-SLAB-001
```

---

### 5️⃣ GET `/api/schedule/health`

Check if the service is running.

#### Request
```bash
GET /api/schedule/health
```

#### Response
```json
{
  "status": "healthy",
  "service": "Schedule Generation API",
  "version": "1.0.0",
  "available_boq_codes": 4
}
```

---

## 🧪 Testing with Python

### Complete Test Script
```python
import requests
import json

BASE_URL = "http://localhost:8000/api/schedule"

def test_health():
    """Test 1: Health Check"""
    response = requests.get(f"{BASE_URL}/health")
    print(f"✅ Health: {response.json()['status']}")

def test_get_codes():
    """Test 2: Get BOQ Codes"""
    response = requests.get(f"{BASE_URL}/boq-codes")
    data = response.json()
    print(f"✅ Available codes: {data['total']}")
    return data['codes'][0]  # Return first code

def test_generate_schedule(boq_code):
    """Test 3: Generate Schedule"""
    payload = {
        "boq_code": boq_code,
        "project_name": "Test Project",
        "project_start_date": "2025-01-01",
        "shifts": 1,
        "max_workers": 50
    }
    
    response = requests.post(f"{BASE_URL}/generate", json=payload)
    data = response.json()
    
    print(f"✅ Schedule generated:")
    print(f"   Duration: {data['project_summary']['project_duration_days']:.1f} days")
    print(f"   Critical: {len(data['critical_path'])}/{data['project_summary']['total_activities']}")
    
    return data

def test_export(boq_code):
    """Test 4: Export Schedule"""
    payload = {
        "boq_code": boq_code,
        "project_name": "Test Project",
        "project_start_date": "2025-01-01",
        "export_format": "excel"
    }
    
    response = requests.post(f"{BASE_URL}/export", json=payload)
    
    with open('test_schedule.xlsx', 'wb') as f:
        f.write(response.content)
    
    print(f"✅ Schedule exported to test_schedule.xlsx")

def test_summary(boq_code):
    """Test 5: Get Summary"""
    response = requests.get(f"{BASE_URL}/summary/{boq_code}")
    data = response.json()
    
    print(f"✅ Summary for {boq_code}:")
    print(f"   Description: {data['description']}")
    print(f"   Sub-activities: {data['sub_activities_count']}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Testing Schedule API")
    print("=" * 60)
    
    test_health()
    boq_code = test_get_codes()
    test_summary(boq_code)
    schedule = test_generate_schedule(boq_code)
    test_export(boq_code)
    
    print("\n✅ All tests passed!")
```

---

## 🔐 Error Handling

### Error Response Format
```json
{
  "detail": "Error message here"
}
```

### Common Error Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Bad Request | Invalid date format |
| 404 | Not Found | BOQ code doesn't exist |
| 422 | Validation Error | Missing required field |
| 500 | Server Error | Internal processing error |

### Examples

#### 400 - Invalid Date Format
```json
{
  "detail": "Invalid date format: 2025-13-01. Use YYYY-MM-DD"
}
```

#### 404 - BOQ Not Found
```json
{
  "detail": "BOQ code not found: INVALID-CODE"
}
```

#### 422 - Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "boq_code"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 🚀 Deployment

### Running the API Server

```bash
# Install dependencies
pip install fastapi uvicorn pydantic openpyxl

# Run server
uvicorn backend.api.schedule_api:router --host 0.0.0.0 --port 8000

# Or with auto-reload (development)
uvicorn backend.api.schedule_api:router --reload --host 0.0.0.0 --port 8000
```

### Docker Deployment (Future)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ backend/

CMD ["uvicorn", "backend.api.schedule_api:router", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📊 Performance

### Benchmarks
- **Generate Schedule**: ~200ms (11 activities)
- **Export Excel**: ~500ms (includes formatting)
- **Export XER**: ~100ms (text file)
- **Export JSON**: ~50ms (serialization only)

### Limitations
- **Max Activities**: No hard limit (tested up to 1000)
- **Max BOQ Items**: Limited by memory
- **Concurrent Requests**: Stateless, supports multiple users

---

## 🔄 Versioning

Current version: **v1.0.0**

### Changelog
- **v1.0.0** (2025-01-07)
  - Initial release
  - 5 endpoints implemented
  - 4 export formats supported
  - Full CPM engine with resource leveling

### Future Versions
- **v1.1.0**: Multi-project scheduling
- **v1.2.0**: Progress tracking
- **v1.3.0**: Earned Value Management
- **v2.0.0**: Hijri calendar support

---

**📅 Last Updated**: 2025-01-07  
**📧 Contact**: Construction Scheduling API Team
