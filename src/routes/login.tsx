import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("ops@supplypulse.io");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("ops_manager");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.includes("@")) { setErr("Enter a valid email"); return; }
    if (password.length < 6) { setErr("Password must be 6+ characters"); return; }
    setLoading(true);
    try {
      await login(email, password, role);
      toast.success("Welcome back to SupplyPulse");
      nav({ to: "/dashboard" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12" style={{ background: "var(--gradient-primary)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-md text-primary-foreground space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-bold leading-tight">Operate global supply chains with confidence.</h1>
          <p className="text-white/80 leading-relaxed">Predictive disruption intelligence trusted by ops teams managing millions of shipments worldwide.</p>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
            <Stat n="2.4M" l="Shipments" />
            <Stat n="98.7%" l="Uptime" />
            <Stat n="−42%" l="Late deliveries" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <div className="lg:hidden h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-sm text-muted-foreground">Welcome back to your operations cockpit.</p>
          </div>

          <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
          <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Demo role</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-muted">
              {(["admin", "ops_manager", "analyst"] as Role[]).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)} className={`py-1.5 text-xs rounded-md font-medium capitalize transition-all ${role === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {r.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {err && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{err}</div>}

          <button disabled={loading} type="submit" className="w-full py-3 rounded-lg font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>
            {loading ? "Signing in..." : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            New to SupplyPulse? <Link to="/signup" className="text-primary font-medium hover:underline">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return <div><div className="text-2xl font-bold">{n}</div><div className="text-xs text-white/70">{l}</div></div>;
}

function Field({ icon: Icon, label, type, value, onChange, placeholder }: { icon: React.ComponentType<{ className?: string }>; label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>
  );
}
