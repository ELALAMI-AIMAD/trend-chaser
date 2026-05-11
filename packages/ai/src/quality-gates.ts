import { BLOCKED_TERMS } from "@trend-chaser/core";
import type { AiEnrichmentOutput } from "./types";

export interface QualityGateFailure {
  gate: string;
  field: string;
  value: string;
  reason: string;
}

export interface QualityGateResult {
  passed: boolean;
  failures: QualityGateFailure[];
}

export function runGate(
  output: AiEnrichmentOutput,
  checker: (output: AiEnrichmentOutput) => QualityGateFailure[]
): QualityGateFailure[] {
  try {
    return checker(output);
  } catch {
    return [];
  }
}

// ─── Gate 1 ───────────────────────────────────────────────────────────────────

function checkNoDuplicatePhrases(output: AiEnrichmentOutput): QualityGateFailure[] {
  const failures: QualityGateFailure[] = [];
  const seen = new Set<string>();
  const base = output.normalizedPhrase.toLowerCase().trim();
  seen.add(base);

  output.phraseVariations.forEach((variation, i) => {
    const normalized = variation.phrase.toLowerCase().trim();
    if (seen.has(normalized)) {
      failures.push({
        gate: "NO_DUPLICATE_PHRASES",
        field: `phraseVariations[${i}].phrase`,
        value: variation.phrase.slice(0, 100),
        reason: `Duplicate of "${normalized}" already seen in output`,
      });
    } else {
      seen.add(normalized);
    }
  });
  return failures;
}

// ─── Gate 2 ───────────────────────────────────────────────────────────────────

const MOCKUP_TERMS = [
  "mockup",
  "model wearing",
  "photo of shirt",
  "person wearing",
  "t-shirt photo",
  "garment photo",
] as const;

function checkNoMockupLanguage(output: AiEnrichmentOutput): QualityGateFailure[] {
  const failures: QualityGateFailure[] = [];

  output.designPrompts.forEach((prompt, i) => {
    const text = prompt.prompt;
    const lower = text.toLowerCase();

    for (const term of MOCKUP_TERMS) {
      let idx = lower.indexOf(term);
      while (idx !== -1) {
        const prefix = lower.slice(Math.max(0, idx - 20), idx);
        const isNegated = /\b(no|not)\b/.test(prefix);
        if (!isNegated) {
          failures.push({
            gate: "NO_MOCKUP_LANGUAGE",
            field: `designPrompts[${i}].prompt`,
            value: text.slice(Math.max(0, idx - 10), idx + term.length + 10).slice(0, 100),
            reason: `Mockup language detected: "${term}"`,
          });
          break;
        }
        idx = lower.indexOf(term, idx + 1);
      }
    }
  });
  return failures;
}

// ─── Gate 3 ───────────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkNoBannedTerms(output: AiEnrichmentOutput): QualityGateFailure[] {
  const failures: QualityGateFailure[] = [];

  function scanField(text: string, fieldPath: string): void {
    for (const term of BLOCKED_TERMS) {
      const re = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
      if (re.test(text)) {
        failures.push({
          gate: "NO_BANNED_TERMS",
          field: fieldPath,
          value: text.slice(0, 100),
          reason: `Blocked term detected: "${term}"`,
        });
      }
    }
  }

  scanField(output.normalizedPhrase, "normalizedPhrase");
  output.phraseVariations.forEach((v, i) =>
    scanField(v.phrase, `phraseVariations[${i}].phrase`)
  );
  output.designPrompts.forEach((p, i) =>
    scanField(p.prompt, `designPrompts[${i}].prompt`)
  );
  return failures;
}

// ─── Gate 4 ───────────────────────────────────────────────────────────────────

const MIN_PROMPT_LENGTH = 50;

function checkPromptLength(output: AiEnrichmentOutput): QualityGateFailure[] {
  return output.designPrompts
    .map((prompt, i) => {
      if (prompt.prompt.length < MIN_PROMPT_LENGTH) {
        return {
          gate: "PROMPT_LENGTH",
          field: `designPrompts[${i}].prompt`,
          value: prompt.prompt.slice(0, 100),
          reason: `Prompt is ${prompt.prompt.length} chars, minimum is ${MIN_PROMPT_LENGTH}`,
        } satisfies QualityGateFailure;
      }
      return null;
    })
    .filter((f): f is QualityGateFailure => f !== null);
}

// ─── Gate 5 ───────────────────────────────────────────────────────────────────

const TRAILING_PREPOSITIONS = new Set([
  "with", "for", "to", "of", "in", "on", "at",
  "by", "from", "about", "into", "through",
]);

function checkGrammar(output: AiEnrichmentOutput): QualityGateFailure[] {
  const failures: QualityGateFailure[] = [];
  const phrase = output.normalizedPhrase;
  const words = phrase.trim().split(/\s+/).filter(Boolean);

  if (words.length < 2) {
    failures.push({
      gate: "GRAMMAR_CHECK",
      field: "normalizedPhrase",
      value: phrase,
      reason: `Phrase has only ${words.length} word(s) — too short`,
    });
  }

  if (words.length > 14) {
    failures.push({
      gate: "GRAMMAR_CHECK",
      field: "normalizedPhrase",
      value: phrase.slice(0, 100),
      reason: `Phrase has ${words.length} words — too long (max 14)`,
    });
  }

  const lastWord = words.at(-1)?.toLowerCase() ?? "";
  if (TRAILING_PREPOSITIONS.has(lastWord)) {
    failures.push({
      gate: "GRAMMAR_CHECK",
      field: "normalizedPhrase",
      value: phrase,
      reason: `Phrase ends with preposition "${lastWord}"`,
    });
  }

  const consecutiveDupe = /\b(\w+)\s+\1\b/i;
  if (consecutiveDupe.test(phrase)) {
    const match = consecutiveDupe.exec(phrase);
    failures.push({
      gate: "GRAMMAR_CHECK",
      field: "normalizedPhrase",
      value: phrase,
      reason: `Consecutive duplicate word: "${match?.[1] ?? "unknown"}"`,
    });
  }

  return failures;
}

// ─── Gate 6 ───────────────────────────────────────────────────────────────────

function checkKeywordQuality(output: AiEnrichmentOutput): QualityGateFailure[] {
  const failures: QualityGateFailure[] = [];
  const seen = new Set<string>();
  const basePhrase = output.normalizedPhrase.toLowerCase().trim();

  output.listingKeywords.forEach((kw, i) => {
    const normalized = kw.toLowerCase().trim();
    const field = `listingKeywords[${i}]`;

    if (seen.has(normalized)) {
      failures.push({
        gate: "KEYWORD_QUALITY",
        field,
        value: kw.slice(0, 100),
        reason: `Duplicate keyword "${kw}"`,
      });
    } else {
      seen.add(normalized);
    }

    if (kw.length < 3) {
      failures.push({
        gate: "KEYWORD_QUALITY",
        field,
        value: kw,
        reason: `Keyword "${kw}" is only ${kw.length} char(s) — minimum 3`,
      });
    }

    if (kw.length > 50) {
      failures.push({
        gate: "KEYWORD_QUALITY",
        field,
        value: kw.slice(0, 100),
        reason: `Keyword is ${kw.length} chars — maximum 50`,
      });
    }

    if (normalized === basePhrase) {
      failures.push({
        gate: "KEYWORD_QUALITY",
        field,
        value: kw.slice(0, 100),
        reason: `Keyword exactly matches normalizedPhrase — too broad for SEO`,
      });
    }
  });
  return failures;
}

// ─── Gate 7 ───────────────────────────────────────────────────────────────────

function checkPlatformCoverage(output: AiEnrichmentOutput): QualityGateFailure[] {
  const failures: QualityGateFailure[] = [];
  const allPlatforms = new Set(
    output.designPrompts.flatMap((p) => p.platformFit)
  );

  for (const platform of allPlatforms) {
    const covered = output.designPrompts.some((p) => p.platformFit.includes(platform));
    if (!covered) {
      failures.push({
        gate: "PLATFORM_COVERAGE",
        field: "designPrompts[*].platformFit",
        value: platform,
        reason: `Platform "${platform}" appears in output but no design prompt targets it`,
      });
    }
  }
  return failures;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function runQualityGates(output: AiEnrichmentOutput): QualityGateResult {
  const failures: QualityGateFailure[] = [
    ...runGate(output, checkNoDuplicatePhrases),
    ...runGate(output, checkNoMockupLanguage),
    ...runGate(output, checkNoBannedTerms),
    ...runGate(output, checkPromptLength),
    ...runGate(output, checkGrammar),
    ...runGate(output, checkKeywordQuality),
    ...runGate(output, checkPlatformCoverage),
  ];

  return { passed: failures.length === 0, failures };
}
