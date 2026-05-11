"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LineChart,
  Settings,
  Sparkles,
  Star,
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

export function NavList() {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive =
          item.href === routes.dashboard
            ? pathname === routes.dashboard
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-item${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon size={18} aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
