import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/Common";
import { StatusBadge, ConfidenceBadge } from "@/components/badges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { DocumentStatus } from "@/mock/types";
import { useDocumentsQuery } from "@/hooks/useDocuments";
import { useVendorsQuery } from "@/hooks/useVendors";

export const Route = createFileRoute("/_app/documents/")({
  head: () => ({ meta: [{ title: "Document Inbox — DocuFlow AI" }] }),
  component: DocumentInbox,
});

const statuses: ("ALL" | DocumentStatus)[] = [
  "ALL", "UPLOADED", "PROCESSING", "EXTRACTED", "VALIDATION_FAILED",
  "NEEDS_REVIEW", "READY_FOR_APPROVAL", "APPROVED", "REJECTED", "EXPORTED",
];

function DocumentInbox() {
  const { data: docs = [], isLoading: loadingDocs } = useDocumentsQuery();
  const { data: vendorList = [], isLoading: loadingVendors } = useVendorsQuery();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("ALL");
  const [vendor, setVendor] = useState("All vendors");

  const vendors = ["All vendors", ...vendorList.map((v) => v.name)];

  const filtered = useMemo(() => docs.filter((d) => {
    if (status !== "ALL" && d.status !== status) return false;
    if (vendor !== "All vendors" && d.vendor !== vendor) return false;
    if (q && !`${d.number} ${d.vendor} ${d.poNumber}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [docs, q, status, vendor]);

  if (loadingDocs || loadingVendors) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading inbox...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Inbox"
        subtitle="All uploaded documents across vendors and processing stages."
        actions={<Button asChild><Link to="/documents/upload">Upload</Link></Button>}
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by document, vendor, or PO" className="pl-8" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {statuses.map((s) => <option key={s} value={s}>{s === "ALL" ? "All statuses" : s.replace(/_/g, " ")}</option>)}
          </select>
          <select
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select disabled className="h-9 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
            <option>Date range</option>
          </select>
          <select disabled className="h-9 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
            <option>Confidence: any</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Document #</th>
                <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                <th className="px-4 py-2.5 text-left font-medium">PO #</th>
                <th className="px-4 py-2.5 text-left font-medium">Invoice Date</th>
                <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium">Conf.</th>
                <th className="px-4 py-2.5 text-left font-medium">Assigned</th>
                <th className="px-4 py-2.5 text-left font-medium">Uploaded</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium text-foreground">{d.number}</td>
                  <td className="px-4 py-2.5 text-foreground/80">{d.vendor}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{d.poNumber}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{d.invoiceDate}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">${d.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-2.5"><ConfidenceBadge value={d.confidence} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{d.assignedTo}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{d.uploadedOn}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      to="/documents/$id"
                      params={{ id: d.id }}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-10 text-center text-sm text-muted-foreground">No documents match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
