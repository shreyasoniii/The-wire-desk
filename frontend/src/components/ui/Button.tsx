import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "accent" | "outline" | "danger" | "ghost";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2 text-sm font-semibold tracking-[-0.005em] transition-[background-color,color,border-color,transform,box-shadow] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper shadow-[inset_0_-2px_0_rgba(0,0,0,0.35)] hover:bg-primary",
  accent:
    "bg-accent text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] hover:bg-accent-dark",
  outline: "border border-rule-strong bg-card text-ink hover:border-ink hover:bg-white",
  danger: "border border-rule-strong bg-card text-red-700 hover:border-red-600 hover:bg-red-50",
  ghost: "text-ink-muted hover:bg-paper-deep hover:text-ink",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`animate-spin ${className}`} aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
