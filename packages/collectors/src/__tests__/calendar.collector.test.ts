import { vi, describe, it, expect, beforeAll, afterAll } from "vitest"
import { CalendarCollector, slugify } from "../collectors/calendar.collector.js"
import type { CollectInput } from "../types.js"

// ── helpers ───────────────────────────────────────────────────────────────────

const testInput: CollectInput = {
  scanRunId: "test-scan",
  fromDate: new Date(Date.UTC(2026, 0, 1)),
  toDate: new Date(Date.UTC(2026, 11, 31)),
}

// Control new Date() for all tests; restore after suite
beforeAll(() => vi.useFakeTimers())
afterAll(() => vi.useRealTimers())

// ── slugify ───────────────────────────────────────────────────────────────────

describe("slugify", () => {
  it("handles apostrophes — Father's Day → fathers-day", () => {
    expect(slugify("Father's Day")).toBe("fathers-day")
  })

  it("handles apostrophes — Mother's Day → mothers-day", () => {
    expect(slugify("Mother's Day")).toBe("mothers-day")
  })

  it("handles plain names — World Chocolate Day → world-chocolate-day", () => {
    expect(slugify("World Chocolate Day")).toBe("world-chocolate-day")
  })

  it("handles dots — St. Patrick's Day → st-patricks-day", () => {
    expect(slugify("St. Patrick's Day")).toBe("st-patricks-day")
  })

  it("handles slashes — Spring Equinox / First Day → spring-equinox-first-day", () => {
    expect(slugify("Spring Equinox / First Day")).toBe("spring-equinox-first-day")
  })

  it("collapses multiple whitespace runs into a single hyphen", () => {
    expect(slugify("International  Talk  Day")).toBe("international-talk-day")
  })
})

// ── future-event filter ───────────────────────────────────────────────────────

describe("CalendarCollector.collect — future event filter", () => {
  const collector = new CalendarCollector()

  it("excludes events that have already passed", async () => {
    // May 5, 2026 midnight UTC — Star Wars Day (May 4) is past
    vi.setSystemTime(new Date(Date.UTC(2026, 4, 5)))

    const result = await collector.collect(testInput)
    const titles = result.map((e) => e.title)

    expect(titles).not.toContain("Star Wars Day")
  })

  it("includes events from today onward", async () => {
    // May 5, 2026 — Mother's Day (May 10) is upcoming
    vi.setSystemTime(new Date(Date.UTC(2026, 4, 5)))

    const result = await collector.collect(testInput)
    const titles = result.map((e) => e.title)

    expect(titles).toContain("Mother's Day")
  })

  it("includes an event whose date equals today exactly", async () => {
    // Set time to exactly Valentine's Day midnight UTC
    vi.setSystemTime(new Date(Date.UTC(2026, 1, 14)))

    const result = await collector.collect(testInput)
    const titles = result.map((e) => e.title)

    expect(titles).toContain("Valentine's Day")
  })
})

// ── daysUntilEvent calculation ────────────────────────────────────────────────

describe("CalendarCollector.collect — daysUntilEvent", () => {
  const collector = new CalendarCollector()

  it("calculates daysUntilEvent correctly for a known gap", async () => {
    // Jan 3 → National Handwriting Day (Jan 23) = exactly 20 days
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 3)))

    const result = await collector.collect(testInput)
    const handwriting = result.find((e) => e.title === "National Handwriting Day")

    expect(handwriting).toBeDefined()
    expect(handwriting!.metrics["daysUntilEvent"]).toBe(20)
  })

  it("assigns urgency 'act_now' for an event 20 days out", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 3)))

    const result = await collector.collect(testInput)
    const handwriting = result.find((e) => e.title === "National Handwriting Day")

    expect(handwriting!.metrics["urgency"]).toBe("act_now")
  })

  it("assigns urgency 'plan_ahead' for an event 184 days out", async () => {
    // Jan 1 → Independence Day (Jul 4) = 184 days
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const july4 = result.find((e) => e.title === "Independence Day")

    expect(july4!.metrics["urgency"]).toBe("plan_ahead")
  })
})

// ── uploadWindows ─────────────────────────────────────────────────────────────

describe("CalendarCollector.collect — uploadWindows", () => {
  const collector = new CalendarCollector()

  it("Amazon window for Valentine's Day: start=8wk before, end=4wk before", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const valentine = result.find((e) => e.title === "Valentine's Day")
    const windows = valentine!.metrics["uploadWindows"] as {
      amazon: { start: string; end: string }
    }

    // Feb 14 - 8 weeks = Dec 20, 2025
    expect(windows.amazon.start).toBe("2025-12-20T00:00:00.000Z")
    // Feb 14 - 4 weeks = Jan 17, 2026
    expect(windows.amazon.end).toBe("2026-01-17T00:00:00.000Z")
  })

  it("Etsy window starts 10 weeks before and ends 6 weeks before", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const valentine = result.find((e) => e.title === "Valentine's Day")
    const windows = valentine!.metrics["uploadWindows"] as {
      etsy: { start: string; end: string }
    }

    // Feb 14 - 10 weeks = Dec 6, 2025
    expect(windows.etsy.start).toBe("2025-12-06T00:00:00.000Z")
    // Feb 14 - 6 weeks = Jan 3, 2026
    expect(windows.etsy.end).toBe("2026-01-03T00:00:00.000Z")
  })

  it("Redbubble window starts 9 weeks before and ends 5 weeks before", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const valentine = result.find((e) => e.title === "Valentine's Day")
    const windows = valentine!.metrics["uploadWindows"] as {
      redbubble: { start: string; end: string }
    }

    // Feb 14 - 9 weeks = Dec 13, 2025
    expect(windows.redbubble.start).toBe("2025-12-13T00:00:00.000Z")
    // Feb 14 - 5 weeks = Jan 10, 2026
    expect(windows.redbubble.end).toBe("2026-01-10T00:00:00.000Z")
  })
})

// ── sort order ────────────────────────────────────────────────────────────────

describe("CalendarCollector.collect — sort order", () => {
  const collector = new CalendarCollector()

  it("events are sorted by daysUntilEvent ascending (nearest first)", async () => {
    // Jan 1 midnight UTC — New Year's Day is daysUntilEvent=0, MLK Day is 18
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)

    expect(result[0]!.title).toBe("New Year's Day")
    expect(result[1]!.title).toBe("Martin Luther King Jr. Day")
  })

  it("daysUntilEvent values are non-decreasing", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const days = result.map((e) => e.metrics["daysUntilEvent"] as number)

    for (let i = 1; i < days.length; i++) {
      expect(days[i]!).toBeGreaterThanOrEqual(days[i - 1]!)
    }
  })
})

// ── input.limit ───────────────────────────────────────────────────────────────

describe("CalendarCollector.collect — input.limit", () => {
  const collector = new CalendarCollector()

  it("respects input.limit and returns exactly N events", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect({ ...testInput, limit: 5 })

    expect(result.length).toBe(5)
  })

  it("limit=1 returns only the nearest upcoming event", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect({ ...testInput, limit: 1 })

    expect(result.length).toBe(1)
    expect(result[0]!.title).toBe("New Year's Day")
  })
})

// ── end-to-end mapping ────────────────────────────────────────────────────────

describe("CalendarCollector.collect — Independence Day end-to-end", () => {
  const collector = new CalendarCollector()

  it("maps Independence Day with correct source, externalId, and title", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const july4 = result.find((e) => e.title === "Independence Day")

    expect(july4).toBeDefined()
    expect(july4!.source).toBe("calendar")
    expect(july4!.externalId).toBe("independence-day-2026")
    expect(july4!.title).toBe("Independence Day")
    expect(july4!.sourceUrl).toBeUndefined()
  })

  it("Independence Day metrics have correct category, region, and date", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const july4 = result.find((e) => e.title === "Independence Day")!

    expect(july4.metrics["category"]).toBe("holiday")
    expect(july4.metrics["region"]).toBe("US")
    expect(july4.metrics["date"]).toBe("2026-07-04T00:00:00.000Z")
    expect(july4.metrics["daysUntilEvent"]).toBe(184)
  })

  it("Independence Day has correct Amazon upload window", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const july4 = result.find((e) => e.title === "Independence Day")!
    const windows = july4.metrics["uploadWindows"] as {
      amazon: { start: string; end: string }
    }

    // Jul 4 - 8 weeks = May 9, 2026
    expect(windows.amazon.start).toBe("2026-05-09T00:00:00.000Z")
    // Jul 4 - 4 weeks = Jun 6, 2026
    expect(windows.amazon.end).toBe("2026-06-06T00:00:00.000Z")
  })

  it("Independence Day raw field contains event data and daysUntilEvent", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)
    const july4 = result.find((e) => e.title === "Independence Day")!
    const raw = july4.raw as Record<string, unknown>

    expect(raw["name"]).toBe("Independence Day")
    expect(raw["region"]).toBe("US")
    expect(raw["daysUntilEvent"]).toBe(184)
  })
})

// ── configuration ─────────────────────────────────────────────────────────────

describe("CalendarCollector — configuration", () => {
  const collector = new CalendarCollector()

  it("has correct id and config", () => {
    expect(collector.id).toBe("calendar")
    expect(collector.config.id).toBe("calendar")
    expect(collector.config.enabled).toBe(true)
    expect(collector.config.rateLimit).toBe(0)
    expect(collector.config.timeout).toBe(5000)
    expect(collector.config.retries).toBe(0)
  })

  it("returns 56 events when called from Jan 1 (all events are upcoming)", async () => {
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 1)))

    const result = await collector.collect(testInput)

    expect(result.length).toBe(56)
  })
})
