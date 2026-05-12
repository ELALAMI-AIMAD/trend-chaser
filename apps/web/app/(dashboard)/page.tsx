export const dynamic = "force-dynamic";

import {
  ArrowUpRight,
  ShieldCheck,
  Timer
} from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { AwarenessStrip } from "@/components/awareness/awareness-strip";
import { TopBar } from "@/components/app-shell/top-bar";
import { TrendCard } from "@/components/trends/trend-card";
import {
  AWARENESS_NICHES,
  calendarOpportunities,
  kpis,
  pipelineSteps,
  platformSnapshots,
  trendSignals
} from "@/lib/seed-data";
import { routes } from "@/lib/routes";
import type { TrendsResponse } from "@/lib/api-client";

async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (host) {
    const protocol = headerList.get("x-forwarded-proto") ?? "http";
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function seedFallbackResponse(): TrendsResponse {
  return {
    trends: trendSignals,
    meta: {
      total: trendSignals.length,
      liveCount: 0,
      seedCount: trendSignals.length,
      isLive: false,
      lastFetched: new Date().toISOString()
    }
  };
}

async function loadDashboardTrends(): Promise<TrendsResponse> {
  try {
    const origin = await getRequestOrigin();
    const response = await fetch(`${origin}${routes.api.trends}?limit=50`, {
      cache: "no-store"
    });

    if (!response.ok) return seedFallbackResponse();

    return (await response.json()) as TrendsResponse;
  } catch {
    return seedFallbackResponse();
  }
}

export default async function DashboardPage() {
  const { trends, meta } = await loadDashboardTrends();
  const hotTrendCount = trends.filter((trend) => trend.temperature === "hot").length;
  const statusLabel = meta.isLive ? "Live" : "Demo data";

  return (
    <>
      <TopBar title="Trend dashboard" eyebrow="Daily intelligence" />

      <section className="kpi-grid" aria-label="Daily scan summary">
        {kpis.map((item) => {
          const isHotTrendsCard = item.label === "Hot trends";

          return (
            <article className={`kpi-card tone-${item.tone}`} key={item.label}>
              <div className="kpi-icon">
                <item.icon size={18} aria-hidden />
              </div>
              <div>
                <p>{item.label}</p>
                <strong>{isHotTrendsCard ? hotTrendCount : item.value}</strong>
                {isHotTrendsCard ? (
                  <span className={`kpi-live-status ${meta.isLive ? "live" : "demo"}`}>
                    <span className="kpi-live-status-dot" aria-hidden />
                    {statusLabel}
                  </span>
                ) : (
                  <span>{item.delta}</span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <p className="live-source-summary">
        Showing {meta.liveCount} live signals + {meta.seedCount} curated trends
      </p>

      <AwarenessStrip niches={AWARENESS_NICHES} />

      <section className="dashboard-grid">
        {/* Trend radar */}
        <section className="section-block trend-radar">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Live signals</p>
              <h2>Trend radar</h2>
            </div>
            <Link className="ghost-button" href={routes.trends}>
              <ArrowUpRight size={16} aria-hidden />
              <span>Open all</span>
            </Link>
          </div>

          <div className="trend-list">
            {trends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        </section>

        {/* Calendar */}
        <section className="section-block side-stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Upload windows</p>
              <h2>Niche calendar</h2>
            </div>
            <Timer size={19} className="heading-icon" aria-hidden />
          </div>

          <div className="calendar-list">
            {calendarOpportunities.slice(0, 5).map((event) => (
              <article className="calendar-card" key={event.id}>
                <div>
                  <strong>{event.date}</strong>
                  <span>{event.daysAway}d</span>
                </div>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.platform} / {event.urgency}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Platform snapshot */}
        <section className="section-block side-stack">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Marketplace fit</p>
              <h2>Platform snapshot</h2>
            </div>
            <ShieldCheck size={19} className="heading-icon" aria-hidden />
          </div>

          <div className="platform-list">
            {platformSnapshots.map((platform) => (
              <article className="platform-row-card" key={platform.platform}>
                <div
                  className="platform-score"
                  style={{ "--score": platform.score } as React.CSSProperties}
                >
                  {platform.score}
                </div>
                <div>
                  <h3>{platform.platform}</h3>
                  <p>{platform.signal}</p>
                  <span>{platform.competition} / {platform.action}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {/* Pipeline strip */}
      <section className="pipeline-strip" aria-label="Automation pipeline">
        {pipelineSteps.map((step) => (
          <article className="pipeline-step" key={step.label}>
            <step.icon size={18} aria-hidden />
            <div>
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
