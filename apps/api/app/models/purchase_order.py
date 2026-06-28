from sqlalchemy import String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from app.db.base import Base
from app.utils.enums import POStatus
from app.models.vendor import Vendor

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    po_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    vendor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("vendors.id", ondelete="RESTRICT"))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    remaining_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    status: Mapped[POStatus] = mapped_column(String(50), default=POStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    vendor: Mapped[Vendor] = relationship("Vendor")
