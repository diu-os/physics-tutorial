// QuantumTunneling/WaveVisualization.tsx
/**
 * Wave function visualization for quantum tunneling
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTunneling } from './hooks/useTunneling';

interface WaveVisualizationProps {
  energy: number;
  barrierHeight: number;
  barrierWidth: number;
  visible?: boolean;
  showIncident?: boolean;
  showReflected?: boolean;
  showEvanescent?: boolean;
  showTransmitted?: boolean;
  barrierX?: number;
  zPosition?: number;
}

export function WaveVisualization({
  energy,
  barrierHeight,
  barrierWidth,
  visible = true,
  showIncident = true,
  showReflected = true,
  showEvanescent = true,
  showTransmitted = true,
  barrierX = 0,
  zPosition = 0,
}: WaveVisualizationProps) {
  const timeRef = useRef(0);
  
  const { probability, reflectionProbability, kappa, isClassical } = useTunneling(
    energy,
    barrierHeight,
    barrierWidth
  );
  
  const scaledEnergy = energy / 2;
  const barrierLeft = barrierX - barrierWidth / 2;
  const barrierRight = barrierX + barrierWidth / 2;
  
  useFrame((_, delta) => {
    timeRef.current += delta * 3;
  });

  const { 
    incidentPoints, 
    reflectedPoints, 
    evanescentPoints, 
    transmittedPoints 
  } = useMemo(() => {
    const time = timeRef.current;
    const amplitude = 0.5;
    const waveK = Math.sqrt(energy) * 0.8;
    
    const incidentPts: THREE.Vector3[] = [];
    for (let x = -10; x <= barrierLeft; x += 0.15) {
      const y = scaledEnergy + amplitude * Math.sin(waveK * x - time);
      incidentPts.push(new THREE.Vector3(x, y, zPosition));
    }
    
    const reflectedPts: THREE.Vector3[] = [];
    if (!isClassical && reflectionProbability > 0.01) {
      const reflectedAmplitude = amplitude * Math.sqrt(reflectionProbability);
      for (let x = -10; x <= barrierLeft; x += 0.15) {
        const y = scaledEnergy + reflectedAmplitude * Math.sin(-waveK * x - time);
        reflectedPts.push(new THREE.Vector3(x, y - 1.2, zPosition));
      }
    }
    
    const evanescentPts: THREE.Vector3[] = [];
    if (!isClassical && kappa > 0) {
      for (let x = barrierLeft; x <= barrierRight; x += 0.05) {
        const decay = Math.exp(-kappa * (x - barrierLeft));
        const y = scaledEnergy + amplitude * decay * Math.sin(-time);
        evanescentPts.push(new THREE.Vector3(x, y, zPosition));
      }
    }
    
    const transmittedPts: THREE.Vector3[] = [];
    if (probability > 0.001) {
      const transmittedAmplitude = amplitude * Math.sqrt(probability);
      for (let x = barrierRight; x <= 10; x += 0.15) {
        const y = scaledEnergy + transmittedAmplitude * Math.sin(waveK * x - time);
        transmittedPts.push(new THREE.Vector3(x, y, zPosition));
      }
    }
    
    return {
      incidentPoints: incidentPts,
      reflectedPoints: reflectedPts,
      evanescentPoints: evanescentPts,
      transmittedPoints: transmittedPts,
    };
  }, [energy, barrierHeight, barrierWidth, scaledEnergy, barrierLeft, barrierRight, isClassical, probability, reflectionProbability, kappa, zPosition]);

  if (!visible) return null;

  return (
    <group>
      {showIncident && incidentPoints.length > 1 && (
        <Line points={incidentPoints} color="#3b82f6" lineWidth={2.5} />
      )}
      
      {showReflected && reflectedPoints.length > 1 && (
        <Line points={reflectedPoints} color="#ef4444" lineWidth={2} />
      )}
      
      {showEvanescent && evanescentPoints.length > 1 && (
        <Line points={evanescentPoints} color="#a855f7" lineWidth={2.5} />
      )}
      
      {showTransmitted && transmittedPoints.length > 1 && (
        <Line points={transmittedPoints} color="#22c55e" lineWidth={2.5} />
      )}
    </group>
  );
}
