import { vi, describe, it, expect, beforeEach } from "vitest"

vi.mock("../clients/etsy.client.js", () => ({
  searchListings: vi.fn(),
}))

import { searchListings } from "../clients/etsy.client.js"
import { EtsyCollector, filterListing, cleanTitle } from "../collectors/etsy.collector.js"
import type { CollectInput } from "../types.js"
import type { EtsyListing } from "../clients/etsy.client.js"

// ── helpers ───────────────────────────────────────────────────────────────────

function makeListing(overrides: Partial<EtsyListing> = {}): EtsyListing {
  return {
    listing_id: 12345,
    title: "Funny Dog Mom Shirt for Women",
    description: "Great gift for dog lovers",
    price: { amount: 2499, divisor: 100, currency_code: "USD" },
    tags: ["dog mom", "funny shirt", "gift"],
    views: 500,
    num_favorers: 120,
    created_timestamp: 1700000000,
    updated_timestamp: 1700000000,
    url: "https://www.etsy.com/listing/12345",
    shop_id: 99999,
    state: "active",
    ...overrides,
  }
}

const testInput: CollectInput = {
  scanRunId: "test-scan",
  fromDate: new Date("2025-01-01"),
  toDate: new Date("2025-01-02"),
}

// ── filterListing ─────────────────────────────────────────────────────────────

describe("filterListing", () => {
  it("rejects digital downloads", () => {
    expect(
      filterListing(makeListing({ title: "Beautiful digital download for you" }))
    ).toBe(false)
    expect(
      filterListing(makeListing({ title: "Awesome SVG file template shirt" }))
    ).toBe(false)
  })

  it("rejects under $5 listings", () => {
    expect(
      filterListing(makeListing({ price: { amount: 399, divisor: 100, currency_code: "USD" } }))
    ).toBe(false)
  })

  it("keeps listings at exactly $5", () => {
    expect(
      filterListing(makeListing({ price: { amount: 500, divisor: 100, currency_code: "USD" } }))
    ).toBe(true)
  })

  it("rejects over $150 listings", () => {
    expect(
      filterListing(makeListing({ price: { amount: 15001, divisor: 100, currency_code: "USD" } }))
    ).toBe(false)
  })

  it("keeps listings at exactly $150", () => {
    expect(
      filterListing(makeListing({ price: { amount: 15000, divisor: 100, currency_code: "USD" } }))
    ).toBe(true)
  })

  it("rejects listings with no tags", () => {
    expect(filterListing(makeListing({ tags: [] }))).toBe(false)
  })
})

// ── cleanTitle ────────────────────────────────────────────────────────────────

describe("cleanTitle", () => {
  it("removes parenthetical keywords at the end", () => {
    expect(cleanTitle("Dog Mom Shirt (Gift for Her)")).toBe("Dog Mom Shirt")
    expect(
      cleanTitle(
        "Funny Teacher Shirt (Back to School Gift for Teacher Appreciation)"
      )
    ).toBe("Funny Teacher Shirt")
  })

  it("removes pipe-separated keyword lists", () => {
    expect(cleanTitle("Dog Mom | Dog Lover | Funny Gift")).toBe("Dog Mom")
  })

  it("removes trailing size tokens", () => {
    expect(cleanTitle("Funny Shirt XS S M L XL")).toBe("Funny Shirt")
  })

  it("removes pipe list then parenthetical in a combined title", () => {
    expect(cleanTitle("Dog Mom (Gift for Her) | Dog Lover | Funny")).toBe("Dog Mom")
  })
})

// ── EtsyCollector.collect ─────────────────────────────────────────────────────

describe("EtsyCollector.collect", () => {
  const collector = new EtsyCollector()
  const searchListingsMock = vi.mocked(searchListings)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("maps a listing to SourceEventInput with correct fields", async () => {
    searchListingsMock.mockResolvedValue([makeListing()])

    const result = await collector.collect(testInput)

    expect(result.length).toBeGreaterThan(0)
    const event = result[0]!
    expect(event.source).toBe("etsy")
    expect(event.externalId).toBe("12345")
    expect(event.metrics["numFavorers"]).toBe(120)
    expect(typeof event.title).toBe("string")
    expect(event.title.length).toBeGreaterThan(0)
    expect(event.observedAt).toBeInstanceOf(Date)
  })

  it("deduplication removes repeated listing IDs across queries", async () => {
    // Same listing returned for every query call
    const listing = makeListing({ listing_id: 99001 })
    searchListingsMock.mockResolvedValue([listing])

    const result = await collector.collect(testInput)

    const dupes = result.filter((e) => e.externalId === "99001")
    expect(dupes.length).toBe(1)
  })

  it("one query failure does not stop others", async () => {
    // First call rejects, rest succeed
    searchListingsMock
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValue([makeListing({ listing_id: 55555 })])

    const result = await collector.collect(testInput)

    expect(result.length).toBeGreaterThan(0)
    expect(result.some(e => e.externalId === "55555")).toBe(true)
  })

  it("results sorted by num_favorers descending", async () => {
    const lowFavorers = makeListing({ listing_id: 1001, num_favorers: 50 })
    const highFavorers = makeListing({ listing_id: 1002, num_favorers: 200 })

    // Return both listings for every query (they'll be deduped after first occurrence)
    searchListingsMock.mockResolvedValue([lowFavorers, highFavorers])

    const result = await collector.collect(testInput)

    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result[0]!.metrics["numFavorers"]).toBe(200)
  })

  it("collector has correct id and config", () => {
    expect(collector.id).toBe("etsy")
    expect(collector.config.id).toBe("etsy")
    expect(collector.config.enabled).toBe(true)
  })
})
