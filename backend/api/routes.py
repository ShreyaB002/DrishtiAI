from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_status():
    return {"status": "ok", "message": "DRISHTI AI Backend is running"}

@router.get("/api/cameras")
async def get_cameras():
    # Return mock cameras for now
    return [
        {"id": "CAM-01", "name": "PERIMETER GATE", "source": "rtsp://mock1", "status": "ONLINE", "mode": "vision"},
        {"id": "CAM-02", "name": "CHECKPOINT NORTH", "source": "rtsp://mock2", "status": "ONLINE", "mode": "vision"},
        {"id": "CAM-03", "name": "FENCE EAST", "source": "rtsp://mock3", "status": "ONLINE", "mode": "vision"},
        {"id": "CAM-04", "name": "VEHICLE ACCESS", "source": "rtsp://mock4", "status": "ONLINE", "mode": "vision"},
        {"id": "CAM-05", "name": "NIGHT WATCH", "source": "rtsp://mock5", "status": "ONLINE", "mode": "vision"},
        {"id": "CAM-06", "name": "THERMAL WATCHTOWER", "source": "rtsp://mock6", "status": "ONLINE", "mode": "vision"},
    ]

@router.get("/api/incidents")
async def get_incidents():
    # Return mock incidents for now
    return []

# We'll add SSE or WebSocket endpoint for live stream later
