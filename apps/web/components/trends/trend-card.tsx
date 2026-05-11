import { Copy } from "lucide-react";
import Link from "next/link";
import type { TrendSignal } from "@/lib/seed-data";
import { routes } from "@/lib/routes";
import { temperatureLabel } from "@/lib/format";
import { SafetyBadge } from "./safety-badge";

type TrendCardProps = {
  trend: TrendSignal;
  showSafety?: boolean;
};

export function TrendCard({ trend, showSafety = false }: TrendCardProps) {
  return (
    <article className="trend-card">
      <div className="trend-main">
        <div>
          <div className="badge-row">
            <span className={`temp-badge ${trend.temperature}`}>
              {temperatureLabel[trend.temperature]}
            </span>
            <span className="quiet-badge">{trend.uploadWindow}</span>
            <span className="quiet-badge">{trend.action}</span>
            {showSafety && (
              <SafetyBadge verdict={trend.safetyVerdict} notes={trend.safetyNotes} />
            )}
          </div>
          <h3>
            <Link href={routes.trend(trend.id)}>{trend.phrase}</Link>
          </h3>
          <p>{trend.niche}{trend.subcategory ? ` / ${trend.subcategory}` : ""} · {trend.source}</p>
        </div>
        <button className="icon-button compact" aria-label={`Copy ${trend.phrase}`}>
          <Copy size={16} aria-hidden />
        </button>
      </div>

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

      <div className="platform-row">
        {trend.platforms.map((platform) => (
          <span key={platform}>{platform}</span>
        ))}
      </div>
    </article>
  );
}
