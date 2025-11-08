"""
Test BOQ Analysis Endpoints
"""

import pytest


def test_classify_items_empty(client):
    """Test classify endpoint with empty items"""
    response = client.post(
        '/api/classify',
        json={'items': []}
    )
    
    assert response.status_code == 400
    
    data = response.get_json()
    assert 'error' in data


def test_classify_items_success(client, sample_boq_items):
    """Test successful BOQ items classification"""
    response = client.post(
        '/api/classify',
        json={'items': [item['description'] for item in sample_boq_items]}
    )
    
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'results' in data
    assert 'statistics' in data
    assert len(data['results']) == len(sample_boq_items)


def test_analyze_boq_empty(client):
    """Test BOQ analysis with empty items"""
    response = client.post(
        '/api/analyze-boq',
        json={'items': []}
    )
    
    assert response.status_code == 400


def test_analyze_boq_success(client, sample_boq_items):
    """Test successful BOQ analysis"""
    response = client.post(
        '/api/analyze-boq',
        json={'items': sample_boq_items}
    )
    
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'analyzed_items' in data
    assert len(data['analyzed_items']) == len(sample_boq_items)


def test_calculate_duration(client):
    """Test duration calculation"""
    response = client.post(
        '/api/calculate-duration',
        json={
            'activity_type': 'بناء طابوق',
            'quantity': 100,
            'unit': 'م2',
            'category': 'بناء'
        }
    )
    
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'result' in data


def test_calculate_duration_invalid(client):
    """Test duration calculation with invalid data"""
    response = client.post(
        '/api/calculate-duration',
        json={
            'activity_type': '',
            'quantity': 0,
            'unit': 'م2'
        }
    )
    
    assert response.status_code == 400
