/**
 * yQArch Architectural Hatch Patterns
 * Based on yQArch library patterns
 */

export interface YQArchHatch {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  pattern: string; // AutoCAD pattern name or SOLID
  scale: number;
  angle: number;
  category: string;
  description?: string;
}

export const yqarchHatches: YQArchHatch[] = [
  // Solid fills
  {
    id: 'hatch-solid',
    name: 'SOLID',
    nameAr: 'تعبئة صلبة',
    nameEn: 'Solid Fill',
    pattern: 'SOLID',
    scale: 1,
    angle: 0,
    category: 'solid'
  },
  
  // Floor materials
  {
    id: 'hatch-marble-tile',
    name: 'MARBLE_TILE',
    nameAr: 'بلاط رخام',
    nameEn: 'Marble Tile',
    pattern: 'AR-SAND',
    scale: 100,
    angle: 0,
    category: 'flooring',
    description: 'Marble tile flooring pattern'
  },
  {
    id: 'hatch-ceramic-tile',
    name: 'CERAMIC_TILE',
    nameAr: 'بلاط سيراميك',
    nameEn: 'Ceramic Tile',
    pattern: 'AR-B88',
    scale: 100,
    angle: 0,
    category: 'flooring'
  },
  {
    id: 'hatch-granite',
    name: 'GRANITE',
    nameAr: 'جرانيت',
    nameEn: 'Granite',
    pattern: 'AR-CONC',
    scale: 200,
    angle: 0,
    category: 'flooring'
  },
  {
    id: 'hatch-wood-floor',
    name: 'WOOD_FLOOR',
    nameAr: 'باركيه خشبي',
    nameEn: 'Wood Floor',
    pattern: 'AR-HBONE',
    scale: 500,
    angle: 0,
    category: 'flooring'
  },
  {
    id: 'hatch-parquet',
    name: 'PARQUET',
    nameAr: 'باركيه',
    nameEn: 'Parquet',
    pattern: 'AR-PARQ1',
    scale: 500,
    angle: 0,
    category: 'flooring'
  },
  {
    id: 'hatch-carpet',
    name: 'CARPET',
    nameAr: 'سجاد/موكيت',
    nameEn: 'Carpet',
    pattern: 'ANSI37',
    scale: 100,
    angle: 0,
    category: 'flooring'
  },
  {
    id: 'hatch-vinyl',
    name: 'VINYL',
    nameAr: 'فينيل',
    nameEn: 'Vinyl',
    pattern: 'ANSI31',
    scale: 50,
    angle: 0,
    category: 'flooring'
  },
  
  // Wall materials
  {
    id: 'hatch-brick',
    name: 'BRICK',
    nameAr: 'طوب أحمر',
    nameEn: 'Brick',
    pattern: 'BRICK',
    scale: 100,
    angle: 0,
    category: 'wall'
  },
  {
    id: 'hatch-concrete-block',
    name: 'CONCRETE_BLOCK',
    nameAr: 'بلوك خرساني',
    nameEn: 'Concrete Block',
    pattern: 'AR-BRSTD',
    scale: 100,
    angle: 0,
    category: 'wall'
  },
  {
    id: 'hatch-stone',
    name: 'STONE',
    nameAr: 'حجر طبيعي',
    nameEn: 'Natural Stone',
    pattern: 'BRSTONE',
    scale: 500,
    angle: 0,
    category: 'wall'
  },
  {
    id: 'hatch-concrete',
    name: 'CONCRETE',
    nameAr: 'خرسانة',
    nameEn: 'Concrete',
    pattern: 'AR-CONC',
    scale: 200,
    angle: 0,
    category: 'wall'
  },
  {
    id: 'hatch-plaster',
    name: 'PLASTER',
    nameAr: 'محارة',
    nameEn: 'Plaster',
    pattern: 'ANSI31',
    scale: 100,
    angle: 45,
    category: 'wall'
  },
  
  // Glass and transparent
  {
    id: 'hatch-glass',
    name: 'GLASS',
    nameAr: 'زجاج',
    nameEn: 'Glass',
    pattern: 'ANSI37',
    scale: 100,
    angle: 0,
    category: 'glass'
  },
  {
    id: 'hatch-glass-block',
    name: 'GLASS_BLOCK',
    nameAr: 'بلوك زجاجي',
    nameEn: 'Glass Block',
    pattern: 'BOX',
    scale: 100,
    angle: 0,
    category: 'glass'
  },
  
  // Metal
  {
    id: 'hatch-steel',
    name: 'STEEL',
    nameAr: 'حديد',
    nameEn: 'Steel',
    pattern: 'ANSI31',
    scale: 50,
    angle: 0,
    category: 'metal'
  },
  {
    id: 'hatch-aluminum',
    name: 'ALUMINUM',
    nameAr: 'ألمنيوم',
    nameEn: 'Aluminum',
    pattern: 'ANSI37',
    scale: 50,
    angle: 0,
    category: 'metal'
  },
  {
    id: 'hatch-brass',
    name: 'BRASS',
    nameAr: 'نحاس',
    nameEn: 'Brass',
    pattern: 'BRASS',
    scale: 100,
    angle: 0,
    category: 'metal'
  },
  
  // Earth and landscape
  {
    id: 'hatch-earth',
    name: 'EARTH',
    nameAr: 'تربة',
    nameEn: 'Earth',
    pattern: 'EARTH',
    scale: 100,
    angle: 0,
    category: 'landscape'
  },
  {
    id: 'hatch-grass',
    name: 'GRASS',
    nameAr: 'عشب',
    nameEn: 'Grass',
    pattern: 'GRASS',
    scale: 200,
    angle: 0,
    category: 'landscape'
  },
  {
    id: 'hatch-gravel',
    name: 'GRAVEL',
    nameAr: 'حصى',
    nameEn: 'Gravel',
    pattern: 'GRAVEL',
    scale: 100,
    angle: 0,
    category: 'landscape'
  },
  {
    id: 'hatch-sand',
    name: 'SAND',
    nameAr: 'رمل',
    nameEn: 'Sand',
    pattern: 'AR-SAND',
    scale: 100,
    angle: 0,
    category: 'landscape'
  },
  
  // Insulation and special
  {
    id: 'hatch-insulation',
    name: 'INSULATION',
    nameAr: 'عزل حراري',
    nameEn: 'Insulation',
    pattern: 'ANSI37',
    scale: 200,
    angle: 0,
    category: 'insulation'
  },
  {
    id: 'hatch-waterproof',
    name: 'WATERPROOF',
    nameAr: 'عزل مائي',
    nameEn: 'Waterproofing',
    pattern: 'ANSI38',
    scale: 100,
    angle: 0,
    category: 'insulation'
  },
  
  // Roofing
  {
    id: 'hatch-roof-tile',
    name: 'ROOF_TILE',
    nameAr: 'قرميد',
    nameEn: 'Roof Tile',
    pattern: 'AR-RROOF',
    scale: 500,
    angle: 0,
    category: 'roofing'
  },
  {
    id: 'hatch-shingle',
    name: 'SHINGLE',
    nameAr: 'ألواح سقف',
    nameEn: 'Shingle',
    pattern: 'AR-RSHKE',
    scale: 200,
    angle: 0,
    category: 'roofing'
  },
  
  // Standard AutoCAD patterns
  {
    id: 'hatch-ansi31',
    name: 'ANSI31',
    nameAr: 'خطوط مائلة (ANSI31)',
    nameEn: 'ANSI31 Pattern',
    pattern: 'ANSI31',
    scale: 100,
    angle: 0,
    category: 'standard'
  },
  {
    id: 'hatch-ansi32',
    name: 'ANSI32',
    nameAr: 'خطوط مائلة متقاطعة (ANSI32)',
    nameEn: 'ANSI32 Pattern',
    pattern: 'ANSI32',
    scale: 100,
    angle: 0,
    category: 'standard'
  },
  {
    id: 'hatch-ansi37',
    name: 'ANSI37',
    nameAr: 'نقاط (ANSI37)',
    nameEn: 'ANSI37 Dots',
    pattern: 'ANSI37',
    scale: 100,
    angle: 0,
    category: 'standard'
  },
  {
    id: 'hatch-dots',
    name: 'DOTS',
    nameAr: 'نقاط',
    nameEn: 'Dots',
    pattern: 'DOTS',
    scale: 100,
    angle: 0,
    category: 'standard'
  },
  {
    id: 'hatch-line',
    name: 'LINE',
    nameAr: 'خطوط',
    nameEn: 'Lines',
    pattern: 'LINE',
    scale: 100,
    angle: 0,
    category: 'standard'
  }
];

export const hatchCategories = [
  { id: 'solid', nameAr: 'تعبئة صلبة', nameEn: 'Solid' },
  { id: 'flooring', nameAr: 'أرضيات', nameEn: 'Flooring' },
  { id: 'wall', nameAr: 'حوائط', nameEn: 'Wall' },
  { id: 'glass', nameAr: 'زجاج', nameEn: 'Glass' },
  { id: 'metal', nameAr: 'معادن', nameEn: 'Metal' },
  { id: 'landscape', nameAr: 'مناظر طبيعية', nameEn: 'Landscape' },
  { id: 'insulation', nameAr: 'عزل', nameEn: 'Insulation' },
  { id: 'roofing', nameAr: 'أسقف', nameEn: 'Roofing' },
  { id: 'standard', nameAr: 'قياسي', nameEn: 'Standard' }
];

export function getHatchByName(name: string): YQArchHatch | undefined {
  return yqarchHatches.find(hatch => hatch.name === name);
}

export function getHatchesByCategory(category: string): YQArchHatch[] {
  return yqarchHatches.filter(hatch => hatch.category === category);
}
