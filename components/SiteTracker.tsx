
import React, { useState, useMemo } from 'react';
// Fix: Correct import path for types.
import type { Project, SiteLogEntry } from '../types';
import { Plus, Camera, LayoutGrid, Map as MapIcon, File, Printer } from 'lucide-react';
import { SiteLogModal } from './SiteLogModal';
import { marked } from 'marked';

interface SiteTrackerProps {
    project: Project;
    onUpdateSiteLog: (projectId: string, newLog: SiteLogEntry[]) => void;
}

declare var XLSX: any;

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


export const SiteTracker: React.FC<SiteTrackerProps> = ({ project, onUpdateSiteLog }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const siteLog = project.data.siteLog || [];

    const sortedLog = useMemo(() => 
        [...siteLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [siteLog]
    );

    const entriesWithLocation = useMemo(() => 
        sortedLog.filter(e => e.latitude != null && e.longitude != null),
        [sortedLog]
    );
    
    const handlePrint = () => {
        window.print();
    };

    const handleExportXLSX = () => {
        const dataToExport = sortedLog.map(entry => ({
            'التاريخ': new Date(entry.date).toLocaleString('ar-SA'),
            'ملاحظات المستخدم': entry.userNotes,
            'تحليل AI': entry.aiAnalysis.replace(/<[^>]*>?/gm, ''), // strip markdown/html
            'خط العرض': entry.latitude,
            'خط الطول': entry.longitude,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Site Log");
        XLSX.writeFile(workbook, `site_log_${project.name.replace(/\s/g, '_')}.xlsx`);
    };

    return (
        <div className="printable-area">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4 no-print">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">متابعة الموقع (سجل مرئي)</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        توثيق التقدم المرئي لمشروع: <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportXLSX} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"><File size={18} /><span>تصدير Excel</span></button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600"><Printer size={18} /><span>طباعة / PDF</span></button>
                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}
                            aria-label="Grid view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-white dark:bg-slate-800 shadow-sm text-sky-600' : 'text-slate-500'}`}
                            aria-label="Map view"
                        >
                            <MapIcon size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>إضافة إدخال جديد</span>
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                sortedLog.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedLog.map(entry => (
                            <SiteLogCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                        <Camera size={64} className="mx-auto text-slate-400 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">السجل فارغ</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            ابدأ بتوثيق تقدم المشروع عن طريق إضافة أول إدخال لك.
                        </p>
                    </div>
                )
            ) : (
                <MapView entries={entriesWithLocation} />
            )}
            
            <SiteLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={project}
                onUpdateSiteLog={onUpdateSiteLog}
            />
        </div>
    );
};
