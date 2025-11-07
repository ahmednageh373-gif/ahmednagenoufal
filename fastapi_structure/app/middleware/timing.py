"""
Timing Middleware for FastAPI
Measures request processing time and adds header
"""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class TimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to measure request processing time
    
    Adds X-Response-Time header with the time in milliseconds
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and measure time
        """
        start_time = time.time()

        # Process request
        response = await call_next(request)

        # Calculate duration
        process_time = time.time() - start_time
        process_time_ms = round(process_time * 1000, 2)

        # Add header
        response.headers["X-Response-Time"] = f"{process_time_ms}ms"

        # Store in request state for logging
        request.state.process_time = process_time

        return response
