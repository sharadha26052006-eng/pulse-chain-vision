export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ShipmentStatus = "in_transit" | "at_hub" | "loading" | "delivered" | "delayed" | "customs";

export interface Shipment {
  id: string;
  reference: string;
  carrier: string;
  origin: { name: string; code: string; lat: number; lng: number };
  destination: { name: string; code: string; lat: number; lng: number };
  currentLocation: { name: string; lat: number; lng: number };
  status: ShipmentStatus;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  eta: string;
  etaDelayHours: number;
  progress: number; // 0-100
  region: string;
  mode: "ocean" | "air" | "road" | "rail";
  riskFactors: string[];
  timeline: { ts: string; event: string; location: string; status: "done" | "current" | "pending" }[];
}

export interface Alert {
  id: string;
  shipmentId?: string;
  type: "weather" | "congestion" | "delay" | "bottleneck" | "customs";
  severity: RiskLevel;
  title: string;
  description: string;
  region: string;
  timestamp: string;
  recommendation?: string;
}

const carriers = ["Maersk Line", "DHL Global", "FedEx Freight", "UPS Logistics", "MSC Cargo", "CMA CGM", "Hapag-Lloyd"];
const regions = ["North America", "Europe", "APAC", "LATAM", "MENA"];

const cities = [
  { name: "Shanghai, CN", code: "CNSHA", lat: 31.23, lng: 121.47 },
  { name: "Singapore", code: "SGSIN", lat: 1.29, lng: 103.85 },
  { name: "Rotterdam, NL", code: "NLRTM", lat: 51.92, lng: 4.48 },
  { name: "Los Angeles, US", code: "USLAX", lat: 33.74, lng: -118.27 },
  { name: "Hamburg, DE", code: "DEHAM", lat: 53.55, lng: 9.99 },
  { name: "Dubai, AE", code: "AEDXB", lat: 25.27, lng: 55.3 },
  { name: "New York, US", code: "USNYC", lat: 40.71, lng: -74.0 },
  { name: "Mumbai, IN", code: "INBOM", lat: 19.08, lng: 72.88 },
  { name: "Tokyo, JP", code: "JPTYO", lat: 35.68, lng: 139.69 },
  { name: "Santos, BR", code: "BRSSZ", lat: -23.96, lng: -46.33 },
];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

function midpoint(a: { lat: number; lng: number }, b: { lat: number; lng: number }, t: number) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export const shipments: Shipment[] = Array.from({ length: 24 }).map((_, i) => {
  const origin = pick(cities, i);
  const destination = pick(cities, i + 3 + (i % 4));
  const progress = [12, 28, 45, 60, 72, 88, 33, 55, 91, 18][i % 10];
  const cur = midpoint(origin, destination, progress / 100);
  const riskScore = [22, 78, 41, 92, 12, 64, 35, 87, 51, 8, 73, 28, 95, 44, 19, 60, 82, 30, 55, 70, 14, 48, 89, 38][i];
  const riskLevel: RiskLevel =
    riskScore >= 85 ? "critical" : riskScore >= 65 ? "high" : riskScore >= 40 ? "medium" : "low";
  const statuses: ShipmentStatus[] = ["in_transit", "at_hub", "delayed", "customs", "loading", "in_transit"];
  const status = riskLevel === "critical" ? "delayed" : pick(statuses, i);
  const factorsAll = [
    "Typhoon forecast near route",
    "Port congestion at hub",
    "Carrier capacity constraints",
    "Customs clearance delay",
    "Equipment shortage",
    "Driver hours-of-service limit",
    "Geopolitical disruption",
  ];
  const factors = factorsAll.slice(0, riskLevel === "critical" ? 4 : riskLevel === "high" ? 3 : riskLevel === "medium" ? 2 : 1);

  const days = riskLevel === "critical" ? 8 : riskLevel === "high" ? 4 : 2;
  const etaDate = new Date(Date.now() + days * 86400000);
  const delay = riskLevel === "critical" ? 72 : riskLevel === "high" ? 24 : riskLevel === "medium" ? 6 : 0;

  return {
    id: `shp_${1000 + i}`,
    reference: `SP-${String(2025001 + i)}`,
    carrier: pick(carriers, i),
    origin,
    destination,
    currentLocation: { name: `${Math.round(progress)}% to ${destination.code}`, lat: cur.lat, lng: cur.lng },
    status,
    riskScore,
    riskLevel,
    eta: etaDate.toISOString(),
    etaDelayHours: delay,
    progress,
    region: pick(regions, i),
    mode: (["ocean", "air", "road", "rail"] as const)[i % 4],
    riskFactors: factors,
    timeline: [
      { ts: "2d ago", event: "Picked up", location: origin.name, status: "done" },
      { ts: "1d ago", event: "Departed origin", location: origin.name, status: "done" },
      { ts: "Now", event: "In transit", location: `Near ${cur.lat.toFixed(1)}°, ${cur.lng.toFixed(1)}°`, status: "current" },
      { ts: `+${days}d`, event: "Arrival at hub", location: destination.name, status: "pending" },
      { ts: `+${days + 1}d`, event: "Final delivery", location: destination.name, status: "pending" },
    ],
  };
});

export const alerts: Alert[] = [
  { id: "a1", shipmentId: "shp_1003", type: "weather", severity: "critical", title: "Typhoon Mawar approaching APAC corridor", description: "Category 4 storm intersecting 12 active ocean routes through the South China Sea.", region: "APAC", timestamp: "8m ago", recommendation: "Reroute via Strait of Malacca, expect +48h ETA." },
  { id: "a2", shipmentId: "shp_1006", type: "congestion", severity: "high", title: "Port of Los Angeles congestion at 87%", description: "Average dwell time increased to 6.2 days. Berth allocation impacted.", region: "North America", timestamp: "23m ago", recommendation: "Shift to Long Beach terminal or air-freight critical SKUs." },
  { id: "a3", shipmentId: "shp_1012", type: "bottleneck", severity: "critical", title: "Customs backlog at Rotterdam", description: "EU import inspections delayed 3-5 days due to staff strike.", region: "Europe", timestamp: "1h ago", recommendation: "Pre-clear documentation; consider Hamburg as alternate." },
  { id: "a4", shipmentId: "shp_1016", type: "delay", severity: "high", title: "Carrier MSC reports 36h delay", description: "Mechanical issue on vessel MSC OSCAR affecting 8 of your shipments.", region: "Europe", timestamp: "2h ago", recommendation: "Notify downstream customers; activate buffer inventory." },
  { id: "a5", shipmentId: "shp_1009", type: "weather", severity: "medium", title: "Heavy fog forecast — Hamburg", description: "Visibility under 200m expected for 18 hours.", region: "Europe", timestamp: "3h ago" },
  { id: "a6", shipmentId: "shp_1022", type: "customs", severity: "high", title: "New tariff classification — APAC electronics", description: "Updated HS codes effective immediately for shipments from Shanghai.", region: "APAC", timestamp: "5h ago", recommendation: "Update commercial invoices and revalidate documentation." },
];

export const trendData = [
  { day: "Mon", onTime: 92, delayed: 8, atRisk: 12 },
  { day: "Tue", onTime: 89, delayed: 11, atRisk: 18 },
  { day: "Wed", onTime: 94, delayed: 6, atRisk: 9 },
  { day: "Thu", onTime: 86, delayed: 14, atRisk: 22 },
  { day: "Fri", onTime: 81, delayed: 19, atRisk: 28 },
  { day: "Sat", onTime: 88, delayed: 12, atRisk: 16 },
  { day: "Sun", onTime: 91, delayed: 9, atRisk: 14 },
];

export const regionData = [
  { region: "APAC", shipments: 412, risk: 68 },
  { region: "Europe", shipments: 298, risk: 54 },
  { region: "N. America", shipments: 356, risk: 41 },
  { region: "LATAM", shipments: 124, risk: 38 },
  { region: "MENA", shipments: 87, risk: 47 },
];

export const facilities = [
  { id: "f1", name: "Shanghai Distribution Hub", type: "Port", status: "operational", utilization: 78 },
  { id: "f2", name: "Rotterdam Cross-dock", type: "Hub", status: "congested", utilization: 94 },
  { id: "f3", name: "Los Angeles Gateway", type: "Port", status: "congested", utilization: 87 },
  { id: "f4", name: "Dubai Logistics City", type: "Hub", status: "operational", utilization: 62 },
  { id: "f5", name: "Singapore Mega-port", type: "Port", status: "operational", utilization: 71 },
];
