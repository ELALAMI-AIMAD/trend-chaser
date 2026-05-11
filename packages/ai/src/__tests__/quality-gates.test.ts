import { describe, it, expect } from "vitest";
import { runQualityGates, runGate } from "../quality-gates";
import type { AiEnrichmentOutput } from "../types";

function makeOutput(overrides: Partial<AiEnrichmentOutput> = {}): AiEnrichmentOutput {
  return {
    normalizedPhrase: "dog mom life",
    qualityVerdict: "strong",
    whyNow: "Growing pet humanization trend",
    targetBuyer: "Women who treat their dogs as family members",
    designStyle: "Bold script with paw accents",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "proud dog mom", angle: "pride", risk: "low" },
      { phrase: "dog mama crew", angle: "community", risk: "low" },
      { phrase: "life is better with dogs", angle: "lifestyle", risk: "low" },
    ],
    designPrompts: Array.from({ length: 5 }, (_, i) => ({
      title: `Design ${i + 1}`,
      prompt: `A bold flat graphic with centered bold italic script reading dog mom in coral pink, surrounded by minimal paw print icons in charcoal grey, clean white background, flat graphic artwork only, NO t-shirt mockup, NO clothing, NO mannequin, solid black background, ar 4:5`,
      platformFit: ["amazon" as const, "etsy" as const],
      styleTags: ["bold", "typography"],
    })),
    listingKeywords: [
      "dog mom", "dog lover", "pet mom", "dog mama",
      "dog owner gift", "fur mom", "dog life", "paw mom",
      "dog mom shirt", "love dogs",
    ],
    platformNotes: {
      amazon: "Typography-led, high-contrast design works well for search browsing",
      etsy: "Illustrative elements and warm tones appeal to handmade gift shoppers",
      redbubble: "Bold graphic works across stickers and totes",
    },
    ...overrides,
  };
}

describe("runQualityGates", () => {
  it("passes a valid output with no failures", () => {
    const result = runQualityGates(makeOutput());
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });
});

describe("Gate 1 — NO_DUPLICATE_PHRASES", () => {
  it("catches a phrase variation that duplicates normalizedPhrase", () => {
    const output = makeOutput({
      phraseVariations: [
        { phrase: "Dog Mom Life", angle: "exact duplicate of normalized", risk: "low" },
        { phrase: "proud dog mom", angle: "pride", risk: "low" },
        { phrase: "dog mama crew", angle: "community", risk: "low" },
      ],
    });
    const result = runQualityGates(output);
    expect(result.passed).toBe(false);
    const dup = result.failures.find((f) => f.gate === "NO_DUPLICATE_PHRASES");
    expect(dup).toBeDefined();
    expect(dup?.field).toBe("phraseVariations[0].phrase");
  });

  it("catches duplicate variation within variations list", () => {
    const output = makeOutput({
      phraseVariations: [
        { phrase: "proud dog mom", angle: "pride", risk: "low" },
        { phrase: "proud dog mom", angle: "again", risk: "low" },
        { phrase: "dog mama crew", angle: "community", risk: "low" },
      ],
    });
    const result = runQualityGates(output);
    const failures = result.failures.filter((f) => f.gate === "NO_DUPLICATE_PHRASES");
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0].field).toBe("phraseVariations[1].phrase");
  });
});

describe("Gate 2 — NO_MOCKUP_LANGUAGE", () => {
  it("flags 'model wearing' in a prompt", () => {
    const output = makeOutput({
      designPrompts: makeOutput().designPrompts.map((p, i) =>
        i === 2
          ? { ...p, prompt: "A beautiful flat graphic showing a model wearing the shirt with dogs on it" }
          : p
      ),
    });
    const result = runQualityGates(output);
    const failures = result.failures.filter((f) => f.gate === "NO_MOCKUP_LANGUAGE");
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0].field).toBe("designPrompts[2].prompt");
  });

  it("does NOT flag 'NO mockup' as a negative instruction", () => {
    const result = runQualityGates(makeOutput());
    const mockupFailures = result.failures.filter((f) => f.gate === "NO_MOCKUP_LANGUAGE");
    expect(mockupFailures).toHaveLength(0);
  });
});

describe("Gate 4 — PROMPT_LENGTH", () => {
  it("flags a prompt shorter than 50 chars", () => {
    const output = makeOutput({
      designPrompts: makeOutput().designPrompts.map((p, i) =>
        i === 0 ? { ...p, prompt: "Short prompt." } : p
      ),
    });
    const result = runQualityGates(output);
    const failures = result.failures.filter((f) => f.gate === "PROMPT_LENGTH");
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0].field).toBe("designPrompts[0].prompt");
    expect(failures[0].reason).toContain("minimum is 50");
  });
});

describe("Gate 5 — GRAMMAR_CHECK", () => {
  it("flags a phrase with consecutive duplicate words", () => {
    const output = makeOutput({ normalizedPhrase: "my my dog life" });
    const result = runQualityGates(output);
    const failure = result.failures.find(
      (f) => f.gate === "GRAMMAR_CHECK" && f.reason.includes("duplicate word")
    );
    expect(failure).toBeDefined();
  });

  it("flags a one-word phrase as too short", () => {
    const output = makeOutput({ normalizedPhrase: "dogs" });
    const result = runQualityGates(output);
    const failure = result.failures.find(
      (f) => f.gate === "GRAMMAR_CHECK" && f.reason.includes("too short")
    );
    expect(failure).toBeDefined();
  });

  it("flags a phrase ending with a preposition", () => {
    const output = makeOutput({ normalizedPhrase: "dog mom life for" });
    const result = runQualityGates(output);
    const failure = result.failures.find(
      (f) => f.gate === "GRAMMAR_CHECK" && f.reason.includes("preposition")
    );
    expect(failure).toBeDefined();
  });
});

describe("Gate 6 — KEYWORD_QUALITY", () => {
  it("flags a duplicate keyword", () => {
    const base = makeOutput();
    const output = makeOutput({
      listingKeywords: [...base.listingKeywords, "dog mom"],
    });
    const result = runQualityGates(output);
    const failure = result.failures.find(
      (f) => f.gate === "KEYWORD_QUALITY" && f.reason.includes("Duplicate")
    );
    expect(failure).toBeDefined();
  });

  it("flags a keyword under 3 chars", () => {
    const output = makeOutput({
      listingKeywords: [...makeOutput().listingKeywords.slice(0, 9), "ok"],
    });
    const result = runQualityGates(output);
    const failure = result.failures.find(
      (f) => f.gate === "KEYWORD_QUALITY" && f.reason.includes("minimum 3")
    );
    expect(failure).toBeDefined();
  });
});
