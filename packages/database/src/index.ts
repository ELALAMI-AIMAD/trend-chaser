// packages/database — Convex schema types and shared query helpers.
// The Convex schema lives in apps/web/convex/schema.ts.
// This package re-exports domain types for use in packages/core and packages/jobs.

export type { Platform, Temperature, SafetyVerdict, TrendAction } from "../../core/src/index";

// Domain types mirroring the Convex schema tables

export type TrendSignalRow = {
  externalId: string;
  phrase: string;
  niche: string;
  temperature: "hot" | "warm" | "cold";
  score: number;
  momentum: number;
  competition: string;
  uploadWindow: string;
  action: "Test" | "Watch" | "Skip";
  source: string;
  platforms: ("Amazon" | "Etsy" | "Redbubble")[];
  createdAt: number;
  updatedAt: number;
};

export type CalendarEventRow = {
  title: string;
  dateLabel: string;
  eventDate: string;
  daysAway: number;
  urgency: "design now" | "coming soon" | "plan ahead";
  platform: "Amazon" | "Etsy" | "Redbubble";
  createdAt: number;
  updatedAt: number;
};

export type ScanRunRow = {
  status: "queued" | "running" | "completed" | "failed";
  startedAt: number;
  finishedAt?: number;
  sourcesChecked: number;
  trendsFound: number;
  error?: string;
};

export type WatchlistRow = {
  userId: string;
  phrase: string;
  niche: string;
  temperature: "hot" | "warm" | "cold";
  score: number;
  platforms: ("Amazon" | "Etsy" | "Redbubble")[];
  notes?: string;
  trendExternalId?: string;
  addedAt: number;
};
