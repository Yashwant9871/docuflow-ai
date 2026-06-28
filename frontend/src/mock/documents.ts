import type { Document, ExtractedField, ValidationResult, AuditEvent } from "./types";

function ef(field: string, value: string, confidence: number, status: ExtractedField["status"] = "OK", source = "OCR"): ExtractedField {
  return { field, value, confidence, source, status };
}

function baseFields(num: string, vendor: string, po: string, total: number): ExtractedField[] {
  return [
    ef("Invoice Number", num, 0.99),
    ef("Vendor Name", vendor, 0.97),
    ef("Invoice Date", "2026-05-12", 0.96),
    ef("Due Date", "2026-06-12", 0.95),
    ef("PO Number", po, 0.94),
    ef("Subtotal", `$${(total / 1.1).toFixed(2)}`, 0.93),
    ef("Tax", `$${(total - total / 1.1).toFixed(2)}`, 0.91),
    ef("Total Amount", `$${total.toLocaleString()}`, 0.97),
    ef("Currency", "USD", 0.99),
    ef("Payment Terms", "Net 30", 0.9),
  ];
}

function tl(events: { actor: string; role: AuditEvent["role"]; action: string; message: string; daysAgo: number }[]): AuditEvent[] {
  const now = Date.now();
  return events.map((e, i) => ({
    id: `ev-${i}`,
    timestamp: new Date(now - e.daysAgo * 86400000).toISOString(),
    actor: e.actor,
    role: e.role,
    action: e.action,
    message: e.message,
  }));
}

export const mockDocuments: Document[] = [
  {
    id: "d1", number: "INV-2026-0001", vendor: "Apex Industrial Supplies", vendorId: "v1", poNumber: "PO-2026-1001",
    invoiceDate: "2026-05-12", dueDate: "2026-06-12", amount: 4820, currency: "USD",
    status: "APPROVED", confidence: 0.98, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-13", priority: "LOW", issueCount: 0,
    scenario: "Perfect invoice",
    extractedFields: baseFields("INV-2026-0001", "Apex Industrial Supplies", "PO-2026-1001", 4820),
    validationResults: [
      { rule: "Vendor exists", severity: "HIGH", status: "PASSED", expected: "Known vendor", actual: "Apex Industrial Supplies", message: "Vendor matched in master." },
      { rule: "PO exists", severity: "HIGH", status: "PASSED", expected: "Valid PO", actual: "PO-2026-1001", message: "PO active." },
      { rule: "Amount within PO remaining", severity: "HIGH", status: "PASSED", expected: "<= $12,000", actual: "$4,820", message: "Within limit." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 6 },
      { actor: "System", role: "ADMIN", action: "EXTRACTED", message: "Field extraction completed", daysAgo: 6 },
      { actor: "System", role: "ADMIN", action: "VALIDATED", message: "All validation rules passed", daysAgo: 5 },
      { actor: "Approval User", role: "APPROVER", action: "APPROVED", message: "Invoice approved", daysAgo: 3 },
    ]),
  },
  {
    id: "d2", number: "INV-2026-0002", vendor: "Northstar Logistics", vendorId: "v2", poNumber: "—",
    invoiceDate: "2026-05-14", dueDate: "2026-06-14", amount: 2340, currency: "USD",
    status: "VALIDATION_FAILED", confidence: 0.88, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-15", priority: "HIGH", issueCount: 2,
    scenario: "Missing PO number",
    extractedFields: [
      ...baseFields("INV-2026-0002", "Northstar Logistics", "", 2340).map((f) =>
        f.field === "PO Number" ? { ...f, value: "", confidence: 0.0, status: "MISSING" as const } : f,
      ),
    ],
    validationResults: [
      { rule: "PO number required", severity: "CRITICAL", status: "FAILED", expected: "Non-empty", actual: "(missing)", message: "Invoice has no PO reference." },
      { rule: "Vendor exists", severity: "HIGH", status: "PASSED", expected: "Known vendor", actual: "Northstar Logistics", message: "Vendor matched." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 2 },
      { actor: "System", role: "ADMIN", action: "VALIDATION_FAILED", message: "PO number missing", daysAgo: 2 },
    ]),
  },
  {
    id: "d3", number: "INV-2026-0003", vendor: "BuildRight Materials", vendorId: "v4", poNumber: "PO-2026-1003",
    invoiceDate: "2026-05-16", dueDate: "2026-06-16", amount: 24500, currency: "USD",
    status: "NEEDS_REVIEW", confidence: 0.92, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-17", priority: "HIGH", issueCount: 1,
    scenario: "Amount exceeds PO",
    extractedFields: baseFields("INV-2026-0003", "BuildRight Materials", "PO-2026-1003", 24500),
    validationResults: [
      { rule: "Amount within PO remaining", severity: "CRITICAL", status: "FAILED", expected: "<= $22,000", actual: "$24,500", message: "Invoice exceeds remaining PO balance." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 3 },
      { actor: "System", role: "ADMIN", action: "NEEDS_REVIEW", message: "Routed to review queue", daysAgo: 3 },
    ]),
  },
  {
    id: "d4", number: "INV-2026-0004", vendor: "Apex Industrial Supplies", vendorId: "v1", poNumber: "PO-2026-1001",
    invoiceDate: "2026-05-12", dueDate: "2026-06-12", amount: 4820, currency: "USD",
    status: "VALIDATION_FAILED", confidence: 0.97, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-18", priority: "MEDIUM", issueCount: 1,
    scenario: "Duplicate invoice",
    extractedFields: baseFields("INV-2026-0004", "Apex Industrial Supplies", "PO-2026-1001", 4820),
    validationResults: [
      { rule: "Duplicate invoice check", severity: "CRITICAL", status: "FAILED", expected: "Unique invoice number", actual: "Duplicate of INV-2026-0001", message: "Invoice number already processed." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 1 },
      { actor: "System", role: "ADMIN", action: "VALIDATION_FAILED", message: "Duplicate detected", daysAgo: 1 },
    ]),
  },
  {
    id: "d5", number: "INV-2026-0005", vendor: "Globex Components", vendorId: "v0", poNumber: "—",
    invoiceDate: "2026-05-18", dueDate: "2026-06-18", amount: 1280, currency: "USD",
    status: "NEEDS_REVIEW", confidence: 0.84, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-19", priority: "MEDIUM", issueCount: 1,
    scenario: "Unknown vendor",
    extractedFields: baseFields("INV-2026-0005", "Globex Components", "", 1280),
    validationResults: [
      { rule: "Vendor exists", severity: "HIGH", status: "FAILED", expected: "Known vendor", actual: "Globex Components", message: "Vendor not found in master." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 1 },
    ]),
  },
  {
    id: "d6", number: "INV-2026-0006", vendor: "MedCore Billing Services", vendorId: "v3", poNumber: "PO-2026-1005",
    invoiceDate: "2026-05-20", dueDate: "2026-06-20", amount: 3450, currency: "USD",
    status: "NEEDS_REVIEW", confidence: 0.89, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-21", priority: "MEDIUM", issueCount: 1,
    scenario: "Missing tax field",
    extractedFields: baseFields("INV-2026-0006", "MedCore Billing Services", "PO-2026-1005", 3450).map((f) =>
      f.field === "Tax" ? { ...f, value: "", confidence: 0, status: "MISSING" } : f,
    ),
    validationResults: [
      { rule: "Required field: Tax", severity: "MEDIUM", status: "FAILED", expected: "Non-empty", actual: "(missing)", message: "Tax amount not extracted." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 2 },
    ]),
  },
  {
    id: "d7", number: "INV-2026-0007", vendor: "Northstar Logistics", vendorId: "v2", poNumber: "PO-2026-1002",
    invoiceDate: "2027-01-05", dueDate: "2027-02-05", amount: 980, currency: "USD",
    status: "VALIDATION_FAILED", confidence: 0.93, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-21", priority: "LOW", issueCount: 1,
    scenario: "Future invoice date",
    extractedFields: baseFields("INV-2026-0007", "Northstar Logistics", "PO-2026-1002", 980),
    validationResults: [
      { rule: "Invoice date not in future", severity: "HIGH", status: "FAILED", expected: "<= today", actual: "2027-01-05", message: "Invoice date is in the future." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 2 },
    ]),
  },
  {
    id: "d8", number: "INV-2026-0008", vendor: "Prime Office Solutions", vendorId: "v5", poNumber: "PO-2026-1004",
    invoiceDate: "2026-05-22", dueDate: "2026-06-22", amount: 720, currency: "USD",
    status: "NEEDS_REVIEW", confidence: 0.62, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-23", priority: "LOW", issueCount: 1,
    scenario: "Low-confidence OCR",
    extractedFields: baseFields("INV-2026-0008", "Prime Office Solutions", "PO-2026-1004", 720).map((f) => ({ ...f, confidence: Math.max(0.55, f.confidence - 0.3), status: "LOW_CONFIDENCE" as const })),
    validationResults: [
      { rule: "Confidence threshold", severity: "MEDIUM", status: "FAILED", expected: ">= 0.80", actual: "0.62", message: "Average extraction confidence below threshold." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 1 },
    ]),
  },
  {
    id: "d9", number: "INV-2026-0009", vendor: "BuildRight Materials", vendorId: "v4", poNumber: "PO-2026-1003",
    invoiceDate: "2026-05-23", dueDate: "2026-06-23", amount: 18750, currency: "USD",
    status: "READY_FOR_APPROVAL", confidence: 0.96, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-05-24", priority: "HIGH", issueCount: 0,
    scenario: "High-value invoice",
    extractedFields: baseFields("INV-2026-0009", "BuildRight Materials", "PO-2026-1003", 18750),
    validationResults: [
      { rule: "All checks passed", severity: "LOW", status: "PASSED", expected: "All rules pass", actual: "All rules pass", message: "Ready for approval." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 4 },
      { actor: "Review User", role: "REVIEWER", action: "REVIEWED", message: "Fields validated", daysAgo: 2 },
      { actor: "Review User", role: "REVIEWER", action: "READY_FOR_APPROVAL", message: "Sent for approval", daysAgo: 1 },
    ]),
  },
  {
    id: "d10", number: "INV-2026-0010", vendor: "Apex Industrial Supplies", vendorId: "v1", poNumber: "PO-2026-1001",
    invoiceDate: "2026-04-10", dueDate: "2026-05-10", amount: 6230, currency: "USD",
    status: "EXPORTED", confidence: 0.99, assignedTo: "Review User", assignedApprover: "Approval User",
    uploadedBy: "Process User", uploadedOn: "2026-04-11", priority: "LOW", issueCount: 0,
    scenario: "Exported invoice",
    extractedFields: baseFields("INV-2026-0010", "Apex Industrial Supplies", "PO-2026-1001", 6230),
    validationResults: [
      { rule: "All checks passed", severity: "LOW", status: "PASSED", expected: "All rules pass", actual: "All rules pass", message: "Exported to ERP." },
    ],
    timeline: tl([
      { actor: "Process User", role: "PROCESSOR", action: "UPLOADED", message: "Document uploaded", daysAgo: 40 },
      { actor: "Approval User", role: "APPROVER", action: "APPROVED", message: "Approved", daysAgo: 30 },
      { actor: "System", role: "ADMIN", action: "EXPORTED", message: "Exported to ERP", daysAgo: 28 },
    ]),
  },
];
