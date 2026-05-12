export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchRedditTrends, type RedditTrend } from "@/lib/reddit-fetcher";
import { getTrends, type TrendSignal } from "@/lib/seed-data";

const querySchema = z.object({
  temperature: z.enum(["hot", "warm", "cold"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

function detectNiche(phrase: string): string {
  const normalized = phrase.toLowerCase();

  if (/\b(dog|cat|pet|pets)\b/.test(normalized)) return "Pet / Animal";
  if (/\b(coffee|tea)\b/.test(normalized)) return "Coffee / Lifestyle";
  if (/\b(teach|teacher|school)\b/.test(normalized)) return "Education";
  if (/\b(nurse|doctor|medical)\b/.test(normalized)) return "Medical";
  if (/\b(mom|dad|parent)\b/.test(normalized)) return "Family";
  if (/\b(funny|hilarious)\b/.test(normalized)) return "Humor";
  if (/\b(nature|earth|ocean)\b/.test(normalized)) return "Environment";

  return "Viral / Trending";
}

function mapRedditTrendToSignal(trend: RedditTrend): TrendSignal {
  return {
    id: trend.id,
    phrase: trend.phrase,
    niche: detectNiche(trend.phrase),
    subcategory: "Reddit Rising",
    temperature: trend.estimatedTemperature,
    score: trend.estimatedScore,
    momentum: Math.round(trend.numComments / 10),
    competition: "ultra-niche",
    uploadWindow: "Now",
    action: "Test",
    source: `r/${trend.subreddit}`,
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "review",
    safetyNotes: "Live Reddit signal; review phrase before upload.",
    aiSummary: `Rising on r/${trend.subreddit} with ${trend.score.toLocaleString()} upvotes and ${trend.numComments.toLocaleString()} comments.`,
    platformMetrics: [],
    designPrompts: [],
    listingKeywords: [],
    firstSeenAt: trend.observedAt,
    lastSeenAt: trend.observedAt,
    sources: 1,
    sourceType: "reddit",
    isLive: true,
    sourceUrl: trend.sourceUrl,
    observedAt: trend.observedAt
  };
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { temperature, limit = 50 } = parsed.data;

  const seedTrends = getTrends();

  let redditTrends: RedditTrend[] = [];
  let isLive = false;

  try {
    redditTrends = await fetchRedditTrends();
    isLive = redditTrends.length > 0;
  } catch {
    isLive = false;
  }

  const redditSignals = redditTrends.map(mapRedditTrendToSignal);

  let results = [...redditSignals, ...seedTrends];
  if (temperature) results = results.filter((trend) => trend.temperature === temperature);
  results = results.slice(0, limit);

  const liveCount = results.filter((trend) => trend.isLive).length;
  const seedCount = results.length - liveCount;

  return NextResponse.json({
    trends: results,
    meta: {
      total: results.length,
      liveCount,
      seedCount,
      isLive,
      lastFetched: new Date().toISOString()
    }
  });
}
