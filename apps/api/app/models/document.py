from sqlalchemy import String, Numeric, Float, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, date, timezone
import uuid
from decimal import Decimal
from app.db.base import Base
from app.utils.enums import DocumentStatus, Priority
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.user import User

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    document_type: Mapped[str] = mapped_column(String(50), default="Invoice")
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    vendor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True)
    purchase_order_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("purchase_orders.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[DocumentStatus] = mapped_column(String(50), default=DocumentStatus.UPLOADED)
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_reviewer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_approver_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    total_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    invoice_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    priority: Mapped[Priority] = mapped_column(String(50), default=Priority.MEDIUM)
    scenario: Mapped[str | None] = mapped_column(String(255), nullable=True)
    raw_text: Mapped[str | None] = mapped_column(String(65535), nullable=True)
    processing_error: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    reviewer_notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_ocr_simulated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    vendor: Mapped[Vendor | None] = relationship("Vendor")
    purchase_order: Mapped[PurchaseOrder | None] = relationship("PurchaseOrder")
    uploaded_by: Mapped[User | None] = relationship("User", foreign_keys=[uploaded_by_id])
    assigned_reviewer: Mapped[User | None] = relationship("User", foreign_keys=[assigned_reviewer_id])
    assigned_approver: Mapped[User | None] = relationship("User", foreign_keys=[assigned_approver_id])

    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan", lazy="selectin")
    validation_results = relationship("ValidationResult", back_populates="document", cascade="all, delete-orphan", lazy="selectin")
