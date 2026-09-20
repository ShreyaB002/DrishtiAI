from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DetectedObject(BaseModel):
    label: str
    confidence: float
    bbox: List[int] # [x1, y1, x2, y2]
    attributes: Optional[dict] = None # e.g., {"color": "black", "plate": "ABC1234"}

class Event(BaseModel):
    event_id: str
    timestamp: str
    camera_id: str
    source_type: str # rtsp|thermal_video|drone|webcam
    event_type: str # intrusion|motion|violence|weapon|anpr|face|thermal|suspicious_activity
    severity: str # LOW|MEDIUM|HIGH|CRITICAL
    confidence: float
    message: str
    objects: List[DetectedObject] = []
    snapshot_path: Optional[str] = ""
    video_clip_path: Optional[str] = ""
    status: str = "NEW" # NEW|REVIEWING|RESOLVED|FALSE_POSITIVE
