import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CameraGrid from './components/CameraGrid';
import IncidentLog from './components/IncidentLog';
import { useVideoQueue } from './contexts/VideoQueueContext';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import SecurityDashboard from './pages/SecurityDashboard';
import BlockchainAudit from './pages/BlockchainAudit';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return children;
};

function App() {
  const { activeMode, setActiveMode } = useVideoQueue();
  const [showIncidents, setShowIncidents] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900 overflow-hidden relative">
      {user && (
        <Header 
          currentMode={activeMode} 
          setMode={setActiveMode} 
          toggleIncidents={() => setShowIncidents(!showIncidents)} 
        />
      )}
      
      <main className="flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex-1 p-2 xl:p-4 overflow-hidden">
                <CameraGrid mode={activeMode} />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/security" element={
            <ProtectedRoute>
              <SecurityDashboard />
            </ProtectedRoute>
          } />

          <Route path="/audit" element={
            <ProtectedRoute>
              <BlockchainAudit />
            </ProtectedRoute>
          } />
          
        </Routes>
      </main>

      {/* Floating Incidents Modal */}
      {showIncidents && user && (
         <div className="absolute top-20 bottom-4 right-4 w-[450px] border border-gray-300 bg-white flex flex-col shadow-2xl z-50 rounded-lg overflow-hidden">
            <IncidentLog mode={activeMode} onClose={() => setShowIncidents(false)} />
         </div>
      )}
    </div>
  );
}

export default App;
