// HydrogenOrbitals/Axes.tsx
/**
 * 3D coordinate axes visualization
 */

import { Text, Line } from '@react-three/drei';

interface AxesProps {
  visible?: boolean;
  scale?: number;
  showLabels?: boolean;
}

export function Axes({ 
  visible = true, 
  scale = 5,
  showLabels = true,
}: AxesProps) {
  if (!visible) return null;

  return (
    <group>
      <Line
        points={[[-scale, 0, 0], [scale, 0, 0]]}
        color="#ef4444"
        lineWidth={2}
      />
      <mesh position={[scale, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {showLabels && (
        <Text
          position={[scale + 0.4, 0, 0]}
          fontSize={0.35}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          x
        </Text>
      )}

      <Line
        points={[[0, -scale, 0], [0, scale, 0]]}
        color="#22c55e"
        lineWidth={2}
      />
      <mesh position={[0, scale, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      {showLabels && (
        <Text
          position={[0, scale + 0.4, 0]}
          fontSize={0.35}
          color="#22c55e"
          anchorX="center"
          anchorY="middle"
        >
          y
        </Text>
      )}

      <Line
        points={[[0, 0, -scale], [0, 0, scale]]}
        color="#3b82f6"
        lineWidth={2}
      />
      <mesh position={[0, 0, scale]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      {showLabels && (
        <Text
          position={[0, 0, scale + 0.4]}
          fontSize={0.35}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
        >
          z
        </Text>
      )}

      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}
