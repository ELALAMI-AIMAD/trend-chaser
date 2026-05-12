"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { SearchDropdown } from "./search-dropdown";
import { NotificationsPopover } from "./notifications-popover";
import { RunScanButton } from "./run-scan-button";

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type TopBarProps = {
  title: string;
  eyebrow?: string;
};

export function TopBar({ title, eyebrow = "Daily intelligence" }: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <SearchDropdown />

        <NotificationsPopover />

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
              <RunScanButton />
              <div className="user-button-frame">
                <UserButton />
              </div>
            </Show>
          </>
        ) : (
          <>
            <Link className="ghost-button" href={routes.signIn}>
              Auth setup
            </Link>
            <RunScanButton />
          </>
        )}
      </div>
    </header>
  );
}
