import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const nav = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      nav({ to: user ? "/dashboard" : "/onboarding" });
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, user, nav]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 50% 40%, oklch(0.55 0.2 250 / 0.4), transparent 60%)" }} />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-20 w-20 rounded-2xl flex items-center justify-center shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Activity className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-background animate-pulse" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">SupplyPulse</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">Logistics Intelligence</p>
        </div>
        <div className="mt-4 h-1 w-48 rounded-full bg-muted overflow-hidden">
          <div className="h-full shimmer" style={{ background: "var(--gradient-primary)" }} />
        </div>
      </div>
    </div>
  );
}
