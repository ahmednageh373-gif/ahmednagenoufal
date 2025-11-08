"""
Logging Middleware for FastAPI
Logs all incoming requests and outgoing responses
"""

import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import logger, log_api_request


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all API requests and responses
    
    Adds X-Request-ID header for request tracing
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Log request and response
        """
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Log incoming request
        logger.info(
            "Incoming request",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
        )

        # Process request
        response = await call_next(request)

        # Add request ID to response
        response.headers["X-Request-ID"] = request_id

        # Get process time from timing middleware
        process_time = getattr(request.state, "process_time", 0.0)

        # Log response
        log_api_request(
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration=process_time,
            request_id=request_id,
            client=request.client.host if request.client else "unknown",
        )

        return response
