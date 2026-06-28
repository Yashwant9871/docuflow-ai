from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogRead
from app.models.user import User
import uuid

router = APIRouter()
document_audit_router = APIRouter()

@router.get("/", response_model=list[AuditLogRead])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    return logs

@document_audit_router.get("/{document_id}/audit", response_model=list[AuditLogRead])
def get_document_audit_logs(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).filter(
        AuditLog.entity_type == "Document",
        AuditLog.entity_id == document_id
    ).order_by(AuditLog.created_at.desc()).all()
    return logs
