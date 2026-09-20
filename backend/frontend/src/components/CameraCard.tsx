import React from 'react';
import { Maximize2, AlertTriangle, Play, Pause, RefreshCw } from 'lucide-react';

interface CameraCardProps {
  id: string;
  name: string;
  mode: 'VISION' | 'THERMAL' | 'DRONE';
  status: 'ONLINE' | 'OFFLINE';
  source: string;
  stats: {
    fps: number;
    latency: number;
    people: number;
    vehicles?: number;
    motion: boolean;
  };
  labels: string[];
  alert?: boolean;
}

const CameraCard: React.FC<CameraCardProps> = ({ id, name, mode, status, stats, labels, alert }) => {
  // Mock image based on mode and id for demonstration since we don't have real feeds yet
  const getMockFeed = () => {
    if (mode === 'THERMAL') {
      return `linear-gradient(45deg, #0f172a, #4c1d95, #be185d, #f59e0b)`; // Thermal-like gradient
    }
    if (mode === 'DRONE') {
      return `linear-gradient(to bottom, #38bdf8, #0ea5e9, #64748b, #334155)`; // Sky-like to ground gradient
    }
    return `linear-gradient(to bottom right, #1e293b, #0f172a)`; // Default night/dark feed
  };

  return (
    <div className={`relative flex flex-col bg-slate-800 rounded-lg overflow-hidden border-2 transition-all duration-300 ${alert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-slate-700'}`}>
      
      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="font-mono text-xs font-bold text-slate-200">{id}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider">{name}</span>
        </div>
        <div className="flex space-x-1">
          {labels.map((label, idx) => (
            <span key={idx} className="bg-slate-900/60 border border-slate-600 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
              {label}
            </span>
          ))}
          {alert && (
            <span className="bg-red-500/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono flex items-center">
              <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> BREACH
            </span>
          )}
        </div>
      </div>

      {/* Video Feed Area */}
      <div 
        className="flex-1 w-full bg-slate-900 relative group"
        style={{ background: getMockFeed() }}
      >
        {/* Placeholder for actual canvas/video element */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <span className="font-mono text-4xl font-bold tracking-widest mix-blend-overlay">DRISHTI AI</span>
        </div>
        
        {/* Simulated Bounding Boxes (for visual effect only) */}
        {status === 'ONLINE' && !alert && (
          <div className="absolute top-1/4 left-1/3 w-16 h-32 border border-green-500 bg-green-500/10">
            <span className="absolute -top-4 left-0 text-[8px] bg-green-500 text-black px-1 font-mono">PERSON 0.92</span>
          </div>
        )}
        {alert && (
          <div className="absolute top-1/2 left-1/2 w-20 h-40 border-2 border-red-500 bg-red-500/20 transform -translate-x-1/2 -translate-y-1/2">
            <span className="absolute -top-4 left-0 text-[8px] bg-red-500 text-white px-1 font-mono font-bold">INTRUDER 0.98</span>
          </div>
        )}

        {/* Hover Controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-4">
          <button className="p-2 bg-slate-800 rounded-full text-slate-200 hover:text-white hover:bg-slate-700 transition"><Play className="w-4 h-4" /></button>
          <button className="p-2 bg-slate-800 rounded-full text-slate-200 hover:text-white hover:bg-slate-700 transition"><Pause className="w-4 h-4" /></button>
          <button className="p-2 bg-slate-800 rounded-full text-slate-200 hover:text-white hover:bg-slate-700 transition"><RefreshCw className="w-4 h-4" /></button>
          <button className="p-2 bg-slate-800 rounded-full text-slate-200 hover:text-white hover:bg-slate-700 transition"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Bottom Stats Overlay */}
      <div className="bg-slate-900 border-t border-slate-700 p-2 flex justify-between items-center text-[10px] font-mono text-slate-400">
        <div className="flex space-x-3">
          <span>FPS: <span className="text-slate-200">{stats.fps}</span></span>
          <span>LAT: <span className="text-slate-200">{stats.latency}ms</span></span>
        </div>
        <div className="flex space-x-3">
          <span className={stats.motion ? 'text-amber-400' : ''}>MOT: {stats.motion ? 'YES' : 'NO'}</span>
          <span>PPL: <span className="text-slate-200">{stats.people}</span></span>
          {stats.vehicles !== undefined && <span>VEH: <span className="text-slate-200">{stats.vehicles}</span></span>}
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600 transition-colors">
          INSPECT
        </button>
      </div>
    </div>
  );
};

export default CameraCard;
