import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WorldMap } from "@/components/WorldMap";
import { shipments, facilities } from "@/lib/sample-data";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  const [selected, setSelected] = useState<string | undefined>();
  const sel = shipments.find((s) => s.id === selected);

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Network Map</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Global route monitoring</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <WorldMap shipments={shipments} selectedId={selected} onSelect={setSelected} height={560} />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-3 text-sm">{sel ? "Selected shipment" : "Tap any route"}</h3>
              {sel ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link to="/shipments/$id" params={{ id: sel.id }} className="font-mono text-sm font-semibold text-primary hover:underline">{sel.reference}</Link>
                    <StatusPill status={sel.status} />
                  </div>
                  <RiskBadge level={sel.riskLevel} score={sel.riskScore} />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Carrier: <span className="text-foreground">{sel.carrier}</span></div>
                    <div>{sel.origin.code} → {sel.destination.code}</div>
                    <div>Progress: {sel.progress}%</div>
                  </div>
                  <Link to="/shipments/$id" params={{ id: sel.id }} className="block text-center py-2 rounded-lg text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Open detail</Link>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Click a shipment route on the map to inspect it. Critical routes pulse in red.</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Facilities</h3>
              <div className="space-y-2">
                {facilities.map((f) => (
                  <div key={f.id} className="p-2.5 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{f.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${f.status === "congested" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>{f.status}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{f.type}</span><span>{f.utilization}% util</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted mt-1 overflow-hidden">
                      <div className="h-full" style={{ width: `${f.utilization}%`, background: f.utilization > 85 ? "var(--gradient-risk)" : "var(--gradient-primary)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
