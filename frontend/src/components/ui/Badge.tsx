import type { PostStatus } from "@/lib/types";

const statusStyles: Record<PostStatus, string> = {
  draft: "bg-surface-muted text-ink-muted",
  scheduled: "bg-accent-light text-accent-dark",
  published: "bg-primary-light text-primary-dark",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function ErrorBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
      {children}
    </span>
  );
}

export function AiGeneratedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-1 text-xs font-medium text-accent-dark">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M10 2l1.6 4.7L16.5 8l-4.9 1.3L10 14l-1.6-4.7L3.5 8l4.9-1.3L10 2z" />
      </svg>
      AI generated
    </span>
  );
}
