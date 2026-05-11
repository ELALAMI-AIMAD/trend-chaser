import type { SafetyVerdict } from "../types";

/**
 * Exact phrases that are trademarked, copyrighted, or licensed IP.
 * Any match → verdict: "blocked".
 */
export const BLOCKED_TERMS: string[] = [
  // Disney / Pixar characters
  "disney", "mickey mouse", "minnie mouse", "donald duck", "goofy",
  "buzz lightyear", "woody", "elsa", "anna", "olaf", "moana", "rapunzel",
  "cinderella", "ariel", "simba", "nala", "timon", "pumbaa",
  // Marvel
  "marvel", "avengers", "spider-man", "spiderman", "iron man", "thor", "hulk",
  "captain america", "black widow", "black panther", "wolverine", "deadpool",
  "x-men",
  // DC Comics
  "batman", "superman", "wonder woman", "aquaman", "the flash", "dc comics",
  // Star Wars / Lucasfilm
  "star wars", "darth vader", "yoda", "r2d2", "c3po", "mandalorian",
  "baby yoda", "grogu", "jedi", "sith",
  // Harry Potter / Wizarding World
  "harry potter", "hogwarts", "hermione", "ron weasley", "dumbledore",
  "voldemort", "slytherin", "gryffindor", "hufflepuff", "ravenclaw",
  "quidditch",
  // Nintendo / Pokémon
  "nintendo", "pokemon", "pikachu", "charmander", "bulbasaur", "squirtle",
  "mewtwo", "mario", "luigi", "zelda", "link", "kirby",
  // Other licensed characters
  "spongebob", "hello kitty", "sanrio", "peppa pig", "paw patrol",
  "bluey", "cocomelon",
  // Sports leagues (trademarked)
  "nfl", "nba", "mlb", "nhl", "nascar", "mls",
  "super bowl", "superbowl", "world series", "stanley cup", "nba finals",
  "ncaa", "college football playoff",
  // Protected events
  "olympic", "olympics", "paralympic", "paralympics",
  "fifa world cup", "uefa champions league",
  // Celebrities commonly exploited on POD without authorization
  "taylor swift", "swiftie", "beyonce", "beyoncé", "rihanna",
  "kanye west", "kim kardashian", "justin bieber", "ariana grande",
  "billie eilish", "harry styles", "lebron james", "michael jordan",
  "kobe bryant", "tom brady", "lionel messi", "cristiano ronaldo",
  // Book / film franchises
  "game of thrones", "lord of the rings", "hobbit", "gandalf",
  "transformers", "my little pony",
];

/**
 * Content categories that require mandatory human review even without an exact
 * BLOCKED_TERMS match. Any match → verdict: "review".
 */
export const HIGH_RISK_CATEGORIES: string[] = [
  // Medical / health claims
  "cure", "heals", "diagnose", "cancer fighter", "chemo", "covid", "vaccine",
  "anti-vax", "anti-vaxxer",
  // Political sensitivity
  "maga", "trump", "biden", "democrat", "republican", "antifa", "blm",
  "black lives matter", "all lives matter", "blue lives matter",
  // Tragedies / disasters
  "9/11", "september 11", "school shooting", "mass shooting", "genocide",
  "holocaust",
  // Hate / discrimination
  "white power", "white supremacy", "kkk", "nazi", "confederate flag",
];

/** Result of a phrase safety check. */
export interface PhraseCheckResult {
  verdict: SafetyVerdict;
  matchedTerms: string[];
  notes: string[];
}

/**
 * Checks a phrase against BLOCKED_TERMS and HIGH_RISK_CATEGORIES.
 * Blocked IP → "blocked". High-risk content → "review". Clean → "safe".
 */
export function checkPhrase(phrase: string): PhraseCheckResult {
  const lower = phrase.toLowerCase();

  const blockedMatches = BLOCKED_TERMS.filter((term) =>
    lower.includes(term.toLowerCase()),
  );
  const riskMatches = HIGH_RISK_CATEGORIES.filter((cat) =>
    lower.includes(cat.toLowerCase()),
  );

  const matchedTerms = [...blockedMatches, ...riskMatches];
  const notes: string[] = [];

  if (blockedMatches.length > 0) {
    notes.push(`Blocked IP detected: ${blockedMatches.join(", ")}`);
  }
  if (riskMatches.length > 0) {
    notes.push(
      `High-risk content: ${riskMatches.join(", ")}. Requires human review.`,
    );
  }

  const verdict: SafetyVerdict =
    blockedMatches.length > 0 ? "blocked"
    : riskMatches.length > 0  ? "review"
    : "safe";

  return { verdict, matchedTerms, notes };
}
