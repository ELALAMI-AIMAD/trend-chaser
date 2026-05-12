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
- Dark responsive dashboard shell: `Sidebar`, `MobileNav`, active `NavList`, `TopBar`, Clerk auth controls, and shadcn/ui primitives (`drawer`, `dialog`, `table`, `tooltip`, `select`, `tabs`, `button`, `command`, `popover`, `sonner`).
- Dashboard routes: `/`, `/trends`, `/trends/[trendId]`, `/calendar`, `/prompts`, `/watchlist`, `/scan-runs`, `/settings`.
- Trend/calendar components: `TrendCard`, `TrendTable`, `TrendDetailDrawer`, `ScoreBreakdown`, `PlatformComparison`, `PromptList`, `SafetyBadge`, `CalendarMonth`, `CalendarEventCard`, `UrgencyBadge`.
- API routes: trends, trend detail, calendar, exports, health, and `POST /api/cron/daily-scan` (live — calls `runDailyScan`, auth-guarded by `CRON_SECRET`). `GET` handler added so Vercel Cron (which sends GET) also works.
- `apps/web/vercel.json` created: cron at `/api/cron/daily-scan` on schedule `0 9 * * *` (09:00 UTC daily).
- **Vercel build passing** (0 type errors, absolute URLs, Convex client placeholder, `not-found.tsx`, all dashboard pages force-dynamic).

### Interactive Top-Bar Features (new)
- **Smart Search with AI** (`components/app-shell/search-dropdown.tsx`, `lib/search.ts`, `app/api/search/route.ts`): debounced (300ms) async search hitting `/api/search`; local seed data searched first (3-tier relevance scoring); if local results < 3 **or** user presses Enter, Claude is called and returns up to 5 AI-discovered POD niche opportunities. Dropdown shows three grouped sections: "From your trends" / "Calendar events" / "AI Discovered". AI results expand inline (whyNow, targetBuyer, per-platform competition level, designPrompt, Copy Prompt + Copy Phrase buttons); only one expanded at a time. AbortController cancels in-flight requests on fast typing. `force=true` query param bypasses local threshold on Enter. Claude response validated with Zod before reaching the client.
- **Notification bell** (`components/app-shell/notifications-popover.tsx`): shadcn Popover with 5 seed notifications (hot-trend / upload-window / scan-complete types); unread count badge on bell icon; mark-as-read on click; mark-all-read button; click navigates to relevant route.
- **Run Scan button** (`components/app-shell/run-scan-button.tsx`): POSTs to `/api/cron/daily-scan` with `Authorization: Bearer NEXT_PUBLIC_CRON_SECRET` + `Content-Type: application/json`; loading spinner + disabled state; toasts "✅ Scan complete!" on success and "❌ Scan failed — check console" on error; dispatches `scan:complete` event + writes `lastScan` to `localStorage`. **Bug fixed:** Clerk middleware was issuing a 307 redirect to the Clerk sign-in domain before the route handler ran — the cross-origin redirect caused `TypeError: Failed to fetch` (CORS). Fixed by adding `/api/cron(.*)` to `isPublicRoute` in `proxy.ts`; the route itself still validates `CRON_SECRET`. Also added `NEXT_PUBLIC_CRON_SECRET` to `.env.local`.
- **Live "Last scan" badge** (`components/app-shell/scan-badge.tsx`): client component in sidebar footer; reads `lastScan` from `localStorage` on mount and updates reactively via `scan:complete` event — no page reload needed.
- `app/layout.tsx`: `<html className="dark">` added (activates shadcn dark CSS vars); `<Toaster theme="dark" position="bottom-right" />` from sonner registered globally.
- `lib/seed-data.ts`: `AppNotification` type + `seedNotifications` array (5 items) added.

### Convex
- Schema: `trendSignals` (seed/watchlist compat), `trends` (pipeline-native), `calendarEvents` (pipeline schema), `platformSnapshots`, `scanRuns` (pipeline schema), `watchlist`.
- `convex/trends.ts`: `getTrends/getTrendById/upsertTrend/updateTrendEnrichment` against `trends` table; legacy `list/getById/upsert` against `trendSignals` kept for UI backward compat.
- `convex/scanRuns.ts`: `listScanRuns` (ordered by `by_started_at` desc), `createScanRun`, `updateScanRun`.
- `convex/calendar.ts`: updated to new pipeline field names.
- `convex/seed.ts`: updated to match new `calendarEvents` + `scanRuns` schemas.
- `/scan-runs` page: updated to `api.scanRuns.listScanRuns` / `api.scanRuns.createScanRun`.

### Packages
- `@trend-chaser/core`: scoring, urgency/upload windows, temperature helpers, normalization/dedupe, IP safety, restricted terms, 80-niche taxonomy. **38 tests pass, typecheck pass.**
- `@trend-chaser/ai`: Anthropic client, prompt builders, Zod schemas, enrichment/calendar generation with cache/retry/JSON repair, quality gates, runtime `AiErrorCode` export. **11 tests pass, typecheck pass.**
- `@trend-chaser/collectors`: Reddit/Etsy clients and collectors, Amazon stub/real-mode adapter, 2026 calendar collector, shared `SEED_QUERIES`, collector registry. **75 tests pass, typecheck pass.**
- `@trend-chaser/jobs`: fully implemented — `retry-policy.ts`, `dead-letter.ts`, `scan-orchestrator.ts` (`runDailyScan`), `index.ts`. **53 tests pass, typecheck pass.**
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
- [x] Search bar wired: `SearchDropdown` + `lib/search.ts` — live client-side search across trends + calendar.
- [x] Notification bell: `NotificationsPopover` with 5 seed notifications, unread badge, mark-as-read.
- [x] Run Scan button: POSTs to `/api/cron/daily-scan`, loading state, sonner toast, sidebar timestamp update. **Fixed "Failed to fetch"** — Clerk middleware bypass + `NEXT_PUBLIC_CRON_SECRET` added to `.env.local`.
- [x] Sonner toast registered globally in `app/layout.tsx`.
- [x] **Smart Search with AI**: `/api/search` route + Claude fallback; AI results expand inline with copy buttons; Enter forces AI search regardless of local result count.
- [ ] Set `CRON_SECRET` + `NEXT_PUBLIC_CRON_SECRET` + `NEXT_PUBLIC_CONVEX_URL` + `NEXT_PUBLIC_APP_URL` + `ANTHROPIC_API_KEY` + `CLAUDE_MODEL` env vars in Vercel project settings; add all to `.env.example`. *(All set in `.env.local` for dev.)*
- [ ] Investigate `runDailyScan` enrichment errors (73 errors, 0 enriched on last run) — likely Claude API call format or model string mismatch inside `@trend-chaser/ai`.
- [ ] Persist `/settings` values with Convex user preferences.
- [ ] Add "Add to watchlist" actions to `TrendCard` and `/trends/[trendId]`.
- [ ] Add loading skeletons for Convex-backed pages.

### Pipeline
- [ ] Persist pipeline write-back: after `runDailyScan`, upsert results into `trends` + `scanRuns` via `api.trends.upsertTrend` + `api.scanRuns.createScanRun`.
- [ ] Seed Convex from the full `lib/seed-data.ts` dataset.
- [ ] Replace remaining seed-only views (`/`, `/calendar`, `/prompts`, trend detail) with Convex-backed queries against the new `trends` + `calendarEvents` tables.
- [ ] Replace `seedNotifications` with real Convex-backed notification query once pipeline write-back is live.
- [ ] Replace local seed search in `/api/search` with Convex full-text search once `trends` + `calendarEvents` are populated (Claude AI fallback stays).

### Product
- [ ] Add CSV/Markdown export buttons to trends and calendar pages.
- [ ] Add trend history, score deltas, saved alerts, and production monitoring.
- [ ] Optionally cache AI search results in Convex to avoid repeat Claude calls for the same keyword.
