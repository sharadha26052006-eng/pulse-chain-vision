import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { User, Mail, Shield, Building2 } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Profile</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Your account</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-md bg-primary/15 text-primary capitalize">{user.role.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          <Row icon={User} label="Full name" value={user.name} />
          <Row icon={Mail} label="Email" value={user.email} />
          <Row icon={Shield} label="Role" value={user.role.replace("_", " ")} />
          <Row icon={Building2} label="Organization" value="Acme Logistics Inc." />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat n="184" l="Shipments managed" />
          <Stat n="42" l="Disruptions resolved" />
          <Stat n="98%" l="Response rate" />
        </div>
      </div>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium capitalize">{value}</div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-xl border border-border p-4 text-center" style={{ background: "var(--gradient-card)" }}>
      <div className="text-2xl font-bold">{n}</div>
      <div className="text-xs text-muted-foreground">{l}</div>
    </div>
  );
}
