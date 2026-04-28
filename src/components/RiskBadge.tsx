import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/sample-data";

const map: Record<RiskLevel, { label: string; cls: string }> = {
  low: { label: "Low Risk", cls: "bg-success/15 text-success border-success/30" },
  medium: { label: "Medium Risk", cls: "bg-warning/15 text-warning border-warning/30" },
  high: { label: "High Risk", cls: "bg-danger/15 text-danger border-danger/30" },
  critical: { label: "Critical", cls: "bg-destructive/20 text-destructive border-destructive/40" },
};

export function RiskBadge({ level, score, className }: { level: RiskLevel; score?: number; className?: string }) {
  const m = map[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium uppercase tracking-wide", m.cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", level === "critical" && "pulse-danger", level === "low" && "bg-success", level === "medium" && "bg-warning", level === "high" && "bg-danger", level === "critical" && "bg-destructive")} />
      {m.label}{score !== undefined && <span className="opacity-70">· {score}</span>}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const labels: Record<string, string> = {
    in_transit: "In Transit", at_hub: "At Hub", loading: "Loading",
    delivered: "Delivered", delayed: "Delayed", customs: "In Customs",
  };
  const cls = status === "delayed" ? "bg-destructive/15 text-destructive" :
              status === "delivered" ? "bg-success/15 text-success" :
              status === "customs" ? "bg-warning/15 text-warning" :
              "bg-primary/15 text-primary";
  return <span className={cn("px-2 py-0.5 rounded text-[11px] font-medium", cls)}>{labels[status] ?? status}</span>;
}
