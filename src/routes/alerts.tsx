import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { alerts, type Alert } from "@/lib/sample-data";
import { RiskBadge } from "@/components/RiskBadge";
import { Cloud, Truck, AlertTriangle, FileWarning, Wind, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });

const iconFor: Record<Alert["type"], React.ComponentType<{ className?: string }>> = {
  weather: Cloud, congestion: Truck, delay: AlertTriangle, bottleneck: Wind, customs: FileWarning,
};

function AlertsPage() {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Disruption Center</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Alerts & disruptions</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} active disruption{filtered.length === 1 ? "" : "s"} affecting your network</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "critical", "high", "medium", "low"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${filter === f ? "bg-primary/15 text-primary border-primary/30" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((a) => {
            const Icon = iconFor[a.type];
            return (
              <div key={a.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition">
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${a.severity === "critical" ? "bg-destructive/15 text-destructive pulse-danger" : a.severity === "high" ? "bg-danger/15 text-danger" : a.severity === "medium" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold leading-snug">{a.title}</h3>
                      <RiskBadge level={a.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{a.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{a.type}</span>
                      <span>·</span>
                      <span>{a.region}</span>
                      <span>·</span>
                      <span>{a.timestamp}</span>
                      {a.shipmentId && (<><span>·</span><Link to="/shipments/$id" params={{ id: a.shipmentId }} className="text-primary hover:underline font-medium">View shipment</Link></>)}
                    </div>
                    {a.recommendation && (
                      <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm">
                          <span className="font-medium text-warning">Recommendation: </span>
                          <span className="text-foreground">{a.recommendation}</span>
                        </div>
                        <button onClick={() => toast.success("Action initiated")} className="text-xs px-2.5 py-1 rounded-md bg-warning text-warning-foreground font-medium">Act</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
