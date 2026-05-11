/**
 * @package @trend-chaser/ai
 *
 * Claude API integration for Trend Chaser.
 * Provides trend enrichment, design prompt
 * generation, and calendar niche expansion
 * powered by Claude claude-sonnet-4-20250514.
 *
 * All outputs are validated with Zod schemas
 * before being returned to callers.
 *
 * @see packages/core for scoring and safety
 * @see packages/jobs for orchestration
 */

// Client and helpers
export {
  callClaude,
  extractText,
  parseJsonResponse,
  logTokenUsage,
  POD_SYSTEM_PROMPT,
} from "./anthropic";

// Generation functions
export { generateTrendEnrichment } from "./generate-trend-enrichment";
export { generateCalendarNiches } from "./generate-calendar-niches";

// Quality gates
export { runQualityGates } from "./quality-gates";
export type { QualityGateResult, QualityGateFailure } from "./quality-gates";

// Schemas (for external validation)
// Internal names are EnrichmentSchema / ScoreSchema — exported with Ai-prefix for API clarity
export { EnrichmentSchema as AiEnrichmentSchema } from "./schemas/enrichment.schema";
export { ScoreSchema as AiScoreSchema } from "./schemas/score.schema";
export { CalendarNichesSchema } from "./schemas/calendar.schema";

// Prompt builders and versions
export {
  buildDesignPromptsPrompt,
  PROMPT_VERSION as DESIGN_PROMPT_VERSION,
} from "./prompts/design-prompts.prompt";
export {
  buildTrendAnalysisPrompt,
  PROMPT_VERSION as TREND_ANALYSIS_VERSION,
} from "./prompts/trend-analysis.prompt";
export {
  buildCalendarNichesPrompt,
  PROMPT_VERSION as CALENDAR_NICHES_VERSION,
} from "./prompts/calendar-niches.prompt";

// Types
export type {
  AiEnrichmentInput,
  AiEnrichmentOutput,
  CalendarNichesInput,
  CalendarNichesOutput,
  PromptVersion,
} from "./types";
export { AiError, AiErrorCode } from "./types";

// TrendAnalysisInput lives in the prompt file (not types.ts)
export type { TrendAnalysisInput } from "./prompts/trend-analysis.prompt";
