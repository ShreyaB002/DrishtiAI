import logging
import cv2
import threading
import time
from typing import Dict, Callable

logger = logging.getLogger(__name__)

class SourceManager:
    def __init__(self):
        self.sources: Dict[str, dict] = {}
        self.lock = threading.Lock()

    def add_source(self, camera_id: str, url: str, source_type: str = "rtsp"):
        with self.lock:
            self.sources[camera_id] = {
                "url": url,
                "type": source_type,
                "capture": None,
                "running": False,
                "thread": None,
                "latest_frame": None,
            }

    def start_stream(self, camera_id: str):
        with self.lock:
            if camera_id not in self.sources:
                logger.error(f"Source {camera_id} not found")
                return False
            
            source = self.sources[camera_id]
            if source["running"]:
                return True

            source["capture"] = cv2.VideoCapture(source["url"])
            if not source["capture"].isOpened():
                logger.error(f"Failed to open source {camera_id} at {source['url']}")
                return False

            source["running"] = True
            source["thread"] = threading.Thread(target=self._update, args=(camera_id,))
            source["thread"].daemon = True
            source["thread"].start()
            logger.info(f"Started stream for {camera_id}")
            return True

    def stop_stream(self, camera_id: str):
        with self.lock:
            if camera_id in self.sources:
                source = self.sources[camera_id]
                source["running"] = False
                if source["capture"]:
                    source["capture"].release()
                if source["thread"]:
                    source["thread"].join(timeout=1.0)
                logger.info(f"Stopped stream for {camera_id}")

    def _update(self, camera_id: str):
        source = self.sources[camera_id]
        cap = source["capture"]
        while source["running"]:
            ret, frame = cap.read()
            if not ret:
                logger.warning(f"Failed to read frame from {camera_id}, reconnecting...")
                # Basic reconnect logic
                time.sleep(2)
                cap = cv2.VideoCapture(source["url"])
                source["capture"] = cap
                continue
            
            source["latest_frame"] = frame
            # Simulate framerate/processing delay
            time.sleep(0.033)

    def get_latest_frame(self, camera_id: str):
        if camera_id in self.sources:
            return self.sources[camera_id]["latest_frame"]
        return None
