import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeatmapScreenProps {
  position: [number, number, number];
  histogram: number[];
  wavelength: number;
  observerOn: boolean;
  showHeatmap: boolean;
}

export function HeatmapScreen({ 
  position, 
  histogram, 
  wavelength,
  observerOn,
  showHeatmap,
}: HeatmapScreenProps) {
  const textureRef = useRef<THREE.DataTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const screenWidth = 5.5;
  const screenHeight = 4;

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

  // Update texture every frame based on histogram
  useFrame(() => {
    if (!textureRef.current || !showHeatmap) return;
    
    const width = 50;
    const height = 32;
    const data = textureRef.current.image.data as Uint8Array;
    
    const maxVal = Math.max(...histogram, 1);
    
    // Color based on wavelength
    let r = 0.4, g = 0.6, b = 1;
    if (wavelength >= 620) { r = 1; g = 0.25; b = 0.15; }
    else if (wavelength >= 590) { r = 1; g = 0.75; b = 0.15; }
    else if (wavelength >= 565) { r = 0.7; g = 1; b = 0.2; }
    else if (wavelength >= 495) { r = 0.15; g = 1; b = 0.5; }
    else if (wavelength >= 450) { r = 0.2; g = 0.5; b = 1; }

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

    // Update glow intensity
    if (glowRef.current) {
      const total = histogram.reduce((a, b) => a + b, 0);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(0.35, total / 250);
    }
  });

  return (
    <group position={position}>
      {/* Dark screen panel */}
      <mesh>
        <boxGeometry args={[0.2, screenHeight, screenWidth]} />
        <meshPhongMaterial color={0x060610} />
      </mesh>

      {/* Heatmap texture plane */}
      {showHeatmap && textureRef.current && (
        <mesh ref={meshRef} position={[-0.11, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[screenWidth - 0.4, screenHeight - 0.7]} />
          <meshBasicMaterial 
            map={textureRef.current}
            transparent
            opacity={1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
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

      {/* Frame top */}
      <mesh position={[0, screenHeight / 2 + 0.06, 0]}>
        <boxGeometry args={[0.22, 0.06, screenWidth + 0.12]} />
        <meshPhongMaterial color={0x222233} />
      </mesh>
      {/* Frame bottom */}
      <mesh position={[0, -screenHeight / 2 - 0.06, 0]}>
        <boxGeometry args={[0.22, 0.06, screenWidth + 0.12]} />
        <meshPhongMaterial color={0x222233} />
      </mesh>
    </group>
  );
}
