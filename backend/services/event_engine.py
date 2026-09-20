import logging
from typing import Dict, Any, List
import uuid
from datetime import datetime
from schemas.event import Event, DetectedObject
from services.event_store import EventStore

logger = logging.getLogger(__name__)

class EventEngine:
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
        # Simple configuration for rules
        self.rules = {
            "weapon_detected": "CRITICAL",
            "intrusion": "HIGH",
            "suspicious_activity": "MEDIUM",
            "violence": "CRITICAL",
            "thermal_person": "MEDIUM"
        }

    def process_detections(self, camera_id: str, source_type: str, detections: List[DetectedObject]) -> List[Event]:
        new_events = []
        for obj in detections:
            # Example rule evaluation
            event_type = None
            severity = "LOW"
            message = ""
            
            if obj.label == "weapon":
                event_type = "weapon"
                severity = self.rules.get("weapon_detected", "HIGH")
                message = "Weapon detected"
                
            elif obj.label == "person":
                # Check for virtual fence/intrusion logic here
                if obj.attributes and obj.attributes.get("zone_breach"):
                    event_type = "intrusion"
                    severity = self.rules.get("intrusion", "HIGH")
                    message = "Person crossed restricted zone"
                
            elif obj.label == "fight" or obj.label == "violence":
                event_type = "violence"
                severity = self.rules.get("violence", "CRITICAL")
                message = "Physical conflict detected"
                
            elif obj.label == "thermal_person":
                event_type = "thermal"
                severity = self.rules.get("thermal_person", "MEDIUM")
                message = "Thermal person detected"

            if event_type:
                event = Event(
                    event_id=f"EVT-{str(uuid.uuid4())[:8]}",
                    timestamp=datetime.utcnow().isoformat() + "Z",
                    camera_id=camera_id,
                    source_type=source_type,
                    event_type=event_type,
                    severity=severity,
                    confidence=obj.confidence,
                    message=message,
                    objects=[obj],
                    status="NEW"
                )
                self.event_store.save_event(event)
                new_events.append(event)
                logger.info(f"Generated event: {event.message} ({event.severity}) on {camera_id}")
                
        return new_events
