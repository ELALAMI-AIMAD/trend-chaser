/** The print-on-demand marketplace platforms supported by Trend Chaser. */
export type Platform = "Amazon" | "Etsy" | "Redbubble";

/** Market heat classification for a trend. */
export type TrendTemperature = "hot" | "warm" | "cold";

/** IP/copyright safety verdict for a phrase. */
export type SafetyVerdict = "safe" | "review" | "blocked";

/** Recommended action for a trend based on its score. */
export type TrendAction = "Test" | "Watch" | "Skip";

/** Calendar proximity urgency level. */
export type UrgencyLevel = "late" | "act_now" | "soon" | "this_month" | "plan_ahead";

/** A raw trend phrase candidate surfaced by one or more collectors. */
export interface TrendCandidate {
  id: string;
  canonicalPhrase: string;
  normalizedPhrase: string;
  niche: string;
  subcategory?: string;
  sources: string[];
  firstSeenAt: string;
  lastSeenAt: string;
}

/** Per-platform demand and competition metrics for a trend phrase. */
export interface PlatformMetric {
  platform: Platform;
  demandScore: number;       // 0-100
  competitionScore: number;  // 0-100 (higher = more saturated)
  velocityScore: number;     // 0-100 (rate of growth)
  evidence: Record<string, unknown>;
}

/** Complete weighted score for a trend candidate. */
export interface TrendScore {
  total: number;          // 0-100 weighted composite
  demand: number;         // 0-100
  competition: number;    // 0-100 (100 = untapped / low competition)
  velocity: number;       // 0-100
  timing: number;         // 0-100 (calendar urgency)
  platformFit: number;    // 0-100
  ipSafety: number;       // 0-100
  confidence: number;     // 0-100
  temperature: TrendTemperature;
  action: TrendAction;
  reasonCodes: string[];
}

/** A raw data event captured from a collector source. */
export interface SourceEvent {
  id: string;
  phrase: string;
  platform: Platform;
  url?: string;
  detectedAt: string;
  rawData: Record<string, unknown>;
}

/** A seasonal or viral calendar event driving trend demand. */
export interface CalendarEvent {
  id: string;
  title: string;
  dateLabel: string;
  eventDate: string;
  daysAway: number;
  urgency: UrgencyLevel;
  platform: Platform;
  subcategories: string[];
  keywords: string[];
}

/** AI-generated enrichment data for a trend phrase. */
export interface AiEnrichment {
  phrase: string;
  summary: string;
  designPrompts: string[];
  listingKeywords: string[];
  safetyNotes: string[];
  generatedAt: string;
}

/** A daily pipeline scan run record. */
export interface ScanRun {
  id: string;
  status: "running" | "success" | "error";
  startedAt: string;
  finishedAt?: string;
  sourcesChecked: number;
  trendsFound: number;
  error?: string;
}

/** Result of an IP/trademark safety scan on a phrase. */
export interface IpSafetyCheck {
  phrase: string;
  verdict: SafetyVerdict;
  score: number;           // 0-100 (100 = fully safe)
  matchedTerms: string[];
  highRiskCategories: string[];
  notes: string[];
  checkedAt: string;
}

/** A family of deduplicated trend candidates sharing a normalized phrase. */
export interface TrendCandidateFamily {
  normalizedPhrase: string;
  variants: string[];
  candidates: TrendCandidate[];
  mergedSources: string[];
}
