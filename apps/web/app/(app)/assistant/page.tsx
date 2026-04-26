"use client";

import { useState } from "react";
import { intelligenceModuleNav } from "../../../components/module-nav";
import { ModuleSubnav } from "../../../components/module-subnav";
import { PageHeader } from "../../../components/page-header";
import { api } from "../../../lib/api";
import type { AssistantBrief } from "../../../lib/types";

const PRESETS = [
  { label: "Collections focus", prompt: "Where should I focus collections this week?" },
  { label: "Concentration risk", prompt: "Which customers drive the most revenue concentration risk?" },
  { label: "Overdue exposure", prompt: "Summarize overdue exposure and what to do next." },
  { label: "Month-end review", prompt: "What trends should finance review before month-end?" }
];

export default function AssistantPage() {
  const [question, setQuestion] = useState(PRESETS[0].prompt);
  const [brief, setBrief] = useState<AssistantBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await api<AssistantBrief>("/assistant/brief", {
        method: "POST",
        body: JSON.stringify({ question })
      });
      setBrief(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assistant"
        description="Structured briefings from the logic engine — not open-ended chat. Grounded in your metrics and rules."
        meta="Intelligence"
        breadcrumbs={[{ label: "Intelligence", href: "/insights" }, { label: "Assistant" }]}
      />

      <ModuleSubnav items={intelligenceModuleNav} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-12">
        <div className="panel p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-muted">Prompt</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setQuestion(p.prompt)}
                className={`rounded-sm border px-3 py-1.5 text-left text-xs transition ${
                  question === p.prompt
                    ? "border-brass/50 bg-brass/10 text-warm"
                    : "border-warm/[0.1] bg-ink-2 text-warm-muted hover:border-warm/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="mt-6 block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Your question</span>
            <textarea className="field min-h-[132px] resize-y" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </label>
          {error && <p className="mt-3 rounded-sm border border-rose-500/25 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">{error}</p>}
          <button type="button" className="btn-primary mt-5 w-full" disabled={loading} onClick={() => void run()}>
            {loading ? "Working…" : "Brief me"}
          </button>
          <p className="mt-5 text-xs leading-relaxed text-warm-muted">
            Output is composed from operational context and engine rules — not a generic model monologue.
          </p>
        </div>

        <div className="min-h-[280px] border-t-2 border-brass/35 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          {!brief ? (
            <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-warm-muted">
              Run a briefing to populate this column.
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-muted">Briefing</p>
              <h2 className="mt-3 font-display text-2xl font-normal leading-snug text-warm sm:text-[1.75rem]">{brief.headline}</h2>
              <div className="mt-6 space-y-2">
                {brief.bullets.map((b) => (
                  <p key={b} className="border-l-2 border-warm/[0.08] pl-4 text-sm leading-relaxed text-warm-muted">
                    {b}
                  </p>
                ))}
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-muted">Suggested actions</p>
                <ul className="mt-3 space-y-2 text-sm text-warm-muted">
                  {brief.suggestedActions.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-brass/50">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
