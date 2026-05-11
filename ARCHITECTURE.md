# Architecture

## Current Architecture

The current project is a static report. The codebase contains only the rendered output, not the generator that created it.

```mermaid
flowchart TD
  A[Unknown external scanner/generator] --> B[Static HTML report]
  B --> C[Inline CSS]
  B --> D[Inline HTML data]
  B --> E[Embedded base64 PNG assets]
  B --> F[Inline vanilla JS helpers]
  B --> G[Surge static hosting]
  G --> H[Seller browser]
  H --> I[Amazon search links]
  H --> J[Etsy search links]
  H --> K[Reddit source links]
  H --> L[Google Search source links]
  H --> M[Redbubble search links]
```

## Current Data Flow

```mermaid
flowchart LR
  S1[Reddit/Google/Redbubble/Amazon/Etsy signals] --> G[Missing generator]
  S2[Holiday/calendar data] --> G
  S3[Prompt/style assets] --> G
  G --> R[Pre-rendered report file]
  R --> U[User opens static page]
  U --> X[Manual external validation]
  U --> C[Copy prompt/phrase/keywords]
```

What is observable in the source:

- The final report contains hard-coded cards.
- The report does not fetch data at runtime.
- Every score, label, prompt, and URL is already baked into the HTML.
- User interactions only change CSS classes or copy text to the clipboard.

## Current Runtime Components

| Component | Current implementation | Responsibility |
|---|---|---|
| Report shell | Static HTML | Header, metrics, calendar, trend grid, footer |
| Styling | Inline CSS | Dark theme, grid layout, cards, badges, collapsible sections |
| Calendar data | Hard-coded HTML | 30 upcoming POD opportunities |
| Trend data | Hard-coded HTML | 18 trend cards with scores and prompts |
| Images | Base64 PNG data URIs | Logo and visual style references |
| Interactions | Inline JS | Expand/collapse and clipboard copy |
| Hosting | Surge | Static report delivery |

## Recommended Rebuild Architecture

The rebuild should be a real full-stack SaaS with persistent data, scheduled collection, AI enrichment, and a dashboard.

```mermaid
flowchart TD
  subgraph Sources
    R[Reddit API]
    G[Google Trends API alpha / manual export fallback]
    P[Pinterest Trends API]
    T[TikTok Research or Commercial Content API]
    A[Amazon Creators API / compliant search metadata]
    E[Etsy Open API v3]
    RB[Redbubble affiliate/search metadata]
    C[Holiday and event calendars]
    TM[Trademark/IP data]
  end

  subgraph Pipeline
    SCH[Vercel Cron or Supabase Cron]
    ORCH[Scan orchestrator]
    COL[Source collectors]
    NORM[Normalizer and deduper]
    SCORE[Trend scoring engine]
    IP[IP safety scanner]
    AI[Claude enrichment service]
    QUEUE[Retry queue / dead-letter queue]
  end

  subgraph Data
    DB[(Postgres)]
    REDIS[(Redis cache)]
    OBJ[(Object storage)]
  end

  subgraph App
    API[Next.js route handlers / API layer]
    WEB[React dashboard]
    AUTH[Auth and billing]
    EXPORT[CSV/Notion/Sheets export]
    ALERTS[Email/Slack alerts]
  end

  R --> COL
  G --> COL
  P --> COL
  T --> COL
  A --> COL
  E --> COL
  RB --> COL
  C --> COL
  TM --> IP

  SCH --> ORCH
  ORCH --> COL
  COL --> NORM
  NORM --> SCORE
  SCORE --> IP
  IP --> AI
  AI --> DB
  NORM --> DB
  SCORE --> DB
  COL --> REDIS
  AI --> OBJ
  ORCH --> QUEUE
  QUEUE --> ORCH

  DB --> API
  REDIS --> API
  OBJ --> API
  API --> WEB
  API --> EXPORT
  API --> ALERTS
  AUTH --> API
```

## Recommended Data Flow

```mermaid
sequenceDiagram
  participant Cron as Daily Scheduler
  participant Scan as Scan Orchestrator
  participant Sources as Source Collectors
  participant DB as Postgres
  participant Score as Scoring Engine
  participant IP as IP Safety
  participant Claude as Claude API
  participant UI as Dashboard

  Cron->>Scan: Start daily scan
  Scan->>Sources: Collect source batches
  Sources->>DB: Save raw source events
  Scan->>Score: Normalize, dedupe, score candidates
  Score->>DB: Save trend scores and platform metrics
  Score->>IP: Check trademarks, brands, celebrity names, restricted topics
  IP->>DB: Save safety verdict
  Score->>Claude: Generate design prompts, angles, listing copy
  Claude->>DB: Save AI enrichments
  UI->>DB: Query latest trends, calendar, scores
  UI-->>UI: Render dashboard, filters, calendar, detail drawer
```

## Main Domain Objects

- `trend_candidate`: One detected phrase, topic, event, or niche idea.
- `source_event`: Raw observation from Reddit, Google Trends, Pinterest, TikTok, Etsy, Amazon, Redbubble, or a calendar.
- `platform_metric`: Demand and competition evidence for a platform.
- `trend_score`: Normalized hot/warm/cold score with component scores.
- `ai_enrichment`: Design prompts, listing keywords, angles, warnings, and summaries.
- `calendar_event`: Upcoming holiday or event with upload windows and sub-niches.
- `ip_safety_check`: Trademark, brand, celebrity, policy, and restricted-topic signals.
- `scan_run`: One scheduled scan execution with status, timing, and error logs.

## Architecture Principles For The Rebuild

- Store raw source events before interpretation.
- Treat scores as reproducible calculations, not static text.
- Make each collector isolated so one source failure does not break the scan.
- Prefer official APIs and partner programs over scraping.
- Use queues and retry state for long scans.
- Cache expensive external results.
- Put IP safety before AI prompt generation.
- Keep dashboard reads fast with precomputed score snapshots.
- Preserve every prompt and score version for auditability.

