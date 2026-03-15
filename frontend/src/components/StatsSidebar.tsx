import { StatsPanel } from './StatsPanel';
import { TheorySection } from './TheorySection';
import { QuizPanel } from './QuizPanel';
import { DataExport } from './DataExport';
import { TheoryComparisonOverlay } from './TheoryComparisonOverlay';
import { TunnelingStatsPanel, HydrogenStatsPanel } from './ExperimentStatsPanels';
import { type ExperimentType } from './ExperimentSelector';
import { type AppMode } from './ModeSelector';
import { type ResearchParams } from './ResearchPanel';
import type { DoubleSlitParams, DoubleSlitStats } from '../simulations/DoubleSlit';
import type { TunnelingStats } from '../simulations/QuantumTunneling';
import type { HydrogenStats } from '../simulations/HydrogenOrbitals';

export function StatsSidebar({
  currentExperiment,
  currentMode,
  params,
  researchParams,
  stats,
  tunnelingStats,
  hydrogenStats,
  onExport,
}: {
  currentExperiment: ExperimentType;
  currentMode: AppMode;
  params: DoubleSlitParams;
  researchParams: ResearchParams;
  stats: DoubleSlitStats | null;
  tunnelingStats: TunnelingStats | null;
  hydrogenStats: HydrogenStats | null;
  onExport: () => void;
}) {
  return (
    <aside className="flex-none w-80 p-3 overflow-y-auto space-y-3 bg-slate-900/50">
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
              onExport={onExport}
            />
          )}
        </>
      )}

      {currentExperiment === 'tunneling' && (
        <>
          <TunnelingStatsPanel stats={tunnelingStats} />

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
  );
}
