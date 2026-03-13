import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DetectionPoint {
  position: THREE.Vector3;
  age: number;
  color: THREE.Color;
}

interface HeatmapScreenProps {
  position: [number, number, number];
  histogram: number[];
  wavelength: number;
  slitDistance?: number;
  slitWidth?: number;
  observerOn: boolean;
  showHeatmap: boolean;
  showDiscretePoints?: boolean;  // New: show individual detection points
}

/**
 * HeatmapScreen with discrete detection point visualization
 * 
 * Based on Optica research:
 * "diffraction pattern arises as a mosaic point by point from clicks 
 * of single-particle detectors"
 * 
 * Features:
 * - Traditional heatmap (smoothed histogram)
 * - Discrete detection points (individual photon arrivals)
 * - Point accumulation over time
 */
export function HeatmapScreen({ 
  position, 
  histogram, 
  wavelength,
  slitDistance = 0.3,
  slitWidth = 0.05,
  observerOn,
  showHeatmap,
  showDiscretePoints = true,
}: HeatmapScreenProps) {
  const textureRef = useRef<THREE.DataTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pointsGroupRef = useRef<THREE.Group>(null);
  const detectionPointsRef = useRef<DetectionPoint[]>([]);

  const screenWidth = 7;
  const screenHeight = 4;
  const MAX_POINTS = 500;  // Maximum discrete points to display
  const POINT_FADE_TIME = 15;  // Seconds until point starts fading
  const POINT_MIN_OPACITY = 0.3;  // Minimum opacity for old points

  // Get wavelength-based color
  const getWavelengthColor = useCallback((wl: number): THREE.Color => {
    let r = 0.4, g = 0.6, b = 1;
    if (wl >= 620) { r = 1; g = 0.25; b = 0.15; }
    else if (wl >= 590) { r = 1; g = 0.75; b = 0.15; }
    else if (wl >= 565) { r = 0.7; g = 1; b = 0.2; }
    else if (wl >= 495) { r = 0.15; g = 1; b = 0.5; }
    else if (wl >= 450) { r = 0.2; g = 0.5; b = 1; }
    return new THREE.Color(r, g, b);
  }, []);

  // Create texture once
  useEffect(() => {
    const width = 50;
    const height = 32;
    const data = new Uint8Array(width * height * 4);
    textureRef.current = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
    textureRef.current.needsUpdate = true;
    
    return () => {
      textureRef.current?.dispose();
    };
  }, []);

  // Clear detection points when parameters change
  useEffect(() => {
    detectionPointsRef.current = [];
    if (pointsGroupRef.current) {
      while (pointsGroupRef.current.children.length > 0) {
        const child = pointsGroupRef.current.children[0];
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
        pointsGroupRef.current.remove(child);
      }
    }
  }, [wavelength, slitDistance, slitWidth, observerOn]);

  /**
   * Add a discrete detection point
   * Called when a photon "clicks" on the detector
   */
  const addDetectionPoint = useCallback((z: number) => {
    if (!pointsGroupRef.current || !showDiscretePoints) return;

    const color = getWavelengthColor(wavelength);
    if (observerOn) {
      color.r = Math.min(1, color.r + 0.3);
      color.g *= 0.5;
      color.b *= 0.3;
    }

    // Random y position within screen bounds (slight variation)
    const yVariation = (Math.random() - 0.5) * (screenHeight - 1);
    const pointPos = new THREE.Vector3(
      position[0] - 0.12,
      position[1] + yVariation * 0.3,
      z
    );

    // Create point mesh
    const geometry = new THREE.CircleGeometry(0.04, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pointMesh = new THREE.Mesh(geometry, material);
    pointMesh.position.copy(pointPos);
    pointMesh.rotation.y = -Math.PI / 2;

    pointsGroupRef.current.add(pointMesh);
    
    detectionPointsRef.current.push({
      position: pointPos,
      age: 0,
      color: color.clone(),
    });

    // Remove oldest points if over limit
    while (detectionPointsRef.current.length > MAX_POINTS && pointsGroupRef.current.children.length > 0) {
      const oldChild = pointsGroupRef.current.children[0];
      if (oldChild instanceof THREE.Mesh) {
        oldChild.geometry.dispose();
        (oldChild.material as THREE.Material).dispose();
      }
      pointsGroupRef.current.remove(oldChild);
      detectionPointsRef.current.shift();
    }
  }, [wavelength, observerOn, showDiscretePoints, position, getWavelengthColor, screenHeight]);

  // Expose addDetectionPoint for external use
  useEffect(() => {
    (window as any).__diuAddDetectionPoint = addDetectionPoint;
    return () => {
      delete (window as any).__diuAddDetectionPoint;
    };
  }, [addDetectionPoint]);

  // Update texture and points every frame
  useFrame((_, delta) => {
    // Update heatmap texture
    if (textureRef.current && showHeatmap) {
      const width = 50;
      const height = 32;
      const data = textureRef.current.image.data as Uint8Array;
      
      const maxVal = Math.max(...histogram, 1);
      
      const baseColor = getWavelengthColor(wavelength);
      let r = baseColor.r, g = baseColor.g, b = baseColor.b;

      if (observerOn) {
        r = Math.min(1, r + 0.3);
        g *= 0.5;
        b *= 0.3;
      }

      for (let x = 0; x < width; x++) {
        const histIdx = Math.floor(x * histogram.length / width);
        const intensity = histogram[histIdx] / maxVal;
        
        for (let y = 0; y < height; y++) {
          // Vertical falloff from center
          const yCenter = height / 2;
          const yDist = Math.abs(y - yCenter) / yCenter;
          const yFactor = Math.max(0, 1 - yDist * yDist);
          
          const final = intensity * yFactor;
          
          const idx = (y * width + x) * 4;
          data[idx] = Math.floor(r * final * 255);
          data[idx + 1] = Math.floor(g * final * 255);
          data[idx + 2] = Math.floor(b * final * 255);
          data[idx + 3] = Math.floor(final * 220);
        }
      }
      
      textureRef.current.needsUpdate = true;
    }

    // Update glow intensity
    if (glowRef.current) {
      const total = histogram.reduce((a, b) => a + b, 0);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(0.35, total / 250);
    }

    // Update detection points opacity based on age
    if (pointsGroupRef.current && showDiscretePoints) {
      const children = pointsGroupRef.current.children;
      for (let i = 0; i < detectionPointsRef.current.length && i < children.length; i++) {
        const point = detectionPointsRef.current[i];
        point.age += delta;
        
        const child = children[i];
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshBasicMaterial;
          // Fade to minimum opacity over time
          if (point.age > POINT_FADE_TIME) {
            const fadeProgress = Math.min(1, (point.age - POINT_FADE_TIME) / POINT_FADE_TIME);
            mat.opacity = Math.max(POINT_MIN_OPACITY, 1 - fadeProgress * (1 - POINT_MIN_OPACITY));
          }
        }
      }
    }
  });

  return (
    <group position={position}>
      {/* Screen panel - lighter with gradient effect */}
      <mesh>
        <boxGeometry args={[0.2, screenHeight, screenWidth]} />
        <meshStandardMaterial color={0x1a2030} emissive={0x0a1020} emissiveIntensity={0.3} />
      </mesh>

      {/* Heatmap texture plane */}
      {showHeatmap && textureRef.current && (
        <mesh ref={meshRef} position={[-0.11, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[screenWidth - 0.4, screenHeight - 0.7]} />
          <meshBasicMaterial 
            map={textureRef.current}
            transparent
            opacity={showDiscretePoints ? 0.6 : 1}  // Dimmer when showing points
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Discrete detection points layer */}
      {showDiscretePoints && (
        <group ref={pointsGroupRef} position={[-position[0], -position[1], 0]} />
      )}

      {/* Glow effect */}
      <mesh ref={glowRef} position={[-0.13, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[screenWidth - 0.2, screenHeight - 0.3]} />
        <meshBasicMaterial 
          color={observerOn ? 0xff5533 : 0x3377ff}
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Frame top - lighter metallic */}
      <mesh position={[0, screenHeight / 2 + 0.06, 0]}>
        <boxGeometry args={[0.22, 0.06, screenWidth + 0.12]} />
        <meshStandardMaterial color={0x5a6a7a} metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Frame bottom */}
      <mesh position={[0, -screenHeight / 2 - 0.06, 0]}>
        <boxGeometry args={[0.22, 0.06, screenWidth + 0.12]} />
        <meshStandardMaterial color={0x5a6a7a} metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Frame sides */}
      <mesh position={[0, 0, screenWidth / 2 + 0.06]}>
        <boxGeometry args={[0.22, screenHeight, 0.06]} />
        <meshStandardMaterial color={0x5a6a7a} metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, -screenWidth / 2 - 0.06]}>
        <boxGeometry args={[0.22, screenHeight, 0.06]} />
        <meshStandardMaterial color={0x5a6a7a} metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}
