import { z } from "zod";

export const SubNicheSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3)
      .describe(
        "Descriptive label for the sub-niche (minimum 3 characters). Should convey a specific angle or audience segment, not a vague single-word stub like 'Dad' or 'Pets'."
      ),
    buyer: z
      .string()
      .trim()
      .min(10)
      .describe(
        "Detailed buyer persona for this sub-niche (minimum 10 characters). Must characterise who the purchaser is — their relationship, motivation, or demographic — rather than a generic label like 'Adults' or 'People'."
      ),
    phraseAngles: z
      .array(z.string().trim().min(1))
      .min(2)
      .max(6)
      .describe(
        "Between 2 and 6 distinct copy or messaging angles for this sub-niche. Each angle is a short phrase that could anchor a product title, tag, or ad hook; multiple angles are required to cover different buyer intents."
      ),
    platformFit: z
      .object({
        amazon: z
          .number()
          .int()
          .min(0)
          .max(100)
          .describe(
            "Fit score for Amazon (0–100, integer). Reflects how well this sub-niche performs on Amazon's high-volume, search-driven marketplace where broad appeal and fast shipping expectations dominate."
          ),
        etsy: z
          .number()
          .int()
          .min(0)
          .max(100)
          .describe(
            "Fit score for Etsy (0–100, integer). Reflects how well this sub-niche suits Etsy's handmade, personalised, and gift-focused audience where uniqueness and emotional resonance matter most."
          ),
        redbubble: z
          .number()
          .int()
          .min(0)
          .max(100)
          .describe(
            "Fit score for Redbubble (0–100, integer). Reflects suitability for Redbubble's print-on-demand catalogue where graphic-heavy, community-driven, and pop-culture adjacent designs thrive."
          ),
      })
      .describe(
        "Platform fit scores for the three primary selling channels. Each score is an integer from 0 (poor fit) to 100 (ideal fit), and at least one must reach 50 to confirm the sub-niche is viable somewhere."
      ),
    recommendedStyle: z
      .string()
      .trim()
      .min(5)
      .describe(
        "Creative or design direction recommended for this sub-niche (minimum 5 characters). Should specify a visual treatment, tone, or format — e.g. 'minimalist line art with muted earth tones' — not a single descriptor like 'bold'."
      ),
    riskNotes: z
      .array(z.string().trim())
      .describe(
        "List of potential risks, IP concerns, or caveats for this sub-niche. May be empty when no meaningful risks exist, but should flag trademark exposure, cultural sensitivity issues, or market saturation where relevant."
      ),
  })
  .refine(
    (data) =>
      Object.values(data.platformFit).some((score) => score >= 50),
    {
      message: "At least one platform fit score must be >= 50",
      path: ["platformFit"],
    }
  )
  .refine(
    (data) => {
      const normalised = data.phraseAngles.map((p) => p.trim().toLowerCase());
      return new Set(normalised).size === normalised.length;
    },
    {
      message: "phraseAngles must all be unique",
      path: ["phraseAngles"],
    }
  );

export const CalendarNichesSchema = z.object({
  eventName: z
    .string()
    .trim()
    .min(1)
    .describe(
      "The calendar event or holiday this expansion targets (e.g. 'Father's Day', 'Halloween'). Must be a non-empty trimmed string identifying the occasion that drives the niche research."
    ),
  subNiches: z
    .array(SubNicheSchema)
    .min(8)
    .max(8)
    .describe(
      "Exactly 8 sub-niches derived from the calendar event. Each entry represents a distinct audience segment or product angle that can be pursued independently across one or more platforms."
    ),
});

export type CalendarNichesOutput = z.infer<typeof CalendarNichesSchema>;
