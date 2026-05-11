import { SignIn } from "@clerk/nextjs";
import { Flame } from "lucide-react";

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignInPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-label="Sign in">
        <div className="auth-copy">
          <div className="brand-lockup auth-brand">
            <div className="brand-mark">
              <Flame size={20} />
            </div>
            <div>
              <p className="brand-eyebrow">Trend Chaser</p>
              <strong>POD Radar</strong>
            </div>
          </div>
          <h1>Sign in</h1>
          <p>Daily trend intelligence, platform scoring, and design prompts for serious POD sellers.</p>
        </div>

        {isClerkConfigured ? (
          <SignIn />
        ) : (
          <div className="auth-placeholder">
            <h2>Clerk keys needed</h2>
            <p>Add your Clerk publishable and secret keys to `.env.local`, then restart the dev server.</p>
          </div>
        )}
      </section>
    </main>
  );
}
