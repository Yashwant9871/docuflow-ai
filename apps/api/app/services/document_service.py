from sqlalchemy.orm import Session
from app.models.document import Document
from app.utils.enums import DocumentStatus
from app.services.extraction_service import extract_fields
from app.services.validation_service import validate_document
from app.services.audit_service import log_action
import uuid

def process_document(db: Session, doc: Document, actor_id: uuid.UUID | None) -> Document:
    # 1. Log OCR/Extraction Started
    doc.status = DocumentStatus.PROCESSING
    db.commit()
    log_action(db, actor_id, "Document", str(doc.id), "OCR_STARTED", None, "PROCESSING")

    try:
        # 2. Extract fields
        extract_fields(db, doc)
        doc.status = DocumentStatus.EXTRACTED
        db.commit()
        log_action(db, actor_id, "Document", str(doc.id), "OCR_COMPLETED", "PROCESSING", "EXTRACTED")
    except Exception as e:
        error_msg = str(e)[:1000]
        doc.processing_error = error_msg
        doc.status = DocumentStatus.NEEDS_REVIEW
        db.commit()
        log_action(db, actor_id, "Document", str(doc.id), "OCR_FAILED", "PROCESSING", error_msg)
        return doc

    # 3. Run validation
    final_status = validate_document(db, doc)
    doc.status = final_status
    db.commit()
    
    # Log validation outcome
    action_type = "VALIDATION_COMPLETED" if final_status == DocumentStatus.READY_FOR_APPROVAL else "VALIDATION_FAILED"
    log_action(db, actor_id, "Document", str(doc.id), action_type, "EXTRACTED", final_status.value)

    db.refresh(doc)
    return doc
