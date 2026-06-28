export type Role = "ADMIN" | "PROCESSOR" | "REVIEWER" | "APPROVER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
}

export type DocumentStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "EXTRACTED"
  | "VALIDATION_FAILED"
  | "NEEDS_REVIEW"
  | "READY_FOR_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXPORTED";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  source: string;
  correctedValue?: string;
  status: "OK" | "LOW_CONFIDENCE" | "CORRECTED" | "MISSING";
}

export interface ValidationResult {
  rule: string;
  severity: Severity;
  status: "PASSED" | "FAILED" | "WARNING";
  expected: string;
  actual: string;
  message: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  message: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
}

export interface Document {
  id: string;
  number: string;
  vendor: string;
  vendorId: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: DocumentStatus;
  confidence: number;
  assignedTo: string;
  assignedApprover: string;
  uploadedBy: string;
  uploadedOn: string;
  priority: Priority;
  issueCount: number;
  scenario: string;
  extractedFields: ExtractedField[];
  validationResults: ValidationResult[];
  timeline: AuditEvent[];
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "ON_HOLD";
  totalDocuments: number;
  exceptionRate: number;
}

export type POStatus = "OPEN" | "PARTIALLY_USED" | "CLOSED" | "ON_HOLD";

export interface PurchaseOrder {
  id: string;
  number: string;
  vendor: string;
  totalAmount: number;
  remainingAmount: number;
  currency: string;
  status: POStatus;
  createdDate: string;
  linkedDocuments: number;
}

export interface DashboardSummary {
  totalDocuments: number;
  pendingReview: number;
  exceptions: number;
  approved: number;
  totalValue: number;
  avgConfidence: number;
  statusDistribution: { status: DocumentStatus; count: number }[];
  exceptionHighlights: { type: string; count: number; description: string }[];
  insight: string;
}
