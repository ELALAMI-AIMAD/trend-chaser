import pLimit from "p-limit"
import { searchProducts } from "../clients/amazon.client.js"
import type { AmazonProduct } from "../clients/amazon.client.js"
import type { CollectInput, CollectorConfig, SourceCollector, SourceEventInput } from "../types.js"
import { SEED_QUERIES } from "../constants.js"

// ── helpers ───────────────────────────────────────────────────────────────────

function detectMode(): "stub" | "real" {
  return !process.env.AMAZON_CREATORS_ACCESS_KEY || !process.env.AMAZON_CREATORS_SECRET_KEY
    ? "stub"
    : "real"
}

// ── mapper ────────────────────────────────────────────────────────────────────

function mapToSourceEvent(
  product: AmazonProduct,
  query: string,
  index: number
): SourceEventInput {
  const isStub = product.asin === "STUB"
  return {
    source: "amazon",
    externalId: isStub ? `stub-${query}-${index}` : product.asin,
    sourceUrl: product.searchUrl,
    title: isStub ? query : product.title,
    observedAt: new Date(),
    metrics: {
      query,
      category: product.category,
      price: product.price,
      dataQuality: product.dataQuality,
      searchUrl: product.searchUrl,
      resultCount: product.resultCount,
    },
    raw: { ...product },
  }
}

// ── collector ─────────────────────────────────────────────────────────────────

export class AmazonCollector implements SourceCollector {
  readonly id = "amazon"
  readonly config: CollectorConfig = {
    id: "amazon",
    enabled: true,
    rateLimit: 1,
    timeout: 30000,
    retries: 3,
  }

  async collect(input: CollectInput): Promise<SourceEventInput[]> {
    const mode = detectMode()
    const startTime = Date.now()

    if (mode === "stub") {
      console.warn(
        "[amazon.collector] Running in stub mode — results are search URLs only." +
          " Real data requires Creators API access."
      )
    }
    console.log(
      `[amazon.collector] Starting — ${SEED_QUERIES.length} queries (${mode} mode)`
    )

    const limit = pLimit(2)

    const tasks = SEED_QUERIES.map((query) =>
      limit(async (): Promise<SourceEventInput[]> => {
        try {
          const products = await searchProducts({ query, limit: 10 })
          return products.map((product, index) => mapToSourceEvent(product, query, index))
        } catch (err) {
          console.error(
            `[amazon.collector] "${query}": ${
              err instanceof Error ? err.message : String(err)
            }`
          )
          return []
        }
      })
    )

    const nested = await Promise.all(tasks)
    const allEvents = nested.flat()

    // Dedupe by externalId — same ASIN can surface across multiple queries
    const deduped = new Map<string, SourceEventInput>()
    for (const event of allEvents) {
      if (!deduped.has(event.externalId)) {
        deduped.set(event.externalId, event)
      }
    }

    const result = Array.from(deduped.values())
    const limited = input.limit ? result.slice(0, input.limit) : result

    console.log(
      `[amazon.collector] Complete — ${limited.length} source events in ${
        Date.now() - startTime
      }ms (${mode} mode)`
    )
    return limited
  }
}
