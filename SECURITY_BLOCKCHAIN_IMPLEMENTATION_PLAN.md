# SECURITY_BLOCKCHAIN_IMPLEMENTATION_PLAN.md

## 1. Existing Architecture Summary
DrishtiAI currently features a **FastAPI backend** managing RTSP/IP camera streams, passing them through an `EventEngine` and AI models (`FrameProcessor`). Events are saved to a local **SQLite database** (`drishti.db`) using `EventStore`. 
The **Frontend** is a React/Vite application that provides a real-time command center interface.
There is currently no authentication, device trust verification, or blockchain integration. 

## 2. Files to be Modified
- `backend/main.py`: Add authentication middlewares, route registrations, and initialize new security/blockchain services.
- `backend/api/routes.py`: Update existing routes to require authentication, role checks, and access auditing.
- `backend/services/event_store.py`: Add initialization and operations for new security/blockchain tables.
- `backend/schemas/event.py`: Augment the `Event` model with blockchain fields like `evidence_hash`, `blockchain_transaction_id`, etc.
- `backend/frontend/src/App.tsx`: Implement frontend routing, wrapping the application in an `AuthProvider` and adding protected routes.
- `.env.example` / `docker-compose.yml`: Add secrets, JWT configurations, and blockchain mode configurations.

## 3. Files to be Added
**Backend:**
- `backend/api/auth.py`, `backend/api/devices.py`, `backend/api/blockchain.py`, `backend/api/evidence.py`, `backend/api/models.py`, `backend/api/security.py`
- `backend/services/auth_service.py` (JWT, role validation)
- `backend/services/blockchain_service.py` (Mock/Permissioned modes, hashing, verification)
- `backend/services/device_registry.py` (Device status, approvals, heartbeats)
- `backend/services/security_monitor.py` (Anomaly detection, rate limits, risk scoring)
- `backend/services/evidence_manager.py` (Chain-of-custody, export approval)
- `backend/schemas/auth.py`, `backend/schemas/blockchain.py`, `backend/schemas/device.py`, `backend/schemas/security.py`, `backend/schemas/evidence.py`, `backend/schemas/model.py`

**Frontend:**
- `backend/frontend/src/contexts/AuthContext.tsx`
- `backend/frontend/src/pages/Login.tsx`
- `backend/frontend/src/pages/SecurityDashboard.tsx`
- `backend/frontend/src/pages/DeviceRegistry.tsx`
- `backend/frontend/src/pages/BlockchainAudit.tsx`
- `backend/frontend/src/pages/EvidenceVerification.tsx`
- `backend/frontend/src/pages/AccessLogs.tsx`
- `backend/frontend/src/pages/AIModelRegistry.tsx`

## 4. Database Changes (SQLite)
New tables to be created in `drishti.db`:
- `users`: id, username, password_hash, role
- `roles_permissions`: mapping of roles to explicit actions
- `sessions`: id, user_id, refresh_token, expires_at
- `devices`: device_id, type, serial_number, public_key, status, last_heartbeat
- `security_events`: event_id, event_type, severity, source_ip, resolved_at, risk_score
- `blockchain_transactions`: transaction_id, entity_id, entity_type, transaction_type, hash, previous_hash
- `evidence`: evidence_id, file_path, sha256_hash, retention_until, status
- `evidence_chain_of_custody`: id, evidence_id, action, actor_id, timestamp, hash
- `access_audit_logs`: id, user_id, action, resource, timestamp, reason
- `ai_model_registry`: model_id, hash, version, status
- `security_policies`: policy_name, policy_value

## 5. API Changes
Implement robust REST APIs:
- `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`
- `POST /api/devices`, `POST /api/devices/{id}/approve` (Device Registration Workflow)
- `GET /api/security/events`, `GET /api/security/risk-summary` (Monitoring)
- `GET /api/blockchain/transactions`, `POST /api/blockchain/events/{id}/verify` (Blockchain)
- `POST /api/evidence/{id}/export-request`, `GET /api/evidence/{id}/chain-of-custody` (Evidence)

## 6. Frontend Changes
- Build Login UI and add a persistent navigation menu for Security, Devices, Blockchain, and Evidence.
- Add real-time risk scores and active cyber incidents to a Security Dashboard.
- Provide a `Verify` button on evidence panels to compute the local hash and compare it with the blockchain ledger.

## 7. Blockchain Integration Approach
- Implement an abstract `BlockchainService`.
- **MOCK_BLOCKCHAIN** Mode: Local deterministic hashing and storage in `blockchain_transactions` table with full tamper-evident verification.
- **PERMISSIONED_BLOCKCHAIN** Mode: Ready-to-connect interface designed for Hyperledger Fabric (via chaincode invocation).
- Strict rule: Only hashes, metadata, and timestamps go on-chain. Videos/images remain on the filesystem/encrypted storage.

## 8. Testing Approach
- Unit test suite for `BlockchainService` hashing consistency and tampering detection.
- Unit test suite for `AuthService` RBAC limitations and JWT expiration.
- End-to-End Mock Tampering Test: Register event -> Hash evidence -> Mutate file locally -> Verify hash mismatch detection.

## 9. Local Setup Instructions
- Modify `.env` with `JWT_SECRET`, `BLOCKCHAIN_MODE=MOCK`, and `SECURITY_RISK_THRESHOLD`.
- Setup backend virtual env and install dependencies (e.g. `passlib`, `python-jose`, `bcrypt`).
- Run `main.py` which will execute SQLite DB migrations.
- Build frontend via `npm run dev` and login with a seeded admin account (e.g., `admin / admin123`).
