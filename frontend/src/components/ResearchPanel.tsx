// components/ResearchPanel.tsx
/**
 * Research Mode Panel — Comprehensive parameter control for scientists
 * 
 * Based on real experimental setups from Optica publications:
 * - Source parameters (wavelength, coherence, polarization)
 * - Geometry parameters (slit dimensions, distances)
 * - Detector parameters (type, efficiency, noise)
 * - Environmental parameters (temperature, pressure)
 */

import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  ChevronDown,
  ChevronRight,
  Download,
  RotateCcw,
  Save,
  Beaker,
  Waves,
  Target,
  Thermometer,
  Code,
  BookOpen
} from 'lucide-react';

// Extended parameters interface
export interface ResearchParams {
  // Source parameters
  source: {
    wavelength: number;       // nm
    lineWidth: number;        // nm (spectral width)
    coherenceLength: number;  // μm
    coherence: number;        // 0-100%
    polarization: 'H' | 'V' | '45' | 'circular' | 'unpolarized';
    intensity: number;        // 0-100%
    sourceType: 'laser' | 'led' | 'thermal' | 'single-photon';
    photonRate: number;       // photons/s (for single-photon)
  };
  
  // Geometry parameters
  geometry: {
    slitDistance: number;     // mm
    slitWidth: number;        // mm
    slitHeight: number;       // mm
    barrierThickness: number; // mm
    screenDistance: number;   // m
    incidenceAngle: number;   // degrees
    slitCount: number;        // 2, 3, 4... (N-slit interference)
  };
  
  // Detector parameters
  detector: {
    type: 'ccd' | 'pmt' | 'spad' | 'emccd';
    pixelSize: number;        // μm
    quantumEfficiency: number; // 0-100%
    darkCounts: number;       // counts/s
    readNoise: number;        // electrons
    exposureTime: number;     // ms
    gainMode: 'low' | 'medium' | 'high';
  };
  
  // Environment parameters
  environment: {
    refractiveIndex: number;  // air ~1.0003
    temperature: number;      // K
    pressure: number;         // kPa
    humidity: number;         // %
  };
  
  // Display options
  display: {
    screenMode: 'points' | 'fringes' | 'hybrid' | 'accumulation';
    showHeatmap: boolean;
    heatmapOpacity: number;
    showTheoryCurve: boolean;
    showGrid: boolean;
    colorScheme: 'wavelength' | 'thermal' | 'grayscale' | 'scientific';
  };
}

// Default research parameters
export const DEFAULT_RESEARCH_PARAMS: ResearchParams = {
  source: {
    wavelength: 632.8,        // HeNe laser
    lineWidth: 0.002,         // Very narrow for laser
    coherenceLength: 300000,  // ~30cm for HeNe
    coherence: 99,
    polarization: 'H',
    intensity: 50,
    sourceType: 'laser',
    photonRate: 1000000,
  },
  geometry: {
    slitDistance: 0.25,
    slitWidth: 0.05,
    slitHeight: 5.0,
    barrierThickness: 0.01,
    screenDistance: 1.0,
    incidenceAngle: 0,
    slitCount: 2,
  },
  detector: {
    type: 'ccd',
    pixelSize: 6.45,
    quantumEfficiency: 70,
    darkCounts: 0.01,
    readNoise: 3,
    exposureTime: 100,
    gainMode: 'medium',
  },
  environment: {
    refractiveIndex: 1.000293,
    temperature: 293,
    pressure: 101.325,
    humidity: 50,
  },
  display: {
    screenMode: 'points',
    showHeatmap: true,
    heatmapOpacity: 0.6,
    showTheoryCurve: true,
    showGrid: true,
    colorScheme: 'wavelength',
  },
};

interface ResearchPanelProps {
  params: ResearchParams;
  onParamsChange: (params: ResearchParams) => void;
  onExport: () => void;
  onImport: (params: ResearchParams) => void;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-purple-500/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-purple-900/30 flex items-center gap-2 hover:bg-purple-900/40 transition-colors"
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {icon}
        <span className="text-sm font-medium text-purple-200">{title}</span>
      </button>
      {isOpen && (
        <div className="p-3 space-y-3 bg-slate-900/50">
          {children}
        </div>
      )}
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  logarithmic?: boolean;
  tooltip?: string;
}

function SliderControl({ 
  label, value, min, max, step, unit, onChange, logarithmic, tooltip 
}: SliderControlProps) {
  const displayValue = logarithmic 
    ? Math.pow(10, value).toFixed(value > 3 ? 0 : 3 - Math.floor(value))
    : value;
    
  return (
    <div className="space-y-1" title={tooltip}>
      <div className="flex justify-between items-center">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-xs font-mono text-purple-300">
          {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded cursor-pointer accent-purple-500"
      />
    </div>
  );
}

interface SelectControlProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectControl({ label, value, options, onChange }: SelectControlProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex gap-1 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              value === opt.value
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ResearchPanel({ params, onParamsChange, onExport, onImport: _onImport }: ResearchPanelProps) {
  useLanguage();
  
  const updateSource = (key: keyof ResearchParams['source'], value: any) => {
    onParamsChange({
      ...params,
      source: { ...params.source, [key]: value }
    });
  };
  
  const updateGeometry = (key: keyof ResearchParams['geometry'], value: any) => {
    onParamsChange({
      ...params,
      geometry: { ...params.geometry, [key]: value }
    });
  };
  
  const updateDetector = (key: keyof ResearchParams['detector'], value: any) => {
    onParamsChange({
      ...params,
      detector: { ...params.detector, [key]: value }
    });
  };
  
  const updateEnvironment = (key: keyof ResearchParams['environment'], value: any) => {
    onParamsChange({
      ...params,
      environment: { ...params.environment, [key]: value }
    });
  };
  
  const updateDisplay = (key: keyof ResearchParams['display'], value: any) => {
    onParamsChange({
      ...params,
      display: { ...params.display, [key]: value }
    });
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-purple-900/40 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔬</span>
            <div>
              <h3 className="text-sm font-semibold text-white">Research Mode</h3>
              <p className="text-xs text-purple-300">Extended Parameters</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => onParamsChange(DEFAULT_RESEARCH_PARAMS)}
              className="p-1.5 hover:bg-purple-800/50 rounded transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw size={14} className="text-purple-300" />
            </button>
            <button 
              onClick={onExport}
              className="p-1.5 hover:bg-purple-800/50 rounded transition-colors"
              title="Export parameters"
            >
              <Download size={14} className="text-purple-300" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2">
        
        {/* Source Parameters */}
        <CollapsibleSection title="Source" icon={<Waves size={14} className="text-yellow-400" />}>
          <SliderControl
            label="Wavelength λ"
            value={params.source.wavelength}
            min={380} max={780} step={0.1}
            unit="nm"
            onChange={(v) => updateSource('wavelength', v)}
            tooltip="Light wavelength in nanometers"
          />
          <SliderControl
            label="Line Width Δλ"
            value={params.source.lineWidth}
            min={0.001} max={50} step={0.001}
            unit="nm"
            onChange={(v) => updateSource('lineWidth', v)}
            tooltip="Spectral width (smaller = more coherent)"
          />
          <SliderControl
            label="Coherence"
            value={params.source.coherence}
            min={0} max={100} step={1}
            unit="%"
            onChange={(v) => updateSource('coherence', v)}
          />
          <SelectControl
            label="Polarization"
            value={params.source.polarization}
            options={[
              { value: 'H', label: 'H' },
              { value: 'V', label: 'V' },
              { value: '45', label: '45°' },
              { value: 'circular', label: '○' },
              { value: 'unpolarized', label: 'Un' },
            ]}
            onChange={(v) => updateSource('polarization', v as any)}
          />
          <SelectControl
            label="Source Type"
            value={params.source.sourceType}
            options={[
              { value: 'laser', label: 'Laser' },
              { value: 'led', label: 'LED' },
              { value: 'thermal', label: 'Thermal' },
              { value: 'single-photon', label: 'Single γ' },
            ]}
            onChange={(v) => updateSource('sourceType', v as any)}
          />
          <SliderControl
            label="Intensity"
            value={params.source.intensity}
            min={1} max={100} step={1}
            unit="%"
            onChange={(v) => updateSource('intensity', v)}
          />
        </CollapsibleSection>
        
        {/* Geometry Parameters */}
        <CollapsibleSection title="Geometry" icon={<Target size={14} className="text-cyan-400" />}>
          <SliderControl
            label="Slit Distance d"
            value={params.geometry.slitDistance}
            min={0.05} max={2.0} step={0.01}
            unit="mm"
            onChange={(v) => updateGeometry('slitDistance', v)}
          />
          <SliderControl
            label="Slit Width a"
            value={params.geometry.slitWidth}
            min={0.005} max={0.5} step={0.005}
            unit="mm"
            onChange={(v) => updateGeometry('slitWidth', v)}
          />
          <SliderControl
            label="Screen Distance L"
            value={params.geometry.screenDistance}
            min={0.1} max={5.0} step={0.1}
            unit="m"
            onChange={(v) => updateGeometry('screenDistance', v)}
          />
          <SliderControl
            label="Incidence Angle"
            value={params.geometry.incidenceAngle}
            min={-45} max={45} step={1}
            unit="°"
            onChange={(v) => updateGeometry('incidenceAngle', v)}
          />
          <SliderControl
            label="Number of Slits"
            value={params.geometry.slitCount}
            min={2} max={10} step={1}
            unit=""
            onChange={(v) => updateGeometry('slitCount', v)}
          />
        </CollapsibleSection>
        
        {/* Detector Parameters */}
        <CollapsibleSection title="Detector" icon={<Beaker size={14} className="text-green-400" />} defaultOpen={false}>
          <SelectControl
            label="Detector Type"
            value={params.detector.type}
            options={[
              { value: 'ccd', label: 'CCD' },
              { value: 'emccd', label: 'EMCCD' },
              { value: 'pmt', label: 'PMT' },
              { value: 'spad', label: 'SPAD' },
            ]}
            onChange={(v) => updateDetector('type', v as any)}
          />
          <SliderControl
            label="Pixel Size"
            value={params.detector.pixelSize}
            min={1} max={50} step={0.1}
            unit="μm"
            onChange={(v) => updateDetector('pixelSize', v)}
          />
          <SliderControl
            label="Quantum Efficiency"
            value={params.detector.quantumEfficiency}
            min={10} max={98} step={1}
            unit="%"
            onChange={(v) => updateDetector('quantumEfficiency', v)}
          />
          <SliderControl
            label="Dark Counts"
            value={params.detector.darkCounts}
            min={0} max={100} step={0.1}
            unit="/s"
            onChange={(v) => updateDetector('darkCounts', v)}
          />
          <SliderControl
            label="Exposure Time"
            value={params.detector.exposureTime}
            min={1} max={10000} step={1}
            unit="ms"
            onChange={(v) => updateDetector('exposureTime', v)}
          />
        </CollapsibleSection>
        
        {/* Environment Parameters */}
        <CollapsibleSection title="Environment" icon={<Thermometer size={14} className="text-red-400" />} defaultOpen={false}>
          {/* Medium Selection - Based on real refractive index data */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Medium</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: 'vacuum', label: 'Vacuum', n: 1.0 },
                { value: 'air', label: 'Air', n: 1.000293 },
                { value: 'nitrogen', label: 'N₂', n: 1.000298 },
                { value: 'oxygen', label: 'O₂', n: 1.000271 },
                { value: 'helium', label: 'He', n: 1.000036 },
                { value: 'argon', label: 'Ar', n: 1.000281 },
                { value: 'co2', label: 'CO₂', n: 1.000450 },
                { value: 'water', label: 'H₂O', n: 1.333 },
              ].map(medium => (
                <button
                  key={medium.value}
                  onClick={() => {
                    updateEnvironment('refractiveIndex', medium.n);
                  }}
                  className={`py-1.5 px-2 text-xs rounded transition-colors ${
                    Math.abs(params.environment.refractiveIndex - medium.n) < 0.0001
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                  title={`n = ${medium.n}`}
                >
                  {medium.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              λ_eff = λ_vacuum / n • Different gases affect interference pattern spacing
            </p>
          </div>
          
          <SliderControl
            label="Refractive Index n"
            value={params.environment.refractiveIndex}
            min={1.0} max={1.5} step={0.0001}
            unit=""
            onChange={(v) => updateEnvironment('refractiveIndex', v)}
            tooltip="Effective wavelength: λ = λ₀/n"
          />
          <SliderControl
            label="Temperature"
            value={params.environment.temperature}
            min={200} max={400} step={1}
            unit="K"
            onChange={(v) => updateEnvironment('temperature', v)}
            tooltip="Affects gas density and refractive index"
          />
          <SliderControl
            label="Pressure"
            value={params.environment.pressure}
            min={1} max={200} step={0.1}
            unit="kPa"
            onChange={(v) => updateEnvironment('pressure', v)}
            tooltip="Higher pressure → higher refractive index"
          />
          <SliderControl
            label="Humidity"
            value={params.environment.humidity}
            min={0} max={100} step={1}
            unit="%"
            onChange={(v) => updateEnvironment('humidity', v)}
            tooltip="Affects air refractive index"
          />
          
          {/* Gas mixture info */}
          <div className="mt-3 p-2 bg-slate-800/50 rounded text-[10px] text-gray-500">
            <p className="font-medium text-gray-400 mb-1">Refractive Index Formula (gases):</p>
            <p className="font-mono">(n-1) ∝ ρ/T × (P/P₀)</p>
            <p className="mt-1">At STP: Air n=1.000293, He n=1.000036</p>
          </div>
        </CollapsibleSection>
        
        {/* Display Options */}
        <CollapsibleSection title="Display" icon={<BookOpen size={14} className="text-blue-400" />}>
          <SelectControl
            label="Screen Mode"
            value={params.display.screenMode}
            options={[
              { value: 'points', label: '⚬ Points' },
              { value: 'fringes', label: '▮ Fringes' },
              { value: 'hybrid', label: '◐ Hybrid' },
              { value: 'accumulation', label: '▶ Build-up' },
            ]}
            onChange={(v) => updateDisplay('screenMode', v as any)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => updateDisplay('showHeatmap', !params.display.showHeatmap)}
              className={`flex-1 py-1.5 px-2 text-xs rounded transition-colors ${
                params.display.showHeatmap
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-gray-300'
              }`}
            >
              🌡️ Heatmap
            </button>
            <button
              onClick={() => updateDisplay('showTheoryCurve', !params.display.showTheoryCurve)}
              className={`flex-1 py-1.5 px-2 text-xs rounded transition-colors ${
                params.display.showTheoryCurve
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-700 text-gray-300'
              }`}
            >
              📈 Theory
            </button>
          </div>
          {params.display.showHeatmap && (
            <SliderControl
              label="Heatmap Opacity"
              value={params.display.heatmapOpacity}
              min={0.1} max={1.0} step={0.1}
              unit=""
              onChange={(v) => updateDisplay('heatmapOpacity', v)}
            />
          )}
          <SelectControl
            label="Color Scheme"
            value={params.display.colorScheme}
            options={[
              { value: 'wavelength', label: '🌈 λ' },
              { value: 'thermal', label: '🔥 Thermal' },
              { value: 'grayscale', label: '⬜ Gray' },
              { value: 'scientific', label: '🔬 Sci' },
            ]}
            onChange={(v) => updateDisplay('colorScheme', v as any)}
          />
        </CollapsibleSection>
        
        {/* Quick Presets */}
        <div className="border border-slate-700 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => onParamsChange({
                ...DEFAULT_RESEARCH_PARAMS,
                source: { ...DEFAULT_RESEARCH_PARAMS.source, wavelength: 632.8, sourceType: 'laser' }
              })}
              className="py-1.5 px-2 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors text-left"
            >
              🔴 HeNe Laser (632.8nm)
            </button>
            <button
              onClick={() => onParamsChange({
                ...DEFAULT_RESEARCH_PARAMS,
                source: { ...DEFAULT_RESEARCH_PARAMS.source, wavelength: 532, sourceType: 'laser' }
              })}
              className="py-1.5 px-2 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors text-left"
            >
              🟢 Nd:YAG 2ω (532nm)
            </button>
            <button
              onClick={() => onParamsChange({
                ...DEFAULT_RESEARCH_PARAMS,
                source: { ...DEFAULT_RESEARCH_PARAMS.source, wavelength: 589, coherence: 30, sourceType: 'thermal' }
              })}
              className="py-1.5 px-2 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors text-left"
            >
              🟡 Na Lamp (589nm)
            </button>
            <button
              onClick={() => onParamsChange({
                ...DEFAULT_RESEARCH_PARAMS,
                source: { ...DEFAULT_RESEARCH_PARAMS.source, wavelength: 702, sourceType: 'single-photon', coherence: 100 }
              })}
              className="py-1.5 px-2 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors text-left"
            >
              ⚛️ SPDC (702nm)
            </button>
          </div>
        </div>
        
        {/* API Access (Placeholder) */}
        <div className="border border-dashed border-purple-500/30 rounded-lg p-3 bg-purple-900/10">
          <div className="flex items-center gap-2 text-purple-300">
            <Code size={14} />
            <span className="text-xs font-medium">API Access</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-600/50 rounded">Coming Soon</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Python/R scripts, batch simulations, data export
          </p>
        </div>
        
      </div>
      
      {/* Footer Actions */}
      <div className="px-3 py-2 bg-slate-800/50 border-t border-purple-500/20 flex gap-2">
        <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Save size={14} />
          Save Preset
        </button>
        <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Download size={14} />
          Export JSON
        </button>
      </div>
    </div>
  );
}
