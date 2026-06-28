import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/Common";
import { StatusBadge, ConfidenceBadge, SeverityBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DocumentStatus } from "@/mock/types";
import {
  useDocumentByIdQuery,
  useProcessDocumentMutation,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useExportDocumentMutation,
  useUpdateDocumentStatusMutation,
  useCorrectFieldMutation,
  useRunValidationMutation,
  useCompleteReviewMutation
} from "@/hooks/useDocuments";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/documents/$id")({
  head: () => ({ meta: [{ title: "Document Detail — DocuFlow AI" }] }),
  component: DocumentDetail,
});

function DocumentDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isReviewerOrAdmin = user?.role === "ADMIN" || user?.role === "REVIEWER";

  const { data: doc, isLoading } = useDocumentByIdQuery(id);
  const processMutation = useProcessDocumentMutation(id);
  const approveMutation = useApproveDocumentMutation(id);
  const rejectMutation = useRejectDocumentMutation(id);
  const exportMutation = useExportDocumentMutation(id);
  const updateStatusMutation = useUpdateDocumentStatusMutation(id);
  const correctFieldMutation = useCorrectFieldMutation(id);
  const runValidationMutation = useRunValidationMutation(id);
  const completeReviewMutation = useCompleteReviewMutation(id);

  const [confirm, setConfirm] = useState<null | "APPROVED" | "REJECTED">(null);
  const [leftTab, setLeftTab] = useState<"preview" | "raw_text">("preview");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [showReviewComplete, setShowReviewComplete] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading document details...</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild><Link to="/documents"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">Document not found.</div>
      </div>
    );
  }

  const setStatus = async (s: DocumentStatus, msg: string) => {
    try {
      if (s === 'PROCESSING') {
        await processMutation.mutateAsync();
      } else if (s === 'APPROVED') {
        await approveMutation.mutateAsync();
      } else if (s === 'REJECTED') {
        await rejectMutation.mutateAsync();
      } else if (s === 'EXPORTED') {
        await exportMutation.mutateAsync();
      } else {
        await updateStatusMutation.mutateAsync(s);
      }
      toast.success(msg);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          {(user?.role === "PROCESSOR" || user?.role === "ADMIN") && (
            <Button variant="outline" onClick={() => setStatus("PROCESSING", "Document processing started")}>Process</Button>
          )}
          {isReviewerOrAdmin && (
            <>
              <Button variant="outline" onClick={() => runValidationMutation.mutate(undefined, { onSuccess: () => toast.success("Validation rerun successfully") })}>Rerun Validation</Button>
              {(doc.status === "NEEDS_REVIEW" || doc.status === "VALIDATION_FAILED") && (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowReviewComplete(true)}>Complete Review</Button>
              )}
            </>
          )}
          {(user?.role === "APPROVER" || user?.role === "ADMIN") && (
            <>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setConfirm("APPROVED")}>Approve</Button>
              <Button variant="destructive" onClick={() => setConfirm("REJECTED")}>Reject</Button>
              <Button variant="outline" onClick={() => setStatus("EXPORTED", "Exported to ERP (CSV)")}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {doc.isOcrSimulated && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-sm flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span className="text-amber-800 dark:text-amber-300 font-medium">Image OCR provider not configured; simulated extraction used for demo safety.</span>
        </div>
      )}

      <PageHeader
        title={doc.number}
        subtitle={`${doc.vendor} · ${doc.scenario}`}
        actions={<StatusBadge status={doc.status} />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 rounded-xl border border-border bg-card p-4 shadow-sm text-sm">
        <Meta label="PO Number" value={doc.poNumber} />
        <Meta label="Amount" value={`$${doc.amount.toLocaleString()} ${doc.currency}`} />
        <Meta label="Confidence" value={<ConfidenceBadge value={doc.confidence} />} />
        <Meta label="Uploaded By" value={doc.uploadedBy} />
        <Meta label="Reviewer" value={doc.assignedTo} />
        <Meta label="Approver" value={doc.assignedApprover} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Preview */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => setLeftTab("preview")} 
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${leftTab === "preview" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-muted-foreground hover:text-foreground"}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setLeftTab("raw_text")} 
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${leftTab === "raw_text" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-muted-foreground hover:text-foreground"}`}
              >
                Raw OCR Text
              </button>
            </div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          {leftTab === "preview" ? (
            <InvoicePreview number={doc.number} vendor={doc.vendor} po={doc.poNumber} amount={doc.amount} date={doc.invoiceDate} />
          ) : (
            <div className="h-[430px] overflow-y-auto rounded-lg bg-slate-950 p-4 font-mono text-[11px] text-slate-300 whitespace-pre-wrap ring-1 ring-border shadow-inner leading-relaxed">
              {doc.rawText || "No raw text extracted yet. Click 'Process' to trigger the OCR/Text extraction pipeline."}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border px-5 py-3 text-sm font-semibold">Extracted Fields</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Field</th>
                    <th className="px-4 py-2 text-left font-medium">Extracted</th>
                    <th className="px-4 py-2 text-left font-medium">Confidence</th>
                    <th className="px-4 py-2 text-left font-medium">Source</th>
                    <th className="px-4 py-2 text-left font-medium">Corrected</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doc.extractedFields.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No extracted fields yet.</td></tr>
                  )}
                  {doc.extractedFields.map((f) => (
                    <tr key={f.field}>
                      <td className="px-4 py-2 font-medium">{f.field}</td>
                      <td className="px-4 py-2 text-foreground/80">
                        {editingField === f.field ? (
                          <div className="flex items-center gap-1.5">
                            <Input 
                              className="h-7 w-32 text-xs" 
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)} 
                              autoFocus
                            />
                            <Button 
                              className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs" 
                              onClick={() => {
                                correctFieldMutation.mutate({ fieldName: f.field, value: editValue }, {
                                  onSuccess: () => {
                                    setEditingField(null);
                                    toast.success(`${f.field} corrected`);
                                  },
                                  onError: (err: any) => {
                                    toast.error(err.message || "Failed to save correction");
                                  }
                                });
                              }}
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outline" 
                              className="h-7 px-2 text-xs" 
                              onClick={() => setEditingField(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            <span>{f.value || <span className="italic text-muted-foreground">—</span>}</span>
                            {isReviewerOrAdmin && (
                              <button 
                                onClick={() => {
                                  setEditingField(f.field);
                                  setEditValue(f.correctedValue || f.value || "");
                                }} 
                                className="hidden group-hover:inline-block ml-2 text-[10px] text-primary hover:underline"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2"><ConfidenceBadge value={f.confidence} /></td>
                      <td className="px-4 py-2 text-muted-foreground">{f.source}</td>
                      <td className="px-4 py-2 text-muted-foreground">{f.correctedValue ?? "—"}</td>
                      <td className="px-4 py-2 text-xs">
                        <span className={`inline-flex rounded-md px-2 py-0.5 ring-1 ring-inset ${
                          f.status === "OK" ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : f.status === "LOW_CONFIDENCE" ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : f.status === "MISSING" ? "bg-red-50 text-red-700 ring-red-200"
                          : "bg-blue-50 text-blue-700 ring-blue-200"
                        }`}>{f.status.replace("_", " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border px-5 py-3 text-sm font-semibold">Validation Results</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Rule</th>
                    <th className="px-4 py-2 text-left font-medium">Severity</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Expected</th>
                    <th className="px-4 py-2 text-left font-medium">Actual</th>
                    <th className="px-4 py-2 text-left font-medium">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doc.validationResults.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No validation results.</td></tr>
                  )}
                  {doc.validationResults.map((r) => (
                    <tr key={r.rule}>
                      <td className="px-4 py-2 font-medium">{r.rule}</td>
                      <td className="px-4 py-2"><SeverityBadge severity={r.severity} /></td>
                      <td className="px-4 py-2 text-xs">
                        <span className={`inline-flex rounded-md px-2 py-0.5 ring-1 ring-inset ${
                          r.status === "PASSED" ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : r.status === "FAILED" ? "bg-red-50 text-red-700 ring-red-200"
                          : "bg-amber-50 text-amber-800 ring-amber-200"
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{r.expected}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.actual}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>



      {/* Reviewer Notes */}
      {doc.reviewerNotes && (
        <div className="rounded-xl border border-border bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-sm">
          <div className="text-sm font-semibold text-foreground">Reviewer Notes</div>
          <div className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{doc.reviewerNotes}</div>
        </div>
      )}

      {/* Audit timeline */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-foreground">Audit Timeline</div>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {doc.timeline.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[27px] mt-1 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-primary/10" />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-foreground">{ev.action.replace(/_/g, " ")}</span>
                <span className="text-xs text-muted-foreground">{new Date(ev.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-sm text-foreground/80">{ev.message}</div>
              <div className="text-xs text-muted-foreground">by {ev.actor} ({ev.role})</div>
            </li>
          ))}
          {doc.timeline.length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}
        </ol>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "APPROVED" ? "Approve invoice?" : "Reject invoice?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "APPROVED"
                ? `Approving ${doc.number} will mark it ready for export. This action is recorded in the audit trail.`
                : `Rejecting ${doc.number} will return it to the processor with a note.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm === "APPROVED") setStatus("APPROVED", "Invoice approved");
                if (confirm === "REJECTED") setStatus("REJECTED", "Invoice rejected");
                setConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReviewComplete} onOpenChange={(o) => !o && setShowReviewComplete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Human Review</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the document review complete and set the status to Ready for Approval. 
              Please add any reviewer notes or comments below (optional).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter notes about corrections, validations, or decisions..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReviewComplete(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                completeReviewMutation.mutate(reviewNotes, {
                  onSuccess: () => {
                    setShowReviewComplete(false);
                    toast.success("Human review completed");
                  },
                  onError: (err: any) => {
                    toast.error(err.message || "Failed to complete review");
                  }
                });
              }}
            >
              Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function InvoicePreview({ number, vendor, po, amount, date }: { number: string; vendor: string; po: string; amount: number; date: string }) {
  const tax = amount - amount / 1.1;
  const subtotal = amount / 1.1;
  return (
    <div className="aspect-[3/4] w-full rounded-lg bg-white p-6 ring-1 ring-border shadow-inner text-[11px] text-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-bold text-slate-900">{vendor}</div>
          <div className="mt-0.5 text-slate-500">123 Industrial Way · Suite 400</div>
          <div className="text-slate-500">San Francisco, CA 94107</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-tight text-slate-900">INVOICE</div>
          <div className="mt-0.5 text-slate-500">#{number}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-y border-slate-200 py-3">
        <div><div className="text-[9px] uppercase tracking-wider text-slate-400">Date</div><div className="font-medium">{date}</div></div>
        <div><div className="text-[9px] uppercase tracking-wider text-slate-400">PO</div><div className="font-medium">{po}</div></div>
        <div><div className="text-[9px] uppercase tracking-wider text-slate-400">Terms</div><div className="font-medium">Net 30</div></div>
      </div>

      <table className="mt-4 w-full">
        <thead><tr className="border-b border-slate-200 text-left text-[10px] uppercase text-slate-400">
          <th className="py-1">Description</th><th className="py-1 text-right">Qty</th><th className="py-1 text-right">Unit</th><th className="py-1 text-right">Total</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {[
            { d: "Professional services — May", q: 12, u: subtotal * 0.45 / 12 },
            { d: "Materials & supplies",         q: 4,  u: subtotal * 0.35 / 4 },
            { d: "Shipping & handling",          q: 1,  u: subtotal * 0.20 },
          ].map((r) => (
            <tr key={r.d}><td className="py-1.5">{r.d}</td><td className="py-1.5 text-right">{r.q}</td>
              <td className="py-1.5 text-right">${r.u.toFixed(2)}</td><td className="py-1.5 text-right">${(r.q * r.u).toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 ml-auto w-1/2 space-y-1">
        <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        <Row label="Tax (10%)" value={`$${tax.toFixed(2)}`} />
        <div className="mt-2 flex justify-between border-t border-slate-300 pt-2 text-sm font-bold text-slate-900">
          <span>Total</span><span>${amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span className="font-medium">{value}</span></div>;
}
