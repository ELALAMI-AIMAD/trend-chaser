# Data Sources

## Current Sources Visible In The Static Report

The current source file contains outbound links, not runtime integrations.

| Source | Current use | Count in file | Current access method |
|---|---:|---:|---|
| Amazon | Search links and competition labels | 144 links | Static search URLs |
| Etsy | Search links, usually unknown competition | 84 links | Static search URLs |
| Google Search | News/source validation links | 22 links | Static search URLs |
| Reddit | Viral source links | 12 links | Static source URLs |
| Redbubble | One source/search example | 2 links | Static search URLs |
| Surge | Hosted report link | 2 links | Static hosting |
| Embedded images | Logo and style references | 39 data URIs | Inline base64 PNG |
| Calendar/events | Upcoming seasonal opportunities | 30 cards | Hard-coded HTML |

There are no browser API calls. The current source does not contain credentials, collectors, API clients, or scraping scripts.

## New Sources To Add

### 1. Google Trends

Use case:

- Search interest velocity.
- Regional demand.
- Seasonality.
- Rising related queries.

Legal/current access:

- Prefer the official Google Trends API alpha. Google says the API enables programmatic access, supports a rolling five-year window, interval aggregation, and regions/sub-regions. Access is currently an alpha application process.
- If alpha access is not granted, use manual exports or user-provided CSV uploads. Avoid making unofficial scraping the primary production dependency.

Official reference:

- https://developers.google.com/search/apis/trends

Data to store:

- Term.
- Geo.
- Time range.
- Interest series.
- Related rising queries.
- Related top queries.
- Retrieved timestamp.

### 2. Pinterest Trends

Use case:

- Visual trend discovery.
- Shopping/search interest.
- Seasonal creative planning.

Legal/current access:

- Use Pinterest's Trends API where available. Pinterest documents a Trends API for agencies, enterprise clients, and partner platforms, with limits and scope constraints.

Official reference:

- https://developers.pinterest.com/docs/analytics-and-reports/trends/

Data to store:

- Keyword.
- Region.
- Trend rank.
- Category.
- Search/save/shopping signal if available.
- Related keywords.

### 3. TikTok

Use case:

- Viral phrase discovery.
- Short-form trend velocity.
- Creator/content pattern detection.

Legal/current access:

- TikTok's Research API is oriented toward approved academic researchers in supported regions.
- TikTok's Commercial Content Library/API is designed for transparency into ads and commercial content, with application requirements.
- For a commercial POD SaaS, do not scrape TikTok pages aggressively. Use approved APIs, user-provided trend exports, third-party licensed providers, or manual curated inputs.

Official reference:

- https://newsroom.tiktok.com/tiktoks-research-api-and-commercial-content-library?lang=en-GB

Data to store:

- Hashtag or phrase.
- Video count if available.
- Engagement summary if licensed.
- First seen.
- Velocity.
- Example URLs only if allowed.

### 4. Reddit

Use case:

- Early viral ideas.
- Community-specific phrases.
- Fast-moving novelty topics.

Legal/current access:

- Use Reddit's official API and respect OAuth, pagination, and rate limits.
- Reddit listing endpoints support subreddit `new`, `rising`, `top`, and search patterns with `limit` up to 100.

Official reference:

- https://www.reddit.com/dev/api/

Recommended subreddits:

- `r/interestingasfuck`
- `r/mildlyinteresting`
- `r/oddlysatisfying`
- `r/todayilearned`
- `r/funny`
- `r/pics`
- `r/popular`
- Niche-specific subreddits for hobbies and professions.

Data to store:

- Post ID.
- Subreddit.
- Title.
- URL.
- Score/upvote ratio.
- Comment count.
- Created timestamp.
- Permalink.
- Flair.
- Extracted phrases.

### 5. Etsy

Use case:

- Listing density.
- Price range.
- Bestseller-style market validation where available.
- Tag/title patterns.

Legal/current access:

- Use Etsy Open API v3. Etsy states it is a REST API for shop/customer integrations and app developers register an app to receive a keystring and shared secret.
- Follow Etsy API Terms.

Official references:

- https://developers.etsy.com/documentation/
- https://www.etsy.com/legal/api/

Data to store:

- Query.
- Listing count.
- Top listing IDs.
- Titles.
- Prices.
- Tags.
- Shop IDs.
- Review signals if permitted.
- Retrieved timestamp.

### 6. Amazon

Use case:

- Competition density.
- Product examples.
- Category signals.
- Affiliate-compliant product metadata.

Legal/current access:

- Use Amazon Creators API as the forward-looking route. Amazon Associates Central describes Creators API as programmatic access to Amazon product data and creator services.
- Product Advertising API 5.0 is being deprecated on May 15, 2026 according to Amazon PA-API documentation, so new development should target Creators API.
- Do not scrape Amazon search result pages at scale.

Official references:

- https://affiliate-program.amazon.com/creatorsapi
- https://webservices.amazon.com/paapi5/documentation/api-reference.html

Data to store:

- Query.
- Marketplace.
- Search result IDs/ASINs where API permits.
- Product title.
- Category.
- Image URL if permitted by API terms.
- Price/availability if permitted.
- Retrieved timestamp.

### 7. Redbubble

Use case:

- Third-platform competition density.
- Tag and phrase validation.
- Marketplace fit for sticker/art-heavy niches.

Legal/current access:

- Redbubble does not expose a widely documented public product API.
- Use official affiliate/partner resources where applicable.
- Use user-visible search URLs for manual validation.
- If collecting public pages, obey robots.txt, rate limits, and Redbubble's User Agreement. Prefer permission or licensed data.

Official references:

- https://www.redbubble.com/p/398-affiliate-program
- https://www.redbubble.com/agreement

Data to store:

- Query.
- Search URL.
- Manual/allowed result density estimate.
- Product types observed.
- Tag patterns.
- Retrieved timestamp.

### 8. Holiday And Event Calendars

Use case:

- Upcoming observances.
- Upload windows.
- Seasonal urgency.

Legal/current access:

- Use public-domain government calendars where possible.
- Use APIs with clear licensing for commercial use, such as Calendarific or Nager.Date if their current terms fit the product.
- Store source URL and license.

Data to store:

- Event name.
- Date.
- Country/region.
- Category.
- Recurrence rule.
- Upload window start/end.
- Related niches.

### 9. IP And Trademark Sources

Use case:

- Avoid risky phrases, protected brands, and restricted events.

Legal/current access:

- Use official trademark search portals/APIs where available.
- Keep a local watchlist of risky terms.
- Add manual review flags for high-risk categories.

Sources:

- USPTO trademark search resources.
- WIPO Global Brand Database.
- Platform policy pages.
- Internal restricted phrase list.

## Core Data Schema

Recommended Postgres schema:

```sql
create table scan_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running', 'succeeded', 'failed', 'partial')),
  source_count int not null default 0,
  candidate_count int not null default 0,
  error_count int not null default 0,
  metadata jsonb not null default '{}'
);

create table source_events (
  id uuid primary key default gen_random_uuid(),
  scan_run_id uuid not null references scan_runs(id),
  source text not null,
  source_url text,
  external_id text,
  title text not null,
  body text,
  observed_at timestamptz not null,
  metrics jsonb not null default '{}',
  raw jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique(source, external_id)
);

create table trend_candidates (
  id uuid primary key default gen_random_uuid(),
  canonical_phrase text not null,
  normalized_phrase text not null,
  niche text not null,
  subcategory text,
  source_event_ids uuid[] not null default '{}',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  status text not null default 'active',
  unique(normalized_phrase)
);

create table platform_metrics (
  id uuid primary key default gen_random_uuid(),
  trend_candidate_id uuid not null references trend_candidates(id),
  platform text not null check (platform in ('amazon', 'etsy', 'redbubble', 'google_trends', 'pinterest', 'reddit', 'tiktok')),
  query text not null,
  demand_score numeric not null default 0,
  competition_score numeric not null default 0,
  velocity_score numeric not null default 0,
  evidence jsonb not null default '{}',
  retrieved_at timestamptz not null default now()
);

create table trend_scores (
  id uuid primary key default gen_random_uuid(),
  trend_candidate_id uuid not null references trend_candidates(id),
  scan_run_id uuid not null references scan_runs(id),
  total_score numeric not null,
  temperature text not null check (temperature in ('hot', 'warm', 'cold')),
  demand numeric not null,
  competition numeric not null,
  velocity numeric not null,
  timing numeric not null,
  platform_fit numeric not null,
  ip_safety numeric not null,
  confidence numeric not null,
  reason_codes text[] not null default '{}',
  warnings text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_on date not null,
  region text not null default 'US',
  category text not null,
  recurrence_rule text,
  recommended_upload_start date not null,
  recommended_upload_end date not null,
  niches jsonb not null default '[]',
  source_url text,
  created_at timestamptz not null default now()
);

create table ai_enrichments (
  id uuid primary key default gen_random_uuid(),
  trend_candidate_id uuid references trend_candidates(id),
  calendar_event_id uuid references calendar_events(id),
  model text not null,
  prompt_version text not null,
  output jsonb not null,
  safety_status text not null,
  created_at timestamptz not null default now()
);

create table ip_safety_checks (
  id uuid primary key default gen_random_uuid(),
  trend_candidate_id uuid not null references trend_candidates(id),
  phrase text not null,
  verdict text not null check (verdict in ('safe', 'review', 'blocked')),
  matched_terms jsonb not null default '[]',
  notes text,
  checked_at timestamptz not null default now()
);
```

## Normalized Trend Record Example

```json
{
  "canonicalPhrase": "Living My Best Chaotic Life",
  "niche": "coffee_lifestyle",
  "sources": [
    {
      "source": "google_search",
      "url": "https://www.google.com/search?q=woman%20fined%20for%20pouring%20coffee%20down%20drain",
      "observedAt": "2026-05-08T00:49:00Z"
    }
  ],
  "platformMetrics": {
    "amazon": {
      "competitionLabel": "ultra_niche",
      "estimatedResultCount": 0
    },
    "etsy": {
      "competitionLabel": "unknown"
    },
    "redbubble": {
      "competitionLabel": "not_checked"
    }
  },
  "score": {
    "total": 64,
    "temperature": "warm",
    "decision": "test"
  }
}
```

