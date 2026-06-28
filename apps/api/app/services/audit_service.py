from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
import uuid
from datetime import datetime, timezone

def log_action(
    db: Session,
    actor_id: uuid.UUID | None,
    entity_type: str,
    entity_id: str,
    action: str,
    old_value: str | None = None,
    new_value: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    entry = AuditLog(
        id=uuid.uuid4(),
        actor_id=actor_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address or "127.0.0.1",
        created_at=datetime.now(timezone.utc),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
