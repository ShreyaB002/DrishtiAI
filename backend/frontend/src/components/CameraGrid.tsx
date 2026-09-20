import React from 'react';
import CameraCard from './CameraCard';
import { useVideoQueue } from '../contexts/VideoQueueContext';
import { LayoutGrid } from 'lucide-react';

interface CameraGridProps {
  mode: 'VISION' | 'THERMAL' | 'DRONE';
}

const CameraGrid: React.FC<CameraGridProps> = ({ mode }) => {
  const { activeAnomalyCameraId, setActiveAnomalyCameraId, queues } = useVideoQueue();

  const getPrefix = (m: string) => m === 'VISION' ? 'VIS' : m === 'THERMAL' ? 'THM' : 'DRN';
  const prefix = getPrefix(mode);
  
  // Generate the 6 fixed slots for the current mode
  const slots = Array.from({ length: 6 }).map((_, i) => `${prefix}-0${i + 1}`);

  const activeQueue = queues[mode];

  // If there's an anomaly, we split the layout
  if (activeAnomalyCameraId && activeAnomalyCameraId.startsWith(prefix)) {
    const otherSlots = slots.filter(id => id !== activeAnomalyCameraId);
    const mainItem = activeQueue.find(i => i.assignedCameraId === activeAnomalyCameraId && i.status === 'PROCESSING');

    return (
      <div className="h-full flex flex-col relative">
        <button 
          onClick={() => setActiveAnomalyCameraId(null)}
          className="absolute top-2 right-2 z-50 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-600 flex items-center shadow-lg transition-colors text-sm font-semibold"
        >
          <LayoutGrid className="w-4 h-4 mr-2" /> RETURN TO GRID
        </button>
        
        <div className="flex-1 flex flex-col xl:flex-row gap-4 h-full">
          {/* Main expanded anomaly view */}
          <div className="flex-[3] h-full">
             <CameraCard 
               cameraId={activeAnomalyCameraId} 
               mode={mode} 
               queueItem={mainItem}
               isFocused={true}
             />
          </div>
          {/* Sidebar thumbnails */}
          <div className="flex-1 grid grid-cols-2 xl:grid-cols-1 gap-2 overflow-y-auto">
            {otherSlots.map(id => (
              <div key={id} className="h-40 xl:h-auto xl:flex-1">
                <CameraCard 
                  cameraId={id} 
                  mode={mode}
                  queueItem={activeQueue.find(i => i.assignedCameraId === id && i.status === 'PROCESSING')}
                  isFocused={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Normal Grid Layout
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
        {slots.map(id => (
          <CameraCard
            key={id}
            cameraId={id}
            mode={mode}
            queueItem={activeQueue.find(i => i.assignedCameraId === id && i.status === 'PROCESSING')}
            isFocused={false}
          />
        ))}
      </div>
    </div>
  );
};

export default CameraGrid;
