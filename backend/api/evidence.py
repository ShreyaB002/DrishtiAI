from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.evidence import ExportRequest, ChainOfCustodyRecord
from schemas.auth import RoleEnum
from services.auth_service import require_role, get_current_user, log_security_event, record_access_audit
from services.evidence_manager import evidence_manager

router = APIRouter()

@router.post("/{evidence_id}/export-request")
async def request_export(
    evidence_id: str,
    req: ExportRequest,
    current_user: dict = Depends(require_role([RoleEnum.INVESTIGATOR, RoleEnum.ADMIN]))
):
    if not req.reason:
        raise HTTPException(status_code=400, detail="Export reason is mandatory")
        
    evidence_manager.add_chain_of_custody(
        evidence_id, "EXPORT_REQUESTED", current_user['id'], current_user['role'], req.reason
    )
    record_access_audit(current_user['id'], current_user['role'], "EXPORT_REQUEST", evidence_id, req.reason)
    return {"message": "Export requested. Pending command authority approval."}

@router.post("/{evidence_id}/approve-export")
async def approve_export(
    evidence_id: str,
    current_user: dict = Depends(require_role([RoleEnum.COMMAND_AUTHORITY, RoleEnum.ADMIN]))
):
    evidence_manager.add_chain_of_custody(
        evidence_id, "EXPORT_APPROVED", current_user['id'], current_user['role'], "Approved by Command Authority"
    )
    record_access_audit(current_user['id'], current_user['role'], "APPROVE_EXPORT", evidence_id)
    # Trigger actual export generation logic here in a real app
    return {"message": "Export approved and generated."}

@router.get("/{evidence_id}/chain-of-custody", response_model=List[ChainOfCustodyRecord])
async def get_chain_of_custody(
    evidence_id: str,
    current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.AUDITOR, RoleEnum.INVESTIGATOR]))
):
    record_access_audit(current_user['id'], current_user['role'], "VIEW_CHAIN_OF_CUSTODY", evidence_id)
    return evidence_manager.get_chain_of_custody(evidence_id)
