/**
 * Normalizes a trend phrase for deduplication and comparison:
 * lowercases, expands &→and, strips non-alphanumeric chars, collapses whitespace.
 */
export function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
