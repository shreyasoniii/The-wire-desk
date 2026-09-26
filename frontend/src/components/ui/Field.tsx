import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";

export const fieldBase =
  "w-full rounded-[6px] border bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 transition-[border-color,box-shadow,background-color] focus:bg-white focus:outline-none focus:ring-4";

export function fieldBorder(error?: boolean) {
  return error
    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
    : "border-rule-strong/70 hover:border-rule-strong focus:border-ink focus:ring-ink/5";
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => (
    <div>
      <input
        ref={ref}
        className={`${fieldBase} ${fieldBorder(!!error)} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => (
    <div>
      <textarea
        ref={ref}
        className={`${fieldBase} ${fieldBorder(!!error)} resize-none leading-relaxed ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`${fieldBase} ${fieldBorder(false)} appearance-none pr-9 ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
        aria-hidden
      >
        <path d="M5.5 7.5l4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
);
Select.displayName = "Select";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
      {children}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        checked ? "border-primary bg-primary" : "border-rule-strong bg-paper-deep"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px] bg-white" : "translate-x-[3px] bg-ink/70"
        }`}
      />
    </button>
  );
}
