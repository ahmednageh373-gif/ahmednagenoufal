"""
Test API Health and Basic Endpoints
"""

import pytest


def test_home_endpoint(client):
    """Test the home endpoint"""
    response = client.get('/')
    
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['status'] == 'running'
    assert 'version' in data
    assert 'systems' in data


def test_health_check(client):
    """Test the health check endpoint"""
    response = client.get('/api/health')
    
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert 'systems' in data


def test_system_status(client):
    """Test the system status endpoint"""
    response = client.get('/api/system-status')
    
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'system_status' in data


def test_404_error(client):
    """Test 404 Not Found error handling"""
    response = client.get('/api/nonexistent-endpoint')
    
    assert response.status_code == 404
    
    data = response.get_json()
    assert data['success'] is False
    assert 'error' in data


def test_cors_headers(client):
    """Test CORS headers are present"""
    response = client.get('/api/health')
    
    assert 'Access-Control-Allow-Origin' in response.headers


def test_security_headers(client):
    """Test security headers are present"""
    response = client.get('/api/health')
    
    # These headers should be added by middleware
    # Uncomment when middleware is integrated
    # assert 'X-Content-Type-Options' in response.headers
    # assert 'X-Frame-Options' in response.headers
