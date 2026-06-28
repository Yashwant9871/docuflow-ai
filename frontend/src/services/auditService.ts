import type { AuditLog } from "@/mock/types";
import { apiGet } from "./api";

export async function getAuditLogs(): Promise<AuditLog[]> {
  return apiGet<AuditLog[]>('/audit-logs');
}

export async function getDocumentAuditLogs(documentId: string): Promise<AuditLog[]> {
  return apiGet<AuditLog[]>(`/documents/${documentId}/audit`);
}
