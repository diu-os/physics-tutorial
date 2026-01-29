// QuantumTunneling/index.tsx
/**
 * Quantum Tunneling Simulation
 * 
 * 🏆 Nobel Prize 2025: Clarke, Devoret, Martinis
 * "Macroscopic Quantum Tunneling"
 * 
 * Physics: WKB Approximation
 * T ≈ exp(-2κL) where κ = √(2m(V₀-E))/ℏ
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Grid, Text } from '@react-three/drei';
import { Barrier } from './Barrier';
import { EnergyPlane } from './EnergyPlane';
import { Particles } from './Particles';
import { WaveVisualization } from './WaveVisualization';
import { calculateTunnelingProbability } from './hooks/useTunneling';

// Re-exports
export { calculateTunnelingProbability } from './hooks/useTunneling';

// ============== TYPES ==============
export interface TunnelingParams {
  particleEnergy: number;
  barrierHeight: number;
  barrierWidth: number;
  intensity: number;
  slowMotion?: boolean;
  showWaves?: boolean;
  showIncidentWave?: boolean;
  showReflectedWave?: boolean;
  showEvanescentWave?: boolean;
  showTransmittedWave?: boolean;
  showParticleGlow?: boolean;
  showEnergyPlane?: boolean;
  showLabels?: boolean;
  showTrails?: boolean;
}

export interface TunnelingStats {
  totalParticles: number;
  tunneled: number;
  reflected: number;
  tunnelingProbability: number;
  experimentalProbability: number;
}

interface QuantumTunnelingProps {
  params: TunnelingParams;
  onStatsUpdate?: (stats: TunnelingStats) => void;
}

// ============== CONSTANTS ==============
const SOURCE_X = -8;
const BARRIER_X = 0;
const TARGET_X = 8;

// ============== DEFAULT PARAMS ==============
export const DEFAULT_TUNNELING_PARAMS: TunnelingParams = {
  particleEnergy: 5,
  barrierHeight: 8,
  barrierWidth: 1.5,
  intensity: 25,
  slowMotion: false,
  showWaves: true,
  showIncidentWave: true,
  showReflectedWave: true,
  showEvanescentWave: true,
  showTransmittedWave: true,
  showParticleGlow: true,
  showEnergyPlane: true,
  showLabels: true,
  showTrails: true,
};

function createEmptyStats(): TunnelingStats {
  return {
    totalParticles: 0,
    tunneled: 0,
    reflected: 0,
    tunnelingProbability: 0,
    experimentalProbability: 0,
  };
}

// ============== MAIN COMPONENT ==============
export function QuantumTunneling({ params, onStatsUpdate }: QuantumTunnelingProps) {
  const {
    particleEnergy,
    barrierHeight,
    barrierWidth,
    intensity,
    slowMotion = false,
    showWaves = true,
    showIncidentWave = true,
    showReflectedWave = true,
    showEvanescentWave = true,
    showTransmittedWave = true,
    showParticleGlow = true,
    showEnergyPlane = true,
    showLabels = true,
    showTrails = true,
  } = params;

  const [stats, setStats] = useState<TunnelingStats>(createEmptyStats);
  const prevRef = useRef({ particleEnergy, barrierHeight, barrierWidth });

  const theoreticalT = calculateTunnelingProbability(
    particleEnergy,
    barrierHeight,
    barrierWidth
  );

  useEffect(() => {
    const prev = prevRef.current;
    if (prev.particleEnergy !== particleEnergy ||
        prev.barrierHeight !== barrierHeight ||
        prev.barrierWidth !== barrierWidth) {
      
      const newStats = createEmptyStats();
      newStats.tunnelingProbability = theoreticalT;
      setStats(newStats);
      prevRef.current = { particleEnergy, barrierHeight, barrierWidth };
    }
  }, [particleEnergy, barrierHeight, barrierWidth, theoreticalT]);

  useEffect(() => {
    setStats(s => ({
      ...s,
      tunnelingProbability: theoreticalT,
    }));
  }, [theoreticalT]);

  const handleParticleTunneled = useCallback(() => {
    setStats(prev => {
      const newTunneled = prev.tunneled + 1;
      const newTotal = prev.totalParticles + 1;
      return {
        ...prev,
        totalParticles: newTotal,
        tunneled: newTunneled,
        experimentalProbability: newTunneled / newTotal,
      };
    });
  }, []);

  const handleParticleReflected = useCallback(() => {
    setStats(prev => {
      const newTotal = prev.totalParticles + 1;
      return {
        ...prev,
        totalParticles: newTotal,
        reflected: prev.reflected + 1,
        experimentalProbability: prev.tunneled / newTotal,
      };
    });
  }, []);

  useEffect(() => {
    onStatsUpdate?.(stats);
  }, [stats, onStatsUpdate]);

  const isClassical = particleEnergy >= barrierHeight;

  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 10, 8]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, 10, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-6, 5, 0]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[6, 5, 0]} intensity={0.5} color="#22c55e" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#a855f7" />

      <Grid
        position={[0, 0, 0]}
        args={[24, 10]}
        cellSize={1}
        cellThickness={0.8}
        cellColor="#4a5568"
        sectionSize={4}
        sectionThickness={1.5}
        sectionColor="#6b7280"
        fadeDistance={25}
        fadeStrength={1}
      />

      <Barrier
        position={[BARRIER_X, 0, 0]}
        height={barrierHeight}
        width={barrierWidth}
        showLabels={showLabels}
      />

      <EnergyPlane
        energy={particleEnergy}
        visible={showEnergyPlane}
        showLabel={showLabels}
      />

      {showWaves && (
        <WaveVisualization
          energy={particleEnergy}
          barrierHeight={barrierHeight}
          barrierWidth={barrierWidth}
          showIncident={showIncidentWave}
          showReflected={showReflectedWave}
          showEvanescent={showEvanescentWave}
          showTransmitted={showTransmittedWave}
          barrierX={BARRIER_X}
          zPosition={-1.5}
        />
      )}

      <Particles
        energy={particleEnergy}
        barrierHeight={barrierHeight}
        barrierWidth={barrierWidth}
        intensity={intensity}
        slowMotion={slowMotion}
        showGlow={showParticleGlow}
        showTrails={showTrails}
        barrierX={BARRIER_X}
        sourceX={SOURCE_X}
        targetX={TARGET_X}
        onParticleTunneled={handleParticleTunneled}
        onParticleReflected={handleParticleReflected}
      />

      {showLabels && (
        <>
          <Text
            position={[-5, -0.3, 3]}
            fontSize={0.3}
            color="#3b82f6"
            anchorX="center"
          >
            Incident Region
          </Text>
          <Text
            position={[5, -0.3, 3]}
            fontSize={0.3}
            color="#22c55e"
            anchorX="center"
          >
            {isClassical ? 'Transmitted (Classical)' : 'Transmitted Region'}
          </Text>
        </>
      )}

      <Text
        position={[-9, 5.5, 0]}
        fontSize={0.28}
        color="#ffffff"
        anchorX="left"
      >
        {`Tunneled: ${stats.tunneled}  |  Reflected: ${stats.reflected}  |  Total: ${stats.totalParticles}`}
      </Text>
      <Text
        position={[-9, 5, 0]}
        fontSize={0.22}
        color="#94a3b8"
        anchorX="left"
      >
        {`T(theory) = ${(theoreticalT * 100).toFixed(1)}%  |  T(exp) = ${(stats.experimentalProbability * 100).toFixed(1)}%`}
      </Text>

      <Text
        position={[7, 5.5, 0]}
        fontSize={0.22}
        color="#fbbf24"
        anchorX="right"
      >
        🏆 Nobel Prize 2025
      </Text>
      <Text
        position={[7, 5.1, 0]}
        fontSize={0.16}
        color="#a16207"
        anchorX="right"
      >
        Clarke, Devoret, Martinis
      </Text>
    </group>
  );
}

export default QuantumTunneling;
