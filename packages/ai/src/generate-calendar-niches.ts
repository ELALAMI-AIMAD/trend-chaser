import {
  AiError,
  AiErrorCode,
} from "./types.js";
import {
  callClaude,
  extractText,
  parseJsonResponse,
  logTokenUsage,
} from "./anthropic.js";
import {
  CalendarNichesSchema,
  type CalendarNichesOutput,
} from "./schemas/calendar.schema.js";
import {
  buildCalendarNichesPrompt,
  PROMPT_VERSION,
  type CalendarNichesInput,
} from "./prompts/calendar-niches.prompt.js";

export type { CalendarNichesInput } from "./prompts/calendar-niches.prompt.js";

export interface CalendarNichesOptions {
  skipCache?: boolean;
  maxRetries?: number;
}

interface CacheEntry {
  result: CalendarNichesOutput;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 72 * 60 * 60 * 1000;

function getCached(key: string): CalendarNichesOutput | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.result;
}

function setCached(key: string, result: CalendarNichesOutput): void {
  _cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(event: string, data: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify({ event, ...data, ts: new Date().toISOString() }));
  } else {
    console.log(`[calendar-niches] ${event}`, data);
  }
}

function maxPlatformFit(niche: CalendarNichesOutput["subNiches"][number]): number {
  const { amazon, etsy, redbubble } = niche.platformFit;
  return Math.max(amazon, etsy, redbubble);
}

export async function generateCalendarNiches(
  input: CalendarNichesInput,
  options: CalendarNichesOptions = {}
): Promise<CalendarNichesOutput> {
  const startMs = Date.now();
  const cacheKey = `calendar:${input.eventName}:${input.eventDate}:${PROMPT_VERSION}`;

  if (options.skipCache !== true) {
    const cached = getCached(cacheKey);
    if (cached) {
      log("cache.hit", { cacheKey, eventName: input.eventName });
      return cached;
    }
    log("cache.miss", { cacheKey });
  }

  const userPrompt = buildCalendarNichesPrompt(input);
  const estimatedTokens = Math.ceil(userPrompt.length / 4);
  log("prompt.built", { estimatedTokens, promptVersion: PROMPT_VERSION, eventName: input.eventName });

  async function callWithRetry(
    prompt: string
  ): Promise<Awaited<ReturnType<typeof callClaude>>> {
    let firstErr: AiError | undefined;

    try {
      return await callClaude({ userPrompt: prompt });
    } catch (err) {
      if (err instanceof AiError) {
        if (err.code === AiErrorCode.RATE_LIMITED) {
          log("retry.rate_limited", { attempt: 1, reason: "rate_limited", waitMs: 60000, eventName: input.eventName });
          await sleep(60_000);
          try {
            return await callClaude({ userPrompt: prompt });
          } catch (retryErr) {
            if (retryErr instanceof AiError && retryErr.code === AiErrorCode.RATE_LIMITED) {
              throw new AiError(
                AiErrorCode.RETRY_EXHAUSTED,
                "Rate limited on both attempts",
                { eventName: input.eventName }
              );
            }
            throw retryErr;
          }
        }

        if (err.code === AiErrorCode.API_ERROR) {
          firstErr = err;
          log("retry.api_error", { attempt: 1, reason: "api_error", eventName: input.eventName });
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

  const response = await callWithRetry(userPrompt);

  let rawText: string;
  try {
    rawText = extractText(response);
  } catch (err) {
    if (err instanceof AiError) {
      throw err;
    }
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = parseJsonResponse(rawText);
  } catch (firstErr) {
    if (firstErr instanceof AiError && firstErr.code === AiErrorCode.INVALID_JSON) {
      log("parse.repair_attempt", { eventName: input.eventName, rawSnippet: rawText.slice(0, 100) });

      const repairPrompt =
        `The following is malformed JSON. Fix it and return valid JSON only. ` +
        `Do not add explanation or markdown. Original:\n${rawText.slice(0, 1500)}`;

      const repairResponse = await callClaude({ userPrompt: repairPrompt });
      const repairText = extractText(repairResponse);
      try {
        parsed = parseJsonResponse(repairText);
        log("parse.repaired", { eventName: input.eventName });
      } catch {
        throw new AiError(
          AiErrorCode.RETRY_EXHAUSTED,
          `JSON repair failed for event "${input.eventName}". Two parse attempts failed.`,
          { rawSnippet: rawText.slice(0, 200) }
        );
      }
    } else {
      throw firstErr;
    }
  }

  const validation = CalendarNichesSchema.safeParse(parsed);

  if (!validation.success) {
    const errors = validation.error.issues.slice(0, 3);
    const errorSummary = errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    log("validation.failed", {
      eventName: input.eventName,
      errorCount: validation.error.issues.length,
      firstErrors: errorSummary,
    });
    throw new AiError(
      AiErrorCode.VALIDATION_FAILURE,
      `Zod validation failed for event "${input.eventName}": ${errorSummary}`,
      { zodErrors: errors }
    );
  }

  const validated: CalendarNichesOutput = validation.data;

  const MIN_ANY_PLATFORM = 30;
  const beforeCount = validated.subNiches.length;

  const filtered = validated.subNiches.filter(
    (niche) => maxPlatformFit(niche) >= MIN_ANY_PLATFORM
  );

  if (filtered.length < beforeCount) {
    log("postprocess.filtered", {
      eventName: input.eventName,
      removed: beforeCount - filtered.length,
      remaining: filtered.length,
    });
  }

  if (filtered.length < 6) {
    log("postprocess.low_count_warning", {
      eventName: input.eventName,
      count: filtered.length,
      warning: "Fewer than 6 sub-niches survived platform fit filtering",
    });
  }

  const sorted = [...filtered].sort((a, b) => maxPlatformFit(b) - maxPlatformFit(a));

  const result: CalendarNichesOutput = {
    ...validated,
    subNiches: sorted,
  };

  setCached(cacheKey, result);

  logTokenUsage({
    operation: "generateCalendarNiches",
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    promptVersion: PROMPT_VERSION,
  });

  log("step.complete", {
    eventName: input.eventName,
    subNicheCount: result.subNiches.length,
    durationMs: Date.now() - startMs,
  });

  return result;
}
