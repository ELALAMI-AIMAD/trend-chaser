// Shared seed queries used by all POD-focused collectors (Etsy, Amazon, …)

export const SEED_QUERIES = [
  "funny sarcastic shirt", "dog mom life", "plant lady shirt",
  "teacher life shirt", "nurse life shirt", "cat mom shirt",
  "hiking outdoor shirt", "coffee lover shirt", "wine lover shirt",
  "book lover shirt", "retirement gift shirt", "birthday funny shirt",
  "fishing dad shirt", "girl dad shirt", "bonus dad shirt",
  "introvert shirt", "anxiety shirt", "mental health shirt",
  "cottagecore aesthetic", "vintage retro shirt", "motivational shirt",
  "graduation 2026 shirt", "summer vacation shirt",
  "beach life shirt", "camping shirt",
] as const

export type SeedQuery = (typeof SEED_QUERIES)[number]
