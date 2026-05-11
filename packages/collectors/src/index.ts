/**
 * @package @trend-chaser/collectors
 *
 * External data collectors for Trend Chaser.
 * Fetches raw signals from Reddit, Etsy, Amazon,
 * and the internal holiday calendar.
 *
 * All collectors implement SourceCollector and
 * return normalized SourceEventInput arrays.
 * Failures are isolated per collector —
 * one failure never stops others.
 *
 * @see packages/core for scoring and safety
 * @see packages/jobs for orchestration
 */

// ── types ─────────────────────────────────────────────────────────────────────

export type {
  SourceEventInput,
  CollectorConfig,
  CollectorResult,
  CollectInput,
  SourceCollector,
} from "./types.js"

// ── shared constants ──────────────────────────────────────────────────────────

export { SEED_QUERIES } from "./constants.js"

// ── collectors ────────────────────────────────────────────────────────────────

export { RedditCollector }   from "./collectors/reddit.collector.js"
export { EtsyCollector }     from "./collectors/etsy.collector.js"
export { AmazonCollector }   from "./collectors/amazon.collector.js"
export { CalendarCollector } from "./collectors/calendar.collector.js"

import type { SourceCollector } from "./types.js"
import { RedditCollector }   from "./collectors/reddit.collector.js"
import { EtsyCollector }     from "./collectors/etsy.collector.js"
import { AmazonCollector }   from "./collectors/amazon.collector.js"
import { CalendarCollector } from "./collectors/calendar.collector.js"

export const COLLECTORS: SourceCollector[] = [
  new RedditCollector(),
  new EtsyCollector(),
  new AmazonCollector(),
  new CalendarCollector(),
]

// ── clients — Reddit ──────────────────────────────────────────────────────────

export {
  getAccessToken,
  getPosts,
  searchPosts,
} from "./clients/reddit.client.js"

// ── clients — Etsy ────────────────────────────────────────────────────────────

export {
  searchListings,
  getListingsByShop,
  getListingImages,
} from "./clients/etsy.client.js"

// ── clients — Amazon ──────────────────────────────────────────────────────────

export {
  searchProducts,
  buildSearchUrl,
  getProductDetails,
} from "./clients/amazon.client.js"
