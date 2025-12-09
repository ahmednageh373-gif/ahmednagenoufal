import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Language Types
export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translation Keys Interface
export interface Translations {
  [key: string]: string;
}

// Arabic Translations
const translationsAr: Translations = {
  // Common
  'common.loading': 'جاري التحميل...',
  'common.save': 'حفظ',
  'common.cancel': 'إلغاء',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.add': 'إضافة',
  'common.back': 'رجوع',
  'common.next': 'التالي',
  'common.previous': 'السابق',
  'common.search': 'بحث',
  'common.close': 'إغلاق',
  'common.submit': 'إرسال',
  
  // NOUFAL Agent
  'noufal.title': 'وكيل أحمد ناجح نوفل',
  'noufal.subtitle': 'مساعدك الذكي للحسابات الهندسية ورسم المخططات',
  'noufal.connected': 'متصل ونشط',
  'noufal.advanced': 'AI متقدم',
  'noufal.accuracy': 'دقة عالية',
  
  // Quick Access Cards
  'noufal.calculators.title': 'الحاسبات الهندسية',
  'noufal.calculators.subtitle': 'Engineering Calculators',
  'noufal.calculators.columns': 'حاسبة الأعمدة القصيرة',
  'noufal.calculators.beams': 'حاسبة الكمرات',
  'noufal.calculators.slabs': 'حاسبة البلاطات',
  'noufal.calculators.reinforcement': 'حاسبة قطاعات التسليح',
  'noufal.calculators.concrete': 'حاسبة الخرسانة والتكاليف',
  'noufal.calculators.count': '6 حاسبات متقدمة',
  
  'noufal.drawing.title': 'استوديو الرسم',
  'noufal.drawing.subtitle': 'Drawing Studio',
  'noufal.drawing.plans': 'رسم المخططات المعمارية',
  'noufal.drawing.ai': 'مساعد AI للتصميم',
  'noufal.drawing.convert': 'تحويل 2D إلى 3D',
  'noufal.drawing.blocks': 'مكتبة 157 بلوك',
  'noufal.drawing.hatches': '67 نمط هاتشينج',
  'noufal.drawing.status': 'استوديو متكامل',
  
  'noufal.viewer.title': 'عارض 3D',
  'noufal.viewer.subtitle': '3D Viewer',
  'noufal.viewer.display': 'عرض ثلاثي الأبعاد',
  'noufal.viewer.lighting': 'إضاءة واقعية',
  'noufal.viewer.tours': 'جولات افتراضية',
  'noufal.viewer.camera': 'تحريك الكاميرا',
  'noufal.viewer.daynight': 'وضع نهار/ليل',
  'noufal.viewer.status': 'عرض احترافي',
  
  'noufal.analysis.title': 'تحليل AI',
  'noufal.analysis.subtitle': 'AI Analysis',
  'noufal.analysis.boq': 'تحليل BOQ',
  'noufal.analysis.scheduling': 'الجدولة الذكية',
  'noufal.analysis.sbc': 'فحص SBC 304',
  'noufal.analysis.financial': 'التنبؤ المالي',
  'noufal.analysis.productivity': 'معدلات الإنتاجية',
  'noufal.analysis.count': '10+ قدرة ذكية',
  
  // Stats
  'noufal.stats.calculators': 'حاسبات إنشائية',
  'noufal.stats.blocks': 'بلوك معماري',
  'noufal.stats.hatches': 'نمط هاتشينج',
  'noufal.stats.ai': 'قدرة AI متقدمة',
  
  // Dashboard
  'dashboard.title': 'لوحة التحكم',
  'dashboard.executive': 'لوحة التحكم التنفيذية',
  'dashboard.overview': 'نظرة عامة',
  
  // Menu
  'menu.home': 'الرئيسية',
  'menu.projects': 'المشاريع',
  'menu.reports': 'التقارير',
  'menu.settings': 'الإعدادات',
  
  // Engineering Calculators
  'calc.title': 'الحاسبات الهندسية المتقدمة',
  'calc.subtitle': 'Engineering Calculators - متوافقة مع SBC 304',
  'calc.activate': 'تفعيل نوفل',
  'calc.active': 'نوفل نشط',
  'calc.inputs': 'المدخلات',
  'calc.results': 'النتائج',
  'calc.calculate': 'احسب الآن',
  'calc.reset': 'إعادة تعيين',
  'calc.compliance': 'التحقق من SBC',
  'calc.recommendations': 'التوصيات',
  
  // Categories
  'category.structural': 'التصميم الإنشائي',
  'category.site': 'حاسبات الموقع',
  'category.cost': 'التكاليف',
};

// English Translations
const translationsEn: Translations = {
  // Common
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.search': 'Search',
  'common.close': 'Close',
  'common.submit': 'Submit',
  
  // NOUFAL Agent
  'noufal.title': 'Ahmed Nageh Noufal Agent',
  'noufal.subtitle': 'Your Smart Assistant for Engineering Calculations and Drawing Plans',
  'noufal.connected': 'Connected & Active',
  'noufal.advanced': 'Advanced AI',
  'noufal.accuracy': 'High Accuracy',
  
  // Quick Access Cards
  'noufal.calculators.title': 'Engineering Calculators',
  'noufal.calculators.subtitle': 'حاسبات هندسية',
  'noufal.calculators.columns': 'Short Column Calculator',
  'noufal.calculators.beams': 'Beam Design Calculator',
  'noufal.calculators.slabs': 'Slab Design Calculator',
  'noufal.calculators.reinforcement': 'Reinforcement Calculator',
  'noufal.calculators.concrete': 'Concrete & Cost Calculator',
  'noufal.calculators.count': '6 Advanced Calculators',
  
  'noufal.drawing.title': 'Drawing Studio',
  'noufal.drawing.subtitle': 'استوديو الرسم',
  'noufal.drawing.plans': 'Architectural Plan Drawing',
  'noufal.drawing.ai': 'AI Design Assistant',
  'noufal.drawing.convert': '2D to 3D Conversion',
  'noufal.drawing.blocks': '157 Block Library',
  'noufal.drawing.hatches': '67 Hatch Patterns',
  'noufal.drawing.status': 'Complete Studio',
  
  'noufal.viewer.title': '3D Viewer',
  'noufal.viewer.subtitle': 'عارض ثلاثي الأبعاد',
  'noufal.viewer.display': '3D Display',
  'noufal.viewer.lighting': 'Realistic Lighting',
  'noufal.viewer.tours': 'Virtual Tours',
  'noufal.viewer.camera': 'Camera Movement',
  'noufal.viewer.daynight': 'Day/Night Mode',
  'noufal.viewer.status': 'Professional Display',
  
  'noufal.analysis.title': 'AI Analysis',
  'noufal.analysis.subtitle': 'تحليل ذكي',
  'noufal.analysis.boq': 'BOQ Analysis',
  'noufal.analysis.scheduling': 'Smart Scheduling',
  'noufal.analysis.sbc': 'SBC 304 Compliance',
  'noufal.analysis.financial': 'Financial Forecasting',
  'noufal.analysis.productivity': 'Productivity Rates',
  'noufal.analysis.count': '10+ Smart Features',
  
  // Stats
  'noufal.stats.calculators': 'Structural Calculators',
  'noufal.stats.blocks': 'Architectural Blocks',
  'noufal.stats.hatches': 'Hatch Patterns',
  'noufal.stats.ai': 'Advanced AI Features',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.executive': 'Executive Dashboard',
  'dashboard.overview': 'Overview',
  
  // Menu
  'menu.home': 'Home',
  'menu.projects': 'Projects',
  'menu.reports': 'Reports',
  'menu.settings': 'Settings',
  
  // Engineering Calculators
  'calc.title': 'Advanced Engineering Calculators',
  'calc.subtitle': 'SBC 304 Compliant',
  'calc.activate': 'Activate NOUFAL',
  'calc.active': 'NOUFAL Active',
  'calc.inputs': 'Inputs',
  'calc.results': 'Results',
  'calc.calculate': 'Calculate Now',
  'calc.reset': 'Reset',
  'calc.compliance': 'SBC Compliance',
  'calc.recommendations': 'Recommendations',
  
  // Categories
  'category.structural': 'Structural Design',
  'category.site': 'Site Calculators',
  'category.cost': 'Cost Estimation',
};

// Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider Component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to Arabic
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'ar';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('app_language', language);
    
    // Update document direction and lang
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translations = language === 'ar' ? translationsAr : translationsEn;
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom Hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
