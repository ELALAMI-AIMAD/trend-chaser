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
} from "./types.js";

// Scoring
export { calculateTrendScore } from "./scoring/calculate-trend-score.js";
export type { ScoreInput } from "./scoring/calculate-trend-score.js";
export { urgency, urgencyToTimingScore, uploadWindow } from "./scoring/urgency.js";
export {
  getTemperatureBadge,
  getTemperatureIcon,
  compareTemperatures,
} from "./scoring/temperature.js";

// Normalization
export { normalizePhrase } from "./normalization/normalize-phrase.js";
export { dedupeCandidates } from "./normalization/dedupe-candidates.js";

// Safety
export {
  BLOCKED_TERMS,
  HIGH_RISK_CATEGORIES,
  checkPhrase,
} from "./safety/restricted-terms.js";
export type { PhraseCheckResult } from "./safety/restricted-terms.js";
export { scanIpSafety } from "./safety/ip-safety.js";

// Taxonomy
export {
  NICHE_TAXONOMY,
  getNicheBySlug,
  getAllNiches,
  getSubcategories,
  getNichesByCategory,
} from "./taxonomy/niches.js";
export type { Niche, NicheCategory } from "./taxonomy/niches.js";
