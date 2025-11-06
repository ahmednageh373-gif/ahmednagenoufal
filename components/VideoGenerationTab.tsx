import React, { useState } from 'react';
import { generateVideos } from '../services/geminiService';
import { Clapperboard, Video } from 'lucide-react';
import { ApiKeyManager } from './ApiKeyManager';

type AspectRatio = '16:9' | '9:16';
type Resolution = '1080p' | '720p';

const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: '16:9', label: 'Landscape' },
    { value: '9:16', label: 'Portrait' },
];

const resolutions: { value: Resolution; label: string }[] = [
    { value: '1080p', label: '1080p (HD)' },
    { value: '720p', label: '720p (Fast)' },
];

const loadingMessages = [
    "جاري تهيئة محركات الفيديو...",
    "يتم الآن تحويل أفكارك إلى بيكسلات...",
    "لحظات قليلة، يتم الآن بناء عالمك المرئي...",
    "قد يستغرق إنشاء الفيديو بضع دقائق، شكراً لصبرك...",
    "النماذج الذكية تعمل بجد لإنشاء الفيديو الخاص بك..."
];

export const VideoGenerationTab: React.FC = () => {
    const [prompt, setPrompt] = useState('A drone shot flying over a futuristic construction site of a massive skyscraper in Riyadh, Saudi Arabia. Neon lights, flying vehicles, and robotic workers are visible.');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [resolution, setResolution] = useState<Resolution>('720p');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isKeySelected, setIsKeySelected] = useState(false);

    React.useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);
    
    const handleResetKeySelection = () => {
        setIsKeySelected(false);
        setError("فشل الطلب. قد يكون مفتاح API المحدد غير صالح. يرجى تحديد مفتاح آخر والمحاولة مرة أخرى.");
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedVideoUrl(null);
        try {
            const videoUrl = await generateVideos(prompt, aspectRatio, resolution);
            setGeneratedVideoUrl(videoUrl);
        } catch (err) {
            const errorMessage = (err as Error).message || 'An unexpected error occurred during video generation.';
            if (errorMessage.includes("Requested entity was not found.")) {
                handleResetKeySelection();
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isKeySelected) {
        return <ApiKeyManager onKeySelected={() => setIsKeySelected(true)} />;
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
                        <Clapperboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">إنشاء الفيديو (Veo)</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           حوّل النصوص إلى مقاطع فيديو عالية الجودة. كن وصفيًا قدر الإمكان للحصول على أفضل النتائج.
                        </p>
                    </div>
                </div>

                <div>
                    <label htmlFor="video-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">وصف الفيديو المطلوب</label>
                    <textarea id="video-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"/>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الأبعاد</label>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            {aspectRatios.map(({ value, label }) => (
                                <button key={value} onClick={() => setAspectRatio(value)} className={`w-full py-2 text-sm rounded-md ${aspectRatio === value ? 'bg-white dark:bg-gray-900 shadow-sm' : ''}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الدقة</label>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            {resolutions.map(({ value, label }) => (
                                <button key={value} onClick={() => setResolution(value)} className={`w-full py-2 text-sm rounded-md ${resolution === value ? 'bg-white dark:bg-gray-900 shadow-sm' : ''}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                     <button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Clapperboard size={20} />}
                        <span>{isLoading ? '...جاري الإنشاء' : 'إنشاء الفيديو'}</span>
                    </button>
                </div>
            </div>

             <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm flex items-center justify-center min-h-[400px]">
                 {error && <div className="text-center text-red-500"><p><strong>فشل إنشاء الفيديو:</strong> {error}</p></div>}
                {isLoading && (
                    <div className="text-center text-slate-500">
                        <div className="animate-pulse flex flex-col items-center">
                            <Video size={64} className="mb-4" />
                            <p className="font-semibold">{loadingMessage}</p>
                        </div>
                    </div>
                )}
                {generatedVideoUrl && !isLoading && (
                    <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                )}
                {!isLoading && !generatedVideoUrl && !error && (
                    <div className="text-center text-slate-500">
                        <Video size={64} className="mx-auto mb-4" />
                        <p>سيظهر الفيديو الذي تم إنشاؤه هنا.</p>
                    </div>
                )}
            </div>
        </div>
    );
};