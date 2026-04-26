"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { intelligenceModuleNav } from "../../../components/module-nav";
import { ModuleSubnav } from "../../../components/module-subnav";
import { PageHeader } from "../../../components/page-header";
import { Spinner } from "../../../components/spinner";
import { WorkspaceSection } from "../../../components/workspace-section";
import { api } from "../../../lib/api";
import { money } from "../../../lib/format";
import type { AnalyticsResponse, DashboardResponse } from "../../../lib/types";

export default function InsightsPage() {
  const [dash, setDash] = useState<DashboardResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<DashboardResponse>("/dashboard"), api<AnalyticsResponse>("/analytics")])
      .then(([d, a]) => {
        setDash(d);
        setAnalytics(a);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          description="Trends, concentration, and overdue exposure."
          breadcrumbs={[{ label: "Intelligence", href: "/insights" }, { label: "Analytics" }]}
        />
        <p className="rounded-sm border border-rose-500/25 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">{error}</p>
      </div>
    );
  }

  if (!dash || !analytics) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const maxRev = Math.max(...analytics.monthlyTrend.map((m) => m.revenue), 1);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Rhythm, concentration, and risk — same ledger as Overview, different lens."
        meta="Intelligence"
        breadcrumbs={[{ label: "Intelligence", href: "/insights" }, { label: "Analytics" }]}
        actions={
          <Link href="/assistant" className="btn-primary">
            Assistant
          </Link>
        }
      />

      <ModuleSubnav items={intelligenceModuleNav} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="min-w-0 flex-1 border-l-[3px] border-brass/80 pl-6 pr-2 sm:pl-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-muted">Read</p>
          <p className="mt-3 font-display text-xl font-normal leading-snug text-warm sm:text-2xl">{dash.insights.summary}</p>
          <p className="mt-4 text-sm text-brass-bright/90">Trend — {dash.insights.trend}</p>
          <p className="mt-3 text-sm leading-relaxed text-warm-muted">{dash.insights.recommendation}</p>
        </div>
        <aside className="panel flex w-full shrink-0 flex-col justify-between p-6 lg:max-w-[280px]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-muted">Overdue</p>
            <p className="mt-3 font-display text-3xl font-light tabular-nums text-warm">{money(analytics.overdue.amountOutstanding)}</p>
            <p className="mt-2 text-sm text-warm-muted">{analytics.overdue.count} invoices past due</p>
          </div>
          <Link href="/alerts" className="btn-secondary mt-6 w-full text-center text-sm">
            Alerts
          </Link>
        </aside>
      </div>

      <WorkspaceSection className="mt-12" kicker="Rhythm" title="Revenue & profit" description="Invoiced revenue and retained profit by calendar month.">
        <div className="panel p-6">
          {analytics.monthlyTrend.length === 0 ? (
            <p className="text-sm text-warm-muted">Not enough history yet.</p>
          ) : (
            <div className="space-y-5">
              {analytics.monthlyTrend.map((m) => (
                <div key={m.period} className="grid grid-cols-1 gap-3 sm:grid-cols-[100px_1fr] sm:items-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-warm-muted">{m.period}</p>
                  <div>
                    <div className="h-[3px] overflow-hidden bg-ink-2">
                      <div className="h-full bg-brass/85" style={{ width: `${(m.revenue / maxRev) * 100}%` }} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted">
                      <span>Revenue {money(m.revenue)}</span>
                      <span>Profit {money(m.profit)}</span>
                      <span>{m.invoiceCount} invoices</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </WorkspaceSection>

      <WorkspaceSection className="mt-10" kicker="Accounts" title="Concentration" description="Top relationships by invoiced revenue — click through to the account.">
        <div className="table-shell divide-rows">
          <div className="table-head hidden grid-cols-[1.4fr_0.8fr_0.8fr] gap-4 px-4 md:grid">
            <span>Customer</span>
            <span>Invoices</span>
            <span className="text-right">Revenue</span>
          </div>
          <div>
            {analytics.topCustomers.map((c) => (
              <Link
                key={c.customerId}
                href={`/customers/${c.customerId}`}
                className="grid grid-cols-1 gap-2 px-4 py-4 transition hover:bg-brass/[0.04] md:grid-cols-[1.4fr_0.8fr_0.8fr] md:items-center md:gap-4"
              >
                <p className="text-sm font-medium text-warm">{c.name}</p>
                <p className="text-sm text-warm-muted">{c.invoiceCount}</p>
                <p className="text-right text-sm font-semibold tabular-nums text-warm">{money(c.revenue)}</p>
              </Link>
            ))}
          </div>
        </div>
      </WorkspaceSection>
    </div>
  );
}
