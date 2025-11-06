
import React, { useState, useEffect } from 'react';
import { KeyRound } from '../lucide-icons';

interface ApiKeyManagerProps {
  onKeySelected: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      setIsChecking(true);
      const keySelected = await window.aistudio.hasSelectedApiKey();
      setHasKey(keySelected);
      if (keySelected) {
        onKeySelected();
      }
      setIsChecking(false);
    };
    checkKey();
  }, [onKeySelected]);

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    // Assume success to handle race condition and immediately let the user proceed.
    setHasKey(true);
    onKeySelected();
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p>جاري التحقق من مفتاح API...</p>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8">
        <KeyRound size={64} className="text-indigo-400 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">مطلوب مفتاح API للمتابعة</h2>
        <p className="max-w-md mb-6">
          لاستخدام ميزات إنشاء الفيديو المتقدمة (Veo)، يجب عليك تحديد مفتاح API الخاص بك. هذا يضمن أن استخدامك مرتبط بحسابك الخاص.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105"
        >
          اختر مفتاح API
        </button>
        <p className="text-xs mt-4">
          بالنقر على الزر، فإنك توافق على الشروط. قد يتم تطبيق رسوم. للمزيد من المعلومات حول التسعير، يرجى زيارة{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:underline"
          >
            وثائق الفوترة
          </a>.
        </p>
      </div>
    );
  }

  return null; // Don't render anything if the key is selected
};
