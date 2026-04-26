"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSuggestedPrompts, resolveCopilotQuery } from "../lib/copilot/resolve";
import type { CopilotAction } from "../lib/copilot/types";

const STORAGE_ONBOARDING = "sb_copilot_onboarding_dismissed";

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: CopilotAction[];
};

function formatMessage(text: string) {
  const parts = text.split("**");
  return (
    <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-warm/95">
      {parts.map((segment, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-warm">
            {segment}
          </strong>
        ) : (
          <span key={i}>{segment}</span>
        )
      )}
    </div>
  );
}

export function AdminCopilot() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setOnboardingDismissed(localStorage.getItem(STORAGE_ONBOARDING) === "1");
    } catch {
      setOnboardingDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dismissWelcome = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_ONBOARDING, "1");
    } catch {
      /* ignore */
    }
    setOnboardingDismissed(true);
  }, []);

  const runQuery = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q) return;

      const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", text: q };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setTyping(true);

      const delay = 420 + Math.floor(Math.random() * 180);
      window.setTimeout(() => {
        const reply = resolveCopilotQuery(q, pathname);
        const assistantMsg: ChatMsg = {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: reply.text,
          actions: reply.actions
        };
        setMessages((m) => [...m, assistantMsg]);
        setTyping(false);
        if (reply.navigateTo) {
          router.push(reply.navigateTo);
        }
      }, delay);
    },
    [pathname, router]
  );

  const prompts = getSuggestedPrompts(pathname);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-28 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-brass/35 bg-ink-3/95 text-brass-bright shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:border-brass/55 hover:bg-ink-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/50 sm:bottom-10 sm:right-8"
        aria-expanded={open}
        aria-controls="admin-copilot-panel"
        aria-label={open ? "Close admin guide" : "Open admin guide"}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v3m0 12v3M4.5 7.5l2.6 1.5m9.8 5.6 2.6 1.5M3 12h3m12 0h3M4.5 16.5l2.6-1.5m9.8-5.6 2.6-1.5"
            />
            <circle cx="12" cy="12" r="3.25" />
          </svg>
        )}
      </button>

      <div
        id="admin-copilot-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Admin guide"
        className={`fixed inset-0 z-[100] transition-[opacity,visibility] duration-200 ${
          open ? "pointer-events-auto visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-ink/70 backdrop-blur-[2px] sm:bg-ink/50"
          aria-label="Close guide"
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute bottom-0 right-0 flex h-[min(92dvh,720px)] w-full max-w-[440px] flex-col border-l border-warm/[0.08] bg-ink-2/98 shadow-[-12px_0_48px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out sm:bottom-8 sm:right-8 sm:h-[min(88vh,680px)] sm:max-h-[680px] sm:rounded-sm ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-warm/[0.06] px-4 py-3">
            <div>
              <p className="font-display text-lg font-normal text-warm">Guide</p>
              <p className="text-[11px] text-warm-muted">Contextual help for admins</p>
            </div>
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>

          {!onboardingDismissed && messages.length === 0 && (
            <div className="shrink-0 border-b border-warm/[0.06] bg-ink-3/40 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-warm">Welcome to Smart Billing</p>
                  <p className="mt-1 text-[12px] leading-snug text-warm-muted">
                    I explain each area, walk through tasks, and can open the right screen when you ask. Use chips below or type a question.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-sm border border-warm/[0.12] px-2 py-1 text-[11px] text-warm-muted hover:text-warm"
                  onClick={dismissWelcome}
                >
                  Dismiss
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Explain this page", "How do I create an invoice?", "What do these metrics mean?"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="rounded-full border border-brass/20 bg-ink/60 px-2.5 py-1 text-[11px] text-warm/90 hover:border-brass/40"
                    onClick={() => runQuery(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && onboardingDismissed && (
              <p className="text-[13px] text-warm-muted">
                Ask how something works, say <strong className="text-warm/90">explain this page</strong>, or use a suggestion.
              </p>
            )}
            <ul className="flex flex-col gap-4">
              {messages.map((m) => (
                <li key={m.id} className={m.role === "user" ? "ml-6" : "mr-4"}>
                  <div
                    className={`rounded-sm border px-3 py-2.5 ${
                      m.role === "user"
                        ? "border-brass/15 bg-ink-3/80 text-warm"
                        : "border-warm/[0.08] bg-ink/50 text-warm/95"
                    }`}
                  >
                    {formatMessage(m.text)}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.actions.map((a) => (
                          <button
                            key={a.href + a.label}
                            type="button"
                            className="rounded-sm border border-brass/25 px-2.5 py-1 text-[11px] text-brass-bright hover:bg-brass/10"
                            onClick={() => router.push(a.href)}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {typing && (
              <div className="mt-3 flex items-center gap-2 text-[12px] text-warm-muted">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass/80" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass/80 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass/80 [animation-delay:240ms]" />
                </span>
                Thinking…
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-warm/[0.06] px-3 py-2">
            <div className="mb-2 flex max-h-[4.5rem] flex-wrap gap-1.5 overflow-hidden">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={typing}
                  className="rounded-full border border-warm/[0.1] bg-ink/40 px-2 py-0.5 text-[10px] text-warm-muted hover:border-brass/25 hover:text-warm disabled:opacity-40"
                  onClick={() => runQuery(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (typing) return;
                runQuery(input);
              }}
            >
              <input
                className="input flex-1 py-2 text-[13px]"
                placeholder="Ask about this page or a task…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing}
                aria-label="Ask the admin guide"
              />
              <button type="submit" className="btn-primary shrink-0 px-4 py-2 text-xs" disabled={typing || !input.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
