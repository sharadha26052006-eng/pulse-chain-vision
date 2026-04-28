import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const [prefs, setPrefs] = useState({
    pushAlerts: true, emailDigest: true, weatherAlerts: true,
    congestionAlerts: true, criticalOnly: false, weeklyReport: true,
  });
  const [thresh, setThresh] = useState(70);

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Settings</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Preferences</h1>
        </div>

        <Section title="Notifications">
          <Toggle label="Push alerts" desc="Real-time push notifications on mobile." value={prefs.pushAlerts} onChange={(v) => setPrefs({ ...prefs, pushAlerts: v })} />
          <Toggle label="Email digest" desc="Daily summary email at 8 AM." value={prefs.emailDigest} onChange={(v) => setPrefs({ ...prefs, emailDigest: v })} />
          <Toggle label="Weekly report" desc="Performance summary every Monday." value={prefs.weeklyReport} onChange={(v) => setPrefs({ ...prefs, weeklyReport: v })} />
        </Section>

        <Section title="Alert types">
          <Toggle label="Weather disruptions" value={prefs.weatherAlerts} onChange={(v) => setPrefs({ ...prefs, weatherAlerts: v })} />
          <Toggle label="Port & route congestion" value={prefs.congestionAlerts} onChange={(v) => setPrefs({ ...prefs, congestionAlerts: v })} />
          <Toggle label="Critical only" desc="Filter out low/medium severity alerts." value={prefs.criticalOnly} onChange={(v) => setPrefs({ ...prefs, criticalOnly: v })} />
        </Section>

        <Section title="Risk threshold">
          <div className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Trigger alerts when risk score exceeds</span>
              <span className="font-semibold">{thresh}</span>
            </div>
            <input type="range" min={0} max={100} value={thresh} onChange={(e) => setThresh(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0</span><span>100</span></div>
          </div>
        </Section>

        <div className="flex gap-3">
          <button onClick={() => toast.success("Settings saved")} className="flex-1 py-2.5 rounded-lg text-primary-foreground font-semibold" style={{ background: "var(--gradient-primary)" }}>Save changes</button>
          <button onClick={() => { logout(); nav({ to: "/login" }); }} className="px-4 py-2.5 rounded-lg bg-destructive/15 text-destructive border border-destructive/30 font-medium hover:bg-destructive/25">Sign out</button>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">{title}</h3>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">{children}</div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full p-4 flex items-center justify-between gap-3 hover:bg-accent/30 transition text-left">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      <span className={`relative h-6 w-11 rounded-full transition shrink-0 ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
