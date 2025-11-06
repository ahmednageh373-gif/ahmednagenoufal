


import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: '16:9', label: 'Landscape' },
    { value: '1:1', label: 'Square' },
    { value: '9:16', label: 'Portrait' },
    { value: '4:3', label: 'Standard' },
    { value: '3:4', label: 'Vertical' },
];

export const ImageGenerationTab: React.FC = () => {
    const [prompt, setPrompt] = useState('A photorealistic image of a futuristic skyscraper made of sustainable materials, with flying vehicles around it, golden hour lighting.');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedImage(null);
        try {
            const base64Image = await generateImage(prompt, aspectRatio);
            setGeneratedImage(`data:image/jpeg;base64,${base64Image}`);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred during image generation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full">
                        <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">إنشاء الصور بالذكاء الاصطناعي</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           حوّل أفكارك إلى صور مرئية. صف المشهد أو المفهوم الذي تريده بالتفصيل.
                        </p>
                    </div>
                </div>

                <div>
                    <label htmlFor="generation-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        وصف الصورة المطلوبة
                    </label>
                    <textarea
                        id="generation-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        نسبة العرض إلى الارتفاع
                    </label>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {aspectRatios.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setAspectRatio(value)}
                                className={`w-full py-2 text-xs md:text-sm rounded-md transition-colors ${aspectRatio === value ? 'bg-white dark:bg-gray-900 shadow-sm font-semibold' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                {label} ({value})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                           <Sparkles size={20} />
                        )}
                        <span>{isLoading ? '...جاري الإنشاء' : 'إنشاء الصورة'}</span>
                    </button>
                </div>
            </div>

             <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm flex items-center justify-center min-h-[400px]">
                 {error && (
                    <div className="text-center text-red-500">
                        <p><strong>فشل إنشاء الصورة:</strong> {error}</p>
                    </div>
                )}
                {isLoading && (
                    <div className="text-center text-slate-500">
                        <div className="animate-pulse flex flex-col items-center">
                            <ImageIcon size={64} className="mb-4" />
                            <p>يقوم الذكاء الاصطناعي برسم فكرتك...</p>
                        </div>
                    </div>
                )}
                {generatedImage && !isLoading && (
                    <img src={generatedImage} alt={prompt} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                )}
                {!isLoading && !generatedImage && !error && (
                    <div className="text-center text-slate-500">
                        <ImageIcon size={64} className="mx-auto mb-4" />
                        <p>ستظهر الصورة التي تم إنشاؤها هنا.</p>
                    </div>
                )}
            </div>
        </div>
    );
};