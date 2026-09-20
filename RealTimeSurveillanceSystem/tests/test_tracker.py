import pytest
import numpy as np
from tracker import CentroidTracker

def test_register_and_update():
    tracker = CentroidTracker(max_disappeared=1)
    rects = [(10, 10, 50, 50)]
    objects = tracker.update(rects)
    assert len(objects) == 1
    assert 0 in objects

def test_deregister_after_disappeared():
    tracker = CentroidTracker(max_disappeared=1)
    tracker.update([(10, 10, 50, 50)])
    tracker.update([])
    tracker.update([])
    assert len(tracker.objects) == 0

def test_history_tracking():
    tracker = CentroidTracker(max_disappeared=1)
    tracker.update([(10, 10, 50, 50)])
    assert 0 in tracker.object_history
    assert len(tracker.object_history[0]) == 1
    tracker.update([(20, 20, 70, 70)])
    assert len(tracker.object_history[0]) == 2
