"use client";
export const dynamic = "force-dynamic";

import { useQuery, useMutation } from "convex/react";
import { Play } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { TopBar } from "@/components/app-shell/top-bar";
import { scanRuns as seedRuns } from "@/lib/seed-data";
import { formatDuration } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  succeeded: "Succeeded",
  failed: "Failed",
  partial: "Partial",
};

const STATUS_COLOR: Record<string, string> = {
  queued: "var(--muted)",
  running: "var(--cyan)",
  completed: "var(--green)",
  succeeded: "var(--green)",
  failed: "var(--hot)",
  partial: "var(--warm)",
};

function formatTs(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export default function ScanRunsPage() {
  const convexRuns = useQuery(api.scanRuns.listScanRuns, {});
  const createRun = useMutation(api.scanRuns.createScanRun);

  const isLoading = convexRuns === undefined;

  function triggerScan() {
    const now = Date.now();
    createRun({
      status: "running",
      trigger: "manual",
      startedAt: now,
      candidateCount: 0,
      enrichedCount: 0,
      errorCount: 0,
      metadata: { source: "ui-trigger" }
    });
  }

  if (isLoading) {
    return (
      <>
        <TopBar title="Scan runs" eyebrow="Pipeline history" />
        <div className="empty-state" style={{ opacity: 0.5 }}>Loading scan history…</div>
      </>
    );
  }

  const runs = convexRuns.length > 0 ? convexRuns : null;
  const isDemoMode = !runs;

  const totalRuns = isDemoMode ? seedRuns.length : runs!.length;

  const completedRuns = isDemoMode
    ? seedRuns.filter((r) => r.status === "completed").length
    : runs!.filter((r) => r.status === "succeeded" || r.status === "completed").length;

  const failedRuns = isDemoMode
    ? seedRuns.filter((r) => r.status === "failed").length
    : runs!.filter((r) => r.status === "failed").length;

  const avgDurationSeed = Math.round(
    seedRuns
      .filter((r) => r.durationSeconds !== undefined)
      .reduce((acc, r) => acc + (r.durationSeconds ?? 0), 0) /
      Math.max(seedRuns.filter((r) => r.durationSeconds !== undefined).length, 1)
  );

  const avgDurationLive = (() => {
    if (!runs) return 0;
    const withDuration = runs.filter((r) => r.durationMs !== undefined);
    if (withDuration.length === 0) return 0;
    const totalMs = withDuration.reduce((acc, r) => acc + (r.durationMs ?? 0), 0);
    return Math.round(totalMs / withDuration.length / 1000);
  })();

  const avgDuration = isDemoMode ? avgDurationSeed : avgDurationLive;

  return (
    <>
      <TopBar title="Scan runs" eyebrow="Pipeline history" />

      <section className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {[
          { label: "Total runs", value: totalRuns, tone: "cyan" },
          { label: "Completed", value: completedRuns, tone: "green" },
          { label: "Failed", value: failedRuns, tone: "pink" },
          { label: "Avg duration", value: formatDuration(avgDuration), tone: "gold" }
        ].map((kpi) => (
          <article className={`kpi-card tone-${kpi.tone}`} key={kpi.label}>
            <div>
              <p>{kpi.label}</p>
              <strong style={{ fontSize: "1.6rem" }}>{kpi.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>
            Run history{isDemoMode && (
              <span style={{ fontSize: "0.72rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 8 }}>
                demo data
              </span>
            )}
          </h2>
          <button
            className="primary-button"
            style={{ minHeight: 36, padding: "0 14px", fontSize: "0.82rem" }}
            onClick={triggerScan}
          >
            <Play size={14} aria-hidden />
            Trigger scan
          </button>
        </div>

        <div className="scan-runs-list">
          {isDemoMode
            ? seedRuns.map((run) => (
                <article className="scan-run-card" key={run.id}>
                  <div
                    className="scan-status-dot"
                    style={{ background: STATUS_COLOR[run.status] ?? "var(--muted)" }}
                    aria-label={STATUS_LABEL[run.status] ?? run.status}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <strong style={{ fontSize: "0.9rem" }}>{run.startedAt}</strong>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STATUS_COLOR[run.status] ?? "var(--muted)" }}>
                        {STATUS_LABEL[run.status] ?? run.status}
                      </span>
                    </div>
                    <div className="scan-run-stats">
                      <span className="scan-run-stat">Sources: <strong>{run.sourcesChecked}</strong></span>
                      <span className="scan-run-stat">Trends found: <strong>{run.trendsFound}</strong></span>
                      {run.durationSeconds !== undefined && (
                        <span className="scan-run-stat">Duration: <strong>{formatDuration(run.durationSeconds)}</strong></span>
                      )}
                    </div>
                    {run.error && (
                      <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "var(--hot)", lineHeight: 1.5 }}>
                        {run.error}
                      </p>
                    )}
                  </div>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{run.id}</span>
                </article>
              ))
            : runs!.map((run) => (
                <article className="scan-run-card" key={run._id}>
                  <div
                    className="scan-status-dot"
                    style={{ background: STATUS_COLOR[run.status] ?? "var(--muted)" }}
                    aria-label={STATUS_LABEL[run.status] ?? run.status}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <strong style={{ fontSize: "0.9rem" }}>{formatTs(run.startedAt)}</strong>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STATUS_COLOR[run.status] ?? "var(--muted)" }}>
                        {STATUS_LABEL[run.status] ?? run.status}
                      </span>
                    </div>
                    <div className="scan-run-stats">
                      <span className="scan-run-stat">Candidates: <strong>{run.candidateCount}</strong></span>
                      <span className="scan-run-stat">Enriched: <strong>{run.enrichedCount}</strong></span>
                      {run.durationMs !== undefined && (
                        <span className="scan-run-stat">Duration: <strong>{formatDuration(Math.round(run.durationMs / 1000))}</strong></span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {run._id.slice(0, 12)}…
                  </span>
                </article>
              ))}
        </div>
      </section>
    </>
  );
}
