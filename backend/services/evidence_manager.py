import uuid
import datetime
import hashlib
from schemas.blockchain import TransactionTypeEnum
from services.db_manager import db_manager
from services.blockchain_service import blockchain_service

class EvidenceManager:
    def add_chain_of_custody(self, evidence_id: str, action: str, actor_id: str, actor_role: str, reason: str = ""):
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        record_id = "coc-" + str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        
        # Get previous hash
        cursor.execute("SELECT current_record_hash FROM evidence_chain_of_custody WHERE evidence_id = ? ORDER BY timestamp DESC LIMIT 1", (evidence_id,))
        row = cursor.fetchone()
        prev_hash = row['current_record_hash'] if row else None
        
        data_to_hash = f"{record_id}{evidence_id}{action}{actor_id}{now}{prev_hash}"
        curr_hash = hashlib.sha256(data_to_hash.encode()).hexdigest()
        
        # Register on blockchain
        tx_id = blockchain_service.register_transaction(
            evidence_id, "EVIDENCE_CHAIN", TransactionTypeEnum.ACCESS_AUDIT, 
            {"record_id": record_id, "action": action, "actor": actor_id, "hash": curr_hash}
        )
        
        cursor.execute('''
            INSERT INTO evidence_chain_of_custody 
            (id, evidence_id, action, actor_id, actor_role, timestamp, reason, previous_record_hash, current_record_hash, blockchain_transaction_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (record_id, evidence_id, action, actor_id, actor_role, now, reason, prev_hash, curr_hash, tx_id))
        
        conn.commit()
        conn.close()
        
    def get_chain_of_custody(self, evidence_id: str):
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM evidence_chain_of_custody WHERE evidence_id = ? ORDER BY timestamp ASC", (evidence_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

evidence_manager = EvidenceManager()
