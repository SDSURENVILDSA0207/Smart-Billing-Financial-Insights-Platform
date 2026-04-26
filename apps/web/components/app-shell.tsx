"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { mainNav } from "./nav";
import { NavIcon } from "./icons";
import { AdminCopilot } from "./admin-copilot";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-ink text-warm">
      {/* Subtle vertical structure — not a generic gradient mesh */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(105deg,rgba(184,146,63,0.03)_0%,transparent_42%,transparent_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1580px]">
        <aside className="hidden w-[15rem] shrink-0 flex-col border-r border-warm/[0.06] bg-ink-2/95 pl-6 pr-4 pt-8 pb-6 lg:flex">
          <div className="font-display text-[1.35rem] font-normal leading-tight tracking-tight text-warm">
            Smart Billing
            <span className="text-brass">.</span>
          </div>
          <p className="mt-2 max-w-[11rem] text-[11px] font-normal leading-snug text-warm-muted">
            Ledger operations & financial intelligence
          </p>
          <div className="mt-10 h-px w-10 bg-brass/60" aria-hidden />
          <nav className="mt-8 flex flex-1 flex-col gap-0.5" aria-label="Main">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 border-l-2 py-2.5 pl-3 pr-2 text-[13px] transition ${
                    active
                      ? "border-brass text-warm"
                      : "border-transparent text-warm-muted hover:border-warm/15 hover:text-warm"
                  }`}
                >
                  <NavIcon name={item.icon} className={active ? "text-brass-bright" : "text-warm-muted group-hover:text-warm"} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button type="button" onClick={logout} className="btn-secondary mt-auto w-full text-[13px]">
            Sign out
          </button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-warm/[0.06] bg-ink/90 px-4 py-3 backdrop-blur-sm lg:hidden">
            <div>
              <p className="font-display text-2xl font-normal text-warm">
                Smart Billing<span className="text-brass">.</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={logout}>
                Out
              </button>
              <button
                type="button"
                className="inline-flex h-11 min-w-11 items-center justify-center rounded-sm border border-warm/[0.12] bg-ink-3"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </header>

          {open && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button type="button" className="absolute inset-0 bg-ink/80" onClick={() => setOpen(false)} aria-label="Close menu" />
              <div className="absolute right-0 top-0 flex h-full w-[min(92vw,300px)] flex-col border-l border-warm/[0.08] bg-ink-2 p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg text-warm">Navigate</p>
                  <button type="button" className="rounded-sm border border-warm/[0.12] px-2 py-1 text-xs" onClick={() => setOpen(false)}>
                    Close
                  </button>
                </div>
                <nav className="mt-6 flex flex-col gap-1">
                  {mainNav.map((item) => {
                    const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 border-l-2 py-3 pl-3 text-sm ${
                          active ? "border-brass text-warm" : "border-transparent text-warm-muted"
                        }`}
                      >
                        <NavIcon name={item.icon} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          <main className="relative flex-1 px-4 pb-16 pt-7 sm:px-8 sm:pt-9 lg:px-12 lg:pr-14 lg:pt-11">{children}</main>
          <AdminCopilot />
        </div>
      </div>
    </div>
  );
}
