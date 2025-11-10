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
  // CAD-Corner Parquet Patterns Collection (17 variants)
  {
    id: 'hatch-parquet-1',
    name: 'PARQUET_1',
    nameAr: 'باركيه نمط 1',
    nameEn: 'Parquet Pattern 1',
    pattern: 'PARQUET_1',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Classic herringbone'
  },
  {
    id: 'hatch-parquet-2',
    name: 'PARQUET_2',
    nameAr: 'باركيه نمط 2',
    nameEn: 'Parquet Pattern 2',
    pattern: 'PARQUET_2',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Diagonal strips'
  },
  {
    id: 'hatch-parquet-3',
    name: 'PARQUET_3',
    nameAr: 'باركيه نمط 3',
    nameEn: 'Parquet Pattern 3',
    pattern: 'PARQUET_3',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Square basket weave'
  },
  {
    id: 'hatch-parquet-4',
    name: 'PARQUET_4',
    nameAr: 'باركيه نمط 4',
    nameEn: 'Parquet Pattern 4',
    pattern: 'PARQUET_4',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Chevron style'
  },
  {
    id: 'hatch-parquet-5',
    name: 'PARQUET_5',
    nameAr: 'باركيه نمط 5',
    nameEn: 'Parquet Pattern 5',
    pattern: 'PARQUET_5',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Brick bond'
  },
  {
    id: 'hatch-parquet-6',
    name: 'PARQUET_6',
    nameAr: 'باركيه نمط 6',
    nameEn: 'Parquet Pattern 6',
    pattern: 'PARQUET_6',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Versailles pattern'
  },
  {
    id: 'hatch-parquet-7',
    name: 'PARQUET_7',
    nameAr: 'باركيه نمط 7',
    nameEn: 'Parquet Pattern 7',
    pattern: 'PARQUET_7',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Double herringbone'
  },
  {
    id: 'hatch-parquet-8',
    name: 'PARQUET_8',
    nameAr: 'باركيه نمط 8',
    nameEn: 'Parquet Pattern 8',
    pattern: 'PARQUET_8',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Diagonal checkerboard'
  },
  {
    id: 'hatch-parquet-9',
    name: 'PARQUET_9',
    nameAr: 'باركيه نمط 9',
    nameEn: 'Parquet Pattern 9',
    pattern: 'PARQUET_9',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Stepped pattern'
  },
  {
    id: 'hatch-parquet-10',
    name: 'PARQUET_10',
    nameAr: 'باركيه نمط 10',
    nameEn: 'Parquet Pattern 10',
    pattern: 'PARQUET_10',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Monticello'
  },
  {
    id: 'hatch-parquet-11',
    name: 'PARQUET_11',
    nameAr: 'باركيه نمط 11',
    nameEn: 'Parquet Pattern 11',
    pattern: 'PARQUET_11',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Windmill'
  },
  {
    id: 'hatch-parquet-12',
    name: 'PARQUET_12',
    nameAr: 'باركيه نمط 12',
    nameEn: 'Parquet Pattern 12',
    pattern: 'PARQUET_12',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Diagonal squares'
  },
  {
    id: 'hatch-parquet-13',
    name: 'PARQUET_13',
    nameAr: 'باركيه نمط 13',
    nameEn: 'Parquet Pattern 13',
    pattern: 'PARQUET_13',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Mixed sizes'
  },
  {
    id: 'hatch-parquet-14',
    name: 'PARQUET_14',
    nameAr: 'باركيه نمط 14',
    nameEn: 'Parquet Pattern 14',
    pattern: 'PARQUET_14',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Pinwheel'
  },
  {
    id: 'hatch-parquet-15',
    name: 'PARQUET_15',
    nameAr: 'باركيه نمط 15',
    nameEn: 'Parquet Pattern 15',
    pattern: 'PARQUET_15',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Hexagonal'
  },
  {
    id: 'hatch-parquet-16',
    name: 'PARQUET_16',
    nameAr: 'باركيه نمط 16',
    nameEn: 'Parquet Pattern 16',
    pattern: 'PARQUET_16',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Diamond pattern'
  },
  {
    id: 'hatch-parquet-17',
    name: 'PARQUET_17',
    nameAr: 'باركيه نمط 17',
    nameEn: 'Parquet Pattern 17',
    pattern: 'PARQUET_17',
    scale: 300,
    angle: 0,
    category: 'flooring',
    description: 'Parquet flooring style hatch pattern - Basket weave'
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
