import React, { useState, useEffect, useRef } from 'react';
import { Eye, Activity, Cpu, UploadCloud, Play, Pause, LayoutGrid, AlertTriangle, Settings, ShieldCheck, Database, Link as LinkIcon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVideoQueue } from '../contexts/VideoQueueContext';

interface HeaderProps {
  currentMode: 'VISION' | 'THERMAL' | 'DRONE';
  setMode: (mode: 'VISION' | 'THERMAL' | 'DRONE') => void;
  toggleIncidents?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode, toggleIncidents }) => {
  const [time, setTime] = useState(new Date());
  const { addVideos, addCameraUrls, isProcessing, setIsProcessing, queues } = useVideoQueue();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [camUrls, setCamUrls] = useState<string[]>(Array(6).fill(''));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
    <header className="bg-white border-b border-gray-300 flex flex-col shadow-sm z-10">
      {/* Saffron White Green Accent Line */}
      <div className="h-1 w-full indian-gov-gradient"></div>
      
      <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
        {/* Left branding */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full shadow-inner border border-gray-300">
            <Eye className="text-blue-700 w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-widest text-slate-800 drop-shadow-sm flex items-center leading-none mt-1">
              <span className="text-orange-500 mr-2">♦</span> DRISHTI <span className="mx-2 text-slate-500 font-normal text-xs">Border Surveillance C2 System</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              Ministry of Home Affairs, Government of India
            </span>
          </div>
        </div>

        {/* Center Grid Toggles (Aesthetic) */}
        <div className="flex space-x-2">
           <button className="flex items-center space-x-2 bg-blue-700 px-4 py-1 rounded border border-blue-600 text-white text-xs font-bold shadow-[0_0_10px_rgba(29,78,216,0.2)]">
              <LayoutGrid className="w-4 h-4" /> <span>2x3 MATRIX</span>
           </button>
           <button className="flex items-center space-x-2 bg-white hover:bg-gray-100 px-4 py-1 rounded border border-gray-300 text-slate-700 text-xs font-bold">
              <span>1+5 FOCUS</span>
           </button>
           <button className="flex items-center space-x-2 bg-white hover:bg-gray-100 px-4 py-1 rounded border border-gray-300 text-slate-700 text-xs font-bold">
              <span>1x1 CINEMA</span>
           </button>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4 items-center">
          <Link to="/dashboard" className="text-xs font-bold text-slate-700 hover:text-blue-600">Surveillance</Link>
          <Link to="/security" className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center"><ShieldCheck className="w-3 h-3 mr-1"/> Security</Link>
          <Link to="/audit" className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center"><Database className="w-3 h-3 mr-1"/> Audit</Link>
        </div>

        {/* Right Status */}
        <div className="flex space-x-4 text-[10px] font-mono text-slate-600">
           <div className="flex flex-col border-l border-gray-300 pl-4">
              <span className="text-slate-800 flex items-center"><Cpu className="w-3 h-3 text-orange-500 mr-1" /> Compute Engine</span>
              <span>Load: <span className="text-green-600">24%</span></span>
           </div>
           <div className="flex flex-col border-l border-gray-300 pl-4">
              <span className="text-slate-800 flex items-center"><Activity className="w-3 h-3 text-blue-600 mr-1" /> AI Core</span>
              <span>YOLO26M: <span className="text-green-600">ACTIVE</span></span>
           </div>
           {user && (
             <div className="flex flex-col border-l border-gray-300 pl-4">
               <span className="text-slate-800 flex items-center text-xs font-bold">{user.username}</span>
               <span className="text-blue-600 text-[10px]">{user.role}</span>
             </div>
           )}
           {user && (
             <button onClick={handleLogout} className="ml-2 flex items-center text-red-500 hover:text-red-700">
               <LogOut className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        
        {/* Left Mode Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-300 shadow-inner">
          {(['VISION', 'THERMAL', 'DRONE'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`px-4 py-1.5 rounded-md font-semibold text-xs tracking-wider transition-all duration-300 ${
                currentMode === mode 
                ? 'bg-white text-slate-900 shadow border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
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
            className="flex items-center space-x-1 bg-white hover:bg-gray-50 border border-gray-300 px-3 py-1.5 rounded text-xs font-bold text-slate-700 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>UPLOAD VIDEO ({activeQueue.length})</span>
          </button>

          <button 
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-1 bg-white hover:bg-gray-50 border border-gray-300 px-3 py-1.5 rounded text-xs font-bold text-slate-700 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            <span>ADD IP CAMS</span>
          </button>
          
          <button 
            onClick={handleStartPause}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${isProcessing ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {isProcessing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isProcessing ? 'PAUSE' : 'START INFERENCE'}</span>
          </button>

          <button 
            onClick={toggleIncidents}
            className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors relative"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>INCIDENTS</span>
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-600 rounded-full animate-pulse border border-white"></span>
          </button>
          
          <div className="flex flex-col items-end text-xs font-mono text-slate-600 ml-4 border-l border-gray-300 pl-4">
            <div className="text-slate-800 font-bold text-sm">
              {time.toLocaleTimeString('en-IN', { hour12: false })}
            </div>
            <div className="text-[10px] text-slate-500">
              {time.toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* IP Camera Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[550px] border border-gray-300 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
               <Settings className="w-5 h-5 mr-2 text-blue-600" /> Configure {currentMode} Cameras
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {camUrls.map((url, i) => (
                <div key={i} className="flex flex-col">
                  <label className="text-xs font-bold text-slate-600 mb-1">Camera 0{i+1} URL</label>
                  <input 
                    type="text" 
                    value={url} 
                    onChange={e => {
                      const newUrls = [...camUrls];
                      newUrls[i] = e.target.value;
                      setCamUrls(newUrls);
                    }}
                    placeholder="rtsp://... or http://..."
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm text-slate-800 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowConfig(false)} className="px-4 py-2 bg-gray-100 border border-gray-300 text-slate-700 rounded font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={() => {
                addCameraUrls(camUrls.filter(u => u.trim() !== ''));
                setShowConfig(false);
              }} className="px-4 py-2 bg-blue-700 text-white rounded font-bold text-sm hover:bg-blue-800 transition-colors shadow">Save & Connect</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
