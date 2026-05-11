import { SignUp } from "@clerk/nextjs";
import { Flame } from "lucide-react";

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-label="Sign up">
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
          <h1>Create account</h1>
          <p>Track daily POD opportunities across Amazon, Etsy, and Redbubble from one dashboard.</p>
        </div>

        {isClerkConfigured ? (
          <SignUp />
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
