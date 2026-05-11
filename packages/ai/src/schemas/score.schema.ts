import { z } from "zod";

export const ScoreSchema = z
  .object({
    demand: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe(
        "Market demand score 0–100 (integer). Reflects consumer interest signals detected across data sources; higher means stronger demand."
      ),
    competition: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe(
        "Competitive saturation score 0–100 (integer). Higher means more competitors are already selling similar products."
      ),
    velocity: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe(
        "Trend velocity score 0–100 (integer). Measures how quickly interest is growing; higher means faster acceleration."
      ),
    timing: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe(
        "Market timing score 0–100 (integer). Indicates how well the trend aligns with seasonal or cyclical windows; higher means better timing."
      ),
    platformFit: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe(
        "Platform fit score 0–100 (integer). Reflects how well the trend suits the target selling platform (e.g. Etsy, Amazon); higher means stronger fit."
      ),
    ipSafety: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe(
        "IP and trademark safety score 0–100 (integer). 100 means no IP concerns detected. Must be ≥ 70 when temperature is 'hot'."
      ),
    confidence: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe(
        "Model confidence score 0–100 (integer). Represents certainty in the overall scoring assessment based on data quality and coverage."
      ),
    temperature: z
      .enum(["hot", "warm", "cold"])
      .describe(
        "Overall trend temperature: 'hot' (act now), 'warm' (worth testing), or 'cold' (low priority or declining)."
      ),
    decision: z
      .enum(["design_now", "test_small", "watch", "skip"])
      .describe(
        "Recommended action: 'design_now' (high confidence, move immediately), 'test_small' (run a limited test), 'watch' (monitor for changes), or 'skip' (not worth pursuing)."
      ),
    reasonCodes: z
      .array(z.string().trim().min(1))
      .min(1)
      .describe(
        "Non-empty list of short machine-readable codes explaining the scoring outcome (e.g. 'HIGH_DEMAND_SIGNALS', 'LOW_COMPETITION'). At least one code is required."
      ),
    warnings: z
      .array(z.string().trim())
      .describe(
        "List of human-readable caution notices relevant to this trend (e.g. IP risks, thin data). May be empty if no warnings apply."
      ),
    explanation: z
      .string()
      .trim()
      .min(30)
      .describe(
        "Human-readable explanation of the scoring rationale (minimum 30 characters). Summarises the key factors and is suitable for display in the dashboard."
      ),
  })
  .refine((data) => data.temperature !== "hot" || data.ipSafety >= 70, {
    message: "A 'hot' trend must have ipSafety >= 70",
    path: ["ipSafety"],
  })
  .refine(
    (data) =>
      data.decision !== "design_now" ||
      data.temperature === "hot" ||
      data.temperature === "warm",
    {
      message: "Decision 'design_now' requires temperature 'hot' or 'warm'",
      path: ["decision"],
    }
  );

export type ScoreOutput = z.infer<typeof ScoreSchema>;
