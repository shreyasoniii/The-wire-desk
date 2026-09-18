export function CreditMeter({
  credits,
  allowance,
}: {
  credits: number;
  allowance: number;
}) {
  const pct = allowance > 0 ? Math.min(100, (credits / allowance) * 100) : 0;

  return (
    <div className="flex items-center gap-2 rounded-full bg-accent-light px-3 py-1.5 text-accent-dark">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
        <path d="M10 2l1.6 4.7L16.5 8l-4.9 1.3L10 14l-1.6-4.7L3.5 8l4.9-1.3L10 2z" />
      </svg>
      <span className="text-sm font-semibold whitespace-nowrap">
        {credits}/{allowance} credits
      </span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-white/70">
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
