# BLOCKCHAIN_ARCHITECTURE.md

## DrishtiAI Blockchain Integration Architecture

### 1. Hybrid Storage Strategy
DrishtiAI operates in high-security, sensitive environments. To comply with privacy laws and data minimization principles:
- **Off-Chain (Encrypted Storage/DB)**: Raw IP/thermal camera videos, faces, license plates, biometric metadata, and PII.
- **On-Chain (Blockchain Ledger)**: Cryptographic hashes (SHA-256) of evidence, timestamps, device IDs, AI model versions, and audit logs.

### 2. Operational Modes
The `BlockchainService` abstracts the ledger implementation, supporting two modes via the `BLOCKCHAIN_MODE` environment variable:

**A. MOCK_BLOCKCHAIN (Development/Demo Mode)**
- Stores transactions in the local `blockchain_transactions` SQLite table.
- Simulates an immutable ledger by strictly enforcing append-only operations and linking `previous_hash` chains.
- Perfect for SIH presentations to prove the concept of tamper-evidence without deploying a full network.

**B. PERMISSIONED_BLOCKCHAIN (Production Mode)**
- Designed to integrate with a Hyperledger Fabric or Enterprise Ethereum network.
- The `register_transaction` method acts as a gRPC client to invoke chaincode.
- Suitable for multi-agency consortiums (e.g., BSF, Local Police, Intelligence) where no single agency fully controls the ledger.

### 3. Smart Contract / Chaincode Data Structure
```json
{
  "transaction_id": "tx-1234",
  "entity_id": "event-999",
  "entity_type": "EVIDENCE_HASH",
  "hash": "a8c9b...d5f",
  "timestamp": "2026-09-27T10:00:00Z"
}
```
*Notice: No sensitive context is included.*
