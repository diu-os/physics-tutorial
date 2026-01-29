// simulations/index.ts
/**
 * Central export for all quantum physics simulations
 * 
 * DIU Physics Interactive v16.0
 */

// ============== DOUBLE-SLIT EXPERIMENT ==============
export { default as DoubleSlit, DoubleSlit as DoubleSlitSimulation } from './DoubleSlit';
export type { DoubleSlitParams, DoubleSlitStats } from './DoubleSlit';
export { 
  useInterference, 
  calculateFringeCount, 
  calculateContrast,
  getExpectedFringeCount,
  useWavelengthColor,
  wavelengthToColor,
  wavelengthToHex,
} from './DoubleSlit';

// ============== QUANTUM TUNNELING ==============
export { default as QuantumTunneling } from './QuantumTunneling';
export type { TunnelingParams, TunnelingStats } from './QuantumTunneling';
export { 
  DEFAULT_TUNNELING_PARAMS, 
  calculateTunnelingProbability,
} from './QuantumTunneling';
export { 
  TUNNELING_TASKS, 
  TUNNELING_QUIZ,
} from './QuantumTunneling/types';

// ============== HYDROGEN ORBITALS ==============
export { default as HydrogenOrbitals } from './HydrogenOrbitals';
export type { HydrogenParams, HydrogenStats } from './HydrogenOrbitals';
export {
  DEFAULT_HYDROGEN_PARAMS,
  getOrbitalName,
  calculateEnergy,
  calculateAverageRadius,
  ORBITAL_NAMES,
} from './HydrogenOrbitals';
export {
  HYDROGEN_TASKS,
  HYDROGEN_QUIZ,
  ORBITAL_PRESETS,
} from './HydrogenOrbitals/types';

// ============== EXPERIMENT TYPES ==============
export type ExperimentType = 'doubleSlit' | 'tunneling' | 'hydrogen';

// ============== EXPERIMENT METADATA ==============
export interface ExperimentInfo {
  id: ExperimentType;
  name: string;
  nameRu: string;
  icon: string;
  description: string;
  descriptionRu: string;
  color: string;
  badge?: string;
}

export const EXPERIMENTS: ExperimentInfo[] = [
  {
    id: 'doubleSlit',
    name: 'Double-Slit Experiment',
    nameRu: 'Двухщелевой эксперимент',
    icon: '🌊',
    description: 'Explore wave-particle duality',
    descriptionRu: 'Исследуй корпускулярно-волновой дуализм',
    color: '#3b82f6',
  },
  {
    id: 'tunneling',
    name: 'Quantum Tunneling',
    nameRu: 'Квантовое туннелирование',
    icon: '⚡',
    description: 'Barrier penetration phenomenon',
    descriptionRu: 'Проникновение через потенциальный барьер',
    color: '#a855f7',
    badge: '🏆 Nobel 2025',
  },
  {
    id: 'hydrogen',
    name: 'Hydrogen Orbitals',
    nameRu: 'Орбитали водорода',
    icon: '⚛️',
    description: 'Atomic structure visualization',
    descriptionRu: 'Визуализация атомной структуры',
    color: '#f97316',
  },
];

export function getExperimentInfo(id: ExperimentType): ExperimentInfo | undefined {
  return EXPERIMENTS.find(e => e.id === id);
}
