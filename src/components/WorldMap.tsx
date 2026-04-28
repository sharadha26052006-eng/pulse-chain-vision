/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import type { Shipment } from "@/lib/sample-data";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let loaderPromise: Promise<typeof google> | null = null;
function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    if (!API_KEY) { reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY")); return; }
    const cbName = `__gmaps_cb_${Date.now()}`;
    (window as any)[cbName] = () => { resolve((window as any).google); delete (window as any)[cbName]; };
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=${cbName}&libraries=marker`;
    s.async = true; s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

// Dark, slate-blue map style matching the app theme.
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#475569" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

function colorFor(level: Shipment["riskLevel"]) {
  return level === "critical" ? "#dc2626" : level === "high" ? "#ea580c" : level === "medium" ? "#eab308" : "#3b82f6";
}

export function WorldMap({ shipments, selectedId, onSelect, height = 420 }: {
  shipments: Shipment[]; selectedId?: string; onSelect?: (id: string) => void; height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<(google.maps.Polyline | google.maps.Marker)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Init map once
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new g.maps.Map(containerRef.current, {
          center: { lat: 20, lng: 30 },
          zoom: 2,
          minZoom: 2,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: "#0b1220",
          styles: darkMapStyle,
        });
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
    return () => { cancelled = true; };
  }, []);

  // Render shipments
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const g = (window as any).google as typeof google;

    // Clear previous overlays
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    shipments.forEach((s) => {
      const isSel = s.id === selectedId;
      const color = colorFor(s.riskLevel);

      // Curved-ish path: sample a quadratic bezier between origin and destination
      const o = s.origin, d = s.destination;
      const cx = (o.lng + d.lng) / 2;
      const cy = Math.max(o.lat, d.lat) + 15;
      const path: google.maps.LatLngLiteral[] = [];
      const steps = 32;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = (1 - t) * (1 - t) * o.lat + 2 * (1 - t) * t * cy + t * t * d.lat;
        const lng = (1 - t) * (1 - t) * o.lng + 2 * (1 - t) * t * cx + t * t * d.lng;
        path.push({ lat, lng });
      }

      const line = new g.maps.Polyline({
        path,
        geodesic: false,
        strokeColor: color,
        strokeOpacity: isSel ? 0.95 : 0.55,
        strokeWeight: isSel ? 3 : 1.5,
        map,
        icons: isSel ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "16px" }] : undefined,
        zIndex: isSel ? 10 : 1,
      });
      line.addListener("click", () => onSelect?.(s.id));

      // Origin / destination dots
      const dot = (pos: google.maps.LatLngLiteral) =>
        new g.maps.Marker({
          position: pos, map,
          icon: { path: g.maps.SymbolPath.CIRCLE, scale: 3, fillColor: color, fillOpacity: 0.9, strokeColor: "#0b1220", strokeWeight: 1 },
          clickable: false,
        });
      overlaysRef.current.push(dot(o), dot(d));

      // Current position
      const cur = new g.maps.Marker({
        position: { lat: s.currentLocation.lat, lng: s.currentLocation.lng },
        map,
        title: `${s.reference} · ${s.carrier}`,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: isSel ? 8 : 6,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
        },
        zIndex: isSel ? 20 : 5,
      });
      cur.addListener("click", () => onSelect?.(s.id));

      overlaysRef.current.push(line, cur);
    });
  }, [shipments, selectedId, loaded, onSelect]);

  if (error) {
    return (
      <div className="w-full rounded-xl border border-border bg-card flex items-center justify-center text-center p-6" style={{ height }}>
        <div>
          <p className="text-sm font-medium">Map failed to load</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card" style={{ height }}>
      <div ref={containerRef} className="absolute inset-0" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <div className="h-1 w-40 rounded-full bg-muted overflow-hidden">
            <div className="h-full shimmer" style={{ background: "var(--gradient-primary)" }} />
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] z-10 pointer-events-none">
        {[
          { c: "#3b82f6", l: "Low" },
          { c: "#eab308", l: "Medium" },
          { c: "#ea580c", l: "High" },
          { c: "#dc2626", l: "Critical" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/80 backdrop-blur border border-border">
            <span className="h-2 w-2 rounded-full" style={{ background: x.c }} />
            <span className="text-muted-foreground">{x.l}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur border border-border text-[10px] text-muted-foreground z-10 pointer-events-none">
        {shipments.length} active routes · Google Maps
      </div>
    </div>
  );
}
