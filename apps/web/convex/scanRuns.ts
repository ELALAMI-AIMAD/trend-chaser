import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listScanRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scanRuns")
      .withIndex("by_started_at")
      .order("desc")
      .take(Math.min(args.limit ?? 20, 100));
  },
});

export const createScanRun = mutation({
  args: {
    status: v.string(),
    trigger: v.string(),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    candidateCount: v.number(),
    enrichedCount: v.number(),
    errorCount: v.number(),
    durationMs: v.optional(v.number()),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scanRuns", args);
  },
});

export const updateScanRun = mutation({
  args: {
    id: v.id("scanRuns"),
    status: v.optional(v.string()),
    finishedAt: v.optional(v.number()),
    candidateCount: v.optional(v.number()),
    enrichedCount: v.optional(v.number()),
    errorCount: v.optional(v.number()),
    durationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, patch);
    return id;
  },
});
