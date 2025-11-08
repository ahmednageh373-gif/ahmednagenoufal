"""
Pytest Configuration and Fixtures
Common test fixtures for all tests
"""

import pytest
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import app as flask_app
from config import TestingConfig


@pytest.fixture
def app():
    """Create and configure a Flask app instance for testing"""
    flask_app.config.from_object(TestingConfig)
    TestingConfig.init_app(flask_app)
    
    yield flask_app


@pytest.fixture
def client(app):
    """Create a test client for the Flask app"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create a test CLI runner for the Flask app"""
    return app.test_cli_runner()


@pytest.fixture
def sample_boq_items():
    """Sample BOQ items for testing"""
    return [
        {
            'description': 'حفر وردم للأساسات',
            'quantity': 100,
            'unit': 'م3',
            'rate': 50,
            'amount': 5000
        },
        {
            'description': 'خرسانة مسلحة للأعمدة',
            'quantity': 50,
            'unit': 'م3',
            'rate': 800,
            'amount': 40000
        },
        {
            'description': 'أعمال البياض الداخلي',
            'quantity': 500,
            'unit': 'م2',
            'rate': 45,
            'amount': 22500
        }
    ]


@pytest.fixture
def auth_headers():
    """Sample authentication headers"""
    return {
        'X-API-Key': 'test-api-key-12345',
        'Content-Type': 'application/json'
    }
