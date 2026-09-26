import type { Platform } from "@/lib/types";

const sizes = {
  sm: "h-6 w-6 [&>svg]:h-3 [&>svg]:w-3",
  md: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
  lg: "h-11 w-11 [&>svg]:h-5 [&>svg]:w-5",
};

const tones: Record<Platform, string> = {
  LinkedIn: "bg-[#0a66c2] text-white",
  X: "bg-ink text-white",
  Instagram: "bg-[radial-gradient(circle_at_30%_110%,#ffd776_0%,#f7743a_35%,#d62976_60%,#7c3aed_100%)] text-white",
};

// Character budgets used by live fit meters across the app
export const PLATFORM_LIMITS: Record<Platform, number> = {
  LinkedIn: 3000,
  X: 280,
  Instagram: 2200,
};

export function PlatformGlyph({ platform, className }: { platform: Platform; className?: string }) {
  if (platform === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.35h-4v-4.74c0-1.13-.02-2.59-1.58-2.59-1.58 0-1.82 1.23-1.82 2.5v4.83h-4z" />
      </svg>
    );
  }
  if (platform === "X") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77zm-1.08 16.2h1.7L7.4 4.73H5.58z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  size = "md",
}: {
  platform: Platform;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      title={platform}
      className={`inline-flex shrink-0 items-center justify-center rounded-[6px] ${tones[platform]} ${sizes[size]}`}
    >
      <PlatformGlyph platform={platform} />
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
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 rounded-[6px] border py-1 pl-1 pr-3 text-sm font-medium transition-all ${
        selected
          ? "border-ink bg-ink text-paper shadow-[3px_3px_0_var(--color-accent)]"
          : "border-rule-strong bg-card text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      <PlatformIcon platform={platform} size="sm" />
      {platform}
      <span
        className={`ml-0.5 flex h-4 w-4 items-center justify-center rounded-[3px] border text-[10px] ${
          selected ? "border-paper/40 bg-accent text-white" : "border-rule-strong"
        }`}
        aria-hidden
      >
        {selected && "✓"}
      </span>
    </button>
  );
}
