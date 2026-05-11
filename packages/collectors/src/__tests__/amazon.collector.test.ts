import { vi, describe, it, expect, beforeEach } from "vitest"

vi.mock("../clients/amazon.client.js", () => ({
  searchProducts: vi.fn(),
  buildSearchUrl: vi.fn(
    (query: string) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
  ),
}))

import { searchProducts } from "../clients/amazon.client.js"
import { AmazonCollector } from "../collectors/amazon.collector.js"
import { SEED_QUERIES } from "../constants.js"
import type { CollectInput } from "../types.js"
import type { AmazonProduct } from "../clients/amazon.client.js"

// ── helpers ───────────────────────────────────────────────────────────────────

function makeStubProduct(overrides: Partial<AmazonProduct> = {}): AmazonProduct {
  return {
    asin: "STUB",
    title: "stub result",
    searchUrl: "https://www.amazon.com/s?k=test",
    dataQuality: "stub",
    ...overrides,
  }
}

function makeRealProduct(overrides: Partial<AmazonProduct> = {}): AmazonProduct {
  return {
    asin: "B001234567",
    title: "Dog Mom Funny T-Shirt Women",
    category: "Clothing",
    price: 19.99,
    searchUrl: "https://www.amazon.com/s?k=dog+mom+life",
    resultCount: 1200,
    dataQuality: "real",
    ...overrides,
  }
}

const testInput: CollectInput = {
  scanRunId: "test-scan",
  fromDate: new Date("2025-01-01"),
  toDate: new Date("2025-01-02"),
}

// ── stub mode ─────────────────────────────────────────────────────────────────

describe("AmazonCollector.collect — stub mode", () => {
  const collector = new AmazonCollector()
  const searchProductsMock = vi.mocked(searchProducts)

  beforeEach(() => {
    vi.clearAllMocks()
    searchProductsMock.mockImplementation(async ({ query }) => [
      makeStubProduct({
        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      }),
    ])
  })

  it("returns one SourceEventInput per query", async () => {
    const result = await collector.collect(testInput)
    expect(result.length).toBe(SEED_QUERIES.length)
  })

  it("externalId follows stub-{query}-{index} pattern", async () => {
    const result = await collector.collect(testInput)
    const firstQuery = SEED_QUERIES[0]!
    const match = result.find((e) => e.externalId === `stub-${firstQuery}-0`)
    expect(match).toBeDefined()
  })

  it("metrics.dataQuality is 'stub' for every event", async () => {
    const result = await collector.collect(testInput)
    expect(result.every((e) => e.metrics["dataQuality"] === "stub")).toBe(true)
  })

  it("title is the query string, not the stub product title", async () => {
    const result = await collector.collect(testInput)
    const firstQuery = SEED_QUERIES[0]!
    const event = result.find((e) => e.externalId === `stub-${firstQuery}-0`)
    expect(event?.title).toBe(firstQuery)
  })

  it("emits stub-mode warning exactly once per collect() call", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    await collector.collect(testInput)
    const stubWarns = warnSpy.mock.calls.filter(
      ([msg]) =>
        typeof msg === "string" &&
        msg.includes("[amazon.collector] Running in stub mode")
    )
    expect(stubWarns.length).toBe(1)
    warnSpy.mockRestore()
  })

  it("sourceUrl comes from product.searchUrl", async () => {
    const result = await collector.collect(testInput)
    const firstQuery = SEED_QUERIES[0]!
    const event = result.find((e) => e.externalId === `stub-${firstQuery}-0`)
    expect(event?.sourceUrl).toContain("amazon.com")
  })
})

// ── deduplication ─────────────────────────────────────────────────────────────

describe("AmazonCollector.collect — deduplication", () => {
  const collector = new AmazonCollector()
  const searchProductsMock = vi.mocked(searchProducts)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deduplicates the same ASIN appearing across multiple queries", async () => {
    searchProductsMock.mockResolvedValue([makeRealProduct({ asin: "B001234567" })])

    const result = await collector.collect(testInput)

    const copies = result.filter((e) => e.externalId === "B001234567")
    expect(copies.length).toBe(1)
  })

  it("keeps all unique stub externalIds (one per query)", async () => {
    searchProductsMock.mockImplementation(async ({ query }) => [
      makeStubProduct({
        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      }),
    ])

    const result = await collector.collect(testInput)

    const ids = result.map((e) => e.externalId)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

// ── error handling ────────────────────────────────────────────────────────────

describe("AmazonCollector.collect — error handling", () => {
  const collector = new AmazonCollector()
  const searchProductsMock = vi.mocked(searchProducts)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("one query failure does not stop the others", async () => {
    searchProductsMock
      .mockRejectedValueOnce(new Error("network timeout"))
      .mockImplementation(async ({ query }) => [
        makeStubProduct({
          searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
        }),
      ])

    const result = await collector.collect(testInput)

    expect(result.length).toBe(SEED_QUERIES.length - 1)
  })

  it("all queries fail → returns empty array without throwing", async () => {
    searchProductsMock.mockRejectedValue(new Error("total failure"))

    await expect(collector.collect(testInput)).resolves.toEqual([])
  })
})

// ── real mode ─────────────────────────────────────────────────────────────────

describe("AmazonCollector.collect — real mode", () => {
  const collector = new AmazonCollector()
  const searchProductsMock = vi.mocked(searchProducts)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses ASIN as externalId for real products", async () => {
    searchProductsMock.mockResolvedValue([makeRealProduct({ asin: "B009876543" })])

    const result = await collector.collect(testInput)

    expect(result.some((e) => e.externalId === "B009876543")).toBe(true)
  })

  it("uses product title (not query) for real products", async () => {
    searchProductsMock.mockResolvedValue([
      makeRealProduct({ asin: "B009876543", title: "Funny Coffee Lover Shirt" }),
    ])

    const result = await collector.collect(testInput)

    const event = result.find((e) => e.externalId === "B009876543")
    expect(event?.title).toBe("Funny Coffee Lover Shirt")
  })

  it("includes category, price, resultCount, and dataQuality in metrics", async () => {
    searchProductsMock.mockResolvedValue([
      makeRealProduct({
        asin: "B009876543",
        category: "Clothing",
        price: 19.99,
        resultCount: 500,
        dataQuality: "real",
      }),
    ])

    const result = await collector.collect(testInput)

    const event = result.find((e) => e.externalId === "B009876543")
    expect(event?.metrics["category"]).toBe("Clothing")
    expect(event?.metrics["price"]).toBe(19.99)
    expect(event?.metrics["resultCount"]).toBe(500)
    expect(event?.metrics["dataQuality"]).toBe("real")
  })
})

// ── configuration & limit ─────────────────────────────────────────────────────

describe("AmazonCollector — configuration", () => {
  const collector = new AmazonCollector()

  it("has correct id and config values", () => {
    expect(collector.id).toBe("amazon")
    expect(collector.config.id).toBe("amazon")
    expect(collector.config.enabled).toBe(true)
    expect(collector.config.rateLimit).toBe(1)
    expect(collector.config.timeout).toBe(30000)
    expect(collector.config.retries).toBe(3)
  })

  it("respects input.limit", async () => {
    vi.mocked(searchProducts).mockImplementation(async ({ query }) => [
      makeStubProduct({
        searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      }),
    ])

    const result = await collector.collect({ ...testInput, limit: 3 })
    expect(result.length).toBe(3)
  })
})

// ── SEED_QUERIES from constants ───────────────────────────────────────────────

describe("SEED_QUERIES — shared constants", () => {
  it("is imported from constants.ts and contains all expected queries", () => {
    expect(SEED_QUERIES).toContain("funny sarcastic shirt")
    expect(SEED_QUERIES).toContain("dog mom life")
    expect(SEED_QUERIES).toContain("camping shirt")
    expect(SEED_QUERIES.length).toBe(25)
  })
})
