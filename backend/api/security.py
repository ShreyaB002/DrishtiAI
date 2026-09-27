from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from services.auth_service import require_role, get_current_user
from schemas.auth import RoleEnum
from services.db_manager import db_manager

router = APIRouter()

@router.get("/events")
async def get_security_events(
    limit: int = 50,
    current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SECURITY_OPERATOR, RoleEnum.AUDITOR]))
):
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM security_events ORDER BY detected_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.get("/risk-summary")
async def get_risk_summary(current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.SECURITY_OPERATOR, RoleEnum.AUDITOR]))):
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    
    # Calculate some basic risk metrics
    cursor.execute("SELECT COUNT(*) as count FROM security_events WHERE status = 'NEW' AND severity IN ('HIGH', 'CRITICAL')")
    critical_active = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE failed_login_attempts > 0")
    users_with_failed_logins = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM devices WHERE status IN ('SUSPENDED', 'COMPROMISED', 'REVOKED')")
    compromised_devices = cursor.fetchone()['count']
    
    # Simple risk score out of 100
    risk_score = min(100, (critical_active * 10) + (users_with_failed_logins * 2) + (compromised_devices * 15))
    
    conn.close()
    
    return {
        "overall_risk_score": risk_score,
        "critical_active_incidents": critical_active,
        "users_with_failed_logins": users_with_failed_logins,
        "compromised_devices": compromised_devices,
        "status": "DANGER" if risk_score > 70 else ("WARNING" if risk_score > 30 else "SAFE")
    }
