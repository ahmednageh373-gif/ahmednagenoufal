import React from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onForward?: () => void;
  onHome?: () => void;
  showBack?: boolean;
  showForward?: boolean;
  showHome?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onForward,
  onHome,
  showBack = true,
  showForward = false,
  showHome = true,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="رجوع"
        >
          <ArrowRight size={20} />
          <span className="font-semibold">رجوع</span>
        </button>
      )}
      
      {showHome && onHome && (
        <button
          onClick={onHome}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="الصفحة الرئيسية"
        >
          <Home size={20} />
          <span className="font-semibold">الرئيسية</span>
        </button>
      )}
      
      {showForward && onForward && (
        <button
          onClick={onForward}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="تقدم"
        >
          <span className="font-semibold">تقدم</span>
          <ArrowLeft size={20} />
        </button>
      )}
    </div>
  );
};
