import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Play, Pause, RotateCw, ZoomIn, ZoomOut, Maximize2, Download,
  Sun, Moon, Layers, Eye, EyeOff, Grid3x3, Home, Box, Settings,
  Camera, RefreshCw, Move, Ruler, Compass
} from 'lucide-react';

// ==================== INTERFACES ====================

interface Building3DProps {
  floorPlan?: FloorPlanData;
  buildingType?: 'villa' | 'apartment' | 'commercial';
  floors?: number;
  style?: 'modern' | 'classic' | 'minimal';
  onClose?: () => void;
}

interface FloorPlanData {
  walls?: Array<{
    start: { x: number; y: number; z?: number };
    end: { x: number; y: number; z?: number };
    thickness?: number;
    height?: number;
  }>;
  rooms?: Array<{
    name: string;
    points: Array<{ x: number; y: number }>;
    floor: number;
  }>;
  doors?: Array<{
    position: { x: number; y: number; z?: number };
    width?: number;
    height?: number;
  }>;
  windows?: Array<{
    position: { x: number; y: number; z?: number };
    width?: number;
    height?: number;
  }>;
}

// ==================== MAIN COMPONENT ====================

export default function BuildingViewer3D({ 
  floorPlan, 
  buildingType = 'villa',
  floors = 1,
  style = 'modern',
  onClose 
}: Building3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number>();

  // UI State
  const [isRotating, setIsRotating] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isDayMode, setIsDayMode] = useState(true);
  const [cameraView, setCameraView] = useState<'perspective' | 'top' | 'side' | 'front'>('perspective');
  const [showMeasurements, setShowMeasurements] = useState(false);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDayMode ? 0x87CEEB : 0x1a1a2e);
    scene.fog = new THREE.Fog(isDayMode ? 0x87CEEB : 0x1a1a2e, 50, 200);
    sceneRef.current = scene;

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(30, 25, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls Setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Lighting Setup
    setupLighting(scene, isDayMode);

    // Ground Setup
    setupGround(scene);

    // Grid Setup
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(100, 50, 0x888888, 0x444444);
      gridHelper.name = 'grid';
      scene.add(gridHelper);
    }

    // Build the 3D model
    if (floorPlan) {
      buildFromFloorPlan(scene, floorPlan, floors);
    } else {
      buildDefaultBuilding(scene, buildingType, floors, style);
    }

    // Animation Loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (isRotating && controlsRef.current) {
        scene.rotation.y += 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [floorPlan, buildingType, floors, style, isDayMode, showGrid]);

  // Update rotation
  useEffect(() => {
    if (sceneRef.current && !isRotating) {
      sceneRef.current.rotation.y = 0;
    }
  }, [isRotating]);

  // ==================== LIGHTING SETUP ====================

  const setupLighting = (scene: THREE.Scene, dayMode: boolean) => {
    // Remove existing lights
    scene.children.filter(child => child.type.includes('Light')).forEach(light => {
      scene.remove(light);
    });

    if (dayMode) {
      // Day Mode - Bright Natural Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
      sunLight.position.set(50, 50, 50);
      sunLight.castShadow = true;
      sunLight.shadow.camera.left = -50;
      sunLight.shadow.camera.right = 50;
      sunLight.shadow.camera.top = 50;
      sunLight.shadow.camera.bottom = -50;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      // Fill light
      const fillLight = new THREE.DirectionalLight(0xadd8e6, 0.3);
      fillLight.position.set(-30, 20, -30);
      scene.add(fillLight);
    } else {
      // Night Mode - Dramatic Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      scene.add(ambientLight);

      const moonLight = new THREE.DirectionalLight(0x9db4c0, 0.5);
      moonLight.position.set(30, 40, 30);
      moonLight.castShadow = true;
      scene.add(moonLight);

      // Spot lights for building
      const spotLight1 = new THREE.SpotLight(0xffd700, 0.8);
      spotLight1.position.set(15, 15, 15);
      spotLight1.angle = Math.PI / 6;
      spotLight1.penumbra = 0.3;
      scene.add(spotLight1);

      const spotLight2 = new THREE.SpotLight(0xffd700, 0.8);
      spotLight2.position.set(-15, 15, -15);
      spotLight2.angle = Math.PI / 6;
      spotLight2.penumbra = 0.3;
      scene.add(spotLight2);
    }
  };

  // ==================== GROUND SETUP ====================

  const setupGround = (scene: THREE.Scene) => {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: isDayMode ? 0x90EE90 : 0x2d5016,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    // Add pavement around building
    const pavementGeometry = new THREE.PlaneGeometry(40, 40);
    const pavementMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xc0c0c0,
      roughness: 0.9
    });
    const pavement = new THREE.Mesh(pavementGeometry, pavementMaterial);
    pavement.rotation.x = -Math.PI / 2;
    pavement.position.y = 0.01;
    pavement.receiveShadow = true;
    scene.add(pavement);
  };

  // ==================== BUILD FROM FLOOR PLAN ====================

  const buildFromFloorPlan = (scene: THREE.Scene, plan: FloorPlanData, numFloors: number) => {
    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'building';

    const scale = 0.1; // Scale factor for converting coordinates

    // Build each floor
    for (let floor = 0; floor < numFloors; floor++) {
      const floorHeight = 3; // 3 meters per floor
      const floorY = floor * floorHeight;

      // Build walls
      if (plan.walls) {
        plan.walls.forEach((wall, idx) => {
          const startX = wall.start.x * scale;
          const startZ = wall.start.y * scale;
          const endX = wall.end.x * scale;
          const endZ = wall.end.y * scale;

          const length = Math.sqrt(
            Math.pow(endX - startX, 2) + 
            Math.pow(endZ - startZ, 2)
          );
          const height = wall.height || 2.8;
          const thickness = (wall.thickness || 0.2) * scale;

          const wallGeometry = new THREE.BoxGeometry(length, height, thickness);
          const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf5f5dc,
            roughness: 0.8,
            metalness: 0.1
          });
          const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

          const centerX = (startX + endX) / 2;
          const centerZ = (startZ + endZ) / 2;
          const angle = Math.atan2(endZ - startZ, endX - startX);

          wallMesh.position.set(centerX, floorY + height / 2, centerZ);
          wallMesh.rotation.y = -angle;
          wallMesh.castShadow = true;
          wallMesh.receiveShadow = true;

          buildingGroup.add(wallMesh);
        });
      }

      // Build doors
      if (plan.doors) {
        plan.doors.forEach(door => {
          const doorGeometry = new THREE.BoxGeometry(
            door.width || 0.9,
            door.height || 2.1,
            0.05
          );
          const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.7
          });
          const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
          
          doorMesh.position.set(
            (door.position.x || 0) * scale,
            floorY + (door.height || 2.1) / 2,
            (door.position.y || 0) * scale
          );
          doorMesh.castShadow = true;

          buildingGroup.add(doorMesh);
        });
      }

      // Build windows
      if (plan.windows) {
        plan.windows.forEach(window => {
          const windowGeometry = new THREE.BoxGeometry(
            window.width || 1.2,
            window.height || 1.2,
            0.05
          );
          const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.5,
            roughness: 0.1,
            metalness: 0.8
          });
          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
          
          windowMesh.position.set(
            (window.position.x || 0) * scale,
            floorY + 1.5,
            (window.position.y || 0) * scale
          );
          windowMesh.castShadow = true;

          buildingGroup.add(windowMesh);
        });
      }

      // Build floor slab
      if (plan.rooms && plan.rooms.length > 0) {
        const floorGeometry = new THREE.BoxGeometry(15, 0.3, 15);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xd3d3d3,
          roughness: 0.9
        });
        const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        floorMesh.position.y = floorY;
        floorMesh.receiveShadow = true;
        buildingGroup.add(floorMesh);
      }
    }

    scene.add(buildingGroup);
  };

  // ==================== BUILD DEFAULT BUILDING ====================

  const buildDefaultBuilding = (
    scene: THREE.Scene, 
    type: string, 
    numFloors: number,
    buildStyle: string
  ) => {
    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'building';

    const floorHeight = 3;
    let width = 12;
    let depth = 10;

    if (type === 'apartment') {
      width = 15;
      depth = 15;
    } else if (type === 'commercial') {
      width = 20;
      depth = 20;
    }

    // Build each floor
    for (let floor = 0; floor < numFloors; floor++) {
      const floorY = floor * floorHeight;

      // Main structure
      const structureGeometry = new THREE.BoxGeometry(width, floorHeight, depth);
      const structureMaterial = new THREE.MeshStandardMaterial({ 
        color: buildStyle === 'modern' ? 0xf0f0f0 : 0xf5f5dc,
        roughness: 0.7,
        metalness: buildStyle === 'modern' ? 0.3 : 0.1
      });
      const structure = new THREE.Mesh(structureGeometry, structureMaterial);
      structure.position.y = floorY + floorHeight / 2;
      structure.castShadow = true;
      structure.receiveShadow = true;
      buildingGroup.add(structure);

      // Windows
      const windowsPerSide = Math.floor(width / 3);
      const windowHeight = 1.5;
      const windowWidth = 1.2;

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < windowsPerSide; j++) {
          const windowGeometry = new THREE.BoxGeometry(
            i % 2 === 0 ? windowWidth : 0.1,
            windowHeight,
            i % 2 === 1 ? windowWidth : 0.1
          );
          const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.8
          });
          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

          const offset = (j - windowsPerSide / 2 + 0.5) * 3;
          
          if (i === 0) {
            windowMesh.position.set(offset, floorY + floorHeight / 2, depth / 2 + 0.05);
          } else if (i === 1) {
            windowMesh.position.set(width / 2 + 0.05, floorY + floorHeight / 2, offset);
          } else if (i === 2) {
            windowMesh.position.set(offset, floorY + floorHeight / 2, -depth / 2 - 0.05);
          } else {
            windowMesh.position.set(-width / 2 - 0.05, floorY + floorHeight / 2, offset);
          }

          buildingGroup.add(windowMesh);
        }
      }

      // Balconies for modern style
      if (buildStyle === 'modern' && floor > 0) {
        const balconyGeometry = new THREE.BoxGeometry(width - 2, 0.2, 2);
        const balconyMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x808080,
          roughness: 0.6
        });
        const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
        balcony.position.set(0, floorY + floorHeight - 0.1, depth / 2 + 1);
        balcony.castShadow = true;
        buildingGroup.add(balcony);
      }
    }

    // Roof
    const roofY = numFloors * floorHeight;
    
    if (buildStyle === 'classic') {
      // Pitched roof
      const roofGeometry = new THREE.ConeGeometry(
        Math.max(width, depth) * 0.7,
        2,
        4
      );
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.9
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = roofY + 1;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      buildingGroup.add(roof);
    } else {
      // Flat modern roof
      const roofGeometry = new THREE.BoxGeometry(width, 0.5, depth);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x505050,
        roughness: 0.8
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = roofY + 0.25;
      roof.castShadow = true;
      buildingGroup.add(roof);
    }

    // Main entrance door
    const doorGeometry = new THREE.BoxGeometry(1.2, 2.4, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x654321,
      roughness: 0.6
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.2, depth / 2 + 0.1);
    door.castShadow = true;
    buildingGroup.add(door);

    // Add some landscaping
    addLandscaping(scene, width, depth);

    scene.add(buildingGroup);
  };

  // ==================== LANDSCAPING ====================

  const addLandscaping = (scene: THREE.Scene, buildingWidth: number, buildingDepth: number) => {
    const landscapeGroup = new THREE.Group();

    // Trees
    const treePositions = [
      { x: buildingWidth / 2 + 5, z: buildingDepth / 2 + 5 },
      { x: -buildingWidth / 2 - 5, z: buildingDepth / 2 + 5 },
      { x: buildingWidth / 2 + 5, z: -buildingDepth / 2 - 5 },
      { x: -buildingWidth / 2 - 5, z: -buildingDepth / 2 - 5 }
    ];

    treePositions.forEach(pos => {
      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(pos.x, 1.5, pos.z);
      trunk.castShadow = true;
      landscapeGroup.add(trunk);

      // Foliage
      const foliageGeometry = new THREE.SphereGeometry(2, 8, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(pos.x, 4, pos.z);
      foliage.castShadow = true;
      landscapeGroup.add(foliage);
    });

    scene.add(landscapeGroup);
  };

  // ==================== CAMERA CONTROLS ====================

  const changeCameraView = (view: 'perspective' | 'top' | 'side' | 'front') => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (view) {
      case 'top':
        camera.position.set(0, 50, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'side':
        camera.position.set(40, 15, 0);
        camera.lookAt(0, 10, 0);
        break;
      case 'front':
        camera.position.set(0, 15, 40);
        camera.lookAt(0, 10, 0);
        break;
      case 'perspective':
      default:
        camera.position.set(30, 25, 30);
        camera.lookAt(0, 0, 0);
        break;
    }

    controls.update();
    setCameraView(view);
  };

  // ==================== RENDER ====================

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-7xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <Box className="w-7 h-7 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">🏢 عارض المباني ثلاثي الأبعاد</h3>
              <p className="text-sm text-blue-100">عرض تفاعلي متقدم للمباني والتصاميم المعمارية</p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative" ref={containerRef} />

        {/* Controls Panel */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`p-2 rounded-lg transition-all ${
                  isRotating 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={isRotating ? "إيقاف الدوران" : "تشغيل الدوران"}
              >
                {isRotating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsDayMode(!isDayMode)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-gray-300"
                title={isDayMode ? "الوضع الليلي" : "الوضع النهاري"}
              >
                {isDayMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-all ${
                  showGrid 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="إظهار/إخفاء الشبكة"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowMeasurements(!showMeasurements)}
                className={`p-2 rounded-lg transition-all ${
                  showMeasurements 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="إظهار القياسات"
              >
                <Ruler className="w-5 h-5" />
              </button>
            </div>

            {/* Center Controls - Camera Views */}
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
              {[
                { view: 'perspective', icon: Box, label: 'منظور' },
                { view: 'top', icon: Layers, label: 'علوي' },
                { view: 'side', icon: Move, label: 'جانبي' },
                { view: 'front', icon: Home, label: 'أمامي' }
              ].map(({ view, icon: Icon, label }) => (
                <button
                  key={view}
                  onClick={() => changeCameraView(view as any)}
                  className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
                    cameraView === view
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-600'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (controlsRef.current) {
                    controlsRef.current.reset();
                  }
                }}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-gray-300"
                title="إعادة تعيين العرض"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2"
                title="تنزيل صورة"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm">تنزيل</span>
              </button>
            </div>
          </div>

          {/* Info Bar */}
          <div className="mt-3 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>عرض: {cameraView === 'perspective' ? 'منظور' : cameraView === 'top' ? 'علوي' : cameraView === 'side' ? 'جانبي' : 'أمامي'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>استخدم الماوس للتحريك والدوران والتكبير</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
