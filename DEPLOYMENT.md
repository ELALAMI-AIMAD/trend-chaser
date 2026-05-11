# Deployment

## Recommended Production Deployment

Use:

- Vercel for the Next.js app and Cron trigger.
- Supabase for Postgres, auth, storage, and optional Cron backup.
- Upstash Redis for cache and rate-limit state.
- Sentry for error monitoring.
- GitHub Actions for CI.

This setup keeps operational overhead low while supporting the daily automation required for Trend Chaser.

## Hosting Options

### Vercel

Best for:

- Next.js App Router.
- Serverless API routes.
- Static and dynamic dashboard pages.
- Vercel Cron.

Pros:

- Simple deployment.
- Good Next.js support.
- Native cron support.
- Easy preview deployments.

Cons:

- Long-running scans should be queued, not executed entirely inside one request.
- Serverless duration limits may require worker architecture.

### Netlify

Best for:

- Static frontend plus lightweight functions.

Pros:

- Easy static hosting.
- Good preview deploys.

Cons:

- Less ideal for a scan-heavy backend.

### Render or Railway

Best for:

- Persistent Node worker.
- API service plus queue workers.
- Longer-running scan jobs.

Pros:

- Background workers are straightforward.
- Easier BullMQ/Redis worker setup.

Cons:

- More infrastructure management than Vercel.

### VPS

Best for:

- Maximum control.
- Native cron.
- Persistent workers.
- Playwright collectors if permitted.

Pros:

- Cheapest at scale.
- Full control over job duration and networking.

Cons:

- Requires server hardening, backups, deployments, process supervision, and monitoring.

## Environment Variables

Create `.env.example`:

```bash
# App
NEXT_PUBLIC_APP_URL=https://trendchaser.example.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/trend_chaser
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/trend_chaser

# Auth
AUTH_SECRET=replace-with-strong-random-secret
NEXTAUTH_URL=https://trendchaser.example.com

# Cron
CRON_SECRET=replace-with-strong-random-secret

# AI
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-5

# Reddit
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=trend-chaser/1.0 by your_account

# Etsy
ETSY_API_KEY=
ETSY_SHARED_SECRET=
ETSY_REDIRECT_URI=

# Amazon
AMAZON_CREATORS_ACCESS_KEY=
AMAZON_CREATORS_SECRET_KEY=
AMAZON_ASSOCIATE_TAG=
AMAZON_MARKETPLACE=US

# Pinterest
PINTEREST_ACCESS_TOKEN=

# Google Trends
GOOGLE_TRENDS_API_KEY=
GOOGLE_TRENDS_PROJECT_ID=

# Redbubble
REDBUBBLE_AFFILIATE_ID=

# Cache / queue
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring
SENTRY_DSN=
LOG_DRAIN_TOKEN=

# Alerts
SLACK_WEBHOOK_URL=
ALERT_EMAIL_FROM=
ALERT_EMAIL_TO=
RESEND_API_KEY=
```

## Vercel Deployment Steps

1. Push the monorepo to GitHub.
2. Create a Vercel project from `apps/web`.
3. Set the build command:

```bash
pnpm turbo build --filter=web
```

4. Set the install command:

```bash
pnpm install --frozen-lockfile
```

5. Add all production environment variables.
6. Configure `vercel.json` cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-scan",
      "schedule": "0 9 * * *"
    }
  ]
}
```

7. Deploy.
8. Manually call the cron endpoint with `Authorization: Bearer $CRON_SECRET` to verify.
9. Check `scan_runs` after first production scan.

## Database Deployment

Use migrations:

```bash
pnpm db:migrate
pnpm db:seed
```

Recommended migration flow:

1. Apply migrations to staging.
2. Run seed/import tests.
3. Run Playwright smoke tests.
4. Apply migrations to production.
5. Deploy app.

## CI Pipeline

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

## CD Pipeline

Use Vercel Git integration for deployment after CI passes. Protect `main` with:

- Required PR review.
- Required CI.
- No direct pushes.
- Environment variable access restricted to production maintainers.

## Production Monitoring

Track:

- App errors.
- API route latency.
- Cron execution status.
- Scan duration.
- External source failure rate.
- Claude API spend.
- Database query latency.
- Number of hot/warm/cold trends generated.

Recommended alerts:

- Daily scan failed.
- No scan in last 26 hours.
- More than 30 percent source failure.
- Claude API invalid JSON rate above 10 percent.
- Database storage above 80 percent.
- Error rate above 1 percent.

## Backup And Recovery

Supabase/Postgres:

- Enable daily backups.
- Test restore monthly.
- Export critical tables weekly to object storage.

Critical tables:

- `trend_candidates`
- `source_events`
- `trend_scores`
- `calendar_events`
- `ai_enrichments`
- `ip_safety_checks`
- `scan_runs`

## Security Checklist

- `CRON_SECRET` required for cron endpoint.
- API keys stored only in environment variables.
- No secrets in client bundle.
- User data scoped by tenant/user ID.
- Rate-limit expensive endpoints.
- Log external errors without logging secrets.
- Validate all AI JSON before saving.
- Escape/render user-supplied text safely.
- Use `rel="noopener noreferrer"` for external links.

## Launch Checklist

Before production launch:

- Database migrated.
- Seed data imported.
- Daily scan succeeds in staging.
- Cron endpoint secured.
- Claude enrichments validated.
- IP safety gates active.
- Amazon, Etsy, and Redbubble platform slots visible.
- Google Trends integration or fallback configured.
- Error monitoring active.
- Backups enabled.
- Mobile dashboard checked.
- Export features tested.

