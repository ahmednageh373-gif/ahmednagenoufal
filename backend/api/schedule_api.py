"""
Schedule Generation API
واجهة برمجية لتوليد الجدول الزمني

Endpoints:
- GET  /api/schedule/boq-codes: قائمة أكواد المقايسة المتاحة
- POST /api/schedule/generate: توليد جدول زمني من كود مقايسة
- POST /api/schedule/export: تصدير جدول زمني
- GET  /api/schedule/summary: ملخص جدول زمني
"""

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
import tempfile
import os
import sys
sys.path.append('/home/user/webapp')

from backend.data.activity_breakdown_rules import (
    ALL_BOQ_BREAKDOWNS, get_breakdown_by_code, list_all_breakdowns
)
from backend.scheduling.cpm_engine import build_schedule_from_boq, CPMEngine
from backend.scheduling.resource_leveling import ResourceLeveler, SiteCapacity
from backend.scheduling.primavera_exporter import PrimaveraExporter


router = APIRouter(prefix="/api/schedule", tags=["schedule"])


# ═══════════════════════════════════════════════════════════════
# Request/Response Models
# ═══════════════════════════════════════════════════════════════

class ScheduleGenerationRequest(BaseModel):
    """طلب توليد جدول زمني"""
    boq_code: str = Field(..., description="كود بند المقايسة")
    project_name: str = Field("مشروع إنشائي", description="اسم المشروع")
    project_start_date: str = Field(..., description="تاريخ البداية (YYYY-MM-DD)")
    shifts: int = Field(1, ge=1, le=3, description="عدد الورديات (1, 2, أو 3)")
    working_days_per_week: int = Field(6, ge=5, le=7, description="أيام العمل في الأسبوع")
    
    # Optional: Site capacity
    max_workers: Optional[int] = Field(None, description="الحد الأقصى للعمال")
    max_beds: Optional[int] = Field(None, description="عدد الأسِرّة")
    max_meals: Optional[int] = Field(None, description="عدد وجبات الطعام")


class ActivitySummary(BaseModel):
    """ملخص نشاط"""
    id: str
    name: str
    duration: float
    early_start: float
    early_finish: float
    late_start: float
    late_finish: float
    total_float: float
    is_critical: bool
    crew_size: int


class ScheduleResponse(BaseModel):
    """استجابة الجدول الزمني"""
    project_name: str
    project_summary: Dict
    activities: List[ActivitySummary]
    critical_path: List[str]
    resource_histogram: Optional[Dict] = None


class ExportRequest(BaseModel):
    """طلب التصدير"""
    boq_code: str
    project_name: str
    project_start_date: str
    shifts: int = 1
    working_days_per_week: int = 6
    export_format: str = Field("excel", description="excel, xer, json, txt")


# ═══════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════

def parse_date(date_str: str) -> datetime:
    """تحليل تاريخ من string"""
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {date_str}. Use YYYY-MM-DD")


def build_cpm_from_request(req: ScheduleGenerationRequest) -> CPMEngine:
    """بناء CPM من طلب"""
    # Get BOQ breakdown
    breakdown = get_breakdown_by_code(req.boq_code)
    if not breakdown:
        raise HTTPException(status_code=404, detail=f"BOQ code not found: {req.boq_code}")
    
    # Parse date
    start_date = parse_date(req.project_start_date)
    
    # Build schedule
    cpm = build_schedule_from_boq(
        boq_breakdown=breakdown,
        project_start_date=start_date,
        shifts=req.shifts
    )
    
    # Update working days per week
    cpm.working_days_per_week = req.working_days_per_week
    cpm.calculate_calendar_dates()
    
    return cpm


# ═══════════════════════════════════════════════════════════════
# API Endpoints
# ═══════════════════════════════════════════════════════════════

@router.get('/boq-codes')
async def get_boq_codes():
    """
    الحصول على قائمة أكواد المقايسة المتاحة
    
    Returns:
        {
            "codes": ["CONC-SLAB-001", "PLAST-001", ...],
            "total": 4,
            "details": [...]
        }
    """
    codes = list_all_breakdowns()
    
    details = []
    for code in codes:
        breakdown = get_breakdown_by_code(code)
        if breakdown:
            details.append({
                'code': code,
                'description': breakdown.boq_description,
                'category': breakdown.category,
                'quantity': breakdown.total_quantity,
                'unit': breakdown.unit,
                'sub_activities_count': len(breakdown.sub_activities)
            })
    
    return {
        'codes': codes,
        'total': len(codes),
        'details': details
    }


@router.post('/generate', response_model=ScheduleResponse)
async def generate_schedule(req: ScheduleGenerationRequest):
    """
    توليد جدول زمني من كود مقايسة
    
    Args:
        req: طلب التوليد
    
    Returns:
        ScheduleResponse مع تفاصيل الجدول الزمني
    """
    # Build CPM
    cpm = build_cpm_from_request(req)
    
    # Create response
    activities_summary = []
    for activity_id, activity in cpm.activities.items():
        activities_summary.append(ActivitySummary(
            id=activity.activity_id,
            name=activity.name,
            duration=activity.duration,
            early_start=activity.early_start,
            early_finish=activity.early_finish,
            late_start=activity.late_start,
            late_finish=activity.late_finish,
            total_float=activity.total_float,
            is_critical=activity.is_critical,
            crew_size=activity.crew_size
        ))
    
    # Resource leveling (if capacity provided)
    resource_histogram_data = None
    if req.max_workers:
        site_capacity = SiteCapacity(
            max_workers=req.max_workers,
            max_beds=req.max_beds or req.max_workers,
            max_meals=req.max_meals or req.max_workers * 3,
            max_buses=max((req.max_workers // 50) + 1, 2),
            workspace_area_m2=5000.0
        )
        
        leveler = ResourceLeveler(cpm, site_capacity)
        histogram = leveler.analyze_original()
        
        resource_histogram_data = histogram.get_summary()
    
    return ScheduleResponse(
        project_name=req.project_name,
        project_summary=cpm.get_summary(),
        activities=activities_summary,
        critical_path=cpm.critical_path,
        resource_histogram=resource_histogram_data
    )


@router.post('/export')
async def export_schedule(req: ExportRequest):
    """
    تصدير جدول زمني إلى ملف
    
    Args:
        req: طلب التصدير
    
    Returns:
        ملف التصدير
    """
    # Build CPM
    cpm_req = ScheduleGenerationRequest(
        boq_code=req.boq_code,
        project_name=req.project_name,
        project_start_date=req.project_start_date,
        shifts=req.shifts,
        working_days_per_week=req.working_days_per_week
    )
    
    cpm = build_cpm_from_request(cpm_req)
    
    # Create exporter
    exporter = PrimaveraExporter(cpm, project_name=req.project_name)
    
    # Export to temporary file
    with tempfile.NamedTemporaryFile(mode='w+b', delete=False, suffix=f'.{req.export_format}') as tmp_file:
        tmp_path = tmp_file.name
    
    try:
        if req.export_format == 'excel':
            exporter.export_excel(tmp_path)
            media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = f"{req.project_name}_schedule.xlsx"
        elif req.export_format == 'xer':
            exporter.export_xer(tmp_path)
            media_type = 'text/plain'
            filename = f"{req.project_name}_schedule.xer"
        elif req.export_format == 'json':
            exporter.export_json(tmp_path)
            media_type = 'application/json'
            filename = f"{req.project_name}_schedule.json"
        elif req.export_format == 'txt':
            exporter.export_text_report(tmp_path)
            media_type = 'text/plain'
            filename = f"{req.project_name}_schedule.txt"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {req.export_format}")
        
        # Read file content
        with open(tmp_path, 'rb') as f:
            content = f.read()
        
        # Clean up
        os.unlink(tmp_path)
        
        # Return file
        return Response(
            content=content,
            media_type=media_type,
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/summary/{boq_code}')
async def get_quick_summary(boq_code: str):
    """
    الحصول على ملخص سريع لبند مقايسة
    
    Args:
        boq_code: كود البند
    
    Returns:
        معلومات أساسية عن البند والأنشطة الفرعية
    """
    breakdown = get_breakdown_by_code(boq_code)
    if not breakdown:
        raise HTTPException(status_code=404, detail=f"BOQ code not found: {boq_code}")
    
    sub_activities_info = []
    for sub in breakdown.sub_activities:
        sub_activities_info.append({
            'code': sub.code,
            'name_ar': sub.name_ar,
            'name_en': sub.name_en,
            'unit': sub.unit,
            'activity_type': sub.activity_type.value,
            'risk_buffer': sub.get_risk_buffer(),
            'crew': {
                'description': sub.productivity.crew.description,
                'total_workers': sub.productivity.crew.total_workers,
                'equipment': sub.productivity.crew.equipment
            }
        })
    
    return {
        'boq_code': boq_code,
        'description': breakdown.boq_description,
        'category': breakdown.category,
        'total_quantity': breakdown.total_quantity,
        'unit': breakdown.unit,
        'sub_activities_count': len(breakdown.sub_activities),
        'sub_activities': sub_activities_info
    }


@router.get('/health')
async def health_check():
    """فحص صحة الخدمة"""
    return {
        'status': 'healthy',
        'service': 'Schedule Generation API',
        'version': '1.0.0',
        'available_boq_codes': len(list_all_breakdowns())
    }


# ═══════════════════════════════════════════════════════════════
# Test the API locally
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import asyncio
    
    print("=" * 100)
    print("🏗️  اختبار API - Testing API")
    print("=" * 100)
    
    # Test 1: Get BOQ codes
    async def test_get_codes():
        result = await get_boq_codes()
        print(f"\n✅ Available BOQ Codes: {result['total']}")
        for detail in result['details']:
            print(f"   • {detail['code']}: {detail['description']} ({detail['sub_activities_count']} activities)")
    
    asyncio.run(test_get_codes())
    
    # Test 2: Generate schedule
    async def test_generate():
        req = ScheduleGenerationRequest(
            boq_code="CONC-SLAB-001",
            project_name="خرسانة بلاطة 100 م³",
            project_start_date="2025-01-01",
            shifts=1,
            max_workers=50
        )
        
        result = await generate_schedule(req)
        print(f"\n✅ Schedule Generated:")
        print(f"   Project: {result.project_name}")
        print(f"   Duration: {result.project_summary['project_duration_days']:.1f} days")
        print(f"   Critical Activities: {len(result.critical_path)}/{len(result.activities)}")
        if result.resource_histogram:
            print(f"   Peak Workers: {result.resource_histogram['peak_workers']}")
            print(f"   Average Workers: {result.resource_histogram['average_workers']:.1f}")
    
    asyncio.run(test_generate())
    
    print("\n" + "=" * 100)
