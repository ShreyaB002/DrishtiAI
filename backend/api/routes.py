import urllib.request
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from fastapi import Depends
from services.auth_service import get_current_user, require_role
from schemas.auth import RoleEnum
router = APIRouter()

@router.get("/proxy-stream")
def proxy_stream(url: str, token: str = None):
    # In a real scenario, validate token here or via middleware. 
    # Browser img tag or video tag doesn't send Authorization header easily without query param.
    try:
        req = urllib.request.urlopen(url)
        content_type = req.headers.get("Content-Type", "multipart/x-mixed-replace")
        
        def iterfile():
            try:
                while True:
                    chunk = req.read(8192)
                    if not chunk:
                        break
                    yield chunk
            except Exception:
                pass
            finally:
                req.close()

        return StreamingResponse(iterfile(), media_type=content_type)
    except Exception as e:
        return {"error": str(e)}

@router.get("/status")
async def get_status():
    return {"status": "ok", "message": "DRISHTI AI Backend is running"}

@router.get("/api/cameras")
async def get_cameras(current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SECURITY_OPERATOR, RoleEnum.INVESTIGATOR]))):
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
async def get_incidents(current_user: dict = Depends(get_current_user)):
    # Return mock incidents for now
    return []

# We'll add SSE or WebSocket endpoint for live stream later
