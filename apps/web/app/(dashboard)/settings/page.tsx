"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { TopBar } from "@/components/app-shell/top-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function SettingsPage() {
  const [scanTime, setScanTime] = useState("01:00");
  const [defaultPlatform, setDefaultPlatform] = useState("all");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [hotOnly, setHotOnly] = useState(false);

  return (
    <>
      <TopBar title="Settings" eyebrow="Account & preferences" />

      <div className="settings-grid">
        {/* Scan settings */}
        <section className="settings-section">
          <h2 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Scan settings</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: "0.82rem" }}>
            Configure when and how the daily scan runs.
          </p>

          <div className="settings-row">
            <div className="settings-label">
              <strong>Scan time</strong>
              <span>UTC time for daily scan trigger</span>
            </div>
            <Select value={scanTime} onValueChange={(value) => value && setScanTime(value)}>
              <SelectTrigger
                style={{
                  width: 130,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)"
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                {["00:00", "01:00", "02:00", "06:00", "12:00"].map((t) => (
                  <SelectItem key={t} value={t}>{t} UTC</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div style={{ height: 1, background: "var(--border)" }} />

          <div className="settings-row">
            <div className="settings-label">
              <strong>Default platform filter</strong>
              <span>Platform shown first in trend radar</span>
            </div>
            <Select
              value={defaultPlatform}
              onValueChange={(value) => value && setDefaultPlatform(value)}
            >
              <SelectTrigger
                style={{
                  width: 130,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)"
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                {[
                  { label: "All platforms", value: "all" },
                  { label: "Amazon", value: "amazon" },
                  { label: "Etsy", value: "etsy" },
                  { label: "Redbubble", value: "redbubble" }
                ].map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Alert settings */}
        <section className="settings-section">
          <h2 style={{ margin: "0 0 4px", fontSize: "1rem" }}>Alerts</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: "0.82rem" }}>
            Control when you get notified.
          </p>

          <div className="settings-row">
            <div className="settings-label">
              <strong>Email alerts</strong>
              <span>Daily scan summary via email</span>
            </div>
            <button
              role="switch"
              aria-checked={emailAlerts}
              aria-label="Toggle email alerts"
              onClick={() => setEmailAlerts((v) => !v)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                border: "none",
                background: emailAlerts ? "var(--green)" : "var(--surface-soft)",
                cursor: "pointer",
                position: "relative",
                transition: "background 200ms"
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: emailAlerts ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 200ms"
                }}
              />
            </button>
          </div>

          <div style={{ height: 1, background: "var(--border)" }} />

          <div className="settings-row">
            <div className="settings-label">
              <strong>Hot trends only</strong>
              <span>Only alert on hot-temperature trends</span>
            </div>
            <button
              role="switch"
              aria-checked={hotOnly}
              aria-label="Toggle hot trends only"
              onClick={() => setHotOnly((v) => !v)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                border: "none",
                background: hotOnly ? "var(--orange)" : "var(--surface-soft)",
                cursor: "pointer",
                position: "relative",
                transition: "background 200ms"
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: hotOnly ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 200ms"
                }}
              />
            </button>
          </div>
        </section>

        {/* Danger zone */}
        <section className="settings-section" style={{ borderColor: "rgba(255,77,77,0.2)" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "1rem", color: "var(--hot)" }}>Danger zone</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px", fontSize: "0.82rem" }}>
            These actions cannot be undone.
          </p>
          <div className="settings-row">
            <div className="settings-label">
              <strong>Clear all scan history</strong>
              <span>Deletes all scan run records</span>
            </div>
            <button
              className="ghost-button"
              style={{
                color: "var(--hot)",
                borderColor: "rgba(255,77,77,0.3)",
                minHeight: 36,
                padding: "0 12px",
                fontSize: "0.82rem"
              }}
            >
              Clear history
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
