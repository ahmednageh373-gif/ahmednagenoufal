import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Download, Save, Undo, Redo, ZoomIn, ZoomOut, Move, Square,
  Circle, Minus, Type, Trash2, Grid, Eye, EyeOff, Layers,
  Maximize2, Minimize2, RotateCw, Copy, Scissors, Lock, Unlock,
  Home, DoorOpen, Maximize, Box, Package, Upload, FileDown,
  Sparkles, MessageSquare, Image as ImageIcon, Ruler, Settings,
  ChevronRight, ChevronLeft, Play, Pause, RefreshCw, Check, X
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { yqArchBlocks, blockCategories } from '../data/yqarch-library-data';
import { yqArchHatches } from '../data/yqarch-hatches';

// ==================== TYPES ====================

interface Point {
  x: number;
  y: number;
}

interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
  height: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

interface Room {
  id: string;
  name: string;
  nameAr: string;
  walls: string[];  // Wall IDs
  area: number;
  width: number;
  length: number;
  hatch?: string;
  color: string;
}

interface Door {
  id: string;
  position: Point;
  wallId: string;
  width: number;
  openAngle: number;  // 0-90 degrees
  type: 'single' | 'double' | 'sliding';
}

interface Window {
  id: string;
  position: Point;
  wallId: string;
  width: number;
  height: number;
  type: 'single' | 'double' | 'sliding';
}

interface Block {
  id: string;
  blockType: string;  // From yqArchBlocks
  position: Point;
  rotation: number;
  scale: number;
}

interface DrawingElement {
  id: string;
  type: 'wall' | 'room' | 'door' | 'window' | 'block' | 'text' | 'dimension';
  data: any;
  locked: boolean;
  visible: boolean;
  layer: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

interface FloorPlan {
  id: string;
  name: string;
  elements: DrawingElement[];
  layers: Layer[];
  scale: number;  // pixels per meter
  gridSize: number;
  snapToGrid: boolean;
  bounds: { width: number; height: number };
}

interface AIInstruction {
  command: string;
  parameters: any;
  status: 'pending' | 'executing' | 'completed' | 'error';
  result?: any;
}

// ==================== MAIN COMPONENT ====================

export default function ArchitecturalDrawingStudio() {
  // Canvas and Drawing State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [floorPlan, setFloorPlan] = useState<FloorPlan>({
    id: 'main',
    name: 'مخطط جديد',
    elements: [],
    layers: [
      { id: 'walls', name: 'الجدران', visible: true, locked: false, color: '#000000' },
      { id: 'doors', name: 'الأبواب', visible: true, locked: false, color: '#8B4513' },
      { id: 'windows', name: 'النوافذ', visible: true, locked: false, color: '#4169E1' },
      { id: 'furniture', name: 'الأثاث', visible: true, locked: false, color: '#2F4F4F' },
      { id: 'dimensions', name: 'الأبعاد', visible: true, locked: false, color: '#FF0000' }
    ],
    scale: 20,  // 20 pixels = 1 meter
    gridSize: 10,
    snapToGrid: true,
    bounds: { width: 1200, height: 800 }
  });

  // Tool State
  const [activeTool, setActiveTool] = useState<'select' | 'wall' | 'room' | 'door' | 'window' | 'block' | 'text' | 'dimension' | 'move'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  
  // Selection State
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<FloorPlan[]>([floorPlan]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // View State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  // AI Assistant State
  const [aiMode, setAiMode] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiInstructions, setAiInstructions] = useState<AIInstruction[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // 3D View State
  const [show3D, setShow3D] = useState(false);
  const threeDRef = useRef<HTMLDivElement>(null);
  const [threeScene, setThreeScene] = useState<THREE.Scene | null>(null);

  // Block Library State
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [blockSearchQuery, setBlockSearchQuery] = useState('');

  // ==================== CANVAS INITIALIZATION ====================

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        setCtx(context);
        // Set canvas size
        canvas.width = floorPlan.bounds.width;
        canvas.height = floorPlan.bounds.height;
      }
    }
  }, []);

  // ==================== DRAWING FUNCTIONS ====================

  const drawGrid = (context: CanvasRenderingContext2D) => {
    if (!showGrid) return;

    context.save();
    context.strokeStyle = '#e0e0e0';
    context.lineWidth = 0.5;

    const gridSize = floorPlan.gridSize;
    const width = floorPlan.bounds.width;
    const height = floorPlan.bounds.height;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    context.restore();
  };

  const drawWall = (context: CanvasRenderingContext2D, wall: Wall) => {
    context.save();
    context.strokeStyle = wall.color;
    context.lineWidth = wall.thickness;
    
    if (wall.style === 'dashed') {
      context.setLineDash([5, 5]);
    } else if (wall.style === 'dotted') {
      context.setLineDash([2, 2]);
    }

    context.beginPath();
    context.moveTo(wall.start.x, wall.start.y);
    context.lineTo(wall.end.x, wall.end.y);
    context.stroke();

    context.restore();
  };

  const drawRoom = (context: CanvasRenderingContext2D, room: Room) => {
    // Get walls for this room
    const roomWalls = floorPlan.elements
      .filter(el => room.walls.includes(el.id) && el.type === 'wall')
      .map(el => el.data as Wall);

    if (roomWalls.length === 0) return;

    context.save();
    
    // Draw room fill with hatch pattern
    context.fillStyle = room.color + '20';  // Add transparency
    context.beginPath();
    
    // Create path from walls
    if (roomWalls.length > 0) {
      context.moveTo(roomWalls[0].start.x, roomWalls[0].start.y);
      roomWalls.forEach(wall => {
        context.lineTo(wall.end.x, wall.end.y);
      });
      context.closePath();
    }
    
    context.fill();

    // Draw room name at center
    context.fillStyle = '#000000';
    context.font = '14px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Calculate center (simplified)
    if (roomWalls.length > 0) {
      const centerX = roomWalls.reduce((sum, wall) => sum + wall.start.x + wall.end.x, 0) / (roomWalls.length * 2);
      const centerY = roomWalls.reduce((sum, wall) => sum + wall.start.y + wall.end.y, 0) / (roomWalls.length * 2);
      
      context.fillText(room.nameAr, centerX, centerY);
      context.font = '11px Arial';
      context.fillText(`${room.width}×${room.length}م`, centerX, centerY + 20);
      context.fillText(`${room.area} م²`, centerX, centerY + 35);
    }

    context.restore();
  };

  const drawDoor = (context: CanvasRenderingContext2D, door: Door) => {
    context.save();
    context.strokeStyle = '#8B4513';
    context.fillStyle = '#8B4513';
    context.lineWidth = 2;

    const { x, y } = door.position;
    const width = door.width * floorPlan.scale;

    // Draw door arc
    context.beginPath();
    context.arc(x, y, width, 0, Math.PI / 2);
    context.stroke();

    // Draw door line
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + width, y);
    context.stroke();

    context.restore();
  };

  const drawWindow = (context: CanvasRenderingContext2D, window: Window) => {
    context.save();
    context.strokeStyle = '#4169E1';
    context.fillStyle = '#87CEEB40';
    context.lineWidth = 2;

    const { x, y } = window.position;
    const width = window.width * floorPlan.scale;
    const height = 5;

    // Draw window
    context.fillRect(x - width / 2, y - height / 2, width, height);
    context.strokeRect(x - width / 2, y - height / 2, width, height);

    // Draw window panes
    context.beginPath();
    context.moveTo(x - width / 4, y - height / 2);
    context.lineTo(x - width / 4, y + height / 2);
    context.moveTo(x + width / 4, y - height / 2);
    context.lineTo(x + width / 4, y + height / 2);
    context.stroke();

    context.restore();
  };

  const drawBlock = (context: CanvasRenderingContext2D, block: Block) => {
    context.save();
    
    const { x, y } = block.position;
    
    context.translate(x, y);
    context.rotate(block.rotation * Math.PI / 180);
    context.scale(block.scale, block.scale);

    // Find block data
    const blockData = yqArchBlocks.find(b => b.id === block.blockType);
    
    if (blockData) {
      // Draw simplified block representation
      context.fillStyle = '#2F4F4F';
      context.strokeStyle = '#000000';
      context.lineWidth = 1;

      // Simple rectangle for now (can be enhanced with actual block shapes)
      const size = 30;
      context.fillRect(-size / 2, -size / 2, size, size);
      context.strokeRect(-size / 2, -size / 2, size, size);

      // Draw block name
      context.font = '10px Arial';
      context.fillStyle = '#000000';
      context.textAlign = 'center';
      context.fillText(blockData.nameAr.slice(0, 5), 0, size + 10);
    }

    context.restore();
  };

  const renderCanvas = () => {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, floorPlan.bounds.width, floorPlan.bounds.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    drawGrid(ctx);

    // Draw elements in layer order
    const layers = ['rooms', 'walls', 'windows', 'doors', 'furniture', 'dimensions'];
    
    layers.forEach(layerName => {
      const layer = floorPlan.layers.find(l => l.id === layerName);
      if (!layer || !layer.visible) return;

      floorPlan.elements
        .filter(el => el.visible && !el.locked)
        .forEach(element => {
          if (element.type === 'wall' && layerName === 'walls') {
            drawWall(ctx, element.data as Wall);
          } else if (element.type === 'room' && layerName === 'rooms') {
            drawRoom(ctx, element.data as Room);
          } else if (element.type === 'door' && layerName === 'doors') {
            drawDoor(ctx, element.data as Door);
          } else if (element.type === 'window' && layerName === 'windows') {
            drawWindow(ctx, element.data as Window);
          } else if (element.type === 'block' && layerName === 'furniture') {
            drawBlock(ctx, element.data as Block);
          }
        });
    });

    // Draw current path if drawing
    if (isDrawing && currentPath.length > 0) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Render on every change
  useEffect(() => {
    renderCanvas();
  }, [ctx, floorPlan, zoom, pan, showGrid, currentPath, isDrawing]);

  // ==================== AI PROCESSING ====================

  const parseAICommand = (input: string): AIInstruction | null => {
    const lowerInput = input.toLowerCase();

    // Room creation: "ارسم غرفة نوم 4×3"
    const roomMatch = input.match(/(?:ارسم|أضف|اعمل)\s+(غرفة\s+\w+|صالة|مطبخ|حمام|مجلس)\s*(\d+)\s*[×x]\s*(\d+)/i);
    if (roomMatch) {
      return {
        command: 'createRoom',
        parameters: {
          type: roomMatch[1],
          width: parseFloat(roomMatch[2]),
          length: parseFloat(roomMatch[3])
        },
        status: 'pending'
      };
    }

    // Wall creation: "ارسم جدار من 0,0 إلى 400,0"
    const wallMatch = input.match(/(?:ارسم|أضف)\s+جدار\s+من\s+(\d+),(\d+)\s+(?:إلى|الى)\s+(\d+),(\d+)/i);
    if (wallMatch) {
      return {
        command: 'createWall',
        parameters: {
          start: { x: parseInt(wallMatch[1]), y: parseInt(wallMatch[2]) },
          end: { x: parseInt(wallMatch[3]), y: parseInt(wallMatch[4]) }
        },
        status: 'pending'
      };
    }

    // Door/Window: "أضف باب عند 200,100"
    const doorMatch = input.match(/(?:أضف|ضع)\s+(باب|نافذة)\s+(?:عند|في)\s+(\d+),(\d+)/i);
    if (doorMatch) {
      return {
        command: doorMatch[1] === 'باب' ? 'createDoor' : 'createWindow',
        parameters: {
          position: { x: parseInt(doorMatch[2]), y: parseInt(doorMatch[3]) }
        },
        status: 'pending'
      };
    }

    // Complete floor plan: "صمم فيلا 200 متر"
    const houseMatch = input.match(/(?:صمم|ارسم|اعمل)\s+(فيلا|شقة|منزل|بيت)\s+(\d+)\s*(?:متر|م)/i);
    if (houseMatch) {
      return {
        command: 'generateFloorPlan',
        parameters: {
          buildingType: houseMatch[1],
          area: parseInt(houseMatch[2])
        },
        status: 'pending'
      };
    }

    return null;
  };

  const executeAIInstruction = async (instruction: AIInstruction) => {
    setIsAiProcessing(true);
    
    try {
      switch (instruction.command) {
        case 'createRoom': {
          const { type, width, length } = instruction.parameters;
          const area = width * length;
          
          // Create room walls
          const roomId = `room-${Date.now()}`;
          const scale = floorPlan.scale;
          const centerX = floorPlan.bounds.width / 2;
          const centerY = floorPlan.bounds.height / 2;
          
          const walls: Wall[] = [
            {
              id: `wall-${roomId}-1`,
              start: { x: centerX - (width * scale) / 2, y: centerY - (length * scale) / 2 },
              end: { x: centerX + (width * scale) / 2, y: centerY - (length * scale) / 2 },
              thickness: 3,
              height: 2.8,
              style: 'solid',
              color: '#000000'
            },
            {
              id: `wall-${roomId}-2`,
              start: { x: centerX + (width * scale) / 2, y: centerY - (length * scale) / 2 },
              end: { x: centerX + (width * scale) / 2, y: centerY + (length * scale) / 2 },
              thickness: 3,
              height: 2.8,
              style: 'solid',
              color: '#000000'
            },
            {
              id: `wall-${roomId}-3`,
              start: { x: centerX + (width * scale) / 2, y: centerY + (length * scale) / 2 },
              end: { x: centerX - (width * scale) / 2, y: centerY + (length * scale) / 2 },
              thickness: 3,
              height: 2.8,
              style: 'solid',
              color: '#000000'
            },
            {
              id: `wall-${roomId}-4`,
              start: { x: centerX - (width * scale) / 2, y: centerY + (length * scale) / 2 },
              end: { x: centerX - (width * scale) / 2, y: centerY - (length * scale) / 2 },
              thickness: 3,
              height: 2.8,
              style: 'solid',
              color: '#000000'
            }
          ];

          const room: Room = {
            id: roomId,
            name: type,
            nameAr: type,
            walls: walls.map(w => w.id),
            area,
            width,
            length,
            color: '#3B82F6'
          };

          // Add to floor plan
          const newElements: DrawingElement[] = [
            ...walls.map(wall => ({
              id: wall.id,
              type: 'wall' as const,
              data: wall,
              locked: false,
              visible: true,
              layer: 'walls'
            })),
            {
              id: roomId,
              type: 'room' as const,
              data: room,
              locked: false,
              visible: true,
              layer: 'rooms'
            }
          ];

          setFloorPlan(prev => ({
            ...prev,
            elements: [...prev.elements, ...newElements]
          }));

          instruction.status = 'completed';
          instruction.result = `تم إنشاء ${type} بمساحة ${area} م²`;
          break;
        }

        case 'createWall': {
          const { start, end } = instruction.parameters;
          const wallId = `wall-${Date.now()}`;
          
          const wall: Wall = {
            id: wallId,
            start,
            end,
            thickness: 3,
            height: 2.8,
            style: 'solid',
            color: '#000000'
          };

          const element: DrawingElement = {
            id: wallId,
            type: 'wall',
            data: wall,
            locked: false,
            visible: true,
            layer: 'walls'
          };

          setFloorPlan(prev => ({
            ...prev,
            elements: [...prev.elements, element]
          }));

          instruction.status = 'completed';
          instruction.result = 'تم إضافة الجدار';
          break;
        }

        case 'createDoor': {
          const { position } = instruction.parameters;
          const doorId = `door-${Date.now()}`;
          
          const door: Door = {
            id: doorId,
            position,
            wallId: '',  // Would need wall detection
            width: 0.9,  // 90cm standard
            openAngle: 90,
            type: 'single'
          };

          const element: DrawingElement = {
            id: doorId,
            type: 'door',
            data: door,
            locked: false,
            visible: true,
            layer: 'doors'
          };

          setFloorPlan(prev => ({
            ...prev,
            elements: [...prev.elements, element]
          }));

          instruction.status = 'completed';
          instruction.result = 'تم إضافة الباب';
          break;
        }

        case 'createWindow': {
          const { position } = instruction.parameters;
          const windowId = `window-${Date.now()}`;
          
          const window: Window = {
            id: windowId,
            position,
            wallId: '',
            width: 1.2,
            height: 1.2,
            type: 'single'
          };

          const element: DrawingElement = {
            id: windowId,
            type: 'window',
            data: window,
            locked: false,
            visible: true,
            layer: 'windows'
          };

          setFloorPlan(prev => ({
            ...prev,
            elements: [...prev.elements, element]
          }));

          instruction.status = 'completed';
          instruction.result = 'تم إضافة النافذة';
          break;
        }

        case 'generateFloorPlan': {
          const { buildingType, area } = instruction.parameters;
          
          // Generate complete floor plan based on area
          const rooms = generateRoomsForArea(buildingType, area);
          const generatedElements: DrawingElement[] = [];

          let currentX = 100;
          let currentY = 100;
          const scale = floorPlan.scale;

          rooms.forEach(roomSpec => {
            const roomId = `room-${Date.now()}-${Math.random()}`;
            const width = roomSpec.width;
            const length = roomSpec.length;

            const walls: Wall[] = [
              {
                id: `wall-${roomId}-1`,
                start: { x: currentX, y: currentY },
                end: { x: currentX + (width * scale), y: currentY },
                thickness: 3,
                height: 2.8,
                style: 'solid',
                color: '#000000'
              },
              {
                id: `wall-${roomId}-2`,
                start: { x: currentX + (width * scale), y: currentY },
                end: { x: currentX + (width * scale), y: currentY + (length * scale) },
                thickness: 3,
                height: 2.8,
                style: 'solid',
                color: '#000000'
              },
              {
                id: `wall-${roomId}-3`,
                start: { x: currentX + (width * scale), y: currentY + (length * scale) },
                end: { x: currentX, y: currentY + (length * scale) },
                thickness: 3,
                height: 2.8,
                style: 'solid',
                color: '#000000'
              },
              {
                id: `wall-${roomId}-4`,
                start: { x: currentX, y: currentY + (length * scale) },
                end: { x: currentX, y: currentY },
                thickness: 3,
                height: 2.8,
                style: 'solid',
                color: '#000000'
              }
            ];

            const room: Room = {
              id: roomId,
              name: roomSpec.type,
              nameAr: roomSpec.type,
              walls: walls.map(w => w.id),
              area: width * length,
              width,
              length,
              color: '#3B82F6'
            };

            generatedElements.push(
              ...walls.map(wall => ({
                id: wall.id,
                type: 'wall' as const,
                data: wall,
                locked: false,
                visible: true,
                layer: 'walls'
              })),
              {
                id: roomId,
                type: 'room' as const,
                data: room,
                locked: false,
                visible: true,
                layer: 'rooms'
              }
            );

            currentX += (width * scale) + 20;
            if (currentX > floorPlan.bounds.width - 200) {
              currentX = 100;
              currentY += 200;
            }
          });

          setFloorPlan(prev => ({
            ...prev,
            elements: [...prev.elements, ...generatedElements]
          }));

          instruction.status = 'completed';
          instruction.result = `تم تصميم ${buildingType} بمساحة ${area} م² مع ${rooms.length} غرفة`;
          break;
        }

        default:
          instruction.status = 'error';
          instruction.result = 'أمر غير معروف';
      }
    } catch (error) {
      instruction.status = 'error';
      instruction.result = 'حدث خطأ في التنفيذ';
    }

    setIsAiProcessing(false);
    setAiInstructions(prev => [...prev, instruction]);
  };

  const generateRoomsForArea = (buildingType: string, totalArea: number) => {
    // Simple room generation logic
    const rooms: { type: string; width: number; length: number }[] = [];

    if (buildingType === 'فيلا' || buildingType === 'منزل') {
      if (totalArea >= 150) {
        rooms.push(
          { type: 'غرفة نوم رئيسية', width: 5, length: 4 },
          { type: 'غرفة نوم', width: 4, length: 3.5 },
          { type: 'غرفة نوم', width: 4, length: 3.5 },
          { type: 'صالة', width: 6, length: 5 },
          { type: 'مجلس', width: 5, length: 4 },
          { type: 'مطبخ', width: 4, length: 3 },
          { type: 'حمام رئيسي', width: 3, length: 2.5 },
          { type: 'حمام', width: 2.5, length: 2 },
          { type: 'حمام', width: 2.5, length: 2 }
        );
      } else if (totalArea >= 100) {
        rooms.push(
          { type: 'غرفة نوم', width: 4, length: 4 },
          { type: 'غرفة نوم', width: 3.5, length: 3.5 },
          { type: 'صالة', width: 5, length: 4 },
          { type: 'مطبخ', width: 3, length: 3 },
          { type: 'حمام', width: 2.5, length: 2 },
          { type: 'حمام', width: 2, length: 2 }
        );
      }
    } else if (buildingType === 'شقة') {
      rooms.push(
        { type: 'غرفة نوم', width: 4, length: 3.5 },
        { type: 'غرفة نوم', width: 3.5, length: 3 },
        { type: 'صالة', width: 5, length: 4 },
        { type: 'مطبخ', width: 3, length: 2.5 },
        { type: 'حمام', width: 2, length: 2 }
      );
    }

    return rooms;
  };

  const handleAISubmit = () => {
    if (!aiInput.trim()) return;

    const instruction = parseAICommand(aiInput);
    if (instruction) {
      executeAIInstruction(instruction);
      setAiInput('');
    } else {
      setAiInstructions(prev => [...prev, {
        command: 'unknown',
        parameters: {},
        status: 'error',
        result: 'لم أفهم الأمر. جرب:\n- "ارسم غرفة نوم 4×3"\n- "أضف باب عند 200,100"\n- "صمم فيلا 200 متر"'
      }]);
    }
  };

  // ==================== 3D CONVERSION ====================

  const convert2Dto3D = () => {
    if (!threeDRef.current) return;

    // Create Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      threeDRef.current.clientWidth / threeDRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(threeDRef.current.clientWidth, threeDRef.current.clientHeight);
    threeDRef.current.innerHTML = '';
    threeDRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Add ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Convert floor plan elements to 3D
    const scale3D = 0.05;  // Convert pixels to 3D units

    floorPlan.elements.forEach(element => {
      if (element.type === 'wall') {
        const wall = element.data as Wall;
        const width = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) + 
          Math.pow(wall.end.y - wall.start.y, 2)
        ) * scale3D;
        const height = wall.height;
        const thickness = wall.thickness * scale3D;

        const wallGeometry = new THREE.BoxGeometry(width, height, thickness);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

        const centerX = (wall.start.x + wall.end.x) / 2 * scale3D;
        const centerZ = (wall.start.y + wall.end.y) / 2 * scale3D;
        const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);

        wallMesh.position.set(centerX, height / 2, centerZ);
        wallMesh.rotation.y = -angle;

        scene.add(wallMesh);
      } else if (element.type === 'door') {
        const door = element.data as Door;
        const doorGeometry = new THREE.BoxGeometry(door.width, 2, 0.05);
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        
        doorMesh.position.set(
          door.position.x * scale3D,
          1,
          door.position.y * scale3D
        );

        scene.add(doorMesh);
      } else if (element.type === 'window') {
        const window = element.data as Window;
        const windowGeometry = new THREE.BoxGeometry(window.width, window.height, 0.05);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x87CEEB,
          transparent: true,
          opacity: 0.5
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        
        windowMesh.position.set(
          window.position.x * scale3D,
          1.5,
          window.position.y * scale3D
        );

        scene.add(windowMesh);
      }
    });

    setThreeScene(scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  };

  useEffect(() => {
    if (show3D) {
      convert2Dto3D();
    }
  }, [show3D, floorPlan]);

  // ==================== FILTERED BLOCKS ====================

  const filteredBlocks = useMemo(() => {
    return yqArchBlocks.filter(block => 
      block.nameAr.includes(blockSearchQuery) || 
      block.nameEn.toLowerCase().includes(blockSearchQuery.toLowerCase())
    );
  }, [blockSearchQuery]);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏗️ استوديو الرسم المعماري</h1>
              <p className="text-sm text-gray-600 mt-1">رسم المخططات المعمارية بالذكاء الاصطناعي مع تحويل 3D</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShow3D(!show3D)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <Box className="w-5 h-5" />
                {show3D ? 'إخفاء 3D' : 'عرض 3D'}
              </button>
              
              <button
                onClick={() => setShowBlockLibrary(!showBlockLibrary)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                مكتبة البلوكات
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2">
                <Download className="w-5 h-5" />
                تصدير DWG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Tools Sidebar */}
        <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-gray-900">🛠️ الأدوات</h3>
          
          <div className="space-y-2">
            {[
              { id: 'select', icon: Move, label: 'تحديد' },
              { id: 'wall', icon: Minus, label: 'جدار' },
              { id: 'room', icon: Square, label: 'غرفة' },
              { id: 'door', icon: DoorOpen, label: 'باب' },
              { id: 'window', icon: Maximize2, label: 'نافذة' },
              { id: 'block', icon: Package, label: 'بلوك' },
              { id: 'text', icon: Type, label: 'نص' },
              { id: 'dimension', icon: Ruler, label: 'أبعاد' }
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  activeTool === tool.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tool.icon className="w-5 h-5" />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          <hr className="my-6" />

          <h3 className="text-lg font-bold mb-4 text-gray-900">⚙️ الإعدادات</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">عرض الشبكة</span>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">عرض الأبعاد</span>
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={(e) => setShowDimensions(e.target.checked)}
                className="w-5 h-5"
              />
            </label>

            <div>
              <label className="text-sm text-gray-700">التكبير: {(zoom * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">حجم الشبكة: {floorPlan.gridSize}px</label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={floorPlan.gridSize}
                onChange={(e) => setFloorPlan(prev => ({ ...prev, gridSize: parseInt(e.target.value) }))}
                className="w-full mt-2"
              />
            </div>
          </div>

          <hr className="my-6" />

          <h3 className="text-lg font-bold mb-4 text-gray-900">📊 الإحصائيات</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>الجدران:</span>
              <span className="font-bold">{floorPlan.elements.filter(e => e.type === 'wall').length}</span>
            </div>
            <div className="flex justify-between">
              <span>الغرف:</span>
              <span className="font-bold">{floorPlan.elements.filter(e => e.type === 'room').length}</span>
            </div>
            <div className="flex justify-between">
              <span>الأبواب:</span>
              <span className="font-bold">{floorPlan.elements.filter(e => e.type === 'door').length}</span>
            </div>
            <div className="flex justify-between">
              <span>النوافذ:</span>
              <span className="font-bold">{floorPlan.elements.filter(e => e.type === 'window').length}</span>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-100">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
          />
          
          {/* Toolbar */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded" title="تراجع">
              <Undo className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="إعادة">
              <Redo className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-300" />
            <button className="p-2 hover:bg-gray-100 rounded" title="تكبير">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="تصغير">
              <ZoomOut className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-300" />
            <button className="p-2 hover:bg-gray-100 rounded" title="حفظ">
              <Save className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              مساعد الرسم الذكي
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiInstructions.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>اكتب أمر للبدء في الرسم</p>
                <div className="mt-4 text-right space-y-2">
                  <p className="font-bold text-gray-700">أمثلة:</p>
                  <p>• ارسم غرفة نوم 4×3</p>
                  <p>• صمم فيلا 200 متر</p>
                  <p>• أضف باب عند 200,100</p>
                  <p>• أضف نافذة عند 300,150</p>
                </div>
              </div>
            )}

            {aiInstructions.map((instruction, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  instruction.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : instruction.status === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : instruction.status === 'executing'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {instruction.status === 'completed' && <Check className="w-4 h-4 text-green-600" />}
                  {instruction.status === 'error' && <X className="w-4 h-4 text-red-600" />}
                  {instruction.status === 'executing' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
                  <span className="text-sm font-bold text-gray-900">{instruction.command}</span>
                </div>
                {instruction.result && (
                  <p className="text-sm text-gray-700 whitespace-pre-line">{instruction.result}</p>
                )}
              </div>
            ))}

            {isAiProcessing && (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-gray-600 mt-2">جاري التنفيذ...</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAISubmit()}
                placeholder="اكتب أمر الرسم..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAiProcessing}
              />
              <button
                onClick={handleAISubmit}
                disabled={isAiProcessing || !aiInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D View Modal */}
      {show3D && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">🏢 العرض ثلاثي الأبعاد</h2>
              <button
                onClick={() => setShow3D(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div ref={threeDRef} className="flex-1" />

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                استخدم الماوس للدوران • عجلة الماوس للتكبير • زر الماوس الأيمن للتحريك
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Block Library Modal */}
      {showBlockLibrary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">📦 مكتبة البلوكات</h2>
              <button
                onClick={() => setShowBlockLibrary(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={blockSearchQuery}
                onChange={(e) => setBlockSearchQuery(e.target.value)}
                placeholder="ابحث عن بلوك..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4">
                {filteredBlocks.map(block => (
                  <div
                    key={block.id}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                    onClick={() => {
                      // Add block to drawing at center
                      const newBlock: Block = {
                        id: `block-${Date.now()}`,
                        blockType: block.id,
                        position: { 
                          x: floorPlan.bounds.width / 2, 
                          y: floorPlan.bounds.height / 2 
                        },
                        rotation: 0,
                        scale: 1
                      };

                      const element: DrawingElement = {
                        id: newBlock.id,
                        type: 'block',
                        data: newBlock,
                        locked: false,
                        visible: true,
                        layer: 'furniture'
                      };

                      setFloorPlan(prev => ({
                        ...prev,
                        elements: [...prev.elements, element]
                      }));

                      setShowBlockLibrary(false);
                    }}
                  >
                    <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center">
                      <Package className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 text-center">{block.nameAr}</h3>
                    <p className="text-xs text-gray-600 text-center mt-1">{block.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
