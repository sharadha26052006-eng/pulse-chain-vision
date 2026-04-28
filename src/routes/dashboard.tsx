import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { shipments, alerts, trendData, regionData } from "@/lib/sample-data";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { WorldMap } from "@/components/WorldMap";
import { Activity, AlertTriangle, Package, TrendingUp, ArrowUpRight, Clock, Zap } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);
  if (!user) return null;

  const total = shipments.length;
  const atRisk = shipments.filter((s) => s.riskLevel === "high" || s.riskLevel === "critical").length;
  const delayed = shipments.filter((s) => s.status === "delayed").length;
  const onTime = total - delayed;
  const critical = shipments.filter((s) => s.riskLevel === "critical");

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations Cockpit</p>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Good {greet()}, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground mt-1">Network health snapshot · live as of {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/30">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> All systems operational
            </span>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <KPI label="Active Shipments" value={total.toString()} delta="+12%" icon={Package} tone="primary" />
          <KPI label="On-time Rate" value={`${Math.round((onTime / total) * 100)}%`} delta="+2.1%" icon={TrendingUp} tone="success" />
          <KPI label="At-risk" value={atRisk.toString()} delta="+3" icon={AlertTriangle} tone="warning" />
          <KPI label="Delayed" value={delayed.toString()} delta="−1" icon={Clock} tone="danger" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Network performance — 7 days</h3>
                <p className="text-xs text-muted-foreground">On-time vs delayed shipments</p>
              </div>
              <Link to="/analytics" className="text-xs text-primary hover:underline flex items-center gap-1">View analytics <ArrowUpRight className="h-3 w-3" /></Link>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.18 245)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="oklch(0.65 0.18 245)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.23 30)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.65 0.23 30)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 252)" />
                  <XAxis dataKey="day" stroke="oklch(0.68 0.02 252)" fontSize={11} />
                  <YAxis stroke="oklch(0.68 0.02 252)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.22 0.025 252)", border: "1px solid oklch(0.3 0.02 252)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="onTime" stroke="oklch(0.65 0.18 245)" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="atRisk" stroke="oklch(0.65 0.23 30)" fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-warning" /> Critical alerts</h3>
              <Link to="/alerts" className="text-xs text-primary hover:underline">All</Link>
            </div>
            <div className="space-y-3">
              {alerts.filter((a) => a.severity === "critical" || a.severity === "high").slice(0, 4).map((a) => (
                <Link key={a.id} to="/alerts" className="block p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-tight">{a.title}</span>
                    <RiskBadge level={a.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{a.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{a.region} · {a.timestamp}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Live shipment map</h3>
              <p className="text-xs text-muted-foreground">Click a route to inspect</p>
            </div>
            <Link to="/map" className="text-xs text-primary hover:underline flex items-center gap-1">Open map <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <WorldMap shipments={shipments} height={380} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">High-priority shipments</h3>
              <Link to="/shipments" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {critical.slice(0, 5).map((s) => (
                <Link key={s.id} to="/shipments/$id" params={{ id: s.id }} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/40 transition">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{s.reference}</span>
                      <StatusPill status={s.status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{s.origin.code} → {s.destination.code} · {s.carrier}</p>
                  </div>
                  <RiskBadge level={s.riskLevel} score={s.riskScore} />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Regional risk distribution</h3>
            <div className="space-y-3">
              {regionData.map((r) => (
                <div key={r.region}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{r.region}</span>
                    <span className="text-muted-foreground">{r.shipments} shipments · risk {r.risk}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.risk}%`, background: r.risk > 60 ? "var(--gradient-risk)" : "var(--gradient-primary)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function KPI({ label, value, delta, icon: Icon, tone }: { label: string; value: string; delta: string; icon: React.ComponentType<{ className?: string }>; tone: "primary" | "success" | "warning" | "danger" }) {
  const toneCls = {
    primary: "text-primary bg-primary/15",
    success: "text-success bg-success/15",
    warning: "text-warning bg-warning/15",
    danger: "text-destructive bg-destructive/15",
  }[tone];
  return (
    <div className="rounded-xl border border-border p-4 lg:p-5" style={{ background: "var(--gradient-card)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneCls}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs text-muted-foreground">{delta}</span>
      </div>
      <div className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}
