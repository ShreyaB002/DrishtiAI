import logging
import random
from schemas.event import DetectedObject

logger = logging.getLogger(__name__)

class GenericModelAdapter:
    def __init__(self, model_name: str, simulated: bool = True):
        self.model_name = model_name
        self.simulated = simulated
        logger.info(f"Initialized {model_name} (Simulated: {simulated})")

    def process_frame(self, frame) -> list[DetectedObject]:
        if not self.simulated:
            # Here we would integrate the actual model inference
            # e.g. using ultralytics YOLOv8
            pass
        return []

class PersonDetectionAdapter(GenericModelAdapter):
    def __init__(self):
        super().__init__("PersonDetection (YOLO12/YOLOv8)", simulated=True)
    
    def process_frame(self, frame) -> list[DetectedObject]:
        # Return mock person if simulated
        if random.random() > 0.95:
            return [DetectedObject(label="person", confidence=0.89, bbox=[100, 100, 200, 300])]
        return []

class ANPRAdapter(GenericModelAdapter):
    def __init__(self):
        super().__init__("ANPR (main-gate-alpr)", simulated=True)
        
    def process_frame(self, frame) -> list[DetectedObject]:
        if random.random() > 0.98:
            return [DetectedObject(label="plate", confidence=0.92, bbox=[150, 150, 250, 200], attributes={"plate": "DL 8C AB 1234"})]
        return []

class FaceRecognitionAdapter(GenericModelAdapter):
    def __init__(self):
        super().__init__("FaceRecognition (MobileFaceNet)", simulated=True)
        
    def process_frame(self, frame) -> list[DetectedObject]:
        if random.random() > 0.99:
            return [DetectedObject(label="face", confidence=0.99, bbox=[100, 100, 150, 150], attributes={"identity": "Unknown"})]
        return []

class ThermalAdapter(GenericModelAdapter):
    def __init__(self):
        super().__init__("Thermal (YOLOv5)", simulated=True)
        
    def process_frame(self, frame) -> list[DetectedObject]:
        if random.random() > 0.9:
            return [DetectedObject(label="thermal_person", confidence=0.85, bbox=[50, 50, 100, 150], attributes={"temperature": 36.5})]
        return []

class DroneAdapter(GenericModelAdapter):
    def __init__(self):
        super().__init__("Drone (LEAF-YOLO)", simulated=True)
        
    def process_frame(self, frame) -> list[DetectedObject]:
        if random.random() > 0.9:
            return [DetectedObject(label="person", confidence=0.75, bbox=[20, 20, 40, 40])]
        return []
