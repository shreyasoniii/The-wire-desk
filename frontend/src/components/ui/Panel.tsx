export function Panel({
  kicker,
  title,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  kicker?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[10px] border border-rule bg-card shadow-print ${className}`}
    >
      {(title || kicker) && (
        <header className="flex items-end justify-between gap-3 border-b border-rule px-5 pb-3 pt-4">
          <div>
            {kicker && (
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent-dark">
                {kicker}
              </p>
            )}
            {title && <h3 className="mt-0.5 font-serif text-lg leading-tight text-ink">{title}</h3>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Alert({
  tone = "error",
  title,
  children,
  className = "",
}: {
  tone?: "error" | "success" | "warning";
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const styles = {
    error: "border-red-300 bg-red-50 text-red-800 [--bar:#dc2626]",
    success: "border-primary/30 bg-primary-light text-primary-dark [--bar:var(--color-primary)]",
    warning: "border-accent/40 bg-accent-light text-accent-dark [--bar:var(--color-accent)]",
  }[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`animate-rise relative overflow-hidden rounded-[8px] border py-2.5 pl-4 pr-4 text-sm ${styles} ${className}`}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-[var(--bar)]" aria-hidden />
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <svg viewBox="0 0 64 48" className="h-12 w-16 text-rule-strong" aria-hidden>
        <path d="M4 44 60 4 38 44 30 28z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M30 28 60 4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <p className="mt-3 font-serif text-lg text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton h-6 w-6" />
          <div className="skeleton h-3.5 flex-1" style={{ maxWidth: `${80 - i * 9}%` }} />
          <div className="skeleton h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}
