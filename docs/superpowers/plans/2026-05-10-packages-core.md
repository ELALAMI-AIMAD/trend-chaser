# packages/core Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `packages/core` — the scoring engine, IP safety scanner, phrase normalizer, and niche taxonomy for Trend Chaser — with complete TypeScript and unit tests; zero runtime dependencies.

**Architecture:** A pure TypeScript library. All shared types flow from `types.ts`. Scoring (`calculate-trend-score`, `urgency`, `temperature`) is decoupled from data fetching. Safety checking (`restricted-terms`, `ip-safety`) is purely functional. `index.ts` is the single public API barrel. Vitest is the test runner — zero config overhead with ESM.

**Tech Stack:** TypeScript 5 (strict), Vitest 2 (dev), Node ≥22; no runtime deps.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `packages/core/package.json` | ESM package, vitest scripts |
| Create | `packages/core/tsconfig.json` | Strict TS, bundler resolution |
| Create | `packages/core/vitest.config.ts` | Test runner config |
| Modify | `package.json` (root) | Add `packages/*` to workspaces |
| **Replace** | `packages/core/src/index.ts` | Full barrel export (replaces stub) |
| Create | `packages/core/src/types.ts` | All shared interfaces and union types |
| Create | `packages/core/src/scoring/calculate-trend-score.ts` | Weighted formula + temperature + reason codes |
| Create | `packages/core/src/scoring/urgency.ts` | Urgency buckets + timing score + upload window |
| Create | `packages/core/src/scoring/temperature.ts` | Badge, icon, sort comparator |
| Create | `packages/core/src/normalization/normalize-phrase.ts` | Canonical phrase normalizer |
| Create | `packages/core/src/normalization/dedupe-candidates.ts` | Group candidates by normalized phrase |
| Create | `packages/core/src/safety/restricted-terms.ts` | BLOCKED_TERMS, HIGH_RISK_CATEGORIES, checkPhrase |
| Create | `packages/core/src/safety/ip-safety.ts` | Full IpSafetyCheck scanner |
| Create | `packages/core/src/taxonomy/niches.ts` | 75+ niche taxonomy with helpers |
| Create | `packages/core/src/__tests__/normalize-phrase.test.ts` | Unit tests |
| Create | `packages/core/src/__tests__/urgency.test.ts` | Unit tests |
| Create | `packages/core/src/__tests__/calculate-trend-score.test.ts` | Unit tests |

---

## Task 0: Package Setup

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`
- Modify: `package.json` (repo root)

- [ ] **Step 1: Create `packages/core/package.json`**

```json
{
  "name": "@trend-chaser/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.8.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `packages/core/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/core/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
```

- [ ] **Step 4: Add `packages/*` to root workspace**

Edit root `package.json`, change `"workspaces"` from `["apps/web"]` to:
```json
"workspaces": ["apps/web", "packages/*"]
```

- [ ] **Step 5: Install devDependencies**

```bash
cd packages/core && npm install
```

Expected: `node_modules/` created with typescript, vitest, @types/node.

---

## Task 1: types.ts

**Files:**
- Create: `packages/core/src/types.ts`

- [ ] **Step 1: Write `packages/core/src/types.ts`**

```typescript
/** The print-on-demand marketplace platforms supported by Trend Chaser. */
export type Platform = "Amazon" | "Etsy" | "Redbubble";

/** Market heat classification for a trend. */
export type TrendTemperature = "hot" | "warm" | "cold";

/** IP/copyright safety verdict for a phrase. */
export type SafetyVerdict = "safe" | "review" | "blocked";

/** Recommended action for a trend based on its score. */
export type TrendAction = "Test" | "Watch" | "Skip";

/** Calendar proximity urgency level. */
export type UrgencyLevel = "late" | "act_now" | "soon" | "this_month" | "plan_ahead";

/** A raw trend phrase candidate surfaced by one or more collectors. */
export interface TrendCandidate {
  id: string;
  canonicalPhrase: string;
  normalizedPhrase: string;
  niche: string;
  subcategory?: string;
  sources: string[];
  firstSeenAt: string;
  lastSeenAt: string;
}

/** Per-platform demand and competition metrics for a trend phrase. */
export interface PlatformMetric {
  platform: Platform;
  demandScore: number;       // 0-100
  competitionScore: number;  // 0-100 (higher = more saturated)
  velocityScore: number;     // 0-100 (rate of growth)
  evidence: Record<string, unknown>;
}

/** Complete weighted score for a trend candidate. */
export interface TrendScore {
  total: number;          // 0-100 weighted composite
  demand: number;         // 0-100
  competition: number;    // 0-100 (100 = untapped / low competition)
  velocity: number;       // 0-100
  timing: number;         // 0-100 (calendar urgency)
  platformFit: number;    // 0-100
  ipSafety: number;       // 0-100
  confidence: number;     // 0-100
  temperature: TrendTemperature;
  action: TrendAction;
  reasonCodes: string[];
}

/** A raw data event captured from a collector source. */
export interface SourceEvent {
  id: string;
  phrase: string;
  platform: Platform;
  url?: string;
  detectedAt: string;
  rawData: Record<string, unknown>;
}

/** A seasonal or viral calendar event driving trend demand. */
export interface CalendarEvent {
  id: string;
  title: string;
  dateLabel: string;
  eventDate: string;
  daysAway: number;
  urgency: UrgencyLevel;
  platform: Platform;
  subcategories: string[];
  keywords: string[];
}

/** AI-generated enrichment data for a trend phrase. */
export interface AiEnrichment {
  phrase: string;
  summary: string;
  designPrompts: string[];
  listingKeywords: string[];
  safetyNotes: string[];
  generatedAt: string;
}

/** A daily pipeline scan run record. */
export interface ScanRun {
  id: string;
  status: "running" | "success" | "error";
  startedAt: string;
  finishedAt?: string;
  sourcesChecked: number;
  trendsFound: number;
  error?: string;
}

/** Result of an IP/trademark safety scan on a phrase. */
export interface IpSafetyCheck {
  phrase: string;
  verdict: SafetyVerdict;
  score: number;           // 0-100 (100 = fully safe)
  matchedTerms: string[];
  highRiskCategories: string[];
  notes: string[];
  checkedAt: string;
}

/** A family of deduplicated trend candidates sharing a normalized phrase. */
export interface TrendCandidateFamily {
  normalizedPhrase: string;
  variants: string[];
  candidates: TrendCandidate[];
  mergedSources: string[];
}
```

---

## Task 2: normalize-phrase.ts + test (TDD)

**Files:**
- Create: `packages/core/src/__tests__/normalize-phrase.test.ts`
- Create: `packages/core/src/normalization/normalize-phrase.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/core/src/__tests__/normalize-phrase.test.ts
import { describe, it, expect } from "vitest";
import { normalizePhrase } from "../normalization/normalize-phrase.js";

describe("normalizePhrase", () => {
  it("lowercases all characters", () => {
    expect(normalizePhrase("CAMPING MOM")).toBe("camping mom");
  });

  it("expands & to and", () => {
    expect(normalizePhrase("Coffee & Tea")).toBe("coffee and tea");
  });

  it("removes special characters except letters, numbers, spaces", () => {
    expect(normalizePhrase("dog mom!")).toBe("dog mom");
    expect(normalizePhrase("cat-lover")).toBe("catlover");
    expect(normalizePhrase("nurse's life")).toBe("nurses life");
  });

  it("collapses multiple spaces into one", () => {
    expect(normalizePhrase("nurse  life")).toBe("nurse life");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizePhrase("  beach vibes  ")).toBe("beach vibes");
  });

  it("handles a complex phrase end-to-end", () => {
    expect(normalizePhrase("  Teacher's Life & Love! ")).toBe("teachers life and love");
  });

  it("returns empty string for blank input", () => {
    expect(normalizePhrase("")).toBe("");
    expect(normalizePhrase("   ")).toBe("");
  });

  it("preserves numbers", () => {
    expect(normalizePhrase("Class of 2025")).toBe("class of 2025");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/core && npx vitest run src/__tests__/normalize-phrase.test.ts
```

Expected: FAIL — `Cannot find module '../normalization/normalize-phrase.js'`

- [ ] **Step 3: Write `packages/core/src/normalization/normalize-phrase.ts`**

```typescript
/**
 * Normalizes a trend phrase for deduplication and comparison:
 * lowercases, expands &→and, strips non-alphanumeric chars, collapses whitespace.
 */
export function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/core && npx vitest run src/__tests__/normalize-phrase.test.ts
```

Expected: PASS — 8 tests pass.

---

## Task 3: restricted-terms.ts

**Files:**
- Create: `packages/core/src/safety/restricted-terms.ts`

- [ ] **Step 1: Write `packages/core/src/safety/restricted-terms.ts`**

```typescript
import type { SafetyVerdict } from "../types.js";

/**
 * Exact phrases that are trademarked, copyrighted, or licensed IP.
 * Any match → verdict: "blocked".
 */
export const BLOCKED_TERMS: string[] = [
  // Disney / Pixar characters
  "disney", "mickey mouse", "minnie mouse", "donald duck", "goofy",
  "buzz lightyear", "woody", "elsa", "anna", "olaf", "moana", "rapunzel",
  "cinderella", "ariel", "simba", "nala", "timon", "pumbaa",
  // Marvel
  "marvel", "avengers", "spider-man", "spiderman", "iron man", "thor", "hulk",
  "captain america", "black widow", "black panther", "wolverine", "deadpool",
  "x-men",
  // DC Comics
  "batman", "superman", "wonder woman", "aquaman", "the flash", "dc comics",
  // Star Wars / Lucasfilm
  "star wars", "darth vader", "yoda", "r2d2", "c3po", "mandalorian",
  "baby yoda", "grogu", "jedi", "sith",
  // Harry Potter / Wizarding World
  "harry potter", "hogwarts", "hermione", "ron weasley", "dumbledore",
  "voldemort", "slytherin", "gryffindor", "hufflepuff", "ravenclaw",
  "quidditch",
  // Nintendo / Pokémon
  "nintendo", "pokemon", "pikachu", "charmander", "bulbasaur", "squirtle",
  "mewtwo", "mario", "luigi", "zelda", "link", "kirby",
  // Other licensed characters
  "spongebob", "hello kitty", "sanrio", "peppa pig", "paw patrol",
  "bluey", "cocomelon",
  // Sports leagues (trademarked)
  "nfl", "nba", "mlb", "nhl", "nascar", "mls",
  "super bowl", "superbowl", "world series", "stanley cup", "nba finals",
  "ncaa", "college football playoff",
  // Protected events
  "olympic", "olympics", "paralympic", "paralympics",
  "fifa world cup", "uefa champions league",
  // Celebrities commonly exploited on POD without authorization
  "taylor swift", "swiftie", "beyonce", "beyoncé", "rihanna",
  "kanye west", "kim kardashian", "justin bieber", "ariana grande",
  "billie eilish", "harry styles", "lebron james", "michael jordan",
  "kobe bryant", "tom brady", "lionel messi", "cristiano ronaldo",
  // Book/film franchises
  "game of thrones", "lord of the rings", "hobbit", "gandalf",
  "transformers", "my little pony",
];

/**
 * Content categories that require mandatory human review even without an exact
 * BLOCKED_TERMS match. Any match → verdict: "review".
 */
export const HIGH_RISK_CATEGORIES: string[] = [
  // Medical / health claims
  "cure", "heals", "diagnose", "cancer fighter", "chemo", "covid", "vaccine",
  "anti-vax", "anti-vaxxer",
  // Political sensitivity
  "maga", "trump", "biden", "democrat", "republican", "antifa", "blm",
  "black lives matter", "all lives matter", "blue lives matter",
  // Tragedies / disasters
  "9/11", "september 11", "school shooting", "mass shooting", "genocide",
  "holocaust",
  // Hate / discrimination
  "white power", "white supremacy", "kkk", "nazi", "confederate flag",
];

/** Result of a phrase safety check. */
export interface PhraseCheckResult {
  verdict: SafetyVerdict;
  matchedTerms: string[];
  notes: string[];
}

/**
 * Checks a phrase against BLOCKED_TERMS and HIGH_RISK_CATEGORIES.
 * Blocked IP → "blocked". High-risk content → "review". Clean → "safe".
 */
export function checkPhrase(phrase: string): PhraseCheckResult {
  const lower = phrase.toLowerCase();

  const blockedMatches = BLOCKED_TERMS.filter((term) =>
    lower.includes(term.toLowerCase()),
  );
  const riskMatches = HIGH_RISK_CATEGORIES.filter((cat) =>
    lower.includes(cat.toLowerCase()),
  );

  const matchedTerms = [...blockedMatches, ...riskMatches];
  const notes: string[] = [];

  if (blockedMatches.length > 0) {
    notes.push(`Blocked IP detected: ${blockedMatches.join(", ")}`);
  }
  if (riskMatches.length > 0) {
    notes.push(
      `High-risk content: ${riskMatches.join(", ")}. Requires human review.`,
    );
  }

  const verdict: SafetyVerdict =
    blockedMatches.length > 0 ? "blocked"
    : riskMatches.length > 0  ? "review"
    : "safe";

  return { verdict, matchedTerms, notes };
}
```

---

## Task 4: temperature.ts

**Files:**
- Create: `packages/core/src/scoring/temperature.ts`

- [ ] **Step 1: Write `packages/core/src/scoring/temperature.ts`**

```typescript
import type { TrendTemperature } from "../types.js";

/** Returns a display label and hex color for a temperature value. */
export function getTemperatureBadge(
  temp: TrendTemperature,
): { label: string; color: string } {
  const badges: Record<TrendTemperature, { label: string; color: string }> = {
    hot:  { label: "Hot",  color: "#ff4d00" },
    warm: { label: "Warm", color: "#f59e0b" },
    cold: { label: "Cold", color: "#60a5fa" },
  };
  return badges[temp];
}

/** Returns an emoji icon for a temperature value. */
export function getTemperatureIcon(temp: TrendTemperature): string {
  const icons: Record<TrendTemperature, string> = {
    hot:  "🔥",
    warm: "☀️",
    cold: "❄️",
  };
  return icons[temp];
}

/**
 * Sort comparator for temperatures: hot → warm → cold.
 * Usage: `trends.sort((a, b) => compareTemperatures(a.temperature, b.temperature))`
 */
export function compareTemperatures(
  a: TrendTemperature,
  b: TrendTemperature,
): number {
  const order: Record<TrendTemperature, number> = { hot: 0, warm: 1, cold: 2 };
  return order[a] - order[b];
}
```

---

## Task 5: urgency.ts + test (TDD)

**Files:**
- Create: `packages/core/src/__tests__/urgency.test.ts`
- Create: `packages/core/src/scoring/urgency.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/core/src/__tests__/urgency.test.ts
import { describe, it, expect } from "vitest";
import { urgency, urgencyToTimingScore, uploadWindow } from "../scoring/urgency.js";

describe("urgency()", () => {
  it("returns late for negative days", () => {
    expect(urgency(-1)).toBe("late");
    expect(urgency(-30)).toBe("late");
  });

  it("returns act_now for 0-35 days", () => {
    expect(urgency(0)).toBe("act_now");
    expect(urgency(20)).toBe("act_now");
    expect(urgency(35)).toBe("act_now");
  });

  it("returns soon for 36-45 days", () => {
    expect(urgency(36)).toBe("soon");
    expect(urgency(45)).toBe("soon");
  });

  it("returns this_month for 46-60 days", () => {
    expect(urgency(46)).toBe("this_month");
    expect(urgency(60)).toBe("this_month");
  });

  it("returns plan_ahead for 61+ days", () => {
    expect(urgency(61)).toBe("plan_ahead");
    expect(urgency(365)).toBe("plan_ahead");
  });
});

describe("urgencyToTimingScore()", () => {
  it("act_now scores highest at 90", () => {
    expect(urgencyToTimingScore("act_now")).toBe(90);
  });
  it("soon scores 75", () => {
    expect(urgencyToTimingScore("soon")).toBe(75);
  });
  it("this_month scores 60", () => {
    expect(urgencyToTimingScore("this_month")).toBe(60);
  });
  it("plan_ahead scores 40", () => {
    expect(urgencyToTimingScore("plan_ahead")).toBe(40);
  });
  it("late is penalized at 15", () => {
    expect(urgencyToTimingScore("late")).toBe(15);
  });
});

describe("uploadWindow()", () => {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const event = new Date("2025-12-25T00:00:00.000Z");

  it("Amazon: 8 weeks before → 4 weeks before", () => {
    const { start, end } = uploadWindow("Amazon", event);
    expect((event.getTime() - start.getTime()) / WEEK).toBe(8);
    expect((event.getTime() - end.getTime()) / WEEK).toBe(4);
  });

  it("Etsy: 10 weeks before → 6 weeks before", () => {
    const { start, end } = uploadWindow("Etsy", event);
    expect((event.getTime() - start.getTime()) / WEEK).toBe(10);
    expect((event.getTime() - end.getTime()) / WEEK).toBe(6);
  });

  it("Redbubble: 9 weeks before → 5 weeks before", () => {
    const { start, end } = uploadWindow("Redbubble", event);
    expect((event.getTime() - start.getTime()) / WEEK).toBe(9);
    expect((event.getTime() - end.getTime()) / WEEK).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/core && npx vitest run src/__tests__/urgency.test.ts
```

Expected: FAIL — `Cannot find module '../scoring/urgency.js'`

- [ ] **Step 3: Write `packages/core/src/scoring/urgency.ts`**

```typescript
import type { Platform, UrgencyLevel } from "../types.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const UPLOAD_WINDOWS: Record<Platform, { startWeeks: number; endWeeks: number }> = {
  Amazon:    { startWeeks: 8,  endWeeks: 4 },
  Etsy:      { startWeeks: 10, endWeeks: 6 },
  Redbubble: { startWeeks: 9,  endWeeks: 5 },
};

/**
 * Classifies calendar proximity into an urgency level.
 * Negative daysUntilEvent means the event has already passed (→ "late").
 */
export function urgency(daysUntilEvent: number): UrgencyLevel {
  if (daysUntilEvent < 0)  return "late";
  if (daysUntilEvent <= 35) return "act_now";
  if (daysUntilEvent <= 45) return "soon";
  if (daysUntilEvent <= 60) return "this_month";
  return "plan_ahead";
}

/**
 * Converts an urgency level to a 0-100 timing score for use in the scoring formula.
 * act_now scores highest; late is penalized.
 */
export function urgencyToTimingScore(level: UrgencyLevel): number {
  const scores: Record<UrgencyLevel, number> = {
    act_now:    90,
    soon:       75,
    this_month: 60,
    plan_ahead: 40,
    late:       15,
  };
  return scores[level];
}

/**
 * Computes the recommended upload date window for a platform given an event date.
 * `start` is the earliest date to upload; `end` is the latest.
 */
export function uploadWindow(
  platform: Platform,
  eventDate: Date,
): { start: Date; end: Date } {
  const { startWeeks, endWeeks } = UPLOAD_WINDOWS[platform];
  return {
    start: new Date(eventDate.getTime() - startWeeks * WEEK_MS),
    end:   new Date(eventDate.getTime() - endWeeks   * WEEK_MS),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/core && npx vitest run src/__tests__/urgency.test.ts
```

Expected: PASS — 12 tests pass.

---

## Task 6: calculate-trend-score.ts + test (TDD)

**Files:**
- Create: `packages/core/src/__tests__/calculate-trend-score.test.ts`
- Create: `packages/core/src/scoring/calculate-trend-score.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/core/src/__tests__/calculate-trend-score.test.ts
import { describe, it, expect } from "vitest";
import {
  calculateTrendScore,
  type ScoreInput,
} from "../scoring/calculate-trend-score.js";

const perfect: ScoreInput = {
  demand: 100, competition: 100, velocity: 100,
  timing: 100, platformFit: 100, ipSafety: 100, confidence: 100,
};

const zero: ScoreInput = {
  demand: 0, competition: 0, velocity: 0,
  timing: 0, platformFit: 0, ipSafety: 0, confidence: 0,
};

describe("scoring formula", () => {
  it("total = 100 when all inputs are 100", () => {
    expect(calculateTrendScore(perfect).total).toBe(100);
  });

  it("total = 0 when all inputs are 0", () => {
    expect(calculateTrendScore(zero).total).toBe(0);
  });

  it("demand weight is 0.22 (demand=80 → 17.6)", () => {
    const result = calculateTrendScore({ ...zero, demand: 80 });
    expect(result.total).toBeCloseTo(17.6, 1);
  });

  it("competition weight is 0.18", () => {
    const result = calculateTrendScore({ ...zero, competition: 100 });
    expect(result.total).toBeCloseTo(18, 1);
  });

  it("all weights sum to 1.0", () => {
    const weights = [0.22, 0.18, 0.18, 0.14, 0.14, 0.10, 0.04];
    expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1.0, 10);
  });
});

describe("temperature classification", () => {
  it("hot: total >= 75 AND ipSafety >= 70", () => {
    const result = calculateTrendScore({
      demand: 85, competition: 85, velocity: 85,
      timing: 85, platformFit: 85, ipSafety: 85, confidence: 85,
    });
    expect(result.temperature).toBe("hot");
    expect(result.action).toBe("Test");
  });

  it("warm (not hot) when ipSafety < 70 even with high total", () => {
    // All 90 except ipSafety=60: total will be >75 but ipSafety<70
    const result = calculateTrendScore({
      demand: 90, competition: 90, velocity: 90,
      timing: 90, platformFit: 90, ipSafety: 60, confidence: 90,
    });
    expect(result.temperature).toBe("warm");
    expect(result.action).toBe("Watch");
  });

  it("cold when total < 55", () => {
    const result = calculateTrendScore({
      demand: 30, competition: 30, velocity: 30,
      timing: 30, platformFit: 30, ipSafety: 30, confidence: 30,
    });
    expect(result.temperature).toBe("cold");
    expect(result.action).toBe("Skip");
  });
});

describe("reason codes", () => {
  it("high-demand when demand >= 70", () => {
    expect(calculateTrendScore({ ...zero, demand: 75 }).reasonCodes).toContain("high-demand");
  });

  it("low-demand when demand < 40", () => {
    expect(calculateTrendScore({ ...zero, demand: 20 }).reasonCodes).toContain("low-demand");
  });

  it("low-competition when competition >= 70", () => {
    expect(calculateTrendScore({ ...zero, competition: 80 }).reasonCodes).toContain("low-competition");
  });

  it("high-competition when competition < 40", () => {
    expect(calculateTrendScore({ ...zero, competition: 20 }).reasonCodes).toContain("high-competition");
  });

  it("ip-risk when ipSafety < 70", () => {
    expect(calculateTrendScore({ ...perfect, ipSafety: 50 }).reasonCodes).toContain("ip-risk");
  });

  it("ip-blocked when ipSafety < 30", () => {
    expect(calculateTrendScore({ ...perfect, ipSafety: 10 }).reasonCodes).toContain("ip-blocked");
  });

  it("top-score when total >= 75", () => {
    expect(calculateTrendScore(perfect).reasonCodes).toContain("top-score");
  });
});

describe("input clamping", () => {
  it("clamps inputs above 100", () => {
    const result = calculateTrendScore({
      demand: 200, competition: 200, velocity: 200,
      timing: 200, platformFit: 200, ipSafety: 200, confidence: 200,
    });
    expect(result.total).toBe(100);
  });

  it("clamps inputs below 0", () => {
    const result = calculateTrendScore({
      demand: -50, competition: -50, velocity: -50,
      timing: -50, platformFit: -50, ipSafety: -50, confidence: -50,
    });
    expect(result.total).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/core && npx vitest run src/__tests__/calculate-trend-score.test.ts
```

Expected: FAIL — `Cannot find module '../scoring/calculate-trend-score.js'`

- [ ] **Step 3: Write `packages/core/src/scoring/calculate-trend-score.ts`**

```typescript
import type { TrendScore, TrendTemperature, TrendAction } from "../types.js";

/** All scoring dimensions (0-100 each). Higher is always better. */
export interface ScoreInput {
  /** Search volume / market demand. */
  demand: number;
  /** Inverted saturation: 100 = untapped market, 0 = fully saturated. */
  competition: number;
  /** Rate of growth / momentum. */
  velocity: number;
  /** Calendar timing urgency. Use urgencyToTimingScore() to derive this. */
  timing: number;
  /** How well the phrase fits the target platforms' audiences. */
  platformFit: number;
  /** IP safety score from scanIpSafety(). 100 = fully safe. */
  ipSafety: number;
  /** Confidence in the data quality (sample size, source agreement). */
  confidence: number;
}

const WEIGHTS = {
  demand:      0.22,
  competition: 0.18,
  velocity:    0.18,
  timing:      0.14,
  platformFit: 0.14,
  ipSafety:    0.10,
  confidence:  0.04,
} as const;

/**
 * Calculates the composite trend score using the weighted formula:
 *   total = demand×0.22 + competition×0.18 + velocity×0.18 + timing×0.14
 *         + platformFit×0.14 + ipSafety×0.10 + confidence×0.04
 *
 * Temperature rules:
 *   hot:  total ≥ 75 AND ipSafety ≥ 70
 *   warm: total ≥ 55
 *   cold: total < 55
 *
 * All inputs are clamped to [0, 100] before scoring.
 */
export function calculateTrendScore(input: ScoreInput): TrendScore {
  const clamped = clampAll(input);

  const total =
    clamped.demand      * WEIGHTS.demand      +
    clamped.competition * WEIGHTS.competition +
    clamped.velocity    * WEIGHTS.velocity    +
    clamped.timing      * WEIGHTS.timing      +
    clamped.platformFit * WEIGHTS.platformFit +
    clamped.ipSafety    * WEIGHTS.ipSafety    +
    clamped.confidence  * WEIGHTS.confidence;

  const rounded      = round(total);
  const temperature  = deriveTemperature(rounded, clamped.ipSafety);
  const action       = deriveAction(temperature);
  const reasonCodes  = deriveReasonCodes(clamped, rounded);

  return {
    total:       rounded,
    demand:      clamped.demand,
    competition: clamped.competition,
    velocity:    clamped.velocity,
    timing:      clamped.timing,
    platformFit: clamped.platformFit,
    ipSafety:    clamped.ipSafety,
    confidence:  clamped.confidence,
    temperature,
    action,
    reasonCodes,
  };
}

function clampAll(input: ScoreInput): ScoreInput {
  const result = { ...input };
  for (const key of Object.keys(result) as (keyof ScoreInput)[]) {
    result[key] = Math.max(0, Math.min(100, result[key]));
  }
  return result;
}

function deriveTemperature(total: number, ipSafety: number): TrendTemperature {
  if (total >= 75 && ipSafety >= 70) return "hot";
  if (total >= 55) return "warm";
  return "cold";
}

function deriveAction(temperature: TrendTemperature): TrendAction {
  if (temperature === "hot")  return "Test";
  if (temperature === "warm") return "Watch";
  return "Skip";
}

function deriveReasonCodes(input: ScoreInput, total: number): string[] {
  const codes: string[] = [];
  if (input.demand >= 70)      codes.push("high-demand");
  if (input.demand < 40)       codes.push("low-demand");
  if (input.competition >= 70) codes.push("low-competition");
  if (input.competition < 40)  codes.push("high-competition");
  if (input.velocity >= 70)    codes.push("high-velocity");
  if (input.timing >= 75)      codes.push("good-timing");
  if (input.timing <= 20)      codes.push("poor-timing");
  if (input.ipSafety < 70)     codes.push("ip-risk");
  if (input.ipSafety < 30)     codes.push("ip-blocked");
  if (input.confidence < 40)   codes.push("low-confidence");
  if (total >= 75)             codes.push("top-score");
  return codes;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/core && npx vitest run src/__tests__/calculate-trend-score.test.ts
```

Expected: PASS — all tests pass.

---

## Task 7: ip-safety.ts

**Files:**
- Create: `packages/core/src/safety/ip-safety.ts`

- [ ] **Step 1: Write `packages/core/src/safety/ip-safety.ts`**

```typescript
import type { IpSafetyCheck, SafetyVerdict } from "../types.js";
import { checkPhrase, HIGH_RISK_CATEGORIES } from "./restricted-terms.js";

/**
 * Runs a full IP and trademark safety scan on a trend phrase.
 * Checks for trademarks, brand names, celebrity names, protected event names,
 * medical claims, and political sensitivity.
 *
 * High-risk categories always require human review.
 * Returns an IpSafetyCheck with a 0-100 safety score (100 = fully safe).
 */
export function scanIpSafety(phrase: string): IpSafetyCheck {
  const { verdict, matchedTerms, notes } = checkPhrase(phrase);

  const riskCatSet = new Set(HIGH_RISK_CATEGORIES.map((c) => c.toLowerCase()));
  const highRiskCategories = matchedTerms.filter((t) =>
    riskCatSet.has(t.toLowerCase()),
  );

  return {
    phrase,
    verdict,
    score: verdictToScore(verdict, matchedTerms.length),
    matchedTerms,
    highRiskCategories,
    notes,
    checkedAt: new Date().toISOString(),
  };
}

function verdictToScore(verdict: SafetyVerdict, matchCount: number): number {
  switch (verdict) {
    case "blocked": return Math.max(0, 20 - matchCount * 10);
    case "review":  return Math.max(30, 65 - matchCount * 10);
    case "safe":    return 100;
  }
}
```

---

## Task 8: dedupe-candidates.ts

**Files:**
- Create: `packages/core/src/normalization/dedupe-candidates.ts`

- [ ] **Step 1: Write `packages/core/src/normalization/dedupe-candidates.ts`**

```typescript
import type { TrendCandidate, TrendCandidateFamily } from "../types.js";
import { normalizePhrase } from "./normalize-phrase.js";

/**
 * Groups trend candidates by their normalized phrase, merging source arrays
 * and collecting all canonical phrase variants into families.
 * Returns one TrendCandidateFamily per unique normalized form.
 */
export function dedupeCandidates(
  candidates: TrendCandidate[],
): TrendCandidateFamily[] {
  const families = new Map<string, TrendCandidateFamily>();

  for (const candidate of candidates) {
    const key = normalizePhrase(candidate.canonicalPhrase);

    if (!families.has(key)) {
      families.set(key, {
        normalizedPhrase: key,
        variants: [],
        candidates: [],
        mergedSources: [],
      });
    }

    const family = families.get(key)!;
    family.candidates.push(candidate);

    if (!family.variants.includes(candidate.canonicalPhrase)) {
      family.variants.push(candidate.canonicalPhrase);
    }

    for (const source of candidate.sources) {
      if (!family.mergedSources.includes(source)) {
        family.mergedSources.push(source);
      }
    }
  }

  return Array.from(families.values());
}
```

---

## Task 9: niches.ts

**Files:**
- Create: `packages/core/src/taxonomy/niches.ts`

- [ ] **Step 1: Write `packages/core/src/taxonomy/niches.ts`**

```typescript
/** The top-level category grouping for a niche. */
export type NicheCategory =
  | "calendar-seasonal"
  | "viral"
  | "hobby"
  | "profession"
  | "family"
  | "sports-adjacent"
  | "pet-animal"
  | "food-drink"
  | "wellness"
  | "internet-culture"
  | "local-pride"
  | "travel"
  | "school-college";

/** A single niche entry in the taxonomy. */
export interface Niche {
  slug: string;
  name: string;
  category: NicheCategory;
  subcategories: string[];
}

/** Full niche taxonomy — 75+ entries covering all major POD market segments. */
export const NICHE_TAXONOMY: Niche[] = [
  // ── Calendar / Seasonal ──────────────────────────────────────────────
  { slug: "christmas", name: "Christmas", category: "calendar-seasonal",
    subcategories: ["ugly sweater", "elf", "santa", "reindeer", "snowman", "nutcracker", "christmas eve"] },
  { slug: "halloween", name: "Halloween", category: "calendar-seasonal",
    subcategories: ["witch", "skeleton", "vampire", "ghost", "pumpkin", "spooky season", "trick or treat", "black cat"] },
  { slug: "valentines-day", name: "Valentine's Day", category: "calendar-seasonal",
    subcategories: ["love", "galentines", "anti-valentine", "couples", "hearts", "chocolate"] },
  { slug: "mothers-day", name: "Mother's Day", category: "calendar-seasonal",
    subcategories: ["mama", "new mom", "girl mom", "boy mom", "dog mom", "bonus mom", "grandma"] },
  { slug: "fathers-day", name: "Father's Day", category: "calendar-seasonal",
    subcategories: ["dad jokes", "grill dad", "bonus dad", "dog dad", "new dad", "girl dad"] },
  { slug: "easter", name: "Easter", category: "calendar-seasonal",
    subcategories: ["bunny", "eggs", "spring", "religious easter", "chick"] },
  { slug: "thanksgiving", name: "Thanksgiving", category: "calendar-seasonal",
    subcategories: ["grateful", "turkey", "fall vibes", "pie lover", "harvest"] },
  { slug: "new-years", name: "New Year's", category: "calendar-seasonal",
    subcategories: ["new year new me", "cheers", "midnight", "resolutions", "countdown"] },
  { slug: "fourth-of-july", name: "4th of July", category: "calendar-seasonal",
    subcategories: ["patriotic", "fireworks", "merica", "freedom", "red white blue"] },
  { slug: "st-patricks-day", name: "St. Patrick's Day", category: "calendar-seasonal",
    subcategories: ["lucky", "shamrock", "irish", "clover", "green beer"] },
  { slug: "back-to-school", name: "Back to School", category: "calendar-seasonal",
    subcategories: ["first day", "grade level", "school supplies", "teacher"] },
  { slug: "graduation", name: "Graduation", category: "calendar-seasonal",
    subcategories: ["class of year", "senior", "college grad", "high school grad", "proud parent", "cap and gown"] },
  { slug: "cinco-de-mayo", name: "Cinco de Mayo", category: "calendar-seasonal",
    subcategories: ["fiesta", "taco", "margarita", "salsa", "festive"] },
  { slug: "memorial-day", name: "Memorial Day", category: "calendar-seasonal",
    subcategories: ["honor", "veteran tribute", "freedom", "summer kickoff"] },
  { slug: "labor-day", name: "Labor Day", category: "calendar-seasonal",
    subcategories: ["end of summer", "union", "workers", "long weekend"] },
  // ── Viral ─────────────────────────────────────────────────────────────
  { slug: "bookish", name: "Bookish / BookTok", category: "viral",
    subcategories: ["reader girl", "dark romance", "fantasy reader", "enemies to lovers", "kindle addict", "booktok"] },
  { slug: "cottagecore", name: "Cottagecore", category: "viral",
    subcategories: ["mushroom", "fairy garden", "cottage witch", "wildflower", "frog", "forest"] },
  { slug: "dark-academia", name: "Dark Academia", category: "viral",
    subcategories: ["ancient history", "library aesthetic", "poetry", "oxford", "philosophy"] },
  { slug: "goblincore", name: "Goblincore", category: "viral",
    subcategories: ["frog", "mushroom", "snail", "forest creature", "shiny things", "rocks"] },
  { slug: "witchy", name: "Witchy / Mystical", category: "viral",
    subcategories: ["tarot", "astrology", "moon phases", "crystals", "spell book", "coven", "herbalist"] },
  { slug: "retro-nostalgia", name: "Retro / Nostalgia", category: "viral",
    subcategories: ["90s kid", "80s baby", "vintage vibes", "retro aesthetic", "cassette tape", "vhs"] },
  // ── Hobby ─────────────────────────────────────────────────────────────
  { slug: "gaming", name: "Gaming", category: "hobby",
    subcategories: ["pc gamer", "console gamer", "retro gaming", "rpg", "fps", "indie game", "streamer"] },
  { slug: "crafting", name: "Crafting", category: "hobby",
    subcategories: ["crochet", "knitting", "cross stitch", "scrapbooking", "sewing", "yarn lover", "quilting"] },
  { slug: "reading", name: "Reading / Books", category: "hobby",
    subcategories: ["fiction lover", "nonfiction", "mystery reader", "sci-fi reader", "book club"] },
  { slug: "photography", name: "Photography", category: "hobby",
    subcategories: ["film photography", "nature photography", "portrait", "hobbyist", "golden hour"] },
  { slug: "gardening", name: "Gardening", category: "hobby",
    subcategories: ["plant parent", "herb garden", "vegetable garden", "flower lover", "succulent", "propagation"] },
  { slug: "cooking", name: "Cooking / Baking", category: "hobby",
    subcategories: ["home baker", "sourdough", "pasta lover", "meal prep", "bbq", "air fryer"] },
  { slug: "hiking", name: "Hiking / Outdoor", category: "hobby",
    subcategories: ["trail life", "camping lover", "national parks", "wilderness", "mountain life", "ultralight"] },
  { slug: "music", name: "Music", category: "hobby",
    subcategories: ["guitar player", "piano player", "drummer", "vinyl collector", "concert lover", "band mom"] },
  { slug: "yoga", name: "Yoga / Meditation", category: "hobby",
    subcategories: ["namaste", "mindfulness", "zen", "chakra", "breathe", "flow state"] },
  { slug: "fishing", name: "Fishing", category: "hobby",
    subcategories: ["bass fishing", "fly fishing", "gone fishing", "reel life", "catch and release", "ice fishing"] },
  { slug: "hunting", name: "Hunting", category: "hobby",
    subcategories: ["deer hunting", "duck hunting", "turkey season", "bow hunting", "outdoorsman", "gun dog"] },
  { slug: "diy-woodworking", name: "DIY / Woodworking", category: "hobby",
    subcategories: ["maker", "workshop life", "sawdust is my glitter", "craftsman", "power tools"] },
  // ── Profession ────────────────────────────────────────────────────────
  { slug: "nurse", name: "Nurse / Nursing", category: "profession",
    subcategories: ["rn life", "er nurse", "icu nurse", "labor and delivery", "travel nurse", "nurse practitioner", "cna"] },
  { slug: "teacher", name: "Teacher", category: "profession",
    subcategories: ["kindergarten", "elementary", "middle school", "high school", "art teacher", "pe teacher", "substitute"] },
  { slug: "doctor", name: "Doctor / Physician", category: "profession",
    subcategories: ["medical resident", "surgeon", "pediatrician", "dentist", "pharmacist", "emt", "paramedic"] },
  { slug: "engineer", name: "Engineer", category: "profession",
    subcategories: ["software engineer", "civil engineer", "mechanical engineer", "electrical engineer", "aerospace"] },
  { slug: "firefighter", name: "Firefighter", category: "profession",
    subcategories: ["fire wife", "fire mom", "first responder", "volunteer firefighter", "ladder company"] },
  { slug: "police", name: "Police / Law Enforcement", category: "profession",
    subcategories: ["police wife", "cop life", "detective", "first responder", "deputy"] },
  { slug: "military", name: "Military", category: "profession",
    subcategories: ["army", "navy", "marines", "air force", "coast guard", "military wife", "veteran", "national guard"] },
  { slug: "chef", name: "Chef / Cook", category: "profession",
    subcategories: ["line cook", "pastry chef", "restaurant life", "culinary student", "sous chef"] },
  { slug: "accountant", name: "Accountant / CPA", category: "profession",
    subcategories: ["tax season", "bookkeeper", "finance life", "spreadsheet lover", "cpa"] },
  { slug: "real-estate", name: "Real Estate", category: "profession",
    subcategories: ["realtor life", "house flipping", "property manager", "real estate agent", "mortgage"] },
  { slug: "social-worker", name: "Social Worker / Counselor", category: "profession",
    subcategories: ["mental health counselor", "school counselor", "case manager", "therapist"] },
  // ── Family ────────────────────────────────────────────────────────────
  { slug: "mom-life", name: "Mom Life", category: "family",
    subcategories: ["toddler mom", "sports mom", "tired mom", "wine mom", "chaos coordinator", "hockey mom"] },
  { slug: "dad-life", name: "Dad Life", category: "family",
    subcategories: ["girl dad", "toddler dad", "sports dad", "cool dad", "dog dad", "hockey dad"] },
  { slug: "grandparent", name: "Grandparent", category: "family",
    subcategories: ["grandma", "grandpa", "nana", "papa", "granny", "gramps", "mimi"] },
  { slug: "aunt-uncle", name: "Aunt / Uncle", category: "family",
    subcategories: ["cool aunt", "fun uncle", "auntie", "promoted to aunt", "promoted to uncle"] },
  { slug: "sibling", name: "Sibling", category: "family",
    subcategories: ["big sister", "little sister", "big brother", "little brother", "only child", "twins"] },
  { slug: "baby-newborn", name: "Baby / Newborn", category: "family",
    subcategories: ["new baby", "baby shower", "gender reveal", "pregnancy announcement", "new parent", "onesie"] },
  { slug: "wedding", name: "Wedding / Marriage", category: "family",
    subcategories: ["bride", "groom", "maid of honor", "bridesmaid", "just married", "wifey", "hubby"] },
  // ── Sports-Adjacent ───────────────────────────────────────────────────
  { slug: "running", name: "Running", category: "sports-adjacent",
    subcategories: ["marathon", "5k", "trail runner", "half marathon", "morning runner", "26.2"] },
  { slug: "cycling", name: "Cycling", category: "sports-adjacent",
    subcategories: ["road cycling", "mountain bike", "gravel bike", "spin class", "cyclist life"] },
  { slug: "swimming", name: "Swimming", category: "sports-adjacent",
    subcategories: ["swim team", "open water", "pool life", "swim mom", "lap swimmer", "master swimmer"] },
  { slug: "crossfit", name: "CrossFit / Weightlifting", category: "sports-adjacent",
    subcategories: ["wod life", "barbell club", "powerlifting", "gym rat", "lifting heavy", "box life"] },
  { slug: "soccer", name: "Soccer / Football", category: "sports-adjacent",
    subcategories: ["soccer mom", "soccer dad", "goalkeeper", "striker", "youth soccer", "futbol"] },
  { slug: "baseball", name: "Baseball / Softball", category: "sports-adjacent",
    subcategories: ["baseball mom", "softball mom", "catcher", "pitcher", "dugout life", "little league"] },
  { slug: "basketball", name: "Basketball", category: "sports-adjacent",
    subcategories: ["hoop life", "basketball mom", "point guard", "ball is life", "court life"] },
  { slug: "golf", name: "Golf", category: "sports-adjacent",
    subcategories: ["golf dad", "weekend golfer", "golf wife", "par life", "birdie", "disc golf"] },
  { slug: "volleyball", name: "Volleyball", category: "sports-adjacent",
    subcategories: ["volleyball mom", "beach volleyball", "setter", "libero", "spike"] },
  { slug: "cheer-dance", name: "Cheer / Dance", category: "sports-adjacent",
    subcategories: ["cheer mom", "dance mom", "competition season", "tumbling", "recital"] },
  // ── Pet / Animal ──────────────────────────────────────────────────────
  { slug: "dog-mom-dad", name: "Dog Mom / Dog Dad", category: "pet-animal",
    subcategories: ["golden retriever", "labrador", "dachshund", "french bulldog", "pittie mom", "husky", "rescue dog", "german shepherd"] },
  { slug: "cat-mom-dad", name: "Cat Mom / Cat Dad", category: "pet-animal",
    subcategories: ["tabby", "black cat", "maine coon", "rescue cat", "cat lady", "crazy cat lady", "orange cat"] },
  { slug: "horse-equestrian", name: "Horse / Equestrian", category: "pet-animal",
    subcategories: ["barrel racing", "show jumping", "dressage", "horse girl", "barn life", "western riding"] },
  { slug: "reptile", name: "Reptile / Exotic Pet", category: "pet-animal",
    subcategories: ["bearded dragon", "gecko", "ball python", "turtle", "lizard mom"] },
  { slug: "bird-parrot", name: "Bird / Parrot", category: "pet-animal",
    subcategories: ["cockatiel", "parakeet", "macaw", "bird mom", "parrot lover", "chicken keeper"] },
  // ── Food / Drink ──────────────────────────────────────────────────────
  { slug: "coffee", name: "Coffee / Espresso", category: "food-drink",
    subcategories: ["cold brew", "iced coffee", "latte art", "coffee addict", "but first coffee", "coffee snob"] },
  { slug: "wine", name: "Wine", category: "food-drink",
    subcategories: ["wine mom", "rosé all day", "red wine lover", "white wine", "vineyard", "wine wednesday"] },
  { slug: "whiskey-bourbon", name: "Whiskey / Bourbon", category: "food-drink",
    subcategories: ["bourbon lover", "whiskey dad", "scotch", "barrel aged", "on the rocks", "neat"] },
  { slug: "pizza-tacos", name: "Pizza / Tacos", category: "food-drink",
    subcategories: ["pizza addict", "taco tuesday", "taco lover", "nacho", "foodie", "street tacos"] },
  { slug: "vegan-vegetarian", name: "Vegan / Vegetarian", category: "food-drink",
    subcategories: ["plant based", "veggie lover", "tofu", "meatless monday", "animal lover"] },
  { slug: "bbq-grilling", name: "BBQ / Grilling", category: "food-drink",
    subcategories: ["grill master", "pit master", "smoke bbq", "brisket", "backyard bbq", "low and slow"] },
  // ── Wellness ──────────────────────────────────────────────────────────
  { slug: "mental-health", name: "Mental Health Awareness", category: "wellness",
    subcategories: ["anxiety warrior", "self care", "therapy", "mental health matters", "it is okay", "breathe"] },
  { slug: "sobriety", name: "Sobriety / Recovery", category: "wellness",
    subcategories: ["sober life", "recovery", "clean and sober", "one day at a time", "soberversary"] },
  { slug: "fitness-wellness", name: "Fitness / Healthy Living", category: "wellness",
    subcategories: ["clean eating", "meal prep", "step count", "walk more", "wellness journey"] },
  // ── Internet Culture ──────────────────────────────────────────────────
  { slug: "astrology", name: "Astrology / Zodiac", category: "internet-culture",
    subcategories: ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"] },
  { slug: "frog-mushroom", name: "Frog & Mushroom Aesthetic", category: "internet-culture",
    subcategories: ["frog lover", "mushroom forager", "fairy core", "forest spirit", "cottagecore frog"] },
  { slug: "true-crime", name: "True Crime / Mystery", category: "internet-culture",
    subcategories: ["podcast listener", "murderino", "crime junkie", "cold case", "mystery lover"] },
  // ── Local Pride ───────────────────────────────────────────────────────
  { slug: "state-pride", name: "State Pride", category: "local-pride",
    subcategories: ["texas proud", "florida life", "california dreaming", "new york", "colorado mountains", "southern girl", "midwest"] },
  { slug: "country-rural", name: "Country / Rural Pride", category: "local-pride",
    subcategories: ["country girl", "farm life", "small town", "rural living", "cowgirl", "cowboy", "ranch life"] },
  { slug: "southern-culture", name: "Southern Culture", category: "local-pride",
    subcategories: ["y'all", "sweet tea", "bless your heart", "southern belle", "dixie"] },
  // ── Travel ────────────────────────────────────────────────────────────
  { slug: "beach-ocean", name: "Beach / Ocean", category: "travel",
    subcategories: ["beach life", "ocean lover", "surfer", "mermaid vibes", "salty air", "coastal grandmother"] },
  { slug: "mountains", name: "Mountains", category: "travel",
    subcategories: ["mountain life", "elevation", "peak bagger", "ski bum", "altitude", "fourteener"] },
  { slug: "camping", name: "Camping / RV Life", category: "travel",
    subcategories: ["tent life", "rv life", "glamping", "campfire", "smores", "campground"] },
  { slug: "national-parks", name: "National Parks", category: "travel",
    subcategories: ["park lover", "yellowstone", "grand canyon", "yosemite", "trails", "junior ranger"] },
  // ── School / College ─────────────────────────────────────────────────
  { slug: "college-life", name: "College Life", category: "school-college",
    subcategories: ["freshman", "senior year", "dorm life", "greek life", "study grind", "finals week"] },
  { slug: "school-student", name: "Student Life", category: "school-college",
    subcategories: ["honor roll", "homework", "study life", "pencil case", "notebook lover"] },
];

/** Look up a niche by its slug identifier. */
export function getNicheBySlug(slug: string): Niche | undefined {
  return NICHE_TAXONOMY.find((n) => n.slug === slug);
}

/** Return every niche in the taxonomy. */
export function getAllNiches(): Niche[] {
  return NICHE_TAXONOMY;
}

/** Return the subcategories for a given niche slug. Returns [] if slug not found. */
export function getSubcategories(nicheSlug: string): string[] {
  return getNicheBySlug(nicheSlug)?.subcategories ?? [];
}

/** Return all niches belonging to a specific category. */
export function getNichesByCategory(category: NicheCategory): Niche[] {
  return NICHE_TAXONOMY.filter((n) => n.category === category);
}
```

---

## Task 10: index.ts (replace stub)

**Files:**
- Replace: `packages/core/src/index.ts`

- [ ] **Step 1: Replace `packages/core/src/index.ts` with full barrel exports**

```typescript
// Types
export type {
  Platform,
  TrendTemperature,
  SafetyVerdict,
  TrendAction,
  UrgencyLevel,
  TrendCandidate,
  PlatformMetric,
  TrendScore,
  SourceEvent,
  CalendarEvent,
  AiEnrichment,
  ScanRun,
  IpSafetyCheck,
  TrendCandidateFamily,
} from "./types.js";

// Scoring
export { calculateTrendScore } from "./scoring/calculate-trend-score.js";
export type { ScoreInput } from "./scoring/calculate-trend-score.js";
export { urgency, urgencyToTimingScore, uploadWindow } from "./scoring/urgency.js";
export {
  getTemperatureBadge,
  getTemperatureIcon,
  compareTemperatures,
} from "./scoring/temperature.js";

// Normalization
export { normalizePhrase } from "./normalization/normalize-phrase.js";
export { dedupeCandidates } from "./normalization/dedupe-candidates.js";

// Safety
export {
  BLOCKED_TERMS,
  HIGH_RISK_CATEGORIES,
  checkPhrase,
} from "./safety/restricted-terms.js";
export type { PhraseCheckResult } from "./safety/restricted-terms.js";
export { scanIpSafety } from "./safety/ip-safety.js";

// Taxonomy
export {
  NICHE_TAXONOMY,
  getNicheBySlug,
  getAllNiches,
  getSubcategories,
  getNichesByCategory,
} from "./taxonomy/niches.js";
export type { Niche, NicheCategory } from "./taxonomy/niches.js";
```

---

## Task 11: Full test run + typecheck

- [ ] **Step 1: Run all tests**

```bash
cd packages/core && npx vitest run
```

Expected output:
```
 ✓ src/__tests__/normalize-phrase.test.ts (8 tests)
 ✓ src/__tests__/urgency.test.ts (12 tests)
 ✓ src/__tests__/calculate-trend-score.test.ts (16 tests)

 Test Files  3 passed (3)
 Tests       36 passed (36)
```

- [ ] **Step 2: Run TypeScript typecheck**

```bash
cd packages/core && npx tsc --noEmit
```

Expected: no errors.

---

## Self-Review

**Spec coverage:**
- [x] `types.ts` — Platform, TrendTemperature, SafetyVerdict, TrendCandidate, PlatformMetric, TrendScore, SourceEvent, CalendarEvent, AiEnrichment, ScanRun, IpSafetyCheck
- [x] `calculate-trend-score.ts` — weighted formula, temperature rules, reason codes
- [x] `urgency.ts` — 5 buckets, thresholds, uploadWindow for 3 platforms
- [x] `temperature.ts` — badge, icon, comparator
- [x] `normalize-phrase.ts` — lowercase, &→and, strip special chars, collapse spaces
- [x] `dedupe-candidates.ts` — group by normalized, merge sources
- [x] `restricted-terms.ts` — BLOCKED_TERMS, HIGH_RISK_CATEGORIES, checkPhrase
- [x] `ip-safety.ts` — scanIpSafety → IpSafetyCheck
- [x] `niches.ts` — 80+ niches, all 13 categories, 4 helpers
- [x] `index.ts` — full barrel export, stub replaced
- [x] Tests — normalize-phrase, urgency, calculate-trend-score

**Missing from spec that's been added:**
- `TrendCandidateFamily` type (needed by dedupe-candidates)
- `ScoreInput` interface (needed by calculate-trend-score)
- `PhraseCheckResult` interface (needed by restricted-terms / ip-safety)
- `urgencyToTimingScore()` helper (bridges urgency → scoring formula)
- `getNichesByCategory()` helper (natural extension, zero overhead)
- Package setup files (package.json, tsconfig, vitest config)
