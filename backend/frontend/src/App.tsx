import { useState } from 'react';
import Header from './components/Header';
import CameraGrid from './components/CameraGrid';
import IncidentLog from './components/IncidentLog';
import { useVideoQueue } from './contexts/VideoQueueContext';

function App() {
  const { activeMode, setActiveMode } = useVideoQueue();
  const [showIncidents, setShowIncidents] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100 overflow-hidden relative">
      <Header 
        currentMode={activeMode} 
        setMode={setActiveMode} 
        toggleIncidents={() => setShowIncidents(!showIncidents)} 
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main Dashboard Area - Full Width */}
        <div className="flex-1 p-2 xl:p-4 overflow-hidden">
          <CameraGrid mode={activeMode} />
        </div>
      </main>

      {/* Floating Incidents Modal */}
      {showIncidents && (
         <div className="absolute top-20 bottom-4 right-4 w-[450px] border border-slate-600 bg-slate-800 flex flex-col shadow-2xl z-50 rounded-lg overflow-hidden">
            <IncidentLog mode={activeMode} onClose={() => setShowIncidents(false)} />
         </div>
      )}
    </div>
  );
}

export default App;
