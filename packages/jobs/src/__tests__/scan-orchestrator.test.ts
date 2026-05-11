import { beforeEach, describe, expect, it, vi } from "vitest"
import type { SourceCollector, SourceEventInput } from "@trend-chaser/collectors"
import { clearFailedJobs, getFailedJobs } from "../dead-letter.js"

const mocks = vi.hoisted(() => ({
  collectors: [] as SourceCollector[],
  generateTrendEnrichment: vi.fn(),
  generateCalendarNiches: vi.fn(),
}))

vi.mock("@trend-chaser/collectors", async () => {
  const actual = await vi.importActual<typeof import("@trend-chaser/collectors")>(
    "@trend-chaser/collectors"
  )
  return {
    ...actual,
    COLLECTORS: mocks.collectors,
  }
})

vi.mock("@trend-chaser/ai", async () => {
  const actual = await vi.importActual<typeof import("@trend-chaser/ai")>("@trend-chaser/ai")
  return {
    ...actual,
    generateTrendEnrichment: mocks.generateTrendEnrichment,
    generateCalendarNiches: mocks.generateCalendarNiches,
  }
})

function sourceEvent(
  title: string,
  overrides: Partial<SourceEventInput> = {}
): SourceEventInput {
  return {
    source: "reddit",
    externalId: `event-${title}`,
    title,
    observedAt: new Date("2026-05-10T00:00:00.000Z"),
    metrics: {
      demand: 90,
      competition: 90,
      velocity: 90,
      timing: 90,
      platformFit: 90,
      confidence: 90,
    },
    raw: {},
    ...overrides,
  }
}

function calendarEvent(title = "Father's Day"): SourceEventInput {
  return sourceEvent(title, {
    source: "calendar",
    externalId: `calendar-${title}`,
    metrics: {
      demand: 90,
      competition: 90,
      velocity: 90,
      timing: 90,
      platformFit: 90,
      confidence: 90,
      daysUntilEvent: 30,
      date: "2026-06-21T00:00:00.000Z",
      region: "US",
      category: "family",
    },
  })
}

function collector(id: string, events: SourceEventInput[]): SourceCollector {
  return {
    id,
    collect: vi.fn().mockResolvedValue(events),
  }
}

function failingCollector(id: string): SourceCollector {
  return {
    id,
    collect: vi.fn().mockRejectedValue(new Error(`${id} failed`)),
  }
}

async function runDailyScan() {
  const mod = await import("../scan-orchestrator.js")
  return mod.runDailyScan
}

beforeEach(() => {
  mocks.collectors.length = 0
  mocks.generateTrendEnrichment.mockReset()
  mocks.generateCalendarNiches.mockReset()
  mocks.generateTrendEnrichment.mockResolvedValue({})
  mocks.generateCalendarNiches.mockResolvedValue({})
  clearFailedJobs()
})

describe("runDailyScan", () => {
  it("Full happy path returns succeeded", async () => {
    mocks.collectors.push(
      collector("reddit", [sourceEvent("Funny Coffee Life")]),
      collector("etsy", [sourceEvent("Teacher Summer Mode")]),
      collector("amazon", [sourceEvent("Camping Weekend Crew")]),
      collector("calendar", [calendarEvent()])
    )

    const scan = await runDailyScan()
    const result = await scan({ trigger: "manual" })

    expect(result.scanRun.status).toBe("succeeded")
    expect(result.scanRun.sourceResults).toHaveLength(4)
    expect(result.sourceEvents).toHaveLength(4)
    expect(mocks.generateTrendEnrichment).toHaveBeenCalledTimes(4)
    expect(mocks.generateCalendarNiches).toHaveBeenCalledTimes(1)
  })

  it("One collector failing gives partial status", async () => {
    mocks.collectors.push(
      collector("reddit", [sourceEvent("Funny Coffee Life")]),
      failingCollector("etsy"),
      collector("amazon", [sourceEvent("Camping Weekend Crew")]),
      collector("calendar", [])
    )

    const scan = await runDailyScan()
    const result = await scan({ trigger: "manual" })

    expect(result.scanRun.status).toBe("partial")
    expect(result.errors).toEqual([
      { step: "collect:etsy", error: "etsy failed", recoverable: true },
    ])
  })

  it("All collectors failing gives failed status", async () => {
    mocks.collectors.push(
      failingCollector("reddit"),
      failingCollector("etsy"),
      failingCollector("amazon"),
      failingCollector("calendar")
    )

    const scan = await runDailyScan()
    const result = await scan({ trigger: "manual" })

    expect(result.scanRun.status).toBe("failed")
    expect(result.sourceEvents).toEqual([])
    expect(result.errors).toHaveLength(4)
  })

  it("dryRun skips generateTrendEnrichment", async () => {
    mocks.collectors.push(collector("reddit", [sourceEvent("Funny Coffee Life")]))

    const scan = await runDailyScan()
    await scan({ trigger: "manual", dryRun: true })

    expect(mocks.generateTrendEnrichment).not.toHaveBeenCalled()
  })

  it("dryRun skips generateCalendarNiches", async () => {
    mocks.collectors.push(collector("calendar", [calendarEvent()]))

    const scan = await runDailyScan()
    await scan({ trigger: "manual", dryRun: true })

    expect(mocks.generateCalendarNiches).not.toHaveBeenCalled()
  })

  it("Blocked candidates are not enriched", async () => {
    mocks.collectors.push(collector("reddit", [sourceEvent("Star Wars Coffee Club")]))

    const scan = await runDailyScan()
    const result = await scan({ trigger: "manual" })

    expect(result.scanRun.candidateCount).toBe(1)
    expect(result.scanRun.enrichedCount).toBe(0)
    expect(mocks.generateTrendEnrichment).not.toHaveBeenCalled()
  })

  it("Failed enrichment goes to dead letter", async () => {
    mocks.collectors.push(collector("reddit", [sourceEvent("Funny Coffee Life")]))
    mocks.generateTrendEnrichment.mockRejectedValueOnce(new Error("Claude failed"))

    const scan = await runDailyScan()
    const result = await scan({ trigger: "manual" })

    expect(result.scanRun.enrichedCount).toBe(0)
    expect(getFailedJobs({ jobType: "trend-enrichment" })).toHaveLength(1)
    expect(getFailedJobs()[0]).toMatchObject({
      jobType: "trend-enrichment",
      error: "Claude failed",
      recoverable: true,
      retryCount: 0,
    })
  })

  it("ScanResult.errors populated correctly", async () => {
    mocks.collectors.push(
      failingCollector("reddit"),
      collector("etsy", [sourceEvent("Funny Coffee Life")])
    )
    mocks.generateTrendEnrichment.mockRejectedValueOnce(new Error("Claude failed"))

    const scan = await runDailyScan()
    const result = await scan({ trigger: "manual" })

    expect(result.errors).toEqual([
      { step: "collect:reddit", error: "reddit failed", recoverable: true },
      { step: "enrich:Funny Coffee Life", error: "Claude failed", recoverable: true },
    ])
  })

  it("candidateCount and enrichedCount accurate", async () => {
    mocks.collectors.push(
      collector("reddit", [
        sourceEvent("Funny Coffee Life"),
        sourceEvent("funny coffee life"),
        sourceEvent("Teacher Summer Mode"),
      ])
    )

    const scan = await runDailyScan()
    const result = await scan({ trigger: "manual" })

    expect(result.scanRun.candidateCount).toBe(2)
    expect(result.scanRun.enrichedCount).toBe(2)
  })

  it("options.sources filters collectors correctly", async () => {
    const reddit = collector("reddit", [sourceEvent("Funny Coffee Life")])
    const etsy = collector("etsy", [sourceEvent("Teacher Summer Mode")])
    const amazon = collector("amazon", [sourceEvent("Camping Weekend Crew")])
    const calendar = collector("calendar", [calendarEvent()])
    mocks.collectors.push(reddit, etsy, amazon, calendar)

    const scan = await runDailyScan()
    await scan({ trigger: "manual", sources: ["reddit", "calendar"] })

    expect(reddit.collect).toHaveBeenCalledTimes(1)
    expect(calendar.collect).toHaveBeenCalledTimes(1)
    expect(etsy.collect).not.toHaveBeenCalled()
    expect(amazon.collect).not.toHaveBeenCalled()
  })

  it("options.limit respected in collect calls", async () => {
    const reddit = collector("reddit", [sourceEvent("Funny Coffee Life")])
    mocks.collectors.push(reddit)

    const scan = await runDailyScan()
    await scan({ trigger: "manual", limit: 7 })

    expect(reddit.collect).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 7,
      })
    )
  })
})
