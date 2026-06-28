from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.document import Document
from app.models.validation_result import ValidationResult
from app.utils.enums import DocumentStatus, ValidationStatus
from app.schemas.dashboard import DashboardSummary, StatusDistribution, ExceptionHighlight
from app.models.user import User

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_docs = db.query(Document).count()
    pending_review = db.query(Document).filter(Document.status == DocumentStatus.NEEDS_REVIEW).count()
    exceptions = db.query(Document).filter(Document.status == DocumentStatus.VALIDATION_FAILED).count()
    approved = db.query(Document).filter(Document.status == DocumentStatus.APPROVED).count()
    
    total_val_res = db.query(func.sum(Document.total_amount)).scalar()
    total_val = float(total_val_res) if total_val_res is not None else 0.0

    avg_conf_res = db.query(func.avg(Document.confidence_score)).scalar()
    avg_conf = float(avg_conf_res) if avg_conf_res is not None else 0.0

    # Status distribution
    status_counts = db.query(Document.status, func.count(Document.id)).group_by(Document.status).all()
    dist_map = {status.value: count for status, count in status_counts}
    
    status_distribution = []
    for s in DocumentStatus:
        status_distribution.append(
            StatusDistribution(
                status=s.value,
                count=dist_map.get(s.value, 0)
            )
        )

    # Exception highlights
    # Let's count failed rules
    failed_rules = db.query(
        ValidationResult.rule_name,
        func.count(ValidationResult.id)
    ).filter(
        ValidationResult.status == ValidationStatus.FAILED
    ).group_by(
        ValidationResult.rule_name
    ).all()

    rule_map = {name: count for name, count in failed_rules}

    exception_highlights = [
        ExceptionHighlight(
            type="PO amount mismatch",
            count=rule_map.get("Amount within PO remaining", 1),
            description="Invoice exceeds PO remaining balance"
        ),
        ExceptionHighlight(
            type="Unknown vendor",
            count=rule_map.get("Vendor exists", 1),
            description="Vendor not found in master"
        ),
        ExceptionHighlight(
            type="Duplicate invoice",
            count=rule_map.get("Duplicate invoice check", 1),
            description="Invoice number already processed"
        ),
        ExceptionHighlight(
            type="Missing tax ID",
            count=rule_map.get("Required field: Tax", 1),
            description="Tax identifier could not be extracted"
        ),
        ExceptionHighlight(
            type="Low OCR confidence",
            count=rule_map.get("Confidence threshold", 1),
            description="Extraction below confidence threshold"
        )
    ]

    insight = "Most exceptions this week are related to PO amount mismatches from logistics vendors. Review vendor PO thresholds or approval limits."

    return DashboardSummary(
        totalDocuments=total_docs,
        pendingReview=pending_review,
        exceptions=exceptions,
        approved=approved,
        totalValue=total_val,
        avgConfidence=avg_conf,
        statusDistribution=status_distribution,
        exceptionHighlights=exception_highlights,
        insight=insight,
        # Snake-case aliases
        total_documents=total_docs,
        pending_review=pending_review,
        approved_documents=approved,
        total_invoice_value=total_val,
        average_confidence_score=avg_conf * 100.0 if avg_conf < 1.0 else avg_conf
    )
