import { ReactNode } from "react";
import type { Crumb } from "./breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";

export function PageHeader({
  title,
  description,
  meta,
  breadcrumbs,
  actions,
  variant = "default"
}: {
  title: string;
  description?: string;
  meta?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  /** default: standard page; wide: more editorial spacing */
  variant?: "default" | "wide";
}) {
  return (
    <header className={`mb-10 border-b border-warm/[0.06] pb-8 ${variant === "wide" ? "max-w-4xl" : ""}`}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-[1.75rem] font-normal leading-[1.15] tracking-tight text-warm sm:text-[2rem] lg:text-[2.125rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-warm-muted">{description}</p>
          )}
          {meta && (
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-muted">{meta}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 sm:justify-end sm:pb-0.5">{actions}</div>}
      </div>
    </header>
  );
}
