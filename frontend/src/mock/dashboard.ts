import type { DashboardSummary } from "./types";

export const mockDashboard: DashboardSummary = {
  totalDocuments: 128,
  pendingReview: 24,
  exceptions: 11,
  approved: 82,
  totalValue: 428750,
  avgConfidence: 0.914,
  statusDistribution: [
    { status: "UPLOADED", count: 6 },
    { status: "PROCESSING", count: 4 },
    { status: "EXTRACTED", count: 9 },
    { status: "VALIDATION_FAILED", count: 7 },
    { status: "NEEDS_REVIEW", count: 24 },
    { status: "READY_FOR_APPROVAL", count: 12 },
    { status: "APPROVED", count: 82 },
    { status: "REJECTED", count: 3 },
    { status: "EXPORTED", count: 65 },
  ],
  exceptionHighlights: [
    { type: "PO amount mismatch", count: 4, description: "Invoice exceeds PO remaining balance" },
    { type: "Unknown vendor", count: 2, description: "Vendor not found in master" },
    { type: "Duplicate invoice", count: 3, description: "Invoice number already processed" },
    { type: "Missing tax ID", count: 1, description: "Tax identifier could not be extracted" },
    { type: "Low OCR confidence", count: 1, description: "Extraction below confidence threshold" },
  ],
  insight:
    "Most exceptions this week are related to PO amount mismatches from logistics vendors. Review vendor PO thresholds or approval limits.",
};
