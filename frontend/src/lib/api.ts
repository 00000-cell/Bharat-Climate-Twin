import type {
  Analytics,
  ClimateAlert,
  ClimateObservation,
  CopilotResponse,
  District,
  Prediction,
  Ranking,
  RiskScore,
  State
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
const API_PREFIX = `${API_BASE_URL}/api/v1`;

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("bct_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("bct_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("bct_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; user: { full_name: string; role: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  register: (payload: { email: string; full_name: string; password: string; role: string }) =>
    apiFetch<{ access_token: string; user: { full_name: string; role: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  states: () => apiFetch<State[]>("/climate/states"),
  districts: (stateId?: number) =>
    apiFetch<District[]>(`/climate/districts${stateId ? `?state_id=${stateId}` : ""}`),
  history: (districtId: number, year?: number) =>
    apiFetch<ClimateObservation[]>(
      `/climate/districts/${districtId}/history${year ? `?year=${year}` : ""}`
    ),
  layers: () => apiFetch<GeoJSON.FeatureCollection>("/climate/map/layers"),
  rankings: (limit = 10) => apiFetch<Ranking[]>(`/climate/rankings?limit=${limit}`),
  analytics: () => apiFetch<Analytics>("/climate/analytics"),
  alerts: () => apiFetch<ClimateAlert[]>("/climate/alerts"),
  risk: (districtId: number) => apiFetch<RiskScore>(`/risk/district/${districtId}`),
  riskTrends: (districtId: number) =>
    apiFetch<Array<Record<string, number | string>>>(`/risk/district/${districtId}/trends`),
  predict: (kind: "flood" | "drought" | "heatwave", districtId: number) =>
    apiFetch<Prediction>(`/predictions/${kind}`, {
      method: "POST",
      body: JSON.stringify({ district_id: districtId })
    }),
  simulate: (payload: {
    district_id?: number;
    rainfall_delta_pct: number;
    temperature_delta_c: number;
    reservoir_delta_pct: number;
    planning_horizon_years: number;
  }) =>
    apiFetch<{ scenario: Record<string, number>; results: Record<string, unknown> }>("/simulations/run", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  copilot: (prompt: string) =>
    apiFetch<CopilotResponse>("/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ prompt })
    }),
  adminOverview: () =>
    apiFetch<{
      users: number;
      states: number;
      districts: number;
      risk_scores: number;
      predictions: number;
      simulations: number;
      integrations: Array<{ name: string; status: string }>;
    }>("/admin/overview")
};

export { API_BASE_URL };
