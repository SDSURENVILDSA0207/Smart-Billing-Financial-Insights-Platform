"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "../../../components/empty-state";
import { ListSkeleton } from "../../../components/list-skeleton";
import { invoiceModuleNav } from "../../../components/module-nav";
import { ModuleSubnav } from "../../../components/module-subnav";
import { PageHeader } from "../../../components/page-header";
import { StatusBadge } from "../../../components/status-badge";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import { api } from "../../../lib/api";
import { money, shortDate } from "../../../lib/format";
import type { InvoiceRow } from "../../../lib/types";

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const debouncedQ = useDebouncedValue(q, 320);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams();
    if (debouncedQ.trim()) qs.set("q", debouncedQ.trim());
    if (status) qs.set("status", status);
    const path = `/invoices${qs.toString() ? `?${qs.toString()}` : ""}`;
    void api<InvoiceRow[]>(path)
      .then((data) => {
        if (!cancelled) {
          setRows(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, status]);

  const openCount = rows.filter((r) => r.status !== "PAID").length;
  const overdueCount = rows.filter((r) => r.status !== "PAID" && new Date(r.dueDate) < new Date()).length;

  return (
    <div>
      <PageHeader
        title="Register"
        description="Search and filter the invoice file. Rows open the full economic record."
        meta={`${rows.length} in view · ${openCount} open · ${overdueCount} overdue`}
        breadcrumbs={[{ label: "Invoices", href: "/invoices" }, { label: "Register" }]}
        actions={
          <Link href="/invoices/new" className="btn-primary">
            Create invoice
          </Link>
        }
      />

      <ModuleSubnav items={invoiceModuleNav} />

      {!loading && rows.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-px border border-warm/[0.06] bg-warm/[0.06]">
          <MiniStat label="In view" value={String(rows.length)} />
          <MiniStat label="Open" value={String(openCount)} />
          <MiniStat label="Overdue" value={String(overdueCount)} />
        </div>
      )}

      <div className="mb-7 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block w-full flex-1 space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Search</span>
          <input className="field" placeholder="Number or customer" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="block w-full space-y-1.5 sm:max-w-[200px]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Status</span>
          <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </label>
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No invoices in this view"
          hint={q || status ? "Adjust search or status, or clear filters to see everything." : "Create your first invoice to populate this register."}
          action={
            !q && !status ? (
              <Link href="/invoices/new" className="btn-primary">
                Create invoice
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="table-shell divide-rows">
          <div className="table-head hidden grid-cols-[1.1fr_1fr_0.7fr_0.9fr_0.7fr] gap-4 px-4 lg:grid">
            <span>Invoice</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Due</span>
            <span className="text-right">Total</span>
          </div>
          <div>
            {rows.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="grid grid-cols-1 gap-2 px-4 py-4 transition hover:bg-brass/[0.04] lg:grid-cols-[1.1fr_1fr_0.7fr_0.9fr_0.7fr] lg:items-center lg:gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-warm">{inv.invoiceNumber}</p>
                  <p className="text-xs text-warm-muted lg:hidden">{shortDate(inv.dueDate)}</p>
                </div>
                <p className="text-sm text-warm-muted">{inv.customer.name}</p>
                <StatusBadge status={inv.status} />
                <p className="hidden text-sm text-warm-muted lg:block">{shortDate(inv.dueDate)}</p>
                <p className="text-right text-sm font-semibold tabular-nums text-warm">{money(Number(inv.totalAmount))}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[140px] flex-1 bg-ink-3 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-normal tabular-nums text-warm">{value}</p>
    </div>
  );
}
