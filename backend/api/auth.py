import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from schemas.auth import Token, UserOut, UserLogin
from services.db_manager import db_manager
from services.auth_service import (
    verify_password, create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS,
    log_security_event, record_access_audit
)

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = db_manager.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (form_data.username,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        # Log brute force/unknown user attempt
        log_security_event("UNKNOWN", "FAILED_LOGIN", "MEDIUM", f"Failed login for username: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Check if locked
    if user['locked_until'] and datetime.datetime.fromisoformat(user['locked_until']) > datetime.datetime.utcnow():
        conn.close()
        log_security_event(user['id'], "LOCKED_ACCOUNT_LOGIN_ATTEMPT", "HIGH", "Attempt to login to a locked account.")
        raise HTTPException(status_code=403, detail="Account is locked due to multiple failed login attempts.")
        
    if not verify_password(form_data.password, user['password_hash']):
        # Increment failed attempts
        failed_attempts = user['failed_login_attempts'] + 1
        locked_until = None
        if failed_attempts >= 5:
            locked_until = (datetime.datetime.utcnow() + datetime.timedelta(minutes=15)).isoformat()
            log_security_event(user['id'], "ACCOUNT_LOCKOUT", "HIGH", "Account locked due to 5 failed attempts.")
            
        cursor.execute("UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?", 
                       (failed_attempts, locked_until, user['id']))
        conn.commit()
        conn.close()
        log_security_event(user['id'], "FAILED_LOGIN", "LOW", "Incorrect password.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Successful login, reset failed attempts
    cursor.execute("UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?", (user['id'],))
    conn.commit()
    conn.close()

    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    refresh_token = create_access_token(
        data={"sub": user["username"], "type": "refresh"}, 
        expires_delta=datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    # Audit log
    record_access_audit(user['id'], user['role'], "LOGIN", "SYSTEM")

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(id=current_user["id"], username=current_user["username"], role=current_user["role"])

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    record_access_audit(current_user['id'], current_user['role'], "LOGOUT", "SYSTEM")
    return {"message": "Successfully logged out"}
