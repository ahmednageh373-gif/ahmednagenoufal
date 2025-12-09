/**
 * Navisworks Data Types
 * TypeScript definitions for Navisworks model data
 */

export interface BoundingBox {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  width?: number;
  height?: number;
  depth?: number;
}

export interface GeometryData {
  vertices: number[];
  indices: number[];
  normals: number[];
  uvs?: number[];
  transform: number[]; // 4x4 matrix (16 elements)
  triangleCount: number;
  vertexCount: number;
}

export interface ColorData {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface MaterialData {
  name?: string;
  diffuseColor?: ColorData;
  ambientColor?: ColorData;
  specularColor?: ColorData;
  transparency?: number;
  shininess?: number;
  texturePath?: string;
}

export interface PropertyValue {
  displayName: string;
  value: any;
  type: string;
  units?: string;
}

export interface ElementMetadata {
  guid?: string;
  ifcType?: string;
  layer?: string;
  isVisible?: boolean;
  isHidden?: boolean;
  state?: string;
  sourceFile?: string;
  createdDate?: string;
  modifiedDate?: string;
  customFields?: Record<string, string>;
}

export interface ElementData {
  id: string;
  name: string;
  category: string;
  parentId?: string;
  path: string;
  boundingBox?: BoundingBox;
  properties: Record<string, Record<string, PropertyValue>>;
  geometry?: GeometryData;
  material?: MaterialData;
  metadata?: ElementMetadata;
}

export interface ExportStatistics {
  totalElements: number;
  elementsWithGeometry: number;
  elementsWithProperties: number;
  elementsByCategory: Record<string, number>;
  exportStartTime: string;
  exportEndTime: string;
  duration?: string;
}

export interface ModelData {
  fileName: string;
  title: string;
  units: string;
  author?: string;
  lastModified?: string;
  fileSize?: string;
  boundingBox: BoundingBox;
  elements: ElementData[];
  metadata: Record<string, string>;
  statistics: ExportStatistics;
}

export interface NavisworksModel {
  _id?: string;
  modelId: string;
  projectId: string;
  fileName: string;
  modelData: ModelData;
  importedAt: string;
  viewerUrl?: string;
}

export interface ViewerSettings {
  showGrid: boolean;
  showAxes: boolean;
  backgroundColor: string;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  enableShadows: boolean;
  cameraFov: number;
  cameraNear: number;
  cameraFar: number;
  orbitControlsEnabled: boolean;
}

export interface SelectionInfo {
  elementId: string;
  element: ElementData;
  position: [number, number, number];
}

export interface ViewerState {
  isLoading: boolean;
  error: string | null;
  selectedElement: SelectionInfo | null;
  highlightedElements: Set<string>;
  hiddenElements: Set<string>;
  isolatedElements: Set<string>;
  settings: ViewerSettings;
}

export const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  showGrid: true,
  showAxes: true,
  backgroundColor: '#1a1a2e',
  ambientLightIntensity: 0.6,
  directionalLightIntensity: 0.8,
  enableShadows: true,
  cameraFov: 60,
  cameraNear: 0.1,
  cameraFar: 10000,
  orbitControlsEnabled: true,
};
