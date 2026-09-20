import pytest
import numpy as np
from detectors.zone_intrusion import ZoneIntrusionDetector

def test_point_in_polygon():
    detector = ZoneIntrusionDetector(zone_config_path="zones/zone_config.json")
    polygon = [(0, 0), (100, 0), (100, 100), (0, 100)]
    assert detector.point_in_polygon((50, 50), polygon) is True
    assert detector.point_in_polygon((150, 150), polygon) is False

def test_detect_intrusions_empty():
    detector = ZoneIntrusionDetector(zone_config_path="zones/zone_config.json")
    intrusions = detector.detect_intrusions("unknown_camera", {})
    assert intrusions == []
