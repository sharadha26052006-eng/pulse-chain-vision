import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Bell, Check, AlertTriangle, Package, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: Notifications });

interface Notif { id: string; title: string; body: string; time: string; type: "alert" | "shipment" | "system" | "team"; read: boolean }

const seed: Notif[] = [
  { id: "n1", title: "Critical risk on SP-2025003", body: "Risk score crossed 90 threshold due to typhoon forecast.", time: "5m ago", type: "alert", read: false },
  { id: "n2", title: "Shipment SP-2025008 cleared customs", body: "Now in transit to final destination.", time: "32m ago", type: "shipment", read: false },
  { id: "n3", title: "@ana mentioned you", body: "Need your sign-off on rerouting plan for APAC corridor.", time: "1h ago", type: "team", read: false },
  { id: "n4", title: "Weekly performance digest ready", body: "Network on-time rate up 2.1% this week.", time: "3h ago", type: "system", read: true },
  { id: "n5", title: "Port LA congestion alert", body: "12 of your shipments may be impacted.", time: "5h ago", type: "alert", read: true },
  { id: "n6", title: "Carrier MSC delay reported", body: "Vessel MSC OSCAR — 36h delay confirmed.", time: "1d ago", type: "shipment", read: true },
];

const iconFor = { alert: AlertTriangle, shipment: Package, team: MessageSquare, system: Bell };

function Notifications() {
  const [items, setItems] = useState(seed);
  const unread = items.filter((i) => !i.read).length;

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Inbox</p>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">{unread} unread</p>
          </div>
          {unread > 0 && (
            <button onClick={() => setItems((it) => it.map((i) => ({ ...i, read: true })))} className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border hover:bg-accent flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {items.map((n) => {
            const Icon = iconFor[n.type];
            return (
              <button key={n.id} onClick={() => setItems((it) => it.map((x) => x.id === n.id ? { ...x, read: true } : x))} className={`w-full text-left p-4 flex gap-3 transition hover:bg-accent/40 ${!n.read ? "bg-primary/5" : ""}`}>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${n.type === "alert" ? "bg-destructive/15 text-destructive" : n.type === "shipment" ? "bg-primary/15 text-primary" : n.type === "team" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
