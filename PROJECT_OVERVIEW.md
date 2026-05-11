# Project Overview

## Product Summary

Trend Chaser is a daily print-on-demand trend intelligence report for sellers on Amazon Merch on Demand, Etsy, and marketplace-style POD channels. The current project is not a full application with a runtime backend. It is a single pre-rendered static HTML document saved as `niche-please-trends.txt` and published as a static page at `https://niche-please-trends.surge.sh`.

The report helps POD sellers decide what to design today by combining:

- A calendar of upcoming holidays, observances, and seasonal windows.
- A list of fast-moving viral phrases or niche concepts.
- Amazon and Etsy search links for manual competition checks.
- Source links from Reddit, Google Search, and Redbubble.
- Heuristic money scores, source-energy scores, and final decisions.
- Ready-to-copy design prompts, phrase variations, and listing keywords.

The visible product is a dark dashboard-style report, but the current implementation is a static snapshot. The scanning and generation logic that produced the report is not included in this source folder.

## Target Users

Trend Chaser is built for:

- Amazon Merch on Demand sellers who need timely low-competition shirt ideas.
- Etsy POD sellers who want seasonal and viral design angles.
- Redbubble sellers looking for lightweight marketplace trend checks.
- Niche researchers who want a daily list of printable ideas, not generic news.
- Designers using AI image tools who need structured, POD-specific prompts.

## Current End-to-End Workflow

1. An external generator runs outside this repository.
2. The generator appears to collect trend candidates from social/news/search/POD sources.
3. It computes or inserts trend metadata:
   - Run counters: 1 scan today, 63 total runs, 13-day streak.
   - Scan timestamp: 2026-05-08 00:49.
   - Summary counts: 18 hot trends, 5 new niches, 20+ sources, 30 calendar events.
4. It emits one large HTML file with inline CSS, inline HTML data, inline JavaScript, and embedded base64 PNG assets.
5. The static file is deployed to Surge.
6. Users browse the report, expand/collapse sections, open external search links, and copy prompts/phrases to their clipboard.

## Current Tech Stack

The current delivered page uses:

- Static HTML document.
- Inline CSS in a single `<style>` block.
- Vanilla JavaScript in a single inline `<script>` block.
- Google Fonts import for Inter and Montserrat.
- Embedded base64 PNG images for the logo and visual style references.
- External links to Amazon, Etsy, Reddit, Google Search, Redbubble, and Surge.
- Surge static hosting.

There is no current:

- Backend server.
- API layer.
- Database.
- Authentication.
- Scheduler implementation in the repo.
- Source collector code.
- Reusable component system.
- Build step.
- Package manifest.
- Automated tests.

## Important Current Source Facts

The source file contains:

- 30 upcoming calendar cards.
- 18 trend cards.
- 39 embedded base64 image assets.
- 144 Amazon outbound links.
- 84 Etsy outbound links.
- 22 Google Search links.
- 12 Reddit links.
- 2 Redbubble links.
- 2 links to the hosted Surge report.
- 0 `fetch()` calls.
- 0 `XMLHttpRequest` calls.
- 0 `localStorage` or `sessionStorage` use.

The only runtime JavaScript functions are:

```js
function copyPrompt(id, btn) { /* copy element text to clipboard */ }
function toggleSection(id) { /* hide/show collapsible card sections */ }
function toggleCal(el) { /* open/close calendar card */ }
function copyCalPrompt(btn) { /* copy calendar prompt from data-prompt */ }
function copyTrendPrompt(btn) { /* copy trend prompt from data-prompt */ }
```

## Current Product Value

The strongest part of the current product is the shape of the seller workflow. It already understands that POD sellers need fast answers to:

- What should I design?
- Why is it relevant now?
- How competitive is it?
- What exact phrase should I test?
- What style should the design use?
- What keywords should I paste into a listing?
- Where can I manually verify demand?

The rebuild should preserve that workflow while replacing the static report with a real automated SaaS product.

## Current Main Limitations

- The report is static and cannot refresh itself.
- The upstream scanning/generator code is missing.
- Scores are embedded as final text, not reproducible calculations.
- Etsy competition is usually marked unknown.
- Redbubble is barely represented.
- There is no Google Trends scoring.
- There is no account system, history, saved niches, or exports.
- There is no structured database.
- There is no IP/trademark safety pipeline.
- There is no mobile-first app shell beyond responsive CSS.
- The 42 MB file is bloated by embedded images.
- Several generated phrases are awkward or low-quality, showing that the idea generation layer needs stricter quality gates.

## Rebuild Goal

The superior version should become a daily automated trend operating system:

- Collect signals every day from legal APIs and permitted public sources.
- Normalize all data into a durable schema.
- Score each niche using demand, competition, timing, trend velocity, platform fit, and IP safety.
- Generate high-quality Claude-powered design prompts and listing copy.
- Show Amazon, Etsy, and Redbubble side by side.
- Expand to 50+ niches and subcategories.
- Provide a premium dark dashboard, calendar view, saved watchlists, exports, and alerts.
- Run on a reliable scheduled pipeline with monitoring, retries, and audit logs.

