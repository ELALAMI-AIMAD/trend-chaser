import type { TrendScore, TrendTemperature, TrendAction } from "../types";

/** All scoring dimensions (0-100 each). Higher is always better. */
export interface ScoreInput {
  /** Search volume / market demand. */
  demand: number;
  /** Inverted saturation: 100 = untapped market, 0 = fully saturated. */
  competition: number;
  /** Rate of growth / momentum. */
  velocity: number;
  /** Calendar timing urgency. Use urgencyToTimingScore() to derive this. */
  timing: number;
  /** How well the phrase fits the target platforms' audiences. */
  platformFit: number;
  /** IP safety score from scanIpSafety(). 100 = fully safe. */
  ipSafety: number;
  /** Confidence in data quality (sample size, source agreement). */
  confidence: number;
}

const WEIGHTS = {
  demand:      0.22,
  competition: 0.18,
  velocity:    0.18,
  timing:      0.14,
  platformFit: 0.14,
  ipSafety:    0.10,
  confidence:  0.04,
} as const;

/**
 * Calculates the composite trend score using the weighted formula:
 *   total = demand×0.22 + competition×0.18 + velocity×0.18 + timing×0.14
 *         + platformFit×0.14 + ipSafety×0.10 + confidence×0.04
 *
 * Temperature rules:
 *   hot:  total ≥ 75 AND ipSafety ≥ 70
 *   warm: total ≥ 55
 *   cold: total < 55
 *
 * All inputs are clamped to [0, 100] before scoring.
 */
export function calculateTrendScore(input: ScoreInput): TrendScore {
  const c = clampAll(input);

  const total =
    c.demand      * WEIGHTS.demand      +
    c.competition * WEIGHTS.competition +
    c.velocity    * WEIGHTS.velocity    +
    c.timing      * WEIGHTS.timing      +
    c.platformFit * WEIGHTS.platformFit +
    c.ipSafety    * WEIGHTS.ipSafety    +
    c.confidence  * WEIGHTS.confidence;

  const rounded     = round(total);
  const temperature = deriveTemperature(rounded, c.ipSafety);
  const action      = deriveAction(temperature);
  const reasonCodes = deriveReasonCodes(c, rounded);

  return {
    total:       rounded,
    demand:      c.demand,
    competition: c.competition,
    velocity:    c.velocity,
    timing:      c.timing,
    platformFit: c.platformFit,
    ipSafety:    c.ipSafety,
    confidence:  c.confidence,
    temperature,
    action,
    reasonCodes,
  };
}

function clampAll(input: ScoreInput): ScoreInput {
  const result = { ...input };
  for (const key of Object.keys(result) as (keyof ScoreInput)[]) {
    result[key] = Math.max(0, Math.min(100, result[key]));
  }
  return result;
}

function deriveTemperature(total: number, ipSafety: number): TrendTemperature {
  if (total >= 75 && ipSafety >= 70) return "hot";
  if (total >= 55) return "warm";
  return "cold";
}

function deriveAction(temperature: TrendTemperature): TrendAction {
  if (temperature === "hot")  return "Test";
  if (temperature === "warm") return "Watch";
  return "Skip";
}

function deriveReasonCodes(input: ScoreInput, total: number): string[] {
  const codes: string[] = [];
  if (input.demand >= 70)      codes.push("high-demand");
  if (input.demand < 40)       codes.push("low-demand");
  if (input.competition >= 70) codes.push("low-competition");
  if (input.competition < 40)  codes.push("high-competition");
  if (input.velocity >= 70)    codes.push("high-velocity");
  if (input.timing >= 75)      codes.push("good-timing");
  if (input.timing <= 20)      codes.push("poor-timing");
  if (input.ipSafety < 70)     codes.push("ip-risk");
  if (input.ipSafety < 30)     codes.push("ip-blocked");
  if (input.confidence < 40)   codes.push("low-confidence");
  if (total >= 75)             codes.push("top-score");
  return codes;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
