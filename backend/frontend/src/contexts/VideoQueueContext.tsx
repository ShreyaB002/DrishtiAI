import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type VideoStatus = 'WAITING' | 'PROCESSING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';

export interface QueueItem {
  id: string;
  file?: File;
  url: string;
  filename: string;
  size: number;
  mode: 'VISION' | 'THERMAL' | 'DRONE';
  status: VideoStatus;
  anomalyCount: number;
  assignedCameraId: string;
}

export interface InferenceEvent {
  eventId: string;
  cameraId: string;
  frameNumber: number;
  timestampSeconds: number;
  anomalyDetected: boolean;
  anomalyType: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  thumbnailBase64?: string;
  boundingBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }[];
  status?: 'NEW' | 'REVIEWING' | 'RESOLVED';
  sourceFilename?: string;
  mode: 'VISION' | 'THERMAL' | 'DRONE';
  timeStr: string;
}

type Mode = 'VISION' | 'THERMAL' | 'DRONE';

interface VideoQueueContextProps {
  queues: Record<Mode, QueueItem[]>;
  activeMode: Mode;
  setActiveMode: (mode: Mode) => void;
  addVideos: (files: File[]) => void;
  removeVideo: (id: string, mode: Mode) => void;
  updateStatus: (id: string, mode: Mode, status: VideoStatus) => void;
  incrementAnomaly: (id: string, mode: Mode) => void;
  clearQueue: (mode: Mode) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  currentProcessingId: string | null;
  setCurrentProcessingId: (id: string | null) => void;
  activeAnomalyCameraId: string | null;
  setActiveAnomalyCameraId: (id: string | null) => void;
  events: InferenceEvent[];
  addEvent: (event: InferenceEvent) => void;
  resolveEvent: (eventId: string) => void;
  processNext: () => void;
  addCameraUrls: (urls: string[]) => void;
}

const VideoQueueContext = createContext<VideoQueueContextProps | undefined>(undefined);

export const VideoQueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<Mode>('VISION');
  const [queues, setQueues] = useState<Record<Mode, QueueItem[]>>({
    VISION: [],
    THERMAL: [],
    DRONE: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAnomalyCameraId, setActiveAnomalyCameraId] = useState<string | null>(null);
  const [events, setEvents] = useState<InferenceEvent[]>([]);

  const getPrefix = (mode: Mode) => mode === 'VISION' ? 'VIS' : mode === 'THERMAL' ? 'THM' : 'DRN';

  const addVideos = (files: File[]) => {
    setQueues(prev => {
      const currentQueue = prev[activeMode];
      const newItems = files.map((file, index) => {
        const globalIndex = currentQueue.length + index;
        const cameraId = `${getPrefix(activeMode)}-0${(globalIndex % 6) + 1}`;
        return {
          id: Math.random().toString(36).substring(7),
          file,
          url: URL.createObjectURL(file),
          filename: file.name,
          size: file.size,
          mode: activeMode,
          status: 'PROCESSING' as VideoStatus,
          anomalyCount: 0,
          assignedCameraId: cameraId
        };
      });
      return { ...prev, [activeMode]: [...currentQueue, ...newItems] };
    });
    // Ensure processing is active
    setIsProcessing(true);
  };

  const removeVideo = (id: string, mode: Mode) => {
    setQueues(prev => {
      const q = prev[mode];
      const item = q.find(i => i.id === id);
      if (item && item.file && item.url) URL.revokeObjectURL(item.url); // cleanup
      
      const newQ = q.filter(i => i.id !== id);
      return { ...prev, [mode]: newQ };
    });
  };

  const addCameraUrls = (urls: string[]) => {
    setQueues(prev => {
      const currentQueue = prev[activeMode];
      const newItems = urls.map((url, index) => {
        const globalIndex = currentQueue.length + index;
        const cameraId = `${getPrefix(activeMode)}-0${(globalIndex % 6) + 1}`;
        let finalUrl = url.trim();
        // Auto-append /video for bare IP:PORT links typical of IP Webcam apps
        if (/^https?:\/\/[0-9\.]+:\d+\/?$/.test(finalUrl)) {
          finalUrl = finalUrl.endsWith('/') ? finalUrl + 'video' : finalUrl + '/video';
        }
        // Proxy external streams to bypass CORS using Vite's proxy
        if (finalUrl.includes('172.20.10.2:8080')) {
           finalUrl = finalUrl.replace('http://172.20.10.2:8080', '/proxy-video');
        } else if (finalUrl.startsWith('http') && !finalUrl.includes('localhost') && !finalUrl.includes('127.0.0.1')) {
           finalUrl = `http://localhost:8000/proxy-stream?url=${encodeURIComponent(finalUrl)}`;
        }

        return {
          id: Math.random().toString(36).substring(7),
          url: finalUrl,
          filename: finalUrl,
          size: 0,
          mode: activeMode,
          status: 'PROCESSING' as VideoStatus,
          anomalyCount: 0,
          assignedCameraId: cameraId
        };
      });
      return { ...prev, [activeMode]: [...currentQueue, ...newItems] };
    });
    setIsProcessing(true);
  };

  const updateStatus = (id: string, mode: Mode, status: VideoStatus) => {
    setQueues(prev => ({
      ...prev,
      [mode]: prev[mode].map(i => i.id === id ? { ...i, status } : i)
    }));
  };

  const incrementAnomaly = (id: string, mode: Mode) => {
    setQueues(prev => ({
      ...prev,
      [mode]: prev[mode].map(i => i.id === id ? { ...i, anomalyCount: i.anomalyCount + 1 } : i)
    }));
  };

  const clearQueue = (mode: Mode) => {
    setQueues(prev => {
      prev[mode].forEach(item => {
         if (item.file) URL.revokeObjectURL(item.url);
      });
      return { ...prev, [mode]: [] };
    });
    if (activeMode === mode) {
      setActiveAnomalyCameraId(null);
    }
  };

  const addEvent = (event: InferenceEvent) => {
    setEvents(prev => [event, ...prev]);
  };

  const resolveEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.eventId === eventId ? { ...e, status: 'RESOLVED' } : e));
  };

  const processNext = () => {
    // Deprecated: Videos now process simultaneously.
  };

  return (
    <VideoQueueContext.Provider value={{
      queues, activeMode, setActiveMode, addVideos, removeVideo, updateStatus, incrementAnomaly, clearQueue,
      isProcessing, setIsProcessing, currentProcessingId: null, setCurrentProcessingId: () => {},
      activeAnomalyCameraId, setActiveAnomalyCameraId, events, addEvent, resolveEvent, processNext,
      addCameraUrls
    }}>
      {children}
    </VideoQueueContext.Provider>
  );
};

export const useVideoQueue = () => {
  const context = useContext(VideoQueueContext);
  if (!context) throw new Error('useVideoQueue must be used within a VideoQueueProvider');
  return context;
};
