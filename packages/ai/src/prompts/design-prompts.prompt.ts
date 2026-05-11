// packages/ai/src/prompts/design-prompts.prompt.ts
// Pure prompt builder for the enrichment use case — no side effects, no imports from anthropic.ts.
// Claude receives this prompt and must respond with JSON matching the enrichment schema shape.

export const PROMPT_VERSION = "design-v1" as const;

export interface DesignPromptsInput {
  phrase: string;
  niche: string;
  qualityVerdict: "strong" | "usable" | "weak" | "reject";
  targetBuyer: string;
  designStyle: string;
  safetyVerdict: "safe" | "review" | "blocked";
  safetyNotes: string[];
  platformFit: Array<"amazon" | "etsy" | "redbubble">;
}

export function buildDesignPromptsPrompt(input: DesignPromptsInput): string {
  const {
    phrase,
    niche,
    qualityVerdict,
    targetBuyer,
    designStyle,
    safetyVerdict,
    safetyNotes,
    platformFit,
  } = input;

  // Block 1 — CONTEXT
  const block1 = `## ENRICHMENT REQUEST
Phrase: "${phrase}"
Niche: ${niche}
Target buyer: ${targetBuyer}
Design style: ${designStyle}
Quality verdict: ${qualityVerdict}`;

  // Block 2 — SAFETY
  let block2: string;
  if (safetyVerdict === "safe") {
    block2 = `## SAFETY
Verdict: safe — proceed normally.`;
  } else if (safetyVerdict === "review") {
    const concerns =
      safetyNotes.length > 0 ? safetyNotes.join(" | ") : "none specified";
    block2 = `## SAFETY
Verdict: review — flag any elements that could be IP-sensitive in safetyNotes.
Known concerns: ${concerns}
Avoid in all prompts: protected brand names, celebrity references, team/league names, copyrighted characters, exact copyrighted slogans.`;
  } else {
    // blocked
    const concerns =
      safetyNotes.length > 0 ? safetyNotes.join(" | ") : "none specified";
    block2 = `## SAFETY
Verdict: blocked — phrase contains protected IP. Set qualityVerdict to "reject".
Focus phraseVariations entirely on safer generic alternatives. Do not use the original phrase in any design prompt.
Concerns: ${concerns}`;
  }

  // Block 3 — PLATFORM NOTES
  const platformLines: string[] = [];
  if (platformFit.includes("amazon")) {
    platformLines.push(
      "Amazon Merch: typography-led designs, clean layouts, proven color palettes, minimal decoration."
    );
  }
  if (platformFit.includes("etsy")) {
    platformLines.push(
      "Etsy: illustrative and artistic styles welcome, handcrafted aesthetic, storytelling through imagery."
    );
  }
  if (platformFit.includes("redbubble")) {
    platformLines.push(
      "Redbubble: bold graphic styles that work across stickers, posters, and totes — not just apparel."
    );
  }
  const block3 = `## PLATFORM NOTES
${platformLines.join("\n")}`;

  // Block 4 — REQUIREMENTS
  const rejectWarning =
    qualityVerdict === "reject"
      ? "\nIMPORTANT: qualityVerdict is reject. Return 5 prompts for the SAFEST phrase variation found in phraseVariations, not the original phrase."
      : "";

  const block4 = `## DESIGN PROMPT REQUIREMENTS
Return exactly 5 design prompts. Each prompt must:
1. Describe FLAT PRINTABLE artwork only — no physical products
2. Include ALL of the following elements:
   - Typography direction: font style, weight, and approximate size role
   - Central visual: the specific illustrated element (not vague)
   - Color palette: name specific colors (e.g. "dusty rose, ivory, charcoal") not generic terms
   - Layout: composition, hierarchy, relative placement of elements
   - Background: explicit color or texture specification
3. End with this exact closing: "flat graphic artwork only, NO t-shirt mockup, NO clothing, NO mannequin, solid black background, ar 4:5"
4. Never reference: protected brand names, celebrities, real people, team names, league names, copyrighted characters, or exact copyrighted slogans
${rejectWarning}`;

  // Block 5 — OUTPUT FORMAT
  const block5 = `## OUTPUT FORMAT (JSON only, no markdown fences)
{
  "normalizedPhrase": "<lowercase stripped phrase>",
  "qualityVerdict": <"strong"|"usable"|"weak"|"reject">,
  "whyNow": "<why this phrase is relevant now, min 20 chars>",
  "targetBuyer": "<who buys this, min 20 chars>",
  "designStyle": "<design aesthetic direction>",
  "safetyVerdict": <"safe"|"review"|"blocked">,
  "safetyNotes": ["<any IP or content flags>"],
  "phraseVariations": [
    { "phrase": "<variant>", "angle": "<creative angle>", "risk": <"low"|"medium"|"high"> }
    // min 3, max 5 variations
  ],
  "designPrompts": [
    {
      "title": "<short concept title>",
      "prompt": "<full image prompt, min 50 chars, must end with the mandatory closing>",
      "platformFit": ["amazon"|"etsy"|"redbubble"],
      "styleTags": ["<tag1>", ...]
    }
    // exactly 5 items
  ],
  "listingKeywords": ["<keyword>", ...],
  "platformNotes": {
    "amazon": "<Amazon-specific listing guidance>",
    "etsy": "<Etsy-specific listing guidance>",
    "redbubble": "<Redbubble-specific listing guidance>"
  }
}`;

  return [block1, block2, block3, block4, block5].join("\n\n");
}

/*
Example rendered output for a "review" safety case:

Input:
  phrase: "nurse life matters"
  niche: "profession"
  qualityVerdict: "usable"
  targetBuyer: "nurses buying gifts for colleagues or themselves"
  designStyle: "bold sans-serif, medical accents"
  safetyVerdict: "review"
  safetyNotes: ["'matters' suffix may echo 'Black Lives Matter' — review carefully"]
  platformFit: ["amazon", "etsy"]

Rendered output:

## ENRICHMENT REQUEST
Phrase: "nurse life matters"
Niche: profession
Target buyer: nurses buying gifts for colleagues or themselves
Design style: bold sans-serif, medical accents
Quality verdict: usable

## SAFETY
Verdict: review — flag any elements that could be IP-sensitive in safetyNotes.
Known concerns: 'matters' suffix may echo 'Black Lives Matter' — review carefully
Avoid in all prompts: protected brand names, celebrity references, team/league names, copyrighted characters, exact copyrighted slogans.

## PLATFORM NOTES
Amazon Merch: typography-led designs, clean layouts, proven color palettes, minimal decoration.
Etsy: illustrative and artistic styles welcome, handcrafted aesthetic, storytelling through imagery.

## DESIGN PROMPT REQUIREMENTS
Return exactly 5 design prompts. Each prompt must:
1. Describe FLAT PRINTABLE artwork only — no physical products
2. Include ALL of the following elements:
   - Typography direction: font style, weight, and approximate size role
   - Central visual: the specific illustrated element (not vague)
   - Color palette: name specific colors (e.g. "dusty rose, ivory, charcoal") not generic terms
   - Layout: composition, hierarchy, relative placement of elements
   - Background: explicit color or texture specification
3. End with this exact closing: "flat graphic artwork only, NO t-shirt mockup, NO clothing, NO mannequin, solid black background, ar 4:5"
4. Never reference: protected brand names, celebrities, real people, team names, league names, copyrighted characters, or exact copyrighted slogans

## OUTPUT FORMAT (JSON only, no markdown fences)
{
  "normalizedPhrase": "<lowercase stripped phrase>",
  "qualityVerdict": <"strong"|"usable"|"weak"|"reject">,
  "whyNow": "<why this phrase is relevant now, min 20 chars>",
  "targetBuyer": "<who buys this, min 20 chars>",
  "designStyle": "<design aesthetic direction>",
  "safetyVerdict": <"safe"|"review"|"blocked">,
  "safetyNotes": ["<any IP or content flags>"],
  "phraseVariations": [
    { "phrase": "<variant>", "angle": "<creative angle>", "risk": <"low"|"medium"|"high"> }
    // min 3, max 5 variations
  ],
  "designPrompts": [
    {
      "title": "<short concept title>",
      "prompt": "<full image prompt, min 50 chars, must end with the mandatory closing>",
      "platformFit": ["amazon"|"etsy"|"redbubble"],
      "styleTags": ["<tag1>", ...]
    }
    // exactly 5 items
  ],
  "listingKeywords": ["<keyword>", ...],
  "platformNotes": {
    "amazon": "<Amazon-specific listing guidance>",
    "etsy": "<Etsy-specific listing guidance>",
    "redbubble": "<Redbubble-specific listing guidance>"
  }
}
*/
