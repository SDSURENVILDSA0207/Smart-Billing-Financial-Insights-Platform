"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "../../../components/page-header";
import { Spinner } from "../../../components/spinner";
import { StatusBadge } from "../../../components/status-badge";
import { WorkspaceSection } from "../../../components/workspace-section";
import { api } from "../../../lib/api";
import { money, shortDate } from "../../../lib/format";
import type { DashboardResponse } from "../../../lib/types";

function formatRefreshed(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    void api<DashboardResponse>("/dashboard")
      .then((d) => {
        setData(d);
        setRefreshedAt(new Date().toISOString());
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader title="Overview" description="Financial health, activity, and entry points." />
        <p className="rounded-sm border border-rose-500/25 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        description="A single read on performance, guidance, and what moved in the ledger last."
        meta={
          refreshedAt
            ? `Refreshed ${formatRefreshed(refreshedAt)} · aligned with Analytics`
            : "Live"
        }
        breadcrumbs={[{ label: "Overview" }]}
        actions={
          <>
            <Link href="/invoices/new" className="btn-primary">
              New invoice
            </Link>
            <Link href="/customers" className="btn-secondary">
              Customers
            </Link>
          </>
        }
      />

      <WorkspaceSection
        kicker="Ledger"
        title="Position"
        description="Four figures that summarize your books — one band, not a wall of identical tiles."
        density="comfortable"
      >
        <div className="panel overflow-hidden p-0">
          <div className="grid grid-cols-2 gap-px bg-warm/[0.06] sm:grid-cols-4">
            <Kpi label="Revenue" value={money(data.metrics.totalRevenue)} hint="Lifetime invoiced" />
            <Kpi label="Profit" value={money(data.metrics.totalProfit)} hint="After cost basis" />
            <Kpi label="Open" value={String(data.metrics.unpaidCount)} hint="Not fully paid" />
            <Kpi label="Overdue" value={String(data.metrics.overdueCount)} hint="Past due date" />
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        className="mt-4"
        kicker="Signals"
        title="Guidance"
        description="Synthesized from your data and the intelligence layer."
        density="comfortable"
      >
        <div className="border-l-[3px] border-brass/70 bg-ink-2/90 pl-6 pr-5 py-6 sm:pl-8 sm:pr-8">
          <p className="font-display text-xl font-normal leading-snug text-warm sm:text-[1.35rem]">{data.insights.summary}</p>
          <p className="mt-3 text-sm text-brass-bright/90">Trend — {data.insights.trend}</p>
          <p className="mt-4 text-sm leading-relaxed text-warm-muted">{data.insights.recommendation}</p>
          <div className="mt-8 flex flex-wrap gap-2 border-t border-warm/[0.06] pt-6">
            <Link href="/insights" className="btn-secondary px-4 py-2 text-xs">
              Analytics
            </Link>
            <Link href="/alerts" className="btn-secondary px-4 py-2 text-xs">
              Alerts
            </Link>
            <Link href="/assistant" className="btn-secondary px-4 py-2 text-xs">
              Assistant
            </Link>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        className="mt-4"
        kicker="Register"
        title="Recent movement"
        description="Invoice-level activity — open a row for economics and payment."
        density="comfortable"
      >
        <div className="mb-3 flex justify-end">
          <Link href="/invoices" className="link-quiet text-xs">
            Full register
          </Link>
        </div>
        <div className="table-shell divide-rows">
          <div className="table-head hidden grid-cols-[1.2fr_1fr_0.7fr_0.9fr] gap-4 px-4 md:grid">
            <span>Invoice</span>
            <span>Customer</span>
            <span>Status</span>
            <span className="text-right">Updated</span>
          </div>
          <div>
            {data.activity.map((row) => (
              <Link
                key={row.id}
                href={`/invoices/${row.id}`}
                className="grid grid-cols-1 gap-2 px-4 py-4 transition hover:bg-brass/[0.04] md:grid-cols-[1.2fr_1fr_0.7fr_0.9fr] md:items-center md:gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-warm">{row.invoiceNumber}</p>
                  <p className="text-xs text-warm-muted md:hidden">{shortDate(row.updatedAt)}</p>
                </div>
                <p className="text-sm text-warm-muted">{row.customerName}</p>
                <div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="hidden text-right text-xs text-warm-muted md:block">{shortDate(row.updatedAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      </WorkspaceSection>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-ink-3 px-5 py-6 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-normal tabular-nums tracking-tight text-warm">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-warm-muted">{hint}</p>
    </div>
  );
}
