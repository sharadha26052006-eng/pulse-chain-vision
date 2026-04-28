import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Activity, Map, Bell, BarChart3, User, Settings, AlertTriangle, Package, LayoutDashboard, Shield, LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shipments", label: "Shipments", icon: Package },
  { to: "/map", label: "Map", icon: Map },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const nav2 = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => {
        const Icon = n.icon;
        const active = loc.pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              active
                ? "bg-primary/15 text-primary border border-primary/20 shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 sticky top-0 h-screen">
        <BrandMark />
        <div className="mt-8 flex-1">
          <NavItems />
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="px-3 text-xs uppercase tracking-wider text-muted-foreground mb-2">Admin</p>
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                <Shield className="h-4 w-4" /> Admin Panel
              </Link>
            </div>
          )}
        </div>
        <UserCard onLogout={() => { logout(); nav2({ to: "/login" }); }} />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-sidebar/95 backdrop-blur border-b border-sidebar-border px-4 h-14 flex items-center justify-between">
        <BrandMark compact />
        <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-accent" aria-label="menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-sidebar border-l border-sidebar-border p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <BrandMark />
              <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1"><NavItems onClick={() => setOpen(false)} /></div>
            <UserCard onLogout={() => { logout(); nav2({ to: "/login" }); }} />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0 pb-20 lg:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar/95 backdrop-blur border-t border-sidebar-border">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {nav.slice(0, 5).map((n) => {
            const Icon = n.icon;
            const active = loc.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <div className="relative h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
        <Activity className="h-5 w-5 text-primary-foreground" />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success border-2 border-sidebar" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">SupplyPulse</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Logistics OS</div>
        </div>
      )}
    </Link>
  );
}

function UserCard({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="mt-4 p-3 rounded-lg border border-border bg-card/50">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/15 text-primary text-sm font-semibold">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-[11px] text-muted-foreground capitalize">{user.role.replace("_", " ")}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1">
        <Link to="/profile" className="p-1.5 rounded-md hover:bg-accent text-center text-muted-foreground hover:text-foreground"><User className="h-3.5 w-3.5 mx-auto" /></Link>
        <Link to="/settings" className="p-1.5 rounded-md hover:bg-accent text-center text-muted-foreground hover:text-foreground"><Settings className="h-3.5 w-3.5 mx-auto" /></Link>
        <button onClick={onLogout} className="p-1.5 rounded-md hover:bg-destructive/15 text-center text-muted-foreground hover:text-destructive"><LogOut className="h-3.5 w-3.5 mx-auto" /></button>
      </div>
    </div>
  );
}
