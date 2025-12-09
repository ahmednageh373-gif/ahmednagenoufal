"""
Navisworks Service - Business Logic
"""

from datetime import datetime
from typing import List, Dict, Optional, Any
from pymongo import MongoClient
from bson import ObjectId
import json
import time

from models.navisworks_model import (
    ModelData,
    ElementData,
    NavisworksModel,
    ModelImportResponse,
    ImportStatistics,
    ImportWarning,
    ValidationResult,
    ValidationError,
    COLLECTIONS
)


class NavisworksService:
    """Service for Navisworks Model Operations"""
    
    def __init__(self, mongo_uri: str = "mongodb://localhost:27017/", db_name: str = "noufal"):
        """Initialize service with MongoDB connection"""
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.models_collection = self.db[COLLECTIONS['models']]
        self.elements_collection = self.db[COLLECTIONS['elements']]
        
        # Create indexes
        self._create_indexes()
    
    def _create_indexes(self):
        """Create MongoDB indexes for performance"""
        # Models indexes
        self.models_collection.create_index([("projectId", 1)])
        self.models_collection.create_index([("modelId", 1)], unique=True)
        self.models_collection.create_index([("importedAt", -1)])
        
        # Elements indexes
        self.elements_collection.create_index([("modelId", 1)])
        self.elements_collection.create_index([("projectId", 1)])
        self.elements_collection.create_index([("elementId", 1)])
        self.elements_collection.create_index([("category", 1)])
        self.elements_collection.create_index([("name", "text"), ("path", "text")])
    
    def validate_model_data(self, model_data: Dict[str, Any]) -> ValidationResult:
        """Validate model data before import"""
        result = ValidationResult()
        
        # Check required fields
        if not model_data.get('fileName'):
            result.isValid = False
            result.errors.append(ValidationError(
                field="fileName",
                message="File name is required",
                code="REQUIRED_FIELD"
            ))
        
        if not model_data.get('elements'):
            result.isValid = False
            result.errors.append(ValidationError(
                field="elements",
                message="Model must contain at least one element",
                code="EMPTY_ELEMENTS"
            ))
        
        if not model_data.get('boundingBox'):
            result.isValid = False
            result.errors.append(ValidationError(
                field="boundingBox",
                message="Bounding box is required",
                code="REQUIRED_FIELD"
            ))
        else:
            bbox = model_data['boundingBox']
            if bbox.get('maxX', 0) <= bbox.get('minX', 0):
                result.isValid = False
                result.errors.append(ValidationError(
                    field="boundingBox",
                    message="Invalid bounding box dimensions",
                    code="INVALID_BBOX"
                ))
        
        return result
    
    def import_model(self, project_id: str, model_data: Dict[str, Any]) -> ModelImportResponse:
        """Import Navisworks model data"""
        start_time = time.time()
        
        # Validate
        validation = self.validate_model_data(model_data)
        if not validation.isValid:
            raise ValueError(f"Validation failed: {validation.errors}")
        
        # Generate model ID
        model_id = str(ObjectId())
        
        # Process elements
        elements = model_data.get('elements', [])
        warnings = []
        
        # Calculate statistics
        elements_with_geometry = sum(1 for el in elements if el.get('geometry'))
        elements_with_properties = sum(1 for el in elements if el.get('properties'))
        
        elements_by_category = {}
        for el in elements:
            cat = el.get('category', 'Unknown')
            elements_by_category[cat] = elements_by_category.get(cat, 0) + 1
        
        # Create model document
        model_doc = {
            '_id': ObjectId(model_id),
            'modelId': model_id,
            'projectId': project_id,
            'fileName': model_data['fileName'],
            'modelData': model_data,
            'importedAt': datetime.utcnow(),
            'viewerUrl': f"/projects/{project_id}/navisworks/{model_id}"
        }
        
        # Insert model
        self.models_collection.insert_one(model_doc)
        
        # Insert elements separately for better querying
        if elements:
            element_docs = []
            for el in elements:
                element_docs.append({
                    '_id': ObjectId(),
                    'modelId': model_id,
                    'projectId': project_id,
                    'elementId': el['id'],
                    'name': el.get('name', ''),
                    'category': el.get('category', 'Unknown'),
                    'path': el.get('path', ''),
                    'elementData': el
                })
            
            if element_docs:
                self.elements_collection.insert_many(element_docs)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Calculate data size (approximate)
        data_size = len(json.dumps(model_data).encode('utf-8'))
        
        # Create response
        response = ModelImportResponse(
            modelId=model_id,
            projectId=project_id,
            fileName=model_data['fileName'],
            elementsImported=len(elements),
            fileSizeBytes=data_size,
            importedAt=datetime.utcnow(),
            statistics=ImportStatistics(
                totalElements=len(elements),
                elementsWithGeometry=elements_with_geometry,
                elementsWithProperties=elements_with_properties,
                elementsByCategory=elements_by_category,
                processingTime=processing_time,
                dataSizeBytes=data_size
            ),
            viewerUrl=f"/projects/{project_id}/navisworks/{model_id}",
            warnings=warnings
        )
        
        return response
    
    def get_models_by_project(self, project_id: str, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """Get all models for a project"""
        skip = (page - 1) * page_size
        
        cursor = self.models_collection.find(
            {'projectId': project_id}
        ).sort('importedAt', -1).skip(skip).limit(page_size)
        
        total_count = self.models_collection.count_documents({'projectId': project_id})
        
        models = []
        for doc in cursor:
            models.append({
                'modelId': doc['modelId'],
                'projectId': doc['projectId'],
                'fileName': doc['fileName'],
                'importedAt': doc['importedAt'].isoformat(),
                'viewerUrl': doc.get('viewerUrl'),
                'elementsCount': len(doc.get('modelData', {}).get('elements', []))
            })
        
        return {
            'models': models,
            'totalCount': total_count,
            'page': page,
            'pageSize': page_size,
            'totalPages': (total_count + page_size - 1) // page_size
        }
    
    def get_model_by_id(self, model_id: str) -> Optional[Dict[str, Any]]:
        """Get model by ID"""
        doc = self.models_collection.find_one({'modelId': model_id})
        
        if not doc:
            return None
        
        return {
            'modelId': doc['modelId'],
            'projectId': doc['projectId'],
            'fileName': doc['fileName'],
            'modelData': doc['modelData'],
            'importedAt': doc['importedAt'].isoformat(),
            'viewerUrl': doc.get('viewerUrl')
        }
    
    def get_elements(
        self, 
        model_id: str, 
        category: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 100
    ) -> Dict[str, Any]:
        """Get elements with filtering and pagination"""
        query = {'modelId': model_id}
        
        # Filter by category
        if category:
            query['category'] = category
        
        # Search in name and path
        if search:
            query['$text'] = {'$search': search}
        
        skip = (page - 1) * page_size
        
        cursor = self.elements_collection.find(query).skip(skip).limit(page_size)
        total_count = self.elements_collection.count_documents(query)
        
        elements = []
        for doc in cursor:
            elements.append(doc['elementData'])
        
        return {
            'elements': elements,
            'totalCount': total_count,
            'page': page,
            'pageSize': page_size,
            'totalPages': (total_count + page_size - 1) // page_size
        }
    
    def get_element_by_id(self, model_id: str, element_id: str) -> Optional[Dict[str, Any]]:
        """Get single element by ID"""
        doc = self.elements_collection.find_one({
            'modelId': model_id,
            'elementId': element_id
        })
        
        if not doc:
            return None
        
        return doc['elementData']
    
    def delete_model(self, model_id: str) -> bool:
        """Delete model and all its elements"""
        # Delete elements
        self.elements_collection.delete_many({'modelId': model_id})
        
        # Delete model
        result = self.models_collection.delete_one({'modelId': model_id})
        
        return result.deleted_count > 0
    
    def get_categories(self, model_id: str) -> List[str]:
        """Get unique categories for a model"""
        pipeline = [
            {'$match': {'modelId': model_id}},
            {'$group': {'_id': '$category'}},
            {'$sort': {'_id': 1}}
        ]
        
        result = self.elements_collection.aggregate(pipeline)
        return [doc['_id'] for doc in result if doc['_id']]
    
    def get_model_statistics(self, model_id: str) -> Dict[str, Any]:
        """Get model statistics"""
        model = self.get_model_by_id(model_id)
        if not model:
            return None
        
        stats = model.get('modelData', {}).get('statistics', {})
        
        return {
            'totalElements': stats.get('totalElements', 0),
            'elementsWithGeometry': stats.get('elementsWithGeometry', 0),
            'elementsWithProperties': stats.get('elementsWithProperties', 0),
            'elementsByCategory': stats.get('elementsByCategory', {}),
            'duration': stats.get('duration')
        }
