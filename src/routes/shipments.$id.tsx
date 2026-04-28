import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { shipments } from "@/lib/sample-data";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { WorldMap } from "@/components/WorldMap";
import { ArrowLeft, MapPin, Package, Truck, AlertTriangle, Lightbulb, Clock, Navigation } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shipments/$id")({
  loader: ({ params }) => {
    const s = shipments.find((x) => x.id === params.id);
    if (!s) throw notFound();
    return { shipment: s };
  },
  component: ShipmentDetail,
  notFoundComponent: () => (
    <AppShell><div className="p-8 text-center"><p className="text-muted-foreground">Shipment not found.</p><Link to="/shipments" className="text-primary text-sm">Back to list</Link></div></AppShell>
  ),
});

function ShipmentDetail() {
  const { shipment: s } = Route.useLoaderData();

  const recommendations = [
    s.riskLevel === "critical" && { title: "Reroute via alternate corridor", desc: "Avoid forecast disruption. Estimated +18h ETA, but reduces miss probability by 64%.", impact: "+18h ETA · −64% delay risk" },
    s.riskLevel === "high" && { title: "Switch to expedited transport", desc: "Air-freight critical SKUs from current hub.", impact: "−2 days · +$4,200 cost" },
    { title: "Notify downstream stakeholders", desc: "Auto-send updated ETA to consignee and inventory team.", impact: "Comms ready" },
    { title: "Pre-clear customs documentation", desc: "Submit commercial invoices and HS codes ahead of arrival.", impact: "−12h dwell time" },
  ].filter(Boolean) as { title: string; desc: string; impact: string }[];

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-5">
        <Link to="/shipments" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All shipments</Link>

        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight font-mono">{s.reference}</h1>
              <StatusPill status={s.status} />
              <RiskBadge level={s.riskLevel} score={s.riskScore} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{s.carrier} · {s.mode.toUpperCase()} · {s.region}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toast.success("Stakeholders notified")} className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-medium hover:bg-accent">Notify team</button>
            <button onClick={() => toast.success("Reroute requested")} className="px-4 py-2 rounded-lg text-primary-foreground text-sm font-semibold" style={{ background: "var(--gradient-primary)" }}>Take action</button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card icon={MapPin} label="Origin" value={s.origin.name} sub={s.origin.code} />
          <Card icon={Navigation} label="Current location" value={s.currentLocation.name} sub={`${s.progress}% complete`} />
          <Card icon={Package} label="Destination" value={s.destination.name} sub={s.destination.code} />
          <Card icon={Clock} label="ETA" value={new Date(s.eta).toLocaleDateString(undefined, { month: "short", day: "numeric" })} sub={s.etaDelayHours > 0 ? `${s.etaDelayHours}h delay forecast` : "On schedule"} tone={s.etaDelayHours > 0 ? "danger" : "success"} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Route & live position</h3>
            <WorldMap shipments={[s]} selectedId={s.id} height={340} />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Risk factors</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Composite risk score</span>
                  <span className="text-2xl font-bold" style={{ color: s.riskLevel === "critical" ? "oklch(0.62 0.24 27)" : s.riskLevel === "high" ? "oklch(0.65 0.23 30)" : s.riskLevel === "medium" ? "oklch(0.78 0.16 75)" : "oklch(0.7 0.17 155)" }}>{s.riskScore}</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.riskScore}%`, background: s.riskLevel === "critical" || s.riskLevel === "high" ? "var(--gradient-risk)" : "var(--gradient-primary)" }} />
                </div>
              </div>
              {s.riskFactors.map((f) => (
                <div key={f} className="flex items-start gap-2 p-2.5 rounded-lg border border-border">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Timeline</h3>
            <div className="space-y-0">
              {s.timeline.map((t, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${t.status === "done" ? "bg-success" : t.status === "current" ? "bg-primary ring-4 ring-primary/20" : "bg-muted border-2 border-border"}`} />
                    {i < s.timeline.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{t.event}</p>
                      <span className="text-[11px] text-muted-foreground">{t.ts}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" /> Recommended actions</h3>
            <div className="space-y-2.5">
              {recommendations.map((r, i) => (
                <div key={i} className="p-3 rounded-lg border border-border hover:border-primary/40 transition">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{r.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{r.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-primary font-medium">{r.impact}</span>
                    <button onClick={() => toast.success("Action queued")} className="text-xs px-2.5 py-1 rounded-md bg-primary/15 text-primary hover:bg-primary/25 font-medium">Apply</button>
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

function Card({ icon: Icon, label, value, sub, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; tone?: "success" | "danger" }) {
  const subCls = tone === "danger" ? "text-destructive" : tone === "success" ? "text-success" : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-base font-semibold leading-tight">{value}</div>
      <div className={`text-xs mt-1 ${subCls}`}>{sub}</div>
    </div>
  );
}
