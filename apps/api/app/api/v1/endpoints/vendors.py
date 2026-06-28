from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.rbac import require_roles
from app.models.vendor import Vendor
from app.models.document import Document
from app.utils.enums import DocumentStatus
from app.schemas.vendor import VendorRead, VendorCreate
from app.services.audit_service import log_action
from app.models.user import User
import uuid

router = APIRouter()

def _calculate_vendor_metrics(vendor: Vendor, db: Session) -> dict:
    total_docs = db.query(Document).filter(Document.vendor_id == vendor.id).count()
    if total_docs == 0:
        return {"totalDocuments": 0, "exceptionRate": 0.0}
        
    exception_docs = db.query(Document).filter(
        Document.vendor_id == vendor.id,
        Document.status.in_([DocumentStatus.VALIDATION_FAILED, DocumentStatus.NEEDS_REVIEW])
    ).count()
    
    rate = (exception_docs / total_docs) * 100.0
    return {"totalDocuments": total_docs, "exceptionRate": round(rate, 1)}

@router.get("/", response_model=list[VendorRead])
def get_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendors = db.query(Vendor).all()
    results = []
    for v in vendors:
        metrics = _calculate_vendor_metrics(v, db)
        # Combine
        v_dict = {
            "id": str(v.id),
            "vendor_code": v.vendor_code,
            "name": v.name,
            "tax_id": v.tax_id,
            "email": v.email,
            "phone": v.phone,
            "status": v.status,
            "totalDocuments": metrics["totalDocuments"],
            "exceptionRate": metrics["exceptionRate"]
        }
        results.append(v_dict)
    return results

@router.post("/", response_model=VendorRead)
def create_vendor(
    vendor_in: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    existing = db.query(Vendor).filter(Vendor.vendor_code == vendor_in.vendor_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vendor code already exists")
        
    vendor = Vendor(
        id=uuid.uuid4(),
        vendor_code=vendor_in.vendor_code,
        name=vendor_in.name,
        tax_id=vendor_in.tax_id,
        email=vendor_in.email,
        phone=vendor_in.phone,
        status=vendor_in.status
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    
    log_action(db, current_user.id, "Vendor", str(vendor.id), "VENDOR_CREATED", None, f"Vendor created: {vendor.name}")
    
    return {
        "id": str(vendor.id),
        "vendor_code": vendor.vendor_code,
        "name": vendor.name,
        "tax_id": vendor.tax_id,
        "email": vendor.email,
        "phone": vendor.phone,
        "status": vendor.status,
        "totalDocuments": 0,
        "exceptionRate": 0.0
    }

@router.get("/{vendor_id}", response_model=VendorRead)
def get_vendor_by_id(
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendor = db.query(Vendor).filter(Vendor.id == uuid.UUID(vendor_id)).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    metrics = _calculate_vendor_metrics(vendor, db)
    return {
        "id": str(vendor.id),
        "vendor_code": vendor.vendor_code,
        "name": vendor.name,
        "tax_id": vendor.tax_id,
        "email": vendor.email,
        "phone": vendor.phone,
        "status": vendor.status,
        "totalDocuments": metrics["totalDocuments"],
        "exceptionRate": metrics["exceptionRate"]
    }
