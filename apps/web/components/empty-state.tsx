import { ReactNode } from "react";

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-warm/[0.12] bg-ink-2/50 px-6 py-14 text-center">
      <p className="font-display text-lg font-normal text-warm">{title}</p>
      {hint && <p className="mt-2 text-sm text-warm-muted">{hint}</p>}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}
