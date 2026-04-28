import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "ops_manager" | "analyst";
export interface User { id: string; name: string; email: string; role: Role; avatar?: string }

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "supplypulse_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string, role: Role = "ops_manager") => {
    const u: User = { id: "u_1", name: email.split("@")[0] || "Operator", email, role };
    setUser(u);
    localStorage.setItem(KEY, JSON.stringify(u));
  };
  const signup = async (name: string, email: string, _password: string) => {
    const u: User = { id: "u_1", name, email, role: "ops_manager" };
    setUser(u);
    localStorage.setItem(KEY, JSON.stringify(u));
  };
  const logout = () => { setUser(null); localStorage.removeItem(KEY); };

  return <Ctx.Provider value={{ user, login, signup, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
