"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const ADMIN_EMAIL = "rdsa@gmail.com";
const ADMIN_PASSWORD = "R1234567l@";

function sanitizeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = sanitizeNextPath(search.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    router.replace(next);
  }, [router, next]);

  async function submit() {
    setError("");
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Access denied. Use the authorized admin credentials.");
      return;
    }
    try {
      const data = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("token", data.token);
      router.replace(next);
    } catch (loginError) {
      const loginMessage = (loginError as Error).message;
      if (loginMessage !== "Invalid credentials") {
        setError(loginMessage);
        return;
      }
      try {
        const data = await api<{ token: string }>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        localStorage.setItem("token", data.token);
        router.replace(next);
      } catch (registerError) {
        setError((registerError as Error).message);
      }
    }
  }

  return (
    <div className="panel mx-auto w-full max-w-md p-8 sm:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-brass-muted">Admin access</p>
      <h1 className="mt-4 font-display text-3xl font-normal tracking-tight text-warm">Admin Sign in</h1>
      <p className="mt-2 text-sm text-warm-muted">Use your work email. New accounts are registered on first sign-in when eligible.</p>

      <div className="mt-9 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Email</span>
          <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Password</span>
          <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
      </div>

      {error && <p className="mt-4 rounded-sm border border-rose-500/25 bg-rose-950/30 px-3 py-2 text-sm text-rose-100">{error}</p>}

      <button type="button" className="btn-primary mt-8 w-full" onClick={() => void submit()}>
        Continue
      </button>
    </div>
  );
}
