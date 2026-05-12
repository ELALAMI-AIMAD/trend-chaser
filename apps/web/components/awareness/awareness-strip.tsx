"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { AiPlatform, AwarenessNiche } from "@/lib/seed-data";

type AwarenessStripProps = {
  niches: AwarenessNiche[];
};

const accentColors: Record<string, string> = {
  "mental-health": "#20d27c",
  "breast-cancer": "#f02a8a",
  autism: "#4d8dff",
  "nurse-medical": "#22c7d8",
  teacher: "#f7c948",
  "dog-mom": "#ff6a1a",
  veterans: "#ff4d4d",
  coffee: "#8b5e3c"
};

const platformLabels: Record<AiPlatform, string> = {
  amazon: "Amazon",
  etsy: "Etsy",
  redbubble: "RB"
};

function monthDistance(monthNumber: number, currentMonth: number): number {
  return (monthNumber - currentMonth + 12) % 12;
}

export function AwarenessStrip({ niches }: AwarenessStripProps) {
  const currentMonth = new Date().getMonth() + 1;

  const activeNiches = niches
    .map((niche) => ({
      niche,
      distance: monthDistance(niche.monthNumber, currentMonth)
    }))
    .filter(({ distance }) => distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .map(({ niche }) => niche);

  if (activeNiches.length === 0) return null;

  return (
    <section className="awareness-section" aria-labelledby="active-awareness-heading">
      <div className="section-heading awareness-heading">
        <div>
          <p className="eyebrow">Design these now - peak buying season</p>
          <h2 id="active-awareness-heading">🎗️ Active Awareness Months</h2>
        </div>
      </div>

      <div className="awareness-strip" role="list">
        {activeNiches.map((niche) => {
          const accent = accentColors[niche.id] ?? "#20d27c";
          const style = { "--awareness-accent": accent } as CSSProperties;

          return (
            <article className="awareness-card" key={niche.id} role="listitem" style={style}>
              <div className="awareness-card-accent" aria-hidden />
              <div className="awareness-card-top">
                <span className="awareness-ribbon" aria-hidden>{niche.ribbon}</span>
                <span>{niche.month}</span>
              </div>

              <h3>{niche.name}</h3>

              <div className="awareness-divider" />

              <div className="awareness-phrases">
                <span>Top phrases:</span>
                <ul>
                  {niche.phraseAngles.map((phrase) => (
                    <li key={phrase}>{phrase}</li>
                  ))}
                </ul>
              </div>

              <div className="awareness-platforms" aria-label="Platform fit">
                {niche.platforms.map((platform) => (
                  <span className={`awareness-platform awareness-platform--${platform}`} key={platform}>
                    {platformLabels[platform]}
                  </span>
                ))}
              </div>

              <div className="awareness-style" title={niche.designStyle}>
                <span aria-hidden>🎨</span>
                <span>{niche.designStyle}</span>
              </div>

              <Link className="awareness-view-link" href={`/trends?niche=${encodeURIComponent(niche.id)}`}>
                View Trends →
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
