# DRISHTI AI

Integrated Border Surveillance & Intelligence Platform.

## 🌟 Overview

DRISHTI AI is an advanced, AI-driven surveillance and intelligence platform designed specifically for continuous border monitoring and high-security perimeter defense. 

It now includes **Military-Grade Cybersecurity** with Zero-Trust Authentication, Role-Based Access Control, Device Trust Registry, and **Blockchain-Backed Tamper-Evident Event Logging**. By integrating multiple state-of-the-art computer vision models, it processes streams from various camera types (IP, RTSP, Thermal, Drone) to detect, track, and analyze objects and activities in real-time. The system generates instant alerts based on customizable security rules, ensuring rapid response to potential threats while maintaining strict chain-of-custody.

## ⚙️ Operating Modes

To ensure 24/7 continuous surveillance under any environmental condition, DRISHTI AI operates seamlessly across **Three Primary Modes**:

1. **Standard Vision**: Processes standard IP/CCTV camera footage. This mode natively supports both regular daytime feeds and Night Vision (or low-light mode).
2. **Thermal Imaging**: Processes moving thermal videos captured by thermal cameras to detect heat signatures in complete darkness, fog, or visually obscured environments.
3. **Drone Image Processing**: Processes moving videos captured by drones for dynamic aerial surveillance and object detection.

## ✨ Core Capabilities & Detection Features

1. **ANPR / Number plate detection and recognition** using IP/RTSP cameras  
2. **Human detection** using IP/RTSP cameras  
3. **Human motion detection**  
4. **People counting** / number of humans in camera feed  
5. **Vehicle detection and identification**  
6. **Intrusion detection**  
7. **Abnormal / suspicious human activity detection**  
8. **Night vision / low-light detection enhancement**  
9. **Thermal imaging detection**  
10. **Thermal-video motion detection**  
11. **Face recognition** using IP/RTSP security cameras  
12. **Drone image processing** / aerial object detection  
13. **Border surveillance system**  
14. **Weapon / firearm / harmful-object detection**  
15. **Violence / fight / physical-conflict detection**  
16. **Virtual fence / perimeter line-crossing intrusion detection**  
17. **Suspicious activity detection at borders**  
18. **Nighttime motion detection at borders**  
19. **Real-time alert generation**  
20. **Event logging and CSV event-log download**

## 🏗️ System Architecture & Modules

The platform is divided into a highly concurrent backend and a responsive frontend dashboard.

### Backend
- **Stream Proxy**: Proxies external video streams securely to the frontend, bypassing CORS restrictions for seamless playback and analysis.
- **Source Manager**: Handles multiple camera streams simultaneously, pulling frames from RTSP/IP cameras.
- **Frame Processor**: Routes frames to various AI adapters based on the camera type and active rules.
- **Event Engine**: Evaluates detections against security rules (e.g., virtual fence breaches, weapon detection) and generates structured events with varying severity levels (LOW, MEDIUM, HIGH, CRITICAL).
- **AI Adapters**: 
  - `CCTV_SENTRY_YOLO12`: Person and general object detection using live IP camera feeds.
  - `Face_Recognition_System`: Identifies known individuals from real-time RTSP streams.
  - `main-gate-alpr`: Automated License Plate Recognition utilizing gate security cameras.
  - `Thermal-Imaging-Object-Detection`: Specialized thermal detection processing live thermal camera data.
  - `LEAF-YOLO`: Aerial and drone-based detection processing live drone video feeds.

### Frontend
A React/Vite based dashboard providing a live command-center view. Features include:
- **Real-time Monitoring**: Incident logs, active camera feeds, and detailed analytics.
- **In-Browser AI Inference**: Integrates TensorFlow.js (`coco-ssd` and `pose-detection`) for real-time edge processing, allowing direct object, vehicle, human, and pose detection inside the browser.
- **Modern UI Design**: A responsive, clean interface tailored for clarity and rapid incident assessment.

## 🚀 Setup & Installation

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Configuration
Copy the `.env.example` file to `.env` in the `backend` folder and adjust the environment variables (database credentials, camera RTSP links, API keys) according to your deployment needs.
