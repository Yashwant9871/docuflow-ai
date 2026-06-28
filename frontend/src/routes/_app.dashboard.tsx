import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText, ClipboardCheck, AlertTriangle, CheckCircle2,
  DollarSign, Gauge, ArrowRight, Sparkles,
} from "lucide-react";
import { KPICard, PageHeader } from "@/components/Common";
import { StatusBadge, ConfidenceBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { useDashboardSummaryQuery } from "@/hooks/useDashboard";
import { useDocumentsQuery } from "@/hooks/useDocuments";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DocuFlow AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: s, isLoading: loadingSummary } = useDashboardSummaryQuery();
  const { data: allDocs = [], isLoading: loadingDocs } = useDocumentsQuery();
  
  if (loadingSummary || loadingDocs || !s) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }
  
  const recent = allDocs.slice(0, 6);
  const max = Math.max(...s.statusDistribution.map((x) => x.count), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of document processing, exceptions, and approvals."
        actions={
          <Button asChild>
            <Link to="/documents/upload">Upload document</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard label="Total Documents" value={s.totalDocuments} icon={<FileText className="h-4 w-4" />} tone="info" />
        <KPICard label="Pending Review" value={s.pendingReview} icon={<ClipboardCheck className="h-4 w-4" />} tone="warning" />
        <KPICard label="Exceptions" value={s.exceptions} icon={<AlertTriangle className="h-4 w-4" />} tone="danger" />
        <KPICard label="Approved" value={s.approved} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <KPICard label="Total Value" value={`$${s.totalValue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} tone="info" />
        <KPICard label="Avg Confidence" value={`${(s.avgConfidence * 100).toFixed(1)}%`} icon={<Gauge className="h-4 w-4" />} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Processing Overview</div>
              <div className="text-xs text-muted-foreground">Document status distribution</div>
            </div>
          </div>
          <div className="space-y-2.5">
            {s.statusDistribution.map((row) => (
              <div key={row.status} className="grid grid-cols-[180px_1fr_48px] items-center gap-3">
                <StatusBadge status={row.status} />
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary/80"
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
                <div className="text-right text-sm font-medium tabular-nums text-foreground">{row.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Operational Insight</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI Summary</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{s.insight}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/70 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Top exception</div>
              <div className="mt-1 text-sm font-semibold text-foreground">PO amount mismatch</div>
            </div>
            <div className="rounded-lg bg-white/70 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">At-risk vendor</div>
              <div className="mt-1 text-sm font-semibold text-foreground">Northstar Logistics</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="text-sm font-semibold text-foreground">Recent Documents</div>
            <Link to="/documents" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Doc #</th>
                  <th className="px-4 py-2 text-left font-medium">Vendor</th>
                  <th className="px-4 py-2 text-left font-medium">PO #</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Confidence</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium text-foreground">{d.number}</td>
                    <td className="px-4 py-2.5 text-foreground/80">{d.vendor}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{d.poNumber}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">${d.amount.toLocaleString()}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-2.5"><ConfidenceBadge value={d.confidence} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        to="/documents/$id"
                        params={{ id: d.id }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-foreground">Exception Highlights</div>
          <ul className="space-y-3">
            {s.exceptionHighlights.map((e) => (
              <li key={e.type} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{e.type}</div>
                  <div className="text-xs text-muted-foreground">{e.description}</div>
                </div>
                <div className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 tabular-nums">
                  {e.count}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
