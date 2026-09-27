from fastapi import APIRouter, Depends
from typing import List
from schemas.auth import RoleEnum
from services.auth_service import require_role
from services.db_manager import db_manager

router = APIRouter()

@router.get("")
async def get_models(current_user: dict = Depends(require_role([RoleEnum.ADMIN, RoleEnum.AUDITOR]))):
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ai_model_registry")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# In a full implementation, we would add POST /register, POST /{model_id}/approve, etc.
