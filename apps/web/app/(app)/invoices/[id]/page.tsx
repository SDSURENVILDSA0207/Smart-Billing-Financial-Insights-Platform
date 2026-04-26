"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InPageNav } from "../../../../components/in-page-nav";
import { invoiceModuleNav } from "../../../../components/module-nav";
import { ModuleSubnav } from "../../../../components/module-subnav";
import { PageHeader } from "../../../../components/page-header";
import { useToast } from "../../../../components/providers";
import { RelatedLink, RelatedPanel } from "../../../../components/related-panel";
import { Spinner } from "../../../../components/spinner";
import { StatusBadge } from "../../../../components/status-badge";
import { api } from "../../../../lib/api";
import { money, pct, shortDate } from "../../../../lib/format";
import type { InvoiceRow } from "../../../../lib/types";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const [inv, setInv] = useState<InvoiceRow | null>(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  async function load() {
    setError("");
    try {
      const data = await api<InvoiceRow>(`/invoices/${id}`);
      setInv(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    if (!inv) return;
    const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
    setPayAmount(balance > 0 ? balance.toFixed(2) : "");
  }, [inv]);

  async function pay() {
    if (!inv) return;
    const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
    const n = Number.parseFloat(payAmount.replace(/,/g, ""));
    if (!Number.isFinite(n) || n <= 0) {
      toast("Enter a valid payment amount", "error");
      return;
    }
    if (n > balance + 0.005) {
      toast("Amount cannot exceed the open balance", "error");
      return;
    }
    setPaying(true);
    try {
      await api(`/invoices/${id}/payment`, { method: "PATCH", body: JSON.stringify({ paidAmount: n }) });
      await load();
      toast("Payment recorded");
    } catch (e) {
      setError((e as Error).message);
      toast((e as Error).message, "error");
    } finally {
      setPaying(false);
    }
  }

  if (error && !inv) {
    return (
      <div>
        <PageHeader title="Invoice" description=" " breadcrumbs={[{ label: "Invoices", href: "/invoices" }, { label: "Detail" }]} />
        <p className="rounded-sm border border-rose-500/25 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">{error}</p>
        <button type="button" className="btn-secondary mt-4" onClick={() => router.push("/invoices")}>
          Back to invoices
        </button>
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const balance = Number(inv.totalAmount) - Number(inv.paidAmount);

  return (
    <div>
      <PageHeader
        title={inv.invoiceNumber}
        description={`Issued ${shortDate(inv.issueDate)} · Due ${shortDate(inv.dueDate)}`}
        meta={inv.status === "PAID" ? "Closed" : "Open balance"}
        breadcrumbs={[{ label: "Invoices", href: "/invoices" }, { label: inv.invoiceNumber }]}
        actions={
          <Link href="/invoices" className="btn-secondary">
            All invoices
          </Link>
        }
      />

      <ModuleSubnav items={invoiceModuleNav} />

      <InPageNav
        items={[
          { href: "#invoice-summary", label: "Summary" },
          ...(inv.status !== "PAID" && balance > 0 ? ([{ href: "#invoice-payment", label: "Payment" }] as const) : []),
          { href: "#invoice-lines", label: "Lines" }
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,280px)]">
        <article id="invoice-summary" className="panel scroll-mt-28 p-6 lg:col-span-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-muted">Customer</p>
              <Link href={`/customers/${inv.customer.id}`} className="text-lg font-medium text-warm underline decoration-warm/[0.15] underline-offset-4 transition hover:decoration-brass/50">
                {inv.customer.name}
              </Link>
            </div>
            <StatusBadge status={inv.status} />
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            <Stat label="Total" value={money(Number(inv.totalAmount))} />
            <Stat label="Paid" value={money(Number(inv.paidAmount))} />
            <Stat label="Balance" value={money(balance)} />
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <Stat label="Margin" value={pct(Number(inv.marginPercent))} />
            <Stat label="Tax" value={money(Number(inv.taxAmount))} />
            <Stat label="Discount" value={money(Number(inv.discountAmount))} />
          </div>

          {inv.status !== "PAID" && balance > 0 && (
            <div id="invoice-payment" className="scroll-mt-28 border-t border-warm/[0.06] pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-muted">Record payment</p>
              <p className="mt-1 text-sm text-warm-muted">
                Open balance {money(balance)}. Partial payments are supported.
              </p>
              <div className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Amount</span>
                  <input
                    className="field"
                    inputMode="decimal"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    aria-label="Payment amount"
                  />
                </label>
                <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => setPayAmount(balance.toFixed(2))}>
                  Full balance
                </button>
                <button type="button" className="btn-primary whitespace-nowrap" disabled={paying} onClick={() => void pay()}>
                  {paying ? "Recording…" : "Record"}
                </button>
              </div>
            </div>
          )}
        </article>

        <RelatedPanel title="Related">
          <RelatedLink href={`/customers/${inv.customer.id}`} label={inv.customer.name} hint="Customer profile" />
          <RelatedLink href="/payments" hint="Portfolio balances" label="Payments" />
          <RelatedLink href="/insights" hint="Concentration & trends" label="Insights" />
        </RelatedPanel>
      </div>

      <section id="invoice-lines" className="mt-10 scroll-mt-28">
        <h2 className="font-display text-lg font-normal text-warm">Line items</h2>
        <div className="mt-4 table-shell divide-rows">
          <div className="table-head hidden grid-cols-[2fr_0.6fr_0.9fr_0.9fr_0.9fr_0.9fr] gap-4 px-4 md:grid">
            <span>Description</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Cost</span>
            <span>Tax %</span>
            <span className="text-right">Line</span>
          </div>
          <div>
            {(inv.items ?? []).map((line) => (
              <div key={line.id} className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-[2fr_0.6fr_0.9fr_0.9fr_0.9fr_0.9fr] md:items-center md:gap-4">
                <p className="text-sm font-medium text-warm">{line.description}</p>
                <p className="text-sm text-warm-muted">{line.quantity}</p>
                <p className="text-sm tabular-nums text-warm-muted">{money(Number(line.unitPrice))}</p>
                <p className="text-sm tabular-nums text-warm-muted">{money(Number(line.unitCost))}</p>
                <p className="text-sm text-warm-muted">{Number(line.taxRate).toFixed(1)}%</p>
                <p className="text-right text-sm font-semibold tabular-nums text-warm">{money(Number(line.lineTotal))}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-warm/[0.06] bg-ink-2/80 px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-warm-muted">{label}</p>
      <p className="mt-1 text-base font-medium tabular-nums text-warm">{value}</p>
    </div>
  );
}
