import type { Platform, UrgencyLevel } from "../types.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const UPLOAD_WINDOWS: Record<Platform, { startWeeks: number; endWeeks: number }> = {
  Amazon:    { startWeeks: 8,  endWeeks: 4 },
  Etsy:      { startWeeks: 10, endWeeks: 6 },
  Redbubble: { startWeeks: 9,  endWeeks: 5 },
};

/**
 * Classifies calendar proximity into an urgency level.
 * Negative daysUntilEvent means the event has already passed (→ "late").
 */
export function urgency(daysUntilEvent: number): UrgencyLevel {
  if (daysUntilEvent < 0)   return "late";
  if (daysUntilEvent <= 35) return "act_now";
  if (daysUntilEvent <= 45) return "soon";
  if (daysUntilEvent <= 60) return "this_month";
  return "plan_ahead";
}

/**
 * Converts an urgency level to a 0-100 timing score for use in the scoring formula.
 * act_now scores highest; late is penalized.
 */
export function urgencyToTimingScore(level: UrgencyLevel): number {
  const scores: Record<UrgencyLevel, number> = {
    act_now:    90,
    soon:       75,
    this_month: 60,
    plan_ahead: 40,
    late:       15,
  };
  return scores[level];
}

/**
 * Computes the recommended upload date window for a platform given an event date.
 * `start` is the earliest date to upload; `end` is the latest.
 */
export function uploadWindow(
  platform: Platform,
  eventDate: Date,
): { start: Date; end: Date } {
  const { startWeeks, endWeeks } = UPLOAD_WINDOWS[platform];
  return {
    start: new Date(eventDate.getTime() - startWeeks * WEEK_MS),
    end:   new Date(eventDate.getTime() - endWeeks   * WEEK_MS),
  };
}
