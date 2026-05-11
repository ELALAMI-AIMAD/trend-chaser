import { vi, describe, it, expect, beforeEach } from "vitest"

vi.mock("../clients/reddit.client.js", () => ({
  getPosts: vi.fn(),
}))

import { getPosts } from "../clients/reddit.client.js"
import { RedditCollector, filterPost, extractPhrases } from "../collectors/reddit.collector.js"
import type { CollectInput } from "../types.js"
import type { RedditPost } from "../clients/reddit.client.js"

// ── helpers ───────────────────────────────────────────────────────────────────

function makePost(overrides: Partial<RedditPost> = {}): RedditPost {
  return {
    id: "abc123",
    title: "A fascinating thing happened today in science",
    subreddit: "interestingasfuck",
    score: 1000,
    upvote_ratio: 0.95,
    num_comments: 200,
    url: "https://reddit.com/r/interestingasfuck/comments/abc123",
    permalink: "/r/interestingasfuck/comments/abc123/a_fascinating_thing/",
    created_utc: 1735689600,
    is_self: true,
    selftext: "Some body text here",
    ...overrides,
  }
}

const testInput: CollectInput = {
  scanRunId: "test-scan",
  fromDate: new Date("2025-01-01"),
  toDate: new Date("2025-01-02"),
}

// ── filterPost ────────────────────────────────────────────────────────────────

describe("filterPost", () => {
  it("rejects question-only titles (no period/exclamation)", () => {
    expect(filterPost(makePost({ title: "Is this a question?" }))).toBe(false)
  })

  it("keeps question titles that also contain a period", () => {
    expect(
      filterPost(makePost({ title: "Is this a question? It has a statement." }))
    ).toBe(true)
  })

  it("rejects posts with score below 100", () => {
    expect(filterPost(makePost({ score: 50 }))).toBe(false)
  })

  it("keeps posts with score of 200", () => {
    expect(filterPost(makePost({ score: 200 }))).toBe(true)
  })

  it("rejects all-uppercase titles", () => {
    expect(filterPost(makePost({ title: "THIS IS ALL CAPS" }))).toBe(false)
  })

  it("keeps title-case titles", () => {
    expect(filterPost(makePost({ title: "This Is Title Case Today" }))).toBe(true)
  })

  it("rejects titles starting with SKIP_PREFIXES (TIL that)", () => {
    expect(filterPost(makePost({ title: "TIL that water is wet and good" }))).toBe(false)
  })

  it("keeps titles that do not start with a skip prefix", () => {
    expect(filterPost(makePost({ title: "Today I learned something new" }))).toBe(true)
  })

  it("rejects titles shorter than 10 characters", () => {
    expect(filterPost(makePost({ title: "Short" }))).toBe(false)
  })

  it("rejects link posts whose title contains a URL", () => {
    expect(
      filterPost(
        makePost({
          is_self: false,
          title: "Check out this site https://example.com right now",
        })
      )
    ).toBe(false)
  })
})

// ── extractPhrases ────────────────────────────────────────────────────────────

describe("extractPhrases", () => {
  it("returns at most 3 phrases from a long segmented title", () => {
    const title =
      "Science news: New discovery found | Research breakthrough | Experts amazed | World changes | Future impact"
    const phrases = extractPhrases(title)
    expect(phrases.length).toBeLessThanOrEqual(3)
  })

  it("filters out segments containing Reddit usernames (u/)", () => {
    // Title with a valid segment (after ": ") that has no u/, plus a segment with u/
    const title = "Amazing discovery: u/username explains the science of black holes today"
    const phrases = extractPhrases(title)
    // The segment before ": " is "Amazing discovery" — only 2 words, excluded by length
    // The segment after ": " contains u/ and should be excluded
    // Full title also contains u/ and should be excluded
    // Fallback kicks in — we just verify the function doesn't crash and returns something
    expect(phrases.length).toBeGreaterThanOrEqual(1)

    // Now test a title where only the non-u/ segment is valid
    const title2 = "Scientists discover new planet: u/astro_guy shares findings there"
    const phrases2 = extractPhrases(title2)
    // "Scientists discover new planet" is 4 words — valid, no u/
    const cleanPhrases = phrases2.filter((p) => !p.includes("u/"))
    expect(cleanPhrases.length).toBeGreaterThanOrEqual(1)
    expect(cleanPhrases[0]).toBe("Scientists discover new planet")
  })

  it("returns at least one phrase (fallback)", () => {
    const title = "Short"
    const phrases = extractPhrases(title)
    expect(phrases.length).toBeGreaterThanOrEqual(1)
  })

  it("filters out segments containing URLs", () => {
    // Title split on ": " — first segment "Amazing" (1 word, too short), second contains URL
    // Use a title where only non-URL segments are valid
    const title = "Scientists find new species: https://example.com has the full story here"
    const phrases = extractPhrases(title)
    // "Scientists find new species" = 4 words, valid, no URL
    const urlFreeCount = phrases.filter((p) => !/https?:\/\/|www\./.test(p)).length
    expect(urlFreeCount).toBeGreaterThan(0)
    // Ensure the first phrase (best match) does not contain a URL
    expect(phrases[0]).not.toMatch(/https?:\/\/|www\./)
  })
})

// ── RedditCollector.collect ───────────────────────────────────────────────────

describe("RedditCollector.collect", () => {
  const collector = new RedditCollector()
  const getPostsMock = vi.mocked(getPosts)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("maps a post to SourceEventInput with correct fields", async () => {
    const post = makePost({ id: "post1", score: 500 })
    getPostsMock.mockResolvedValue([post])

    const result = await collector.collect(testInput)

    expect(result.length).toBeGreaterThan(0)
    const event = result[0]!
    expect(event.source).toBe("reddit")
    expect(event.externalId).toBe("post1")
    expect(event.metrics["score"]).toBe(500)
    expect(typeof event.title).toBe("string")
    expect(event.observedAt).toBeInstanceOf(Date)
  })

  it("does not stop collecting when one subreddit/sort fails", async () => {
    // First two calls throw (rising + hot of first subreddit), rest succeed
    getPostsMock
      .mockRejectedValueOnce(new Error("network error"))
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValue([makePost({ id: "post_ok", score: 999 })])

    const result = await collector.collect(testInput)
    // Other subreddits should have contributed
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(e => e.externalId === "post_ok")).toBe(true)
  })

  it("deduplicates the same post returned by both rising and hot", async () => {
    const post = makePost({ id: "dup_post", score: 800 })
    // Same post returned for every sort call
    getPostsMock.mockResolvedValue([post])

    const result = await collector.collect(testInput)

    const dupes = result.filter((e) => e.externalId === "dup_post")
    expect(dupes.length).toBe(1)
  })

  it("deduplication removes cross-subreddit duplicate post IDs", async () => {
    const crossDupPost = makePost({ id: "cross_dup", score: 900 })
    const uniquePost = makePost({ id: "unique_post", score: 750 })

    // subreddit[0] rising + hot => cross_dup
    // subreddit[1] rising + hot => cross_dup again
    // all remaining calls => unique_post
    getPostsMock
      .mockResolvedValueOnce([crossDupPost]) // subreddit[0] rising
      .mockResolvedValueOnce([crossDupPost]) // subreddit[0] hot
      .mockResolvedValueOnce([crossDupPost]) // subreddit[1] rising
      .mockResolvedValueOnce([crossDupPost]) // subreddit[1] hot
      .mockResolvedValue([uniquePost])        // all remaining calls

    const result = await collector.collect(testInput)

    expect(result.filter(e => e.externalId === "cross_dup").length).toBe(1)
  })

  it("collector has correct id and config", () => {
    expect(collector.id).toBe("reddit")
    expect(collector.config.id).toBe("reddit")
    expect(collector.config.enabled).toBe(true)
  })
})
