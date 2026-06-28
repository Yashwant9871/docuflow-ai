import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/Common";
import { PriorityBadge, ConfidenceBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { useDocumentsQuery } from "@/hooks/useDocuments";

export const Route = createFileRoute("/_app/review")({
  head: () => ({ meta: [{ title: "Review Queue — DocuFlow AI" }] }),
  component: ReviewQueue,
});

function ReviewQueue() {
  const { data: allDocs = [], isLoading } = useDocumentsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading review queue...</div>
      </div>
    );
  }

  const docs = allDocs.filter((d) => d.status === "NEEDS_REVIEW");
  const workload = {
    assigned: docs.length, overdue: 2, high: docs.filter((d) => d.priority === "HIGH").length, completedToday: 4,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Review Queue" subtitle="Documents flagged for reviewer attention." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Document #</th>
                  <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                  <th className="px-4 py-2.5 text-left font-medium">Issues</th>
                  <th className="px-4 py-2.5 text-left font-medium">Conf.</th>
                  <th className="px-4 py-2.5 text-left font-medium">Assigned</th>
                  <th className="px-4 py-2.5 text-left font-medium">Age</th>
                  <th className="px-4 py-2.5 text-left font-medium">Priority</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{d.number}</td>
                    <td className="px-4 py-2.5 text-foreground/80">{d.vendor}</td>
                    <td className="px-4 py-2.5 tabular-nums">{d.issueCount}</td>
                    <td className="px-4 py-2.5"><ConfidenceBadge value={d.confidence} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{d.assignedTo}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">2d</td>
                    <td className="px-4 py-2.5"><PriorityBadge priority={d.priority} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <Button size="sm" asChild>
                        <Link to="/documents/$id" params={{ id: d.id }}>Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr><td colSpan={8} className="p-10 text-center text-sm text-muted-foreground">Review queue is clear.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm h-fit">
          <div className="text-sm font-semibold text-foreground">Reviewer workload</div>
          <p className="text-xs text-muted-foreground">Updated just now</p>
          <dl className="mt-4 space-y-3">
            <Stat label="Assigned to me" value={workload.assigned} />
            <Stat label="Overdue" value={workload.overdue} tone="danger" />
            <Stat label="High priority" value={workload.high} tone="warning" />
            <Stat label="Completed today" value={workload.completedToday} tone="success" />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "danger" | "warning" | "success" }) {
  const toneMap = {
    default: "text-foreground", danger: "text-red-600", warning: "text-amber-600", success: "text-emerald-600",
  };
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-base font-semibold tabular-nums ${toneMap[tone]}`}>{value}</dd>
    </div>
  );
}
