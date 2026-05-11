# File Structure

## Recommended Monorepo

```text
trend-chaser/
  apps/
    web/
      app/
        (dashboard)/
          dashboard/
            page.tsx
          trends/
            page.tsx
            [trendId]/
              page.tsx
          calendar/
            page.tsx
          watchlist/
            page.tsx
          prompts/
            page.tsx
          scan-runs/
            page.tsx
          settings/
            page.tsx
        api/
          cron/
            daily-scan/
              route.ts
          trends/
            route.ts
            [trendId]/
              route.ts
          calendar/
            route.ts
          exports/
            route.ts
        layout.tsx
        page.tsx
      components/
        app-shell/
          sidebar.tsx
          top-bar.tsx
          mobile-nav.tsx
        calendar/
          calendar-month.tsx
          calendar-event-card.tsx
          urgency-badge.tsx
        trends/
          trend-card.tsx
          trend-table.tsx
          trend-detail-drawer.tsx
          score-breakdown.tsx
          platform-comparison.tsx
          safety-badge.tsx
          prompt-list.tsx
        ui/
          button.tsx
          badge.tsx
          drawer.tsx
          dialog.tsx
          input.tsx
          select.tsx
          tabs.tsx
          tooltip.tsx
      lib/
        api-client.ts
        format.ts
        routes.ts
      styles/
        globals.css
      tests/
        dashboard.spec.ts
      package.json

  packages/
    database/
      src/
        schema.ts
        client.ts
        migrations/
        seed/
          seed-current-report.ts
      package.json
    core/
      src/
        scoring/
          calculate-trend-score.ts
          urgency.ts
          temperature.ts
          scoring.types.ts
        normalization/
          normalize-phrase.ts
          dedupe-candidates.ts
        safety/
          ip-safety.ts
          restricted-terms.ts
        taxonomy/
          niches.ts
          subcategories.ts
      tests/
        scoring.test.ts
        urgency.test.ts
        normalization.test.ts
      package.json
    collectors/
      src/
        collectors/
          reddit.collector.ts
          google-trends.collector.ts
          pinterest.collector.ts
          etsy.collector.ts
          amazon-creators.collector.ts
          redbubble.collector.ts
          calendar.collector.ts
        clients/
          reddit.client.ts
          etsy.client.ts
          amazon.client.ts
          pinterest.client.ts
        collector.types.ts
      tests/
        reddit.collector.test.ts
        calendar.collector.test.ts
      package.json
    ai/
      src/
        anthropic.client.ts
        prompts/
          trend-analysis.prompt.ts
          design-prompts.prompt.ts
          calendar-niches.prompt.ts
        schemas/
          ai-trend-enrichment.schema.ts
          ai-score.schema.ts
        generate-trend-enrichment.ts
        generate-calendar-niches.ts
      tests/
        ai-schema.test.ts
      package.json
    jobs/
      src/
        daily-scan.job.ts
        scan-orchestrator.ts
        retry-policy.ts
        dead-letter.ts
      package.json

  docs/
    PROJECT_OVERVIEW.md
    ARCHITECTURE.md
    CURRENT_FEATURES.md
    IMPROVEMENTS.md
    TECH_STACK.md
    DATA_SOURCES.md
    AUTOMATION_PIPELINE.md
    AI_INTEGRATION.md
    UI_DESIGN_SYSTEM.md
    BUILD_ROADMAP.md
    FILE_STRUCTURE.md
    DEPLOYMENT.md

  .github/
    workflows/
      ci.yml
      deploy.yml

  package.json
  pnpm-workspace.yaml
  turbo.json
  README.md
  .env.example
```

## What Goes In Each Area

### `apps/web`

The customer-facing dashboard and API routes.

Responsibilities:

- Render dashboard pages.
- Authenticate users.
- Query trend/calendar APIs.
- Serve cron trigger endpoint.
- Provide export endpoints.
- Own UI components and app-specific state.

### `packages/database`

Database schema, migrations, and seed scripts.

Responsibilities:

- Define tables.
- Create typed DB client.
- Run migrations.
- Seed current report data.
- Store query helpers shared by app and jobs.

### `packages/core`

Pure business logic.

Responsibilities:

- Scoring formulas.
- Urgency calculations.
- Phrase normalization.
- Candidate deduplication.
- Taxonomy.
- IP safety rules.

Rule:

No network calls and no database writes in `core`. This keeps tests fast.

### `packages/collectors`

External data integrations.

Responsibilities:

- API clients.
- Source collectors.
- Rate-limit handling.
- Response normalization to `SourceEventInput`.

Each collector should return the same shape:

```ts
export type SourceEventInput = {
  source: string;
  externalId: string;
  sourceUrl?: string;
  title: string;
  body?: string;
  observedAt: Date;
  metrics: Record<string, unknown>;
  raw: Record<string, unknown>;
};
```

### `packages/ai`

Claude integration and prompt templates.

Responsibilities:

- Anthropic client wrapper.
- Prompt templates.
- JSON output schemas.
- Validation and repair flow.
- Prompt versioning.

### `packages/jobs`

Long-running and scheduled workflows.

Responsibilities:

- Daily scan orchestration.
- Per-source execution.
- Retry policy.
- Dead-letter queue writes.
- Scan status updates.

## Naming Conventions

Files:

- React components: `kebab-case.tsx`.
- Utility files: `kebab-case.ts`.
- Types: `*.types.ts`.
- Schemas: `*.schema.ts`.
- Tests: `*.test.ts`.
- Playwright tests: `*.spec.ts`.

Database:

- Table names: plural snake_case, such as `trend_candidates`.
- Columns: snake_case in SQL, camelCase in TypeScript mapping if using an ORM.
- Enum values: lowercase snake_case.

Code:

- Source collectors: `<source>.collector.ts`.
- API clients: `<source>.client.ts`.
- Prompt templates: `<task>.prompt.ts`.
- Zod schemas: `<domain>.schema.ts`.

## Example Core Types

```ts
export type Platform = "amazon" | "etsy" | "redbubble";

export type TrendTemperature = "hot" | "warm" | "cold";

export type SafetyVerdict = "safe" | "review" | "blocked";

export type TrendCandidate = {
  id: string;
  canonicalPhrase: string;
  normalizedPhrase: string;
  niche: string;
  subcategory?: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type PlatformMetric = {
  platform: Platform;
  query: string;
  demandScore: number;
  competitionScore: number;
  velocityScore: number;
  evidence: Record<string, unknown>;
};
```

## Example Route Layout

| Route | Purpose |
|---|---|
| `/dashboard` | Daily summary and highest-priority opportunities |
| `/trends` | Filterable trend radar |
| `/trends/[trendId]` | Deep link to trend detail |
| `/calendar` | Niche calendar and upload windows |
| `/watchlist` | Saved user niches |
| `/prompts` | Saved/copied AI prompts |
| `/scan-runs` | Admin scan history |
| `/settings` | Account, integrations, alerts |
| `/api/cron/daily-scan` | Secure scheduled scan trigger |
| `/api/trends` | Trend list API |
| `/api/calendar` | Calendar event API |
| `/api/exports` | CSV/Markdown/ICS export API |

## Static Legacy Import

Keep the original static file only as a reference artifact:

```text
legacy/
  niche-please-trends-2026-05-08.html
```

Do not build new features by editing the old generated HTML.

