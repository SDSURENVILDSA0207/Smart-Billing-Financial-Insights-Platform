export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "border-emerald-600/35 bg-emerald-950/40 text-emerald-100/95",
    UNPAID: "border-amber-700/35 bg-amber-950/35 text-amber-50/95",
    PARTIAL: "border-sky-700/30 bg-sky-950/30 text-sky-100/90",
    LOW: "border-warm/[0.12] bg-ink-4/80 text-warm-muted",
    MEDIUM: "border-amber-700/35 bg-amber-950/35 text-amber-50/95",
    HIGH: "border-rose-700/35 bg-rose-950/40 text-rose-50/95"
  };
  const cls = map[status] ?? "border-warm/[0.1] bg-ink-3 text-warm-muted";
  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${cls}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
