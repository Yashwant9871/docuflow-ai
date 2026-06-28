from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.rbac import require_roles
from app.core.config import settings
from app.models.document import Document
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.extracted_field import ExtractedField
from app.models.validation_result import ValidationResult
from app.models.audit_log import AuditLog
from app.models.approval_action import ApprovalAction
from app.models.user import User
from app.utils.enums import DocumentStatus, FieldStatus, ValidationStatus, Priority, AuditAction
from app.schemas.document import DocumentRead, DocumentUploadResponse, ExtractedFieldRead, ValidationResultRead, AuditEventRead
from app.services.audit_service import log_action
from app.services.document_service import process_document
from app.services.validation_service import validate_document
import uuid
import os
from typing import Any
from datetime import datetime, date, timezone
from decimal import Decimal

router = APIRouter()

def _friendly_timeline_message(action: str, actor_name: str) -> str:
    mapping = {
        "USER_LOGIN": "User logged in",
        "DOCUMENT_UPLOADED": "Document uploaded",
        "DOCUMENT_PROCESSED": "Field extraction started",
        "EXTRACTED": "Field extraction completed",
        "VALIDATION_RUN": "Validation rules executed",
        "VALIDATED": "All validation rules passed",
        "FIELD_CORRECTED": "Extracted fields corrected",
        "SENT_TO_REVIEW": "Sent to review queue",
        "APPROVED": "Invoice approved",
        "REJECTED": "Invoice rejected",
        "EXPORTED": "Exported to ERP",
    }
    return mapping.get(action, f"{action.replace('_', ' ').capitalize()}")

def _serialize_document(doc: Document, db: Session) -> DocumentRead:
    # 1. Fetch timeline logs
    logs = db.query(AuditLog).filter(
        AuditLog.entity_type == "Document",
        AuditLog.entity_id == str(doc.id)
    ).order_by(AuditLog.created_at.asc()).all()

    timeline_events = []
    for log in logs:
        actor_name = "System"
        role_name = "ADMIN"
        if log.actor:
            actor_name = log.actor.full_name
            if log.actor.roles:
                role_name = log.actor.roles[0].name
        
        timeline_events.append(
            AuditEventRead(
                id=str(log.id),
                timestamp=log.created_at.isoformat(),
                actor=actor_name,
                role=role_name,
                action=log.action,
                message=log.new_value or _friendly_timeline_message(log.action, actor_name)
            )
        )

    # 2. Map extracted fields
    extracted_fields = []
    for f in doc.extracted_fields:
        extracted_fields.append(
            ExtractedFieldRead(
                field=f.field_name,
                value=f.field_value or "",
                confidence=f.confidence,
                source=f.source,
                correctedValue=f.corrected_value,
                status=f.status
            )
        )

    # 3. Map validation results
    validation_results = []
    issue_count = 0
    for r in doc.validation_results:
        if r.status == ValidationStatus.FAILED:
            issue_count += 1
        validation_results.append(
            ValidationResultRead(
                rule=r.rule_name,
                severity=r.severity,
                status=r.status,
                expected=r.expected_value or "",
                actual=r.actual_value or "",
                message=r.message or ""
            )
        )

    return DocumentRead(
        id=str(doc.id),
        number=doc.document_number,
        vendor=doc.vendor.name if doc.vendor else "Globex Components",
        vendorId=str(doc.vendor_id) if doc.vendor_id else "v0",
        poNumber=doc.purchase_order.po_number if doc.purchase_order else "—",
        invoiceDate=doc.invoice_date.strftime("%Y-%m-%d") if doc.invoice_date else "",
        dueDate=doc.due_date.strftime("%Y-%m-%d") if doc.due_date else "",
        amount=float(doc.total_amount) if doc.total_amount is not None else 0.0,
        currency=doc.currency,
        status=doc.status,
        confidence=doc.confidence_score if doc.confidence_score is not None else 0.0,
        assignedTo=doc.assigned_reviewer.full_name if doc.assigned_reviewer else "Review User",
        assignedApprover=doc.assigned_approver.full_name if doc.assigned_approver else "Approval User",
        uploadedBy=doc.uploaded_by.full_name if doc.uploaded_by else "Process User",
        uploadedOn=doc.created_at.strftime("%Y-%m-%d") if doc.created_at else "",
        priority=doc.priority,
        issueCount=issue_count,
        scenario=doc.scenario or "Newly uploaded",
        rawText=doc.raw_text,
        processingError=doc.processing_error,
        reviewerNotes=doc.reviewer_notes,
        isOcrSimulated=doc.is_ocr_simulated,
        extractedFields=extracted_fields,
        validationResults=validation_results,
        timeline=timeline_events
    )

@router.post("/upload", response_model=DocumentUploadResponse)
def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("Invoice"),
    vendor_id: str | None = Form(None),
    purchase_order_id: str | None = Form(None),
    notes: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("PROCESSOR", "ADMIN"))
):
    # Save the file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = uuid.uuid4()
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{file_ext}")
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Generate document number
    import random
    doc_num = f"INV-2026-{random.randint(1000, 9999)}"

    # Parse IDs
    v_id = uuid.UUID(vendor_id) if vendor_id and vendor_id != "v0" else None
    po_id = uuid.UUID(purchase_order_id) if purchase_order_id and purchase_order_id != "po0" else None

    # Guess dates & amounts for stub
    today = date.today()
    due = date(today.year, today.month + 1, today.day) if today.month < 12 else date(today.year + 1, 1, today.day)

    # Let's check PO if po_id exists
    po = None
    if po_id:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()

    # Guess total amount (if po exists, maybe PO amount, otherwise random)
    total_amt = Decimal(random.randint(1000, 9999))
    if po:
        total_amt = Decimal(round(float(po.remaining_amount) * 0.5, 2))

    # Reviewer & Approver
    reviewer = db.query(User).filter(User.email == "reviewer@docuflow.ai").first()
    approver = db.query(User).filter(User.email == "approver@docuflow.ai").first()

    doc = Document(
        id=file_id,
        document_number=doc_num,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path,
        vendor_id=v_id,
        purchase_order_id=po_id,
        status=DocumentStatus.UPLOADED,
        uploaded_by_id=current_user.id,
        assigned_reviewer_id=reviewer.id if reviewer else None,
        assigned_approver_id=approver.id if approver else None,
        total_amount=total_amt,
        currency="USD",
        invoice_date=today,
        due_date=due,
        confidence_score=0.90,
        priority=Priority.MEDIUM,
        scenario="Newly uploaded"
    )

    db.add(doc)
    db.commit()

    log_action(db, current_user.id, "Document", str(doc.id), "DOCUMENT_UPLOADED", None, f"Document uploaded: {file.filename}")

    return DocumentUploadResponse(
        id=str(doc.id),
        number=doc.document_number,
        status=doc.status
    )

@router.get("/", response_model=list[DocumentRead])
def get_all_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(Document).all()
    return [_serialize_document(d, db) for d in docs]

@router.get("/{document_id}", response_model=DocumentRead)
def get_document_by_id(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _serialize_document(doc, db)

@router.post("/{document_id}/process", response_model=DocumentRead)
def process_doc(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("PROCESSOR", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    updated_doc = process_document(db, doc, current_user.id)
    return _serialize_document(updated_doc, db)

@router.get("/{document_id}/extraction", response_model=list[ExtractedFieldRead])
def get_doc_extraction(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
         raise HTTPException(status_code=404, detail="Document not found")
    return [
        ExtractedFieldRead(
            field=f.field_name,
            value=f.field_value or "",
            confidence=f.confidence,
            source=f.source,
            correctedValue=f.corrected_value,
            status=f.status
        ) for f in doc.extracted_fields
    ]

@router.patch("/{document_id}/fields", response_model=DocumentRead)
def patch_doc_fields(
    document_id: str,
    body: dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("REVIEWER", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # If it's a status update, like from updateDocumentStatus
    if "status" in body:
        old_status = doc.status.value
        new_status = body["status"]
        doc.status = new_status
        db.commit()
        log_action(db, current_user.id, "Document", str(doc.id), "STATUS_CHANGED", old_status, new_status)
        return _serialize_document(doc, db)

    # Otherwise it might be field corrections
    # We accept correction values
    for field_name, val in body.items():
        field = db.query(ExtractedField).filter(
            ExtractedField.document_id == doc.id,
            ExtractedField.field_name == field_name
        ).first()
        if field:
            field.is_corrected = True
            field.corrected_value = str(val)
            field.status = FieldStatus.CORRECTED
            field.corrected_by_id = current_user.id
            log_action(db, current_user.id, "Document", str(doc.id), "FIELD_CORRECTED", field.field_value, str(val))

    db.commit()
    db.refresh(doc)
    return _serialize_document(doc, db)

@router.post("/{document_id}/validate", response_model=list[ValidationResultRead])
def run_validate_doc(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("REVIEWER", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    final_status = validate_document(db, doc)
    doc.status = final_status
    db.commit()
    log_action(db, current_user.id, "Document", str(doc.id), "VALIDATION_RUN", None, final_status.value)
    
    return [
        ValidationResultRead(
            rule=r.rule_name,
            severity=r.severity,
            status=r.status,
            expected=r.expected_value or "",
            actual=r.actual_value or "",
            message=r.message or ""
        ) for r in doc.validation_results
    ]

@router.post("/{document_id}/approve", response_model=DocumentRead)
def approve_doc(
    document_id: str,
    body: dict[str, Any] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("APPROVER", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    comments = body.get("comments") if body else ""
    
    doc.status = DocumentStatus.APPROVED
    approval = ApprovalAction(
        id=uuid.uuid4(),
        document_id=doc.id,
        approver_id=current_user.id,
        action="APPROVED",
        comments=comments
    )
    db.add(approval)
    db.commit()
    
    log_action(db, current_user.id, "Document", str(doc.id), "APPROVED", "READY_FOR_APPROVAL", "APPROVED")
    
    db.refresh(doc)
    return _serialize_document(doc, db)

@router.post("/{document_id}/reject", response_model=DocumentRead)
def reject_doc(
    document_id: str,
    body: dict[str, Any] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("APPROVER", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    comments = body.get("comments") if body else ""
    
    doc.status = DocumentStatus.REJECTED
    approval = ApprovalAction(
        id=uuid.uuid4(),
        document_id=doc.id,
        approver_id=current_user.id,
        action="REJECTED",
        comments=comments
    )
    db.add(approval)
    db.commit()
    
    log_action(db, current_user.id, "Document", str(doc.id), "REJECTED", "READY_FOR_APPROVAL", "REJECTED")
    
    db.refresh(doc)
    return _serialize_document(doc, db)

@router.post("/{document_id}/export", response_model=DocumentRead)
def export_doc(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("APPROVER", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    old_status = doc.status.value
    doc.status = DocumentStatus.EXPORTED
    db.commit()
    
    log_action(db, current_user.id, "Document", str(doc.id), "EXPORTED", old_status, "EXPORTED")
    
    db.refresh(doc)
    return _serialize_document(doc, db)

@router.get("/{document_id}/validation-results", response_model=list[ValidationResultRead])
def get_doc_validation_results(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return [
        ValidationResultRead(
            rule=r.rule_name,
            severity=r.severity,
            status=r.status,
            expected=r.expected_value or "",
            actual=r.actual_value or "",
            message=r.message or ""
        ) for r in doc.validation_results
    ]

@router.patch("/{document_id}/fields/{field_name}", response_model=DocumentRead)
def patch_doc_field_by_name(
    document_id: str,
    field_name: str,
    body: dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("REVIEWER", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    val = body.get("value")
    
    field = db.query(ExtractedField).filter(
        ExtractedField.document_id == doc.id,
        ExtractedField.field_name == field_name
    ).first()
    
    if field:
        old_val = field.corrected_value or field.field_value
        field.is_corrected = True
        field.corrected_value = str(val)
        field.status = FieldStatus.CORRECTED
        field.corrected_by_id = current_user.id
        field.corrected_at = datetime.now(timezone.utc)
        
        # Sync core values to document root if updated
        if field_name == "Total Amount":
            try:
                clean_val = str(val).replace('$', '').replace(',', '').strip()
                doc.total_amount = Decimal(clean_val)
            except:
                pass
        elif field_name == "Invoice Date":
            try:
                doc.invoice_date = datetime.strptime(str(val), "%Y-%m-%d").date()
            except:
                pass
        elif field_name == "Due Date":
            try:
                doc.due_date = datetime.strptime(str(val), "%Y-%m-%d").date()
            except:
                pass
        elif field_name == "Invoice Number":
            doc.document_number = str(val)
        elif field_name == "PO Number":
            po_num = str(val).strip()
            if po_num:
                po_rec = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_num).first()
                if po_rec:
                    doc.purchase_order_id = po_rec.id
                else:
                    doc.purchase_order_id = None
        
        db.commit()
        log_action(db, current_user.id, "Document", str(doc.id), "FIELD_CORRECTED", old_val, str(val))
        
    db.refresh(doc)
    return _serialize_document(doc, db)

@router.post("/{document_id}/review/complete", response_model=DocumentRead)
def complete_review(
    document_id: str,
    body: dict[str, Any] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("REVIEWER", "ADMIN"))
):
    doc = db.query(Document).filter(Document.id == uuid.UUID(document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Verify required fields are present
    fields = {f.field_name: f for f in doc.extracted_fields}
    required = ["Invoice Number", "Invoice Date", "Total Amount"]
    missing = [r for r in required if r not in fields or (not fields[r].field_value and not fields[r].corrected_value)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Cannot complete review. Missing required fields: {', '.join(missing)}")
        
    old_status = doc.status.value
    doc.status = DocumentStatus.READY_FOR_APPROVAL
    
    # Save notes if any
    notes = body.get("notes") if body else ""
    if notes:
        doc.reviewer_notes = notes

    db.commit()
    
    log_action(db, current_user.id, "Document", str(doc.id), "REVIEW_COMPLETED", old_status, f"READY_FOR_APPROVAL (Notes: {notes})" if notes else "READY_FOR_APPROVAL")
    
    db.refresh(doc)
    return _serialize_document(doc, db)
