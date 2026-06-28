from pydantic import BaseModel

class StatusDistribution(BaseModel):
    status: str
    count: int

class ExceptionHighlight(BaseModel):
    type: str
    count: int
    description: str

class DashboardSummary(BaseModel):
    totalDocuments: int
    pendingReview: int
    exceptions: int
    approved: int
    totalValue: float
    avgConfidence: float
    statusDistribution: list[StatusDistribution]
    exceptionHighlights: list[ExceptionHighlight]
    insight: str

    # Let's also include snake_case versions for 100% API compliance with instructions
    total_documents: int
    pending_review: int
    approved_documents: int
    total_invoice_value: float
    average_confidence_score: float
