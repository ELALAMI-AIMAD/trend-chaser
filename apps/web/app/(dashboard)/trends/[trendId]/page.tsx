export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";
import { getTrendById } from "@/lib/seed-data";
import { routes } from "@/lib/routes";
import { temperatureLabel } from "@/lib/format";
import { SafetyBadge } from "@/components/trends/safety-badge";
import { ScoreBreakdown } from "@/components/trends/score-breakdown";
import { PlatformComparison } from "@/components/trends/platform-comparison";
import { PromptList } from "@/components/trends/prompt-list";
import { TopBar } from "@/components/app-shell/top-bar";

type Props = {
  params: Promise<{ trendId: string }>;
};

export default async function TrendDetailPage({ params }: Props) {
  const { trendId } = await params;
  const trend = getTrendById(trendId);

  if (!trend) notFound();

  return (
    <>
      <TopBar title={trend.phrase} eyebrow="Trend detail" />

      <div className="trend-detail">
        {/* Back + header */}
        <div>
          <Link
            href={routes.trends}
            className="ghost-button"
            style={{ minHeight: 36, padding: "0 10px", marginBottom: 16, fontSize: "0.82rem", gap: 6 }}
          >
            <ArrowLeft size={15} aria-hidden />
            All trends
          </Link>

          <div className="trend-detail-header">
            <div>
              <div className="trend-detail-meta">
                <span className={`temp-badge ${trend.temperature}`}>
                  {temperatureLabel[trend.temperature]}
                </span>
                <span className="quiet-badge">{trend.uploadWindow}</span>
                <span className="quiet-badge">{trend.action}</span>
                <SafetyBadge verdict={trend.safetyVerdict} notes={trend.safetyNotes} />
              </div>
              <p style={{ color: "var(--text-muted)", margin: "10px 0 0" }}>
                {trend.niche}{trend.subcategory ? ` / ${trend.subcategory}` : ""} · {trend.source}
              </p>
            </div>

            <button className="icon-button" aria-label={`Copy ${trend.phrase}`}>
              <Copy size={18} aria-hidden />
            </button>
          </div>
        </div>

        {/* AI summary */}
        <div className="section-block">
          <p className="eyebrow" style={{ marginBottom: 10 }}>AI summary</p>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "rgba(18,22,26,0.86)",
              padding: 16,
              lineHeight: 1.7,
              color: "var(--text-muted)"
            }}
          >
            {trend.aiSummary}
          </div>
        </div>

        {/* Two-column detail grid */}
        <div className="detail-grid">
          {/* Left column */}
          <div style={{ display: "grid", gap: 24 }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Platform data</p>
              <PlatformComparison trend={trend} />
            </div>

            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Design prompts</p>
              <PromptList prompts={trend.designPrompts} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <ScoreBreakdown trend={trend} />

            <div className="section-block">
              <p className="eyebrow" style={{ marginBottom: 10 }}>Listing keywords</p>
              <div className="keyword-chips">
                {trend.listingKeywords.map((kw) => (
                  <span className="keyword-chip" key={kw}>{kw}</span>
                ))}
              </div>
            </div>

            <div className="section-block">
              <p className="eyebrow" style={{ marginBottom: 10 }}>Platforms</p>
              <div className="platform-row">
                {trend.platforms.map((p) => (
                  <span key={p}>{p}</span>
                ))}
              </div>
            </div>

            <div className="section-block">
              <p className="eyebrow" style={{ marginBottom: 10 }}>Tracking</p>
              <div style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  First seen: <strong style={{ color: "var(--text)" }}>{trend.firstSeenAt}</strong>
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Last seen: <strong style={{ color: "var(--text)" }}>{trend.lastSeenAt}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
