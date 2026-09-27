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

const CameraCard: React.FC<CameraCardProps> = ({ cameraId, mode, queueItem }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentBoxes, setCurrentBoxes] = useState<any[]>([]);
  const [currentPoses, setCurrentPoses] = useState<any[]>([]);
  const [imgError, setImgError] = useState(false);
  const [vidError, setVidError] = useState(false);
  const [localAlert, setLocalAlert] = useState<InferenceEvent | null>(null);
  const { setActiveAnomalyCameraId, addEvent, isProcessing, removeVideo } = useVideoQueue();
  const [stats, setStats] = useState({ fps: 0, elapsed: 0 });

  const status = queueItem ? 'PROCESSING' : 'STANDBY';
  const hasAlert = !!localAlert;

  const isBlob = queueItem?.url.startsWith('blob:');
  const isRtsp = queueItem?.url.startsWith('rtsp://');
  const isVideoExt = queueItem?.url.match(/\.(mp4|webm|ogg)$/i);
  const useVideoTag = isBlob || isVideoExt;
  const showMockUi = isRtsp || (useVideoTag ? vidError : imgError);

  // Video and Inference Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastInferenceTime = 0;
    let framesProcessed = 0;
    const startTime = Date.now();

    const loop = async () => {
      const activeMedia = useVideoTag ? videoRef.current : imageRef.current;
      if (!activeMedia || !queueItem || !isProcessing) return;

      const now = Date.now();
      setStats({
        fps: Math.round((framesProcessed / ((now - startTime) / 1000)) || 0),
        elapsed: Math.round((now - startTime) / 1000)
      });

      const isVideoPaused = activeMedia instanceof HTMLVideoElement ? activeMedia.paused : false;

      if (now - lastInferenceTime > 150 && (!isVideoPaused || showMockUi || !useVideoTag)) {
        lastInferenceTime = now;
        framesProcessed++;
        
        try {
          const result = await InferenceService.processFrame(activeMedia, cameraId, mode);
          if (result) {
            setCurrentBoxes(result.liveBoxes);
            setCurrentPoses(result.livePoses);

            const event = result.event;
            if (event && event.anomalyDetected) {
              event.sourceFilename = queueItem.filename;
              setLocalAlert(event);
              addEvent(event);
              setActiveAnomalyCameraId(cameraId);
            }
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
    <div className={`relative flex flex-col bg-white rounded-lg overflow-hidden border-2 transition-all duration-300 h-full ${hasAlert ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-gray-300 shadow-sm'}`}>
      
      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="flex flex-col w-2/3">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${status === 'PROCESSING' ? 'bg-blue-600 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="font-mono text-xs font-bold text-white flex items-center drop-shadow-md">
              {cameraId} 
              {queueItem && (
                 <button onClick={() => removeVideo(queueItem.id, mode)} className="ml-3 p-1 bg-red-100 hover:bg-red-200 rounded text-red-600 hover:text-red-800 pointer-events-auto transition-colors border border-red-200" title="Remove Video">
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
            {useVideoTag && (
              <video 
                ref={videoRef}
                src={queueItem.url} 
                muted 
                playsInline
                loop
                onEnded={handleVideoEnded}
                onError={() => setVidError(true)}
                className={`absolute inset-0 w-full h-full object-fill ${showMockUi ? 'opacity-0 pointer-events-none' : ''}`}
                style={{ filter: getVideoFilter() }}
              />
            )}
            {!useVideoTag && !isRtsp && (
              <img
                ref={imageRef}
                src={queueItem.url}
                crossOrigin="anonymous"
                className={`absolute inset-0 w-full h-full object-fill ${showMockUi ? 'opacity-0 pointer-events-none' : ''}`}
                style={{ filter: getVideoFilter() }}
                alt="IP Camera Feed"
                onError={() => setImgError(true)}
                onLoad={() => setImgError(false)}
              />
            )}
            {showMockUi && (
               <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 text-slate-300 z-0">
                  <Activity className="w-8 h-8 mb-2 animate-pulse text-blue-500" />
                  <span className="font-mono text-xs font-bold tracking-widest text-white">LIVE FEED (SIMULATED)</span>
                  <span className="font-mono text-[9px] mt-1 text-slate-400 px-4 text-center truncate w-full">{queueItem.url}</span>
               </div>
            )}
            {/* Draw Bounding Boxes and Skeletons */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {currentBoxes.map((box, i) => {
                const top = `${box.y * 100}%`;
                const left = `${box.x * 100}%`;
                const width = `${box.width * 100}%`;
                const height = `${box.height * 100}%`;
                const isCritical = localAlert?.severity === 'critical';
                
                return (
                  <div 
                    key={`box-${i}`}
                    className={`absolute border-2 ${isCritical ? 'border-red-500 bg-red-500/20' : 'border-orange-500 bg-orange-500/20'}`}
                    style={{ top, left, width, height }}
                  >
                    <span className={`absolute -top-5 left-0 text-[10px] ${isCritical ? 'bg-red-500' : 'bg-orange-500'} text-white font-bold px-1 font-mono whitespace-nowrap shadow-sm`}>
                      {box.label.toUpperCase()} {(box.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
              
              {/* Draw Pose Skeletons */}
              {currentPoses.map((pose, i) => (
                 <svg key={`pose-${i}`} className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    {[
                      ['nose', 'left_eye'], ['nose', 'right_eye'], ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
                      ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
                      ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
                      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'],
                      ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
                      ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
                    ].map((conn, j) => {
                       const kp1 = pose.keypoints.find((k: any) => k.name === conn[0]);
                       const kp2 = pose.keypoints.find((k: any) => k.name === conn[1]);
                       if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
                          return <line key={`line-${j}`} x1={`${kp1.x * 100}%`} y1={`${kp1.y * 100}%`} x2={`${kp2.x * 100}%`} y2={`${kp2.y * 100}%`} stroke="#3b82f6" strokeWidth="2" opacity="0.8" />
                       }
                       return null;
                    })}
                    {pose.keypoints.map((kp: any, j: number) => {
                       if (kp.score < 0.3) return null;
                       return <circle key={`kp-${j}`} cx={`${kp.x * 100}%`} cy={`${kp.y * 100}%`} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                    })}
                 </svg>
              ))}
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
          <div className="flex flex-col items-center justify-center text-slate-400 opacity-50 bg-gray-100 w-full h-full">
            <Activity className="w-8 h-8 mb-2" />
            <span className="font-mono text-xs font-bold tracking-widest">NO SIGNAL</span>
          </div>
        )}
      </div>

      {/* Bottom Stats Overlay */}
      <div className="bg-gray-50 border-t border-gray-200 p-2 flex justify-between items-center text-[10px] font-mono text-slate-600 z-20 shrink-0">
        <div className="flex space-x-3">
          <span>FPS: <span className="text-slate-800">{stats.fps}</span></span>
          <span>TIME: <span className="text-slate-800">{stats.elapsed}s</span></span>
        </div>
        <div className="flex space-x-3">
           <span className={`${hasAlert ? 'text-red-600 font-bold' : ''}`}>{hasAlert ? 'ANOMALY DETECTED' : 'NORMAL'}</span>
        </div>
      </div>
    </div>
  );
};

export default CameraCard;
