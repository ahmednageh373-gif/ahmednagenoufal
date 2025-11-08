"""
BOQ (Bill of Quantities) Endpoints
Enhanced with proper validation, error handling, and documentation
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Request, Depends
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.logging import logger, log_error

router = APIRouter()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


# =====================================
# Request/Response Models
# =====================================


class BOQItemInput(BaseModel):
    """BOQ Item input model with validation"""

    description: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Item description in Arabic or English",
        examples=["حفر وردم للأساسات", "Excavation and backfill"],
    )
    quantity: float = Field(
        ..., gt=0, description="Item quantity (must be positive)", examples=[100.5]
    )
    unit: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Unit of measurement",
        examples=["م3", "m3", "م2", "ton"],
    )
    rate: Optional[float] = Field(
        None, ge=0, description="Unit rate (optional)", examples=[50.0]
    )

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        """Clean and validate description"""
        v = v.strip()
        if not v:
            raise ValueError("Description cannot be empty or whitespace only")
        return v

    @field_validator("unit")
    @classmethod
    def validate_unit(cls, v: str) -> str:
        """Clean and validate unit"""
        return v.strip()


class BOQAnalysisRequest(BaseModel):
    """Request model for BOQ analysis"""

    items: List[BOQItemInput] = Field(
        ..., min_length=1, max_length=1000, description="List of BOQ items to analyze"
    )
    include_classification: bool = Field(
        default=True, description="Include item classification"
    )
    include_duration: bool = Field(
        default=True, description="Calculate activity duration"
    )
    include_sbc_compliance: bool = Field(
        default=False, description="Check SBC 2024 compliance"
    )

    @field_validator("items")
    @classmethod
    def validate_items_not_empty(cls, v: List[BOQItemInput]) -> List[BOQItemInput]:
        """Ensure items list is not empty"""
        if not v:
            raise ValueError("Items list cannot be empty")
        return v


class ClassificationResult(BaseModel):
    """Classification result model"""

    tier1_category: str
    tier2_subcategory: str
    confidence: float = Field(ge=0, le=1)
    keywords_matched: List[str]


class DurationResult(BaseModel):
    """Duration calculation result"""

    duration_days: float
    crew_size: int
    productivity_rate: float
    unit: str


class BOQItemResult(BaseModel):
    """Single BOQ item analysis result"""

    item_number: int
    original_description: str
    classification: Optional[ClassificationResult] = None
    duration: Optional[DurationResult] = None
    sbc_compliant: Optional[bool] = None
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)


class BOQAnalysisResponse(BaseModel):
    """Response model for BOQ analysis"""

    success: bool
    message: str
    total_items: int
    analyzed_items: List[BOQItemResult]
    summary: dict
    request_id: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response"""

    success: bool = False
    error: str
    message: str
    details: Optional[dict] = None
    request_id: Optional[str] = None


# =====================================
# Endpoints
# =====================================


@router.post(
    "/analyze",
    response_model=BOQAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze BOQ Items",
    description="Analyze Bill of Quantities items with classification, duration calculation, and SBC compliance check",
    responses={
        200: {"description": "Successful analysis"},
        400: {"model": ErrorResponse, "description": "Invalid input"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
@limiter.limit(f"{settings.RATE_LIMIT_DEFAULT}")
async def analyze_boq(
    request: Request, boq_request: BOQAnalysisRequest
) -> BOQAnalysisResponse:
    """
    Analyze BOQ items comprehensively
    
    This endpoint performs:
    - Item classification by category
    - Duration calculation based on productivity rates
    - SBC 2024 compliance checking (optional)
    - Warning and error detection
    
    Args:
        request: FastAPI request object (for rate limiting)
        boq_request: BOQ analysis request with items
    
    Returns:
        Detailed analysis results for all items
    
    Raises:
        HTTPException: If analysis fails
    """
    request_id = getattr(request.state, "request_id", "unknown")

    try:
        logger.info(
            "BOQ analysis requested",
            request_id=request_id,
            items_count=len(boq_request.items),
            include_classification=boq_request.include_classification,
            include_duration=boq_request.include_duration,
            include_sbc=boq_request.include_sbc_compliance,
        )

        # TODO: Implement actual analysis logic
        # This is a placeholder - replace with your actual service calls
        analyzed_items = []

        for idx, item in enumerate(boq_request.items, start=1):
            # Simulate classification
            classification = None
            if boq_request.include_classification:
                classification = ClassificationResult(
                    tier1_category="خرسانة مسلحة",
                    tier2_subcategory="أعمدة",
                    confidence=0.95,
                    keywords_matched=["خرسانة", "أعمدة"],
                )

            # Simulate duration calculation
            duration = None
            if boq_request.include_duration:
                duration = DurationResult(
                    duration_days=5.0,
                    crew_size=4,
                    productivity_rate=20.0,
                    unit=item.unit,
                )

            # Simulate SBC compliance
            sbc_compliant = None
            if boq_request.include_sbc_compliance:
                sbc_compliant = True

            analyzed_items.append(
                BOQItemResult(
                    item_number=idx,
                    original_description=item.description,
                    classification=classification,
                    duration=duration,
                    sbc_compliant=sbc_compliant,
                    warnings=[],
                    errors=[],
                )
            )

        # Calculate summary
        summary = {
            "total_items": len(boq_request.items),
            "successfully_analyzed": len(analyzed_items),
            "total_duration_days": sum(
                item.duration.duration_days
                for item in analyzed_items
                if item.duration
            ),
            "categories_distribution": {},
        }

        logger.info(
            "BOQ analysis completed",
            request_id=request_id,
            items_analyzed=len(analyzed_items),
        )

        return BOQAnalysisResponse(
            success=True,
            message="BOQ analysis completed successfully",
            total_items=len(boq_request.items),
            analyzed_items=analyzed_items,
            summary=summary,
            request_id=request_id,
        )

    except ValueError as e:
        logger.warning("Invalid BOQ data", request_id=request_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": "Invalid Data",
                "message": str(e),
                "request_id": request_id,
            },
        )

    except Exception as e:
        log_error(e, context={"request_id": request_id, "endpoint": "analyze_boq"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "Internal Server Error",
                "message": "An error occurred while analyzing BOQ items",
                "request_id": request_id,
            },
        )


@router.post(
    "/classify",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Classify BOQ Items",
    description="Classify items by category without full analysis",
)
@limiter.limit(f"{settings.RATE_LIMIT_DEFAULT}")
async def classify_items(
    request: Request, items: List[str] = Field(..., min_length=1, max_length=100)
) -> dict:
    """
    Quick classification of items
    
    Args:
        request: FastAPI request
        items: List of item descriptions
    
    Returns:
        Classification results
    """
    request_id = getattr(request.state, "request_id", "unknown")

    try:
        logger.info(
            "Classification requested", request_id=request_id, items_count=len(items)
        )

        # TODO: Implement classification logic
        results = []
        for item in items:
            results.append(
                {
                    "description": item,
                    "category": "خرسانة مسلحة",
                    "subcategory": "أعمدة",
                    "confidence": 0.85,
                }
            )

        return {
            "success": True,
            "total": len(items),
            "results": results,
            "request_id": request_id,
        }

    except Exception as e:
        log_error(e, context={"request_id": request_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "error": str(e), "request_id": request_id},
        )


@router.get(
    "/categories",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get Available Categories",
    description="Get list of all available BOQ categories",
)
async def get_categories() -> dict:
    """
    Get all available BOQ categories
    
    Returns:
        Dictionary of categories and subcategories
    """
    # TODO: Get from database or config
    categories = {
        "أعمال تمهيدية": ["حفر", "ردم", "نقل"],
        "أساسات": ["قواعد", "ميدات", "خوازيق"],
        "خرسانة مسلحة": ["أعمدة", "كمرات", "بلاطات"],
        "بناء": ["طابوق", "بلوك", "حجر"],
        "تشطيبات": ["بياض", "دهانات", "أرضيات"],
    }

    return {"success": True, "categories": categories, "total": len(categories)}
