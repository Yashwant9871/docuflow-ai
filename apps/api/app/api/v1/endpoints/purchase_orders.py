from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.rbac import require_roles
from app.models.purchase_order import PurchaseOrder
from app.models.document import Document
from app.schemas.purchase_order import PurchaseOrderRead, PurchaseOrderCreate
from app.services.audit_service import log_action
from app.models.user import User
import uuid

router = APIRouter()

def _calculate_po_metrics(po: PurchaseOrder, db: Session) -> dict:
    linked_docs = db.query(Document).filter(Document.purchase_order_id == po.id).count()
    return {"linkedDocuments": linked_docs}

@router.get("/", response_model=list[PurchaseOrderRead])
def get_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pos = db.query(PurchaseOrder).all()
    results = []
    for p in pos:
        metrics = _calculate_po_metrics(p, db)
        results.append({
            "id": str(p.id),
            "po_number": p.po_number,
            "vendor": p.vendor.name if p.vendor else "",
            "total_amount": float(p.total_amount),
            "remaining_amount": float(p.remaining_amount),
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at,
            "linkedDocuments": metrics["linkedDocuments"]
        })
    return results

@router.post("/", response_model=PurchaseOrderRead)
def create_purchase_order(
    po_in: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN"))
):
    existing = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_in.po_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="PO number already exists")
        
    po = PurchaseOrder(
        id=uuid.uuid4(),
        po_number=po_in.po_number,
        vendor_id=po_in.vendor_id,
        total_amount=po_in.total_amount,
        remaining_amount=po_in.remaining_amount if po_in.remaining_amount is not None else po_in.total_amount,
        currency=po_in.currency,
        status=po_in.status
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    
    log_action(db, current_user.id, "PurchaseOrder", str(po.id), "PURCHASE_ORDER_CREATED", None, f"PO created: {po.po_number}")
    
    return {
        "id": str(po.id),
        "po_number": po.po_number,
        "vendor": po.vendor.name if po.vendor else "",
        "total_amount": float(po.total_amount),
        "remaining_amount": float(po.remaining_amount),
        "currency": po.currency,
        "status": po.status,
        "created_at": po.created_at,
        "linkedDocuments": 0
    }

@router.get("/{po_id}", response_model=PurchaseOrderRead)
def get_po_by_id(
    po_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == uuid.UUID(po_id)).first()
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
        
    metrics = _calculate_po_metrics(po, db)
    return {
        "id": str(po.id),
        "po_number": po.po_number,
        "vendor": po.vendor.name if po.vendor else "",
        "total_amount": float(po.total_amount),
        "remaining_amount": float(po.remaining_amount),
        "currency": po.currency,
        "status": po.status,
        "created_at": po.created_at,
        "linkedDocuments": metrics["linkedDocuments"]
    }
