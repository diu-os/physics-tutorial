// QuantumTunneling/EnergyPlane.tsx
/**
 * Energy level plane visualization
 */

import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface EnergyPlaneProps {
  energy: number;
  visible?: boolean;
  showLabel?: boolean;
  width?: number;
  depth?: number;
}

export function EnergyPlane({
  energy,
  visible = true,
  showLabel = true,
  width = 20,
  depth = 5,
}: EnergyPlaneProps) {
  if (!visible) return null;
  
  const scaledEnergy = energy / 2;

  return (
    <group>
      <mesh 
        position={[0, scaledEnergy, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[-width / 2, scaledEnergy, 0]}>
        <boxGeometry args={[0.03, 0.03, depth]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.6} />
      </mesh>
      <mesh position={[width / 2, scaledEnergy, 0]}>
        <boxGeometry args={[0.03, 0.03, depth]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.6} />
      </mesh>
      
      {showLabel && (
        <Text
          position={[-width / 2 - 0.8, scaledEnergy + 0.4, depth / 2]}
          fontSize={0.35}
          color="#22c55e"
          anchorX="center"
          anchorY="middle"
        >
          E = {energy} eV
        </Text>
      )}
    </group>
  );
}
