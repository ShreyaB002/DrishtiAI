from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.device import DeviceRegisterReq, DeviceOut, DeviceStatusEnum
from schemas.auth import RoleEnum
from services.auth_service import require_role, get_current_user, record_access_audit
from services.device_registry import device_registry

router = APIRouter()

@router.post("", response_model=dict)
async def register_device(
    req: DeviceRegisterReq,
    current_user: dict = Depends(require_role([RoleEnum.ADMIN]))
):
    device_id = device_registry.register_device(req)
    record_access_audit(current_user['id'], current_user['role'], "REGISTER_DEVICE", device_id)
    return {"device_id": device_id, "status": "PENDING"}

@router.get("", response_model=List[DeviceOut])
async def get_devices(current_user: dict = Depends(get_current_user)):
    return device_registry.get_all()

@router.post("/{device_id}/approve")
async def approve_device(
    device_id: str,
    current_user: dict = Depends(require_role([RoleEnum.ADMIN]))
):
    device_registry.update_status(device_id, DeviceStatusEnum.ACTIVE, current_user['id'])
    record_access_audit(current_user['id'], current_user['role'], "APPROVE_DEVICE", device_id)
    return {"message": "Device approved"}

@router.post("/{device_id}/suspend")
async def suspend_device(
    device_id: str,
    current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SECURITY_OPERATOR]))
):
    device_registry.update_status(device_id, DeviceStatusEnum.SUSPENDED, current_user['id'])
    record_access_audit(current_user['id'], current_user['role'], "SUSPEND_DEVICE", device_id)
    return {"message": "Device suspended"}

@router.post("/{device_id}/revoke")
async def revoke_device(
    device_id: str,
    reason: str,
    current_user: dict = Depends(require_role([RoleEnum.ADMIN]))
):
    device_registry.update_status(device_id, DeviceStatusEnum.REVOKED, current_user['id'], reason)
    record_access_audit(current_user['id'], current_user['role'], "REVOKE_DEVICE", device_id, reason)
    return {"message": "Device revoked"}

@router.post("/{device_id}/heartbeat")
async def device_heartbeat(device_id: str):
    # In a real system, this should be protected by mutual TLS or a device token
    success = device_registry.heartbeat(device_id)
    if not success:
        raise HTTPException(status_code=403, detail="Device unauthorized or revoked")
    return {"status": "ok"}
