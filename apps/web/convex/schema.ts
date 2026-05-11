import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { platform, scanStatus, temperature, trendAction } from "./validators";

const scoreObject = v.object({
  total: v.number(),
  temperature: v.string(),
  demand: v.number(),
  competition: v.number(),
  velocity: v.number(),
  timing: v.number(),
  platformFit: v.number(),
  ipSafety: v.number(),
  confidence: v.number(),
});

export default defineSchema({
  // ── legacy seed-data table (kept for watchlist trendExternalId refs) ──────
  trendSignals: defineTable({
    externalId: v.string(),
    phrase: v.string(),
    niche: v.string(),
    temperature,
    score: v.number(),
    momentum: v.number(),
    competition: v.string(),
    uploadWindow: v.string(),
    action: trendAction,
    source: v.string(),
    platforms: v.array(platform),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_external_id", ["externalId"])
    .index("by_temperature", ["temperature"])
    .index("by_score", ["score"]),

  // ── pipeline-native trend table ───────────────────────────────────────────
  trends: defineTable({
    canonicalPhrase: v.string(),
    normalizedPhrase: v.string(),
    niche: v.string(),
    subcategory: v.optional(v.string()),
    status: v.string(),
    score: v.optional(scoreObject),
    aiEnrichment: v.optional(v.any()),
    safetyVerdict: v.optional(v.string()),
    sources: v.number(),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_temperature", ["score.temperature"])
    .index("by_normalized_phrase", ["normalizedPhrase"]),

  // ── calendar events (pipeline schema) ────────────────────────────────────
  calendarEvents: defineTable({
    name: v.string(),
    date: v.number(),
    region: v.string(),
    category: v.string(),
    daysUntilEvent: v.number(),
    urgency: v.string(),
    uploadWindows: v.any(),
    designPrompts: v.optional(v.array(v.string())),
    subNiches: v.optional(v.any()),
  })
    .index("by_urgency", ["urgency"])
    .index("by_date", ["date"]),

  // ── platform snapshots ────────────────────────────────────────────────────
  platformSnapshots: defineTable({
    platform,
    signal: v.string(),
    competition: v.string(),
    action: v.string(),
    score: v.number(),
    updatedAt: v.number(),
  }).index("by_platform", ["platform"]),

  // ── scan runs (pipeline schema) ───────────────────────────────────────────
  scanRuns: defineTable({
    status: v.string(),
    trigger: v.string(),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    candidateCount: v.number(),
    enrichedCount: v.number(),
    errorCount: v.number(),
    durationMs: v.optional(v.number()),
    metadata: v.any(),
  })
    .index("by_status", ["status"])
    .index("by_started_at", ["startedAt"]),

  // ── watchlist (unchanged) ─────────────────────────────────────────────────
  watchlist: defineTable({
    userId: v.string(),
    phrase: v.string(),
    niche: v.string(),
    temperature,
    score: v.number(),
    platforms: v.array(platform),
    notes: v.optional(v.string()),
    trendExternalId: v.optional(v.string()),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_phrase", ["userId", "phrase"]),
});
