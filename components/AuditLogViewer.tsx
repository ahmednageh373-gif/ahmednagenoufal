import React from 'react';
import { History, User, Bot } from '../lucide-icons';

export const AuditLogViewer: React.FC = () => {
    // This is a placeholder component. In a real application, you would fetch audit log data.
    const mockLogs = [
        { id: 1, user: 'أحمد', actorType: 'user', action: 'أضاف مهمة جديدة: "صب خرسانة السطح"', timestamp: '2024-07-20T10:30:00Z' },
        { id: 2, user: 'فاطمة', actorType: 'user', action: 'حدّثت حالة الخطر "تأخر المواد" إلى "قيد التنفيذ"', timestamp: '2024-07-20T09:15:00Z' },
        { id: 3, user: 'النظام (AI)', actorType: 'ai', action: 'أنشأ تقرير هندسة القيمة بناءً على طلب المستخدم.', timestamp: '2024-07-19T17:00:00Z' },
        { id: 4, user: 'أحمد', actorType: 'user', action: 'قام برفع مقايسة جديدة: "BOQ_v2.xlsx"', timestamp: '2024-07-19T14:22:00Z' },
        { id: 5, user: 'النظام (AI)', actorType: 'ai', action: 'أنشأ جدولاً زمنياً أولياً من المقايسة المرفوعة.', timestamp: '2024-07-19T14:23:10Z' },
        { id: 6, user: 'سارة', actorType: 'user', action: 'أضافت صورة جديدة لسجل الموقع.', timestamp: '2024-07-18T11:45:00Z' },
        { id: 7, user: 'النظام (AI)', actorType: 'ai', action: 'حلل صورة الموقع وأضاف تقريراً.', timestamp: '2024-07-18T11:45:25Z' },

    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const getActorIcon = (actorType: 'user' | 'ai') => {
        if (actorType === 'ai') {
            return <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full"><Bot size={20} className="text-indigo-500" /></div>;
        }
        return <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full"><User size={20} className="text-gray-500" /></div>;
    }

    return (
        <div>
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3"><History />سجل التدقيق</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        عرض التغييرات والأحداث الهامة في المشروع بالترتيب الزمني.
                    </p>
                </div>
            </header>
            
             <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                 <div className="relative pl-8">
                    {/* Vertical line */}
                    <div className="absolute top-0 left-4 w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                    
                    <div className="space-y-8">
                        {mockLogs.map(log => (
                            <div key={log.id} className="relative flex items-start gap-4">
                                <div className="absolute top-0 left-4 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-600 rounded-full border-2 border-gray-300 dark:border-gray-500"></div>
                                <div className="bg-white dark:bg-gray-900/50 z-10">
                                    {getActorIcon(log.actorType as 'user' | 'ai')}
                                </div>
                                <div className="pt-1.5">
                                    <p className="font-medium">{log.action}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        بواسطة <span className={`font-semibold ${log.actorType === 'ai' ? 'text-indigo-500' : ''}`}>{log.user}</span> - {new Date(log.timestamp).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
};
