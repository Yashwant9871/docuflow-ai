import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/Common";
import { RoleBadge } from "@/components/badges";
import { Input } from "@/components/ui/input";
import { useAuditLogsQuery } from "@/hooks/useAuditLogs";

export const Route = createFileRoute("/_app/audit")({
  head: () => ({ meta: [{ title: "Audit Trail — DocuFlow AI" }] }),
  component: AuditPage,
});

function AuditPage() {
  const { data: logs = [], isLoading } = useAuditLogsQuery();
  const [q, setQ] = useState("");
  const [action, setAction] = useState("ALL");
  const [type, setType] = useState("ALL");

  const actions = ["ALL", ...Array.from(new Set(logs.map((l) => l.action)))];
  const types = ["ALL", ...Array.from(new Set(logs.map((l) => l.entityType)))];

  const filtered = useMemo(() => logs.filter((l) => {
    if (action !== "ALL" && l.action !== action) return false;
    if (type !== "ALL" && l.entityType !== type) return false;
    if (q && !`${l.actor} ${l.entityId} ${l.action}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [logs, q, action, type]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading audit trail...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Trail" subtitle="Tamper-evident log of every action performed in the workspace." />

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, entity, or action" className="pl-8" />
        </div>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          {actions.map((a) => <option key={a}>{a === "ALL" ? "All actions" : a}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          {types.map((t) => <option key={t}>{t === "ALL" ? "All entity types" : t}</option>)}
        </select>
        <select disabled className="h-9 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
          <option>Date range</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Timestamp</th>
                <th className="px-4 py-2.5 text-left font-medium">Actor</th>
                <th className="px-4 py-2.5 text-left font-medium">Role</th>
                <th className="px-4 py-2.5 text-left font-medium">Entity Type</th>
                <th className="px-4 py-2.5 text-left font-medium">Entity ID</th>
                <th className="px-4 py-2.5 text-left font-medium">Action</th>
                <th className="px-4 py-2.5 text-left font-medium">Old</th>
                <th className="px-4 py-2.5 text-left font-medium">New</th>
                <th className="px-4 py-2.5 text-left font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-medium">{l.actor}</td>
                  <td className="px-4 py-2.5"><RoleBadge role={l.role} /></td>
                  <td className="px-4 py-2.5">{l.entityType}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{l.entityId}</td>
                  <td className="px-4 py-2.5">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium">{l.action}</code>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.oldValue ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.newValue ?? "—"}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{l.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
