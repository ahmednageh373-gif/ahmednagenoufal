"""
Navisworks Models - Pydantic Models for API
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """3D Bounding Box"""
    minX: float
    minY: float
    minZ: float
    maxX: float
    maxY: float
    maxZ: float


class GeometryData(BaseModel):
    """Element Geometry Data"""
    vertices: List[float]
    indices: List[int]
    normals: List[float]
    uvs: Optional[List[float]] = None
    transform: List[float]  # 4x4 matrix
    triangleCount: int
    vertexCount: int


class ColorData(BaseModel):
    """RGBA Color"""
    r: float
    g: float
    b: float
    a: float = 1.0


class MaterialData(BaseModel):
    """Material Data"""
    name: Optional[str] = None
    diffuseColor: Optional[ColorData] = None
    transparency: float = 0.0
    shininess: float = 0.5


class PropertyValue(BaseModel):
    """Property Value"""
    displayName: str
    value: Any
    type: str = "String"
    units: Optional[str] = None


class ElementMetadata(BaseModel):
    """Element Metadata"""
    guid: Optional[str] = None
    ifcType: Optional[str] = None
    layer: Optional[str] = None
    isVisible: bool = True
    isHidden: bool = False


class ElementData(BaseModel):
    """Element Data"""
    id: str
    name: str
    category: str
    path: str
    boundingBox: Optional[BoundingBox] = None
    properties: Dict[str, Dict[str, PropertyValue]]
    geometry: Optional[GeometryData] = None
    material: Optional[MaterialData] = None
    metadata: Optional[ElementMetadata] = None


class ExportStatistics(BaseModel):
    """Export Statistics"""
    totalElements: int
    elementsWithGeometry: int
    elementsWithProperties: int
    elementsByCategory: Dict[str, int]
    exportStartTime: str
    exportEndTime: str


class ModelData(BaseModel):
    """Model Data"""
    fileName: str
    title: str
    units: str
    author: Optional[str] = None
    boundingBox: BoundingBox
    elements: List[ElementData]
    metadata: Dict[str, str]
    statistics: ExportStatistics


class NavisworksImportRequest(BaseModel):
    """Import Request"""
    projectId: str
    modelData: ModelData
