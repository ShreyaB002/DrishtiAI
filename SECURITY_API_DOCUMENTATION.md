# SECURITY_API_DOCUMENTATION.md

## DrishtiAI Security & Blockchain API

All endpoints (except `/api/auth/login`) require a Bearer token in the `Authorization` header.

### 1. Authentication
- `POST /api/auth/login`: Accepts `username` and `password` (form-data). Returns `access_token` and `refresh_token`.
- `POST /api/auth/logout`: Invalidates the session.
- `GET /api/auth/me`: Returns current user info and role.

### 2. Device Trust Registry
- `POST /api/devices`: Register a new device. Requires `ADMIN` role. Returns `device_id`.
- `GET /api/devices`: List all devices and their trust status.
- `POST /api/devices/{id}/approve`: Mark a device as trusted (`ACTIVE`).
- `POST /api/devices/{id}/suspend`: Temporarily block a device.
- `POST /api/devices/{id}/revoke`: Permanently revoke a compromised device.

### 3. Security Monitoring
- `GET /api/security/events`: Fetch a list of active cyber incidents (e.g. brute force, unauthorized access).
- `GET /api/security/risk-summary`: Get real-time risk scores and threat metrics.

### 4. Blockchain & Audit
- `GET /api/blockchain/transactions`: View the immutable audit ledger.
- `POST /api/blockchain/events/{id}/verify`: Send a `current_hash` to compare against the ledger. Returns `verified: true/false`.

### 5. Evidence
- `POST /api/evidence/{id}/export-request`: Initiates an export workflow (Requires `reason`).
- `POST /api/evidence/{id}/approve-export`: Command authority approval.
- `GET /api/evidence/{id}/chain-of-custody`: Retrieves the chronological sequence of interactions with the evidence.
