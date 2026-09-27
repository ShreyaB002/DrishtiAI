# THREAT_MODEL.md

## DrishtiAI Threat Model

### 1. Threats Addressed

**T1. Unauthorized Access**
- **Threat**: An attacker attempts to view sensitive border camera feeds or export evidence without permission.
- **Control**: Role-Based Access Control (RBAC) via JWT. Enforced on all backend routes. Users are limited to explicit roles (e.g., `INVESTIGATOR` cannot approve their own exports).

**T2. Device Spoofing (Compromised Edge Cameras)**
- **Threat**: An attacker connects a rogue device to the network to feed false video streams or flood the event engine.
- **Control**: Device Trust Registry. Every device must be registered and explicitly approved by an ADMIN. Devices missing a heartbeat or reporting invalid credentials are SUSPENDED.

**T3. Evidence Tampering**
- **Threat**: A malicious insider or attacker modifies an exported video clip to remove an intruder or a weapon.
- **Control**: Blockchain-Backed Hashing. The SHA-256 hash of the evidence is anchored to the ledger at generation. The `Verify` endpoint detects any mismatch.

**T4. Brute Force Attacks**
- **Threat**: Repeated password guessing against an operator account.
- **Control**: Account Lockout policy (5 failed attempts locks the account). Logged as a `HIGH` severity cyber event.

**T5. API Abuse / Privilege Escalation**
- **Threat**: An operator tries to invoke an admin API to revoke a device.
- **Control**: `require_role()` dependency on every API endpoint. Unauthorized access attempts trigger an audit log and return HTTP 403.

### 2. Failure Behaviors
- If the blockchain service is offline in permissioned mode, the application will queue the hash in the local SQLite fallback and mark the status as `PENDING_LEDGER`.
- If a token expires, the client is forced to use the refresh token or re-authenticate.
