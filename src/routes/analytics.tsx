import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { trendData, regionData } from "@/lib/sample-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export const Route = createFileRoute("/analytics")({ component: Analytics });

function Analytics() {
  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Network Analytics</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Performance & trends</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile label="Avg ETA accuracy" value="94.2%" trend="up" delta="+1.8%" />
          <Tile label="Avg dwell time" value="3.4d" trend="down" delta="−0.6d" />
          <Tile label="Disruptions resolved" value="187" trend="up" delta="+24" />
          <Tile label="Cost of delays" value="$1.2M" trend="down" delta="−$240K" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Delivery performance trends</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 252)" />
                  <XAxis dataKey="day" stroke="oklch(0.68 0.02 252)" fontSize={11} />
                  <YAxis stroke="oklch(0.68 0.02 252)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.22 0.025 252)", border: "1px solid oklch(0.3 0.02 252)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="onTime" stroke="oklch(0.7 0.17 155)" strokeWidth={2.5} dot={{ r: 3 }} name="On time %" />
                  <Line type="monotone" dataKey="delayed" stroke="oklch(0.65 0.23 30)" strokeWidth={2.5} dot={{ r: 3 }} name="Delayed %" />
                  <Line type="monotone" dataKey="atRisk" stroke="oklch(0.78 0.16 75)" strokeWidth={2.5} dot={{ r: 3 }} name="At risk" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Shipments & risk by region</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 252)" />
                  <XAxis dataKey="region" stroke="oklch(0.68 0.02 252)" fontSize={11} />
                  <YAxis stroke="oklch(0.68 0.02 252)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "oklch(0.22 0.025 252)", border: "1px solid oklch(0.3 0.02 252)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="shipments" fill="oklch(0.65 0.18 245)" radius={[6, 6, 0, 0]} name="Shipments" />
                  <Bar dataKey="risk" fill="oklch(0.65 0.23 30)" radius={[6, 6, 0, 0]} name="Avg risk score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Carrier performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4">Carrier</th><th className="py-2 pr-4">Shipments</th><th className="py-2 pr-4">On-time</th><th className="py-2 pr-4">Avg delay</th><th className="py-2">Risk index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { c: "Maersk Line", s: 412, o: 96, d: "0.8d", r: 28 },
                  { c: "DHL Global", s: 298, o: 94, d: "0.4d", r: 22 },
                  { c: "MSC Cargo", s: 256, o: 81, d: "2.1d", r: 68 },
                  { c: "FedEx Freight", s: 187, o: 97, d: "0.3d", r: 19 },
                  { c: "Hapag-Lloyd", s: 124, o: 88, d: "1.2d", r: 44 },
                ].map((row) => (
                  <tr key={row.c}>
                    <td className="py-3 pr-4 font-medium">{row.c}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.s}</td>
                    <td className="py-3 pr-4"><span className={row.o > 90 ? "text-success" : "text-warning"}>{row.o}%</span></td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.d}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden"><div className="h-full" style={{ width: `${row.r}%`, background: row.r > 50 ? "var(--gradient-risk)" : "var(--gradient-primary)" }} /></div>
                        <span className="text-xs">{row.r}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Tile({ label, value, trend, delta }: { label: string; value: string; trend: "up" | "down"; delta: string }) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  const goodUp = !label.toLowerCase().includes("delay") && !label.toLowerCase().includes("cost") && !label.toLowerCase().includes("dwell");
  const positive = (trend === "up") === goodUp;
  return (
    <div className="rounded-xl border border-border p-4" style={{ background: "var(--gradient-card)" }}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tracking-tight mt-1">{value}</div>
      <div className={`flex items-center gap-1 text-xs mt-1 ${positive ? "text-success" : "text-destructive"}`}>
        <Icon className="h-3 w-3" /> {delta}
      </div>
    </div>
  );
}
