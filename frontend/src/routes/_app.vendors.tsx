import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { useVendorsQuery } from "@/hooks/useVendors";

export const Route = createFileRoute("/_app/vendors")({
  head: () => ({ meta: [{ title: "Vendors — DocuFlow AI" }] }),
  component: VendorsPage,
});

function VendorsPage() {
  const { data: vendors = [], isLoading } = useVendorsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading vendors...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        subtitle="Vendor master data and document quality metrics."
        actions={<Button onClick={() => toast("Vendor creation is mocked in this demo.")}>+ New Vendor</Button>}
      />
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Code</th>
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="px-4 py-2.5 text-left font-medium">Tax ID</th>
                <th className="px-4 py-2.5 text-left font-medium">Email</th>
                <th className="px-4 py-2.5 text-left font-medium">Phone</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Documents</th>
                <th className="px-4 py-2.5 text-right font-medium">Exception %</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{v.code}</td>
                  <td className="px-4 py-2.5">{v.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{v.taxId}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{v.email}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{v.phone}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      v.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : v.status === "ON_HOLD" ? "bg-amber-50 text-amber-800 ring-amber-200"
                      : "bg-slate-100 text-slate-600 ring-slate-200"
                    }`}>{v.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{v.totalDocuments}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span className={v.exceptionRate > 10 ? "text-red-600" : v.exceptionRate > 5 ? "text-amber-600" : "text-emerald-600"}>
                      {v.exceptionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => toast(`Editing ${v.name} is mocked.`)} className="text-xs font-medium text-primary hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
