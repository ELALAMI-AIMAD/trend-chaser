"use client";
export const dynamic = "force-dynamic";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { TopBar } from "@/components/app-shell/top-bar";
import { TrendCard } from "@/components/trends/trend-card";
import { TrendTable } from "@/components/trends/trend-table";
import { trendSignals, type TrendSignal, type Temperature } from "@/lib/seed-data";

type ViewMode = "cards" | "table";
type TempFilter = Temperature | "all";

const tempFilters: Array<{ label: string; value: TempFilter }> = [
  { label: "All", value: "all" },
  { label: "Hot", value: "hot" },
  { label: "Warm", value: "warm" },
  { label: "Cold", value: "cold" }
];

const actionFilters = ["All", "Test", "Watch", "Skip"] as const;

function mapToSignal(doc: {
  _id: string;
  phrase: string;
  niche: string;
  temperature: "hot" | "warm" | "cold";
  score: number;
  momentum: number;
  competition: string;
  uploadWindow: string;
  action: "Test" | "Watch" | "Skip";
  source: string;
  platforms: ("Amazon" | "Etsy" | "Redbubble")[];
  createdAt: number;
  updatedAt: number;
}): TrendSignal {
  return {
    id: doc._id,
    phrase: doc.phrase,
    niche: doc.niche,
    temperature: doc.temperature,
    score: doc.score,
    momentum: doc.momentum,
    competition: doc.competition,
    uploadWindow: doc.uploadWindow,
    action: doc.action,
    source: doc.source,
    platforms: doc.platforms,
    safetyVerdict: "safe",
    aiSummary: "",
    platformMetrics: [],
    designPrompts: [],
    listingKeywords: [],
    firstSeenAt: new Date(doc.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    }),
    lastSeenAt: new Date(doc.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })
  };
}

export default function TrendsPage() {
  const [tempFilter, setTempFilter] = useState<TempFilter>("all");
  const [actionFilter, setActionFilter] = useState<string>("All");
  const [view, setView] = useState<ViewMode>("cards");

  const convexTrends = useQuery(api.trends.list, {});

  const allTrends: TrendSignal[] =
    convexTrends === undefined
      ? []
      : convexTrends.length > 0
        ? convexTrends.map(mapToSignal)
        : trendSignals;

  const isLoading = convexTrends === undefined;

  const filtered = allTrends.filter((t) => {
    if (tempFilter !== "all" && t.temperature !== tempFilter) return false;
    if (actionFilter !== "All" && t.action !== actionFilter) return false;
    return true;
  });

  return (
    <>
      <TopBar title="Trend radar" eyebrow="Live signals" />

      <div className="section-block">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div className="filter-bar">
            {tempFilters.map((f) => (
              <button
                key={f.value}
                className={`filter-chip ${tempFilter === f.value ? "active" : ""}`}
                onClick={() => setTempFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
            <div style={{ width: 1, height: 22, background: "var(--border)", margin: "0 2px" }} />
            {actionFilters.map((a) => (
              <button
                key={a}
                className={`filter-chip ${actionFilter === a ? "active" : ""}`}
                onClick={() => setActionFilter(a)}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="filter-bar">
            <button
              className={`filter-chip ${view === "cards" ? "active" : ""}`}
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
            >
              Cards
            </button>
            <button
              className={`filter-chip ${view === "table" ? "active" : ""}`}
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
            >
              Table
            </button>
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
          {isLoading
            ? "Loading…"
            : `${filtered.length} trend${filtered.length !== 1 ? "s" : ""} shown${convexTrends?.length === 0 ? " · demo data" : ""}`}
        </p>
      </div>

      {isLoading ? (
        <div className="empty-state" style={{ opacity: 0.5 }}>Loading trends…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No trends match the current filters.</div>
      ) : view === "cards" ? (
        <div className="trend-list">
          {filtered.map((trend) => (
            <TrendCard key={trend.id} trend={trend} showSafety />
          ))}
        </div>
      ) : (
        <TrendTable trends={filtered} />
      )}
    </>
  );
}
