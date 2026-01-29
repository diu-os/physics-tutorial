// HydrogenOrbitals/Nucleus.tsx
/**
 * Atomic nucleus visualization (proton for hydrogen)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NucleusProps {
  visible?: boolean;
  pulseEnabled?: boolean;
}

export function Nucleus({ visible = true, pulseEnabled = true }: NucleusProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (pulseEnabled && glowRef.current) {
      timeRef.current += delta;
      const pulse = 1 + 0.1 * Math.sin(timeRef.current * 3);
      glowRef.current.scale.setScalar(pulse);
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Proton core */}
      <mesh>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshPhongMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial
          color="#fca5a5"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Outer glow (pulsing) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}
