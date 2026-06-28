import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Common";
import { RoleBadge } from "@/components/badges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/mock/types";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — DocuFlow AI" }] }),
  component: SettingsPage,
});

const rolePerms: { role: Role; description: string; permissions: string[] }[] = [
  { role: "ADMIN", description: "Full system access including user and rule management.", permissions: ["Manage users", "Manage validation rules", "Export data", "View audit trail"] },
  { role: "PROCESSOR", description: "Uploads documents and runs initial extraction.", permissions: ["Upload documents", "Run extraction", "View own documents"] },
  { role: "REVIEWER", description: "Reviews extracted data and resolves exceptions.", permissions: ["Edit extracted fields", "Resolve exceptions", "Send for approval"] },
  { role: "APPROVER", description: "Approves or rejects documents ready for sign-off.", permissions: ["Approve documents", "Reject documents", "View linked POs"] },
];

const validationRules = [
  { name: "Vendor must exist", severity: "HIGH", enabled: true },
  { name: "PO number must exist", severity: "HIGH", enabled: true },
  { name: "Invoice total must not exceed PO remaining amount", severity: "CRITICAL", enabled: true },
  { name: "Duplicate invoice check", severity: "CRITICAL", enabled: true },
  { name: "Required fields check", severity: "MEDIUM", enabled: true },
  { name: "Future invoice date check", severity: "HIGH", enabled: true },
  { name: "High amount approval threshold", severity: "MEDIUM", enabled: true },
];

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Workspace profile, roles, validation rules, and preferences." />

      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
          <TabsTrigger value="prefs">System Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name" defaultValue={user?.name ?? ""} />
            <Field label="Email" defaultValue={user?.email ?? ""} />
            <Field label="Role" defaultValue={user?.role ?? ""} disabled />
            <Field label="Time zone" defaultValue="America/Los_Angeles" />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rolePerms.map((r) => (
            <div key={r.role} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <RoleBadge role={r.role} />
                <span className="text-xs text-muted-foreground">{r.permissions.length} permissions</span>
              </div>
              <div className="mt-3 text-sm text-foreground">{r.description}</div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {r.permissions.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-foreground/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="rules" className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Rule</th>
                <th className="px-4 py-2.5 text-left font-medium">Severity</th>
                <th className="px-4 py-2.5 text-right font-medium">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {validationRules.map((r) => (
                <tr key={r.name}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.severity}</td>
                  <td className="px-4 py-3 text-right"><Switch defaultChecked={r.enabled} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="prefs" className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Default currency" defaultValue="USD" />
            <Field label="Confidence threshold" defaultValue="0.80" />
          </div>
          <div className="space-y-3">
            <Toggle label="Auto-route exceptions to reviewers" defaultChecked />
            <Toggle label="Require approval above $10,000" defaultChecked />
            <Toggle label="Send digest email to approvers daily" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, defaultValue, disabled }: { label: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} disabled={disabled} />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
      <div className="text-sm text-foreground">{label}</div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
