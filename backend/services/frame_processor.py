import asyncio
import logging
from services.source_manager import SourceManager
from services.event_engine import EventEngine
from adapters.models import (
    PersonDetectionAdapter,
    ANPRAdapter,
    FaceRecognitionAdapter,
    ThermalAdapter,
    DroneAdapter
)

logger = logging.getLogger(__name__)

class FrameProcessor:
    def __init__(self, source_manager: SourceManager, event_engine: EventEngine):
        self.source_manager = source_manager
        self.event_engine = event_engine
        
        # Initialize adapters
        self.person_detector = PersonDetectionAdapter()
        self.anpr_detector = ANPRAdapter()
        self.face_detector = FaceRecognitionAdapter()
        self.thermal_detector = ThermalAdapter()
        self.drone_detector = DroneAdapter()
        
        self.running = False
        self.task = None

    def start(self):
        self.running = True
        self.task = asyncio.create_task(self._process_loop())
        logger.info("FrameProcessor started")

    def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
        logger.info("FrameProcessor stopped")

    async def _process_loop(self):
        while self.running:
            for camera_id, source in self.source_manager.sources.items():
                if source["running"] and source["latest_frame"] is not None:
                    frame = source["latest_frame"]
                    mode = source.get("mode", "vision")
                    
                    detections = []
                    
                    if mode == "vision":
                        detections.extend(self.person_detector.process_frame(frame))
                        if camera_id in ["CAM-02", "CAM-04"]: # Configurable
                            detections.extend(self.anpr_detector.process_frame(frame))
                        if camera_id == "CAM-01":
                            detections.extend(self.face_detector.process_frame(frame))
                            
                    elif mode == "thermal":
                        detections.extend(self.thermal_detector.process_frame(frame))
                        
                    elif mode == "drone":
                        detections.extend(self.drone_detector.process_frame(frame))

                    if detections:
                        self.event_engine.process_detections(camera_id, source["type"], detections)
            
            await asyncio.sleep(0.1) # 10 FPS processing limit
