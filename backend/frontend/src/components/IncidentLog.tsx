import React from 'react';
import { AlertCircle, Shield, CheckCircle2, Eye, Info } from 'lucide-react';

interface Incident {
  id: string;
  time: string;
  camera: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  status: 'NEW' | 'REVIEWING' | 'RESOLVED';
}

const mockIncidents: Incident[] = [
  {
    id: "EVT-8F9A",
    time: "11:05:12",
    camera: "CAM-01",
    type: "INTRUSION",
    severity: "HIGH",
    message: "Person crossed restricted zone",
    status: "NEW"
  },
  {
    id: "EVT-3B2C",
    time: "11:02:45",
    camera: "CAM-02",
    type: "ANPR",
    severity: "MEDIUM",
    message: "Unverified vehicle detected",
    status: "REVIEWING"
  },
  {
    id: "EVT-1C9D",
    time: "10:55:20",
    camera: "CAM-06",
    type: "THERMAL",
    severity: "LOW",
    message: "Thermal motion observation",
    status: "RESOLVED"
  },
  {
    id: "EVT-9F3A",
    time: "10:45:10",
    camera: "CAM-05",
    type: "SUSPICIOUS",
    severity: "HIGH",
    message: "Loitering near perimeter",
    status: "RESOLVED"
  }
];

const SeverityIcon = ({ severity }: { severity: Incident['severity'] }) => {
  switch (severity) {
    case 'CRITICAL': return <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />;
    case 'HIGH': return <Shield className="w-5 h-5 text-orange-500" />;
    case 'MEDIUM': return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case 'LOW': return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const IncidentLog: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <h3 className="text-lg font-bold text-white flex items-center tracking-wider">
          <ActivityIcon className="w-5 h-5 mr-2 text-saffron" />
          INCIDENTS LOG
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-1">Real-time Event Stream</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockIncidents.map((incident) => (
          <div 
            key={incident.id} 
            className={`bg-slate-800/50 border rounded-lg p-3 transition-colors ${
              incident.status === 'NEW' 
                ? incident.severity === 'CRITICAL' ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                : incident.severity === 'HIGH' ? 'border-orange-500/50' 
                : 'border-slate-600'
                : 'border-slate-700 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <SeverityIcon severity={incident.severity} />
                <span className="font-mono font-bold text-slate-200">{incident.id}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{incident.time}</span>
            </div>
            
            <div className="mb-3">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                {incident.camera} | {incident.type}
              </div>
              <p className="text-sm text-slate-300 leading-tight">
                {incident.message}
              </p>
            </div>
            
            <div className="flex space-x-2 mt-3 pt-3 border-t border-slate-700">
              <button className="flex-1 flex justify-center items-center space-x-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-xs transition-colors text-slate-200">
                <Eye className="w-3.5 h-3.5" /> <span>INSPECT</span>
              </button>
              {incident.status !== 'RESOLVED' && (
                <button className="flex-1 flex justify-center items-center space-x-1 bg-green-900/40 hover:bg-green-800/60 border border-green-700/50 py-1.5 rounded text-xs transition-colors text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> <span>RESOLVE</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm font-semibold text-slate-300 transition-colors">
          VIEW ALL INCIDENTS
        </button>
      </div>
    </div>
  );
};

// Quick mock for Activity icon since it's not imported at top
const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default IncidentLog;
