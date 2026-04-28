import { useState } from "react";
import type { Shipment } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

// Equirectangular projection
function project(lat: number, lng: number, w: number, h: number) {
  return { x: ((lng + 180) / 360) * w, y: ((90 - lat) / 180) * h };
}

export function WorldMap({ shipments, selectedId, onSelect, height = 420 }: {
  shipments: Shipment[]; selectedId?: string; onSelect?: (id: string) => void; height?: number;
}) {
  const W = 1000, H = 500;
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="seaGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="oklch(0.26 0.03 250)" />
            <stop offset="100%" stopColor="oklch(0.18 0.02 250)" />
          </radialGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.3 0.02 252)" strokeWidth="0.4" opacity="0.4" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#seaGrad)" />
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Stylized continents */}
        <g fill="oklch(0.32 0.025 252)" stroke="oklch(0.42 0.03 250)" strokeWidth="0.5" opacity="0.85">
          <path d="M 130 110 Q 220 80 290 130 L 320 200 Q 280 240 230 250 L 180 240 Q 130 200 120 160 Z" />
          <path d="M 250 290 Q 290 280 310 320 L 320 410 Q 290 460 270 440 L 250 380 Z" />
          <path d="M 460 90 Q 540 70 580 110 L 590 170 Q 540 200 490 180 L 460 140 Z" />
          <path d="M 470 200 Q 560 220 600 280 Q 580 380 530 410 L 490 360 Q 460 290 470 200 Z" />
          <path d="M 620 90 Q 760 70 880 130 L 900 230 Q 820 290 720 270 L 640 220 Q 600 160 620 100 Z" />
          <path d="M 800 320 Q 870 330 890 380 L 870 420 Q 820 410 800 380 Z" />
        </g>

        {/* Routes */}
        {shipments.map((s) => {
          const o = project(s.origin.lat, s.origin.lng, W, H);
          const d = project(s.destination.lat, s.destination.lng, W, H);
          const c = project(s.currentLocation.lat, s.currentLocation.lng, W, H);
          const cx = (o.x + d.x) / 2, cy = Math.min(o.y, d.y) - 40;
          const path = `M ${o.x} ${o.y} Q ${cx} ${cy} ${d.x} ${d.y}`;
          const color = s.riskLevel === "critical" ? "oklch(0.62 0.24 27)" :
                        s.riskLevel === "high" ? "oklch(0.65 0.23 30)" :
                        s.riskLevel === "medium" ? "oklch(0.78 0.16 75)" : "oklch(0.65 0.18 245)";
          const active = s.id === selectedId || s.id === hover;
          return (
            <g key={s.id} className="cursor-pointer" onClick={() => onSelect?.(s.id)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}>
              <path d={path} fill="none" stroke={color} strokeWidth={active ? 2 : 1} opacity={active ? 0.95 : 0.45} className={active ? "route-dash" : ""} />
              <circle cx={o.x} cy={o.y} r={2.5} fill={color} opacity="0.7" />
              <circle cx={d.x} cy={d.y} r={2.5} fill={color} opacity="0.7" />
              <circle cx={c.x} cy={c.y} r={active ? 6 : 4} fill={color} stroke="oklch(0.97 0.01 250)" strokeWidth="1">
                {s.riskLevel === "critical" && <animate attributeName="r" values="4;9;4" dur="1.8s" repeatCount="indefinite" />}
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px]">
        {[
          { c: "oklch(0.65 0.18 245)", l: "Low" },
          { c: "oklch(0.78 0.16 75)", l: "Medium" },
          { c: "oklch(0.65 0.23 30)", l: "High" },
          { c: "oklch(0.62 0.24 27)", l: "Critical" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/80 backdrop-blur border border-border">
            <span className="h-2 w-2 rounded-full" style={{ background: x.c }} />
            <span className="text-muted-foreground">{x.l}</span>
          </div>
        ))}
      </div>
      <div className={cn("absolute top-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur border border-border text-[10px] text-muted-foreground")}>
        {shipments.length} active routes
      </div>
    </div>
  );
}
