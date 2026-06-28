import { createFileRoute, Outlet, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard, Inbox, Upload, ClipboardList, AlertTriangle,
  Building2, FileText, ScrollText, Settings, LogOut, Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RoleBadge } from "@/components/badges";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents", label: "Document Inbox", icon: Inbox },
  { to: "/documents/upload", label: "Upload Document", icon: Upload },
  { to: "/review", label: "Review Queue", icon: ClipboardList },
  { to: "/exceptions", label: "Exceptions", icon: AlertTriangle },
  { to: "/vendors", label: "Vendors", icon: Building2 },
  { to: "/purchase-orders", label: "Purchase Orders", icon: FileText },
  { to: "/audit", label: "Audit Trail", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AppLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const token = localStorage.getItem("docuflow.token");
      if (!token) router.navigate({ to: "/login" });
    }
  }, [user, router]);

  const currentLabel = nav.find((n) => pathname.startsWith(n.to))?.label ?? "DocuFlow";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">DocuFlow AI</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Enterprise</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.to === "/documents"
                ? pathname === "/documents"
                : pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/60">
          <div className="font-medium text-sidebar-foreground/80">Portfolio Demo</div>
          <div className="mt-0.5">Demo system built to showcase enterprise AI workflow automation.</div>
          <div className="mt-3 text-sidebar-foreground/50">DocuFlow AI · Enterprise Document Intelligence</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">DocuFlow AI</div>
            <div className="text-sm font-semibold text-foreground">{currentLabel}</div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <RoleBadge role={user.role} />
              <div className="hidden sm:flex flex-col items-end">
                <div className="text-sm font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {user.initials}
              </div>
              <button
                onClick={() => { logout(); router.navigate({ to: "/login" }); }}
                className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
