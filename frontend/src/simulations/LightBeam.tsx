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
 * Clean laser beam visualization
 * - Expanding cone of light from source to barrier
 * - No confusing particles in the beam itself
 * - Particles are handled separately by Particles.tsx
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
  const innerConeRef = useRef<THREE.Mesh>(null);
  const coreBeamRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const color = useWavelengthColor(wavelength);
  
  const length = endX - startX;
  
  // Cone expands to cover both slits
  const coneEndRadius = slitDistance + 0.3;
  const coneStartRadius = 0.1;

  // Animate beam opacity
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const cameraDistance = camera.position.distanceTo(new THREE.Vector3(0, y, 0));
    
    // Beam more solid when camera is far
    const beamSolidity = Math.max(0.3, Math.min(1, cameraDistance / 20));

    if (outerConeRef.current) {
      const mat = outerConeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.06 + Math.sin(time * 2) * 0.02) * beamSolidity;
    }
    
    if (innerConeRef.current) {
      const mat = innerConeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.12 + Math.sin(time * 3) * 0.04) * beamSolidity;
    }

    if (coreBeamRef.current) {
      const mat = coreBeamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(time * 4) * 0.1;
    }
  });

  // Outer cone geometry (fog effect)
  const outerConeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      coneEndRadius,
      coneStartRadius,
      length - 0.3,
      32, 1, true
    );
    geo.rotateZ(-Math.PI / 2);
    return geo;
  }, [coneEndRadius, coneStartRadius, length]);

  // Inner brighter cone
  const innerConeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      coneEndRadius * 0.5,
      coneStartRadius * 0.8,
      length - 0.3,
      32, 1, true
    );
    geo.rotateZ(-Math.PI / 2);
    return geo;
  }, [coneEndRadius, coneStartRadius, length]);

  return (
    <group>
      {/* Outer fog cone - very subtle */}
      <mesh
        ref={outerConeRef}
        geometry={outerConeGeometry}
        position={[(startX + endX) / 2, y, 0]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner brighter cone */}
      <mesh
        ref={innerConeRef}
        geometry={innerConeGeometry}
        position={[(startX + endX) / 2, y, 0]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Core beam line */}
      <mesh ref={coreBeamRef} position={[(startX + endX) / 2, y, 0]}>
        <boxGeometry args={[length, 0.05, 0.05]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
