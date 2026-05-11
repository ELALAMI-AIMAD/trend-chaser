import axios from "axios"

export interface RedditPost {
  id: string
  title: string
  subreddit: string
  score: number
  upvote_ratio: number
  num_comments: number
  url: string
  permalink: string
  created_utc: number
  is_self: boolean
  selftext?: string
}

// ── helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Fix 3: module-level USER_AGENT constant
const USER_AGENT = process.env["REDDIT_USER_AGENT"] ?? "trend-chaser/1.0"

// ── token cache ───────────────────────────────────────────────────────────────

interface TokenCache {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null
let tokenFlight: Promise<string> | null = null

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache !== null && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token
  }

  // Deduplicate parallel calls
  if (tokenFlight !== null) {
    return tokenFlight
  }

  tokenFlight = fetchAccessToken().finally(() => {
    tokenFlight = null
  })

  return tokenFlight
}

async function fetchAccessToken(): Promise<string> {
  const clientId = process.env["REDDIT_CLIENT_ID"]
  const clientSecret = process.env["REDDIT_CLIENT_SECRET"]

  const missing: string[] = []
  if (!clientId) missing.push("REDDIT_CLIENT_ID")
  if (!clientSecret) missing.push("REDDIT_CLIENT_SECRET")

  if (missing.length > 0) {
    throw new Error(`Missing Reddit credentials: ${missing.join(", ")}`)
  }

  const credentials = btoa(`${clientId!}:${clientSecret!}`)

  let status = 0
  let body = ""

  try {
    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      "grant_type=client_credentials",
      {
        timeout: 30_000,
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        validateStatus: () => true,
      }
    )

    status = response.status
    body = JSON.stringify(response.data)

    if (status < 200 || status >= 300) {
      throw new Error(`Reddit auth failed: ${status} ${body}`)
    }

    const data = response.data as { access_token: string; expires_in: number }
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }

    return tokenCache.token
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Reddit auth failed:")) {
      throw err
    }
    // Axios network / timeout errors
    if (status !== 0) {
      throw new Error(`Reddit auth failed: ${status} ${body}`)
    }
    throw err
  }
}

// ── rate limiting ─────────────────────────────────────────────────────────────

const requestTimestamps: number[] = []

async function enforceRateLimit(): Promise<void> {
  const now = Date.now()
  const windowStart = now - 60_000

  // 1. Prune timestamps outside the 60-second window
  while (requestTimestamps.length > 0 && requestTimestamps[0]! < windowStart) {
    requestTimestamps.shift()
  }

  // 2. Claim a slot immediately (synchronously — before any await)
  requestTimestamps.push(now)

  // 3. If we're over the limit, wait until the oldest slot exits the window
  if (requestTimestamps.length > 60) {
    const oldest = requestTimestamps[0]!
    const waitMs = oldest + 60_000 - Date.now()
    if (waitMs > 0) {
      await sleep(waitMs)
    }
    // Prune the slot we just waited past
    requestTimestamps.shift()
  }
}

// ── post mapping ──────────────────────────────────────────────────────────────

function mapPost(raw: Record<string, unknown>): RedditPost {
  return {
    id: raw["id"] as string,
    title: raw["title"] as string,
    subreddit: raw["subreddit"] as string,
    score: raw["score"] as number,
    upvote_ratio: raw["upvote_ratio"] as number,
    num_comments: raw["num_comments"] as number,
    url: raw["url"] as string,
    permalink: raw["permalink"] as string,
    created_utc: raw["created_utc"] as number,
    is_self: raw["is_self"] as boolean,
    selftext: raw["selftext"] as string | undefined,
  }
}

// ── shared HTTP helper ────────────────────────────────────────────────────────

interface RedditListing {
  data: {
    children: Array<{ data: Record<string, unknown> }>
  }
}

async function getWithRetry(
  url: URL,
  headers: Record<string, string>
): Promise<RedditListing> {
  let response = await axios.get<RedditListing>(url.toString(), {
    timeout: 30_000,
    headers,
    validateStatus: () => true,
  })

  if (response.status === 429) {
    const retryAfter = Number(response.headers["retry-after"] ?? "5")
    await sleep(retryAfter * 1_000)
    response = await axios.get<RedditListing>(url.toString(), {
      timeout: 30_000,
      headers,
      validateStatus: () => true,
    })
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Reddit API error: ${response.status} GET ${url}`)
  }

  return response.data
}

// ── exported API functions ────────────────────────────────────────────────────

export async function getPosts(params: {
  subreddit: string
  sort: "hot" | "rising" | "new" | "top"
  limit: number
  after?: string
}): Promise<RedditPost[]> {
  const token = await getAccessToken()

  const url = new URL(
    `https://oauth.reddit.com/r/${params.subreddit}/${params.sort}.json`
  )
  url.searchParams.set("limit", String(params.limit))
  if (params.after) url.searchParams.set("after", params.after)

  await enforceRateLimit()

  const listing = await getWithRetry(url, {
    Authorization: `bearer ${token}`,
    "User-Agent": USER_AGENT,
  })

  return listing.data.children.map((child) => mapPost(child.data))
}

export async function searchPosts(params: {
  query: string
  limit: number
  sort?: "relevance" | "hot" | "new"
}): Promise<RedditPost[]> {
  const token = await getAccessToken()
  const sort = params.sort ?? "relevance"

  const url = new URL("https://oauth.reddit.com/search.json")
  url.searchParams.set("q", params.query)
  url.searchParams.set("limit", String(params.limit))
  url.searchParams.set("sort", sort)

  await enforceRateLimit()

  const listing = await getWithRetry(url, {
    Authorization: `bearer ${token}`,
    "User-Agent": USER_AGENT,
  })

  return listing.data.children.map((child) => mapPost(child.data))
}
