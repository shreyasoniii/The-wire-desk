export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// The AI endpoint returns one blob of text containing 3 posts (either
// "Post 1: ... --- Post 2: ..." from the fallback generator, or a similar
// loose format from the model). Split it back into individual variants
// for the "choose a variant" step.
export function splitVariants(raw: string): string[] {
  const bySeparator = raw
    .split(/\n?-{3,}\n?/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const source = bySeparator.length > 1 ? bySeparator : [raw.trim()];

  return source
    .map((chunk) => chunk.replace(/^Post\s*\d+\s*:\s*/i, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}
