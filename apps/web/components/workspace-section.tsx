import { ReactNode } from "react";

export function WorkspaceSection({
  id,
  kicker,
  title,
  description,
  children,
  className = "",
  density = "default"
}: {
  id?: string;
  kicker?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** comfortable: more air for narrative pages */
  density?: "default" | "comfortable";
}) {
  return (
    <section id={id} className={`scroll-mt-28 ${density === "comfortable" ? "mt-14" : "mt-10"} ${className}`}>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          {kicker && (
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-7 bg-brass/50" aria-hidden />
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-brass-muted">{kicker}</p>
            </div>
          )}
          <h2 className="font-display text-[1.35rem] font-normal tracking-tight text-warm sm:text-[1.5rem]">{title}</h2>
          {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-warm-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
