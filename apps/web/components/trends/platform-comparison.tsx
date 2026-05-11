import { ExternalLink } from "lucide-react";
import type { TrendSignal } from "@/lib/seed-data";

type PlatformComparisonProps = {
  trend: TrendSignal;
};

export function PlatformComparison({ trend }: PlatformComparisonProps) {
  if (trend.platformMetrics.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: 120 }}>
        No platform data collected yet.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {trend.platformMetrics.map((m) => (
        <div className="platform-metric-card" key={m.platform}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <strong style={{ fontSize: "0.9rem" }}>{m.platform}</strong>
            <a
              href={m.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ghost-button"
              style={{ minHeight: 32, padding: "0 10px", fontSize: "0.75rem", gap: 6 }}
              aria-label={`Search ${m.platform} for this trend`}
            >
              <ExternalLink size={13} aria-hidden />
              Search
            </a>
          </div>

          <div className="metric-row">
            <div className="metric-cell">
              <span>Demand</span>
              <strong>{m.demandScore}</strong>
            </div>
            <div className="metric-cell">
              <span>Competition</span>
              <strong>{m.competitionScore}</strong>
            </div>
            <div className="metric-cell">
              <span>Velocity</span>
              <strong>{m.velocityScore}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Volume: <strong style={{ color: "var(--text)" }}>{m.searchVolume}</strong>
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Results: <strong style={{ color: "var(--text)" }}>{m.resultCount}</strong>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
