import { v } from "convex/values";

export const platform = v.union(
  v.literal("Amazon"),
  v.literal("Etsy"),
  v.literal("Redbubble")
);

export const temperature = v.union(
  v.literal("hot"),
  v.literal("warm"),
  v.literal("cold")
);

export const trendAction = v.union(
  v.literal("Test"),
  v.literal("Watch"),
  v.literal("Skip")
);

export const urgency = v.union(
  v.literal("design now"),
  v.literal("coming soon"),
  v.literal("plan ahead")
);

export const scanStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed")
);
