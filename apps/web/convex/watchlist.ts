import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { platform, temperature } from "./validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  }
});

export const add = mutation({
  args: {
    phrase: v.string(),
    niche: v.string(),
    temperature,
    score: v.number(),
    platforms: v.array(platform),
    notes: v.optional(v.string()),
    trendExternalId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_phrase", (q) =>
        q.eq("userId", identity.subject).eq("phrase", args.phrase)
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("watchlist", {
      ...args,
      userId: identity.subject,
      addedAt: Date.now()
    });
  }
});

export const remove = mutation({
  args: { id: v.id("watchlist") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  }
});
