import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'cad-platform': 'منصة CAD الموحدة',
    'blocks': 'مكتبة البلوكات',
    'draw': 'أدوات الرسم',
    'layers': 'الطبقات',
    'dxf': 'تصدير DXF',
    'quantity': 'الكميات',
    
    // Tools
    'select': 'تحديد',
    'line': 'خط',
    'circle': 'دائرة',
    'arc': 'قوس',
    'rectangle': 'مستطيل',
    'polyline': 'خط متعدد',
    'insert-block': 'إدراج بلوك',
    
    // Block insertion
    'insert-mode': 'وضع الإدراج',
    'click-to-insert': 'انقر لإدراج البلوك',
    'rotate': 'تدوير',
    'scale': 'تحجيم',
    'flip-horizontal': 'قلب أفقي',
    'flip-vertical': 'قلب رأسي',
    'confirm-insert': 'تأكيد الإدراج',
    'cancel-insert': 'إلغاء',
    
    // Canvas controls
    'zoom-in': 'تكبير',
    'zoom-out': 'تصغير',
    'zoom-fit': 'ملء الشاشة',
    'pan': 'تحريك',
    'grid': 'شبكة',
    'snap': 'كبس',
    'show-grid': 'إظهار الشبكة',
    'snap-to-grid': 'الكبس على الشبكة',
    
    // Layer controls
    'add-layer': 'إضافة طبقة',
    'delete-layer': 'حذف طبقة',
    'layer-name': 'اسم الطبقة',
    'layer-color': 'لون الطبقة',
    'layer-visible': 'مرئية',
    'layer-locked': 'مقفلة',
    
    // DXF export
    'export-dxf': 'تصدير DXF',
    'download-dxf': 'تحميل ملف DXF',
    'dxf-filename': 'اسم الملف',
    'include-blocks': 'تضمين البلوكات',
    
    // Block library
    'search-blocks': 'البحث في البلوكات',
    'filter-category': 'تصفية حسب الفئة',
    'all-categories': 'كل الفئات',
    'block-name': 'اسم البلوك',
    'block-dimensions': 'الأبعاد',
    'insert-this-block': 'إدراج هذا البلوك',
    
    // Categories
    'furniture': 'أثاث',
    'doors': 'أبواب',
    'windows': 'نوافذ',
    'kitchen': 'مطبخ',
    'bathroom': 'حمام',
    'lighting': 'إضاءة',
    'plants': 'نباتات',
    'structural': 'إنشائي',
    
    // Properties
    'properties': 'الخصائص',
    'position': 'الموقع',
    'rotation-angle': 'زاوية التدوير',
    'scale-factor': 'معامل التحجيم',
    'layer': 'الطبقة',
    'color': 'اللون',
    'line-type': 'نوع الخط',
    'line-weight': 'سُمك الخط',
    
    // Messages
    'no-blocks-found': 'لم يتم العثور على بلوكات',
    'no-entities': 'لا توجد كيانات للتصدير',
    'success': 'نجح',
    'error': 'خطأ',
    'warning': 'تحذير',
    
    // Custom blocks
    'custom-blocks': 'بلوكات مخصصة',
    'save-as-block': 'حفظ كبلوك',
    'load-custom-block': 'تحميل بلوك مخصص',
    'delete-custom-block': 'حذف بلوك مخصص',
    
    // Units
    'mm': 'مم',
    'cm': 'سم',
    'm': 'م',
    'degrees': 'درجة',
    
    // Actions
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'delete': 'حذف',
    'edit': 'تعديل',
    'copy': 'نسخ',
    'paste': 'لصق',
    'undo': 'تراجع',
    'redo': 'إعادة',
    
    // yQArch specific
    'yqarch-layers': 'طبقات yQArch',
    'yqarch-hatches': 'هاتشات yQArch',
    'yqarch-materials': 'مواد yQArch',
    'material-density': 'كثافة المادة',
    'drawing-titles': 'عناوين المخططات',
    'furniture-codes': 'رموز الأثاث'
  },
  en: {
    // Navigation
    'cad-platform': 'CAD Platform',
    'blocks': 'Block Library',
    'draw': 'Drawing Tools',
    'layers': 'Layers',
    'dxf': 'DXF Export',
    'quantity': 'Quantities',
    
    // Tools
    'select': 'Select',
    'line': 'Line',
    'circle': 'Circle',
    'arc': 'Arc',
    'rectangle': 'Rectangle',
    'polyline': 'Polyline',
    'insert-block': 'Insert Block',
    
    // Block insertion
    'insert-mode': 'Insert Mode',
    'click-to-insert': 'Click to insert block',
    'rotate': 'Rotate',
    'scale': 'Scale',
    'flip-horizontal': 'Flip Horizontal',
    'flip-vertical': 'Flip Vertical',
    'confirm-insert': 'Confirm Insert',
    'cancel-insert': 'Cancel',
    
    // Canvas controls
    'zoom-in': 'Zoom In',
    'zoom-out': 'Zoom Out',
    'zoom-fit': 'Zoom Fit',
    'pan': 'Pan',
    'grid': 'Grid',
    'snap': 'Snap',
    'show-grid': 'Show Grid',
    'snap-to-grid': 'Snap to Grid',
    
    // Layer controls
    'add-layer': 'Add Layer',
    'delete-layer': 'Delete Layer',
    'layer-name': 'Layer Name',
    'layer-color': 'Layer Color',
    'layer-visible': 'Visible',
    'layer-locked': 'Locked',
    
    // DXF export
    'export-dxf': 'Export DXF',
    'download-dxf': 'Download DXF File',
    'dxf-filename': 'Filename',
    'include-blocks': 'Include Blocks',
    
    // Block library
    'search-blocks': 'Search Blocks',
    'filter-category': 'Filter by Category',
    'all-categories': 'All Categories',
    'block-name': 'Block Name',
    'block-dimensions': 'Dimensions',
    'insert-this-block': 'Insert This Block',
    
    // Categories
    'furniture': 'Furniture',
    'doors': 'Doors',
    'windows': 'Windows',
    'kitchen': 'Kitchen',
    'bathroom': 'Bathroom',
    'lighting': 'Lighting',
    'plants': 'Plants',
    'structural': 'Structural',
    
    // Properties
    'properties': 'Properties',
    'position': 'Position',
    'rotation-angle': 'Rotation Angle',
    'scale-factor': 'Scale Factor',
    'layer': 'Layer',
    'color': 'Color',
    'line-type': 'Line Type',
    'line-weight': 'Line Weight',
    
    // Messages
    'no-blocks-found': 'No blocks found',
    'no-entities': 'No entities to export',
    'success': 'Success',
    'error': 'Error',
    'warning': 'Warning',
    
    // Custom blocks
    'custom-blocks': 'Custom Blocks',
    'save-as-block': 'Save as Block',
    'load-custom-block': 'Load Custom Block',
    'delete-custom-block': 'Delete Custom Block',
    
    // Units
    'mm': 'mm',
    'cm': 'cm',
    'm': 'm',
    'degrees': 'deg',
    
    // Actions
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'copy': 'Copy',
    'paste': 'Paste',
    'undo': 'Undo',
    'redo': 'Redo',
    
    // yQArch specific
    'yqarch-layers': 'yQArch Layers',
    'yqarch-hatches': 'yQArch Hatches',
    'yqarch-materials': 'yQArch Materials',
    'material-density': 'Material Density',
    'drawing-titles': 'Drawing Titles',
    'furniture-codes': 'Furniture Codes'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to Arabic
    const saved = localStorage.getItem('cad-language');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem('cad-language', language);
    
    // Update HTML dir attribute
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
