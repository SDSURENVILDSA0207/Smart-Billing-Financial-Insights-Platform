export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-shell divide-rows" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse px-4 py-4">
          <div className="h-3.5 max-w-[38%] rounded-sm bg-warm/[0.06]" />
          <div className="mt-2.5 h-2.5 max-w-[22%] rounded-sm bg-warm/[0.04]" />
        </div>
      ))}
    </div>
  );
}
