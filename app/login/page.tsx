"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    setStatus("checking");
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      router.replace("/");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Wrong PIN");
      setStatus("error");
      setPin("");
    }
  }

  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <span className="brand-dot" />
          Fastr
        </div>
        <form onSubmit={submit}>
          <h1>Enter PIN</h1>
          <p className="muted">Enter your passcode to unlock the app.</p>
          <input
            className="input pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={status === "checking"}>
            {status === "checking" ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    </main>
  );
}
