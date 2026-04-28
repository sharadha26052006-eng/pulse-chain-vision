import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { Shield, Users, Database, Activity } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (user.role !== "admin") nav({ to: "/dashboard" });
  }, [user, loading, nav]);
  if (!user || user.role !== "admin") return null;

  const users = [
    { name: "Sarah Chen", email: "sarah@acme.com", role: "admin", status: "active", last: "now" },
    { name: "Marcus Reyes", email: "marcus@acme.com", role: "ops_manager", status: "active", last: "5m ago" },
    { name: "Ana Petrova", email: "ana@acme.com", role: "ops_manager", status: "active", last: "1h ago" },
    { name: "Liam O'Brien", email: "liam@acme.com", role: "analyst", status: "active", last: "3h ago" },
    { name: "Yuki Tanaka", email: "yuki@acme.com", role: "analyst", status: "invited", last: "—" },
  ];

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/15 text-primary"><Shield className="h-5 w-5" /></div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin Panel</p>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Workspace administration</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile icon={Users} label="Team members" value="14" />
          <Tile icon={Activity} label="API calls (24h)" value="42.8K" />
          <Tile icon={Database} label="Tracked shipments" value="2,481" />
          <Tile icon={Shield} label="Policies active" value="8" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Team members</h3>
            <button className="text-xs px-3 py-1.5 rounded-lg text-primary-foreground font-medium" style={{ background: "var(--gradient-primary)" }}>Invite member</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 px-4">User</th><th className="py-2 px-4">Role</th><th className="py-2 px-4">Status</th><th className="py-2 px-4">Last active</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.email}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">{u.name.split(" ").map((p) => p[0]).join("")}</div>
                      <div><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-muted-foreground">{u.role.replace("_", " ")}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded ${u.status === "active" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{u.status}</span></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{u.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-3">System status</h3>
          <div className="space-y-2">
            {[
              { s: "Shipment ingestion API", u: "operational" },
              { s: "Risk scoring engine", u: "operational" },
              { s: "Weather data feed", u: "operational" },
              { s: "Carrier integrations", u: "degraded" },
            ].map((x) => (
              <div key={x.s} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{x.s}</span>
                <span className={`text-xs flex items-center gap-1.5 ${x.u === "operational" ? "text-success" : "text-warning"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${x.u === "operational" ? "bg-success" : "bg-warning"} animate-pulse`} />
                  {x.u}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Tile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4" style={{ background: "var(--gradient-card)" }}>
      <Icon className="h-4 w-4 text-primary mb-2" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
