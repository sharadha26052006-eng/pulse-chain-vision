import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ChevronRight, Map, AlertTriangle, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const slides = [
  { icon: Activity, title: "Real-time visibility", desc: "Track every shipment across your global network with sub-minute updates from carriers, ports, and IoT sensors.", accent: "oklch(0.65 0.18 245)" },
  { icon: AlertTriangle, title: "Predict disruptions", desc: "AI risk scoring flags weather, congestion, and bottlenecks before they impact ETAs.", accent: "oklch(0.65 0.23 30)" },
  { icon: Map, title: "Act with confidence", desc: "Get rerouting recommendations and coordinate response across your team.", accent: "oklch(0.7 0.17 155)" },
  { icon: BarChart3, title: "Operational intelligence", desc: "Trends, KPIs, and carrier performance — everything you need in one operations cockpit.", accent: "oklch(0.78 0.16 75)" },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const s = slides[i];
  const Icon = s.icon;
  const last = i === slides.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-10 max-w-md mx-auto">
      <div className="flex justify-end">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Skip</Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center gap-8">
        <div className="h-28 w-28 rounded-3xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${s.accent}, oklch(0.55 0.2 250))`, boxShadow: `0 0 60px -10px ${s.accent}` }}>
          <Icon className="h-14 w-14 text-primary-foreground" strokeWidth={2} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">{s.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-8">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-1.5 bg-muted"}`} />
        ))}
      </div>

      {last ? (
        <div className="space-y-3">
          <Link to="/signup" className="block w-full py-3.5 rounded-xl font-semibold text-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Get Started</Link>
          <Link to="/login" className="block w-full py-3.5 rounded-xl font-semibold text-center bg-secondary text-secondary-foreground border border-border">I have an account</Link>
        </div>
      ) : (
        <button onClick={() => setI(i + 1)} className="w-full py-3.5 rounded-xl font-semibold text-primary-foreground flex items-center justify-center gap-2" style={{ background: "var(--gradient-primary)" }}>
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
