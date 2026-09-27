import os
import uuid
import datetime
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from services.db_manager import db_manager
from schemas.auth import TokenData, RoleEnum
import logging

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-development-key-please-change")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception
        
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (token_data.username,))
    user = cursor.fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return dict(user)

def require_role(allowed_roles: list[RoleEnum]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in [r.value for r in allowed_roles]:
            # Log this unauthorized access attempt
            log_security_event(current_user["id"], "UNAUTHORIZED_ACCESS", "HIGH", f"Attempted to access restricted resource. Requires: {allowed_roles}")
            raise HTTPException(status_code=403, detail="Operation not permitted for this role")
        return current_user
    return role_checker

def log_security_event(user_id, event_type, severity, description):
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    event_id = "sec-" + str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    cursor.execute('''
        INSERT INTO security_events (security_event_id, event_type, severity, user_id, description, detected_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (event_id, event_type, severity, user_id, description, now, "NEW"))
    conn.commit()
    conn.close()
    
def record_access_audit(user_id, role, action, resource, reason=""):
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    audit_id = "aud-" + str(uuid.uuid4())
    now = datetime.datetime.utcnow().isoformat()
    cursor.execute('''
        INSERT INTO access_audit_logs (id, user_id, role, action, resource, timestamp, reason)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (audit_id, user_id, role, action, resource, now, reason))
    conn.commit()
    conn.close()
