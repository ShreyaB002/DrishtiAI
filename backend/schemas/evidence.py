from pydantic import BaseModel
from typing import Optional

class ExportRequest(BaseModel):
    reason: str

class ChainOfCustodyRecord(BaseModel):
    id: str
    action: str
    actor_id: str
    actor_role: str
    timestamp: str
    reason: Optional[str]
    blockchain_transaction_id: Optional[str]
