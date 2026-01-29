// App.tsx - Main Application with All Modes Integration
/**
 * DIU Physics Interactive v16.0
 * 
 * An open-source educational platform for quantum physics visualization.
 * Built with respect for the scientific community and proper attribution.
 * 
 * "If I have seen further, it is by standing on the shoulders of giants"
 * — Isaac Newton, 1675
 * 
 * Experiments:
 * - Double-Slit: Wave-particle duality
 * - Quantum Tunneling: Barrier penetration (Nobel Prize 2025)
 * - Hydrogen Orbitals: Atomic structure visualization
 * 
 * Modes:
 * - Demo: Simplified for curious minds
 * - Laboratory: Tasks and XP for students
 * - Research: Extended parameters for scientists
 */

import { useState, useCallback, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

// Components
import { ComingSoonModal, type AppMode } from './components/ModeSelector';
import { ControlsPanel } from './components/ControlsPanel';
import { ResearchPanel, DEFAULT_RESEARCH_PARAMS, type ResearchParams } from './components/ResearchPanel';
import { StatsPanel } from './components/StatsPanel';
import { TheorySection } from './components/TheorySection';
import { QuizPanel } from './components/QuizPanel';
import { LabTasks } from './components/LabTasks';
import { DataExport } from './components/DataExport';
import { ScreenDisplayMode, type ScreenMode } from './components/ScreenDisplayMode';
import { TheoryComparisonOverlay } from './components/TheoryComparisonOverlay';
import { ModeInfoPanel } from './components/ModeInfoPanel';
import { HeatmapSettings } from './components/HeatmapSettings';
import { ScientificCredits, CreditsButton } from './components/ScientificCredits';
import { FullscreenToggle, FullscreenOverlay, MinimalFullscreenControls } from './components/FullscreenToggle';

// Simulations
import DoubleSlit from './simulations/DoubleSlit';
import type { DoubleSlitParams, DoubleSlitStats } from './simulations/DoubleSlit';

import QuantumTunneling from './simulations/QuantumTunneling';
import type { TunnelingParams, TunnelingStats } from './simulations/QuantumTunneling';
import { DEFAULT_TUNNELING_PARAMS } from './simulations/QuantumTunneling';

import HydrogenOrbitals from './simulations/HydrogenOrbitals';
import type { HydrogenParams, HydrogenStats } from './simulations/HydrogenOrbitals';
import { DEFAULT_HYDROGEN_PARAMS } from './simulations/HydrogenOrbitals';

// i18n
import { LanguageProvider, useLanguage, LanguageSwitcher } from './i18n/LanguageContext';

// ============== EXPERIMENT TYPES ==============
type ExperimentType = 'doubleSlit' | 'tunneling' | 'hydrogen';

interface ExperimentInfo {
  id: ExperimentType;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
  badge?: string;
}

const EXPERIMENTS: ExperimentInfo[] = [
  {
    id: 'doubleSlit',
    name: 'Double-Slit',
    nameRu: 'Двойная щель',
    icon: '🌊',
    color: '#3b82f6',
  },
  {
    id: 'tunneling',
    name: 'Quantum Tunneling',
    nameRu: 'Туннелирование',
    icon: '⚡',
    color: '#a855f7',
    badge: '🏆 Nobel 2025',
  },
  {
    id: 'hydrogen',
    name: 'Hydrogen Orbitals',
    nameRu: 'Орбитали H',
    icon: '⚛️',
    color: '#f97316',
  },
];

// Default parameters for each mode
const DEFAULT_DEMO_PARAMS: DoubleSlitParams = {
  wavelength: 550,
  slitDistance: 0.3,
  slitWidth: 0.05,
  barrierThickness: 0.1,
  coherence: 100,
  intensity: 50,
  observerOn: false,
  slowMotion: false,
  showTrails: true,
  showHeatmap: true,
  soundEnabled: false,
  showDiscretePoints: false,
  showTheoryOverlay: false,
};

const DEFAULT_LAB_PARAMS: DoubleSlitParams = {
  ...DEFAULT_DEMO_PARAMS,
  barrierThickness: 0.1,
  showDiscretePoints: true,
  showTheoryOverlay: false,
};

// ============== EXPERIMENT SELECTOR COMPONENT (DROPDOWN) ==============
function ExperimentSelector({
  current,
  onChange,
  language,
}: {
  current: ExperimentType;
  onChange: (exp: ExperimentType) => void;
  language: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentExp = EXPERIMENTS.find(e => e.id === current)!;
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600/50"
        style={{ borderLeftColor: currentExp.color, borderLeftWidth: '3px' }}
      >
        <span>{currentExp.icon}</span>
        <span className="font-medium">
          {language === 'ru' ? currentExp.nameRu : currentExp.name}
        </span>
        {currentExp.badge && (
          <span className="text-xs text-yellow-400">🏆</span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-[200] overflow-hidden">
          {EXPERIMENTS.map((exp) => (
            <button
              key={exp.id}
              onClick={() => {
                onChange(exp.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                ${current === exp.id 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
              style={current === exp.id ? { 
                borderLeft: `3px solid ${exp.color}` 
              } : { 
                borderLeft: '3px solid transparent' 
              }}
            >
              <span className="text-lg">{exp.icon}</span>
              <div className="flex-1">
                <div className="font-medium">
                  {language === 'ru' ? exp.nameRu : exp.name}
                </div>
                {exp.badge && (
                  <div className="text-xs text-yellow-400">{exp.badge}</div>
                )}
              </div>
              {current === exp.id && (
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== MODE SELECTOR COMPONENT (DROPDOWN) ==============
interface ModeInfo {
  id: AppMode;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
  description?: string;
  descriptionRu?: string;
}

const MODES: ModeInfo[] = [
  {
    id: 'demo',
    name: 'Demo',
    nameRu: 'Демо',
    icon: '🎮',
    color: '#22c55e',
    description: 'Simplified for curious minds',
    descriptionRu: 'Упрощённый режим',
  },
  {
    id: 'lab',
    name: 'Laboratory',
    nameRu: 'Лаборатория',
    icon: '🔬',
    color: '#3b82f6',
    description: 'Tasks and XP for students',
    descriptionRu: 'Задания и XP',
  },
  {
    id: 'research',
    name: 'Research',
    nameRu: 'Исследование',
    icon: '🔭',
    color: '#a855f7',
    description: 'Extended parameters',
    descriptionRu: 'Расширенные параметры',
  },
  {
    id: 'simulation',
    name: 'Simulation',
    nameRu: 'Симуляция',
    icon: '🖥️',
    color: '#f97316',
    description: 'Coming soon',
    descriptionRu: 'Скоро',
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    nameRu: 'Совместная',
    icon: '👥',
    color: '#06b6d4',
    description: 'Coming soon',
    descriptionRu: 'Скоро',
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    nameRu: 'Песочница',
    icon: '🧪',
    color: '#eab308',
    description: 'Coming soon',
    descriptionRu: 'Скоро',
  },
];

function ModeSelectorDropdown({
  current,
  onChange,
  language,
}: {
  current: AppMode;
  onChange: (mode: AppMode) => void;
  language: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentModeInfo = MODES.find(m => m.id === current)!;
  const availableModes = MODES.filter(m => !['simulation', 'collaboration', 'sandbox'].includes(m.id));
  const comingSoonModes = MODES.filter(m => ['simulation', 'collaboration', 'sandbox'].includes(m.id));
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600/50"
        style={{ borderLeftColor: currentModeInfo.color, borderLeftWidth: '3px' }}
      >
        <span>{currentModeInfo.icon}</span>
        <span className="font-medium">
          {language === 'ru' ? currentModeInfo.nameRu : currentModeInfo.name}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-[200] overflow-hidden">
          {/* Available modes */}
          {availableModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onChange(mode.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                ${current === mode.id 
                  ? 'bg-slate-700 text-white' 
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
              style={current === mode.id ? { 
                borderLeft: `3px solid ${mode.color}` 
              } : { 
                borderLeft: '3px solid transparent' 
              }}
            >
              <span className="text-lg">{mode.icon}</span>
              <div className="flex-1">
                <div className="font-medium">
                  {language === 'ru' ? mode.nameRu : mode.name}
                </div>
                <div className="text-xs text-gray-400">
                  {language === 'ru' ? mode.descriptionRu : mode.description}
                </div>
              </div>
              {current === mode.id && (
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
          
          {/* Divider */}
          <div className="border-t border-slate-600/50 my-1" />
          
          {/* Coming soon modes */}
          {comingSoonModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onChange(mode.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-500 hover:bg-slate-700/30"
              style={{ borderLeft: '3px solid transparent' }}
            >
              <span className="text-lg opacity-50">{mode.icon}</span>
              <div className="flex-1">
                <div className="font-medium">
                  {language === 'ru' ? mode.nameRu : mode.name}
                </div>
                <div className="text-xs text-gray-500">
                  {language === 'ru' ? 'Скоро' : 'Coming soon'}
                </div>
              </div>
              <span className="text-xs text-gray-500">🔒</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== TUNNELING CONTROLS ==============
function TunnelingControls({
  params,
  setParams,
  onReset,
}: {
  params: TunnelingParams;
  setParams: (p: TunnelingParams) => void;
  onReset: () => void;
}) {
  const { t } = useLanguage();
  
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
          ⚡ Quantum Tunneling
        </h3>
        <button
          onClick={onReset}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
        >
          Reset
        </button>
      </div>
      
      {/* Particle Energy */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Particle Energy (E)</span>
          <span className="text-green-400">{params.particleEnergy} eV</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="20"
          step="0.5"
          value={params.particleEnergy}
          onChange={(e) => setParams({ ...params, particleEnergy: parseFloat(e.target.value) })}
          className="w-full accent-green-500"
        />
      </div>
      
      {/* Barrier Height */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Barrier Height (V₀)</span>
          <span className="text-purple-400">{params.barrierHeight} eV</span>
        </label>
        <input
          type="range"
          min="1"
          max="25"
          step="0.5"
          value={params.barrierHeight}
          onChange={(e) => setParams({ ...params, barrierHeight: parseFloat(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </div>
      
      {/* Barrier Width */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Barrier Width (L)</span>
          <span className="text-purple-400">{params.barrierWidth.toFixed(1)} nm</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={params.barrierWidth}
          onChange={(e) => setParams({ ...params, barrierWidth: parseFloat(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </div>
      
      {/* Intensity */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Particle Rate</span>
          <span className="text-blue-400">{params.intensity}/s</span>
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={params.intensity}
          onChange={(e) => setParams({ ...params, intensity: parseInt(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>
      
      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showWaves ?? true}
            onChange={(e) => setParams({ ...params, showWaves: e.target.checked })}
            className="accent-purple-500"
          />
          Show Waves
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showTrails ?? true}
            onChange={(e) => setParams({ ...params, showTrails: e.target.checked })}
            className="accent-purple-500"
          />
          Show Trails
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.slowMotion ?? false}
            onChange={(e) => setParams({ ...params, slowMotion: e.target.checked })}
            className="accent-purple-500"
          />
          Slow Motion
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showEnergyPlane ?? true}
            onChange={(e) => setParams({ ...params, showEnergyPlane: e.target.checked })}
            className="accent-purple-500"
          />
          Energy Plane
        </label>
      </div>
      
      {/* Status */}
      <div className={`p-2 rounded text-sm text-center ${
        params.particleEnergy >= params.barrierHeight
          ? 'bg-green-900/50 text-green-300'
          : 'bg-purple-900/50 text-purple-300'
      }`}>
        {params.particleEnergy >= params.barrierHeight
          ? '✓ Classical case: E ≥ V₀'
          : `⚡ Tunneling: E < V₀`
        }
      </div>
    </div>
  );
}

// ============== HYDROGEN CONTROLS ==============
function HydrogenControls({
  params,
  setParams,
  onReset,
}: {
  params: HydrogenParams;
  setParams: (p: HydrogenParams) => void;
  onReset: () => void;
}) {
  const ORBITAL_NAMES = ['s', 'p', 'd', 'f', 'g', 'h', 'i'];
  const maxL = Math.min(params.n - 1, 6);
  const maxM = params.l;
  
  // Quick presets
  const presets = [
    { n: 1, l: 0, m: 0, name: '1s' },
    { n: 2, l: 0, m: 0, name: '2s' },
    { n: 2, l: 1, m: 0, name: '2p' },
    { n: 3, l: 0, m: 0, name: '3s' },
    { n: 3, l: 1, m: 0, name: '3p' },
    { n: 3, l: 2, m: 0, name: '3d' },
    { n: 4, l: 3, m: 0, name: '4f' },
  ];
  
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
          ⚛️ Hydrogen Orbitals
        </h3>
        <button
          onClick={onReset}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
        >
          Reset
        </button>
      </div>
      
      {/* Quick Presets */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Quick Select:</label>
        <div className="flex flex-wrap gap-1">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => setParams({ ...params, n: p.n, l: p.l, m: p.m })}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                params.n === p.n && params.l === p.l
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Principal quantum number n */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Principal (n)</span>
          <span className="text-orange-400">{params.n}</span>
        </label>
        <input
          type="range"
          min="1"
          max="7"
          step="1"
          value={params.n}
          onChange={(e) => {
            const newN = parseInt(e.target.value);
            const newL = Math.min(params.l, newN - 1);
            const newM = Math.min(Math.abs(params.m), newL) * Math.sign(params.m || 1);
            setParams({ ...params, n: newN, l: newL, m: newM });
          }}
          className="w-full accent-orange-500"
        />
      </div>
      
      {/* Angular quantum number l */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Angular (l)</span>
          <span className="text-orange-400">{params.l} ({ORBITAL_NAMES[params.l] || '?'})</span>
        </label>
        <input
          type="range"
          min="0"
          max={maxL}
          step="1"
          value={params.l}
          onChange={(e) => {
            const newL = parseInt(e.target.value);
            const newM = Math.min(Math.abs(params.m), newL) * Math.sign(params.m || 1);
            setParams({ ...params, l: newL, m: newM });
          }}
          className="w-full accent-orange-500"
        />
      </div>
      
      {/* Magnetic quantum number m */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Magnetic (m)</span>
          <span className="text-orange-400">{params.m}</span>
        </label>
        <input
          type="range"
          min={-maxM}
          max={maxM}
          step="1"
          value={params.m}
          onChange={(e) => setParams({ ...params, m: parseInt(e.target.value) })}
          className="w-full accent-orange-500"
          disabled={maxM === 0}
        />
      </div>
      
      {/* Cloud Density */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Cloud Density</span>
          <span className="text-blue-400">{params.cloudDensity}</span>
        </label>
        <input
          type="range"
          min="500"
          max="5000"
          step="250"
          value={params.cloudDensity ?? 1500}
          onChange={(e) => setParams({ ...params, cloudDensity: parseInt(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>
      
      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showNucleus ?? true}
            onChange={(e) => setParams({ ...params, showNucleus: e.target.checked })}
            className="accent-orange-500"
          />
          Nucleus
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showAxes ?? true}
            onChange={(e) => setParams({ ...params, showAxes: e.target.checked })}
            className="accent-orange-500"
          />
          Axes
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showProbabilityCloud ?? true}
            onChange={(e) => setParams({ ...params, showProbabilityCloud: e.target.checked })}
            className="accent-orange-500"
          />
          Cloud
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showOrbitalSurface ?? true}
            onChange={(e) => setParams({ ...params, showOrbitalSurface: e.target.checked })}
            className="accent-orange-500"
          />
          Surface
        </label>
      </div>
      
      {/* Orbital Info */}
      <div className="bg-slate-900/50 p-2 rounded text-sm">
        <div className="text-orange-400 font-semibold">
          {params.n}{ORBITAL_NAMES[params.l] || '?'} orbital
        </div>
        <div className="text-gray-400 text-xs">
          E = {(-13.6 / (params.n * params.n)).toFixed(2)} eV
        </div>
      </div>
    </div>
  );
}

// ============== TUNNELING STATS PANEL ==============
function TunnelingStatsPanel({ stats }: { stats: TunnelingStats | null }) {
  if (!stats) return null;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-3">
      <h3 className="text-lg font-semibold text-purple-400">📊 Statistics</h3>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-gray-400">Total</div>
          <div className="text-xl font-bold text-white">{stats.totalParticles}</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-gray-400">Tunneled</div>
          <div className="text-xl font-bold text-green-400">{stats.tunneled}</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-gray-400">Reflected</div>
          <div className="text-xl font-bold text-red-400">{stats.reflected}</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-gray-400">T (exp)</div>
          <div className="text-xl font-bold text-purple-400">
            {(stats.experimentalProbability * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="bg-purple-900/30 p-2 rounded text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">T (theory):</span>
          <span className="text-purple-300">{(stats.tunnelingProbability * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// ============== HYDROGEN STATS PANEL ==============
function HydrogenStatsPanel({ stats }: { stats: HydrogenStats | null }) {
  if (!stats) return null;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-3">
      <h3 className="text-lg font-semibold text-orange-400">📊 Orbital Info</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Orbital:</span>
          <span className="text-orange-400 font-bold">{stats.orbitalName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Energy:</span>
          <span className="text-white">{stats.energy.toFixed(2)} eV</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Angular momentum:</span>
          <span className="text-white">{stats.angularMomentum.toFixed(2)} ℏ</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Avg radius:</span>
          <span className="text-white">{stats.averageRadius.toFixed(1)} a₀</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Nodes:</span>
          <span className="text-white">{stats.totalNodes} (r:{stats.radialNodes}, θ:{stats.angularNodes})</span>
        </div>
      </div>
      
      <div className="bg-orange-900/30 p-2 rounded text-sm">
        <div className="text-gray-400 mb-1">Explored orbitals:</div>
        <div className="flex flex-wrap gap-1">
          {stats.viewedOrbitals.map(o => (
            <span key={o} className="px-1.5 py-0.5 bg-orange-800/50 rounded text-orange-300 text-xs">
              {o}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== MAIN APP CONTENT ==============
function AppContent() {
  const { t, language } = useLanguage();
  
  // App state
  const [currentMode, setCurrentMode] = useState<AppMode>('demo');
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentType>('doubleSlit');
  const [showComingSoon, setShowComingSoon] = useState<AppMode | null>(null);
  
  // Double-Slit parameters
  const [params, setParams] = useState<DoubleSlitParams>(DEFAULT_DEMO_PARAMS);
  const [researchParams, setResearchParams] = useState<ResearchParams>(DEFAULT_RESEARCH_PARAMS);
  const [stats, setStats] = useState<DoubleSlitStats | null>(null);
  
  // Tunneling parameters
  const [tunnelingParams, setTunnelingParams] = useState<TunnelingParams>(DEFAULT_TUNNELING_PARAMS);
  const [tunnelingStats, setTunnelingStats] = useState<TunnelingStats | null>(null);
  
  // Hydrogen parameters
  const [hydrogenParams, setHydrogenParams] = useState<HydrogenParams>(DEFAULT_HYDROGEN_PARAMS);
  const [hydrogenStats, setHydrogenStats] = useState<HydrogenStats | null>(null);
  
  // Display state
  const [screenMode, setScreenMode] = useState<ScreenMode>('points');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Camera state
  const [cameraDistance] = useState(20);
  const MIN_CAMERA_DISTANCE = 2;
  const MAX_CAMERA_DISTANCE = 60;
  
  // Reset counter
  const [resetKey, setResetKey] = useState(0);
  
  // Handle mode change
  const handleModeChange = useCallback((mode: AppMode) => {
    if (['simulation', 'collaboration', 'sandbox'].includes(mode)) {
      setShowComingSoon(mode);
      return;
    }
    
    setCurrentMode(mode);
    
    switch (mode) {
      case 'demo':
        setParams(DEFAULT_DEMO_PARAMS);
        break;
      case 'lab':
        setParams(DEFAULT_LAB_PARAMS);
        break;
      case 'research':
        setParams({
          ...DEFAULT_LAB_PARAMS,
          wavelength: researchParams.source.wavelength,
          slitDistance: researchParams.geometry.slitDistance,
          slitWidth: researchParams.geometry.slitWidth,
          coherence: researchParams.source.coherence,
          intensity: researchParams.source.intensity,
          showDiscretePoints: researchParams.display.screenMode === 'points' || researchParams.display.screenMode === 'hybrid',
          showHeatmap: researchParams.display.showHeatmap,
          showTheoryOverlay: researchParams.display.showTheoryCurve,
        });
        break;
    }
  }, [researchParams]);
  
  // Sync research params
  useEffect(() => {
    if (currentMode === 'research' && currentExperiment === 'doubleSlit') {
      setParams(prev => ({
        ...prev,
        wavelength: researchParams.source.wavelength,
        slitDistance: researchParams.geometry.slitDistance,
        slitWidth: researchParams.geometry.slitWidth,
        coherence: researchParams.source.coherence,
        intensity: researchParams.source.intensity,
      }));
    }
  }, [currentMode, currentExperiment, researchParams]);
  
  // Reset handler
  const handleReset = useCallback(() => {
    switch (currentExperiment) {
      case 'doubleSlit':
        switch (currentMode) {
          case 'demo':
            setParams(DEFAULT_DEMO_PARAMS);
            break;
          case 'lab':
            setParams(DEFAULT_LAB_PARAMS);
            break;
          case 'research':
            setResearchParams(DEFAULT_RESEARCH_PARAMS);
            break;
        }
        break;
      case 'tunneling':
        setTunnelingParams(DEFAULT_TUNNELING_PARAMS);
        break;
      case 'hydrogen':
        setHydrogenParams(DEFAULT_HYDROGEN_PARAMS);
        break;
    }
    setResetKey(prev => prev + 1);
  }, [currentMode, currentExperiment]);
  
  // Export handler
  const handleExport = useCallback(() => {
    let exportData;
    switch (currentExperiment) {
      case 'doubleSlit':
        exportData = {
          experiment: 'doubleSlit',
          mode: currentMode,
          params: currentMode === 'research' ? researchParams : params,
          stats,
        };
        break;
      case 'tunneling':
        exportData = {
          experiment: 'tunneling',
          params: tunnelingParams,
          stats: tunnelingStats,
        };
        break;
      case 'hydrogen':
        exportData = {
          experiment: 'hydrogen',
          params: hydrogenParams,
          stats: hydrogenStats,
        };
        break;
    }
    
    const data = {
      ...exportData,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diu-${currentExperiment}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentExperiment, currentMode, params, researchParams, stats, tunnelingParams, tunnelingStats, hydrogenParams, hydrogenStats]);

  // Get current experiment info
  const currentExpInfo = EXPERIMENTS.find(e => e.id === currentExperiment)!;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-none h-14 border-b border-slate-700/50 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur z-[100]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            DIU Physics
          </h1>
          
          {/* Experiment Selector */}
          <ExperimentSelector
            current={currentExperiment}
            onChange={setCurrentExperiment}
            language={language}
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode Selector (only for Double-Slit) */}
          {currentExperiment === 'doubleSlit' && (
            <ModeSelectorDropdown 
              current={currentMode} 
              onChange={handleModeChange}
              language={language}
            />
          )}
          
          <CreditsButton onClick={() => setShowCredits(true)} />
          
          <button
            onClick={() => setShowModeInfo(true)}
            className="px-2 py-1 text-sm bg-slate-700/50 hover:bg-slate-600 rounded-md transition-colors"
          >
            ℹ️ {t('common.modeInfo') || 'Info'}
          </button>
          
          <LanguageSwitcher />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        {!isFullscreen && (
        <aside className="flex-none w-80 p-3 overflow-y-auto space-y-3 bg-slate-900/50">
          {/* Experiment-specific Controls */}
          {currentExperiment === 'doubleSlit' && (
            <>
              {currentMode === 'research' ? (
                <ResearchPanel
                  params={researchParams}
                  onParamsChange={setResearchParams}
                  onExport={handleExport}
                  onImport={setResearchParams}
                />
              ) : (
                <ControlsPanel
                  params={params}
                  setParams={setParams}
                  onReset={handleReset}
                  isLabMode={currentMode === 'lab'}
                />
              )}
              
              {currentMode !== 'demo' && (
                <ScreenDisplayMode
                  mode={screenMode}
                  onModeChange={setScreenMode}
                  showHeatmap={params.showHeatmap ?? true}
                  onHeatmapChange={(show) => setParams(p => ({ ...p, showHeatmap: show }))}
                  heatmapOpacity={heatmapOpacity}
                  onOpacityChange={setHeatmapOpacity}
                />
              )}
              
              {currentMode === 'research' && (
                <HeatmapSettings
                  opacity={heatmapOpacity}
                  onOpacityChange={setHeatmapOpacity}
                  colorScheme={researchParams.display.colorScheme as 'wavelength' | 'thermal' | 'grayscale' | 'scientific'}
                  onColorSchemeChange={(scheme) => setResearchParams(p => ({
                    ...p,
                    display: { ...p.display, colorScheme: scheme }
                  }))}
                  showContours={false}
                  onShowContoursChange={() => {}}
                  interpolation="linear"
                  onInterpolationChange={() => {}}
                />
              )}
              
              {currentMode === 'lab' && (
                <LabTasks params={params} stats={stats} />
              )}
            </>
          )}
          
          {currentExperiment === 'tunneling' && (
            <TunnelingControls
              params={tunnelingParams}
              setParams={setTunnelingParams}
              onReset={handleReset}
            />
          )}
          
          {currentExperiment === 'hydrogen' && (
            <HydrogenControls
              params={hydrogenParams}
              setParams={setHydrogenParams}
              onReset={handleReset}
            />
          )}
        </aside>
        )}
        
        {/* Center - 3D Canvas */}
        <div className={`flex-1 relative ${isFullscreen ? 'w-full' : ''}`} ref={canvasContainerRef}>
          {/* Fullscreen Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <FullscreenToggle 
              targetRef={canvasContainerRef}
              onFullscreenChange={setIsFullscreen}
            />
          </div>
          
          {/* Fullscreen Overlay (Double-Slit only) */}
          {currentExperiment === 'doubleSlit' && (
            <FullscreenOverlay
              isFullscreen={isFullscreen}
              onExit={() => {
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                }
              }}
            >
              <MinimalFullscreenControls
                wavelength={params.wavelength}
                slitDistance={params.slitDistance}
                intensity={params.intensity}
                observerOn={params.observerOn}
                totalParticles={stats?.totalParticles ?? 0}
                fringeCount={stats?.fringeCount ?? 0}
              />
            </FullscreenOverlay>
          )}
          
          <Canvas shadows>
            <PerspectiveCamera
              makeDefault
              position={[0, 8, cameraDistance]}
              fov={50}
            />
            <OrbitControls
              minDistance={MIN_CAMERA_DISTANCE}
              maxDistance={MAX_CAMERA_DISTANCE}
              maxPolarAngle={Math.PI / 2}
              enableDamping
              dampingFactor={0.05}
            />
            <Suspense fallback={null}>
              {/* Double-Slit Experiment */}
              {currentExperiment === 'doubleSlit' && (
                <DoubleSlit
                  key={`doubleSlit-${resetKey}`}
                  params={{
                    ...params,
                    showDiscretePoints: screenMode === 'points' || screenMode === 'hybrid',
                    showHeatmap: screenMode === 'fringes' || screenMode === 'hybrid' || params.showHeatmap,
                  }}
                  onStatsUpdate={setStats}
                />
              )}
              
              {/* Quantum Tunneling */}
              {currentExperiment === 'tunneling' && (
                <QuantumTunneling
                  key={`tunneling-${resetKey}`}
                  params={tunnelingParams}
                  onStatsUpdate={setTunnelingStats}
                />
              )}
              
              {/* Hydrogen Orbitals */}
              {currentExperiment === 'hydrogen' && (
                <HydrogenOrbitals
                  key={`hydrogen-${resetKey}`}
                  params={hydrogenParams}
                  onStatsUpdate={setHydrogenStats}
                />
              )}
            </Suspense>
          </Canvas>
          
          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 text-sm">
            <div 
              className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg flex items-center gap-2"
              style={{ borderLeft: `3px solid ${currentExpInfo.color}` }}
            >
              <span>{currentExpInfo.icon}</span>
              <span className="text-white font-medium">
                {language === 'ru' ? currentExpInfo.nameRu : currentExpInfo.name}
              </span>
            </div>
            
            {currentExperiment === 'doubleSlit' && (
              <>
                <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: `hsl(${(params.wavelength - 380) / (780 - 380) * 270}, 100%, 50%)`,
                    }}
                  />
                  <span className="text-white font-mono">{params.wavelength} nm</span>
                </div>
                {params.observerOn && (
                  <div className="px-3 py-1.5 bg-red-600/80 backdrop-blur rounded-lg text-white flex items-center gap-1">
                    👁️ {t('controls.detectorOn')}
                  </div>
                )}
              </>
            )}
            
            {currentExperiment === 'tunneling' && tunnelingStats && (
              <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-purple-300">
                T = {(tunnelingStats.experimentalProbability * 100).toFixed(1)}%
              </div>
            )}
            
            {currentExperiment === 'hydrogen' && hydrogenStats && (
              <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-orange-300">
                {hydrogenStats.orbitalName} | E = {hydrogenStats.energy.toFixed(2)} eV
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Stats & Theory */}
        {!isFullscreen && (
        <aside className="flex-none w-80 p-3 overflow-y-auto space-y-3 bg-slate-900/50">
          {/* Experiment-specific Stats */}
          {currentExperiment === 'doubleSlit' && (
            <>
              <StatsPanel
                stats={stats}
                observerOn={params.observerOn}
                mode={currentMode}
              />
              
              {currentMode === 'research' && stats && researchParams.display.showTheoryCurve && (
                <TheoryComparisonOverlay
                  histogram={stats.histogram}
                  theoreticalCurve={stats.theoreticalCurve}
                  wavelength={params.wavelength}
                  slitDistance={params.slitDistance}
                  slitWidth={params.slitWidth}
                  coherence={params.coherence ?? 100}
                  observerOn={params.observerOn}
                  showTheory={true}
                  showExperimental={true}
                />
              )}
              
              <TheorySection />
              
              {(currentMode === 'demo' || currentMode === 'lab') && (
                <QuizPanel />
              )}
              
              {(currentMode === 'lab' || currentMode === 'research') && stats && (
                <DataExport
                  stats={stats}
                  params={params}
                  onExport={handleExport}
                />
              )}
            </>
          )}
          
          {currentExperiment === 'tunneling' && (
            <>
              <TunnelingStatsPanel stats={tunnelingStats} />
              
              {/* Theory for Tunneling */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-semibold text-purple-400">📖 Theory</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    <strong>WKB Approximation:</strong>
                  </p>
                  <div className="bg-slate-900/50 p-2 rounded font-mono text-xs">
                    T ≈ exp(-2κL)
                  </div>
                  <p className="text-xs text-gray-400">
                    where κ = √(2m(V₀-E))/ℏ
                  </p>
                  <div className="pt-2 border-t border-slate-700">
                    <div className="text-yellow-400 text-xs">
                      🏆 Nobel Prize 2025
                    </div>
                    <div className="text-gray-400 text-xs">
                      Clarke, Devoret, Martinis<br/>
                      "Macroscopic Quantum Tunneling"
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {currentExperiment === 'hydrogen' && (
            <>
              <HydrogenStatsPanel stats={hydrogenStats} />
              
              {/* Theory for Hydrogen */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-semibold text-orange-400">📖 Theory</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    <strong>Rydberg Formula:</strong>
                  </p>
                  <div className="bg-slate-900/50 p-2 rounded font-mono text-xs">
                    E = -13.6 eV / n²
                  </div>
                  <p className="text-xs text-gray-400">
                    Quantum numbers: n, l, m
                  </p>
                  <ul className="text-xs text-gray-400 list-disc list-inside">
                    <li>n = 1,2,3... (principal)</li>
                    <li>l = 0 to n-1 (angular)</li>
                    <li>m = -l to +l (magnetic)</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </aside>
        )}
      </main>
      
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <ComingSoonModal
          mode={showComingSoon}
          isOpen={true}
          onClose={() => setShowComingSoon(null)}
        />
      )}
      
      {/* Mode Info Modal */}
      {showModeInfo && (
        <ModeInfoPanel
          currentMode={currentMode}
          onClose={() => setShowModeInfo(false)}
        />
      )}
      
      {/* Scientific Credits Modal */}
      <ScientificCredits
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
