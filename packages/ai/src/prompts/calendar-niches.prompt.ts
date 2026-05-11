// packages/ai/src/prompts/calendar-niches.prompt.ts
// Pure prompt builder for calendar niche expansion — no side effects, no imports from other modules.
// Claude receives this prompt and must respond with JSON matching the calendar schema shape.

export const PROMPT_VERSION = "calendar-v1" as const;

export interface CalendarNichesInput {
  eventName: string;
  eventDate: string;          // ISO date string e.g. "2026-06-21"
  daysUntilEvent: number;
  region: string;             // e.g. "US", "UK", "global"
  category: string;           // e.g. "seasonal-holiday", "family"
  existingNiches: string[];   // niches already found — Claude must avoid repeating
  platforms: Array<"amazon" | "etsy" | "redbubble">;
}

export function buildCalendarNichesPrompt(input: CalendarNichesInput): string {
  const { eventName, eventDate, daysUntilEvent, region, category, existingNiches, platforms } = input;

  // Block 1 — CONTEXT
  const block1 = `## CALENDAR NICHE EXPANSION
Event: ${eventName}
Date: ${eventDate} (${daysUntilEvent} days away)
Region: ${region}
Category: ${category}`;

  // Block 2 — TIMING (conditional on daysUntilEvent)
  let block2: string;
  if (daysUntilEvent <= 35) {
    block2 = `## TIMING
URGENT: ${daysUntilEvent} days until event. Sellers need designs ready NOW.
Prioritize fastest-to-produce styles: bold typography, simple silhouettes, minimal illustration.
Avoid complex multi-element scenes that take time to iterate.`;
  } else if (daysUntilEvent <= 60) {
    block2 = `## TIMING
Upload window opening soon (${daysUntilEvent} days). Balance quality with speed.
Favor styles achievable in 1-2 design iterations. Avoid highly detailed illustration.`;
  } else {
    block2 = `## TIMING
${daysUntilEvent} days until event — enough lead time for complex illustrated designs.
Full creative range available. Prioritize quality and differentiation over speed.`;
  }

  // Block 3 — AVOID (conditional on existingNiches — omit entirely if empty)
  let block3: string | null = null;
  if (existingNiches.length > 0) {
    const nicheLines = existingNiches.map((n) => `- ${n}`).join("\n");
    block3 = `## AVOID — ALREADY FOUND
These niches are already covered. Do not repeat them or close variations:
${nicheLines}`;
  }

  // Block 4 — PLATFORM SCORING
  const platformList = platforms.join(", ");
  const platformNote =
    platforms.length === 1
      ? `All platformFit scores apply to ${platforms[0]} only.`
      : "Score each platform independently based on its audience and product mix.";
  const block4 = `## PLATFORMS TO SCORE
Score platformFit for: ${platformList}
${platformNote}`;

  // Block 5 — REQUIREMENTS
  const block5 = `## SUB-NICHE REQUIREMENTS
Return exactly 8 sub-niches. For each:
1. name: specific segment label (min 3 chars — not "Dad" alone)
2. buyer: describe WHO buys this and WHY (not "adults" or "people")
3. phraseAngles: min 2, max 6 unique phrase angles per sub-niche
4. platformFit: score 0-100 for each platform in the platforms list; at least one score must be >= 50
5. recommendedStyle: specific visual direction (not just "bold")
6. riskNotes: list any IP or content concerns; empty array if none

Diversity rules:
- Cover at least 3 distinct demographic groups across the 8 niches
- Include at least 1 unexpected niche a typical seller would overlook
- No two sub-niches should target the same buyer with the same angle

Safety rules:
- Prefer generic and parody-safe phrasing
- Avoid: official event logos, protected league/team names, celebrity/athlete references, exact trademarked slogans
- Phrase angles must be unique within each sub-niche (no duplicate angles)`;

  // Block 6 — OUTPUT FORMAT
  const platformFitExample = platforms
    .map((p) => `        "${p}": <integer 0-100>`)
    .join("\n");
  const block6 = `## OUTPUT FORMAT (JSON only, no markdown fences)
{
  "eventName": "<event name string>",
  "subNiches": [
    {
      "name": "<specific segment name, min 3 chars>",
      "buyer": "<who buys this and why, min 10 chars>",
      "phraseAngles": ["<angle 1>", "<angle 2>", ...],
      "platformFit": {
${platformFitExample}
        // one key per platform in the platforms list
      },
      "recommendedStyle": "<visual direction, min 5 chars>",
      "riskNotes": ["<IP or content concern>"]
    }
    // exactly 8 items
  ]
}`;

  const blocks = [block1, block2, block3, block4, block5, block6].filter(
    (b): b is string => b !== null
  );

  return blocks.join("\n\n");
}

/*
Example rendered output for:
  eventName: "Father's Day"
  eventDate: "2026-06-21"
  daysUntilEvent: 28
  region: "US"
  category: "family"
  existingNiches: ["Dad Jokes", "Golf Dad", "BBQ Dad"]
  platforms: ["amazon", "etsy", "redbubble"]

## CALENDAR NICHE EXPANSION
Event: Father's Day
Date: 2026-06-21 (28 days away)
Region: US
Category: family

## TIMING
URGENT: 28 days until event. Sellers need designs ready NOW.
Prioritize fastest-to-produce styles: bold typography, simple silhouettes, minimal illustration.
Avoid complex multi-element scenes that take time to iterate.

## AVOID — ALREADY FOUND
These niches are already covered. Do not repeat them or close variations:
- Dad Jokes
- Golf Dad
- BBQ Dad

## PLATFORMS TO SCORE
Score platformFit for: amazon, etsy, redbubble
Score each platform independently based on its audience and product mix.

## SUB-NICHE REQUIREMENTS
Return exactly 8 sub-niches. For each:
1. name: specific segment label (min 3 chars — not "Dad" alone)
2. buyer: describe WHO buys this and WHY (not "adults" or "people")
3. phraseAngles: min 2, max 6 unique phrase angles per sub-niche
4. platformFit: score 0-100 for each platform in the platforms list; at least one score must be >= 50
5. recommendedStyle: specific visual direction (not just "bold")
6. riskNotes: list any IP or content concerns; empty array if none

Diversity rules:
- Cover at least 3 distinct demographic groups across the 8 niches
- Include at least 1 unexpected niche a typical seller would overlook
- No two sub-niches should target the same buyer with the same angle

Safety rules:
- Prefer generic and parody-safe phrasing
- Avoid: official event logos, protected league/team names, celebrity/athlete references, exact trademarked slogans
- Phrase angles must be unique within each sub-niche (no duplicate angles)

## OUTPUT FORMAT (JSON only, no markdown fences)
{
  "eventName": "<event name string>",
  "subNiches": [
    {
      "name": "<specific segment name, min 3 chars>",
      "buyer": "<who buys this and why, min 10 chars>",
      "phraseAngles": ["<angle 1>", "<angle 2>", ...],
      "platformFit": {
        "amazon": <integer 0-100>
        "etsy": <integer 0-100>
        "redbubble": <integer 0-100>
        // one key per platform in the platforms list
      },
      "recommendedStyle": "<visual direction, min 5 chars>",
      "riskNotes": ["<IP or content concern>"]
    }
    // exactly 8 items
  ]
}
*/
