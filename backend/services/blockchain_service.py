import os
import hashlib
import json
import uuid
import datetime
from schemas.blockchain import TransactionTypeEnum
from services.db_manager import db_manager
import logging

logger = logging.getLogger(__name__)

MODE = os.getenv("BLOCKCHAIN_MODE", "MOCK")

class BlockchainService:
    def __init__(self):
        self.mode = MODE

    def _hash_data(self, data: dict) -> str:
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_str.encode('utf-8')).hexdigest()
        
    def _get_latest_transaction_hash(self) -> str:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT hash FROM blockchain_transactions ORDER BY timestamp DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        return row['hash'] if row else None

    def register_transaction(self, entity_id: str, entity_type: str, tx_type: TransactionTypeEnum, data_to_hash: dict, meta: dict = None) -> str:
        data_hash = self._hash_data(data_to_hash)
        tx_id = "tx-" + str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        
        if self.mode == "MOCK":
            prev_hash = self._get_latest_transaction_hash()
            # In mock mode, we just save it to local DB to simulate ledger
            conn = db_manager.get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO blockchain_transactions 
                (transaction_id, entity_id, entity_type, transaction_type, hash, previous_hash, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (tx_id, entity_id, entity_type, tx_type.value, data_hash, prev_hash, now, json.dumps(meta) if meta else None))
            conn.commit()
            conn.close()
            logger.info(f"[MOCK_BLOCKCHAIN] Registered {tx_type.value} for {entity_id} with tx_id {tx_id}")
            return tx_id
        else:
            # Prepare interface for Hyperledger Fabric or permissioned chain
            logger.info(f"[PERMISSIONED_BLOCKCHAIN] Mock invocation for {tx_type.value}. Must be implemented via Chaincode.")
            return tx_id

    def verify_hash(self, transaction_id: str, current_hash: str) -> dict:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM blockchain_transactions WHERE transaction_id = ?", (transaction_id,))
        tx = cursor.fetchone()
        conn.close()
        
        now = datetime.datetime.utcnow().isoformat()
        if not tx:
            return {
                "verified": False,
                "verification_status": "NOT_FOUND",
                "mismatch_reason": "Transaction not found on ledger",
                "blockchain_transaction_id": transaction_id,
                "original_hash": "UNKNOWN",
                "current_hash": current_hash,
                "verification_timestamp": now
            }
            
        original_hash = tx['hash']
        verified = (original_hash == current_hash)
        return {
            "verified": verified,
            "verification_status": "VERIFIED" if verified else "TAMPERED",
            "mismatch_reason": None if verified else "Hash mismatch. Data has been modified.",
            "blockchain_transaction_id": transaction_id,
            "original_hash": original_hash,
            "current_hash": current_hash,
            "verification_timestamp": now
        }
        
    def get_transaction(self, transaction_id: str):
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM blockchain_transactions WHERE transaction_id = ?", (transaction_id,))
        tx = cursor.fetchone()
        conn.close()
        return dict(tx) if tx else None

    def get_audit_history(self, limit: int = 100):
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM blockchain_transactions ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

blockchain_service = BlockchainService()
