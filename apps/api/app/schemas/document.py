from pydantic import BaseModel, ConfigDict, model_validator
from typing import Any

class ExtractedFieldRead(BaseModel):
  field: str
  value: str
  confidence: float
  source: str
  correctedValue: str | None = None
  status: str
  isCorrected: bool = False
  correctedAt: str | None = None

  model_config = ConfigDict(from_attributes=True)

  @model_validator(mode="before")
  @classmethod
  def map_fields(cls, data: Any) -> Any:
      if hasattr(data, "id"):
          return {
              "field": data.field_name,
              "value": data.field_value or "",
              "confidence": data.confidence,
              "source": data.source,
              "correctedValue": data.corrected_value,
              "status": data.status,
              "isCorrected": data.is_corrected,
              "correctedAt": data.corrected_at.isoformat() if data.corrected_at else None
          }
      return data

class ValidationResultRead(BaseModel):
  rule: str
  severity: str
  status: str
  expected: str
  actual: str
  message: str

  model_config = ConfigDict(from_attributes=True)

  @model_validator(mode="before")
  @classmethod
  def map_fields(cls, data: Any) -> Any:
      if hasattr(data, "id"):
          return {
              "rule": data.rule_name,
              "severity": data.severity,
              "status": data.status,
              "expected": data.expected_value or "",
              "actual": data.actual_value or "",
              "message": data.message or ""
          }
      return data

class AuditEventRead(BaseModel):
  id: str
  timestamp: str
  actor: str
  role: str
  action: str
  message: str

  model_config = ConfigDict(from_attributes=True)

class DocumentRead(BaseModel):
  id: str
  number: str
  vendor: str
  vendorId: str
  poNumber: str
  invoiceDate: str
  dueDate: str
  amount: float
  currency: str
  status: str
  confidence: float
  assignedTo: str
  assignedApprover: str
  uploadedBy: str
  uploadedOn: str
  priority: str
  issueCount: int
  scenario: str
  rawText: str | None = None
  processingError: str | None = None
  reviewerNotes: str | None = None
  isOcrSimulated: bool = False
  extractedFields: list[ExtractedFieldRead] = []
  validationResults: list[ValidationResultRead] = []
  timeline: list[AuditEventRead] = []

  model_config = ConfigDict(from_attributes=True)

class DocumentUploadResponse(BaseModel):
  id: str
  number: str
  status: str
