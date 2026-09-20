import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="DRISHTI AI Backend")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

from services.source_manager import SourceManager
from services.event_store import EventStore
from services.event_engine import EventEngine
from services.frame_processor import FrameProcessor

# Initialize core services
source_manager = SourceManager()
event_store = EventStore()
event_engine = EventEngine(event_store)
frame_processor = FrameProcessor(source_manager, event_engine)

@app.on_event("startup")
async def startup_event():
    logger.info("DRISHTI AI Backend starting up...")
    
    # Mock some sources for demo
    mock_cameras = [
        ("CAM-01", "mock1"), ("CAM-02", "mock2"), ("CAM-03", "mock3"),
        ("CAM-04", "mock4"), ("CAM-05", "mock5"), ("CAM-06", "mock6")
    ]
    for cid, url in mock_cameras:
        source_manager.add_source(cid, url)
        # We don't start the stream yet, frontend will request it or it can be auto-started
        # source_manager.start_stream(cid)
        
    frame_processor.start()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("DRISHTI AI Backend shutting down...")
    frame_processor.stop()
    for cid in source_manager.sources.keys():
        source_manager.stop_stream(cid)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
