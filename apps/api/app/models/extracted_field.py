from sqlalchemy import String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import uuid
from app.db.base import Base
from app.utils.enums import FieldStatus

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    field_name: Mapped[str] = mapped_column(String(100), index=True)
    field_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    source: Mapped[str] = mapped_column(String(50), default="OCR")
    status: Mapped[FieldStatus] = mapped_column(String(50), default=FieldStatus.OK)
    is_corrected: Mapped[bool] = mapped_column(Boolean, default=False)
    corrected_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    corrected_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    corrected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    document = relationship("Document", back_populates="extracted_fields")
