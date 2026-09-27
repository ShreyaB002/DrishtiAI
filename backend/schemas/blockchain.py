from pydantic import BaseModel
from typing import Optional, Any
from enum import Enum

class TransactionTypeEnum(str, Enum):
    EVENT_REGISTRATION = "EVENT_REGISTRATION"
    EVIDENCE_HASH = "EVIDENCE_HASH"
    DEVICE_REGISTRATION = "DEVICE_REGISTRATION"
    DEVICE_REVOCATION = "DEVICE_REVOCATION"
    ACCESS_AUDIT = "ACCESS_AUDIT"
    MODEL_REGISTRATION = "MODEL_REGISTRATION"

class BlockchainModeEnum(str, Enum):
    MOCK = "MOCK"
    PERMISSIONED = "PERMISSIONED"

class BlockchainTransaction(BaseModel):
    transaction_id: str
    entity_id: str
    entity_type: str
    transaction_type: TransactionTypeEnum
    hash: str
    previous_hash: Optional[str]
    timestamp: str
    metadata: Optional[str]

class VerificationRequest(BaseModel):
    current_hash: str

class VerificationResponse(BaseModel):
    verified: bool
    verification_status: str
    mismatch_reason: Optional[str]
    blockchain_transaction_id: str
    original_hash: str
    current_hash: str
    verification_timestamp: str
