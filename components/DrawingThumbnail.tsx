import React, { useEffect, useRef, useState } from 'react';
import type { Drawing } from '../types';
import { FileText, Loader2 } from 'lucide-react';

// pdf.js is loaded globally from index.html
declare const pdfjsLib: any;

interface DrawingThumbnailProps {
  drawing: Drawing;
}

const getMimeTypeFromUrl = (url: string): string => {
    if (url.startsWith('data:')) {
        return url.split(';')[0].split(':')[1] || '';
    }
    const extension = url.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
        case 'pdf': return 'application/pdf';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        default: return '';
    }
}

export const DrawingThumbnail: React.FC<DrawingThumbnailProps> = ({ drawing }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const latestVersion = drawing.versions.length > 0
        ? [...drawing.versions].sort((a, b) => b.version - a.version)[0]
        : null;

    useEffect(() => {
        setIsLoading(true);
        setThumbnailUrl(null);
        
        if (!latestVersion) {
            setIsLoading(false);
            return;
        }

        const mimeType = getMimeTypeFromUrl(latestVersion.url);
        
        if (mimeType.startsWith('image/')) {
            setThumbnailUrl(latestVersion.url);
            setIsLoading(false);
        } else if (mimeType === 'application/pdf') {
            const renderPdf = async () => {
                try {
                    // pdfjsLib is available globally
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
                    
                    const loadingTask = pdfjsLib.getDocument(latestVersion.url);
                    const pdf = await loadingTask.promise;
                    const page = await pdf.getPage(1);
                    
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale for quality
                        const context = canvas.getContext('2d');
                        if(context) {
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            const renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };
                            await page.render(renderContext).promise;
                            setThumbnailUrl(canvas.toDataURL('image/png'));
                        }
                    }
                } catch (error) {
                    console.error('Error rendering PDF thumbnail:', error);
                    setThumbnailUrl(null); // Fallback to icon
                } finally {
                    setIsLoading(false);
                }
            };
            renderPdf();
        } else {
            setIsLoading(false); // Other file types, will fall back to icon
        }

    }, [latestVersion]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <Loader2 size={32} className="animate-spin text-gray-500" />
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            </div>
        );
    }
    
    if (thumbnailUrl) {
        return <img src={thumbnailUrl} alt={drawing.title} className="w-full h-full object-contain" />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <FileText size={48} className="text-gray-500" />
        </div>
    );
};
