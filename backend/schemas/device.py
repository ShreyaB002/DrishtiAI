from pydantic import BaseModel
from typing import Optional
from enum import Enum

class DeviceTypeEnum(str, Enum):
    IP_CAMERA = "IP_CAMERA"
    RTSP_CAMERA = "RTSP_CAMERA"
    THERMAL_CAMERA = "THERMAL_CAMERA"
    DRONE = "DRONE"
    EDGE_PROCESSOR = "EDGE_PROCESSOR"
    SENSOR = "SENSOR"

class DeviceStatusEnum(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    COMPROMISED = "COMPROMISED"
    REVOKED = "REVOKED"
    OFFLINE = "OFFLINE"

class DeviceRegisterReq(BaseModel):
    device_name: str
    device_type: DeviceTypeEnum
    manufacturer: str
    model: str
    serial_number: str
    assigned_zone: str
    network_identifier: str
    public_key: str

class DeviceOut(BaseModel):
    device_id: str
    device_name: str
    device_type: str
    status: str
    last_heartbeat: Optional[str]
    registration_timestamp: str
