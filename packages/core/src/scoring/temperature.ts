import type { TrendTemperature } from "../types.js";

/** Returns a display label and hex color for a temperature value. */
export function getTemperatureBadge(
  temp: TrendTemperature,
): { label: string; color: string } {
  const badges: Record<TrendTemperature, { label: string; color: string }> = {
    hot:  { label: "Hot",  color: "#ff4d00" },
    warm: { label: "Warm", color: "#f59e0b" },
    cold: { label: "Cold", color: "#60a5fa" },
  };
  return badges[temp];
}

/** Returns an emoji icon for a temperature value. */
export function getTemperatureIcon(temp: TrendTemperature): string {
  const icons: Record<TrendTemperature, string> = {
    hot:  "🔥",
    warm: "☀️",
    cold: "❄️",
  };
  return icons[temp];
}

/**
 * Sort comparator for temperatures: hot → warm → cold.
 * Usage: `trends.sort((a, b) => compareTemperatures(a.temperature, b.temperature))`
 */
export function compareTemperatures(
  a: TrendTemperature,
  b: TrendTemperature,
): number {
  const order: Record<TrendTemperature, number> = { hot: 0, warm: 1, cold: 2 };
  return order[a] - order[b];
}
