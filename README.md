# DRISHTI AI

Integrated Border Surveillance & Intelligence Platform.

## Setup

1. **Backend**:
   - `cd backend`
   - `python3 -m venv venv`
   - `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
   - `pip install -r requirements.txt`
   - `python main.py`

2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Configuration

Copy `.env.example` to `.env` in the `backend` folder and adjust settings.

## Modules

The following AI modules are integrated as adapters:
- **CCTV_SENTRY_YOLO12**: Person detection (simulated in POC)
- **Face_Recognition_System**: Face recognition (simulated in POC)
- **main-gate-alpr**: Vehicle plate detection (simulated in POC)
- **Thermal-Imaging-Object-Detection**: Thermal detection (simulated in POC)
- **LEAF-YOLO**: Drone detection (simulated in POC)
