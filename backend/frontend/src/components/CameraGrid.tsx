import React from 'react';
import CameraCard from './CameraCard';

interface CameraGridProps {
  mode: 'VISION' | 'THERMAL' | 'DRONE';
}

const CameraGrid: React.FC<CameraGridProps> = ({ mode }) => {
  // Configuration as requested in the prompt
  const cameras = [
    {
      id: "CAM-01",
      name: "PERIMETER GATE",
      labels: ["PERSON", "INTRUDER", "RESTRICTED ZONE"],
      alert: true,
      stats: { fps: 29.9, latency: 45, people: 1, motion: true }
    },
    {
      id: "CAM-02",
      name: "CHECKPOINT NORTH",
      labels: ["CAR", "BUS", "TRUCK"],
      stats: { fps: 24.5, latency: 52, people: 4, vehicles: 10, motion: true }
    },
    {
      id: "CAM-03",
      name: "FENCE EAST",
      labels: ["PERIMETER MONITORED"],
      stats: { fps: 30.0, latency: 38, people: 0, motion: false }
    },
    {
      id: "CAM-04",
      name: "VEHICLE ACCESS",
      labels: ["PLATE", "ANPR VERIFIED"],
      stats: { fps: 15.2, latency: 120, people: 1, vehicles: 1, motion: true }
    },
    {
      id: "CAM-05",
      name: "NIGHT WATCH",
      labels: ["MOTION DETECTED", "NIGHT MODE"],
      stats: { fps: 20.0, latency: 85, people: 0, motion: true }
    },
    {
      id: "CAM-06",
      name: "THERMAL WATCHTOWER",
      labels: mode === 'THERMAL' ? ["THERMAL PERSON DETECTED", "TEMPERATURE", "RANGE"] : ["THERMAL CAPABLE"],
      stats: { fps: 10.5, latency: 200, people: mode === 'THERMAL' ? 2 : 0, motion: mode === 'THERMAL' }
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {mode === 'THERMAL' && (
        <div className="mb-4 bg-purple-900/30 border border-purple-500/50 p-2 rounded text-center text-purple-200 font-mono text-xs shadow-[0_0_10px_rgba(168,85,247,0.2)]">
          <span className="font-bold">SIMULATED THERMAL STREAM — VIDEO INPUT ACTIVE</span>. Running inference on pre-recorded thermal data.
        </div>
      )}
      {mode === 'DRONE' && (
        <div className="mb-4 bg-sky-900/30 border border-sky-500/50 p-2 rounded text-center text-sky-200 font-mono text-xs">
          <span className="font-bold">AERIAL SURVEILLANCE ACTIVE</span>. Processing drone imagery for small object detection.
        </div>
      )}
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
        {cameras.map(cam => (
          <CameraCard
            key={cam.id}
            id={cam.id}
            name={cam.name}
            mode={mode}
            status="ONLINE"
            source={`mock://${cam.id}`}
            labels={cam.labels}
            stats={cam.stats}
            alert={cam.alert && mode === 'VISION'}
          />
        ))}
      </div>
    </div>
  );
};

export default CameraGrid;
