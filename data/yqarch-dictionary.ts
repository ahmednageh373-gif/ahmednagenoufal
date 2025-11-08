/**
 * yQArch Architectural Dictionary
 * Furniture codes and drawing titles from yQArch library
 */

export interface FurnitureCode {
  code: string;
  nameAr: string;
  nameEn: string;
  category: string;
}

export interface DrawingTitle {
  titleAr: string;
  titleEn: string;
  category: string;
}

// Furniture codes from dict.txt
export const furnitureCodes: FurnitureCode[] = [
  // Seating
  { code: 'SF--', nameAr: 'صوفا', nameEn: 'SOFA', category: 'seating' },
  { code: 'LSE--', nameAr: 'كنب لشخصين', nameEn: 'LOVE SEAT', category: 'seating' },
  { code: 'AC--', nameAr: 'كرسي بمساند', nameEn: 'ARMS CHAIR', category: 'seating' },
  { code: 'SC--', nameAr: 'كرسي جانبي', nameEn: 'SIDE CHAIR', category: 'seating' },
  { code: 'DC--', nameAr: 'كرسي طعام', nameEn: 'DINNING CHAIR', category: 'seating' },
  { code: 'DRC--', nameAr: 'كرسي تسريحة', nameEn: 'DRESSING CHAIR', category: 'seating' },
  { code: 'LC--', nameAr: 'كرسي استرخاء', nameEn: 'LOUNGE CHAIR', category: 'seating' },
  { code: 'BC--', nameAr: 'كرسي بار', nameEn: 'BAR CHAIR', category: 'seating' },
  { code: 'DSC--', nameAr: 'كرسي مكتب', nameEn: 'DESK CHAIR', category: 'seating' },
  { code: 'GC--', nameAr: 'كرسي ضيوف', nameEn: 'GUEST CHAIR', category: 'seating' },
  { code: 'ACC--', nameAr: 'كرسي مميز', nameEn: 'ACCENT CHAIR', category: 'seating' },
  { code: 'CFC--', nameAr: 'كرسي مؤتمرات', nameEn: 'CONFERENCE CHAIR', category: 'seating' },
  { code: 'BE--', nameAr: 'مقعد طويل', nameEn: 'BENCH', category: 'seating' },
  { code: 'BB--', nameAr: 'مقعد سرير', nameEn: 'BENCH BED', category: 'seating' },
  { code: 'OT--', nameAr: 'كرسي عثماني', nameEn: 'OTTOMAN', category: 'seating' },
  
  // Tables
  { code: 'CT--', nameAr: 'طاولة قهوة', nameEn: 'COFFEE TABLE', category: 'table' },
  { code: 'ET--', nameAr: 'طاولة جانبية', nameEn: 'END TABLE', category: 'table' },
  { code: 'RET--', nameAr: 'طاولة دائرية', nameEn: 'ROUND END TABLE', category: 'table' },
  { code: 'SBT--', nameAr: 'طاولة خلفية', nameEn: 'SOFA BACK TABLE', category: 'table' },
  { code: 'CST--', nameAr: 'طاولة كونسول', nameEn: 'CONSOLE TABLE', category: 'table' },
  { code: 'DB--', nameAr: 'طاولة طعام', nameEn: 'DINNING TABLE', category: 'table' },
  
  // Storage
  { code: 'CH--', nameAr: 'دولاب', nameEn: 'CHEST', category: 'storage' },
  { code: 'NS--', nameAr: 'كومودينو', nameEn: 'NIGHT STAND', category: 'storage' },
  { code: 'SCA--', nameAr: 'خزانة جانبية', nameEn: 'SIDE CABINET', category: 'storage' },
  { code: 'TCA--', nameAr: 'خزانة تلفزيون', nameEn: 'TV CABINET', category: 'storage' },
  { code: 'WC--', nameAr: 'خزانة نبيذ', nameEn: 'WINE CHEST', category: 'storage' },
  { code: 'DCA--', nameAr: 'خزانة عرض', nameEn: 'DISPLAY CABINET', category: 'storage' },
  { code: 'FCA--', nameAr: 'خزانة ملفات', nameEn: 'FILE CABINET', category: 'storage' },
  { code: 'CAB--', nameAr: 'خزانة حائط', nameEn: 'CABINET', category: 'storage' },
  { code: 'BKC--', nameAr: 'خزانة كتب', nameEn: 'BOOK CASE', category: 'storage' },
  { code: 'LCT--', nameAr: 'خزانة منخفضة', nameEn: 'LOW CABINET', category: 'storage' },
  { code: 'BCA--', nameAr: 'بوفيه', nameEn: 'BUFFET CABINET', category: 'storage' },
  { code: 'CU--', nameAr: 'خزانة مطبخ', nameEn: 'CUPBOARD', category: 'storage' },
  { code: 'CB--', nameAr: 'خزانة صغيرة', nameEn: 'CABINET', category: 'storage' }
];

// Drawing titles from dwgtitle.txt
export const drawingTitles: DrawingTitle[] = [
  // Plans
  { titleAr: 'قائمة الرسومات', titleEn: 'DRAWING LIST', category: 'index' },
  { titleAr: 'المخطط الأولي', titleEn: 'EXISTING PLAN', category: 'plan' },
  { titleAr: 'المخطط الأرضي', titleEn: 'LAYOUT PLAN', category: 'plan' },
  { titleAr: 'مخطط الأثاث', titleEn: 'FIXTURE & FURNITURE PLAN', category: 'plan' },
  { titleAr: 'مخطط السقف المعكوس', titleEn: 'REFLECTED CEILING PLAN', category: 'plan' },
  { titleAr: 'مخطط السقف الشامل', titleEn: 'COMPREHENSIVE CEILING PLAN', category: 'plan' },
  { titleAr: 'مخطط الإضاءة', titleEn: 'LIGHTING PLAN', category: 'plan' },
  { titleAr: 'مخطط دوائر الإضاءة', titleEn: 'LIGHTING CIRCUIT PLAN', category: 'plan' },
  { titleAr: 'مخطط الكهرباء', titleEn: 'SOCKET PLAN', category: 'plan' },
  { titleAr: 'مخطط السباكة', titleEn: 'PLUMBING PLAN', category: 'plan' },
  { titleAr: 'مخطط تشطيب الأرضيات', titleEn: 'FLOOR COVERING PLAN', category: 'plan' },
  { titleAr: 'مخطط المعلومات المعمارية', titleEn: 'ARCHITECTURAL INFO. PLAN', category: 'plan' },
  { titleAr: 'مخطط الكهرباء والميكانيكا', titleEn: 'ELECTRICAL / MECH. PLAN', category: 'plan' },
  { titleAr: 'رسم النظام الكهربائي', titleEn: 'ELECTRICAL SYSTEM DIAGRAM', category: 'plan' },
  { titleAr: 'مخطط تشطيب الحوائط', titleEn: 'WALL FINISH PLAN', category: 'plan' },
  { titleAr: 'مخطط الفهرس', titleEn: 'INDEX PLAN', category: 'plan' },
  { titleAr: 'مخطط الأبعاد والحوائط', titleEn: 'DIMENSION / PARTITION PLAN', category: 'plan' },
  { titleAr: 'مخطط تشطيب الأرضيات المفصل', titleEn: 'FLOOR FINISHING PLAN', category: 'plan' },
  { titleAr: 'مخطط تشطيب الحوائط والأرضيات', titleEn: 'WALL/FLOOR FINISHING PLAN', category: 'plan' },
  { titleAr: 'مخطط جدول الأبواب', titleEn: 'DOOR SCHEDULE PLAN', category: 'plan' },
  { titleAr: 'مخطط الأثاث المفصل', titleEn: 'FURNITURE PLAN', category: 'plan' },
  
  // Elevations and sections
  { titleAr: 'الواجهات', titleEn: 'ELEVATION', category: 'elevation' },
  { titleAr: 'المقاطع', titleEn: 'SECTION', category: 'section' },
  
  // Details
  { titleAr: 'التفاصيل', titleEn: 'DETAIL', category: 'detail' },
  { titleAr: 'تفاصيل الأبواب النموذجية', titleEn: 'TYPICAL DOOR DETAIL', category: 'detail' },
  
  // Schedules
  { titleAr: 'جدول الأبواب', titleEn: 'DOOR SCHEDULE', category: 'schedule' },
  { titleAr: 'جدول الأثاث', titleEn: 'FURNITURE SCHEDULE', category: 'schedule' },
  { titleAr: 'جدول التشطيبات', titleEn: 'FINISH SCHEDULE', category: 'schedule' }
];

export const furnitureCategories = [
  { id: 'seating', nameAr: 'مقاعد', nameEn: 'Seating' },
  { id: 'table', nameAr: 'طاولات', nameEn: 'Tables' },
  { id: 'storage', nameAr: 'خزائن', nameEn: 'Storage' }
];

export const drawingCategories = [
  { id: 'index', nameAr: 'فهرس', nameEn: 'Index' },
  { id: 'plan', nameAr: 'مخططات', nameEn: 'Plans' },
  { id: 'elevation', nameAr: 'واجهات', nameEn: 'Elevations' },
  { id: 'section', nameAr: 'مقاطع', nameEn: 'Sections' },
  { id: 'detail', nameAr: 'تفاصيل', nameEn: 'Details' },
  { id: 'schedule', nameAr: 'جداول', nameEn: 'Schedules' }
];

export function getFurnitureCodeByCode(code: string): FurnitureCode | undefined {
  return furnitureCodes.find(fc => fc.code === code);
}

export function getFurnitureCodesByCategory(category: string): FurnitureCode[] {
  return furnitureCodes.filter(fc => fc.category === category);
}

export function getDrawingTitlesByCategory(category: string): DrawingTitle[] {
  return drawingTitles.filter(dt => dt.category === category);
}
