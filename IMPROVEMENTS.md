# Improvements

## Priority Model

Use this priority model for the rebuild:

- P0: Required to make the product reliable and rebuildable.
- P1: Required to make the product meaningfully better than the static report.
- P2: Growth and polish features.

## P0 Improvements

### 1. Replace Static HTML With A Real App

Build a full-stack app with:

- Database-backed trend records.
- API endpoints for dashboard queries.
- Server-side scheduled scans.
- Reusable UI components.
- Versioned scoring calculations.

Why it matters:

The current report is useful but fragile. Without a database and pipeline, it cannot support history, filtering, saved niches, user accounts, exports, or daily automation.

### 2. Add Structured Data Storage

Store raw observations and computed outputs separately:

- Raw source events.
- Normalized trend candidates.
- Platform metrics.
- Calendar events.
- Score snapshots.
- AI enrichments.
- IP safety checks.
- Scan runs and error logs.

Why it matters:

The current file only stores final display text. The rebuild needs traceability and reproducible scoring.

### 3. Fully Automated Daily Scanning

Create a scheduler that runs daily without manual intervention:

- Start scan.
- Collect sources.
- Normalize candidates.
- Score trends.
- Run safety checks.
- Generate AI enrichments.
- Publish dashboard snapshot.
- Alert on failures.

Why it matters:

Daily POD windows decay quickly. Manual runs make the product unreliable.

### 4. Rebuild The Scoring System

Create a transparent scoring engine:

```ts
type TrendTemperature = "hot" | "warm" | "cold";

type TrendScore = {
  total: number;          // 0-100
  temperature: TrendTemperature;
  demand: number;         // 0-100
  competition: number;    // 0-100, higher means better opportunity
  velocity: number;       // 0-100
  timing: number;         // 0-100
  platformFit: number;    // 0-100
  ipSafety: number;       // 0-100
  confidence: number;     // 0-100
};
```

Recommended formula:

```ts
const total =
  demand * 0.22 +
  competition * 0.18 +
  velocity * 0.18 +
  timing * 0.14 +
  platformFit * 0.14 +
  ipSafety * 0.10 +
  confidence * 0.04;
```

Temperature mapping:

- Hot: `total >= 75` and `ipSafety >= 70`.
- Warm: `total >= 55`.
- Cold: `total < 55`.

### 5. Add IP And Policy Safety Before Prompt Generation

Run every trend through:

- Trademark phrase checks.
- Brand/team/celebrity detection.
- Protected event and league detection.
- Medical/health claim warnings.
- Political and tragedy sensitivity checks.
- Platform-specific restricted term checks.

Why it matters:

POD sellers can lose accounts from unsafe designs. The current report does not visibly perform this safety gate.

## P1 Improvements

### 6. Better UI/UX: Premium Dark Dashboard With Animations

Upgrade the report into a polished dashboard:

- Persistent app shell with sidebar and top command bar.
- Filters for platform, urgency, score, category, source, and safety.
- Trend detail drawer.
- Calendar month view.
- Platform comparison cards.
- Saved niches and watchlists.
- Animated score transitions.
- Skeleton states during refresh.
- Empty states and error states.

Important:

Keep the product work-focused. This is a seller operations dashboard, not a marketing landing page.

### 7. Add Redbubble As A Third Platform

Make Redbubble first-class alongside Amazon and Etsy:

- Store Redbubble result URL, result density, tag patterns, and top product examples where permitted.
- Create Redbubble-specific fit score.
- Show Amazon, Etsy, and Redbubble platform comparison on each trend.
- Add Redbubble upload prompt notes, tags, and product type recommendations.

Legal access note:

Redbubble does not expose a broadly documented public product API. Prefer official affiliate/partner resources and respectful manual/allowed search-link workflows over aggressive scraping.

### 8. Expand From 18 Trends To 50+ Niches With Subcategories

Create a niche taxonomy:

- Calendar/seasonal.
- Viral news.
- Hobby.
- Profession.
- Family/relationship.
- Sports-adjacent.
- Pet/animal.
- Food/drink.
- Wellness.
- Internet culture.
- Local pride.
- Travel/place.
- School/college.
- Faith/spirituality where policy-safe.

Each niche should have subcategories, examples:

- Graduation: senior 2026, teacher, parent, nursing grad, kindergarten grad.
- Dad: grill dad, girl dad, fishing dad, tech dad, bonus dad.
- Summer: beach, camp, road trip, pool, lake, sunglasses.

### 9. Claude-Powered Design Prompt Generation

Use Claude to generate:

- 5 design prompts per trend.
- 3 phrase variations.
- Listing keyword packs.
- Target audience.
- Design style recommendation.
- Safety warnings.

Quality gates:

- No exact copyrighted slogans.
- No celebrity or brand names unless explicitly allowed.
- No mockup instructions.
- Output structured JSON.
- Reject awkward grammar.

### 10. Google Trends Integration

Use the Google Trends API alpha when access is available. Google documents that the alpha can provide programmatic Trends data, a rolling five-year window, interval aggregation, and region/sub-region comparisons.

Fallbacks:

- Manual CSV export from Google Trends for internal validation.
- Cache pasted Trends exports.
- Do not rely on unofficial scraping as the primary production integration.

Trend score inputs:

- Interest over time slope.
- Breakout/rising related queries.
- Regional spread.
- Seasonality compared to previous years.
- Recent acceleration.

### 11. Urgency Meter Per Niche

Replace static urgency labels with a dynamic timing model:

```ts
function urgency(daysUntilEvent: number): "act_now" | "soon" | "this_month" | "plan_ahead" | "late" {
  if (daysUntilEvent < 0) return "late";
  if (daysUntilEvent <= 35) return "act_now";
  if (daysUntilEvent <= 45) return "soon";
  if (daysUntilEvent <= 60) return "this_month";
  return "plan_ahead";
}
```

Also track recommended upload windows:

- Amazon Merch: start 4-8 weeks before evergreen seasonal demand.
- Etsy: start earlier for personalized items and shipping windows.
- Redbubble: start early for search indexing and collection building.

### 12. Niche Calendar View

Add:

- Month grid.
- Week list.
- Platform-specific upload windows.
- Saved reminders.
- Heat color based on opportunity score.
- Category filtering.
- Clickable event detail drawer.
- Export to Google Calendar/ICS.

### 13. Hot/Warm/Cold Trend System

Every trend should display:

- Temperature badge.
- Score breakdown.
- Confidence.
- Reason codes.
- "Why now" summary.
- "Do not design if" warning.

Example:

```json
{
  "temperature": "hot",
  "total": 82,
  "reasonCodes": [
    "rising_google_interest",
    "low_amazon_density",
    "strong_calendar_timing",
    "safe_generic_phrase"
  ],
  "warnings": [
    "avoid official team logos",
    "avoid copyrighted event branding"
  ]
}
```

## P2 Improvements

### 14. Watchlists And Alerts

Allow users to save:

- Niches.
- Keywords.
- Calendar events.
- Platforms.
- Score thresholds.

Send alerts when:

- A saved niche crosses hot threshold.
- A holiday enters the upload window.
- Competition suddenly increases.
- Google Trends velocity spikes.

### 15. Exports

Add:

- CSV export.
- Notion export.
- Google Sheets export.
- Copy all prompts.
- Listing pack export per platform.

### 16. User Accounts And Plans

Add:

- Email/password or OAuth login.
- Free plan with limited daily cards.
- Pro plan with full history, AI prompts, and alerts.
- Team plan with shared watchlists.

### 17. Trend History

Track:

- Score changes by day.
- Platform competition movement.
- Related query changes.
- Prompt revisions.
- User saves and dismissals.

### 18. Quality Feedback Loop

Users should be able to mark:

- "I uploaded this."
- "This phrase is awkward."
- "Unsafe/IP risk."
- "Made sales."
- "False positive."

Use feedback to improve scoring and prompt generation.

