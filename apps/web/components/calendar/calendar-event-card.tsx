"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { CalendarOpportunity } from "@/lib/seed-data";
import { UrgencyBadge } from "./urgency-badge";

type CalendarEventCardProps = {
  event: CalendarOpportunity;
};

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  const [copied, setCopied] = useState(false);
  const [month, day] = event.date.split(" ");

  async function copyPrompt() {
    await navigator.clipboard.writeText(event.designPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="calendar-event-card-full">
      <div className="calendar-event-header">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div className="calendar-date-block">
            <strong>{day}</strong>
            <span>{month}</span>
          </div>
          <div>
            <h3 style={{ marginBottom: 6 }}>{event.title}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <UrgencyBadge urgency={event.urgency} />
              <span className="quiet-badge">{event.platform}</span>
              <span className="quiet-badge">Deadline: {event.uploadDeadline}</span>
              <span className="quiet-badge">{event.daysAway}d away</span>
            </div>
          </div>
        </div>
      </div>

      {event.subNiches.length > 0 && (
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Sub-niches</p>
          <div className="sub-niches">
            {event.subNiches.map((niche) => (
              <span className="keyword-chip" key={niche}>{niche}</span>
            ))}
          </div>
        </div>
      )}

      <div className="prompt-block">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Design prompt</span>
          <button
            className="icon-button compact"
            aria-label="Copy design prompt"
            onClick={copyPrompt}
          >
            {copied ? (
              <Check size={14} style={{ color: "var(--green)" }} aria-hidden />
            ) : (
              <Copy size={14} aria-hidden />
            )}
          </button>
        </div>
        <p className="prompt-text">{event.designPrompt}</p>
      </div>

      <div className="keyword-chips">
        {event.listingKeywords.map((kw) => (
          <span className="keyword-chip" key={kw}>{kw}</span>
        ))}
      </div>
    </article>
  );
}
