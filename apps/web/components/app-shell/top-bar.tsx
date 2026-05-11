"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Bell, Play, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { routes } from "@/lib/routes";

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type TopBarProps = {
  title: string;
  eyebrow?: string;
  onRunScan?: () => void;
};

export function TopBar({ title, eyebrow = "Daily intelligence", onRunScan }: TopBarProps) {
  const [query, setQuery] = useState("");

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} aria-hidden />
          <input
            aria-label="Search trends"
            placeholder="Search niches, phrases, platforms"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <button className="icon-button" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {isClerkConfigured ? (
          <>
            <Show when="signed-out">
              <SignInButton>
                <button className="ghost-button">Sign in</button>
              </SignInButton>
              <SignUpButton>
                <button className="primary-button">Sign up</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <button
                className="primary-button"
                onClick={onRunScan}
                aria-label="Run daily scan"
              >
                <Play size={17} aria-hidden />
                <span>Run scan</span>
              </button>
              <div className="user-button-frame">
                <UserButton />
              </div>
            </Show>
          </>
        ) : (
          <Link className="ghost-button" href={routes.signIn}>
            Auth setup
          </Link>
        )}
      </div>
    </header>
  );
}
