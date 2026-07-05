"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <span className="brand-dot" />
          Fastr
        </div>

        {status === "sent" ? (
          <div className="login-sent">
            <h1>Check your email</h1>
            <p className="muted">
              We sent a magic link to <strong>{email}</strong>. Open it on this
              device to sign in.
            </p>
            <button
              className="btn-ghost"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={sendLink}>
            <h1>Sign in</h1>
            <p className="muted">
              Enter your email and we&apos;ll send you a magic link — no
              password needed.
            </p>
            <input
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="login-error">{error}</p>}
            <button
              className="btn-primary"
              type="submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
