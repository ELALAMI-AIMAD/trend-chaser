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
} from "./types"

// ── shared constants ──────────────────────────────────────────────────────────

export { SEED_QUERIES } from "./constants"

// ── collectors ────────────────────────────────────────────────────────────────

export { RedditCollector }   from "./collectors/reddit.collector"
export { EtsyCollector }     from "./collectors/etsy.collector"
export { AmazonCollector }   from "./collectors/amazon.collector"
export { CalendarCollector } from "./collectors/calendar.collector"

import type { SourceCollector } from "./types"
import { RedditCollector }   from "./collectors/reddit.collector"
import { EtsyCollector }     from "./collectors/etsy.collector"
import { AmazonCollector }   from "./collectors/amazon.collector"
import { CalendarCollector } from "./collectors/calendar.collector"

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
} from "./clients/reddit.client"

// ── clients — Etsy ────────────────────────────────────────────────────────────

export {
  searchListings,
  getListingsByShop,
  getListingImages,
} from "./clients/etsy.client"

// ── clients — Amazon ──────────────────────────────────────────────────────────

export {
  searchProducts,
  buildSearchUrl,
  getProductDetails,
} from "./clients/amazon.client"
