import React, { useState, useRef } from 'react';
import { analyzeImageWithPrompt } from '../services/geminiService';
import { marked } from 'marked';
import { UploadCloud, Bot, XCircle } from '../lucide-icons';

export const ImageAnalysisTab: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Analyze this image from the perspective of a civil engineer. Identify materials, construction stages, potential safety issues, and overall quality.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setAnalysisResult('');
            setError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile || !prompt) {
            setError('Please upload an image and provide a prompt.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult('');
        try {
            const result = await analyzeImageWithPrompt(prompt, imageFile);
            setAnalysisResult(result);
        } catch (err) {
            setError((err as Error).message || 'An unexpected error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    const parsedAnalysis = analysisResult ? marked.parse(analysisResult) : '';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">تحليل الصور بالذكاء الاصطناعي</h3>
                <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl min-h-[200px] flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 transition-colors bg-slate-50 dark:bg-slate-900/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="object-contain max-h-64 rounded-lg" />
                    ) : (
                        <div className="text-center text-slate-500 p-4">
                            <UploadCloud size={48} className="mx-auto mb-2" />
                            <p className="font-semibold">انقر لرفع صورة</p>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <label htmlFor="image-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        ما الذي تريد تحليله في الصورة؟
                    </label>
                    <textarea
                        id="image-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                </div>
                
                <div className="mt-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !imageFile || !prompt}
                        className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Bot size={20} />
                        )}
                        <span>{isLoading ? '...جاري التحليل' : 'تحليل الصورة'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">النتائج</h3>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                        <p className="font-bold">خطأ في التحليل</p>
                        <p>{error}</p>
                    </div>
                )}
                {isLoading && !analysisResult && (
                    <div className="text-center p-8 text-slate-500">
                        <p>جاري تحليل الصورة، يرجى الانتظار...</p>
                    </div>
                )}
                {analysisResult && (
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parsedAnalysis }}></div>
                )}
                 {!analysisResult && !isLoading && !error && (
                    <div className="text-center p-8 text-slate-500">
                        <p>ستظهر نتائج التحليل هنا بعد رفع الصورة وتشغيل المحلل.</p>
                    </div>
                )}
            </div>
        </div>
    );
};