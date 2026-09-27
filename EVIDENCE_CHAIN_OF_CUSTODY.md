# EVIDENCE_CHAIN_OF_CUSTODY.md

## Digital Evidence Handling & Chain of Custody

The integrity of surveillance evidence (e.g., a video clip of a border intrusion) is critical for legal and operational reviews. DrishtiAI implements a strict digital chain of custody.

### 1. Evidence Creation
When the Event Engine flags a CRITICAL event, an `evidence` record is generated.
- A snapshot/clip is saved to disk.
- A SHA-256 hash is computed.
- The hash is sent to the `BlockchainService`.

### 2. Mandatory Auditing
Every interaction with the evidence is recorded in `evidence_chain_of_custody` and anchored to the blockchain:
- `EVIDENCE_CREATED`
- `VIEW_CHAIN_OF_CUSTODY`
- `EXPORT_REQUESTED`
- `EXPORT_APPROVED`

### 3. Two-Person Approval Workflow
To prevent unilateral data exfiltration by a compromised operator account, critical evidence export follows a dual-key protocol:
1. An `INVESTIGATOR` hits the `POST /api/evidence/{id}/export-request` endpoint, providing a mandatory legal reason.
2. A `COMMAND_AUTHORITY` reviews the request and hits `POST /api/evidence/{id}/approve-export`.
3. Only then is the decrypted video stream released.

### 4. Verification
Users can hit `POST /api/blockchain/events/{id}/verify` at any time. The system calculates the current hash of the local file and compares it against the original hash stored on the immutable ledger.
