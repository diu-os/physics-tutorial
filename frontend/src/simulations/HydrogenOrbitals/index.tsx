// HydrogenOrbitals/index.tsx
/**
 * Hydrogen Atomic Orbitals Visualization
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Nucleus } from './Nucleus';
import { OrbitalCloud } from './OrbitalCloud';
import { Axes } from './Axes';
import { 
  useOrbital, 
  ORBITAL_NAMES,
  ORBITAL_COLORS,
} from './hooks/useOrbital';

// Re-exports
export { 
  getOrbitalName, 
  calculateEnergy, 
  calculateAverageRadius,
  ORBITAL_NAMES,
} from './hooks/useOrbital';

// ============== TYPES ==============
export interface HydrogenParams {
  n: number;
  l: number;
  m: number;
  showNucleus?: boolean;
  showAxes?: boolean;
  showLabels?: boolean;
  showProbabilityCloud?: boolean;
  showOrbitalSurface?: boolean;
  cloudDensity?: number;
  surfaceOpacity?: number;
  rotationSpeed?: number;
}

export interface HydrogenStats {
  orbitalName: string;
  energy: number;
  angularMomentum: number;
  radialNodes: number;
  angularNodes: number;
  totalNodes: number;
  averageRadius: number;
  viewedOrbitals: string[];
}

interface HydrogenOrbitalsProps {
  params: HydrogenParams;
  onStatsUpdate?: (stats: HydrogenStats) => void;
}

// ============== DEFAULT PARAMS ==============
export const DEFAULT_HYDROGEN_PARAMS: HydrogenParams = {
  n: 2,
  l: 1,
  m: 0,
  showNucleus: true,
  showAxes: true,
  showLabels: true,
  showProbabilityCloud: true,
  showOrbitalSurface: true,
  cloudDensity: 1500,
  surfaceOpacity: 0.35,
  rotationSpeed: 0.5,
};

// ============== ORBITAL SURFACE ==============
function OrbitalSurface({
  n,
  l,
  m,
  opacity = 0.35,
  visible = true,
}: {
  n: number;
  l: number;
  m: number;
  opacity?: number;
  visible?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  if (!visible) return null;
  
  const scale = n * 1.5;
  const validL = Math.max(0, Math.min(l, n - 1));
  const orbitalType = ORBITAL_NAMES[validL] || 's';
  const colors = ORBITAL_COLORS[orbitalType as keyof typeof ORBITAL_COLORS] || ORBITAL_COLORS.s;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  if (validL === 0) {
    return (
      <group ref={groupRef}>
        <Sphere args={[scale * 0.75, 32, 32]}>
          <meshPhongMaterial
            color={colors.positive}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
          />
        </Sphere>
      </group>
    );
  } else if (validL === 1) {
    const lobeSize = scale * 0.6;
    const lobeOffset = scale * 0.5;
    
    let rotation: [number, number, number] = [0, 0, 0];
    if (m === -1) rotation = [0, 0, Math.PI / 2];
    else if (m === 1) rotation = [Math.PI / 2, 0, 0];
    
    return (
      <group ref={groupRef} rotation={rotation}>
        <Sphere args={[lobeSize, 24, 24]} position={[0, lobeOffset, 0]}>
          <meshPhongMaterial
            color={colors.positive}
            transparent
            opacity={opacity}
          />
        </Sphere>
        <Sphere args={[lobeSize, 24, 24]} position={[0, -lobeOffset, 0]}>
          <meshPhongMaterial
            color={colors.negative}
            transparent
            opacity={opacity}
          />
        </Sphere>
      </group>
    );
  } else if (validL === 2) {
    const lobeSize = scale * 0.4;
    const lobeOffset = scale * 0.55;
    
    return (
      <group ref={groupRef}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI / 2) + Math.PI / 4;
          return (
            <Sphere
              key={i}
              args={[lobeSize, 20, 20]}
              position={[
                Math.cos(angle) * lobeOffset,
                0,
                Math.sin(angle) * lobeOffset,
              ]}
            >
              <meshPhongMaterial
                color={i % 2 === 0 ? colors.positive : colors.negative}
                transparent
                opacity={opacity}
              />
            </Sphere>
          );
        })}
      </group>
    );
  }
  
  return (
    <group ref={groupRef}>
      <Sphere args={[scale, 24, 24]}>
        <meshPhongMaterial
          color={colors.positive}
          transparent
          opacity={opacity * 0.6}
          wireframe
        />
      </Sphere>
    </group>
  );
}

// ============== MAIN COMPONENT ==============
export function HydrogenOrbitals({ params, onStatsUpdate }: HydrogenOrbitalsProps) {
  const {
    n,
    l,
    m,
    showNucleus = true,
    showAxes = true,
    showLabels = true,
    showProbabilityCloud = true,
    showOrbitalSurface = true,
    cloudDensity = 1500,
    surfaceOpacity = 0.35,
    rotationSpeed = 0.5,
  } = params;

  const validL = Math.max(0, Math.min(l, n - 1));
  const validM = Math.max(-validL, Math.min(validL, m));

  const [viewedOrbitals, setViewedOrbitals] = useState<Set<string>>(new Set(['1s']));
  
  const orbital = useOrbital(n, validL, validM);

  useEffect(() => {
    setViewedOrbitals(prev => {
      if (prev.has(orbital.name)) return prev;
      return new Set([...prev, orbital.name]);
    });
  }, [orbital.name]);

  const stats = useMemo((): HydrogenStats => ({
    orbitalName: orbital.name,
    energy: orbital.energy,
    angularMomentum: orbital.angularMomentum,
    radialNodes: orbital.radialNodes,
    angularNodes: orbital.angularNodes,
    totalNodes: orbital.totalNodes,
    averageRadius: orbital.averageRadius,
    viewedOrbitals: Array.from(viewedOrbitals),
  }), [orbital, viewedOrbitals]);

  useEffect(() => {
    onStatsUpdate?.(stats);
  }, [stats, onStatsUpdate]);

  const axisScale = Math.max(4, n * 2);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-5, 5, 5]} intensity={0.4} color="#a855f7" />
      <pointLight position={[5, -5, 5]} intensity={0.4} color="#3b82f6" />
      <pointLight position={[0, 0, 8]} intensity={0.3} color="#f97316" />

      <Sphere args={[25, 32, 32]}>
        <meshBasicMaterial color="#0f172a" side={THREE.BackSide} />
      </Sphere>

      <Nucleus visible={showNucleus} />

      {showProbabilityCloud && (
        <OrbitalCloud
          n={n}
          l={validL}
          m={validM}
          density={cloudDensity}
          rotationSpeed={rotationSpeed}
        />
      )}

      {showOrbitalSurface && (
        <OrbitalSurface
          n={n}
          l={validL}
          m={validM}
          opacity={surfaceOpacity}
        />
      )}

      <Axes visible={showAxes} scale={axisScale} showLabels={showLabels} />

      {showLabels && (
        <>
          <Text
            position={[-axisScale - 1.5, axisScale - 0.5, 0]}
            fontSize={0.5}
            color="#f97316"
            anchorX="left"
            anchorY="middle"
          >
            {orbital.name} orbital
          </Text>
          <Text
            position={[-axisScale - 1.5, axisScale - 1.2, 0]}
            fontSize={0.35}
            color="#94a3b8"
            anchorX="left"
            anchorY="middle"
          >
            E = {orbital.energy.toFixed(2)} eV
          </Text>
          
          <Text
            position={[axisScale + 0.5, axisScale - 0.5, 0]}
            fontSize={0.3}
            color="#64748b"
            anchorX="right"
            anchorY="middle"
          >
            n = {n}, l = {validL}, m = {validM}
          </Text>
          <Text
            position={[axisScale + 0.5, axisScale - 1.0, 0]}
            fontSize={0.25}
            color="#64748b"
            anchorX="right"
            anchorY="middle"
          >
            Nodes: {orbital.totalNodes} (radial: {orbital.radialNodes}, angular: {orbital.angularNodes})
          </Text>
          <Text
            position={[axisScale + 0.5, axisScale - 1.5, 0]}
            fontSize={0.25}
            color="#64748b"
            anchorX="right"
            anchorY="middle"
          >
            ⟨r⟩ = {orbital.averageRadius.toFixed(1)} a₀
          </Text>
          
          <Text
            position={[0, -axisScale - 0.8, 0]}
            fontSize={0.3}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            {viewedOrbitals.size} orbitals explored
          </Text>
        </>
      )}
    </group>
  );
}

export default HydrogenOrbitals;
