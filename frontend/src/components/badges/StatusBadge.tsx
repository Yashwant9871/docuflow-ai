import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/mock/types";

const map: Record<DocumentStatus, { label: string; cls: string }> = {
  UPLOADED:           { label: "Uploaded",           cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  PROCESSING:         { label: "Processing",         cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  EXTRACTED:          { label: "Extracted",          cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  VALIDATION_FAILED:  { label: "Validation Failed",  cls: "bg-red-50 text-red-700 ring-red-200" },
  NEEDS_REVIEW:       { label: "Needs Review",       cls: "bg-amber-50 text-amber-800 ring-amber-200" },
  READY_FOR_APPROVAL: { label: "Ready for Approval", cls: "bg-cyan-50 text-cyan-700 ring-cyan-200" },
  APPROVED:           { label: "Approved",           cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  REJECTED:           { label: "Rejected",           cls: "bg-red-50 text-red-700 ring-red-200" },
  EXPORTED:           { label: "Exported",           cls: "bg-slate-100 text-slate-600 ring-slate-300" },
};

export function StatusBadge({ status, className }: { status: DocumentStatus; className?: string }) {
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap", m.cls, className)}>
      {m.label}
    </span>
  );
}
