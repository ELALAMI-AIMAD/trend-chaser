import type { CollectorResult, SourceEventInput } from "@trend-chaser/collectors"

export type { CollectorResult, SourceEventInput }

export type ScanRunStatus = "running" | "succeeded" | "failed" | "partial"

export type ScanRun = {
  id: string
  status: ScanRunStatus
  startedAt: Date
  finishedAt?: Date
  trigger: "daily-cron" | "manual" | "backfill"
  sourceResults: CollectorResult[]
  candidateCount: number
  enrichedCount: number
  errorCount: number
  durationMs?: number
  metadata: Record<string, unknown>
}

export type ScanOptions = {
  trigger: ScanRun["trigger"]
  limit?: number
  skipCache?: boolean
  dryRun?: boolean
  sources?: string[]
}

export type ScanResult = {
  scanRun: ScanRun
  sourceEvents: SourceEventInput[]
  errors: Array<{
    step: string
    error: string
    recoverable: boolean
  }>
}
