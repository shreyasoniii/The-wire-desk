import Link from "next/link";

export function LogoMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 8.5C8.5 4 15.5 4 20 8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7 12C9.8 9 14.2 9 17 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="2" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2 ${tone === "paper" ? "text-paper" : "text-ink"}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-[7px] transition-transform group-hover:-rotate-6 ${
          tone === "paper" ? "bg-paper text-ink" : "bg-ink text-paper"
        }`}
      >
        <LogoMark className="h-[18px] w-[18px]" />
      </span>
      <span className="font-serif text-[19px] font-semibold leading-none">
        The Wire <span className="font-serif-italic font-normal">Desk</span>
      </span>
    </Link>
  );
}
