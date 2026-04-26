import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-warm-muted">
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && (
            <span className="text-brass/40" aria-hidden>
              /
            </span>
          )}
          {c.href && i < items.length - 1 ? (
            <Link href={c.href} className="transition hover:text-warm">
              {c.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "font-medium text-warm/90" : ""}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
