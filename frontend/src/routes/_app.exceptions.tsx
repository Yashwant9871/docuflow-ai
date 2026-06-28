import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/Common";
import { SeverityBadge } from "@/components/badges";
import { useDocumentsQuery } from "@/hooks/useDocuments";

export const Route = createFileRoute("/_app/exceptions")({
  head: () => ({ meta: [{ title: "Exceptions — DocuFlow AI" }] }),
  component: ExceptionsPage,
});

function ExceptionsPage() {
  const { data: allDocs = [], isLoading } = useDocumentsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading exceptions...</div>
      </div>
    );
  }

  const rows = allDocs.flatMap((d) =>
    d.validationResults
      .filter((r) => r.status === "FAILED")
      .map((r) => ({ doc: d, rule: r })),
  );

  const groups = [
    { label: "Vendor issues", filter: (rule: string) => /vendor/i.test(rule) },
    { label: "PO mismatch", filter: (rule: string) => /PO|amount/i.test(rule) },
    { label: "Duplicate invoice", filter: (rule: string) => /duplicate/i.test(rule) },
    { label: "Missing fields", filter: (rule: string) => /required|missing/i.test(rule) },
    { label: "Low confidence", filter: (rule: string) => /confidence/i.test(rule) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Exceptions" subtitle="Failed validation rules grouped by category." />

      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 p-5 shadow-sm flex items-start gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
        <div>
          <div className="text-sm font-semibold">{rows.length} exceptions detected.</div>
          <div className="text-sm text-foreground/80">
            Most are related to PO amount mismatches and duplicate-risk invoices. Review approval thresholds and vendor mappings.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {groups.map((g) => {
          const c = rows.filter((r) => g.filter(r.rule.rule)).length;
          return (
            <div key={g.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{g.label}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{c}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-5 py-3 text-sm font-semibold">All exceptions</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Document #</th>
                <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                <th className="px-4 py-2.5 text-left font-medium">Rule</th>
                <th className="px-4 py-2.5 text-left font-medium">Severity</th>
                <th className="px-4 py-2.5 text-left font-medium">Expected</th>
                <th className="px-4 py-2.5 text-left font-medium">Actual</th>
                <th className="px-4 py-2.5 text-left font-medium">Message</th>
                <th className="px-4 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ doc, rule }, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{doc.number}</td>
                  <td className="px-4 py-2.5 text-foreground/80">{doc.vendor}</td>
                  <td className="px-4 py-2.5">{rule.rule}</td>
                  <td className="px-4 py-2.5"><SeverityBadge severity={rule.severity} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{rule.expected}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{rule.actual}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{rule.message}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link to="/documents/$id" params={{ id: doc.id }} className="text-xs font-medium text-primary hover:underline">Resolve</Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-sm text-muted-foreground">No active exceptions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
