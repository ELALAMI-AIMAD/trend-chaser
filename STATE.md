# Trend Chaser - Project State & Architecture

## 1. Tech Stack
- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide React.
- **Auth:** Clerk (`@clerk/nextjs` v7) with sign-in/sign-up pages, `<Show>` guards, and `<UserButton>`.
- **Backend:** Convex v1.38 with typed queries/mutations and Clerk auth via `convex/auth.config.ts`.
- **Validation:** Zod v4 for API input/output schemas.
- **Packages:** `@trend-chaser/core`, `@trend-chaser/ai`, `@trend-chaser/collectors`, `@trend-chaser/jobs`, plus `packages/database` stub.
- **Hosting target:** Vercel + Convex cloud.

---

## 2. Modules Complétés

### App + UI
- Dark responsive dashboard shell: `Sidebar`, `MobileNav`, active `NavList`, `TopBar`, Clerk auth controls, and shadcn/ui primitives (`drawer`, `dialog`, `table`, `tooltip`, `select`, `tabs`, `button`).
- Dashboard routes: `/`, `/trends`, `/trends/[trendId]`, `/calendar`, `/prompts`, `/watchlist`, `/scan-runs`, `/settings`.
- Trend/calendar components: `TrendCard`, `TrendTable`, `TrendDetailDrawer`, `ScoreBreakdown`, `PlatformComparison`, `PromptList`, `SafetyBadge`, `CalendarMonth`, `CalendarEventCard`, `UrgencyBadge`.
- API routes: trends, trend detail, calendar, exports, health, and `POST /api/cron/daily-scan` (live — calls `runDailyScan`, auth-guarded by `CRON_SECRET`). `GET` handler added so Vercel Cron (which sends GET) also works.
- `apps/web/vercel.json` created: cron at `/api/cron/daily-scan` on schedule `0 9 * * *` (09:00 UTC daily).
- `@trend-chaser/jobs` (+ peer deps core/ai/collectors) added to `apps/web/package.json`. **0 type errors across all files.**

### Convex
- Schema: `trendSignals` (seed/watchlist compat), `trends` (pipeline-native), `calendarEvents` (pipeline schema), `platformSnapshots`, `scanRuns` (pipeline schema), `watchlist`.
- `convex/trends.ts`: `getTrends/getTrendById/upsertTrend/updateTrendEnrichment` against `trends` table; legacy `list/getById/upsert` against `trendSignals` kept for UI backward compat.
- `convex/scanRuns.ts`: `listScanRuns` (ordered by `by_started_at` desc), `createScanRun`, `updateScanRun` — replaces old `latest`/`record`.
- `convex/calendar.ts`: updated to new pipeline field names (`name`, `date`, `region`, `category`, `daysUntilEvent`, `uploadWindows`).
- `convex/seed.ts`: updated to match new `calendarEvents` + `scanRuns` schemas.
- `/scan-runs` page: updated to `api.scanRuns.listScanRuns` / `api.scanRuns.createScanRun`; new status map handles `running | succeeded | failed | partial`; displays `candidateCount` + `enrichedCount`.

### Packages
- `@trend-chaser/core`: scoring, urgency/upload windows, temperature helpers, normalization/dedupe, IP safety, restricted terms, 80-niche taxonomy. **38 tests pass, typecheck pass.**
- `@trend-chaser/ai`: Anthropic client, prompt builders, Zod schemas, enrichment/calendar generation with cache/retry/JSON repair, quality gates, runtime `AiErrorCode` export. **11 tests pass, typecheck pass.**
- `@trend-chaser/collectors`: Reddit/Etsy clients and collectors, Amazon stub/real-mode adapter, 2026 calendar collector, shared `SEED_QUERIES`, collector registry. **75 tests pass, typecheck pass.**
- `@trend-chaser/jobs`: fully implemented — scan run types, `retry-policy.ts` (`isRetryable`, `withRetry`), `dead-letter.ts` (in-memory store: `addFailedJob`, `getFailedJobs`, `getDeadLetterStats`, `retryFailedJobs`, `clearFailedJobs`; Convex replacement TODO), `scan-orchestrator.ts` (`runDailyScan` — collect → normalize/dedupe → score → safety filter → AI enrichment → calendar enrichment → dead-letter on failure), `index.ts` (full package entrypoint). Root `vitest.workspace.ts` added. **53 tests pass, typecheck pass.**
- `packages/database`: placeholder/stub only.

---

## 3. Database Schema (Convex tables)

```txt
trendSignals  (legacy — seed data + watchlist compat)
  fields: externalId, phrase, niche, temperature, score, momentum,
          competition, uploadWindow, action, source, platforms[],
          createdAt, updatedAt
  indexes: by_external_id, by_temperature, by_score

trends  (pipeline-native)
  fields: canonicalPhrase, normalizedPhrase, niche, subcategory?,
          status, score?{total,temperature,demand,competition,velocity,
          timing,platformFit,ipSafety,confidence}, aiEnrichment?,
          safetyVerdict?, sources, firstSeenAt, lastSeenAt
  indexes: by_temperature (score.temperature), by_normalized_phrase

calendarEvents  (pipeline schema)
  fields: name, date, region, category, daysUntilEvent, urgency,
          uploadWindows, designPrompts?[], subNiches?
  indexes: by_urgency, by_date

platformSnapshots
  fields: platform, signal, competition, action, score, updatedAt
  index:  by_platform

scanRuns  (pipeline schema)
  fields: status, trigger, startedAt, finishedAt?, candidateCount,
          enrichedCount, errorCount, durationMs?, metadata
  indexes: by_status, by_started_at

watchlist  (unchanged)
  fields: userId, phrase, niche, temperature, score, platforms[],
          notes?, trendExternalId?, addedAt
  indexes: by_user, by_user_phrase
```

Enum validators (validators.ts — unchanged):
- `platform`: `Amazon | Etsy | Redbubble`
- `temperature`: `hot | warm | cold`
- `trendAction`: `Test | Watch | Skip`

Pipeline status values (string, not enum):
- scan run status: `running | succeeded | failed | partial`
- calendar urgency: free string (pipeline-produced)

---

## 4. Backlog / Prochaines Étapes

### Immediate
- [x] `apps/web` typecheck: **0 errors**. All prior type issues resolved.
- [x] `POST /api/cron/daily-scan` wired to `runDailyScan` from `@trend-chaser/jobs`. `GET` handler added for Vercel Cron compatibility.
- [x] `vercel.json` created: cron schedule `0 9 * * *`.
- [ ] Set `CRON_SECRET` env var in Vercel project settings + add to `.env.example`.
- [ ] Wire `TopBar` "Run scan" button to `POST /api/cron/daily-scan`.
- [ ] Persist `/settings` values with Convex user preferences.
- [ ] Add "Add to watchlist" actions to `TrendCard` and `/trends/[trendId]`.
- [ ] Add custom `app/not-found.tsx` and loading skeletons for Convex-backed pages.

### Pipeline
- [x] `packages/jobs` fully wired: `@trend-chaser/jobs` in `apps/web/package.json`; `runDailyScan` called from cron route.
- [x] Convex schema updated: `trends` table added; `scanRuns` + `calendarEvents` replaced with pipeline schemas; `convex/seed.ts` updated to match.
- [ ] Persist pipeline write-back: after `runDailyScan`, upsert results into `trends` + `scanRuns` via `api.trends.upsertTrend` + `api.scanRuns.createScanRun`.
- [ ] Seed Convex from the full `lib/seed-data.ts` dataset.
- [ ] Replace remaining seed-only views (`/`, `/calendar`, `/prompts`, trend detail) with Convex-backed queries against the new `trends` + `calendarEvents` tables.

### Product
- [ ] Wire `TopBar` search into global trend filtering.
- [ ] Add CSV/Markdown export buttons to trends and calendar pages.
- [ ] Replace remaining seed-only views (`/`, `/calendar`, `/prompts`, trend detail) with Convex-backed queries.
- [ ] Add trend history, score deltas, saved alerts, and production monitoring.
