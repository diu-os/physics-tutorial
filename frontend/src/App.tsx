import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Beaker, Brain, Trophy, Menu, X, HelpCircle } from 'lucide-react';
import DoubleSlit from './simulations/DoubleSlit';
import SimulationControls from './components/SimulationControls';
import AIAssistant from './components/AIAssistant';
import './App.css';

type SimulationType = 'double-slit' | 'quantum-tunneling' | 'hydrogen-atom';

function App() {
  const [activeSimulation, setActiveSimulation] = useState<SimulationType>('double-slit');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Simulation parameters
  const [wavelength, setWavelength] = useState(550);
  const [slitSeparation, setSlitSeparation] = useState(0.5);
  const [observerMode, setObserverMode] = useState(false);

  const simulations = [
    { id: 'double-slit', name: 'Double-Slit Experiment', icon: '🌊', available: true },
    { id: 'quantum-tunneling', name: 'Quantum Tunneling', icon: '🚀', available: false },
    { id: 'hydrogen-atom', name: 'Hydrogen Atom', icon: '⚛️', available: false },
  ];

  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">DIU Physics</h1>
          <p className="text-xs text-gray-400 mt-1">Interactive Quantum Tutorial</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-xs uppercase text-gray-500 mb-3 font-semibold">Simulations</h2>
          <ul className="space-y-2">
            {simulations.map((sim) => (
              <li key={sim.id}>
                <button
                  onClick={() => sim.available && setActiveSimulation(sim.id as SimulationType)}
                  disabled={!sim.available}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors
                    ${activeSimulation === sim.id 
                      ? 'bg-blue-600 text-white' 
                      : sim.available 
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'opacity-50 cursor-not-allowed text-gray-500'
                    }`}
                >
                  <span>{sim.icon}</span>
                  <span className="text-sm">{sim.name}</span>
                  {!sim.available && <span className="text-xs ml-auto">Soon</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Trophy size={16} />
            <span>0 achievements</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h2 className="font-semibold">
                {simulations.find(s => s.id === activeSimulation)?.name}
              </h2>
              <p className="text-xs text-gray-400">Explore wave-particle duality</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${aiOpen ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Brain size={18} />
              <span className="text-sm">AI Assistant</span>
            </button>
          </div>
        </header>

        {/* Simulation Area */}
        <div className="flex-1 flex min-h-0">
          {/* 3D Canvas */}
          <div className="flex-1 relative min-w-0">
            <Canvas 
              camera={{ position: [0, 2, 6], fov: 50 }}
              style={{ touchAction: 'none' }}
            >
              <color attach="background" args={['#0f172a']} />
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={0.6} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              
              {activeSimulation === 'double-slit' && (
                <DoubleSlit 
                  wavelength={wavelength}
                  slitSeparation={slitSeparation}
                  observerMode={observerMode}
                />
              )}
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={15}
                target={[0, 0, 0]}
              />
              
              {/* Grid helper for orientation */}
              <gridHelper args={[10, 10, '#334155', '#1e293b']} position={[0, -2.5, 0]} />
            </Canvas>
            
            {/* Help overlay */}
            {showHelp && (
              <div className="absolute top-4 left-4 bg-gray-800/95 backdrop-blur p-4 rounded-lg text-sm max-w-xs">
                <h3 className="font-semibold text-blue-400 mb-2">🎮 Controls</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>🖱️ <strong>Left click + drag</strong> — Rotate view</li>
                  <li>🖱️ <strong>Right click + drag</strong> — Pan</li>
                  <li>🔄 <strong>Scroll wheel</strong> — Zoom in/out</li>
                </ul>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-300"
                >
                  Click to close
                </button>
              </div>
            )}
            
            {/* Overlay info */}
            <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur px-4 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-4">
                <span>λ = {wavelength} nm</span>
                <span>d = {slitSeparation.toFixed(2)} mm</span>
                <span className={observerMode ? 'text-yellow-400' : 'text-green-400'}>
                  {observerMode ? '👁 Observer ON' : '🌊 Wave mode'}
                </span>
              </div>
            </div>
            
            {/* Quick tip */}
            <div className="absolute top-4 right-4 bg-blue-600/20 border border-blue-500/30 px-3 py-2 rounded-lg text-xs text-blue-300">
              💡 Try toggling Observer Mode to see wave-particle duality!
            </div>
          </div>

          {/* Controls Panel */}
          <SimulationControls
            wavelength={wavelength}
            setWavelength={setWavelength}
            slitSeparation={slitSeparation}
            setSlitSeparation={setSlitSeparation}
            observerMode={observerMode}
            setObserverMode={setObserverMode}
          />
        </div>
      </main>

      {/* AI Assistant Panel */}
      {aiOpen && (
        <AIAssistant 
          onClose={() => setAiOpen(false)}
          context={{ activeSimulation, wavelength, slitSeparation, observerMode }}
        />
      )}
    </div>
  );
}

export default App;
