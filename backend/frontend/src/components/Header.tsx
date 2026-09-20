import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Activity, Cpu, UploadCloud, Play, Pause, LayoutGrid, AlertTriangle } from 'lucide-react';
import { useVideoQueue } from '../contexts/VideoQueueContext';

interface HeaderProps {
  currentMode: 'VISION' | 'THERMAL' | 'DRONE';
  setMode: (mode: 'VISION' | 'THERMAL' | 'DRONE') => void;
  toggleIncidents?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode, toggleIncidents }) => {
  const [time, setTime] = useState(new Date());
  const { addVideos, isProcessing, setIsProcessing, queues } = useVideoQueue();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addVideos(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStartPause = () => {
    if (isProcessing) {
      setIsProcessing(false);
    } else {
      setIsProcessing(true);
    }
  };

  const activeQueue = queues[currentMode];

  return (
    <header className="bg-slate-900 border-b border-slate-700 flex flex-col shadow-lg z-10">
      {/* Saffron White Green Accent Line */}
      <div className="h-1 w-full indian-gov-gradient"></div>
      
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-800">
        {/* Left branding */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-full shadow-inner border border-slate-700">
            <ShieldAlert className="text-saffron w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white drop-shadow-md flex items-center">
              <span className="text-blue-500 mr-2">♦</span> IBVAP <span className="mx-2 text-slate-500 font-normal text-xs">Border Surveillance C2 System</span>
            </h1>
          </div>
        </div>

        {/* Center Grid Toggles (Aesthetic) */}
        <div className="flex space-x-2">
           <button className="flex items-center space-x-2 bg-blue-600 px-4 py-1 rounded border border-blue-500 text-white text-xs font-bold shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              <LayoutGrid className="w-4 h-4" /> <span>2x3 MATRIX</span>
           </button>
           <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded border border-slate-600 text-slate-300 text-xs font-bold">
              <span>1+5 FOCUS</span>
           </button>
           <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-1 rounded border border-slate-600 text-slate-300 text-xs font-bold">
              <span>1x1 CINEMA</span>
           </button>
        </div>

        {/* Right Status */}
        <div className="flex space-x-4 text-[10px] font-mono text-slate-400">
           <div className="flex flex-col border-l border-slate-700 pl-4">
              <span className="text-white flex items-center"><Cpu className="w-3 h-3 text-orange-400 mr-1" /> Compute Engine</span>
              <span>Load: <span className="text-green-400">24%</span></span>
           </div>
           <div className="flex flex-col border-l border-slate-700 pl-4">
              <span className="text-white flex items-center"><Activity className="w-3 h-3 text-blue-400 mr-1" /> AI Core</span>
              <span>YOLO26M: <span className="text-green-400">ACTIVE</span></span>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        
        {/* Left Mode Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-inner">
          {(['VISION', 'THERMAL', 'DRONE'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`px-4 py-1.5 rounded-md font-semibold text-xs tracking-wider transition-all duration-300 ${
                currentMode === mode 
                ? 'bg-slate-700 text-white shadow-md border-b-2 border-saffron' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Right Actions & Time */}
        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            multiple 
            accept="video/mp4,video/webm,video/ogg,video/quicktime" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded text-xs font-bold text-slate-200 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span>UPLOAD VIDEO ({activeQueue.length})</span>
          </button>
          
          <button 
            onClick={handleStartPause}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${isProcessing ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
          >
            {isProcessing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isProcessing ? 'PAUSE' : 'START INFERENCE'}</span>
          </button>

          <button 
            onClick={toggleIncidents}
            className="flex items-center space-x-1 bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 text-red-400 px-3 py-1.5 rounded text-xs font-bold transition-colors relative"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>INCIDENTS</span>
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>
          </button>
          
          <div className="flex flex-col items-end text-xs font-mono text-slate-300 ml-4 border-l border-slate-700 pl-4">
            <div className="text-white font-bold text-sm">
              {time.toLocaleTimeString('en-IN', { hour12: false })}
            </div>
            <div className="text-[10px] text-slate-500">
              {time.toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
