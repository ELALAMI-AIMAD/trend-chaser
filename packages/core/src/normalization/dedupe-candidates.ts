import type { TrendCandidate, TrendCandidateFamily } from "../types";
import { normalizePhrase } from "./normalize-phrase";

/**
 * Groups trend candidates by their normalized phrase, merging source arrays
 * and collecting all canonical phrase variants into families.
 * Returns one TrendCandidateFamily per unique normalized form.
 */
export function dedupeCandidates(
  candidates: TrendCandidate[],
): TrendCandidateFamily[] {
  const families = new Map<string, TrendCandidateFamily>();

  for (const candidate of candidates) {
    const key = normalizePhrase(candidate.canonicalPhrase);

    if (!families.has(key)) {
      families.set(key, {
        normalizedPhrase: key,
        variants: [],
        candidates: [],
        mergedSources: [],
      });
    }

    const family = families.get(key)!;
    family.candidates.push(candidate);

    if (!family.variants.includes(candidate.canonicalPhrase)) {
      family.variants.push(candidate.canonicalPhrase);
    }

    for (const source of candidate.sources) {
      if (!family.mergedSources.includes(source)) {
        family.mergedSources.push(source);
      }
    }
  }

  return Array.from(families.values());
}
