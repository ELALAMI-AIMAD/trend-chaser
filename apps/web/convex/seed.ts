import { mutation } from "./_generated/server";

const trends = [
  {
    externalId: "seed-living-my-best-chaotic-life",
    phrase: "Living My Best Chaotic Life",
    niche: "Coffee lover",
    temperature: "hot" as const,
    score: 82,
    momentum: 74,
    competition: "Ultra niche",
    uploadWindow: "24h",
    action: "Test" as const,
    source: "Search trend",
    platforms: ["Amazon", "Etsy", "Redbubble"] as const
  },
  {
    externalId: "seed-science-keeps-getting-weirder",
    phrase: "Science Keeps Getting Weirder",
    niche: "Science humor",
    temperature: "hot" as const,
    score: 78,
    momentum: 69,
    competition: "Ultra niche",
    uploadWindow: "24h",
    action: "Test" as const,
    source: "Search trend",
    platforms: ["Amazon", "Etsy"] as const
  },
  {
    externalId: "seed-living-in-the-weirdest-timeline",
    phrase: "Living In The Weirdest Timeline",
    niche: "Internet culture",
    temperature: "warm" as const,
    score: 61,
    momentum: 55,
    competition: "Low",
    uploadWindow: "3d",
    action: "Watch" as const,
    source: "Search trend",
    platforms: ["Amazon", "Etsy", "Redbubble"] as const
  }
];

// Graduation Season: 2026-06-01
const GRADUATION = new Date("2026-06-01T00:00:00Z").getTime();
// Pride Month: 2026-06-01
const PRIDE = GRADUATION;
// World Bicycle Day: 2026-06-03
const BICYCLE_DAY = new Date("2026-06-03T00:00:00Z").getTime();

const calendarEvents = [
  {
    name: "Graduation Season",
    date: GRADUATION,
    region: "US",
    category: "calendar-seasonal",
    daysUntilEvent: 21,
    urgency: "design now",
    uploadWindows: { amazon: "2026-04-24", etsy: "2026-03-27", redbubble: "2026-04-03" }
  },
  {
    name: "Pride Month",
    date: PRIDE,
    region: "US",
    category: "calendar-seasonal",
    daysUntilEvent: 21,
    urgency: "design now",
    uploadWindows: { amazon: "2026-04-24", etsy: "2026-03-27", redbubble: "2026-04-03" }
  },
  {
    name: "World Bicycle Day",
    date: BICYCLE_DAY,
    region: "US",
    category: "calendar-seasonal",
    daysUntilEvent: 23,
    urgency: "design now",
    uploadWindows: { amazon: "2026-04-26", etsy: "2026-03-29", redbubble: "2026-04-05" }
  }
];

const platformSnapshots = [
  {
    platform: "Amazon" as const,
    signal: "Best for fast test uploads",
    competition: "Mixed",
    action: "Prioritize ultra-niche phrases",
    score: 72
  },
  {
    platform: "Etsy" as const,
    signal: "Best for calendar-led designs",
    competition: "Unknown in current report",
    action: "Add Open API checks",
    score: 58
  },
  {
    platform: "Redbubble" as const,
    signal: "New platform gap",
    competition: "Not yet measured",
    action: "Build collector and scoring",
    score: 45
  }
];

export const dashboardSnapshot = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    for (const trend of trends) {
      const existing = await ctx.db
        .query("trendSignals")
        .withIndex("by_external_id", (q) => q.eq("externalId", trend.externalId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...trend,
          platforms: [...trend.platforms],
          updatedAt: now
        });
      } else {
        await ctx.db.insert("trendSignals", {
          ...trend,
          platforms: [...trend.platforms],
          createdAt: now,
          updatedAt: now
        });
      }
    }

    for (const event of calendarEvents) {
      await ctx.db.insert("calendarEvents", event);
    }

    for (const snapshot of platformSnapshots) {
      const existing = await ctx.db
        .query("platformSnapshots")
        .withIndex("by_platform", (q) => q.eq("platform", snapshot.platform))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { ...snapshot, updatedAt: now });
      } else {
        await ctx.db.insert("platformSnapshots", { ...snapshot, updatedAt: now });
      }
    }

    await ctx.db.insert("scanRuns", {
      status: "succeeded",
      trigger: "manual",
      startedAt: now,
      finishedAt: now,
      candidateCount: trends.length,
      enrichedCount: trends.length,
      errorCount: 0,
      durationMs: 1200,
      metadata: { source: "seed" }
    });

    return {
      trends: trends.length,
      calendarEvents: calendarEvents.length,
      platformSnapshots: platformSnapshots.length
    };
  }
});
