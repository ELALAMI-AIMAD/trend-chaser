// packages/ai/src/prompts/trend-analysis.prompt.ts
// Pure prompt builder for trend scoring — no side effects, no imports from anthropic.ts.
// Claude receives this prompt and must respond with JSON matching AiScoreOutput.

export const PROMPT_VERSION = "trend-v1" as const;

export interface TrendAnalysisInput {
  phrase: string;
  niche: string;
  sources: Array<{
    source: string;
    title: string;
    observedAt: string;
  }>;
  metrics: {
    amazonCompetition: string;       // e.g. "high", "medium", "low"
    etsyCompetition: string;         // e.g. "high", "medium", "low"
    googleTrendVelocity: number | null; // 0-100 or null if unavailable
    sourceEnergy: number;            // 0-100 aggregate signal strength
    momentScore: number;             // 0-100 momentum
    daysUntilEvent: number | null;   // null for non-seasonal trends
  };
  safety: {
    precheckVerdict: "safe" | "review" | "blocked";
    avoid: string[]; // terms to avoid in scores/recommendations
  };
}

export function buildTrendAnalysisPrompt(input: TrendAnalysisInput): string {
  const { phrase, niche, sources, metrics, safety } = input;
  const {
    amazonCompetition,
    etsyCompetition,
    googleTrendVelocity,
    sourceEnergy,
    momentScore,
    daysUntilEvent,
  } = metrics;
  const { precheckVerdict, avoid } = safety;

  // Block 1 — CONTEXT
  const block1 = `## TREND SCORING REQUEST
Phrase: "${phrase}"
Niche: ${niche}
Safety precheck: ${precheckVerdict}`;

  // Block 2 — EVIDENCE
  const sourceLines = sources
    .map((s) => `- [${s.source}] ${s.title} (seen: ${s.observedAt})`)
    .join("\n");

  const velocityLine =
    googleTrendVelocity !== null ? String(googleTrendVelocity) : "unavailable";

  const seasonalLine =
    daysUntilEvent !== null
      ? `\n- Days until seasonal event: ${daysUntilEvent}`
      : "";

  const block2 = `## EVIDENCE
Sources (${sources.length} observed):
${sourceLines}

Metrics:
- Amazon competition: ${amazonCompetition}
- Etsy competition: ${etsyCompetition}
- Google Trends velocity: ${velocityLine}
- Source energy: ${sourceEnergy}/100
- Momentum: ${momentScore}/100${seasonalLine}`;

  // Block 3 — SAFETY
  const avoidLine =
    avoid.length > 0
      ? `Do not reference or reward: ${avoid.join(", ")}`
      : "No blocked terms.";

  const block3 = `## SAFETY
Precheck: ${precheckVerdict}
${avoidLine}`;

  // Block 4 — SCORING RULES
  const timingRule =
    daysUntilEvent !== null
      ? `\n- Timing: ${daysUntilEvent} days to event — weight timing score accordingly (act_now urgency if < 30 days)`
      : "";

  const block4 = `## SCORING RULES
- Score conservatively when sourceEnergy < 40 or fewer than 2 sources
- Penalize: phrases under 3 words or over 12 words (awkward grammar flag)
- Penalize: high IP risk — reduce ipSafety and cap decision at "watch"
- Penalize: phrases that require context buyers won't have
- Reward: evergreen buyer identity (profession, family role, hobby)
- Reward: giftability (works as a gift, clear recipient)
- Reward: wearability (comfortable to wear publicly, not edgy)
- Reward: visual clarity (easy to render as a flat graphic)${timingRule}
- Output JSON only. No preamble. No explanation outside the JSON.`;

  // Block 5 — OUTPUT FORMAT
  const block5 = `## OUTPUT FORMAT (JSON only, no markdown)
{
  "demand": <integer 0-100>,
  "competition": <integer 0-100>,
  "velocity": <integer 0-100>,
  "timing": <integer 0-100>,
  "platformFit": <integer 0-100>,
  "ipSafety": <integer 0-100>,
  "confidence": <integer 0-100>,
  "temperature": <"hot"|"warm"|"cold">,
  "decision": <"design_now"|"test_small"|"watch"|"skip">,
  "reasonCodes": ["<SHORT_CODE>", ...],
  "warnings": ["<optional warning>", ...],
  "explanation": "<min 30 chars explaining the scoring rationale>"
}`;

  return [block1, block2, block3, block4, block5].join("\n\n");
}

/*
Example rendered output for:
  phrase: "dog mom life"
  niche: "pet-animal"
  sources: [{ source: "reddit", title: "r/dogs trending post", observedAt: "2026-05-09" }]
  metrics: { amazonCompetition: "medium", etsyCompetition: "low", googleTrendVelocity: 62,
             sourceEnergy: 71, momentScore: 58, daysUntilEvent: null }
  safety: { precheckVerdict: "safe", avoid: [] }

## TREND SCORING REQUEST
Phrase: "dog mom life"
Niche: pet-animal
Safety precheck: safe

## EVIDENCE
Sources (1 observed):
- [reddit] r/dogs trending post (seen: 2026-05-09)

Metrics:
- Amazon competition: medium
- Etsy competition: low
- Google Trends velocity: 62
- Source energy: 71/100
- Momentum: 58/100

## SAFETY
Precheck: safe
No blocked terms.

## SCORING RULES
- Score conservatively when sourceEnergy < 40 or fewer than 2 sources
- Penalize: phrases under 3 words or over 12 words (awkward grammar flag)
- Penalize: high IP risk — reduce ipSafety and cap decision at "watch"
- Penalize: phrases that require context buyers won't have
- Reward: evergreen buyer identity (profession, family role, hobby)
- Reward: giftability (works as a gift, clear recipient)
- Reward: wearability (comfortable to wear publicly, not edgy)
- Reward: visual clarity (easy to render as a flat graphic)
- Output JSON only. No preamble. No explanation outside the JSON.

## OUTPUT FORMAT (JSON only, no markdown)
{
  "demand": <integer 0-100>,
  "competition": <integer 0-100>,
  "velocity": <integer 0-100>,
  "timing": <integer 0-100>,
  "platformFit": <integer 0-100>,
  "ipSafety": <integer 0-100>,
  "confidence": <integer 0-100>,
  "temperature": <"hot"|"warm"|"cold">,
  "decision": <"design_now"|"test_small"|"watch"|"skip">,
  "reasonCodes": ["<SHORT_CODE>", ...],
  "warnings": ["<optional warning>", ...],
  "explanation": "<min 30 chars explaining the scoring rationale>"
}
*/
