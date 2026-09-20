import React, { useState } from 'react';
import Header from './components/Header';
import CameraGrid from './components/CameraGrid';
import IncidentLog from './components/IncidentLog';

type AppMode = 'VISION' | 'THERMAL' | 'DRONE';

function App() {
  const [mode, setMode] = useState<AppMode>('VISION');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100 overflow-hidden">
      <Header currentMode={mode} setMode={setMode} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main Dashboard Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <CameraGrid mode={mode} />
        </div>
        
        {/* Right Sidebar for Incidents */}
        <div className="w-96 border-l border-slate-700 bg-slate-800 flex flex-col">
          <IncidentLog />
        </div>
      </main>
    </div>
  );
}

export default App;
