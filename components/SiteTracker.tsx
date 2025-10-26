import React, { useState, useMemo } from 'react';
// Fix: Correct import path for types.
// Fix: Add `ScheduleTaskStatus` to the type import to resolve a TypeScript error where the type was not found.
import type { Project, SiteLogEntry, WorkLogEntry, ChecklistItem, ScheduleTask, ChecklistItemCategory, ChecklistItemStatus, ScheduleTaskStatus } from '../types';
import { Plus, Camera, LayoutGrid, Map as MapIcon, File, Printer, Bot, BookOpen, ClipboardList, Check, X, AlertTriangle } from 'lucide-react';
import { SiteLogModal } from './SiteLogModal';
import { generateChecklist } from '../services/geminiService';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';

interface SiteTrackerProps {
    project: Project;
    onUpdateSiteLog: (projectId: string, newLog: SiteLogEntry[]) => void;
    // Add new handlers for the new data types
    onUpdateWorkLog: (projectId: string, newLog: WorkLogEntry[]) => void;
    onUpdateChecklists: (projectId: string, newChecklists: ChecklistItem[]) => void;
    onUpdateSchedule: (projectId: string, newSchedule: ScheduleTask[]) => void;
}

declare var XLSX: any;

// --- New Components for Work Logs and Checklists ---

const WorkLogManager: React.FC<{
    workLog: WorkLogEntry[];
    schedule: ScheduleTask[];
    onAddLog: (log: Omit<WorkLogEntry, 'id'>) => void;
}> = ({ workLog, schedule, onAddLog }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], activitiesPerformed: '', manpowerCount: 0, linkedTaskIds: [] as number[] });

    const handleSave = () => {
        if (!newLog.activitiesPerformed.trim()) return;
        onAddLog(newLog);
        setIsAdding(false);
        setNewLog({ date: new Date().toISOString().split('T')[0], activitiesPerformed: '', manpowerCount: 0, linkedTaskIds: [] });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen/> سجل العمل اليومي</h3>
            {isAdding ? (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <input type="date" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded" />
                    <textarea value={newLog.activitiesPerformed} onChange={e => setNewLog({...newLog, activitiesPerformed: e.target.value})} placeholder="الأنشطة المنجزة اليوم..." rows={3} className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded" />
                    <input type="number" value={newLog.manpowerCount} onChange={e => setNewLog({...newLog, manpowerCount: Number(e.target.value)})} placeholder="عدد العمال" className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded" />
                    {/* Fix: Explicitly type the 'option' parameter in Array.from to resolve TypeScript error. */}
                    <select multiple value={newLog.linkedTaskIds.map(String)} onChange={e => setNewLog({...newLog, linkedTaskIds: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => Number(option.value))})} className="w-full bg-gray-100 dark:bg-gray-800 p-2 rounded h-24">
                        {schedule.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAdding(false)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-sm">إلغاء</button>
                        <button onClick={handleSave} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">حفظ</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900">
                    <Plus size={18}/><span>إضافة سجل عمل جديد</span>
                </button>
            )}
             <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                {workLog.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                    <div key={log.id} className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md text-sm">
                        <p className="font-semibold">{new Date(log.date).toLocaleDateString('ar-SA')}: <span className="font-normal">{log.activitiesPerformed}</span></p>
                        <p className="text-xs text-gray-500">العمال: {log.manpowerCount} | المهام المرتبطة: {log.linkedTaskIds.length}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChecklistManager: React.FC<{
    checklists: ChecklistItem[];
    dailyActivities: string;
    onUpdateChecklists: (items: ChecklistItem[]) => void;
}> = ({ checklists, dailyActivities, onUpdateChecklists }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const newItems = await generateChecklist(dailyActivities);
            onUpdateChecklists([...checklists, ...newItems]);
        } catch (e) {
            alert(`Failed to generate checklist: ${(e as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStatusChange = (id: string, newStatus: ChecklistItemStatus) => {
        onUpdateChecklists(checklists.map(item => item.id === id ? {...item, status: newStatus} : item));
    };

    const groupedItems = checklists.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
    }, {} as Record<ChecklistItemCategory, ChecklistItem[]>);


    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><ClipboardList/> قوائم الفحص (QA/QC & HSE)</h3>
                 <button onClick={handleGenerate} disabled={isLoading || !dailyActivities} className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-teal-700 text-sm disabled:bg-gray-400">
                    {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Bot size={16} />}
                    <span>{isLoading ? '...' : 'توليد قائمة لليوم'}</span>
                </button>
            </div>
             <div className="space-y-4 max-h-80 overflow-y-auto">
                {(['QA/QC', 'HSE'] as ChecklistItemCategory[]).map(category => (
                    groupedItems[category] && (
                        <div key={category}>
                            <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{category}</h4>
                             <div className="space-y-2">
                                {groupedItems[category].map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                        <p className="text-sm">{item.text}</p>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleStatusChange(item.id, 'Pass')} className={`p-1 rounded-full ${item.status === 'Pass' ? 'bg-green-500 text-white' : 'hover:bg-green-100'}`}><Check size={14}/></button>
                                            <button onClick={() => handleStatusChange(item.id, 'Fail')} className={`p-1 rounded-full ${item.status === 'Fail' ? 'bg-red-500 text-white' : 'hover:bg-red-100'}`}><X size={14}/></button>
                                            <button onClick={() => handleStatusChange(item.id, 'N/A')} className={`p-1 rounded-full ${item.status === 'N/A' ? 'bg-gray-500 text-white' : 'hover:bg-gray-100'}`}><span className="text-xs font-bold">N/A</span></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};


// --- Original Components (Adapted) ---

const SiteLogCard: React.FC<{ entry: SiteLogEntry }> = ({ entry }) => {
    const parsedAnalysis = marked.parse(entry.aiAnalysis);
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
            <img src={entry.photoUrl} alt={`Site progress on ${entry.date}`} className="w-full h-64 object-cover" />
            <div className="p-6">
                <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">{new Date(entry.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                {entry.userNotes && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">ملاحظات المستخدم:</h4>
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{entry.userNotes}</p>
                    </div>
                )}
                
                <div className="mt-4">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">تحليل الذكاء الاصطناعي:</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none mt-2" dangerouslySetInnerHTML={{ __html: parsedAnalysis }}></div>
                </div>
            </div>
        </div>
    );
};

const MapView: React.FC<{ entries: SiteLogEntry[] }> = ({ entries }) => {
    const [selectedEntry, setSelectedEntry] = useState<SiteLogEntry | null>(entries[0] || null);
    
    if (entries.length === 0) {
        return (
             <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <MapIcon size={64} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">لا توجد إدخالات ذات موقع جغرافي</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    أضف إدخالات جديدة مع تفعيل خدمة تحديد المواقع لعرضها على الخريطة.
                </p>
            </div>
        );
    }

    const mapSrc = selectedEntry ? `https://www.google.com/maps/embed/v1/view?key=${process.env.API_KEY}&center=${selectedEntry.latitude},${selectedEntry.longitude}&zoom=18&maptype=satellite` : '';

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden h-[75vh]">
            {/* Sidebar with entries */}
            <div className="w-full md:w-1/3 lg:w-1/4 h-1/3 md:h-full overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                {entries.map(entry => (
                    <button 
                        key={entry.id} 
                        onClick={() => setSelectedEntry(entry)}
                        className={`w-full text-right p-3 rounded-lg transition-all ${selectedEntry?.id === entry.id ? 'bg-sky-100 dark:bg-sky-900 ring-2 ring-sky-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <img src={entry.photoUrl} alt={entry.userNotes} className="w-full h-24 object-cover rounded-md mb-2" />
                        <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">{new Date(entry.date).toLocaleDateString('ar-SA')}</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{entry.userNotes || 'لا توجد ملاحظات'}</p>
                    </button>
                ))}
            </div>
            {/* Map iframe */}
            <div className="flex-grow h-2/3 md:h-full">
                {selectedEntry && (
                    <iframe
                        key={selectedEntry.id}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={mapSrc}
                    ></iframe>
                )}
            </div>
        </div>
    );
};


export const SiteTracker: React.FC<SiteTrackerProps> = ({ project, onUpdateSiteLog, onUpdateWorkLog, onUpdateChecklists, onUpdateSchedule }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'visual' | 'map' | 'execution'>('execution');
    const { siteLog, workLog, checklists, schedule } = project.data;

    const sortedLog = useMemo(() => 
        [...(siteLog || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [siteLog]
    );

    const entriesWithLocation = useMemo(() => 
        sortedLog.filter(e => e.latitude != null && e.longitude != null),
        [sortedLog]
    );

    const latestDailyActivities = useMemo(() => {
        const sortedWorkLog = [...(workLog || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sortedWorkLog[0]?.activitiesPerformed || '';
    }, [workLog]);
    
    const handleAddWorkLog = (log: Omit<WorkLogEntry, 'id'>) => {
        const newLog = { ...log, id: uuidv4() };
        onUpdateWorkLog(project.id, [...(workLog || []), newLog]);
        
        // Update schedule progress
        if (newLog.linkedTaskIds.length > 0) {
            const updatedSchedule = schedule.map(task => {
                if (newLog.linkedTaskIds.includes(task.id) && task.status !== 'Done') {
                    // Simple logic: assume some progress is made. Could be more complex.
                    return { ...task, progress: Math.min(100, task.progress + 10), status: 'In Progress' as ScheduleTaskStatus };
                }
                return task;
            });
            onUpdateSchedule(project.id, updatedSchedule);
        }
    };
    
    const handlePrint = () => { window.print(); };

    const handleExportXLSX = () => {
        const dataToExport = sortedLog.map(entry => ({
            'التاريخ': new Date(entry.date).toLocaleString('ar-SA'), 'ملاحظات المستخدم': entry.userNotes,
            'تحليل AI': entry.aiAnalysis.replace(/<[^>]*>?/gm, ''),
            'خط العرض': entry.latitude, 'خط الطول': entry.longitude,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Site Log");
        XLSX.writeFile(workbook, `site_log_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    const renderContent = () => {
        switch(viewMode) {
            case 'execution':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <WorkLogManager workLog={workLog || []} schedule={schedule} onAddLog={handleAddWorkLog} />
                        <ChecklistManager checklists={checklists || []} dailyActivities={latestDailyActivities} onUpdateChecklists={(items) => onUpdateChecklists(project.id, items)} />
                    </div>
                );
            case 'visual':
                 return sortedLog.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedLog.map(entry => (
                            <SiteLogCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                        <Camera size={64} className="mx-auto text-slate-400 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">السجل فارغ</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">ابدأ بتوثيق تقدم المشروع عن طريق إضافة أول إدخال لك.</p>
                    </div>
                );
            case 'map':
                return <MapView entries={entriesWithLocation} />;
        }
    }

    return (
        <div className="printable-area">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">مركز التنفيذ الميداني</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        توثيق التقدم، تسجيل الأعمال اليومية، وإدارة الجودة والسلامة لمشروع: <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"><File size={18} /><span>تصدير Excel</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600"><Printer size={18} /><span>طباعة / PDF</span></button>
                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                         <button onClick={() => setViewMode('execution')} className={`p-2 rounded-md ${viewMode === 'execution' ? 'bg-white dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`} aria-label="Execution view"><BookOpen size={18} /></button>
                        <button onClick={() => setViewMode('visual')} className={`p-2 rounded-md ${viewMode === 'visual' ? 'bg-white dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`} aria-label="Grid view"><LayoutGrid size={18} /></button>
                        <button onClick={() => setViewMode('map')} className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-white dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`} aria-label="Map view"><MapIcon size={18} /></button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700"><Plus size={18} /><span>إضافة سجل مرئي</span></button>
                </div>
            </div>

            {renderContent()}
            
            <SiteLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={project}
                onUpdateSiteLog={onUpdateSiteLog}
            />
        </div>
    );
};