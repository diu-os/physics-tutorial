import { useState, useCallback, useEffect, useRef } from 'react';
import { Grid } from '@react-three/drei';
import { Source } from './Source';
import { Barrier } from './Barrier';
import { HeatmapScreen } from './HeatmapScreen';
import { Detector } from './Detector';
import { Particles } from './Particles';
import { LightBeam } from './LightBeam';
import { 
  useInterference,
  calculateFringeCount, 
  calculateContrast,
  calculateMean,
  calculateStdDev,
  calculateSkewness,
  calculateKurtosis,
} from './hooks/useInterference';

export { useWavelengthColor, wavelengthToColor, wavelengthToHex } from './hooks/useWavelengthColor';
export { 
  useInterference, 
  calculateFringeCount, 
  calculateContrast,
  calculateMean,
  calculateStdDev,
  calculateSkewness,
  calculateKurtosis,
  getExpectedFringeCount,
} from './hooks/useInterference';

const SOURCE_X = -8;
const BARRIER_X = 0;
const SCREEN_X = 8;
const HISTOGRAM_BINS = 50;
const SCREEN_WIDTH = 7;

export interface DoubleSlitParams {
  wavelength: number;
  slitDistance: number;
  slitWidth: number;          // Width of each slit
  barrierThickness?: number;  // Thickness of barrier (affects angular selection)
  transmissionEfficiency?: number; // Probability of particle passing through slit (0-100%)
  coherence: number;          // Source coherence (0-100%)
  intensity: number;
  observerOn: boolean;
  slowMotion?: boolean;
  showTrails?: boolean;
  showHeatmap?: boolean;
  soundEnabled?: boolean;
  showDiscretePoints?: boolean;
  showTheoryOverlay?: boolean;
}

export interface DoubleSlitStats {
  totalParticles: number;
  lostParticles: number;      // Particles absorbed/reflected by barrier
  fringeCount: number;
  contrast: number;
  histogram: number[];
  // Extended statistics
  mean: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
  theoreticalCurve: [number, number][];
  expectedFringes: number;
}

interface DoubleSlitProps {
  params: DoubleSlitParams;
  onStatsUpdate?: (stats: DoubleSlitStats) => void;
}

function createEmptyStats(): DoubleSlitStats {
  return {
    totalParticles: 0,
    lostParticles: 0,
    fringeCount: 0,
    contrast: 0,
    histogram: new Array(HISTOGRAM_BINS).fill(0),
    mean: 0,
    stdDev: 0,
    skewness: 0,
    kurtosis: 0,
    theoreticalCurve: [],
    expectedFringes: 0,
  };
}

export function DoubleSlit({ params, onStatsUpdate }: DoubleSlitProps) {
  const { 
    wavelength, 
    slitDistance,
    slitWidth = 0.05,
    barrierThickness = 0.1,  // Default thin barrier
    transmissionEfficiency = 100, // Default 100% transmission (no losses)
    coherence = 100,
    intensity, 
    observerOn,
    slowMotion = false,
    showTrails = true,
    showHeatmap = true,
    soundEnabled = false,
    showDiscretePoints = true,
  } = params;
  
  const [stats, setStats] = useState<DoubleSlitStats>(createEmptyStats);
  
  // Use the improved interference hook with barrier thickness
  const {
    getTheoreticalCurve,
    getExpectedFringes,
  } = useInterference(wavelength, slitDistance, slitWidth, coherence, 2.0, 8, barrierThickness);
  
  const prevRef = useRef({ wavelength, slitDistance, slitWidth, barrierThickness, coherence, observerOn });

  // Reset stats and update theoretical curve when parameters change
  useEffect(() => {
    const prev = prevRef.current;
    if (prev.wavelength !== wavelength || 
        prev.slitDistance !== slitDistance || 
        prev.slitWidth !== slitWidth ||
        prev.barrierThickness !== barrierThickness ||
        prev.coherence !== coherence ||
        prev.observerOn !== observerOn) {
      
      const newStats = createEmptyStats();
      newStats.theoreticalCurve = observerOn ? [] : getTheoreticalCurve(100);
      newStats.expectedFringes = getExpectedFringes();
      
      setStats(newStats);
      prevRef.current = { wavelength, slitDistance, slitWidth, barrierThickness, coherence, observerOn };
    }
  }, [wavelength, slitDistance, slitWidth, coherence, observerOn, getTheoreticalCurve, getExpectedFringes]);

  // Handle particle detection
  const handleParticleHit = useCallback((z: number) => {
    setStats(prev => {
      const normalizedZ = (z + SCREEN_WIDTH / 2) / SCREEN_WIDTH;
      const bin = Math.floor(normalizedZ * HISTOGRAM_BINS);
      const clampedBin = Math.max(0, Math.min(HISTOGRAM_BINS - 1, bin));
      
      const newHistogram = [...prev.histogram];
      newHistogram[clampedBin]++;
      
      const newTotal = prev.totalParticles + 1;
      const newFringeCount = calculateFringeCount(newHistogram);
      const newContrast = calculateContrast(newHistogram);
      
      // Calculate extended statistics
      const newMean = calculateMean(newHistogram);
      const newStdDev = calculateStdDev(newHistogram);
      const newSkewness = calculateSkewness(newHistogram);
      const newKurtosis = calculateKurtosis(newHistogram);
      
      return {
        ...prev,
        totalParticles: newTotal,
        fringeCount: newFringeCount,
        contrast: newContrast,
        histogram: newHistogram,
        mean: newMean,
        stdDev: newStdDev,
        skewness: newSkewness,
        kurtosis: newKurtosis,
      };
    });
  }, []);

  // Handle particle lost (absorbed/reflected by barrier)
  const handleParticleLost = useCallback(() => {
    setStats(prev => ({
      ...prev,
      lostParticles: prev.lostParticles + 1,
    }));
  }, []);

  // Handle discrete detection flash
  const handleDetectionFlash = useCallback((z: number) => {
    if ((window as any).__diuAddDetectionPoint) {
      (window as any).__diuAddDetectionPoint(z);
    }
  }, []);

  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate(stats);
    }
  }, [stats, onStatsUpdate]);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={1.2} />
      <pointLight position={[5, 15, 10]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[0, 10, 5]} intensity={1.0} color="#ffffff" />
      <pointLight position={[-5, 10, -5]} intensity={0.8} color="#8090ff" />
      <pointLight position={[0, 5, 8]} intensity={0.6} color="#ffffff" />

      {/* Grid */}
      <Grid
        position={[0, 0, 0]}
        args={[24, 24]}
        cellSize={1}
        cellThickness={0.8}
        cellColor="#5a6a7a"
        sectionSize={4}
        sectionThickness={1.5}
        sectionColor="#7080a0"
        fadeDistance={30}
        fadeStrength={1}
      />

      {/* Source */}
      <Source 
        position={[SOURCE_X, 1.2, 0]} 
        wavelength={wavelength}
        intensity={intensity}
      />

      {/* Light beam */}
      <LightBeam
        startX={SOURCE_X + 0.5}
        endX={BARRIER_X - 0.15}
        y={1.2}
        wavelength={wavelength}
        slitDistance={slitDistance}
        intensity={intensity}
      />

      {/* Barrier */}
      <Barrier
        position={[BARRIER_X, 0, 0]}
        slitDistance={slitDistance}
        slitWidth={slitWidth}
        thickness={barrierThickness}
      />

      {/* Screen with heatmap and discrete points */}
      <HeatmapScreen
        position={[SCREEN_X, 2, 0]}
        histogram={stats.histogram}
        wavelength={wavelength}
        slitDistance={slitDistance}
        slitWidth={slitWidth}
        observerOn={observerOn}
        showHeatmap={showHeatmap}
        showDiscretePoints={showDiscretePoints}
      />

      {/* Detector */}
      <Detector
        position={[BARRIER_X - 1.2, 1.5, -slitDistance]}
        visible={observerOn}
      />

      {/* Particles with full physics model */}
      <Particles
        wavelength={wavelength}
        slitDistance={slitDistance}
        slitWidth={slitWidth}
        intensity={intensity}
        observerOn={observerOn}
        slowMotion={slowMotion}
        showTrails={showTrails}
        soundEnabled={soundEnabled}
        transmissionEfficiency={transmissionEfficiency}
        onParticleHit={handleParticleHit}
        onParticleLost={handleParticleLost}
        onDetectionFlash={handleDetectionFlash}
        sourceX={SOURCE_X}
        barrierX={BARRIER_X}
        screenX={SCREEN_X}
      />
    </group>
  );
}

export default DoubleSlit;
