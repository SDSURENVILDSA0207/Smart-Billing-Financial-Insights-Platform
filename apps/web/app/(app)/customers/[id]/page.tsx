"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InPageNav } from "../../../../components/in-page-nav";
import { customerModuleNav } from "../../../../components/module-nav";
import { ModuleSubnav } from "../../../../components/module-subnav";
import { PageHeader } from "../../../../components/page-header";
import { RelatedLink, RelatedPanel } from "../../../../components/related-panel";
import { Spinner } from "../../../../components/spinner";
import { StatusBadge } from "../../../../components/status-badge";
import { WorkspaceSection } from "../../../../components/workspace-section";
import { api } from "../../../../lib/api";
import { money, shortDate } from "../../../../lib/format";
import type { CustomerRow, InvoiceRow } from "../../../../lib/types";

type CustomerDetail = CustomerRow & { invoices: InvoiceRow[] };

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void api<CustomerDetail>(`/customers/${id}`)
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, [id]);

  if (error) {
    return (
      <div>
        <PageHeader title="Customer" description=" " breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "Profile" }]} />
        <p className="rounded-sm border border-rose-500/25 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">{error}</p>
        <button type="button" className="btn-secondary mt-4" onClick={() => router.push("/customers")}>
          Back
        </button>
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
        title={data.name}
        description={data.email ?? "No email on file"}
        meta={`${data.invoices.length} invoices · ${money(Number(data.outstanding))} outstanding`}
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: data.name }]}
        actions={
          <>
            <Link href="/customers" className="btn-secondary">
              Directory
            </Link>
            <Link href="/invoices/new" className="btn-primary">
              New invoice
            </Link>
          </>
        }
      />

      <ModuleSubnav items={customerModuleNav} />

      <InPageNav
        items={[
          { href: "#customer-balance", label: "Balance" },
          { href: "#customer-history", label: "Invoices" }
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <article id="customer-balance" className="scroll-mt-28 border-l-[3px] border-brass/60 pl-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-muted">Outstanding</p>
          <p className="mt-2 font-display text-4xl font-light tabular-nums tracking-tight text-warm">{money(Number(data.outstanding))}</p>
          <p className="mt-4 text-sm leading-relaxed text-warm-muted">Sum of open balances on invoices for this account.</p>
        </article>

        <WorkspaceSection id="customer-history" kicker="File" title="Invoices" description="Newest activity first.">
          <div className="table-shell divide-rows">
            <div className="table-head hidden grid-cols-[1.1fr_0.7fr_0.9fr] gap-4 px-4 md:grid">
              <span>Invoice</span>
              <span>Status</span>
              <span className="text-right">Total</span>
            </div>
            <div>
              {data.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="grid grid-cols-1 gap-2 px-4 py-4 transition hover:bg-brass/[0.04] md:grid-cols-[1.1fr_0.7fr_0.9fr] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-warm">{inv.invoiceNumber}</p>
                    <p className="text-xs text-warm-muted md:hidden">{shortDate(inv.dueDate)}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                  <p className="text-right text-sm font-semibold tabular-nums text-warm">{money(Number(inv.totalAmount))}</p>
                </Link>
              ))}
            </div>
          </div>
        </WorkspaceSection>
      </div>

      <div className="mt-10 max-w-md">
        <RelatedPanel title="Also see">
          <RelatedLink href="/payments" label="Payments" hint="Portfolio posture" />
          <RelatedLink href="/insights" label="Insights" hint="Concentration" />
        </RelatedPanel>
      </div>
    </div>
  );
}
