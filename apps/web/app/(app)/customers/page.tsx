"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "../../../components/empty-state";
import { ListSkeleton } from "../../../components/list-skeleton";
import { customerModuleNav } from "../../../components/module-nav";
import { ModuleSubnav } from "../../../components/module-subnav";
import { PageHeader } from "../../../components/page-header";
import { useToast } from "../../../components/providers";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import { api } from "../../../lib/api";
import { money } from "../../../lib/format";
import type { CustomerRow } from "../../../lib/types";

export default function CustomersPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedQ = useDebouncedValue(q, 320);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const qs = new URLSearchParams();
    if (debouncedQ.trim()) qs.set("q", debouncedQ.trim());
    const path = `/customers${qs.toString() ? `?${qs.toString()}` : ""}`;
    void api<CustomerRow[]>(path)
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
  }, [debouncedQ]);

  async function submit() {
    if (!name.trim()) {
      toast("Enter a customer name", "error");
      return;
    }
    try {
      await api("/customers", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined })
      });
      setName("");
      setEmail("");
      toast("Customer saved");
      const qs = new URLSearchParams();
      if (debouncedQ.trim()) qs.set("q", debouncedQ.trim());
      const path = `/customers${qs.toString() ? `?${qs.toString()}` : ""}`;
      const data = await api<CustomerRow[]>(path);
      setRows(data);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Directory"
        description="Add accounts and search the index. Outstanding balances roll up from open invoices."
        meta={loading ? "…" : `${rows.length} accounts`}
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "Directory" }]}
        actions={
          <Link href="/invoices/new" className="btn-primary">
            New invoice
          </Link>
        }
      />

      <ModuleSubnav items={customerModuleNav} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
        <aside className="border-t-2 border-brass/50 pt-6">
          <p className="font-display text-lg text-warm">New account</p>
          <p className="mt-1 text-sm text-warm-muted">Minimal fields — you can invoice immediately.</p>
          <div className="mt-6 space-y-3">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Name</span>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Email</span>
              <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button type="button" className="btn-primary mt-2 w-full" onClick={() => void submit()}>
              Save
            </button>
          </div>
        </aside>

        <div>
          <label className="mb-5 block max-w-md space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-muted">Search</span>
            <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" />
          </label>

          {loading ? (
            <ListSkeleton rows={5} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={q.trim() ? "No matches" : "No customers yet"}
              hint={q.trim() ? "Try a different search term." : "Add an account with the form to the left."}
              action={!q.trim() ? <span className="text-sm text-warm-muted">Start with the sidebar form.</span> : undefined}
            />
          ) : (
            <div className="table-shell divide-rows">
              <div className="table-head hidden grid-cols-[1.4fr_1fr_0.8fr] gap-4 px-4 md:grid">
                <span>Customer</span>
                <span>Email</span>
                <span className="text-right">Outstanding</span>
              </div>
              <div>
                {rows.map((c) => (
                  <Link
                    key={c.id}
                    href={`/customers/${c.id}`}
                    className="grid grid-cols-1 gap-2 px-4 py-4 transition hover:bg-brass/[0.04] md:grid-cols-[1.4fr_1fr_0.8fr] md:items-center md:gap-4"
                  >
                    <p className="text-sm font-medium text-warm">{c.name}</p>
                    <p className="text-sm text-warm-muted">{c.email ?? "—"}</p>
                    <p className="text-right text-sm font-semibold tabular-nums text-warm">{money(Number(c.outstanding))}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
