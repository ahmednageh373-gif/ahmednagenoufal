import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  PerspectiveCamera,
  Sky,
  Environment,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';
import type { ElementData, ViewerSettings } from '../../types/navisworks.types';

interface NavisworksSceneProps {
  elements: ElementData[];
  selectedElementId: string | null;
  highlightedElements: Set<string>;
  hiddenElements: Set<string>;
  settings: ViewerSettings;
  onElementClick: (elementId: string, position: [number, number, number]) => void;
}

/**
 * Element Mesh Component
 */
function ElementMesh({
  element,
  isSelected,
  isHighlighted,
  onClick,
}: {
  element: ElementData;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (position: [number, number, number]) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create geometry from element data
  const geometry = useMemo(() => {
    if (!element.geometry) return null;

    const geo = new THREE.BufferGeometry();
    
    // Set vertices
    const vertices = new Float32Array(element.geometry.vertices);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    // Set indices
    const indices = new Uint32Array(element.geometry.indices);
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    
    // Set normals
    if (element.geometry.normals && element.geometry.normals.length > 0) {
      const normals = new Float32Array(element.geometry.normals);
      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    } else {
      geo.computeVertexNormals();
    }
    
    // Set UVs if available
    if (element.geometry.uvs && element.geometry.uvs.length > 0) {
      const uvs = new Float32Array(element.geometry.uvs);
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }
    
    return geo;
  }, [element.geometry]);

  // Create material
  const material = useMemo(() => {
    let color = 0x808080; // Default gray
    let opacity = 1.0;

    if (element.material?.diffuseColor) {
      const { r, g, b, a } = element.material.diffuseColor;
      color = new THREE.Color(r, g, b).getHex();
      opacity = a;
    }

    // Highlight or selection color
    if (isSelected) {
      color = 0xff6b00; // Orange for selection
      opacity = 1.0;
    } else if (isHighlighted) {
      color = 0xffff00; // Yellow for highlight
      opacity = 0.9;
    }

    return new THREE.MeshStandardMaterial({
      color,
      transparent: opacity < 1.0,
      opacity,
      metalness: 0.3,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
  }, [element.material, isSelected, isHighlighted]);

  // Apply transform matrix
  const position = useMemo(() => {
    if (element.geometry?.transform) {
      const matrix = new THREE.Matrix4();
      matrix.fromArray(element.geometry.transform);
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(matrix);
      return [pos.x, pos.y, pos.z] as [number, number, number];
    }
    return [0, 0, 0] as [number, number, number];
  }, [element.geometry?.transform]);

  // Handle click
  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick(position);
  };

  // Animate selection
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.02);
    }
  });

  if (!geometry) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      onClick={handleClick}
      castShadow
      receiveShadow
    />
  );
}

/**
 * Main Scene Component
 */
export function NavisworksScene({
  elements,
  selectedElementId,
  highlightedElements,
  hiddenElements,
  settings,
  onElementClick,
}: NavisworksSceneProps) {
  // Filter visible elements
  const visibleElements = useMemo(() => {
    return elements.filter(el => 
      !hiddenElements.has(el.id) && 
      el.geometry != null
    );
  }, [elements, hiddenElements]);

  // Calculate scene center and size
  const sceneInfo = useMemo(() => {
    if (elements.length === 0) {
      return { center: [0, 0, 0] as [number, number, number], size: 100 };
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    elements.forEach(el => {
      if (el.boundingBox) {
        minX = Math.min(minX, el.boundingBox.minX);
        minY = Math.min(minY, el.boundingBox.minY);
        minZ = Math.min(minZ, el.boundingBox.minZ);
        maxX = Math.max(maxX, el.boundingBox.maxX);
        maxY = Math.max(maxY, el.boundingBox.maxY);
        maxZ = Math.max(maxZ, el.boundingBox.maxZ);
      }
    });

    const center: [number, number, number] = [
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2,
    ];

    const size = Math.max(
      maxX - minX,
      maxY - minY,
      maxZ - minZ
    );

    return { center, size };
  }, [elements]);

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[
          sceneInfo.center[0] + sceneInfo.size,
          sceneInfo.center[1] + sceneInfo.size * 0.7,
          sceneInfo.center[2] + sceneInfo.size
        ]}
        fov={settings.cameraFov}
        near={settings.cameraNear}
        far={settings.cameraFar}
      />

      {/* Controls */}
      {settings.orbitControlsEnabled && (
        <OrbitControls
          target={sceneInfo.center}
          enableDamping
          dampingFactor={0.05}
          minDistance={sceneInfo.size * 0.1}
          maxDistance={sceneInfo.size * 5}
        />
      )}

      {/* Lighting */}
      <ambientLight intensity={settings.ambientLightIntensity} />
      <directionalLight
        position={[100, 100, 100]}
        intensity={settings.directionalLightIntensity}
        castShadow={settings.enableShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-100, 50, -100]}
        intensity={settings.directionalLightIntensity * 0.5}
      />

      {/* Environment */}
      <Sky sunPosition={[100, 100, 100]} />
      <Environment preset="city" />

      {/* Grid */}
      {settings.showGrid && (
        <Grid
          position={[sceneInfo.center[0], 0, sceneInfo.center[2]]}
          args={[sceneInfo.size * 2, sceneInfo.size * 2]}
          cellSize={sceneInfo.size / 20}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={sceneInfo.size / 4}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={sceneInfo.size * 3}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      {/* Axes Helper */}
      {settings.showAxes && (
        <axesHelper args={[sceneInfo.size / 2]} />
      )}

      {/* Contact Shadows */}
      {settings.enableShadows && (
        <ContactShadows
          position={[sceneInfo.center[0], 0, sceneInfo.center[2]]}
          opacity={0.4}
          scale={sceneInfo.size * 2}
          blur={2}
          far={sceneInfo.size}
        />
      )}

      {/* Elements */}
      {visibleElements.map(element => (
        <ElementMesh
          key={element.id}
          element={element}
          isSelected={element.id === selectedElementId}
          isHighlighted={highlightedElements.has(element.id)}
          onClick={(position) => onElementClick(element.id, position)}
        />
      ))}
    </>
  );
}
