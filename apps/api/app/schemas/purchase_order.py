from pydantic import BaseModel, ConfigDict, model_validator
from typing import Any
import uuid

class PurchaseOrderCreate(BaseModel):
    po_number: str
    vendor_id: uuid.UUID
    total_amount: float
    remaining_amount: float | None = None
    currency: str = "USD"
    status: str = "OPEN"

class PurchaseOrderRead(BaseModel):
    id: str
    number: str
    vendor: str
    totalAmount: float
    remainingAmount: float
    currency: str
    status: str
    createdDate: str
    linkedDocuments: int = 0

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def map_fields(cls, data: Any) -> Any:
        if hasattr(data, "id"):
            # It's an ORM object
            return {
                "id": str(data.id),
                "number": data.po_number,
                "vendor": data.vendor.name if data.vendor else "",
                "totalAmount": float(data.total_amount),
                "remainingAmount": float(data.remaining_amount),
                "currency": data.currency,
                "status": data.status,
                "createdDate": data.created_at.strftime("%Y-%m-%d") if data.created_at else "",
                "linkedDocuments": getattr(data, "linkedDocuments", 0)
            }
        elif isinstance(data, dict):
            return {
                "id": str(data.get("id", "")),
                "number": data.get("po_number") or data.get("number") or "",
                "vendor": data.get("vendor", ""),
                "totalAmount": float(data.get("total_amount") or data.get("totalAmount") or 0.0),
                "remainingAmount": float(data.get("remaining_amount") or data.get("remainingAmount") or 0.0),
                "currency": data.get("currency") or "USD",
                "status": data.get("status") or "OPEN",
                "createdDate": data.get("created_at") or data.get("createdDate") or "",
                "linkedDocuments": data.get("linkedDocuments", 0)
            }
        return data
