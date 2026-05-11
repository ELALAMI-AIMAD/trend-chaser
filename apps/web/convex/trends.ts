import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { platform, temperature, trendAction } from "./validators";

const scoreArg = v.optional(
  v.object({
    total: v.number(),
    temperature: v.string(),
    demand: v.number(),
    competition: v.number(),
    velocity: v.number(),
    timing: v.number(),
    platformFit: v.number(),
    ipSafety: v.number(),
    confidence: v.number(),
  })
);

// ── pipeline-native trends table ──────────────────────────────────────────────

export const getTrends = query({
  args: {
    temperature: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);

    if (args.temperature) {
      return await ctx.db
        .query("trends")
        .withIndex("by_temperature", (q) =>
          q.eq("score.temperature", args.temperature!)
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("trends").order("desc").take(limit);
  },
});

export const getTrendById = query({
  args: { id: v.id("trends") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const upsertTrend = mutation({
  args: {
    canonicalPhrase: v.string(),
    normalizedPhrase: v.string(),
    niche: v.string(),
    subcategory: v.optional(v.string()),
    status: v.string(),
    score: scoreArg,
    aiEnrichment: v.optional(v.any()),
    safetyVerdict: v.optional(v.string()),
    sources: v.number(),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trends")
      .withIndex("by_normalized_phrase", (q) =>
        q.eq("normalizedPhrase", args.normalizedPhrase)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        sources: Math.max(existing.sources, args.sources),
        lastSeenAt: args.lastSeenAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("trends", args);
  },
});

export const updateTrendEnrichment = mutation({
  args: {
    id: v.id("trends"),
    enrichment: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { aiEnrichment: args.enrichment });
    return args.id;
  },
});

// ── legacy trendSignals table (seed data + watchlist backward compat) ─────────

export const list = query({
  args: {
    temperature: v.optional(temperature),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);

    if (args.temperature) {
      return await ctx.db
        .query("trendSignals")
        .withIndex("by_temperature", (q) => q.eq("temperature", args.temperature!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("trendSignals").order("desc").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("trendSignals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const upsert = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("trendSignals")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("trendSignals", { ...args, createdAt: now, updatedAt: now });
  },
});
