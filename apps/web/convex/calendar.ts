import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listUpcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calendarEvents")
      .withIndex("by_date")
      .order("asc")
      .take(Math.min(args.limit ?? 50, 100));
  },
});

export const upsert = mutation({
  args: {
    name: v.string(),
    date: v.number(),
    region: v.string(),
    category: v.string(),
    daysUntilEvent: v.number(),
    urgency: v.string(),
    uploadWindows: v.any(),
    designPrompts: v.optional(v.array(v.string())),
    subNiches: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("calendarEvents")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("calendarEvents", args);
  },
});
