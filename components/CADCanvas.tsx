/**
 * CAD Canvas - Interactive Drawing Component
 * لوحة رسم CAD تفاعلية باستخدام HTML5 Canvas
 * 
 * Features:
 * - رسم الخطوط والأشكال
 * - Zoom & Pan
 * - Grid & Snap
 * - Layer Support
 * - Export to DXF
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Home, Grid as GridIcon, Move, Crosshair } from 'lucide-react';
import { getBlockShape, BlockShape } from '../data/yqarch-block-shapes';

interface Point {
  x: number;
  y: number;
}

interface DrawingEntity {
  id: string;
  type: 'line' | 'polyline' | 'circle' | 'arc' | 'rectangle';
  points: Point[];
  color: string;
  lineWidth: number;
  layerId: string;
  properties?: {
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    bulge?: number;
  };
}

interface InsertionState {
  blockId: string;
  rotation: number;
  scale: number;
  flipH: boolean;
  flipV: boolean;
}

interface CADCanvasProps {
  selectedTool: 'select' | 'line' | 'polyline' | 'circle' | 'arc' | 'rectangle' | 'insert-block';
  selectedLayer: string;
  layers: Array<{ id: string; name: string; color: string; visibility: string }>;
  onEntityAdded?: (entity: DrawingEntity) => void;
  selectedBlock?: any; // Block from yQArch library to be inserted
  blockRotation?: number; // Rotation angle for block insertion
  blockScale?: number; // Scale factor for block insertion
  blockFlipH?: boolean; // Horizontal flip
  blockFlipV?: boolean; // Vertical flip
}

export const CADCanvas: React.FC<CADCanvasProps> = ({ 
  selectedTool, 
  selectedLayer,
  layers,
  onEntityAdded,
  selectedBlock,
  blockRotation = 0,
  blockScale = 1,
  blockFlipH = false,
  blockFlipV = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [entities, setEntities] = useState<DrawingEntity[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });
  const [blockPreviewPos, setBlockPreviewPos] = useState<Point | null>(null);
  const [isInsertingBlock, setIsInsertingBlock] = useState(false);

  // Get canvas context
  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  // Transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let x = (screenX - rect.left - pan.x) / zoom;
    let y = (screenY - rect.top - pan.y) / zoom;
    
    // Snap to grid
    if (snapToGrid && selectedTool !== 'select') {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    
    return { x, y };
  }, [zoom, pan, snapToGrid, gridSize, selectedTool]);

  // Canvas to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number): Point => {
    return {
      x: canvasX * zoom + pan.x,
      y: canvasY * zoom + pan.y
    };
  }, [zoom, pan]);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5;
    
    // Calculate visible grid bounds
    const startX = Math.floor((-pan.x / zoom) / gridSize) * gridSize;
    const startY = Math.floor((-pan.y / zoom) / gridSize) * gridSize;
    const endX = startX + (canvas.width / zoom) + gridSize * 2;
    const endY = startY + (canvas.height / zoom) + gridSize * 2;
    
    // Draw vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      const screenPos = canvasToScreen(x, 0);
      ctx.beginPath();
      ctx.moveTo(screenPos.x, 0);
      ctx.lineTo(screenPos.x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      const screenPos = canvasToScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(0, screenPos.y);
      ctx.lineTo(canvas.width, screenPos.y);
      ctx.stroke();
    }
    
    // Draw origin axes
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    const origin = canvasToScreen(0, 0);
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvas.width, origin.y);
    ctx.stroke();
    
    // Y axis
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvas.height);
    ctx.stroke();
    
    ctx.restore();
  }, [showGrid, gridSize, canvasToScreen, zoom, pan]);

  // Draw entity
  const drawEntity = useCallback((ctx: CanvasRenderingContext2D, entity: DrawingEntity) => {
    const layer = layers.find(l => l.id === entity.layerId);
    if (!layer || layer.visibility === 'hidden') return;
    
    ctx.save();
    ctx.strokeStyle = entity.color || layer.color;
    ctx.lineWidth = entity.lineWidth * zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (layer.visibility === 'locked') {
      ctx.globalAlpha = 0.5;
    }
    
    switch (entity.type) {
      case 'line':
        if (entity.points.length >= 2) {
          ctx.beginPath();
          const start = canvasToScreen(entity.points[0].x, entity.points[0].y);
          ctx.moveTo(start.x, start.y);
          const end = canvasToScreen(entity.points[1].x, entity.points[1].y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
        break;
        
      case 'polyline':
        if (entity.points.length >= 2) {
          ctx.beginPath();
          const firstPoint = canvasToScreen(entity.points[0].x, entity.points[0].y);
          ctx.moveTo(firstPoint.x, firstPoint.y);
          
          for (let i = 1; i < entity.points.length; i++) {
            const point = canvasToScreen(entity.points[i].x, entity.points[i].y);
            ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        }
        break;
        
      case 'circle':
        if (entity.points.length >= 1 && entity.properties?.radius) {
          const center = canvasToScreen(entity.points[0].x, entity.points[0].y);
          const radius = entity.properties.radius * zoom;
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
        
      case 'arc':
        if (entity.points.length >= 1 && entity.properties?.radius) {
          const center = canvasToScreen(entity.points[0].x, entity.points[0].y);
          const radius = entity.properties.radius * zoom;
          const startAngle = entity.properties.startAngle || 0;
          const endAngle = entity.properties.endAngle || Math.PI;
          
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, startAngle, endAngle);
          ctx.stroke();
        }
        break;
        
      case 'rectangle':
        if (entity.points.length >= 2) {
          const topLeft = canvasToScreen(entity.points[0].x, entity.points[0].y);
          const bottomRight = canvasToScreen(entity.points[1].x, entity.points[1].y);
          const width = bottomRight.x - topLeft.x;
          const height = bottomRight.y - topLeft.y;
          
          ctx.beginPath();
          ctx.rect(topLeft.x, topLeft.y, width, height);
          ctx.stroke();
        }
        break;
    }
    
    // Draw points
    entity.points.forEach(point => {
      const screenPoint = canvasToScreen(point.x, point.y);
      ctx.fillStyle = entity.color || layer.color;
      ctx.beginPath();
      ctx.arc(screenPoint.x, screenPoint.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }, [layers, zoom, canvasToScreen]);

  // Draw yQArch block shape
  const drawBlockShape = useCallback((ctx: CanvasRenderingContext2D, blockId: string, position: Point, scale: number = 1) => {
    const shape = getBlockShape(blockId);
    if (!shape) return;

    const layer = layers.find(l => l.id === selectedLayer);
    if (!layer) return;

    ctx.save();
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 2 * zoom;
    ctx.fillStyle = 'rgba(100, 100, 255, 0.1)'; // شفاف للتعبئة

    const screenPos = canvasToScreen(position.x, position.y);

    if (shape.type === 'rectangle' && shape.width && shape.height) {
      const width = shape.width * scale * zoom;
      const height = shape.height * scale * zoom;
      ctx.beginPath();
      ctx.rect(screenPos.x, screenPos.y, width, height);
      ctx.stroke();
      ctx.fill();
    } else if (shape.type === 'circle' && shape.radius) {
      const radius = shape.radius * scale * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    } else if (shape.type === 'composite' && shape.paths) {
      shape.paths.forEach(path => {
        if (path.type === 'line' && path.points.length >= 2) {
          ctx.beginPath();
          const start = canvasToScreen(
            position.x + path.points[0].x * scale, 
            position.y + path.points[0].y * scale
          );
          ctx.moveTo(start.x, start.y);
          for (let i = 1; i < path.points.length; i++) {
            const point = canvasToScreen(
              position.x + path.points[i].x * scale,
              position.y + path.points[i].y * scale
            );
            ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        } else if (path.type === 'rectangle' && path.points.length >= 2) {
          const topLeft = canvasToScreen(
            position.x + path.points[0].x * scale,
            position.y + path.points[0].y * scale
          );
          const bottomRight = canvasToScreen(
            position.x + path.points[1].x * scale,
            position.y + path.points[1].y * scale
          );
          ctx.beginPath();
          ctx.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
          ctx.stroke();
          ctx.fill();
        } else if (path.type === 'circle' && path.points.length >= 1 && path.radius) {
          const center = canvasToScreen(
            position.x + path.points[0].x * scale,
            position.y + path.points[0].y * scale
          );
          const radius = path.radius * scale * zoom;
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        } else if (path.type === 'arc' && path.points.length >= 2 && path.radius) {
          const start = canvasToScreen(
            position.x + path.points[0].x * scale,
            position.y + path.points[0].y * scale
          );
          const end = canvasToScreen(
            position.x + path.points[1].x * scale,
            position.y + path.points[1].y * scale
          );
          const radius = path.radius * scale * zoom;
          
          // حساب زاوية البداية والنهاية
          const startAngle = Math.atan2(0, radius);
          const endAngle = Math.atan2(end.y - start.y, end.x - start.x);
          
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, startAngle, endAngle);
          ctx.stroke();
        }
      });
    }

    ctx.restore();
  }, [layers, selectedLayer, zoom, canvasToScreen]);

  // Draw current drawing preview
  const drawPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (currentPoints.length === 0 || selectedTool === 'select') return;
    
    const layer = layers.find(l => l.id === selectedLayer);
    if (!layer) return;
    
    ctx.save();
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    switch (selectedTool) {
      case 'line':
        if (currentPoints.length === 1) {
          const start = canvasToScreen(currentPoints[0].x, currentPoints[0].y);
          const end = canvasToScreen(cursorPos.x, cursorPos.y);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
        break;
        
      case 'polyline':
        if (currentPoints.length >= 1) {
          ctx.beginPath();
          const firstPoint = canvasToScreen(currentPoints[0].x, currentPoints[0].y);
          ctx.moveTo(firstPoint.x, firstPoint.y);
          
          for (let i = 1; i < currentPoints.length; i++) {
            const point = canvasToScreen(currentPoints[i].x, currentPoints[i].y);
            ctx.lineTo(point.x, point.y);
          }
          
          const cursorScreen = canvasToScreen(cursorPos.x, cursorPos.y);
          ctx.lineTo(cursorScreen.x, cursorScreen.y);
          ctx.stroke();
        }
        break;
        
      case 'circle':
        if (currentPoints.length === 1) {
          const center = canvasToScreen(currentPoints[0].x, currentPoints[0].y);
          const cursor = canvasToScreen(cursorPos.x, cursorPos.y);
          const dx = cursor.x - center.x;
          const dy = cursor.y - center.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
        
      case 'rectangle':
        if (currentPoints.length === 1) {
          const start = canvasToScreen(currentPoints[0].x, currentPoints[0].y);
          const end = canvasToScreen(cursorPos.x, cursorPos.y);
          const width = end.x - start.x;
          const height = end.y - start.y;
          
          ctx.beginPath();
          ctx.rect(start.x, start.y, width, height);
          ctx.stroke();
        }
        break;
    }
    
    // Draw current points
    currentPoints.forEach(point => {
      const screenPoint = canvasToScreen(point.x, point.y);
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.arc(screenPoint.x, screenPoint.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }, [currentPoints, cursorPos, selectedTool, selectedLayer, layers, zoom, canvasToScreen]);

  // Draw block preview during insertion
  const drawBlockPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (selectedTool !== 'insert-block' || !selectedBlock || !blockPreviewPos) return;
    
    const shape = getBlockShape(selectedBlock.id);
    if (!shape) return;
    
    const layer = layers.find(l => l.id === selectedLayer);
    if (!layer) return;
    
    ctx.save();
    ctx.globalAlpha = 0.6; // Semi-transparent preview
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 2 * zoom;
    ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
    
    const screenPos = canvasToScreen(blockPreviewPos.x, blockPreviewPos.y);
    
    // Apply transformations for rotation and flip
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate((blockRotation * Math.PI) / 180);
    ctx.scale(blockFlipH ? -1 : 1, blockFlipV ? -1 : 1);
    
    if (shape.type === 'rectangle' && shape.width && shape.height) {
      const width = shape.width * blockScale * zoom;
      const height = shape.height * blockScale * zoom;
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.stroke();
      ctx.fill();
    } else if (shape.type === 'circle' && shape.radius) {
      const radius = shape.radius * blockScale * zoom;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    } else if (shape.type === 'composite' && shape.paths) {
      shape.paths.forEach(path => {
        if (path.type === 'line' && path.points.length >= 2) {
          ctx.beginPath();
          const start = {
            x: path.points[0].x * blockScale * zoom,
            y: path.points[0].y * blockScale * zoom
          };
          ctx.moveTo(start.x, start.y);
          for (let i = 1; i < path.points.length; i++) {
            const point = {
              x: path.points[i].x * blockScale * zoom,
              y: path.points[i].y * blockScale * zoom
            };
            ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        } else if (path.type === 'rectangle' && path.points.length >= 2) {
          const x = path.points[0].x * blockScale * zoom;
          const y = path.points[0].y * blockScale * zoom;
          const w = (path.points[1].x - path.points[0].x) * blockScale * zoom;
          const h = (path.points[1].y - path.points[0].y) * blockScale * zoom;
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.stroke();
          ctx.fill();
        } else if (path.type === 'circle' && path.points.length >= 1 && path.radius) {
          const cx = path.points[0].x * blockScale * zoom;
          const cy = path.points[0].y * blockScale * zoom;
          const radius = path.radius * blockScale * zoom;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        } else if (path.type === 'arc' && path.points.length >= 2 && path.radius) {
          const cx = path.points[0].x * blockScale * zoom;
          const cy = path.points[0].y * blockScale * zoom;
          const radius = path.radius * blockScale * zoom;
          const ex = path.points[1].x * blockScale * zoom;
          const ey = path.points[1].y * blockScale * zoom;
          
          const startAngle = 0;
          const endAngle = Math.atan2(ey - cy, ex - cx);
          
          ctx.beginPath();
          ctx.arc(cx, cy, radius, startAngle, endAngle);
          ctx.stroke();
        }
      });
    }
    
    ctx.restore();
  }, [selectedTool, selectedBlock, blockPreviewPos, layers, selectedLayer, zoom, blockRotation, blockScale, blockFlipH, blockFlipV, canvasToScreen]);

  // Main render function
  const render = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw all entities
    entities.forEach(entity => drawEntity(ctx, entity));
    
    // Draw preview
    drawPreview(ctx);
    
    // Draw block preview if inserting block
    drawBlockPreview(ctx);
    
    // Draw crosshair at cursor
    if (selectedTool !== 'select') {
      const cursorScreen = canvasToScreen(cursorPos.x, cursorPos.y);
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(cursorScreen.x - 20, cursorScreen.y);
      ctx.lineTo(cursorScreen.x + 20, cursorScreen.y);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(cursorScreen.x, cursorScreen.y - 20);
      ctx.lineTo(cursorScreen.x, cursorScreen.y + 20);
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Draw coordinates display
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '12px monospace';
    ctx.fillText(`X: ${cursorPos.x.toFixed(2)}  Y: ${cursorPos.y.toFixed(2)}  Zoom: ${(zoom * 100).toFixed(0)}%`, 10, canvas.height - 10);
    ctx.restore();
    
  }, [entities, drawGrid, drawEntity, drawPreview, drawBlockPreview, cursorPos, selectedTool, zoom, canvasToScreen]);

  // Resize canvas to fit container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    render();
  }, [render]);

  // Initialize canvas
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Render on changes
  useEffect(() => {
    render();
  }, [render]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse or Alt+Left mouse - start panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    
    if (selectedTool === 'select') return;
    
    const point = screenToCanvas(e.clientX, e.clientY);
    
    switch (selectedTool) {
      case 'line':
        if (currentPoints.length === 0) {
          setCurrentPoints([point]);
        } else {
          finishEntity([currentPoints[0], point]);
        }
        break;
        
      case 'polyline':
        setCurrentPoints([...currentPoints, point]);
        break;
        
      case 'circle':
      case 'arc':
        if (currentPoints.length === 0) {
          setCurrentPoints([point]);
        } else {
          finishEntity([currentPoints[0]]);
        }
        break;
        
      case 'rectangle':
        if (currentPoints.length === 0) {
          setCurrentPoints([point]);
        } else {
          finishEntity([currentPoints[0], point]);
        }
        break;
        
      case 'insert-block':
        if (selectedBlock && blockPreviewPos) {
          // Insert block at current position
          insertBlock(blockPreviewPos);
        }
        break;
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }
    
    const point = screenToCanvas(e.clientX, e.clientY);
    setCursorPos(point);
    
    // Update block preview position when in insert-block mode
    if (selectedTool === 'insert-block' && selectedBlock) {
      setBlockPreviewPos(point);
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(false);
  };

  // Handle double click (finish polyline)
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'polyline' && currentPoints.length >= 2) {
      finishEntity(currentPoints);
    }
  };

  // Handle right click (cancel)
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setCurrentPoints([]);
  };

  // Finish drawing entity
  const finishEntity = (points: Point[]) => {
    const layer = layers.find(l => l.id === selectedLayer);
    if (!layer) return;
    
    let properties: DrawingEntity['properties'] = {};
    
    // Calculate properties based on type
    if (selectedTool === 'circle' && points.length === 1) {
      const dx = cursorPos.x - points[0].x;
      const dy = cursorPos.y - points[0].y;
      properties.radius = Math.sqrt(dx * dx + dy * dy);
    } else if (selectedTool === 'arc' && points.length === 1) {
      const dx = cursorPos.x - points[0].x;
      const dy = cursorPos.y - points[0].y;
      properties.radius = Math.sqrt(dx * dx + dy * dy);
      properties.startAngle = 0;
      properties.endAngle = Math.PI;
    }
    
    const entity: DrawingEntity = {
      id: `entity-${Date.now()}`,
      type: selectedTool as DrawingEntity['type'],
      points,
      color: layer.color,
      lineWidth: 2,
      layerId: selectedLayer,
      properties
    };
    
    setEntities([...entities, entity]);
    setCurrentPoints([]);
    
    if (onEntityAdded) {
      onEntityAdded(entity);
    }
  };

  // Insert block at specified position
  const insertBlock = (position: Point) => {
    if (!selectedBlock) return;
    
    const layer = layers.find(l => l.id === selectedLayer);
    if (!layer) return;
    
    // Create a block insert entity (for now, we'll treat it as a special drawing entity)
    // In a full implementation, you'd create a proper BLOCK entity type
    const blockEntity: DrawingEntity & { blockId?: string; blockRotation?: number; blockScale?: number } = {
      id: `block-${Date.now()}`,
      type: 'rectangle', // Temporary - should be 'block' type
      points: [position],
      color: layer.color,
      lineWidth: 2,
      layerId: selectedLayer,
      properties: {
        radius: 0 // Placeholder
      },
      blockId: selectedBlock.id,
      blockRotation: blockRotation,
      blockScale: blockScale
    };
    
    setEntities([...entities, blockEntity]);
    setBlockPreviewPos(null);
    
    if (onEntityAdded) {
      onEntityAdded(blockEntity);
    }
    
    console.log(`✅ Block inserted: ${selectedBlock.nameAr} at (${position.x.toFixed(2)}, ${position.y.toFixed(2)})`);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 10));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.1));
  const handleZoomFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700 z-10">
        <button 
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
          title="تكبير (Zoom In)"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
          title="تصغير (Zoom Out)"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleZoomFit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
          title="ملء الشاشة (Fit)"
        >
          <Home size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button 
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-colors ${
            showGrid 
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="إظهار/إخفاء الشبكة"
        >
          <GridIcon size={18} />
        </button>
        <button 
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-2 rounded-lg transition-colors ${
            snapToGrid 
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="الالتصاق بالشبكة"
        >
          <Crosshair size={18} />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className="w-full h-full cursor-crosshair"
        style={{ 
          cursor: isPanning ? 'grabbing' : selectedTool === 'select' ? 'default' : 'crosshair' 
        }}
      />

      {/* Instructions Overlay */}
      {entities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              🎨 ابدأ الرسم
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-right">
              <p>• اختر أداة من القائمة اليمنى</p>
              <p>• انقر على Canvas لبدء الرسم</p>
              <p>• استخدم Alt + النقر للتحريك</p>
              <p>• دبل كليك لإنهاء Polyline</p>
              <p>• كليك يمين للإلغاء</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          عدد العناصر: <span className="font-bold text-gray-900 dark:text-white">{entities.length}</span>
        </div>
      </div>
    </div>
  );
};

export default CADCanvas;
