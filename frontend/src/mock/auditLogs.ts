import type { AuditLog } from "./types";

const actions = [
  "USER_LOGIN", "DOCUMENT_UPLOADED", "DOCUMENT_PROCESSED", "STATUS_CHANGED",
  "FIELD_CORRECTED", "VALIDATION_RUN", "SENT_TO_REVIEW", "APPROVED", "REJECTED", "EXPORTED",
];

const actors = [
  { name: "Admin User", role: "ADMIN" as const },
  { name: "Process User", role: "PROCESSOR" as const },
  { name: "Review User", role: "REVIEWER" as const },
  { name: "Approval User", role: "APPROVER" as const },
  { name: "System", role: "ADMIN" as const },
];

function ip() {
  return `10.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
}

export const mockAuditLogs: AuditLog[] = Array.from({ length: 32 }).map((_, i) => {
  const actor = actors[i % actors.length];
  const action = actions[i % actions.length];
  const isFieldChange = action === "FIELD_CORRECTED" || action === "STATUS_CHANGED";
  return {
    id: `al-${i + 1}`,
    timestamp: new Date(Date.now() - i * 3600000 * 5).toISOString(),
    actor: actor.name,
    role: actor.role,
    entityType: action.includes("DOCUMENT") || action.includes("APPROVED") || action.includes("REJECTED") || action.includes("VALIDATION") || action.includes("EXPORT") || action.includes("STATUS") || action.includes("FIELD") || action.includes("REVIEW") ? "Document" : "User",
    entityId: action.includes("USER") ? `u${(i % 4) + 1}` : `INV-2026-${String((i % 10) + 1).padStart(4, "0")}`,
    action,
    oldValue: isFieldChange ? (action === "STATUS_CHANGED" ? "EXTRACTED" : "$1,200") : undefined,
    newValue: isFieldChange ? (action === "STATUS_CHANGED" ? "NEEDS_REVIEW" : "$1,250") : undefined,
    ipAddress: ip(),
  };
});
