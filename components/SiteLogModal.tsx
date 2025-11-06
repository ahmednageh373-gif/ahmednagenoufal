import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Send, MapPin, Loader, AlertTriangle } from '../lucide-icons';
// Fix: Removed .ts extension from import path.
import type { Project, SiteLogEntry } from '../types';
import { analyzeSitePhoto } from '../services/geminiService';

interface SiteLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateSiteLog: (projectId: string, newLog: SiteLogEntry[]) => void;
}

export const SiteLogModal: React.FC<SiteLogModalProps> = ({ isOpen, onClose, project, onUpdateSiteLog }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        () => {
          setLocationStatus('error');
        }
      );
    } else {
      // Reset when closed
      setLocation(null);
      setLocationStatus('idle');
    }
  }, [isOpen]);

  const resetForm = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUserNotes('');
    setIsLoading(false);
    setError('');
    setLocation(null);
    setLocationStatus('idle');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('يرجى رفع صورة.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const aiAnalysis = await analyzeSitePhoto(userNotes, imageFile);
      
      const newEntry: SiteLogEntry = {
        id: `log-${Date.now()}`,
        date: new Date().toISOString(),
        photoUrl: previewUrl!, // We know it's there because imageFile is checked
        userNotes,
        aiAnalysis,
        ...(location && { latitude: location.lat, longitude: location.lng }),
      };

      const updatedLog = [...(project.data.siteLog || []), newEntry];
      onUpdateSiteLog(project.id, updatedLog);
      handleClose();

    } catch (err) {
      setError((err as Error).message || 'حدث خطأ غير متوقع أثناء التحليل.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLocationStatus = () => {
    switch(locationStatus) {
        case 'loading':
            return <div className="flex items-center gap-2 text-sm text-slate-500"><Loader size={16} className="animate-spin" /> <span>جاري تحديد الموقع...</span></div>;
        case 'success':
            return <div className="flex items-center gap-2 text-sm text-green-600"><MapPin size={16} /> <span>تم تحديد الموقع بنجاح.</span></div>;
        case 'error':
            return <div className="flex items-center gap-2 text-sm text-red-600"><AlertTriangle size={16} /> <span>فشل تحديد الموقع. سيتم الحفظ بدون إحداثيات.</span></div>;
        default:
            return null;
    }
  }


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">إضافة إدخال جديد لسجل الموقع</h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">صورة الموقع</label>
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" required />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="object-contain h-full w-full rounded-xl" />
              ) : (
                <div className="text-center text-slate-500">
                  <Camera size={48} className="mx-auto mb-2" />
                  <p>انقر لرفع صورة</p>
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="userNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              id="userNotes"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={3}
              placeholder="أضف أي ملاحظات أو سياق إضافي للصورة..."
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <div className="mb-4 h-6">
            {renderLocationStatus()}
          </div>


          <div className="flex justify-end gap-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">
              إلغاء
            </button>
            <button type="submit" disabled={isLoading || !imageFile} className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 flex items-center gap-2 disabled:bg-slate-400">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>جارٍ التحليل والحفظ...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>حفظ وتحليل</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
