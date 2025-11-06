import React, { useState } from 'react';
import { generateSubTasksFromDescription } from '../services/geminiService';
import { X, Bot, Plus } from '../lucide-icons';

interface GeneratedTask {
    name: string;
    duration: number;
    predecessors: string[];
}

interface SubTaskGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: GeneratedTask[]) => void;
}

export const SubTaskGeneratorModal: React.FC<SubTaskGeneratorModalProps> = ({ isOpen, onClose, onAddTasks }) => {
    const [description, setDescription] = useState('أعمال الواجهات الخارجية للمبنى الرئيسي');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedTasks([]);
        try {
            const tasks = await generateSubTasksFromDescription(description);
            setGeneratedTasks(tasks);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddAndClose = () => {
        onAddTasks(generatedTasks);
        onClose();
    };
    
    // Reset state when modal is closed
    const handleClose = () => {
        setDescription('أعمال الواجهات الخارجية للمبنى الرئيسي');
        setGeneratedTasks([]);
        setError('');
        setIsLoading(false);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="modal" style={{ display: 'block' }} onClick={handleClose}>
            <div className="modal-content p-8 max-w-3xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">المحلل الذكي للمهام</h2>
                    <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>
                
                <p className="mb-4 text-slate-600 dark:text-slate-400">
                    اكتب وصفًا لنشاط أو مرحلة عمل، وسيقوم الذكاء الاصطناعي بتقسيمها إلى مهام فرعية مفصلة مع تقدير للمدد والترتيب المنطقي.
                </p>

                <div className="mb-4">
                    <label htmlFor="taskDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">وصف النشاط</label>
                    <textarea
                        id="taskDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="مثال: تشطيبات الطابق الأول"
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button onClick={handleGenerate} disabled={isLoading || !description.trim()} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 disabled:bg-gray-400">
                        {isLoading ? (
                            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>...جاري التوليد</span></>
                        ) : (
                            <><Bot size={18}/><span>توليد المهام</span></>
                        )}
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                {generatedTasks.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold mb-2">المهام المقترحة:</h3>
                        <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="p-2">المهمة</th>
                                        <th className="p-2">المدة (أيام)</th>
                                        <th className="p-2">تعتمد على</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generatedTasks.map((task, index) => (
                                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                            <td className="p-2 font-medium">{task.name}</td>
                                            <td className="p-2 text-center">{task.duration}</td>
                                            <td className="p-2">{task.predecessors.join(', ') || 'لا يوجد'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">إلغاء</button>
                            <button type="button" onClick={handleAddAndClose} className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 font-semibold flex items-center gap-2">
                                <Plus size={18} />
                                إضافة المهام للجدول
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};