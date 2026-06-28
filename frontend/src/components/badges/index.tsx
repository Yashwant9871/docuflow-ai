import { cn } from "@/lib/utils";
import type { Severity, Priority, Role } from "@/mock/types";

export { StatusBadge } from "./StatusBadge";

const sevMap: Record<Severity, string> = {
  CRITICAL: "bg-red-50 text-red-700 ring-red-200",
  HIGH: "bg-orange-50 text-orange-700 ring-orange-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
  LOW: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset", sevMap[severity])}>
      {severity}
    </span>
  );
}

const prMap: Record<Priority, string> = {
  HIGH: "bg-red-50 text-red-700 ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", prMap[priority])}>
      {priority}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls =
    pct >= 90 ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : pct >= 75 ? "bg-amber-50 text-amber-800 ring-amber-200"
    : "bg-red-50 text-red-700 ring-red-200";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset tabular-nums", cls)}>
      {pct}%
    </span>
  );
}

const roleMap: Record<Role, string> = {
  ADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
  PROCESSOR: "bg-blue-50 text-blue-700 ring-blue-200",
  REVIEWER: "bg-amber-50 text-amber-800 ring-amber-200",
  APPROVER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", roleMap[role])}>
      {role}
    </span>
  );
}
