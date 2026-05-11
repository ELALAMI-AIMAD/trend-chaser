import { z } from "zod";

export const PhraseVariationSchema = z.object({
  phrase: z
    .string()
    .trim()
    .min(1)
    .describe("A variation of the original trend phrase targeting a specific angle or audience."),
  angle: z
    .string()
    .trim()
    .min(1)
    .describe("The creative or marketing angle this phrase variation targets (e.g., humor, sentiment, niche)."),
  risk: z
    .enum(["low", "medium", "high"])
    .describe("Estimated IP or policy risk level for listing this phrase variation on print-on-demand platforms."),
});

export const DesignPromptItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .describe("Short human-readable title identifying the design concept."),
  prompt: z
    .string()
    .trim()
    .min(50)
    .describe("Detailed generative-AI image prompt (at least 50 characters) describing the design to produce."),
  platformFit: z
    .array(z.enum(["amazon", "etsy", "redbubble"]))
    .min(1)
    .describe("The print-on-demand platforms this design is best suited for; at least one must be specified."),
  styleTags: z
    .array(z.string().trim().min(1))
    .describe("Visual style tags (e.g., 'minimalist', 'retro', 'bold typography') that categorize the design aesthetic."),
});

export const EnrichmentSchema = z.object({
  normalizedPhrase: z
    .string()
    .trim()
    .min(1)
    .describe("The normalized (lowercase, stripped) phrase being enriched."),
  qualityVerdict: z
    .enum(["strong", "usable", "weak", "reject"])
    .describe("Claude's assessment of the phrase's commercial viability: strong = high potential, usable = acceptable, weak = low potential, reject = not suitable."),
  whyNow: z
    .string()
    .trim()
    .min(1)
    .describe("Explanation of why this phrase is trending or relevant right now, grounding the opportunity in current context."),
  targetBuyer: z
    .string()
    .trim()
    .min(1)
    .describe("Description of the primary buyer persona most likely to purchase products featuring this phrase."),
  designStyle: z
    .string()
    .trim()
    .min(1)
    .describe("Recommended overall design aesthetic for products using this phrase (e.g., 'bold sans-serif, high contrast')."),
  safetyVerdict: z
    .enum(["safe", "review", "blocked"])
    .describe("IP and content safety verdict: safe = clear to list, review = needs manual review, blocked = do not list."),
  safetyNotes: z
    .array(z.string().trim())
    .describe("List of specific safety concerns or IP flags; empty array means the phrase is clean."),
  phraseVariations: z
    .array(PhraseVariationSchema)
    .min(3)
    .max(5)
    .describe("Between 3 and 5 alternative phrasings of the trend, each with a distinct angle and risk assessment."),
  designPrompts: z
    .array(DesignPromptItemSchema)
    .min(5)
    .max(5)
    .describe("Exactly 5 ready-to-use generative-AI design prompts for products based on this trend phrase."),
  listingKeywords: z
    .array(z.string().trim().min(1))
    .min(10)
    .max(40)
    .describe("Between 10 and 40 SEO keywords suitable for product listings on print-on-demand platforms."),
  platformNotes: z
    .object({
      amazon: z
        .string()
        .trim()
        .describe("Guidance specific to listing this trend phrase on Amazon Merch on Demand (policies, category fit, tips)."),
      etsy: z
        .string()
        .trim()
        .describe("Guidance specific to listing this trend phrase on Etsy (audience fit, tagging tips, shop considerations)."),
      redbubble: z
        .string()
        .trim()
        .describe("Guidance specific to listing this trend phrase on Redbubble (community guidelines, product type fit)."),
    })
    .describe("Platform-specific notes for Amazon, Etsy, and Redbubble covering listing strategy and policy considerations."),
});

export type EnrichmentOutput = z.infer<typeof EnrichmentSchema>;
