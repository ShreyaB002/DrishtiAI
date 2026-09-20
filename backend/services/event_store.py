import sqlite3
import json
import logging
from typing import List, Optional
from schemas.event import Event, DetectedObject

logger = logging.getLogger(__name__)

class EventStore:
    def __init__(self, db_path: str = "drishti.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS events (
                event_id TEXT PRIMARY KEY,
                timestamp TEXT,
                camera_id TEXT,
                source_type TEXT,
                event_type TEXT,
                severity TEXT,
                confidence REAL,
                message TEXT,
                objects TEXT,
                snapshot_path TEXT,
                video_clip_path TEXT,
                status TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def save_event(self, event: Event):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        objects_json = json.dumps([obj.dict() for obj in event.objects])
        cursor.execute('''
            INSERT INTO events (
                event_id, timestamp, camera_id, source_type, event_type, 
                severity, confidence, message, objects, snapshot_path, 
                video_clip_path, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            event.event_id, event.timestamp, event.camera_id, event.source_type,
            event.event_type, event.severity, event.confidence, event.message,
            objects_json, event.snapshot_path, event.video_clip_path, event.status
        ))
        conn.commit()
        conn.close()

    def get_events(self, limit: int = 50) -> List[dict]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM events ORDER BY timestamp DESC LIMIT ?', (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
