# SECURITY_BLOCKCHAIN_DEMO.md

## DrishtiAI Cyber & Blockchain Demonstration Guide

This guide explains how to showcase the newly integrated cybersecurity and blockchain capabilities during an SIH presentation.

### 1. Local Startup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Note: On first startup, the application will create `drishti.db` with all security tables and seed a default admin user.*

**Frontend:**
```bash
cd backend/frontend
npm install
npm run dev
```

### 2. Mock Blockchain Mode
Ensure that `.env` in the `backend` directory contains:
```env
BLOCKCHAIN_MODE=MOCK
JWT_SECRET=your_jwt_secret
```
This mode uses cryptographic hashing (SHA-256) and stores simulated ledger transactions locally to prove tamper-evidence without needing a full Hyperledger deployment on stage.

### 3. Demo Login
Access the frontend at `http://localhost:5173/`. 
The system is protected by Zero-Trust RBAC. Use the local-only credentials:
- **Username**: `admin`
- **Password**: `admin123`

### 4. Device Registration
1. In a real scenario, cameras send a registration request. The mock backend automatically sets up mock cameras.
2. In the `Device Trust Registry` (via API or future UI), the admin must approve a device before it can stream. Unapproved devices are dropped.

### 5. Incident & Evidence Generation
1. Click `START INFERENCE` in the Surveillance tab.
2. When the AI detects an intrusion, it generates an event. 
3. The event hash and metadata are automatically anchored to the `BlockchainAudit` ledger.

### 6. Simulating Tampering & Verification
1. Navigate to the **Audit** tab.
2. Identify an event's hash. 
3. (In the database or manually via the API), modify the evidence file. 
4. Trigger the Verify API Endpoint. It will recalculate the hash, compare it against the Blockchain Ledger, and return a `TAMPERED` status, proving the evidence was modified.

### 7. View Blockchain Audit History
1. Click the **Audit** tab in the navigation bar. 
2. You will see every `LOGIN`, `REGISTER_DEVICE`, `EVENT_REGISTRATION`, and `ACCESS_AUDIT` securely recorded.

### 8. Explain Architecture to the Jury
- We use a **Permissioned Blockchain Architecture (Mocked)**. 
- **Privacy Model**: Raw video is kept off-chain on encrypted local storage. Only hashes, timestamps, and permissions are stored on-chain.
- **Cybersecurity**: Every interaction has a JWT-based RBAC verification, and anomalous device requests trigger a Risk Score increase shown in the **Security** tab.
