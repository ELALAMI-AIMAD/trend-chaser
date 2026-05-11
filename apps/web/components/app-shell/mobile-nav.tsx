"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Flame,
  LayoutDashboard,
  LineChart,
  Menu,
  Settings,
  Sparkles,
  Star,
  X,
  Zap
} from "lucide-react";
import { routes } from "@/lib/routes";

const navItems = [
  { label: "Dashboard", href: routes.dashboard, icon: LayoutDashboard },
  { label: "Trend Radar", href: routes.trends, icon: Zap },
  { label: "Calendar", href: routes.calendar, icon: CalendarDays },
  { label: "Watchlist", href: routes.watchlist, icon: Star },
  { label: "Prompts", href: routes.prompts, icon: Sparkles },
  { label: "Scan Runs", href: routes.scanRuns, icon: LineChart },
  { label: "Settings", href: routes.settings, icon: Settings }
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="mobile-topbar">
        <div className="brand-lockup" style={{ marginBottom: 0 }}>
          <div className="brand-mark">
            <Flame size={18} aria-hidden />
          </div>
          <strong>POD Radar</strong>
        </div>
        <button
          className="icon-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="mobile-nav-drawer" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === routes.dashboard
                ? pathname === routes.dashboard
                : pathname.startsWith(item.href);
            return (
              <Link
                className={`nav-item${isActive ? " active" : ""}`}
                href={item.href}
                key={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <item.icon size={18} aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
