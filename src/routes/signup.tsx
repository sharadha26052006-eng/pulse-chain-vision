import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) { setErr("Name is required"); return; }
    if (!email.includes("@")) { setErr("Enter a valid email"); return; }
    if (password.length < 8) { setErr("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created. Welcome to SupplyPulse.");
      nav({ to: "/dashboard" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <form onSubmit={submit} className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-sm text-muted-foreground">Start monitoring your supply chain in minutes.</p>
        </div>

        <Field icon={User} label="Full name" type="text" value={name} onChange={setName} placeholder="Jane Operator" />
        <Field icon={Mail} label="Work email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" />

        {err && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{err}</div>}

        <button disabled={loading} type="submit" className="w-full py-3 rounded-lg font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>
          {loading ? "Creating..." : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
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
