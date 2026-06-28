import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Common";
import type { POStatus } from "@/mock/types";
import { usePurchaseOrdersQuery } from "@/hooks/usePurchaseOrders";

const poStatusCls: Record<POStatus, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PARTIALLY_USED: "bg-blue-50 text-blue-700 ring-blue-200",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
  ON_HOLD: "bg-amber-50 text-amber-800 ring-amber-200",
};

export const Route = createFileRoute("/_app/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — DocuFlow AI" }] }),
  component: POPage,
});

function POPage() {
  const { data: pos = [], isLoading } = usePurchaseOrdersQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading purchase orders...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Purchase Orders" subtitle="Open POs, remaining balances, and linked documents." />
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">PO Number</th>
                <th className="px-4 py-2.5 text-left font-medium">Vendor</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
                <th className="px-4 py-2.5 text-right font-medium">Remaining</th>
                <th className="px-4 py-2.5 text-left font-medium">Currency</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium">Created</th>
                <th className="px-4 py-2.5 text-right font-medium">Linked</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pos.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium tabular-nums">{p.number}</td>
                  <td className="px-4 py-2.5">{p.vendor}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">${p.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">${p.remainingAmount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.currency}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${poStatusCls[p.status]}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{p.createdDate}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{p.linkedDocuments}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="text-xs font-medium text-primary hover:underline">View</button>
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
