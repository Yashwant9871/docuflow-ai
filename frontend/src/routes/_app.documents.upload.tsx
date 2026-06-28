import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { UploadCloud, FileCheck2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadDocumentMutation } from "@/hooks/useDocuments";
import { useVendorsQuery } from "@/hooks/useVendors";
import { usePurchaseOrdersQuery } from "@/hooks/usePurchaseOrders";

export const Route = createFileRoute("/_app/documents/upload")({
  head: () => ({ meta: [{ title: "Upload Document — DocuFlow AI" }] }),
  component: UploadPage,
});

const steps = ["Upload", "Extract", "Validate", "Review", "Approve", "Export"];

function UploadPage() {
  const router = useRouter();
  
  const { data: vendors = [] } = useVendorsQuery();
  const { data: pos = [] } = usePurchaseOrdersQuery();
  const uploadMutation = useUploadDocumentMutation();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("Invoice");
  const [vendor, setVendor] = useState("");
  const [po, setPo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (vendors.length > 0 && !vendor) {
      setVendor(vendors[0].name);
    }
  }, [vendors, vendor]);

  useEffect(() => {
    if (pos.length > 0 && !po) {
      setPo(pos[0].number);
    }
  }, [pos, po]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);
    
    const selectedVendor = vendors.find(v => v.name === vendor);
    if (selectedVendor) {
      formData.append("vendor_id", selectedVendor.id);
    }
    
    const selectedPO = pos.find(p => p.number === po);
    if (selectedPO) {
      formData.append("purchase_order_id", selectedPO.id);
    }
    
    if (notes) {
      formData.append("notes", notes);
    }

    uploadMutation.mutate(formData, {
      onSuccess: (result) => {
        toast.success("Document uploaded", { description: `${result.number} queued for extraction.` });
        router.navigate({ to: "/documents" });
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to upload document");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Document"
        subtitle="Upload invoices, receipts, POs, or supporting documents for AI extraction."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2 space-y-6">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files?.[0] ?? null); }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            {file ? (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-foreground">{file.name}</div>
                <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · ready to upload</div>
              </>
            ) : (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-foreground">Drag & drop a file here</div>
                <div className="text-xs text-muted-foreground">or click to browse — PDF, PNG, JPG up to 25 MB</div>
              </>
            )}
            <input
              ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Document type</Label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Invoice</option><option>Receipt</option><option>Purchase Order</option><option>Supporting Document</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {vendors.map((v) => <option key={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Purchase order</Label>
              <select value={po} onChange={(e) => setPo(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {pos.map((p) => <option key={p.id}>{p.number}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference</Label>
              <Input placeholder="Internal reference (optional)" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any context for the reviewer…" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setFile(null); setNotes(""); }}>Reset</Button>
            <Button onClick={handleUpload}>Upload document</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold text-foreground">Workflow</div>
          <p className="mt-1 text-xs text-muted-foreground">After upload, each document moves through six stages.</p>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</div>
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{s}</span>
                  {i < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
            All processing is simulated. No real OCR or AI calls happen in this demo.
          </div>
        </div>
      </div>
    </div>
  );
}
