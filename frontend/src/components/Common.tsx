import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KPICard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "info" | "danger";
}) {
  const toneMap = {
    default: "text-slate-500",
    success: "text-emerald-600",
    warning: "text-amber-600",
    info: "text-blue-600",
    danger: "text-red-600",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        {icon && <div className={cn("rounded-md p-1.5 bg-slate-50", toneMap[tone])}>{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description && <div className="mt-1 max-w-md text-sm text-muted-foreground">{description}</div>}
    </div>
  );
}
