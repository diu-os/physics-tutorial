import { useState, useEffect } from 'react';
import { Settings, RotateCcw, Camera, Download } from 'lucide-react';

interface SimulationControlsProps {
  wavelength: number;
  setWavelength: (value: number) => void;
  slitSeparation: number;
  setSlitSeparation: (value: number) => void;
  observerMode: boolean;
  setObserverMode: (value: boolean) => void;
}

function SimulationControls({
  wavelength,
  setWavelength,
  slitSeparation,
  setSlitSeparation,
  observerMode,
  setObserverMode,
}: SimulationControlsProps) {
  
  const resetDefaults = () => {
    setWavelength(550);
    setSlitSeparation(0.1);
    setObserverMode(false);
  };

  const [draftWavelength, setDraftWavelength] = useState(wavelength);
  const [draftSlitSeparation, setDraftSlitSeparation] = useState(slitSeparation);

  useEffect(() => { setDraftWavelength(wavelength); }, [wavelength]);
  useEffect(() => { setDraftSlitSeparation(slitSeparation); }, [slitSeparation]);

  // Get color based on wavelength for the indicator
  const getWavelengthColor = (wl: number): string => {
    if (wl < 450) return '#8b5cf6'; // violet
    if (wl < 495) return '#3b82f6'; // blue
    if (wl < 570) return '#22c55e'; // green
    if (wl < 590) return '#eab308'; // yellow
    if (wl < 620) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-gray-400" />
          <span className="font-semibold">Parameters</span>
        </div>
        <button 
          onClick={resetDefaults}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Wavelength */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">
              Wavelength
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getWavelengthColor(wavelength) }}
              />
              <span className="text-sm text-gray-400">{draftWavelength} nm</span>
            </div>
          </div>
          <input
            type="range"
            min="400"
            max="700"
            step="10"
            value={draftWavelength}
            onChange={(e) => setDraftWavelength(Number(e.target.value))}
            onPointerUp={() => setWavelength(draftWavelength)}
            onKeyUp={() => setWavelength(draftWavelength)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>400 (Violet)</span>
            <span>700 (Red)</span>
          </div>
        </div>

        {/* Slit Separation */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">
              Slit Separation
            </label>
            <span className="text-sm text-gray-400">{draftSlitSeparation.toFixed(2)} mm</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={draftSlitSeparation}
            onChange={(e) => setDraftSlitSeparation(Number(e.target.value))}
            onPointerUp={() => setSlitSeparation(draftSlitSeparation)}
            onKeyUp={() => setSlitSeparation(draftSlitSeparation)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01 mm</span>
            <span>1.00 mm</span>
          </div>
        </div>

        {/* Observer Mode */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">
              Observer Mode
            </label>
          </div>
          <button
            onClick={() => setObserverMode(!observerMode)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
              ${observerMode 
                ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
          >
            <span className="text-xl">{observerMode ? '👁' : '🌊'}</span>
            <span>{observerMode ? 'Observing (Particle)' : 'Not Observing (Wave)'}</span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            {observerMode 
              ? 'When we observe which slit the particle passes through, the interference pattern disappears!'
              : 'Without observation, particles create an interference pattern as if they were waves.'
            }
          </p>
        </div>

        {/* Divider */}
        <hr className="border-gray-700" />

        {/* Theory Preview */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Key Insight</h3>
          <p className="text-sm text-gray-400">
            The double-slit experiment demonstrates <strong className="text-white">wave-particle duality</strong>. 
            Quantum objects behave as waves when not observed, but as particles when measured.
          </p>
        </div>

        {/* Pattern Info */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-2">📊 Pattern Analysis</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Fringe spacing:</span>
              <span className="text-white">
                {((550e-9 / (slitSeparation * 1e-3)) * 1000).toFixed(2)} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className={observerMode ? 'text-yellow-400' : 'text-green-400'}>
                {observerMode ? 'Particle' : 'Wave'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Camera size={16} />
          <span>Screenshot</span>
        </button>
        <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Download size={16} />
          <span>Export Data</span>
        </button>
      </div>
    </aside>
  );
}

export default SimulationControls;
