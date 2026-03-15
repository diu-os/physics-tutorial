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
import { ExperimentSelector, type ExperimentType, EXPERIMENTS } from './components/ExperimentSelector';
import { ModeSelectorDropdown } from './components/ModeSelectorDropdown';
import { ControlsSidebar } from './components/ControlsSidebar';
import { StatsSidebar } from './components/StatsSidebar';
import { DEFAULT_RESEARCH_PARAMS, type ResearchParams } from './components/ResearchPanel';
import { type ScreenMode } from './components/ScreenDisplayMode';
import { ModeInfoPanel } from './components/ModeInfoPanel';
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

// ExperimentType, ExperimentInfo, EXPERIMENTS → ./components/ExperimentSelector

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

// ExperimentSelector → ./components/ExperimentSelector

// ModeInfo, MODES, ModeSelectorDropdown → ./components/ModeSelectorDropdown

// TunnelingControls → ./components/TunnelingControls

// HydrogenControls → ./components/HydrogenControls

// TunnelingStatsPanel, HydrogenStatsPanel → ./components/ExperimentStatsPanels

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
        {/* ControlsSidebar → ./components/ControlsSidebar */}
        {!isFullscreen && (
          <ControlsSidebar
            currentExperiment={currentExperiment}
            currentMode={currentMode}
            params={params}
            setParams={setParams}
            researchParams={researchParams}
            setResearchParams={setResearchParams}
            tunnelingParams={tunnelingParams}
            setTunnelingParams={setTunnelingParams}
            hydrogenParams={hydrogenParams}
            setHydrogenParams={setHydrogenParams}
            onReset={handleReset}
            onExport={handleExport}
            screenMode={screenMode}
            setScreenMode={setScreenMode}
            heatmapOpacity={heatmapOpacity}
            setHeatmapOpacity={setHeatmapOpacity}
            stats={stats}
          />
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
        {/* StatsSidebar → ./components/StatsSidebar */}
        {!isFullscreen && (
          <StatsSidebar
            currentExperiment={currentExperiment}
            currentMode={currentMode}
            params={params}
            researchParams={researchParams}
            stats={stats}
            tunnelingStats={tunnelingStats}
            hydrogenStats={hydrogenStats}
            onExport={handleExport}
          />
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
