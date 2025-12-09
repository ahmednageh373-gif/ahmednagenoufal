import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navisworks4DViewer } from '../components/Navisworks';
import { ErrorBoundary } from '../components/ErrorBoundary';

/**
 * Navisworks Viewer Page
 * 
 * Usage:
 * /projects/:projectId/navisworks/:modelId
 */
export function NavisworksViewerPage() {
  const { projectId, modelId } = useParams<{ projectId: string; modelId: string }>();
  const navigate = useNavigate();

  if (!projectId || !modelId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white font-bold mb-2">معلومات مفقودة</h2>
          <p className="text-gray-400 mb-4">Project ID أو Model ID غير موجود</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            العودة للمشاريع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>العودة</span>
            </button>
            <div className="h-6 w-px bg-gray-700" />
            <h1 className="text-xl font-bold text-white">
              عارض Navisworks ثلاثي الأبعاد
            </h1>
          </div>
        </div>
      </header>

      {/* Viewer */}
      <div className="h-[calc(100vh-73px)]">
        <ErrorBoundary>
          <Navisworks4DViewer
            projectId={projectId}
            modelId={modelId}
            className="w-full h-full"
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
