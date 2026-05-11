import type { IpSafetyCheck, SafetyVerdict } from "../types";
import { checkPhrase, HIGH_RISK_CATEGORIES } from "./restricted-terms";

/**
 * Runs a full IP and trademark safety scan on a trend phrase.
 * Checks for trademarks, brand names, celebrity names, protected event names,
 * medical claims, and political sensitivity.
 *
 * High-risk categories always require human review.
 * Returns an IpSafetyCheck with a 0-100 safety score (100 = fully safe).
 */
export function scanIpSafety(phrase: string): IpSafetyCheck {
  const { verdict, matchedTerms, notes } = checkPhrase(phrase);

  const riskCatSet = new Set(HIGH_RISK_CATEGORIES.map((c) => c.toLowerCase()));
  const highRiskCategories = matchedTerms.filter((t) =>
    riskCatSet.has(t.toLowerCase()),
  );

  return {
    phrase,
    verdict,
    score: verdictToScore(verdict, matchedTerms.length),
    matchedTerms,
    highRiskCategories,
    notes,
    checkedAt: new Date().toISOString(),
  };
}

function verdictToScore(verdict: SafetyVerdict, matchCount: number): number {
  switch (verdict) {
    case "blocked": return Math.max(0, 20 - matchCount * 10);
    case "review":  return Math.max(30, 65 - matchCount * 10);
    case "safe":    return 100;
  }
}
