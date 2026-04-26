export function Spinner({ label }: { label?: string }) {
  return (
    <div
      className="h-9 w-9 animate-spin rounded-full border-2 border-warm/10 border-t-brass"
      aria-label={label ?? "Loading"}
      role="status"
    />
  );
}
