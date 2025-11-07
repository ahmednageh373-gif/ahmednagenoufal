"""
Analysis & Generation Endpoints
Enhanced with proper validation, streaming, and error handling
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
import asyncio

from app.core.config import settings
from app.core.logging import logger, log_error

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# =====================================
# Request/Response Models
# =====================================


class GenerateRequest(BaseModel):
    """Request model for AI generation"""

    prompt: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Generation prompt",
        examples=["Generate a BOQ for a 3-story residential building"],
    )
    model: str = Field(
        default="gpt-4",
        description="AI model to use",
        examples=["gpt-4", "gpt-3.5-turbo", "claude-3"],
    )
    max_tokens: int = Field(default=2000, ge=100, le=4000, description="Max tokens")
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Generation temperature"
    )
    stream: bool = Field(default=False, description="Enable streaming response")

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        """Validate and clean prompt"""
        v = v.strip()
        if not v:
            raise ValueError("Prompt cannot be empty")

        # Basic content filtering
        forbidden_words = ["hack", "exploit", "inject"]  # Add more as needed
        if any(word in v.lower() for word in forbidden_words):
            raise ValueError("Prompt contains forbidden content")

        return v


class GenerateResponse(BaseModel):
    """Response model for generation"""

    success: bool
    generated_text: str
    model_used: str
    tokens_used: int
    processing_time_ms: float
    request_id: Optional[str] = None


class AnalysisRequest(BaseModel):
    """Request for document analysis"""

    text: str = Field(
        ..., min_length=50, max_length=50000, description="Text to analyze"
    )
    analysis_type: str = Field(
        default="boq",
        description="Type of analysis",
        examples=["boq", "schedule", "budget"],
    )
    language: str = Field(
        default="ar", pattern="^(ar|en)$", description="Document language"
    )


class AnalysisResponse(BaseModel):
    """Response for document analysis"""

    success: bool
    analysis_type: str
    extracted_items: List[dict]
    summary: dict
    confidence: float = Field(ge=0, le=1)
    request_id: Optional[str] = None


# =====================================
# Endpoints
# =====================================


@router.post(
    "/generate",
    response_model=GenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Content with AI",
    description="Generate BOQ, schedules, or other construction documents using AI",
    responses={
        200: {"description": "Content generated successfully"},
        400: {"description": "Invalid input"},
        429: {"description": "Rate limit exceeded"},
        500: {"description": "Generation failed"},
    },
)
@limiter.limit(f"{settings.RATE_LIMIT_DEFAULT}")
async def generate_content(
    request: Request,
    generate_request: GenerateRequest,
    background_tasks: BackgroundTasks,
) -> GenerateResponse:
    """
    Generate construction-related content using AI
    
    This endpoint can generate:
    - Bill of Quantities (BOQ)
    - Project schedules
    - Cost estimates
    - Technical specifications
    
    Args:
        request: FastAPI request
        generate_request: Generation parameters
        background_tasks: For async logging/cleanup
    
    Returns:
        Generated content with metadata
    
    Raises:
        HTTPException: If generation fails
    """
    request_id = getattr(request.state, "request_id", "unknown")
    start_time = asyncio.get_event_loop().time()

    try:
        logger.info(
            "Generation requested",
            request_id=request_id,
            model=generate_request.model,
            prompt_length=len(generate_request.prompt),
            stream=generate_request.stream,
        )

        # TODO: Implement actual AI generation
        # Replace with your Novita/OpenAI/Claude integration
        
        # Simulate generation
        await asyncio.sleep(0.5)  # Simulate API call
        
        generated_text = f"""
# Generated BOQ (Sample)

Based on your prompt: "{generate_request.prompt[:100]}..."

## Items:
1. Excavation and backfill - 100 m3
2. Concrete foundations - 50 m3
3. Steel reinforcement - 5 tons
4. Masonry walls - 200 m2
5. Plastering - 400 m2

## Total Estimated Cost: SAR 150,000
        """.strip()

        # Calculate processing time
        processing_time = (asyncio.get_event_loop().time() - start_time) * 1000

        # Log to background
        background_tasks.add_task(
            log_generation_metrics,
            request_id=request_id,
            model=generate_request.model,
            tokens=len(generated_text.split()),
            time_ms=processing_time,
        )

        logger.info(
            "Generation completed",
            request_id=request_id,
            tokens=len(generated_text.split()),
            time_ms=processing_time,
        )

        return GenerateResponse(
            success=True,
            generated_text=generated_text,
            model_used=generate_request.model,
            tokens_used=len(generated_text.split()),
            processing_time_ms=processing_time,
            request_id=request_id,
        )

    except ValueError as e:
        logger.warning("Invalid generation request", request_id=request_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": "Invalid Request",
                "message": str(e),
                "request_id": request_id,
            },
        )

    except Exception as e:
        log_error(e, context={"request_id": request_id, "endpoint": "generate"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "Generation Failed",
                "message": "An error occurred during content generation",
                "request_id": request_id,
            },
        )


@router.post(
    "/generate/stream",
    summary="Stream Generated Content",
    description="Generate content with streaming response",
)
@limiter.limit(f"{settings.RATE_LIMIT_DEFAULT}")
async def generate_content_stream(
    request: Request, generate_request: GenerateRequest
):
    """
    Generate content with streaming response
    
    Returns:
        StreamingResponse with generated content
    """
    request_id = getattr(request.state, "request_id", "unknown")

    async def generate_stream():
        """Generator function for streaming"""
        try:
            # TODO: Implement actual streaming from AI service
            
            # Simulate streaming
            chunks = [
                "# Generated ",
                "BOQ\n\n",
                "## Items:\n",
                "1. Excavation - 100 m3\n",
                "2. Concrete - 50 m3\n",
                "3. Steel - 5 tons\n",
            ]

            for chunk in chunks:
                await asyncio.sleep(0.1)  # Simulate delay
                yield f"data: {chunk}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            log_error(e, context={"request_id": request_id})
            yield f"data: ERROR: {str(e)}\n\n"

    logger.info("Streaming generation requested", request_id=request_id)

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "X-Request-ID": request_id,
        },
    )


@router.post(
    "/analyze-document",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Construction Document",
    description="Extract structured data from construction documents",
)
@limiter.limit(f"{settings.RATE_LIMIT_DEFAULT}")
async def analyze_document(
    request: Request, analysis_request: AnalysisRequest
) -> AnalysisResponse:
    """
    Analyze construction documents and extract structured data
    
    Supports:
    - BOQ extraction
    - Schedule extraction
    - Budget analysis
    
    Args:
        request: FastAPI request
        analysis_request: Document and analysis parameters
    
    Returns:
        Structured analysis results
    """
    request_id = getattr(request.state, "request_id", "unknown")

    try:
        logger.info(
            "Document analysis requested",
            request_id=request_id,
            analysis_type=analysis_request.analysis_type,
            text_length=len(analysis_request.text),
        )

        # TODO: Implement actual document analysis
        # This could use NLP, regex, or AI models
        
        extracted_items = [
            {
                "description": "حفر وردم",
                "quantity": 100.0,
                "unit": "م3",
                "rate": 50.0,
            },
            {
                "description": "خرسانة مسلحة",
                "quantity": 50.0,
                "unit": "م3",
                "rate": 800.0,
            },
        ]

        summary = {
            "total_items": len(extracted_items),
            "total_quantity": sum(item["quantity"] for item in extracted_items),
            "estimated_cost": sum(
                item["quantity"] * item["rate"] for item in extracted_items
            ),
        }

        logger.info(
            "Document analysis completed",
            request_id=request_id,
            items_extracted=len(extracted_items),
        )

        return AnalysisResponse(
            success=True,
            analysis_type=analysis_request.analysis_type,
            extracted_items=extracted_items,
            summary=summary,
            confidence=0.85,
            request_id=request_id,
        )

    except Exception as e:
        log_error(e, context={"request_id": request_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "Analysis Failed",
                "message": str(e),
                "request_id": request_id,
            },
        )


# =====================================
# Helper Functions
# =====================================


async def log_generation_metrics(
    request_id: str, model: str, tokens: int, time_ms: float
):
    """Log generation metrics in background"""
    logger.info(
        "Generation metrics",
        request_id=request_id,
        model=model,
        tokens=tokens,
        time_ms=time_ms,
    )
    # TODO: Store in database or monitoring system
