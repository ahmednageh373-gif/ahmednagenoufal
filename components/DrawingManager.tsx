

import React, { useState, useMemo, useRef } from 'react';
// Fix: Correct import path for types.
import type { Project, Drawing, DrawingFolder, DrawingVersion, ScheduleTask } from '../types';
import { Folder, FileText, Plus, Upload, Trash2, Home, X, Check, ChevronRight, UploadCloud, Loader2, File, Printer } from 'lucide-react';
import { DrawingDetailsModal } from './DrawingDetailsModal';
import { DrawingThumbnail } from './DrawingThumbnail';

interface DrawingManagerProps {
    project: Project;
    onUpdateDrawings: (projectId: string, newDrawings: Drawing[], newFolders: DrawingFolder[]) => void;
}

declare var XLSX: any;

// --- Upload Modal Component ---
const UploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpload: (filesWithTitles: { file: File; title: string }[]) => Promise<void>;
    initialFiles: File[];
}> = ({ isOpen, onClose, onUpload, initialFiles }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [titles, setTitles] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState<Record<number, 'pending' | 'uploading' | 'done'>>({});
    const [isUploading, setIsUploading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setFiles(initialFiles);
            setTitles(initialFiles.map(f => f.name.replace(/\.[^/.]+$/, "")));
            setUploadStatus({});
            setIsUploading(false);
        }
    }, [isOpen, initialFiles]);

    const handleTitleChange = (index: number, newTitle: string) => {
        const newTitles = [...titles];
        newTitles[index] = newTitle;
        setTitles(newTitles);
    };

    const handleUploadClick = async () => {
        setIsUploading(true);
        const filesWithTitles = files.map((file, index) => ({ file, title: titles[index] }));

        // Simulate progress for UX
        for (let i = 0; i < files.length; i++) {
            setUploadStatus(prev => ({ ...prev, [i]: 'uploading' }));
            await new Promise(res => setTimeout(res, 200)); // Simulate network latency
            setUploadStatus(prev => ({ ...prev, [i]: 'done' }));
        }

        await onUpload(filesWithTitles);

        setTimeout(() => {
             onClose();
        }, 1000); // Keep modal open briefly to show "done" status
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal" style={{ display: 'block' }} onClick={onClose}>
            <div className="modal-content p-8 max-w-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">رفع مخططات جديدة</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                            <FileText size={24} className="text-indigo-500 shrink-0"/>
                            <div className="flex-grow">
                                <input 
                                    type="text"
                                    value={titles[index]}
                                    onChange={e => handleTitleChange(index, e.target.value)}
                                    className="w-full bg-transparent font-semibold focus:outline-none"
                                    disabled={isUploading}
                                />
                                <p className="text-xs text-gray-500">{file.name} - {(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            {uploadStatus[index] === 'uploading' && <Loader2 size={20} className="animate-spin text-indigo-500" />}
                            {uploadStatus[index] === 'done' && <Check size={20} className="text-green-500" />}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onClose} disabled={isUploading} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600">إلغاء</button>
                    <button onClick={handleUploadClick} disabled={isUploading || files.length === 0} className="py-2 px-4 rounded-lg bg-indigo-600 text-white flex items-center gap-2">
                        {isUploading ? 'جاري الرفع...' : `رفع ${files.length} مخططات`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Drawing Manager Component ---
export const DrawingManager: React.FC<DrawingManagerProps> = ({ project, onUpdateDrawings }) => {
    const drawings = project.data.drawings || [];
    const folders = project.data.drawingFolders || [];

    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    
    // Drag & Drop States
    const [draggedDrawingId, setDraggedDrawingId] = useState<string | null>(null);
    const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);
    const [isFileDragOver, setIsFileDragOver] = useState(false);

    // Upload Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const currentFolder = useMemo(() => folders.find(f => f.id === currentFolderId), [folders, currentFolderId]);

    const { subFolders, folderDrawings } = useMemo(() => {
        const subFolders = folders.filter(f => f.parentId === currentFolderId).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        const folderDrawings = drawings.filter(d => d.folderId === currentFolderId).sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        return { subFolders, folderDrawings };
    }, [currentFolderId, drawings, folders]);

    const breadcrumbs = useMemo(() => {
        const crumbs: DrawingFolder[] = [];
        let folder = currentFolder;
        while (folder) {
            crumbs.unshift(folder);
            folder = folders.find(f => f.id === folder?.parentId);
        }
        return crumbs;
    }, [currentFolder, folders]);

    // --- Data Update Handlers ---
    const handleUpdateDrawing = (updatedDrawing: Drawing) => {
        const newDrawings = drawings.map(d => d.id === updatedDrawing.id ? updatedDrawing : d);
        onUpdateDrawings(project.id, newDrawings, folders);
        setSelectedDrawing(null);
    };

    const handleAddFolder = () => {
        if (!newFolderName.trim()) return;
        const newFolder: DrawingFolder = { id: `folder-${Date.now()}`, name: newFolderName.trim(), parentId: currentFolderId };
        onUpdateDrawings(project.id, drawings, [...folders, newFolder]);
        setNewFolderName('');
        setIsAddingFolder(false);
    };

    const handleDeleteFolder = (folderId: string) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا المجلد وجميع محتوياته؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        const foldersToDelete = new Set<string>([folderId]);
        const drawingsToDelete = new Set<string>();
        const findChildren = (parentId: string | null) => {
            folders.filter(f => f.parentId === parentId).forEach(f => { foldersToDelete.add(f.id); findChildren(f.id); });
            drawings.filter(d => d.folderId === parentId).forEach(d => drawingsToDelete.add(d.id));
        };
        findChildren(folderId);
        onUpdateDrawings(project.id, drawings.filter(d => !drawingsToDelete.has(d.id)), folders.filter(f => !foldersToDelete.has(f.id)));
    };

    const handleDeleteDrawing = (drawingId: string) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا المخطط؟")) return;
        onUpdateDrawings(project.id, drawings.filter(d => d.id !== drawingId), folders);
    };

    // --- Upload Handlers ---
    const openUploadModalWithFiles = (files: File[]) => {
        if (files.length > 0) {
            setFilesToUpload(files);
            setIsUploadModalOpen(true);
        }
    };
    
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            openUploadModalWithFiles(Array.from(e.target.files));
        }
    };
    
    const handleBatchUpload = async (filesWithTitles: { file: File; title: string }[]) => {
        const newDrawings: Drawing[] = [...drawings];
        for (const { file, title } of filesWithTitles) {
             const fileUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const newVersion: DrawingVersion = { version: 1, date: new Date().toISOString().split('T')[0], description: 'الإصدار الأولي', url: fileUrl, fileName: file.name };
            const newDrawing: Drawing = { id: `dwg-${Date.now()}-${Math.random()}`, title, folderId: currentFolderId, versions: [newVersion] };
            newDrawings.push(newDrawing);
        }
        onUpdateDrawings(project.id, newDrawings, folders);
    };

    // --- Drag & Drop Handlers ---
    const handleFileDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); if (e.dataTransfer.types.includes('Files')) setIsFileDragOver(true); };
    const handleFileDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsFileDragOver(false); };
    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsFileDragOver(false);
        openUploadModalWithFiles(Array.from(e.dataTransfer.files));
    };
    const handleDrawingDragStart = (e: React.DragEvent<HTMLDivElement>, drawingId: string) => {
        e.dataTransfer.setData('application/an.ai.drawing-id', drawingId);
        setDraggedDrawingId(drawingId);
    };
    const handleDrawingDragEnd = () => { setDraggedDrawingId(null); setDropTargetFolderId(null); };
    const handleFolderDragOver = (e: React.DragEvent<HTMLDivElement>, folderId: string) => { e.preventDefault(); if (draggedDrawingId) setDropTargetFolderId(folderId); };
    const handleFolderDragLeave = () => setDropTargetFolderId(null);
    const handleFolderDrop = (e: React.DragEvent<HTMLDivElement>, folderId: string) => {
        e.preventDefault();
        const droppedDrawingId = e.dataTransfer.getData('application/an.ai.drawing-id');
        if (droppedDrawingId && drawings.find(d => d.id === droppedDrawingId)?.folderId !== folderId) {
            const updatedDrawings = drawings.map(d => d.id === droppedDrawingId ? { ...d, folderId: folderId } : d);
            onUpdateDrawings(project.id, updatedDrawings, folders);
        }
        handleDrawingDragEnd();
    };
    
    const handlePrint = () => {
        window.print();
    };

    const handleExportXLSX = () => {
        const data = [
            ...subFolders.map(f => ({ 'النوع': 'مجلد', 'الاسم': f.name, 'معلومات إضافية': '' })),
            ...folderDrawings.map(d => {
                const latestVersion = d.versions.length > 0 ? d.versions.sort((a, b) => b.version - a.version)[0] : null;
                return {
                    'النوع': 'مخطط',
                    'الاسم': d.title,
                    'معلومات إضافية': `الإصدار الأحدث: v${latestVersion?.version || 'N/A'} بتاريخ ${latestVersion?.date || 'N/A'}`
                };
            })
        ];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Drawings");
        XLSX.writeFile(workbook, `drawings_${currentFolder?.name || 'root'}_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    return (
        <div className="printable-area">
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold">إدارة المخططات</h1>
                    <p className="text-gray-500 mt-1">تنظيم وعرض المخططات الهندسية لمشروع: <span className="font-semibold">{project.name}</span></p>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"><File size={18} /><span>تصدير Excel</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600"><Printer size={18} /><span>طباعة / PDF</span></button>
                    <button onClick={() => setIsAddingFolder(true)} className="flex items-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800">
                        <Plus size={18} /><span>مجلد جديد</span>
                    </button>
                    <button onClick={() => uploadInputRef.current?.click()} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">
                        <Upload size={18} /><span>رفع مخططات</span>
                    </button>
                    <input type="file" multiple ref={uploadInputRef} onChange={handleFileInputChange} className="hidden" />
                </div>
            </header>

            <div 
                className={`relative bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300 ${isFileDragOver ? 'border-indigo-500 border-dashed bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                onDragOver={handleFileDragOver}
                onDragLeave={handleFileDragLeave}
                onDrop={handleFileDrop}
            >
                {isFileDragOver && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl pointer-events-none no-print">
                        <UploadCloud size={64} className="text-white mb-4" />
                        <p className="text-white font-bold text-lg">أفلت الملفات هنا لرفعها</p>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 no-print">
                    <button onClick={() => setCurrentFolderId(null)} className="flex items-center gap-1 text-gray-500 hover:text-indigo-600"><Home size={16} /> الرئيسية</button>
                    {breadcrumbs.map(crumb => (
                        <React.Fragment key={crumb.id}>
                            <ChevronRight size={16} className="text-gray-400" />
                            <button onClick={() => setCurrentFolderId(crumb.id)} className="text-gray-500 hover:text-indigo-600">{crumb.name}</button>
                        </React.Fragment>
                    ))}
                </div>

                {isAddingFolder && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 flex items-center gap-2 no-print">
                        <Folder size={20} className="text-indigo-500"/>
                        <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="اسم المجلد الجديد" autoFocus className="flex-grow bg-transparent focus:outline-none" onKeyDown={e => e.key === 'Enter' && handleAddFolder()} />
                        <button onClick={handleAddFolder} className="p-1 text-green-500 hover:bg-green-100 rounded-full"><Check size={18}/></button>
                        <button onClick={() => setIsAddingFolder(false)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><X size={18}/></button>
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {subFolders.map(folder => (
                        <div key={folder.id} onDragOver={(e) => handleFolderDragOver(e, folder.id)} onDragLeave={handleFolderDragLeave} onDrop={(e) => handleFolderDrop(e, folder.id)} className={`group relative transition-all rounded-lg ${dropTargetFolderId === folder.id ? 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                            <button onDoubleClick={() => setCurrentFolderId(folder.id)} className="w-full flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-center aspect-square transition-colors">
                                <Folder size={48} className="text-indigo-500 mb-2" />
                                <span className="text-sm font-medium break-all">{folder.name}</span>
                            </button>
                            <button onClick={() => handleDeleteFolder(folder.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 no-print"><Trash2 size={16} /></button>
                        </div>
                    ))}
                    {folderDrawings.map(drawing => (
                         <div key={drawing.id} draggable onDragStart={(e) => handleDrawingDragStart(e, drawing.id)} onDragEnd={handleDrawingDragEnd} className={`group relative cursor-move ${draggedDrawingId === drawing.id ? 'opacity-30' : ''}`}>
                             <button onClick={() => setSelectedDrawing(drawing)} className="w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-center aspect-square overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:shadow-md">
                                <div className="flex-grow w-full h-full flex items-center justify-center relative"><DrawingThumbnail drawing={drawing} /></div>
                                <div className="w-full p-2 bg-white/70 dark:bg-black/70 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-sm font-medium break-all text-gray-800 dark:text-gray-200">{drawing.title}</span>
                                </div>
                            </button>
                             <button onClick={() => handleDeleteDrawing(drawing.id)} className="absolute top-2 right-2 p-1 text-gray-400 bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 no-print"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>

                {subFolders.length === 0 && folderDrawings.length === 0 && !isAddingFolder && (
                    <div className="text-center py-16 text-gray-500"><Folder size={48} className="mx-auto mb-4" /><p>هذا المجلد فارغ.</p></div>
                )}
            </div>

            {selectedDrawing && (
                <DrawingDetailsModal isOpen={!!selectedDrawing} onClose={() => setSelectedDrawing(null)} onSave={handleUpdateDrawing} drawing={selectedDrawing} scheduleTasks={project.data.schedule} />
            )}
            
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleBatchUpload} initialFiles={filesToUpload} />
        </div>
    );
};
