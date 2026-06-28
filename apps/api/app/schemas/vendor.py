from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Any
import uuid

class VendorCreate(BaseModel):
    vendor_code: str
    name: str
    tax_id: str | None = None
    email: str | None = None
    phone: str | None = None
    status: str = "ACTIVE"

class VendorRead(BaseModel):
    id: str
    code: str
    name: str
    taxId: str | None = None
    email: str | None = None
    phone: str | None = None
    status: str
    totalDocuments: int = 0
    exceptionRate: float = 0.0

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def map_fields(cls, data: Any) -> Any:
        if hasattr(data, "id"):
            # It's an ORM object
            return {
                "id": str(data.id),
                "code": data.vendor_code,
                "name": data.name,
                "taxId": data.tax_id or "",
                "email": data.email or "",
                "phone": data.phone or "",
                "status": data.status,
                "totalDocuments": getattr(data, "totalDocuments", 0),
                "exceptionRate": getattr(data, "exceptionRate", 0.0)
            }
        elif isinstance(data, dict):
            # It's a dict
            return {
                "id": str(data.get("id", "")),
                "code": data.get("vendor_code") or data.get("code") or "",
                "name": data.get("name") or "",
                "taxId": data.get("tax_id") or data.get("taxId") or "",
                "email": data.get("email") or "",
                "phone": data.get("phone") or "",
                "status": data.get("status") or "ACTIVE",
                "totalDocuments": data.get("totalDocuments", 0),
                "exceptionRate": data.get("exceptionRate", 0.0)
            }
        return data
