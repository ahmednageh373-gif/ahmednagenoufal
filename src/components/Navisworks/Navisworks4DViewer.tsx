import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from 'lucide-react';
import { NavisworksScene } from './NavisworksScene';
import { PropertiesPanel } from './PropertiesPanel';
import { ViewerToolbar } from './ViewerToolbar';
import { ElementsPanel } from './ElementsPanel';
import { useNavisworksModel } from '../../hooks/useNavisworksModel';
import type { ElementData, ViewerSettings, SelectionInfo } from '../../types/navisworks.types';
import { DEFAULT_VIEWER_SETTINGS } from '../../types/navisworks.types';

interface Navisworks4DViewerProps {
  projectId: string;
  modelId: string;
  className?: string;
}

export function Navisworks4DViewer({
  projectId,
  modelId,
  className = '',
}: Navisworks4DViewerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<any>(null);

  // Fetch model data
  const { modelData, elements, isLoading, error } = useNavisworksModel({
    projectId,
    modelId,
    enabled: true,
  });

  // Viewer state
  const [settings, setSettings] = useState<ViewerSettings>(DEFAULT_VIEWER_SETTINGS);
  const [selectedElement, setSelectedElement] = useState<SelectionInfo | null>(null);
  const [highlightedElements, setHighlightedElements] = useState<Set<string>>(new Set());
  const [hiddenElements, setHiddenElements] = useState<Set<string>>(new Set());
  const [showElementsPanel, setShowElementsPanel] = useState(true);

  // Handle element click
  const handleElementClick = useCallback(
    (elementId: string, position: [number, number, number]) => {
      const element = elements.find((el) => el.id === elementId);
      if (element) {
        setSelectedElement({
          elementId,
          element,
          position,
        });
      }
    },
    [elements]
  );

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: Partial<ViewerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Handle element visibility
  const handleToggleElementVisibility = useCallback((elementId: string) => {
    setHiddenElements((prev) => {
      const next = new Set(prev);
      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }
      return next;
    });
  }, []);

  // Handle element highlight
  const handleHighlightElement = useCallback((elementId: string | null) => {
    if (elementId) {
      setHighlightedElements(new Set([elementId]));
    } else {
      setHighlightedElements(new Set());
    }
  }, []);

  // Camera controls
  const handleResetCamera = useCallback(() => {
    // This will be handled by OrbitControls reset
    console.log('Reset camera');
  }, []);

  const handleZoomIn = useCallback(() => {
    // Implement zoom in
    console.log('Zoom in');
  }, []);

  const handleZoomOut = useCallback(() => {
    // Implement zoom out
    console.log('Zoom out');
  }, []);

  const handleFitToView = useCallback(() => {
    // Implement fit to view
    console.log('Fit to view');
  }, []);

  // Export image
  const handleExportImage = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `navisworks-${modelId}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [modelId]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative w-full h-full bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">جاري تحميل النموذج...</p>
          <p className="text-gray-400 text-sm mt-2">
            قد يستغرق هذا بضع لحظات للنماذج الكبيرة
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`relative w-full h-full bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">فشل تحميل النموذج</h3>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // No elements
  if (!elements || elements.length === 0) {
    return (
      <div className={`relative w-full h-full bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-white text-lg font-medium">لا توجد عناصر للعرض</p>
          <p className="text-gray-400 text-sm mt-2">
            النموذج لا يحتوي على بيانات هندسية
          </p>
        </div>
      </div>
    );
  }

  const visibleCount = elements.length - hiddenElements.size;

  return (
    <div className={`relative w-full h-full bg-gray-900 ${className}`}>
      {/* 3D Canvas */}
      <div ref={canvasRef} className="w-full h-full">
        <Canvas
          shadows
          camera={{ position: [100, 100, 100], fov: settings.cameraFov }}
          style={{ background: settings.backgroundColor }}
          gl={{ preserveDrawingBuffer: true }} // Enable screenshot
        >
          <NavisworksScene
            elements={elements}
            selectedElementId={selectedElement?.elementId || null}
            highlightedElements={highlightedElements}
            hiddenElements={hiddenElements}
            settings={settings}
            onElementClick={handleElementClick}
          />
        </Canvas>
      </div>

      {/* Toolbar */}
      <ViewerToolbar
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onResetCamera={handleResetCamera}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToView={handleFitToView}
        onExportImage={handleExportImage}
        onToggleLayersPanel={() => setShowElementsPanel(!showElementsPanel)}
        onToggleFiltersPanel={() => console.log('Toggle filters')}
        elementCount={elements.length}
        visibleCount={visibleCount}
      />

      {/* Elements Panel */}
      {showElementsPanel && (
        <ElementsPanel
          elements={elements}
          selectedElementId={selectedElement?.elementId || null}
          hiddenElements={hiddenElements}
          onElementSelect={(elementId) => {
            const element = elements.find((el) => el.id === elementId);
            if (element) {
              handleElementClick(elementId, [0, 0, 0]); // Position will be calculated
            }
          }}
          onElementHover={handleHighlightElement}
          onToggleVisibility={handleToggleElementVisibility}
          onClose={() => setShowElementsPanel(false)}
        />
      )}

      {/* Properties Panel */}
      <PropertiesPanel
        element={selectedElement?.element || null}
        onClose={() => setSelectedElement(null)}
      />

      {/* Model Info */}
      {modelData && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg px-4 py-2 text-sm">
          <div className="text-white font-medium">{modelData.title}</div>
          <div className="text-gray-400 text-xs mt-1">
            {modelData.fileName} • {modelData.units}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="absolute bottom-4 right-4 bg-gray-900/90 border border-gray-700 rounded-lg px-4 py-2 text-xs text-gray-400 max-w-xs">
        <div className="font-medium text-white mb-1">التحكم:</div>
        <div>• سحب الماوس: تدوير المشهد</div>
        <div>• عجلة الماوس: تكبير/تصغير</div>
        <div>• نقر: اختيار عنصر</div>
        <div>• Shift + سحب: تحريك المشهد</div>
      </div>
    </div>
  );
}
