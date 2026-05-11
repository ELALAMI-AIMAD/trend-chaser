import type { TrendSignal } from "@/lib/seed-data";

type ScoreBreakdownProps = {
  trend: TrendSignal;
  compact?: boolean;
};

export function ScoreBreakdown({ trend, compact = false }: ScoreBreakdownProps) {
  if (compact) {
    return (
      <div className="score-row">
        <div>
          <span>Score</span>
          <strong>{trend.score}</strong>
        </div>
        <div>
          <span>Momentum</span>
          <strong>{trend.momentum}</strong>
        </div>
        <div>
          <span>Competition</span>
          <strong>{trend.competition}</strong>
        </div>
      </div>
    );
  }

  const bars: Array<{ label: string; value: number; color: string }> = [
    { label: "Overall score", value: trend.score, color: "var(--orange)" },
    { label: "Momentum", value: trend.momentum, color: "var(--cyan)" },
    {
      label: "Competition pressure",
      value: trend.competition === "Ultra niche" ? 10 : trend.competition === "Low" ? 28 : trend.competition === "High" ? 82 : 50,
      color: "var(--pink)"
    }
  ];

  return (
    <div className="section-block">
      <p className="eyebrow" style={{ marginBottom: 12 }}>Score breakdown</p>
      <div style={{ display: "grid", gap: 12 }}>
        {bars.map((bar) => (
          <div key={bar.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{bar.label}</span>
              <strong style={{ fontSize: "0.8rem" }}>{bar.value}</strong>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 999,
                background: "var(--surface-soft)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${bar.value}%`,
                  borderRadius: 999,
                  background: bar.color,
                  transition: "width 600ms ease"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
