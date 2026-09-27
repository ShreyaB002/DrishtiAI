from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.blockchain import VerificationRequest, VerificationResponse, BlockchainTransaction
from services.auth_service import get_current_user, require_role
from schemas.auth import RoleEnum
from services.blockchain_service import blockchain_service

router = APIRouter()

@router.get("/status")
async def get_status(current_user: dict = Depends(get_current_user)):
    return {"status": "ONLINE", "mode": blockchain_service.mode}

@router.get("/transactions", response_model=List[BlockchainTransaction])
async def get_transactions(
    current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.AUDITOR]))
):
    return blockchain_service.get_audit_history()

@router.get("/transactions/{transaction_id}", response_model=BlockchainTransaction)
async def get_transaction(
    transaction_id: str,
    current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.AUDITOR]))
):
    tx = blockchain_service.get_transaction(transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.post("/events/{event_id}/verify", response_model=VerificationResponse)
async def verify_event(
    event_id: str,
    req: VerificationRequest,
    current_user: dict = Depends(get_current_user)
):
    from services.db_manager import db_manager
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT blockchain_transaction_id FROM security_events WHERE security_event_id = ?", (event_id,))
    row = cursor.fetchone()
    
    if not row:
        # Fallback to events
        cursor.execute("SELECT blockchain_transaction_id FROM events WHERE event_id = ?", (event_id,))
        row = cursor.fetchone()
        
    conn.close()
    
    if not row or not row['blockchain_transaction_id']:
        raise HTTPException(status_code=404, detail="No blockchain transaction linked to this event")
        
    tx_id = row['blockchain_transaction_id']
    return blockchain_service.verify_hash(tx_id, req.current_hash)
