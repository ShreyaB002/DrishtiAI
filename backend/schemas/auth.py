from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    SECURITY_OPERATOR = "SECURITY_OPERATOR"
    INVESTIGATOR = "INVESTIGATOR"
    COMMAND_AUTHORITY = "COMMAND_AUTHORITY"
    AUDITOR = "AUDITOR"
    DEVICE_SERVICE = "DEVICE_SERVICE"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    username: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
