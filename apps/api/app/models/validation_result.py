from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import uuid
from app.db.base import Base
from app.utils.enums import ValidationStatus, Severity

class ValidationResult(Base):
    __tablename__ = "validation_results"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    rule_name: Mapped[str] = mapped_column(String(100))
    status: Mapped[ValidationStatus] = mapped_column(String(50))
    severity: Mapped[Severity] = mapped_column(String(50))
    message: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expected_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    actual_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    document = relationship("Document", back_populates="validation_results")
