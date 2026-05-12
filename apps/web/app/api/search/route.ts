import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  callClaude,
  extractText,
  parseJsonResponse,
} from "@trend-chaser/ai";
import { searchLocalData, type AiTrendResult } from "@/lib/search";

// ─── Zod schema for Claude's JSON response ────────────────────────────────────

const CompetitionLevel = z.enum(["ultra-niche", "low", "medium", "high"]);

const AiTrendSchema = z.object({
  phrase: z.string(),
  niche: z.string(),
  temperature: z.enum(["hot", "warm", "cold"]),
  score: z.number().min(0).max(100),
  whyNow: z.string(),
  targetBuyer: z.string(),
  amazon: CompetitionLevel,
  etsy: CompetitionLevel,
  redbubble: CompetitionLevel,
  designPrompt: z.string(),
  keywords: z.array(z.string()),
});

const AiResponseSchema = z.object({
  trends: z.array(AiTrendSchema).max(5),
});

// ─── Claude search ────────────────────────────────────────────────────────────

async function searchWithClaude(keyword: string): Promise<AiTrendResult[]> {
  const userPrompt = `The user is searching for print-on-demand trends related to: "${keyword}"

Return 5 trending niche opportunities for this keyword on Amazon Merch, Etsy, and Redbubble.

Return ONLY valid JSON matching this exact shape:
{
  "trends": [
    {
      "phrase": "exact listing phrase",
      "niche": "niche category",
      "temperature": "hot" | "warm" | "cold",
      "score": 0-100,
      "whyNow": "1-2 sentences why this is trending right now",
      "targetBuyer": "1 sentence describing who buys this",
      "amazon": "ultra-niche" | "low" | "medium" | "high",
      "etsy": "ultra-niche" | "low" | "medium" | "high",
      "redbubble": "ultra-niche" | "low" | "medium" | "high",
      "designPrompt": "flat printable artwork description, no mockups or models",
      "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }
  ]
}`;

  try {
    const response = await callClaude({ userPrompt, maxTokens: 1500 });
    const text = extractText(response);
    const raw = parseJsonResponse(text);
    const parsed = AiResponseSchema.safeParse(raw);

    if (!parsed.success) return [];

    return parsed.data.trends.map((t, i) => ({
      type: "ai" as const,
      id: `ai-${keyword.replace(/\W+/g, "-").toLowerCase()}-${i}`,
      ...t,
    }));
  } catch {
    return [];
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();
  // force=true: user pressed Enter — call Claude even if local results >= 3
  const force = searchParams.get("force") === "true";

  if (query.length < 2) {
    return NextResponse.json({
      localResults: [],
      aiResults: [],
      hasAiResults: false,
    });
  }

  const localResults = searchLocalData(query);

  if (!force && localResults.length >= 3) {
    return NextResponse.json({
      localResults,
      aiResults: [],
      hasAiResults: false,
    });
  }

  const aiResults = await searchWithClaude(query);
  return NextResponse.json({
    localResults,
    aiResults,
    hasAiResults: aiResults.length > 0,
  });
}
