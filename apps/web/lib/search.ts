import { trendSignals, calendarOpportunities } from "./seed-data";

// ─── Local result types ───────────────────────────────────────────────────────

export type TrendResult = {
  type: "trend";
  id: string;
  title: string;
  niche: string;
  subcategory?: string;
  temperature: "hot" | "warm" | "cold";
  score: number;
};

export type CalendarResult = {
  type: "calendar";
  id: string;
  title: string;
  date: string;
  urgency: "design now" | "coming soon" | "plan ahead";
  platform: string;
  daysAway: number;
};

// ─── AI result type ───────────────────────────────────────────────────────────

export type AiTrendResult = {
  type: "ai";
  id: string;
  phrase: string;
  niche: string;
  temperature: "hot" | "warm" | "cold";
  score: number;
  whyNow: string;
  targetBuyer: string;
  amazon: "ultra-niche" | "low" | "medium" | "high";
  etsy: "ultra-niche" | "low" | "medium" | "high";
  redbubble: "ultra-niche" | "low" | "medium" | "high";
  designPrompt: string;
  keywords: string[];
};

export type SearchResult = TrendResult | CalendarResult;
export type AnySearchResult = TrendResult | CalendarResult | AiTrendResult;

// ─── API response shape ───────────────────────────────────────────────────────

export type SearchApiResponse = {
  localResults: SearchResult[];
  aiResults: AiTrendResult[];
  hasAiResults: boolean;
};

// ─── Local search ─────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}

function relevance(hay: string, q: string, phrase: string): number {
  const normPhrase = normalize(phrase);
  if (normPhrase === q) return 3;
  if (normPhrase.includes(q)) return 2;
  if (hay.includes(q)) return 1;
  return 0;
}

export function searchLocalData(query: string, limit = 5): SearchResult[] {
  if (!query.trim()) return [];
  const q = normalize(query);

  const scored: Array<{ result: SearchResult; score: number }> = [];

  for (const t of trendSignals) {
    const hay = normalize(
      [t.niche, t.subcategory ?? "", ...t.listingKeywords].join(" ")
    );
    const r = relevance(hay, q, t.phrase);
    if (r > 0) {
      scored.push({
        result: {
          type: "trend",
          id: t.id,
          title: t.phrase,
          niche: t.niche,
          subcategory: t.subcategory,
          temperature: t.temperature,
          score: t.score,
        },
        score: r,
      });
    }
  }

  for (const c of calendarOpportunities) {
    const hay = normalize(
      [c.platform, ...c.subNiches, ...c.listingKeywords].join(" ")
    );
    const r = relevance(hay, q, c.title);
    if (r > 0) {
      scored.push({
        result: {
          type: "calendar",
          id: c.id,
          title: c.title,
          date: c.date,
          urgency: c.urgency,
          platform: c.platform,
          daysAway: c.daysAway,
        },
        score: r,
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.result);
}

// Kept for backward compat (dashboard pages still use this client-side)
export function searchAll(query: string, limit = 8): SearchResult[] {
  return searchLocalData(query, limit);
}
