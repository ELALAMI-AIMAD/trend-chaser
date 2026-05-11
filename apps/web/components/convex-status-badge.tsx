"use client";

import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";

const isConvexReady = Boolean(
  process.env.NEXT_PUBLIC_CONVEX_URL && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export function ConvexStatusBadge() {
  if (!isConvexReady) {
    return <span className="status-pill muted">Convex setup</span>;
  }

  return (
    <>
      <AuthLoading>
        <span className="status-pill muted">Convex checking</span>
      </AuthLoading>
      <Authenticated>
        <span className="status-pill live">Convex live</span>
      </Authenticated>
      <Unauthenticated>
        <span className="status-pill ready">Convex ready</span>
      </Unauthenticated>
    </>
  );
}
