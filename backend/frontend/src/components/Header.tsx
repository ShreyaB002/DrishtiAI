import React, { useState, useEffect } from 'react';
import { Download, ShieldAlert, Activity, Cpu, Wifi, Settings } from 'lucide-react';

interface HeaderProps {
  currentMode: 'VISION' | 'THERMAL' | 'DRONE';
  setMode: (mode: 'VISION' | 'THERMAL' | 'DRONE') => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDownloadCSV = () => {
    alert('Downloading Incidents CSV...');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700 flex flex-col shadow-lg z-10">
      {/* Saffron White Green Accent Line */}
      <div className="h-1 w-full indian-gov-gradient"></div>
      
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left branding */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-16 flex items-center justify-center bg-slate-800 rounded shadow-inner border border-slate-700">
            {/* Placeholder for State Emblem of India */}
            <ShieldAlert className="text-saffron w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider">भारत सरकार | GOVERNMENT OF INDIA</h2>
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-1">गृह मंत्रालय | MINISTRY OF HOME AFFAIRS</h2>
            <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-md">
              <span className="text-saffron">DRISHTI</span> <span className="text-white">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">Integrated Border Surveillance & Intelligence Platform</p>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-inner">
          {(['VISION', 'THERMAL', 'DRONE'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${
                currentMode === mode 
                ? 'bg-slate-700 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {mode} MODE
            </button>
          ))}
        </div>

        {/* Right Status & Actions */}
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
              LIVE / ONLINE
            </div>
            <div className="flex items-center text-cyan-400">
              <Wifi className="w-3 h-3 mr-1" />
              6 CAMS
            </div>
            <div className="flex items-center text-purple-400">
              <Cpu className="w-3 h-3 mr-1" />
              GPU OK
            </div>
            <div className="font-semibold text-slate-200">
              {time.toLocaleTimeString('en-IN', { hour12: false })} | {time.toLocaleDateString('en-IN')}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded text-xs text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD CSV</span>
            </button>
            <button className="flex items-center space-x-1 bg-saffron/20 hover:bg-saffron/30 border border-saffron/50 text-saffron px-3 py-1.5 rounded text-xs transition-colors">
              <Activity className="w-3.5 h-3.5" />
              <span>INCIDENTS LOG</span>
            </button>
            <button className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
