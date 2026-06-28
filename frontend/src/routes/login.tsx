import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDemoUsers, useLoginMutation } from "@/hooks/useAuth";
import { useAuth } from "@/lib/auth";
import { RoleBadge } from "@/components/badges";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — DocuFlow AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@docuflow.ai");
  const [password, setPassword] = useState("Admin@123");
  const demoUsers = getDemoUsers();
  const loginMutation = useLoginMutation();

  const demoPasswords: Record<string, string> = {
    'admin@docuflow.ai': 'Admin@123',
    'processor@docuflow.ai': 'Processor@123',
    'reviewer@docuflow.ai': 'Reviewer@123',
    'approver@docuflow.ai': 'Approver@123',
  };

  const doLogin = async (em: string, pw?: string) => {
    const loginPassword = pw || password;
    loginMutation.mutate({ email: em, password: loginPassword }, {
      onSuccess: (u) => {
        if (!u) {
          toast.error("Incorrect email or password");
          return;
        }
        setUser(u);
        toast.success(`Welcome, ${u.name}`);
        router.navigate({ to: "/dashboard" });
      },
      onError: () => {
        toast.error("Incorrect email or password");
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col justify-between rounded-2xl bg-sidebar p-10 text-sidebar-foreground shadow-xl min-h-[560px]">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold tracking-tight">DocuFlow AI</div>
            </div>
            <h1 className="mt-10 text-3xl font-semibold leading-tight tracking-tight">
              AI Document & Invoice<br />Intelligence Platform
            </h1>
            <p className="mt-4 max-w-md text-sm text-sidebar-foreground/70">
              Extract, validate, route, approve, and export invoices with a complete audit trail —
              built for finance, procurement, and operations teams.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-sidebar-foreground/80">
              {[
                "AI extraction with confidence scoring",
                "Configurable validation rules",
                "Reviewer queues & exception management",
                "Enterprise audit & approval workflows",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[11px] text-sidebar-foreground/50">
            Demo system built to showcase enterprise AI workflow automation.
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-base font-semibold">DocuFlow AI</div>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Sign in to your workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use a demo account below — no real credentials needed.</p>

          <form
            onSubmit={(e) => { e.preventDefault(); doLogin(email); }}
            className="mt-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Sign in
            </Button>
          </form>

          <div className="mt-8">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Demo accounts</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    const pw = demoPasswords[u.email] || 'demo';
                    setEmail(u.email);
                    setPassword(pw);
                    doLogin(u.email, pw);
                  }}
                  className="group flex items-center justify-between rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{u.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <RoleBadge role={u.role} />
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
            Frontend prototype using mock data. No backend, OCR, or AI API is called.
          </p>
        </div>
      </div>
    </div>
  );
}
