import type { Platform } from "@/lib/types";

const labels: Record<Platform, string> = {
  LinkedIn: "in",
  X: "X",
  Instagram: "Ig",
};

const sizes = {
  sm: "h-6 w-6 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function PlatformIcon({
  platform,
  size = "md",
}: {
  platform: Platform;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-white font-mono font-semibold text-ink ${sizes[size]}`}
    >
      {labels[platform]}
    </span>
  );
}

export function PlatformChip({
  platform,
  selected,
  onClick,
}: {
  platform: Platform;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? "border-primary bg-primary-light text-primary-dark"
          : "border-border bg-white text-ink-muted hover:border-primary/40"
      }`}
    >
      <PlatformIcon platform={platform} size="sm" />
      {platform}
      {selected && (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
