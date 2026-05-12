import type { TrendSignal, CalendarOpportunity } from "./seed-data";

// ─── Base fetch ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("/") ? `${BASE_URL}${path}` : path;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Trends ───────────────────────────────────────────────────────────────────

export type TrendsQuery = {
  temperature?: "hot" | "warm" | "cold";
  limit?: number;
};

export type TrendsResponse = {
  trends: TrendSignal[];
  meta: {
    total: number;
    liveCount: number;
    seedCount: number;
    isLive: boolean;
    lastFetched: string;
  };
};

export async function fetchTrends(query: TrendsQuery = {}): Promise<TrendsResponse> {
  const params = new URLSearchParams();
  if (query.temperature) params.set("temperature", query.temperature);
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.size ? `?${params}` : "";
  return apiFetch<TrendsResponse>(`/api/trends${qs}`);
}

export async function fetchTrend(id: string): Promise<TrendSignal> {
  return apiFetch<TrendSignal>(`/api/trends/${id}`);
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export type CalendarQuery = {
  urgency?: "design now" | "coming soon" | "plan ahead";
};

export async function fetchCalendar(query: CalendarQuery = {}): Promise<CalendarOpportunity[]> {
  const params = new URLSearchParams();
  if (query.urgency) params.set("urgency", query.urgency);
  const qs = params.size ? `?${params}` : "";
  return apiFetch<CalendarOpportunity[]>(`/api/calendar${qs}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "markdown" | "ics";
export type ExportScope = "trends" | "calendar" | "prompts";

export async function triggerExport(format: ExportFormat, scope: ExportScope): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/api/exports?format=${format}&scope=${scope}`);
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Cron ─────────────────────────────────────────────────────────────────────

export async function triggerDailyScan(secret: string): Promise<{ started: boolean }> {
  return apiFetch<{ started: boolean }>("/api/cron/daily-scan", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` }
  });
}
