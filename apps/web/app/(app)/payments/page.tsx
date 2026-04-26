"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "../../../components/empty-state";
import { paymentsModuleNav } from "../../../components/module-nav";
import { ModuleSubnav } from "../../../components/module-subnav";
import { PageHeader } from "../../../components/page-header";
import { Spinner } from "../../../components/spinner";
import { StatusBadge } from "../../../components/status-badge";
import { api } from "../../../lib/api";
import { money, shortDate } from "../../../lib/format";
import type { PaymentsResponse } from "../../../lib/types";

export default function PaymentsPage() {
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    const res = await api<PaymentsResponse>(`/payments${qs.toString() ? `?${qs.toString()}` : ""}`);
    setData(res);
    setLoading(false);
  }

  useEffect(() => {
    void load().catch(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <PageHeader
        title="Collections"
        description="Cash collected, still out, and invoice posture — each row opens the source document."
        meta="Payments"
        breadcrumbs={[{ label: "Payments", href: "/payments" }, { label: "Center" }]}
        actions={
          <Link href="/invoices" className="btn-secondary">
            Register
          </Link>
        }
      />

      <ModuleSubnav items={paymentsModuleNav} />

      {loading || !data ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="panel overflow-hidden p-0">
            <div className="grid grid-cols-2 gap-px bg-warm/[0.06] sm:grid-cols-3 lg:grid-cols-5">
              <Summary label="Collected" value={money(data.summary.totalCollected)} />
              <Summary label="Outstanding" value={money(data.summary.totalOutstanding)} />
              <Summary label="Paid" value={String(data.summary.paidCount)} />
              <Summary label="Partial" value={String(data.summary.partialCount)} />
              <Summary label="Unpaid" value={String(data.summary.unpaidCount)} />
            </div>
          </div>

          <label className="mt-8 block max-w-xs space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Status</span>
            <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </label>

          {data.items.length === 0 ? (
            <div className="mt-8">
              <EmptyState title="No rows in this filter" hint="Create invoices to see collection data here." />
            </div>
          ) : (
            <div className="mt-8 table-shell divide-rows">
              <div className="table-head hidden grid-cols-[1.1fr_1fr_0.7fr_0.9fr_0.9fr_0.9fr] gap-4 px-4 xl:grid">
                <span>Invoice</span>
                <span>Customer</span>
                <span>Status</span>
                <span>Paid</span>
                <span>Balance</span>
                <span>Updated</span>
              </div>
              <div>
                {data.items.map((row) => (
                  <Link
                    key={row.id}
                    href={`/invoices/${row.id}`}
                    className="grid grid-cols-1 gap-2 px-4 py-4 transition hover:bg-brass/[0.04] xl:grid-cols-[1.1fr_1fr_0.7fr_0.9fr_0.9fr_0.9fr] xl:items-center xl:gap-4"
                  >
                    <p className="text-sm font-medium text-warm">{row.invoiceNumber}</p>
                    <p className="text-sm text-warm-muted">{row.customerName}</p>
                    <StatusBadge status={row.status} />
                    <p className="text-sm tabular-nums text-warm">{money(row.paidAmount)}</p>
                    <p className="text-sm font-semibold tabular-nums text-warm">{money(row.balance)}</p>
                    <p className="text-xs text-warm-muted">{shortDate(row.updatedAt)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-3 px-4 py-5 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-muted">{label}</p>
      <p className="mt-2 font-display text-lg font-normal tabular-nums text-warm">{value}</p>
    </div>
  );
}
