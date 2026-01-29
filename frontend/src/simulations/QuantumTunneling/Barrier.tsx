// QuantumTunneling/Barrier.tsx
/**
 * Potential barrier visualization for quantum tunneling
 */

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BarrierProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth?: number;
  showLabels?: boolean;
}

export function Barrier({
  position,
  height,
  width,
  depth = 5,
  showLabels = true,
}: BarrierProps) {
  const scaledHeight = height / 2;
  const scaledWidth = width;
  
  const edgesGeometry = useMemo(() => {
    const boxGeom = new THREE.BoxGeometry(scaledWidth, scaledHeight, depth);
    return new THREE.EdgesGeometry(boxGeom);
  }, [scaledWidth, scaledHeight, depth]);

  return (
    <group position={position}>
      <mesh position={[0, scaledHeight / 2, 0]}>
        <boxGeometry args={[scaledWidth, scaledHeight, depth]} />
        <meshPhongMaterial
          color="#7c3aed"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <lineSegments position={[0, scaledHeight / 2, 0]} geometry={edgesGeometry}>
        <lineBasicMaterial color="#a855f7" linewidth={2} />
      </lineSegments>
      
      <mesh position={[0, scaledHeight, 0]}>
        <boxGeometry args={[scaledWidth + 0.05, 0.05, depth + 0.05]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.8} />
      </mesh>
      
      {showLabels && (
        <>
          <Text
            position={[0, scaledHeight + 0.6, depth / 2 + 0.5]}
            fontSize={0.35}
            color="#a855f7"
            anchorX="center"
            anchorY="middle"
          >
            V₀ = {height} eV
          </Text>
          
          <Text
            position={[0, -0.5, depth / 2 + 0.5]}
            fontSize={0.28}
            color="#a855f7"
            anchorX="center"
            anchorY="middle"
          >
            L = {width.toFixed(1)} nm
          </Text>
          
          <mesh position={[-scaledWidth / 2, -0.3, depth / 2]}>
            <coneGeometry args={[0.08, 0.15, 8]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
          <mesh position={[scaledWidth / 2, -0.3, depth / 2]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.08, 0.15, 8]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
          
          <mesh position={[0, -0.3, depth / 2]}>
            <boxGeometry args={[scaledWidth - 0.1, 0.02, 0.02]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        </>
      )}
    </group>
  );
}
