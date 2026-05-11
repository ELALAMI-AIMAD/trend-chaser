export type {
  Platform,
  TrendTemperature,
  SafetyVerdict,
  TrendCandidate,
  PlatformMetric,
  CalendarEvent,
  IpSafetyCheck,
} from "@trend-chaser/core";

import type { TrendTemperature, SafetyVerdict, TrendCandidate, PlatformMetric, CalendarEvent, IpSafetyCheck } from "@trend-chaser/core";

export const PromptVersion = {
  TREND_ANALYSIS: "trend-v1",
  DESIGN_PROMPTS: "design-v1",
  CALENDAR_NICHES: "calendar-v1",
} as const;
export type PromptVersion = (typeof PromptVersion)[keyof typeof PromptVersion];

export const AiErrorCode = {
  PARSE_FAILURE: "PARSE_FAILURE",
  EMPTY_RESPONSE: "EMPTY_RESPONSE",
  INVALID_JSON: "INVALID_JSON",
  VALIDATION_FAILURE: "VALIDATION_FAILURE",
  SAFETY_BLOCKED: "SAFETY_BLOCKED",
  API_ERROR: "API_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  CONTEXT_TOO_LONG: "CONTEXT_TOO_LONG",
  RETRY_EXHAUSTED: "RETRY_EXHAUSTED",
} as const;
export type AiErrorCode = (typeof AiErrorCode)[keyof typeof AiErrorCode];

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly context?: Record<string, unknown>;

  constructor(code: AiErrorCode, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.context = context;
  }
}

export interface SourceEvidence {
  source: string;
  snippet: string;
  score?: number;
  capturedAt: string;
}

export interface AiEnrichmentInput {
  candidate: TrendCandidate;
  platformMetrics: PlatformMetric[];
  safetyPrecheck: IpSafetyCheck;
  sourceEvidence: SourceEvidence[];
  promptVersion: PromptVersion;
}

export interface PhraseVariation {
  phrase: string;
  angle: string;
  risk: "low" | "medium" | "high";
}

export interface DesignPromptItem {
  title: string;
  prompt: string;
  platformFit: Array<"amazon" | "etsy" | "redbubble">;
  styleTags: string[];
}

export interface AiEnrichmentOutput {
  normalizedPhrase: string;
  qualityVerdict: "strong" | "usable" | "weak" | "reject";
  whyNow: string;
  targetBuyer: string;
  designStyle: string;
  safetyVerdict: SafetyVerdict;
  safetyNotes: string[];
  phraseVariations: PhraseVariation[];
  designPrompts: DesignPromptItem[];
  listingKeywords: string[];
  platformNotes: {
    amazon: string;
    etsy: string;
    redbubble: string;
  };
}

export interface AiScoreInput {
  candidate: TrendCandidate;
  platformMetrics: PlatformMetric[];
  safetyPrecheck: IpSafetyCheck;
  sourceEvidence: SourceEvidence[];
  promptVersion: PromptVersion;
}

export interface AiScoreOutput {
  demand: number;
  competition: number;
  velocity: number;
  timing: number;
  platformFit: number;
  ipSafety: number;
  confidence: number;
  temperature: TrendTemperature;
  decision: "design_now" | "test_small" | "watch" | "skip";
  reasonCodes: string[];
  warnings: string[];
  explanation: string;
}

export interface CalendarNichesInput {
  event: CalendarEvent;
  promptVersion: PromptVersion;
}

export interface SubNiche {
  name: string;
  buyer: string;
  phraseAngles: string[];
  platformFit: {
    amazon: number;
    etsy: number;
    redbubble: number;
  };
  recommendedStyle: string;
  riskNotes: string[];
}

export interface CalendarNichesOutput {
  eventName: string;
  subNiches: SubNiche[];
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  model: string;
  promptVersion: PromptVersion;
  estimatedCostUsd?: number;
}
