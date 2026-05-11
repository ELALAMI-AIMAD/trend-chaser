"use client";
export const dynamic = "force-dynamic";

import { useQuery, useMutation } from "convex/react";
import { Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TopBar } from "@/components/app-shell/top-bar";
import { routes } from "@/lib/routes";
import { temperatureLabel } from "@/lib/format";

function formatAddedAt(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WatchlistPage() {
  const items = useQuery(api.watchlist.list) ?? [];
  const removeMutation = useMutation(api.watchlist.remove);

  function removeItem(id: Id<"watchlist">) {
    removeMutation({ id });
  }

  return (
    <>
      <TopBar title="Watchlist" eyebrow="Saved niches" />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
          {items.length} saved niche{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <Star size={28} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>No saved niches</p>
            <p style={{ fontSize: "0.85rem", margin: 0 }}>
              Add trends to your watchlist from the{" "}
              <Link href={routes.trends} style={{ color: "var(--orange)" }}>
                Trend Radar
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <div className="watchlist-grid">
          {items.map((item) => (
            <article className="watchlist-card" key={item._id}>
              <div>
                <div className="badge-row" style={{ marginBottom: 8 }}>
                  <span className={`temp-badge ${item.temperature}`}>
                    {temperatureLabel[item.temperature]}
                  </span>
                  {item.platforms.map((p) => (
                    <span className="quiet-badge" key={p}>{p}</span>
                  ))}
                </div>
                <h3 style={{ marginBottom: 4 }}>{item.phrase}</h3>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.85rem" }}>
                  {item.niche} · Score {item.score} · Added {formatAddedAt(item.addedAt)}
                </p>
                {item.notes && (
                  <div className="watchlist-notes">{item.notes}</div>
                )}
              </div>

              <button
                className="icon-button compact"
                aria-label={`Remove ${item.phrase} from watchlist`}
                onClick={() => removeItem(item._id)}
                style={{ color: "var(--text-muted)", alignSelf: "flex-start" }}
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
