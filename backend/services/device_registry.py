import uuid
import datetime
from schemas.device import DeviceRegisterReq, DeviceStatusEnum
from schemas.blockchain import TransactionTypeEnum
from services.db_manager import db_manager
from services.blockchain_service import blockchain_service
from services.auth_service import log_security_event

class DeviceRegistry:
    def register_device(self, req: DeviceRegisterReq) -> str:
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        
        device_id = "dev-" + str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        
        cursor.execute('''
            INSERT INTO devices 
            (device_id, device_name, device_type, manufacturer, model, serial_number, 
             assigned_zone, network_identifier, public_key, status, registration_timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            device_id, req.device_name, req.device_type.value, req.manufacturer, req.model, 
            req.serial_number, req.assigned_zone, req.network_identifier, req.public_key, 
            DeviceStatusEnum.PENDING.value, now
        ))
        conn.commit()
        conn.close()
        
        blockchain_service.register_transaction(device_id, "DEVICE", TransactionTypeEnum.DEVICE_REGISTRATION, {"device_id": device_id, "public_key": req.public_key})
        return device_id

    def update_status(self, device_id: str, status: DeviceStatusEnum, admin_id: str, reason: str = ""):
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        now = datetime.datetime.utcnow().isoformat()
        
        if status in [DeviceStatusEnum.REVOKED, DeviceStatusEnum.COMPROMISED]:
            cursor.execute("UPDATE devices SET status = ?, revoked_at = ?, revocation_reason = ? WHERE device_id = ?", (status.value, now, reason, device_id))
            log_security_event(admin_id, "DEVICE_REVOKED", "CRITICAL", f"Device {device_id} revoked. Reason: {reason}")
            blockchain_service.register_transaction(device_id, "DEVICE", TransactionTypeEnum.DEVICE_REVOCATION, {"device_id": device_id, "reason": reason})
        else:
            cursor.execute("UPDATE devices SET status = ? WHERE device_id = ?", (status.value, device_id))
            
        conn.commit()
        conn.close()

    def heartbeat(self, device_id: str):
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        now = datetime.datetime.utcnow().isoformat()
        
        cursor.execute("SELECT status FROM devices WHERE device_id = ?", (device_id,))
        device = cursor.fetchone()
        
        if not device:
            conn.close()
            log_security_event("UNKNOWN", "UNKNOWN_DEVICE_HEARTBEAT", "HIGH", f"Heartbeat from unregistered device {device_id}")
            return False
            
        if device['status'] in [DeviceStatusEnum.REVOKED.value, DeviceStatusEnum.COMPROMISED.value]:
            conn.close()
            log_security_event("SYSTEM", "REVOKED_DEVICE_ACCESS", "CRITICAL", f"Heartbeat from revoked device {device_id}")
            return False
            
        cursor.execute("UPDATE devices SET last_heartbeat = ? WHERE device_id = ?", (now, device_id))
        conn.commit()
        conn.close()
        return True

    def get_all(self):
        conn = db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices ORDER BY registration_timestamp DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

device_registry = DeviceRegistry()
