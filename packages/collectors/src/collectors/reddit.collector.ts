import pLimit from "p-limit"
import { getPosts } from "../clients/reddit.client"
import type { CollectInput, CollectorConfig, SourceCollector, SourceEventInput } from "../types"
import type { RedditPost } from "../clients/reddit.client"

// ── constants ─────────────────────────────────────────────────────────────────

const SUBREDDITS = [
  "interestingasfuck", "mildlyinteresting", "oddlysatisfying",
  "todayilearned", "funny", "pics", "popular",
  "Showerthoughts", "LifeProTips", "tifu",
] as const

const SKIP_PREFIXES = [
  "TIL that", "ELI5", "CMV", "AITA", "UPDATE:", "UPDATED:",
] as const

// ── internal types ────────────────────────────────────────────────────────────

type PostWithSort = { post: RedditPost; sort: "rising" | "hot" }

// ── filter ────────────────────────────────────────────────────────────────────

export function filterPost(post: RedditPost): boolean {
  const title = post.title

  // Length checks
  if (title.length < 10) return false
  if (title.length > 300) return false

  // Question-only: ends with "?" and no period or exclamation mark
  if (
    title.trim().endsWith("?") &&
    !title.includes(".") &&
    !title.includes("!")
  ) {
    return false
  }

  // All-uppercase: every word ≥ 3 chars is uppercase
  const longWords = title.split(/\s+/).filter((w) => w.length >= 3)
  if (
    longWords.length > 0 &&
    longWords.every((w) => w === w.toUpperCase() && /[A-Z]/.test(w))
  ) {
    return false
  }

  // Low score
  if (post.score < 100) return false

  // Link post whose title contains a URL
  if (!post.is_self && /https?:\/\/|www\./i.test(title)) return false

  // Skip prefixes (case-insensitive)
  const titleLower = title.toLowerCase()
  for (const prefix of SKIP_PREFIXES) {
    if (titleLower.startsWith(prefix.toLowerCase())) return false
  }

  return true
}

// ── phrase extraction ─────────────────────────────────────────────────────────

export function extractPhrases(title: string): string[] {
  // Clean leading/trailing quotes
  let cleaned = title.replace(/^["'""]|["'""]$/g, "").trim()

  // Split on common separators (keeping full title as a candidate too)
  const segments: string[] = [cleaned]

  const splitPatterns = ["|", " - ", ": ", ". "]
  for (const sep of splitPatterns) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep).map((s) => s.trim()).filter(Boolean)
      segments.push(...parts)
    }
  }

  segments.push(title.trim())

  const kept: string[] = []
  for (const seg of segments) {
    const words = seg.trim().split(/\s+/)
    const wordCount = words.length

    if (wordCount < 3 || wordCount > 12) continue
    if (/^\d+(\.\d+)?(\s+\w+)?$/.test(seg.trim())) continue

    // Starts AND ends with a quote character
    if (/^["'""]/.test(seg) && /["'""]$/.test(seg)) continue

    if (/http|www\./.test(seg)) continue
    if (/u\/|r\//.test(seg)) continue

    kept.push(seg)
  }

  // Dedupe while preserving order
  const seen = new Set<string>()
  const deduped: string[] = []
  for (const s of kept) {
    if (!seen.has(s)) {
      seen.add(s)
      deduped.push(s)
    }
  }

  // Sort by word count descending (longer phrases first)
  deduped.sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length)

  if (deduped.length > 0) return deduped.slice(0, 3)

  // Fallback
  return [title.trim().split(/\s+/).slice(0, 12).join(" ")]
}

// ── mapper ────────────────────────────────────────────────────────────────────

function mapToSourceEvent(post: RedditPost, sort: "rising" | "hot"): SourceEventInput {
  const phrases = extractPhrases(post.title)
  return {
    source: "reddit",
    externalId: post.id,
    sourceUrl: `https://reddit.com${post.permalink}`,
    title: phrases[0] ?? post.title,
    body: post.selftext ? post.selftext.slice(0, 500) : undefined,
    observedAt: new Date(post.created_utc * 1000),
    metrics: {
      score: post.score,
      upvoteRatio: post.upvote_ratio,
      numComments: post.num_comments,
      subreddit: post.subreddit,
      sort,
      originalTitle: post.title,
    },
    raw: { ...post },
  }
}

// ── collector ─────────────────────────────────────────────────────────────────

export class RedditCollector implements SourceCollector {
  readonly id = "reddit"
  readonly config: CollectorConfig = {
    id: "reddit",
    enabled: true,
    rateLimit: 60,
    timeout: 30000,
    retries: 3,
  }

  async collect(input: CollectInput): Promise<SourceEventInput[]> {
    console.log(
      `[reddit.collector] Starting — ${SUBREDDITS.length} subreddits × 2 sorts`
    )
    const startTime = Date.now()
    const limit = pLimit(3)

    const tasks = SUBREDDITS.map((subreddit) =>
      limit(async (): Promise<PostWithSort[]> => {
        const sorts = ["rising", "hot"] as const
        const results: PostWithSort[] = []

        for (const sort of sorts) {
          try {
            const posts = await getPosts({ subreddit, sort, limit: 25 })
            for (const post of posts) {
              results.push({ post, sort })
            }
          } catch (err) {
            console.error(`[reddit.collector] r/${subreddit}/${sort}: ${err instanceof Error ? err.message : String(err)}`)
          }
        }

        // Dedupe within subreddit by post.id (keep first occurrence = "rising" wins)
        const seen = new Map<string, PostWithSort>()
        for (const item of results) {
          if (!seen.has(item.post.id)) seen.set(item.post.id, item)
        }
        return Array.from(seen.values())
      })
    )

    const nested = await Promise.all(tasks)
    const allPosts: PostWithSort[] = nested.flat()

    const total = allPosts.length
    console.log(
      `[reddit.collector] Fetched ${total} posts from ${SUBREDDITS.length} subreddits`
    )

    // Filter
    const before = allPosts.length
    const filteredWithSort = allPosts.filter((item) => filterPost(item.post))
    const after = filteredWithSort.length
    console.log(
      `[reddit.collector] Filter: ${before} → ${after} posts kept`
    )

    // Dedupe by externalId across all subreddits
    const deduped = new Map<string, SourceEventInput>()
    for (const { post, sort } of filteredWithSort) {
      if (!deduped.has(post.id)) {
        deduped.set(post.id, mapToSourceEvent(post, sort))
      }
    }

    const events = Array.from(deduped.values())
    const limited = input.limit ? events.slice(0, input.limit) : events
    console.log(
      `[reddit.collector] Complete — ${limited.length} source events in ${Date.now() - startTime}ms`
    )
    return limited
  }
}
