import type { PostStatus } from "@/lib/types";

const statusStyles: Record<PostStatus, string> = {
  draft: "border-rule-strong text-ink-muted",
  scheduled: "border-accent/50 bg-accent-light text-accent-dark",
  published: "border-primary/40 bg-primary-light text-primary-dark",
};

const statusDot: Record<PostStatus, string> = {
  draft: "bg-ink-muted/60",
  scheduled: "bg-accent",
  published: "bg-primary",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] ${statusStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {status}
    </span>
  );
}

export function ErrorBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[4px] border border-red-300 bg-red-50 px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-red-700">
      {children}
    </span>
  );
}

export function AiGeneratedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] border border-accent/40 bg-accent-light px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-accent-dark">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
        <path d="M10 2l1.6 4.7L16.5 8l-4.9 1.3L10 14l-1.6-4.7L3.5 8l4.9-1.3L10 2z" />
      </svg>
      AI generated
    </span>
  );
}
