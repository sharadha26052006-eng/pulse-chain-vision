import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { shipments } from "@/lib/sample-data";
import { RiskBadge, StatusPill } from "@/components/RiskBadge";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export const Route = createFileRoute("/shipments")({ component: Shipments });

function Shipments() {
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [sort, setSort] = useState<"risk" | "eta" | "ref">("risk");

  const regions = useMemo(() => ["all", ...new Set(shipments.map((s) => s.region))], []);

  const filtered = useMemo(() => {
    let res = shipments.filter((s) => {
      const matchQ = !q || s.reference.toLowerCase().includes(q.toLowerCase()) || s.carrier.toLowerCase().includes(q.toLowerCase()) || s.origin.code.toLowerCase().includes(q.toLowerCase()) || s.destination.code.toLowerCase().includes(q.toLowerCase());
      const matchR = risk === "all" || s.riskLevel === risk;
      const matchReg = region === "all" || s.region === region;
      return matchQ && matchR && matchReg;
    });
    res = [...res].sort((a, b) => sort === "risk" ? b.riskScore - a.riskScore : sort === "eta" ? a.eta.localeCompare(b.eta) : a.reference.localeCompare(b.reference));
    return res;
  }, [q, risk, region, sort]);

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Live Shipments</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{shipments.length} active shipments</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by reference, carrier, port..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select label="Risk" value={risk} onChange={setRisk} options={[{ v: "all", l: "All risk" }, { v: "critical", l: "Critical" }, { v: "high", l: "High" }, { v: "medium", l: "Medium" }, { v: "low", l: "Low" }]} icon={Filter} />
            <Select label="Region" value={region} onChange={setRegion} options={regions.map((r) => ({ v: r, l: r === "all" ? "All regions" : r }))} icon={Filter} />
            <Select label="Sort" value={sort} onChange={(v) => setSort(v as "risk" | "eta" | "ref")} options={[{ v: "risk", l: "Risk score" }, { v: "eta", l: "ETA" }, { v: "ref", l: "Reference" }]} icon={ArrowUpDown} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">No shipments match your filters.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-3 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              <div className="col-span-2">Reference</div>
              <div className="col-span-3">Route</div>
              <div className="col-span-2">Carrier</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2 text-right">Risk</div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((s) => (
                <Link key={s.id} to="/shipments/$id" params={{ id: s.id }} className="block px-4 py-4 hover:bg-accent/40 transition">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-12 lg:col-span-2 flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{s.reference}</span>
                      <span className="lg:hidden"><RiskBadge level={s.riskLevel} /></span>
                    </div>
                    <div className="col-span-12 lg:col-span-3 text-sm text-muted-foreground">
                      <span className="text-foreground">{s.origin.code}</span> → <span className="text-foreground">{s.destination.code}</span>
                      <div className="text-xs">{s.origin.name.split(",")[0]} to {s.destination.name.split(",")[0]}</div>
                    </div>
                    <div className="col-span-6 lg:col-span-2 text-sm text-muted-foreground">{s.carrier}<div className="text-xs capitalize">{s.mode}</div></div>
                    <div className="col-span-6 lg:col-span-1"><StatusPill status={s.status} /></div>
                    <div className="col-span-12 lg:col-span-2">
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{s.progress}%</span>{s.etaDelayHours > 0 && <span className="text-destructive">+{s.etaDelayHours}h</span>}</div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: s.riskLevel === "critical" || s.riskLevel === "high" ? "var(--gradient-risk)" : "var(--gradient-primary)" }} />
                      </div>
                    </div>
                    <div className="hidden lg:flex col-span-2 justify-end"><RiskBadge level={s.riskLevel} score={s.riskScore} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Select({ label, value, onChange, options, icon: Icon }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none pl-8 pr-7 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
