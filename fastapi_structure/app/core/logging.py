"""
Structured Logging for FastAPI
Uses structlog for structured, contextual logging
"""

import logging
import sys
from pathlib import Path
from typing import Any, Dict

import structlog
from structlog.stdlib import BoundLogger

from app.core.config import settings


def setup_logging() -> BoundLogger:
    """
    Setup structured logging with structlog
    """

    # Configure stdlib logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper()),
    )

    # Processors for structlog
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # JSON or console format
    if settings.LOG_FORMAT == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))

    # Configure structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Get logger
    logger: BoundLogger = structlog.get_logger("noufal")

    return logger


# Create logger instance
logger = setup_logging()


# Context manager for logging context
class LogContext:
    """
    Context manager for adding context to logs
    
    Usage:
        with LogContext(user_id="123", request_id="abc"):
            logger.info("Processing request")
    """

    def __init__(self, **kwargs):
        self.context = kwargs

    def __enter__(self):
        for key, value in self.context.items():
            structlog.contextvars.bind_contextvars(**{key: value})
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        for key in self.context.keys():
            structlog.contextvars.unbind_contextvars(key)


# Helper functions
def log_function_call(func_name: str, **kwargs):
    """Log function call with parameters"""
    logger.debug(
        "Function called",
        function=func_name,
        **kwargs,
    )


def log_api_request(
    method: str,
    path: str,
    status_code: int,
    duration: float,
    **extra: Any,
):
    """Log API request"""
    logger.info(
        "API request",
        method=method,
        path=path,
        status_code=status_code,
        duration_ms=round(duration * 1000, 2),
        **extra,
    )


def log_error(
    error: Exception,
    context: Dict[str, Any] = None,
    **extra: Any,
):
    """Log error with context"""
    logger.error(
        "Error occurred",
        error_type=type(error).__name__,
        error_message=str(error),
        context=context or {},
        **extra,
        exc_info=True,
    )
