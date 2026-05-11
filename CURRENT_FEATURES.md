# Current Features

## 1. Static Daily Report

The current product renders one complete daily report in a single file.

Technical behavior:

- The file is plain HTML with inline CSS and JavaScript.
- All data is hard-coded into the document.
- The report timestamp is `2026-05-08 00:49`.
- The page links to the live Surge deployment.

Limitations:

- No live refresh.
- No historical archive.
- No API or database.
- No reproducible scan logic in this source folder.
- Requires a separate missing process to regenerate the file.

## 2. Header Metrics

The top header shows report-level counters:

- 1 scan today.
- 63 total runs.
- 13-day streak.
- 18 hot trends.
- 5 new niches.
- 20+ sources.
- Amazon + Etsy checked.
- 30 calendar events.

Technical behavior:

- These are static text nodes.
- They are not calculated in the browser.

Limitations:

- Counters can become stale.
- There is no analytics persistence.
- "20+ sources" is not backed by visible source records.

## 3. Premium Dark Visual Style

The page uses:

- Black background.
- Translucent panels.
- Orange/pink gradients.
- Hover lift effects.
- Rounded cards and badges.
- Inter and Montserrat from Google Fonts.

Technical behavior:

- All styles live in one `<style>` block.
- CSS custom properties define the accent, background, surface, border, and text colors.
- The grid uses `repeat(auto-fill, minmax(...))`.

Limitations:

- No design tokens file.
- No component library.
- No accessibility pass.
- No user theme control.
- Large inline CSS makes maintenance difficult.

## 4. Upcoming Calendar Section

The report contains 30 upcoming US and seasonal opportunity cards. Each card includes:

- Event name.
- Event date.
- Days away from scan date.
- Urgency label.
- Amazon reference links.
- Etsy search link.
- Recommended art style.
- 5 copyable design prompts.

Current calendar examples:

| Event | Date | Urgency | Style |
|---|---:|---|---|
| Drum Corps International season | May 30 | Design now | Bold Collegiate Athletic |
| Graduation Season | Jun 1 | Design now | Bold Collegiate Athletic |
| Pride Month | Jun 1 | Design now | Retro Groovy Bold |
| Mental Health Awareness Month | Jun 1 | Design now | Botanical Floral Minimal |
| World Bicycle Day | Jun 3 | Design now | Clean Active Lifestyle Design |
| Father's Day | Jun 21 | This month | Coastal Nautical Vintage |
| Independence Day | Jul 4 | This month | Bold Clean Slab Serif |
| FIFA World Cup 2026 | Jul 4 | This month | Cute Cartoon Mascot |
| Moon Day | Jul 20 | Plan ahead | Dramatic Space Illustration |
| International Friendship Day | Aug 1 | Plan ahead | Warm Connection Illustration |

Technical behavior:

- Cards use inline `onclick="toggleCal(this)"`.
- Expanded content is hidden until the card receives the `open` class.
- The expand panel blocks event propagation with `event.stopPropagation()`.

Limitations:

- Dates are hard-coded.
- Days-away values do not update after the scan date.
- Urgency buckets are static.
- No calendar filter, month view, or saved reminders.
- No per-platform performance history.

## 5. Amazon Reference Links

Each calendar card has three Amazon search links. Trend cards also have Amazon search links.

Technical behavior:

- Links are plain `https://www.amazon.com/s?k=...` URLs.
- They open in a new tab.
- The report labels them as best-seller reference links, but the source only contains search URLs.

Limitations:

- No official Amazon data is fetched at runtime.
- Search result counts and best-seller status are not verified live.
- No BSR, reviews, price, image, ASIN, or category storage.
- Amazon Product Advertising API is being replaced by Creators API, so the rebuild should target current Amazon Associates APIs.

## 6. Etsy Reference Links

Each calendar and trend card contains Etsy search links.

Technical behavior:

- Links are plain `https://www.etsy.com/search?q=...` URLs.
- Trend cards usually show Etsy competition as unknown.

Limitations:

- No Etsy API integration.
- No listing count, review count, price spread, bestseller badge, or conversion proxy.
- Etsy competition is not actually computed in most cards.

## 7. Redbubble Mentions

Redbubble appears only twice in the file:

- One source context references "POD Market".
- One source link points to a Redbubble search for "introvert club shirt".

Technical behavior:

- Redbubble is an outbound link, not an integrated platform.

Limitations:

- Redbubble is not a first-class platform.
- No Redbubble competition, tag, result count, or product density metrics.
- No Redbubble-specific prompt or upload guidance.

## 8. Trend Cards

The report has 18 trend cards. Each card includes:

- Rank.
- Phrase.
- Niche label.
- Money score.
- Badges.
- Source energy score.
- Collapsible signal/competition details.
- Source link.
- Platform competition rows.
- Collapsible money score.
- What-to-do steps.
- Design brief.
- Phrase variations.
- Backend keywords.
- Claude-style design prompts.
- Footer links.

Current trend card phrases:

| # | Phrase | Niche | Final decision |
|---:|---|---|---|
| 1 | Certified Farmer Donates 1481 Enthusiast | Halloween niche | Test it |
| 2 | Socotra Island In Yemen | Viral/trending niche | Test it |
| 3 | The Ocean Is Still Full of Surprises | Viral/trending niche | Test it |
| 4 | Living My Best Chaotic Life | Coffee lover niche | Test it |
| 5 | Science Keeps Getting Weirder And I'm Here For It | Viral/trending niche | Test it |
| 6 | Nobody Warned Me About This | Viral/trending niche | Test it |
| 7 | Certified Found Out Accidentally Enthusiast | Viral/trending niche | Test it |
| 8 | History's Greatest Accidents Started With Someone Like Me | Viral/trending niche | Test it |
| 9 | Certified Wild Dogs Saw Enthusiast | Dog niche | Test it |
| 10 | Free Them All Honestly | Viral/trending niche | Test it |
| 11 | I Was Online When It Happened | Viral/trending niche | Test it |
| 12 | Accidentally Released From Prison | Viral/trending niche | Test it |
| 13 | Living In The Weirdest Timeline | Viral/trending niche | Test it |
| 14 | Born To Stopping Fishing Boat | Fishing niche | Test it |
| 15 | Only In Florida And I Am Not Surprised | Viral/trending niche | Skip |
| 16 | Nobody Expected This | Viral/trending niche | Skip |
| 17 | Certified Little Yellow Warbler Enthusiast | Viral/trending niche | Test it |
| 18 | Introvert Club Shirt | Viral/trending niche | Test it |

Limitations:

- Several phrases are awkward or grammatically weak.
- Final decisions are hard-coded.
- There is no provenance for how the score was calculated.
- Some "test it" decisions are attached to low numeric scores.
- There is no IP/trademark safety result.

## 9. Source Energy Score

Each trend card has a source energy header with:

- Score out of 25.
- Verdict such as low signal.
- Moment score out of 20.
- Five dimensions:
  - Absurdity.
  - Human element.
  - Meme readiness.
  - Visual potential.
  - Emotional hook.

Technical behavior:

- Displayed as static HTML and CSS bars.
- Uses inline widths and colors.

Limitations:

- Formula is not present.
- No source weighting by reliability.
- No decay model.
- No historical trend velocity.

## 10. Trifecta Metrics

Trend cards include a "trifecta" block:

- Shirt demand.
- Platform virality.
- Catchphrase potential.
- Shirtability.

Technical behavior:

- Scores are static numbers displayed with progress bars.

Limitations:

- The report does not show raw evidence for each component.
- No confidence interval.
- No separate platform scoring.

## 11. Competition Rows

Trend cards show Amazon and Etsy competition status.

Technical behavior:

- Amazon rows include labels such as Ultra Niche, Low, Medium, or High.
- Etsy is generally shown as unknown.
- Each row includes a manual search link.

Limitations:

- No live validation.
- Etsy is incomplete.
- Redbubble is absent from the competition model.
- Result count scraping/search engine counts can be unreliable if not sourced from APIs.

## 12. Money Score

Each trend card has a collapsible money-score section with:

- Numeric score out of 10.
- Demand status.
- Competition status.
- Wearability status.
- Trend status.
- Wearability gate.
- Sometimes pattern match.
- Trend stage.
- Best upload timing.

Technical behavior:

- Data is static HTML.
- `toggleSection(id)` hides or shows the section.

Limitations:

- Formula is missing.
- Scores are inconsistent with some displayed decisions.
- No platform-specific revenue model.
- No expected ROI or confidence rating.

## 13. What To Do

Each trend card has action steps:

- Phrase to test.
- Target audience.
- Number of variations to upload.

Technical behavior:

- Static text in collapsible sections.

Limitations:

- No account-level upload limits.
- No integration with listing exports.
- No A/B test tracking.

## 14. Design Brief

Each trend card includes design guidance:

- Style.
- Font.
- Layout.
- Colors.
- Direction.

Technical behavior:

- Static HTML rows.

Limitations:

- No style taxonomy.
- No versioned prompt generator.
- No image preview generation.

## 15. Phrase Variations

Trend cards include three phrase variations with copy buttons.

Technical behavior:

- Buttons call `navigator.clipboard.writeText(...)` inline.
- Button text changes to a checkmark after click.

Limitations:

- Inline event handlers are hard to maintain.
- Variations are not quality-scored.
- No trademark/IP screening.

## 16. Backend Keywords

Trend cards include backend keyword strings.

Technical behavior:

- Static monospace keyword rows.

Limitations:

- No keyword volume.
- No banned term detection.
- No per-platform title/tag length validation.
- No copy all/export feature.

## 17. Design Prompt Copying

Calendar and trend cards have 5 design prompts each.

Technical behavior:

- Prompt text is duplicated in visible text and `data-prompt`.
- Copy buttons call `copyCalPrompt(this)` or `copyTrendPrompt(this)`.
- The function reads `data-prompt`, writes to clipboard, changes button state, then resets.

Limitations:

- Duplicated prompt text inflates HTML.
- No prompt versioning.
- No prompt safety validation.
- No prompt quality rating.
- No direct image model integration.

## 18. Footer

The footer shows:

- `TREND CHASER v5.0`
- Creator attribution.
- Scan timestamp.
- Live report link.

Limitations:

- No build hash.
- No run ID.
- No link to raw scan logs.

