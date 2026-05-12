"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

export function RunScanButton() {
  const [scanning, setScanning] = useState(false);

  async function handleRunScan() {
    if (scanning) return;
    setScanning(true);

    const toastId = toast.loading("Running daily scan…");

    try {
      const response = await fetch("/api/cron/daily-scan", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Scan failed:", response.status, text);
        throw new Error(`Scan failed: ${response.status}`);
      }

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        candidateCount?: number;
        enrichedCount?: number;
        status?: string;
      };

      if (!data.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      toast.success("✅ Scan complete!", { id: toastId });

      // Signal sidebar to refresh "Last scan" display
      localStorage.setItem("lastScan", new Date().toISOString());
      window.dispatchEvent(new Event("scan:complete"));
    } catch (err) {
      console.error("[RunScan]", err);
      toast.error("❌ Scan failed — check console", { id: toastId });
    } finally {
      setScanning(false);
    }
  }

  return (
    <button
      className="primary-button"
      onClick={handleRunScan}
      disabled={scanning}
      aria-label="Run daily scan"
      aria-busy={scanning}
    >
      {scanning ? (
        <Loader2 size={17} className="spin" aria-hidden />
      ) : (
        <Play size={17} aria-hidden />
      )}
      <span>{scanning ? "Scanning…" : "Run scan"}</span>
    </button>
  );
}
