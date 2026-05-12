"use client";

import { useSyncExternalStore } from "react";

function formatLastScan(iso: string | null): string {
  if (!iso) return "today 00:49";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return isToday
    ? `today ${time}`
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ScanBadge() {
  const lastScan = useSyncExternalStore(
    (callback) => {
      window.addEventListener("scan:complete", callback);
      window.addEventListener("storage", callback);

      return () => {
        window.removeEventListener("scan:complete", callback);
        window.removeEventListener("storage", callback);
      };
    },
    () => localStorage.getItem("lastScan"),
    () => null
  );

  return (
    <div className="scan-badge">
      <span className="scan-dot" aria-hidden />
      <span>Last scan: {formatLastScan(lastScan)}</span>
    </div>
  );
}
