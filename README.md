# Trend Chaser

Next.js rebuild scaffold for the Trend Chaser POD trend intelligence dashboard.

## Quick Start

```bash
npm install
npm run dev
```

The web app lives in `apps/web` and starts on `http://localhost:3000`.

## Clerk Setup

Create `Trend-chaser/.env.local` with your Clerk keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
```

The dashboard route is protected by Clerk. The public routes are `/sign-in`, `/sign-up`, and `/api/health`.

## Convex Setup

Create or connect a Convex project from the web workspace:

```bash
npm run convex:dev
```

Convex will create/update `.env.local` values like:

```bash
CONVEX_DEPLOYMENT="dev:..."
NEXT_PUBLIC_CONVEX_URL="https://...convex.cloud"
```

Because this app uses Clerk, activate Clerk's Convex integration in the Clerk Dashboard, copy the Clerk Frontend API URL, and set it in the Convex dashboard environment variables:

```bash
CLERK_JWT_ISSUER_DOMAIN="https://your-clerk-instance.clerk.accounts.dev"
```

Useful commands:

```bash
npm run convex:codegen
npm run convex:dev
npm run convex:deploy
```

The starter Convex backend lives in `apps/web/convex`.

## Current Setup

- Next.js App Router
- React and TypeScript
- Tailwind CSS 4
- Clerk authentication
- Convex backend scaffold
- npm workspaces
- Seeded dashboard using data patterns from the exported report
- Health route at `/api/health`

## Blueprint Docs

The root markdown files document the rebuild architecture, data sources, automation pipeline, AI integration, design system, and launch roadmap.
