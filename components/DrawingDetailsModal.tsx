import React, { useState, useEffect, useRef } from 'react';
// Fix: Removed .ts extension from import path.
import type { Drawing, DrawingVersion, ScheduleTask } from '../types';
import { X, Upload, Download, File as FileIcon } from 'lucide-react';

interface DrawingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drawing: Drawing) => void;
  drawing: Drawing;
  scheduleTasks: ScheduleTask[];
}

export const DrawingDetailsModal: React.FC<DrawingDetailsModalProps> = ({ isOpen, onClose, onSave, drawing, scheduleTasks }) => {
  const [title, setTitle] = useState(drawing.title);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<DrawingVersion | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setTitle(drawing.title);
        setSelectedTaskIds(drawing.scheduleTaskIds || []);
        // Set the latest version as the default selected one when the modal opens
        if (drawing.versions.length > 0) {
            const latestVersion = [...drawing.versions].sort((a, b) => b.version - a.version)[0];
            setSelectedVersion(latestVersion);
        } else {
            setSelectedVersion(null);
        }
    }
  }, [drawing, isOpen]);


  const handleSave = () => {
    onSave({ ...drawing, title, scheduleTaskIds: selectedTaskIds });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewVersionFile(e.target.files[0]);
    }
  };

  const handleAddNewVersion = async () => {
    if (!newVersionFile || !newVersionDescription) {
      alert("يرجى تقديم وصف وملف للإصدار الجديد.");
      return;
    }

    const fileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(newVersionFile);
    });

    const newVersion: DrawingVersion = {
      version: drawing.versions.length > 0 ? Math.max(...drawing.versions.map(v => v.version)) + 1 : 1,
      date: new Date().toISOString().split('T')[0],
      description: newVersionDescription,
      url: fileUrl,
      fileName: newVersionFile.name,
    };
    
    const updatedDrawing = {
        ...drawing,
        title,
        scheduleTaskIds: selectedTaskIds,
        versions: [...drawing.versions, newVersion]
    };
    onSave(updatedDrawing);

    // Reset form and select new version
    setNewVersionDescription('');
    setNewVersionFile(null);
    setSelectedVersion(newVersion);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderPreview = () => {
    if (!selectedVersion) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg">
                <FileIcon size={64} className="text-gray-400 mb-4" />
                <p className="text-gray-500">لا يوجد إصدار لعرضه.</p>
            </div>
        );
    }

    // MIME type might not be in the URL for all file types, but it is for data URLs
    const mimeType = selectedVersion.url.startsWith('data:') 
        ? selectedVersion.url.split(';')[0].split(':')[1]
        : '';

    if (mimeType.startsWith('image/')) {
        return <img src={selectedVersion.url} alt={`Preview of ${selectedVersion.fileName}`} className="w-full h-full object-contain" />;
    }

    if (mimeType === 'application/pdf') {
        return <iframe src={selectedVersion.url} title={selectedVersion.fileName} className="w-full h-full border-0" />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-center">
            <FileIcon size={64} className="text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-semibold">المعاينة غير متاحة</p>
            <p className="text-sm text-gray-500">نوع الملف '{selectedVersion.fileName.split('.').pop()}' غير مدعوم للعرض المباشر.</p>
            <a href={selectedVersion.url} download={selectedVersion.fileName} className="mt-4 flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                <Download size={16} />
                تحميل الملف
            </a>
        </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content p-8 max-w-6xl dark:bg-gray-800 flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">تفاصيل المخطط</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
            {/* Left Column: Details & Versions */}
            <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
                 <div>
                    <label htmlFor="drawingTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">عنوان المخطط</label>
                    <input
                        id="drawingTitle"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                
                <div>
                    <label htmlFor="linkedTasks" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">المهام المرتبطة بالجدول الزمني</label>
                    <select
                        id="linkedTasks"
                        multiple
                        value={selectedTaskIds.map(String)}
                        // Fix: Explicitly type the 'option' parameter to resolve TypeScript error where it was inferred as 'unknown'.
                        onChange={(e) => setSelectedTaskIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => Number(option.value)))}
                        className="w-full h-40 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {scheduleTasks.map(task => (
                            <option key={task.id} value={task.id}>{task.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">يمكنك تحديد مهام متعددة بالضغط على Ctrl/Cmd.</p>
                </div>


                <div>
                    <h3 className="text-lg font-semibold mb-2">الإصدارات</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-sm">
                                <tr>
                                    <th className="p-2">الإصدار</th>
                                    <th className="p-2">التاريخ</th>
                                    <th className="p-2">الوصف</th>
                                </tr>
                            </thead>
                        </table>
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-right">
                                <tbody>
                                    {drawing.versions.sort((a,b)=> b.version - a.version).map(v => (
                                        <tr key={v.version} 
                                            onClick={() => setSelectedVersion(v)}
                                            className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm cursor-pointer transition-colors ${selectedVersion?.version === v.version ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                            <td className="p-2 font-mono w-16">v{v.version}</td>
                                            <td className="p-2 w-24">{v.date}</td>
                                            <td className="p-2">{v.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         {drawing.versions.length === 0 && <p className="text-center p-4 text-slate-500">لا توجد إصدارات.</p>}
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold mb-2">إضافة إصدار جديد</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="وصف الإصدار (مثال: تعديل الواجهة الرئيسية)"
                            value={newVersionDescription}
                            onChange={(e) => setNewVersionDescription(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <button 
                        onClick={handleAddNewVersion}
                        disabled={!newVersionDescription || !newVersionFile}
                        className="mt-4 flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400">
                        <Upload size={18} />
                        <span>رفع وإضافة الإصدار</span>
                    </button>
                </div>
            </div>

             {/* Right Column: Preview */}
            <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                {renderPreview()}
            </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
            إلغاء
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
            حفظ التغييرات وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
