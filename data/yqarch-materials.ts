/**
 * yQArch Architectural Materials and Densities
 * Based on yQArch library data
 */

export interface YQArchMaterial {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  density?: number; // g/cm³
  category: string;
  description?: string;
  translation?: string; // From translate.txt
}

export const yqarchMaterials: YQArchMaterial[] = [
  // Metals
  {
    id: 'mat-steel',
    name: 'الحديد',
    nameAr: 'حديد',
    nameEn: 'Steel',
    density: 7.8,
    category: 'metal',
    translation: 'Steel'
  },
  {
    id: 'mat-stainless-steel',
    name: 'ستانلس ستيل',
    nameAr: 'ستانلس ستيل',
    nameEn: 'Stainless Steel',
    density: 7.93,
    category: 'metal',
    translation: 'Stainless Steel'
  },
  {
    id: 'mat-stainless-hairline',
    name: 'ستانلس ستيل مصقول',
    nameAr: 'ستانلس مصقول',
    nameEn: 'Hairline Stainless Steel',
    category: 'metal',
    translation: 'Hairline Stainless Steel'
  },
  {
    id: 'mat-stainless-mirror',
    name: 'ستانلس ستيل مرآة',
    nameAr: 'ستانلس مرآة',
    nameEn: 'Mirror Stainless Steel',
    category: 'metal',
    translation: 'Mirror Stainless Steel'
  },
  {
    id: 'mat-aluminum',
    name: 'الألمنيوم',
    nameAr: 'ألمنيوم',
    nameEn: 'Aluminum',
    density: 2.702,
    category: 'metal',
    translation: 'Aluminum'
  },
  {
    id: 'mat-copper',
    name: 'النحاس',
    nameAr: 'نحاس',
    nameEn: 'Copper',
    density: 8.93,
    category: 'metal',
    translation: 'Copper'
  },
  {
    id: 'mat-brass',
    name: 'النحاس الأصفر',
    nameAr: 'نحاس أصفر',
    nameEn: 'Brass',
    density: 8.3,
    category: 'metal',
    translation: 'Brass'
  },
  {
    id: 'mat-cast-iron',
    name: 'الحديد الزهر',
    nameAr: 'حديد زهر',
    nameEn: 'Cast Iron',
    density: 7.2,
    category: 'metal'
  },
  
  // Construction materials
  {
    id: 'mat-concrete',
    name: 'الخرسانة المسلحة',
    nameAr: 'خرسانة مسلحة',
    nameEn: 'Reinforced Concrete',
    density: 2.5,
    category: 'construction',
    translation: 'Reinforced Concrete'
  },
  {
    id: 'mat-lightweight-concrete',
    name: 'الخرسانة الخفيفة',
    nameAr: 'خرسانة خفيفة',
    nameEn: 'Lightweight Concrete',
    density: 0.5,
    category: 'construction'
  },
  {
    id: 'mat-brick',
    name: 'الطوب الأحمر',
    nameAr: 'طوب أحمر',
    nameEn: 'Red Brick',
    density: 1.9,
    category: 'construction',
    translation: 'Red Brick'
  },
  {
    id: 'mat-concrete-block',
    name: 'البلوك الخرساني',
    nameAr: 'بلوك خرساني',
    nameEn: 'Concrete Block',
    density: 1.9,
    category: 'construction'
  },
  {
    id: 'mat-marble',
    name: 'الرخام',
    nameAr: 'رخام',
    nameEn: 'Marble',
    density: 2.7,
    category: 'stone',
    translation: 'Marble'
  },
  {
    id: 'mat-granite',
    name: 'الجرانيت',
    nameAr: 'جرانيت',
    nameEn: 'Granite',
    density: 3.0,
    category: 'stone',
    translation: 'Granite'
  },
  {
    id: 'mat-limestone',
    name: 'الحجر الجيري',
    nameAr: 'حجر جيري',
    nameEn: 'Limestone',
    density: 2.7,
    category: 'stone'
  },
  
  // Glass
  {
    id: 'mat-glass',
    name: 'الزجاج',
    nameAr: 'زجاج',
    nameEn: 'Glass',
    density: 2.5,
    category: 'glass',
    translation: 'Glass'
  },
  {
    id: 'mat-clear-glass',
    name: 'زجاج شفاف',
    nameAr: 'زجاج شفاف',
    nameEn: 'Clear Glass',
    category: 'glass',
    translation: 'Clear Glass'
  },
  {
    id: 'mat-tempered-glass',
    name: 'زجاج مقسى',
    nameAr: 'زجاج مقسى',
    nameEn: 'Tempered Glass',
    category: 'glass',
    translation: 'Tempered Glass'
  },
  {
    id: 'mat-clear-tempered-glass',
    name: 'زجاج شفاف مقسى',
    nameAr: 'زجاج شفاف مقسى',
    nameEn: 'Clear Tempered Glass',
    category: 'glass',
    translation: 'Clear Tempered Glass'
  },
  {
    id: 'mat-gray-mirror',
    name: 'مرآة رمادية',
    nameAr: 'مرآة رمادية',
    nameEn: 'Gray Mirror',
    category: 'glass',
    translation: 'Gray Mirror'
  },
  {
    id: 'mat-clear-mirror',
    name: 'مرآة شفافة',
    nameAr: 'مرآة شفافة',
    nameEn: 'Clear Mirror',
    category: 'glass',
    translation: 'Clear Mirror'
  },
  {
    id: 'mat-acid-etched-glass',
    name: 'زجاج محفور بالحامض',
    nameAr: 'زجاج محفور',
    nameEn: 'Acid Etched Glass',
    category: 'glass',
    translation: 'Gray Acid Etched Glass'
  },
  
  // Wood
  {
    id: 'mat-solid-timber',
    name: 'خشب طبيعي',
    nameAr: 'خشب طبيعي',
    nameEn: 'Solid Timber',
    density: 0.6,
    category: 'wood',
    translation: 'Solid Timber'
  },
  {
    id: 'mat-plywood',
    name: 'خشب أبلكاش',
    nameAr: 'أبلكاش',
    nameEn: 'Plywood',
    category: 'wood',
    translation: 'Plywood'
  },
  {
    id: 'mat-wood-veneer',
    name: 'قشرة خشب',
    nameAr: 'قشرة خشب',
    nameEn: 'Wood Veneer',
    category: 'wood',
    translation: 'Wood Veneer'
  },
  {
    id: 'mat-mdf',
    name: 'خشب MDF',
    nameAr: 'MDF',
    nameEn: 'MDF',
    density: 0.6,
    category: 'wood'
  },
  
  // Finishes
  {
    id: 'mat-paint',
    name: 'دهان',
    nameAr: 'دهان',
    nameEn: 'Paint',
    category: 'finish',
    translation: 'Emulsion Paint'
  },
  {
    id: 'mat-white-paint',
    name: 'دهان أبيض',
    nameAr: 'دهان أبيض',
    nameEn: 'White Paint',
    category: 'finish',
    translation: 'White Paint'
  },
  {
    id: 'mat-spray-paint',
    name: 'دهان رش',
    nameAr: 'دهان رش',
    nameEn: 'Spray Paint',
    category: 'finish',
    translation: 'Spray Paint'
  },
  {
    id: 'mat-wallpaper',
    name: 'ورق جدران',
    nameAr: 'ورق جدران',
    nameEn: 'Wallpaper',
    category: 'finish',
    translation: 'Wall Paper'
  },
  {
    id: 'mat-plastic-laminate',
    name: 'لامينات بلاستيك',
    nameAr: 'لامينات',
    nameEn: 'Plastic Laminate',
    category: 'finish',
    translation: 'Plastic Laminate'
  },
  {
    id: 'mat-ceramic-tile',
    name: 'سيراميك',
    nameAr: 'سيراميك',
    nameEn: 'Ceramic Tile',
    density: 2.2,
    category: 'tile',
    translation: 'Ceramic Tile'
  },
  {
    id: 'mat-porcelain-tile',
    name: 'بورسلان',
    nameAr: 'بورسلان',
    nameEn: 'Porcelain Tile',
    category: 'tile',
    translation: 'Porcelain Tile'
  },
  
  // Other materials
  {
    id: 'mat-gypsum',
    name: 'الجبس',
    nameAr: 'جبس',
    nameEn: 'Gypsum',
    density: 1.2,
    category: 'other',
    translation: 'Gypsum'
  },
  {
    id: 'mat-foam',
    name: 'الفوم',
    nameAr: 'فوم',
    nameEn: 'Foam',
    density: 0.56,
    category: 'other'
  },
  {
    id: 'mat-rubber',
    name: 'المطاط',
    nameAr: 'مطاط',
    nameEn: 'Rubber',
    density: 0.6,
    category: 'other'
  }
];

export const materialCategories = [
  { id: 'metal', nameAr: 'معادن', nameEn: 'Metals' },
  { id: 'construction', nameAr: 'مواد بناء', nameEn: 'Construction' },
  { id: 'stone', nameAr: 'أحجار', nameEn: 'Stone' },
  { id: 'glass', nameAr: 'زجاج', nameEn: 'Glass' },
  { id: 'wood', nameAr: 'أخشاب', nameEn: 'Wood' },
  { id: 'finish', nameAr: 'تشطيبات', nameEn: 'Finishes' },
  { id: 'tile', nameAr: 'بلاط', nameEn: 'Tiles' },
  { id: 'other', nameAr: 'أخرى', nameEn: 'Other' }
];

export function getMaterialByName(name: string): YQArchMaterial | undefined {
  return yqarchMaterials.find(mat => 
    mat.name === name || mat.nameAr === name || mat.nameEn === name
  );
}

export function getMaterialsByCategory(category: string): YQArchMaterial[] {
  return yqarchMaterials.filter(mat => mat.category === category);
}

export function getMaterialDensity(materialId: string): number | undefined {
  const material = yqarchMaterials.find(mat => mat.id === materialId);
  return material?.density;
}
