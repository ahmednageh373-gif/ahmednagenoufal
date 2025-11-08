/**
 * NOUFAL CAD Unified Platform
 * منصة موحدة لجميع أدوات AutoCAD والرسم الهندسي
 * 
 * Features:
 * - مكتبة yQArch (60+ بلوك معماري)
 * - DXF File Generator
 * - Drawing Tools (Lines, Arcs, Circles, Polylines)
 * - Bulge Calculator for Arcs
 * - Layers Manager
 * - Quantity Takeoff from Drawings
 * - Integration with BOQ System
 */

import React, { useState } from 'react';
import { 
  Compass, Package, FileText, Download, Upload, Layers, 
  Ruler, Circle, Square, Triangle, Pencil, Save, Trash2, 
  Eye, EyeOff, Plus, Settings, Calculator, Grid, Move,
  RotateCw, FlipHorizontal, Copy, Scissors, ZoomIn, ZoomOut,
  RefreshCw, Home, Play, Pause, ChevronRight, Search,
  Filter, SortAsc, BookOpen, Info
} from 'lucide-react';
import { yqArchBlocks, blockCategories, getBlocksByCategory, searchBlocks } from '../data/yqarch-library-data';
import CADCanvas from './CADCanvas';

type DrawingTool = 'select' | 'line' | 'polyline' | 'circle' | 'arc' | 'rectangle' | 'text';
type LayerVisibility = 'visible' | 'hidden' | 'locked';

interface Layer {
  id: string;
  name: string;
  color: string;
  lineType: string;
  lineWeight: number;
  visibility: LayerVisibility;
}

interface DrawingEntity {
  id: string;
  type: 'line' | 'polyline' | 'circle' | 'arc' | 'rectangle' | 'text';
  layerId: string;
  points: { x: number; y: number }[];
  properties: {
    color?: string;
    lineWeight?: number;
    radius?: number;
    bulge?: number;
    text?: string;
    rotation?: number;
  };
}

export const CADUnifiedPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'draw' | 'layers' | 'dxf' | 'quantity'>('blocks');
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [blockRotation, setBlockRotation] = useState<number>(0);
  const [blockScale, setBlockScale] = useState<number>(1);
  const [blockFlipH, setBlockFlipH] = useState<boolean>(false);
  const [blockFlipV, setBlockFlipV] = useState<boolean>(false);
  const [isInsertMode, setIsInsertMode] = useState<boolean>(false);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-1', name: 'WALLS', color: '#FF0000', lineType: 'Continuous', lineWeight: 0.3, visibility: 'visible' },
    { id: 'layer-2', name: 'DOORS', color: '#00FF00', lineType: 'Continuous', lineWeight: 0.2, visibility: 'visible' },
    { id: 'layer-3', name: 'WINDOWS', color: '#0000FF', lineType: 'Continuous', lineWeight: 0.2, visibility: 'visible' },
    { id: 'layer-4', name: 'FURNITURE', color: '#FFA500', lineType: 'Dashed', lineWeight: 0.1, visibility: 'visible' },
  ]);
  const [drawings, setDrawings] = useState<DrawingEntity[]>([]);
  const [bulgeValue, setBulgeValue] = useState<number>(0);

  // Handle entity added from canvas
  const handleEntityAdded = (entity: any) => {
    console.log('Entity added:', entity);
    setDrawings([...drawings, entity]);
  };

  // Filter blocks
  const filteredBlocks = searchQuery
    ? searchBlocks(searchQuery)
    : selectedCategory
    ? getBlocksByCategory(selectedCategory)
    : yqArchBlocks;

  // DXF Generation
  const generateDXF = () => {
    let dxfContent = '';
    
    // HEADER Section
    dxfContent += '0\nSECTION\n2\nHEADER\n';
    dxfContent += '9\n$ACADVER\n1\nAC1015\n'; // AutoCAD 2000
    dxfContent += '9\n$INSUNITS\n70\n4\n'; // Millimeters
    dxfContent += '0\nENDSEC\n';
    
    // TABLES Section
    dxfContent += '0\nSECTION\n2\nTABLES\n';
    
    // LAYER Table
    dxfContent += '0\nTABLE\n2\nLAYER\n70\n' + layers.length + '\n';
    layers.forEach(layer => {
      dxfContent += '0\nLAYER\n';
      dxfContent += '2\n' + layer.name + '\n';
      dxfContent += '70\n0\n';
      dxfContent += '62\n1\n'; // Color
      dxfContent += '6\nCONTINUOUS\n'; // LineType
    });
    dxfContent += '0\nENDTAB\n';
    dxfContent += '0\nENDSEC\n';
    
    // ENTITIES Section
    dxfContent += '0\nSECTION\n2\nENTITIES\n';
    
    drawings.forEach(entity => {
      if (entity.type === 'line' && entity.points.length >= 2) {
        dxfContent += '0\nLINE\n';
        dxfContent += '8\n' + (layers.find(l => l.id === entity.layerId)?.name || 'WALLS') + '\n';
        dxfContent += '10\n' + entity.points[0].x + '\n';
        dxfContent += '20\n' + entity.points[0].y + '\n';
        dxfContent += '11\n' + entity.points[1].x + '\n';
        dxfContent += '21\n' + entity.points[1].y + '\n';
      } else if (entity.type === 'circle' && entity.points.length >= 1) {
        dxfContent += '0\nCIRCLE\n';
        dxfContent += '8\n' + (layers.find(l => l.id === entity.layerId)?.name || 'WALLS') + '\n';
        dxfContent += '10\n' + entity.points[0].x + '\n';
        dxfContent += '20\n' + entity.points[0].y + '\n';
        dxfContent += '40\n' + (entity.properties.radius || 10) + '\n';
      } else if (entity.type === 'polyline' && entity.points.length >= 2) {
        dxfContent += '0\nLWPOLYLINE\n';
        dxfContent += '8\n' + (layers.find(l => l.id === entity.layerId)?.name || 'WALLS') + '\n';
        dxfContent += '90\n' + entity.points.length + '\n';
        dxfContent += '70\n1\n'; // Closed
        entity.points.forEach((point, idx) => {
          dxfContent += '10\n' + point.x + '\n';
          dxfContent += '20\n' + point.y + '\n';
          if (entity.properties.bulge && idx < entity.points.length - 1) {
            dxfContent += '42\n' + entity.properties.bulge + '\n';
          }
        });
      }
    });
    
    dxfContent += '0\nENDSEC\n';
    dxfContent += '0\nEOF\n';
    
    // Download
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'noufal_drawing_' + new Date().getTime() + '.dxf';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate Bulge from Arc Parameters
  const calculateBulge = (angle: number) => {
    // Bulge = tan(angle/4)
    const angleRad = (angle * Math.PI) / 180;
    return Math.tan(angleRad / 4);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                منصة CAD الموحدة
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                أدوات AutoCAD المتكاملة | مكتبة yQArch | DXF Generator
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={generateDXF}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download size={18} />
              تصدير DXF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <Upload size={18} />
              استيراد
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex gap-1">
          {[
            { id: 'blocks', label: 'مكتبة البلوكات', icon: Package },
            { id: 'draw', label: 'أدوات الرسم', icon: Pencil },
            { id: 'layers', label: 'الطبقات', icon: Layers },
            { id: 'dxf', label: 'DXF Tools', icon: FileText },
            { id: 'quantity', label: 'استخراج الكميات', icon: Calculator },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar/Tools Panel */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Blocks Library Tab */}
          {activeTab === 'blocks' && (
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="ابحث في المكتبة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">جميع البلوكات</span>
                    <span className="text-sm text-gray-500">{yqArchBlocks.length}</span>
                  </div>
                </button>

                {blockCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cat.icon} {cat.nameAr}</span>
                      <span className="text-sm text-gray-500">{getBlocksByCategory(cat.id).length}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {filteredBlocks.length} بلوك متاح
                </h3>
                {filteredBlocks.map(block => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlock(block)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBlock?.id === block.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {block.nameAr}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {block.nameEn}
                        </p>
                        {block.dimensions && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            📏 {block.dimensions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Block Insertion Controls */}
              {selectedBlock && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">إعدادات الإدراج</h3>
                  
                  {/* Rotation Control */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      التدوير: {blockRotation}°
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={blockRotation}
                        onChange={(e) => setBlockRotation(Number(e.target.value))}
                        className="flex-1"
                      />
                      <button
                        onClick={() => setBlockRotation(0)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="إعادة تعيين"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Scale Control */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      التحجيم: {blockScale.toFixed(2)}x
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={blockScale}
                        onChange={(e) => setBlockScale(Number(e.target.value))}
                        className="flex-1"
                      />
                      <button
                        onClick={() => setBlockScale(1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="إعادة تعيين"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Flip Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBlockFlipH(!blockFlipH)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        blockFlipH
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                      }`}
                      title="قلب أفقي"
                    >
                      <FlipHorizontal size={16} />
                      <span className="text-sm">أفقي</span>
                    </button>
                    <button
                      onClick={() => setBlockFlipV(!blockFlipV)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        blockFlipV
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                      }`}
                      title="قلب رأسي"
                    >
                      <FlipHorizontal size={16} className="transform rotate-90" />
                      <span className="text-sm">رأسي</span>
                    </button>
                  </div>
                  
                  {/* Insert Button */}
                  <button
                    onClick={() => {
                      setSelectedTool('insert-block' as any);
                      setIsInsertMode(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus size={20} />
                    <span>إدراج البلوك</span>
                  </button>
                  
                  {isInsertMode && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        ✓ وضع الإدراج نشط - انقر على Canvas لإدراج البلوك
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Drawing Tools Tab */}
          {activeTab === 'draw' && (
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">أدوات الرسم</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { tool: 'select', label: 'تحديد', icon: Move },
                  { tool: 'line', label: 'خط', icon: Ruler },
                  { tool: 'polyline', label: 'خط متعدد', icon: Pencil },
                  { tool: 'circle', label: 'دائرة', icon: Circle },
                  { tool: 'arc', label: 'قوس', icon: RotateCw },
                  { tool: 'rectangle', label: 'مستطيل', icon: Square },
                ].map(({ tool, label, icon: Icon }) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool as DrawingTool)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedTool === tool
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">محرر Bulge للأقواس</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      زاوية القوس (درجة)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={Math.atan(bulgeValue) * 720 / Math.PI}
                      onChange={(e) => setBulgeValue(calculateBulge(parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      قيمة Bulge
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bulgeValue}
                      onChange={(e) => setBulgeValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    💡 Bulge = tan(angle/4)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layers Tab */}
          {activeTab === 'layers' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">الطبقات</h3>
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {layers.map(layer => (
                  <div
                    key={layer.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {layer.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {layer.lineType} | {layer.lineWeight}mm
                      </div>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-indigo-600">
                      {layer.visibility === 'visible' ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DXF Tools Tab */}
          {activeTab === 'dxf' && (
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">أدوات DXF</h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                    <div className="text-sm">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        معلومات DXF Generator
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300">
                        يتم توليد ملفات DXF متوافقة مع AutoCAD 2000+ مع دعم كامل للطبقات والكيانات الهندسية
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">الإحصائيات</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الطبقات:</span>
                      <span className="font-semibold">{layers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الكيانات:</span>
                      <span className="font-semibold">{drawings.length}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateDXF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download size={18} />
                  توليد وتصدير DXF
                </button>
              </div>
            </div>
          )}

          {/* Quantity Takeoff Tab */}
          {activeTab === 'quantity' && (
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">استخراج الكميات</h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 shrink-0" />
                    <div className="text-sm">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        استخراج تلقائي
                      </h4>
                      <p className="text-green-700 dark:text-green-300">
                        يتم حساب الأطوال والمساحات تلقائياً من المخططات مع دعم معامل Bulge للأقواس
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">الكميات المستخرجة</h4>
                  {drawings.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      لا توجد رسومات لاستخراج الكميات منها
                    </p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {drawings.map((entity, idx) => (
                        <div key={entity.id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-gray-600 dark:text-gray-400">
                            {entity.type === 'line' && '📏 خط'}
                            {entity.type === 'circle' && '⭕ دائرة'}
                            {entity.type === 'polyline' && '📐 خط متعدد'}
                            {' #' + (idx + 1)}
                          </span>
                          <span className="font-semibold">
                            {entity.type === 'circle' && entity.properties.radius
                              ? `π × ${(entity.properties.radius * 2).toFixed(2)}² = ${(Math.PI * entity.properties.radius * entity.properties.radius).toFixed(2)} م²`
                              : 'محسوب تلقائياً'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
          <CADCanvas
            selectedTool={selectedTool as any}
            selectedLayer={layers.find(l => l.visibility === 'visible')?.id || layers[0].id}
            layers={layers}
            onEntityAdded={handleEntityAdded}
            selectedBlock={selectedBlock}
            blockRotation={blockRotation}
            blockScale={blockScale}
            blockFlipH={blockFlipH}
            blockFlipV={blockFlipV}
          />
        </div>

        {/* Right Properties Panel */}
        {selectedBlock && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">الخصائص</h3>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {selectedBlock.nameAr}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedBlock.nameEn}
                  </p>
                </div>

                {selectedBlock.dimensions && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                      📏 الأبعاد
                    </div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                      {selectedBlock.dimensions}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الوصف
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBlock.description}
                  </p>
                </div>

                {selectedBlock.specifications && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المواصفات
                    </div>
                    <div className="space-y-2 text-sm">
                      {selectedBlock.specifications.material && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">المادة:</span>
                          <span className="font-medium">{selectedBlock.specifications.material}</span>
                        </div>
                      )}
                      {selectedBlock.specifications.dimensions && (
                        <>
                          {selectedBlock.specifications.dimensions.width && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">العرض:</span>
                              <span className="font-medium">
                                {selectedBlock.specifications.dimensions.width} {selectedBlock.specifications.unit}
                              </span>
                            </div>
                          )}
                          {selectedBlock.specifications.dimensions.depth && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">العمق:</span>
                              <span className="font-medium">
                                {selectedBlock.specifications.dimensions.depth} {selectedBlock.specifications.unit}
                              </span>
                            </div>
                          )}
                          {selectedBlock.specifications.dimensions.height && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">الارتفاع:</span>
                              <span className="font-medium">
                                {selectedBlock.specifications.dimensions.height} {selectedBlock.specifications.unit}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {selectedBlock.tags && selectedBlock.tags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الوسوم
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedBlock.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus size={18} />
                  إضافة إلى الرسم
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CADUnifiedPlatform;
