// HydrogenOrbitals/hooks/useOrbital.ts
/**
 * Physics hook for hydrogen orbital calculations
 */

import { useMemo } from 'react';

export const ORBITAL_NAMES = ['s', 'p', 'd', 'f', 'g', 'h', 'i'] as const;
export type OrbitalType = typeof ORBITAL_NAMES[number];

export const ORBITAL_COLORS: Record<OrbitalType, { positive: number; negative: number }> = {
  s: { positive: 0x60a5fa, negative: 0x60a5fa },
  p: { positive: 0xa855f7, negative: 0x22c55e },
  d: { positive: 0xf97316, negative: 0x3b82f6 },
  f: { positive: 0xec4899, negative: 0x14b8a6 },
  g: { positive: 0xeab308, negative: 0x8b5cf6 },
  h: { positive: 0xef4444, negative: 0x06b6d4 },
  i: { positive: 0xf59e0b, negative: 0x10b981 },
};

interface OrbitalPoint {
  position: [number, number, number];
  color: number;
  size: number;
}

interface OrbitalPhysics {
  name: string;
  energy: number;
  angularMomentum: number;
  radialNodes: number;
  angularNodes: number;
  totalNodes: number;
  averageRadius: number;
  generatePointCloud: (density: number) => OrbitalPoint[];
  isValid: boolean;
}

export function getOrbitalName(n: number, l: number): string {
  if (l < 0 || l >= n || l >= ORBITAL_NAMES.length) return '?';
  return `${n}${ORBITAL_NAMES[l]}`;
}

export function calculateEnergy(n: number): number {
  if (n < 1) return 0;
  return -13.6 / (n * n);
}

export function calculateAverageRadius(n: number, l: number): number {
  return (3 * n * n - l * (l + 1)) / 2;
}

export function calculateAngularMomentum(l: number): number {
  return Math.sqrt(l * (l + 1));
}

export function useOrbital(n: number, l: number, m: number): OrbitalPhysics {
  return useMemo(() => {
    const validL = Math.max(0, Math.min(l, n - 1));
    const validM = Math.max(-validL, Math.min(validL, m));
    const isValid = l >= 0 && l < n && Math.abs(m) <= l;
    
    const orbitalType = ORBITAL_NAMES[validL] || 's';
    const colors = ORBITAL_COLORS[orbitalType];
    
    const name = getOrbitalName(n, validL);
    const energy = calculateEnergy(n);
    const angularMomentum = calculateAngularMomentum(validL);
    const radialNodes = n - validL - 1;
    const angularNodes = validL;
    const totalNodes = n - 1;
    const averageRadius = calculateAverageRadius(n, validL);
    
    const generatePointCloud = (density: number): OrbitalPoint[] => {
      const points: OrbitalPoint[] = [];
      const scale = n * 1.5;
      
      if (validL === 0) {
        for (let i = 0; i < density; i++) {
          const phi = Math.random() * Math.PI * 2;
          const theta = Math.acos(2 * Math.random() - 1);
          const r = scale * (0.3 + Math.random() * 0.8);
          
          points.push({
            position: [
              r * Math.sin(theta) * Math.cos(phi),
              r * Math.sin(theta) * Math.sin(phi),
              r * Math.cos(theta),
            ],
            color: colors.positive,
            size: 0.08 + Math.random() * 0.04,
          });
        }
      } else if (validL === 1) {
        const lobeLength = scale * 2;
        
        for (const sign of [1, -1]) {
          const lobeColor = sign > 0 ? colors.positive : colors.negative;
          
          for (let i = 0; i < density / 2; i++) {
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * Math.PI * 2;
            const r = lobeLength * 0.35 * Math.random();
            
            let px = r * Math.sin(theta) * Math.cos(phi) * 0.5;
            let py = sign * (lobeLength * 0.35 + r * Math.cos(theta));
            let pz = r * Math.sin(theta) * Math.sin(phi) * 0.5;
            
            if (validM === -1) {
              [px, py] = [py, px];
            } else if (validM === 1) {
              [py, pz] = [pz, py];
            }
            
            points.push({
              position: [px, py, pz],
              color: lobeColor,
              size: 0.07 + Math.random() * 0.03,
            });
          }
        }
      } else if (validL === 2) {
        const lobeSize = scale * 1.2;
        
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI / 2) + Math.PI / 4;
          const lobeColor = i % 2 === 0 ? colors.positive : colors.negative;
          
          for (let j = 0; j < density / 4; j++) {
            const r = lobeSize * 0.3 * Math.random();
            const localAngle = (Math.random() - 0.5) * 1.2;
            const heightVar = (Math.random() - 0.5) * r * 0.4;
            
            const px = Math.cos(angle) * lobeSize * 0.5 + Math.cos(angle + localAngle) * r;
            const py = heightVar;
            const pz = Math.sin(angle) * lobeSize * 0.5 + Math.sin(angle + localAngle) * r;
            
            points.push({
              position: [px, py, pz],
              color: lobeColor,
              size: 0.06 + Math.random() * 0.03,
            });
          }
        }
      } else {
        const lobeSize = scale * 1.0;
        const numLobes = 2 * validL + 1;
        
        for (let i = 0; i < numLobes; i++) {
          const angle = (i * Math.PI * 2) / numLobes;
          const lobeColor = i % 2 === 0 ? colors.positive : colors.negative;
          
          for (let j = 0; j < density / numLobes; j++) {
            const r = lobeSize * 0.25 * Math.random();
            const theta = Math.random() * Math.PI;
            const phi = angle + (Math.random() - 0.5) * 0.6;
            
            const px = Math.cos(phi) * lobeSize * 0.4 + r * Math.sin(theta) * Math.cos(phi);
            const py = (Math.random() - 0.5) * r;
            const pz = Math.sin(phi) * lobeSize * 0.4 + r * Math.sin(theta) * Math.sin(phi);
            
            points.push({
              position: [px, py, pz],
              color: lobeColor,
              size: 0.05 + Math.random() * 0.025,
            });
          }
        }
      }
      
      return points;
    };
    
    return {
      name,
      energy,
      angularMomentum,
      radialNodes,
      angularNodes,
      totalNodes,
      averageRadius,
      generatePointCloud,
      isValid,
    };
  }, [n, l, m]);
}
