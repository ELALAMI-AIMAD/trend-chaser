# Tech Stack

## Recommended Stack

### Frontend

Use:

- Next.js with App Router.
- React and TypeScript.
- Tailwind CSS for tokens and layout.
- shadcn/ui or Radix UI primitives for accessible components.
- Framer Motion for restrained dashboard animations.
- TanStack Table for dense trend tables.
- Recharts or Tremor charts for score history.

Why:

- The product needs a fast dashboard, server-rendered routes, API routes, and scheduled endpoints.
- TypeScript makes scoring and source schemas safer.
- Tailwind and component primitives make it easy to build a premium dark dashboard without one-off CSS.

Alternatives considered:

- Remix: excellent full-stack framework, but Next.js has stronger Vercel Cron alignment.
- SvelteKit: fast and elegant, but React ecosystem is richer for dashboard components.
- Plain Vite React: simple, but would require a separate backend and scheduler.

### Backend/API

Use:

- Next.js Route Handlers for app-facing APIs.
- A dedicated worker package for collectors and scoring.
- Zod for request/response validation.
- OpenAPI documentation generated from route schemas.

Why:

- Keeps the product deployable on Vercel while still allowing isolated worker logic.
- Zod protects the pipeline from malformed external data.

Alternative:

- NestJS or Fastify service on Railway/Render for heavier background jobs. Use this if scans become too long for serverless execution.

### Database

Use:

- Postgres, hosted by Supabase.
- Drizzle ORM or Prisma.
- pgvector for semantic duplicate detection and similarity search.
- Row-level security if multi-tenant user data is stored in Supabase.

Why:

- Trend data is relational and time-series-like.
- Postgres handles structured source events, scores, users, and history cleanly.
- Supabase gives a hosted Postgres path plus Cron and Edge Functions if needed.

Alternatives:

- Neon Postgres: excellent serverless Postgres, but Supabase Cron and auth are useful for this product.
- MongoDB: flexible, but weaker for relational scoring history and SQL analytics.

### Queue And Cache

Use:

- Upstash Redis for lightweight caching and rate-limit state.
- Inngest, Trigger.dev, or a Postgres-backed job table for reliable multi-step scans.
- BullMQ only if deploying a persistent Node worker on a VPS/Render/Railway.

Why:

- External APIs have rate limits and intermittent failures.
- The pipeline should retry per source without rerunning the entire scan.

### Scheduler

Use one of:

- Vercel Cron for daily HTTP-triggered scans.
- Supabase Cron if the scan is mostly database/Edge Function based.
- GitHub Actions schedule for a low-cost MVP.
- VPS cron plus systemd for maximum control.

Recommended MVP:

- Vercel Cron triggers `/api/cron/daily-scan`.
- The route enqueues work and returns quickly.
- Workers process collectors and scoring.

### AI

Use:

- Claude API via Anthropic Messages API.
- JSON-only outputs validated by Zod.
- Message Batches API for high-volume nightly prompt generation.
- Token Counting API for cost prediction.

Why:

- Claude is strong at structured analysis, ideation, and safe language transformations.
- The API supports structured message requests and large asynchronous batches.

Official reference:

- Claude API overview: https://platform.claude.com/docs/en/api/overview
- Create Message endpoint: https://platform.claude.com/docs/en/api/messages/create

### External Data APIs

Use:

- Google Trends API alpha where access is granted.
- Pinterest Trends API for enterprise/partner trend ingestion.
- Etsy Open API v3 for Etsy data where endpoints and terms permit.
- Amazon Creators API for Amazon product/catalog data.
- Reddit API for subreddit trend discovery.
- TikTok Research/Commercial Content APIs only where eligible.
- Redbubble affiliate/search workflows where permitted.

Official references:

- Google Trends API alpha: https://developers.google.com/search/apis/trends
- Pinterest Trends API: https://developers.pinterest.com/docs/analytics-and-reports/trends/
- Etsy Open API v3: https://developers.etsy.com/documentation/
- Amazon Creators API: https://affiliate-program.amazon.com/creatorsapi
- Reddit API: https://www.reddit.com/dev/api/

### Hosting

Recommended:

- Vercel for the Next.js app and Cron.
- Supabase for Postgres, auth, storage, and optional Cron.
- Upstash for Redis.
- Sentry for application errors.
- Better Stack, Axiom, or Logtail for structured logs.

Alternatives:

- Netlify: fine for frontend, weaker fit for long scans.
- Render/Railway: good if using a persistent worker service.
- VPS: maximum control, more DevOps burden.

## Why This Stack Is Better Than The Current Source

The current source is a static HTML report. The recommended stack enables:

- Real daily automation.
- Persistent history.
- User accounts and saved niches.
- Structured scoring.
- Platform integrations.
- AI generation with validation.
- Scalable dashboard UI.
- Monitoring and retries.

## Package Choices

Recommended package set:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "@supabase/supabase-js": "latest",
    "drizzle-orm": "latest",
    "zod": "latest",
    "next": "latest",
    "react": "latest",
    "tailwindcss": "latest",
    "framer-motion": "latest",
    "@tanstack/react-table": "latest",
    "recharts": "latest",
    "date-fns": "latest",
    "ical-generator": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "vitest": "latest",
    "playwright": "latest",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

Pin exact versions during implementation after checking compatibility.

## Testing Stack

Use:

- Vitest for scoring and collector unit tests.
- Playwright for dashboard smoke tests.
- MSW for API mocking.
- Zod schema tests for AI responses.
- Snapshot tests for generated listing packs.

Critical tests:

- Score formula boundary tests.
- Urgency bucket tests.
- IP safety blocking tests.
- Source deduplication tests.
- Claude JSON validation tests.
- Cron authentication tests.

