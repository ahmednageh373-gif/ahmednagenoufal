import React from 'react';
import { marked } from 'marked';
// Fix: Removed .ts extension from import path.
import { documentationContent } from '../data/documentation';
import { HelpCircle } from 'lucide-react';

export const DocumentationViewer: React.FC = () => {
    // Parse the markdown content to HTML
    const htmlContent = marked.parse(documentationContent);

    return (
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-8 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <HelpCircle className="w-10 h-10 text-indigo-500" />
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">المساعدة والتوثيق</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        دليل شامل لميزات التطبيق المتقدمة.
                    </p>
                </div>
            </div>
            
            <div
                className="prose max-w-none prose-slate dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    );
};
