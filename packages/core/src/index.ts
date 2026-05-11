// Types
export type {
  Platform,
  TrendTemperature,
  SafetyVerdict,
  TrendAction,
  UrgencyLevel,
  TrendCandidate,
  PlatformMetric,
  TrendScore,
  SourceEvent,
  CalendarEvent,
  AiEnrichment,
  ScanRun,
  IpSafetyCheck,
  TrendCandidateFamily,
} from "./types";

// Scoring
export { calculateTrendScore } from "./scoring/calculate-trend-score";
export type { ScoreInput } from "./scoring/calculate-trend-score";
export { urgency, urgencyToTimingScore, uploadWindow } from "./scoring/urgency";
export {
  getTemperatureBadge,
  getTemperatureIcon,
  compareTemperatures,
} from "./scoring/temperature";

// Normalization
export { normalizePhrase } from "./normalization/normalize-phrase";
export { dedupeCandidates } from "./normalization/dedupe-candidates";

// Safety
export {
  BLOCKED_TERMS,
  HIGH_RISK_CATEGORIES,
  checkPhrase,
} from "./safety/restricted-terms";
export type { PhraseCheckResult } from "./safety/restricted-terms";
export { scanIpSafety } from "./safety/ip-safety";

// Taxonomy
export {
  NICHE_TAXONOMY,
  getNicheBySlug,
  getAllNiches,
  getSubcategories,
  getNichesByCategory,
} from "./taxonomy/niches";
export type { Niche, NicheCategory } from "./taxonomy/niches";
