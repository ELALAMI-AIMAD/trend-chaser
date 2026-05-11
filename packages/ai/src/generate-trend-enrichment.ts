import { checkPhrase } from "@trend-chaser/core";
import {
  AiError,
  AiErrorCode,
  type AiEnrichmentOutput,
} from "./types.js";
import {
  callClaude,
  extractText,
  parseJsonResponse,
  logTokenUsage,
  CLAUDE_MODEL,
} from "./anthropic.js";
import { EnrichmentSchema } from "./schemas/enrichment.schema.js";
import {
  buildDesignPromptsPrompt,
  PROMPT_VERSION,
  type DesignPromptsInput,
} from "./prompts/design-prompts.prompt.js";
import { runQualityGates } from "./quality-gates.js";

export interface TrendEnrichmentInput {
  trendCandidateId: string;
  phrase: string;
  niche: string;
  qualityVerdict: "strong" | "usable" | "weak" | "reject";
  targetBuyer: string;
  designStyle: string;
  platformFit: Array<"amazon" | "etsy" | "redbubble">;
}

export interface TrendEnrichmentOptions {
  skipCache?: boolean;
  promptVersion?: string;
  maxRetries?: number;
}

interface CacheEntry {
  result: AiEnrichmentOutput;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCached(key: string): AiEnrichmentOutput | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(key);
    return null;
  }
  return entry.result;
}

function setCached(key: string, result: AiEnrichmentOutput): void {
  _cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(event: string, data: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify({ event, ...data, ts: new Date().toISOString() }));
  } else {
    console.log(`[enrichment] ${event}`, data);
  }
}

export async function generateTrendEnrichment(
  input: TrendEnrichmentInput,
  options: TrendEnrichmentOptions = {}
): Promise<AiEnrichmentOutput> {
  const startMs = Date.now();
  log("step.safety_precheck", { phrase: input.phrase });

  const safetyCheck = checkPhrase(input.phrase);

  if (safetyCheck.verdict === "blocked") {
    log("safety.blocked", {
      phrase: input.phrase,
      matchedTerms: safetyCheck.matchedTerms,
      notes: safetyCheck.notes,
    });
    throw new AiError(
      AiErrorCode.SAFETY_BLOCKED,
      `Phrase "${input.phrase}" is blocked: ${safetyCheck.notes.join("; ")}`,
      { matchedTerms: safetyCheck.matchedTerms }
    );
  }

  const cacheKey = `${input.trendCandidateId}:${options.promptVersion ?? PROMPT_VERSION}`;

  if (options.skipCache !== true) {
    const cached = getCached(cacheKey);
    if (cached) {
      log("cache.hit", { cacheKey, phrase: input.phrase });
      return cached;
    }
    log("cache.miss", { cacheKey });
  }

  const promptInput: DesignPromptsInput = {
    phrase: input.phrase,
    niche: input.niche,
    qualityVerdict: input.qualityVerdict,
    targetBuyer: input.targetBuyer,
    designStyle: input.designStyle,
    safetyVerdict: safetyCheck.verdict,
    safetyNotes: safetyCheck.notes,
    platformFit: input.platformFit,
  };

  const userPrompt = buildDesignPromptsPrompt(promptInput);
  const estimatedTokens = Math.ceil(userPrompt.length / 4);
  log("prompt.built", { estimatedTokens, promptVersion: PROMPT_VERSION });

  async function callWithRetry(
    prompt: string,
    maxRetries: number
  ): Promise<Awaited<ReturnType<typeof callClaude>>> {
    let firstErr: AiError | undefined;

    try {
      return await callClaude({ userPrompt: prompt });
    } catch (err) {
      if (err instanceof AiError) {
        if (err.code === AiErrorCode.RATE_LIMITED) {
          log("retry.rate_limited", { attempt: 1, reason: "rate_limited", waitMs: 60000 });
          await sleep(60_000);
          try {
            return await callClaude({ userPrompt: prompt });
          } catch (retryErr) {
            if (retryErr instanceof AiError && retryErr.code === AiErrorCode.RATE_LIMITED) {
              throw new AiError(
                AiErrorCode.RETRY_EXHAUSTED,
                "Rate limited on both attempts",
                { phrase: input.phrase }
              );
            }
            throw retryErr;
          }
        }

        if (err.code === AiErrorCode.API_ERROR) {
          firstErr = err;
          log("retry.api_error", { attempt: 1, reason: "api_error" });
          try {
            return await callClaude({ userPrompt: prompt });
          } catch {
            throw firstErr;
          }
        }

        throw err;
      }

      throw new AiError(
        AiErrorCode.API_ERROR,
        `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        { cause: String(err) }
      );
    }
  }

  const response = await callWithRetry(userPrompt, options.maxRetries ?? 1);

  const rawText = extractText(response);

  let parsed: unknown;
  try {
    parsed = parseJsonResponse(rawText);
  } catch (firstErr) {
    if (firstErr instanceof AiError && firstErr.code === AiErrorCode.INVALID_JSON) {
      log("parse.repair_attempt", { phrase: input.phrase, rawSnippet: rawText.slice(0, 100) });

      const repairPrompt =
        `The following is malformed JSON. Fix it and return valid JSON only. ` +
        `Do not add explanation or markdown. Original:\n${rawText.slice(0, 1500)}`;

      const repairResponse = await callClaude({ userPrompt: repairPrompt });
      const repairText = extractText(repairResponse);
      try {
        parsed = parseJsonResponse(repairText);
        log("parse.repaired", { phrase: input.phrase });
      } catch {
        throw new AiError(
          AiErrorCode.RETRY_EXHAUSTED,
          `JSON repair failed for phrase "${input.phrase}". Two parse attempts failed.`,
          { rawSnippet: rawText.slice(0, 200) }
        );
      }
    } else {
      throw firstErr;
    }
  }

  const validation = EnrichmentSchema.safeParse(parsed);

  if (!validation.success) {
    const errors = validation.error.issues.slice(0, 3);
    const errorSummary = errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");

    log("validation.failed", {
      phrase: input.phrase,
      errorCount: validation.error.issues.length,
      firstErrors: errorSummary,
    });

    throw new AiError(
      AiErrorCode.VALIDATION_FAILURE,
      `Zod validation failed for phrase "${input.phrase}": ${errorSummary}`,
      { zodErrors: errors }
    );
  }

  const validated = validation.data as AiEnrichmentOutput;

  const gateResult = runQualityGates(validated);

  if (!gateResult.passed) {
    log("quality_gates.failed", {
      phrase: input.phrase,
      failures: gateResult.failures,
    });
  }

  setCached(cacheKey, validated);

  logTokenUsage({
    operation: "generateTrendEnrichment",
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    promptVersion: options.promptVersion ?? PROMPT_VERSION,
  });

  log("step.complete", {
    phrase: input.phrase,
    qualityVerdict: validated.qualityVerdict,
    durationMs: Date.now() - startMs,
    gatesPassed: gateResult.passed,
  });

  return validated;
}
