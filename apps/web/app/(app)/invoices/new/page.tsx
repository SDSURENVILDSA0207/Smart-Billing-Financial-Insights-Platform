"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { invoiceModuleNav } from "../../../../components/module-nav";
import { ModuleSubnav } from "../../../../components/module-subnav";
import { PageHeader } from "../../../../components/page-header";
import { api } from "../../../../lib/api";
import { money } from "../../../../lib/format";
import type { CustomerRow } from "../../../../lib/types";

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(1200);
  const [unitCost, setUnitCost] = useState(700);
  const [taxRate, setTaxRate] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    void api<CustomerRow[]>("/customers").then(setCustomers);
  }, []);

  const estimate = useMemo(() => {
    const q = Math.max(0, quantity);
    const subtotal = q * unitPrice;
    const tax = subtotal * (taxRate / 100);
    const lineTotal = roundMoney(subtotal + tax - discount);
    const profit = roundMoney(q * (unitPrice - unitCost));
    return { subtotal, tax, lineTotal, profit };
  }, [quantity, unitPrice, unitCost, taxRate, discount]);

  async function submit() {
    setError("");
    if (!customerId) {
      setError("Select a customer.");
      return;
    }
    if (!description.trim()) {
      setError("Add a description for the line item.");
      return;
    }
    try {
      const created = await api<{ id: string }>("/invoices", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          issueDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          items: [{ description, quantity, unitPrice, unitCost, taxRate, discount }]
        })
      });
      router.push(`/invoices/${created.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="New invoice"
        description="One line to start — engine computes tax, margin, and totals on save."
        meta="Draft"
        breadcrumbs={[{ label: "Invoices", href: "/invoices" }, { label: "New" }]}
        actions={
          <Link href="/invoices" className="btn-secondary">
            Cancel
          </Link>
        }
      />

      <ModuleSubnav items={invoiceModuleNav} />

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,320px)]">
        <div className="panel p-6 sm:p-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Customer</span>
              <select className="field" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Description</span>
              <input className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Quantity</span>
              <input className="field" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Unit price</span>
              <input className="field" type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Unit cost</span>
              <input className="field" type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Tax %</span>
              <input className="field" type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
            </label>
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Discount</span>
              <input className="field" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </label>
          </div>

          {error && <p className="mt-4 rounded-sm border border-rose-500/25 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">{error}</p>}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => void submit()}>
              Create & review
            </button>
          </div>
        </div>

        <aside className="panel h-fit border-t-2 border-t-brass/40 p-6">
          <p className="font-display text-lg text-warm">Estimate</p>
          <p className="mt-1 text-xs text-warm-muted">Client-side preview — server is source of truth on save.</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-warm/[0.06] pb-3">
              <dt className="text-warm-muted">Subtotal</dt>
              <dd className="tabular-nums text-warm">{money(estimate.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-warm/[0.06] pb-3">
              <dt className="text-warm-muted">Tax</dt>
              <dd className="tabular-nums text-warm">{money(estimate.tax)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-warm/[0.06] pb-3">
              <dt className="text-warm-muted">Discount</dt>
              <dd className="tabular-nums text-warm">{money(discount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-warm">Line total</dt>
              <dd className="font-display text-xl tabular-nums text-warm">{money(estimate.lineTotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 pt-2">
              <dt className="text-warm-muted">Gross profit (est.)</dt>
              <dd className="tabular-nums font-medium text-brass-bright">{money(estimate.profit)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
