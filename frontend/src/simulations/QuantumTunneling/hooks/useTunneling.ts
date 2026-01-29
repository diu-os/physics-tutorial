// QuantumTunneling/hooks/useTunneling.ts
/**
 * Physics hook for quantum tunneling calculations
 * 
 * Based on WKB Approximation:
 * T ≈ exp(-2κL) where κ = √(2m(V₀-E))/ℏ
 */

import { useMemo } from 'react';

interface TunnelingPhysics {
  probability: number;
  reflectionProbability: number;
  kappa: number;
  k: number;
  isClassical: boolean;
  willTunnel: () => boolean;
  getEvanescentDecay: (progress: number) => number;
}

export function useTunneling(
  energy: number,
  barrierHeight: number,
  barrierWidth: number,
  particleMass: number = 1
): TunnelingPhysics {
  
  return useMemo(() => {
    const isClassical = energy >= barrierHeight;
    const hbar2_2m = 0.0381 / particleMass;
    const k = Math.sqrt(energy / hbar2_2m);
    
    let kappa = 0;
    let probability = 1;
    
    if (!isClassical) {
      kappa = Math.sqrt((barrierHeight - energy) / hbar2_2m);
      probability = Math.exp(-2 * kappa * barrierWidth);
      probability = Math.max(0, Math.min(1, probability));
    }
    
    const reflectionProbability = 1 - probability;
    
    const willTunnel = () => {
      if (isClassical) return true;
      return Math.random() < probability;
    };
    
    const getEvanescentDecay = (progress: number) => {
      if (isClassical || kappa === 0) return 1;
      return Math.exp(-kappa * progress * barrierWidth);
    };
    
    return {
      probability,
      reflectionProbability,
      kappa,
      k,
      isClassical,
      willTunnel,
      getEvanescentDecay,
    };
  }, [energy, barrierHeight, barrierWidth, particleMass]);
}

export function calculateTunnelingProbability(
  energy: number,
  barrierHeight: number,
  barrierWidth: number,
  particleMass: number = 1
): number {
  if (energy >= barrierHeight) return 1;
  
  const hbar2_2m = 0.0381 / particleMass;
  const kappa = Math.sqrt((barrierHeight - energy) / hbar2_2m);
  const T = Math.exp(-2 * kappa * barrierWidth);
  
  return Math.max(0, Math.min(1, T));
}

export function getParticleColor(
  phase: 'incident' | 'barrier' | 'transmitted' | 'reflected'
): number {
  switch (phase) {
    case 'incident': return 0x3b82f6;
    case 'barrier': return 0xa855f7;
    case 'transmitted': return 0x22c55e;
    case 'reflected': return 0xef4444;
    default: return 0x3b82f6;
  }
}

export function getGlowColor(
  phase: 'incident' | 'barrier' | 'transmitted' | 'reflected'
): number {
  switch (phase) {
    case 'incident': return 0x60a5fa;
    case 'barrier': return 0xc084fc;
    case 'transmitted': return 0x4ade80;
    case 'reflected': return 0xf87171;
    default: return 0x60a5fa;
  }
}
