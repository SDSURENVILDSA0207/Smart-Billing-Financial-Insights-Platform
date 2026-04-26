import Link from "next/link";
import { ReactNode } from "react";

export function RelatedPanel({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="panel p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-muted">{title}</p>
      <div className="mt-4 space-y-0 divide-y divide-warm/[0.06] text-sm">{children}</div>
    </aside>
  );
}

export function RelatedLink({ href, label, hint }: { href: string; label: string; hint?: string }) {
  return (
    <Link href={href} className="block py-3 first:pt-0 transition hover:text-brass-bright">
      <span className="font-medium text-warm">{label}</span>
      {hint && <span className="mt-1 block text-xs text-warm-muted">{hint}</span>}
    </Link>
  );
}
