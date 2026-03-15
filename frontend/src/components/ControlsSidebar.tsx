import { ControlsPanel } from './ControlsPanel';
import { ResearchPanel, type ResearchParams } from './ResearchPanel';
import { TunnelingControls } from './TunnelingControls';
import { HydrogenControls } from './HydrogenControls';
import { ScreenDisplayMode, type ScreenMode } from './ScreenDisplayMode';
import { HeatmapSettings } from './HeatmapSettings';
import { LabTasks } from './LabTasks';
import { type ExperimentType } from './ExperimentSelector';
import { type AppMode } from './ModeSelector';
import type { DoubleSlitParams, DoubleSlitStats } from '../simulations/DoubleSlit';
import type { TunnelingParams } from '../simulations/QuantumTunneling';
import type { HydrogenParams } from '../simulations/HydrogenOrbitals';

export function ControlsSidebar({
  currentExperiment,
  currentMode,
  params,
  setParams,
  researchParams,
  setResearchParams,
  tunnelingParams,
  setTunnelingParams,
  hydrogenParams,
  setHydrogenParams,
  onReset,
  onExport,
  screenMode,
  setScreenMode,
  heatmapOpacity,
  setHeatmapOpacity,
  stats,
}: {
  currentExperiment: ExperimentType;
  currentMode: AppMode;
  params: DoubleSlitParams;
  setParams: (p: DoubleSlitParams) => void;
  researchParams: ResearchParams;
  setResearchParams: (p: ResearchParams) => void;
  tunnelingParams: TunnelingParams;
  setTunnelingParams: (p: TunnelingParams) => void;
  hydrogenParams: HydrogenParams;
  setHydrogenParams: (p: HydrogenParams) => void;
  onReset: () => void;
  onExport: () => void;
  screenMode: ScreenMode;
  setScreenMode: (m: ScreenMode) => void;
  heatmapOpacity: number;
  setHeatmapOpacity: (v: number) => void;
  stats: DoubleSlitStats | null;
}) {
  return (
    <aside className="flex-none w-80 p-3 overflow-y-auto space-y-3 bg-slate-900/50">
      {currentExperiment === 'doubleSlit' && (
        <>
          {currentMode === 'research' ? (
            <ResearchPanel
              params={researchParams}
              onParamsChange={setResearchParams}
              onExport={onExport}
              onImport={setResearchParams}
            />
          ) : (
            <ControlsPanel
              params={params}
              setParams={setParams}
              onReset={onReset}
              isLabMode={currentMode === 'lab'}
            />
          )}

          {currentMode !== 'demo' && (
            <ScreenDisplayMode
              mode={screenMode}
              onModeChange={setScreenMode}
              showHeatmap={params.showHeatmap ?? true}
              onHeatmapChange={(show) => setParams({ ...params, showHeatmap: show })}
              heatmapOpacity={heatmapOpacity}
              onOpacityChange={setHeatmapOpacity}
            />
          )}

          {currentMode === 'research' && (
            <HeatmapSettings
              opacity={heatmapOpacity}
              onOpacityChange={setHeatmapOpacity}
              colorScheme={researchParams.display.colorScheme as 'wavelength' | 'thermal' | 'grayscale' | 'scientific'}
              onColorSchemeChange={(scheme) => setResearchParams({
                ...researchParams,
                display: { ...researchParams.display, colorScheme: scheme },
              })}
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
          onReset={onReset}
        />
      )}

      {currentExperiment === 'hydrogen' && (
        <HydrogenControls
          params={hydrogenParams}
          setParams={setHydrogenParams}
          onReset={onReset}
        />
      )}
    </aside>
  );
}
