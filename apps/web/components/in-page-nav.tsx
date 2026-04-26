export function InPageNav({
  items
}: {
  items: Array<{ href: string; label: string }>;
}) {
  return (
    <nav className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]" aria-label="On this page">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-warm-muted">Jump</span>
      {items.map((item) => (
        <a key={item.href} href={item.href} className="text-warm-muted underline decoration-warm/[0.12] underline-offset-4 transition hover:text-warm hover:decoration-brass/40">
          {item.label}
        </a>
      ))}
    </nav>
  );
}
