export function CreditMeter({
  credits,
  allowance,
}: {
  credits: number;
  allowance: number;
}) {
  const pct = allowance > 0 ? Math.min(100, (credits / allowance) * 100) : 0;
  const low = pct <= 25;
  const segments = 10;
  const filled = Math.round((pct / 100) * segments);

  return (
    <div
      className="hidden items-center gap-2.5 rounded-[6px] border border-rule-strong/70 bg-card px-2.5 py-1.5 lg:flex"
      title={`${credits} of ${allowance} AI credits left this cycle`}
    >
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        Credits
      </span>
      <span className="flex gap-[2px]" aria-hidden>
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={`h-3 w-[5px] rounded-[1px] transition-colors ${
              i < filled ? (low ? "bg-accent" : "bg-primary") : "bg-paper-deep"
            }`}
          />
        ))}
      </span>
      <span className="font-mono text-xs font-semibold tabular-nums text-ink">
        {credits}
        <span className="text-ink-muted">/{allowance}</span>
      </span>
    </div>
  );
}
