import type { Route } from "next";

// Typed route constants — use these everywhere instead of raw strings.
// Next.js `<Link href={routes.trends}>` gives you refactor-safe navigation.

export const routes = {
  dashboard: "/" as Route,
  trends: "/trends" as Route,
  trend: (id: string) => `/trends/${id}` as Route,
  calendar: "/calendar" as Route,
  watchlist: "/watchlist" as Route,
  prompts: "/prompts" as Route,
  scanRuns: "/scan-runs" as Route,
  settings: "/settings" as Route,
  signIn: "/sign-in" as Route,
  signUp: "/sign-up" as Route,

  api: {
    trends: "/api/trends",
    trend: (id: string) => `/api/trends/${id}`,
    calendar: "/api/calendar",
    exports: "/api/exports",
    cronDailyScan: "/api/cron/daily-scan",
    health: "/api/health",
  },
} as const;

export type AppRoute = typeof routes;
