import React, { useState } from 'react';
import { analyzeScribdDocument } from '../services/geminiService';
import { marked } from 'marked';
import { Bot, Link, BookOpen } from 'lucide-react';

export const ScribdAnalyzerTab: React.FC = () => {
    const defaultEmbed = `<iframe class="scribd_iframe_embed" title="دراسة+اسعارب+بنود+المباني(2)" src="https://www.scribd.com/embeds/651362130/content?start_page=1&view_mode=scroll&access_key=key-Oxe0W4ixZdhkGR3fGSNn" tabindex="0" data-auto-height="true" data-aspect-ratio="1.414442700156986" scrolling="no" width="100%" height="600" frameborder="0" ></iframe>`;
    const [embedCode, setEmbedCode] = useState(defaultEmbed);
    const [iframeProps, setIframeProps] = useState<{ src: string; title: string } | null>(null);
    const [userQuery, setUserQuery] = useState('لخص محتويات هذا المستند وما هي أهم النقاط التي يركز عليها؟');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');

    const handleLoadDocument = () => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(embedCode, 'text/html');
            const iframe = doc.querySelector('iframe');
            if (iframe && iframe.src && iframe.title) {
                setIframeProps({ src: iframe.src, title: iframe.title });
                setError('');
            } else {
                setError('كود التضمين غير صالح. يرجى التأكد من أنه يحتوي على <iframe> مع سمتي src و title.');
                setIframeProps(null);
            }
        } catch (e) {
            setError('فشل في تحليل كود التضمين.');
            setIframeProps(null);
        }
    };

    const handleAnalyze = async () => {
        if (!iframeProps || !userQuery.trim()) {
            setError('يرجى تحميل مستند وطرح سؤال أولاً.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult('');
        try {
            const result = await analyzeScribdDocument(iframeProps.title, userQuery);
            setAnalysisResult(result);
        } catch (err) {
            setError((err as Error).message || 'حدث خطأ غير متوقع أثناء التحليل.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const parsedAnalysis = analysisResult ? marked.parse(analysisResult) : '';


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">محلل مستندات Scribd</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        ألصق كود التضمين لمستند Scribd، ثم اطرح سؤالاً حول محتواه ليقوم الذكاء الاصطناعي بتحليله.
                    </p>
                </div>

                <div>
                    <label htmlFor="embed-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">كود التضمين من Scribd</label>
                    <textarea
                        id="embed-code"
                        value={embedCode}
                        onChange={(e) => setEmbedCode(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                        placeholder='<iframe ...></iframe>'
                    />
                    <button
                        onClick={handleLoadDocument}
                        className="mt-2 flex items-center gap-2 bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-700"
                    >
                        <Link size={16} />
                        تحميل المستند
                    </button>
                </div>
                
                {iframeProps && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <iframe
                            key={iframeProps.src}
                            title={iframeProps.title}
                            src={iframeProps.src}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            scrolling="no"
                            className="rounded-lg border border-gray-200 dark:border-gray-700"
                        ></iframe>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">التحليل</h3>
                <div>
                     <label htmlFor="user-query" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">سؤالك عن المستند</label>
                     <textarea
                        id="user-query"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="ما هي النقاط الرئيسية في هذا المستند؟"
                    />
                     <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !iframeProps || !userQuery.trim()}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Bot size={18} />
                        )}
                        <span>{isLoading ? '...جاري التحليل' : 'تحليل'}</span>
                    </button>
                </div>
                
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 flex-grow overflow-y-auto">
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    
                    {isLoading && !analysisResult && (
                         <div className="text-center p-8 text-slate-500">
                             <p>يقوم الذكاء الاصطناعي بقراءة وتحليل المستند...</p>
                         </div>
                    )}

                    {analysisResult ? (
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: parsedAnalysis }}
                        />
                    ) : !isLoading && (
                         <div className="text-center p-8 text-slate-500">
                             <BookOpen size={48} className="mx-auto mb-4" />
                            <p>ستظهر نتائج التحليل هنا.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
