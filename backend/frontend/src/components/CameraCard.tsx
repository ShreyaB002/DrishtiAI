import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, Activity, Trash2 } from 'lucide-react';
import type { QueueItem, InferenceEvent } from '../contexts/VideoQueueContext';
import { useVideoQueue } from '../contexts/VideoQueueContext';
import { InferenceService } from '../services/InferenceService';

interface CameraCardProps {
  cameraId: string;
  mode: 'VISION' | 'THERMAL' | 'DRONE';
  queueItem?: QueueItem;
  isFocused: boolean;
}

const CameraCard: React.FC<CameraCardProps> = ({ cameraId, mode, queueItem, isFocused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentBoxes, setCurrentBoxes] = useState<InferenceEvent['boundingBoxes']>([]);
  const [localAlert, setLocalAlert] = useState<InferenceEvent | null>(null);
  const { setActiveAnomalyCameraId, addEvent, isProcessing, updateStatus, removeVideo } = useVideoQueue();
  const [stats, setStats] = useState({ fps: 0, elapsed: 0 });

  const status = queueItem ? 'PROCESSING' : 'STANDBY';
  const hasAlert = !!localAlert;

  // Video and Inference Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastInferenceTime = 0;
    let framesProcessed = 0;
    const startTime = Date.now();

    const loop = async () => {
      if (!videoRef.current || !queueItem || !isProcessing) return;

      const now = Date.now();
      setStats({
        fps: Math.round((framesProcessed / ((now - startTime) / 1000)) || 0),
        elapsed: Math.round((now - startTime) / 1000)
      });

      if (now - lastInferenceTime > 150 && !videoRef.current.paused) {
        lastInferenceTime = now;
        framesProcessed++;
        
        try {
          const event = await InferenceService.processFrame(videoRef.current, cameraId, mode);
          if (event && event.anomalyDetected) {
            event.sourceFilename = queueItem.filename;
            setLocalAlert(event);
            setCurrentBoxes(event.boundingBoxes);
            addEvent(event);
            setActiveAnomalyCameraId(cameraId);
          } else if (Math.random() < 0.1) {
             // Occasionally clear boxes or keep tracking active to simulate real AI tracking
             setCurrentBoxes([]);
          }
        } catch (e) {
          console.error("Inference Error", e);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    if (queueItem && isProcessing) {
      loop();
      if (videoRef.current) {
         videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
      }
    } else {
      if (videoRef.current) videoRef.current.pause();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [queueItem, isProcessing, cameraId, mode, setActiveAnomalyCameraId, addEvent]);

  const handleVideoEnded = () => {
    if (queueItem) {
      // Re-play it since we loop, no need to set completed
      // Or if we don't use the loop attribute, we could do video.play()
    }
  };

  const getVideoFilter = () => {
    if (mode === 'THERMAL') {
      return 'grayscale(100%) contrast(250%) invert(100%) sepia(80%) hue-rotate(240deg) saturate(300%)';
    }
    if (mode === 'DRONE') {
      return 'grayscale(20%) contrast(120%) brightness(1.1)';
    }
    return 'none';
  };

  return (
    <div className={`relative flex flex-col bg-slate-800 rounded-lg overflow-hidden border-2 transition-all duration-300 h-full ${hasAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-slate-700'}`}>
      
      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex flex-col w-2/3">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${status === 'PROCESSING' ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="font-mono text-xs font-bold text-slate-200 flex items-center">
              {cameraId} 
              {queueItem && (
                 <button onClick={() => removeVideo(queueItem.id, mode)} className="ml-3 p-1 bg-red-900/50 hover:bg-red-600 rounded text-slate-300 hover:text-white pointer-events-auto transition-colors" title="Remove Video">
                    <Trash2 className="w-3 h-3" />
                 </button>
              )}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider truncate">
            {queueItem ? queueItem.filename : 'STANDBY'}
          </span>
        </div>
        <div className="flex flex-col items-end w-1/3">
          {hasAlert && localAlert && (
            <span className="bg-red-600/90 border border-red-500 text-white text-[10px] px-2 py-1 rounded font-mono flex flex-col items-end text-right font-bold shadow-lg max-w-full pointer-events-auto">
              <div className="flex items-center text-xs mb-0.5"><AlertTriangle className="w-3 h-3 mr-1" /> {localAlert.anomalyType.toUpperCase()}</div>
              <div className="text-[9px] text-red-100 font-normal leading-tight">{localAlert.message.toUpperCase()}</div>
            </span>
          )}
        </div>
      </div>

      {/* Video Feed Area */}
      <div className="flex-1 w-full bg-black relative overflow-hidden flex items-center justify-center">
        {queueItem ? (
          <>
            <video 
              ref={videoRef}
              src={queueItem.url} 
              muted 
              playsInline
              loop
              onEnded={handleVideoEnded}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ filter: getVideoFilter() }}
            />
            {/* Draw Bounding Boxes */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {currentBoxes.map((box, i) => {
                const top = `${box.y * 100}%`;
                const left = `${box.x * 100}%`;
                const width = `${box.width * 100}%`;
                const height = `${box.height * 100}%`;
                const isCritical = localAlert?.severity === 'critical';
                
                return (
                  <div 
                    key={i}
                    className={`absolute border-2 ${isCritical ? 'border-red-500 bg-red-500/20' : 'border-orange-500 bg-orange-500/20'}`}
                    style={{ top, left, width, height }}
                  >
                    <span className={`absolute -top-5 left-0 text-[10px] ${isCritical ? 'bg-red-500' : 'bg-orange-500'} text-white font-bold px-1 font-mono whitespace-nowrap shadow-sm`}>
                      {box.label.toUpperCase()} {(box.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Drone Crosshair */}
            {mode === 'DRONE' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                <div className="w-16 h-16 border border-white/50 rounded-full"></div>
                <div className="absolute w-32 h-[1px] bg-white/50"></div>
                <div className="absolute w-[1px] h-32 bg-white/50"></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 opacity-50">
            <Activity className="w-8 h-8 mb-2" />
            <span className="font-mono text-xs font-bold tracking-widest">NO SIGNAL</span>
          </div>
        )}
      </div>

      {/* Bottom Stats Overlay */}
      <div className="bg-slate-900 border-t border-slate-700 p-2 flex justify-between items-center text-[10px] font-mono text-slate-400 z-20 shrink-0">
        <div className="flex space-x-3">
          <span>FPS: <span className="text-slate-200">{stats.fps}</span></span>
          <span>TIME: <span className="text-slate-200">{stats.elapsed}s</span></span>
        </div>
        <div className="flex space-x-3">
           <span className={`${hasAlert ? 'text-red-400 font-bold' : ''}`}>{hasAlert ? 'ANOMALY DETECTED' : 'NORMAL'}</span>
        </div>
      </div>
    </div>
  );
};

export default CameraCard;
