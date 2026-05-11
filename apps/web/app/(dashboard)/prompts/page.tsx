"use client";

import { Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { TopBar } from "@/components/app-shell/top-bar";
import { savedPrompts, type SavedPrompt } from "@/lib/seed-data";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>(savedPrompts);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPrompt(prompt: SavedPrompt) {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function removePrompt(id: string) {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <TopBar title="Saved prompts" eyebrow="Design library" />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
          {prompts.length} saved prompt{prompts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {prompts.length === 0 ? (
        <div className="empty-state">
          No saved prompts yet. Copy prompts from a trend or calendar event to save them here.
        </div>
      ) : (
        <div className="prompts-grid">
          {prompts.map((prompt) => (
            <article className="prompt-card" key={prompt.id}>
              <div className="prompt-card-header">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="quiet-badge">{prompt.style}</span>
                  <span
                    className="quiet-badge"
                    style={{
                      color: prompt.source === "trend" ? "var(--cyan)" : "var(--gold)",
                      borderColor: prompt.source === "trend"
                        ? "rgba(34,199,216,0.3)"
                        : "rgba(247,201,72,0.3)"
                    }}
                  >
                    {prompt.source === "trend" ? "Trend" : "Calendar"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="icon-button compact"
                    aria-label="Copy prompt"
                    onClick={() => copyPrompt(prompt)}
                  >
                    {copiedId === prompt.id ? (
                      <Check size={14} style={{ color: "var(--green)" }} aria-hidden />
                    ) : (
                      <Copy size={14} aria-hidden />
                    )}
                  </button>
                  <button
                    className="icon-button compact"
                    aria-label="Remove prompt"
                    onClick={() => removePrompt(prompt.id)}
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </div>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontWeight: 600,
                    fontSize: "0.9rem"
                  }}
                >
                  {prompt.phrase}
                </p>
                <p className="prompt-text" style={{ margin: 0 }}>{prompt.prompt}</p>
              </div>

              <div className="keyword-chips">
                {prompt.keywords.map((kw) => (
                  <span className="keyword-chip" key={kw}>{kw}</span>
                ))}
              </div>

              <span style={{ color: "var(--text-dim)", fontSize: "0.72rem" }}>
                Saved {prompt.savedAt}
              </span>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
