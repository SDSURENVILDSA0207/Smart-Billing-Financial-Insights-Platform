"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "../../../components/empty-state";
import { intelligenceModuleNav } from "../../../components/module-nav";
import { ModuleSubnav } from "../../../components/module-subnav";
import { PageHeader } from "../../../components/page-header";
import { Spinner } from "../../../components/spinner";
import { StatusBadge } from "../../../components/status-badge";
import { api } from "../../../lib/api";
import type { RiskAlert } from "../../../lib/types";

export default function AlertsPage() {
  const [rows, setRows] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api<RiskAlert[]>("/risk/alerts")
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Exceptions from the risk engine — each item links to the underlying invoice."
        meta={loading ? "…" : `${rows.length} open`}
        breadcrumbs={[{ label: "Intelligence", href: "/insights" }, { label: "Alerts" }]}
        actions={
          <Link href="/payments" className="btn-secondary">
            Collections
          </Link>
        }
      />

      <ModuleSubnav items={intelligenceModuleNav} />

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No active alerts" hint="When the engine flags issues, they appear here with reasons." />
      ) : (
        <ul className="space-y-4">
          {rows.map((a) => (
            <li
              key={a.invoiceId}
              className={`panel border-l-[3px] p-5 ${
                a.level === "HIGH"
                  ? "border-l-rose-500/90"
                  : a.level === "MEDIUM"
                    ? "border-l-amber-600/80"
                    : "border-l-warm/20"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-warm">{a.invoiceNumber}</p>
                  <p className="text-sm text-warm-muted">{a.customerName}</p>
                </div>
                <StatusBadge status={a.level} />
              </div>
              <ul className="mt-4 space-y-1.5 border-t border-warm/[0.06] pt-4 text-sm text-warm-muted">
                {a.reasons.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-brass/60">—</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/invoices/${a.invoiceId}`} className="btn-secondary mt-5 inline-flex text-sm">
                Open invoice
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
