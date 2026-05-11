import { describe, it, expect } from "vitest";
import { normalizePhrase } from "../normalization/normalize-phrase";

describe("normalizePhrase", () => {
  it("lowercases all characters", () => {
    expect(normalizePhrase("CAMPING MOM")).toBe("camping mom");
  });

  it("expands & to and", () => {
    expect(normalizePhrase("Coffee & Tea")).toBe("coffee and tea");
  });

  it("removes special characters except letters, numbers, spaces", () => {
    expect(normalizePhrase("dog mom!")).toBe("dog mom");
    expect(normalizePhrase("cat-lover")).toBe("catlover");
    expect(normalizePhrase("nurse's life")).toBe("nurses life");
  });

  it("collapses multiple spaces into one", () => {
    expect(normalizePhrase("nurse  life")).toBe("nurse life");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizePhrase("  beach vibes  ")).toBe("beach vibes");
  });

  it("handles a complex phrase end-to-end", () => {
    expect(normalizePhrase("  Teacher's Life & Love! ")).toBe("teachers life and love");
  });

  it("returns empty string for blank input", () => {
    expect(normalizePhrase("")).toBe("");
    expect(normalizePhrase("   ")).toBe("");
  });

  it("preserves numbers", () => {
    expect(normalizePhrase("Class of 2025")).toBe("class of 2025");
  });
});
