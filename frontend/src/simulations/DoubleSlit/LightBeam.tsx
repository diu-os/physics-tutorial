import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWavelengthColor } from './hooks/useWavelengthColor';

interface LightBeamProps {
  startX: number;
  endX: number;
  y: number;
  wavelength: number;
  slitDistance: number;
  intensity?: number;
}

/**
 * Foggy/misty laser beam visualization
 * - Soft, diffused light cone from source to barrier
 * - Multiple layers for depth and softness
 */
export function LightBeam({ 
  startX, 
  endX, 
  y, 
  wavelength, 
  slitDistance,
  intensity: _intensity = 50
}: LightBeamProps) {
  const outerConeRef = useRef<THREE.Mesh>(null);
  const midConeRef = useRef<THREE.Mesh>(null);
  const innerConeRef = useRef<THREE.Mesh>(null);
  const coreBeamRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const color = useWavelengthColor(wavelength);
  
  // Lighter/whiter version of color for fog effect
  const fogColor = useMemo(() => {
    const c = new THREE.Color(color);
    // Mix with white for foggy appearance
    c.lerp(new THREE.Color(0xffffff), 0.4);
    return c;
  }, [color]);
  
  const length = endX - startX;
  
  // Cone expands to cover both slits
  const coneEndRadius = slitDistance + 0.4;
  const coneStartRadius = 0.15;

  // Animate beam opacity with soft pulsing
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const cameraDistance = camera.position.distanceTo(new THREE.Vector3(0, y, 0));
    
    // Beam more visible when camera is far
    const beamSolidity = Math.max(0.4, Math.min(1, cameraDistance / 18));

    // Outer fog - very soft
    if (outerConeRef.current) {
      const mat = outerConeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.08 + Math.sin(time * 1.5) * 0.02) * beamSolidity;
    }
    
    // Mid cone
    if (midConeRef.current) {
      const mat = midConeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.12 + Math.sin(time * 2) * 0.03) * beamSolidity;
    }
    
    // Inner cone
    if (innerConeRef.current) {
      const mat = innerConeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.15 + Math.sin(time * 2.5) * 0.04) * beamSolidity;
    }

    // Core beam
    if (coreBeamRef.current) {
      const mat = coreBeamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(time * 3) * 0.08;
    }

    // Glow sphere at source
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(time * 4) * 0.1;
    }
  });

  // Outer fog cone geometry (largest, softest)
  const outerConeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      coneEndRadius * 1.2,
      coneStartRadius * 0.8,
      length - 0.2,
      32, 1, true
    );
    geo.rotateZ(-Math.PI / 2);
    return geo;
  }, [coneEndRadius, coneStartRadius, length]);

  // Mid cone geometry
  const midConeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      coneEndRadius * 0.8,
      coneStartRadius,
      length - 0.25,
      32, 1, true
    );
    geo.rotateZ(-Math.PI / 2);
    return geo;
  }, [coneEndRadius, coneStartRadius, length]);

  // Inner brighter cone
  const innerConeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      coneEndRadius * 0.4,
      coneStartRadius * 1.2,
      length - 0.3,
      32, 1, true
    );
    geo.rotateZ(-Math.PI / 2);
    return geo;
  }, [coneEndRadius, coneStartRadius, length]);

  return (
    <group>
      {/* Outer fog cone - very soft, whiter */}
      <mesh
        ref={outerConeRef}
        geometry={outerConeGeometry}
        position={[(startX + endX) / 2, y, 0]}
      >
        <meshBasicMaterial
          color={fogColor}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Mid fog cone */}
      <mesh
        ref={midConeRef}
        geometry={midConeGeometry}
        position={[(startX + endX) / 2, y, 0]}
      >
        <meshBasicMaterial
          color={fogColor}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner brighter cone - colored */}
      <mesh
        ref={innerConeRef}
        geometry={innerConeGeometry}
        position={[(startX + endX) / 2, y, 0]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core beam line - soft */}
      <mesh ref={coreBeamRef} position={[(startX + endX) / 2, y, 0]}>
        <boxGeometry args={[length, 0.06, 0.06]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glow at source */}
      <mesh ref={glowRef} position={[startX + 0.3, y, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color={fogColor}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
