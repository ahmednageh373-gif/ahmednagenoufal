/**
 * yQArch Architectural Layers
 * Based on yQArch library standard layers
 */

export interface YQArchLayer {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  color: number; // AutoCAD color index (1-255)
  lineType: string;
  lineWeight: number;
  visibility: 'visible' | 'hidden';
  description?: string;
  category: string;
}

export const yqarchLayers: YQArchLayer[] = [
  // Default layers
  {
    id: 'layer-0',
    name: '0',
    nameAr: 'الطبقة الافتراضية',
    nameEn: 'Default Layer',
    color: 7,
    lineType: 'Continuous',
    lineWeight: 0.25,
    visibility: 'visible',
    category: 'default'
  },
  
  // Structural layers
  {
    id: 'layer-column',
    name: 'COLUMN',
    nameAr: 'أعمدة',
    nameEn: 'Columns',
    color: 7,
    lineType: 'Continuous',
    lineWeight: 0.3,
    visibility: 'visible',
    description: 'Structural columns',
    category: 'structural'
  },
  {
    id: 'layer-col-fill',
    name: 'COL_FILL',
    nameAr: 'تعبئة الأعمدة',
    nameEn: 'Column Fill',
    color: 8,
    lineType: 'Continuous',
    lineWeight: 0.2,
    visibility: 'visible',
    category: 'structural'
  },
  {
    id: 'layer-wall',
    name: 'WALL',
    nameAr: 'حوائط',
    nameEn: 'Walls',
    color: 1,
    lineType: 'Continuous',
    lineWeight: 0.3,
    visibility: 'visible',
    category: 'structural'
  },
  {
    id: 'layer-beam',
    name: 'BEAM',
    nameAr: 'كمرات',
    nameEn: 'Beams',
    color: 5,
    lineType: 'Continuous',
    lineWeight: 0.3,
    visibility: 'visible',
    category: 'structural'
  },
  
  // Furniture layers
  {
    id: 'layer-furniture',
    name: 'FURNITURE',
    nameAr: 'أثاث',
    nameEn: 'Furniture',
    color: 53,
    lineType: 'Continuous',
    lineWeight: 0.2,
    visibility: 'visible',
    description: 'Furniture and equipment',
    category: 'furniture'
  },
  
  // Plumbing layers
  {
    id: 'layer-sanitary',
    name: 'SANITARY',
    nameAr: 'أدوات صحية',
    nameEn: 'Sanitary Fixtures',
    color: 151,
    lineType: 'Continuous',
    lineWeight: 0.2,
    visibility: 'visible',
    category: 'plumbing'
  },
  {
    id: 'layer-plumbing',
    name: 'PLUMBING',
    nameAr: 'سباكة',
    nameEn: 'Plumbing',
    color: 4,
    lineType: 'Continuous',
    lineWeight: 0.2,
    visibility: 'visible',
    category: 'plumbing'
  },
  
  // Circulation layers
  {
    id: 'layer-stair',
    name: 'STAIR',
    nameAr: 'سلالم',
    nameEn: 'Stairs',
    color: 2,
    lineType: 'Continuous',
    lineWeight: 0.25,
    visibility: 'visible',
    category: 'circulation'
  },
  {
    id: 'layer-door',
    name: 'DOOR',
    nameAr: 'أبواب',
    nameEn: 'Doors',
    color: 3,
    lineType: 'Continuous',
    lineWeight: 0.2,
    visibility: 'visible',
    category: 'openings'
  },
  {
    id: 'layer-window',
    name: 'WINDOW',
    nameAr: 'نوافذ',
    nameEn: 'Windows',
    color: 6,
    lineType: 'Continuous',
    lineWeight: 0.2,
    visibility: 'visible',
    category: 'openings'
  },
  
  // Annotation layers
  {
    id: 'layer-dimensions',
    name: 'DIMENSIONS',
    nameAr: 'أبعاد',
    nameEn: 'Dimensions',
    color: 2,
    lineType: 'Continuous',
    lineWeight: 0.15,
    visibility: 'visible',
    category: 'annotation'
  },
  {
    id: 'layer-text',
    name: 'TEXT',
    nameAr: 'نصوص',
    nameEn: 'Text',
    color: 7,
    lineType: 'Continuous',
    lineWeight: 0.1,
    visibility: 'visible',
    category: 'annotation'
  },
  {
    id: 'layer-notes',
    name: 'NOTES',
    nameAr: 'ملاحظات',
    nameEn: 'Notes',
    color: 9,
    lineType: 'Continuous',
    lineWeight: 0.1,
    visibility: 'visible',
    category: 'annotation'
  },
  
  // Grid and reference layers
  {
    id: 'layer-grid',
    name: 'GRID',
    nameAr: 'شبكة',
    nameEn: 'Grid',
    color: 8,
    lineType: 'CENTER',
    lineWeight: 0.15,
    visibility: 'visible',
    category: 'reference'
  },
  {
    id: 'layer-axis',
    name: 'AXIS',
    nameAr: 'محاور',
    nameEn: 'Axis',
    color: 1,
    lineType: 'CENTER',
    lineWeight: 0.2,
    visibility: 'visible',
    category: 'reference'
  },
  
  // Utility layers
  {
    id: 'layer-noprint',
    name: 'NOPRINT',
    nameAr: 'عدم الطباعة',
    nameEn: 'No Print',
    color: 1,
    lineType: 'HIDDEN',
    lineWeight: 0.1,
    visibility: 'hidden',
    description: 'Non-printing layer',
    category: 'utility'
  },
  {
    id: 'layer-construction',
    name: 'CONSTRUCTION',
    nameAr: 'خطوط إنشائية',
    nameEn: 'Construction Lines',
    color: 8,
    lineType: 'HIDDEN',
    lineWeight: 0.1,
    visibility: 'visible',
    category: 'utility'
  }
];

export const layerCategories = [
  { id: 'default', nameAr: 'افتراضي', nameEn: 'Default' },
  { id: 'structural', nameAr: 'إنشائي', nameEn: 'Structural' },
  { id: 'furniture', nameAr: 'أثاث', nameEn: 'Furniture' },
  { id: 'plumbing', nameAr: 'سباكة', nameEn: 'Plumbing' },
  { id: 'circulation', nameAr: 'حركة', nameEn: 'Circulation' },
  { id: 'openings', nameAr: 'فتحات', nameEn: 'Openings' },
  { id: 'annotation', nameAr: 'توضيحات', nameEn: 'Annotation' },
  { id: 'reference', nameAr: 'مرجعي', nameEn: 'Reference' },
  { id: 'utility', nameAr: 'خدمات', nameEn: 'Utility' }
];

export function getLayerByName(name: string): YQArchLayer | undefined {
  return yqarchLayers.find(layer => layer.name === name);
}

export function getLayersByCategory(category: string): YQArchLayer[] {
  return yqarchLayers.filter(layer => layer.category === category);
}
