import type { SafetyVerdict, Temperature, Urgency, TrendAction, ScanStatus } from "./seed-data";

// ─── Temperature ──────────────────────────────────────────────────────────────

export const temperatureLabel: Record<Temperature, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold"
};

export const temperatureColor: Record<Temperature, string> = {
  hot: "var(--hot)",
  warm: "var(--warm)",
  cold: "var(--cold)"
};

// ─── Action ───────────────────────────────────────────────────────────────────

export const actionLabel: Record<TrendAction, string> = {
  Test: "Test now",
  Watch: "Watch",
  Skip: "Skip"
};

export const actionColor: Record<TrendAction, string> = {
  Test: "var(--green)",
  Watch: "var(--gold)",
  Skip: "var(--muted)"
};

// ─── Urgency ──────────────────────────────────────────────────────────────────

export const urgencyLabel: Record<Urgency, string> = {
  "design now": "Design now",
  "coming soon": "Coming soon",
  "plan ahead": "Plan ahead"
};

export const urgencyColor: Record<Urgency, string> = {
  "design now": "var(--hot)",
  "coming soon": "var(--warm)",
  "plan ahead": "var(--cyan)"
};

// ─── Safety ───────────────────────────────────────────────────────────────────

export const safetyLabel: Record<SafetyVerdict, string> = {
  safe: "Safe",
  review: "Review",
  blocked: "Blocked"
};

export const safetyColor: Record<SafetyVerdict, string> = {
  safe: "var(--green)",
  review: "var(--warm)",
  blocked: "var(--hot)"
};

// ─── Scan status ──────────────────────────────────────────────────────────────

export const scanStatusLabel: Record<ScanStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed"
};

export const scanStatusColor: Record<ScanStatus, string> = {
  queued: "var(--muted)",
  running: "var(--cyan)",
  completed: "var(--green)",
  failed: "var(--hot)"
};

// ─── Score formatting ─────────────────────────────────────────────────────────

export function formatScore(score: number): string {
  return score.toString().padStart(2, "0");
}

export function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function scoreToTemperature(score: number): Temperature {
  if (score >= 70) return "hot";
  if (score >= 45) return "warm";
  return "cold";
}

// ─── Duration formatting ──────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export function daysUntil(isoDate: string): number {
  const now = new Date();
  const target = new Date(isoDate);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Plural ───────────────────────────────────────────────────────────────────

export function plural(n: number, singular: string, pluralForm?: string): string {
  return n === 1 ? `${n} ${singular}` : `${n} ${pluralForm ?? singular + "s"}`;
}
