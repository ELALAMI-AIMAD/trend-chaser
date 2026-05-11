/**
 * Amazon Creators API client — stub implementation.
 *
 * All functions run in stub mode until Amazon Creators API access is granted.
 * Apply for access: https://affiliate-program.amazon.com/creatorsapi
 *
 * When access is granted:
 * 1. Set AMAZON_CREATORS_ACCESS_KEY and AMAZON_CREATORS_SECRET_KEY env vars
 * 2. Implement the real mode paths in searchProducts() and getProductDetails()
 * 3. Auth uses AWS Signature Version 4 (HMAC-SHA256)
 */

export interface AmazonProduct {
  asin: string
  title: string
  category?: string
  price?: number
  imageUrl?: string
  searchUrl: string
  resultCount?: number
  dataQuality: "real" | "stub"
}

export interface AmazonSearchResult {
  query: string
  marketplace: string
  products: AmazonProduct[]
  dataQuality: "real" | "stub"
  retrievedAt: Date
}

const STUB_WARNING =
  "[amazon.client] Running in stub mode. " +
  "Real data requires Amazon Creators API access. " +
  "Apply at: https://affiliate-program.amazon.com/creatorsapi"

function isStubMode(): boolean {
  const accessKey = process.env.AMAZON_CREATORS_ACCESS_KEY
  const secretKey = process.env.AMAZON_CREATORS_SECRET_KEY
  return !accessKey || !secretKey
}

export function buildSearchUrl(query: string): string {
  const encodedQuery = encodeURIComponent(query)
  const baseUrl = `https://www.amazon.com/s?k=${encodedQuery}`
  const tag = process.env.AMAZON_ASSOCIATE_TAG

  if (tag) {
    return `${baseUrl}&tag=${encodeURIComponent(tag)}`
  }

  return baseUrl
}

export async function searchProducts(params: {
  query: string
  limit: number
  category?: string
}): Promise<AmazonProduct[]> {
  console.warn(STUB_WARNING)

  if (isStubMode()) {
    return [
      {
        asin: "STUB",
        title: `${params.query} — stub result`,
        searchUrl: buildSearchUrl(params.query),
        dataQuality: "stub" as const,
      },
    ]
  }

  // TODO: implement when Amazon Creators API access is confirmed
  // Endpoint: POST https://webservices.amazon.com/paapi5/searchitems
  // Auth: AWS Signature Version 4 (HMAC-SHA256)
  // Docs: https://webservices.amazon.com/paapi5/documentation/
  // Use AMAZON_MARKETPLACE (default "US") as the marketplace param
  // Use AMAZON_CREATORS_ACCESS_KEY + AMAZON_CREATORS_SECRET_KEY for signing
  throw new Error("Amazon Creators API: real mode not yet implemented")
}

export async function getProductDetails(
  asin: string
): Promise<AmazonProduct | null> {
  console.warn(STUB_WARNING)

  if (isStubMode()) {
    return null
  }

  // Real mode implementation
  // TODO: implement when Amazon Creators API access is confirmed
  // Endpoint: POST https://webservices.amazon.com/paapi5/getitems
  // Auth: AWS Signature Version 4 (HMAC-SHA256)
  throw new Error("Amazon Creators API: real mode not yet implemented")
}
