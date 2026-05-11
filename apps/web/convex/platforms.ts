import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { platform } from "./validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("platformSnapshots").collect();
  }
});

export const upsertSnapshot = mutation({
  args: {
    platform,
    signal: v.string(),
    competition: v.string(),
    action: v.string(),
    score: v.number()
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("platformSnapshots")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now
      });
      return existing._id;
    }

    return await ctx.db.insert("platformSnapshots", {
      ...args,
      updatedAt: now
    });
  }
});
