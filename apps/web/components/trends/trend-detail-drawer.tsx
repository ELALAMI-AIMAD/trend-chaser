"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import type { TrendSignal } from "@/lib/seed-data";
import { temperatureLabel } from "@/lib/format";
import { SafetyBadge } from "./safety-badge";
import { ScoreBreakdown } from "./score-breakdown";
import { PlatformComparison } from "./platform-comparison";
import { PromptList } from "./prompt-list";

type TrendDetailDrawerProps = {
  trend: TrendSignal | null;
  open: boolean;
  onClose: () => void;
};

export function TrendDetailDrawer({ trend, open, onClose }: TrendDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "12px 12px 0 0",
          maxHeight: "92dvh"
        }}
      >
        {trend && (
          <div style={{ overflowY: "auto", padding: "0 24px 32px" }}>
            <DrawerHeader style={{ padding: "20px 0 16px" }}>
              <div className="badge-row" style={{ marginBottom: 8 }}>
                <span className={`temp-badge ${trend.temperature}`}>
                  {temperatureLabel[trend.temperature]}
                </span>
                <span className="quiet-badge">{trend.uploadWindow}</span>
                <SafetyBadge verdict={trend.safetyVerdict} notes={trend.safetyNotes} />
              </div>
              <DrawerTitle style={{ fontSize: "1.4rem", lineHeight: 1.1, color: "var(--text)" }}>
                {trend.phrase}
              </DrawerTitle>
              <p style={{ color: "var(--text-muted)", marginTop: 6, marginBottom: 0 }}>
                {trend.niche} / {trend.source}
              </p>
            </DrawerHeader>

            <div style={{ display: "grid", gap: 24 }}>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
                {trend.aiSummary}
              </p>

              <ScoreBreakdown trend={trend} />

              <div>
                <p className="eyebrow" style={{ marginBottom: 12 }}>Platform data</p>
                <PlatformComparison trend={trend} />
              </div>

              <div>
                <p className="eyebrow" style={{ marginBottom: 12 }}>Design prompts</p>
                <PromptList prompts={trend.designPrompts} />
              </div>

              <div>
                <p className="eyebrow" style={{ marginBottom: 10 }}>Listing keywords</p>
                <div className="keyword-chips">
                  {trend.listingKeywords.map((kw) => (
                    <span className="keyword-chip" key={kw}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
