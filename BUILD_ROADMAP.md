# Build Roadmap

## Phase 1: Core Rebuild (Week 1)

Goal: Replace the static HTML report with a working database-backed dashboard.

### Day 1

- Create monorepo structure.
- Initialize Next.js, TypeScript, Tailwind, linting, formatting, and tests.
- Configure Supabase/Postgres local development.
- Add base app shell, dark theme tokens, sidebar, and top bar.

### Day 2

- Create database schema for scan runs, source events, trend candidates, platform metrics, scores, calendar events, AI enrichments, and safety checks.
- Add migrations.
- Seed the database with the 18 current trend cards and 30 calendar cards from the static report.

### Day 3

- Build dashboard data API routes.
- Build trend list/table.
- Build trend card component.
- Build hot/warm/cold badges and score display.

### Day 4

- Build trend detail drawer.
- Add source evidence section.
- Add platform comparison section for Amazon, Etsy, and Redbubble.
- Add copy buttons for phrase, keywords, and prompts.

### Day 5

- Build calendar list and month views.
- Add urgency calculation.
- Add upload window labels.
- Add calendar event detail drawer.

### Day 6

- Implement scoring engine v1.
- Add score formula tests.
- Add urgency bucket tests.
- Add seed-data scoring snapshots.

### Day 7

- Polish dashboard responsiveness.
- Add loading, empty, and error states.
- Run Playwright smoke tests.
- Deploy a staging build.

## Phase 2: Automation (Week 2)

Goal: Build a daily scan pipeline with reliable source collection and storage.

### Day 8

- Create scan orchestrator.
- Create job status model.
- Add `scan_runs` UI page.
- Add manual "Run scan" admin action.

### Day 9

- Implement Reddit collector using official API.
- Store raw source events.
- Add dedupe by external ID and normalized title.
- Add collector tests with mocked responses.

### Day 10

- Implement calendar collector for the next 12 months.
- Add upload window generation.
- Add sub-niche seed logic.
- Add calendar source/license fields.

### Day 11

- Implement Etsy Open API integration for permitted listing/search metadata.
- Store Etsy platform metrics.
- Add rate-limit and retry handling.

### Day 12

- Implement Amazon Creators API integration path.
- Add Amazon platform metric adapter.
- Add fallback manual search-link mode if credentials are unavailable.

### Day 13

- Add Redbubble platform model.
- Implement compliant search-link/manual validation workflow.
- Add affiliate/partner URL fields where approved.
- Add Redbubble dashboard comparison column.

### Day 14

- Configure Vercel Cron or Supabase Cron.
- Add `CRON_SECRET` protection.
- Add retry queue/dead-letter table.
- Add success/failure email or Slack alerts.

## Phase 3: AI Features (Week 3)

Goal: Add Claude-powered enrichment and safety-aware prompt generation.

### Day 15

- Add Anthropic SDK.
- Create AI service wrapper.
- Add prompt versioning.
- Add token/cost logging.

### Day 16

- Implement trend analysis prompt.
- Validate JSON with Zod.
- Store `ai_enrichments`.
- Add retry/repair flow for invalid JSON.

### Day 17

- Implement 5 design prompts per trend.
- Add phrase variations.
- Add listing keyword generation.
- Add prompt copy UI.

### Day 18

- Implement calendar event sub-niche generation.
- Generate buyer segments and platform-fit notes.
- Add calendar AI section.

### Day 19

- Build IP safety precheck.
- Add restricted term list.
- Add trademark/brand review workflow.
- Block AI generation for unsafe phrases.

### Day 20

- Add AI quality gates:
  - Awkward grammar rejection.
  - Duplicate phrase rejection.
  - Platform policy warnings.
  - Prompt safety scan.

### Day 21

- Add saved prompts page.
- Add export listing pack.
- Run end-to-end AI workflow tests using mocked Claude responses.

## Phase 4: Polish And Launch (Week 4)

Goal: Turn the product into a polished launch-ready SaaS.

### Day 22

- Add authentication.
- Add user profile.
- Add saved niches/watchlist tables.
- Scope user-specific saved data.

### Day 23

- Add filters:
  - Platform.
  - Temperature.
  - Safety.
  - Category.
  - Urgency.
  - Minimum score.

### Day 24

- Add trend history charts.
- Add score movement deltas.
- Add daily report snapshot page.
- Add previous scan selector.

### Day 25

- Add exports:
  - CSV.
  - Copy all prompts.
  - Listing pack markdown.
  - ICS calendar export.

### Day 26

- Add monitoring:
  - Sentry.
  - Structured logs.
  - Scan metrics dashboard.
  - API cost tracking.

### Day 27

- Performance polish:
  - Query indexes.
  - API caching.
  - Image optimization.
  - Bundle analysis.
  - Lighthouse pass.

### Day 28

- Production launch checklist.
- Security review.
- Source/API terms review.
- Backup/restore test.
- Launch deploy.
- Create first public daily report.

## Launch Criteria

The rebuild is launch-ready when:

- Daily scan runs automatically.
- At least 50 trend/niche opportunities are generated.
- Amazon, Etsy, and Redbubble appear in the platform comparison model.
- Google Trends integration or approved fallback is available.
- Claude prompts pass validation.
- Unsafe trends are blocked or marked for review.
- Dashboard works on mobile and desktop.
- Exports work.
- Errors are monitored.
- The product can be rebuilt from source without the old static HTML file.

