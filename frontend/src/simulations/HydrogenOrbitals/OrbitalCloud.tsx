// HydrogenOrbitals/OrbitalCloud.tsx
/**
 * Probability density cloud visualization for atomic orbitals
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOrbital } from './hooks/useOrbital';

interface OrbitalCloudProps {
  n: number;
  l: number;
  m: number;
  density?: number;
  visible?: boolean;
  rotationSpeed?: number;
}

export function OrbitalCloud({
  n,
  l,
  m,
  density = 1500,
  visible = true,
  rotationSpeed = 0.5,
}: OrbitalCloudProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { generatePointCloud, name } = useOrbital(n, l, m);

  // Generate points
  const { positions, colors } = useMemo(() => {
    const points = generatePointCloud(density);
    
    const positionsArr: number[] = [];
    const colorsArr: number[] = [];
    
    const tempColor = new THREE.Color();
    
    points.forEach(({ position, color }) => {
      positionsArr.push(...position);
      tempColor.setHex(color);
      colorsArr.push(tempColor.r, tempColor.g, tempColor.b);
    });
    
    return {
      positions: new Float32Array(positionsArr),
      colors: new Float32Array(colorsArr),
    };
  }, [generatePointCloud, density, name]);

  // Create point texture
  const pointTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Auto-rotation
  useFrame((_, delta) => {
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += delta * rotationSpeed * 0.3;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          map={pointTexture}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
