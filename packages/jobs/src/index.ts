/**
 * @package @trend-chaser/jobs
 *
 * Daily scan orchestrator for Trend Chaser.
 * Coordinates source collection, normalization,
 * scoring, safety checks, and AI enrichment
 * into a single automated pipeline.
 *
 * Entry point: runDailyScan(options)
 *
 * @see packages/core for scoring and safety
 * @see packages/ai for Claude enrichment
 * @see packages/collectors for data sources
 */

export { runDailyScan } from "./scan-orchestrator"

export type {
  ScanRun,
  ScanRunStatus,
  ScanOptions,
  ScanResult,
} from "./types"

export {
  isRetryable,
  withRetry,
  RETRY_DELAYS,
  MAX_RETRIES,
} from "./retry-policy"

export {
  addFailedJob,
  getFailedJobs,
  getFailedJobCount,
  getDeadLetterStats,
  clearFailedJobs,
  retryFailedJobs,
} from "./dead-letter"

export type {
  FailedJob,
  DeadLetterStats,
} from "./dead-letter"
