from pydantic import BaseModel, ConfigDict, model_validator
from typing import Any

class AuditLogRead(BaseModel):
    id: str
    timestamp: str
    actor: str
    role: str
    entityType: str
    entityId: str
    action: str
    oldValue: str | None = None
    newValue: str | None = None
    ipAddress: str

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def map_fields(cls, data: Any) -> Any:
        if hasattr(data, "id"):
            actor_name = "System"
            role_name = "ADMIN"
            if data.actor:
                actor_name = data.actor.full_name
                if data.actor.roles:
                    role_name = data.actor.roles[0].name
            
            return {
                "id": str(data.id),
                "timestamp": data.created_at.isoformat() if data.created_at else "",
                "actor": actor_name,
                "role": role_name,
                "entityType": data.entity_type,
                "entityId": data.entity_id,
                "action": data.action,
                "oldValue": data.old_value,
                "newValue": data.new_value,
                "ipAddress": data.ip_address or ""
            }
        return data
