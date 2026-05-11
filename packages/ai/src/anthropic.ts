import Anthropic from "@anthropic-ai/sdk";
import { AiError, AiErrorCode } from "./types";

export const POD_SYSTEM_PROMPT =
  "You are a POD trend analyst for Amazon Merch, Etsy, and Redbubble. " +
  "Return JSON only. No preamble, no markdown fences, no explanation. " +
  "Do not include copyrighted characters, team names, brand names, celebrity names, " +
  "or protected event names unless input explicitly says licensed. " +
  "Design prompts must describe flat printable artwork only. " +
  "Never describe t-shirt mockups, clothing on models, or mannequins.";

export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL ?? "claude-sonnet-4-20250514";

export const MAX_TOKENS = 3000;

let _client: Anthropic | undefined;

export function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AiError(
        AiErrorCode.API_ERROR,
        "ANTHROPIC_API_KEY is not set. Set it in your environment before calling any AI functions.",
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export function extractText(response: Anthropic.Message): string {
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new AiError(
      AiErrorCode.EMPTY_RESPONSE,
      "Claude returned a response with no text content.",
      { stopReason: response.stop_reason },
    );
  }
  return text;
}

export function parseJsonResponse(text: string): unknown {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    throw new AiError(
      AiErrorCode.INVALID_JSON,
      "Claude returned a response that could not be parsed as JSON.",
      { rawText: stripped.slice(0, 500) },
    );
  }
}

const INPUT_COST_PER_M  = 3.00;
const OUTPUT_COST_PER_M = 15.00;

export function logTokenUsage(params: {
  operation: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  promptVersion: string;
}): void {
  const estimatedCostUsd =
    (params.inputTokens  / 1_000_000) * INPUT_COST_PER_M +
    (params.outputTokens / 1_000_000) * OUTPUT_COST_PER_M;

  if (process.env.NODE_ENV === "production") {
    console.log(
      JSON.stringify({
        event: "ai_token_usage",
        operation: params.operation,
        model: params.model,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        promptVersion: params.promptVersion,
        estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
        timestamp: new Date().toISOString(),
      }),
    );
  } else {
    console.log(
      `[ai] ${params.operation} | model=${params.model} | ` +
      `in=${params.inputTokens} out=${params.outputTokens} | ` +
      `~$${estimatedCostUsd.toFixed(6)} | v=${params.promptVersion}`,
    );
  }
}

export async function callClaude(params: {
  userPrompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}): Promise<Anthropic.Message> {
  const client = getClient();
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: params.maxTokens ?? MAX_TOKENS,
      system: params.systemPrompt ?? POD_SYSTEM_PROMPT,
      messages: [{ role: "user", content: params.userPrompt }],
    });

    logTokenUsage({
      operation: "callClaude",
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      promptVersion: "unknown",
    });

    return response;
  } catch (err) {
    if (err instanceof AiError) throw err;
    throw new AiError(
      AiErrorCode.API_ERROR,
      `Anthropic API error: ${err instanceof Error ? err.message : String(err)}`,
      { cause: String(err) },
    );
  }
}
