import React from 'react';
import {
  Grid3X3,
  Maximize,
  Eye,
  EyeOff,
  Settings,
  Home,
  ZoomIn,
  ZoomOut,
  Layers,
  Filter,
  Search,
  Download,
  Camera,
} from 'lucide-react';
import type { ViewerSettings } from '../../types/navisworks.types';

interface ViewerToolbarProps {
  settings: ViewerSettings;
  onSettingsChange: (settings: Partial<ViewerSettings>) => void;
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  onExportImage: () => void;
  onToggleLayersPanel: () => void;
  onToggleFiltersPanel: () => void;
  elementCount: number;
  visibleCount: number;
}

export function ViewerToolbar({
  settings,
  onSettingsChange,
  onResetCamera,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onExportImage,
  onToggleLayersPanel,
  onToggleFiltersPanel,
  elementCount,
  visibleCount,
}: ViewerToolbarProps) {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <>
      {/* Main Toolbar */}
      <div className="absolute top-4 left-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
        <div className="flex items-center divide-x divide-gray-700">
          {/* View Controls */}
          <div className="flex items-center gap-1 p-2">
            <ToolbarButton
              icon={<Home className="w-4 h-4" />}
              tooltip="إعادة تعيين الكاميرا"
              onClick={onResetCamera}
            />
            <ToolbarButton
              icon={<Maximize className="w-4 h-4" />}
              tooltip="ملائمة للعرض"
              onClick={onFitToView}
            />
            <ToolbarButton
              icon={<ZoomIn className="w-4 h-4" />}
              tooltip="تكبير"
              onClick={onZoomIn}
            />
            <ToolbarButton
              icon={<ZoomOut className="w-4 h-4" />}
              tooltip="تصغير"
              onClick={onZoomOut}
            />
          </div>

          {/* Display Controls */}
          <div className="flex items-center gap-1 p-2">
            <ToolbarButton
              icon={<Grid3X3 className="w-4 h-4" />}
              tooltip="إظهار/إخفاء الشبكة"
              isActive={settings.showGrid}
              onClick={() => onSettingsChange({ showGrid: !settings.showGrid })}
            />
            <ToolbarButton
              icon={<Camera className="w-4 h-4" />}
              tooltip="إظهار/إخفاء المحاور"
              isActive={settings.showAxes}
              onClick={() => onSettingsChange({ showAxes: !settings.showAxes })}
            />
          </div>

          {/* Tools */}
          <div className="flex items-center gap-1 p-2">
            <ToolbarButton
              icon={<Layers className="w-4 h-4" />}
              tooltip="الطبقات"
              onClick={onToggleLayersPanel}
            />
            <ToolbarButton
              icon={<Filter className="w-4 h-4" />}
              tooltip="التصفية"
              onClick={onToggleFiltersPanel}
            />
            <ToolbarButton
              icon={<Download className="w-4 h-4" />}
              tooltip="تصدير صورة"
              onClick={onExportImage}
            />
          </div>

          {/* Settings */}
          <div className="flex items-center gap-1 p-2">
            <ToolbarButton
              icon={<Settings className="w-4 h-4" />}
              tooltip="الإعدادات"
              isActive={showSettings}
              onClick={() => setShowSettings(!showSettings)}
            />
          </div>
        </div>

        {/* Element Count */}
        <div className="px-3 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
          <span className="font-medium text-white">{visibleCount}</span> / {elementCount} عنصر
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 left-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4">
          <h3 className="text-white font-bold mb-4">إعدادات العرض</h3>

          <div className="space-y-4">
            {/* Lighting */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                إضاءة محيطة
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.ambientLightIntensity}
                onChange={(e) =>
                  onSettingsChange({ ambientLightIntensity: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {settings.ambientLightIntensity.toFixed(1)}
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                إضاءة مباشرة
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.directionalLightIntensity}
                onChange={(e) =>
                  onSettingsChange({ directionalLightIntensity: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {settings.directionalLightIntensity.toFixed(1)}
              </div>
            </div>

            {/* Camera */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                مجال الرؤية (FOV)
              </label>
              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={settings.cameraFov}
                onChange={(e) =>
                  onSettingsChange({ cameraFov: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {settings.cameraFov}°
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                لون الخلفية
              </label>
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) =>
                  onSettingsChange({ backgroundColor: e.target.value })
                }
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            {/* Shadows */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-sm font-medium">
                تفعيل الظلال
              </label>
              <button
                onClick={() =>
                  onSettingsChange({ enableShadows: !settings.enableShadows })
                }
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.enableShadows ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition transform ${
                    settings.enableShadows ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Orbit Controls */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300 text-sm font-medium">
                التحكم بالكاميرا
              </label>
              <button
                onClick={() =>
                  onSettingsChange({ orbitControlsEnabled: !settings.orbitControlsEnabled })
                }
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.orbitControlsEnabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition transform ${
                    settings.orbitControlsEnabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            إغلاق
          </button>
        </div>
      )}
    </>
  );
}

function ToolbarButton({
  icon,
  tooltip,
  isActive = false,
  onClick,
}: {
  icon: React.ReactNode;
  tooltip: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-lg transition group relative ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {icon}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
        {tooltip}
      </div>
    </button>
  );
}
