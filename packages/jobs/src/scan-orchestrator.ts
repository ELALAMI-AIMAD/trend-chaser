import pLimit from "p-limit"
import { COLLECTORS } from "@trend-chaser/collectors"
import type { CollectorResult, SourceCollector, SourceEventInput } from "@trend-chaser/collectors"
import {
  calculateTrendScore,
  checkPhrase,
  normalizePhrase,
  urgencyToTimingScore,
} from "@trend-chaser/core"
import type { SafetyVerdict, ScoreInput, TrendScore, UrgencyLevel } from "@trend-chaser/core"
import {
  AiError,
  AiErrorCode,
  generateCalendarNiches,
  generateTrendEnrichment,
} from "@trend-chaser/ai"
import { addFailedJob } from "./dead-letter.js"
import type { ScanOptions, ScanResult, ScanRun, ScanRunStatus } from "./types.js"

type Candidate = {
  normalizedPhrase: string
  phrase: string
  events: SourceEventInput[]
  score: TrendScore
}

type SafetyCheckedCandidate = Candidate & {
  safetyVerdict: SafetyVerdict
  safetyNotes: string[]
}

const AI_RATE_LIMIT_WAIT_MS = 60_000
const PLATFORM_KEYS = ["amazon", "etsy", "redbubble"] as const

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function errorCode(error: unknown): string | undefined {
  if (error instanceof AiError) return error.code
  if (error !== null && typeof error === "object") {
    const value = (error as Record<string, unknown>)["code"]
    return typeof value === "string" ? value : undefined
  }
  return undefined
}

function metricNumber(metrics: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = metrics[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
  }
  return undefined
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function average(values: number[], fallback: number): number {
  if (values.length === 0) return fallback
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function sourceDiversityScore(events: SourceEventInput[]): number {
  const sourceCount = new Set(events.map((event) => event.source)).size
  return clampScore(45 + sourceCount * 15)
}

function extractDemandScore(event: SourceEventInput): number {
  const direct = metricNumber(event.metrics, ["demand", "demandScore"])
  if (direct !== undefined) return clampScore(direct)

  const redditScore = metricNumber(event.metrics, ["score"])
  if (redditScore !== undefined) return clampScore(Math.log10(redditScore + 10) * 25)

  const favorers = metricNumber(event.metrics, ["numFavorers"])
  if (favorers !== undefined) return clampScore(Math.log10(favorers + 10) * 28)

  const views = metricNumber(event.metrics, ["views"])
  if (views !== undefined) return clampScore(Math.log10(views + 10) * 20)

  return 60
}

function extractCompetitionScore(event: SourceEventInput): number {
  const direct = metricNumber(event.metrics, ["competition", "competitionScore"])
  if (direct !== undefined) return clampScore(direct)

  const resultCount = metricNumber(event.metrics, ["resultCount"])
  if (resultCount !== undefined) {
    return clampScore(100 - Math.log10(resultCount + 10) * 18)
  }

  return 62
}

function extractVelocityScore(event: SourceEventInput): number {
  const direct = metricNumber(event.metrics, ["velocity", "velocityScore", "momentum"])
  if (direct !== undefined) return clampScore(direct)

  const upvoteRatio = metricNumber(event.metrics, ["upvoteRatio"])
  if (upvoteRatio !== undefined) return clampScore(upvoteRatio * 100)

  const sort = event.metrics["sort"]
  if (sort === "rising") return 72
  if (sort === "hot") return 66

  return 58
}

function extractTimingScore(event: SourceEventInput): number {
  const direct = metricNumber(event.metrics, ["timing", "timingScore"])
  if (direct !== undefined) return clampScore(direct)

  const urgency = event.metrics["urgency"]
  if (typeof urgency === "string" && isUrgencyLevel(urgency)) {
    return urgencyToTimingScore(urgency)
  }

  const daysUntilEvent = metricNumber(event.metrics, ["daysUntilEvent"])
  if (daysUntilEvent !== undefined) {
    if (daysUntilEvent < 0) return 15
    if (daysUntilEvent <= 35) return 90
    if (daysUntilEvent <= 45) return 75
    if (daysUntilEvent <= 60) return 60
    return 40
  }

  return 55
}

function extractPlatformFitScore(event: SourceEventInput): number {
  const direct = metricNumber(event.metrics, ["platformFit", "platformFitScore"])
  if (direct !== undefined) return clampScore(direct)

  if (event.source === "amazon" || event.source === "etsy" || event.source === "redbubble") {
    return 76
  }

  return 62
}

function extractConfidenceScore(event: SourceEventInput): number {
  const direct = metricNumber(event.metrics, ["confidence", "confidenceScore"])
  if (direct !== undefined) return clampScore(direct)

  const dataQuality = event.metrics["dataQuality"]
  if (dataQuality === "real") return 78
  if (dataQuality === "stub") return 45

  return 65
}

function isUrgencyLevel(value: string): value is UrgencyLevel {
  return value === "late" ||
    value === "act_now" ||
    value === "soon" ||
    value === "this_month" ||
    value === "plan_ahead"
}

function buildScoreInput(events: SourceEventInput[]): ScoreInput {
  return {
    demand: average(events.map(extractDemandScore), 60),
    competition: average(events.map(extractCompetitionScore), 62),
    velocity: average(events.map(extractVelocityScore), 58),
    timing: average(events.map(extractTimingScore), 55),
    platformFit: Math.max(
      average(events.map(extractPlatformFitScore), 62),
      sourceDiversityScore(events)
    ),
    ipSafety: 85,
    confidence: Math.max(
      average(events.map(extractConfidenceScore), 65),
      sourceDiversityScore(events)
    ),
  }
}

function normalizeAndDedupe(sourceEvents: SourceEventInput[]): Map<string, SourceEventInput[]> {
  const groups = new Map<string, SourceEventInput[]>()

  for (const event of sourceEvents) {
    const normalized = normalizePhrase(event.title)
    if (!normalized) continue

    const existing = groups.get(normalized)
    if (existing) {
      existing.push(event)
    } else {
      groups.set(normalized, [event])
    }
  }

  return groups
}

function pickCanonicalPhrase(events: SourceEventInput[]): string {
  return events
    .map((event) => event.title.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] ?? "Untitled trend"
}

function inferNiche(events: SourceEventInput[]): string {
  const category = events
    .map((event) => event.metrics["category"])
    .find((value): value is string => typeof value === "string")

  if (category) return category.replace(/[_-]/g, " ")

  const query = events
    .map((event) => event.metrics["query"])
    .find((value): value is string => typeof value === "string")

  if (query) return query.replace(/\bshirt\b/gi, "").trim() || "general POD"

  return "general POD"
}

function qualityVerdict(score: TrendScore): "strong" | "usable" | "weak" | "reject" {
  if (score.temperature === "hot") return "strong"
  if (score.temperature === "warm") return "usable"
  if (score.total >= 40) return "weak"
  return "reject"
}

function inferPlatformFit(events: SourceEventInput[]): Array<(typeof PLATFORM_KEYS)[number]> {
  const platforms = new Set<(typeof PLATFORM_KEYS)[number]>()

  for (const event of events) {
    if (event.source === "amazon" || event.source === "etsy" || event.source === "redbubble") {
      platforms.add(event.source)
    }
  }

  if (platforms.size === 0) {
    for (const platform of PLATFORM_KEYS) platforms.add(platform)
  }

  return Array.from(platforms)
}

function buildCandidates(groups: Map<string, SourceEventInput[]>): Candidate[] {
  return Array.from(groups.entries()).map(([normalizedPhrase, events]) => {
    const scoreInput = buildScoreInput(events)

    return {
      normalizedPhrase,
      phrase: pickCanonicalPhrase(events),
      events,
      score: calculateTrendScore(scoreInput),
    }
  })
}

function toCollectInput(scanRunId: string, startedAt: Date, limit?: number) {
  return {
    scanRunId,
    fromDate: new Date(startedAt.getTime() - 24 * 60 * 60 * 1000),
    toDate: startedAt,
    limit,
  }
}

function finalStatus(results: CollectorResult[]): ScanRunStatus {
  if (results.length === 0) return "failed"
  const failed = results.filter((result) => result.status === "failed").length
  if (failed === results.length) return "failed"
  if (failed > 0) return "partial"
  return "succeeded"
}

async function collectSources(
  collectors: SourceCollector[],
  scanRunId: string,
  startedAt: Date,
  options: ScanOptions,
  sourceResults: CollectorResult[],
  errors: ScanResult["errors"]
): Promise<SourceEventInput[]> {
  const collectionLimit = pLimit(2)
  const collectInput = toCollectInput(scanRunId, startedAt, options.limit)

  const nested = await Promise.all(
    collectors.map((collector) =>
      collectionLimit(async (): Promise<SourceEventInput[]> => {
        const startMs = Date.now()
        try {
          const events = await collector.collect(collectInput)
          const result: CollectorResult = {
            source: collector.id,
            status: "succeeded",
            recordsFetched: events.length,
            durationMs: Date.now() - startMs,
          }
          sourceResults.push(result)
          console.log(
            `[scan] Collector ${collector.id} succeeded — ${events.length} events in ${result.durationMs}ms`
          )
          return events
        } catch (error) {
          const result: CollectorResult = {
            source: collector.id,
            status: "failed",
            recordsFetched: 0,
            durationMs: Date.now() - startMs,
            error: errorMessage(error),
          }
          sourceResults.push(result)
          errors.push({
            step: `collect:${collector.id}`,
            error: errorMessage(error),
            recoverable: true,
          })
          console.error(`[scan] Collector ${collector.id} failed — ${errorMessage(error)}`)
          return []
        }
      })
    )
  )

  return nested.flat()
}

function safetyCheckCandidates(candidates: Candidate[]): {
  enrichmentCandidates: SafetyCheckedCandidate[]
  verdictCounts: Record<SafetyVerdict, number>
} {
  const verdictCounts: Record<SafetyVerdict, number> = {
    safe: 0,
    review: 0,
    blocked: 0,
  }
  const enrichmentCandidates: SafetyCheckedCandidate[] = []

  for (const candidate of candidates) {
    const safety = checkPhrase(candidate.phrase)
    verdictCounts[safety.verdict] += 1

    if (safety.verdict === "blocked") {
      console.warn(`[scan] Blocked candidate skipped — ${candidate.phrase}`)
      continue
    }

    enrichmentCandidates.push({
      ...candidate,
      safetyVerdict: safety.verdict,
      safetyNotes: safety.notes,
    })
  }

  return { enrichmentCandidates, verdictCounts }
}

async function enrichTrends(
  candidates: SafetyCheckedCandidate[],
  scanRunId: string,
  options: ScanOptions,
  errors: ScanResult["errors"]
): Promise<number> {
  const enrichmentLimit = pLimit(3)
  let enrichedCount = 0

  await Promise.all(
    candidates.map((candidate) =>
      enrichmentLimit(async () => {
        try {
          await generateTrendEnrichment({
            trendCandidateId: candidate.normalizedPhrase,
            phrase: candidate.phrase,
            niche: inferNiche(candidate.events),
            qualityVerdict: qualityVerdict(candidate.score),
            targetBuyer: `POD buyers interested in ${inferNiche(candidate.events)}`,
            designStyle: "bold printable typography with simple supporting illustration",
            platformFit: inferPlatformFit(candidate.events),
          }, {
            skipCache: options.skipCache ?? false,
          })
          enrichedCount += 1
          if (enrichedCount % 5 === 0 || enrichedCount === candidates.length) {
            console.log(`[scan] Enriched ${enrichedCount}/${candidates.length}...`)
          }
        } catch (error) {
          if (errorCode(error) === AiErrorCode.RATE_LIMITED) {
            await sleep(AI_RATE_LIMIT_WAIT_MS)
            try {
              await generateTrendEnrichment({
                trendCandidateId: candidate.normalizedPhrase,
                phrase: candidate.phrase,
                niche: inferNiche(candidate.events),
                qualityVerdict: qualityVerdict(candidate.score),
                targetBuyer: `POD buyers interested in ${inferNiche(candidate.events)}`,
                designStyle: "bold printable typography with simple supporting illustration",
                platformFit: inferPlatformFit(candidate.events),
              }, {
                skipCache: options.skipCache ?? false,
              })
              enrichedCount += 1
              if (enrichedCount % 5 === 0 || enrichedCount === candidates.length) {
                console.log(`[scan] Enriched ${enrichedCount}/${candidates.length}...`)
              }
              return
            } catch (retryError) {
              recordEnrichmentFailure(candidate, scanRunId, retryError, errors)
              return
            }
          }

          recordEnrichmentFailure(candidate, scanRunId, error, errors)
        }
      })
    )
  )

  return enrichedCount
}

function recordEnrichmentFailure(
  candidate: SafetyCheckedCandidate,
  scanRunId: string,
  error: unknown,
  errors: ScanResult["errors"]
): void {
  addFailedJob({
    jobType: "trend-enrichment",
    payload: { phrase: candidate.phrase, scanRunId },
    error: errorMessage(error),
    errorCode: errorCode(error),
    recoverable: true,
    retryCount: 0,
  })
  errors.push({
    step: `enrich:${candidate.phrase}`,
    error: errorMessage(error),
    recoverable: true,
  })
}

async function enrichCalendarEvents(
  sourceEvents: SourceEventInput[],
  options: ScanOptions,
  errors: ScanResult["errors"]
): Promise<number> {
  const calendarEvents = sourceEvents.filter((event) => {
    const daysUntilEvent = metricNumber(event.metrics, ["daysUntilEvent"])
    return event.source === "calendar" &&
      daysUntilEvent !== undefined &&
      daysUntilEvent <= 60
  })
  const calendarLimit = pLimit(2)
  let enrichedCount = 0

  await Promise.all(
    calendarEvents.map((event) =>
      calendarLimit(async () => {
        try {
          const daysUntilEvent = metricNumber(event.metrics, ["daysUntilEvent"]) ?? 0
          const eventDate =
            typeof event.metrics["date"] === "string"
              ? event.metrics["date"]
              : event.observedAt.toISOString()
          const region = typeof event.metrics["region"] === "string" ? event.metrics["region"] : "US"
          const category =
            typeof event.metrics["category"] === "string"
              ? event.metrics["category"]
              : "seasonal"

          await generateCalendarNiches({
            eventName: event.title,
            eventDate,
            daysUntilEvent,
            region,
            category,
            existingNiches: [],
            platforms: ["amazon", "etsy", "redbubble"],
          }, {
            skipCache: options.skipCache ?? false,
          })
          enrichedCount += 1
        } catch (error) {
          errors.push({
            step: `calendar-enrichment:${event.title}`,
            error: errorMessage(error),
            recoverable: true,
          })
          console.error(`[scan] Calendar enrichment failed — ${event.title}: ${errorMessage(error)}`)
        }
      })
    )
  )

  console.log(`[scan] ${enrichedCount} calendar events enriched`)
  return enrichedCount
}

export async function runDailyScan(
  options: ScanOptions
): Promise<ScanResult> {
  const scanRunId = crypto.randomUUID()
  const startedAt = new Date()
  const dryRun = options.dryRun ?? false
  const sourceResults: CollectorResult[] = []
  const errors: ScanResult["errors"] = []

  const scanRun: ScanRun = {
    id: scanRunId,
    status: "running",
    startedAt,
    trigger: options.trigger,
    sourceResults,
    candidateCount: 0,
    enrichedCount: 0,
    errorCount: 0,
    metadata: {
      dryRun,
      skipCache: options.skipCache ?? false,
      sources: options.sources ?? "all",
    },
  }

  console.log(`[scan] Starting — trigger: ${options.trigger}, dryRun: ${dryRun}`)

  try {
    const selectedCollectors = options.sources !== undefined
      ? COLLECTORS.filter((collector) => options.sources?.includes(collector.id))
      : COLLECTORS

    const sourceEvents = await collectSources(
      selectedCollectors,
      scanRunId,
      startedAt,
      options,
      sourceResults,
      errors
    )

    const candidateGroups = normalizeAndDedupe(sourceEvents)
    scanRun.candidateCount = candidateGroups.size
    console.log(
      `[scan] ${candidateGroups.size} unique candidates from ${sourceEvents.length} source events`
    )

    const candidates = buildCandidates(candidateGroups)
    const hotCandidates = candidates.filter((candidate) => candidate.score.temperature === "hot")
    const warmCandidates = candidates.filter((candidate) => candidate.score.temperature === "warm")
    const coldCandidates = candidates.filter((candidate) => candidate.score.temperature === "cold")
    const enrichmentPool = [...hotCandidates, ...warmCandidates]
    console.log(
      `[scan] hot: ${hotCandidates.length} warm: ${warmCandidates.length} cold: ${coldCandidates.length}`
    )

    const { enrichmentCandidates, verdictCounts } = safetyCheckCandidates(enrichmentPool)
    console.log(
      `[scan] safety — safe: ${verdictCounts.safe} review: ${verdictCounts.review} blocked: ${verdictCounts.blocked}`
    )

    if (!dryRun) {
      scanRun.enrichedCount = await enrichTrends(
        enrichmentCandidates,
        scanRunId,
        options,
        errors
      )
      await enrichCalendarEvents(sourceEvents, options, errors)
    }

    scanRun.status = finalStatus(sourceResults)
    scanRun.finishedAt = new Date()
    scanRun.durationMs = scanRun.finishedAt.getTime() - scanRun.startedAt.getTime()
    scanRun.errorCount = errors.length

    console.log(
      `[scan] Complete ✓\n` +
      `duration: ${scanRun.durationMs}ms\n` +
      `sources: ${sourceEvents.length} events\n` +
      `candidates: ${scanRun.candidateCount}\n` +
      `enriched: ${scanRun.enrichedCount}\n` +
      `errors: ${errors.length}\n` +
      `status: ${scanRun.status}`
    )

    return {
      scanRun,
      sourceEvents,
      errors,
    }
  } catch (error) {
    scanRun.status = "failed"
    scanRun.finishedAt = new Date()
    scanRun.durationMs = scanRun.finishedAt.getTime() - scanRun.startedAt.getTime()
    scanRun.errorCount = errors.length + 1

    throw new Error(
      `[scan] Failed during pure scan computation: ${errorMessage(error)}`,
      { cause: error }
    )
  }
}
