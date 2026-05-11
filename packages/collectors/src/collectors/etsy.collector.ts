import pLimit from "p-limit"
import { searchListings } from "../clients/etsy.client"
import type { CollectInput, CollectorConfig, SourceCollector, SourceEventInput } from "../types"
import type { EtsyListing } from "../clients/etsy.client"
import { SEED_QUERIES } from "../constants"

const EXCLUDED_TITLE_TERMS = [
  "wholesale", "bulk order", "custom order",
  "digital download", "svg file", "png file",
  "printable", "sublimation file",
] as const

// ── title cleaner ─────────────────────────────────────────────────────────────

export function cleanTitle(title: string): string {
  let cleaned = title
  // 1. Remove from first pipe onward
  cleaned = cleaned.replace(/\s*\|.*$/, "")
  // 2. Remove trailing parenthetical
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, "")
  // 3. Remove trailing size tokens
  cleaned = cleaned.replace(/\s+(?:XS|S|M|L|XL|XXL|2XL|3XL)(\s+(?:XS|S|M|L|XL|XXL|2XL|3XL))*\s*$/i, "")
  // 4. Collapse multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, " ")
  // 5. Trim
  return cleaned.trim()
}

// ── filter ────────────────────────────────────────────────────────────────────

export function filterListing(listing: EtsyListing): boolean {
  if (listing.title.length < 5) return false
  if (listing.title.length > 200) return false
  if (listing.state !== "active") return false

  const price = listing.price.amount / listing.price.divisor
  if (price < 5) return false
  if (price > 150) return false

  if (listing.tags.length === 0) return false

  const titleLower = listing.title.toLowerCase()
  for (const term of EXCLUDED_TITLE_TERMS) {
    if (titleLower.includes(term)) return false
  }

  return true
}

// ── mapper ────────────────────────────────────────────────────────────────────

function mapToSourceEvent(listing: EtsyListing, query: string): SourceEventInput {
  return {
    source: "etsy",
    externalId: listing.listing_id.toString(),
    sourceUrl: listing.url,
    title: cleanTitle(listing.title),
    body: listing.description?.slice(0, 300) || undefined,
    observedAt: new Date(listing.created_timestamp * 1000),
    metrics: {
      price: listing.price.amount / listing.price.divisor,
      currency: listing.price.currency_code,
      views: listing.views,
      numFavorers: listing.num_favorers,
      tags: listing.tags,
      shopId: listing.shop_id,
      query,
    },
    raw: { ...listing },
  }
}

// ── collector ─────────────────────────────────────────────────────────────────

export class EtsyCollector implements SourceCollector {
  readonly id = "etsy"
  readonly config: CollectorConfig = {
    id: "etsy",
    enabled: true,
    rateLimit: 10000,
    timeout: 30000,
    retries: 3,
  }

  async collect(input: CollectInput): Promise<SourceEventInput[]> {
    console.log(`[etsy.collector] Starting — ${SEED_QUERIES.length} queries`)
    const startTime = Date.now()
    const limit = pLimit(3)

    const tasks = SEED_QUERIES.map((query) =>
      limit(async (): Promise<SourceEventInput[]> => {
        try {
          const raw = await searchListings({ query, limit: 15 })
          const filtered = raw.filter(filterListing)
          console.log(
            `[etsy.collector] "${query}": fetched ${raw.length}, kept ${filtered.length}`
          )
          return filtered.map((listing) => mapToSourceEvent(listing, query))
        } catch (err) {
          console.error(
            `[etsy.collector] "${query}": ${err instanceof Error ? err.message : String(err)}`
          )
          return []
        }
      })
    )

    const nested = await Promise.all(tasks)
    const allEvents = nested.flat()

    // Dedupe by externalId
    const deduped = new Map<string, SourceEventInput>()
    for (const event of allEvents) {
      if (!deduped.has(event.externalId)) {
        deduped.set(event.externalId, event)
      }
    }

    // Sort by numFavorers descending
    const sorted = Array.from(deduped.values()).sort(
      (a, b) => (b.metrics["numFavorers"] as number) - (a.metrics["numFavorers"] as number)
    )

    // Apply limit if set
    const result = input.limit ? sorted.slice(0, input.limit) : sorted

    console.log(
      `[etsy.collector] Complete — ${result.length} source events in ${Date.now() - startTime}ms`
    )
    return result
  }
}
