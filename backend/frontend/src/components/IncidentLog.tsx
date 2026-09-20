import React, { useRef, useEffect } from 'react';
import { AlertCircle, Shield, CheckCircle2, Download, Info, X } from 'lucide-react';
import { useVideoQueue } from '../contexts/VideoQueueContext';

interface IncidentLogProps {
  mode: 'VISION' | 'THERMAL' | 'DRONE';
  onClose?: () => void;
}

const SeverityIcon = ({ severity }: { severity: string }) => {
  switch (severity) {
    case 'critical': return <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />;
    case 'high': return <Shield className="w-5 h-5 text-orange-500" />;
    case 'medium': return <AlertCircle className="w-5 h-5 text-amber-500" />;
    default: return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const IncidentLog: React.FC<IncidentLogProps> = ({ mode, onClose }) => {
  const { events, resolveEvent } = useVideoQueue();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to top when new incident arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events]);

  const handleExportJSON = (event: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(event, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `drishti_${event.cameraId}_${event.anomalyType}_${event.timestampSeconds.toFixed(2)}.json`);
    dlAnchorElem.click();
  };

  const handleExportPNG = (event: any) => {
    if (!event.thumbnailBase64) return;
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", event.thumbnailBase64);
    dlAnchorElem.setAttribute("download", `drishti_${event.cameraId}_${event.anomalyType}_${event.timestampSeconds.toFixed(2)}.png`);
    dlAnchorElem.click();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-700 p-4 shrink-0 z-10 shadow-md flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center tracking-wider">
            <ActivityIcon className="w-5 h-5 mr-2 text-saffron" />
            INCIDENTS LOG
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-time {mode} Event Stream</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {events.map((incident) => (
          <div 
            key={incident.eventId} 
            className={`bg-slate-800/50 border rounded-lg overflow-hidden transition-colors ${
              incident.status === 'NEW' 
                ? incident.severity === 'critical' ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                : incident.severity === 'high' ? 'border-orange-500/50 shadow-[0_0_8px_rgba(249,115,22,0.1)]' 
                : incident.severity === 'medium' ? 'border-amber-500/50' 
                : 'border-slate-600'
                : 'border-slate-700 opacity-60'
            }`}
          >
            {/* Top Bar */}
            <div className="p-3 border-b border-slate-700/50 bg-slate-900/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <SeverityIcon severity={incident.severity} />
                  <span className="font-mono font-bold text-slate-200">{incident.eventId}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{incident.timeStr}</span>
              </div>
              
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                {incident.cameraId} | {incident.anomalyType} | {(incident.confidence * 100).toFixed(1)}% CONF
              </div>
              <p className="text-sm text-slate-300 leading-tight">
                {incident.message}
              </p>
              <div className="text-[9px] text-slate-500 font-mono mt-1">
                FILE: {incident.sourceFilename} | T: {incident.timestampSeconds.toFixed(2)}s | FRM: {incident.frameNumber}
              </div>
            </div>
            
            {/* Thumbnail */}
            {incident.thumbnailBase64 && (
              <div className="w-full bg-black border-b border-slate-700 relative h-32 flex items-center justify-center overflow-hidden">
                <img src={incident.thumbnailBase64} alt="Incident Thumbnail" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                   <span className="text-xs font-mono font-bold text-white">EVIDENCE CAPTURED</span>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-wrap p-2 gap-2 bg-slate-900/80">
              <button 
                onClick={() => handleExportPNG(incident)}
                disabled={!incident.thumbnailBase64}
                className="flex-1 flex justify-center items-center space-x-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-[10px] font-bold transition-colors text-slate-200 disabled:opacity-30"
              >
                <Download className="w-3 h-3" /> <span>PNG</span>
              </button>
              <button 
                onClick={() => handleExportJSON(incident)}
                className="flex-1 flex justify-center items-center space-x-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-[10px] font-bold transition-colors text-slate-200"
              >
                <Download className="w-3 h-3" /> <span>JSON</span>
              </button>
              {incident.status !== 'RESOLVED' && (
                <button 
                  onClick={() => resolveEvent(incident.eventId)}
                  className="flex-1 flex justify-center items-center space-x-1 bg-green-900/40 hover:bg-green-800/60 border border-green-700/50 py-1.5 rounded text-[10px] font-bold transition-colors text-green-400"
                >
                  <CheckCircle2 className="w-3 h-3" /> <span>RESOLVE</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8 font-mono">
            NO INCIDENTS DETECTED YET.
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default IncidentLog;
