import type { TunnelingStats } from '../simulations/QuantumTunneling';
import type { HydrogenStats } from '../simulations/HydrogenOrbitals';

export function TunnelingStatsPanel({ stats }: { stats: TunnelingStats | null }) {
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

export function HydrogenStatsPanel({ stats }: { stats: HydrogenStats | null }) {
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
