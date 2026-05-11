"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { DesignPrompt } from "@/lib/seed-data";

type PromptListProps = {
  prompts: DesignPrompt[];
};

export function PromptList({ prompts }: PromptListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPrompt(prompt: DesignPrompt) {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (prompts.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: 100 }}>
        No design prompts generated yet.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {prompts.map((prompt) => (
        <div className="prompt-block" key={prompt.id}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span
              className="quiet-badge"
              style={{ fontSize: "0.72rem" }}
            >
              {prompt.style}
            </span>
            <button
              className="icon-button compact"
              aria-label={`Copy ${prompt.style} prompt`}
              onClick={() => copyPrompt(prompt)}
            >
              {copiedId === prompt.id ? (
                <Check size={15} style={{ color: "var(--green)" }} aria-hidden />
              ) : (
                <Copy size={15} aria-hidden />
              )}
            </button>
          </div>

          <p className="prompt-text">{prompt.prompt}</p>

          <div className="keyword-chips">
            {prompt.keywords.map((kw) => (
              <span className="keyword-chip" key={kw}>{kw}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
