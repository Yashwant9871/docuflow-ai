import { useQuery } from "@tanstack/react-query";
import { getAuditLogs, getDocumentAuditLogs } from "@/services/auditService";

export function useAuditLogsQuery() {
  return useQuery({
    queryKey: ["auditLogs"],
    queryFn: getAuditLogs,
  });
}

export function useDocumentAuditLogsQuery(documentId: string) {
  return useQuery({
    queryKey: ["documentAuditLogs", documentId],
    queryFn: () => getDocumentAuditLogs(documentId),
    enabled: !!documentId,
  });
}
