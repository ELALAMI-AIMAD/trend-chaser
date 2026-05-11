# UI Design System

## Design Direction

Trend Chaser should feel like a premium operations dashboard for sellers. The UI should be dark, sharp, fast, and information-dense. It should avoid a generic landing-page look.

The first screen should be the working dashboard:

- Trend table/grid.
- Daily score summary.
- Calendar urgency strip.
- Platform filters.
- Saved/watchlist actions.

No marketing hero is needed.

## Color Palette

Use a dark base with multi-color signal accents. Avoid letting the whole interface become one orange/pink gradient.

```css
:root {
  --bg: #070809;
  --bg-elevated: #0d1013;
  --surface: #12161a;
  --surface-soft: #171c21;
  --border: rgba(255, 255, 255, 0.08);

  --text: rgba(255, 255, 255, 0.92);
  --text-muted: rgba(255, 255, 255, 0.62);
  --text-dim: rgba(255, 255, 255, 0.36);

  --orange: #ff6a1a;
  --pink: #f02a8a;
  --gold: #f7c948;
  --green: #20d27c;
  --cyan: #22c7d8;
  --blue: #4d8dff;
  --red: #ff4d4d;

  --hot: #ff4d4d;
  --warm: #f7c948;
  --cold: #7c8794;
  --safe: #20d27c;
  --review: #f7c948;
  --blocked: #ff4d4d;
}
```

Gradients should be used only for:

- Primary CTA.
- Score highlights.
- Small active indicators.

## Typography

Use:

- Inter for interface text.
- Montserrat or Space Grotesk for strong numeric/card headings.

Scale:

```css
--font-xs: 0.75rem;
--font-sm: 0.875rem;
--font-md: 1rem;
--font-lg: 1.125rem;
--font-xl: 1.375rem;
--font-2xl: 1.75rem;
--font-3xl: 2.25rem;
```

Rules:

- No negative letter spacing.
- No viewport-width font scaling.
- Keep card headings compact.
- Use uppercase labels only for metadata, not body text.

## Spacing System

Use 4px increments:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

Component padding:

- Dense table cell: 8-12px.
- Trend card: 16px.
- Detail drawer: 24px.
- Modal: 24-32px.

## Border Radius

Use modest radius:

- Buttons: 8px.
- Cards: 8px.
- Badges: 999px.
- Inputs: 8px.
- Modals/drawers: 12px.

## Core Components

### App Shell

- Left sidebar for primary navigation.
- Top bar with scan status, date selector, command search, and account menu.
- Main content area with sticky filters.

Navigation items:

- Dashboard.
- Trend Radar.
- Calendar.
- Platforms.
- Watchlist.
- Saved Prompts.
- Scan Runs.
- Settings.

### KPI Cards

Metrics:

- Hot trends.
- Warm trends.
- New today.
- Scan health.
- Average platform competition.
- Calendar opportunities in upload window.

States:

- Loading skeleton.
- Empty.
- Error.
- Delta up/down.

### Trend Cards

Display:

- Phrase.
- Temperature.
- Score.
- Niche/subcategory.
- Platform badges.
- Safety badge.
- Source count.
- Upload timing.
- Save button.

Actions:

- Open detail drawer.
- Copy phrase.
- Save/watch.
- Export listing pack.

### Trend Detail Drawer

Sections:

- Score breakdown.
- Source evidence.
- Platform comparison.
- IP safety.
- AI prompts.
- Listing keywords.
- Phrase variations.
- History chart.
- User notes.

### Platform Comparison

Use a compact three-column component:

| Amazon | Etsy | Redbubble |
|---|---|---|
| Demand | Demand | Demand |
| Competition | Competition | Competition |
| Fit | Fit | Fit |
| Recommended action | Recommended action | Recommended action |

### Calendar View

Views:

- Month.
- List.
- Upload window.

Each event shows:

- Days until event.
- Upload window.
- Urgency.
- Top sub-niches.
- Highest-scoring platform.

### Badges

Badge categories:

- `Hot`, `Warm`, `Cold`.
- `Safe`, `Review`, `Blocked`.
- `Amazon`, `Etsy`, `Redbubble`.
- `First mover`.
- `Rising`.
- `Calendar`.
- `AI ready`.

### Filters

Use segmented controls, toggles, and menus:

- Platform.
- Temperature.
- Safety.
- Niche category.
- Urgency.
- Source.
- Date range.
- Minimum score.

### Tables

Trend table columns:

- Phrase.
- Score.
- Temperature.
- Niche.
- Timing.
- Amazon.
- Etsy.
- Redbubble.
- Safety.
- Sources.
- Last seen.
- Actions.

Use stable widths to prevent layout shift.

### Copy Buttons

Use icon buttons with tooltips where possible:

- Copy phrase.
- Copy prompt.
- Copy keywords.
- Export.

### Modals

Use modals for:

- Export settings.
- IP review notes.
- Source evidence preview.
- Delete confirmation.

Do not put cards inside modals unless the modal displays repeated items.

## Animation Guidelines

Use motion to clarify state, not decorate.

Allowed:

- Card hover lift: 2-3px.
- Score number count-up.
- Progress bar fill on first render.
- Drawer slide-in.
- Filter chip transitions.
- Toast enter/exit.
- Calendar cell highlight fade.

Timing:

```ts
const motion = {
  fast: 0.12,
  normal: 0.18,
  slow: 0.28,
  easing: [0.2, 0.8, 0.2, 1]
};
```

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Mobile Responsiveness

Rules:

- Use a bottom nav or collapsible drawer for primary nav under 768px.
- Trend cards become single-column.
- Tables switch to card rows on mobile.
- Detail drawer becomes full-screen sheet.
- Filter bar becomes horizontal scroll chips.
- Calendar month view switches to agenda list.
- Copy/export actions remain reachable with thumb-friendly buttons.

Breakpoints:

```ts
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
};
```

## Accessibility

Requirements:

- Keyboard-accessible expandable cards.
- Buttons must be buttons, not clickable divs.
- `aria-expanded` for collapsible sections.
- Visible focus states.
- Contrast AA for text.
- Tooltip content available to keyboard users.
- Screen-reader labels for icon-only actions.
- No color-only meaning for hot/warm/cold or safety.

Example accessible collapsible trigger:

```tsx
<button
  type="button"
  aria-expanded={open}
  aria-controls={`trend-${id}-details`}
  onClick={() => setOpen(!open)}
>
  <span>Signals and competition</span>
  <ChevronDown aria-hidden />
</button>
```

## Empty And Error States

Examples:

- No hot trends today: show warm opportunities and explain filters.
- Source failed: show "Reddit collector failed at 09:04 UTC; retry scheduled".
- AI unavailable: show raw trend card and disabled prompt actions.
- No safe prompts: show safety reason and review action.

