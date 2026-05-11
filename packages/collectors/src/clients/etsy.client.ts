import axios from "axios"

// ── types ─────────────────────────────────────────────────────────────────────

export interface EtsyListing {
  listing_id: number
  title: string
  description: string
  price: {
    amount: number
    divisor: number
    currency_code: string
  }
  tags: string[]
  views: number
  num_favorers: number
  created_timestamp: number
  updated_timestamp: number
  url: string
  shop_id: number
  state: string
}

export interface EtsyListingImage {
  listing_id: number
  listing_image_id: number
  url_fullxfull: string
  url_570xN: string
}

// ── helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// ── rate limiting (daily counter) ─────────────────────────────────────────────

const DAILY_LIMIT = 10_000
let dailyRequestCount = 0

// ── credentials ───────────────────────────────────────────────────────────────

function getHeaders(): Record<string, string> {
  const apiKey = process.env["ETSY_API_KEY"]
  if (!apiKey) throw new Error("Missing Etsy credentials: ETSY_API_KEY")
  return { "x-api-key": apiKey }
}

// ── raw HTTP (always increments counter) ─────────────────────────────────────

async function rawGet(
  url: URL,
  headers: Record<string, string>
): Promise<import("axios").AxiosResponse<unknown>> {
  dailyRequestCount += 1
  if (dailyRequestCount >= DAILY_LIMIT * 0.9) {
    console.warn(
      `[etsy] Approaching daily rate limit: ${dailyRequestCount}/${DAILY_LIMIT} requests used`
    )
  }
  return axios.get(url.toString(), {
    timeout: 30_000,
    headers,
    validateStatus: () => true,
  })
}

// ── shared HTTP helper ────────────────────────────────────────────────────────

async function getWithRetry(
  url: URL,
  headers: Record<string, string>
): Promise<Record<string, unknown> | null> {
  let response = await rawGet(url, headers)

  if (response.status === 429) {
    const retryAfter = Math.max(1, Number(response.headers["retry-after"]) || 5)
    await sleep(retryAfter * 1_000)
    response = await rawGet(url, headers)
  }

  if (response.status === 403) {
    throw new Error("Etsy API error: 403 Forbidden — check ETSY_API_KEY")
  }

  if (response.status === 404) {
    return null
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Etsy API error: ${response.status} GET ${url} — ${JSON.stringify(response.data)}`
    )
  }

  return response.data as Record<string, unknown>
}

// ── typed results helper ──────────────────────────────────────────────────────

async function fetchResults<T>(url: URL): Promise<T[]> {
  const data = await getWithRetry(url, getHeaders())
  if (data === null) return []
  const record = data as Record<string, unknown>
  if (!Array.isArray(record["results"])) {
    throw new Error(
      `Etsy API error: unexpected response shape from GET ${url}`
    )
  }
  return record["results"] as T[]
}

// ── exported API functions ────────────────────────────────────────────────────

export async function searchListings(params: {
  query: string
  limit: number
  offset?: number
  taxonomy_id?: number
}): Promise<EtsyListing[]> {
  const url = new URL(
    "https://openapi.etsy.com/v3/application/listings/active"
  )
  url.searchParams.set("keywords", params.query)
  url.searchParams.set("limit", String(params.limit))
  url.searchParams.set("offset", String(params.offset ?? 0))
  if (params.taxonomy_id !== undefined) {
    url.searchParams.set("taxonomy_id", String(params.taxonomy_id))
  }
  return fetchResults<EtsyListing>(url)
}

export async function getListingsByShop(params: {
  shopId: number
  limit: number
  offset?: number
}): Promise<EtsyListing[]> {
  const url = new URL(
    `https://openapi.etsy.com/v3/application/shops/${params.shopId}/listings`
  )
  url.searchParams.set("limit", String(params.limit))
  url.searchParams.set("offset", String(params.offset ?? 0))
  return fetchResults<EtsyListing>(url)
}

export async function getListingImages(
  listingId: number
): Promise<EtsyListingImage[]> {
  const url = new URL(
    `https://openapi.etsy.com/v3/application/listings/${listingId}/images`
  )
  return fetchResults<EtsyListingImage>(url)
}
