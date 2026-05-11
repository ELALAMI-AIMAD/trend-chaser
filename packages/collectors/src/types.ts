// packages/collectors — shared types for all source collectors

export type SourceEventInput = {
  source: string
  externalId: string
  sourceUrl?: string
  title: string
  body?: string
  observedAt: Date
  metrics: Record<string, unknown>
  raw: Record<string, unknown>
}

export type CollectorConfig = {
  id: string
  enabled: boolean
  rateLimit: number
  timeout: number
  retries: number
}

export type CollectorResult = {
  source: string
  status: "success" | "succeeded" | "partial" | "failed"
  recordsFetched: number
  durationMs: number
  error?: string
}

export type CollectInput = {
  scanRunId: string
  fromDate: Date
  toDate: Date
  limit?: number
}

export interface SourceCollector {
  id: string
  collect(input: CollectInput): Promise<SourceEventInput[]>
}
