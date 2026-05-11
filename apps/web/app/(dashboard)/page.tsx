export const dynamic = "force-dynamic";

import {
  ArrowUpRight,
  Copy,
  ShieldCheck,
  Timer
} from "lucide-react";
import Link from "next/link";
import { TopBar } from "@/components/app-shell/top-bar";
import {
  calendarOpportunities,
  kpis,
  pipelineSteps,
  platformSnapshots,
  trendSignals,
  type Temperature
} from "@/lib/seed-data";
import { routes } from "@/lib/routes";
import { temperatureLabel } from "@/lib/format";

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Trend dashboard" eyebrow="Daily intelligence" />

      <section className="kpi-grid" aria-label="Daily scan summary">
        {kpis.map((item) => (
          <article className={`kpi-card tone-${item.tone}`} key={item.label}>
            <div className="kpi-icon">
              <item.icon size={18} aria-hidden />
            </div>
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.delta}</span>
            </div>
          </article>
        ))}
      </section>

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
            {trendSignals.map((trend) => (
              <article className="trend-card" key={trend.id}>
                <div className="trend-main">
                  <div>
                    <div className="badge-row">
                      <span className={`temp-badge ${trend.temperature}`}>
                        {temperatureLabel[trend.temperature]}
                      </span>
                      <span className="quiet-badge">{trend.uploadWindow}</span>
                      <span className="quiet-badge">{trend.action}</span>
                    </div>
                    <h3>
                      <Link href={routes.trend(trend.id)}>{trend.phrase}</Link>
                    </h3>
                    <p>{trend.niche} / {trend.source}</p>
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
